import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ViewMode, DomainMode, ActiveTab, FarmBlock, InventoryItem, InventoryLedger, Customer, Sale, Expense, Supplier, DashboardSummary, FlowNodeSummary, HarvestRecord, HarvestBatch } from './types';
import { api } from './api';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { FlowView } from './components/FlowView';
import { InventoryView } from './components/InventoryView';
import { SalesDebtView } from './components/SalesDebtView';
import { ExpensesView } from './components/ExpensesView';
import { SettingsView } from './components/SettingsView';
import { Modals } from './components/edit/Modals';
import { AuthModeSelection } from './components/AuthModeSelection';
import { DomainSelection } from './components/DomainSelection';
import { LoginPage } from './components/LoginPage';
import { HarvestView } from './components/HarvestView';
import { AddHarvestModal } from './components/edit/AddHarvestModal';


const getTabFromPath = (pathname: string): ActiveTab => {
  if (pathname.includes('/settings')) return 'settings';
  if (pathname.includes('/customers') || pathname.includes('/dashboard')) return 'dashboard';
  if (pathname.includes('/stock') || pathname.includes('/inventory')) return 'inventory';
  if (pathname.includes('/expenses')) return 'expenses';
  if (pathname.includes('/sales')) return 'sales';
  return 'flow';
};

const getPathFromTab = (tab: ActiveTab): string => {
  switch (tab) {
    case 'settings':
      return '/app/settings';
    case 'dashboard':
      return '/app/customers';
    case 'inventory':
      return '/app/stock';
    case 'expenses':
      return '/app/expenses';
    case 'sales':
      return '/app/sales';
    case 'flow':
    default:
      return '/app/flow';
  }
};

// Default initial data for instant Vercel render resilience
const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: 'Mrs. Adebayo (Retail)',
    phone: '08055551122',
    location: 'Main Market, Benin',
    segment: 'Direct buyers',
    preferred_product: 'Crude Palm Oil (CPO)',
    total_purchased: 225000,
    total_paid: 225000,
    balance_due: 0
  },
  {
    id: 2,
    name: 'Kofo Soap Industries Ltd',
    phone: '08022223344',
    location: 'Industrial Layout, Aba',
    segment: 'Industrial user',
    preferred_product: 'Palm Kernel Oil (PKO)',
    total_purchased: 300000,
    total_paid: 225000,
    balance_due: 75000
  },
  {
    id: 3,
    name: 'Alhaji Musa Oil Depot',
    phone: '08066667788',
    location: 'Milverton, Aba',
    segment: 'Souvenir customers',
    preferred_product: 'Fresh Fruit Bunches (FFB)',
    total_purchased: 180000,
    total_paid: 100000,
    balance_due: 80000
  }
];

const INITIAL_SUMMARY: DashboardSummary = {
  total_revenue: 705000,
  total_expenses: 125000,
  net_profit: 580000,
  total_debt_owed: 155000,
  ffb_harvested_kg: 2330,
  cpo_produced_litres: 250,
  pko_produced_litres: 32,
  current_cpo_stock_litres: 640,
  current_pko_stock_litres: 210,
  current_kernel_stock_kg: 95
};

const INITIAL_FLOW: FlowNodeSummary = {
  harvested_ffb_kg: 2330,
  processed_ffb_kg: 1350,
  produced_cpo_litres: 250,
  produced_kernel_kg: 95,
  processed_kernel_kg: 75,
  produced_pko_litres: 32,
  produced_pkc_bags: 2,
  total_cpo_sales_litres: 150,
  total_pko_sales_litres: 0
};

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 1, name: 'Crude Palm Oil (CPO)', category: 'Finished Product', unit: 'litres', current_stock: 640, reorder_level: 100 },
  { id: 2, name: 'Palm Kernel Oil (PKO)', category: 'Finished Product', unit: 'litres', current_stock: 210, reorder_level: 50 },
  { id: 3, name: 'Palm Kernel Cake (PKC)', category: 'By-Product', unit: 'bags', current_stock: 25, reorder_level: 5 },
  { id: 4, name: 'Fresh Fruit Bunches (FFB)', category: 'Raw Harvest', unit: 'kg', current_stock: 980, reorder_level: 200 }
];

