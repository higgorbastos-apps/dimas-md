import React from 'react';
import { Settings, Music, Zap } from 'lucide-react';

    export default function Header({ profile, isConfigured, creditInfo, onConfigClick, onProfileClick })
   { return (
    <header style={{
      position: 'sticky',
      top: 0,
      background: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border)',
      zIndex: 10
    }}>
      <div style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Music size={28} color="var(--accent)" />
          <div>
            <h1 style={{ 
              fontSize: '1.3rem', 
              fontFamily: 'Playfair Display, serif',
              color: 'var(--accent)',
              letterSpacing: '1px',
              margin: 0
            }}>
              DIMAS MD
            </h1>
            <p onClick={onProfileClick} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, cursor: 'pointer', textDecoration: 'underline' }}>
              {profile?.nome || 'Completar Perfil'} ✎
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {creditInfo && (
            <div className={'credit-indicator' + (creditInfo.remaining < 0.50 ? ' warning' : '')} 
                 title={'Créditos: $' + creditInfo.remaining.toFixed(2)}>
              <span className="credit-dot" />
              ${creditInfo.remaining.toFixed(2)}
            </div>
          )}
          
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openConfig'))}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: isConfigured ? 'var(--success)' : 'var(--text-muted)'
            }}
            title="Configuração"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
      
      {/* Barra de status */}
      {isConfigured && (
        <div className="header-status-bar" />
      )}
    </header>
  );
}