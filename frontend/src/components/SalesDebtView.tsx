import React, { useState, useEffect } from 'react';
import { Customer, Sale, Expense } from '../types';
import { Users, Plus, X, Package, Phone, MapPin, ChevronRight, ArrowLeft } from 'lucide-react';

interface SalesDebtViewProps {
  customers: Customer[];
  sales?: Sale[];
  expenses?: Expense[];
  viewMode?: 'view' | 'edit';
  onLogPaymentClick?: (customerId: number, saleId?: number) => void;
  onRefreshData?: () => void;
}

const DEFAULT_CATEGORIES = ['Direct consumer', 'Industrial user', 'Souvenir customer'];

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
  viewMode = 'view'
}) => {
  // Initially null -> shows 3 vertical prominent orange pills layout
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Dynamic Categories state initialized with default 3 categories
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('davot_customer_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return Array.from(new Set([...DEFAULT_CATEGORIES, ...parsed]));
        }
      } catch (e) {
        console.error('Error parsing stored customer categories', e);
      }
    }
    return DEFAULT_CATEGORIES;
  });

  // Modal States
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('davot_customer_categories', JSON.stringify(categories));
  }, [categories]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (!categories.includes(trimmed)) {
      const updated = [...categories, trimmed];
      setCategories(updated);
      setSelectedCategory(trimmed);
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
    if (catName === 'All') return customers.length;
    return customers.filter(c => {
      const formatted = formatSegmentName(c.segment);
      return formatted.toLowerCase() === catName.toLowerCase() || c.segment?.toLowerCase() === catName.toLowerCase();
    }).length;
  };

  const themeColor = viewMode === 'edit' ? '#ea580c' : '#15803d';

  return (
    <div>
      {/* SCENARIO 1: INITIAL LANDING - 3 VERTICAL ORANGE PILLS OCCUPYING THE SCREEN */}
      {selectedCategory === null ? (
        <div style={{ padding: '4px 0' }}>
          <div className="section-header" style={{ marginBottom: '14px' }}>
            <div className="section-title" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              <Users size={20} color="#ea580c" /> Select Customer Category
            </div>
            <span className="badge badge-paid" style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5' }}>
              {customers.length} Total Registered
            </span>
          </div>

          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '-6px', marginBottom: '20px' }}>
            Tap a customer category below to view registered buyers, preferences, and debt records.
          </p>

          {/* 3 VERTICALLY ARRANGED PROMINENT ORANGE PILLS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {categories.map(cat => {
              const count = getCategoryCount(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: '0 8px 20px -4px rgba(234, 88, 12, 0.4), 0 4px 6px -2px rgba(234, 88, 12, 0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '12px', 
                      background: 'rgba(255, 255, 255, 0.22)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backdropFilter: 'blur(4px)'
                    }}>
                      <Users size={20} color="#ffffff" />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.01em', color: '#ffffff' }}>
                        {cat}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginTop: '2px' }}>
                        View registered category buyers
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      background: '#ffffff',
                      color: '#c2410c',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {count}
                    </span>
                    <ChevronRight size={20} color="#ffffff" />
                  </div>
                </button>
              );
            })}

            {/* 'View All Registered Customers' Pill Option */}
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '16px',
                background: '#ffffff',
                color: '#334155',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={18} color="#64748b" />
                <span style={{ fontSize: '14px', fontWeight: 700 }}>All Registered Customers</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: '12px' }}>
                {customers.length}
              </span>
            </button>

            {/* + Add Custom Category Button */}
            <button
              type="button"
              onClick={() => setIsAddCategoryOpen(true)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: 700,
                border: '1.5px dashed #ea580c',
                background: '#fff7ed',
                color: '#c2410c',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '4px'
              }}
            >
              <Plus size={16} /> Add Custom Category
            </button>
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
                padding: '6px 12px',
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
              <ArrowLeft size={14} /> Back to Categories
            </button>

            <span className="badge badge-paid" style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5' }}>
              {selectedCategory}
            </span>
          </div>

          {/* Horizontal Pill Track for Quick Category Switch */}
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
            {/* 'All' Pill */}
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                border: selectedCategory === 'All' ? 'none' : '1px solid #e2e8f0',
                background: selectedCategory === 'All' ? 'linear-gradient(135deg, #ea580c, #c2410c)' : '#ffffff',
                color: selectedCategory === 'All' ? '#ffffff' : '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              All
              <span style={{ fontSize: '10px', fontWeight: 800, background: selectedCategory === 'All' ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: selectedCategory === 'All' ? '#ffffff' : '#64748b', padding: '2px 6px', borderRadius: '10px' }}>
                {customers.length}
              </span>
            </button>

            {categories.map(cat => {
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
                    background: isSelected ? 'linear-gradient(135deg, #ea580c, #c2410c)' : '#ffffff',
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
              <Users size={18} /> {selectedCategory === 'All' ? 'All Registered Customers' : `${selectedCategory} Customers`} ({filteredCustomers.length})
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

      {/* ADD CATEGORY MODAL */}
      {isAddCategoryOpen && (
        <div className="modal-overlay" onClick={() => setIsAddCategoryOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 700 }}>
                Add Broad Customer Category
              </h3>
              <button 
                onClick={() => setIsAddCategoryOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCategory}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Wholesalers, Export Buyers..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsAddCategoryOpen(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  style={{ flex: 1, background: themeColor }}
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
