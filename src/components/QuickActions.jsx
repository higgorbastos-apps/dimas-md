import React from 'react';
import { Music, BarChart3, DollarSign, Target, TrendingUp, PartyPopper, Briefcase, Cake } from 'lucide-react';

const QUICK_ACTIONS = [
  { icon: <PartyPopper size={18} />, label: 'Setlist Casamento', prompt: 'Monte uma setlist para casamento de 2 horas com músicas românticas e animadas.' },
  { icon: <Music size={18} />, label: 'Setlist Bar', prompt: 'Crie uma setlist para bar/pub de 1 hora, repertório animado.' },
  { icon: <Briefcase size={18} />, label: 'Setlist Corporativo', prompt: 'Setlist para evento corporativo de 3 horas, repertório elegante e variado.' },
  { icon: <Cake size={18} />, label: 'Setlist Aniversário', prompt: 'Monte uma setlist para aniversário de 2 horas.' },
  { icon: <BarChart3 size={18} />, label: 'Análise de Repertório', prompt: 'Analise meu repertório atual e sugira melhorias baseadas no histórico.' },
  { icon: <DollarSign size={18} />, label: 'Aumentar Cachê', prompt: 'Como posso aumentar meu cachê? Estratégias práticas.' },
  { icon: <Target size={18} />, label: 'Plano 6 meses', prompt: 'Crie um plano estratégico de carreira para os próximos 6 meses.' },
  { icon: <TrendingUp size={18} />, label: 'Posicionamento', prompt: 'Como posso melhorar meu posicionamento no mercado musical?' },
];

export default function QuickActions({ onAction }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '8px',
      padding: '0 8px'
    }}>
      {QUICK_ACTIONS.map((action, index) => (
        <button key={index} onClick={() => onAction(action.prompt)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s', textAlign: 'left'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}>
          {action.icon} {action.label}
        </button>
      ))}
    </div>
  );
}