from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=True)
    full_name = Column(String, default="Seun")
    role = Column(String, default="view")  # "view" or "edit"
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

class FarmBlock(Base):
    __tablename__ = "farm_blocks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)  # e.g. "Block A", "Block B"
    area_hectares = Column(Float, default=0.0)
    palm_count = Column(Integer, default=0)
    planting_year = Column(Integer, nullable=True)
    status = Column(String, default="Active")

    harvests = relationship("Harvest", back_populates="block")
    expenses = relationship("Expense", back_populates="block")


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)  # e.g. "Fresh Fruit Bunches (FFB)", "Crude Palm Oil (CPO)", "NPK Fertilizer"
    category = Column(String, index=True)  # Raw, Finished, Input, By-Product
    unit = Column(String)  # kg, litres, bags, jerrycans, drums, sacks
    current_stock = Column(Float, default=0.0)
    reorder_level = Column(Float, default=10.0)

    ledgers = relationship("InventoryLedger", back_populates="item")


class InventoryLedger(Base):
    __tablename__ = "inventory_ledgers"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("inventory_items.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    change_type = Column(String)  # IN, OUT
    quantity = Column(Float)
    balance_after = Column(Float)
    reference_type = Column(String)  # Harvest, Processing, Sale, Purchase, Adjustment
    reference_id = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    item = relationship("InventoryItem", back_populates="ledgers")


class Harvest(Base):
    __tablename__ = "harvests"

    id = Column(Integer, primary_key=True, index=True)
    batch_number = Column(String, unique=True, index=True)  # e.g., HV-2026-001
    date = Column(DateTime, default=datetime.utcnow)
    block_id = Column(Integer, ForeignKey("farm_blocks.id"))
    bunch_count = Column(Integer)
    ffb_weight_kg = Column(Float)
    loose_fruit_kg = Column(Float, default=0.0)
    labour_cost = Column(Float, default=0.0)
    transport_cost = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)

    block = relationship("FarmBlock", back_populates="harvests")
    processing_batches = relationship("ProcessingBatch", back_populates="harvest")


class ProcessingBatch(Base):
    __tablename__ = "processing_batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_number = Column(String, unique=True, index=True)  # e.g., PB-2026-001
    date = Column(DateTime, default=datetime.utcnow)
    harvest_id = Column(Integer, ForeignKey("harvests.id"), nullable=True)
    ffb_input_kg = Column(Float)
    cpo_output_litres = Column(Float)
    kernel_output_kg = Column(Float)
    fibre_output_kg = Column(Float, default=0.0)
    shell_output_kg = Column(Float, default=0.0)
    extraction_rate_percent = Column(Float)  # (CPO kg or L / FFB) * 100
    processing_cost = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)

    harvest = relationship("Harvest", back_populates="processing_batches")
    kernel_batches = relationship("KernelProcessingBatch", back_populates="cpo_processing_batch")


class KernelProcessingBatch(Base):
    __tablename__ = "kernel_processing_batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_number = Column(String, unique=True, index=True)  # e.g., KP-2026-001
    date = Column(DateTime, default=datetime.utcnow)
    cpo_processing_batch_id = Column(Integer, ForeignKey("processing_batches.id"), nullable=True)
    kernel_input_kg = Column(Float)
    pko_output_litres = Column(Float)
    pkc_output_bags = Column(Float)
    extraction_rate_percent = Column(Float)
    processing_cost = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)

    cpo_processing_batch = relationship("ProcessingBatch", back_populates="kernel_batches")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    segment = Column(String, default="Direct buyers")  # Direct buyers, Industrial user, Souvenir customers
    preferred_product = Column(String, nullable=True, default="Crude Palm Oil (CPO)")

    sales = relationship("Sale", back_populates="customer")
    payments = relationship("Payment", back_populates="customer")


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)  # e.g., SAL-2026-001
    date = Column(DateTime, default=datetime.utcnow)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    product_name = Column(String)  # CPO, PKO, PKC, FFB, Shells
    quantity = Column(Float)
    unit = Column(String)  # litres, kg, bags, jerrycans
    unit_price = Column(Float)
    total_amount = Column(Float)
    amount_paid = Column(Float, default=0.0)
    balance_due = Column(Float, default=0.0)
    payment_status = Column(String, default="Unpaid")  # Paid, Partial, Unpaid
    notes = Column(Text, nullable=True)

    customer = relationship("Customer", back_populates="sales")
    payments = relationship("Payment", back_populates="sale")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String, unique=True, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    amount_paid = Column(Float)
    payment_method = Column(String, default="Bank Transfer")  # Cash, Bank Transfer, POS
    notes = Column(Text, nullable=True)

    sale = relationship("Sale", back_populates="payments")
    customer = relationship("Customer", back_populates="payments")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, nullable=True)
    supply_type = Column(String, nullable=True)  # Fertilizer, Fuel, Tools, Services

    expenses = relationship("Expense", back_populates="supplier")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    category = Column(String, index=True)  # Labour, Fertilizer, Fuel, Transport, Maintenance, Packaging, Miscellaneous
    description = Column(Text)
    amount = Column(Float)
    payment_method = Column(String, default="Cash")  # Cash, Bank Transfer, POS
    block_id = Column(Integer, ForeignKey("farm_blocks.id"), nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)

    block = relationship("FarmBlock", back_populates="expenses")
    supplier = relationship("Supplier", back_populates="expenses")
