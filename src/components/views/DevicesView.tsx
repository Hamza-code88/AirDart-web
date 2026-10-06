'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Send,
  Upload,
  RefreshCw,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Gauge,
  Check,
  Pause,
  Play,
  X,
  Lock,
  Download,
  Clipboard,
  QrCode,
  Image as ImageIcon,
} from 'lucide-react';

interface DevicesViewProps {
  onSelectPeer: (peerName: string) => void;
  onOpenQr: () => void;
}

export const DevicesView: React.FC<DevicesViewProps> = ({ onSelectPeer, onOpenQr }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isTransferPaused, setIsTransferPaused] = useState(false);
  const [incomingStatus, setIncomingStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [toastFile, setToastFile] = useState<any | null>(null);
  const prevCountRef = useRef(0);
  const isFirstLoadRef = useRef(true);

  // Keep track of files already downloaded or dismissed so page refresh doesn't re-trigger popups
  const [savedFileIds, setSavedFileIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('airdart_saved_ids') || '[]');
      } catch {}
    }
    return [];
  });
  const [dismissedFileId, setDismissedFileId] = useState<string | null>(null);

  const markFileSaved = (fileId: string) => {
    setSavedFileIds((prev) => {
      const updated = Array.from(new Set([...prev, fileId]));
      if (typeof window !== 'undefined') {
        localStorage.setItem('airdart_saved_ids', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // ignore audio error
    }
  };

  // Poll for incoming file transfers from mobile
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/p2p/files');
        if (res.ok) {
          const data = await res.json();
          if (data.files) {
            setReceivedFiles(data.files);
            // On first page load or refresh, initialize count and DO NOT trigger toast/sound
            if (isFirstLoadRef.current) {
              isFirstLoadRef.current = false;
              prevCountRef.current = data.files.length;
            } else if (data.files.length > prevCountRef.current) {
              const latest = data.files[0];
              // Check if user already saved this file previously
              const savedList = typeof window !== 'undefined'
                ? JSON.parse(localStorage.getItem('airdart_saved_ids') || '[]')
                : [];
              if (!savedList.includes(latest.id)) {
                setToastFile(latest);
                playNotificationSound();
              }
              prevCountRef.current = data.files.length;
            }
          }
        }
      } catch {
        // ignore
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadFile = (file: any) => {
    const a = document.createElement('a');
    a.href = file.dataUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    markFileSaved(file.id);
    setToastFile(null);
  };

  const handleDismissToast = (fileId?: string) => {
    if (fileId) markFileSaved(fileId);
    setToastFile(null);
  };

  const connectedPhoneName = receivedFiles.length > 0 ? receivedFiles[0].senderName : 'AirDart Mobile Phone';
  const nearbyDevices = [
    {
      id: 'dev-mobile',
      name: connectedPhoneName,
      meta: 'Local Wi-Fi P2P • Direct Transfer',
      badge: receivedFiles.length > 0 ? 'Connected' : 'Ready',
      icon: Smartphone,
    },
  ];

  const [activeOutgoing, setActiveOutgoing] = useState<{
    name: string;
    size: number;
    sizeFormatted: string;
    progress: number;
    status: 'uploading' | 'ready' | 'accepted';
    targetDevice: string;
  } | null>(null);

  const queueFileForMobile = async (file: File) => {
    // Sanitize Windows JFIF / JFLF extensions to clean .jpg
    let safeName = file.name.replace(/\.(jfif|jflf)$/i, '.jpg');
    if ((file.type?.includes('jpeg') || file.type?.includes('jpg')) && !safeName.match(/\.(jpg|jpeg)$/i)) {
      safeName = `${safeName.replace(/\.[^.]+$/, '')}.jpg`;
    }

    const formatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    setActiveOutgoing({
      name: safeName,
      size: file.size,
      sizeFormatted: formatted,
      progress: 35,
      status: 'uploading',
      targetDevice: "My Phone (AirDart Mobile)",
    });

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await fetch('/api/p2p/outbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: safeName,
            size: file.size,
            type: file.type || 'application/octet-stream',
            dataUrl,
            targetDevice: "My Phone (AirDart Mobile)",
          }),
        });
        if (res.ok) {
          setActiveOutgoing((prev) =>
            prev ? { ...prev, progress: 100, status: 'ready' } : null
          );
        }
      } catch (err) {
        console.error('Outbox upload failed:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFiles([file.name]);
      queueFileForMobile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFiles([file.name]);
      queueFileForMobile(file);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none relative">
      {/* Real-time Transfer Toast Notification Banner */}
      {toastFile && (
        <div className="fixed top-20 right-6 z-50 max-w-sm bg-[#FFF5E4] rounded-2xl p-4 shadow-2xl border-2 border-[#10B981] flex items-center gap-3.5 animate-in slide-in-from-top-4 duration-300">
          {toastFile.type?.startsWith('image') ? (
            <img
              src={toastFile.dataUrl}
              alt="Preview"
              className="w-12 h-12 rounded-xl object-cover border border-[#10B981]/40 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#E8F8F0] flex items-center justify-center text-[#10B981] shrink-0">
              <Download size={22} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#10B981]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span>File Received!</span>
            </div>
            <p className="text-xs font-bold text-[#3B2A2A] truncate mt-0.5">{toastFile.name}</p>
            <p className="text-[11px] text-[#7A6363]">From {toastFile.senderName || 'Phone'}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => handleDownloadFile(toastFile)}
              className="px-3 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#0ea371] text-white text-xs font-extrabold transition-all cursor-pointer shadow-sm"
            >
              Save
            </button>
            <button
              onClick={() => handleDismissToast(toastFile.id)}
              className="w-7 h-7 rounded-lg hover:bg-[#FFE3E1] flex items-center justify-center text-[#7A6363] cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Hero Dropzone */}
      <section
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full rounded-3xl p-8 border-2 border-dashed transition-all cursor-pointer flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm ${
          isDragging
            ? 'border-[#FF9494] bg-[#FFE3E1]/70 scale-[1.005]'
            : 'border-[#FF9494]/60 bg-[#FFFFFF]/75 hover:bg-[#FFFFFF]/90 hover:border-[#FF9494]'
        }`}
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#FFE3E1] flex items-center justify-center text-[#3B2A2A] shrink-0 shadow-sm">
            <Send size={28} color="#3B2A2A" strokeWidth={2.4} className="-rotate-12" />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-extrabold text-[#3B2A2A] tracking-tight">
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} file(s) selected`
                  : 'Drop files here or click to browse'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFE3E1] text-[11px] font-bold text-[#994345]">
                Ultra-Fast
              </span>
            </div>

            <p className="text-sm text-[#7A6363] max-w-xl">
              Drag any photo, video, or folder onto nearby devices below to beam instantly via peer-to-peer Wi-Fi.
            </p>

            <div className="flex items-center gap-4 text-xs font-medium text-[#7A6363] mt-1">
              <span>Unlimited file size</span>
              <span>•</span>
              <span>Up to 120 MB/s LAN rate</span>
              <span>•</span>
              <span>End-to-end encrypted</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <button
            type="button"
            className="h-12 px-7 rounded-full bg-[#FF9494] hover:bg-[#ff8585] text-[#3B2A2A] font-bold text-sm flex items-center gap-2.5 shadow-md shadow-[#FF9494]/35 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Upload size={18} color="#3B2A2A" strokeWidth={2.6} />
            <span>Select Files</span>
          </button>
          <span className="text-xs text-[#7A6363]">or paste clipboard items</span>
        </div>
      </section>

      {/* Nearby Devices Section */}
      <section className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#FF9494] animate-ping"></span>
            <h3 className="text-lg font-extrabold text-[#3B2A2A] tracking-tight">
              Nearby Devices <span className="font-semibold text-[#7A6363] text-sm">({nearbyDevices.length} Active)</span>
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#7A6363]">
            <span>Auto-discovering peers on subnet</span>
            <RefreshCw size={14} color="#7A6363" strokeWidth={2.4} className="animate-spin" />
          </div>
        </div>

        {/* 4 Device Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nearbyDevices.map((dev) => {
            const Icon = dev.icon;
            return (
              <div
                key={dev.id}
                className="bg-[#FFFFFF]/80 backdrop-blur-sm rounded-2xl p-4 border border-[#FFD1D1]/60 shadow-sm hover:shadow-md hover:border-[#FF9494]/60 transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#FFE3E1] flex items-center justify-center text-[#3B2A2A]">
                    <Icon size={22} color="#3B2A2A" strokeWidth={2.2} />
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFE3E1] text-[11px] font-bold text-[#7A6363] border border-[#FFD1D1]/60">
                    {dev.badge}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-[#3B2A2A] text-sm leading-snug">{dev.name}</h4>
                  <p className="text-xs text-[#7A6363] mt-0.5">{dev.meta}</p>
                </div>

                <button
                  onClick={() => onSelectPeer(dev.name)}
                  className="w-full h-9 rounded-full bg-[#FFE3E1] hover:bg-[#FF9494] text-[#3B2A2A] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Send size={14} color="#3B2A2A" strokeWidth={2.4} className="-rotate-12" />
                  <span>Send Files</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Split Cards: Active Transfer & Incoming Request */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Active Outgoing Transfer Card */}
        <div className="bg-[#FFFFFF]/85 backdrop-blur-sm rounded-3xl p-5 border border-[#FFD1D1]/70 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFE3E1] flex items-center justify-center text-[#3B2A2A]">
                <Upload size={18} color="#3B2A2A" strokeWidth={2.4} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#3B2A2A]">
                  {activeOutgoing ? 'Beaming to Mobile' : 'Ready to Send to Phone'}
                </h4>
                <p className="text-xs text-[#7A6363]">
                  {activeOutgoing ? `Target: ${activeOutgoing.targetDevice}` : 'Drop files above or click to beam'}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE3E1] text-xs font-bold text-[#3B2A2A] shadow-sm">
              <Gauge size={14} color="#994345" strokeWidth={2.4} />
              <span>{activeOutgoing ? '58.4 MB/s' : 'Standby'}</span>
            </div>
          </div>

          {/* File Card in Transfer */}
          <div className="bg-[#FFE3E1]/70 rounded-2xl p-4 flex flex-col gap-2.5 border border-[#FFD1D1]/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#3B2A2A] truncate max-w-[220px]">
                  {activeOutgoing ? activeOutgoing.name : 'No outgoing file selected'}
                </p>
                <p className="text-[11px] text-[#7A6363] mt-0.5">
                  {activeOutgoing
                    ? `${activeOutgoing.sizeFormatted} • Streaming to phone`
                    : 'Drop a file into the dropzone to beam to your phone'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-[#3B2A2A]">
                  {activeOutgoing ? `${activeOutgoing.progress}%` : '0%'}
                </span>
                <p className="text-[11px] text-[#7A6363]">
                  {activeOutgoing ? (activeOutgoing.status === 'ready' ? 'Sent to phone' : 'Transferring') : 'Waiting'}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-[#FFFFFF] overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-[#FF9494] transition-all duration-300"
                style={{ width: `${activeOutgoing ? activeOutgoing.progress : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs font-medium text-[#7A6363]">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span>Direct P2P LAN Channel</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-8 px-4 rounded-full bg-[#FF9494] hover:bg-[#ff8585] text-xs font-bold text-[#3B2A2A] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Upload size={13} color="#3B2A2A" strokeWidth={2.4} />
                <span>Choose File to Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Incoming Request / Received File Card */}
        {(() => {
          const activeIncomingFile = receivedFiles.length > 0 && receivedFiles[0].id !== dismissedFileId
            ? receivedFiles[0]
            : null;
          const isFileAlreadySaved = activeIncomingFile ? savedFileIds.includes(activeIncomingFile.id) : false;

          return (
            <div className="bg-[#FFFFFF]/85 backdrop-blur-sm rounded-3xl p-5 border border-[#FFD1D1]/70 shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFE3E1] flex items-center justify-center text-[#3B2A2A]">
                    <Download size={18} color="#3B2A2A" strokeWidth={2.4} />
                  </div>
                  <div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isFileAlreadySaved ? 'text-[#10B981]' : 'text-[#994345]'}`}>
                      {activeIncomingFile ? (isFileAlreadySaved ? '✓ File Saved to PC' : 'File Received!') : 'Incoming Request'}
                    </span>
                    <h4 className="text-sm font-extrabold text-[#3B2A2A]">
                      {activeIncomingFile ? activeIncomingFile.senderName : 'Standby for Mobile'}
                    </h4>
                  </div>
                </div>

                {activeIncomingFile && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFE3E1] text-[11px] font-bold text-[#7A6363]">
                    {isFileAlreadySaved ? 'Saved' : 'Ready'}
                  </span>
                )}
              </div>

              {/* Incoming Items Preview */}
              <div className="bg-[#FFE3E1]/70 rounded-2xl p-3.5 flex items-center gap-3 border border-[#FFD1D1]/60">
                {activeIncomingFile && activeIncomingFile.type?.startsWith('image') ? (
                  <img
                    src={activeIncomingFile.dataUrl}
                    alt="Received"
                    className="w-12 h-12 rounded-xl object-cover border border-[#FFD1D1]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] flex items-center justify-center text-[#3B2A2A]">
                    <ImageIcon size={20} color="#3B2A2A" strokeWidth={2.2} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#3B2A2A] truncate">
                    {activeIncomingFile ? activeIncomingFile.name : 'Ready to receive files'}
                  </p>
                  <p className="text-[11px] text-[#7A6363] mt-0.5">
                    {activeIncomingFile
                      ? `${(activeIncomingFile.size / (1024 * 1024)).toFixed(2)} MB • Direct Wi-Fi Transfer`
                      : 'Tap Send Files in mobile app to beam photos or files here'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                {activeIncomingFile ? (
                  !isFileAlreadySaved ? (
                    <>
                      <button
                        onClick={() => handleDownloadFile(activeIncomingFile)}
                        className="flex-1 h-11 rounded-full bg-[#10B981] hover:bg-[#0ea371] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-[#10B981]/30 transition-all cursor-pointer active:scale-[0.98]"
                      >
                        <Download size={16} />
                        <span>Save to PC ({activeIncomingFile.name})</span>
                      </button>
                      <button
                        onClick={() => {
                          markFileSaved(activeIncomingFile.id);
                          setDismissedFileId(activeIncomingFile.id);
                        }}
                        className="h-11 px-4 rounded-full bg-[#FFE3E1] hover:bg-[#FFD1D1] text-xs font-bold text-[#3B2A2A] transition-all cursor-pointer"
                        title="Dismiss"
                      >
                        Dismiss
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDownloadFile(activeIncomingFile)}
                        className="flex-1 h-11 rounded-full bg-[#FFE3E1] hover:bg-[#FFD1D1] text-[#3B2A2A] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Download size={15} />
                        <span>Download Again</span>
                      </button>
                      <button
                        onClick={() => setDismissedFileId(activeIncomingFile.id)}
                        className="h-11 px-5 rounded-full bg-[#FFFFFF] hover:bg-[#FFE3E1] border border-[#FFD1D1] text-xs font-bold text-[#7A6363] hover:text-[#3B2A2A] transition-all cursor-pointer"
                      >
                        Clear Card
                      </button>
                    </>
                  )
                ) : (
                  <div className="w-full h-11 rounded-full bg-[#FFE3E1]/60 text-xs font-bold text-[#7A6363] flex items-center justify-center gap-2 border border-[#FFD1D1]/60">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span>Waiting for phone transfer...</span>
                  </div>
                )}
              </div>

              <div className="bg-[#FFE3E1]/50 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-[#7A6363]">
                <Lock size={14} color="#7A6363" strokeWidth={2.2} className="shrink-0" />
                <span>
                  Files transfer strictly inside your local area network via direct WebRTC sockets. No server ever sees or stores your content.
                </span>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Bottom Grid: Shared Clipboard & Instant Mobile Connect */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Shared Clipboard Banner (2 cols) */}
        <div className="lg:col-span-2 bg-[#FFFFFF]/80 backdrop-blur-sm rounded-3xl p-5 border border-[#FFD1D1]/60 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-[#FFE3E1] flex items-center justify-center text-[#3B2A2A]">
              <Clipboard size={20} color="#3B2A2A" strokeWidth={2.2} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#3B2A2A]">Shared Clipboard</h4>
              <p className="text-xs text-[#7A6363] mt-0.5">
                Copy anything on PC and beam instantly to your mobile phone
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();
                if (text) {
                  await fetch('/api/p2p/clipboard', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, sender: 'Windows PC' }),
                  });
                  alert(`Copied text sent to mobile: "${text.slice(0, 40)}..."`);
                } else {
                  alert('Your PC clipboard is empty! Copy some text first.');
                }
              } catch (e) {
                const manual = prompt('Enter text to beam to phone:');
                if (manual) {
                  await fetch('/api/p2p/clipboard', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: manual, sender: 'Windows PC' }),
                  });
                  alert('Text sent to mobile!');
                }
              }
            }}
            className="h-10 px-5 rounded-full bg-[#FF9494] hover:bg-[#ff8585] text-xs font-bold text-[#3B2A2A] flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-sm"
          >
            <Send size={14} color="#3B2A2A" strokeWidth={2.4} className="-rotate-12" />
            <span>Beam PC Clipboard</span>
          </button>
        </div>

        {/* Instant Mobile Connect QR box (1 col) */}
        <div
          onClick={onOpenQr}
          className="bg-[#FFFFFF]/80 backdrop-blur-sm rounded-3xl p-5 border border-[#FFD1D1]/60 shadow-sm hover:border-[#FF9494] transition-all cursor-pointer flex items-center justify-between gap-4 group"
        >
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#994345]">
              Instant Mobile Connect
            </span>
            <h4 className="text-sm font-extrabold text-[#3B2A2A] mt-0.5">Scan with Camera</h4>
            <p className="text-xs text-[#7A6363] mt-0.5">Zero-install local browser link</p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#FFE3E1] group-hover:bg-[#FF9494] flex items-center justify-center text-[#3B2A2A] transition-all shrink-0">
            <QrCode size={22} color="#3B2A2A" strokeWidth={2.4} />
          </div>
        </div>
      </section>
    </div>
  );
};
