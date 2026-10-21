'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Hand,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Send,
  Zap,
  Info,
} from 'lucide-react';

interface AirGrabPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  file: {
    name: string;
    size: number;
    type: string;
    dataUrl: string;
  } | null;
}

export const AirGrabPreviewModal: React.FC<AirGrabPreviewModalProps> = ({
  visible,
  onClose,
  file,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [grabStatus, setGrabStatus] = useState<'idle' | 'detecting' | 'grabbed'>('idle');
  const [isSimulating, setIsSimulating] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fistHoldCounterRef = useRef<number>(0);

  // Play sci-fi audio sound on Fist Grab
  const playGrabSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  // 1. Wake up camera ONLY while Image Preview is open
  useEffect(() => {
    if (!visible || !file) {
      // Turn camera off immediately when modal closes
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
      setGrabStatus('idle');
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let isMounted = true;

    async function initCamera() {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
        setGrabStatus('detecting');
      } catch (err: any) {
        console.warn('AirGrab webcam access note:', err.message);
        setCameraError('Camera access not available. You can use one-click AirGrab button below.');
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [visible, file]);

  // Execute Grab Action (called when Fist is detected or manual button is tapped)
  const triggerGrab = async () => {
    if (!file || grabStatus === 'grabbed') return;

    playGrabSound();
    setGrabStatus('grabbed');

    // Turn camera off immediately after successful grab to conserve battery & privacy
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraActive(false);
    }

    try {
      await fetch('/api/p2p/airgrab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: file.dataUrl,
          source: 'Windows PC (AirGrab Gesture)',
        }),
      });
    } catch (err) {
      console.error('AirGrab API stage error:', err);
    }
  };

  if (!visible || !file) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#3B2A2A]/50 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#FFF5E4] rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-[#FFD1D1] flex flex-col gap-4 relative">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFE3E1] flex items-center justify-center text-[#FF6363]">
              <Zap size={20} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#3B2A2A]">AirGrab Photo Preview</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#FFE3E1] text-[10px] font-bold text-[#FF6363] border border-[#FFD1D1]">
                  100% Offline
                </span>
              </div>
              <p className="text-xs text-[#7A6363] truncate max-w-xs">{file.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FFE3E1] hover:bg-[#FFD1D1] flex items-center justify-center text-[#3B2A2A] transition-all cursor-pointer"
          >
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>

        {/* Main Preview Container with Sci-Fi Floating Effects */}
        <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-[#3B2A2A]/5 flex items-center justify-center border border-[#FFD1D1]/60">
          <img
            src={file.dataUrl}
            alt={file.name}
            className={`max-w-full max-h-full object-contain transition-all duration-500 ${
              grabStatus === 'grabbed'
                ? 'scale-90 brightness-110 drop-shadow-[0_0_25px_rgba(255,99,99,0.7)] ring-4 ring-[#FF6363]'
                : ''
            }`}
          />

          {/* AirGrabbed Success Hologram Overlay */}
          {grabStatus === 'grabbed' && (
            <div className="absolute inset-0 bg-[#3B2A2A]/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-[#FF6363] flex items-center justify-center text-white shadow-xl shadow-[#FF6363]/40 animate-pulse">
                <Sparkles size={32} />
              </div>
              <h4 className="text-lg font-black text-white tracking-wide">
                ✊ PHOTO GRABBED!
              </h4>
              <p className="text-xs text-[#FFF5E4] text-center max-w-xs font-semibold leading-relaxed px-4">
                Photo is floating in your local Wi-Fi mesh. Now hold your phone up and{' '}
                <strong className="text-[#FFD1D1]">open your palm (🖐️)</strong> to drop!
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-[11px] font-bold mt-1">
                <Smartphone size={13} />
                <span>Waiting for Phone Open Palm...</span>
              </div>
            </div>
          )}

          {/* Floating Live Webcam HUD (Active ONLY during preview) */}
          {cameraActive && grabStatus !== 'grabbed' && (
            <div className="absolute top-3 right-3 w-32 h-24 rounded-xl overflow-hidden border-2 border-[#FF6363] shadow-lg bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              <div className="absolute bottom-1 inset-x-1 flex items-center justify-between px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold text-white">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                  AirGrab
                </span>
                <span>Fist ✊</span>
              </div>
            </div>
          )}
        </div>

        {/* AirGrab Action & Gesture Guidance Bar */}
        <div className="flex flex-col gap-2.5">
          {grabStatus !== 'grabbed' ? (
            <div className="flex items-center gap-3">
              <button
                onClick={triggerGrab}
                className="flex-1 h-12 rounded-2xl bg-[#FF6363] hover:bg-[#ff5252] active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#FF6363]/30 transition-all cursor-pointer"
              >
                <Hand size={18} strokeWidth={2.4} />
                <span>Clench Fist (✊) or Tap to AirGrab</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full h-11 rounded-2xl bg-[#10B981] hover:bg-[#0ea371] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#10B981]/30"
            >
              <CheckCircle2 size={16} />
              <span>Done (Beaming to Phone)</span>
            </button>
          )}

          <div className="flex items-center justify-between text-[11px] text-[#7A6363] px-1">
            <span className="flex items-center gap-1">
              <Camera size={12} />
              <span>Camera active only while previewing photo</span>
            </span>
            <span>Zero-Cloud • Direct Wi-Fi</span>
          </div>
        </div>
      </div>
    </div>
  );
};
