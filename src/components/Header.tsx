'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Lock,
  QrCode,
  Plus,
  Bell,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  onShowQr: () => void;
  onPairNew: () => void;
  connectedPeer?: { name: string; ip: string; model?: string } | null;
  onDisconnect?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onShowQr,
  onPairNew,
  connectedPeer,
  onDisconnect,
}) => {
  const [pcIp, setPcIp] = useState('192.168.1.8');

  useEffect(() => {
    fetch('/api/p2p/heartbeat')
      .then((r) => r.json())
      .then((d) => {
        if (d.pcIp) setPcIp(d.pcIp);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="w-full flex items-center justify-between pb-6 select-none">
      {/* Network & Live Zapya Connection Status Tags */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {connectedPeer ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F8F0] border border-[#10B981]/50 shadow-sm text-xs font-bold text-[#065F46] animate-in fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
            <Smartphone size={14} className="text-[#10B981]" />
            <span>Connected: <strong>{connectedPeer.name}</strong></span>
            <span className="text-[#047857]/80 font-mono text-[11px]">({connectedPeer.ip})</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF]/80 backdrop-blur-sm border border-[#FFD1D1]/60 shadow-sm text-xs font-semibold text-[#3B2A2A]">
            <span className="w-2 h-2 rounded-full bg-[#FF9494] animate-pulse"></span>
            <span>Local Wi-Fi Mesh ({pcIp})</span>
            <span className="text-[#7A6363] font-medium">• Waiting for Phone</span>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE3E1] border border-[#FFD1D1]/60 shadow-sm text-xs font-semibold text-[#3B2A2A]">
          <Lock size={13} color="#3B2A2A" strokeWidth={2.4} />
          <span>Direct P2P LAN</span>
          <span className="text-[#7A6363] font-medium">• 100% Offline • Zero Internet</span>
        </div>
      </div>

      {/* Context-aware Connection Action */}
      <div className="flex items-center gap-3">
        {connectedPeer && onDisconnect && (
          <button
            onClick={onDisconnect}
            className="h-9 px-4 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Disconnect</span>
          </button>
        )}

        <button
          aria-label="Notifications"
          className="w-10 h-10 rounded-full bg-[#FFFFFF]/80 hover:bg-[#FFE3E1] border border-[#FFD1D1]/60 flex items-center justify-center text-[#3B2A2A] transition-all cursor-pointer shadow-sm"
        >
          <Bell size={17} color="#3B2A2A" strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
};
