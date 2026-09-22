import React, { useState } from 'react';
import { HarvestRecord, HarvestBatch } from '../../types';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, WheatIcon, PlusSignIcon } from '@hugeicons/core-free-icons';

interface AddHarvestModalProps {
  onClose: () => void;
  onSaveNewHarvest: (harvestName: string, batchData: Omit<HarvestBatch, 'id' | 'batch_name'>) => void;
  onAddBatchToExisting: (harvestId: string, batchData: Omit<HarvestBatch, 'id' | 'batch_name'>) => void;
  existingRecords: HarvestRecord[];
  initialHarvestId?: string;
}

export const AddHarvestModal: React.FC<AddHarvestModalProps> = ({
  onClose,
  onSaveNewHarvest,
  onAddBatchToExisting,
  existingRecords,
  initialHarvestId,
}) => {
  const [mode, setMode] = useState<'new' | 'existing'>(
    initialHarvestId ? 'existing' : (existingRecords.length > 0 ? 'existing' : 'new')
  );
  const [selectedHarvestId, setSelectedHarvestId] = useState<string>(
    initialHarvestId || (existingRecords[0]?.id || '')
  );
  const [harvestName, setHarvestName] = useState('');

  // Batch Form Fields
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [ffbWeight, setFfbWeight] = useState<number | ''>('');
  const [weightUnit, setWeightUnit] = useState<'Kg' | 'Tonnes'>('Kg');
  const [bunchCount, setBunchCount] = useState<number | ''>('');
  const [destination, setDestination] = useState('Palm Oil Mill 1 (Hydraulic Press)');
  const [status, setStatus] = useState<HarvestBatch['status']>('Awaiting Processing');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const targetRecord = existingRecords.find((r) => r.id === selectedHarvestId);
  const nextBatchLetter = targetRecord
    ? String.fromCharCode(65 + targetRecord.batches.length)
    : 'A';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ffbWeight || Number(ffbWeight) <= 0) {
      setError('Please enter a valid FFB weight');
      return;
    }
    if (!bunchCount || Number(bunchCount) <= 0) {
      setError('Please enter valid number of bunches');
      return;
    }

    const batchData: Omit<HarvestBatch, 'id' | 'batch_name'> = {
      date,
      ffb_weight: Number(ffbWeight),
      weight_unit: weightUnit,
      bunch_count: Number(bunchCount),
      destination,
      status,
      notes: notes.trim() || undefined,
    };

    if (mode === 'new') {
      const finalName = harvestName.trim() || `Harvest ${new Date().toLocaleDateString()}`;
      onSaveNewHarvest(finalName, batchData);
    } else {
      if (!selectedHarvestId) {
        setError('Please select an existing harvest record');
        return;
      }
      onAddBatchToExisting(selectedHarvestId, batchData);
    }
    onClose();
  };

  return (
    <div className="neobrutal-modal-overlay" onClick={onClose}>
      <div className="neobrutal-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#fef08a',
              border: '2px solid #000000',
              boxShadow: '2.5px 2.5px 0px #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HugeiconsIcon icon={WheatIcon} size={22} color="#000000" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#000000', margin: 0, lineHeight: 1.1 }}>
                Log Harvest Batch
              </h2>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                {mode === 'new' ? 'New Harvest Record (Batch A)' : `Appending ${nextBatchLetter} to Existing`}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '2px solid #000000',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #000000'
            }}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} color="#000000" />
          </button>
        </div>

        {error && (
          <div className="auth-error-banner" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Mode Selector Tabs (New vs Existing) */}
        {existingRecords.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setMode('existing')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '12px',
                border: '2px solid #000000',
                background: mode === 'existing' ? '#fef08a' : '#ffffff',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: mode === 'existing' ? '3px 3px 0px #000000' : '2px 2px 0px #000000',
                transition: 'all 0.15s ease'
              }}
            >
              Add Batch ({nextBatchLetter}) to Existing
            </button>
            <button
              type="button"
              onClick={() => setMode('new')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '12px',
                border: '2px solid #000000',
                background: mode === 'new' ? '#ffe4e6' : '#ffffff',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: mode === 'new' ? '3px 3px 0px #000000' : '2px 2px 0px #000000',
                transition: 'all 0.15s ease'
              }}
            >
              Start New Harvest
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Target Selection / Name */}
          {mode === 'existing' ? (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#000000', marginBottom: '6px' }}>
                Select Existing Harvest Record:
              </label>
              <select
                className="davot-input"
                value={selectedHarvestId}
                onChange={(e) => setSelectedHarvestId(e.target.value)}
                required
              >
                {existingRecords.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.batches.length} batch{r.batches.length > 1 ? 'es' : ''})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#000000', marginBottom: '6px' }}>
                Harvest Name / Block Title:
              </label>
              <input
                type="text"
                className="davot-input"
                placeholder="e.g. Block A Palm Harvest - Main Field"
                value={harvestName}
                onChange={(e) => setHarvestName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Date */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#000000', marginBottom: '6px' }}>
              Date of Harvest:
            </label>
            <input
              type="date"
              className="davot-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* FFB Weight & Unit Toggle */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#000000', marginBottom: '6px' }}>
              Fresh Fruit Bunch (FFB) Weight:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                step="any"
                className="davot-input"
                placeholder="e.g. 1250"
                value={ffbWeight}
                onChange={(e) => setFfbWeight(e.target.value === '' ? '' : Number(e.target.value))}
                required
                style={{ flex: 1 }}
              />
              <div style={{ display: 'flex', border: '2.5px solid #000000', borderRadius: '16px', overflow: 'hidden', boxShadow: '2px 2px 0px #000000' }}>
                <button
                  type="button"
                  onClick={() => setWeightUnit('Kg')}
                  style={{
                    padding: '0 16px',
                    background: weightUnit === 'Kg' ? '#38bdf8' : '#ffffff',
                    color: weightUnit === 'Kg' ? '#000000' : '#475569',
                    fontWeight: 800,
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Kg
                </button>
                <button
                  type="button"
                  onClick={() => setWeightUnit('Tonnes')}
                  style={{
                    padding: '0 16px',
                    background: weightUnit === 'Tonnes' ? '#38bdf8' : '#ffffff',
                    color: weightUnit === 'Tonnes' ? '#000000' : '#475569',
                    fontWeight: 800,
                    fontSize: '14px',
                    borderLeft: '2px solid #000000',
                    borderTop: 'none',
                    borderRight: 'none',
                    borderBottom: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Tonnes
                </button>
              </div>
            </div>
          </div>

          {/* Bunch Count */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#000000', marginBottom: '6px' }}>
              Number of FFB Bunches:
            </label>
            <input
              type="number"
              className="davot-input"
              placeholder="e.g. 180"
              value={bunchCount}
              onChange={(e) => setBunchCount(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
          </div>

          {/* Destination */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#000000', marginBottom: '6px' }}>
              Transport Destination:
            </label>
            <select
              className="davot-input"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            >
              <option value="Palm Oil Mill 1 (Hydraulic Press)">Palm Oil Mill 1 (Hydraulic Press)</option>
              <option value="Kernel Expeller Press Stream">Kernel Expeller Press Stream</option>
              <option value="Central Factory Processing Depot">Central Factory Processing Depot</option>
              <option value="External Cooperative Mill">External Cooperative Mill</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#000000', marginBottom: '6px' }}>
              Harvest Batch Status:
            </label>
            <select
              className="davot-input"
              value={status}
              onChange={(e) => setStatus(e.target.value as HarvestBatch['status'])}
              required
            >
              <option value="Awaiting Processing">Awaiting Processing</option>
              <option value="In Processing">In Processing</option>
              <option value="Processed into CPO/PKO">Processed into CPO/PKO</option>
              <option value="Stored">Stored</option>
            </select>
          </div>

          {/* Extra Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#000000', marginBottom: '6px' }}>
              Extra Notes (Optional):
            </label>
            <textarea
              className="davot-input"
              style={{ height: '76px', padding: '10px 14px', resize: 'none' }}
              placeholder="e.g. High ripeness yield, transported via tractor trailer A"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="neobrutal-btn-yellow" style={{ width: '100%', marginTop: '8px', height: '54px', fontSize: '16px' }}>
            <HugeiconsIcon icon={PlusSignIcon} size={20} color="#000000" />
            <span>{mode === 'new' ? 'Save Harvest & Batch A' : `Save ${nextBatchLetter} to Harvest`}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
