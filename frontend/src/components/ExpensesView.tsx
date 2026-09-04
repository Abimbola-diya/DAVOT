import React from 'react';
import { Expense } from '../types';
import { Receipt, Tag } from 'lucide-react';

interface ExpensesViewProps {
  expenses: Expense[];
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ expenses }) => {
  return (
    <div>
      <div className="section-header">
        <div className="section-title">
          <Receipt size={18} /> Farm Operational Expenses
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {expenses.map(e => (
          <div key={e.id} className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-partial" style={{ fontSize: '10px', background: '#e2e8f0', color: '#334155' }}>
                    <Tag size={10} style={{ display: 'inline', marginRight: '2px' }} /> {e.category}
                  </span>
                  {e.block_name && (
                    <span className="badge badge-paid" style={{ fontSize: '9px' }}>
                      {e.block_name}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>
                  {e.description}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Paid via {e.payment_method} • {new Date(e.date).toLocaleDateString()}
                  {e.supplier_name ? ` • Supplier: ${e.supplier_name}` : ''}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#dc2626' }}>
                  ₦{e.amount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
