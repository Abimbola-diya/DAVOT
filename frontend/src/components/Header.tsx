import React, { useState, useEffect } from 'react';
import { ViewMode } from '../types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Settings01Icon,
  Logout01Icon,
  EyeIcon,
  Cancel01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';

interface HeaderProps {
  viewMode: ViewMode;
  onSelectRole: (mode: ViewMode) => void;
  onReturnToAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onSelectRole,
  onReturnToAuth,
}) => {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('davot_user_name') || 'Seun';
  });
  const [password, setPassword] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('Good morning');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setTimeOfDay('Good morning');
    } else if (hour >= 12 && hour < 17) {
      setTimeOfDay('Good afternoon');
    } else {
      setTimeOfDay('Good evening');
    }
  }, []);

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

  return (
    <>
      <header className="app-header-clean">
        <div className="header-user-welcome">
          <h1 className="header-greeting">{timeOfDay} {userName}</h1>
          <p className="header-subtitle">How are you doing today</p>
        </div>

        <div className="header-right-actions">
          {/* Settings Icon Button */}
          <button
            className="header-icon-btn"
            title="Settings & Profile"
            onClick={() => setShowSettingsModal(true)}
            type="button"
          >
            <HugeiconsIcon icon={Settings01Icon} size={20} color="#1e293b" />
          </button>

          {/* Profile Avatar Button */}
          <button
            className="header-avatar-btn"
            onClick={() => setShowSettingsModal(true)}
            title="Settings & Profile"
            type="button"
          >
            <img
              src="/seun-avatar.png"
              alt={`${userName} Profile`}
              className="header-avatar-img"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </button>
        </div>
      </header>

      {/* Settings & Profile Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content settings-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="settings-modal-header">
              <div className="settings-modal-title">
                <HugeiconsIcon icon={Settings01Icon} size={22} color="var(--primary-green-dark)" />
                <span>Account & App Settings</span>
              </div>
              <button
                className="settings-modal-close"
                onClick={() => setShowSettingsModal(false)}
                type="button"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} color="#64748b" />
              </button>
            </div>

            {/* Profile Avatar & Info Card */}
            <div className="settings-user-card">
              <img src="/seun-avatar.png" alt="Profile" className="settings-avatar-img" />
              <div>
                <div className="settings-user-name">{userName}</div>
                <div className="settings-role-badge">
                  {viewMode === 'view' ? 'Viewer Mode Active' : 'Recording Mode Active'}
                </div>
              </div>
            </div>

            {/* SECTION 1: ROLE SELECTION (VIEW / RECORD) */}
            <div className="settings-section">
              <label className="settings-section-label">Active Workspace Mode</label>
              <div className="settings-mode-grid">
                <button
                  type="button"
                  className={`settings-mode-card ${viewMode === 'view' ? 'active' : ''}`}
                  onClick={() => onSelectRole('view')}
                >
                  <HugeiconsIcon
                    icon={EyeIcon}
                    size={20}
                    color={viewMode === 'view' ? '#008746' : '#64748b'}
                  />
                  <div>
                    <div className="mode-card-title">Viewer Mode</div>
                    <div className="mode-card-desc">Monitor operational flows & analytics</div>
                  </div>
                </button>

                <button
                  type="button"
                  className={`settings-mode-card ${viewMode === 'edit' ? 'active' : ''}`}
                  onClick={() => onSelectRole('edit')}
                >
                  <HugeiconsIcon
                    icon={Settings01Icon}
                    size={20}
                    color={viewMode === 'edit' ? '#c2410c' : '#64748b'}
                  />
                  <div>
                    <div className="mode-card-title">Recording Mode</div>
                    <div className="mode-card-desc">Record harvests, sales & expenses</div>
                  </div>
                </button>
              </div>
            </div>

            {/* SECTION 2: EDIT NAME & PASSWORD */}
            <form onSubmit={handleSaveProfile} className="settings-section">
              <label className="settings-section-label">Profile & Security</label>

              {saveSuccessMsg && (
                <div className="settings-success-alert">
                  <HugeiconsIcon icon={Tick02Icon} size={16} color="#15803d" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <button type="submit" className="submit-btn" style={{ marginTop: '8px' }}>
                Save Profile Changes
              </button>
            </form>

            {/* SECTION 3: LOG OUT */}
            {onReturnToAuth && (
              <div className="settings-section" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="dropdown-logout-btn"
                  style={{ padding: '12px', justifyContent: 'center', fontSize: '14px' }}
                  onClick={() => {
                    setShowSettingsModal(false);
                    onReturnToAuth();
                  }}
                >
                  <HugeiconsIcon icon={Logout01Icon} size={18} color="#dc2626" />
                  <span>Log Out of DAVOT</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
