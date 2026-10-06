'use client';

import React, { useState } from 'react';
import { Sidebar, WebNavTab } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DevicesView } from '../components/views/DevicesView';
import { TransfersHubView } from '../components/views/TransfersHubView';
import { ZeroInstallPairingView } from '../components/views/ZeroInstallPairingView';
import { QrModal } from '../components/modals/QrModal';

export default function AirDartWebApp() {
  const [activeTab, setActiveTab] = useState<WebNavTab>('devices');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const handleSelectPeer = (peerName: string) => {
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
        <div className="flex-1">
          {renderActiveView()}
        </div>
      </main>

      {/* QR Code / Zero-Install Pairing Modal */}
      <QrModal
        visible={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        sessionUrl="http://192.168.1.100:3000/#pair"
        pairingCode="839-412"
        sessionId="DART-8492"
        onPairedSuccess={(phone) => {
          console.log('Paired with phone:', phone);
        }}
      />
    </div>
  );
}
