from fastapi import APIRouter, Depends, HTTPException
from models import Transaction, TransactionCreate
from auth import get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

router = APIRouter(prefix="/transactions", tags=["transactions"])


async def get_db():
    from server import db
    return db


@router.post("/", response_model=Transaction)
async def create_transaction(
    tx_data: TransactionCreate,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    buyer = await db.users.find_one({"id": current_user_id})
    if not buyer:
        raise HTTPException(status_code=404, detail="User not found")

    # Get item details
    if tx_data.itemType == "product":
        item = await db.products.find_one({"id": tx_data.itemId})
        if not item:
            raise HTTPException(status_code=404, detail="Product not found")
        seller_id = item["sellerId"]
        seller_name = item["sellerName"]
        amount = item["price"]
        item_title = item["title"]
    elif tx_data.itemType == "service":
        item = await db.services.find_one({"id": tx_data.itemId})
        if not item:
            raise HTTPException(status_code=404, detail="Service not found")
        seller_id = item["providerId"]
        seller_name = item["providerName"]
        amount = item["rate"]
        item_title = item["title"]
    else:
        raise HTTPException(status_code=400, detail="Invalid item type")

    # 3. Calculate Delivery Fee
    delivery_fee = 0.0
    # Simple zone map
    ZONE_PRICES = {
        "none": 0.0,
        "dakar_centre": 1000.0,
        "dakar_banlieue": 2000.0,
        "thies_ville": 1000.0,
        "inter_region": 3500.0
    }
    
    # Security: Verify inter-region is actually Dakar <-> Thies
    item_loc = item.get("location", "").lower()
    if tx_data.deliveryZone == "inter_region":
        is_dakar = "dakar" in item_loc
        is_thies = "thies" in item_loc or "thiès" in item_loc
        if not (is_dakar or is_thies):
             raise HTTPException(status_code=400, detail="Livraison inter-régionale limitée à l'axe Dakar-Thiès.")

    delivery_fee = ZONE_PRICES.get(tx_data.deliveryZone, 0.0)
    total_amount = amount + delivery_fee

    # 4. Handle Escrow (Séquestre)
    is_escrow = tx_data.paymentMethod in ["wave", "orange_money"]
    initial_status = "paid" if is_escrow else "pending"

    transaction = Transaction(
        buyerId=current_user_id,
        buyerName=f"{buyer['firstName']} {buyer['lastName']}",
        sellerId=seller_id,
        sellerName=seller_name,
        itemType=tx_data.itemType,
        itemId=tx_data.itemId,
        itemTitle=item_title,
        amount=amount,
        deliveryFee=delivery_fee,
        deliveryZone=tx_data.deliveryZone,
        totalAmount=total_amount,
        paymentMethod=tx_data.paymentMethod,
        isEscrow=is_escrow,
        status=initial_status
    )

    await db.transactions.insert_one(transaction.dict())

    # Notification vendeur via message automatique
    try:
        import uuid as uuid_lib
        from datetime import datetime
        from models import Message

        payment_labels = {
            "wave": "Wave",
            "orange_money": "Orange Money", 
            "cash": "paiement à la livraison" if tx_data.itemType == "product" else "paiement après prestation"
        }
        payment_label = payment_labels.get(tx_data.paymentMethod, tx_data.paymentMethod)
        action = "commande" if tx_data.itemType == "product" else "réservation"

        notif_text = (
            f"Nouvelle {action} ! {buyer['firstName']} {buyer['lastName']} "
            f"souhaite {'acheter' if tx_data.itemType == 'product' else 'réserver'} "
            f'"{item_title}" via {payment_label}. '
            f"Montant total : {total_amount:,.0f} FCFA. "
            f"Contactez-le pour confirmer."
        )

        existing = await db.messages.find_one({
            "$or": [
                {"senderId": current_user_id, "receiverId": seller_id},
                {"senderId": seller_id, "receiverId": current_user_id}
            ]
        })
        conv_id = existing["conversationId"] if existing else str(uuid_lib.uuid4())

        notif_msg = Message(
            conversationId=conv_id,
            senderId=current_user_id,
            senderName=f"{buyer['firstName']} {buyer['lastName']}",
            senderAvatar=buyer.get("avatar", ""),
            receiverId=seller_id,
            receiverName=seller_name,
            receiverAvatar=item.get("sellerAvatar") or item.get("providerAvatar") or "",
            message=notif_text
        )
        await db.messages.insert_one(notif_msg.dict())
    except Exception as e:
        pass  # Notification non bloquante

    return transaction


@router.get("/", response_model=List[Transaction])
async def get_my_transactions(
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    transactions = await db.transactions.find({
        "$or": [
            {"buyerId": current_user_id},
            {"sellerId": current_user_id}
        ]
    }).sort([("createdAt", -1)]).to_list(1000)
    return [Transaction(**t) for t in transactions]


@router.post("/{transaction_id}/confirm-delivery")
async def confirm_delivery(
    transaction_id: str,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    tx = await db.transactions.find_one({"id": transaction_id})
    if not tx or tx["sellerId"] != current_user_id:
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    from datetime import datetime, timedelta, timezone
    auto_validate_at = datetime.now(timezone.utc) + timedelta(hours=48)
    
    await db.transactions.update_one(
        {"id": transaction_id},
        {"$set": {
            "status": "delivered",
            "sellerConfirmed": True,
            "autoValidateAt": auto_validate_at
        }}
    )
    return {"message": "Livraison confirmée. L'acheteur a 48h pour valider la réception."}


@router.post("/{transaction_id}/confirm-receipt")
async def confirm_receipt(
    transaction_id: str,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    tx = await db.transactions.find_one({"id": transaction_id})
    if not tx or tx["buyerId"] != current_user_id:
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    await db.transactions.update_one(
        {"id": transaction_id},
        {"$set": {
            "status": "completed",
            "buyerConfirmed": True
        }}
    )
    return {"message": "Réception confirmée. Les fonds sont libérés pour le vendeur."}


@router.put("/{transaction_id}/status")
async def update_transaction_status(
    transaction_id: str,
    status_data: dict,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    tx = await db.transactions.find_one({"id": transaction_id})
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if tx["sellerId"] != current_user_id and tx["buyerId"] != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    new_status = status_data.get("status")
    allowed_statuses = ["paid", "shipped", "delivered", "completed", "cancelled", "refunded"]
    if new_status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")

    await db.transactions.update_one(
        {"id": transaction_id},
        {"$set": {"status": new_status}}
    )
    return {"message": f"Transaction updated to {new_status}"}


@router.put("/{tx_id}/accept")
async def accept_transaction(
    tx_id: str,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    tx = await db.transactions.find_one({"id": tx_id})
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if tx["sellerId"] != current_user_id:
        raise HTTPException(status_code=403, detail="Seul le vendeur peut accepter")
    if tx["status"] not in ["pending", "paid"]:
        raise HTTPException(status_code=400, detail="Transaction déjà traitée")

    await db.transactions.update_one({"id": tx_id}, {"$set": {"status": "accepted"}})

    # Notifier l'acheteur
    try:
        import uuid as uuid_lib
        from models import Message
        buyer = await db.users.find_one({"id": tx["buyerId"]})
        seller = await db.users.find_one({"id": current_user_id})
        existing = await db.messages.find_one({
            "$or": [
                {"senderId": current_user_id, "receiverId": tx["buyerId"]},
                {"senderId": tx["buyerId"], "receiverId": current_user_id}
            ]
        })
        conv_id = existing["conversationId"] if existing else str(uuid_lib.uuid4())
        action = "commande" if tx["itemType"] == "product" else "réservation"
        msg = Message(
            conversationId=conv_id,
            senderId=current_user_id,
            senderName=tx["sellerName"],
            senderAvatar=seller.get("avatar", "") if seller else "",
            receiverId=tx["buyerId"],
            receiverName=tx["buyerName"],
            receiverAvatar=buyer.get("avatar", "") if buyer else "",
            message=f"Bonne nouvelle ! Votre {action} pour '{tx['itemTitle']}' a été acceptée. Je vous contacterai pour les modalités."
        )
        await db.messages.insert_one(msg.dict())
    except Exception:
        pass

    return {"message": "Commande acceptée"}


@router.put("/{tx_id}/reject")
async def reject_transaction(
    tx_id: str,
    current_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    tx = await db.transactions.find_one({"id": tx_id})
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if tx["sellerId"] != current_user_id:
        raise HTTPException(status_code=403, detail="Seul le vendeur peut refuser")
    if tx["status"] not in ["pending", "paid"]:
        raise HTTPException(status_code=400, detail="Transaction déjà traitée")

    await db.transactions.update_one({"id": tx_id}, {"$set": {"status": "cancelled"}})

    # Notifier l'acheteur
    try:
        import uuid as uuid_lib
        from models import Message
        buyer = await db.users.find_one({"id": tx["buyerId"]})
        seller = await db.users.find_one({"id": current_user_id})
        existing = await db.messages.find_one({
            "$or": [
                {"senderId": current_user_id, "receiverId": tx["buyerId"]},
                {"senderId": tx["buyerId"], "receiverId": current_user_id}
            ]
        })
        conv_id = existing["conversationId"] if existing else str(uuid_lib.uuid4())
        action = "commande" if tx["itemType"] == "product" else "réservation"
        msg = Message(
            conversationId=conv_id,
            senderId=current_user_id,
            senderName=tx["sellerName"],
            senderAvatar=seller.get("avatar", "") if seller else "",
            receiverId=tx["buyerId"],
            receiverName=tx["buyerName"],
            receiverAvatar=buyer.get("avatar", "") if buyer else "",
            message=f"Désolé, votre {action} pour '{tx['itemTitle']}' n'a pas pu être acceptée. N'hésitez pas à me recontacter."
        )
        await db.messages.insert_one(msg.dict())
    except Exception:
        pass

    return {"message": "Commande refusée"}
