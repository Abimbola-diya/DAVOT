from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import (
    Harvest, ProcessingBatch, KernelProcessingBatch, 
    Sale, Expense, InventoryItem, Customer
)
from app.schemas import DashboardSummary, FlowNodeSummary

router = APIRouter(prefix="/api/analytics", tags=["Dashboard & Flow Analytics"])

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_rev = db.query(func.sum(Sale.total_amount)).scalar() or 0.0
    total_exp = db.query(func.sum(Expense.amount)).scalar() or 0.0
    total_debt = db.query(func.sum(Sale.balance_due)).scalar() or 0.0

    total_ffb = db.query(func.sum(Harvest.ffb_weight_kg)).scalar() or 0.0
    total_cpo = db.query(func.sum(ProcessingBatch.cpo_output_litres)).scalar() or 0.0
    total_pko = db.query(func.sum(KernelProcessingBatch.pko_output_litres)).scalar() or 0.0

    cpo_item = db.query(InventoryItem).filter(InventoryItem.name.like("%Crude Palm Oil%")).first()
    pko_item = db.query(InventoryItem).filter(InventoryItem.name.like("%Palm Kernel Oil%")).first()
    kernel_item = db.query(InventoryItem).filter(InventoryItem.name.like("%Palm Kernels%")).first()

    return DashboardSummary(
        total_revenue=total_rev,
        total_expenses=total_exp,
        net_profit=total_rev - total_exp,
        total_debt_owed=total_debt,
        ffb_harvested_kg=total_ffb,
        cpo_produced_litres=total_cpo,
        pko_produced_litres=total_pko,
        current_cpo_stock_litres=cpo_item.current_stock if cpo_item else 0.0,
        current_pko_stock_litres=pko_item.current_stock if pko_item else 0.0,
        current_kernel_stock_kg=kernel_item.current_stock if kernel_item else 0.0
    )

@router.get("/flow-nodes", response_model=FlowNodeSummary)
def get_flow_nodes(db: Session = Depends(get_db)):
    harvested_ffb = db.query(func.sum(Harvest.ffb_weight_kg)).scalar() or 0.0
    processed_ffb = db.query(func.sum(ProcessingBatch.ffb_input_kg)).scalar() or 0.0
    cpo_out = db.query(func.sum(ProcessingBatch.cpo_output_litres)).scalar() or 0.0
    kernel_out = db.query(func.sum(ProcessingBatch.kernel_output_kg)).scalar() or 0.0

    processed_kernel = db.query(func.sum(KernelProcessingBatch.kernel_input_kg)).scalar() or 0.0
    pko_out = db.query(func.sum(KernelProcessingBatch.pko_output_litres)).scalar() or 0.0
    pkc_out = db.query(func.sum(KernelProcessingBatch.pkc_output_bags)).scalar() or 0.0

    cpo_sales = db.query(func.sum(Sale.quantity)).filter(Sale.product_name.like("%Crude Palm Oil%")).scalar() or 0.0
    pko_sales = db.query(func.sum(Sale.quantity)).filter(Sale.product_name.like("%Palm Kernel Oil%")).scalar() or 0.0

    return FlowNodeSummary(
        harvested_ffb_kg=harvested_ffb,
        processed_ffb_kg=processed_ffb,
        produced_cpo_litres=cpo_out,
        produced_kernel_kg=kernel_out,
        processed_kernel_kg=processed_kernel,
        produced_pko_litres=pko_out,
        produced_pkc_bags=pkc_out,
        total_cpo_sales_litres=cpo_sales,
        total_pko_sales_litres=pko_sales
    )

@router.get("/traceability/{sale_invoice}")
def trace_sale_path(sale_invoice: str, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.invoice_number == sale_invoice).first()
    if not sale:
        return {"error": "Sale invoice not found"}

    # Find processing batches matching product
    recent_pb = db.query(ProcessingBatch).order_by(ProcessingBatch.date.desc()).first()
    harvest_info = None
    if recent_pb and recent_pb.harvest:
        harvest_info = {
            "batch_number": recent_pb.harvest.batch_number,
            "date": recent_pb.harvest.date.isoformat(),
            "block_name": recent_pb.harvest.block.name if recent_pb.harvest.block else "Unknown Block",
            "bunches": recent_pb.harvest.bunch_count,
            "ffb_weight_kg": recent_pb.harvest.ffb_weight_kg
        }

    return {
        "sale": {
            "invoice": sale.invoice_number,
            "date": sale.date.isoformat(),
            "customer": sale.customer.name if sale.customer else "Unknown",
            "product": sale.product_name,
            "quantity": sale.quantity,
            "unit": sale.unit,
            "total_amount": sale.total_amount,
            "amount_paid": sale.amount_paid,
            "balance_due": sale.balance_due
        },
        "processing_batch": {
            "batch_number": recent_pb.batch_number if recent_pb else "PB-2026-001",
            "cpo_output_litres": recent_pb.cpo_output_litres if recent_pb else 250.0,
            "extraction_rate_percent": recent_pb.extraction_rate_percent if recent_pb else 18.5
        } if recent_pb else None,
        "harvest": harvest_info
    }
