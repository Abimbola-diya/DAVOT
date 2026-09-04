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
import { ViewMode } from '../types';

interface BottomNavProps {
  viewMode?: ViewMode;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  isLucide?: boolean;
}

const VIEWER_NAV_ITEMS: NavItem[] = [
  { id: 'flow', label: 'Flow', icon: WorkflowSquare01Icon },
  { id: 'dashboard', label: 'Customers', icon: UserMultipleIcon },
  { id: 'inventory', label: 'Stock', icon: PackageIcon },
  { id: 'sales', label: 'Sales & Debt', icon: Wallet01Icon },
];

const RECORDING_NAV_ITEMS: NavItem[] = [
  { id: 'flow', label: 'Flow', icon: WorkflowSquare01Icon },
  { id: 'inventory', label: 'Inventory', icon: PackageIcon },
  { id: 'customer', label: 'Customer', icon: UserMultipleIcon },
  { id: 'expenses', label: 'Expenses', icon: Receipt, isLucide: true },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  viewMode = 'view',
  activeTab,
  onSelectTab,
}) => {
  const isEditMode = viewMode === 'edit';
  const items = isEditMode ? RECORDING_NAV_ITEMS : VIEWER_NAV_ITEMS;

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
                    color={isActive ? (isEditMode ? '#ea580c' : '#008746') : '#64748b'}
                    strokeWidth={isActive ? 2.2 : 1.6}
                  />
                ) : (
                  <HugeiconsIcon
                    icon={item.icon}
                    size={20}
                    color={isActive ? (isEditMode ? '#ea580c' : '#008746') : '#64748b'}
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