const INITIAL_HARVESTS: HarvestRecord[] = [
  {
    id: 'h_1',
    name: 'Harvest A',
    created_at: '2026-09-20',
    batches: [
      {
        id: 'b_101',
        batch_name: 'Batch A',
        date: '2026-09-20',
        ffb_weight: 1250,
        weight_unit: 'Kg',
        bunch_count: 180,
        destination: 'Palm Oil Mill 1 (Hydraulic Press)',
        status: 'Processed into CPO/PKO',
        notes: 'High oil extraction efficiency (21.5% CPO yield)',
      },
      {
        id: 'b_102',
        batch_name: 'Batch B',
        date: '2026-09-21',
        ffb_weight: 1.45,
        weight_unit: 'Tonnes',
        bunch_count: 210,
        destination: 'Central Factory Processing Depot',
        status: 'In Processing',
        notes: 'Transported via tractor trailer 2',
      },
    ],
  },
  {
    id: 'h_2',
    name: 'Harvest B',
    created_at: '2026-09-22',
    batches: [
      {
        id: 'b_201',
        batch_name: 'Batch A',
        date: '2026-09-22',
        ffb_weight: 980,
        weight_unit: 'Kg',
        bunch_count: 140,
        destination: 'Palm Oil Mill 1 (Hydraulic Press)',
        status: 'Awaiting Processing',
        notes: 'First harvest cycle from new planting',
      },
    ],
  },
];

