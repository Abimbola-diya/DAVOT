export type ViewMode = 'view' | 'edit';
export type DomainMode = 'farm' | 'expenses';
export type ActiveTab = 'flow' | 'dashboard' | 'inventory' | 'sales' | 'expenses' | 'settings';

export interface FarmBlock {
  id: number;
  name: string;
  area_hectares: number;
  palm_count: number;
  planting_year?: number;
  status: string;
}

export type InputType = 'Fertilizer' | 'Chemical' | 'Fuel' | 'Other';

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  current_stock: number;
  reorder_level: number;
  item_type?: InputType;
  last_purchased_date?: string;
  last_cost?: number;
  usage_this_month?: number;
  usage_last_month?: number;
  bought_this_month?: number;
  bought_today?: number;
  usage_today?: number;
  usage_yesterday?: number;
  bought_this_week?: number;
  usage_this_week?: number;
  usage_last_week?: number;
}

export interface InventoryLedger {
  id: number;
  item_id: number;
  timestamp: string;
  change_type: 'IN' | 'OUT';
  quantity: number;
  balance_after: number;
  reference_type: string;
  reference_id?: string;
  notes?: string;
  item_name?: string;
  unit?: string;
  unit_cost?: number;
  total_cost?: number;
}

export interface HarvestBatch {
  id: string;
  batch_name: string;
  date: string;
  ffb_weight: number;
  weight_unit: 'Kg' | 'Tonnes';
  bunch_count: number;
  destination: string;
  status: 'Awaiting Processing' | 'In Processing' | 'Processed' | 'Stored';
  notes?: string;
}

export interface HarvestRecord {
  id: string;
  name: string;
  created_at: string;
  batches: HarvestBatch[];
}

export interface Harvest {
  id: number;
  batch_number: string;
  date: string;
  block_id: number;
  block_name?: string;
  bunch_count: number;
  ffb_weight_kg: number;
  loose_fruit_kg: number;
  labour_cost: number;
  transport_cost: number;
  notes?: string;
}

export interface ProcessingBatch {
  id: number;
  batch_number: string;
  date: string;
  harvest_id?: number;
  harvest_batch_number?: string;
  ffb_input_kg: number;
  cpo_output_litres: number;
  kernel_output_kg: number;
  fibre_output_kg: number;
  shell_output_kg: number;
  extraction_rate_percent: number;
  processing_cost: number;
  notes?: string;
}

export interface KernelProcessingBatch {
  id: number;
  batch_number: string;
  date: string;
  cpo_processing_batch_id?: number;
  cpo_batch_number?: string;
  kernel_input_kg: number;
  pko_output_litres: number;
  pkc_output_bags: number;
  extraction_rate_percent: number;
  processing_cost: number;
  notes?: string;
}

export interface ProductBatch {
  id: string;
  harvest_id: string;
  harvest_batch_id?: string;
  date: string;
  ffb_processed_kg: number;
  cpo_produced_litres: number;
  pko_produced_litres: number;
  pkc_produced_kg: number;
  notes?: string;
}

export type ToolCategory = 'Hand Tool' | 'Equipment' | 'Other';
export type ToolCondition = 'Good' | 'Fair' | 'Bad';

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  quantity: number;
  date_bought: string;
  condition: ToolCondition;
  notes?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  location?: string;
  segment: string;
  preferred_product?: string;
  total_purchased: number;
  total_paid: number;
  balance_due: number;
}

export interface Sale {
  id: number;
  invoice_number: string;
  date: string;
  customer_id: number;
  customer_name?: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  payment_status: 'Paid' | 'Partial' | 'Unpaid';
  notes?: string;
}

export interface Payment {
  id: number;
  reference: string;
  date: string;
  sale_id?: number;
  customer_id: number;
  customer_name?: string;
  invoice_number?: string;
  amount_paid: number;
  payment_method: string;
  notes?: string;
}

export interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  block_id?: number;
  block_name?: string;
  supplier_id?: number;
  supplier_name?: string;
}

export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  supply_type?: string;
}

export interface DashboardSummary {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  total_debt_owed: number;
  ffb_harvested_kg: number;
  cpo_produced_litres: number;
  pko_produced_litres: number;
  current_cpo_stock_litres: number;
  current_pko_stock_litres: number;
  current_kernel_stock_kg: number;
}

export interface FlowNodeSummary {
  harvested_ffb_kg: number;
  processed_ffb_kg: number;
  produced_cpo_litres: number;
  produced_kernel_kg: number;
  processed_kernel_kg: number;
  produced_pko_litres: number;
  produced_pkc_bags: number;
  total_cpo_sales_litres: number;
  total_pko_sales_litres: number;
}
