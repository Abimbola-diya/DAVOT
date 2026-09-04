import React from 'react';
import { ActiveTab } from '../types';
import { GitCommit, LayoutDashboard, Package, ShoppingBag, Receipt } from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-tab ${activeTab === 'flow' ? 'active' : ''}`}
        onClick={() => onSelectTab('flow')}
      >
        <GitCommit />
        <span>Flow</span>
      </button>

      <button
        className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onSelectTab('dashboard')}
      >
        <LayoutDashboard />
        <span>Summary</span>
      </button>

      <button
        className={`nav-tab ${activeTab === 'inventory' ? 'active' : ''}`}
        onClick={() => onSelectTab('inventory')}
      >
        <Package />
        <span>Stock</span>
      </button>

      <button
        className={`nav-tab ${activeTab === 'sales' ? 'active' : ''}`}
        onClick={() => onSelectTab('sales')}
      >
        <ShoppingBag />
        <span>Sales & Debt</span>
      </button>

      <button
        className={`nav-tab ${activeTab === 'expenses' ? 'active' : ''}`}
        onClick={() => onSelectTab('expenses')}
      >
        <Receipt />
        <span>Expenses</span>
      </button>
    </nav>
  );
};
