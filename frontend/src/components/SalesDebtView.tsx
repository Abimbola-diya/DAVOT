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
  // Initially null -> shows 3 vertical prominent category pills layout
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
      {/* SCENARIO 1: INITIAL LANDING - 3 SPACIOUS SOPHISTICATED TERRACOTTA/AMBER CARDS */}
      {selectedCategory === null ? (
        <div style={{ minHeight: '62vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px 0 20px 0' }}>
          <div className="section-header" style={{ marginBottom: '12px' }}>
            <div className="section-title" style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              <Users size={20} color="#c2410c" /> Customer Categories
            </div>
            <span className="badge badge-paid" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', padding: '4px 10px' }}>
              {customers.length} Total Registered
            </span>
          </div>

          {/* 3 SPACIOUS, SOPHISTICATED CARDS SPANNING THE SCREEN HEIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center' }}>
            {PRIMARY_CATEGORIES.map(cat => {
              const count = getCategoryCount(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    width: '100%',
                    padding: '24px 22px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #c2410c, #9a3412)',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: '0 12px 24px -6px rgba(194, 65, 12, 0.28), 0 4px 8px -2px rgba(154, 52, 18, 0.15)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '46px', 
                      height: '46px', 
                      borderRadius: '14px', 
                      background: 'rgba(255, 255, 255, 0.18)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <Users size={24} color="#ffffff" />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em', color: '#ffffff' }}>
                        {cat}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.82)', fontWeight: 500, marginTop: '3px' }}>
                        View registered category buyers
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 800,
                      background: '#ffffff',
                      color: '#9a3412',
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 3px 6px rgba(0,0,0,0.12)'
                    }}>
                      {count}
                    </span>
                    <ChevronRight size={22} color="rgba(255, 255, 255, 0.9)" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* SCENARIO 2: CATEGORY SELECTED DRILL-DOWN VIEW */
        <div>
          {/* Header & Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <ArrowLeft size={15} /> Back to Categories
            </button>

            <span className="badge badge-paid" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', fontSize: '12px', padding: '4px 10px' }}>
              {selectedCategory}
            </span>
          </div>

          {/* Quick Category Tabs */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              padding: '4px 2px 14px 2px',
              whiteSpace: 'nowrap',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none'
            }}
          >
            {PRIMARY_CATEGORIES.map(cat => {
              const count = getCategoryCount(cat);
              const isSelected = selectedCategory?.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    border: isSelected ? 'none' : '1px solid #e2e8f0',
                    background: isSelected ? 'linear-gradient(135deg, #c2410c, #9a3412)' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {cat}
                  <span style={{ fontSize: '10px', fontWeight: 800, background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: isSelected ? '#ffffff' : '#64748b', padding: '2px 6px', borderRadius: '10px' }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* CUSTOMERS DIRECTORY UNDER CATEGORY */}
          <div className="section-header">
            <div className="section-title">
              <Users size={18} /> {selectedCategory} Customers ({filteredCustomers.length})
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {filteredCustomers.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                No customers registered under category <strong>"{selectedCategory}"</strong>.
              </div>
            ) : (
              filteredCustomers.map(c => {
                const displayCategory = formatSegmentName(c.segment);
                return (
                  <div key={c.id} className="card" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                          {c.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                          <span 
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              background: '#fff7ed',
                              color: '#c2410c',
                              border: '1px solid #ffedd5',
                              padding: '2px 9px',
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
                                padding: '2px 9px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <Package size={10} /> {c.preferred_product}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '11px', color: '#64748b' }}>
                          {c.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Phone size={11} /> {c.phone}
                            </span>
                          )}
                          {c.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
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
                            <div style={{ fontSize: '10px', color: '#b45309', fontWeight: 600 }}>Owes Balance</div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>
                              Cleared
                            </div>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>No Debt</div>
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
