import React, { useState, useEffect } from 'react';
import { Customer, Sale, Expense } from '../types';
import { Users, Package, Phone, MapPin, ChevronRight, ArrowLeft, Plus, X } from 'lucide-react';
import { api } from '../api';

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

const formatBadgeCategory = (cat?: string | null) => {
  if (!cat) return '';
  if (cat.toLowerCase() === 'industrial user') return 'INDUSTRIAL';
  if (cat.toLowerCase() === 'souvenir customer') return 'SOUVENIR';
  if (cat.toLowerCase() === 'direct consumer') return 'DIRECT CONSUMER';
  return cat.toUpperCase();
};

const formatCategoryHeaderTitle = (cat?: string | null, count: number = 0) => {
  if (!cat) return `Customers (${count})`;
  let name = cat;
  if (name.toLowerCase() === 'industrial user') name = 'Industrial';
  else if (name.toLowerCase() === 'souvenir customer') name = 'Souvenir';
  else if (name.toLowerCase() === 'direct consumer') name = 'Direct Consumer';
  else {
    name = name.replace(/\s+(customer|user)s?$/i, '');
  }
  return `${name} Customers (${count})`;
};

export const SalesDebtView: React.FC<SalesDebtViewProps> = ({ 
  customers: initialCustomers,
  onRefreshData
}) => {
  // Initially null -> shows vertical category cards layout
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Local state for customers to support immediate instant additions
  const [customerList, setCustomerList] = useState<Customer[]>(initialCustomers);

  useEffect(() => {
    setCustomerList(initialCustomers);
  }, [initialCustomers]);

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

  // Modal State for Adding/Editing Customer
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    location: '',
    segment: 'Direct consumer',
    preferred_product: 'Crude Palm Oil (CPO)'
  });
  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);

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

  const handleOpenAddCustomer = (defaultCategory?: string) => {
    setCustomerForm({
      name: '',
      phone: '',
      location: '',
      segment: defaultCategory || selectedCategory || 'Direct consumer',
      preferred_product: 'Crude Palm Oil (CPO)'
    });
    setIsAddCustomerOpen(true);
  };

  const handleOpenEditCustomer = (c: Customer) => {
    setEditingCustomer(c);
    setCustomerForm({
      name: c.name || '',
      phone: c.phone || '',
      location: c.location || '',
      segment: c.segment || selectedCategory || 'Direct consumer',
      preferred_product: c.preferred_product || 'Crude Palm Oil (CPO)'
    });
    setIsEditCustomerOpen(true);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name.trim()) return;

    setIsSubmittingCustomer(true);
    const newCustPayload: Partial<Customer> = {
      name: customerForm.name.trim(),
      phone: customerForm.phone.trim(),
      location: customerForm.location.trim(),
      segment: customerForm.segment,
      preferred_product: customerForm.preferred_product,
      total_purchased: 0,
      total_paid: 0,
      balance_due: 0
    };

    try {
      const created = await api.createCustomer(newCustPayload);
      if (created) {
        setCustomerList(prev => [created, ...prev]);
      }
    } catch (err) {
      console.warn('API createCustomer offline fallback mode:', err);
      const fallbackCust: Customer = {
        id: Date.now(),
        name: customerForm.name.trim(),
        phone: customerForm.phone.trim() || 'N/A',
        location: customerForm.location.trim() || 'N/A',
        segment: customerForm.segment,
        preferred_product: customerForm.preferred_product,
        total_purchased: 0,
        total_paid: 0,
        balance_due: 0
      };
      setCustomerList(prev => [fallbackCust, ...prev]);
    } finally {
      setIsSubmittingCustomer(false);
      setIsAddCustomerOpen(false);
      if (onRefreshData) onRefreshData();
    }
  };

  const handleSaveEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !customerForm.name.trim()) return;

    setIsSubmittingCustomer(true);
    const payload: Partial<Customer> = {
      name: customerForm.name.trim(),
      phone: customerForm.phone.trim(),
      location: customerForm.location.trim(),
      segment: customerForm.segment,
      preferred_product: customerForm.preferred_product
    };

    try {
      const updated = await api.updateCustomer(editingCustomer.id, payload);
      if (updated) {
        setCustomerList(prev => prev.map(item => item.id === editingCustomer.id ? { ...item, ...updated } : item));
      }
    } catch (err) {
      console.warn('API updateCustomer offline fallback mode:', err);
      setCustomerList(prev => prev.map(item => item.id === editingCustomer.id ? { ...item, ...payload } : item));
    } finally {
      setIsSubmittingCustomer(false);
      setIsEditCustomerOpen(false);
      setEditingCustomer(null);
      if (onRefreshData) onRefreshData();
    }
  };

  // Filter customers by selected broad category
  const filteredCustomers = !selectedCategory || selectedCategory === 'All'
    ? customerList 
    : customerList.filter(c => {
        const formatted = formatSegmentName(c.segment);
        return formatted.toLowerCase() === selectedCategory.toLowerCase() || c.segment?.toLowerCase() === selectedCategory.toLowerCase();
      });

  // Calculate count per category
  const getCategoryCount = (catName: string) => {
    return customerList.filter(c => {
      const formatted = formatSegmentName(c.segment);
      return formatted.toLowerCase() === catName.toLowerCase() || c.segment?.toLowerCase() === catName.toLowerCase();
    }).length;
  };

  return (
    <div>
      {/* SCENARIO 1: INITIAL LANDING - CRISP MINIMALIST CARDS WITH BOLD HARD SHADOW */}
      {selectedCategory === null ? (
        <div style={{ padding: '12px 0 32px 0' }}>
          {/* HEADER SECTION */}
          <div className="section-header" style={{ marginBottom: '28px', marginTop: '4px' }}>
            <div className="section-title" style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
              <Users size={20} color="#0f172a" /> Customer Categories
            </div>
          </div>

          {/* CRISP MINIMALIST RECTANGULAR CARDS WITH 4PX HARD DROP SHADOW */}
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
                    height: '84px',
                    padding: '0 20px',
                    borderRadius: '20px',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '2.5px solid #0f172a',
                    boxShadow: '4px 4px 0px #0f172a',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '44px', 
                      height: '44px', 
                      borderRadius: '14px', 
                      background: '#f8fafc', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '2px solid #0f172a',
                      flexShrink: 0
                    }}>
                      <Users size={22} color="#0f172a" />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.01em', color: '#0f172a' }}>
                        {cat}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
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
                      border: '2px solid #0f172a',
                      boxShadow: '1.5px 1.5px 0px #0f172a'
                    }}>
                      {count}
                    </span>
                    <ChevronRight size={20} color="#0f172a" />
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
                height: '60px',
                padding: '0 20px',
                borderRadius: '20px',
                background: '#ffffff',
                border: '2.5px dashed #0f172a',
                color: '#0f172a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 800,
                boxShadow: '3px 3px 0px #0f172a',
                transition: 'all 0.15s ease',
                marginTop: '4px'
              }}
            >
              <Plus size={18} color="#0f172a" /> Add New Customer Category
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
                border: '2px solid #0f172a',
                borderRadius: '12px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 800,
                color: '#0f172a',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '2px 2px 0px #0f172a'
              }}
            >
              <ArrowLeft size={15} /> Back to Categories
            </button>

            <span className="badge badge-paid" style={{ background: '#fff7ed', color: '#ea580c', border: '1.5px solid #0f172a', fontSize: '12px', padding: '5px 12px', fontWeight: 800 }}>
              {formatBadgeCategory(selectedCategory)}
            </span>
          </div>

          {/* CUSTOMERS DIRECTORY UNDER CATEGORY WITH RIGHT ALIGNED + ADD CUSTOMER BUTTON */}
          <div className="section-header" style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div className="section-title" style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
              <Users size={18} style={{ flexShrink: 0 }} /> 
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {formatCategoryHeaderTitle(selectedCategory, filteredCustomers.length)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddCustomer(selectedCategory)}
              style={{
                background: '#ea580c',
                color: '#ffffff',
                border: '2px solid #0f172a',
                borderRadius: '10px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '2px 2px 0px #0f172a',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              <Plus size={14} /> Add Customer
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {filteredCustomers.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: '#64748b', padding: '28px', border: '2px solid #0f172a', boxShadow: '3px 3px 0px #0f172a' }}>
                No customers registered under category <strong>"{selectedCategory}"</strong>.
              </div>
            ) : (
              filteredCustomers.map(c => {
                const displayCategory = formatSegmentName(c.segment);
                return (
                  <div 
                    key={c.id} 
                    className="card" 
                    onClick={() => handleOpenEditCustomer(c)}
                    style={{ 
                      marginBottom: 0, 
                      padding: '16px', 
                      border: '2px solid #0f172a', 
                      boxShadow: '3px 3px 0px #0f172a', 
                      borderRadius: '16px',
                      cursor: 'pointer',
                      background: '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, paddingRight: '8px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                          {c.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                          <span 
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              background: '#fff7ed',
                              color: '#ea580c',
                              border: '1px solid #0f172a',
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
                                fontWeight: 700,
                                background: '#f0f9ff',
                                color: '#0369a1',
                                border: '1px solid #0f172a',
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

                        <div style={{ display: 'flex', gap: '14px', marginTop: '8px', fontSize: '11px', color: '#64748b', fontWeight: 600, flexWrap: 'wrap' }}>
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

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {(c.balance_due ?? 0) > 0 ? (
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#dc2626' }}>
                              ₦{(c.balance_due ?? 0).toLocaleString()}
                            </div>
                            <div style={{ fontSize: '10px', color: '#b45309', fontWeight: 700, marginTop: '2px' }}>Owes Balance</div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#16a34a' }}>
                              Cleared
                            </div>
                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>No Debt</div>
                          </div>
                        )}
                        <div style={{ marginTop: '8px' }}>
                          <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: 800, background: '#fff7ed', border: '1px solid #0f172a', padding: '2px 8px', borderRadius: '8px' }}>
                            Edit Details
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* DASHED CARD TO ADD NEW CUSTOMER DIRECTLY IN THIS CATEGORY */}
            <button
              type="button"
              onClick={() => handleOpenAddCustomer(selectedCategory)}
              style={{
                width: '100%',
                height: '56px',
                padding: '0 20px',
                borderRadius: '16px',
                background: '#ffffff',
                border: '2.5px dashed #0f172a',
                color: '#0f172a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 800,
                boxShadow: '3px 3px 0px #0f172a',
                marginTop: '6px'
              }}
            >
              <Plus size={16} color="#0f172a" /> Add New Customer under {selectedCategory}
            </button>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {isAddCategoryOpen && (
        <div className="modal-overlay" onClick={() => setIsAddCategoryOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px', padding: '24px', borderRadius: '20px', border: '2.5px solid #0f172a', boxShadow: '6px 6px 0px #0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 800 }}>
                Add Customer Category
              </h3>
              <button 
                onClick={() => setIsAddCategoryOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCategory}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>
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
                    borderRadius: '12px',
                    border: '2px solid #0f172a',
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
                    borderRadius: '12px',
                    background: '#f1f5f9',
                    color: '#0f172a',
                    border: '2px solid #0f172a',
                    fontWeight: 800,
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
                    borderRadius: '12px',
                    background: '#ea580c',
                    color: '#ffffff',
                    border: '2px solid #0f172a',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '2px 2px 0px #0f172a'
                  }}
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {isAddCustomerOpen && (
        <div className="modal-overlay" onClick={() => setIsAddCustomerOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '24px', borderRadius: '20px', border: '2.5px solid #0f172a', boxShadow: '6px 6px 0px #0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 800 }}>
                Add New Customer
              </h3>
              <button 
                onClick={() => setIsAddCustomerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer}>
              {/* Field 1: Customer Name */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alhaji Musa Oil Depot"
                  value={customerForm.name}
                  onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '2px solid #0f172a',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Field 2: Phone Number */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 08055551122"
                  value={customerForm.phone}
                  onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '2px solid #0f172a',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Field 3: Location */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>
                  Location / Market
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Main Market, Benin"
                  value={customerForm.location}
                  onChange={e => setCustomerForm({ ...customerForm, location: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '2px solid #0f172a',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Field 4: Preferred Palm Product */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>
                  Preferred Palm Product
                </label>
                <select
                  className="form-input"
                  value={customerForm.preferred_product}
                  onChange={e => setCustomerForm({ ...customerForm, preferred_product: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '2px solid #0f172a',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    background: '#ffffff'
                  }}
                >
                  <option value="Crude Palm Oil (CPO)">Crude Palm Oil (CPO)</option>
                  <option value="Palm Kernel Oil (PKO)">Palm Kernel Oil (PKO)</option>
                  <option value="Palm Kernel Cake (PKC)">Palm Kernel Cake (PKC)</option>
                  <option value="Fresh Fruit Bunches (FFB)">Fresh Fruit Bunches (FFB)</option>
                </select>
              </div>

              {/* Field 5: Customer Category */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>
                  Customer Category
                </label>
                <select
                  className="form-input"
                  value={customerForm.segment}
                  onChange={e => setCustomerForm({ ...customerForm, segment: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '2px solid #0f172a',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    background: '#ffffff'
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsAddCustomerOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#f1f5f9',
                    color: '#0f172a',
                    border: '2px solid #0f172a',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCustomer}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#ea580c',
                    color: '#ffffff',
                    border: '2px solid #0f172a',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '2px 2px 0px #0f172a'
                  }}
                >
                  {isSubmittingCustomer ? 'Saving...' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CUSTOMER MODAL */}
      {isEditCustomerOpen && editingCustomer && (
        <div className="modal-overlay" onClick={() => setIsEditCustomerOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '24px', borderRadius: '20px', border: '2.5px solid #0f172a', boxShadow: '6px 6px 0px #0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 800 }}>
                Edit Customer Details
              </h3>
              <button 
                onClick={() => setIsEditCustomerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditCustomer}>
              {/* Field 1: Customer Name */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={customerForm.name}
                  onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '2px solid #0f172a',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Field 2: Phone Number */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={customerForm.phone}
                  onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '2px solid #0f172a',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Field 3: Location */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>
                  Location / Market
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={customerForm.location}
                  onChange={e => setCustomerForm({ ...customerForm, location: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '2px solid #0f172a',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Field 4: Preferred Product */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>
                  Preferred Palm Product
                </label>
                <select
                  className="form-input"
                  value={customerForm.preferred_product}
                  onChange={e => setCustomerForm({ ...customerForm, preferred_product: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '2px solid #0f172a',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    background: '#ffffff'
                  }}
                >
                  <option value="Crude Palm Oil (CPO)">Crude Palm Oil (CPO)</option>
                  <option value="Palm Kernel Oil (PKO)">Palm Kernel Oil (PKO)</option>
                  <option value="Palm Kernel Cake (PKC)">Palm Kernel Cake (PKC)</option>
                  <option value="Fresh Fruit Bunches (FFB)">Fresh Fruit Bunches (FFB)</option>
                </select>
              </div>

              {/* Field 5: Customer Category */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>
                  Customer Category / Subcategory
                </label>
                <select
                  className="form-input"
                  value={customerForm.segment}
                  onChange={e => setCustomerForm({ ...customerForm, segment: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '2px solid #0f172a',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    background: '#ffffff'
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsEditCustomerOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#f1f5f9',
                    color: '#0f172a',
                    border: '2px solid #0f172a',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCustomer}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#ea580c',
                    color: '#ffffff',
                    border: '2px solid #0f172a',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '2px 2px 0px #0f172a'
                  }}
                >
                  {isSubmittingCustomer ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
