import { NextResponse } from 'next/server';

// In-memory session registry for local offline pairing handshakes
interface PairingSession {
  sessionId: string;
  pin: string;
  pcName: string;
  status: 'waiting' | 'paired' | 'rejected';
  phone?: {
    name: string;
    ip: string;
    deviceType: string;
    pairedAt: number;
  };
  createdAt: number;
}

// Global store across hot reloads in dev
const globalForSessions = globalThis as unknown as {
  airdartSessions?: Map<string, PairingSession>;
};

const sessions = globalForSessions.airdartSessions || new Map<string, PairingSession>();
if (!globalForSessions.airdartSessions) {
  globalForSessions.airdartSessions = sessions;
}

// Default session for instant pairing
if (!sessions.has('DART-8492')) {
  sessions.set('DART-8492', {
    sessionId: 'DART-8492',
    pin: '839412',
    pcName: 'MacBook Pro',
    status: 'waiting',
    createdAt: Date.now(),
  });
}

// GET /api/p2p/handshake?sessionId=DART-8492
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId') || 'DART-8492';

  let session = sessions.get(sessionId);
  if (!session) {
    session = {
      sessionId,
      pin: '839412',
      pcName: 'MacBook Pro',
      status: 'waiting',
      createdAt: Date.now(),
    };
    sessions.set(sessionId, session);
  }

  return NextResponse.json({
    success: true,
    sessionId: session.sessionId,
    status: session.status,
    phone: session.phone || null,
  });
}

// POST /api/p2p/handshake
// Invoked by mobile phone after scanning QR code or entering PIN
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sessionId = 'DART-8492',
      pin,
      phoneName = 'Mobile Device',
      phoneIp = '127.0.0.1',
      deviceType = 'mobile',
    } = body;

    let session = sessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        pin: pin || '839412',
        pcName: 'MacBook Pro',
        status: 'waiting',
        createdAt: Date.now(),
      };
      sessions.set(sessionId, session);
    }

    // Verify PIN if provided
    if (pin && session.pin && pin !== session.pin) {
      return NextResponse.json(
        { success: false, error: 'Invalid pairing PIN' },
        { status: 400 }
      );
    }

    // Confirm Handshake
    session.status = 'paired';
    session.phone = {
      name: phoneName,
      ip: phoneIp,
      deviceType,
      pairedAt: Date.now(),
    };

    (globalThis as any).airdartActiveClient = {
      id: 'peer-phone',
      name: phoneName,
      model: deviceType,
      ip: phoneIp,
      deviceType: 'phone',
      lastSeen: Date.now(),
      status: 'connected',
    };

    let pcPort = 3000;
    try {
      const host = request.headers.get('host') || '';
      if (host.includes(':')) {
        const p = parseInt(host.split(':')[1]);
        if (!isNaN(p)) pcPort = p;
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Handshake completed successfully!',
      status: 'paired',
      pcName: 'Windows PC (AirDart Web)',
      pcPort,
      phone: session.phone,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process handshake request' },
      { status: 500 }
    );
  }
}
