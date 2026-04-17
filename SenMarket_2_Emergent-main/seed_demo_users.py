#!/usr/bin/env python3
"""
Manual seeding script for demo users
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import sys

# Add backend to path
sys.path.append('/app/backend')
from auth import get_password_hash

ROOT_DIR = Path('/app/backend')
load_dotenv(ROOT_DIR / '.env')

async def seed_demo_users():
    # MongoDB connection
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'senmarket')
    
    if not mongo_url:
        print("❌ MONGO_URL not found in environment")
        return False
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Check current users
        users_count = await db.users.count_documents({})
        print(f"📊 Current users in database: {users_count}")
        
        # Check if demo user already exists
        demo_user = await db.users.find_one({"email": "mamadou@test.com"})
        if demo_user:
            print("✅ Demo user already exists")
            return True
        
        # Create demo users
        demo_users = [
            {
                "id": "demo_u1",
                "email": "mamadou@test.com",
                "password": get_password_hash("password123"),
                "firstName": "Mamadou",
                "lastName": "Diop",
                "phone": "+221 77 123 4567",
                "location": "Dakar, Plateau",
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Mamadou",
                "rating": 4.8,
                "reviewCount": 24,
                "isVerified": False,
                "phoneVerified": False,
                "payoutPhone": "",
                "isAdmin": False,
                "isBanned": False,
                "warnings": 0,
                "whatsappEnabled": True,
                "createdAt": "2024-01-01T00:00:00Z"
            },
            {
                "id": "demo_u2",
                "email": "aissatou@test.com",
                "password": get_password_hash("password123"),
                "firstName": "Aïssatou",
                "lastName": "Fall",
                "phone": "+221 77 234 5678",
                "location": "Dakar, Médina",
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Aissatou",
                "rating": 4.9,
                "reviewCount": 31,
                "isVerified": False,
                "phoneVerified": False,
                "payoutPhone": "",
                "isAdmin": False,
                "isBanned": False,
                "warnings": 0,
                "whatsappEnabled": True,
                "createdAt": "2024-01-01T00:00:00Z"
            },
            {
                "id": "demo_u3",
                "email": "ousmane@test.com",
                "password": get_password_hash("password123"),
                "firstName": "Ousmane",
                "lastName": "Seck",
                "phone": "+221 77 345 6789",
                "location": "Dakar, Almadies",
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ousmane",
                "rating": 4.7,
                "reviewCount": 18,
                "isVerified": False,
                "phoneVerified": False,
                "payoutPhone": "",
                "isAdmin": False,
                "isBanned": False,
                "warnings": 0,
                "whatsappEnabled": True,
                "createdAt": "2024-01-01T00:00:00Z"
            }
        ]
        
        # Insert demo users
        result = await db.users.insert_many(demo_users)
        print(f"✅ Created {len(result.inserted_ids)} demo users")
        
        # Verify insertion
        final_count = await db.users.count_documents({})
        print(f"📊 Total users after seeding: {final_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error seeding demo users: {e}")
        return False
    finally:
        client.close()

if __name__ == "__main__":
    success = asyncio.run(seed_demo_users())
    sys.exit(0 if success else 1)