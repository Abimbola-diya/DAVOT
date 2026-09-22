import React from 'react';
import { FlowNodeSummary, DashboardSummary } from '../types';

interface FlowViewProps {
  flowData?: FlowNodeSummary | null;
  summary?: DashboardSummary | null;
  onDrillDown?: (node: string) => void;
}

export const FlowView: React.FC<FlowViewProps> = () => {
  return (
    <div className="flow-container">
      {/* Blank space reserved for upcoming Farm Operations modules */}
    </div>
  );
};
