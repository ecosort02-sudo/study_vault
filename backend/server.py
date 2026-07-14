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
from database import get_db
from models import User, Test, Assignment, Grade, Announcement, TestSubmission, AssignmentSubmission
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

JWT_SECRET = os.environ.get('JWT_SECRET')
security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ---------------- Pydantic Models ----------------
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

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class TestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    questions: List[dict]
    duration_minutes: int = 60
    total_marks: int
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None

class TestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: Optional[str]
    questions: List[dict]
    duration_minutes: int
    total_marks: int
    is_active: bool
    starts_at: Optional[datetime]
    ends_at: Optional[datetime]
    results_published: bool
    created_at: datetime

class TestListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: Optional[str]
    duration_minutes: int
    total_marks: int
    is_active: bool
    starts_at: Optional[datetime]
    ends_at: Optional[datetime]
    results_published: bool
    created_at: datetime
    already_attempted: bool = False
    my_score: Optional[int] = None

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
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None

class AssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: str
    due_date: Optional[datetime]
    total_marks: int
    is_active: bool
    starts_at: Optional[datetime]
    ends_at: Optional[datetime]
    created_at: datetime
    already_submitted: bool = False

class AssignmentSubmissionCreate(BaseModel):
    assignment_id: str
    content: str

class GradeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    score: int
    total_marks: int
    graded_at: datetime
    percentile: Optional[float] = None

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

class UserListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

class TestReviewQuestion(BaseModel):
    question: str
    options: List[str]
    correct_option: int
    selected_option: Optional[int] = None
    is_correct: bool
    marks: int

class TestReviewResponse(BaseModel):
    test_id: str
    test_title: str
    score: int
    total_marks: int
    submitted_at: datetime
    results_published: bool
    questions: List[TestReviewQuestion]

# ---------------- Helpers ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, email: str, role: str) -> str:
    payload = {
        'user_id': user_id, 'email': email, 'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=['HS256'])
        result = await db.execute(select(User).where(User.id == payload.get('user_id')))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def is_test_available(test: Test) -> bool:
    now = datetime.now(timezone.utc)
    if not test.is_active:
        return False
    if test.starts_at and now < test.starts_at:
        return False
    if test.ends_at and now > test.ends_at:
        return False
    return True

def is_assignment_available(assignment: Assignment) -> bool:
    now = datetime.now(timezone.utc)
    if not assignment.is_active:
        return False
    if assignment.starts_at and now < assignment.starts_at:
        return False
    if assignment.ends_at and now > assignment.ends_at:
        return False
    return True

# ---------------- Auth Routes ----------------
@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated. Contact your administrator.")
    
    token = create_jwt_token(user.id, user.email, user.role)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)

