import React from 'react';
import { FlowNodeSummary, DashboardSummary } from '../types';
import { ArrowDown, Sprout, Factory, Droplet, Nut, Layers } from 'lucide-react';

interface FlowViewProps {
  flowData: FlowNodeSummary | null;
  summary: DashboardSummary | null;
  onDrillDown?: (node: string) => void;
}

export const FlowView: React.FC<FlowViewProps> = ({ flowData, summary }) => {
  return (
    <div className="flow-container">
      <div className="section-header">
        <div className="section-title">
          <Layers size={18} /> Physical Flow & Transformation
        </div>
        <div className="badge badge-paid">Live Operational Loop</div>
      </div>

      <div className="flow-pipeline">
        {/* NODE 1: FARM & HARVEST */}
        <div className="flow-node-card">
          <div className="flow-node-header">
            <div className="flow-node-title">
              <Sprout color="#15803d" size={18} /> 1. Fresh Fruit Bunches (FFB) Harvested
            </div>
            <span className="badge badge-paid">Farm Blocks</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <div>
              <div className="stat-label">Total Harvested</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#15803d' }}>
                {flowData ? `${flowData.harvested_ffb_kg.toLocaleString()} kg` : '1,350 kg'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="stat-label">Harvest Destination</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                Palm Mill & Processing
              </div>
            </div>
          </div>
        </div>

        <div className="flow-arrow"><ArrowDown /></div>

        {/* NODE 2: CPO PROCESSING STREAM */}
        <div className="flow-node-card" style={{ borderColor: '#22c55e' }}>
          <div className="flow-node-header">
            <div className="flow-node-title">
              <Factory color="#166534" size={18} /> 2. CPO Processing Stream
            </div>
            <span className="badge badge-paid">Hydraulic Press</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
            <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '8px' }}>
              <div className="stat-label">FFB Processed</div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>
                {flowData ? `${flowData.processed_ffb_kg.toLocaleString()} kg` : '1,350 kg'}
              </div>
            </div>
            <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '8px' }}>
              <div className="stat-label">CPO Oil Produced</div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#15803d' }}>
                {flowData ? `${flowData.produced_cpo_litres.toLocaleString()} L` : '250 L'}
              </div>
            </div>
          </div>
        </div>

        <div className="flow-arrow"><ArrowDown /></div>

        {/* NODE 3: KERNEL RECOVERY & PROCESSING */}
        <div className="flow-node-card" style={{ borderColor: '#d97706', background: '#fffbeb' }}>
          <div className="flow-node-header">
            <div className="flow-node-title" style={{ color: '#92400e' }}>
              <Nut color="#b45309" size={18} /> 3. Palm Kernel Recovery & Expeller Press
            </div>
            <span className="badge badge-partial">Kernel Stream</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
            <div style={{ background: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #fef3c7' }}>
              <div className="stat-label">Kernels Recovered</div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>
                {flowData ? `${flowData.produced_kernel_kg.toLocaleString()} kg` : '95 kg'}
              </div>
            </div>
            <div style={{ background: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #fef3c7' }}>
              <div className="stat-label">PKO Oil Produced</div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#b45309' }}>
                {flowData ? `${flowData.produced_pko_litres.toLocaleString()} L` : '32 L'}
              </div>
            </div>
          </div>
        </div>

        <div className="flow-arrow"><ArrowDown /></div>

        {/* NODE 4: FINISHED STOCKS & SALES */}
        <div className="flow-node-card" style={{ background: '#f8fafc' }}>
          <div className="flow-node-header">
            <div className="flow-node-title">
              <Droplet color="#2563eb" size={18} /> 4. Current Stock Availability & Sales
            </div>
            <span className="badge badge-paid">Market Ready</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
            <div style={{ border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', background: '#ffffff' }}>
              <div className="stat-label">CPO Stock</div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#15803d' }}>
                {summary ? `${summary.current_cpo_stock_litres} Litres` : '640 L'}
              </div>
            </div>
            <div style={{ border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', background: '#ffffff' }}>
              <div className="stat-label">PKO Stock</div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#b45309' }}>
                {summary ? `${summary.current_pko_stock_litres} Litres` : '210 L'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
