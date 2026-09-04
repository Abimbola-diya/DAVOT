import React, { useState, useEffect } from 'react';
import { ViewMode, ActiveTab, FarmBlock, InventoryItem, InventoryLedger, Customer, Sale, Expense, Supplier, DashboardSummary, FlowNodeSummary } from './types';
import { api } from './api';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { FlowView } from './components/FlowView';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { SalesDebtView } from './components/SalesDebtView';
import { ExpensesView } from './components/ExpensesView';
import { EditHub } from './components/edit/EditHub';
import { Modals } from './components/edit/Modals';
import { AuthModeSelection } from './components/AuthModeSelection';

export const App: React.FC = () => {
  const [showAuthScreen, setShowAuthScreen] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>('view');
  const [activeTab, setActiveTab] = useState<ActiveTab>('flow');

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
    fetchAllData();
  }, []);

  const handleOpenForm = (formType: string) => {
    setActiveFormModal(formType);
  };

  if (showAuthScreen) {
    return (
      <AuthModeSelection
        currentMode={viewMode}
        onSelectMode={(mode) => setViewMode(mode)}
        onContinue={() => setShowAuthScreen(false)}
      />
    );
  }

  return (
    <div className="app-container">
      <Header 
        viewMode={viewMode} 
        onToggleMode={(mode) => setViewMode(mode)} 
        onReturnToAuth={() => setShowAuthScreen(true)}
      />

      <main className="content-area">
        {viewMode === 'edit' ? (
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

            {activeTab === 'sales' && (
              <SalesDebtView 
                customers={customers} 
                sales={sales} 
                onLogPaymentClick={() => {
                  setViewMode('edit');
                  setActiveFormModal('payment');
                }}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpensesView expenses={expenses} />
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

      {/* Fixed Navigation for Mobile */}
      <BottomNav 
        activeTab={activeTab} 
        onSelectTab={(tab) => {
          setViewMode('view');
          setActiveTab(tab);
        }} 
      />
    </div>
  );
};

export default App;