# ---------------- Student Routes - Tests ----------------
@api_router.get("/tests", response_model=List[TestListResponse])
async def get_tests(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    # Only show tests that are currently within their availability window
    result = await db.execute(
        select(Test).where(
            Test.is_active == True,
            or_(Test.starts_at == None, Test.starts_at <= now),
            or_(Test.ends_at == None, Test.ends_at >= now),
        ).order_by(desc(Test.created_at))
    )
    tests = result.scalars().all()
    
    # Fetch which of these tests the user has already submitted and their scores
    if not tests:
        return []
    test_ids = [t.id for t in tests]
    subs_result = await db.execute(
        select(TestSubmission.test_id, TestSubmission.score).where(
            TestSubmission.user_id == user.id,
            TestSubmission.test_id.in_(test_ids)
        )
    )
    attempted_map = {row[0]: row[1] for row in subs_result.all()}
    
    response = []
    for test in tests:
        item = TestListResponse.model_validate(test)
        item.already_attempted = test.id in attempted_map
        # Only reveal score if results are published
        if item.already_attempted and test.results_published:
            item.my_score = attempted_map[test.id]
        response.append(item)
    return response


@api_router.get("/tests/{test_id}/review", response_model=TestReviewResponse)
async def review_test(test_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Return student's submission with correct answers highlighted (only after results published)."""
    result = await db.execute(select(Test).where(Test.id == test_id))
    test = result.scalar_one_or_none()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    if not test.results_published:
        raise HTTPException(status_code=403, detail="Results are not yet published")
    
    sub_result = await db.execute(
        select(TestSubmission).where(
            TestSubmission.test_id == test_id,
            TestSubmission.user_id == user.id
        )
    )
    submission = sub_result.scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=404, detail="You have not attempted this test")
    
    review_questions = []
    for i, q in enumerate(test.questions):
        selected = submission.answers[i].get('selected_option') if i < len(submission.answers) else None
        is_correct = selected == q.get('correct_option')
        review_questions.append(TestReviewQuestion(
            question=q['question'],
            options=q['options'],
            correct_option=q['correct_option'],
            selected_option=selected,
            is_correct=is_correct,
            marks=q.get('marks', 1),
        ))
    
    return TestReviewResponse(
        test_id=test.id,
        test_title=test.title,
        score=submission.score,
        total_marks=test.total_marks,
        submitted_at=submission.submitted_at,
        results_published=test.results_published,
        questions=review_questions,
    )

@api_router.get("/tests/{test_id}", response_model=TestResponse)
async def get_test(test_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Test).where(Test.id == test_id))
    test = result.scalar_one_or_none()
    
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    if not is_test_available(test):
        raise HTTPException(status_code=403, detail="Test is not currently available")
    
    # Check if already attempted
    sub_result = await db.execute(
        select(TestSubmission).where(
            TestSubmission.test_id == test_id,
            TestSubmission.user_id == user.id
        )
    )
    if sub_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="You have already attempted this test")
    
    return TestResponse.model_validate(test)

@api_router.post("/tests/submit", response_model=TestSubmissionResponse)
async def submit_test(data: TestSubmissionCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Test).where(Test.id == data.test_id))
    test = result.scalar_one_or_none()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Check duplicate submission
    sub_result = await db.execute(
        select(TestSubmission).where(
            TestSubmission.test_id == data.test_id,
            TestSubmission.user_id == user.id
        )
    )
    if sub_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="You have already attempted this test")
    
    # Calculate score
    score = 0
    for i, answer in enumerate(data.answers):
        if i < len(test.questions):
            question = test.questions[i]
            if answer.get('selected_option') == question.get('correct_option'):
                score += question.get('marks', 1)
    
    submission = TestSubmission(
        test_id=data.test_id, user_id=user.id, answers=data.answers,
        score=score, tab_switch_count=data.tab_switch_count,
        is_flagged=data.tab_switch_count > 5
    )
    db.add(submission)
    
    # Create grade entry (unpublished by default)
    grade = Grade(
        user_id=user.id, test_id=test.id, title=test.title,
        score=score, total_marks=test.total_marks,
        is_published=test.results_published
    )
    db.add(grade)
    
    await db.commit()
    await db.refresh(submission)
    return TestSubmissionResponse.model_validate(submission)

# ---------------- Student Routes - Assignments ----------------
@api_router.get("/assignments", response_model=List[AssignmentResponse])
async def get_assignments(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Assignment).where(
            Assignment.is_active == True,
            or_(Assignment.starts_at == None, Assignment.starts_at <= now),
            or_(Assignment.ends_at == None, Assignment.ends_at >= now),
        ).order_by(desc(Assignment.created_at))
    )
    assignments = result.scalars().all()
    
    if not assignments:
        return []
    
    assignment_ids = [a.id for a in assignments]
    subs_result = await db.execute(
        select(AssignmentSubmission.assignment_id).where(
            AssignmentSubmission.user_id == user.id,
            AssignmentSubmission.assignment_id.in_(assignment_ids)
        )
    )
    submitted_ids = {row[0] for row in subs_result.all()}
    
    response = []
    for a in assignments:
        item = AssignmentResponse.model_validate(a)
        item.already_submitted = a.id in submitted_ids
        response.append(item)
    return response

