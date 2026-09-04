import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timedelta
from app.models import (
    Base, FarmBlock, InventoryItem, InventoryLedger, Harvest, 
    ProcessingBatch, KernelProcessingBatch, Customer, Sale, Payment, Expense, Supplier
)

# Use SQLite database in backend directory
DATABASE_URL = "sqlite:///" + os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "davot.db"))

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db_and_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if DB is already seeded
        if db.query(FarmBlock).count() > 0:
            db.close()
            return

        print("Seeding initial farm operational data...")

        # 1. Seed Farm Blocks
        block_a = FarmBlock(name="Block A", area_hectares=4.5, palm_count=620, planting_year=2018, status="Active")
        block_b = FarmBlock(name="Block B", area_hectares=6.0, palm_count=850, planting_year=2016, status="Active")
        block_c = FarmBlock(name="Block C", area_hectares=3.5, palm_count=480, planting_year=2020, status="Active")
        db.add_all([block_a, block_b, block_c])
        db.commit()

        # 2. Seed Inventory Items
        ffb_item = InventoryItem(name="Fresh Fruit Bunches (FFB)", category="Raw", unit="kg", current_stock=1850.0, reorder_level=500.0)
        cpo_item = InventoryItem(name="Crude Palm Oil (CPO)", category="Finished", unit="litres", current_stock=640.0, reorder_level=100.0)
        kernel_item = InventoryItem(name="Palm Kernels", category="Work-in-Progress", unit="kg", current_stock=320.0, reorder_level=50.0)
        pko_item = InventoryItem(name="Palm Kernel Oil (PKO)", category="Finished", unit="litres", current_stock=210.0, reorder_level=50.0)
        pkc_item = InventoryItem(name="Palm Kernel Cake (PKC)", category="Finished", unit="bags", current_stock=25.0, reorder_level=5.0)
        npk_item = InventoryItem(name="NPK 15-15-15 Fertilizer", category="Input", unit="bags", current_stock=18.0, reorder_level=5.0)
        fuel_item = InventoryItem(name="Diesel (Engine/Tractor Fuel)", category="Input", unit="litres", current_stock=120.0, reorder_level=30.0)
        
        db.add_all([ffb_item, cpo_item, kernel_item, pko_item, pkc_item, npk_item, fuel_item])
        db.commit()

        # 3. Seed Suppliers & Customers
        sup_agro = Supplier(name="ABC Agro Chemicals Ltd", phone="08031234567", supply_type="Fertilizer & Chemicals")
        sup_fuel = Supplier(name="TotalEnergies Filling Station", phone="08029876543", supply_type="Fuel & Diesel")
        db.add_all([sup_agro, sup_fuel])
        db.commit()

        cust_adebayo = Customer(name="Mrs. Adebayo (Retail)", phone="08055551122", location="Main Market, Benin", segment="Direct buyers", preferred_product="Crude Palm Oil (CPO)")
        cust_soap_co = Customer(name="Kofo Soap Industries Ltd", phone="08022223344", location="Industrial Layout, Aba", segment="Industrial user", preferred_product="Palm Kernel Oil (PKO)")
        cust_trader = Customer(name="Alhaji Musa Oil Depot", phone="08066667788", location="Milverton, Aba", segment="Souvenir customers", preferred_product="Fresh Fruit Bunches (FFB)")
        db.add_all([cust_adebayo, cust_soap_co, cust_trader])
        db.commit()

        # 4. Seed Harvest Records
        today = datetime.utcnow()
        hv1 = Harvest(
            batch_number="HV-2026-001",
            date=today - timedelta(days=5),
            block_id=block_b.id,
            bunch_count=48,
            ffb_weight_kg=1350.0,
            loose_fruit_kg=45.0,
            labour_cost=25000.0,
            transport_cost=10000.0,
            notes="Mature harvest from Block B. High fruit ripeness."
        )
        hv2 = Harvest(
            batch_number="HV-2026-002",
            date=today - timedelta(days=2),
            block_id=block_a.id,
            bunch_count=36,
            ffb_weight_kg=980.0,
            loose_fruit_kg=30.0,
            labour_cost=20000.0,
            transport_cost=8000.0,
            notes="Block A harvest after recent weeding."
        )
        db.add_all([hv1, hv2])
        db.commit()

        # 5. Seed Processing Batches
        pb1 = ProcessingBatch(
            batch_number="PB-2026-001",
            date=today - timedelta(days=4),
            harvest_id=hv1.id,
            ffb_input_kg=1350.0,
            cpo_output_litres=250.0,
            kernel_output_kg=95.0,
            fibre_output_kg=180.0,
            shell_output_kg=85.0,
            extraction_rate_percent=18.52,  # (250/1350)*100
            processing_cost=15000.0,
            notes="Good extraction efficiency using hydraulic press."
        )
        db.add_all([pb1])
        db.commit()

        # 6. Seed Kernel Processing Batch
        kp1 = KernelProcessingBatch(
            batch_number="KP-2026-001",
            date=today - timedelta(days=3),
            cpo_processing_batch_id=pb1.id,
            kernel_input_kg=75.0,
            pko_output_litres=32.0,
            pkc_output_bags=2.5,
            extraction_rate_percent=42.66,
            processing_cost=8000.0,
            notes="Expeller pressed clean palm kernels."
        )
        db.add_all([kp1])
        db.commit()

        # 7. Seed Sales with Outstanding Receivables (Money Owed)
        sale1 = Sale(
            invoice_number="SAL-2026-001",
            date=today - timedelta(days=3),
            customer_id=cust_soap_co.id,
            product_name="Crude Palm Oil (CPO)",
            quantity=150.0,
            unit="litres",
            unit_price=1500.0,
            total_amount=225000.0,
            amount_paid=150000.0,
            balance_due=75000.0,
            payment_status="Partial",
            notes="Sold 150L CPO. Paid 150k deposit by bank transfer; 75k balance pending."
        )
        sale2 = Sale(
            invoice_number="SAL-2026-002",
            date=today - timedelta(days=1),
            customer_id=cust_adebayo.id,
            product_name="Crude Palm Oil (CPO)",
            quantity=40.0,
            unit="litres",
            unit_price=1600.0,
            total_amount=64000.0,
            amount_paid=64000.0,
            balance_due=0.0,
            payment_status="Paid",
            notes="2 Jerrycans (20L each). Fully paid via POS cash transfer."
        )
        sale3 = Sale(
            invoice_number="SAL-2026-003",
            date=today,
            customer_id=cust_trader.id,
            product_name="Palm Kernel Oil (PKO)",
            quantity=100.0,
            unit="litres",
            unit_price=1800.0,
            total_amount=180000.0,
            amount_paid=100000.0,
            balance_due=80000.0,
            payment_status="Partial",
            notes="Bulk PKO purchase. 80,000 Naira outstanding."
        )
        db.add_all([sale1, sale2, sale3])
        db.commit()

        # 8. Seed Payment Record
        pay1 = Payment(
            reference="PAY-2026-001",
            date=today - timedelta(days=3),
            sale_id=sale1.id,
            customer_id=cust_soap_co.id,
            amount_paid=150000.0,
            payment_method="Bank Transfer",
            notes="Initial deposit payment via GTBank transfer."
        )
        db.add_all([pay1])
        db.commit()

        # 9. Seed Expenses
        exp1 = Expense(
            date=today - timedelta(days=6),
            category="Fertilizer",
            description="Purchased 10 bags of NPK 15-15-15 fertilizer for Block B",
            amount=420000.0,
            payment_method="Bank Transfer",
            block_id=block_b.id,
            supplier_id=sup_agro.id
        )
        exp2 = Expense(
            date=today - timedelta(days=4),
            category="Labour",
            description="Harvesting & Ring weeding labour payment for Block B",
            amount=35000.0,
            payment_method="Cash",
            block_id=block_b.id
        )
        exp3 = Expense(
            date=today - timedelta(days=2),
            category="Fuel",
            description="50 Litres Diesel for processing generator & tractor",
            amount=65000.0,
            payment_method="POS",
            supplier_id=sup_fuel.id
        )
        db.add_all([exp1, exp2, exp3])
        db.commit()

        # 10. Seed Initial Inventory Ledgers
        ledgers = [
            InventoryLedger(item_id=ffb_item.id, change_type="IN", quantity=1350.0, balance_after=2330.0, reference_type="Harvest", reference_id="HV-2026-001", notes="Harvested from Block B"),
            InventoryLedger(item_id=ffb_item.id, change_type="OUT", quantity=1350.0, balance_after=980.0, reference_type="Processing", reference_id="PB-2026-001", notes="Processed into CPO"),
            InventoryLedger(item_id=cpo_item.id, change_type="IN", quantity=250.0, balance_after=830.0, reference_type="Processing", reference_id="PB-2026-001", notes="Produced from PB-2026-001"),
            InventoryLedger(item_id=cpo_item.id, change_type="OUT", quantity=150.0, balance_after=680.0, reference_type="Sale", reference_id="SAL-2026-001", notes="Sold to Kofo Soap Industries"),
        ]
        db.add_all(ledgers)
        db.commit()

        print("Database initialized and populated successfully.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()
