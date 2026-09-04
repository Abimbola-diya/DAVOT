import React, { useState } from 'react';
import { Customer, Sale, Expense } from '../types';
import { ShoppingBag, AlertTriangle, CheckCircle, Receipt, Tag } from 'lucide-react';

interface SalesDebtViewProps {
  customers: Customer[];
  sales: Sale[];
  expenses?: Expense[];
  onLogPaymentClick?: (customerId: number, saleId?: number) => void;
}

export const SalesDebtView: React.FC<SalesDebtViewProps> = ({ 
  customers, 
  sales, 
  expenses = [], 
  onLogPaymentClick 
}) => {
  const [financeTab, setFinanceTab] = useState<'sales' | 'expenses'>('sales');
  const debtors = customers.filter(c => c.balance_due > 0);

  return (
    <div>
      {/* Sub-Tab Navigation Header */}
      <div 
        style={{
          display: 'flex',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '16px',
          gap: '4px'
        }}
      >
        <button
          type="button"
          onClick={() => setFinanceTab('sales')}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: 600,
            border: 'none',
            borderRadius: '9px',
            cursor: 'pointer',
            background: financeTab === 'sales' ? '#ffffff' : 'transparent',
            color: financeTab === 'sales' ? '#0f172a' : '#64748b',
            boxShadow: financeTab === 'sales' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <ShoppingBag size={15} />
          Sales & Debt
        </button>

        <button
          type="button"
          onClick={() => setFinanceTab('expenses')}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: 600,
            border: 'none',
            borderRadius: '9px',
            cursor: 'pointer',
            background: financeTab === 'expenses' ? '#ffffff' : 'transparent',
            color: financeTab === 'expenses' ? '#0f172a' : '#64748b',
            boxShadow: financeTab === 'expenses' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Receipt size={15} />
          Expenses ({expenses.length})
        </button>
      </div>

      {financeTab === 'expenses' ? (
        <div>
          <div className="section-header">
            <div className="section-title">
              <Receipt size={18} /> Farm Operational Expenses
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {expenses.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: '#64748b' }}>
                No expenses logged yet.
              </div>
            ) : (
              expenses.map(e => (
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
              ))
            )}
          </div>
        </div>
      ) : (
        <>
          {/* SECTION 1: MONEY OWED (DEBTORS) */}
          <div className="section-header">
            <div className="section-title" style={{ color: '#b45309' }}>
              <AlertTriangle size={18} /> Money Owed by Customers
            </div>
            <span className="badge badge-partial">{debtors.length} Debtors</span>
          </div>

          {debtors.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: '#15803d', background: '#f0fdf4' }}>
              <CheckCircle size={24} style={{ margin: '0 auto 6px auto', display: 'block' }} />
              <div style={{ fontWeight: 700 }}>No outstanding customer debts!</div>
              <div style={{ fontSize: '12px' }}>All buyers have cleared their payments.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {debtors.map(c => (
                <div key={c.id} className="card debt-card">
                  <div className="debt-header">
                    <div>
                      <div className="debt-name">{c.name}</div>
                      <div style={{ fontSize: '11px', color: '#78350f' }}>
                        Segment: {c.segment} • Phone: {c.phone || 'N/A'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="debt-amount">₦{c.balance_due.toLocaleString()}</div>
                      <div style={{ fontSize: '10px', color: '#92400e' }}>Outstanding</div>
                    </div>
                  </div>

                  {onLogPaymentClick && (
                    <button
                      className="submit-btn"
                      style={{ 
                        padding: '8px 12px', 
                        fontSize: '12px', 
                        background: '#d97706',
                        marginTop: '8px'
                      }}
                      onClick={() => onLogPaymentClick(c.id)}
                    >
                      Log Payment Received (Offline)
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SECTION 2: RECENT SALES RECORDS */}
          <div className="section-header">
            <div className="section-title">
              <ShoppingBag size={18} /> Recorded Sales History
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sales.map(s => (
              <div key={s.id} className="card" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{s.customer_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {s.product_name} • {s.quantity} {s.unit} @ ₦{s.unit_price.toLocaleString()}/{s.unit}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                      Invoice: {s.invoice_number} • {new Date(s.date).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary-green-dark)' }}>
                      ₦{s.total_amount.toLocaleString()}
                    </div>
                    <span className={`badge badge-${s.payment_status.toLowerCase()}`}>
                      {s.payment_status}
                    </span>
                    {s.balance_due > 0 && (
                      <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: 700, marginTop: '2px' }}>
                        Owes ₦{s.balance_due.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
