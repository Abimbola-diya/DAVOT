import React, { useState, useEffect } from 'react';
import { Customer, Sale, Expense } from '../types';
import { Users, Plus, X, Package, Phone, MapPin } from 'lucide-react';

interface SalesDebtViewProps {
  customers: Customer[];
  sales?: Sale[];
  expenses?: Expense[];
  viewMode?: 'view' | 'edit';
  onLogPaymentClick?: (customerId: number, saleId?: number) => void;
  onRefreshData?: () => void;
}

const DEFAULT_CATEGORIES = ['Direct buyers', 'Industrial user', 'Souvenir customers'];

const formatSegmentName = (seg?: string) => {
  if (!seg) return 'Direct buyers';
  const lower = seg.toLowerCase();
  if (lower.includes('soap') || lower.includes('industrial')) return 'Industrial user';
  if (lower.includes('consumer') || lower.includes('retail')) return 'Direct buyers';
  if (lower.includes('trader') || lower.includes('souvenir')) return 'Souvenir customers';
  return seg;
};

export const SalesDebtView: React.FC<SalesDebtViewProps> = ({ 
  customers, 
  viewMode = 'view'
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
      {/* CENTRALIZED CATEGORY PILLS BAR (3 Broad Categories) */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 800, marginBottom: '12px', textAlign: 'center' }}>
          Customer Categories
        </div>
        
        {/* Horizontal Scroll Pill Track */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            overflowX: 'auto',
            padding: '4px 2px 10px 2px',
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
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: selectedCategory === 'All' ? 'none' : '1px solid #e2e8f0',
              background: selectedCategory === 'All' 
                ? (viewMode === 'edit' ? 'linear-gradient(135deg, #ea580c, #c2410c)' : 'linear-gradient(135deg, #15803d, #166534)')
                : '#ffffff',
              color: selectedCategory === 'All' ? '#ffffff' : '#475569',
              boxShadow: selectedCategory === 'All' 
                ? (viewMode === 'edit' ? '0 4px 14px rgba(234, 88, 12, 0.3)' : '0 4px 14px rgba(21, 128, 61, 0.3)') 
                : '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            All
            <span 
              style={{ 
                fontSize: '11px', 
                fontWeight: 800,
                background: selectedCategory === 'All' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: selectedCategory === 'All' ? '#ffffff' : '#64748b',
                padding: '2px 8px',
                borderRadius: '12px'
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
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  border: isSelected ? 'none' : '1px solid #e2e8f0',
                  background: isSelected 
                    ? (viewMode === 'edit' ? 'linear-gradient(135deg, #ea580c, #c2410c)' : 'linear-gradient(135deg, #15803d, #166534)')
                    : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  boxShadow: isSelected 
                    ? (viewMode === 'edit' ? '0 4px 14px rgba(234, 88, 12, 0.3)' : '0 4px 14px rgba(21, 128, 61, 0.3)') 
                    : '0 1px 3px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {cat}
                <span 
                  style={{ 
                    fontSize: '11px', 
                    fontWeight: 800,
                    background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#64748b',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* + Add Category Button */}
          <button
            type="button"
            onClick={() => setIsAddCategoryOpen(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: '1.5px dashed #cbd5e1',
              background: '#ffffff',
              color: '#0284c7',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={14} /> Add Category
          </button>
        </div>
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
