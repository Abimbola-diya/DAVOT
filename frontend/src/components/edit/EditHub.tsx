import React from 'react';
import { Sprout, Factory, Nut, ShoppingBag, CreditCard, Receipt, PlusCircle } from 'lucide-react';

interface EditHubProps {
  onOpenForm: (formType: string) => void;
}

export const EditHub: React.FC<EditHubProps> = ({ onOpenForm }) => {
  const actions = [
    {
      id: 'harvest',
      title: '+ Record Harvest',
      desc: 'Log Fresh Fruit Bunches (FFB) harvested from a farm block',
      icon: <Sprout size={22} />,
    },
    {
      id: 'cpo',
      title: '+ Record CPO Processing',
      desc: 'Log FFB processed into Crude Palm Oil (litres) & Kernels (kg)',
      icon: <Factory size={22} />,
    },
    {
      id: 'kernel',
      title: '+ Record Kernel Processing',
      desc: 'Log Palm Kernels processed into PKO Oil (litres) & PKC (bags)',
      icon: <Nut size={22} />,
    },
    {
      id: 'sale',
      title: '+ Record Sale',
      desc: 'Log sales of CPO, PKO, PKC or FFB to buyers/customers',
      icon: <ShoppingBag size={22} />,
    },
    {
      id: 'payment',
      title: '+ Log Payment Received',
      desc: 'Record Cash, Bank Transfer, or POS payments from buyers',
      icon: <CreditCard size={22} />,
    },
    {
      id: 'expense',
      title: '+ Record Expense',
      desc: 'Log operational spending on Labour, Fertilizer, Fuel & Repairs',
      icon: <Receipt size={22} />,
    },
  ];

  return (
    <div>
      <div className="section-header">
        <div className="section-title" style={{ color: '#ea580c' }}>
          <PlusCircle size={18} /> Owner Recording Hub (Edit Mode)
        </div>
        <span className="badge badge-partial" style={{ background: '#ffedd5', color: '#c2410c' }}>
          Record Events
        </span>
      </div>

      <div className="action-grid">
        {actions.map(act => (
          <button
            key={act.id}
            className="action-btn-card"
            onClick={() => onOpenForm(act.id)}
          >
            <div className="action-btn-icon">
              {act.icon}
            </div>
            <div>
              <div className="action-btn-title">{act.title}</div>
              <div className="action-btn-desc">{act.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
