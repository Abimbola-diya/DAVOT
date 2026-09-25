from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import InventoryItem, InventoryLedger
from app.schemas import (
    InventoryItemCreate, 
    InventoryItemResponse, 
    InventoryLedgerResponse,
    RecordPurchaseRequest,
    RecordUsageRequest
)

router = APIRouter(prefix="/api/inventory", tags=["Inventory & Ledger"])

@router.get("/items", response_model=List[InventoryItemResponse])
def get_inventory_items(db: Session = Depends(get_db)):
    return db.query(InventoryItem).all()

@router.post("/items", response_model=InventoryItemResponse, status_code=status.HTTP_201_CREATED)
def create_inventory_item(item_in: InventoryItemCreate, db: Session = Depends(get_db)):
    item = InventoryItem(
        name=item_in.name,
        category=item_in.category or "Input",
        unit=item_in.unit,
        current_stock=item_in.current_stock,
        reorder_level=item_in.reorder_level,
        item_type=item_in.item_type or "Other",
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    if item.current_stock > 0:
        ledger = InventoryLedger(
            item_id=item.id,
            change_type="IN",
            quantity=item.current_stock,
            balance_after=item.current_stock,
            reference_type="Opening Stock",
            notes="Initial opening stock recorded"
        )
        db.add(ledger)
        db.commit()

    return item

@router.post("/purchase")
def record_purchase(req: RecordPurchaseRequest, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == req.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.current_stock += req.quantity
    unit_cost = req.cost_per_unit
    if not unit_cost and req.total_cost and req.quantity > 0:
        unit_cost = req.total_cost / req.quantity

    if unit_cost:
        item.last_cost = unit_cost
    if req.date:
        item.last_purchased_date = req.date
    else:
        item.last_purchased_date = datetime.utcnow().strftime("%d %b %Y")

    ledger = InventoryLedger(
        item_id=item.id,
        change_type="IN",
        quantity=req.quantity,
        balance_after=item.current_stock,
        reference_type="Purchase",
        notes=req.notes or (f"Purchased from {req.supplier}" if req.supplier else "Recorded Purchase"),
        unit_cost=unit_cost,
        total_cost=req.total_cost or (unit_cost * req.quantity if unit_cost else None)
    )
    db.add(ledger)
    db.commit()
    db.refresh(item)
    return {"status": "success", "new_stock": item.current_stock}

@router.post("/usage")
def record_usage(req: RecordUsageRequest, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == req.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.current_stock = max(0.0, item.current_stock - req.quantity)

    ledger = InventoryLedger(
        item_id=item.id,
        change_type="OUT",
        quantity=req.quantity,
        balance_after=item.current_stock,
        reference_type="Usage",
        notes=req.notes or (f"Used on {req.block_name}" if req.block_name else "Recorded Usage")
    )
    db.add(ledger)
    db.commit()
    db.refresh(item)
    return {"status": "success", "new_stock": item.current_stock}

@router.get("/ledger", response_model=List[InventoryLedgerResponse])
def get_inventory_ledger(db: Session = Depends(get_db)):
    ledgers = db.query(InventoryLedger).order_by(InventoryLedger.timestamp.desc()).limit(100).all()
    results = []
    for l in ledgers:
        res = InventoryLedgerResponse.model_validate(l)
        res.item_name = l.item.name if l.item else "Unknown"
        res.unit = l.item.unit if l.item else ""
        res.unit_cost = l.unit_cost
        res.total_cost = l.total_cost
        results.append(res)
    return results
