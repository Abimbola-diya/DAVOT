import React, { useState } from 'react';
import { DomainMode } from '../types';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon, TractorIcon, Estimate01Icon, TreePalmIcon } from '@hugeicons/core-free-icons';

interface DomainSelectionProps {
  currentDomain: DomainMode;
  onSelectDomain: (domain: DomainMode) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const DomainSelection: React.FC<DomainSelectionProps> = ({
  currentDomain,
  onSelectDomain,
  onContinue,
  onBack,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<DomainMode>(currentDomain);

  const handleDomainClick = (domain: DomainMode) => {
    setSelectedDomain(domain);
    onSelectDomain(domain);
  };

  return (
    <div className="auth-screen-container">
      <div className="auth-content">
        {/* Top Navigation */}
        <div className="auth-top-nav">
          <button className="auth-back-btn" onClick={onBack} aria-label="Go back to role selection">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#000000" />
          </button>
        </div>

        {/* Top Centered Logo */}
        <div className="auth-logo-wrapper">
          <div className="auth-logo-badge">
            <HugeiconsIcon icon={TreePalmIcon} size={34} color="#ffffff" />
          </div>
        </div>

        {/* Titles */}
        <h1 className="auth-title">Select Focus Domain</h1>
        <p className="auth-subtitle">Which workspace section do you want to access?</p>

        {/* Domain Selection Cards */}
        <div className="mode-cards-container">
          {/* Option 1: Farm Operations */}
          <div
            className={`mode-select-card ${selectedDomain === 'farm' ? 'active' : ''}`}
            onClick={() => handleDomainClick('farm')}
          >
            <div className="card-icon-badge">
              <HugeiconsIcon
                icon={TractorIcon}
                size={22}
                color={selectedDomain === 'farm' ? '#ffffff' : '#f97316'}
              />
            </div>
            <div className="card-text-group">
              <h3 className="card-headline">Farm Operations</h3>
              <p className="card-description">
                Physical harvest flows, processing yields, stock inventory, and batch tracking.
              </p>
            </div>
          </div>

          {/* Option 2: Expenses & Financials */}
          <div
            className={`mode-select-card ${selectedDomain === 'expenses' ? 'active' : ''}`}
            onClick={() => handleDomainClick('expenses')}
          >
            <div className="card-icon-badge">
              <HugeiconsIcon
                icon={Estimate01Icon}
                size={22}
                color={selectedDomain === 'expenses' ? '#ffffff' : '#f97316'}
              />
            </div>
            <div className="card-text-group">
              <h3 className="card-headline">Expenses & Financials</h3>
              <p className="card-description">
                Operational costs, sales records, customer debts, supplier ledgers, and cash flow.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button className="auth-continue-btn" onClick={onContinue}>
          <span>Enter Workspace</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={20} color="#ffffff" />
        </button>
      </div>
    </div>
  );
};
