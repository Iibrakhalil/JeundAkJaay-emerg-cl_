import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

async def repair_database():
    # Load environment variables
    root_dir = Path(__file__).parent.parent
    load_dotenv(root_dir / '.env')
    
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    if not mongo_url or not db_name:
        print("Error: MONGO_URL or DB_NAME not found in .env")
        return

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"Connected to database: {db_name}")
    
    # 1. Update Products
    print("Updating products...")
    products = await db.products.find().to_list(1000)
    for product in products:
        seller_id = product.get('sellerId')
        if seller_id:
            user = await db.users.find_one({"id": seller_id})
            if user:
                await db.products.update_one(
                    {"id": product['id']},
                    {"$set": {
                        "sellerPhone": user.get('phone', ""),
                        "sellerVerified": user.get('isVerified', False)
                    }}
                )
                print(f"Updated product {product['id']} with phone {user.get('phone')}")

    # 2. Update Services
    print("Updating services...")
    services = await db.services.find().to_list(1000)
    for service in services:
        provider_id = service.get('providerId')
        if provider_id:
            user = await db.users.find_one({"id": provider_id})
            if user:
                await db.services.update_one(
                    {"id": service['id']},
                    {"$set": {
                        "providerPhone": user.get('phone', ""),
                        "providerVerified": user.get('isVerified', False)
                    }}
                )
                print(f"Updated service {service['id']} with phone {user.get('phone')}")

    print("Database repair complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(repair_database())
