from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import Customer, Sale, Payment, InventoryItem, InventoryLedger
from app.schemas import (
    CustomerCreate, CustomerResponse,
    SaleCreate, SaleResponse,
    PaymentCreate, PaymentResponse
)

router = APIRouter(prefix="/api/sales", tags=["Sales, Debt & Payment Logging"])

# --- Customers ---
@router.get("/customers", response_model=List[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    results = []
    for c in customers:
        res = CustomerResponse.model_validate(c)
        # Calculate financial aggregates
        total_p = sum(s.total_amount for s in c.sales)
        total_pd = sum(s.amount_paid for s in c.sales)
        bal_due = sum(s.balance_due for s in c.sales)
        res.total_purchased = total_p
        res.total_paid = total_pd
        res.balance_due = bal_due
        results.append(res)
    return results

@router.post("/customers", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(cust_in: CustomerCreate, db: Session = Depends(get_db)):
    customer = Customer(**cust_in.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return CustomerResponse.model_validate(customer)

# --- Sales Logging ---
@router.get("/records", response_model=List[SaleResponse])
def get_sales(db: Session = Depends(get_db)):
    sales = db.query(Sale).order_by(Sale.date.desc()).all()
    results = []
    for s in sales:
        res = SaleResponse.model_validate(s)
        res.customer_name = s.customer.name if s.customer else "Unknown"
        results.append(res)
    return results

@router.post("/records", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
def record_sale(sale_in: SaleCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == sale_in.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    total_amount = sale_in.quantity * sale_in.unit_price
    amount_paid = min(sale_in.amount_paid, total_amount)
    balance_due = max(0.0, total_amount - amount_paid)

    if balance_due == 0:
        pay_status = "Paid"
    elif amount_paid > 0:
        pay_status = "Partial"
    else:
        pay_status = "Unpaid"

    count = db.query(Sale).count() + 1
    invoice_num = f"SAL-{datetime.utcnow().strftime('%Y')}-{count:03d}"

    sale = Sale(
        invoice_number=invoice_num,
        date=datetime.utcnow(),
        total_amount=total_amount,
        amount_paid=amount_paid,
        balance_due=balance_due,
        payment_status=pay_status,
        **sale_in.model_dump()
    )
    db.add(sale)
    db.commit()
    db.refresh(sale)

    # 1. Deduct Product Stock if item exists in inventory
    inv_item = db.query(InventoryItem).filter(InventoryItem.name.like(f"%{sale_in.product_name}%")).first()
    if inv_item:
        new_stock = max(0.0, inv_item.current_stock - sale_in.quantity)
        inv_item.current_stock = new_stock
        db.add(InventoryLedger(
            item_id=inv_item.id,
            timestamp=datetime.utcnow(),
            change_type="OUT",
            quantity=sale_in.quantity,
            balance_after=new_stock,
            reference_type="Sale",
            reference_id=invoice_num,
            notes=f"Sold to {customer.name}"
        ))

    # 2. Log Payment Record if deposit/payment was made offline
    if amount_paid > 0:
        pay_ref = f"PAY-{datetime.utcnow().strftime('%Y')}-{db.query(Payment).count() + 1:03d}"
        payment = Payment(
            reference=pay_ref,
            date=datetime.utcnow(),
            sale_id=sale.id,
            customer_id=customer.id,
            amount_paid=amount_paid,
            payment_method="Cash",  # default initial payment log
            notes=f"Initial payment log for invoice {invoice_num}"
        )
        db.add(payment)

    db.commit()

    res = SaleResponse.model_validate(sale)
    res.customer_name = customer.name
    return res

# --- Offline Customer Payment Logging ---
@router.get("/payments", response_model=List[PaymentResponse])
def get_payments(db: Session = Depends(get_db)):
    payments = db.query(Payment).order_by(Payment.date.desc()).all()
    results = []
    for p in payments:
        res = PaymentResponse.model_validate(p)
        res.customer_name = p.customer.name if p.customer else None
        res.invoice_number = p.sale.invoice_number if p.sale else None
        results.append(res)
    return results

@router.post("/payments", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def log_customer_payment(pay_in: PaymentCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == pay_in.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    pay_ref = f"PAY-{datetime.utcnow().strftime('%Y')}-{db.query(Payment).count() + 1:03d}"
    
    payment = Payment(
        reference=pay_ref,
        date=datetime.utcnow(),
        **pay_in.model_dump()
    )
    db.add(payment)

    # Apply payment to customer's outstanding unpaid/partial sales
    remaining_payment = pay_in.amount_paid
    if pay_in.sale_id:
        target_sale = db.query(Sale).filter(Sale.id == pay_in.sale_id).first()
        if target_sale and target_sale.balance_due > 0:
            applied = min(remaining_payment, target_sale.balance_due)
            target_sale.amount_paid += applied
            target_sale.balance_due -= applied
            target_sale.payment_status = "Paid" if target_sale.balance_due == 0 else "Partial"
    else:
        unpaid_sales = db.query(Sale).filter(
            Sale.customer_id == customer.id, 
            Sale.balance_due > 0
        ).order_by(Sale.date.asc()).all()

        for s in unpaid_sales:
            if remaining_payment <= 0:
                break
            applied = min(remaining_payment, s.balance_due)
            s.amount_paid += applied
            s.balance_due -= applied
            s.payment_status = "Paid" if s.balance_due == 0 else "Partial"
            remaining_payment -= applied

    db.commit()
    db.refresh(payment)

    res = PaymentResponse.model_validate(payment)
    res.customer_name = customer.name
    if payment.sale:
        res.invoice_number = payment.sale.invoice_number
    return res
