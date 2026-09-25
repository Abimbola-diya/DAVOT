import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ToolsIcon,
  Search01Icon,
  Delete01Icon,
  PencilEdit01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';
import { Tool, ToolCategory, ToolCondition } from '../types';

const INITIAL_TOOLS: Tool[] = [
  {
    id: 'tool_1',
    name: 'Cutlass',
    category: 'Hand Tool',
    quantity: 8,
    date_bought: '2026-06-10',
    condition: 'Good',
    notes: 'Standard harvesting and weeding cutlasses',
  },
  {
    id: 'tool_2',
    name: 'Hoe',
    category: 'Hand Tool',
    quantity: 5,
    date_bought: '2026-06-10',
    condition: 'Good',
  },
  {
    id: 'tool_3',
    name: 'Knapsack Sprayer',
    category: 'Equipment',
    quantity: 2,
    date_bought: '2026-07-18',
    condition: 'Fair',
    notes: '1 unit has slight nozzle pressure leakage',
  },
  {
    id: 'tool_4',
    name: 'Wheelbarrow',
    category: 'Hand Tool',
    quantity: 3,
    date_bought: '2026-08-02',
    condition: 'Good',
  },
  {
    id: 'tool_5',
    name: 'Palm Harvester Chisel & Pole',
    category: 'Equipment',
    quantity: 4,
    date_bought: '2026-05-14',
    condition: 'Good',
  },
  {
    id: 'tool_6',
    name: 'Hydraulic Press Engine',
    category: 'Equipment',
    quantity: 1,
    date_bought: '2026-01-20',
    condition: 'Bad',
    notes: 'Requires spark plug and belt replacement',
  },
];

