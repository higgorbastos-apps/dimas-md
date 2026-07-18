import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Storage } from '../utils/storage';

const GENEROS = [
  'Sertanejo', 'Forró', 'MPB', 'Rock', 'Pop', 'Samba', 'Pagode',
  'Funk', 'Eletrônica', 'Jazz', 'Blues', 'Reggae', 'Gospel',
  'Axé', 'Brega', 'Rap', 'Indie', 'Alternativo'
];

const FORMACAO_OPCOES = ['Solo', 'Duo', 'Trio', 'Banda (4-5)', 'Banda (6+)'];
const TIPOS_EVENTO = ['Casamento', 'Bar/Balada', 'Corporativo', 'Aniversário', 'Formatura', 'Festival', 'Pub'];

export default function Onboarding({ onComplete }) {
  const savedProfile = Storage.getProfile();
  const [step, setStep] = useState(savedProfile ? 5 : 1);
  const [profile, setProfile] = useState(savedProfile || {
    nome: '',
    formacao: '',
    regiao: '',
    generos: [],
    referencias: '',
    tiposEvento: [],
    cache: '',
    objetivos: '',
    diferencial: ''
  });
  const [config, setConfig] = useState({ url: '', token: '' });

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleGenero = (genero) => {
    setProfile(prev => ({
      ...prev,
      generos: prev.generos.includes(genero)
        ? prev.generos.filter(g => g !== genero)
        : [...prev.generos, genero]
    }));
  };

  const toggleTipoEvento = (tipo) => {
    setProfile(prev => ({
      ...prev,
      tiposEvento: prev.tiposEvento.includes(tipo)
        ? prev.tiposEvento.filter(t => t !== tipo)
        : [...prev.tiposEvento, tipo]
    }));
  };

const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      Storage.setProfile(profile);
      if (config.url && config.token) {
        Storage.setConfig(config.url, config.token);
      }
      onComplete(profile);
    }
  };

  const handleSkipToEnd = () => {
    Storage.setProfile(profile);
    onComplete(profile);
  };
  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem'
  };

  const chipStyle = (selected) => ({
    padding: '8px 16px',
    background: selected ? 'var(--accent)' : 'var(--bg-card)',
    color: selected ? 'var(--bg-primary)' : 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: selected ? 600 : 400,
    transition: 'all 0.2s'
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px'
    }}>
      {/* Progress bar */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '40px',
        marginTop: '20px'
      }}>
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} style={{
            flex: 1,
            height: '4px',
            borderRadius: '2px',
            background: s <= step ? 'var(--accent)' : 'var(--border)',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>

      <div style={{ flex: 1 }}>
        {step === 1 && (
          <div>
            <h2 style={{ color: 'var(--accent)', marginBottom: '16px', fontSize: '1.8rem' }}>
              1. Conectar Planilha
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Conecte sua planilha do Google Sheets. Você pode pular e configurar depois.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                URL do Google Apps Script
              </label>
              <input type="text" value={config.url}
                onChange={e => setConfig(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://script.google.com/macros/s/..." style={inputStyle} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Token Secreto
              </label>
              <input type="password" value={config.token}
                onChange={e => setConfig(prev => ({ ...prev, token: e.target.value }))}
                placeholder="Token de autenticação" style={inputStyle} />
            </div>
            <button onClick={() => setStep(2)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}>
              Pular — configurar depois
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ color: 'var(--accent)', marginBottom: '16px', fontSize: '1.8rem' }}>
              2. Quem é você?
            </h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Nome Artístico
              </label>
              <input type="text" value={profile.nome}
                onChange={e => updateProfile('nome', e.target.value)}
                placeholder="Seu nome artístico" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Formação
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {FORMACAO_OPCOES.map(f => (
                  <button key={f} onClick={() => updateProfile('formacao', f)}
                    style={chipStyle(profile.formacao === f)}>{f}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Região
              </label>
              <input type="text" value={profile.regiao}
                onChange={e => updateProfile('regiao', e.target.value)}
                placeholder="Ex: São Paulo - SP" style={inputStyle} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ color: 'var(--accent)', marginBottom: '16px', fontSize: '1.8rem' }}>
              3. Gêneros e Referências
            </h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Gêneros que você toca
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {GENEROS.map(g => (
                  <button key={g} onClick={() => toggleGenero(g)}
                    style={chipStyle(profile.generos.includes(g))}>{g}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Referências musicais
              </label>
              <textarea value={profile.referencias}
                onChange={e => updateProfile('referencias', e.target.value)}
                placeholder="Artistas que te inspiram..." rows={3}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ color: 'var(--accent)', marginBottom: '16px', fontSize: '1.8rem' }}>
              4. Eventos e Cachê
            </h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Tipos de evento
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TIPOS_EVENTO.map(t => (
                  <button key={t} onClick={() => toggleTipoEvento(t)}
                    style={chipStyle(profile.tiposEvento.includes(t))}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Cachê atual (R$)
              </label>
              <input type="text" value={profile.cache}
                onChange={e => updateProfile('cache', e.target.value)}
                placeholder="Ex: 1500" style={inputStyle} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 style={{ color: 'var(--accent)', marginBottom: '16px', fontSize: '1.8rem' }}>
              5. Objetivos
            </h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Objetivos de carreira
              </label>
              <textarea value={profile.objetivos}
                onChange={e => updateProfile('objetivos', e.target.value)}
                placeholder="O que você quer alcançar?" rows={3}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Seu diferencial
              </label>
              <textarea value={profile.diferencial}
                onChange={e => updateProfile('diferencial', e.target.value)}
                placeholder="O que te diferencia?" rows={3}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px',
        padding: '20px 0'
      }}>
        {step > 1 && (
          <button onClick={() => setStep(step - 1)}
            style={{
              background: 'none', border: 'none', color: 'var(--text-secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
            <ArrowLeft size={18} /> Voltar
          </button>
        )}
        <button onClick={handleNext}
          style={{
            marginLeft: 'auto', padding: '12px 24px', background: 'var(--accent)',
            color: 'var(--bg-primary)', border: 'none', borderRadius: 'var(--radius)',
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: '8px', fontSize: '1rem'
          }}>
          {step === 5 ? 'Começar' : 'Próximo'} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}