from fastapi import APIRouter, Depends, HTTPException
from models import Message, MessageCreate
from auth import get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
import uuid

router = APIRouter(prefix="/messages", tags=["messages"])


async def get_db():
    from server import db
    return db


@router.get("/conversations", response_model=List[dict])
async def get_conversations(
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Get all messages where user is sender or receiver
    messages = await db.messages.find({
        "$or": [
            {"senderId": current_user_id},
            {"receiverId": current_user_id}
        ]
    }).sort([("timestamp", -1)]).to_list(1000)
    
    # Group by conversation
    conversations = {}
    for msg in messages:
        conv_id = msg["conversationId"]
        if conv_id not in conversations:
            # Determine other user
            if msg["senderId"] == current_user_id:
                other_user = {
                    "id": msg["receiverId"],
                    "name": msg["receiverName"],
                    "avatar": msg["receiverAvatar"]
                }
            else:
                other_user = {
                    "id": msg["senderId"],
                    "name": msg["senderName"],
                    "avatar": msg["senderAvatar"]
                }
            
            conversations[conv_id] = {
                "conversationId": conv_id,
                "otherUser": other_user,
                "lastMessage": msg["message"],
                "timestamp": msg["timestamp"],
                "unread": not msg["read"] and msg["receiverId"] == current_user_id
            }
    
    return list(conversations.values())


@router.get("/conversation/{conversation_id}", response_model=List[Message])
async def get_conversation_messages(
    conversation_id: str,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    messages = await db.messages.find({
        "conversationId": conversation_id,
        "$or": [
            {"senderId": current_user_id},
            {"receiverId": current_user_id}
        ]
    }).sort([("timestamp", 1)]).to_list(1000)
    
    # Mark messages as read
    await db.messages.update_many(
        {
            "conversationId": conversation_id,
            "receiverId": current_user_id,
            "read": False
        },
        {"$set": {"read": True}}
    )
    
    return [Message(**m) for m in messages]


@router.post("/", response_model=Message)
async def send_message(
    message_data: MessageCreate,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Get sender info
    sender = await db.users.find_one({"id": current_user_id})
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")
    
    # Get receiver info
    receiver = await db.users.find_one({"id": message_data.receiverId})
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    # Generate or find conversation ID
    existing_conv = await db.messages.find_one({
        "$or": [
            {"senderId": current_user_id, "receiverId": message_data.receiverId},
            {"senderId": message_data.receiverId, "receiverId": current_user_id}
        ]
    })
    
    conversation_id = existing_conv["conversationId"] if existing_conv else str(uuid.uuid4())
    
    # Create message
    message = Message(
        conversationId=conversation_id,
        senderId=sender["id"],
        senderName=f"{sender['firstName']} {sender['lastName']}",
        senderAvatar=sender["avatar"],
        receiverId=receiver["id"],
        receiverName=f"{receiver['firstName']} {receiver['lastName']}",
        receiverAvatar=receiver["avatar"],
        message=message_data.message
    )
    
    await db.messages.insert_one(message.dict())
    return message


@router.put("/{message_id}/read")
async def mark_as_read(
    message_id: str,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    result = await db.messages.update_one(
        {"id": message_id, "receiverId": current_user_id},
        {"$set": {"read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return {"message": "Message marked as read"}
