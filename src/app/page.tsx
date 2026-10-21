'use client';

import React, { useState } from 'react';
import { LandingScreen } from '../components/LandingScreen';
import { Sidebar, WebNavTab } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DevicesView } from '../components/views/DevicesView';
import { TransfersHubView } from '../components/views/TransfersHubView';
import { ZeroInstallPairingView } from '../components/views/ZeroInstallPairingView';
import { QrModal } from '../components/modals/QrModal';

type AppScreen = 'landing' | 'dashboard';

export default function AirDartWebApp() {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [activeTab, setActiveTab] = useState<WebNavTab>('devices');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrMode, setQrMode] = useState<'send' | 'receive'>('send');

  // Landing → mode selected → show QR first, then dashboard on pair
  const handleModeSelect = (mode: 'send' | 'receive') => {
    setQrMode(mode);
    setIsQrModalOpen(true);
  };

  const handlePairedSuccess = (phone: { name: string; ip: string }) => {
    console.log('Paired with:', phone);
    setIsQrModalOpen(false);
    setScreen('dashboard');
  };

  const handleQrClose = () => {
    setIsQrModalOpen(false);
    // If user closes without pairing, go to dashboard anyway
    if (screen === 'landing') setScreen('dashboard');
  };

  const handleSelectPeer = (_peerName: string) => {
    setActiveTab('transfers');
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'transfers':
      case 'clipboard':
      case 'history':
        return <TransfersHubView />;
      case 'pairing':
      case 'settings':
        return <ZeroInstallPairingView />;
      case 'devices':
      default:
        return (
          <DevicesView
            onSelectPeer={handleSelectPeer}
            onOpenQr={() => setIsQrModalOpen(true)}
          />
        );
    }
  };

  return (
    <>
      {/* ── LANDING SCREEN ── */}
      {screen === 'landing' && !isQrModalOpen && (
        <LandingScreen onModeSelect={handleModeSelect} />
      )}

      {/* ── DASHBOARD (shown after pairing or manual skip) ── */}
      {screen === 'dashboard' && (
        <div className="flex min-h-screen bg-[#FFF5E4] text-[#3B2A2A]">
          {/* Persistent Left Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onPairClick={() => setIsQrModalOpen(true)}
          />

          {/* Main Dynamic Viewport */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto flex flex-col">
            {/* Top Header */}
            <Header
              onShowQr={() => setIsQrModalOpen(true)}
              onPairNew={() => setIsQrModalOpen(true)}
            />

            {/* Dynamic View Content */}
            <div className="flex-1">{renderActiveView()}</div>
          </main>
        </div>
      )}

      {/* ── QR MODAL (shown over landing OR dashboard) ── */}
      <QrModal
        visible={isQrModalOpen}
        onClose={handleQrClose}
        sessionUrl={`http://192.168.1.100:3000/?airdart=pair&mode=${qrMode}`}
        pairingCode="839-412"
        sessionId="DART-8492"
        onPairedSuccess={handlePairedSuccess}
      />
    </>
  );
}
