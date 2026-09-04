import axios from 'axios';
import {
  FarmBlock, Harvest, ProcessingBatch, KernelProcessingBatch,
  InventoryItem, InventoryLedger, Customer, Sale, Payment,
  Expense, Supplier, DashboardSummary, FlowNodeSummary
} from './types';

const API_BASE = '/api';

export const api = {
  // Analytics
  getDashboardSummary: () => axios.get<DashboardSummary>(`${API_BASE}/analytics/summary`).then(r => r.data),
  getFlowNodes: () => axios.get<FlowNodeSummary>(`${API_BASE}/analytics/flow-nodes`).then(r => r.data),
  getTraceability: (invoice: string) => axios.get(`${API_BASE}/analytics/traceability/${invoice}`).then(r => r.data),

  // Farm & Harvests
  getBlocks: () => axios.get<FarmBlock[]>(`${API_BASE}/farm/blocks`).then(r => r.data),
  createBlock: (data: Partial<FarmBlock>) => axios.post<FarmBlock>(`${API_BASE}/farm/blocks`, data).then(r => r.data),
  getHarvests: () => axios.get<Harvest[]>(`${API_BASE}/farm/harvests`).then(r => r.data),
  createHarvest: (data: Partial<Harvest>) => axios.post<Harvest>(`${API_BASE}/farm/harvests`, data).then(r => r.data),

  // Processing
  getCpoBatches: () => axios.get<ProcessingBatch[]>(`${API_BASE}/processing/cpo-batches`).then(r => r.data),
  createCpoBatch: (data: Partial<ProcessingBatch>) => axios.post<ProcessingBatch>(`${API_BASE}/processing/cpo-batches`, data).then(r => r.data),
  getKernelBatches: () => axios.get<KernelProcessingBatch[]>(`${API_BASE}/processing/kernel-batches`).then(r => r.data),
  createKernelBatch: (data: Partial<KernelProcessingBatch>) => axios.post<KernelProcessingBatch>(`${API_BASE}/processing/kernel-batches`, data).then(r => r.data),

  // Inventory
  getInventoryItems: () => axios.get<InventoryItem[]>(`${API_BASE}/inventory/items`).then(r => r.data),
  getInventoryLedger: () => axios.get<InventoryLedger[]>(`${API_BASE}/inventory/ledger`).then(r => r.data),

  // Sales & Debt
  getCustomers: () => axios.get<Customer[]>(`${API_BASE}/sales/customers`).then(r => r.data),
  createCustomer: (data: Partial<Customer>) => axios.post<Customer>(`${API_BASE}/sales/customers`, data).then(r => r.data),
  getSales: () => axios.get<Sale[]>(`${API_BASE}/sales/records`).then(r => r.data),
  createSale: (data: Partial<Sale>) => axios.post<Sale>(`${API_BASE}/sales/records`, data).then(r => r.data),
  getPayments: () => axios.get<Payment[]>(`${API_BASE}/sales/payments`).then(r => r.data),
  logPayment: (data: Partial<Payment>) => axios.post<Payment>(`${API_BASE}/sales/payments`, data).then(r => r.data),

  // Expenses & Suppliers
  getExpenses: () => axios.get<Expense[]>(`${API_BASE}/expenses/`).then(r => r.data),
  createExpense: (data: Partial<Expense>) => axios.post<Expense>(`${API_BASE}/expenses/`, data).then(r => r.data),
  getSuppliers: () => axios.get<Supplier[]>(`${API_BASE}/expenses/suppliers`).then(r => r.data),
  createSupplier: (data: Partial<Supplier>) => axios.post<Supplier>(`${API_BASE}/expenses/suppliers`, data).then(r => r.data),
};
