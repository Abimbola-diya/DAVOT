import React, { useState } from 'react';
import { HarvestRecord } from '../types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  WheatIcon,
  PlusSignIcon,
  FactoryIcon,
  Calendar01Icon,
  ScaleIcon,
  Clock01Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
} from '@hugeicons/core-free-icons';

interface HarvestViewProps {
  records: HarvestRecord[];
  onOpenAddHarvestModal: () => void;
  onOpenAddBatchModal: (harvestId: string) => void;
}

export const HarvestView: React.FC<HarvestViewProps> = ({
  records,
  onOpenAddHarvestModal,
  onOpenAddBatchModal,
}) => {
  const [activeHarvestIdDetail, setActiveHarvestIdDetail] = useState<string | null>(null);
  const [activeBatchIdDetail, setActiveBatchIdDetail] = useState<string | null>(null);

  // Calculate overall aggregate metrics
  const totalWeightKg = records.reduce((sum, r) => {
    return (
      sum +
      r.batches.reduce((bSum, b) => {
        const weightInKg = b.weight_unit === 'Tonnes' ? b.ffb_weight * 1000 : b.ffb_weight;
        return bSum + weightInKg;
      }, 0)
    );
  }, 0);

  const totalBunches = records.reduce((sum, r) => {
    return sum + r.batches.reduce((bSum, b) => bSum + b.bunch_count, 0);
  }, 0);

  const formatTotalWeight = (kg: number) => {
    if (kg >= 1000) {
      return `${(kg / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} Tonnes`;
    }
    return `${kg.toLocaleString()} Kg`;
  };

  // If viewing details for a specific harvest
  const activeRecord = activeHarvestIdDetail
    ? records.find((r) => r.id === activeHarvestIdDetail)
    : null;

  // If viewing details for a specific batch within a harvest
  const activeBatch = activeRecord && activeBatchIdDetail
    ? activeRecord.batches.find((b) => b.id === activeBatchIdDetail)
    : null;

  // 1. SPECIFIC BATCH DETAIL VIEW
  if (activeRecord && activeBatch) {
    const batchWeightInKg = activeBatch.weight_unit === 'Tonnes' ? activeBatch.ffb_weight * 1000 : activeBatch.ffb_weight;
    const avgBunchWeightKg = activeBatch.bunch_count > 0 ? (batchWeightInKg / activeBatch.bunch_count).toFixed(2) : '0';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '100px' }}>
        {/* Navigation Header */}
        <div>
          <button
            onClick={() => setActiveBatchIdDetail(null)}
            style={{
              background: '#ffffff',
              border: '2.5px solid #000000',
              borderRadius: '12px',
              padding: '8px 14px',
              fontWeight: 800,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #000000',
            }}
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={18} color="#000000" />
            <span>Back to Batches ({activeRecord.name})</span>
          </button>
        </div>

        {/* Batch Summary Header Card */}
        <div
          className="neobrutal-card"
          style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '20px',
            border: '2.5px solid #000000',
            boxShadow: '4px 4px 0px #000000',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {activeRecord.name}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>•</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                Logged {activeBatch.date}
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#000000', margin: 0, lineHeight: 1.1 }}>
              {activeBatch.batch_name}
            </h1>
          </div>

          <span
            style={{
              background: '#ffffff',
              color: '#000000',
              border: '2px solid #000000',
              borderRadius: '10px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 900,
              boxShadow: '2px 2px 0px #000000',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} />
            {activeBatch.status}
          </span>
        </div>

        {/* Batch Metrics List Out Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#000000', margin: '4px 0 2px 0' }}>
            Batch Metrics & Breakdown
          </h2>

          {/* Metric 1: Weight */}
          <div
            style={{
              background: '#ffffff',
              border: '2.5px solid #000000',
              borderRadius: '16px',
              padding: '16px 18px',
              boxShadow: '3.5px 3.5px 0px #000000',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '2px' }}>
                FFB Harvest Weight
              </span>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#000000' }}>
                {activeBatch.ffb_weight.toLocaleString()} {activeBatch.weight_unit}
              </span>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ffedd5', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HugeiconsIcon icon={ScaleIcon} size={20} color="#000000" />
            </div>
          </div>

          {/* Metric 2: Bunches */}
          <div
            style={{
              background: '#ffffff',
              border: '2.5px solid #000000',
              borderRadius: '16px',
              padding: '16px 18px',
              boxShadow: '3.5px 3.5px 0px #000000',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '2px' }}>
                Number of FFB Bunches
              </span>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#000000' }}>
                {activeBatch.bunch_count.toLocaleString()} Bunches
              </span>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ffffff', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HugeiconsIcon icon={WheatIcon} size={20} color="#000000" />
            </div>
          </div>

          {/* Metric 3: Calculated Avg Weight Per Bunch */}
          <div
            style={{
              background: '#ffffff',
              border: '2.5px solid #000000',
              borderRadius: '16px',
              padding: '16px 18px',
              boxShadow: '3.5px 3.5px 0px #000000',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '2px' }}>
                Average Bunch Weight
              </span>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#000000' }}>
                {avgBunchWeightKg} Kg / bunch
              </span>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ffedd5', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HugeiconsIcon icon={ScaleIcon} size={20} color="#000000" />
            </div>
          </div>

          {/* Metric 4: Destination */}
          <div
            style={{
              background: '#ffffff',
              border: '2.5px solid #000000',
              borderRadius: '16px',
              padding: '16px 18px',
              boxShadow: '3.5px 3.5px 0px #000000',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '2px' }}>
                Transport Destination
              </span>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#000000' }}>
                {activeBatch.destination}
              </span>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ffffff', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HugeiconsIcon icon={FactoryIcon} size={20} color="#000000" />
            </div>
          </div>

          {/* Metric 5: Processing Status */}
          <div
            style={{
              background: '#ffffff',
              border: '2.5px solid #000000',
              borderRadius: '16px',
              padding: '16px 18px',
              boxShadow: '3.5px 3.5px 0px #000000',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '2px' }}>
                Batch Processing Status
              </span>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#000000' }}>
                {activeBatch.status}
              </span>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ffedd5', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HugeiconsIcon icon={Clock01Icon} size={20} color="#000000" />
            </div>
          </div>

          {/* Batch Notes (if present) */}
          {activeBatch.notes && (
            <div
              style={{
                background: '#ffffff',
                border: '2.5px solid #000000',
                borderRadius: '16px',
                padding: '16px 18px',
                boxShadow: '3.5px 3.5px 0px #000000',
                marginTop: '4px',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>
                Batch Notes & Remarks
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#000000', lineHeight: 1.5, display: 'block' }}>
                {activeBatch.notes}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. HARVEST BATCHES LIST VIEW
  if (activeRecord) {
    const harvestTotalWeightKg = activeRecord.batches.reduce((sum, b) => {
      return sum + (b.weight_unit === 'Tonnes' ? b.ffb_weight * 1000 : b.ffb_weight);
    }, 0);

    const harvestTotalBunches = activeRecord.batches.reduce((sum, b) => sum + b.bunch_count, 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '100px' }}>
        {/* Navigation Bar Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <button
            onClick={() => setActiveHarvestIdDetail(null)}
            style={{
              background: '#ffffff',
              border: '2px solid #000000',
              borderRadius: '12px',
              padding: '8px 14px',
              fontWeight: 800,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '2.5px 2.5px 0px #000000',
            }}
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={18} color="#000000" />
            <span>Back to All Harvests</span>
          </button>

          <button
            onClick={() => onOpenAddBatchModal(activeRecord.id)}
            className="neobrutal-btn-orange"
            style={{ height: '40px', padding: '0 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span style={{ whiteSpace: 'nowrap' }}>Add Batch ({String.fromCharCode(65 + activeRecord.batches.length)})</span>
          </button>
        </div>

        {/* Harvest Summary Card Header */}
        <div
          className="neobrutal-card"
          style={{ background: '#f3e8ff', padding: '20px', borderRadius: '18px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '2px solid #000000',
                boxShadow: '2.5px 2.5px 0px #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HugeiconsIcon icon={WheatIcon} size={24} color="#000000" />
            </div>

            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#000000', margin: 0 }}>
                {activeRecord.name}
              </h1>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                Created: {activeRecord.created_at} • {activeRecord.batches.length} Batch{activeRecord.batches.length > 1 ? 'es' : ''} Logged
              </div>
            </div>
          </div>

          {/* Metrics Row - Clean inline text side-by-side, no boxes */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '2px solid rgba(0, 0, 0, 0.12)',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  display: 'block',
                }}
              >
                Total Weight
              </span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#000000' }}>
                {formatTotalWeight(harvestTotalWeightKg)}
              </span>
            </div>

            <div style={{ width: '2px', height: '26px', background: '#000000', opacity: 0.2 }} />

            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  display: 'block',
                }}
              >
                Total Bunches
              </span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#000000' }}>
                {harvestTotalBunches.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Subheader */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: 0 }}>
            Batches under {activeRecord.name} ({activeRecord.batches.length})
          </h2>
        </div>

        {/* Batches Overview List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {activeRecord.batches.map((batch) => (
            <div
              key={batch.id}
              className="neobrutal-card"
              onClick={() => setActiveBatchIdDetail(batch.id)}
              style={{
                background: '#ffffff',
                padding: '18px 20px',
                borderRadius: '18px',
                border: '2.5px solid #000000',
                boxShadow: '4px 4px 0px #000000',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                transition: 'transform 0.15s ease, boxShadow 0.15s ease',
              }}
            >
              {/* Batch Header: Name + Date + Status Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: '#000000' }}>
                    {batch.batch_name}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                    • {batch.date}
                  </span>
                </div>

                <span
                  style={{
                    background: '#ffffff',
                    color: '#000000',
                    border: '1.5px solid #000000',
                    borderRadius: '8px',
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    boxShadow: '1.5px 1.5px 0px #000000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f97316' }} />
                  {batch.status}
                </span>
              </div>

              {/* Overview Row (3 Key Metrics) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '10px', borderTop: '2px solid rgba(0, 0, 0, 0.08)' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Weight</span>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#000000' }}>{batch.ffb_weight.toLocaleString()} {batch.weight_unit}</span>
                </div>

                <div style={{ width: '1.5px', height: '22px', background: '#000000', opacity: 0.15 }} />

                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Bunches</span>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#000000' }}>{batch.bunch_count} Bunches</span>
                </div>

                <div style={{ width: '1.5px', height: '22px', background: '#000000', opacity: 0.15 }} />

                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Destination</span>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#000000', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                    {batch.destination.split(' ')[0]} {batch.destination.split(' ')[1] || ''}
                  </span>
                </div>

                <HugeiconsIcon icon={ArrowRight02Icon} size={16} color="#000000" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // MAIN HARVEST OVERVIEW LIST VIEW
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
      {/* 2x2 Grid: Add New Harvest Button + 3 Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
        }}
      >
        {/* Slot 1 (Top Left): Add New Harvest Action Button */}
        <button
          type="button"
          onClick={onOpenAddHarvestModal}
          className="neobrutal-btn-yellow"
          style={{
            height: '100%',
            minHeight: '64px',
            padding: '12px 14px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '3px 3px 0px #000000',
            cursor: 'pointer',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000000"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span style={{ fontSize: '13px', fontWeight: 900, color: '#000000', whiteSpace: 'nowrap' }}>
            Add New Harvest
          </span>
        </button>

        {/* Slot 2 (Top Right): Logged Harvests */}
        <div
          className="neobrutal-card"
          style={{ background: '#ffedd5', padding: '12px 14px', borderRadius: '14px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <HugeiconsIcon icon={Calendar01Icon} size={18} color="#000000" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#000000', whiteSpace: 'nowrap' }}>
              Logged Harvests
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
            {records.length} <span style={{ fontSize: '12px', fontWeight: 700 }}>harvests</span>
          </div>
        </div>

        {/* Slot 3 (Bottom Left): Total Weight */}
        <div
          className="neobrutal-card"
          style={{ background: '#e0f2fe', padding: '12px 14px', borderRadius: '14px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <HugeiconsIcon icon={WheatIcon} size={18} color="#000000" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#000000', whiteSpace: 'nowrap' }}>
              Total Weight
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
            {formatTotalWeight(totalWeightKg)}
          </div>
        </div>

        {/* Slot 4 (Bottom Right): Total Bunches */}
        <div
          className="neobrutal-card"
          style={{ background: '#f3e8ff', padding: '12px 14px', borderRadius: '14px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <HugeiconsIcon icon={ScaleIcon} size={18} color="#000000" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#000000', whiteSpace: 'nowrap' }}>
              Total Bunches
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
            {totalBunches.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 700 }}>bunches</span>
          </div>
        </div>
      </div>

      {/* Section Header: Harvest & Batch Management */}
      <div style={{ marginTop: '10px', marginBottom: '4px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: 0 }}>
          Harvest & Batch Management
        </h2>
      </div>

      {/* Content Area: Empty State OR Clean Harvest Cards */}
      {records.length === 0 ? (
        <div
          className="neobrutal-card"
          style={{
            background: '#ffffff',
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            borderStyle: 'dashed',
            borderWidth: '3px',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: '#ffedd5',
              border: '2.5px solid #000000',
              boxShadow: '4px 4px 0px #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HugeiconsIcon icon={WheatIcon} size={36} color="#000000" />
          </div>

          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#000000', margin: '0 0 6px 0' }}>
              No Harvest Records Yet
            </h2>
            <p
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#64748b',
                maxWidth: '420px',
                margin: '0 auto',
                lineHeight: 1.5,
              }}
            >
              Start recording your fresh fruit bunch (FFB) harvests. Each harvest can contain multiple sequential batches (Batch A, Batch B...) with destination and processing status.
            </p>
          </div>
          <button
            onClick={onOpenAddHarvestModal}
            className="neobrutal-btn-orange"
            style={{ height: '50px', padding: '0 24px', fontSize: '15px', marginTop: '8px' }}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={20} color="#ffffff" />
            <span>Record First Harvest</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {records.map((record) => {
            const harvestTotalWeightKg = record.batches.reduce((sum, b) => {
              return sum + (b.weight_unit === 'Tonnes' ? b.ffb_weight * 1000 : b.ffb_weight);
            }, 0);

            const harvestTotalBunches = record.batches.reduce((sum, b) => sum + b.bunch_count, 0);

            return (
              <div
                key={record.id}
                className="neobrutal-card"
                onClick={() => setActiveHarvestIdDetail(record.id)}
                style={{
                  padding: '24px',
                  background: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  borderRadius: '24px',
                  transition: 'transform 0.15s ease, boxShadow 0.15s ease',
                }}
              >
                {/* Title & Icon Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      background: '#ffffff',
                      border: '2.5px solid #000000',
                      boxShadow: '3px 3px 0px #000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <HugeiconsIcon icon={WheatIcon} size={24} color="#000000" />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#000000', margin: 0, lineHeight: 1.2 }}>
                      {record.name}
                    </h3>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginTop: '4px' }}>
                      Created: {record.created_at} • <strong style={{ color: '#000000' }}>{record.batches.length} Batch{record.batches.length > 1 ? 'es' : ''} Logged</strong>
                    </div>
                  </div>
                </div>

                {/* Totals Badge */}
                <div style={{ marginTop: '2px' }}>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 900,
                      padding: '6px 14px',
                      background: '#ffffff',
                      color: '#000000',
                      borderRadius: '8px',
                      border: '1.5px solid #000000',
                      boxShadow: '2px 2px 0px #000000',
                      display: 'inline-block',
                    }}
                  >
                    Total: {formatTotalWeight(harvestTotalWeightKg)} ({harvestTotalBunches} Bunches)
                  </span>
                </div>

                {/* Action CTA row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    flexWrap: 'wrap',
                    paddingTop: '14px',
                    borderTop: '2px solid #000000',
                    marginTop: '4px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onOpenAddBatchModal(record.id)}
                    className="neobrutal-btn-orange"
                    style={{
                      height: '40px',
                      padding: '0 12px',
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span style={{ whiteSpace: 'nowrap' }}>Add Batch ({String.fromCharCode(65 + record.batches.length)})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveHarvestIdDetail(record.id)}
                    style={{
                      background: '#ffffff',
                      border: '2.5px solid #000000',
                      borderRadius: '14px',
                      padding: '0 12px',
                      height: '40px',
                      fontWeight: 800,
                      fontSize: '12px',
                      color: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      boxShadow: '3px 3px 0px #000000',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                  >
                    <span style={{ whiteSpace: 'nowrap' }}>View Batches ({record.batches.length})</span>
                    <HugeiconsIcon icon={ArrowRight02Icon} size={14} color="#000000" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
