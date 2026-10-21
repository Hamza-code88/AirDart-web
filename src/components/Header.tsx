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
}

export const Header: React.FC<HeaderProps> = ({ onShowQr, onPairNew }) => {
  const [heartbeatData, setHeartbeatData] = useState<{
    isConnected: boolean;
    peer: { name: string; ip: string; model?: string } | null;
    pcIp: string;
  }>({
    isConnected: false,
    peer: null,
    pcIp: '192.168.1.9',
  });

  useEffect(() => {
    const fetchHeartbeat = async () => {
      try {
        const res = await fetch('/api/p2p/heartbeat');
        if (res.ok) {
          const data = await res.json();
          setHeartbeatData({
            isConnected: !!data.isConnected,
            peer: data.peer,
            pcIp: data.pcIp || '192.168.1.9',
          });
        }
      } catch {}
    };

    fetchHeartbeat();
    const interval = setInterval(fetchHeartbeat, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full flex items-center justify-between pb-6 select-none">
      {/* Network & Live Zapya Connection Status Tags */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {heartbeatData.isConnected && heartbeatData.peer ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F8F0] border border-[#10B981]/50 shadow-sm text-xs font-bold text-[#065F46] animate-in fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
            <Smartphone size={14} className="text-[#10B981]" />
            <span>Zapya Mesh Connected: <strong>{heartbeatData.peer.name}</strong></span>
            <span className="text-[#047857]/70 font-mono text-[11px]">({heartbeatData.peer.ip})</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF]/80 backdrop-blur-sm border border-[#FFD1D1]/60 shadow-sm text-xs font-semibold text-[#3B2A2A]">
            <span className="w-2 h-2 rounded-full bg-[#FF9494] animate-pulse"></span>
            <span>Local Wi-Fi Mesh ({heartbeatData.pcIp})</span>
            <span className="text-[#7A6363] font-medium">• Waiting for Phone</span>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE3E1] border border-[#FFD1D1]/60 shadow-sm text-xs font-semibold text-[#3B2A2A]">
          <Lock size={13} color="#3B2A2A" strokeWidth={2.4} />
          <span>Direct P2P LAN</span>
          <span className="text-[#7A6363] font-medium">• 100% Offline • Zero Internet</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onShowQr}
          className="h-10 px-4 rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFE3E1] border border-[#FFD1D1]/70 text-xs font-bold text-[#3B2A2A] flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
        >
          <QrCode size={16} color="#3B2A2A" strokeWidth={2.2} />
          <span>Show QR Code</span>
        </button>

        <button
          onClick={onPairNew}
          className="h-10 px-4 rounded-full bg-[#FF9494] hover:bg-[#ff8585] text-xs font-bold text-[#3B2A2A] flex items-center gap-2 shadow-sm shadow-[#FF9494]/30 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus size={16} color="#3B2A2A" strokeWidth={2.6} />
          <span>Pair New Device</span>
        </button>

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
