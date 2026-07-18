import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Onboarding from './components/Onboarding';
import Chat from './components/Chat';
import Config from './components/Config';
import { Storage } from './utils/storage';

function App() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [profile, setProfile] = useState(null);
  const [creditInfo, setCreditInfo] = useState(null);

  useEffect(() => {
    const config = Storage.getConfig();
    const savedProfile = Storage.getProfile();
    
    if (config.url && config.token) {
      setIsConfigured(true);
    }
    if (savedProfile) {
      setProfile(savedProfile);
    } else {
      setShowOnboarding(true);
    }
    
    setCreditInfo({ remaining: 1.58, total: 5.00, used: 0.63 });
  }, []);
 
  useEffect(() => {
    const handleOpenConfig = () => setShowConfig(true);
    window.addEventListener('openConfig', handleOpenConfig);
    return () => window.removeEventListener('openConfig', handleOpenConfig);
  }, []);

  const handleOnboardingComplete = (profileData) => {
    setProfile(profileData);
    setShowOnboarding(false);
  };

  const handleReopenOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleConfigSaved = () => {
    setIsConfigured(true);
    setShowConfig(false);
  };

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header profile={profile} isConfigured={isConfigured} creditInfo={creditInfo} onConfigClick={() => setShowConfig(true)} onProfileClick={handleReopenOnboarding} />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!isConfigured ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
            <div>
              <h2 style={{ marginBottom: '16px', color: 'var(--accent)' }}>Planilha não conectada</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Conecte sua planilha do Google Sheets para começar</p>
              <button onClick={() => setShowConfig(true)} style={{ padding: '12px 24px', background: 'var(--accent)', color: 'var(--bg-primary)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>Configurar Planilha</button>
            </div>
          </div>
        ) : (
          <Chat profile={profile} />
        )}
      </main>

      {showConfig && (
        <Config onClose={() => setShowConfig(false)} onSave={handleConfigSaved} />
      )}
    </div>
  );
}

export default App;