@api_router.post("/assignments/submit")
async def submit_assignment(data: AssignmentSubmissionCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assignment).where(Assignment.id == data.assignment_id))
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    if not is_assignment_available(assignment):
        raise HTTPException(status_code=403, detail="Assignment is not currently available")
    
    # Check duplicate
    sub_result = await db.execute(
        select(AssignmentSubmission).where(
            AssignmentSubmission.assignment_id == data.assignment_id,
            AssignmentSubmission.user_id == user.id
        )
    )
    if sub_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="You have already submitted this assignment")
    
    submission = AssignmentSubmission(
        assignment_id=data.assignment_id, user_id=user.id, content=data.content
    )
    db.add(submission)
    await db.commit()
    return {"success": True, "message": "Assignment submitted successfully"}

# ---------------- Student Routes - Grades ----------------
@api_router.get("/grades", response_model=List[GradeResponse])
async def get_grades(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Only published grades
    result = await db.execute(
        select(Grade).where(
            Grade.user_id == user.id,
            Grade.is_published == True
        ).order_by(desc(Grade.graded_at))
    )
    grades = result.scalars().all()
    
    response = []
    for grade in grades:
        item = GradeResponse.model_validate(grade)
        # Calculate percentile for test grades
        if grade.test_id:
            # Get all scores for this test
            all_scores_result = await db.execute(
                select(TestSubmission.score).where(TestSubmission.test_id == grade.test_id)
            )
            all_scores = [row[0] for row in all_scores_result.all()]
            if len(all_scores) > 1:
                below_count = sum(1 for s in all_scores if s < grade.score)
                item.percentile = round((below_count / len(all_scores)) * 100, 1)
            else:
                item.percentile = 100.0
        response.append(item)
    return response

# ---------------- Student Routes - Announcements ----------------
@api_router.get("/announcements", response_model=List[AnnouncementResponse])
async def get_announcements(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Announcement).where(Announcement.is_active == True).order_by(desc(Announcement.created_at))
    )
    return [AnnouncementResponse.model_validate(a) for a in result.scalars().all()]

