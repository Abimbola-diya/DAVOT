import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ProductLoadingIcon,
  PlusSignIcon,
  ArrowLeft02Icon,
  Layers01Icon,
  Analytics01Icon,
} from '@hugeicons/core-free-icons';
import { ProductBatch, HarvestRecord } from '../types';

interface ProductViewProps {
  harvestRecords?: HarvestRecord[];
}

// Initial Mock Product Batches
const INITIAL_PRODUCT_BATCHES: ProductBatch[] = [
  {
    id: 'PB-024',
    harvest_id: 'HV-014',
    date: '2026-09-24',
    ffb_processed_kg: 1280,
    pk_processed_kg: 250,
    cpo_produced_litres: 230,
    pko_produced_litres: 80,
    pkc_produced_kg: 150,
    notes: 'Batch 1 processing for HV-014. Good CPO extraction.',
  },
  {
    id: 'PB-025',
    harvest_id: 'HV-014',
    date: '2026-09-22',
    ffb_processed_kg: 1500,
    pk_processed_kg: 300,
    cpo_produced_litres: 270,
    pko_produced_litres: 95,
    pkc_produced_kg: 180,
    notes: 'Batch 2 processing. Smooth operation.',
  },
  {
    id: 'PB-026',
    harvest_id: 'HV-014',
    date: '2026-09-18',
    ffb_processed_kg: 1720,
    pk_processed_kg: 350,
    cpo_produced_litres: 320,
    pko_produced_litres: 115,
    pkc_produced_kg: 210,
    notes: 'Batch 3 completion for HV-014.',
  },
  {
    id: 'PB-027',
    harvest_id: 'HV-015',
    date: '2026-09-12',
    ffb_processed_kg: 2000,
    pk_processed_kg: 400,
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
  // State management
  const [batches, setBatches] = useState<ProductBatch[]>(INITIAL_PRODUCT_BATCHES);
  const [selectedProductKey, setSelectedProductKey] = useState<ProductKey | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ProductBatch | null>(null);

  // Form state for Record Processing Batch
  const [formHarvestId, setFormHarvestId] = useState<string>('HV-014');
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formFfbKg, setFormFfbKg] = useState<number | ''>(1280);
  const [formPkKg, setFormPkKg] = useState<number | ''>(250);
  const [formCpoLitres, setFormCpoLitres] = useState<number | ''>(230);
  const [formPkoLitres, setFormPkoLitres] = useState<number | ''>(80);
  const [formPkcKg, setFormPkcKg] = useState<number | ''>(150);
  const [formNotes, setFormNotes] = useState<string>('');

  // Live yield calculation for form preview
  const liveFfb = typeof formFfbKg === 'number' ? formFfbKg : 0;
  const livePk = typeof formPkKg === 'number' ? formPkKg : 0;
  const liveCpo = typeof formCpoLitres === 'number' ? formCpoLitres : 0;
  const livePko = typeof formPkoLitres === 'number' ? formPkoLitres : 0;
  const livePkc = typeof formPkcKg === 'number' ? formPkcKg : 0;

  const liveCpoYield = liveFfb > 0 ? (liveCpo / liveFfb).toFixed(2) : '0.00';
  const livePkoYield = livePk > 0 ? (livePko / livePk).toFixed(2) : '0.00';
  const livePkcYield = livePk > 0 ? (livePkc / livePk).toFixed(2) : '0.00';

  // Available harvest list options
  const availableHarvestIds = Array.from(
    new Set([
      'HV-014',
      'HV-015',
      ...harvestRecords.map((r) => r.name || r.id),
      ...batches.map((b) => b.harvest_id),
    ])
  );

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

  // Submit new production batch
  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveFfb || liveFfb <= 0) return;

    const nextNumber = batches.length + 24;
    const newBatch: ProductBatch = {
      id: `PB-0${nextNumber}`,
      harvest_id: formHarvestId,
      date: formDate,
      ffb_processed_kg: liveFfb,
      pk_processed_kg: livePk,
      cpo_produced_litres: liveCpo,
      pko_produced_litres: livePko,
      pkc_produced_kg: livePkc,
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

    return (
      <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto', paddingBottom: '90px' }}>
        {/* Back Button */}
        <button
          onClick={() => setSelectedProductKey(null)}
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
            marginBottom: '16px',
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
            marginBottom: '18px',
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
            marginBottom: '18px',
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
            marginBottom: '18px',
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

        {/* Section 3: Processing Batches Attuned to This Product */}
        <div
          style={{
            background: '#ffffff',
            border: '2.5px solid #000000',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '3.5px 3.5px 0px #000000',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HugeiconsIcon icon={Layers01Icon} size={18} color="#000000" />
              <h2 style={{ fontSize: '14px', fontWeight: 900, color: '#000000', margin: 0, textTransform: 'uppercase' }}>
                Processing Batches ({product.shortName})
              </h2>
            </div>

            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="neobrutal-btn-orange"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              + Record Batch
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {batches.map((batch) => {
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
                  ? (batch.pko_produced_litres / Math.max(1, batch.pk_processed_kg)).toFixed(2) + ' L/kg'
                  : (batch.pkc_produced_kg / Math.max(1, batch.pk_processed_kg)).toFixed(2) + ' kg/kg';

              return (
                <div
                  key={batch.id}
                  onClick={() => setSelectedBatch(batch)}
                  style={{
                    background: '#f8fafc',
                    border: '2px solid #000000',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '2px 2px 0px #000000',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#000000' }}>#{batch.id}</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, background: '#e2e8f0', border: '1px solid #000000', padding: '2px 6px', borderRadius: '6px' }}>
                        Harvest {batch.harvest_id}
                      </span>
                    </div>

                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>{batch.date}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 800 }}>
                    <span style={{ color: '#475569' }}>FFB: {batch.ffb_processed_kg.toLocaleString()} kg</span>
                    <span style={{ color: product.badgeText, fontWeight: 900 }}>
                      Produced: {producedVal} {product.unit} (Yield: {outputRate})
                    </span>
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
    <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto', paddingBottom: '90px' }}>
      {/* 2x2 Grid: Record Batch Action Button + 3 Product Stock Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        {/* Slot 1 (Top Left): Record Batch Action Button */}
        <button
          type="button"
          onClick={() => setIsRecordModalOpen(true)}
          className="neobrutal-btn-yellow"
          style={{
            height: '100%',
            minHeight: '68px',
            padding: '12px 14px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: '#facc15',
            border: '2.5px solid #000000',
            boxShadow: '3.5px 3.5px 0px #000000',
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
          <span style={{ fontSize: '14px', fontWeight: 900, color: '#000000', whiteSpace: 'nowrap' }}>
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
            borderRadius: '16px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <HugeiconsIcon icon={ProductLoadingIcon} size={16} color="#000000" />
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
            borderRadius: '16px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <HugeiconsIcon icon={ProductLoadingIcon} size={16} color="#000000" />
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
            borderRadius: '16px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <HugeiconsIcon icon={ProductLoadingIcon} size={16} color="#000000" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#000000', whiteSpace: 'nowrap' }}>
              PKC Stock
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
            {PRODUCTS_CONFIG.pkc.stock.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 700 }}>kg</span>
          </div>
        </div>
      </div>

      {/* Header & Title (Placed under the 4 metric cards) */}
      <div style={{ marginBottom: '16px' }}>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 900,
            color: '#000000',
            margin: '0 0 4px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <HugeiconsIcon icon={ProductLoadingIcon} size={24} color="#000000" />
          Products & Production
        </h1>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#475569', margin: 0 }}>
          Track production output, yields, and processing batches by product
        </p>
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  flexWrap: 'wrap',
                  paddingTop: '12px',
                  borderTop: '2px solid #000000',
                  marginTop: '2px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Primary Button: + Record Batch */}
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(true)}
                  className="neobrutal-btn-orange"
                  style={{
                    height: '42px',
                    padding: '0 14px',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    justifyContent: 'center',
                  }}
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={16} color="#ffffff" strokeWidth={2.5} />
                  <span>Record Batch</span>
                </button>

                {/* Secondary Button: View Performance & Batches → */}
                <button
                  type="button"
                  onClick={() => setSelectedProductKey(product.key)}
                  style={{
                    height: '42px',
                    padding: '0 14px',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#000000',
                    background: '#ffffff',
                    border: '2px solid #000000',
                    borderRadius: '12px',
                    boxShadow: '2.5px 2.5px 0px #000000',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span>View Batches & Performance</span>
                  <span style={{ fontSize: '15px' }}>→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. MODAL: Record Production Batch */}
      {isRecordModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', border: '3px solid #000000', borderRadius: '20px', width: '100%', maxWidth: '440px', padding: '20px', boxShadow: '6px 6px 0px #000000', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: 0 }}>
                Record Processing Batch
              </h2>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                type="button"
                style={{ background: 'none', border: 'none', fontSize: '20px', fontWeight: 900, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBatch} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Harvest selection */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                  Select Harvest:
                </label>
                <select
                  value={formHarvestId}
                  onChange={(e) => setFormHarvestId(e.target.value)}
                  className="davot-input"
                  required
                >
                  {availableHarvestIds.map((hId) => (
                    <option key={hId} value={hId}>
                      Harvest {hId}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
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

              {/* Raw Material Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                    FFB Processed (kg):
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1280"
                    value={formFfbKg}
                    onChange={(e) => setFormFfbKg(e.target.value === '' ? '' : Number(e.target.value))}
                    className="davot-input"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
                    PK Processed (kg):
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    value={formPkKg}
                    onChange={(e) => setFormPkKg(e.target.value === '' ? '' : Number(e.target.value))}
                    className="davot-input"
                    min="0"
                  />
                </div>
              </div>

              {/* Finished Products Inputs */}
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

              {/* Live Yield Calculation Preview */}
              <div style={{ background: '#f8fafc', border: '1.5px solid #000000', borderRadius: '10px', padding: '10px', marginTop: '2px' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#000000', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  ⚡ Auto-Calculated Output Rates (Yield)
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800 }}>
                  <span style={{ color: '#ea580c' }}>CPO: {liveCpoYield} L/kg</span>
                  <span style={{ color: '#059669' }}>PKO: {livePkoYield} L/kg</span>
                  <span style={{ color: '#ca8a04' }}>Cake: {livePkcYield} kg/kg</span>
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
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#000000', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Raw Material Processed
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', display: 'block' }}>FFB Processed</span>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: '#000000' }}>{selectedBatch.ffb_processed_kg.toLocaleString()} kg</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', display: 'block' }}>Palm Kernel Processed</span>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: '#000000' }}>{selectedBatch.pk_processed_kg.toLocaleString()} kg</span>
                </div>
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
