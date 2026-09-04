import React from 'react';
import { ViewMode } from '../types';
import { HugeiconsIcon } from '@hugeicons/react';
import { TreePalmIcon, EyeIcon, Edit02Icon } from '@hugeicons/core-free-icons';

interface HeaderProps {
  viewMode: ViewMode;
  onToggleMode: (mode: ViewMode) => void;
  onReturnToAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ viewMode, onToggleMode, onReturnToAuth }) => {
  return (
    <header className="app-header">
      <div className="brand-logo" onClick={onReturnToAuth} title="Click to switch mode / profile">
        <div className="brand-icon">
          <HugeiconsIcon icon={TreePalmIcon} size={22} color="#ffffff" />
        </div>
        <div>
          <div className="brand-title">DAVOT</div>
          <div className="brand-sub">Palm Farm • Seun</div>
        </div>
      </div>

      <div className="mode-toggle-container">
        <button
          className={`mode-btn view ${viewMode === 'view' ? 'active' : ''}`}
          onClick={() => onToggleMode('view')}
        >
          <HugeiconsIcon icon={EyeIcon} size={14} color={viewMode === 'view' ? '#ffffff' : '#64748b'} /> View
        </button>
        <button
          className={`mode-btn edit ${viewMode === 'edit' ? 'active' : ''}`}
          onClick={() => onToggleMode('edit')}
        >
          <HugeiconsIcon icon={Edit02Icon} size={14} color={viewMode === 'edit' ? '#ffffff' : '#64748b'} /> Edit
        </button>
      </div>
    </header>
  );
};
