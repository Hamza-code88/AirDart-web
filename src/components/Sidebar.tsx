'use client';

import React from 'react';
import {
  Send,
  Radio,
  ArrowUpDown,
  Clipboard,
  History,
  Settings,
  Laptop,
  QrCode,
  Plus,
} from 'lucide-react';
import { AirDartLogo } from './AirDartLogo';

export type WebNavTab = 'devices' | 'transfers' | 'clipboard' | 'pairing' | 'history' | 'settings';

interface SidebarProps {
  activeTab: WebNavTab;
  onTabChange: (tab: WebNavTab) => void;
  onPairClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onPairClick,
}) => {
  const navItems = [
    { key: 'devices' as WebNavTab, label: 'Devices', icon: Radio },
    { key: 'transfers' as WebNavTab, label: 'Transfers', icon: ArrowUpDown, badge: '2' },
    { key: 'clipboard' as WebNavTab, label: 'Clipboard', icon: Clipboard, hasDot: true },
    { key: 'pairing' as WebNavTab, label: 'Zero-Install QR', icon: QrCode },
    { key: 'history' as WebNavTab, label: 'History', icon: History },
    { key: 'settings' as WebNavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#FFF5E4] border-r border-[#FFD1D1]/60 flex flex-col justify-between p-5 shrink-0 min-h-screen sticky top-0 h-screen select-none">
      {/* Brand Header with Official Logo */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 pt-1">
          <AirDartLogo height={38} textColor="#3B2A2A" dartColor="#FF6363" />
          <p className="text-[11px] font-semibold text-[#7A6363] tracking-wide pl-1">
            Local P2P Share • Offline
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-full text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF9494] text-[#3B2A2A] shadow-sm shadow-[#FF9494]/30'
                    : 'text-[#3B2A2A] hover:bg-[#FFE3E1] text-[#7A6363] hover:text-[#3B2A2A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={19} color="#3B2A2A" strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-extrabold ${
                      isActive ? 'bg-[#FFE3E1] text-[#3B2A2A]' : 'bg-[#FFD1D1] text-[#3B2A2A]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.hasDot && !item.badge && (
                  <span className="w-2 h-2 rounded-full bg-[#FF9494] animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Self-Device Card */}
      <div className="flex flex-col gap-3">
        <div className="bg-[#FFFFFF]/80 backdrop-blur-sm rounded-2xl p-3.5 border border-[#FFD1D1]/60 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFE3E1] flex items-center justify-center text-[#3B2A2A]">
              <Laptop size={18} color="#3B2A2A" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#3B2A2A] leading-tight">MacBook Pro</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                <span className="text-[11px] font-medium text-[#7A6363]">Ready to Beam</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onPairClick}
          className="w-full h-11 rounded-full bg-[#FF9494] text-[#3B2A2A] font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#FF9494]/30 hover:bg-[#ff8585] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus size={18} color="#3B2A2A" strokeWidth={2.6} />
          <span>Pair Device</span>
        </button>
      </div>
    </aside>
  );
};
