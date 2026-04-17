from fastapi import APIRouter, Depends, HTTPException, Query
from models import Product, ProductCreate
from auth import get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional

router = APIRouter(prefix="/products", tags=["products"])


async def get_db():
    from server import db
    return db


@router.get("/", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = "recent",
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
    
    # Sort
    sort_field = -1 if sort == "recent" else 1
    if sort == "price-asc":
        sort_by = [("price", 1)]
    elif sort == "price-desc":
        sort_by = [("price", -1)]
    else:
        sort_by = [("createdAt", -1)]
    
    products = await db.products.find(query).sort(sort_by).to_list(1000)
    return [Product(**p) for p in products]


@router.get("/{product_id}", response_model=Product)
async def get_product(
    product_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Increment views
    await db.products.update_one({"id": product_id}, {"$inc": {"views": 1}})
    product["views"] = product.get("views", 0) + 1
    
    # Fallback to fetch seller phone if missing
    if not product.get("sellerPhone"):
        user = await db.users.find_one({"id": product.get("sellerId")})
        if user:
            product["sellerPhone"] = user.get("phone", "")
            product["sellerVerified"] = user.get("isVerified", False)
            
    return Product(**product)


@router.post("/", response_model=Product)
async def create_product(
    product_data: ProductCreate,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Get user info
    user = await db.users.find_one({"id": current_user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create product
    product = Product(
        **product_data.dict(),
        sellerId=user["id"],
        sellerName=f"{user['firstName']} {user['lastName']}",
        sellerAvatar=user["avatar"],
        sellerPhone=user.get("phone", ""),
        sellerRating=user["rating"],
        sellerReviewCount=user["reviewCount"],
        sellerVerified=user.get("isVerified", False)
    )
    
    product_dict = product.model_dump()
    if hasattr(product_dict.get("createdAt", ""), "isoformat"):
        product_dict["createdAt"] = product_dict["createdAt"].isoformat()
    await db.products.insert_one(product_dict)
    product_dict.pop("_id", None)
    return Product(**product_dict)


@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_data: dict,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Check if product exists and belongs to user
    product = await db.products.find_one({"id": product_id, "sellerId": current_user_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or unauthorized")
    
    # Update product - whitelist allowed fields
    ALLOWED_FIELDS = {"title", "titleWo", "price", "category", "condition", "location", "images", "description", "descriptionWo"}
    safe_data = {k: v for k, v in product_data.items() if k in ALLOWED_FIELDS}
    if not safe_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    await db.products.update_one(
        {"id": product_id},
        {"$set": safe_data}
    )
    
    updated_product = await db.products.find_one({"id": product_id})
    return Product(**updated_product)


@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Check if product exists and belongs to user
    product = await db.products.find_one({"id": product_id, "sellerId": current_user_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or unauthorized")
    
    # Delete product
    await db.products.delete_one({"id": product_id})
    return {"message": "Product deleted successfully"}


@router.get("/user/{user_id}", response_model=List[Product])
async def get_user_products(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    products = await db.products.find({"sellerId": user_id}).sort([("createdAt", -1)]).to_list(1000)
    return [Product(**p) for p in products]
