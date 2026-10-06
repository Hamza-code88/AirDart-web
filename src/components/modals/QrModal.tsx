'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Globe,
  Lock,
  Smartphone,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { QrCodeView } from '../common/QrCodeView';

interface QrModalProps {
  visible: boolean;
  onClose: () => void;
  sessionUrl?: string;
  pairingCode?: string;
  sessionId?: string;
  onPairedSuccess?: (phone: { name: string; ip: string }) => void;
}

export const QrModal: React.FC<QrModalProps> = ({
  visible,
  onClose,
  sessionUrl,
  pairingCode = '839-412',
  sessionId = 'DART-8492',
  onPairedSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [localIp, setLocalIp] = useState<string>('127.0.0.1');
  const [pairedDevice, setPairedDevice] = useState<{
    name: string;
    ip: string;
    deviceType: string;
  } | null>(null);

  // Auto-detect PC real local Wi-Fi IP from API
  useEffect(() => {
    fetch('/api/p2p/network')
      .then((res) => res.json())
      .then((data) => {
        if (data.primaryIp && data.primaryIp !== '127.0.0.1') {
          setLocalIp(data.primaryIp);
        } else if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
          setLocalIp(window.location.hostname);
        }
      })
      .catch(() => {
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
          setLocalIp(window.location.hostname);
        }
      });
  }, []);

  const cleanPin = pairingCode.replace(/\D/g, '');
  const qrPayload = `http://${localIp}:3000/?airdart=pair&session=${sessionId}&pin=${cleanPin}`;
  const displayUrl = sessionUrl || qrPayload;

  // Poll local handshake endpoint while modal is visible and not yet paired
  useEffect(() => {
    if (!visible || pairedDevice) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/p2p/handshake?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'paired' && data.phone) {
            setPairedDevice(data.phone);
            if (onPairedSuccess) {
              onPairedSuccess(data.phone);
            }
          }
        }
      } catch (err) {
        // ignore offline network blips
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [visible, pairedDevice, sessionId, onPairedSuccess]);

  if (!visible) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(sessionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#3B2A2A]/40 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#FFF5E4] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#FFD1D1] flex flex-col gap-5 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFE3E1] flex items-center justify-center text-[#3B2A2A]">
              <Globe size={20} color="#3B2A2A" strokeWidth={2.4} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#3B2A2A]">Scan to Connect</h3>
              <p className="text-xs text-[#7A6363]">Instant zero-install local pairing</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FFE3E1] hover:bg-[#FFD1D1] flex items-center justify-center text-[#3B2A2A] transition-all cursor-pointer"
          >
            <X size={18} color="#3B2A2A" strokeWidth={2.4} />
          </button>
        </div>

        {/* Success Paired State */}
        {pairedDevice ? (
          <div className="bg-[#E8F8F0] rounded-2xl p-6 flex flex-col items-center justify-center gap-4 border border-[#10B981]/40 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-[#10B981] flex items-center justify-center text-white shadow-lg shadow-[#10B981]/30">
              <CheckCircle2 size={36} color="#FFFFFF" strokeWidth={2.4} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFFFF] text-xs font-extrabold text-[#10B981] mb-2 shadow-sm">
                <Sparkles size={14} />
                <span>Handshake Successful!</span>
              </div>
              <h4 className="text-lg font-extrabold text-[#3B2A2A]">
                {pairedDevice.name} Connected
              </h4>
              <p className="text-xs text-[#7A6363] mt-1 font-mono">
                IP: {pairedDevice.ip} • P2P High-Speed Data Channel Ready
              </p>
            </div>

            <button
              onClick={onClose}
              className="mt-2 w-full h-11 rounded-full bg-[#10B981] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#10B981]/30 hover:bg-[#0ea371] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Start Sharing Files</span>
            </button>
          </div>
        ) : (
          /* Waiting / Scanning State */
          <div className="bg-[#FFE3E1]/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 border border-[#FFD1D1]/60">
            <div className="p-3 bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#FFD1D1]/60 relative flex items-center justify-center">
              <QrCodeView value={qrPayload} size={190} />
            </div>

            <div className="text-center mt-1">
              <span className="text-[11px] text-[#7A6363] font-bold tracking-wider">
                OR ENTER 6-DIGIT PAIRING PIN
              </span>
              <p className="text-xl font-extrabold text-[#3B2A2A] tracking-widest mt-0.5">
                {pairingCode}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] shadow-sm text-xs font-semibold text-[#3B2A2A]">
              <span className="w-2 h-2 rounded-full bg-[#FF9494] animate-ping"></span>
              <span>Point mobile camera to scan</span>
            </div>
          </div>
        )}

        {/* URL Box */}
        <div className="flex items-center justify-between bg-[#FFE3E1] rounded-2xl p-2 pl-3.5 border border-[#FFD1D1]/60">
          <span className="text-xs font-mono text-[#3B2A2A] truncate pr-2">{displayUrl}</span>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(displayUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="h-8 px-3.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF5E4] text-xs font-bold text-[#3B2A2A] flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
          >
            {copied ? (
              <>
                <Check size={13} color="#10B981" strokeWidth={2.6} />
                <span className="text-[#10B981]">Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} color="#3B2A2A" strokeWidth={2.2} />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-[#7A6363] pt-1">
          <span className="flex items-center gap-1.5">
            <Lock size={13} color="#7A6363" strokeWidth={2.2} />
            <span>Direct P2P Encrypted Session</span>
          </span>
          <span>100% Offline Local</span>
        </div>
      </div>
    </div>
  );
};
