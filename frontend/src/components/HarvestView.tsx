import React from 'react';
import { HarvestRecord, HarvestBatch } from '../types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  WheatIcon,
  PlusSignIcon,
  FactoryIcon,
  Calendar01Icon,
  ScaleIcon,
  Sorting01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
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
  // Calculate aggregate metrics
  const totalBatches = records.reduce((sum, r) => sum + r.batches.length, 0);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '100px' }}>
      {/* Top Banner Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                background: '#fef08a',
                color: '#000000',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '2px solid #000000',
                boxShadow: '2px 2px 0px #000000',
              }}
            >
              Farm Operations Mode
            </span>
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 900,
              color: '#000000',
              margin: '6px 0 0 0',
              letterSpacing: '-0.5px',
            }}
          >
            Harvest & Batch Management
          </h1>
        </div>

        <button
          onClick={onOpenAddHarvestModal}
          className="neobrutal-btn-yellow"
          style={{ height: '48px', padding: '0 20px', fontSize: '15px' }}
        >
          <HugeiconsIcon icon={PlusSignIcon} size={20} color="#000000" />
          <span>Add New Harvest</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          className="neobrutal-card"
          style={{ background: '#fef08a', padding: '16px', borderRadius: '16px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <HugeiconsIcon icon={WheatIcon} size={22} color="#000000" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#000000' }}>
              Total Harvest Weight
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#000000' }}>
            {formatTotalWeight(totalWeightKg)}
          </div>
        </div>

        <div
          className="neobrutal-card"
          style={{ background: '#e0f2fe', padding: '16px', borderRadius: '16px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <HugeiconsIcon icon={ScaleIcon} size={22} color="#000000" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#000000' }}>
              Total FFB Bunches
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#000000' }}>
            {totalBunches.toLocaleString()} <span style={{ fontSize: '14px' }}>bunches</span>
          </div>
        </div>

        <div
          className="neobrutal-card"
          style={{ background: '#ffe4e6', padding: '16px', borderRadius: '16px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <HugeiconsIcon icon={Sorting01Icon} size={22} color="#000000" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#000000' }}>
              Logged Batches
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#000000' }}>
            {totalBatches} <span style={{ fontSize: '14px' }}>batches ({records.length} harvests)</span>
          </div>
        </div>
      </div>

      {/* Content Area: Empty State OR Harvest Cards */}
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
          </div>

          <button
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
              <div key={record.id} className="neobrutal-card" style={{ padding: '20px', background: '#ffffff' }}>
                {/* Harvest Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingBottom: '16px',
                    borderBottom: '2.5px solid #000000',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: '#fef08a',
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
                      <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: 0 }}>
                        {record.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                          Created: {record.created_at}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#000000' }}>
                          • {record.batches.length} Batch{record.batches.length > 1 ? 'es' : ''} Logged
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Pills & Add Batch CTA */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span className="neobrutal-badge-blue" style={{ fontSize: '13px' }}>
                      Total: {formatTotalWeight(harvestTotalWeightKg)} ({harvestTotalBunches} Bunches)
                    </span>

                    <button
                      onClick={() => onOpenAddBatchModal(record.id)}
                      className="neobrutal-btn-yellow"
                      style={{ height: '38px', padding: '0 14px', fontSize: '13px' }}
                    >
                      <HugeiconsIcon icon={PlusSignIcon} size={16} color="#000000" />
                      <span>Add Batch ({String.fromCharCode(65 + record.batches.length)})</span>
                    </button>
                  </div>
                </div>

                {/* Batches Grid / List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {record.batches.map((batch) => (
                    <div
                      key={batch.id}
                      style={{
                        background: '#f8fafc',
                        borderRadius: '14px',
                        border: '2px solid #000000',
                        boxShadow: '3px 3px 0px #000000',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      {/* Batch Header line */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="neobrutal-badge-pink" style={{ fontSize: '13px', fontWeight: 900 }}>
                            {batch.batch_name}
                          </span>
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: 800,
                              color: '#334155',
                            }}
                          >
                            <HugeiconsIcon icon={Calendar01Icon} size={14} color="#000000" />
                            {batch.date}
                          </span>
                        </div>

                        {/* Status Badge */}
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

                      {/* Details row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          flexWrap: 'wrap',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#000000',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#64748b' }}>Weight:</span>
                          <span style={{ background: '#fef08a', padding: '2px 8px', borderRadius: '6px', border: '1.5px solid #000' }}>
                            {batch.ffb_weight.toLocaleString()} {batch.weight_unit}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#64748b' }}>Bunches:</span>
                          <span style={{ background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px', border: '1.5px solid #000' }}>
                            {batch.bunch_count} Bunches
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#64748b' }}>Destination:</span>
                          <span className="neobrutal-badge-teal" style={{ fontSize: '12px' }}>
                            <HugeiconsIcon icon={FactoryIcon} size={13} color="#000000" style={{ marginRight: '4px' }} />
                            {batch.destination}
                          </span>
                        </div>
                      </div>

                      {/* Notes if available */}
                      {batch.notes && (
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#475569',
                            background: '#ffffff',
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
          })}
        </div>
      )}
    </div>
  );
};
