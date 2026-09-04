from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import InventoryItem, InventoryLedger
from app.schemas import InventoryItemCreate, InventoryItemResponse, InventoryLedgerResponse

router = APIRouter(prefix="/api/inventory", tags=["Inventory & Ledger"])

@router.get("/items", response_model=List[InventoryItemResponse])
def get_inventory_items(db: Session = Depends(get_db)):
    return db.query(InventoryItem).all()

@router.post("/items", response_model=InventoryItemResponse, status_code=status.HTTP_201_CREATED)
def create_inventory_item(item_in: InventoryItemCreate, db: Session = Depends(get_db)):
    item = InventoryItem(**item_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.get("/ledger", response_model=List[InventoryLedgerResponse])
def get_inventory_ledger(db: Session = Depends(get_db)):
    ledgers = db.query(InventoryLedger).order_by(InventoryLedger.timestamp.desc()).limit(100).all()
    results = []
    for l in ledgers:
        res = InventoryLedgerResponse.model_validate(l)
        res.item_name = l.item.name if l.item else "Unknown"
        res.unit = l.item.unit if l.item else ""
        results.append(res)
    return results
