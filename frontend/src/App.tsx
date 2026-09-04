import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ViewMode, ActiveTab, FarmBlock, InventoryItem, InventoryLedger, Customer, Sale, Expense, Supplier, DashboardSummary, FlowNodeSummary } from './types';
import { api } from './api';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { FlowView } from './components/FlowView';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { SalesDebtView } from './components/SalesDebtView';
import { SettingsView } from './components/SettingsView';
import { EditHub } from './components/edit/EditHub';
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

export const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('davot_auth') === 'true';
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('davot_role') as ViewMode) || 'view';
  });

  // Active tab synchronized with URL path
  const activeTab = getTabFromPath(location.pathname);

  // Data states
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [flowData, setFlowData] = useState<FlowNodeSummary | null>(null);
  const [blocks, setBlocks] = useState<FarmBlock[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [ledgers, setLedgers] = useState<InventoryLedger[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Modal active form state
  const [activeFormModal, setActiveFormModal] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      const [sumRes, flowRes, blocksRes, invItemsRes, ledgersRes, custRes, salesRes, expRes, supRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getFlowNodes(),
        api.getBlocks(),
        api.getInventoryItems(),
        api.getInventoryLedger(),
        api.getCustomers(),
        api.getSales(),
        api.getExpenses(),
        api.getSuppliers(),
      ]);

      setSummary(sumRes);
      setFlowData(flowRes);
      setBlocks(blocksRes);
      setInventoryItems(invItemsRes);
      setLedgers(ledgersRes);
      setCustomers(custRes);
      setSales(salesRes);
      setExpenses(expRes);
      setSuppliers(supRes);
    } catch (err) {
      console.error('Failed to fetch farm data:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const handleOpenForm = (formType: string) => {
    setActiveFormModal(formType);
  };

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
      <Route path="/" element={<Navigate to="/role" replace />} />

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

              <main className="content-area">
                {activeTab === 'settings' ? (
                  <SettingsView 
                    viewMode={viewMode}
                    onSelectRole={handleSelectRole}
                    onReturnToAuth={handleLogout}
                    onClose={() => navigate('/app/flow')}
                  />
                ) : viewMode === 'edit' ? (
                  <EditHub onOpenForm={handleOpenForm} />
                ) : (
                  <>
                    {activeTab === 'flow' && (
                      <FlowView flowData={flowData} summary={summary} />
                    )}

                    {activeTab === 'dashboard' && (
                      <DashboardView summary={summary} />
                    )}

                    {activeTab === 'inventory' && (
                      <InventoryView items={inventoryItems} ledgers={ledgers} />
                    )}

                    {(activeTab === 'sales' || activeTab === 'expenses') && (
                      <SalesDebtView 
                        customers={customers} 
                        sales={sales} 
                        expenses={expenses}
                        onLogPaymentClick={() => {
                          setActiveFormModal('payment');
                        }}
                      />
                    )}
                  </>
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

              {/* Fixed Navigation for Mobile (Only for Viewer Mode) */}
              {viewMode === 'view' && (
                <BottomNav 
                  activeTab={activeTab} 
                  onSelectTab={handleTabSelect} 
                />
              )}
            </div>
          ) : (
            <Navigate to="/role" replace />
          )
        }
      />

      {/* Default Catch-All Route */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/app/flow" : "/role"} replace />}
      />
    </Routes>
  );
};

export default App;
