from fastapi import APIRouter, Depends, HTTPException
from models import Review, ReviewCreate
from auth import get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

router = APIRouter(prefix="/reviews", tags=["reviews"])


async def get_db():
    from server import db
    return db


@router.get("/user/{user_id}", response_model=List[Review])
async def get_user_reviews(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    reviews = await db.reviews.find({"targetType": "user", "targetId": user_id}).sort([("createdAt", -1)]).to_list(1000)
    return [Review(**r) for r in reviews]


@router.get("/product/{product_id}", response_model=List[Review])
async def get_product_reviews(
    product_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    reviews = await db.reviews.find({"targetType": "product", "targetId": product_id}).sort([("createdAt", -1)]).to_list(1000)
    return [Review(**r) for r in reviews]


@router.get("/service/{service_id}", response_model=List[Review])
async def get_service_reviews(
    service_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    reviews = await db.reviews.find({"targetType": "service", "targetId": service_id}).sort([("createdAt", -1)]).to_list(1000)
    return [Review(**r) for r in reviews]


@router.post("/", response_model=Review)
async def create_review(
    review_data: ReviewCreate,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # 1. Get user info
    user = await db.users.find_one({"id": current_user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 2. Verify Transaction (Mandatory for product/service/user ratings)
    # Check if a completed transaction exists between this buyer and the item/seller
    tx_query = {
        "status": "completed",
        "$or": [
            {"buyerId": current_user_id},
            {"sellerId": current_user_id}
        ]
    }
    
    if review_data.targetType in ["product", "service"]:
        tx_query["itemId"] = review_data.targetId
    elif review_data.targetType == "user":
        # Check if they had a transaction together
        tx_query["$or"] = [
            {"buyerId": current_user_id, "sellerId": review_data.targetId},
            {"sellerId": current_user_id, "buyerId": review_data.targetId}
        ]

    transaction = await db.transactions.find_one(tx_query)
    if not transaction:
        raise HTTPException(
            status_code=403, 
            detail="Seuls les utilisateurs ayant effectué une transaction terminée peuvent laisser un avis."
        )
    
    # 3. Create review
    review = Review(
        userId=user["id"],
        userName=f"{user['firstName']} {user['lastName']}",
        userAvatar=user["avatar"],
        **review_data.dict()
    )
    
    await db.reviews.insert_one(review.dict())
    
    # 4. Update target ratings
    if review_data.targetType == "user":
        await update_user_rating(review_data.targetId, db)
    elif review_data.targetType == "product":
        await update_product_rating(review_data.targetId, db)
    elif review_data.targetType == "service":
        await update_service_rating(review_data.targetId, db)
    
    return review


async def update_user_rating(user_id: str, db: AsyncIOMotorDatabase):
    reviews = await db.reviews.find({"targetType": "user", "targetId": user_id}).to_list(1000)
    if reviews:
        avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"rating": round(avg_rating, 1), "reviewCount": len(reviews)}}
        )

async def update_product_rating(product_id: str, db: AsyncIOMotorDatabase):
    reviews = await db.reviews.find({"targetType": "product", "targetId": product_id}).to_list(1000)
    if reviews:
        avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
        # Update product rating
        await db.products.update_one(
            {"id": product_id},
            {"$set": {"rating": round(avg_rating, 1), "reviewCount": len(reviews)}}
        )
        # Also update seller's overall rating (indirectly)
        product = await db.products.find_one({"id": product_id})
        if product:
            await update_user_rating(product["sellerId"], db)

async def update_service_rating(service_id: str, db: AsyncIOMotorDatabase):
    reviews = await db.reviews.find({"targetType": "service", "targetId": service_id}).to_list(1000)
    if reviews:
        avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
        # Update service rating
        await db.services.update_one(
            {"id": service_id},
            {"$set": {"rating": round(avg_rating, 1), "reviewCount": len(reviews)}}
        )
        # Also update provider's overall rating (indirectly)
        service = await db.services.find_one({"id": service_id})
        if service:
            await update_user_rating(service["providerId"], db)
