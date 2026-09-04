import React, { useState, useEffect } from 'react';
import { Customer, Sale, Expense } from '../types';
import { AlertTriangle, Users, Plus, X, Package, Phone, MapPin } from 'lucide-react';

interface SalesDebtViewProps {
  customers: Customer[];
  sales?: Sale[];
  expenses?: Expense[];
  viewMode?: 'view' | 'edit';
  onLogPaymentClick?: (customerId: number, saleId?: number) => void;
  onRefreshData?: () => void;
}

const DEFAULT_CATEGORIES = ['Direct buyers', 'Industrial user', 'Souvenir customers'];

export const SalesDebtView: React.FC<SalesDebtViewProps> = ({ 
  customers, 
  viewMode = 'view',
  onLogPaymentClick
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
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
  const filteredCustomers = selectedCategory === 'All' 
    ? customers 
    : customers.filter(c => c.segment?.toLowerCase() === selectedCategory.toLowerCase());

  const filteredDebtors = filteredCustomers.filter(c => c.balance_due > 0);

  // Calculate count per category
  const getCategoryCount = (catName: string) => {
    if (catName === 'All') return customers.length;
    return customers.filter(c => c.segment?.toLowerCase() === catName.toLowerCase()).length;
  };

  const themeColor = viewMode === 'edit' ? '#ea580c' : '#15803d';

  return (
    <div>
      {/* CENTRALIZED CATEGORY PILLS (3 Broad Categories) */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700, marginBottom: '10px' }}>
          Customer Broad Categories
        </div>
        
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            flexWrap: 'wrap',
            background: '#f8fafc',
            padding: '6px 10px',
            borderRadius: '30px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
          }}
        >
          {/* 'All' Pill */}
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: 'none',
              background: selectedCategory === 'All' 
                ? (viewMode === 'edit' ? 'linear-gradient(135deg, #ea580c, #c2410c)' : 'linear-gradient(135deg, #15803d, #166534)')
                : 'transparent',
              color: selectedCategory === 'All' ? '#ffffff' : '#64748b',
              boxShadow: selectedCategory === 'All' 
                ? (viewMode === 'edit' ? '0 3px 10px rgba(234, 88, 12, 0.25)' : '0 3px 10px rgba(21, 128, 61, 0.25)') 
                : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            All
            <span 
              style={{ 
                fontSize: '10px', 
                background: selectedCategory === 'All' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: selectedCategory === 'All' ? '#fff' : '#475569',
                padding: '1px 6px',
                borderRadius: '10px'
              }}
            >
              {customers.length}
            </span>
          </button>

          {/* 3 Main Broad Categories & Custom Categories */}
          {categories.map(cat => {
            const count = getCategoryCount(cat);
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  border: 'none',
                  background: isSelected 
                    ? (viewMode === 'edit' ? 'linear-gradient(135deg, #ea580c, #c2410c)' : 'linear-gradient(135deg, #15803d, #166534)')
                    : 'transparent',
                  color: isSelected ? '#ffffff' : '#64748b',
                  boxShadow: isSelected 
                    ? (viewMode === 'edit' ? '0 3px 10px rgba(234, 88, 12, 0.25)' : '0 3px 10px rgba(21, 128, 61, 0.25)') 
                    : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {cat}
                <span 
                  style={{ 
                    fontSize: '10px', 
                    background: isSelected ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                    color: isSelected ? '#fff' : '#475569',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* + Add Category Option */}
          <button
            type="button"
            onClick={() => setIsAddCategoryOpen(true)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              border: '1px dashed #cbd5e1',
              background: '#ffffff',
              color: '#0284c7',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={13} /> Add Category
          </button>
        </div>
      </div>

      {/* SECTION 1: MONEY OWED / DEBTORS IN CATEGORY */}
      {filteredDebtors.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div className="section-header">
            <div className="section-title" style={{ color: '#b45309' }}>
              <AlertTriangle size={18} /> Money Owed by Customers ({filteredDebtors.length})
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredDebtors.map(c => (
              <div key={c.id} className="card debt-card">
                <div className="debt-header">
                  <div>
                    <div className="debt-name">{c.name}</div>
                    <div style={{ fontSize: '11px', color: '#78350f', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span>Category: <strong>{c.segment}</strong></span>
                      {c.preferred_product && (
                        <span>• Palm Product: <strong>{c.preferred_product}</strong></span>
                      )}
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
        </div>
      )}

      {/* SECTION 2: CUSTOMERS DIRECTORY UNDER CATEGORY */}
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
          filteredCustomers.map(c => (
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
                        background: '#ffedd5',
                        color: '#9a3412',
                        padding: '2px 9px',
                        borderRadius: '12px'
                      }}
                    >
                      {c.segment || 'General'}
                    </span>

                    {c.preferred_product && (
                      <span 
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          background: '#e0f2fe',
                          color: '#0369a1',
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
                  {c.balance_due > 0 ? (
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#dc2626' }}>
                        ₦{c.balance_due.toLocaleString()}
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
          ))
        )}
      </div>

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
