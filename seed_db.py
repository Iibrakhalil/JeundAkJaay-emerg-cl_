from fastapi import FastAPI, APIRouter, Response
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
import os, logging
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv()

from routes import (
    auth_routes, product_routes, service_routes, message_routes,
    review_routes, upload_routes, admin_routes, report_routes,
    transaction_routes, otp_routes, stats_routes, favorite_routes
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

db_name = os.environ.get('DB_NAME', 'senmarket').strip()
mongo_url = os.environ.get('MONGO_URL', '').strip()
if not mongo_url:
    raise RuntimeError("MONGO_URL is not set.")

client = None
db = None
fs = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db, fs
    logger.info("Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    fs = AsyncIOMotorGridFSBucket(db)
    try:
        await client.admin.command('ping')
        logger.info("MongoDB connection OK")
    except Exception as e:
        logger.error(f"MongoDB FAILED: {e}")
        raise
    try:
        await db.users.create_index("id", unique=True)
        await db.users.create_index("email", unique=True)
        await db.products.create_index("id", unique=True)
        await db.products.create_index("sellerId")
        await db.products.create_index("category")
        await db.services.create_index("id", unique=True)
        await db.services.create_index("providerId")
        await db.services.create_index("category")
        await db.transactions.create_index("id", unique=True)
        await db.reports.create_index("id", unique=True)
        await db.favorites.create_index([("userId", 1), ("itemType", 1), ("itemId", 1)], unique=True)
        await db.login_attempts.create_index("identifier")
        logger.info("Indexes OK")
    except Exception as e:
        logger.warning(f"Index warning (non-fatal): {e}")
    
    # Seed admin user
    try:
        from auth import get_password_hash
        admin_email = os.environ.get("ADMIN_EMAIL", "").lower()
        admin_password = os.environ.get("ADMIN_PASSWORD", "")
        if admin_email and admin_password:
            existing = await db.users.find_one({"email": admin_email})
            if not existing:
                import uuid
                from datetime import datetime as dt, timezone as tz
                admin_user = {
                    "id": str(uuid.uuid4()),
                    "email": admin_email,
                    "password": get_password_hash(admin_password),
                    "firstName": "Admin",
                    "lastName": "Admin",
                    "phone": "+221770000000",
                    "location": "Dakar",
                    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
                    "rating": 0.0,
                    "reviewCount": 0,
                    "isVerified": True,
                    "phoneVerified": True,
                    "payoutPhone": "",
                    "isAdmin": True,
                    "isBanned": False,
                    "warnings": 0,
                    "whatsappEnabled": True,
                    "createdAt": dt.now(tz.utc).isoformat(),
                }
                await db.users.insert_one(admin_user)
                logger.info(f"Admin seeded: {admin_email}")
    except Exception as e:
        logger.warning(f"Admin seed warning: {e}")
    
    # Seed demo data if DB is empty
    try:
        products_count = await db.products.count_documents({})
        if products_count == 0:
            from seed_db import seed_database
            await seed_database()
            logger.info("Demo data seeded")
    except Exception as e:
        logger.warning(f"Seed warning: {e}")
    yield
    client.close()

app = FastAPI(title="Jënd-Ak-Jaay API", version="1.0.0", redirect_slashes=False, lifespan=lifespan)

cors_origins_raw = os.environ.get('CORS_ORIGINS', '').strip()
cors_origins = [o.strip() for o in cors_origins_raw.split(',') if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins else ["*"],
    allow_origin_regex=r"https://.*\.github\.dev|http://localhost:.*|https://.*\.preview\.emergentagent\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

@api_router.get("/")
async def root():
    return {"message": "Jënd-Ak-Jaay API is running", "status": "healthy"}

@api_router.get("/media/{media_id}")
async def get_media(media_id: str):
    from bson import ObjectId
    from fastapi import HTTPException
    try:
        try:
            grid_out = await fs.open_download_stream(ObjectId(media_id))
            content = await grid_out.read()
            content_type = grid_out.metadata.get("contentType", "image/jpeg") if grid_out.metadata else "image/jpeg"
        except Exception:
            media = await db.media.find_one({"_id": ObjectId(media_id)})
            if not media:
                raise HTTPException(status_code=404, detail="Media not found")
            content = media["data"]
            content_type = media.get("contentType", "image/jpeg")
        return Response(content=content, media_type=content_type,
                       headers={"Cache-Control": "public, max-age=31536000"})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid media: {str(e)}")

api_router.include_router(auth_routes.router)
api_router.include_router(product_routes.router)
api_router.include_router(service_routes.router)
api_router.include_router(message_routes.router)
api_router.include_router(review_routes.router)
api_router.include_router(upload_routes.router)
api_router.include_router(admin_routes.router)
api_router.include_router(report_routes.router)
api_router.include_router(transaction_routes.router)
api_router.include_router(otp_routes.router)
api_router.include_router(stats_routes.router)
api_router.include_router(favorite_routes.router)

app.include_router(api_router)

uploads_dir = Path("/app/backend/uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")