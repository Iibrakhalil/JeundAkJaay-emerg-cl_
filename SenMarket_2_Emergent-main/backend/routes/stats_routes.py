from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter(prefix="/stats", tags=["stats"])

async def get_db():
    from server import db
    return db

@router.get("/public")
async def get_public_stats(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Public endpoint to get basic platform statistics"""
    users_count = await db.users.count_documents({})
    products_count = await db.products.count_documents({})
    services_count = await db.services.count_documents({})
    
    # Adding some fake baseline to make it look active like the original "5000+"
    # Or just returning the real numbers. Since the original was 5000, 2000, 10000
    # Let's return the real counts but ensure a minimum or just real ones.
    
    return {
        "users": users_count,
        "products": products_count,
        "services": services_count
    }
