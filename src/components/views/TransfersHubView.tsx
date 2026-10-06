'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Film,
  FileSpreadsheet,
  FolderArchive,
  Image as ImageIcon,
  Check,
  Pause,
  Play,
  X,
  Lock,
  Eye,
  Send,
  Copy,
  ChevronDown,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

export const TransfersHubView: React.FC = () => {
  const [autoSync, setAutoSync] = useState(true);
  const [clipboardInput, setClipboardInput] = useState('');
  const [activeHistoryTab, setActiveHistoryTab] = useState<'all' | 'sent' | 'received' | 'failed'>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [outboxFiles, setOutboxFiles] = useState<any[]>([]);
  const [syncedClipboard, setSyncedClipboard] = useState<any | null>(null);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const [recRes, outRes, clipRes] = await Promise.all([
          fetch('/api/p2p/files'),
          fetch('/api/p2p/outbox'),
          fetch('/api/p2p/clipboard'),
        ]);
        if (recRes.ok) {
          const recData = await recRes.json();
          if (recData.files) setReceivedFiles(recData.files);
        }
        if (outRes.ok) {
          const outData = await outRes.json();
          if (outData.allFiles) setOutboxFiles(outData.allFiles);
        }
        if (clipRes.ok) {
          const clipData = await clipRes.json();
          if (clipData.latest) setSyncedClipboard(clipData.latest);
        }
      } catch {}
    };

    fetchTransfers();
    const interval = setInterval(fetchTransfers, 2000);
    return () => clearInterval(interval);
  }, []);


  const historyItems = [
    ...outboxFiles.map((f) => ({
      id: f.id,
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      device: f.targetDevice || 'My Phone',
      direction: 'sent' as const,
      type: f.type?.startsWith('image') ? 'image' : 'doc',
      dataUrl: f.dataUrl,
    })),
    ...receivedFiles.map((f) => ({
      id: f.id,
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      device: f.senderName || 'My Phone',
      direction: 'received' as const,
      type: f.type?.startsWith('image') ? 'image' : 'doc',
      dataUrl: f.dataUrl,
    })),
  ];

  const handleCopyClipboard = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Breadcrumb & Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#7A6363]">
            Overview &nbsp;&gt;&nbsp; <span className="text-[#3B2A2A]">Active Mesh Station</span>
          </p>
          <h2 className="text-2xl font-extrabold text-[#3B2A2A] tracking-tight mt-1">
            Transfers & Shared Hub
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE3E1] border border-[#FFD1D1]/60 text-xs font-bold text-[#3B2A2A]">
          <Eye size={14} color="#3B2A2A" strokeWidth={2.4} />
          <span>Discovery Mode:</span>
          <span className="text-[#994345]">Everyone on Studio Net</span>
        </div>
      </section>

      {/* Live Transfers Card */}
      <section className="bg-[#FFFFFF]/85 backdrop-blur-sm rounded-3xl p-6 border border-[#FFD1D1]/70 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE3E1] flex items-center justify-center text-[#3B2A2A]">
              <Send size={22} color="#3B2A2A" strokeWidth={2.4} className="-rotate-12" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#3B2A2A]">
                  Active & Recent Transfers ({historyItems.length})
                </h3>
                <span className="text-sm font-extrabold text-[#994345]">LAN Peer-to-Peer</span>
              </div>
              <p className="text-xs text-[#7A6363] mt-0.5">
                Encrypted direct stream via local Wi-Fi data channels
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFE3E1] text-xs font-bold text-[#3B2A2A] self-start sm:self-auto">
            <Lock size={13} color="#3B2A2A" strokeWidth={2.4} />
            <span>Direct device-to-device • 100% Offline</span>
          </div>
        </div>

        {historyItems.length === 0 ? (
          <div className="bg-[#FFE3E1]/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-2 border border-[#FFD1D1]/60">
            <Send size={28} color="#7A6363" strokeWidth={2} className="-rotate-12 opacity-60" />
            <h4 className="text-sm font-extrabold text-[#3B2A2A]">No Transfers Yet</h4>
            <p className="text-xs text-[#7A6363] max-w-sm">
              Drop files on the Devices page to beam to your phone, or tap "Send Files" in the mobile app.
            </p>
          </div>
        ) : (
          historyItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="bg-[#FFE3E1]/60 rounded-2xl p-4 flex flex-col gap-3 border border-[#FFD1D1]/60"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] flex items-center justify-center text-[#3B2A2A] shrink-0">
                    {item.type === 'image' ? (
                      <ImageIcon size={20} color="#994345" strokeWidth={2.2} />
                    ) : (
                      <FileCode size={20} color="#994345" strokeWidth={2.2} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#3B2A2A] truncate">{item.name}</h4>
                      <span className="text-xs text-[#7A6363]">({item.size})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#7A6363] mt-0.5">
                      {item.direction === 'sent' ? (
                        <>
                          <ArrowUpRight size={13} color="#994345" strokeWidth={2.4} />
                          <span>Sent to <strong className="text-[#3B2A2A]">{item.device}</strong></span>
                        </>
                      ) : (
                        <>
                          <ArrowDownLeft size={13} color="#10B981" strokeWidth={2.4} />
                          <span>Received from <strong className="text-[#3B2A2A]">{item.device}</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-[#10B981] px-2 py-0.5 rounded-full bg-[#FFFFFF]">
                      Complete
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full h-1.5 rounded-full bg-[#FFFFFF] overflow-hidden">
                <div className="h-full rounded-full bg-[#10B981] w-full"></div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Split Lower Row: Shared Clipboard & Recent Transfer History */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Shared Clipboard (5 cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF]/85 backdrop-blur-sm rounded-3xl p-6 border border-[#FFD1D1]/70 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#3B2A2A]">Shared Clipboard</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7A6363] font-medium">Auto-sync</span>
              <button
                onClick={() => setAutoSync(!autoSync)}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                  autoSync ? 'bg-[#FF9494] justify-end' : 'bg-[#E8BCBC] justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-[#FFFFFF] shadow-sm"></span>
              </button>
            </div>
          </div>

          {/* Push Input Area */}
          {/* Push Input Area */}
          <div className="bg-[#FFE3E1]/70 rounded-2xl p-3.5 border border-[#FFD1D1]/60 flex flex-col gap-2.5">
            <span className="text-[11px] font-bold text-[#7A6363]">
              Push text or link to paired devices
            </span>
            <textarea
              rows={2}
              value={clipboardInput}
              onChange={(e) => setClipboardInput(e.target.value)}
              placeholder="Paste URL, verification code, terminal command, or snippet..."
              className="w-full bg-[#FFFFFF] rounded-xl p-2.5 text-xs text-[#3B2A2A] placeholder-[#7A6363] border border-[#FFD1D1]/60 focus:outline-none focus:border-[#FF9494] resize-none"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#7A6363]">Broadcasts immediately</span>
              <button
                onClick={async () => {
                  if (!clipboardInput.trim()) return;
                  try {
                    const res = await fetch('/api/p2p/clipboard', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ text: clipboardInput.trim(), sender: 'Windows PC' }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setSyncedClipboard(data.item);
                      setClipboardInput('');
                    }
                  } catch (e) {
                    console.error('Failed to push clipboard:', e);
                  }
                }}
                className="h-8 px-4 rounded-full bg-[#FF9494] hover:bg-[#ff8585] text-xs font-bold text-[#3B2A2A] flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                <Send size={13} color="#3B2A2A" strokeWidth={2.4} className="-rotate-12" />
                <span>Push</span>
              </button>
            </div>
          </div>

          {/* Live Clipboard Feed */}
          <div className="flex flex-col gap-2.5 pt-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7A6363]">
              Live Clipboard Feed
            </span>

            {syncedClipboard ? (
              <div className="bg-[#FFE3E1]/70 rounded-2xl p-3.5 border border-[#FFD1D1]/60 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#7A6363]">
                    From <strong className="text-[#3B2A2A]">{syncedClipboard.sender || 'Device'}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFFFFF] text-[10px] font-bold text-[#7A6363]">
                    {syncedClipboard.type || 'Text'}
                  </span>
                </div>

                <div className="bg-[#FFFFFF] rounded-xl p-2.5 text-xs text-[#3B2A2A] break-all font-mono leading-relaxed border border-[#FFD1D1]/50 max-h-28 overflow-y-auto">
                  {syncedClipboard.text}
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(syncedClipboard.text);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="h-8 px-4 rounded-full bg-[#FFFFFF] hover:bg-[#FFE3E1] text-xs font-bold text-[#3B2A2A] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    {copiedLink ? (
                      <>
                        <Check size={14} color="#10B981" strokeWidth={2.6} />
                        <span className="text-[#10B981]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} color="#3B2A2A" strokeWidth={2.2} />
                        <span>Copy to clipboard</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#FFE3E1]/40 rounded-2xl p-6 border border-[#FFD1D1]/60 flex flex-col items-center justify-center text-center gap-1">
                <p className="text-xs font-bold text-[#3B2A2A]">No clipboard items synced yet</p>
                <p className="text-[11px] text-[#7A6363]">
                  Enter text above and click Push, or copy text on your phone.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Transfer History (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF]/85 backdrop-blur-sm rounded-3xl p-6 border border-[#FFD1D1]/70 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-[#3B2A2A]">Recent Transfer History</h3>
                <p className="text-xs text-[#7A6363] mt-0.5">Comprehensive local audit trail</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 bg-[#FFE3E1] p-1 rounded-full">
                {(['all', 'sent', 'received', 'failed'] as const).map((tab) => {
                  const isActive = activeHistoryTab === tab;
                  const labels = { all: 'All (18)', sent: 'Sent (12)', received: 'Received (6)', failed: 'Failed (0)' };
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveHistoryTab(tab)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FF9494] text-[#3B2A2A] shadow-sm'
                          : 'text-[#7A6363] hover:text-[#3B2A2A]'
                      }`}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table */}
            <div className="mt-4 flex flex-col divide-y divide-[#FFD1D1]/50">
              <div className="grid grid-cols-12 py-2 text-[11px] font-bold text-[#7A6363] uppercase tracking-wider px-2">
                <span className="col-span-5">File</span>
                <span className="col-span-2 text-right sm:text-left">Size</span>
                <span className="col-span-3 hidden sm:block">Device</span>
                <span className="col-span-2 text-right">Status</span>
              </div>

              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 py-3 items-center px-2 hover:bg-[#FFE3E1]/40 rounded-xl transition-colors"
                >
                  <div className="col-span-5 flex items-center gap-2.5 min-w-0 pr-2">
                    {item.type === 'image' && <ImageIcon size={16} color="#994345" strokeWidth={2.2} />}
                    {item.type === 'doc' && <FileSpreadsheet size={16} color="#994345" strokeWidth={2.2} />}
                    {item.type === 'archive' && <FolderArchive size={16} color="#994345" strokeWidth={2.2} />}
                    {item.type === 'audio' && <Film size={16} color="#994345" strokeWidth={2.2} />}
                    <span className="text-xs font-bold text-[#3B2A2A] truncate">{item.name}</span>
                  </div>

                  <span className="col-span-2 text-xs text-[#7A6363] text-right sm:text-left font-medium">
                    {item.size}
                  </span>

                  <span className="col-span-3 text-xs text-[#7A6363] hidden sm:block truncate">
                    {item.device}
                  </span>

                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.direction === 'sent'
                          ? 'bg-[#FFE3E1] text-[#994345]'
                          : 'bg-[#D1FAE5] text-[#065F46]'
                      }`}
                    >
                      {item.direction === 'sent' ? '↑ Sent' : '↓ Received'}
                    </span>
                    <Check size={14} color="#10B981" strokeWidth={2.6} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
