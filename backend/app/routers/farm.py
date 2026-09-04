from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import FarmBlock, Harvest, InventoryItem, InventoryLedger
from app.schemas import (
    FarmBlockCreate, FarmBlockResponse, 
    HarvestCreate, HarvestResponse
)

router = APIRouter(prefix="/api/farm", tags=["Farm & Harvests"])

# --- Blocks ---
@router.get("/blocks", response_model=List[FarmBlockResponse])
def get_blocks(db: Session = Depends(get_db)):
    return db.query(FarmBlock).all()

@router.post("/blocks", response_model=FarmBlockResponse, status_code=status.HTTP_201_CREATED)
def create_block(block_in: FarmBlockCreate, db: Session = Depends(get_db)):
    db_block = FarmBlock(**block_in.model_dump())
    db.add(db_block)
    db.commit()
    db.refresh(db_block)
    return db_block

# --- Harvests ---
@router.get("/harvests", response_model=List[HarvestResponse])
def get_harvests(db: Session = Depends(get_db)):
    harvests = db.query(Harvest).order_by(Harvest.date.desc()).all()
    results = []
    for h in harvests:
        item = HarvestResponse.model_validate(h)
        item.block_name = h.block.name if h.block else None
        results.append(item)
    return results

@router.post("/harvests", response_model=HarvestResponse, status_code=status.HTTP_201_CREATED)
def record_harvest(harvest_in: HarvestCreate, db: Session = Depends(get_db)):
    block = db.query(FarmBlock).filter(FarmBlock.id == harvest_in.block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Farm block not found")

    # Generate batch number (HV-YYYY-XXX)
    count = db.query(Harvest).count() + 1
    batch_num = f"HV-{datetime.utcnow().strftime('%Y')}-{count:03d}"

    harvest = Harvest(
        batch_number=batch_num,
        date=datetime.utcnow(),
        **harvest_in.model_dump()
    )
    db.add(harvest)
    db.commit()
    db.refresh(harvest)

    # Automatically add to FFB Inventory & Record Ledger
    ffb_item = db.query(InventoryItem).filter(InventoryItem.name.like("%Fresh Fruit Bunches%")).first()
    if ffb_item:
        new_stock = ffb_item.current_stock + harvest_in.ffb_weight_kg
        ffb_item.current_stock = new_stock

        ledger = InventoryLedger(
            item_id=ffb_item.id,
            timestamp=datetime.utcnow(),
            change_type="IN",
            quantity=harvest_in.ffb_weight_kg,
            balance_after=new_stock,
            reference_type="Harvest",
            reference_id=batch_num,
            notes=f"Harvested from {block.name} ({harvest_in.bunch_count} bunches)"
        )
        db.add(ledger)
        db.commit()

    resp = HarvestResponse.model_validate(harvest)
    resp.block_name = block.name
    return resp
