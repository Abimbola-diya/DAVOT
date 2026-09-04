import React, { useState } from 'react';
import { FarmBlock, Customer, Supplier, Sale } from '../../types';
import { api } from '../../api';

interface ModalProps {
  formType: string;
  blocks: FarmBlock[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_CATEGORIES = ['Direct buyers', 'Industrial user', 'Souvenir customers'];
const PALM_PRODUCT_OPTIONS = [
  'Crude Palm Oil (CPO)',
  'Palm Kernel Oil (PKO)',
  'Palm Kernel Cake (PKC)',
  'Fresh Fruit Bunches (FFB)',
  'Palm Kernels (PK)',
  'Palm Biomass (Fibre & Shells)',
  'All Palm Products'
];

export const Modals: React.FC<ModalProps> = ({
  formType, blocks, customers, onClose, onSuccess
}) => {
  const [loading, setLoading] = useState(false);

  // Broad Customer Categories state
  const [customerCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('davot_customer_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return Array.from(new Set([...DEFAULT_CATEGORIES, ...parsed]));
        }
      } catch (e) {
        console.error('Error parsing categories', e);
      }
    }
    return DEFAULT_CATEGORIES;
  });

  // Customer state
  const [custName, setCustName] = useState('');
  const [custSegment, setCustSegment] = useState(customerCategories[0] || 'Direct buyers');
  const [custPreferredProduct, setCustPreferredProduct] = useState(PALM_PRODUCT_OPTIONS[0]);
  const [custPhone, setCustPhone] = useState('');
  const [custLocation, setCustLocation] = useState('');

  // Harvest state
  const [blockId, setBlockId] = useState(blocks[0]?.id || 1);
  const [bunchCount, setBunchCount] = useState('');
  const [ffbWeight, setFfbWeight] = useState('');
  const [labourCost, setLabourCost] = useState('');

  // Processing state
  const [ffbInput, setFfbInput] = useState('');
  const [cpoOutput, setCpoOutput] = useState('');
  const [kernelOutput, setKernelOutput] = useState('');

  // Kernel Processing state
  const [kernelInput, setKernelInput] = useState('');
  const [pkoOutput, setPkoOutput] = useState('');
  const [pkcOutput, setPkcOutput] = useState('');

  // Sale state
  const [customerId, setCustomerId] = useState(customers[0]?.id || 1);
  const [productName, setProductName] = useState('Crude Palm Oil (CPO)');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('litres');
  const [unitPrice, setUnitPrice] = useState('');
  const [amountPaid, setAmountPaid] = useState('');

  // Payment state
  const [payCustomerId, setPayCustomerId] = useState(customers[0]?.id || 1);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Bank Transfer');

  // Expense state
  const [category, setCategory] = useState('Labour');
  const [description, setDescription] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expMethod, setExpMethod] = useState('Cash');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formType === 'customer') {
        await api.createCustomer({
          name: custName.trim(),
          segment: custSegment,
          preferred_product: custPreferredProduct,
          phone: custPhone.trim() || undefined,
          location: custLocation.trim() || undefined,
        });
      } else if (formType === 'harvest') {
        await api.createHarvest({
          block_id: Number(blockId),
          bunch_count: Number(bunchCount),
          ffb_weight_kg: Number(ffbWeight),
          labour_cost: Number(labourCost) || 0,
        });
      } else if (formType === 'cpo') {
        await api.createCpoBatch({
          ffb_input_kg: Number(ffbInput),
          cpo_output_litres: Number(cpoOutput),
          kernel_output_kg: Number(kernelOutput) || 0,
        });
      } else if (formType === 'kernel') {
        await api.createKernelBatch({
          kernel_input_kg: Number(kernelInput),
          pko_output_litres: Number(pkoOutput),
          pkc_output_bags: Number(pkcOutput) || 0,
        });
      } else if (formType === 'sale') {
        await api.createSale({
          customer_id: Number(customerId),
          product_name: productName,
          quantity: Number(quantity),
          unit: unit,
          unit_price: Number(unitPrice),
          amount_paid: Number(amountPaid) || 0,
        });
      } else if (formType === 'payment') {
        await api.logPayment({
          customer_id: Number(payCustomerId),
          amount_paid: Number(payAmount),
          payment_method: payMethod,
        });
      } else if (formType === 'expense') {
        await api.createExpense({
          category,
          description,
          amount: Number(expAmount),
          payment_method: expMethod,
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      alert(`Error saving record: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="form-card">
          <h3 style={{ marginBottom: '14px', color: 'var(--primary-green-dark)' }}>
            {formType === 'customer' && 'Add New Customer'}
            {formType === 'harvest' && 'Record Harvest'}
            {formType === 'cpo' && 'Record CPO Oil Processing'}
            {formType === 'kernel' && 'Record Kernel Oil Processing'}
            {formType === 'sale' && 'Record Product Sale'}
            {formType === 'payment' && 'Log Payment Received (Offline)'}
            {formType === 'expense' && 'Record Expense'}
          </h3>

          <form onSubmit={handleSubmit}>
            {/* CUSTOMER FORM */}
            {formType === 'customer' && (
              <>
                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Chief Okon / Sunshine Agro Ltd"
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Broad Category Type</label>
                  <select
                    className="form-select"
                    value={custSegment}
                    onChange={e => setCustSegment(e.target.value)}
                  >
                    {customerCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Palm Product Bought / Interest</label>
                  <select
                    className="form-select"
                    value={custPreferredProduct}
                    onChange={e => setCustPreferredProduct(e.target.value)}
                  >
                    {PALM_PRODUCT_OPTIONS.map(prod => (
                      <option key={prod} value={prod}>{prod}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 08012345678"
                    value={custPhone}
                    onChange={e => setCustPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Benin City / Aba Central Market"
                    value={custLocation}
                    onChange={e => setCustLocation(e.target.value)}
                  />
                </div>
              </>
            )}
            {/* HARVEST FORM */}
            {formType === 'harvest' && (
              <>
                <div className="form-group">
                  <label className="form-label">Select Farm Block</label>
                  <select className="form-select" value={blockId} onChange={e => setBlockId(Number(e.target.value))}>
                    {blocks.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.area_hectares} ha)</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Number of Bunches</label>
                  <input type="number" className="form-input" placeholder="e.g. 45" required value={bunchCount} onChange={e => setBunchCount(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Total FFB Weight (kg)</label>
                  <input type="number" className="form-input" placeholder="e.g. 1280" required value={ffbWeight} onChange={e => setFfbWeight(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Harvester Labour Cost (₦)</label>
                  <input type="number" className="form-input" placeholder="e.g. 25000" value={labourCost} onChange={e => setLabourCost(e.target.value)} />
                </div>
              </>
            )}

            {/* CPO PROCESSING FORM */}
            {formType === 'cpo' && (
              <>
                <div className="form-group">
                  <label className="form-label">FFB Input Weight (kg)</label>
                  <input type="number" className="form-input" placeholder="e.g. 1350" required value={ffbInput} onChange={e => setFfbInput(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">CPO Palm Oil Produced (Litres)</label>
                  <input type="number" className="form-input" placeholder="e.g. 250" required value={cpoOutput} onChange={e => setCpoOutput(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Palm Kernels Recovered (kg)</label>
                  <input type="number" className="form-input" placeholder="e.g. 95" value={kernelOutput} onChange={e => setKernelOutput(e.target.value)} />
                </div>
              </>
            )}

            {/* KERNEL PROCESSING FORM */}
            {formType === 'kernel' && (
              <>
                <div className="form-group">
                  <label className="form-label">Palm Kernels Input (kg)</label>
                  <input type="number" className="form-input" placeholder="e.g. 75" required value={kernelInput} onChange={e => setKernelInput(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">PKO Kernel Oil Produced (Litres)</label>
                  <input type="number" className="form-input" placeholder="e.g. 32" required value={pkoOutput} onChange={e => setPkoOutput(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">PKC Kernel Cake (Bags)</label>
                  <input type="number" className="form-input" placeholder="e.g. 2" value={pkcOutput} onChange={e => setPkcOutput(e.target.value)} />
                </div>
              </>
            )}

            {/* SALE FORM */}
            {formType === 'sale' && (
              <>
                <div className="form-group">
                  <label className="form-label">Customer / Buyer</label>
                  <select className="form-select" value={customerId} onChange={e => setCustomerId(Number(e.target.value))}>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.segment})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Product Sold</label>
                  <select className="form-select" value={productName} onChange={e => setProductName(e.target.value)}>
                    <option value="Crude Palm Oil (CPO)">Crude Palm Oil (CPO)</option>
                    <option value="Palm Kernel Oil (PKO)">Palm Kernel Oil (PKO)</option>
                    <option value="Palm Kernel Cake (PKC)">Palm Kernel Cake (PKC)</option>
                    <option value="Fresh Fruit Bunches (FFB)">Fresh Fruit Bunches (FFB)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input type="number" className="form-input" placeholder="e.g. 50" required value={quantity} onChange={e => setQuantity(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <input type="text" className="form-input" value={unit} onChange={e => setUnit(e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Price (₦)</label>
                  <input type="number" className="form-input" placeholder="e.g. 1500" required value={unitPrice} onChange={e => setUnitPrice(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Amount Received Today / Deposit (₦)</label>
                  <input type="number" className="form-input" placeholder="Leave 0 if full credit" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} />
                </div>
              </>
            )}

            {/* PAYMENT LOGGING FORM */}
            {formType === 'payment' && (
              <>
                <div className="form-group">
                  <label className="form-label">Customer Paying</label>
                  <select className="form-select" value={payCustomerId} onChange={e => setPayCustomerId(Number(e.target.value))}>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (Owes: ₦{c.balance_due.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount Received (₦)</label>
                  <input type="number" className="form-input" placeholder="e.g. 50000" required value={payAmount} onChange={e => setPayAmount(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-select" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="POS">POS</option>
                  </select>
                </div>
              </>
            )}

            {/* EXPENSE FORM */}
            {formType === 'expense' && (
              <>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="Labour">Labour</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Transport">Transport</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input type="text" className="form-input" placeholder="e.g. 50L Diesel for processing machine" required value={description} onChange={e => setDescription(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Amount Paid (₦)</label>
                  <input type="number" className="form-input" placeholder="e.g. 65000" required value={expAmount} onChange={e => setExpAmount(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-select" value={expMethod} onChange={e => setExpMethod(e.target.value)}>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="POS">POS</option>
                  </select>
                </div>
              </>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Operational Record'}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
