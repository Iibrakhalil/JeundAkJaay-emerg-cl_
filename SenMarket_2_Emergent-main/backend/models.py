from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone
import uuid


class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password: str  # Will be hashed
    firstName: str
    lastName: str
    phone: str
    location: str
    avatar: str = ""
    rating: float = 0.0
    reviewCount: int = 0
    isVerified: bool = False
    phoneVerified: bool = False
    payoutPhone: Optional[str] = ""
    isAdmin: bool = False
    warnings: int = 0
    whatsappEnabled: bool = True
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    firstName: str
    lastName: str
    phone: str
    location: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    firstName: str
    lastName: str
    phone: str
    location: str
    avatar: str
    rating: float
    reviewCount: int
    isVerified: bool = False
    phoneVerified: bool = False
    payoutPhone: Optional[str] = ""
    isAdmin: bool = False
    warnings: int = 0
    whatsappEnabled: bool = True


class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    titleWo: Optional[str] = ""
    price: float
    category: str
    condition: str
    location: str
    images: List[str] = []
    description: str
    descriptionWo: Optional[str] = ""
    sellerId: str
    sellerName: str
    sellerAvatar: str
    sellerPhone: str = ""
    sellerRating: float
    sellerReviewCount: int
    sellerVerified: bool = False
    rating: float = 0.0
    reviewCount: int = 0
    views: int = 0
    favoritesCount: int = 0
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProductCreate(BaseModel):
    title: str
    titleWo: Optional[str] = ""
    price: float
    category: str
    condition: str
    location: str
    images: List[str]
    description: str
    descriptionWo: Optional[str] = ""


class Service(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    titleWo: Optional[str] = ""
    category: str
    rate: float
    rateType: str  # perHour, perDay, fixed
    location: str
    image: str
    images: List[str] = []
    description: str
    descriptionWo: Optional[str] = ""
    providerId: str
    providerName: str
    providerAvatar: str
    providerPhone: str = ""
    providerRating: float
    providerReviewCount: int
    providerVerified: bool = False
    providerWhatsapp: bool = True
    providerCompletedJobs: int
    rating: float = 0.0
    reviewCount: int = 0
    views: int = 0
    favoritesCount: int = 0
    availability: str
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ServiceCreate(BaseModel):
    title: str
    titleWo: Optional[str] = ""
    category: str
    rate: float
    rateType: str
    location: str
    image: str
    description: str
    descriptionWo: Optional[str] = ""
    availability: str


class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversationId: str
    senderId: str
    senderName: str
    senderAvatar: str
    receiverId: str
    receiverName: str
    receiverAvatar: str
    message: str
    read: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class MessageCreate(BaseModel):
    receiverId: str
    message: str


class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    userName: str
    userAvatar: str
    targetType: str  # product, service, user
    targetId: str
    rating: int
    comment: str
    commentWo: Optional[str] = ""
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ReviewCreate(BaseModel):
    targetType: str
    targetId: str
    rating: int
    comment: str
    commentWo: Optional[str] = ""


class Report(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reporterId: str
    reporterName: str
    reportedUserId: str = ""
    targetType: str  # product, service, user
    targetId: str
    reason: str  # scam, inappropriate, fake, other
    description: str = ""
    status: str = "pending"  # pending, reviewed, resolved
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ReportCreate(BaseModel):
    targetType: str
    targetId: str
    reason: str
    description: str = ""


class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    buyerId: str
    buyerName: str
    sellerId: str
    sellerName: str
    itemType: str  # product, service
    itemId: str
    itemTitle: str
    amount: float
    paymentMethod: str  # wave, orange_money, cash
    deliveryZone: str = ""
    deliveryFee: float = 0.0
    totalAmount: float = 0.0
    sellerConfirmed: bool = False
    buyerConfirmed: bool = False
    isEscrow: bool = False
    autoValidateAt: Optional[datetime] = None
    status: str = "pending"  # pending, paid, shipped, delivered, completed, cancelled, refunded
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TransactionCreate(BaseModel):
    itemType: str
    itemId: str
    paymentMethod: str
    deliveryZone: str = "none" # none, dakar_centre, dakar_banlieue, thies_ville, inter_region


class OTPCode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    phone: str
    code: str
    verified: bool = False
    expiresAt: datetime
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
