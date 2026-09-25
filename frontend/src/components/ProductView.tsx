import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ProductLoadingIcon,
  ArrowLeft02Icon,
  Layers01Icon,
  Analytics01Icon,
} from '@hugeicons/core-free-icons';
import { ProductBatch, HarvestRecord } from '../types';

interface ProductViewProps {
  harvestRecords?: HarvestRecord[];
}

// Fallback Mock Harvest Records with individual batches if none passed in props
const MOCK_HARVEST_RECORDS: HarvestRecord[] = [
  {
    id: 'HV-014',
    name: 'Harvest HV-014',
    created_at: '2026-09-24',
    batches: [
      { id: 'HV-014-B1', batch_name: 'Batch #1', date: '2026-09-24', ffb_weight: 1280, weight_unit: 'Kg', bunch_count: 180, destination: 'Mill 1', status: 'Processed' },
      { id: 'HV-014-B2', batch_name: 'Batch #2', date: '2026-09-22', ffb_weight: 1500, weight_unit: 'Kg', bunch_count: 210, destination: 'Mill 1', status: 'Processed' },
      { id: 'HV-014-B3', batch_name: 'Batch #3', date: '2026-09-18', ffb_weight: 1720, weight_unit: 'Kg', bunch_count: 240, destination: 'Mill 1', status: 'Processed' },
    ],
  },
  {
    id: 'HV-015',
    name: 'Harvest HV-015',
    created_at: '2026-09-12',
    batches: [
      { id: 'HV-015-B1', batch_name: 'Batch #1', date: '2026-09-12', ffb_weight: 2000, weight_unit: 'Kg', bunch_count: 280, destination: 'Mill 1', status: 'Processed' },
    ],
  },
];

// Initial Mock Product Batches
const INITIAL_PRODUCT_BATCHES: ProductBatch[] = [
  {
    id: 'PB-024',
    harvest_id: 'HV-014',
    harvest_batch_id: 'HV-014-B1',
    date: '2026-09-24',
    ffb_processed_kg: 1280,
    cpo_produced_litres: 230,
    pko_produced_litres: 80,
    pkc_produced_kg: 150,
    notes: 'Batch 1 processing for HV-014. Good CPO extraction.',
  },
  {
    id: 'PB-025',
    harvest_id: 'HV-014',
    harvest_batch_id: 'HV-014-B2',
    date: '2026-09-22',
    ffb_processed_kg: 1500,
    cpo_produced_litres: 270,
    pko_produced_litres: 95,
    pkc_produced_kg: 180,
    notes: 'Batch 2 processing. Smooth operation.',
  },
  {
    id: 'PB-026',
    harvest_id: 'HV-014',
    harvest_batch_id: 'HV-014-B3',
    date: '2026-09-18',
    ffb_processed_kg: 1720,
    cpo_produced_litres: 320,
    pko_produced_litres: 115,
    pkc_produced_kg: 210,
    notes: 'Batch 3 completion for HV-014.',
  },
  {
    id: 'PB-027',
    harvest_id: 'HV-015',
    harvest_batch_id: 'HV-015-B1',
    date: '2026-09-12',
    ffb_processed_kg: 2000,
    cpo_produced_litres: 360,
    pko_produced_litres: 130,
    pkc_produced_kg: 240,
    notes: 'Initial batch from HV-015.',
  },
];

type ProductKey = 'cpo' | 'pko' | 'pkc';

interface ProductConfig {
  key: ProductKey;
  name: string;
  shortName: string;
  subtitle: string;
  unit: string;
  stock: number;
  lastMonthProduced: number;
  badgeBg: string;
  badgeText: string;
  trend: { month: string; amount: number }[];
}

