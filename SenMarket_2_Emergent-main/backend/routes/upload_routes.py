from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from auth import get_current_user
import os
import uuid
from pathlib import Path

router = APIRouter(prefix="/upload", tags=["upload"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".mov", ".avi", ".webm", ".mkv", ".heic", ".heif"}
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB

# S3 config (optional — falls back to local storage if not set)
S3_BUCKET = os.environ.get("S3_BUCKET")
S3_REGION = os.environ.get("S3_REGION", "eu-west-3")
S3_BASE_URL = os.environ.get("S3_BASE_URL")  # e.g. https://bucket.s3.region.amazonaws.com

# Local fallback
UPLOADS_DIR = Path("/app/backend/uploads")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


def _get_s3_client():
    import boto3
    return boto3.client("s3", region_name=S3_REGION)


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user)
):
    from server import db
    from bson import Binary
    
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {MAX_FILE_SIZE // 1024 // 1024}MB"
        )

    # Map content types
    content_type_map = {
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp",
        ".heic": "image/heic", ".heif": "image/heif",
        ".mp4": "video/mp4", ".mov": "video/quicktime", ".avi": "video/x-msvideo",
        ".webm": "video/webm", ".mkv": "video/x-matroska"
    }
    content_type = content_type_map.get(file_ext, "application/octet-stream")

    # Save to MongoDB via GridFS for large file support (videos)
    from server import fs
    
    grid_in = await fs.upload_from_stream(
        file.filename,
        content,
        metadata={
            "contentType": content_type,
            "ownerId": current_user_id
        }
    )
    
    # Return relative URL that will be handled by our /api/media route
    file_url = f"/api/media/{str(grid_in)}"

    return {"url": file_url}
