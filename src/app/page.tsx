'use client';

import React, { useState, useEffect } from 'react';
import { LandingScreen } from '../components/LandingScreen';
import { Sidebar, WebNavTab } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DevicesView } from '../components/views/DevicesView';
import { TransfersHubView } from '../components/views/TransfersHubView';
import { ZeroInstallPairingView } from '../components/views/ZeroInstallPairingView';
import { QrModal } from '../components/modals/QrModal';

export default function AirDartWebApp() {
  const [activeTab, setActiveTab] = useState<WebNavTab>('devices');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrMode, setQrMode] = useState<'send' | 'receive'>('send');
  const [connectedPeer, setConnectedPeer] = useState<{ name: string; ip: string } | null>(null);

  // Poll heartbeat: Auto-switch between Send/Receive landing and active connected workspace
  const failedChecksRef = React.useRef(0);

  useEffect(() => {
    let isMounted = true;
    const checkHeartbeat = async () => {
      try {
        const res = await fetch('/api/p2p/heartbeat');
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          if (data.isConnected && data.peer) {
            failedChecksRef.current = 0;
            setConnectedPeer(data.peer);
          } else {
            failedChecksRef.current += 1;
            // Only disconnect after 45 consecutive failed checks (~90s) to give ample time while user selects files in gallery/file manager
            if (failedChecksRef.current >= 45) {
              setConnectedPeer(null);
            }
          }
        } else {
          failedChecksRef.current += 1;
          if (failedChecksRef.current >= 45) {
            setConnectedPeer(null);
          }
        }
      } catch {
        failedChecksRef.current += 1;
        if (failedChecksRef.current >= 45) {
          setConnectedPeer(null);
        }
      }
    };

    checkHeartbeat();
    const interval = setInterval(checkHeartbeat, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleModeSelect = (mode: 'send' | 'receive') => {
    setQrMode(mode);
    setIsQrModalOpen(true);
  };

  const handlePairedSuccess = (phone: { name: string; ip: string }) => {
    setIsQrModalOpen(false);
    setConnectedPeer(phone);
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/p2p/heartbeat', { method: 'DELETE' });
    } catch {}
    setConnectedPeer(null);
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
            onSelectPeer={() => setActiveTab('transfers')}
            onOpenQr={() => setIsQrModalOpen(true)}
          />
        );
    }
  };

  return (
    <>
      {/* ── NOT CONNECTED: Zapya-style Clean Send / Receive Landing ── */}
      {!connectedPeer && (
        <LandingScreen onModeSelect={handleModeSelect} />
      )}

      {/* ── CONNECTED: Full Workspace with Unified Header ── */}
      {connectedPeer && (
        <div className="flex min-h-screen bg-[#FFF5E4] text-[#3B2A2A]">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onPairClick={() => setIsQrModalOpen(true)}
          />

          <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto flex flex-col">
            <Header
              onShowQr={() => setIsQrModalOpen(true)}
              onPairNew={() => setIsQrModalOpen(true)}
              connectedPeer={connectedPeer}
              onDisconnect={handleDisconnect}
            />

            <div className="flex-1">{renderActiveView()}</div>
          </main>
        </div>
      )}

      {/* ── QR PAIRING MODAL ── */}
      <QrModal
        visible={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        pairingCode="839-412"
        sessionId="DART-8492"
        onPairedSuccess={handlePairedSuccess}
      />
    </>
  );
}
