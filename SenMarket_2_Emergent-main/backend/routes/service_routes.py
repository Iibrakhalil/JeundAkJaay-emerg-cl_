from fastapi import APIRouter, Depends, HTTPException, Query
from models import Service, ServiceCreate
from auth import get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional

router = APIRouter(prefix="/services", tags=["services"])


async def get_db():
    from server import db
    return db


@router.get("/", response_model=List[Service])
async def get_services(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    query = {}
    
    if category:
        query["category"] = category
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"titleWo": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    services = await db.services.find(query).sort([("createdAt", -1)]).to_list(1000)
    return [Service(**s) for s in services]


@router.get("/{service_id}", response_model=Service)
async def get_service(
    service_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = await db.services.find_one({"id": service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Increment views
    await db.services.update_one({"id": service_id}, {"$inc": {"views": 1}})
    service["views"] = service.get("views", 0) + 1
    
    # Fallback to fetch provider phone if missing
    if not service.get("providerPhone"):
        user = await db.users.find_one({"id": service.get("providerId")})
        if user:
            service["providerPhone"] = user.get("phone", "")
            service["providerVerified"] = user.get("isVerified", False)
            
    return Service(**service)


@router.post("/", response_model=Service)
async def create_service(
    service_data: ServiceCreate,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Get user info
    user = await db.users.find_one({"id": current_user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create service
    service = Service(
        **service_data.dict(),
        providerId=user["id"],
        providerName=f"{user['firstName']} {user['lastName']}",
        providerAvatar=user["avatar"],
        providerPhone=user.get("phone", ""),
        providerRating=user["rating"],
        providerReviewCount=user["reviewCount"],
        providerVerified=user.get("isVerified", False),
        providerWhatsapp=user.get("whatsappEnabled", True),
        providerCompletedJobs=0
    )
    
    service_dict = service.model_dump()
    if hasattr(service_dict.get("createdAt", ""), "isoformat"):
        service_dict["createdAt"] = service_dict["createdAt"].isoformat()
    await db.services.insert_one(service_dict)
    service_dict.pop("_id", None)
    return Service(**service_dict)


@router.put("/{service_id}", response_model=Service)
async def update_service(
    service_id: str,
    service_data: dict,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Check if service exists and belongs to user
    service = await db.services.find_one({"id": service_id, "providerId": current_user_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found or unauthorized")
    
    # Update service - whitelist allowed fields
    ALLOWED_FIELDS = {"title", "titleWo", "category", "rate", "rateType", "location", "image", "description", "descriptionWo", "availability"}
    safe_data = {k: v for k, v in service_data.items() if k in ALLOWED_FIELDS}
    if not safe_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    await db.services.update_one(
        {"id": service_id},
        {"$set": safe_data}
    )
    
    updated_service = await db.services.find_one({"id": service_id})
    return Service(**updated_service)


@router.delete("/{service_id}")
async def delete_service(
    service_id: str,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Check if service exists and belongs to user
    service = await db.services.find_one({"id": service_id, "providerId": current_user_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found or unauthorized")
    
    # Delete service
    await db.services.delete_one({"id": service_id})
    return {"message": "Service deleted successfully"}


@router.get("/user/{user_id}", response_model=List[Service])
async def get_user_services(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    services = await db.services.find({"providerId": user_id}).sort([("createdAt", -1)]).to_list(1000)
    return [Service(**s) for s in services]
