import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Settings01Icon } from '@hugeicons/core-free-icons';

interface HeaderProps {
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('davot_user_name') || 'Seun';
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

  // Sync user name from storage if updated
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem('davot_user_name');
      if (stored && stored !== userName) {
        setUserName(stored);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [userName]);

  return (
    <header className="app-header-clean">
      <div className="header-user-welcome">
        <h1 className="header-greeting">{timeOfDay} {userName}</h1>
        <p className="header-subtitle">How are you doing today</p>
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
  );
};
