from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, func
from database import get_db, engine
from models import User, Test, Assignment, Grade, Announcement, TestSubmission
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

JWT_SECRET = os.environ.get('JWT_SECRET')
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = 'student'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    full_name: str
    role: str
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    user: UserResponse

class TestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    questions: List[dict]
    duration_minutes: int = 60
    total_marks: int

class TestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: Optional[str]
    questions: List[dict]
    duration_minutes: int
    total_marks: int
    is_active: bool
    created_at: datetime

class TestListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: Optional[str]
    duration_minutes: int
    total_marks: int
    is_active: bool
    created_at: datetime

class TestSubmissionCreate(BaseModel):
    test_id: str
    answers: List[dict]
    tab_switch_count: int = 0

class TestSubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    test_id: str
    user_id: str
    score: int
    tab_switch_count: int
    is_flagged: bool
    submitted_at: datetime

class AssignmentCreate(BaseModel):
    title: str
    description: str
    due_date: Optional[datetime] = None
    total_marks: int

class AssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: str
    due_date: Optional[datetime]
    total_marks: int
    is_active: bool
    created_at: datetime

class GradeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    score: int
    total_marks: int
    graded_at: datetime

class AnnouncementCreate(BaseModel):
    title: str
    content: str

class AnnouncementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    content: str
    created_at: datetime

class ViolationResponse(BaseModel):
    submission_id: str
    user_email: str
    user_name: str
    test_title: str
    tab_switch_count: int
    score: int
    submitted_at: datetime

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, email: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_db)) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user

# Auth Routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    # Create user
    hashed_pw = hash_password(data.password)
    user = User(
        email=data.email,
        password_hash=hashed_pw,
        full_name=data.full_name,
        role=data.role
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Create token
    token = create_jwt_token(user.id, user.email, user.role)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    token = create_jwt_token(user.id, user.email, user.role)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)

# Student Routes - Tests
@api_router.get("/tests", response_model=List[TestListResponse])
async def get_tests(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Test).where(Test.is_active == True).order_by(desc(Test.created_at))
    )
    tests = result.scalars().all()
    return [TestListResponse.model_validate(test) for test in tests]

@api_router.get("/tests/{test_id}", response_model=TestResponse)
async def get_test(test_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Test).where(Test.id == test_id))
    test = result.scalar_one_or_none()
    
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")
    
    return TestResponse.model_validate(test)

@api_router.post("/tests/submit", response_model=TestSubmissionResponse)
async def submit_test(data: TestSubmissionCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Get test
    result = await db.execute(select(Test).where(Test.id == data.test_id))
    test = result.scalar_one_or_none()
    
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")
    
    # Calculate score
    score = 0
    for i, answer in enumerate(data.answers):
        if i < len(test.questions):
            question = test.questions[i]
            if answer.get('selected_option') == question.get('correct_option'):
                score += question.get('marks', 1)
    
    # Create submission
    submission = TestSubmission(
        test_id=data.test_id,
        user_id=user.id,
        answers=data.answers,
        score=score,
        tab_switch_count=data.tab_switch_count,
        is_flagged=data.tab_switch_count > 5
    )
    
    db.add(submission)
    
    # Create grade entry
    grade = Grade(
        user_id=user.id,
        test_id=test.id,
        title=test.title,
        score=score,
        total_marks=test.total_marks
    )
    
    db.add(grade)
    await db.commit()
    await db.refresh(submission)
    
    return TestSubmissionResponse.model_validate(submission)

# Student Routes - Assignments
@api_router.get("/assignments", response_model=List[AssignmentResponse])
async def get_assignments(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Assignment).where(Assignment.is_active == True).order_by(desc(Assignment.created_at))
    )
    assignments = result.scalars().all()
    return [AssignmentResponse.model_validate(a) for a in assignments]

# Student Routes - Grades
@api_router.get("/grades", response_model=List[GradeResponse])
async def get_grades(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Grade).where(Grade.user_id == user.id).order_by(desc(Grade.graded_at))
    )
    grades = result.scalars().all()
    return [GradeResponse.model_validate(g) for g in grades]

# Student Routes - Announcements
@api_router.get("/announcements", response_model=List[AnnouncementResponse])
async def get_announcements(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Announcement).where(Announcement.is_active == True).order_by(desc(Announcement.created_at))
    )
    announcements = result.scalars().all()
    return [AnnouncementResponse.model_validate(a) for a in announcements]

# Admin Routes - Tests
@api_router.post("/admin/tests", response_model=TestResponse)
async def create_test(data: TestCreate, user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    test = Test(
        title=data.title,
        description=data.description,
        questions=data.questions,
        duration_minutes=data.duration_minutes,
        total_marks=data.total_marks,
        created_by=user.id
    )
    
    db.add(test)
    await db.commit()
    await db.refresh(test)
    
    return TestResponse.model_validate(test)

@api_router.get("/admin/tests", response_model=List[TestResponse])
async def get_all_tests(user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Test).order_by(desc(Test.created_at)))
    tests = result.scalars().all()
    return [TestResponse.model_validate(test) for test in tests]

# Admin Routes - Assignments
@api_router.post("/admin/assignments", response_model=AssignmentResponse)
async def create_assignment(data: AssignmentCreate, user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    assignment = Assignment(
        title=data.title,
        description=data.description,
        due_date=data.due_date,
        total_marks=data.total_marks,
        created_by=user.id
    )
    
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    
    return AssignmentResponse.model_validate(assignment)

@api_router.get("/admin/assignments", response_model=List[AssignmentResponse])
async def get_all_assignments(user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assignment).order_by(desc(Assignment.created_at)))
    assignments = result.scalars().all()
    return [AssignmentResponse.model_validate(a) for a in assignments]

# Admin Routes - Announcements
@api_router.post("/admin/announcements", response_model=AnnouncementResponse)
async def create_announcement(data: AnnouncementCreate, user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    announcement = Announcement(
        title=data.title,
        content=data.content,
        created_by=user.id
    )
    
    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)
    
    return AnnouncementResponse.model_validate(announcement)

# Admin Routes - Violations
@api_router.get("/admin/violations", response_model=List[ViolationResponse])
async def get_violations(user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TestSubmission, User, Test)
        .join(User, TestSubmission.user_id == User.id)
        .join(Test, TestSubmission.test_id == Test.id)
        .where(TestSubmission.is_flagged == True)
        .order_by(desc(TestSubmission.submitted_at))
    )
    
    violations = []
    for submission, user_obj, test in result.all():
        violations.append(ViolationResponse(
            submission_id=submission.id,
            user_email=user_obj.email,
            user_name=user_obj.full_name,
            test_title=test.title,
            tab_switch_count=submission.tab_switch_count,
            score=submission.score,
            submitted_at=submission.submitted_at
        ))
    
    return violations

# Admin Routes - Stats
@api_router.get("/admin/stats")
async def get_admin_stats(user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    # Count students
    students_result = await db.execute(select(func.count(User.id)).where(User.role == 'student'))
    total_students = students_result.scalar()
    
    # Count tests
    tests_result = await db.execute(select(func.count(Test.id)))
    total_tests = tests_result.scalar()
    
    # Count assignments
    assignments_result = await db.execute(select(func.count(Assignment.id)))
    total_assignments = assignments_result.scalar()
    
    # Count violations
    violations_result = await db.execute(select(func.count(TestSubmission.id)).where(TestSubmission.is_flagged == True))
    total_violations = violations_result.scalar()
    
    return {
        'total_students': total_students,
        'total_tests': total_tests,
        'total_assignments': total_assignments,
        'total_violations': total_violations
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
