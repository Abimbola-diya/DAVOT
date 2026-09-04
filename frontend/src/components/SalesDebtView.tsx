import React, { useState } from 'react';
import { Customer, Sale, Expense } from '../types';
import { Users, Package, Phone, MapPin, ChevronRight, ArrowLeft } from 'lucide-react';

interface SalesDebtViewProps {
  customers: Customer[];
  sales?: Sale[];
  expenses?: Expense[];
  viewMode?: 'view' | 'edit';
  onLogPaymentClick?: (customerId: number, saleId?: number) => void;
  onRefreshData?: () => void;
}

const PRIMARY_CATEGORIES = ['Direct consumer', 'Industrial user', 'Souvenir customer'] as const;

const formatSegmentName = (seg?: string) => {
  if (!seg) return 'Direct consumer';
  const lower = seg.toLowerCase();
  if (lower.includes('soap') || lower.includes('industrial')) return 'Industrial user';
  if (lower.includes('trader') || lower.includes('souvenir')) return 'Souvenir customer';
  return 'Direct consumer';
};

export const SalesDebtView: React.FC<SalesDebtViewProps> = ({ 
  customers, 
}) => {
  // Initially null -> shows 3 vertical category cards layout
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter customers by selected broad category
  const filteredCustomers = !selectedCategory || selectedCategory === 'All'
    ? customers 
    : customers.filter(c => {
        const formatted = formatSegmentName(c.segment);
        return formatted.toLowerCase() === selectedCategory.toLowerCase();
      });

  // Calculate count per category
  const getCategoryCount = (catName: string) => {
    return customers.filter(c => {
      const formatted = formatSegmentName(c.segment);
      return formatted.toLowerCase() === catName.toLowerCase();
    }).length;
  };

  return (
    <div>
      {/* SCENARIO 1: INITIAL LANDING - SPACIOUS FAINT ORANGE CARDS WITH GENEROUS BREATHING ROOM */}
      {selectedCategory === null ? (
        <div style={{ padding: '12px 0 32px 0' }}>
          {/* HEADER SECTION WITH GENEROUS BOTTOM MARGIN */}
          <div className="section-header" style={{ marginBottom: '28px', marginTop: '4px' }}>
            <div className="section-title" style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              <Users size={20} color="#ea580c" /> Customer Categories
            </div>
            <span className="badge badge-paid" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', padding: '5px 12px', fontSize: '11px' }}>
              {customers.length} Total Registered
            </span>
          </div>

          {/* 3 FAINT ORANGE CARDS WITH AIRY 20PX GAP */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {PRIMARY_CATEGORIES.map(cat => {
              const count = getCategoryCount(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    width: '100%',
                    height: '88px',
                    padding: '0 20px',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                    color: '#9a3412',
                    border: '1.5px solid #fed7aa',
                    boxShadow: '0 6px 16px -4px rgba(234, 88, 12, 0.12), 0 2px 4px -1px rgba(234, 88, 12, 0.06)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '46px', 
                      height: '46px', 
                      borderRadius: '12px', 
                      background: '#ffedd5', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px solid #fdba74',
                      flexShrink: 0
                    }}>
                      <Users size={22} color="#ea580c" />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.01em', color: '#7c2d12' }}>
                        {cat}
                      </div>
                      <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: 600, marginTop: '3px' }}>
                        View registered category buyers
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      background: '#ea580c',
                      color: '#ffffff',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)'
                    }}>
                      {count}
                    </span>
                    <ChevronRight size={20} color="#ea580c" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* SCENARIO 2: CATEGORY SELECTED DRILL-DOWN VIEW (AIRY SPACING) */
        <div style={{ padding: '8px 0 28px 0' }}>
          {/* Header & Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <ArrowLeft size={15} /> Back to Categories
            </button>

            <span className="badge badge-paid" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', fontSize: '12px', padding: '5px 12px' }}>
              {selectedCategory}
            </span>
          </div>

          {/* CUSTOMERS DIRECTORY UNDER CATEGORY */}
          <div className="section-header" style={{ marginBottom: '18px' }}>
            <div className="section-title">
              <Users size={18} /> {selectedCategory} Customers ({filteredCustomers.length})
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {filteredCustomers.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: '#64748b', padding: '28px' }}>
                No customers registered under category <strong>"{selectedCategory}"</strong>.
              </div>
            ) : (
              filteredCustomers.map(c => {
                const displayCategory = formatSegmentName(c.segment);
                return (
                  <div key={c.id} className="card" style={{ marginBottom: 0, padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                          {c.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                          <span 
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              background: '#fff7ed',
                              color: '#c2410c',
                              border: '1px solid #ffedd5',
                              padding: '3px 10px',
                              borderRadius: '12px'
                            }}
                          >
                            {displayCategory}
                          </span>

                          {c.preferred_product && (
                            <span 
                              style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                background: '#f0f9ff',
                                color: '#0369a1',
                                border: '1px solid #e0f2fe',
                                padding: '3px 10px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Package size={10} /> {c.preferred_product}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '14px', marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
                          {c.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={11} /> {c.phone}
                            </span>
                          )}
                          {c.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={11} /> {c.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        {(c.balance_due ?? 0) > 0 ? (
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#dc2626' }}>
                              ₦{(c.balance_due ?? 0).toLocaleString()}
                            </div>
                            <div style={{ fontSize: '10px', color: '#b45309', fontWeight: 600, marginTop: '2px' }}>Owes Balance</div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>
                              Cleared
                            </div>
                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>No Debt</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