export const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Instant auth resilience - default to true on initial visit for seamless demo access
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const stored = localStorage.getItem('davot_auth');
    if (stored === null) {
      localStorage.setItem('davot_auth', 'true');
      return true;
    }
    return stored === 'true';
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('davot_role') as ViewMode) || 'view';
  });

  const [domainMode, setDomainMode] = useState<DomainMode>(() => {
    return (localStorage.getItem('davot_domain') as DomainMode) || 'farm';
  });

  // Active tab synchronized with URL path
  const activeTab = getTabFromPath(location.pathname);

  // Data states initialized with resilient defaults
  const [summary, setSummary] = useState<DashboardSummary | null>(INITIAL_SUMMARY);
  const [flowData, setFlowData] = useState<FlowNodeSummary | null>(INITIAL_FLOW);
  const [blocks, setBlocks] = useState<FarmBlock[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [ledgers, setLedgers] = useState<InventoryLedger[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Harvest state
  const [harvestRecords, setHarvestRecords] = useState<HarvestRecord[]>(INITIAL_HARVESTS);
  const [isAddHarvestModalOpen, setIsAddHarvestModalOpen] = useState<boolean>(false);
  const [selectedHarvestForBatch, setSelectedHarvestForBatch] = useState<string | undefined>(undefined);

  const handleSaveNewHarvest = (harvestName: string, batchData: Omit<HarvestBatch, 'id' | 'batch_name'>) => {
    const newRecord: HarvestRecord = {
      id: `h_${Date.now()}`,
      name: harvestName,
      created_at: new Date().toISOString().split('T')[0],
      batches: [
        {
          id: `b_${Date.now()}_1`,
          batch_name: 'Batch A',
          ...batchData,
        },
      ],
    };
    setHarvestRecords((prev) => [newRecord, ...prev]);
  };

  const handleAddBatchToExisting = (harvestId: string, batchData: Omit<HarvestBatch, 'id' | 'batch_name'>) => {
    setHarvestRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== harvestId) return rec;
        const nextLetter = String.fromCharCode(65 + rec.batches.length);
        const newBatch: HarvestBatch = {
          id: `b_${Date.now()}_${rec.batches.length + 1}`,
          batch_name: `Batch ${nextLetter}`,
          ...batchData,
        };
        return {
          ...rec,
          batches: [...rec.batches, newBatch],
        };
      })
    );
  };


  // Recording mode category filter state
  const [recordCategory, setRecordCategory] = useState<string>('harvest');
  const [activeFormModal, setActiveFormModal] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      const [sumRes, flowRes, blocksRes, invItemsRes, ledgersRes, custRes, salesRes, expRes, supRes] = await Promise.all([
        api.getDashboardSummary().catch(() => null),
        api.getFlowNodes().catch(() => null),
        api.getBlocks().catch(() => null),
        api.getInventoryItems().catch(() => null),
        api.getInventoryLedger().catch(() => null),
        api.getCustomers().catch(() => null),
        api.getSales().catch(() => null),
        api.getExpenses().catch(() => null),
        api.getSuppliers().catch(() => null),
      ]);

      if (sumRes && typeof sumRes === 'object' && typeof (sumRes as any).total_revenue === 'number') {
        setSummary(sumRes);
      }
      if (flowRes && typeof flowRes === 'object' && typeof (flowRes as any).harvested_ffb_kg === 'number') {
        setFlowData(flowRes);
      }
      if (Array.isArray(blocksRes)) setBlocks(blocksRes);
      if (Array.isArray(invItemsRes) && invItemsRes.length > 0 && typeof invItemsRes[0]?.current_stock === 'number') {
        setInventoryItems(invItemsRes);
      }
      if (Array.isArray(ledgersRes)) setLedgers(ledgersRes);
      if (Array.isArray(custRes) && custRes.length > 0 && typeof custRes[0]?.balance_due === 'number') {
        setCustomers(custRes);
      }
      if (Array.isArray(salesRes)) setSales(salesRes);
      if (Array.isArray(expRes)) setExpenses(expRes);
      if (Array.isArray(supRes)) setSuppliers(supRes);
    } catch (err) {
      console.warn('Backend API connection warning (using resilient offline state):', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const handleSelectRole = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('davot_role', mode);
  };

  const handleSelectDomain = (domain: DomainMode) => {
    setDomainMode(domain);
    localStorage.setItem('davot_domain', domain);
  };

  const handleLoginSuccess = (user?: any) => {
    const roleToSet = user?.role || viewMode;
    setViewMode(roleToSet);
    localStorage.setItem('davot_role', roleToSet);
    navigate('/role-selection');
  };

  const handleEnterWorkspace = () => {
    localStorage.setItem('davot_auth', 'true');
    setIsAuthenticated(true);
    if (domainMode === 'farm') {
      navigate('/app/flow');
    } else {
      navigate('/app/sales');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('davot_auth');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleTabSelect = (tab: ActiveTab) => {
    navigate(getPathFromTab(tab));
  };

  return (
    <Routes>
      {/* Route 0: Default Root Landing goes to Step 1: Login */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/app/flow" : "/login"} replace />} />

      {/* Step 1: /login - Login Page */}
      <Route
        path="/login"
        element={
          <LoginPage
            selectedRole={viewMode}
            onLoginSuccess={handleLoginSuccess}
          />
        }
      />

      {/* Step 2: /role-selection - Role Selection Page */}
      <Route
        path="/role-selection"
        element={
          <AuthModeSelection
            currentMode={viewMode}
            onSelectMode={handleSelectRole}
            onContinue={() => navigate('/domain-selection')}
            onBack={() => navigate('/login')}
          />
        }
      />

      {/* Step 3: /domain-selection - Domain Selection Page (Farm vs Expenses) */}
      <Route
        path="/domain-selection"
        element={
          <DomainSelection
            currentDomain={domainMode}
            onSelectDomain={handleSelectDomain}
            onContinue={handleEnterWorkspace}
            onBack={() => navigate('/role-selection')}
          />
        }
      />

      {/* Authenticated Workspace Sub-Routes */}
      <Route
        path="/app/*"
        element={
          isAuthenticated ? (
            <div className="app-container">
              <Header 
                onOpenSettings={() => navigate('/app/settings')}
                domainMode={domainMode}
                onToggleDomain={() => navigate('/domain-selection')}
              />

              {/* Determine effective active tab across View and Edit modes */}
              {(() => {
                const effectiveTab = viewMode === 'edit' ? recordCategory : activeTab;

                return (
                  <>
                    <main className="content-area">
                      {activeTab === 'settings' ? (
                        <SettingsView 
                          viewMode={viewMode}
                          onSelectRole={handleSelectRole}
                          onReturnToAuth={handleLogout}
                          onClose={() => navigate(domainMode === 'farm' ? '/app/flow' : '/app/sales')}
                        />
                      ) : domainMode === 'farm' ? (
                        /* Farm Domain Workspace Views */
                        (effectiveTab === 'harvest') ? (
                          <HarvestView
                            records={harvestRecords}
                            onOpenAddHarvestModal={() => {
                              setSelectedHarvestForBatch(undefined);
                              setIsAddHarvestModalOpen(true);
                            }}
                            onOpenAddBatchModal={(harvestId) => {
                              setSelectedHarvestForBatch(harvestId);
                              setIsAddHarvestModalOpen(true);
                            }}
                          />
                        ) : (effectiveTab === 'inventory' || effectiveTab === 'stock') ? (
                          <InventoryView items={inventoryItems} ledgers={ledgers} />
                        ) : (
                          <FlowView flowData={flowData} summary={summary} />
                        )
                      ) : (
                        /* Expenses & Financials Workspace Views */
                        effectiveTab === 'expenses' ? (
                          <ExpensesView expenses={expenses} />
                        ) : (
                          <SalesDebtView 
                            customers={customers} 
                            sales={sales} 
                            expenses={expenses}
                            viewMode={viewMode}
                            onLogPaymentClick={() => {
                              setActiveFormModal('payment');
                            }}
                            onRefreshData={fetchAllData}
                          />
                        )
                      )}
                    </main>

                    {/* Add Harvest / Batch Modal */}
                    {isAddHarvestModalOpen && (
                      <AddHarvestModal
                        onClose={() => {
                          setIsAddHarvestModalOpen(false);
                          setSelectedHarvestForBatch(undefined);
                        }}
                        onSaveNewHarvest={handleSaveNewHarvest}
                        onAddBatchToExisting={handleAddBatchToExisting}
                        existingRecords={harvestRecords}
                        initialHarvestId={selectedHarvestForBatch}
                      />
                    )}

                    {/* Floating Modal for Edit Mode Forms */}
                    {activeFormModal && (
                      <Modals
                        formType={activeFormModal}
                        blocks={blocks}
                        customers={customers}
                        suppliers={suppliers}
                        sales={sales}
                        onClose={() => setActiveFormModal(null)}
                        onSuccess={fetchAllData}
                      />
                    )}


                    {/* Fixed Navigation for Mobile */}
                    <BottomNav 
                      viewMode={viewMode}
                      domainMode={domainMode}
                      activeTab={domainMode === 'farm' ? (recordCategory || 'harvest') : effectiveTab} 
                      onSelectTab={(tabId) => {
                        if (domainMode === 'farm') {
                          setRecordCategory(tabId);
                        } else if (viewMode === 'edit') {
                          setRecordCategory(tabId);
                          if (tabId === 'customer' || tabId === 'sales') navigate('/app/sales');
                          else if (tabId === 'expenses') navigate('/app/expenses');
                          else if (tabId === 'inventory' || tabId === 'stock') navigate('/app/stock');
                          else navigate('/app/flow');
                        } else {
                          handleTabSelect(tabId as ActiveTab);
                        }
                      }} 
                    />
                  </>
                );
              })()}
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Default Catch-All Route */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default App;