const PRODUCTS_CONFIG: Record<ProductKey, ProductConfig> = {
  cpo: {
    key: 'cpo',
    name: 'Crude Palm Oil (CPO)',
    shortName: 'Crude Palm Oil',
    subtitle: 'Primary Extract • Liquid',
    unit: 'Litres',
    stock: 620,
    lastMonthProduced: 1620,
    badgeBg: '#fff7ed',
    badgeText: '#ea580c',
    trend: [
      { month: 'July', amount: 1400 },
      { month: 'August', amount: 1620 },
      { month: 'September', amount: 1840 },
    ],
  },
  pko: {
    key: 'pko',
    name: 'Palm Kernel Oil (PKO)',
    shortName: 'Palm Kernel Oil',
    subtitle: 'Kernel Extract • Liquid',
    unit: 'Litres',
    stock: 240,
    lastMonthProduced: 590,
    badgeBg: '#ecfdf5',
    badgeText: '#059669',
    trend: [
      { month: 'July', amount: 480 },
      { month: 'August', amount: 590 },
      { month: 'September', amount: 670 },
    ],
  },
  pkc: {
    key: 'pkc',
    name: 'Palm Kernel Cake (PKC)',
    shortName: 'Palm Kernel Cake',
    subtitle: 'Solid Press Cake • Dry',
    unit: 'kg',
    stock: 480,
    lastMonthProduced: 1050,
    badgeBg: '#fefce8',
    badgeText: '#ca8a04',
    trend: [
      { month: 'July', amount: 900 },
      { month: 'August', amount: 1050 },
      { month: 'September', amount: 1240 },
    ],
  },
};

