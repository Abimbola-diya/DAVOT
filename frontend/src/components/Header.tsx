import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Settings01Icon, TractorIcon, Estimate01Icon } from '@hugeicons/core-free-icons';
import { DomainMode } from '../types';

interface HeaderProps {
  onOpenSettings?: () => void;
  domainMode?: DomainMode;
  onToggleDomain?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, domainMode = 'farm', onToggleDomain }) => {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('davot_user_name') || 'Seun';
  });
  const [userAvatar, setUserAvatar] = useState<string | null>(() => {
    return localStorage.getItem('davot_profile_picture');
  });
  const [timeOfDay, setTimeOfDay] = useState('Good morning');

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

  // Sync user name and avatar from storage if updated
  useEffect(() => {
    const syncHeader = () => {
      const storedName = localStorage.getItem('davot_user_name');
      if (storedName) {
        setUserName(prev => (prev !== storedName ? storedName : prev));
      }
      const storedAvatar = localStorage.getItem('davot_profile_picture');
      setUserAvatar(prev => (prev !== storedAvatar ? storedAvatar : prev));
    };

    window.addEventListener('davot_avatar_changed', syncHeader);
    window.addEventListener('storage', syncHeader);

    const interval = setInterval(syncHeader, 1000);

    return () => {
      window.removeEventListener('davot_avatar_changed', syncHeader);
      window.removeEventListener('storage', syncHeader);
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="app-header-clean">
      <div className="header-user-welcome">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <h1 className="header-greeting">{timeOfDay} {userName}</h1>
          {onToggleDomain && (
            <button
              onClick={onToggleDomain}
              className="header-domain-badge-btn"
              title="Click to switch domain workspace"
              type="button"
            >
              <HugeiconsIcon
                icon={domainMode === 'farm' ? TractorIcon : Estimate01Icon}
                size={14}
                color="#000000"
              />
              <span>{domainMode === 'farm' ? 'Farm' : 'Expenses'}</span>
            </button>
          )}
        </div>
        <p className="header-subtitle">
          {domainMode === 'farm' ? 'Farm Operations & Flow' : 'Expenses & Financial Accounts'}
        </p>
      </div>

      <div className="header-right-actions">
        {/* Settings Button */}
        <button
          className="header-icon-btn"
          title="Account & App Settings"
          onClick={onOpenSettings}
          type="button"
        >
          <HugeiconsIcon icon={Settings01Icon} size={20} color="#1e293b" />
        </button>

        {/* Profile Avatar Button */}
        <button
          className="header-avatar-btn"
          onClick={onOpenSettings}
          title="Account & App Settings"
          type="button"
        >
          <img
            src={userAvatar || "/seun-avatar.png"}
            alt={`${userName} Profile`}
            className="header-avatar-img"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/seun-avatar.png';
            }}
          />
        </button>
      </div>
    </header>
  );
};
