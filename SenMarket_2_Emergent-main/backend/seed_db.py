"""
Seed database with initial data from mock data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from auth import get_password_hash

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


async def seed_database():
    from server import db
    print("Seeding database...")
    
    # Don't clear - only seed if empty
    users_count = await db.users.count_documents({})
    if users_count > 1:  # admin already seeded
        print("Database already has data, skipping seed")
        return
    
    # Create users
    users = [
        {
            "id": "u1",
            "email": "mamadou@test.com",
            "password": get_password_hash("password123"),
            "firstName": "Mamadou",
            "lastName": "Diop",
            "phone": "+221 77 123 4567",
            "location": "Dakar, Plateau",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Mamadou",
            "rating": 4.8,
            "reviewCount": 24
        },
        {
            "id": "u2",
            "email": "aissatou@test.com",
            "password": get_password_hash("password123"),
            "firstName": "Aïssatou",
            "lastName": "Fall",
            "phone": "+221 77 234 5678",
            "location": "Dakar, Médina",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Aissatou",
            "rating": 4.9,
            "reviewCount": 31
        },
        {
            "id": "u3",
            "email": "ousmane@test.com",
            "password": get_password_hash("password123"),
            "firstName": "Ousmane",
            "lastName": "Seck",
            "phone": "+221 77 345 6789",
            "location": "Dakar, Almadies",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ousmane",
            "rating": 4.7,
            "reviewCount": 18
        },
        {
            "id": "u4",
            "email": "fatou@test.com",
            "password": get_password_hash("password123"),
            "firstName": "Fatou",
            "lastName": "Sarr",
            "phone": "+221 77 456 7890",
            "location": "Thiès",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou",
            "rating": 4.6,
            "reviewCount": 15
        },
        {
            "id": "u5",
            "email": "khady@test.com",
            "password": get_password_hash("password123"),
            "firstName": "Khady",
            "lastName": "Ndiaye",
            "phone": "+221 77 567 8901",
            "location": "Dakar, Sicap",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Khady",
            "rating": 5.0,
            "reviewCount": 8
        }
    ]
    
    await db.users.insert_many(users)
    print(f"✅ Created {len(users)} users")
    
    # Create products
    products = [
        {
            "id": "1",
            "title": "iPhone 12 Pro - Comme neuf",
            "titleWo": "iPhone 12 Pro - Ni bees",
            "price": 275000,
            "category": "electronics",
            "condition": "likeNew",
            "location": "Dakar, Plateau",
            "images": ["https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800", "https://images.unsplash.com/photo-1603791239531-10748d0ba08d?w=800"],
            "description": "iPhone 12 Pro 128GB en excellent état, avec boîte et accessoires d'origine. Batterie à 92%. Aucune rayure.",
            "descriptionWo": "iPhone 12 Pro 128GB, njëg baaxul. Am na boîte ak accessoires. Batterie 92%.",
            "sellerId": "u1",
            "sellerName": "Mamadou Diop",
            "sellerAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Mamadou",
            "sellerRating": 4.8,
            "sellerReviewCount": 24
        },
        {
            "id": "2",
            "title": "Robe africaine traditionnelle",
            "titleWo": "Njul bu afrik bu jëkk",
            "price": 15000,
            "category": "fashion",
            "condition": "good",
            "location": "Dakar, Médina",
            "images": ["https://images.pexels.com/photos/2170387/pexels-photo-2170387.jpeg?w=800", "https://images.pexels.com/photos/1625775/pexels-photo-1625775.jpeg?w=800"],
            "description": "Belle robe traditionnelle en wax, taille M. Portée 2 fois seulement.",
            "descriptionWo": "Njul bu rafet ci wax, taille M. Yere ñaar bës rekk.",
            "sellerId": "u2",
            "sellerName": "Aïssatou Fall",
            "sellerAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Aissatou",
            "sellerRating": 4.9,
            "sellerReviewCount": 31
        },
        {
            "id": "3",
            "title": "Canapé 3 places - État neuf",
            "titleWo": "Kanape 3 places - Bees",
            "price": 120000,
            "category": "home",
            "condition": "likeNew",
            "location": "Dakar, Almadies",
            "images": ["https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?w=800", "https://images.pexels.com/photos/245208/pexels-photo-245208.jpeg?w=800"],
            "description": "Canapé moderne 3 places en très bon état. Couleur gris clair, très confortable.",
            "descriptionWo": "Kanape bees 3 places. Mëlni gri, rafet na.",
            "sellerId": "u3",
            "sellerName": "Ousmane Seck",
            "sellerAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ousmane",
            "sellerRating": 4.7,
            "sellerReviewCount": 18
        },
        {
            "id": "4",
            "title": "Laptop HP Pavilion i5",
            "titleWo": "Ordinateur HP Pavilion i5",
            "price": 180000,
            "category": "electronics",
            "condition": "good",
            "location": "Thiès",
            "images": ["https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?w=800", "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800"],
            "description": "HP Pavilion i5, 8GB RAM, 256GB SSD. Parfait pour études et bureau. Windows 11.",
            "descriptionWo": "HP Pavilion i5, 8GB RAM, 256GB SSD. Baax na ci jàng ak liggéey. Windows 11.",
            "sellerId": "u4",
            "sellerName": "Fatou Sarr",
            "sellerAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou",
            "sellerRating": 4.6,
            "sellerReviewCount": 15
        },
        {
            "id": "5",
            "title": "Poussette bébé + siège auto",
            "titleWo": "Poussette bebé + siège auto",
            "price": 45000,
            "category": "kids",
            "condition": "good",
            "location": "Dakar, Sicap",
            "images": ["https://images.pexels.com/photos/6849259/pexels-photo-6849259.jpeg?w=800"],
            "description": "Ensemble poussette et siège auto pour bébé. Bon état, propre.",
            "descriptionWo": "Poussette ak siège auto bu bebé. Njëg baaxul, sedd.",
            "sellerId": "u5",
            "sellerName": "Khady Ndiaye",
            "sellerAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Khady",
            "sellerRating": 5.0,
            "sellerReviewCount": 8
        }
    ]
    
    await db.products.insert_many(products)
    print(f"✅ Created {len(products)} products")
    
    # Create services
    services = [
        {
            "id": "s1",
            "title": "Service de ménage professionnel",
            "titleWo": "Liggéey sedd bu professionnel",
            "category": "cleaning",
            "rate": 5000,
            "rateType": "perHour",
            "location": "Dakar",
            "image": "https://images.pexels.com/photos/48889/cleaning-washing-cleanup-the-ilo-48889.jpeg?w=800",
            "description": "Service de ménage complet pour maisons et appartements. Produits inclus. Équipe professionnelle et discrète.",
            "descriptionWo": "Liggéey sedd bu baax ci kër. Produit am. Équipe professionnelle.",
            "providerId": "p1",
            "providerName": "Aminata Cissé",
            "providerAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Aminata",
            "providerRating": 4.9,
            "providerReviewCount": 47,
            "providerCompletedJobs": 132,
            "availability": "Disponible du lundi au samedi"
        },
        {
            "id": "s2",
            "title": "Bricolage & Réparations",
            "titleWo": "Brikolaj & Réparations",
            "category": "handyman",
            "rate": 15000,
            "rateType": "perDay",
            "location": "Dakar, Rufisque",
            "image": "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?w=800",
            "description": "Tous travaux de bricolage : plomberie, électricité, menuiserie, peinture. 15 ans d'expérience.",
            "descriptionWo": "Liggéey brikolaj yépp : plomberie, électricité, menuiserie, peinture. 15 at ci liggéey.",
            "providerId": "p2",
            "providerName": "Ibrahima Sy",
            "providerAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ibrahima",
            "providerRating": 4.8,
            "providerReviewCount": 63,
            "providerCompletedJobs": 210,
            "availability": "Disponible tous les jours"
        },
        {
            "id": "s3",
            "title": "Livraison rapide Dakar",
            "titleWo": "Yoon gaaw ci Dakar",
            "category": "delivery",
            "rate": 2000,
            "rateType": "fixed",
            "location": "Dakar",
            "image": "https://images.pexels.com/photos/4391478/pexels-photo-4391478.jpeg?w=800",
            "description": "Service de livraison rapide dans tout Dakar. Colis, courses, documents. Moto et voiture disponibles.",
            "descriptionWo": "Yoon gaaw ci Dakar lépp. Colis, courses, documents. Moto ak voiture.",
            "providerId": "p3",
            "providerName": "Moussa Diouf",
            "providerAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Moussa",
            "providerRating": 4.7,
            "providerReviewCount": 89,
            "providerCompletedJobs": 345,
            "availability": "24/7"
        }
    ]
    
    await db.services.insert_many(services)
    print(f"✅ Created {len(services)} services")
    
    # Create some reviews
    reviews = [
        {
            "id": "r1",
            "userId": "u7",
            "userName": "Seydou Kane",
            "userAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Seydou",
            "targetType": "product",
            "targetId": "1",
            "rating": 5,
            "comment": "Excellent service, très professionnel. Je recommande vivement !",
            "commentWo": "Liggéey bu baax, professionnel na lool. Waar nga !"
        },
        {
            "id": "r2",
            "userId": "u8",
            "userName": "Awa Diagne",
            "userAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Awa",
            "targetType": "product",
            "targetId": "2",
            "rating": 4,
            "comment": "Très satisfaite, produit conforme à la description.",
            "commentWo": "Kontaan na, alal ni xamlekat."
        }
    ]
    
    await db.reviews.insert_many(reviews)
    print(f"✅ Created {len(reviews)} reviews")
    
    print("✅ Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed_database())
