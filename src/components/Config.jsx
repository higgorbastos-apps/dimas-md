import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { Storage } from '../utils/storage';

export default function Config({ onClose, onSave }) {
  const [url, setUrl] = useState(Storage.get('url', ''));
  const [provider, setProvider] = useState(Storage.get('provider', 'claude'));
  const [codigoSinc, setCodigoSinc] = useState(Storage.get('codigo_sinc', ''));
  const [deviceId] = useState(() => GoogleSheetsAPI.getDeviceId());
  const [token, setToken] = useState(Storage.get('token', ''));
  const [message, setMessage] = useState(null);

  const handleGerarCodigo = async () => {
    try {
      const data = await GoogleSheetsAPI.gerarCodigo();
      setCodigoSinc(data.codigo);
      Storage.set('codigo_sinc', data.codigo);
      setMessage({ type: 'success', text: 'Código: ' + data.codigo });
    } catch (e) {
      setMessage({ type: 'error', text: 'Erro: ' + e.message });
    }
  };

  const handleVincular = async () => {
    if (!codigoSinc) return setMessage({ type: 'error', text: 'Digite um código.' });
    try {
      await GoogleSheetsAPI.vincularDispositivos(codigoSinc, deviceId);
      Storage.set('codigo_sinc', codigoSinc);
      setMessage({ type: 'success', text: 'Vinculado! Reinicie o app.' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Erro: ' + e.message });
    }
  };
  const handleSave = () => {
    Storage.set('provider', provider);
    if (!url || !token) {
      setMessage({ type: 'error', text: 'Preencha URL e token.' });
      return;
    }

    Storage.setConfig(url, token);
    setMessage({ type: 'success', text: 'Configuração salva!' });
    
    setTimeout(() => {
      onSave();
    }, 1000);
  };

  const handleTest = async () => {
    setMessage({ type: 'info', text: 'Testando conexão...' });
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'carregar_dados', token })
      });
      
      const data = await response.json();
      
      if (data.error) {
        setMessage({ type: 'error', text: 'Erro: ' + data.error });
      } else {
        setMessage({ type: 'success', text: 'Conexão bem-sucedida!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Falha: ' + error.message });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '420px',
        width: '100%',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ color: 'var(--accent)', marginBottom: '20px', fontFamily: 'Playfair Display, serif' }}>
          Configuração da Planilha
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            URL do Google Apps Script
          </label>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/..."
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Token Secreto
          </label>
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Token de autenticação"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}
          />
        </div>

        {message && (
          <div style={{
            padding: '10px',
            borderRadius: 'var(--radius)',
            marginBottom: '16px',
            background: message.type === 'success' ? 'rgba(76, 175, 80, 0.2)' :
                        message.type === 'error' ? 'rgba(224, 82, 96, 0.2)' :
                        'rgba(201, 168, 76, 0.2)',
            color: message.type === 'success' ? '#4CAF50' :
                   message.type === 'error' ? '#E05260' :
                   'var(--accent)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {message.type === 'success' ? <CheckCircle size={16} /> :
             message.type === 'error' ? <AlertCircle size={16} /> :
             null}
            {message.text}
          </div>
        )}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Motor de IA
          </label>
          <select value={provider} onChange={e => setProvider(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            <option value="claude">Claude (Anthropic)</option>
            <option value="gemini">Gemini (Google)</option>
            <option value="deepseek">DeepSeek</option>
          </select>
          
        </div>
                <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Sincronização
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={codigoSinc}
              onChange={e => setCodigoSinc(e.target.value)}
              placeholder="Código"
              style={{ flex: 1, padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)' }}
            />
            <button onClick={handleVincular} style={{ padding: '10px 16px', background: 'var(--accent)', color: 'var(--bg-primary)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer' }}>
              Vincular
            </button>
          </div>
          <button onClick={handleGerarCodigo} style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Gerar novo código
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleTest}
            style={{
              flex: 1,
              padding: '10px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Testar Conexão
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '10px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 'var(--radius)',
              color: 'var(--bg-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
          
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
