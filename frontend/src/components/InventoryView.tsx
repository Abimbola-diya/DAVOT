import React, { useState } from 'react';
import { InventoryItem, InventoryLedger, InputType } from '../types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ContainerIcon,
  PlusSignIcon,
  ArrowLeft02Icon,
  ShoppingCart01Icon,
  Sorting01Icon,
  InformationCircleIcon
} from '@hugeicons/core-free-icons';

interface InventoryViewProps {
  items: InventoryItem[];
  ledgers: InventoryLedger[];
  onAddItem?: (item: Omit<InventoryItem, 'id'>) => void;
  onRecordPurchase?: (data: {
    item_id: number;
    quantity: number;
    total_cost?: number;
    cost_per_unit?: number;
    supplier?: string;
    date?: string;
    notes?: string;
  }) => void;
  onRecordUsage?: (data: {
    item_id: number;
    quantity: number;
    block_name?: string;
    date?: string;
    notes?: string;
  }) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  ledgers,
  onAddItem,
  onRecordPurchase,
  onRecordUsage,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  
  // Modal states
  const [isAddInputModalOpen, setIsAddInputModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [activeItemForAction, setActiveItemForAction] = useState<InventoryItem | null>(null);

  // Form states for Add Input
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<InputType>('Fertilizer');
  const [newUnit, setNewUnit] = useState('Bags');
  const [newOpeningStock, setNewOpeningStock] = useState<number | ''>(10);
  const [newMinStock, setNewMinStock] = useState<number | ''>(5);

  // Form states for Record Purchase
  const [purchaseItemId, setPurchaseItemId] = useState<number>(items[0]?.id || 1);
  const [purchaseQty, setPurchaseQty] = useState<number | ''>('');
  const [purchaseTotalCost, setPurchaseTotalCost] = useState<number | ''>('');
  const [purchaseSupplier, setPurchaseSupplier] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [purchaseNotes, setPurchaseNotes] = useState('');

  // Form states for Record Usage
  const [usageItemId, setUsageItemId] = useState<number>(items[0]?.id || 1);
  const [usageQty, setUsageQty] = useState<number | ''>('');
  const [usageBlock, setUsageBlock] = useState('Block B');
  const [usageDate, setUsageDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [usageNotes, setUsageNotes] = useState('');

  // Helper to determine status
  const getItemStatus = (item: InventoryItem): 'In stock' | 'Running low' | 'Out of stock' => {
    if (item.current_stock <= 0) return 'Out of stock';
    if (item.current_stock <= item.reorder_level) return 'Running low';
    return 'In stock';
  };

  // KPIs
  const totalInputsCount = items.length;
  const lowStockCount = items.filter(i => getItemStatus(i) === 'Running low').length;
  const outOfStockCount = items.filter(i => getItemStatus(i) === 'Out of stock').length;

  const selectedItem = items.find(i => i.id === selectedItemId);

  // Get ledgers for selected item
  const selectedItemLedgers = selectedItem
    ? ledgers.filter(l => l.item_id === selectedItem.id || l.item_name === selectedItem.name)
    : [];

  // Submit Add Input
  const handleAddInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const stock = typeof newOpeningStock === 'number' ? newOpeningStock : 0;
    const minStk = typeof newMinStock === 'number' ? newMinStock : 5;

    if (onAddItem) {
      onAddItem({
        name: newName.trim(),
        item_type: newType,
        category: 'Input',
        unit: newUnit,
        current_stock: stock,
        reorder_level: minStk,
        last_purchased_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        usage_this_month: 0,
        usage_last_month: 0,
        bought_this_month: stock,
      });
    }

    // Reset form
    setNewName('');
    setNewType('Fertilizer');
    setNewUnit('Bags');
    setNewOpeningStock(10);
    setNewMinStock(5);
    setIsAddInputModalOpen(false);
  };

  // Submit Purchase
  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = activeItemForAction ? activeItemForAction.id : purchaseItemId;
    const qty = typeof purchaseQty === 'number' ? purchaseQty : 0;
    const cost = typeof purchaseTotalCost === 'number' ? purchaseTotalCost : undefined;

    if (!targetId || qty <= 0) return;

    if (onRecordPurchase) {
      onRecordPurchase({
        item_id: targetId,
        quantity: qty,
        total_cost: cost,
        supplier: purchaseSupplier.trim() || undefined,
        date: purchaseDate,
        notes: purchaseNotes.trim() || undefined,
      });
    }

    setPurchaseQty('');
    setPurchaseTotalCost('');
    setPurchaseSupplier('');
    setPurchaseNotes('');
    setIsPurchaseModalOpen(false);
  };

