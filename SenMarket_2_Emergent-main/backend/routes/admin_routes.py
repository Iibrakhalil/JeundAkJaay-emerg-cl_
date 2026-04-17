from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Any
from bson import ObjectId
from auth import get_current_user
import os

router = APIRouter(prefix="/admin", tags=["admin"])

async def get_db():
    from server import db
    return db


async def require_admin(
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    admin_email = os.environ.get("ADMIN_EMAIL")
    if not admin_email:
        raise HTTPException(status_code=503, detail="Admin access not configured (set ADMIN_EMAIL)")
    user = await db.users.find_one({"id": current_user_id})
    if not user or user.get("email") != admin_email:
        raise HTTPException(status_code=403, detail="Admin access required")


@router.get("/collections")
async def list_collections(
    db: AsyncIOMotorDatabase = Depends(get_db),
    _=Depends(require_admin)
):
    collections = await db.list_collection_names()
    result = {}
    for collection_name in collections:
        count = await db[collection_name].count_documents({})
        result[collection_name] = {"count": count}
    return result


@router.get("/collection/{collection_name}")
async def get_collection_data(
    collection_name: str,
    skip: int = 0,
    limit: int = 50,
    db: AsyncIOMotorDatabase = Depends(get_db),
    _=Depends(require_admin)
):
    try:
        collection = db[collection_name]
        total = await collection.count_documents({})
        documents = await collection.find().skip(skip).limit(limit).to_list(limit)
        for doc in documents:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
        return {"collection": collection_name, "total": total, "skip": skip, "limit": limit, "documents": documents}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/collection/{collection_name}/search")
async def search_collection(
    collection_name: str,
    field: str,
    value: str,
    limit: int = 50,
    db: AsyncIOMotorDatabase = Depends(get_db),
    _=Depends(require_admin)
):
    try:
        collection = db[collection_name]
        query = {field: {"$regex": value, "$options": "i"}}
        documents = await collection.find(query).limit(limit).to_list(limit)
        for doc in documents:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
        return {"collection": collection_name, "query": query, "count": len(documents), "documents": documents}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/collection/{collection_name}/{doc_id}")
async def delete_document(
    collection_name: str,
    doc_id: str,
    id_field: str = "id",
    db: AsyncIOMotorDatabase = Depends(get_db),
    _=Depends(require_admin)
):
    try:
        result = await db[collection_name].delete_one({id_field: doc_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Document not found")
        return {"message": f"Document {doc_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/collection/{collection_name}/{doc_id}")
async def update_document(
    collection_name: str,
    doc_id: str,
    update_data: Dict[str, Any],
    id_field: str = "id",
    db: AsyncIOMotorDatabase = Depends(get_db),
    _=Depends(require_admin)
):
    try:
        result = await db[collection_name].update_one({id_field: doc_id}, {"$set": update_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Document not found")
        return {"message": f"Document {doc_id} updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/reports")
async def list_reports(
    db: AsyncIOMotorDatabase = Depends(get_db),
    _=Depends(require_admin)
):
    reports = await db.reports.find().sort([("createdAt", -1)]).to_list(100)
    for report in reports:
        if "_id" in report:
            report["_id"] = str(report["_id"])
    return reports


@router.put("/reports/{report_id}/resolve")
async def resolve_report(
    report_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    _=Depends(require_admin)
):
    result = await db.reports.update_one({"id": report_id}, {"$set": {"status": "resolved"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Signalement non trouvé")
    return {"message": "Signalement marqué comme résolu"}


@router.put("/users/{user_id}/verify")
async def verify_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    _=Depends(require_admin)
):
    result = await db.users.update_one({"id": user_id}, {"$set": {"isVerified": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {"message": "Utilisateur vérifié avec succès"}


@router.put("/users/{user_id}/warn")
async def warn_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    _=Depends(require_admin)
):
    result = await db.users.update_one({"id": user_id}, {"$inc": {"warnings": 1}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {"message": "Avertissement envoyé à l'utilisateur"}


@router.put("/users/{user_id}/ban")
async def ban_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    _=Depends(require_admin)
):
    result = await db.users.update_one({"id": user_id}, {"$set": {"isBanned": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {"message": "Utilisateur banni définitivement"}


@router.get("/stats")
async def get_database_stats(
    db: AsyncIOMotorDatabase = Depends(get_db),
    _=Depends(require_admin)
):
    try:
        # Get unverified users for the dashboard
        unverified_users = await db.users.find({"isVerified": False}).limit(10).to_list(10)
        for user in unverified_users:
            if "_id" in user:
                user["_id"] = str(user["_id"])
            user.pop("password", None)

        return {
            "users": await db.users.count_documents({}),
            "products": await db.products.count_documents({}),
            "services": await db.services.count_documents({}),
            "reports": await db.reports.count_documents({"status": "pending"}),
            "transactions": await db.transactions.count_documents({}),
            "unverifiedUsersList": unverified_users
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
