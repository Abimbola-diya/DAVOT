from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

# --- Auth Schemas ---
class UserLogin(BaseModel):
    email: str
    password: Optional[str] = None
    role: str = "view"  # "view" or "edit"

class GoogleAuthLogin(BaseModel):
    token: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    role: str = "view"

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    model_config = ConfigDict(from_attributes=True)

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Farm Block Schemas ---
class FarmBlockBase(BaseModel):
    name: str
    area_hectares: float
    palm_count: int
    planting_year: Optional[int] = None
    status: str = "Active"

class FarmBlockCreate(FarmBlockBase):
    pass

class FarmBlockResponse(FarmBlockBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class InventoryItemBase(BaseModel):
    name: str
    category: str = "Input"
    unit: str
    current_stock: float = 0.0
    reorder_level: float = 10.0
    item_type: Optional[str] = "Other"
    last_purchased_date: Optional[str] = None
    last_cost: Optional[float] = None

class InventoryItemCreate(BaseModel):
    name: str
    item_type: str = "Other"
    unit: str
    current_stock: float = 0.0
    reorder_level: float = 5.0
    category: str = "Input"

class InventoryItemResponse(InventoryItemBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class RecordPurchaseRequest(BaseModel):
    item_id: int
    quantity: float
    total_cost: Optional[float] = None
    cost_per_unit: Optional[float] = None
    supplier: Optional[str] = None
    date: Optional[str] = None
    notes: Optional[str] = None

class RecordUsageRequest(BaseModel):
    item_id: int
    quantity: float
    block_name: Optional[str] = None
    date: Optional[str] = None
    notes: Optional[str] = None

class InventoryLedgerResponse(BaseModel):
    id: int
    item_id: int
    timestamp: datetime
    change_type: str
    quantity: float
    balance_after: float
    reference_type: str
    reference_id: Optional[str] = None
    notes: Optional[str] = None
    item_name: Optional[str] = None
    unit: Optional[str] = None
    unit_cost: Optional[float] = None
    total_cost: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


# --- Harvest Schemas ---
class HarvestCreate(BaseModel):
    block_id: int
    bunch_count: int
    ffb_weight_kg: float
    loose_fruit_kg: float = 0.0
    labour_cost: float = 0.0
    transport_cost: float = 0.0
    notes: Optional[str] = None

class HarvestResponse(HarvestCreate):
    id: int
    batch_number: str
    date: datetime
    block_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# --- Processing Batch Schemas ---
class ProcessingBatchCreate(BaseModel):
    harvest_id: Optional[int] = None
    ffb_input_kg: float
    cpo_output_litres: float
    kernel_output_kg: float
    fibre_output_kg: float = 0.0
    shell_output_kg: float = 0.0
    processing_cost: float = 0.0
    notes: Optional[str] = None

class ProcessingBatchResponse(ProcessingBatchCreate):
    id: int
    batch_number: str
    date: datetime
    extraction_rate_percent: float
    harvest_batch_number: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# --- Kernel Processing Batch Schemas ---
class KernelProcessingBatchCreate(BaseModel):
    cpo_processing_batch_id: Optional[int] = None
    kernel_input_kg: float
    pko_output_litres: float
    pkc_output_bags: float
    processing_cost: float = 0.0
    notes: Optional[str] = None

class KernelProcessingBatchResponse(KernelProcessingBatchCreate):
    id: int
    batch_number: str
    date: datetime
    extraction_rate_percent: float
    cpo_batch_number: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# --- Customer & Sales Schemas ---
class CustomerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    location: Optional[str] = None
    segment: str = "Direct buyers"
    preferred_product: Optional[str] = "Crude Palm Oil (CPO)"

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    total_purchased: float = 0.0
    total_paid: float = 0.0
    balance_due: float = 0.0
    model_config = ConfigDict(from_attributes=True)

class SaleCreate(BaseModel):
    customer_id: int
    product_name: str
    quantity: float
    unit: str
    unit_price: float
    amount_paid: float = 0.0
    notes: Optional[str] = None

class SaleResponse(BaseModel):
    id: int
    invoice_number: str
    date: datetime
    customer_id: int
    customer_name: Optional[str] = None
    product_name: str
    quantity: float
    unit: str
    unit_price: float
    total_amount: float
    amount_paid: float
    balance_due: float
    payment_status: str
    notes: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class PaymentCreate(BaseModel):
    sale_id: Optional[int] = None
    customer_id: int
    amount_paid: float
    payment_method: str = "Bank Transfer"
    notes: Optional[str] = None

class PaymentResponse(PaymentCreate):
    id: int
    reference: str
    date: datetime
    customer_name: Optional[str] = None
    invoice_number: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# --- Expense Schemas ---
class ExpenseCreate(BaseModel):
    category: str
    description: str
    amount: float
    payment_method: str = "Cash"
    block_id: Optional[int] = None
    supplier_id: Optional[int] = None

class ExpenseResponse(ExpenseCreate):
    id: int
    date: datetime
    block_name: Optional[str] = None
    supplier_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# --- Supplier Schemas ---
class SupplierBase(BaseModel):
    name: str
    phone: Optional[str] = None
    supply_type: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierResponse(SupplierBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# --- Dashboard / Flow Analytics Schemas ---
class DashboardSummary(BaseModel):
    total_revenue: float
    total_expenses: float
    net_profit: float
    total_debt_owed: float
    ffb_harvested_kg: float
    cpo_produced_litres: float
    pko_produced_litres: float
    current_cpo_stock_litres: float
    current_pko_stock_litres: float
    current_kernel_stock_kg: float

class FlowNodeSummary(BaseModel):
    harvested_ffb_kg: float
    processed_ffb_kg: float
    produced_cpo_litres: float
    produced_kernel_kg: float
    processed_kernel_kg: float
    produced_pko_litres: float
    produced_pkc_bags: float
    total_cpo_sales_litres: float
    total_pko_sales_litres: float