  // Submit Usage
  const handleUsageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = activeItemForAction ? activeItemForAction.id : usageItemId;
    const qty = typeof usageQty === 'number' ? usageQty : 0;

    if (!targetId || qty <= 0) return;

    if (onRecordUsage) {
      onRecordUsage({
        item_id: targetId,
        quantity: qty,
        block_name: usageBlock,
        date: usageDate,
        notes: usageNotes.trim() || undefined,
      });
    }

    setUsageQty('');
    setUsageNotes('');
    setIsUsageModalOpen(false);
  };

  const openPurchaseFor = (item: InventoryItem) => {
    setActiveItemForAction(item);
    setPurchaseItemId(item.id);
    setIsPurchaseModalOpen(true);
  };

  const openUsageFor = (item: InventoryItem) => {
    setActiveItemForAction(item);
    setUsageItemId(item.id);
    setIsUsageModalOpen(true);
  };

  // Helper for type colors
  const getTypeBadgeStyle = (type?: InputType) => {
    switch (type) {
      case 'Fertilizer':
        return { bg: '#dcfce7', text: '#15803d', border: '#000000' };
      case 'Chemical':
        return { bg: '#f3e8ff', text: '#6b21a8', border: '#000000' };
      case 'Fuel':
        return { bg: '#dbeafe', text: '#1e40af', border: '#000000' };
      default:
        return { bg: '#f1f5f9', text: '#334155', border: '#000000' };
    }
  };

  // Helper for status badge style
  const getStatusBadgeStyle = (status: 'In stock' | 'Running low' | 'Out of stock') => {
    switch (status) {
      case 'In stock':
        return { bg: '#ffffff', text: '#000000', border: '#000000', dot: '#16a34a' };
      case 'Running low':
        return { bg: '#fff7ed', text: '#9a3412', border: '#000000', dot: '#f97316' };
      case 'Out of stock':
        return { bg: '#fef2f2', text: '#991b1b', border: '#000000', dot: '#dc2626' };
    }
  };

  // IF DETAILED ITEM VIEW IS ACTIVE
  if (selectedItem) {
    const status = getItemStatus(selectedItem);
    const statusStyle = getStatusBadgeStyle(status);
    const typeStyle = getTypeBadgeStyle(selectedItem.item_type || 'Fertilizer');

    const usageThis = selectedItem.usage_this_month ?? 11;
    const usageLast = selectedItem.usage_last_month ?? 7;
    const boughtThis = selectedItem.bought_this_month ?? 20;

    const usageDiff = usageThis - usageLast;
    const usageTrendText = usageDiff > 0 
      ? `Increased by ${usageDiff} ${selectedItem.unit.toLowerCase()} (+${Math.round((usageDiff/Math.max(1, usageLast))*100)}%)` 
      : usageDiff < 0 
      ? `Decreased by ${Math.abs(usageDiff)} ${selectedItem.unit.toLowerCase()}`
      : `Same as last month`;

    return (
      <div style={{ paddingBottom: '30px' }}>
        {/* Back Button & Top Navigation */}
        <button
          onClick={() => setSelectedItemId(null)}
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ffffff',
            border: '2px solid #000000',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: 800,
            boxShadow: '2.5px 2.5px 0px #000000',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} size={16} color="#000000" />
          Back to Inputs
        </button>

        {/* Input Header & Quick Action Buttons */}
        <div 
          className="card" 
          style={{ 
            background: '#ffffff', 
            border: '2.5px solid #000000', 
            boxShadow: '3.5px 3.5px 0px #000000',
            borderRadius: '16px',
            padding: '18px',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span 
                  style={{ 
                    background: typeStyle.bg, 
                    color: typeStyle.text, 
                    border: `1.5px solid ${typeStyle.border}`,
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 900,
                    textTransform: 'uppercase'
                  }}
                >
                  {selectedItem.item_type || 'Fertilizer'}
                </span>
                <span 
                  style={{ 
                    background: statusStyle.bg, 
                    color: statusStyle.text, 
                    border: `1.5px solid ${statusStyle.border}`,
                    borderRadius: '8px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusStyle.dot }} />
                  {status}
                </span>
              </div>

              <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#000000', margin: '4px 0' }}>
                {selectedItem.name}
              </h1>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => openPurchaseFor(selectedItem)}
                type="button"
                style={{
                  background: '#dcfce7',
                  color: '#000000',
                  border: '2px solid #000000',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 900,
                  boxShadow: '2.5px 2.5px 0px #000000',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <HugeiconsIcon icon={ShoppingCart01Icon} size={15} color="#000000" />
                Record Purchase
              </button>

              <button
                onClick={() => openUsageFor(selectedItem)}
                type="button"
                style={{
                  background: '#ffedd5',
                  color: '#000000',
                  border: '2px solid #000000',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 900,
                  boxShadow: '2.5px 2.5px 0px #000000',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <HugeiconsIcon icon={Sorting01Icon} size={15} color="#000000" />
                Record Usage
              </button>
            </div>
          </div>
        </div>

        {/* 4 Core Fields Metric Cards (Neobrutalism Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {/* Current Stock */}
          <div style={{ background: '#ffffff', border: '2px solid #000000', borderRadius: '14px', padding: '14px', boxShadow: '3px 3px 0px #000000' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Current Stock
            </span>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#000000' }}>
              {selectedItem.current_stock.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{selectedItem.unit}</span>
            </span>
          </div>

          {/* Minimum Stock */}
          <div style={{ background: '#ffffff', border: '2px solid #000000', borderRadius: '14px', padding: '14px', boxShadow: '3px 3px 0px #000000' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Minimum Stock
            </span>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#000000' }}>
              {selectedItem.reorder_level} <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{selectedItem.unit}</span>
            </span>
          </div>

          {/* Last Purchased */}
          <div style={{ background: '#ffffff', border: '2px solid #000000', borderRadius: '14px', padding: '14px', boxShadow: '3px 3px 0px #000000' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Last Bought
            </span>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#000000' }}>
              {selectedItem.last_purchased_date || '02 Sept 2026'}
            </span>
          </div>

          {/* Last Cost */}
          <div style={{ background: '#ffffff', border: '2px solid #000000', borderRadius: '14px', padding: '14px', boxShadow: '3px 3px 0px #000000' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Last Cost
            </span>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#000000' }}>
              ₦{(selectedItem.last_cost || 45000).toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>/ {selectedItem.unit.slice(0, -1) || selectedItem.unit}</span>
            </span>
          </div>
        </div>

        {/* Operational Intelligence Section: Purchased -> Used -> Remaining */}
        <div style={{ background: '#ffffff', border: '2.5px solid #000000', borderRadius: '16px', padding: '16px', boxShadow: '3.5px 3.5px 0px #000000', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 900, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HugeiconsIcon icon={InformationCircleIcon} size={16} color="#000000" />
            Monthly Input Intelligence
          </div>

          {/* Flow Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '2px solid #000000', borderRadius: '12px', padding: '12px', marginBottom: '14px' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Bought (Month)</span>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#16a34a' }}>+{boughtThis} {selectedItem.unit}</span>
            </div>
            
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#000000' }}>→</span>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Used (Month)</span>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#dc2626' }}>-{usageThis} {selectedItem.unit}</span>
            </div>

            <span style={{ fontSize: '16px', fontWeight: 900, color: '#000000' }}>→</span>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Remaining</span>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#000000' }}>{selectedItem.current_stock} {selectedItem.unit}</span>
            </div>
          </div>

          {/* Usage Comparison Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ background: '#f0fdf4', border: '1.5px solid #000000', borderRadius: '10px', padding: '10px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', display: 'block' }}>Usage This Month</span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#15803d' }}>{usageThis} {selectedItem.unit}</span>
            </div>

            <div style={{ background: '#f8fafc', border: '1.5px solid #000000', borderRadius: '10px', padding: '10px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Usage Last Month</span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#334155' }}>{usageLast} {selectedItem.unit}</span>
            </div>
          </div>

          {/* Operational Tip */}
          <div style={{ marginTop: '10px', fontSize: '11px', fontWeight: 700, color: '#475569', background: '#fef08a', border: '1.5px solid #000000', borderRadius: '8px', padding: '6px 10px' }}>
            💡 {usageTrendText}
          </div>
        </div>

        {/* Recent Activity Ledger for this item */}
        <div style={{ background: '#ffffff', border: '2.5px solid #000000', borderRadius: '16px', padding: '16px', boxShadow: '3.5px 3.5px 0px #000000' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#000000', textTransform: 'uppercase', margin: '0 0 12px 0' }}>
            Recent Activity
          </h3>

          {selectedItemLedgers.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Default Mock Activity as specified in requirements */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1.5px solid #f1f5f9' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#000000' }}>02 Sept • Bought 20 {selectedItem.unit}</span>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>₦900,000 (₦45,000 / {selectedItem.unit.slice(0, -1) || selectedItem.unit})</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px', border: '1px solid #000000' }}>+20</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1.5px solid #f1f5f9' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#000000' }}>05 Sept • Used 4 {selectedItem.unit}</span>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Applied on Block B</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: '6px', border: '1px solid #000000' }}>-4</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1.5px solid #f1f5f9' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#000000' }}>12 Sept • Used 3 {selectedItem.unit}</span>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Applied on Block A</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: '6px', border: '1px solid #000000' }}>-3</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#000000' }}>18 Sept • Used 4 {selectedItem.unit}</span>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Applied on Block B</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: '6px', border: '1px solid #000000' }}>-4</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedItemLedgers.slice(0, 10).map(l => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1.5px solid #f1f5f9' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#000000' }}>
                      {new Date(l.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} • {l.change_type === 'IN' ? 'Bought' : 'Used'} {l.quantity} {selectedItem.unit}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                      {l.notes || (l.change_type === 'IN' ? 'Stock Purchase' : 'Field Application')}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 900,
                    color: l.change_type === 'IN' ? '#16a34a' : '#dc2626',
                    background: l.change_type === 'IN' ? '#dcfce7' : '#fee2e2',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid #000000'
                  }}>
                    {l.change_type === 'IN' ? `+${l.quantity}` : `-${l.quantity}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // MAIN INPUTS LIST PAGE
  return (
    <div style={{ paddingBottom: '30px' }}>
      {/* Page Title & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#000000', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HugeiconsIcon icon={ContainerIcon} size={22} color="#000000" />
            Farm Inputs
          </h1>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', margin: '2px 0 0 0' }}>
            Track fertilizers, chemicals & fuel stock levels
          </p>
        </div>

        <button
          onClick={() => setIsAddInputModalOpen(true)}
          type="button"
          style={{
            background: '#ffffff',
            color: '#000000',
            border: '2px solid #000000',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: 900,
            boxShadow: '2.5px 2.5px 0px #000000',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <HugeiconsIcon icon={PlusSignIcon} size={16} color="#000000" />
          + Add Input
        </button>
      </div>

      {/* Top Summary KPI Cards (Neobrutalism) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
        {/* Total Inputs */}
        <div style={{ background: '#ffffff', border: '2px solid #000000', borderRadius: '14px', padding: '12px', boxShadow: '3px 3px 0px #000000' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
            Total Inputs
          </span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#000000' }}>
            {totalInputsCount}
          </span>
        </div>

        {/* Low Stock */}
        <div style={{ background: '#fff7ed', border: '2px solid #000000', borderRadius: '14px', padding: '12px', boxShadow: '3px 3px 0px #000000' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#9a3412', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
            Low Stock
          </span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#c2410c' }}>
            {lowStockCount}
          </span>
        </div>

        {/* Out of Stock */}
        <div style={{ background: '#fef2f2', border: '2px solid #000000', borderRadius: '14px', padding: '12px', boxShadow: '3px 3px 0px #000000' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
            Out of Stock
          </span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#dc2626' }}>
            {outOfStockCount}
          </span>
        </div>
      </div>

      {/* Inputs List Table/Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.length === 0 ? (
          <div style={{ background: '#ffffff', border: '2px solid #000000', borderRadius: '14px', padding: '24px', textAlign: 'center', boxShadow: '3px 3px 0px #000000' }}>
            <p style={{ fontSize: '13px', fontWeight: 800, color: '#64748b' }}>No inputs added yet.</p>
            <button
              onClick={() => setIsAddInputModalOpen(true)}
              type="button"
              style={{
                background: '#ffffff',
                border: '2px solid #000000',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 900,
                marginTop: '8px',
                cursor: 'pointer'
              }}
            >
              + Add First Input
            </button>
          </div>
        ) : (
          items.map(item => {
            const status = getItemStatus(item);
            const statusStyle = getStatusBadgeStyle(status);
            const typeStyle = getTypeBadgeStyle(item.item_type || 'Fertilizer');

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                style={{
                  background: '#ffffff',
                  border: '2.5px solid #000000',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  boxShadow: '3.5px 3.5px 0px #000000',
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span
                      style={{
                        background: typeStyle.bg,
                        color: typeStyle.text,
                        border: `1.5px solid ${typeStyle.border}`,
                        borderRadius: '6px',
                        padding: '1px 6px',
                        fontSize: '10px',
                        fontWeight: 900,
                        textTransform: 'uppercase'
                      }}
                    >
                      {item.item_type || 'Fertilizer'}
                    </span>
                  </div>

                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#000000' }}>
                    {item.name}
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#000000' }}>
                      {item.current_stock.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>{item.unit}</span>
                    </div>

                    <div
                      style={{
                        background: statusStyle.bg,
                        color: statusStyle.text,
                        border: `1.5px solid ${statusStyle.border}`,
                        borderRadius: '8px',
                        padding: '2px 6px',
                        fontSize: '10px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '2px'
                      }}
                    >
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: statusStyle.dot }} />
                      {status}
                    </div>
                  </div>

                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#000000' }}>
                    →
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: ADD INPUT (Simple 5-field form as requested) */}
      {isAddInputModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', border: '3px solid #000000', borderRadius: '20px', width: '100%', maxWidth: '420px', padding: '20px', boxShadow: '6px 6px 0px #000000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: 0 }}>
                Add Input
              </h2>
              <button
                onClick={() => setIsAddInputModalOpen(false)}
                type="button"
                style={{ background: 'none', border: 'none', fontSize: '20px', fontWeight: 900, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddInputSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                  Input Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. NPK 15-15-15 Fertilizer"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="davot-input"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                  Type:
                </label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as InputType)}
                  className="davot-input"
                >
                  <option value="Fertilizer">Fertilizer</option>
                  <option value="Chemical">Chemical</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Unit */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                  Unit:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bags, Litres, Kg, Drums"
                  value={newUnit}
                  onChange={e => setNewUnit(e.target.value)}
                  className="davot-input"
                  required
                />
              </div>

              {/* Opening Stock */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                  Opening Stock:
                </label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={newOpeningStock}
                  onChange={e => setNewOpeningStock(e.target.value === '' ? '' : Number(e.target.value))}
                  className="davot-input"
                  min="0"
                  required
                />
              </div>

              {/* Minimum Stock */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                  Minimum Stock (Reorder Alert Level):
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={newMinStock}
                  onChange={e => setNewMinStock(e.target.value === '' ? '' : Number(e.target.value))}
                  className="davot-input"
                  min="0"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddInputModalOpen(false)}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    border: '2px solid #000000',
                    borderRadius: '10px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: '#ffffff',
                    border: '2px solid #000000',
                    borderRadius: '10px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 900,
                    boxShadow: '2.5px 2.5px 0px #000000',
                    cursor: 'pointer'
                  }}
                >
                  Save Input
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PURCHASE */}
      {isPurchaseModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', border: '3px solid #000000', borderRadius: '20px', width: '100%', maxWidth: '420px', padding: '20px', boxShadow: '6px 6px 0px #000000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: 0 }}>
                Record Purchase
              </h2>
              <button
                onClick={() => setIsPurchaseModalOpen(false)}
                type="button"
                style={{ background: 'none', border: 'none', fontSize: '20px', fontWeight: 900, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePurchaseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Target Input */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                  Select Input:
                </label>
                <select
                  value={activeItemForAction ? activeItemForAction.id : purchaseItemId}
                  onChange={e => setPurchaseItemId(Number(e.target.value))}
                  className="davot-input"
                  disabled={!!activeItemForAction}
                >
                  {items.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                  Quantity Purchased:
                </label>
                <input
                  type="number"
                  placeholder="e.g. 20"
                  value={purchaseQty}
                  onChange={e => setPurchaseQty(e.target.value === '' ? '' : Number(e.target.value))}
                  className="davot-input"
                  min="1"
                  required
                />
              </div>

              {/* Total Cost */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                  Total Cost (₦) (Optional):
                </label>
                <input
                  type="number"
                  placeholder="e.g. 900000"
                  value={purchaseTotalCost}
                  onChange={e => setPurchaseTotalCost(e.target.value === '' ? '' : Number(e.target.value))}
                  className="davot-input"
                />
              </div>

              {/* Date */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                  Purchase Date:
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={e => setPurchaseDate(e.target.value)}
                  className="davot-input"
                  required
                />
              </div>

              {/* Supplier */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                  Supplier / Vendor (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. ABC Agro Ltd"
                  value={purchaseSupplier}
                  onChange={e => setPurchaseSupplier(e.target.value)}
                  className="davot-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    border: '2px solid #000000',
                    borderRadius: '10px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: '#dcfce7',
                    color: '#000000',
                    border: '2px solid #000000',
                    borderRadius: '10px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 900,
                    boxShadow: '2.5px 2.5px 0px #000000',
                    cursor: 'pointer'
                  }}
                >
                  Save Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD USAGE */}
      {isUsageModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', border: '3px solid #000000', borderRadius: '20px', width: '100%', maxWidth: '420px', padding: '20px', boxShadow: '6px 6px 0px #000000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: 0 }}>
                Record Usage
              </h2>
              <button
                onClick={() => setIsUsageModalOpen(false)}
                type="button"
                style={{ background: 'none', border: 'none', fontSize: '20px', fontWeight: 900, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUsageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Target Input */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                  Select Input:
                </label>
                <select
                  value={activeItemForAction ? activeItemForAction.id : usageItemId}
                  onChange={e => setUsageItemId(Number(e.target.value))}
                  className="davot-input"
                  disabled={!!activeItemForAction}
                >
                  {items.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                  Quantity Used:
                </label>
                <input
                  type="number"
                  placeholder="e.g. 4"
                  value={usageQty}
                  onChange={e => setUsageQty(e.target.value === '' ? '' : Number(e.target.value))}
                  className="davot-input"
                  min="1"
                  required
                />
              </div>

              {/* Block / Usage area */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                  Used For / Field Block:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Block B or Mill Generator"
                  value={usageBlock}
                  onChange={e => setUsageBlock(e.target.value)}
                  className="davot-input"
                />
              </div>

              {/* Date */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                  Usage Date:
                </label>
                <input
                  type="date"
                  value={usageDate}
                  onChange={e => setUsageDate(e.target.value)}
                  className="davot-input"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                  Extra Notes (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Applied after rainfall"
                  value={usageNotes}
                  onChange={e => setUsageNotes(e.target.value)}
                  className="davot-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsUsageModalOpen(false)}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    border: '2px solid #000000',
                    borderRadius: '10px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: '#ffedd5',
                    color: '#000000',
                    border: '2px solid #000000',
                    borderRadius: '10px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 900,
                    boxShadow: '2.5px 2.5px 0px #000000',
                    cursor: 'pointer'
                  }}
                >
                  Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
