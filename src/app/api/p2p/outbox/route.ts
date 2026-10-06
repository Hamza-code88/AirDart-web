import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export interface OutboxFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  base64?: string;
  senderName: string;
  targetDevice: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: number;
}

// Global in-memory storage for PC to Mobile outbox transfers
const globalForOutbox = globalThis as unknown as {
  airdartOutbox?: OutboxFile[];
};

const outbox = globalForOutbox.airdartOutbox || [];
if (!globalForOutbox.airdartOutbox) {
  globalForOutbox.airdartOutbox = outbox;
}

// GET /api/p2p/outbox - Fast lightweight metadata polling & dedicated on-demand content download
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');
  const needContent = searchParams.get('content') === 'true';

  if (fileId && needContent) {
    const file = outbox.find((f) => f.id === fileId);
    if (!file) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      id: file.id,
      name: file.name,
      base64: file.base64 || (file.dataUrl.includes('base64,') ? file.dataUrl.split('base64,')[1] : ''),
      dataUrl: file.dataUrl,
    });
  }

  // Lightweight metadata list for fast sub-millisecond polling!
  const pendingFiles = outbox
    .filter((f) => f.status === 'pending')
    .map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      type: f.type,
      senderName: f.senderName,
      targetDevice: f.targetDevice,
      status: f.status,
      timestamp: f.timestamp,
      dataUrl: f.size < 150 * 1024 ? f.dataUrl : undefined,
    }));

  return NextResponse.json({
    success: true,
    files: pendingFiles,
    allFiles: outbox.slice(-10).map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      type: f.type,
      senderName: f.senderName,
      targetDevice: f.targetDevice,
      status: f.status,
      timestamp: f.timestamp,
    })),
  });
}

// POST /api/p2p/outbox - PC pushes a file to send to mobile
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let name = 'pc_file';
    let size = 0;
    let type = 'application/octet-stream';
    let dataUrl = '';
    let base64 = '';
    let targetDevice = 'Mobile Phone';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      name = body.name || 'pc_file';
      size = body.size || 0;
      type = body.type || 'application/octet-stream';
      targetDevice = body.targetDevice || 'Mobile Phone';
      dataUrl = body.dataUrl || (body.base64 ? `data:${type};base64,${body.base64}` : '');
      base64 = body.base64 || (dataUrl.includes('base64,') ? dataUrl.split('base64,')[1] : '');
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      targetDevice = (formData.get('targetDevice') as string) || 'Mobile Phone';

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file received in request' },
          { status: 400 }
        );
      }

      name = file.name || 'pc_file';
      size = file.size;
      type = file.type || 'application/octet-stream';

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64 = buffer.toString('base64');
      dataUrl = `data:${type};base64,${base64}`;
    }

    if (!dataUrl) {
      return NextResponse.json(
        { success: false, error: 'File content missing or empty' },
        { status: 400 }
      );
    }

    // Sanitize image extensions (convert Windows .jfif / .jflf to standard .jpg)
    name = (name || 'pc_file').replace(/\.(jfif|jflf)$/i, '.jpg');
    if ((type?.includes('jpeg') || type?.includes('jpg')) && !name.match(/\.(jpg|jpeg)$/i)) {
      name = `${name.replace(/\.[^.]+$/, '')}.jpg`;
    }

    const newOutboxItem: OutboxFile = {
      id: `out-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      size,
      type,
      dataUrl,
      base64,
      senderName: 'AirDart PC Station',
      targetDevice,
      status: 'pending',
      timestamp: Date.now(),
    };

    outbox.unshift(newOutboxItem);
    console.log(`[P2P Outbox] PC queued file "${newOutboxItem.name}" for mobile (${newOutboxItem.size} bytes)`);

    return NextResponse.json({
      success: true,
      message: 'File queued for mobile download',
      file: newOutboxItem,
    });
  } catch (error) {
    console.error('Outbox upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process outbox upload' },
      { status: 500 }
    );
  }
}

// PATCH /api/p2p/outbox - Mobile acknowledges receipt or acceptance of file
export async function PATCH(request: Request) {
  try {
    const { id, status = 'accepted' } = await request.json();
    const item = outbox.find((f) => f.id === id);
    if (item) {
      item.status = status;
    }
    return NextResponse.json({ success: true, updated: item });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update outbox' }, { status: 500 });
  }
}