# ---------------- Admin Routes - User Management ----------------
@api_router.post("/admin/users", response_model=UserResponse)
async def create_user(data: UserRegister, admin_user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    if data.role not in ['student', 'admin']:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        email=data.email, password_hash=hash_password(data.password),
        full_name=data.full_name, role=data.role
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return UserResponse.model_validate(new_user)

@api_router.get("/admin/users", response_model=List[UserListResponse])
async def list_users(admin_user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(desc(User.created_at)))
    return [UserListResponse.model_validate(u) for u in result.scalars().all()]

@api_router.patch("/admin/users/{user_id}", response_model=UserListResponse)
async def update_user(user_id: str, data: UserUpdate, admin_user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    
    if data.full_name is not None:
        target.full_name = data.full_name
    if data.email is not None:
        # Check email uniqueness
        existing_result = await db.execute(select(User).where(User.email == data.email, User.id != user_id))
        if existing_result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already in use")
        target.email = data.email
    if data.role is not None:
        if data.role not in ['student', 'admin']:
            raise HTTPException(status_code=400, detail="Invalid role")
        target.role = data.role
    if data.password:
        target.password_hash = hash_password(data.password)
    if data.is_active is not None:
        # Prevent admin from deactivating themselves
        if target.id == admin_user.id and data.is_active == False:
            raise HTTPException(status_code=400, detail="You cannot deactivate your own account")
        target.is_active = data.is_active
    
    await db.commit()
    await db.refresh(target)
    return UserListResponse.model_validate(target)

# ---------------- Admin Routes - Tests ----------------
@api_router.post("/admin/tests", response_model=TestResponse)
async def create_test(data: TestCreate, user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    test = Test(
        title=data.title, description=data.description, questions=data.questions,
        duration_minutes=data.duration_minutes, total_marks=data.total_marks,
        starts_at=data.starts_at, ends_at=data.ends_at, created_by=user.id
    )
    db.add(test)
    await db.commit()
    await db.refresh(test)
    return TestResponse.model_validate(test)

@api_router.get("/admin/tests", response_model=List[TestResponse])
async def get_all_tests(user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Test).order_by(desc(Test.created_at)))
    return [TestResponse.model_validate(t) for t in result.scalars().all()]

@api_router.post("/admin/tests/{test_id}/publish")
async def publish_test_results(test_id: str, user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Test).where(Test.id == test_id))
    test = result.scalar_one_or_none()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    test.results_published = True
    
    # Publish all grades for this test
    grades_result = await db.execute(select(Grade).where(Grade.test_id == test_id))
    for grade in grades_result.scalars().all():
        grade.is_published = True
    
    await db.commit()
    return {"success": True, "message": "Results published"}

@api_router.post("/admin/tests/publish-all")
async def publish_all_test_results(user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    tests_result = await db.execute(select(Test).where(Test.results_published == False))
    tests = tests_result.scalars().all()
    count = 0
    for t in tests:
        t.results_published = True
        count += 1
    
    grades_result = await db.execute(select(Grade).where(Grade.is_published == False))
    for g in grades_result.scalars().all():
        g.is_published = True
    
    await db.commit()
    return {"success": True, "message": f"Published results for {count} tests"}

@api_router.post("/admin/tests/unpublish-all")
async def unpublish_all_test_results(user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    tests_result = await db.execute(select(Test).where(Test.results_published == True))
    tests = tests_result.scalars().all()
    count = 0
    for t in tests:
        t.results_published = False
        count += 1
    
    grades_result = await db.execute(select(Grade).where(Grade.is_published == True))
    for g in grades_result.scalars().all():
        g.is_published = False
    
    await db.commit()
    return {"success": True, "message": f"Unpublished results for {count} tests"}

@api_router.post("/admin/tests/{test_id}/unpublish")
async def unpublish_test_results(test_id: str, user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Test).where(Test.id == test_id))
    test = result.scalar_one_or_none()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    test.results_published = False
    grades_result = await db.execute(select(Grade).where(Grade.test_id == test_id))
    for grade in grades_result.scalars().all():
        grade.is_published = False
    
    await db.commit()
    return {"success": True, "message": "Results unpublished"}

# ---------------- Admin Routes - Assignments ----------------
@api_router.post("/admin/assignments", response_model=AssignmentResponse)
async def create_assignment(data: AssignmentCreate, user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    assignment = Assignment(
        title=data.title, description=data.description, due_date=data.due_date,
        total_marks=data.total_marks, starts_at=data.starts_at, ends_at=data.ends_at,
        created_by=user.id
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    return AssignmentResponse.model_validate(assignment)

@api_router.get("/admin/assignments", response_model=List[AssignmentResponse])
async def get_all_assignments(user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assignment).order_by(desc(Assignment.created_at)))
    return [AssignmentResponse.model_validate(a) for a in result.scalars().all()]

# ---------------- Admin Routes - Announcements ----------------
@api_router.post("/admin/announcements", response_model=AnnouncementResponse)
async def create_announcement(data: AnnouncementCreate, user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    announcement = Announcement(
        title=data.title, content=data.content, created_by=user.id
    )
    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)
    return AnnouncementResponse.model_validate(announcement)

# ---------------- Admin Routes - Violations & Stats ----------------
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
            submission_id=submission.id, user_email=user_obj.email,
            user_name=user_obj.full_name, test_title=test.title,
            tab_switch_count=submission.tab_switch_count, score=submission.score,
            submitted_at=submission.submitted_at
        ))
    return violations

@api_router.get("/admin/stats")
async def get_admin_stats(user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    students_result = await db.execute(select(func.count(User.id)).where(User.role == 'student'))
    tests_result = await db.execute(select(func.count(Test.id)))
    assignments_result = await db.execute(select(func.count(Assignment.id)))
    violations_result = await db.execute(select(func.count(TestSubmission.id)).where(TestSubmission.is_flagged == True))
    return {
        'total_students': students_result.scalar(),
        'total_tests': tests_result.scalar(),
        'total_assignments': assignments_result.scalar(),
        'total_violations': violations_result.scalar()
    }

# Register router and middleware
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware, allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"], allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
