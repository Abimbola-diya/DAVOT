import React, { useState } from 'react';
import { ViewMode } from '../types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Settings01Icon,
  Logout01Icon,
  EyeIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';

interface SettingsViewProps {
  viewMode: ViewMode;
  onSelectRole: (mode: ViewMode) => void;
  onReturnToAuth?: () => void;
  onClose?: () => void;
}

type SubPage = 'main' | 'profile' | 'security' | 'mode';

export const SettingsView: React.FC<SettingsViewProps> = ({
  viewMode,
  onSelectRole,
  onReturnToAuth,
  onClose,
}) => {
  const [subPage, setSubPage] = useState<SubPage>('main');
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('davot_user_name') || 'Seun';
  });
  const [password, setPassword] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      localStorage.setItem('davot_user_name', userName.trim());
    }
    if (password) {
      localStorage.setItem('davot_user_password', password);
    }
    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
    }, 2500);
  };

  // RENDER 1: MAIN SETTINGS CATEGORY LIST (Matching Reference Image 3)
  if (subPage === 'main') {
    return (
      <div className="settings-page-container">
        {/* Navigation Header */}
        <div className="settings-nav-header">
          {onClose && (
            <button
              type="button"
              className="settings-back-btn"
              onClick={onClose}
              aria-label="Back to app"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#1e293b" />
            </button>
          )}
          <h2 className="settings-nav-title">Settings</h2>
        </div>

        {/* 3 Clean Categorized Rows */}
        <div className="settings-category-list">
          {/* Row 1: Profile */}
          <button
            type="button"
            className="settings-menu-item"
            onClick={() => setSubPage('profile')}
          >
            <span className="menu-item-title">Profile</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#94a3b8" />
          </button>

          {/* Row 2: Account & Security */}
          <button
            type="button"
            className="settings-menu-item"
            onClick={() => setSubPage('security')}
          >
            <span className="menu-item-title">Account & Security</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#94a3b8" />
          </button>

          {/* Row 3: Workspace Mode */}
          <button
            type="button"
            className="settings-menu-item"
            onClick={() => setSubPage('mode')}
          >
            <span className="menu-item-title">Workspace Mode</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#94a3b8" />
          </button>
        </div>
      </div>
    );
  }

  // RENDER 2: PROFILE SUB-PAGE
  if (subPage === 'profile') {
    return (
      <div className="settings-page-container">
        <div className="settings-nav-header">
          <button
            type="button"
            className="settings-back-btn"
            onClick={() => setSubPage('main')}
            aria-label="Back to settings"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#1e293b" />
          </button>
          <h2 className="settings-nav-title">Profile</h2>
        </div>

        <div className="card settings-profile-card">
          <div className="settings-profile-header-wrap">
            <img src="/seun-avatar.png" alt="Seun Avatar" className="settings-page-avatar" />
            <div>
              <h3 className="settings-profile-name">{userName}</h3>
              <div className={`role-indicator-badge ${viewMode}`} style={{ marginTop: '4px' }}>
                {viewMode === 'view' ? 'Viewer Mode' : 'Recording Mode'}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {saveSuccessMsg && (
              <div className="settings-success-alert">
                <HugeiconsIcon icon={Tick02Icon} size={16} color="#15803d" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Display Name</label>
              <input
                type="text"
                className="davot-input"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter display name"
                required
              />
            </div>

            <button type="submit" className="davot-submit-btn" style={{ marginTop: '6px' }}>
              <span>Save Profile</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // RENDER 3: ACCOUNT & SECURITY SUB-PAGE
  if (subPage === 'security') {
    return (
      <div className="settings-page-container">
        <div className="settings-nav-header">
          <button
            type="button"
            className="settings-back-btn"
            onClick={() => setSubPage('main')}
            aria-label="Back to settings"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#1e293b" />
          </button>
          <h2 className="settings-nav-title">Account & Security</h2>
        </div>

        <div className="card">
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {saveSuccessMsg && (
              <div className="settings-success-alert">
                <HugeiconsIcon icon={Tick02Icon} size={16} color="#15803d" />
                <span>Password updated successfully!</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="davot-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <button type="submit" className="davot-submit-btn" style={{ marginTop: '6px' }}>
              <span>Update Password</span>
            </button>
          </form>
        </div>

        {onReturnToAuth && (
          <div style={{ marginTop: '10px' }}>
            <button
              type="button"
              className="dropdown-logout-btn"
              style={{
                padding: '14px',
                justifyContent: 'center',
                fontSize: '14px',
                borderRadius: '16px',
                width: '100%',
              }}
              onClick={onReturnToAuth}
            >
              <HugeiconsIcon icon={Logout01Icon} size={18} color="#dc2626" />
              <span>Log Out of DAVOT</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // RENDER 4: WORKSPACE MODE SUB-PAGE
  return (
    <div className="settings-page-container">
      <div className="settings-nav-header">
        <button
          type="button"
          className="settings-back-btn"
          onClick={() => setSubPage('main')}
          aria-label="Back to settings"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#1e293b" />
        </button>
        <h2 className="settings-nav-title">Workspace Mode</h2>
      </div>

      <div className="card">
        <div className="settings-mode-grid">
          <button
            type="button"
            className={`settings-mode-card ${viewMode === 'view' ? 'active' : ''}`}
            onClick={() => onSelectRole('view')}
          >
            <div
              className="card-icon-badge"
              style={{ background: viewMode === 'view' ? 'var(--primary-green)' : '#f1f5f9' }}
            >
              <HugeiconsIcon
                icon={EyeIcon}
                size={20}
                color={viewMode === 'view' ? '#ffffff' : '#64748b'}
              />
            </div>
            <div>
              <div className="mode-card-title">Viewer Mode</div>
              <div className="mode-card-desc">
                Monitor operational flows, inventory & customer debts
              </div>
            </div>
          </button>

          <button
            type="button"
            className={`settings-mode-card ${viewMode === 'edit' ? 'active' : ''}`}
            onClick={() => onSelectRole('edit')}
          >
            <div
              className="card-icon-badge"
              style={{ background: viewMode === 'edit' ? '#ea580c' : '#f1f5f9' }}
            >
              <HugeiconsIcon
                icon={Settings01Icon}
                size={20}
                color={viewMode === 'edit' ? '#ffffff' : '#64748b'}
              />
            </div>
            <div>
              <div className="mode-card-title">Recording Mode</div>
              <div className="mode-card-desc">
                Log daily harvests, CPO processing, sales & expenses
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
