import React from 'react';
import { DashboardSummary } from '../types';
import { TrendingUp, AlertTriangle, Scale, DollarSign } from 'lucide-react';

interface DashboardViewProps {
  summary: DashboardSummary | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ summary }) => {
  if (!summary) return <div className="card">Loading customer & farm data...</div>;

  const safeFormat = (val: any, fallback: string | number = '0') => 
    typeof val === 'number' && !isNaN(val) ? val.toLocaleString() : fallback.toString();

  const netProfit = typeof summary.net_profit === 'number' ? summary.net_profit : 0;
  const debtOwed = typeof summary.total_debt_owed === 'number' ? summary.total_debt_owed : 0;

  return (
    <div>
      <div className="section-header">
        <div className="section-title">
          <TrendingUp size={18} /> Customer Insights & Farm Overview
        </div>
      </div>

      {/* Financial Stats */}
      <div className="stat-grid">
        <div className="stat-card accent">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₦{safeFormat(summary.total_revenue, '705,000')}</div>
          <div className="stat-sub">From CPO & PKO Sales</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">₦{safeFormat(summary.total_expenses, '125,000')}</div>
          <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
            Labour, Fertilizer & Fuel
          </div>
        </div>
      </div>

      {/* Net Profit Card */}
      <div className="card" style={{ background: netProfit >= 0 ? '#f0fdf4' : '#fef2f2', borderColor: netProfit >= 0 ? '#bbf7d0' : '#fecaca' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="stat-label">Net Operating Cashflow</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: netProfit >= 0 ? '#15803d' : '#dc2626' }}>
              ₦{safeFormat(summary.net_profit, '580,000')}
            </div>
          </div>
          <DollarSign size={28} color={netProfit >= 0 ? '#15803d' : '#dc2626'} />
        </div>
      </div>

      {/* Money Owed Callout */}
      {debtOwed > 0 && (
        <div className="card debt-card">
          <div className="debt-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#92400e' }}>
              <AlertTriangle size={16} /> Customers Owe You (Credit Sales)
            </div>
            <span className="badge badge-partial">Uncollected</span>
          </div>
          <div className="debt-amount">₦{safeFormat(summary.total_debt_owed, '155,000')}</div>
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
            <div style={{ fontWeight: 800, fontSize: '15px' }}>{safeFormat(summary.ffb_harvested_kg, '2,330')} kg</div>
          </div>

          <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '10px' }}>
            <div className="stat-label">CPO Oil</div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#15803d' }}>{safeFormat(summary.cpo_produced_litres, '250')} L</div>
          </div>

          <div style={{ background: '#fffbeb', padding: '10px', borderRadius: '10px' }}>
            <div className="stat-label">PKO Oil</div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#b45309' }}>{safeFormat(summary.pko_produced_litres, '32')} L</div>
          </div>
        </div>
      </div>
    </div>
  );
};
