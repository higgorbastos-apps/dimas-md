// v4 - better extract prompt - 12/07
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Music } from 'lucide-react';
import { GoogleSheetsAPI } from '../api/googleSheets';
import { buildSystemPrompt } from '../utils/prompts';
import { Storage } from '../utils/storage';
import QuickActions from './QuickActions';

export default function Chat({ profile }) {
  const [messages, setMessages] = useState([]);
  const [deviceId] = useState(() => GoogleSheetsAPI.getDeviceId());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resumo, setResumo] = useState(null);
  const [memorias, setMemorias] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { loadResumo(); }, []);
  useEffect(() => {
    const salvarAoFechar = () => {
      if (messages.length > 0) {
        const config = Storage.getConfig();
        if (!config.url || !config.token) return;
        const ultimas = messages.slice(-10);
        fetch(config.url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'salvar_conversa',
            token: config.token,
            dispositivo: deviceId,
            mensagens: ultimas
          })
        });
      }
    };
    window.addEventListener('beforeunload', salvarAoFechar);
    return () => window.removeEventListener('beforeunload', salvarAoFechar);
  }, [messages, deviceId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadResumo = async () => {
    try {
      const [resumoData, memoriasData, conversasData] = await Promise.all([
        GoogleSheetsAPI.getResumo(),
        GoogleSheetsAPI.getMemorias(30),
        GoogleSheetsAPI.carregarConversas(deviceId, 20)
      ]);
      setResumo(resumoData);
      setMemorias(memoriasData);
      if (conversasData && conversasData.length > 0) {
        setMessages(conversasData);
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    }
  };

  const extractMemory = async (lastMessage, conversation) => {
    try {
      const provider = JSON.parse(localStorage.getItem('dimas_provider') || '"claude"');
      const url = JSON.parse(localStorage.getItem('dimas_url') || '""');
      const token = JSON.parse(localStorage.getItem('dimas_token') || '""');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'O perfil do artista ja contem: nome=' + (profile?.nome || '') + ', generos=' + (profile?.generos?.join(',') || '') + ', cache=' + (profile?.cache || '') + '. NAO memorize dados que ja estao no perfil. Extraia APENAS informacoes NOVAS ditas pelo artista nesta mensagem. Retorne JSON: {"categoria":"preferencia|aprendizado|objetivo","conteudo":"frase curta","relevancia":4} ou {"skip":true}',
          messages: [
            { role: 'user', content: lastMessage?.content?.substring(0, 500) || 'none' }
          ],
          model: 'claude-sonnet-5',
          max_tokens: 80,
          provider: provider
        })
      });

      if (!response.ok) {
        console.log('⚠️ Extract API status:', response.status);
        return;
      }

      const data = await response.json();
      const rawText = data.content?.[0]?.text || '{"skip":true}';
      const cleanText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      console.log('🧠 v5 Memória:', cleanText);
      
      const memoryData = JSON.parse(cleanText);
      
      if (!memoryData.skip && memoryData.conteudo && url && token) {
        const saveResponse = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'salvar_memoria',
            token: token,
            categoria: memoryData.categoria || 'geral',
            conteudo: memoryData.conteudo,
            relevancia: memoryData.relevancia || 3
          })
        });
        const result = await saveResponse.json();
        console.log('✅ Salva:', result);
      }
    } catch (err) {
      console.error('❌ Erro memória:', err.message);
    }
  };
  const sendMessage = async (messageText) => {
    const userMessage = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const system = buildSystemPrompt(profile, resumo, memorias);
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const provider = Storage.get('provider', 'claude');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          system, 
          messages: apiMessages, 
          model: 'claude-sonnet-5', 
          max_tokens: 4000,
          provider: provider
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Erro desconhecido');
      }

      let responseText = '';
      if (data.content && Array.isArray(data.content)) {
        responseText = data.content.map(c => c.text || '').join('');
      } else if (data.completion) {
        responseText = data.completion;
      } else {
        responseText = JSON.stringify(data);
      }

      const assistantMessage = { role: 'assistant', content: responseText };
      setMessages([...newMessages, assistantMessage]);
      if (newMessages.length % 5 === 0) {
  console.log('🔍 Extraindo memória (msg', newMessages.length, ')');
  extractMemory(userMessage, newMessages);
      }
     } catch (error) {
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: 'Erro: ' + error.message 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) sendMessage(input.trim());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, maxHeight: 'calc(100vh - 60px)' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Music size={48} color="var(--accent)" style={{ opacity: 0.5, marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Como posso ajudar sua carreira musical hoje?
            </p>
            <QuickActions onAction={sendMessage} />
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '8px'
          }}>
            <div style={{
              maxWidth: '80%', padding: '12px 16px',
              borderRadius: 'var(--radius-lg)',
              background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-card)',
              color: msg.role === 'user' ? 'var(--bg-primary)' : 'var(--text-primary)',
              borderLeft: msg.role === 'assistant' ? '3px solid var(--accent)' : 'none',
              fontSize: '0.95rem', lineHeight: '1.6',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word'
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px', background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)', borderLeft: '3px solid var(--accent)',
              display: 'flex', gap: '6px'
            }}>
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      {messages.length > 0 && (
        <div style={{ padding: '0 16px 8px', textAlign: 'center' }}>
          <button 
            onClick={() => sendMessage('Preciso de ajuda com algo novo. Me mostre as opções disponíveis.')}
            style={{ 
              padding: '8px 16px', 
              background: 'var(--bg-card)', 
              border: '1px solid var(--accent)', 
              borderRadius: '20px', 
              color: 'var(--accent)', 
              cursor: 'pointer', 
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            ✨ Nova ação
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} style={{
        padding: '12px 16px', borderTop: '1px solid var(--border)',
        display: 'flex', gap: '8px', background: 'var(--bg-primary)'
      }}>
          <textarea ref={inputRef} value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Pergunte ao Diretor Musical..."
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1, padding: '10px 14px', background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
            resize: 'none', fontFamily: 'Inter, sans-serif'
          }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
        />
        <button type="submit" disabled={isLoading || !input.trim()}
          style={{
            padding: '10px 16px',
            background: input.trim() ? 'var(--accent)' : 'var(--bg-card)',
            color: input.trim() ? 'var(--bg-primary)' : 'var(--text-muted)',
            border: 'none', borderRadius: 'var(--radius)',
            cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', transition: 'all 0.2s'
          }}>
          {isLoading ? <Loader size={20} /> : <Send size={20} />}
        </button>
      </form>

      <style>{`
        .typing-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--accent); animation: typing 1.4s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}