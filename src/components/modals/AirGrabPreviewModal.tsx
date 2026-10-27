'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Hand,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Zap,
  Activity,
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
  const [detectedGesture, setDetectedGesture] = useState<'none' | 'palm' | 'fist'>('none');
  const [handConfidence, setHandConfidence] = useState<number>(0);
  const [isMediaPipeReady, setIsMediaPipeReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fistCounterRef = useRef<number>(0);
  const handsInstanceRef = useRef<any>(null);

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

  // Helper to dynamically load external scripts from CDN
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        return resolve();
      }
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Initialize MediaPipe Hands and Webcam
  useEffect(() => {
    if (!visible || !file) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      setCameraActive(false);
      setGrabStatus('idle');
      setDetectedGesture('none');
      return;
    }

    let isMounted = true;

    async function initMediaPipeAndWebcam() {
      try {
        setCameraError(null);

        // 1. Load MediaPipe Hands via CDN
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');

        if (!isMounted) return;

        // 2. Start Webcam
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
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
          await videoRef.current.play();
        }

        setCameraActive(true);
        setGrabStatus('detecting');

        // 3. Initialize Google MediaPipe Hands detector
        const HandsClass = (window as any).Hands;
        if (!HandsClass) {
          throw new Error('MediaPipe Hands library failed to initialize.');
        }

        const hands = new HandsClass({
          locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results: any) => {
          if (!isMounted) return;
          processHandResults(results);
        });

        handsInstanceRef.current = hands;
        setIsMediaPipeReady(true);

        // 4. Start continuous 60 FPS frame processing loop
        let lastVideoTime = -1;
        const processFrame = async () => {
          if (!isMounted) return;
          const video = videoRef.current;
          if (video && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
            lastVideoTime = video.currentTime;
            try {
              await hands.send({ image: video });
            } catch {}
          }
          animFrameRef.current = requestAnimationFrame(processFrame);
        };

        animFrameRef.current = requestAnimationFrame(processFrame);
      } catch (err: any) {
        console.warn('MediaPipe / Webcam error:', err);
        setCameraError('Webcam or MediaPipe AI could not load. Tap button below to AirGrab manually.');
      }
    }

    initMediaPipeAndWebcam();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [visible, file]);

  // Process 21 Skeleton Landmarks from MediaPipe
  const processHandResults = (results: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      setDetectedGesture('none');
      setHandConfidence(0);
      fistCounterRef.current = 0;
      return;
    }

    const landmarks = results.multiHandLandmarks[0];
    setHandConfidence(98);

    // Draw futuristic glowing neon skeleton lines
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index
      [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17], [0, 17]    // Palm base
    ];

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);

    // Draw skeleton bone lines
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#00F0FF';
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 8;

    for (const [start, end] of connections) {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      ctx.beginPath();
      ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
      ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
      ctx.stroke();
    }

    // Draw joint nodes (21 landmark points)
    for (let i = 0; i < landmarks.length; i++) {
      const pt = landmarks[i];
      ctx.beginPath();
      ctx.arc(pt.x * canvas.width, pt.y * canvas.height, i === 8 || i === 4 ? 6 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = i === 8 || i === 12 || i === 16 || i === 20 ? '#FF6363' : '#10B981';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
    }

    ctx.restore();

    // ✊ FIST DETECTION ALGORITHM:
    // In a fist, all 4 fingertips (8, 12, 16, 20) are folded down past their PIP joints (6, 10, 14, 18)
    const isFist =
      landmarks[8].y > landmarks[6].y &&   // Index finger folded
      landmarks[12].y > landmarks[10].y && // Middle finger folded
      landmarks[16].y > landmarks[14].y && // Ring finger folded
      landmarks[20].y > landmarks[18].y;   // Pinky finger folded

    const isOpenPalm =
      landmarks[8].y < landmarks[6].y &&
      landmarks[12].y < landmarks[10].y &&
      landmarks[16].y < landmarks[14].y &&
      landmarks[20].y < landmarks[18].y;

    if (isFist) {
      setDetectedGesture('fist');
      fistCounterRef.current += 1;

      // When Fist is held for 3 consecutive frames (~100ms), trigger AirGrab!
      if (fistCounterRef.current >= 3 && grabStatus === 'detecting') {
        triggerGrab();
      }
    } else if (isOpenPalm) {
      setDetectedGesture('palm');
      fistCounterRef.current = 0;
    } else {
      setDetectedGesture('none');
      fistCounterRef.current = 0;
    }
  };

  // Execute Grab Action
  const triggerGrab = async () => {
    if (!file || grabStatus === 'grabbed') return;

    playGrabSound();
    setGrabStatus('grabbed');

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
          source: 'Windows PC (MediaPipe AI Gesture)',
        }),
      });
    } catch (err) {
      console.error('AirGrab API stage error:', err);
    }
  };

  if (!visible || !file) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#3B2A2A]/60 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#FFF5E4] rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-[#FFD1D1] flex flex-col gap-4 relative">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFE3E1] flex items-center justify-center text-[#FF6363]">
              <Zap size={20} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#3B2A2A]">PC AirGrab (MediaPipe AI)</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[10px] font-bold text-[#065F46] border border-[#10B981]/30 flex items-center gap-1">
                  <Activity size={10} className="animate-spin" />
                  60 FPS Tracker
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

        {/* Main Preview Container */}
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
            <div className="absolute inset-0 bg-[#3B2A2A]/70 backdrop-blur-md flex flex-col items-center justify-center gap-3 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-[#FF6363] flex items-center justify-center text-white shadow-xl shadow-[#FF6363]/40 animate-pulse">
                <Sparkles size={32} />
              </div>
              <h4 className="text-lg font-black text-white tracking-wide">
                ✊ PHOTO GRABBED BY GESTURE!
              </h4>
              <p className="text-xs text-[#FFF5E4] text-center max-w-xs font-semibold leading-relaxed px-4">
                MediaPipe detected your fist closure. File is now staged in the local mesh ready for phone!
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-[11px] font-bold mt-1">
                <Smartphone size={13} />
                <span>Staged for Connected Phone</span>
              </div>
            </div>
          )}

          {/* Floating Live Webcam HUD with MediaPipe 21 Skeleton Tracking */}
          {cameraActive && grabStatus !== 'grabbed' && (
            <div className="absolute top-3 right-3 w-40 h-32 rounded-2xl overflow-hidden border-2 border-[#00F0FF] shadow-xl bg-black/60 backdrop-blur-md">
              <video
                ref={videoRef}
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1] opacity-70"
              />
              <canvas
                ref={canvasRef}
                width={320}
                height={240}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Status Pill on Camera */}
              <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between px-2 py-0.5 rounded-lg bg-black/75 text-[10px] font-bold text-white">
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${
                    detectedGesture === 'fist' ? 'bg-[#FF6363] animate-ping' : detectedGesture === 'palm' ? 'bg-[#10B981]' : 'bg-gray-400'
                  }`} />
                  {detectedGesture === 'fist' ? '✊ FIST' : detectedGesture === 'palm' ? '✋ PALM' : 'READY'}
                </span>
                <span className="text-[#00F0FF]">AI Active</span>
              </div>
            </div>
          )}
        </div>

        {/* AirGrab Action & MediaPipe Status Guidance */}
        <div className="flex flex-col gap-2.5">
          {grabStatus !== 'grabbed' ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={triggerGrab}
                className="w-full h-12 rounded-2xl bg-[#FF6363] hover:bg-[#ff5252] active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#FF6363]/30 transition-all cursor-pointer"
              >
                <Hand size={18} strokeWidth={2.4} />
                <span>
                  {detectedGesture === 'fist'
                    ? '✊ FIST DETECTED • GRABBING...'
                    : 'Close Fist (✊) at Webcam or Tap to AirGrab'}
                </span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-[#7A6363] px-1 font-medium">
                <span className="flex items-center gap-1.5">
                  <Camera size={13} color="#10B981" />
                  <span>Google MediaPipe: 21 Skeleton Landmarks Tracked</span>
                </span>
                <span className="font-bold text-[#3B2A2A]">Hold Fist ✊ to Grab</span>
              </div>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full h-11 rounded-2xl bg-[#10B981] hover:bg-[#0ea371] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#10B981]/30"
            >
              <CheckCircle2 size={16} />
              <span>Done</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
