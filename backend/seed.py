import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import AsyncSessionLocal
from models import User
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_users():
    async with AsyncSessionLocal() as db:
        # Check if admin exists
        result = await db.execute(select(User).where(User.email == 'admin@portal.com'))
        admin = result.scalar_one_or_none()
        
        if not admin:
            admin = User(
                email='admin@portal.com',
                password_hash=hash_password('admin123'),
                full_name='Admin User',
                role='admin'
            )
            db.add(admin)
            print("Created admin user: admin@portal.com / admin123")
        
        # Check if student exists
        result = await db.execute(select(User).where(User.email == 'student@portal.com'))
        student = result.scalar_one_or_none()
        
        if not student:
            student = User(
                email='student@portal.com',
                password_hash=hash_password('student123'),
                full_name='Test Student',
                role='student'
            )
            db.add(student)
            print("Created student user: student@portal.com / student123")
        
        await db.commit()
        print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_users())
