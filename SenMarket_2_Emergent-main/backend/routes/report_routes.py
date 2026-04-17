from fastapi import APIRouter, Depends, HTTPException
from models import Report, ReportCreate
from auth import get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from routes.admin_routes import require_admin

router = APIRouter(prefix="/reports", tags=["reports"])


async def get_db():
    from server import db
    return db


@router.post("/", response_model=Report)
async def create_report(
    report_data: ReportCreate,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    user = await db.users.find_one({"id": current_user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if user already reported this item
    existing = await db.reports.find_one({
        "reporterId": current_user_id,
        "targetType": report_data.targetType,
        "targetId": report_data.targetId
    })
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà signalé cet élément")

    # Find the owner of the reported item
    reported_user_id = None
    if report_data.targetType == 'product':
        item = await db.products.find_one({"id": report_data.targetId})
        if item:
            reported_user_id = item.get("userId") or item.get("sellerId")
    elif report_data.targetType == 'service':
        item = await db.services.find_one({"id": report_data.targetId})
        if item:
            reported_user_id = item.get("userId") or item.get("providerId")

    report = Report(
        **report_data.dict(),
        reporterId=current_user_id,
        reporterName=f"{user['firstName']} {user['lastName']}",
        reportedUserId=reported_user_id or ""
    )

    await db.reports.insert_one(report.dict())
    return report


@router.get("/", response_model=List[Report])
async def get_all_reports(
    db: AsyncIOMotorDatabase = Depends(get_db),
    _=Depends(require_admin)   # ← ajouter cette ligne
):
    """Admin endpoint to list all reports"""
    reports = await db.reports.find().sort([("createdAt", -1)]).to_list(1000)
    return [Report(**r) for r in reports]
