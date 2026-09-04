from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import ProcessingBatch, KernelProcessingBatch, Harvest, InventoryItem, InventoryLedger
from app.schemas import (
    ProcessingBatchCreate, ProcessingBatchResponse,
    KernelProcessingBatchCreate, KernelProcessingBatchResponse
)

router = APIRouter(prefix="/api/processing", tags=["Oil & Kernel Processing"])

# --- CPO Processing ---
@router.get("/cpo-batches", response_model=List[ProcessingBatchResponse])
def get_cpo_batches(db: Session = Depends(get_db)):
    batches = db.query(ProcessingBatch).order_by(ProcessingBatch.date.desc()).all()
    results = []
    for b in batches:
        item = ProcessingBatchResponse.model_validate(b)
        item.harvest_batch_number = b.harvest.batch_number if b.harvest else None
        results.append(item)
    return results

@router.post("/cpo-batches", response_model=ProcessingBatchResponse, status_code=status.HTTP_201_CREATED)
def record_cpo_processing(batch_in: ProcessingBatchCreate, db: Session = Depends(get_db)):
    # Calculate Extraction Rate %
    extraction_rate = (batch_in.cpo_output_litres / batch_in.ffb_input_kg * 100) if batch_in.ffb_input_kg > 0 else 0.0

    count = db.query(ProcessingBatch).count() + 1
    batch_num = f"PB-{datetime.utcnow().strftime('%Y')}-{count:03d}"

    batch = ProcessingBatch(
        batch_number=batch_num,
        date=datetime.utcnow(),
        extraction_rate_percent=round(extraction_rate, 2),
        **batch_in.model_dump()
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)

    # 1. Deduct FFB from Stock
    ffb_item = db.query(InventoryItem).filter(InventoryItem.name.like("%Fresh Fruit Bunches%")).first()
    if ffb_item and ffb_item.current_stock >= batch_in.ffb_input_kg:
        new_ffb_stock = ffb_item.current_stock - batch_in.ffb_input_kg
        ffb_item.current_stock = new_ffb_stock
        db.add(InventoryLedger(
            item_id=ffb_item.id,
            timestamp=datetime.utcnow(),
            change_type="OUT",
            quantity=batch_in.ffb_input_kg,
            balance_after=new_ffb_stock,
            reference_type="Processing",
            reference_id=batch_num,
            notes=f"Processed in batch {batch_num}"
        ))

    # 2. Add CPO to Finished Stock
    cpo_item = db.query(InventoryItem).filter(InventoryItem.name.like("%Crude Palm Oil%")).first()
    if cpo_item:
        new_cpo_stock = cpo_item.current_stock + batch_in.cpo_output_litres
        cpo_item.current_stock = new_cpo_stock
        db.add(InventoryLedger(
            item_id=cpo_item.id,
            timestamp=datetime.utcnow(),
            change_type="IN",
            quantity=batch_in.cpo_output_litres,
            balance_after=new_cpo_stock,
            reference_type="Processing",
            reference_id=batch_num,
            notes=f"Produced from batch {batch_num}"
        ))

    # 3. Add Palm Kernels to Work-in-Progress Stock
    kernel_item = db.query(InventoryItem).filter(InventoryItem.name.like("%Palm Kernels%")).first()
    if kernel_item and batch_in.kernel_output_kg > 0:
        new_kernel_stock = kernel_item.current_stock + batch_in.kernel_output_kg
        kernel_item.current_stock = new_kernel_stock
        db.add(InventoryLedger(
            item_id=kernel_item.id,
            timestamp=datetime.utcnow(),
            change_type="IN",
            quantity=batch_in.kernel_output_kg,
            balance_after=new_kernel_stock,
            reference_type="Processing",
            reference_id=batch_num,
            notes=f"Kernel recovered from batch {batch_num}"
        ))

    db.commit()

    resp = ProcessingBatchResponse.model_validate(batch)
    if batch.harvest:
        resp.harvest_batch_number = batch.harvest.batch_number
    return resp


# --- Kernel Processing ---
@router.get("/kernel-batches", response_model=List[KernelProcessingBatchResponse])
def get_kernel_batches(db: Session = Depends(get_db)):
    batches = db.query(KernelProcessingBatch).order_by(KernelProcessingBatch.date.desc()).all()
    results = []
    for b in batches:
        item = KernelProcessingBatchResponse.model_validate(b)
        item.cpo_batch_number = b.cpo_processing_batch.batch_number if b.cpo_processing_batch else None
        results.append(item)
    return results

@router.post("/kernel-batches", response_model=KernelProcessingBatchResponse, status_code=status.HTTP_201_CREATED)
def record_kernel_processing(batch_in: KernelProcessingBatchCreate, db: Session = Depends(get_db)):
    extraction_rate = (batch_in.pko_output_litres / batch_in.kernel_input_kg * 100) if batch_in.kernel_input_kg > 0 else 0.0

    count = db.query(KernelProcessingBatch).count() + 1
    batch_num = f"KP-{datetime.utcnow().strftime('%Y')}-{count:03d}"

    batch = KernelProcessingBatch(
        batch_number=batch_num,
        date=datetime.utcnow(),
        extraction_rate_percent=round(extraction_rate, 2),
        **batch_in.model_dump()
    )
    db.add(batch)
    db.commit()

    # 1. Deduct Kernels
    kernel_item = db.query(InventoryItem).filter(InventoryItem.name.like("%Palm Kernels%")).first()
    if kernel_item:
        new_k_stock = max(0.0, kernel_item.current_stock - batch_in.kernel_input_kg)
        kernel_item.current_stock = new_k_stock
        db.add(InventoryLedger(
            item_id=kernel_item.id,
            timestamp=datetime.utcnow(),
            change_type="OUT",
            quantity=batch_in.kernel_input_kg,
            balance_after=new_k_stock,
            reference_type="Kernel Processing",
            reference_id=batch_num,
            notes=f"Used in kernel expeller batch {batch_num}"
        ))

    # 2. Add PKO
    pko_item = db.query(InventoryItem).filter(InventoryItem.name.like("%Palm Kernel Oil%")).first()
    if pko_item:
        new_pko_stock = pko_item.current_stock + batch_in.pko_output_litres
        pko_item.current_stock = new_pko_stock
        db.add(InventoryLedger(
            item_id=pko_item.id,
            timestamp=datetime.utcnow(),
            change_type="IN",
            quantity=batch_in.pko_output_litres,
            balance_after=new_pko_stock,
            reference_type="Kernel Processing",
            reference_id=batch_num,
            notes=f"PKO produced from batch {batch_num}"
        ))

    # 3. Add PKC
    pkc_item = db.query(InventoryItem).filter(InventoryItem.name.like("%Palm Kernel Cake%")).first()
    if pkc_item and batch_in.pkc_output_bags > 0:
        new_pkc_stock = pkc_item.current_stock + batch_in.pkc_output_bags
        pkc_item.current_stock = new_pkc_stock
        db.add(InventoryLedger(
            item_id=pkc_item.id,
            timestamp=datetime.utcnow(),
            change_type="IN",
            quantity=batch_in.pkc_output_bags,
            balance_after=new_pkc_stock,
            reference_type="Kernel Processing",
            reference_id=batch_num,
            notes=f"PKC bags produced from batch {batch_num}"
        ))

    db.commit()

    resp = KernelProcessingBatchResponse.model_validate(batch)
    if batch.cpo_processing_batch:
        resp.cpo_batch_number = batch.cpo_processing_batch.batch_number
    return resp
