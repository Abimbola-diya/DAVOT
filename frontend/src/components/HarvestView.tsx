import React, { useState } from 'react';
import { HarvestRecord, HarvestBatch } from '../types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  WheatIcon,
  PlusSignIcon,
  FactoryIcon,
  Calendar01Icon,
  ScaleIcon,
  CheckmarkCircle02Icon,
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

  const getStatusBadgeClass = (status: HarvestBatch['status']) => {
    switch (status) {
      case 'Awaiting Processing':
        return 'neobrutal-badge-yellow';
      case 'In Processing':
        return 'neobrutal-badge-blue';
      case 'Processed into CPO/PKO':
        return 'neobrutal-badge-teal';
      case 'Stored':
        return 'neobrutal-badge-pink';
      default:
        return 'neobrutal-badge-yellow';
    }
  };

  // If viewing details for a specific harvest
  const activeRecord = activeHarvestIdDetail
    ? records.find((r) => r.id === activeHarvestIdDetail)
    : null;

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
            <HugeiconsIcon icon={PlusSignIcon} size={16} color="#ffffff" />
            <span style={{ whiteSpace: 'nowrap' }}>Add Batch ({String.fromCharCode(65 + activeRecord.batches.length)})</span>
          </button>
        </div>

        {/* Harvest Summary Card Header */}
        <div
          className="neobrutal-card"
          style={{ background: '#fef08a', padding: '20px', borderRadius: '18px' }}
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

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
            <span className="neobrutal-badge-blue" style={{ fontSize: '13px', padding: '6px 12px' }}>
              Total Weight: {formatTotalWeight(harvestTotalWeightKg)}
            </span>
            <span className="neobrutal-badge-pink" style={{ fontSize: '13px', padding: '6px 12px' }}>
              Total Bunches: {harvestTotalBunches.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Subheader */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: 0 }}>
            Batches under {activeRecord.name} ({activeRecord.batches.length})
          </h2>
        </div>

        {/* Batches List for Active Harvest */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {activeRecord.batches.map((batch) => (
            <div
              key={batch.id}
              className="neobrutal-card"
              style={{
                background: '#ffffff',
                padding: '16px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Batch Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="neobrutal-badge-pink" style={{ fontSize: '14px', fontWeight: 900 }}>
                    {batch.batch_name}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 800, color: '#475569' }}>
                    <HugeiconsIcon icon={Calendar01Icon} size={14} color="#000000" />
                    {batch.date}
                  </span>
                </div>

                <span className={getStatusBadgeClass(batch.status)} style={{ fontSize: '12px' }}>
                  {batch.status === 'Awaiting Processing' && (
                    <HugeiconsIcon icon={Clock01Icon} size={13} color="#000000" style={{ marginRight: '4px' }} />
                  )}
                  {batch.status === 'Processed into CPO/PKO' && (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} color="#000000" style={{ marginRight: '4px' }} />
                  )}
                  {batch.status}
                </span>
              </div>

              {/* Batch Metrics Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '13px', fontWeight: 700 }}>
                <div>
                  <span style={{ color: '#64748b' }}>Weight: </span>
                  <span style={{ background: '#fef08a', padding: '3px 8px', borderRadius: '6px', border: '1.5px solid #000' }}>
                    {batch.ffb_weight.toLocaleString()} {batch.weight_unit}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#64748b' }}>Bunches: </span>
                  <span style={{ background: '#e0f2fe', padding: '3px 8px', borderRadius: '6px', border: '1.5px solid #000' }}>
                    {batch.bunch_count} Bunches
                  </span>
                </div>

                <div>
                  <span style={{ color: '#64748b' }}>Destination: </span>
                  <span className="neobrutal-badge-teal" style={{ fontSize: '12px' }}>
                    <HugeiconsIcon icon={FactoryIcon} size={13} color="#000000" style={{ marginRight: '4px' }} />
                    {batch.destination}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {batch.notes && (
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569',
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #000000',
                  }}
                >
                  <strong style={{ color: '#000000' }}>Note:</strong> {batch.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // MAIN HARVEST OVERVIEW LIST VIEW
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
      {/* Top Banner Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#000000',
              margin: 0,
              letterSpacing: '-0.5px',
            }}
          >
            Harvest & Batch Management
          </h1>
        </div>

        <button
          onClick={onOpenAddHarvestModal}
          className="neobrutal-btn-yellow"
          style={{ height: '42px', padding: '0 16px', fontSize: '14px' }}
        >
          <HugeiconsIcon icon={PlusSignIcon} size={18} color="#000000" />
          <span>Add New Harvest</span>
        </button>
      </div>

      {/* Overview Stat Cards - 2 Cards Side-by-Side */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
        }}
      >
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

      {/* Section Divider & Header introducing Logged Harvests */}
      {records.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', marginBottom: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: 0 }}>
              Logged Harvests
            </h2>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 900,
                background: '#fef08a',
                color: '#000000',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1.5px solid #000000',
                boxShadow: '1.5px 1.5px 0px #000000',
              }}
            >
              {records.length} Records
            </span>
          </div>

          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
            Tap card for details
          </span>
        </div>
      )}

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
              background: '#fef08a',
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
          </div>          <button
            onClick={onOpenAddHarvestModal}
            className="neobrutal-btn-yellow"
            style={{ height: '50px', padding: '0 24px', fontSize: '15px', marginTop: '8px' }}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={20} color="#000000" />
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
                      background: '#fef08a',
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
                  <span className="neobrutal-badge-pink" style={{ fontSize: '13px', padding: '6px 14px' }}>
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
                    <HugeiconsIcon icon={PlusSignIcon} size={15} color="#ffffff" />
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