export const ProductView: React.FC<ProductViewProps> = ({ harvestRecords = [] }) => {
  // Combine props harvestRecords with fallback mock records
  const allHarvestRecords = useMemo(() => {
    if (harvestRecords && harvestRecords.length > 0) {
      return harvestRecords;
    }
    return MOCK_HARVEST_RECORDS;
  }, [harvestRecords]);

  // State management
  const [batches, setBatches] = useState<ProductBatch[]>(INITIAL_PRODUCT_BATCHES);
  const [selectedProductKey, setSelectedProductKey] = useState<ProductKey | null>(null);
  const [selectedHarvestDetailId, setSelectedHarvestDetailId] = useState<string | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ProductBatch | null>(null);

  // Form state for Record Processing Batch (Cascading Harvest -> Batch selection)
  const [formHarvestId, setFormHarvestId] = useState<string>('HV-014');
  const [formBatchId, setFormBatchId] = useState<string>('HV-014-B1');
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formCpoLitres, setFormCpoLitres] = useState<number | ''>(230);
  const [formPkoLitres, setFormPkoLitres] = useState<number | ''>(80);
  const [formPkcKg, setFormPkcKg] = useState<number | ''>(150);
  const [formNotes, setFormNotes] = useState<string>('');

  // Derived selected Harvest Record object
  const currentHarvestObj = useMemo(() => {
    return allHarvestRecords.find((h) => h.id === formHarvestId || h.name === formHarvestId) || allHarvestRecords[0];
  }, [allHarvestRecords, formHarvestId]);

  // Available batches for selected harvest record
  const currentAvailableBatches = currentHarvestObj ? currentHarvestObj.batches : [];

  // Derived selected Batch object
  const currentBatchObj = useMemo(() => {
    return currentAvailableBatches.find((b) => b.id === formBatchId) || currentAvailableBatches[0];
  }, [currentAvailableBatches, formBatchId]);

  // Auto-linked FFB weight in Kg
  const autoFfbKg = currentBatchObj
    ? currentBatchObj.weight_unit === 'Tonnes'
      ? currentBatchObj.ffb_weight * 1000
      : currentBatchObj.ffb_weight
    : 0;

  // Handle Harvest selection change
  const handleHarvestChange = (newHarvestId: string) => {
    setFormHarvestId(newHarvestId);
    const targetHarvest = allHarvestRecords.find((h) => h.id === newHarvestId || h.name === newHarvestId);
    if (targetHarvest && targetHarvest.batches.length > 0) {
      setFormBatchId(targetHarvest.batches[0].id);
    } else {
      setFormBatchId('');
    }
  };

  // Dynamic calculation for monthly totals from batches
  const monthlyTotals = batches.reduce(
    (acc, b) => {
      acc.cpo += b.cpo_produced_litres;
      acc.pko += b.pko_produced_litres;
      acc.pkc += b.pkc_produced_kg;
      return acc;
    },
    { cpo: 1840, pko: 670, pkc: 1240 }
  );

  // Group batches by harvest_id
  const harvestGroups = Array.from(new Set(batches.map((b) => b.harvest_id))).map((harvestId) => {
    const harvestBatches = batches.filter((b) => b.harvest_id === harvestId);
    const totalFfbKg = harvestBatches.reduce((sum, b) => sum + b.ffb_processed_kg, 0);
    const totalCpo = harvestBatches.reduce((sum, b) => sum + b.cpo_produced_litres, 0);
    const totalPko = harvestBatches.reduce((sum, b) => sum + b.pko_produced_litres, 0);
    const totalPkc = harvestBatches.reduce((sum, b) => sum + b.pkc_produced_kg, 0);
    const latestDate = harvestBatches.slice().sort((a, b) => (a.date > b.date ? -1 : 1))[0]?.date || '';

    return {
      harvestId,
      batches: harvestBatches,
      batchCount: harvestBatches.length,
      totalFfbKg,
      totalCpo,
      totalPko,
      totalPkc,
      latestDate,
    };
  });

  // Submit new production batch
  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (autoFfbKg <= 0) return;

    const nextNumber = batches.length + 24;
    const newBatch: ProductBatch = {
      id: `PB-0${nextNumber}`,
      harvest_id: formHarvestId,
      harvest_batch_id: formBatchId,
      date: formDate,
      ffb_processed_kg: autoFfbKg,
      cpo_produced_litres: typeof formCpoLitres === 'number' ? formCpoLitres : 0,
      pko_produced_litres: typeof formPkoLitres === 'number' ? formPkoLitres : 0,
      pkc_produced_kg: typeof formPkcKg === 'number' ? formPkcKg : 0,
      notes: formNotes.trim() || undefined,
    };

    setBatches([newBatch, ...batches]);
    setIsRecordModalOpen(false);
    setFormNotes('');
  };

  // -------------------------------------------------------------
  // VIEW 1: DEDICATED PRODUCT DETAIL VIEW (When a product is clicked)
  // -------------------------------------------------------------
  if (selectedProductKey) {
    const product = PRODUCTS_CONFIG[selectedProductKey];
    const monthProduced =
      selectedProductKey === 'cpo'
        ? monthlyTotals.cpo
        : selectedProductKey === 'pko'
        ? monthlyTotals.pko
        : monthlyTotals.pkc;

    const diff = monthProduced - product.lastMonthProduced;
    const pct = product.lastMonthProduced > 0 ? Math.round((diff / product.lastMonthProduced) * 100) : 0;

    // -------------------------------------------------------------
    // VIEW 1.B: INDIVIDUAL HARVEST BATCHES DRILL-DOWN VIEW
    // -------------------------------------------------------------
    if (selectedHarvestDetailId) {
      const harvestGroup = harvestGroups.find((g) => g.harvestId === selectedHarvestDetailId);
      const harvestBatches = harvestGroup ? harvestGroup.batches : [];

      const totalFfb = harvestGroup ? harvestGroup.totalFfbKg : 0;
      const totalProduced = harvestGroup
        ? selectedProductKey === 'cpo'
          ? harvestGroup.totalCpo
          : selectedProductKey === 'pko'
          ? harvestGroup.totalPko
          : harvestGroup.totalPkc
        : 0;

      const avgYield =
        selectedProductKey === 'cpo'
          ? (totalFfb > 0 ? (totalProduced / totalFfb).toFixed(2) : '0.00') + ' L/kg'
          : selectedProductKey === 'pko'
          ? (totalFfb > 0 ? (totalProduced / totalFfb).toFixed(2) : '0.00') + ' L/kg'
          : (totalFfb > 0 ? (totalProduced / totalFfb).toFixed(2) : '0.00') + ' kg/kg';

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
          {/* Back Button */}
          <button
            onClick={() => setSelectedHarvestDetailId(null)}
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
              marginBottom: '4px',
              alignSelf: 'flex-start',
            }}
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={16} color="#000000" />
            Back to Harvests ({product.shortName})
          </button>

          {/* Harvest Header Card */}
          <div
            className="neobrutal-card"
            style={{
              background: '#ffffff',
              border: '2.5px solid #000000',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '4px 4px 0px #000000',
            }}
          >
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: product.badgeText, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block' }}>
                {product.name}
              </span>
              <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#000000', margin: '2px 0 0 0' }}>
                Harvest {selectedHarvestDetailId}
              </h1>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                {harvestBatches.length} Processing Batches Logged
              </span>
            </div>

            {/* Summary metrics row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div style={{ background: '#f8fafc', border: '1.5px solid #000000', borderRadius: '10px', padding: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Total FFB</span>
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#000000' }}>{totalFfb.toLocaleString()} kg</span>
              </div>

              <div style={{ background: '#f8fafc', border: '1.5px solid #000000', borderRadius: '10px', padding: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Total Produced</span>
                <span style={{ fontSize: '15px', fontWeight: 900, color: product.badgeText }}>{totalProduced.toLocaleString()} {product.unit}</span>
              </div>

              <div style={{ background: '#f8fafc', border: '1.5px solid #000000', borderRadius: '10px', padding: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Avg Yield</span>
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#000000' }}>{avgYield}</span>
              </div>
            </div>
          </div>

          {/* List of Individual Batches under Harvest */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#000000', margin: '4px 0 0 0' }}>
              Logged Processing Batches ({harvestBatches.length})
            </h2>

            {harvestBatches.map((batch) => {
              const producedVal =
                selectedProductKey === 'cpo'
                  ? batch.cpo_produced_litres
                  : selectedProductKey === 'pko'
                  ? batch.pko_produced_litres
                  : batch.pkc_produced_kg;

              const outputRate =
                selectedProductKey === 'cpo'
                  ? (batch.cpo_produced_litres / batch.ffb_processed_kg).toFixed(2) + ' L/kg'
                  : selectedProductKey === 'pko'
                  ? (batch.pko_produced_litres / Math.max(1, batch.ffb_processed_kg)).toFixed(2) + ' L/kg'
                  : (batch.pkc_produced_kg / Math.max(1, batch.ffb_processed_kg)).toFixed(2) + ' kg/kg';

              return (
                <div
                  key={batch.id}
                  onClick={() => setSelectedBatch(batch)}
                  className="neobrutal-card"
                  style={{
                    background: '#ffffff',
                    border: '2.5px solid #000000',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '3px 3px 0px #000000',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: '#000000' }}>#{batch.id}</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, background: '#e2e8f0', border: '1px solid #000000', padding: '2px 8px', borderRadius: '6px' }}>
                        Harvest {batch.harvest_id}
                      </span>
                    </div>

                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b' }}>{batch.date}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #000000', borderRadius: '8px', padding: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>FFB Processed</span>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#000000' }}>{batch.ffb_processed_kg.toLocaleString()} kg</span>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #000000', borderRadius: '8px', padding: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Produced</span>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: product.badgeText }}>{producedVal.toLocaleString()} {product.unit}</span>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #000000', borderRadius: '8px', padding: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Yield Rate</span>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#000000' }}>{outputRate}</span>
                    </div>
                  </div>

                  {batch.notes && (
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px' }}>
                      💬 {batch.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
        {/* Back Button */}
        <button
          onClick={() => {
            setSelectedProductKey(null);
            setSelectedHarvestDetailId(null);
          }}
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
            marginBottom: '4px',
            alignSelf: 'flex-start',
          }}
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} size={16} color="#000000" />
          Back to Products Overview
        </button>

        {/* Product Banner Header Card */}
        <div
          className="neobrutal-card"
          style={{
            background: '#ffffff',
            border: '2.5px solid #000000',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '4px 4px 0px #000000',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: product.badgeBg,
                border: '2.5px solid #000000',
                boxShadow: '3px 3px 0px #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <HugeiconsIcon icon={ProductLoadingIcon} size={26} color="#000000" />
            </div>

            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#000000', margin: 0 }}>
                {product.name}
              </h1>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>
                {product.subtitle}
              </span>
            </div>
          </div>

          {/* Current Stock Banner */}
          <div
            style={{
              background: product.badgeBg,
              border: '2px solid #000000',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '2px 2px 0px #000000',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                Current Stock Level
              </span>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#000000' }}>
                {product.stock.toLocaleString()} {product.unit}
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                Produced This Month
              </span>
              <span style={{ fontSize: '18px', fontWeight: 900, color: product.badgeText }}>
                {monthProduced.toLocaleString()} {product.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Production Performance & Comparison (This Month vs Last Month) */}
        <div
          style={{
            background: '#ffffff',
            border: '2.5px solid #000000',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '3.5px 3.5px 0px #000000',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <HugeiconsIcon icon={Analytics01Icon} size={18} color="#000000" />
            <h2 style={{ fontSize: '14px', fontWeight: 900, color: '#000000', margin: 0, textTransform: 'uppercase' }}>
              Production Performance ({product.shortName})
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '12px' }}>
            {/* THIS MONTH */}
            <div style={{ background: '#fff7ed', border: '1.5px solid #000000', borderRadius: '12px', padding: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#000000', textTransform: 'uppercase', display: 'block' }}>
                This Month Output
              </span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: product.badgeText }}>
                {monthProduced.toLocaleString()} {product.unit}
              </span>
            </div>

            {/* LAST MONTH */}
            <div style={{ background: '#ffffff', border: '1.5px solid #000000', borderRadius: '12px', padding: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#000000', textTransform: 'uppercase', display: 'block' }}>
                Last Month Output
              </span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#000000' }}>
                {product.lastMonthProduced.toLocaleString()} {product.unit}
              </span>
            </div>
          </div>

          {/* Performance Insight */}
          <div style={{ background: '#fef08a', border: '1.5px solid #000000', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 800, color: '#000000' }}>
            💡 {diff >= 0 ? `Increased by ${diff.toLocaleString()} ${product.unit} (+${pct}%) vs last month` : `Decreased by ${Math.abs(diff).toLocaleString()} ${product.unit} (${pct}%) vs last month`}
          </div>
        </div>

        {/* Section 2: 3-Month Production Trend */}
        <div
          style={{
            background: '#ffffff',
            border: '2.5px solid #000000',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '3.5px 3.5px 0px #000000',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 900, color: '#000000', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
            📈 3-Month Production Trend
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {product.trend.map((t) => (
              <div
                key={t.month}
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #000000',
                  borderRadius: '10px',
                  padding: '10px',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block' }}>{t.month}</span>
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#000000' }}>{t.amount.toLocaleString()} {product.unit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Processing Harvests Attuned to This Product */}
        <div
          style={{
            background: '#ffffff',
            border: '2.5px solid #000000',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '3.5px 3.5px 0px #000000',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
            <HugeiconsIcon icon={Layers01Icon} size={18} color="#000000" />
            <h2 style={{ fontSize: '14px', fontWeight: 900, color: '#000000', margin: 0, textTransform: 'uppercase' }}>
              Processing Harvests ({product.shortName})
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {harvestGroups.map((hGroup) => {
              const producedVal =
                selectedProductKey === 'cpo'
                  ? hGroup.totalCpo
                  : selectedProductKey === 'pko'
                  ? hGroup.totalPko
                  : hGroup.totalPkc;

              const avgYield =
                selectedProductKey === 'cpo'
                  ? (hGroup.totalFfbKg > 0 ? (hGroup.totalCpo / hGroup.totalFfbKg).toFixed(2) : '0.00') + ' L/kg'
                  : selectedProductKey === 'pko'
                  ? (hGroup.totalFfbKg > 0 ? (hGroup.totalPko / hGroup.totalFfbKg).toFixed(2) : '0.00') + ' L/kg'
                  : (hGroup.totalFfbKg > 0 ? (hGroup.totalPkc / hGroup.totalFfbKg).toFixed(2) : '0.00') + ' kg/kg';

              return (
                <div
                  key={hGroup.harvestId}
                  onClick={() => setSelectedHarvestDetailId(hGroup.harvestId)}
                  className="neobrutal-card"
                  style={{
                    background: '#ffffff',
                    border: '2.5px solid #000000',
                    borderRadius: '20px',
                    padding: '18px',
                    boxShadow: '3.5px 3.5px 0px #000000',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    transition: 'transform 0.15s ease, boxShadow 0.15s ease',
                  }}
                >
                  {/* Top Row: Harvest Title + Batch Count + Arrow */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: '#f8fafc',
                          border: '2px solid #000000',
                          boxShadow: '2.5px 2.5px 0px #000000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <HugeiconsIcon icon={Layers01Icon} size={22} color="#000000" />
                      </div>

                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: 0, lineHeight: 1.2 }}>
                          Harvest {hGroup.harvestId}
                        </h3>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginTop: '2px' }}>
                          Latest: {hGroup.latestDate} • <strong style={{ color: '#000000' }}>{hGroup.batchCount} Batches Logged</strong>
                        </div>
                      </div>
                    </div>

                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#000000' }}>→</span>
                  </div>

                  {/* 3 Separate Field Rectangles (Longer in height, clean spacing) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {/* Field 1: FFB Processed */}
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1.5px solid #000000',
                        borderRadius: '12px',
                        padding: '12px 14px',
                      }}
                    >
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: '3px' }}>
                        FFB Processed
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: '#000000' }}>
                        {hGroup.totalFfbKg.toLocaleString()} kg
                      </span>
                    </div>

                    {/* Field 2: Produced */}
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1.5px solid #000000',
                        borderRadius: '12px',
                        padding: '12px 14px',
                      }}
                    >
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: '3px' }}>
                        Produced
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: product.badgeText }}>
                        {producedVal.toLocaleString()} {product.unit}
                      </span>
                    </div>

                    {/* Field 3: Average Yield */}
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1.5px solid #000000',
                        borderRadius: '12px',
                        padding: '12px 14px',
                      }}
                    >
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: '3px' }}>
                        Avg Yield Rate
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: '#000000' }}>
                        {avgYield}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: MAIN PRODUCTS OVERVIEW PAGE (3 Product Cards + Metric Cards)
  // -------------------------------------------------------------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
      {/* 2x2 Grid: Record Batch Action Button + 3 Product Stock Cards (Matching Harvest page layout) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
        }}
      >
        {/* Slot 1 (Top Left): Record Batch Action Button */}
        <button
          type="button"
          onClick={() => setIsRecordModalOpen(true)}
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
            background: '#facc15',
            border: '2.5px solid #000000',
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
            Record Batch
          </span>
        </button>

        {/* Slot 2 (Top Right): CPO Stock Card */}
        <div
          className="neobrutal-card"
          onClick={() => setSelectedProductKey('cpo')}
          style={{
            background: '#ffedd5',
            border: '2.5px solid #000000',
            boxShadow: '3.5px 3.5px 0px #000000',
            padding: '12px 14px',
            borderRadius: '14px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <HugeiconsIcon icon={ProductLoadingIcon} size={18} color="#000000" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#000000', whiteSpace: 'nowrap' }}>
              CPO Stock
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
            {PRODUCTS_CONFIG.cpo.stock.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 700 }}>Litres</span>
          </div>
        </div>

        {/* Slot 3 (Bottom Left): PKO Stock Card */}
        <div
          className="neobrutal-card"
          onClick={() => setSelectedProductKey('pko')}
          style={{
            background: '#dcfce7',
            border: '2.5px solid #000000',
            boxShadow: '3.5px 3.5px 0px #000000',
            padding: '12px 14px',
            borderRadius: '14px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <HugeiconsIcon icon={ProductLoadingIcon} size={18} color="#000000" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#000000', whiteSpace: 'nowrap' }}>
              PKO Stock
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
            {PRODUCTS_CONFIG.pko.stock.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 700 }}>Litres</span>
          </div>
        </div>

        {/* Slot 4 (Bottom Right): PKC Stock Card */}
        <div
          className="neobrutal-card"
          onClick={() => setSelectedProductKey('pkc')}
          style={{
            background: '#fef9c3',
            border: '2.5px solid #000000',
            boxShadow: '3.5px 3.5px 0px #000000',
            padding: '12px 14px',
            borderRadius: '14px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <HugeiconsIcon icon={ProductLoadingIcon} size={18} color="#000000" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#000000', whiteSpace: 'nowrap' }}>
              PKC Stock
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
            {PRODUCTS_CONFIG.pkc.stock.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 700 }}>kg</span>
          </div>
        </div>
      </div>

      {/* Subheader / Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 2px 0' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: 0 }}>
          Products & Production
        </h2>
      </div>

      {/* List of 3 Main Finished Product Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {(Object.keys(PRODUCTS_CONFIG) as ProductKey[]).map((key) => {
          const product = PRODUCTS_CONFIG[key];
          const monthProduced =
            key === 'cpo'
              ? monthlyTotals.cpo
              : key === 'pko'
              ? monthlyTotals.pko
              : monthlyTotals.pkc;

          return (
            <div
              key={product.key}
              className="neobrutal-card"
              onClick={() => setSelectedProductKey(product.key)}
              style={{
                padding: '20px',
                background: '#ffffff',
                border: '2.5px solid #000000',
                borderRadius: '24px',
                boxShadow: '4px 4px 0px #000000',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                transition: 'transform 0.15s ease, boxShadow 0.15s ease',
              }}
            >
              {/* Top Row: Squircle Icon + Title + Subtitle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: product.badgeBg,
                    border: '2.5px solid #000000',
                    boxShadow: '3px 3px 0px #000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <HugeiconsIcon icon={ProductLoadingIcon} size={24} color="#000000" />
                </div>

                <div>
                  <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#000000', margin: 0, lineHeight: 1.2 }}>
                    {product.name}
                  </h3>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginTop: '3px' }}>
                    {product.subtitle} • <strong style={{ color: '#000000' }}>4 Batches Logged</strong>
                  </div>
                </div>
              </div>

              {/* Middle Metrics: Two Separate Rectangles on the Same Line */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Rectangle 1: Current Stock */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #000000',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    boxShadow: '2.5px 2.5px 0px #000000',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '2px',
                      letterSpacing: '0.3px',
                    }}
                  >
                    Current Stock
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 900, color: '#000000' }}>
                    {product.stock.toLocaleString()} {product.unit}
                  </span>
                </div>

                {/* Rectangle 2: Produced (Month) */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #000000',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    boxShadow: '2.5px 2.5px 0px #000000',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '2px',
                      letterSpacing: '0.3px',
                    }}
                  >
                    Produced (Month)
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 900, color: product.badgeText }}>
                    {monthProduced.toLocaleString()} {product.unit}
                  </span>
                </div>
              </div>

              {/* Bottom Action CTA Row */}
              <div
                style={{
                  paddingTop: '12px',
                  borderTop: '2px solid #000000',
                  marginTop: '2px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedProductKey(product.key)}
                  className="neobrutal-btn-orange"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 16px',
                    fontSize: '13px',
                    fontWeight: 900,
                    color: '#ffffff',
                    background: '#ea580c',
                    border: '2.5px solid #000000',
                    borderRadius: '14px',
                    boxShadow: '3px 3px 0px #000000',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span>View Batches & Performance</span>
                  <span style={{ fontSize: '16px', fontWeight: 900 }}>→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    {/* 5. MODAL: Record Production Batch */}
    {isRecordModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          {/* Outer Neobrutalist Shell (Overflow hidden preserves crisp border & rounded corners) */}
          <div
            style={{
              background: '#ffffff',
              border: '3.5px solid #000000',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '8px 8px 0px #000000',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 14px 20px', borderBottom: '2px solid #000000', background: '#ffffff' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: 0 }}>
                Record Processing Batch
              </h2>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                type="button"
                style={{ background: 'none', border: 'none', fontSize: '20px', fontWeight: 900, cursor: 'pointer', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div style={{ padding: '18px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <form onSubmit={handleSaveBatch} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 1. Select Harvest */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                    Select Harvest:
                  </label>
                  <select
                    value={formHarvestId}
                    onChange={(e) => handleHarvestChange(e.target.value)}
                    className="davot-input"
                    required
                  >
                    {allHarvestRecords.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name ? h.name : `Harvest ${h.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Select Harvest Batch */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                    Select Harvest Batch:
                  </label>
                  <select
                    value={formBatchId}
                    onChange={(e) => setFormBatchId(e.target.value)}
                    className="davot-input"
                    required
                  >
                    {currentAvailableBatches.length > 0 ? (
                      currentAvailableBatches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.batch_name} ({b.ffb_weight} {b.weight_unit}) - {b.date}
                        </option>
                      ))
                    ) : (
                      <option value="">No batches logged for this harvest</option>
                    )}
                  </select>
                </div>

                {/* 3. Auto-populated FFB Weight Badge */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1.5px solid #000000',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '2px 2px 0px #000000',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: '2px' }}>
                      FFB Processed (Auto-linked from Batch)
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#000000' }}>
                      {autoFfbKg > 0 ? `${autoFfbKg.toLocaleString()} kg` : '0 kg'}
                    </span>
                  </div>
                  {autoFfbKg > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: 800, background: '#dcfce7', color: '#15803d', border: '1px solid #16a34a', padding: '4px 8px', borderRadius: '6px' }}>
                      ✓ Linked
                    </span>
                  )}
                </div>

                {/* 4. Production Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                    Production Date:
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="davot-input"
                    required
                  />
                </div>

                {/* 5. Finished Products Produced Inputs */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '6px' }}>
                    Finished Products Produced:
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#ea580c' }}>Crude Palm Oil (Litres):</span>
                      <input
                        type="number"
                        placeholder="e.g. 230"
                        value={formCpoLitres}
                        onChange={(e) => setFormCpoLitres(e.target.value === '' ? '' : Number(e.target.value))}
                        className="davot-input"
                        style={{ marginTop: '2px' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>PKO (Litres):</span>
                        <input
                          type="number"
                          placeholder="e.g. 80"
                          value={formPkoLitres}
                          onChange={(e) => setFormPkoLitres(e.target.value === '' ? '' : Number(e.target.value))}
                          className="davot-input"
                          style={{ marginTop: '2px' }}
                        />
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#ca8a04' }}>Cake (kg):</span>
                        <input
                          type="number"
                          placeholder="e.g. 150"
                          value={formPkcKg}
                          onChange={(e) => setFormPkcKg(e.target.value === '' ? '' : Number(e.target.value))}
                          className="davot-input"
                          style={{ marginTop: '2px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                    Notes (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Good extraction, boiler operating normally"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="davot-input"
                  />
                </div>

                {/* Form Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsRecordModalOpen(false)}
                    style={{
                      flex: 1,
                      background: '#f1f5f9',
                      color: '#000000',
                      border: '2px solid #000000',
                      borderRadius: '10px',
                      padding: '10px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      background: '#ea580c',
                      color: '#ffffff',
                      border: '2px solid #000000',
                      borderRadius: '10px',
                      padding: '10px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '2px 2px 0px #000000',
                    }}
                  >
                    Save Batch
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: Processing Batch Detail Summary */}
      {selectedBatch && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', border: '3px solid #000000', borderRadius: '20px', width: '100%', maxWidth: '420px', padding: '20px', boxShadow: '6px 6px 0px #000000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: 0 }}>
                  Batch #{selectedBatch.id}
                </h2>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                  Harvest: {selectedBatch.harvest_id} • Date: {selectedBatch.date}
                </span>
              </div>

              <button
                onClick={() => setSelectedBatch(null)}
                type="button"
                style={{ background: 'none', border: 'none', fontSize: '20px', fontWeight: 900, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Raw Material Section */}
            <div style={{ background: '#f8fafc', border: '1.5px solid #000000', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#000000', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Raw Material Processed
              </span>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', display: 'block' }}>FFB Processed (Linked Batch)</span>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#000000' }}>{selectedBatch.ffb_processed_kg.toLocaleString()} kg</span>
              </div>
            </div>

            {/* Products Section */}
            <div style={{ background: '#ffffff', border: '1.5px solid #000000', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#000000', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Finished Products
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800 }}>
                  <span style={{ color: '#ea580c' }}>Crude Palm Oil</span>
                  <span style={{ color: '#000000', fontWeight: 900 }}>{selectedBatch.cpo_produced_litres} L</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800 }}>
                  <span style={{ color: '#059669' }}>Palm Kernel Oil</span>
                  <span style={{ color: '#000000', fontWeight: 900 }}>{selectedBatch.pko_produced_litres} L</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800 }}>
                  <span style={{ color: '#ca8a04' }}>Palm Kernel Cake</span>
                  <span style={{ color: '#000000', fontWeight: 900 }}>{selectedBatch.pkc_produced_kg} kg</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedBatch(null)}
              type="button"
              style={{
                width: '100%',
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px',
                fontWeight: 900,
                marginTop: '14px',
                cursor: 'pointer',
              }}
            >
              Close Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
