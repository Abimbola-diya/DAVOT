from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import Expense, Supplier, FarmBlock, InventoryItem, InventoryLedger
from app.schemas import (
    ExpenseCreate, ExpenseResponse,
    SupplierCreate, SupplierResponse
)

router = APIRouter(prefix="/api/expenses", tags=["Expenses & Suppliers"])

# --- Suppliers ---
@router.get("/suppliers", response_model=List[SupplierResponse])
def get_suppliers(db: Session = Depends(get_db)):
    return db.query(Supplier).all()

@router.post("/suppliers", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier(sup_in: SupplierCreate, db: Session = Depends(get_db)):
    sup = Supplier(**sup_in.model_dump())
    db.add(sup)
    db.commit()
    db.refresh(sup)
    return sup

# --- Expenses ---
@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(db: Session = Depends(get_db)):
    expenses = db.query(Expense).order_by(Expense.date.desc()).all()
    results = []
    for e in expenses:
        res = ExpenseResponse.model_validate(e)
        res.block_name = e.block.name if e.block else None
        res.supplier_name = e.supplier.name if e.supplier else None
        results.append(res)
    return results

@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def record_expense(exp_in: ExpenseCreate, db: Session = Depends(get_db)):
    expense = Expense(
        date=datetime.utcnow(),
        **exp_in.model_dump()
    )
    db.add(expense)

    # If expense is for input purchase (e.g. Fertilizer, Fuel), auto-increment stock
    if exp_in.category in ["Fertilizer", "Fuel", "Chemicals"]:
        target_name = "Fertilizer" if exp_in.category == "Fertilizer" else "Fuel"
        inv_item = db.query(InventoryItem).filter(InventoryItem.name.like(f"%{target_name}%")).first()
        if inv_item:
            # Estimate quantity added from description or add 1 bag/unit default ledger entry
            db.add(InventoryLedger(
                item_id=inv_item.id,
                timestamp=datetime.utcnow(),
                change_type="IN",
                quantity=10.0,
                balance_after=inv_item.current_stock + 10.0,
                reference_type="Purchase",
                reference_id=f"EXP-{expense.id}",
                notes=f"Purchased: {exp_in.description}"
            ))

    db.commit()
    db.refresh(expense)

    res = ExpenseResponse.model_validate(expense)
    if expense.block:
        res.block_name = expense.block.name
    if expense.supplier:
        res.supplier_name = expense.supplier.name
    return res
