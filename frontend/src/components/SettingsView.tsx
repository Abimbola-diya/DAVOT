import React, { useState, useRef } from 'react';
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
import { Camera, Trash2, Upload } from 'lucide-react';
import { ProfilePictureCropper } from './ProfilePictureCropper';

interface SettingsViewProps {
  viewMode: ViewMode;
  onSelectRole: (mode: ViewMode) => void;
  onReturnToAuth?: () => void;
  onClose?: () => void;
}

type SubPage = 'main' | 'profile' | 'security' | 'mode' | 'farm' | 'help';
type ProfileSubPage = 'list' | 'change-picture' | 'change-name' | 'change-email' | 'change-password';

export const SettingsView: React.FC<SettingsViewProps> = ({
  viewMode,
  onSelectRole,
  onReturnToAuth,
  onClose,
}) => {
  const [subPage, setSubPage] = useState<SubPage>('main');
  const [profileSubPage, setProfileSubPage] = useState<ProfileSubPage>('list');

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('davot_user_name') || 'Seun';
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('davot_user_email') || 'seun@davot.farm';
  });
  const [userAvatar, setUserAvatar] = useState<string | null>(() => {
    return localStorage.getItem('davot_profile_picture');
  });
  const [selectedRawImage, setSelectedRawImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [farmName, setFarmName] = useState(() => {
    return localStorage.getItem('davot_farm_name') || 'DAVOT Oil Palm Mills - Campus A';
  });
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('davot_currency') || '₦ (NGN)';
  });
  const [defaultUnit, setDefaultUnit] = useState(() => {
    return localStorage.getItem('davot_unit') || 'Litres';
  });
  const [defaultWeightUnit, setDefaultWeightUnit] = useState(() => {
    return localStorage.getItem('davot_weight_unit') || 'Kilograms (kg)';
  });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [saveMsgText, setSaveMsgText] = useState('Settings updated successfully!');

  const triggerSuccessMsg = (msg: string) => {
    setSaveMsgText(msg);
    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
    }, 2500);
  };

  const handleDeleteAvatar = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    localStorage.removeItem('davot_profile_picture');
    setUserAvatar(null);
    window.dispatchEvent(new Event('davot_avatar_changed'));
    triggerSuccessMsg('Profile picture deleted and reset to default.');
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setSelectedRawImage(reader.result as string);
        setIsCropping(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveCroppedImage = (croppedDataUrl: string) => {
    localStorage.setItem('davot_profile_picture', croppedDataUrl);
    setUserAvatar(croppedDataUrl);
    window.dispatchEvent(new Event('davot_avatar_changed'));
    setIsCropping(false);
    setSelectedRawImage(null);
    setProfileSubPage('list');
    triggerSuccessMsg('Profile picture updated successfully!');
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setSelectedRawImage(null);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      localStorage.setItem('davot_user_name', userName.trim());
      triggerSuccessMsg('Display name updated successfully!');
    }
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (userEmail.trim()) {
      localStorage.setItem('davot_user_email', userEmail.trim());
      triggerSuccessMsg('Email address updated successfully!');
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword) {
      localStorage.setItem('davot_user_password', newPassword);
      setCurrentPassword('');
      setNewPassword('');
      triggerSuccessMsg('Password updated successfully!');
    }
  };

  const handleSaveFarmPrefs = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('davot_farm_name', farmName);
    localStorage.setItem('davot_currency', currency);
    localStorage.setItem('davot_unit', defaultUnit);
    localStorage.setItem('davot_weight_unit', defaultWeightUnit);
    triggerSuccessMsg('Farm preferences saved successfully!');
  };

  // RENDER 1: MAIN SETTINGS CATEGORY LIST
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

        {/* Categorized Rows */}
        <div className="settings-category-list">
          {/* Row 1: Profile */}
          <button
            type="button"
            className="settings-menu-item"
            onClick={() => {
              setProfileSubPage('list');
              setSubPage('profile');
            }}
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

          {/* Row 4: Farm & Preferences */}
          <button
            type="button"
            className="settings-menu-item"
            onClick={() => setSubPage('farm')}
          >
            <span className="menu-item-title">Farm & Preferences</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#94a3b8" />
          </button>

          {/* Row 5: Help & Support */}
          <button
            type="button"
            className="settings-menu-item"
            onClick={() => setSubPage('help')}
          >
            <span className="menu-item-title">Help & Support</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#94a3b8" />
          </button>
        </div>
      </div>
    );
  }

  // RENDER 2: PROFILE SUB-PAGES (List, Change Profile Picture, Change Display Name, Change Email, Change Password)
  if (subPage === 'profile') {
    // 2A: PROFILE MAIN LIST
    if (profileSubPage === 'list') {
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

          {saveSuccessMsg && (
            <div className="settings-success-alert" style={{ marginBottom: '14px' }}>
              <HugeiconsIcon icon={Tick02Icon} size={16} color="#15803d" />
              <span>{saveMsgText}</span>
            </div>
          )}

          <div className="card settings-profile-card" style={{ marginBottom: '16px' }}>
            <div className="settings-profile-header-wrap">
              <div className="settings-avatar-wrap">
                <img
                  src={userAvatar || "/seun-avatar.png"}
                  alt={`${userName} Avatar`}
                  className="settings-page-avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/seun-avatar.png';
                  }}
                />
                {/* Camera / Edit Badge */}
                <button
                  type="button"
                  className="settings-avatar-edit-badge"
                  onClick={() => setProfileSubPage('change-picture')}
                  title="Change profile picture"
                  aria-label="Change profile picture"
                >
                  <Camera size={13} color="#ffffff" />
                </button>

                {/* Small Delete Icon beside avatar */}
                <button
                  type="button"
                  className={`settings-avatar-delete-badge ${!userAvatar ? 'disabled' : ''}`}
                  onClick={handleDeleteAvatar}
                  title={userAvatar ? "Delete custom photo" : "Using default avatar"}
                  aria-label="Delete custom photo"
                  disabled={!userAvatar}
                >
                  <Trash2 size={13} color={userAvatar ? "#ef4444" : "#94a3b8"} />
                </button>
              </div>

              <div>
                <h3 className="settings-profile-name">{userName}</h3>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{userEmail}</div>
                <div className={`role-indicator-badge ${viewMode}`} style={{ marginTop: '6px' }}>
                  {viewMode === 'view' ? 'Viewer Mode' : 'Recording Mode'}
                </div>
              </div>
            </div>
          </div>

          {/* Segregated Profile Action Items */}
          <div className="settings-category-list">
            <button
              type="button"
              className="settings-menu-item"
              onClick={() => setProfileSubPage('change-picture')}
            >
              <span className="menu-item-title">Change Profile Picture</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#94a3b8" />
            </button>

            <button
              type="button"
              className="settings-menu-item"
              onClick={() => setProfileSubPage('change-name')}
            >
              <span className="menu-item-title">Change Display Name</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#94a3b8" />
            </button>

            <button
              type="button"
              className="settings-menu-item"
              onClick={() => setProfileSubPage('change-email')}
            >
              <span className="menu-item-title">Change Email</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#94a3b8" />
            </button>

            <button
              type="button"
              className="settings-menu-item"
              onClick={() => setProfileSubPage('change-password')}
            >
              <span className="menu-item-title">Change Password</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#94a3b8" />
            </button>
          </div>
        </div>
      );
    }

    // 2B: CHANGE PROFILE PICTURE
    if (profileSubPage === 'change-picture') {
      return (
        <div className="settings-page-container">
          <div className="settings-nav-header">
            <button
              type="button"
              className="settings-back-btn"
              onClick={() => setProfileSubPage('list')}
              aria-label="Back to profile"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#1e293b" />
            </button>
            <h2 className="settings-nav-title">Change Profile Picture</h2>
          </div>

          {saveSuccessMsg && (
            <div className="settings-success-alert" style={{ marginBottom: '16px' }}>
              <HugeiconsIcon icon={Tick02Icon} size={16} color="#15803d" />
              <span>{saveMsgText}</span>
            </div>
          )}

          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '24px 16px' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelected}
            />

            <div className="change-picture-avatar-preview-wrap">
              <img
                src={userAvatar || '/seun-avatar.png'}
                alt="Current profile preview"
                className="change-picture-preview-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/seun-avatar.png';
                }}
              />
              {userAvatar && (
                <button
                  type="button"
                  className="change-picture-delete-badge"
                  onClick={handleDeleteAvatar}
                  title="Delete custom picture"
                >
                  <Trash2 size={15} color="#ef4444" />
                </button>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a' }}>
                {userAvatar ? 'Custom Profile Picture Set' : 'Default Profile Avatar'}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                Upload a photo (PNG, JPG, WEBP) and crop it cleanly.
              </div>
            </div>

            <div className="profile-actions-stack">
              <button
                type="button"
                className="profile-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} color="#ffffff" />
                <span>{userAvatar ? 'Upload New Photo' : 'Choose Photo'}</span>
              </button>

              {userAvatar && (
                <button
                  type="button"
                  className="profile-remove-btn"
                  onClick={handleDeleteAvatar}
                >
                  <Trash2 size={16} color="#dc2626" />
                  <span>Remove Custom Photo</span>
                </button>
              )}
            </div>
          </div>

          {/* Render Interactive Cropper Modal */}
          {isCropping && selectedRawImage && (
            <ProfilePictureCropper
              imageSrc={selectedRawImage}
              onCropSave={handleSaveCroppedImage}
              onCancel={handleCancelCrop}
            />
          )}
        </div>
      );
    }

    // 2B: CHANGE DISPLAY NAME
    if (profileSubPage === 'change-name') {
      return (
        <div className="settings-page-container">
          <div className="settings-nav-header">
            <button
              type="button"
              className="settings-back-btn"
              onClick={() => setProfileSubPage('list')}
              aria-label="Back to profile"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#1e293b" />
            </button>
            <h2 className="settings-nav-title">Change Display Name</h2>
          </div>

          <div className="card">
            <form onSubmit={handleSaveName} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {saveSuccessMsg && (
                <div className="settings-success-alert">
                  <HugeiconsIcon icon={Tick02Icon} size={16} color="#15803d" />
                  <span>{saveMsgText}</span>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">New Display Name</label>
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
                <span>Save Display Name</span>
              </button>
            </form>
          </div>
        </div>
      );
    }

    // 2C: CHANGE EMAIL
    if (profileSubPage === 'change-email') {
      return (
        <div className="settings-page-container">
          <div className="settings-nav-header">
            <button
              type="button"
              className="settings-back-btn"
              onClick={() => setProfileSubPage('list')}
              aria-label="Back to profile"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#1e293b" />
            </button>
            <h2 className="settings-nav-title">Change Email</h2>
          </div>

          <div className="card">
            <form onSubmit={handleSaveEmail} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {saveSuccessMsg && (
                <div className="settings-success-alert">
                  <HugeiconsIcon icon={Tick02Icon} size={16} color="#15803d" />
                  <span>{saveMsgText}</span>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="davot-input"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <button type="submit" className="davot-submit-btn" style={{ marginTop: '6px' }}>
                <span>Update Email Address</span>
              </button>
            </form>
          </div>
        </div>
      );
    }

    // 2D: CHANGE PASSWORD
    if (profileSubPage === 'change-password') {
      return (
        <div className="settings-page-container">
          <div className="settings-nav-header">
            <button
              type="button"
              className="settings-back-btn"
              onClick={() => setProfileSubPage('list')}
              aria-label="Back to profile"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#1e293b" />
            </button>
            <h2 className="settings-nav-title">Change Password</h2>
          </div>

          <div className="card">
            <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {saveSuccessMsg && (
                <div className="settings-success-alert">
                  <HugeiconsIcon icon={Tick02Icon} size={16} color="#15803d" />
                  <span>{saveMsgText}</span>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="davot-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="davot-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <button type="submit" className="davot-submit-btn" style={{ marginTop: '6px' }}>
                <span>Update Password</span>
              </button>
            </form>
          </div>
        </div>
      );
    }
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Active Session</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Signed in as <strong>{userEmail}</strong>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              Last login: Today ({new Date().toLocaleDateString()})
            </div>
          </div>
        </div>

        {onReturnToAuth && (
          <div style={{ marginTop: '14px' }}>
            <button
              type="button"
              className="dropdown-logout-btn"
              style={{
                padding: '16px',
                justifyContent: 'center',
                fontSize: '14px',
                borderRadius: '18px',
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
  if (subPage === 'mode') {
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
  }

  // RENDER 5: FARM & PREFERENCES SUB-PAGE
  if (subPage === 'farm') {
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
          <h2 className="settings-nav-title">Farm & Preferences</h2>
        </div>

        <div className="card">
          <form onSubmit={handleSaveFarmPrefs} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {saveSuccessMsg && (
              <div className="settings-success-alert">
                <HugeiconsIcon icon={Tick02Icon} size={16} color="#15803d" />
                <span>Farm preferences saved successfully!</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Farm / Mill Name</label>
              <input
                type="text"
                className="davot-input"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="Enter farm name"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Currency Symbol</label>
              <select
                className="davot-input"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="₦ (NGN)">₦ (Nigerian Naira)</option>
                <option value="$ (USD)">$ (US Dollar)</option>
                <option value="£ (GBP)">£ (British Pound)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Default Weight Unit (FFB & Solids)</label>
              <select
                className="davot-input"
                value={defaultWeightUnit}
                onChange={(e) => setDefaultWeightUnit(e.target.value)}
              >
                <option value="Kilograms (kg)">Kilograms (kg)</option>
                <option value="Metric Tonnes (MT)">Metric Tonnes (MT)</option>
                <option value="Pounds (lbs)">Pounds (lbs)</option>
                <option value="Bags (50kg)">Bags (50kg)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Default Volume Unit (CPO & Liquids)</label>
              <select
                className="davot-input"
                value={defaultUnit}
                onChange={(e) => setDefaultUnit(e.target.value)}
              >
                <option value="Litres">Litres (L)</option>
                <option value="Metric Tonnes (MT)">Metric Tonnes (MT)</option>
                <option value="25L Kegs">25L Kegs</option>
                <option value="Drums (200L)">Drums / Barrels (200L)</option>
              </select>
            </div>

            <button type="submit" className="davot-submit-btn" style={{ marginTop: '6px' }}>
              <span>Save Preferences</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // RENDER 6: HELP & SUPPORT SUB-PAGE
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
        <h2 className="settings-nav-title">Help & Support</h2>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
          Need assistance or technical support with your DAVOT workspace? Reach out directly to our farm operations tech team.
        </div>

        <a
          href="https://wa.me/2348000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="davot-submit-btn"
          style={{ textDecoration: 'none', background: '#16a34a' }}
        >
          <span>Chat on WhatsApp Support</span>
        </a>

        <a
          href="mailto:support@davot.farm"
          className="davot-submit-btn"
          style={{ textDecoration: 'none', background: '#0284c7' }}
        >
          <span>Email Support Team</span>
        </a>
      </div>

      <div className="card" style={{ textAlign: 'center', background: '#f8fafc' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>DAVOT Operations Engine</div>
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>v1.2.0 (Build 2026.09)</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px', padding: '4px 10px', background: '#dcfce7', borderRadius: '12px', fontSize: '11px', color: '#166534', fontWeight: 600 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span>
          <span>System Operational</span>
        </div>
      </div>
    </div>
  );
};
