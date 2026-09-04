import React from 'react';
import { motion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  WorkflowSquare01Icon,
  UserMultipleIcon,
  PackageIcon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: any;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'flow', label: 'Flow', icon: WorkflowSquare01Icon },
  { id: 'dashboard', label: 'Customers', icon: UserMultipleIcon },
  { id: 'inventory', label: 'Stock', icon: PackageIcon },
  { id: 'sales', label: 'Sales & Debt', icon: Wallet01Icon },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  // If activeTab is 'expenses', treat tab 4 ('sales') as active
  const currentTabId = activeTab === 'expenses' ? 'sales' : activeTab;

  return (
    <div className="bottom-nav-container">
      <nav className="bottom-nav-floating">
        {NAV_ITEMS.map((item) => {
          const isActive = currentTabId === item.id;
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
                  className="floating-active-pill"
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 32,
                  }}
                />
              )}

              <div className="floating-nav-icon-wrap">
                <HugeiconsIcon
                  icon={item.icon}
                  size={20}
                  color={isActive ? '#008746' : '#64748b'}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
              </div>

              <span className={`floating-nav-label ${isActive ? 'active' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