export const ToolsView: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>(INITIAL_TOOLS);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'All'>('All');
  const [selectedConditionFilter, setSelectedConditionFilter] = useState<ToolCondition | 'All'>('All');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [deletingToolId, setDeletingToolId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ToolCategory>('Hand Tool');
  const [formQuantity, setFormQuantity] = useState<number | ''>(1);
  const [formDateBought, setFormDateBought] = useState(() => new Date().toISOString().split('T')[0]);
  const [formCondition, setFormCondition] = useState<ToolCondition>('Good');
  const [formNotes, setFormNotes] = useState('');

  const summaryMetrics = useMemo(() => {
    let totalTools = 0;
    let goodCount = 0;
    let fairCount = 0;
    let badCount = 0;

    tools.forEach((t) => {
      const q = t.quantity || 0;
      totalTools += q;
      if (t.condition === 'Good') goodCount += q;
      else if (t.condition === 'Fair') fairCount += q;
      else if (t.condition === 'Bad') badCount += q;
    });

    return { totalTools, goodCount, fairCount, badCount };
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.notes && tool.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
      const matchesCondition = selectedConditionFilter === 'All' || tool.condition === selectedConditionFilter;
      return matchesSearch && matchesCategory && matchesCondition;
    });
  }, [tools, searchQuery, selectedCategory, selectedConditionFilter]);

  const handleOpenAddModal = () => {
    setEditingTool(null);
    setFormName('');
    setFormCategory('Hand Tool');
    setFormQuantity(1);
    setFormDateBought(new Date().toISOString().split('T')[0]);
    setFormCondition('Good');
    setFormNotes('');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (tool: Tool) => {
    setEditingTool(tool);
    setFormName(tool.name);
    setFormCategory(tool.category);
    setFormQuantity(tool.quantity);
    setFormDateBought(tool.date_bought);
    setFormCondition(tool.condition);
    setFormNotes(tool.notes || '');
    setIsFormModalOpen(true);
  };

  const handleSaveTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    const qty = typeof formQuantity === 'number' && formQuantity > 0 ? formQuantity : 1;

    if (editingTool) {
      setTools(
        tools.map((t) =>
          t.id === editingTool.id
            ? { ...t, name: formName.trim(), category: formCategory, quantity: qty, date_bought: formDateBought, condition: formCondition, notes: formNotes.trim() || undefined }
            : t
        )
      );
    } else {
      const newTool: Tool = {
        id: `tool_${Date.now()}`,
        name: formName.trim(),
        category: formCategory,
        quantity: qty,
        date_bought: formDateBought,
        condition: formCondition,
        notes: formNotes.trim() || undefined,
      };
      setTools([newTool, ...tools]);
    }
    setIsFormModalOpen(false);
  };

  const handleDeleteTool = (id: string) => {
    setTools(tools.filter((t) => t.id !== id));
    setDeletingToolId(null);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>

      {/* ── 4 Metric Cards (2×2 grid, matching Product page exactly) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>

        {/* Card 1 – Total Items */}
        <div
          className="neobrutal-card"
          style={{ background: '#ffedd5', border: '2.5px solid #000000', boxShadow: '3.5px 3.5px 0px #000000', padding: '12px 14px', borderRadius: '14px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <HugeiconsIcon icon={ToolsIcon} size={18} color="#000000" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#000000', whiteSpace: 'nowrap' }}>Total Items</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
            {summaryMetrics.totalTools} <span style={{ fontSize: '12px', fontWeight: 700 }}>Units</span>
          </div>
        </div>

        {/* Card 2 – Good Condition */}
        <div
          className="neobrutal-card"
          style={{ background: '#dcfce7', border: '2.5px solid #000000', boxShadow: '3.5px 3.5px 0px #000000', padding: '12px 14px', borderRadius: '14px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} color="#000000" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#000000', whiteSpace: 'nowrap' }}>Good Condition</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
            {summaryMetrics.goodCount} <span style={{ fontSize: '12px', fontWeight: 700 }}>Tools</span>
          </div>
        </div>

        {/* Card 3 – Fair Condition */}
        <div
          className="neobrutal-card"
          style={{ background: '#fef9c3', border: '2.5px solid #000000', boxShadow: '3.5px 3.5px 0px #000000', padding: '12px 14px', borderRadius: '14px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <HugeiconsIcon icon={AlertCircleIcon} size={18} color="#000000" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#000000', whiteSpace: 'nowrap' }}>Fair Condition</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
            {summaryMetrics.fairCount} <span style={{ fontSize: '12px', fontWeight: 700 }}>Tools</span>
          </div>
        </div>

        {/* Card 4 – Bad / Needs Attention */}
        <div
          className="neobrutal-card"
          style={{ background: '#fee2e2', border: '2.5px solid #000000', boxShadow: '3.5px 3.5px 0px #000000', padding: '12px 14px', borderRadius: '14px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <HugeiconsIcon icon={Cancel01Icon} size={18} color="#000000" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#000000', whiteSpace: 'nowrap' }}>Needs Attention</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
            {summaryMetrics.badCount} <span style={{ fontSize: '12px', fontWeight: 700 }}>Tools</span>
          </div>
        </div>
      </div>

      {/* ── Section Header + Add Tool Button ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: 0 }}>Farm Tools & Equipment</h2>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
            Inventory of tools currently owned by the farm
          </span>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#facc15',
            border: '2.5px solid #000000',
            borderRadius: '12px',
            padding: '9px 16px',
            boxShadow: '3px 3px 0px #000000',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span style={{ fontSize: '13px', fontWeight: 900, color: '#000000', whiteSpace: 'nowrap' }}>Add Tool</span>
        </button>
      </div>

      {/* ── Search ── */}
      <div style={{ position: 'relative', width: '100%' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
          <HugeiconsIcon icon={Search01Icon} size={18} color="#64748b" />
        </span>
        <input
          type="text"
          placeholder="Search tools by name or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="davot-input"
          style={{ paddingLeft: '40px', width: '100%', height: '44px', fontSize: '13px' }}
        />
      </div>

      {/* ── Filter Pills ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Category row */}
        <div>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '7px' }}>
            Category
          </span>
          <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
            {(['All', 'Hand Tool', 'Equipment', 'Other'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? '#ea580c' : '#ffffff',
                  color: selectedCategory === cat ? '#ffffff' : '#000000',
                  border: '2px solid #000000',
                  borderRadius: '10px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 800,
                  boxShadow: selectedCategory === cat ? '2px 2px 0px #000000' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat === 'All' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Condition row */}
        <div>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '7px' }}>
            Condition
          </span>
          <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
            {(['All', 'Good', 'Fair', 'Bad'] as const).map((cond) => {
              const isSelected = selectedConditionFilter === cond;
              let btnBg = '#ffffff';
              let btnColor = '#000000';
              let btnBorder = '#000000';
              if (isSelected) {
                if (cond === 'Good') { btnBg = '#dcfce7'; btnColor = '#15803d'; btnBorder = '#15803d'; }
                else if (cond === 'Fair') { btnBg = '#ffedd5'; btnColor = '#c2410c'; btnBorder = '#c2410c'; }
                else if (cond === 'Bad') { btnBg = '#fee2e2'; btnColor = '#dc2626'; btnBorder = '#dc2626'; }
                else { btnBg = '#ea580c'; btnColor = '#ffffff'; btnBorder = '#000000'; }
              }
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setSelectedConditionFilter(cond)}
                  style={{
                    background: btnBg,
                    color: btnColor,
                    border: `2px solid ${btnBorder}`,
                    borderRadius: '10px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 800,
                    boxShadow: isSelected ? '2px 2px 0px #000000' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cond === 'All' ? 'All' : cond}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tool Cards List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredTools.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              border: '2.5px solid #000000',
              borderRadius: '20px',
              padding: '40px 20px',
              textAlign: 'center',
              boxShadow: '3.5px 3.5px 0px #000000',
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#000000', display: 'block', marginBottom: '8px' }}>
              No tools match your filters.
            </span>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedConditionFilter('All'); }}
              style={{
                background: '#f1f5f9',
                border: '2px solid #000000',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #000000',
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredTools.map((tool) => {
            let condBg = '#dcfce7';
            let condColor = '#15803d';
            let condDot = '#16a34a';
            if (tool.condition === 'Fair') { condBg = '#ffedd5'; condColor = '#c2410c'; condDot = '#ea580c'; }
            else if (tool.condition === 'Bad') { condBg = '#fee2e2'; condColor = '#dc2626'; condDot = '#ef4444'; }

            return (
              <div
                key={tool.id}
                className="neobrutal-card"
                style={{
                  background: '#ffffff',
                  border: '2.5px solid #000000',
                  borderRadius: '20px',
                  padding: '16px',
                  boxShadow: '3.5px 3.5px 0px #000000',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* ── Row 1: Icon + Name + Category badge ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    {/* Icon box */}
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: tool.category === 'Equipment' ? '#eff6ff' : '#fff7ed',
                        border: '2px solid #000000',
                        boxShadow: '2px 2px 0px #000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <HugeiconsIcon icon={ToolsIcon} size={20} color="#000000" />
                    </div>

                    {/* Name + category */}
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#000000', margin: '0 0 4px 0', lineHeight: 1.2 }}>
                        {tool.name}
                      </h3>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: tool.category === 'Equipment' ? '#dbeafe' : '#f1f5f9',
                          color: tool.category === 'Equipment' ? '#1e40af' : '#334155',
                          border: '1.5px solid #000000',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {tool.category}
                      </span>
                    </div>
                  </div>

                  {/* Edit + Delete buttons */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(tool)}
                      title="Edit Tool"
                      style={{
                        background: '#ffffff',
                        border: '2px solid #000000',
                        borderRadius: '10px',
                        padding: '6px 10px',
                        boxShadow: '2px 2px 0px #000000',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 800,
                        color: '#000000',
                      }}
                    >
                      <HugeiconsIcon icon={PencilEdit01Icon} size={14} color="#000000" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingToolId(tool.id)}
                      title="Delete Tool"
                      style={{
                        background: '#fee2e2',
                        border: '2px solid #000000',
                        borderRadius: '10px',
                        padding: '6px 10px',
                        boxShadow: '2px 2px 0px #000000',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 800,
                        color: '#dc2626',
                      }}
                    >
                      <HugeiconsIcon icon={Delete01Icon} size={14} color="#dc2626" />
                    </button>
                  </div>
                </div>

                {/* ── Row 2: Quantity + Date (2 cols) ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '10px 14px',
                    }}
                  >
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '3px' }}>
                      Qty Owned
                    </span>
                    <span style={{ fontSize: '17px', fontWeight: 900, color: '#000000' }}>
                      {tool.quantity} <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>{tool.quantity === 1 ? 'unit' : 'units'}</span>
                    </span>
                  </div>

                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '10px 14px',
                    }}
                  >
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '3px' }}>
                      Date Bought
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#000000' }}>
                      {formatDateDisplay(tool.date_bought)}
                    </span>
                  </div>
                </div>

                {/* ── Row 3: Condition pill (full-width stripe) ── */}
                <div
                  style={{
                    background: condBg,
                    border: '1.5px solid #000000',
                    borderRadius: '12px',
                    padding: '9px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: condDot,
                      flexShrink: 0,
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Condition</span>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: condColor, marginLeft: 'auto' }}>{tool.condition}</span>
                </div>

                {/* ── Row 4: Notes (if any) ── */}
                {tool.notes && (
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '10px', lineHeight: 1.5 }}>
                    💬 {tool.notes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── MODAL: Add / Edit Tool ── */}
      {isFormModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div
            style={{
              background: '#ffffff',
              border: '3.5px solid #000000',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '8px 8px 0px #000000',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 14px 20px', borderBottom: '2px solid #000000', background: '#ffffff' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: 0 }}>
                {editingTool ? 'Edit Tool' : 'Add Tool'}
              </h2>
              <button onClick={() => setIsFormModalOpen(false)} type="button" style={{ background: 'none', border: 'none', fontSize: '20px', fontWeight: 900, cursor: 'pointer', lineHeight: 1 }}>
                ✕
              </button>
            </div>

            {/* Scrollable Form */}
            <div style={{ padding: '18px 20px', overflowY: 'auto', flex: 1 }}>
              <form onSubmit={handleSaveTool} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Tool Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>Tool Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Cutlass, Hoe, Sprayer"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="davot-input"
                    required
                  />
                </div>

                {/* Category & Quantity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ToolCategory)}
                      className="davot-input"
                      required
                    >
                      <option value="Hand Tool">Hand Tool</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>Quantity</label>
                    <input
                      type="number"
                      placeholder="e.g. 8"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                      className="davot-input"
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Date Bought */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>Date Bought</label>
                  <input
                    type="date"
                    value={formDateBought}
                    onChange={(e) => setFormDateBought(e.target.value)}
                    className="davot-input"
                    required
                  />
                </div>

                {/* Condition Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '8px' }}>Condition</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {(['Good', 'Fair', 'Bad'] as const).map((cond) => {
                      const isSelected = formCondition === cond;
                      let activeBg = '#dcfce7'; let activeColor = '#15803d';
                      if (cond === 'Fair') { activeBg = '#ffedd5'; activeColor = '#c2410c'; }
                      if (cond === 'Bad') { activeBg = '#fee2e2'; activeColor = '#dc2626'; }
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => setFormCondition(cond)}
                          style={{
                            background: isSelected ? activeBg : '#f8fafc',
                            color: isSelected ? activeColor : '#475569',
                            border: isSelected ? '2.5px solid #000000' : '1.5px solid #cbd5e1',
                            boxShadow: isSelected ? '2px 2px 0px #000000' : 'none',
                            borderRadius: '10px',
                            padding: '10px 8px',
                            fontSize: '13px',
                            fontWeight: 900,
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Purchased from local market, good quality steel"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="davot-input"
                  />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    style={{ flex: 1, background: '#f1f5f9', color: '#000000', border: '2px solid #000000', borderRadius: '10px', padding: '10px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, background: '#facc15', color: '#000000', border: '2.5px solid #000000', borderRadius: '10px', padding: '10px', fontWeight: 900, cursor: 'pointer', boxShadow: '2px 2px 0px #000000' }}
                  >
                    {editingTool ? 'Update Tool' : 'Save Tool'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Delete Confirmation ── */}
      {deletingToolId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', border: '3.5px solid #000000', borderRadius: '20px', width: '100%', maxWidth: '380px', padding: '20px', boxShadow: '6px 6px 0px #000000' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: '0 0 8px 0' }}>Delete Tool?</h3>
            <p style={{ fontSize: '13px', color: '#475569', fontWeight: 600, margin: '0 0 16px 0' }}>
              Are you sure you want to remove this tool from your inventory record?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeletingToolId(null)}
                style={{ flex: 1, background: '#f1f5f9', color: '#000000', border: '2.5px solid #000000', borderRadius: '10px', padding: '10px', fontWeight: 800, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTool(deletingToolId)}
                style={{ flex: 1, background: '#dc2626', color: '#ffffff', border: '2.5px solid #000000', borderRadius: '10px', padding: '10px', fontWeight: 900, cursor: 'pointer', boxShadow: '2px 2px 0px #000000' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
