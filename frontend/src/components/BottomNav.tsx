import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  WorkflowSquare01Icon,
  UserMultipleIcon,
  PackageIcon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons';
import { Receipt } from 'lucide-react';
import { ViewMode, DomainMode } from '../types';

interface BottomNavProps {
  viewMode?: ViewMode;
  domainMode?: DomainMode;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  isLucide?: boolean;
}

const FARM_VIEWER_ITEMS: NavItem[] = [
  { id: 'flow', label: 'Farm Flow', icon: WorkflowSquare01Icon },
  { id: 'inventory', label: 'Stock Levels', icon: PackageIcon },
];

const FARM_RECORDING_ITEMS: NavItem[] = [
  { id: 'flow', label: 'Harvest & Process', icon: WorkflowSquare01Icon },
  { id: 'inventory', label: 'Stock Ledger', icon: PackageIcon },
];

const EXPENSES_VIEWER_ITEMS: NavItem[] = [
  { id: 'sales', label: 'Sales & Debt', icon: Wallet01Icon },
  { id: 'dashboard', label: 'Customers', icon: UserMultipleIcon },
];

const EXPENSES_RECORDING_ITEMS: NavItem[] = [
  { id: 'expenses', label: 'Record Expenses', icon: Receipt, isLucide: true },
  { id: 'sales', label: 'Record Sales', icon: Wallet01Icon },
  { id: 'customer', label: 'Customers', icon: UserMultipleIcon },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  viewMode = 'view',
  domainMode = 'farm',
  activeTab,
  onSelectTab,
}) => {
  const isEditMode = viewMode === 'edit';
  
  let items: NavItem[];
  if (domainMode === 'farm') {
    items = isEditMode ? FARM_RECORDING_ITEMS : FARM_VIEWER_ITEMS;
  } else {
    items = isEditMode ? EXPENSES_RECORDING_ITEMS : EXPENSES_VIEWER_ITEMS;
  }

  let currentTabId = activeTab;
  if (!isEditMode && activeTab === 'expenses') {
    currentTabId = 'sales';
  }

  return (
    <div className="bottom-nav-container">
      <nav className="bottom-nav-floating">
        {items.map((item) => {
          const isActive = currentTabId === item.id;
          const IconComp = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`floating-nav-item ${isActive ? 'active' : ''}`}
              type="button"
            >
              {isActive && (
                <motion.div
                  layoutId="floatingNavActivePill"
                  className={`floating-active-pill ${isEditMode ? 'recording-theme' : ''}`}
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 32,
                  }}
                />
              )}

              <div className="floating-nav-icon-wrap">
                {item.isLucide ? (
                  <IconComp
                    size={20}
                    color={isActive ? '#ea580c' : '#64748b'}
                    strokeWidth={isActive ? 2.2 : 1.6}
                  />
                ) : (
                  <HugeiconsIcon
                    icon={item.icon}
                    size={20}
                    color={isActive ? '#ea580c' : '#64748b'}
                    strokeWidth={isActive ? 2.2 : 1.6}
                  />
                )}
              </div>

              <span
                className={`floating-nav-label ${isActive ? 'active' : ''} ${
                  isEditMode ? 'recording-theme' : ''
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

