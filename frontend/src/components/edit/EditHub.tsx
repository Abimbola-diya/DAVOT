import React from 'react';
import { Sprout, Factory, Nut, ShoppingBag, CreditCard, Receipt } from 'lucide-react';

interface EditHubProps {
  activeCategory?: string;
  onOpenForm: (formType: string) => void;
}

export const EditHub: React.FC<EditHubProps> = ({
  activeCategory = 'all',
  onOpenForm,
}) => {

  const actions = [
    {
      id: 'harvest',
      category: 'flow',
      categoryLabel: 'Harvesting',
      title: '+ Record FFB Harvest',
      desc: 'Log Fresh Fruit Bunches (FFB) harvested from a farm block',
      icon: <Sprout size={22} color="#15803d" />,
      badgeBg: '#dcfce7',
    },
    {
      id: 'cpo',
      category: 'flow',
      categoryLabel: 'Milling',
      title: '+ Record CPO Processing',
      desc: 'Log FFB processed into Crude Palm Oil (litres) & Kernels (kg)',
      icon: <Factory size={22} color="#ea580c" />,
      badgeBg: '#ffedd5',
    },
    {
      id: 'kernel',
      category: 'flow',
      categoryLabel: 'Milling',
      title: '+ Record Kernel Processing',
      desc: 'Log Palm Kernels processed into PKO Oil (litres) & PKC (bags)',
      icon: <Nut size={22} color="#d97706" />,
      badgeBg: '#fef3c7',
    },
    {
      id: 'sale',
      category: 'sales',
      categoryLabel: 'Sales',
      title: '+ Record Product Sale',
      desc: 'Log sales of CPO, PKO, PKC or FFB to buyers/customers',
      icon: <ShoppingBag size={22} color="#0284c7" />,
      badgeBg: '#e0f2fe',
    },
    {
      id: 'payment',
      category: 'sales',
      categoryLabel: 'Sales',
      title: '+ Log Payment Received',
      desc: 'Record Cash, Bank Transfer, or POS payments from buyers',
      icon: <CreditCard size={22} color="#0369a1" />,
      badgeBg: '#e0f2fe',
    },
    {
      id: 'expense',
      category: 'expenses',
      categoryLabel: 'Expenses',
      title: '+ Record Operational Expense',
      desc: 'Log spending on Labour, Fertilizer, Fuel & Repairs',
      icon: <Receipt size={22} color="#dc2626" />,
      badgeBg: '#fee2e2',
    },
  ];

  const filteredActions = (activeCategory === 'all' || !activeCategory)
    ? actions
    : actions.filter(act => act.category === activeCategory);

  return (
    <div>
      <div className="action-grid">
        {filteredActions.map(act => (
          <button
            key={act.id}
            className="action-btn-card"
            onClick={() => onOpenForm(act.id)}
          >
            <div className="action-btn-icon" style={{ background: act.badgeBg }}>
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
