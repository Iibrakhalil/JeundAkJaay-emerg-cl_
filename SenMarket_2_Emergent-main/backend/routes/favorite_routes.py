from fastapi import APIRouter, Depends, HTTPException
from auth import get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone

router = APIRouter(prefix="/favorites", tags=["favorites"])


async def get_db():
    from server import db
    return db


@router.get("/")
async def get_my_favorites(
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    favorites = await db.favorites.find(
        {"userId": current_user_id}, {"_id": 0}
    ).sort([("createdAt", -1)]).to_list(500)

    # Enrich with item details
    enriched = []
    for fav in favorites:
        item = None
        if fav["itemType"] == "product":
            item = await db.products.find_one({"id": fav["itemId"]}, {"_id": 0})
        elif fav["itemType"] == "service":
            item = await db.services.find_one({"id": fav["itemId"]}, {"_id": 0})
        enriched.append({**fav, "item": item})

    return enriched


@router.post("/{item_type}/{item_id}")
async def add_favorite(
    item_type: str,
    item_id: str,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if item_type not in ("product", "service"):
        raise HTTPException(status_code=400, detail="Type invalide")

    # Check item exists
    if item_type == "product":
        item = await db.products.find_one({"id": item_id})
    else:
        item = await db.services.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Element non trouve")

    # Check not already favorited
    existing = await db.favorites.find_one({
        "userId": current_user_id, "itemType": item_type, "itemId": item_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Deja dans vos favoris")

    import uuid
    doc = {
        "id": str(uuid.uuid4()),
        "userId": current_user_id,
        "itemType": item_type,
        "itemId": item_id,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.favorites.insert_one(doc)

    # Increment favoritesCount on the item
    collection = "products" if item_type == "product" else "services"
    await db[collection].update_one({"id": item_id}, {"$inc": {"favoritesCount": 1}})

    doc.pop("_id", None)
    return doc


@router.delete("/{item_type}/{item_id}")
async def remove_favorite(
    item_type: str,
    item_id: str,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    result = await db.favorites.delete_one({
        "userId": current_user_id, "itemType": item_type, "itemId": item_id
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favori non trouve")

    # Decrement favoritesCount
    collection = "products" if item_type == "product" else "services"
    await db[collection].update_one({"id": item_id}, {"$inc": {"favoritesCount": -1}})

    return {"message": "Favori retire"}


@router.get("/check/{item_type}/{item_id}")
async def check_favorite(
    item_type: str,
    item_id: str,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    existing = await db.favorites.find_one({
        "userId": current_user_id, "itemType": item_type, "itemId": item_id
    })
    return {"isFavorited": existing is not None}
