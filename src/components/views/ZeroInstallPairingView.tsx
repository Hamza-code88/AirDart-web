'use client';

import React, { useState, useEffect } from 'react';
import {
  QrCode,
  KeyRound,
  Copy,
  Check,
  Smartphone,
  Globe,
  ArrowRight,
  Zap,
  ShieldCheck,
  Lock,
  Wifi,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { QrCodeView } from '../common/QrCodeView';
import { AirDartLogo } from '../AirDartLogo';

export const ZeroInstallPairingView: React.FC = () => {
  const [digits, setDigits] = useState(['8', '3', '9', '4', '1', '2']);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isHandshakeRequested, setIsHandshakeRequested] = useState(false);
  const [localIp, setLocalIp] = useState<string>('127.0.0.1');
  const [pairedDevice, setPairedDevice] = useState<{
    name: string;
    ip: string;
  } | null>(null);

  const sessionId = 'DART-8492';

  // Auto-detect PC real local Wi-Fi IP
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

  const currentPort = typeof window !== 'undefined' && window.location.port ? window.location.port : '3000';
  const qrPayload = `http://${localIp}:${currentPort}/?session=${sessionId}&pin=839412`;

  // Poll local handshake endpoint
  useEffect(() => {
    if (pairedDevice) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/p2p/handshake?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'paired' && data.phone) {
            setPairedDevice(data.phone);
          }
        }
      } catch (e) {
        // local network blip
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [pairedDevice, sessionId]);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText('http://192.168.1.100:3000/#pair');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col gap-10 select-none pb-12">
      {/* Hero Headline Section */}
      <section className="flex flex-col items-center text-center gap-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFE3E1] border border-[#FFD1D1]/60 text-xs font-bold text-[#994345]">
          <Wifi size={13} color="#994345" strokeWidth={2.4} />
          <span>Zero Install • Browser-to-Browser • Local Wi-Fi</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#3B2A2A] tracking-tight leading-tight max-w-2xl">
          Share files with any device nearby.{' '}
          <span className="text-[#994345]">No install, no cloud.</span>
        </h2>

        <p className="text-sm md:text-base text-[#7A6363] max-w-xl">
          Open this link on any phone, laptop, or tablet on your network. Files transfer directly via WebRTC at unthrottled local speeds.
        </p>
      </section>

      {/* Two Main Pairing Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
        {/* Left Card: Scan to Connect */}
        <div className="bg-[#FFFFFF]/90 backdrop-blur-sm rounded-3xl p-6 sm:p-7 border border-[#FFD1D1]/70 shadow-sm flex flex-col justify-between gap-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE3E1] flex items-center justify-center text-[#3B2A2A]">
                <QrCode size={20} color="#3B2A2A" strokeWidth={2.4} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#3B2A2A]">Scan to Connect</h3>
                <p className="text-xs text-[#7A6363] mt-0.5">Point phone camera to pair instantly</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-[#FFE3E1] text-[11px] font-bold text-[#994345]">
              Instant Handshake
            </span>
          </div>

          {/* QR Code Container / Paired Success Card */}
          {pairedDevice ? (
            <div className="bg-[#E8F8F0] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 border border-[#10B981]/40 text-center animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-[#10B981] flex items-center justify-center text-white shadow-md shadow-[#10B981]/30">
                <CheckCircle2 size={32} color="#FFFFFF" strokeWidth={2.4} />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFFFFF] text-xs font-bold text-[#10B981] shadow-sm">
                <Sparkles size={13} />
                <span>Device Handshake Confirmed!</span>
              </div>
              <h4 className="text-base font-extrabold text-[#3B2A2A]">{pairedDevice.name}</h4>
              <p className="text-xs text-[#7A6363] font-mono">IP: {pairedDevice.ip}</p>
            </div>
          ) : (
            <div className="bg-[#FFE3E1]/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 border border-[#FFD1D1]/60">
              <div className="p-3 bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#FFD1D1]/60 flex items-center justify-center">
                <QrCodeView value={qrPayload} size={180} />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] shadow-sm text-xs font-semibold text-[#3B2A2A]">
                <span className="w-2 h-2 rounded-full bg-[#FF9494] animate-ping"></span>
                <span>Waiting for phone scan...</span>
              </div>
            </div>
          )}

          {/* URL Bar */}
          <div className="flex items-center justify-between bg-[#FFE3E1] rounded-2xl p-2 pl-3.5 border border-[#FFD1D1]/60">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span className="text-xs font-mono text-[#3B2A2A] truncate">
                https://airdart.local/#session-8842
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FFFFFF] text-[10px] font-bold text-[#7A6363] shrink-0">
                Local Wi-Fi Only
              </span>
            </div>

            <button
              onClick={handleCopyLink}
              className="h-8 px-3.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF5E4] text-xs font-bold text-[#3B2A2A] flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
            >
              {copiedLink ? (
                <>
                  <Check size={13} color="#10B981" strokeWidth={2.6} />
                  <span className="text-[#10B981]">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} color="#3B2A2A" strokeWidth={2.2} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-[#7A6363] pt-1">
            <span className="flex items-center gap-1.5">
              <Lock size={13} color="#7A6363" strokeWidth={2.2} />
              <span>Direct P2P Encrypted Session</span>
            </span>
            <span>Expires in 10:00 min</span>
          </div>
        </div>

        {/* Right Card: Enter 6-Digit Code */}
        <div className="bg-[#FFFFFF]/90 backdrop-blur-sm rounded-3xl p-6 sm:p-7 border border-[#FFD1D1]/70 shadow-sm flex flex-col justify-between gap-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE3E1] flex items-center justify-center text-[#3B2A2A]">
                <KeyRound size={20} color="#3B2A2A" strokeWidth={2.4} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#3B2A2A]">Enter 6-Digit Code</h3>
                <p className="text-xs text-[#7A6363] mt-0.5">For devices that cannot scan camera codes</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-[#FFE3E1] text-[11px] font-bold text-[#7A6363]">
              Manual Key
            </span>
          </div>

          <p className="text-xs text-[#7A6363]">
            Type the 6-digit sync code displayed on your sending device or enter this pairing key:
          </p>

          {/* 6 Large Code Boxes */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 py-2">
            {digits.map((digit, i) => (
              <div
                key={i}
                className="flex-1 aspect-square max-w-[56px] rounded-2xl bg-[#FFE3E1] border border-[#FFD1D1]/70 shadow-sm flex items-center justify-center text-xl sm:text-2xl font-extrabold text-[#3B2A2A]"
              >
                {digit}
              </div>
            ))}
          </div>

          <button className="w-full h-12 rounded-full bg-[#FF9494] hover:bg-[#ff8585] text-[#3B2A2A] font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#FF9494]/30 active:scale-[0.98] transition-all cursor-pointer">
            <Zap size={18} color="#3B2A2A" strokeWidth={2.6} />
            <span>Connect Device</span>
          </button>

          {/* Handshake Prompt Box */}
          <div className="bg-[#FFE3E1]/70 rounded-2xl p-3.5 border border-[#FFD1D1]/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FFFFFF] flex items-center justify-center text-[#3B2A2A] relative shrink-0">
                <Smartphone size={18} color="#3B2A2A" strokeWidth={2.2} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-[#FFFFFF]"></span>
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#3B2A2A] truncate">iPhone 15 Pro Nearby</h4>
                <p className="text-[11px] text-[#7A6363] truncate">Tap to request pairing handshake</p>
              </div>
            </div>

            <button
              onClick={() => setIsHandshakeRequested(!isHandshakeRequested)}
              className="h-8 px-4 rounded-full bg-[#FFFFFF] hover:bg-[#FF9494] text-xs font-bold text-[#3B2A2A] shadow-sm transition-all cursor-pointer shrink-0"
            >
              {isHandshakeRequested ? 'Requested...' : 'Request'}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-[#7A6363] pt-1">
            <span>Auto-negotiated channel</span>
            <button className="underline hover:text-[#3B2A2A] cursor-pointer">Need help pairing?</button>
          </div>
        </div>
      </section>

      {/* How AirDart Works Section */}
      <section className="flex flex-col gap-4 max-w-4xl mx-auto w-full pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-[#3B2A2A]">How AirDart Works</h3>
            <p className="text-xs text-[#7A6363] mt-0.5">Frictionless file sharing in three effortless steps</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#FFE3E1] text-xs font-bold text-[#994345]">
            Zero Installation Required
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="bg-[#FFFFFF]/80 backdrop-blur-sm rounded-2xl p-5 border border-[#FFD1D1]/60 shadow-sm flex flex-col justify-between gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFE3E1] flex items-center justify-center text-[#3B2A2A]">
              <Globe size={20} color="#3B2A2A" strokeWidth={2.2} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#3B2A2A]">1. Open the Link</h4>
              <p className="text-xs text-[#7A6363] mt-1.5 leading-relaxed">
                Simply visit <strong className="text-[#3B2A2A]">airdart.local</strong> on any browser on your current Wi-Fi network. Works across iOS, Android, Windows, Mac, and Linux.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#10B981]">
              <Check size={14} color="#10B981" strokeWidth={2.6} />
              <span>No App Store downloads</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#FFFFFF]/80 backdrop-blur-sm rounded-2xl p-5 border border-[#FFD1D1]/60 shadow-sm flex flex-col justify-between gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFE3E1] flex items-center justify-center text-[#3B2A2A]">
              <KeyRound size={20} color="#3B2A2A" strokeWidth={2.2} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#3B2A2A]">2. Scan or Enter Code</h4>
              <p className="text-xs text-[#7A6363] mt-1.5 leading-relaxed">
                Pair instantly with zero setup or accounts. The devices negotiate a secure, direct WebRTC data channel through standard local mDNS signaling.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#10B981]">
              <Check size={14} color="#10B981" strokeWidth={2.6} />
              <span>Zero logins or passwords</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#FFFFFF]/80 backdrop-blur-sm rounded-2xl p-5 border border-[#FFD1D1]/60 shadow-sm flex flex-col justify-between gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFE3E1] flex items-center justify-center text-[#3B2A2A]">
              <Zap size={20} color="#3B2A2A" strokeWidth={2.2} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#3B2A2A]">3. Direct P2P Transfer</h4>
              <p className="text-xs text-[#7A6363] mt-1.5 leading-relaxed">
                Enjoy full gigabit local Wi-Fi speeds with military-grade peer-to-peer encryption. Move raw 4K videos, massive folders, or synced clipboards in seconds.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#10B981]">
              <Check size={14} color="#10B981" strokeWidth={2.6} />
              <span>Uncapped file size limit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Strict Privacy Guarantee Banner */}
      <section className="max-w-4xl mx-auto w-full bg-[#FFE3E1]/70 rounded-3xl p-5 border border-[#FFD1D1] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#FFFFFF] flex items-center justify-center text-[#3B2A2A] shrink-0 shadow-sm">
            <ShieldCheck size={22} color="#994345" strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-[#3B2A2A]">
                Strict P2P Zero-Knowledge Privacy Guarantee
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-[#FFFFFF] text-[10px] font-bold text-[#994345]">
                100% Local
              </span>
            </div>
            <p className="text-xs text-[#7A6363] mt-0.5">
              Files go directly between your devices. No file ever touches our servers, no accounts, and no internet bandwidth consumed. Your personal data never leaves your room.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#FFD1D1] text-xs font-bold text-[#3B2A2A] shrink-0 shadow-sm">
          <Lock size={14} color="#3B2A2A" strokeWidth={2.2} />
          <span>DTLS 1.3 End-to-End</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A6363] pt-4 border-t border-[#FFD1D1]/60">
        <div className="flex items-center gap-2">
          <AirDartLogo height={24} textColor="#3B2A2A" dartColor="#FF6363" />
          <span className="text-[#7A6363] font-medium">— Open-source peer-to-peer file protocol.</span>
        </div>
        <div className="flex items-center gap-4">
          <span>WebRTC Protocol</span>
          <span>•</span>
          <span>Network Diagnostics</span>
          <span>•</span>
          <span>v2.4.1 Local Node</span>
        </div>
      </footer>
    </div>
  );
};
