from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = 'users'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, index=True)  # 'student' or 'admin'
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    test_submissions = relationship('TestSubmission', back_populates='user', cascade='all, delete-orphan')
    grades = relationship('Grade', back_populates='user', cascade='all, delete-orphan')

class Test(Base):
    __tablename__ = 'tests'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    questions = Column(JSON, nullable=False)  # Store MCQ questions as JSON
    duration_minutes = Column(Integer, default=60)
    total_marks = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, index=True)
    starts_at = Column(DateTime(timezone=True), nullable=True, index=True)
    ends_at = Column(DateTime(timezone=True), nullable=True, index=True)
    publish_at = Column(DateTime(timezone=True), nullable=True, index=True)
    unpublish_at = Column(DateTime(timezone=True), nullable=True, index=True)
    results_published = Column(Boolean, default=False, index=True)
    created_by = Column(String(36), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    submissions = relationship('TestSubmission', back_populates='test', cascade='all, delete-orphan')

class Assignment(Base):
    __tablename__ = 'assignments'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    due_date = Column(DateTime(timezone=True))
    total_marks = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, index=True)
    starts_at = Column(DateTime(timezone=True), nullable=True, index=True)
    ends_at = Column(DateTime(timezone=True), nullable=True, index=True)
    created_by = Column(String(36), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class TestSubmission(Base):
    __tablename__ = 'test_submissions'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    test_id = Column(String(36), ForeignKey('tests.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    answers = Column(JSON, nullable=False)  # Store answers as JSON
    score = Column(Integer, default=0)
    tab_switch_count = Column(Integer, default=0)
    is_flagged = Column(Boolean, default=False, index=True)  # Flagged if tab switches > 5
    submitted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship('User', back_populates='test_submissions')
    test = relationship('Test', back_populates='submissions')

class Grade(Base):
    __tablename__ = 'grades'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    assignment_id = Column(String(36), nullable=True)  # Can be null for test grades
    test_id = Column(String(36), nullable=True)  # Can be null for assignment grades
    title = Column(String(255), nullable=False)
    score = Column(Integer, nullable=False)
    total_marks = Column(Integer, nullable=False)
    is_published = Column(Boolean, default=False, index=True)
    graded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship('User', back_populates='grades')

class Announcement(Base):
    __tablename__ = 'announcements'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    created_by = Column(String(36), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    is_active = Column(Boolean, default=True, index=True)

class AssignmentSubmission(Base):
    __tablename__ = 'assignment_submissions'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    assignment_id = Column(String(36), ForeignKey('assignments.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    content = Column(Text, nullable=False)
    submitted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))