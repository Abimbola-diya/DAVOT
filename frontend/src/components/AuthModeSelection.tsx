import React, { useState, useEffect } from 'react';
import { ViewMode } from '../types';
import { HugeiconsIcon } from '@hugeicons/react';
import { TreePalmIcon, EyeIcon, Edit02Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

interface AuthModeSelectionProps {
  currentMode: ViewMode;
  onSelectMode: (mode: ViewMode) => void;
  onContinue: () => void;
}

export const AuthModeSelection: React.FC<AuthModeSelectionProps> = ({
  currentMode,
  onSelectMode,
  onContinue,
}) => {
  const [greeting, setGreeting] = useState('');
  const [selectedMode, setSelectedMode] = useState<ViewMode>(currentMode);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning, Seun');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon, Seun');
    } else {
      setGreeting('Good evening, Seun');
    }
  }, []);

  const handleModeClick = (mode: ViewMode) => {
    setSelectedMode(mode);
    onSelectMode(mode);
  };

  return (
    <div className="auth-screen-container">
      <div className="auth-content">
        {/* Top Centered Palm Tree Icon */}
        <div className="auth-logo-wrapper">
          <div className="auth-logo-badge">
            <HugeiconsIcon icon={TreePalmIcon} size={36} color="#ffffff" />
          </div>
        </div>

        {/* Dynamic Greeting Heading */}
        <h1 className="auth-title">{greeting}</h1>
        <p className="auth-subtitle">Choose how you would like to use DAVOT</p>

        {/* Mode Selection Cards */}
        <div className="mode-cards-container">
          {/* Card 1: View Mode */}
          <div
            className={`mode-select-card ${selectedMode === 'view' ? 'active' : ''}`}
            onClick={() => handleModeClick('view')}
          >
            <div className="card-icon-badge">
              <HugeiconsIcon 
                icon={EyeIcon} 
                size={22} 
                color={selectedMode === 'view' ? '#ffffff' : '#15803d'} 
              />
            </div>
            <div className="card-text-group">
              <h3 className="card-headline">I want to view & monitor operations</h3>
              <p className="card-description">
                View real-time physical flows, stock inventory levels, customer debts owed, and analytics.
              </p>
            </div>
          </div>

          {/* Card 2: Edit Mode */}
          <div
            className={`mode-select-card ${selectedMode === 'edit' ? 'active' : ''}`}
            onClick={() => handleModeClick('edit')}
          >
            <div className="card-icon-badge">
              <HugeiconsIcon 
                icon={Edit02Icon} 
                size={22} 
                color={selectedMode === 'edit' ? '#ffffff' : '#15803d'} 
              />
            </div>
            <div className="card-text-group">
              <h3 className="card-headline">I want to record farm operations</h3>
              <p className="card-description">
                Record harvests, CPO & Kernel processing batches, sales, payments, and operational expenses.
              </p>
            </div>
          </div>
        </div>

        {/* Continue Action Button */}
        <button className="auth-continue-btn" onClick={onContinue}>
          <span>Continue</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={20} color="#ffffff" />
        </button>
      </div>
    </div>
  );
};
