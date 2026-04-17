from fastapi import APIRouter, Depends, HTTPException
from models import OTPCode
from auth import get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta, timezone
import random
import logging

router = APIRouter(prefix="/otp", tags=["otp"])
logger = logging.getLogger(__name__)


async def get_db():
    from server import db
    return db


@router.post("/send")
async def send_otp(
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    user = await db.users.find_one({"id": current_user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("phoneVerified"):
        raise HTTPException(status_code=400, detail="Numéro déjà vérifié")

    # Generate 6-digit code
    code = str(random.randint(100000, 999999))

    otp = OTPCode(
        userId=current_user_id,
        phone=user["phone"],
        code=code,
        expiresAt=datetime.now(timezone.utc) + timedelta(minutes=5)
    )

    # Remove old OTPs for this user
    await db.otp_codes.delete_many({"userId": current_user_id})
    await db.otp_codes.insert_one(otp.dict())

    # In production, send SMS via Twilio/Orange SMS API
    # For now, log the code (dev mode)
    logger.info(f"OTP code for {user['phone']}: {code}")

    return {
        "message": "Code envoyé avec succès",
        "phone": user["phone"],
        # DEV ONLY: return code for testing. Remove in production!
    }


@router.post("/verify")
async def verify_otp(
    otp_data: dict,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    code = otp_data.get("code", "")

    otp_record = await db.otp_codes.find_one({
        "userId": current_user_id,
        "verified": False
    })

    if not otp_record:
        raise HTTPException(status_code=400, detail="Aucun code en attente")

    if datetime.now(timezone.utc) > otp_record["expiresAt"]:
        raise HTTPException(status_code=400, detail="Code expiré. Demandez un nouveau code.")

    if otp_record["code"] != code:
        raise HTTPException(status_code=400, detail="Code invalide")

    # Mark OTP as verified
    await db.otp_codes.update_one(
        {"id": otp_record["id"]},
        {"$set": {"verified": True}}
    )

    # Mark user phone as verified
    await db.users.update_one(
        {"id": current_user_id},
        {"$set": {"phoneVerified": True}}
    )

    return {"message": "Numéro vérifié avec succès ✓"}
