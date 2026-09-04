import React from 'react';
import { DashboardSummary } from '../types';
import { TrendingUp, AlertTriangle, Scale, DollarSign } from 'lucide-react';

interface DashboardViewProps {
  summary: DashboardSummary | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ summary }) => {
  if (!summary) return <div className="card">Loading farm summary...</div>;

  return (
    <div>
      <div className="section-header">
        <div className="section-title">
          <TrendingUp size={18} /> Operational & Financial Summary
        </div>
      </div>

      {/* Financial Stats */}
      <div className="stat-grid">
        <div className="stat-card accent">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₦{summary.total_revenue.toLocaleString()}</div>
          <div className="stat-sub">From CPO & PKO Sales</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">₦{summary.total_expenses.toLocaleString()}</div>
          <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
            Labour, Fertilizer & Fuel
          </div>
        </div>
      </div>

      {/* Net Profit Card */}
      <div className="card" style={{ background: summary.net_profit >= 0 ? '#f0fdf4' : '#fef2f2', borderColor: summary.net_profit >= 0 ? '#bbf7d0' : '#fecaca' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="stat-label">Net Operating Cashflow</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: summary.net_profit >= 0 ? '#15803d' : '#dc2626' }}>
              ₦{summary.net_profit.toLocaleString()}
            </div>
          </div>
          <DollarSign size={28} color={summary.net_profit >= 0 ? '#15803d' : '#dc2626'} />
        </div>
      </div>

      {/* Money Owed Callout */}
      {summary.total_debt_owed > 0 && (
        <div className="card debt-card">
          <div className="debt-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#92400e' }}>
              <AlertTriangle size={16} /> Customers Owe You (Credit Sales)
            </div>
            <span className="badge badge-partial">Uncollected</span>
          </div>
          <div className="debt-amount">₦{summary.total_debt_owed.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#78350f', marginTop: '4px' }}>
            Balance due from partial/credit purchases. Track exact debtors in Sales & Debt tab.
          </div>
        </div>
      )}

      {/* Physical Production Totals */}
      <div className="card">
        <div className="section-title" style={{ fontSize: '14px', marginBottom: '12px' }}>
          <Scale size={16} /> Key Production Output
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px' }}>
            <div className="stat-label">Harvest FFB</div>
            <div style={{ fontWeight: 800, fontSize: '15px' }}>{summary.ffb_harvested_kg.toLocaleString()} kg</div>
          </div>

          <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '10px' }}>
            <div className="stat-label">CPO Oil</div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#15803d' }}>{summary.cpo_produced_litres.toLocaleString()} L</div>
          </div>

          <div style={{ background: '#fffbeb', padding: '10px', borderRadius: '10px' }}>
            <div className="stat-label">PKO Oil</div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#b45309' }}>{summary.pko_produced_litres.toLocaleString()} L</div>
          </div>
        </div>
      </div>
    </div>
  );
};
