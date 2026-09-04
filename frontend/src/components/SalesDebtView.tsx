import React, { useState } from 'react';
import { Customer, Sale, Expense } from '../types';
import { Users, Package, Phone, MapPin, ChevronRight, ArrowLeft, Plus, X } from 'lucide-react';

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
  if (lower.includes('consumer') || lower.includes('retail') || lower.includes('direct')) return 'Direct consumer';
  return seg;
};

export const SalesDebtView: React.FC<SalesDebtViewProps> = ({ 
  customers, 
}) => {
  // Initially null -> shows vertical category cards layout
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Dynamic categories state
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('davot_custom_customer_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return Array.from(new Set([...PRIMARY_CATEGORIES, ...parsed]));
        }
      } catch (e) {
        console.error('Error reading custom categories:', e);
      }
    }
    return [...PRIMARY_CATEGORIES];
  });

  // Modal State for Adding Category
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (!categories.includes(trimmed)) {
      const updated = [...categories, trimmed];
      setCategories(updated);
      const customOnly = updated.filter(c => !(PRIMARY_CATEGORIES as readonly string[]).includes(c));
      localStorage.setItem('davot_custom_customer_categories', JSON.stringify(customOnly));
    }
    setNewCatName('');
    setIsAddCategoryOpen(false);
  };

  // Filter customers by selected broad category
  const filteredCustomers = !selectedCategory || selectedCategory === 'All'
    ? customers 
    : customers.filter(c => {
        const formatted = formatSegmentName(c.segment);
        return formatted.toLowerCase() === selectedCategory.toLowerCase() || c.segment?.toLowerCase() === selectedCategory.toLowerCase();
      });

  // Calculate count per category
  const getCategoryCount = (catName: string) => {
    return customers.filter(c => {
      const formatted = formatSegmentName(c.segment);
      return formatted.toLowerCase() === catName.toLowerCase() || c.segment?.toLowerCase() === catName.toLowerCase();
    }).length;
  };

  return (
    <div>
      {/* SCENARIO 1: INITIAL LANDING - SPACIOUS FAINT ORANGE CARDS WITH GENEROUS BREATHING ROOM */}
      {selectedCategory === null ? (
        <div style={{ padding: '12px 0 32px 0' }}>
          {/* HEADER SECTION - CLEAN SINGLE LINE TITLE */}
          <div className="section-header" style={{ marginBottom: '28px', marginTop: '4px' }}>
            <div className="section-title" style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
              <Users size={20} color="#ea580c" /> Customer Categories
            </div>
          </div>

          {/* FAINT ORANGE CARDS WITH AIRY 20PX GAP */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {categories.map(cat => {
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '44px', 
                      height: '44px', 
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
                      <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: 600, marginTop: '2px' }}>
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

            {/* + DASHED CARD TO ADD CUSTOM CATEGORY */}
            <button
              type="button"
              onClick={() => setIsAddCategoryOpen(true)}
              style={{
                width: '100%',
                height: '64px',
                padding: '0 20px',
                borderRadius: '18px',
                background: '#fff7ed',
                border: '1.5px dashed #fdba74',
                color: '#ea580c',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 700,
                transition: 'all 0.2s ease',
                marginTop: '4px'
              }}
            >
              <Plus size={18} /> Add New Customer Category
            </button>
          </div>
        </div>
      ) : (
        /* SCENARIO 2: CATEGORY SELECTED DRILL-DOWN VIEW */
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

      {/* ADD CATEGORY MODAL */}
      {isAddCategoryOpen && (
        <div className="modal-overlay" onClick={() => setIsAddCategoryOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 800 }}>
                Add Customer Category
              </h3>
              <button 
                onClick={() => setIsAddCategoryOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCategory}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#475569' }}>
                  Category Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Wholesalers, Export Buyers..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsAddCategoryOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(234, 88, 12, 0.3)'
                  }}
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
