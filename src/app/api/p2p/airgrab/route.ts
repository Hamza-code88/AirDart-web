import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface StagedAirGrab {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  stagedAt: number;
  status: 'staged' | 'beaming' | 'caught';
  source: string;
}

const globalForAirGrab = globalThis as unknown as {
  airdartStagedGrab?: StagedAirGrab | null;
};

if (globalForAirGrab.airdartStagedGrab === undefined) {
  globalForAirGrab.airdartStagedGrab = null;
}

// GET /api/p2p/airgrab - Check if a photo is currently "floating in the air" ready to be caught
export async function GET() {
  const current = globalForAirGrab.airdartStagedGrab;
  // If older than 45 seconds, expire the staged grab
  if (current && Date.now() - current.stagedAt > 45000) {
    globalForAirGrab.airdartStagedGrab = null;
  }

  return NextResponse.json({
    success: true,
    hasStagedPhoto: !!globalForAirGrab.airdartStagedGrab,
    photo: globalForAirGrab.airdartStagedGrab,
    timestamp: Date.now(),
  });
}

// POST /api/p2p/airgrab - Triggered when PC user clenches fist (✊ Grab) in front of preview
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, size, type, dataUrl, source } = body;

    if (!dataUrl) {
      return NextResponse.json({ success: false, error: 'No image data provided' }, { status: 400 });
    }

    const staged: StagedAirGrab = {
      id: `airgrab-${Date.now()}`,
      name: name || 'airgrab_photo.jpg',
      size: size || 0,
      type: type || 'image/jpeg',
      dataUrl,
      stagedAt: Date.now(),
      status: 'staged',
      source: source || 'Windows PC (AirGrab Gesture)',
    };

    globalForAirGrab.airdartStagedGrab = staged;

    console.log(`[AirGrab ⚡] Fist Clenched! Photo "${staged.name}" is now floating in air ready to catch.`);

    return NextResponse.json({
      success: true,
      message: 'Photo grabbed! AirGrab mesh channel armed.',
      photo: {
        id: staged.id,
        name: staged.name,
        size: staged.size,
        type: staged.type,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to stage AirGrab' }, { status: 500 });
  }
}

// DELETE /api/p2p/airgrab - Triggered when mobile user catches photo (🖐️ Open Palm)
export async function DELETE() {
  globalForAirGrab.airdartStagedGrab = null;
  return NextResponse.json({ success: true, message: 'AirGrab dropped & completed' });
}
