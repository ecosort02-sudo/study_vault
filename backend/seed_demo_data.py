import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import AsyncSessionLocal
from models import User, Test, Assignment, Announcement
from datetime import datetime, timezone, timedelta

async def seed_demo_data():
    async with AsyncSessionLocal() as db:
        # Get admin user
        result = await db.execute(select(User).where(User.email == 'admin@portal.com'))
        admin = result.scalar_one_or_none()
        
        if not admin:
            print("Admin user not found!")
            return
        
        # Create sample test
        result = await db.execute(select(Test).where(Test.title == 'Python Basics Test'))
        existing_test = result.scalar_one_or_none()
        
        if not existing_test:
            test = Test(
                title='Python Basics Test',
                description='Test your knowledge of Python fundamentals',
                questions=[
                    {
                        'question': 'What is the output of print(2 ** 3)?',
                        'options': ['5', '6', '8', '9'],
                        'correct_option': 2,
                        'marks': 5
                    },
                    {
                        'question': 'Which keyword is used to create a function in Python?',
                        'options': ['function', 'def', 'func', 'define'],
                        'correct_option': 1,
                        'marks': 5
                    },
                    {
                        'question': 'What data type is the object [1, 2, 3]?',
                        'options': ['tuple', 'dictionary', 'list', 'set'],
                        'correct_option': 2,
                        'marks': 5
                    },
                    {
                        'question': 'How do you create a comment in Python?',
                        'options': ['// comment', '/* comment */', '# comment', '-- comment'],
                        'correct_option': 2,
                        'marks': 5
                    },
                    {
                        'question': 'What is the correct file extension for Python files?',
                        'options': ['.pyth', '.pt', '.py', '.pyt'],
                        'correct_option': 2,
                        'marks': 5
                    }
                ],
                duration_minutes=30,
                total_marks=25,
                created_by=admin.id,
                is_active=True
            )
            db.add(test)
            print("Created Python Basics Test")
        
        # Create JavaScript test
        result = await db.execute(select(Test).where(Test.title == 'JavaScript Fundamentals'))
        existing_test = result.scalar_one_or_none()
        
        if not existing_test:
            test2 = Test(
                title='JavaScript Fundamentals',
                description='Test your JavaScript knowledge',
                questions=[
                    {
                        'question': 'Which symbol is used for comments in JavaScript?',
                        'options': ['#', '//', '<!--', '/*'],
                        'correct_option': 1,
                        'marks': 4
                    },
                    {
                        'question': 'What is the correct syntax for a for loop?',
                        'options': ['for (i = 0; i < 5; i++)', 'for i = 0 to 5', 'for (i < 5; i++)', 'foreach (i in 5)'],
                        'correct_option': 0,
                        'marks': 4
                    },
                    {
                        'question': 'How do you declare a variable in JavaScript?',
                        'options': ['v x = 5', 'var x = 5', 'variable x = 5', 'x := 5'],
                        'correct_option': 1,
                        'marks': 4
                    }
                ],
                duration_minutes=20,
                total_marks=12,
                created_by=admin.id,
                is_active=True
            )
            db.add(test2)
            print("Created JavaScript Fundamentals Test")
        
        # Create sample assignment
        result = await db.execute(select(Assignment).where(Assignment.title == 'Web Development Project'))
        existing_assignment = result.scalar_one_or_none()
        
        if not existing_assignment:
            assignment = Assignment(
                title='Web Development Project',
                description='Create a responsive website using HTML, CSS, and JavaScript. The website should include a navigation bar, hero section, and contact form.',
                due_date=datetime.now(timezone.utc) + timedelta(days=7),
                total_marks=100,
                created_by=admin.id,
                is_active=True
            )
            db.add(assignment)
            print("Created Web Development Project assignment")
        
        # Create another assignment
        result = await db.execute(select(Assignment).where(Assignment.title == 'Database Design Assignment'))
        existing_assignment = result.scalar_one_or_none()
        
        if not existing_assignment:
            assignment2 = Assignment(
                title='Database Design Assignment',
                description='Design a normalized database schema for an e-commerce platform. Include ER diagrams and SQL scripts.',
                due_date=datetime.now(timezone.utc) + timedelta(days=14),
                total_marks=50,
                created_by=admin.id,
                is_active=True
            )
            db.add(assignment2)
            print("Created Database Design assignment")
        
        # Create announcements
        result = await db.execute(select(Announcement).where(Announcement.title == 'Welcome to the Portal'))
        existing_announcement = result.scalar_one_or_none()
        
        if not existing_announcement:
            announcement = Announcement(
                title='Welcome to the Portal',
                content='Welcome to our Student Portal! This is your one-stop destination for all academic activities including tests, assignments, and grades.',
                created_by=admin.id,
                is_active=True
            )
            db.add(announcement)
            print("Created Welcome announcement")
        
        result = await db.execute(select(Announcement).where(Announcement.title == 'Upcoming Mid-Term Exams'))
        existing_announcement = result.scalar_one_or_none()
        
        if not existing_announcement:
            announcement2 = Announcement(
                title='Upcoming Mid-Term Exams',
                content='Mid-term exams will be conducted next month. Please ensure you complete all assignments and practice tests before the exam dates.',
                created_by=admin.id,
                is_active=True
            )
            db.add(announcement2)
            print("Created Mid-Term Exams announcement")
        
        await db.commit()
        print("\\nDemo data seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_demo_data())
