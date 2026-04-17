from fastapi import APIRouter, Depends, HTTPException, status
from models import UserCreate, UserLogin, UserResponse, User
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from typing import List
import os
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])

# Dependency to get database
async def get_db():
    from server import db
    return db

@router.post("/signup", response_model=dict)
async def signup(user_data: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    # Normaliser l'email en lowercase
    email = user_data.email.lower()
    
    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est deja utilise"
        )
    
    is_admin = (email == os.environ.get("ADMIN_EMAIL", "").lower())
    
    new_user_obj = User(
        email=email,
        password=get_password_hash(user_data.password),
        firstName=user_data.firstName,
        lastName=user_data.lastName,
        phone=user_data.phone,
        location=user_data.location,
        avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data.firstName}",
        isAdmin=is_admin
    )
    
    user_dict = new_user_obj.model_dump()
    user_dict["createdAt"] = user_dict["createdAt"].isoformat() if hasattr(user_dict.get("createdAt", ""), "isoformat") else user_dict.get("createdAt", "")
    
    await db.users.insert_one(user_dict)
    
    access_token = create_access_token(data={"sub": new_user_obj.id})
    
    user_dict.pop("_id", None)
    user_dict.pop("password", None)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**user_dict).model_dump()
    }

@router.post("/login", response_model=dict)
async def login(user_data: UserLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    email = user_data.email.lower()
    
    # Brute force protection
    identifier = email
    attempts = await db.login_attempts.find_one({"identifier": identifier})
    if attempts and attempts.get("count", 0) >= 5:
        last_attempt = attempts.get("last_attempt")
        if last_attempt:
            if isinstance(last_attempt, str):
                last_attempt = datetime.fromisoformat(last_attempt)
            if last_attempt.tzinfo is None:
                last_attempt = last_attempt.replace(tzinfo=timezone.utc)
            diff = (datetime.now(timezone.utc) - last_attempt).total_seconds()
            if diff < 900:
                raise HTTPException(status_code=429, detail="Trop de tentatives. Reessayez dans 15 minutes.")
            else:
                await db.login_attempts.delete_one({"identifier": identifier})
    
    user = await db.users.find_one({"email": email})
    if not user:
        await _increment_login_attempts(db, identifier)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )
    
    if not verify_password(user_data.password, user["password"]):
        await _increment_login_attempts(db, identifier)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )
    
    if user.get("isBanned", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Votre compte a ete suspendu. Contactez le support."
        )
    
    # Clear attempts on success
    await db.login_attempts.delete_one({"identifier": identifier})
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    user_response = UserResponse(**user)
    if user["email"] == os.environ.get("ADMIN_EMAIL", "").lower():
        user_response.isAdmin = True
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response.model_dump()
    }


async def _increment_login_attempts(db, identifier):
    await db.login_attempts.update_one(
        {"identifier": identifier},
        {
            "$inc": {"count": 1},
            "$set": {"last_attempt": datetime.now(timezone.utc).isoformat()},
            "$setOnInsert": {"identifier": identifier},
        },
        upsert=True,
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Recherche par le champ 'id' (UUID)
    user = await db.users.find_one({"id": current_user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.pop("password", None)
    user_response = UserResponse(**user)
    if user["email"] == os.environ.get("ADMIN_EMAIL", "").lower():
        user_response.isAdmin = True
        
    return user_response

@router.put("/me", response_model=UserResponse)
async def update_profile(
    user_data: dict,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    ALLOWED_FIELDS = {"firstName", "lastName", "phone", "location", "avatar", "payoutPhone", "whatsappEnabled"}
    safe_data = {k: v for k, v in user_data.items() if k in ALLOWED_FIELDS}
    
    if not safe_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    result = await db.users.update_one(
        {"id": current_user_id},
        {"$set": safe_data}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user = await db.users.find_one({"id": current_user_id})
    user.pop("password", None)
    return UserResponse(**user)

@router.get("/user/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.pop("password", None)
    return UserResponse(**user)