import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ViewMode, ActiveTab, FarmBlock, InventoryItem, InventoryLedger, Customer, Sale, Expense, Supplier, DashboardSummary, FlowNodeSummary } from './types';
import { api } from './api';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { FlowView } from './components/FlowView';
import { InventoryView } from './components/InventoryView';
import { SalesDebtView } from './components/SalesDebtView';
import { SettingsView } from './components/SettingsView';
import { Modals } from './components/edit/Modals';
import { AuthModeSelection } from './components/AuthModeSelection';
import { LoginPage } from './components/LoginPage';

const getTabFromPath = (pathname: string): ActiveTab => {
  if (pathname.includes('/settings')) return 'settings';
  if (pathname.includes('/customers') || pathname.includes('/dashboard')) return 'dashboard';
  if (pathname.includes('/stock') || pathname.includes('/inventory')) return 'inventory';
  if (pathname.includes('/sales') || pathname.includes('/expenses')) return 'sales';
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
    case 'sales':
    case 'expenses':
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

  // Recording mode category filter state
  const [recordCategory, setRecordCategory] = useState<string>('all');
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

  const handleLoginSuccess = (user?: any) => {
    const roleToSet = user?.role || viewMode;
    setViewMode(roleToSet);
    localStorage.setItem('davot_role', roleToSet);
    localStorage.setItem('davot_auth', 'true');
    setIsAuthenticated(true);
    navigate('/app/flow');
  };

  const handleLogout = () => {
    localStorage.removeItem('davot_auth');
    setIsAuthenticated(false);
    navigate('/role');
  };

  const handleTabSelect = (tab: ActiveTab) => {
    navigate(getPathFromTab(tab));
  };

  return (
    <Routes>
      {/* Route 0: / - Landing on DAVOT shows Role Selection */}
      <Route path="/" element={<Navigate to="/app/flow" replace />} />

      {/* Route 1: /role - Role Selection Page */}
      <Route
        path="/role"
        element={
          <AuthModeSelection
            currentMode={viewMode}
            onSelectMode={handleSelectRole}
            onContinue={() => navigate('/login')}
          />
        }
      />

      {/* Route 2: /login - Login Page */}
      <Route
        path="/login"
        element={
          <LoginPage
            selectedRole={viewMode}
            onBack={() => navigate('/role')}
            onLoginSuccess={handleLoginSuccess}
          />
        }
      />

      {/* Route 3: /app/* - Authenticated Main Workspace Sub-Routes */}
      <Route
        path="/app/*"
        element={
          isAuthenticated ? (
            <div className="app-container">
              <Header 
                onOpenSettings={() => navigate('/app/settings')}
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
                          onClose={() => navigate('/app/flow')}
                        />
                      ) : (effectiveTab === 'customer' || effectiveTab === 'sales' || effectiveTab === 'dashboard') ? (
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
                      ) : (effectiveTab === 'inventory' || effectiveTab === 'stock') ? (
                        <InventoryView items={inventoryItems} ledgers={ledgers} />
                      ) : (
                        <FlowView flowData={flowData} summary={summary} />
                      )}
                    </main>

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
                      activeTab={effectiveTab} 
                      onSelectTab={(tabId) => {
                        if (viewMode === 'edit') {
                          setRecordCategory(tabId);
                          if (tabId === 'customer' || tabId === 'sales') navigate('/app/customers');
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
            <Navigate to="/role" replace />
          )
        }
      />

      {/* Default Catch-All Route */}
      <Route
        path="*"
        element={<Navigate to="/app/flow" replace />}
      />
    </Routes>
  );
};

export default App;
