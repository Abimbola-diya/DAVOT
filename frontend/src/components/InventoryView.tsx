import React from 'react';
import { InventoryItem, InventoryLedger } from '../types';
import { Package, History, AlertCircle } from 'lucide-react';

interface InventoryViewProps {
  items: InventoryItem[];
  ledgers: InventoryLedger[];
}

export const InventoryView: React.FC<InventoryViewProps> = ({ items, ledgers }) => {
  return (
    <div>
      <div className="section-header">
        <div className="section-title">
          <Package size={18} /> Current Stock & Inventory
        </div>
      </div>

      {/* Stock Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {items.map(item => {
          const stock = item.current_stock ?? 0;
          const reorder = item.reorder_level ?? 0;
          const isLow = stock <= reorder;
          return (
            <div 
              key={item.id} 
              className="card" 
              style={{ 
                marginBottom: 0, 
                borderColor: isLow ? '#fcd34d' : 'var(--card-border)',
                background: isLow ? '#fffdf5' : '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Category: {item.category}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-green-dark)' }}>
                    {stock.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 600 }}>{item.unit}</span>
                  </div>
                  {isLow && (
                    <span className="badge badge-partial" style={{ fontSize: '9px', marginTop: '2px' }}>
                      <AlertCircle size={10} style={{ display: 'inline', marginRight: '2px' }} /> Low Stock
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Movement Ledger */}
      <div className="section-header">
        <div className="section-title" style={{ fontSize: '14px' }}>
          <History size={16} /> Inventory Movement Ledger
        </div>
      </div>

      <div className="card" style={{ padding: '12px' }}>
        {ledgers.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
            No movement ledger entries recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ledgers.slice(0, 15).map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{l.item_name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(l.timestamp).toLocaleDateString()} • {l.reference_type} ({l.reference_id || 'N/A'})
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: 800, 
                    color: l.change_type === 'IN' ? '#15803d' : '#dc2626' 
                  }}>
                    {l.change_type === 'IN' ? '+' : '-'}{l.quantity} {l.unit}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                    Bal: {l.balance_after} {l.unit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
