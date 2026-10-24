import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ConnectedPeer {
  id: string;
  name: string;
  model: string;
  ip: string;
  deviceType: 'phone' | 'tablet' | 'laptop';
  lastSeen: number;
  status: 'connected' | 'idle';
}

const globalForHeartbeat = globalThis as unknown as {
  airdartActiveClient?: ConnectedPeer | null;
};

let activeClient = globalForHeartbeat.airdartActiveClient || null;
if (globalForHeartbeat.airdartActiveClient === undefined) {
  globalForHeartbeat.airdartActiveClient = activeClient;
}

import os from 'os';

function getLocalIp(): string {
  try {
    const interfaces = os.networkInterfaces();
    for (const [, addrs] of Object.entries(interfaces)) {
      if (!addrs) continue;
      for (const addr of addrs) {
        if (addr.family === 'IPv4' && !addr.internal) {
          if (addr.address.startsWith('192.168.') || addr.address.startsWith('10.') || addr.address.startsWith('172.')) {
            return addr.address;
          }
        }
      }
    }
  } catch {}
  return '192.168.1.7';
}

function getPortFromRequest(request: Request): number {
  try {
    const host = request.headers.get('host') || '';
    if (host.includes(':')) {
      const p = parseInt(host.split(':')[1]);
      if (!isNaN(p)) return p;
    }
  } catch {}
  return 3000;
}

// Helper to keep connection alive when any P2P activity occurs (uploads, outbox, etc.)
export function touchHeartbeat(ip?: string, name?: string) {
  if (globalForHeartbeat.airdartActiveClient) {
    globalForHeartbeat.airdartActiveClient.lastSeen = Date.now();
    globalForHeartbeat.airdartActiveClient.status = 'connected';
    if (ip) globalForHeartbeat.airdartActiveClient.ip = ip;
    if (name) globalForHeartbeat.airdartActiveClient.name = name;
  }
}

// GET /api/p2p/heartbeat - Used by PC Web UI to check if mobile phone is currently active
export async function GET(request: Request) {
  const current = globalForHeartbeat.airdartActiveClient;
  // If phone hasn't pinged within 30 seconds, mark as offline/disconnected (tolerant during large transfers)
  const isAlive = current && (Date.now() - current.lastSeen < 30000);
  const realIp = getLocalIp();
  const pcPort = getPortFromRequest(request);

  return NextResponse.json({
    success: true,
    pcName: 'Windows PC (AirDart Web)',
    pcIp: realIp,
    pcPort,
    isConnected: !!isAlive,
    peer: isAlive ? current : null,
    timestamp: Date.now(),
  });
}

// POST /api/p2p/heartbeat - Sent every 2-3s by mobile app to maintain real-time mesh presence
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phoneName = body.name || body.phoneName || 'AirDart Mobile Phone';
    const model = body.model || 'Android / iOS';
    const ip = body.ip || body.phoneIp || '192.168.1.105';
    const pcPort = getPortFromRequest(request);

    const client: ConnectedPeer = {
      id: body.id || 'peer-phone',
      name: phoneName,
      model,
      ip,
      deviceType: 'phone',
      lastSeen: Date.now(),
      status: 'connected',
    };

    globalForHeartbeat.airdartActiveClient = client;

    return NextResponse.json({
      success: true,
      status: 'connected',
      pcName: 'Windows PC (AirDart Web)',
      pcIp: getLocalIp(),
      pcPort,
      message: 'Heartbeat acknowledged. Real-time mesh channel is active.',
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid heartbeat payload' },
      { status: 400 }
    );
  }
}

// DELETE /api/p2p/heartbeat - Disconnect peer
export async function DELETE() {
  globalForHeartbeat.airdartActiveClient = null;
  return NextResponse.json({ success: true, message: 'Disconnected' });
}
