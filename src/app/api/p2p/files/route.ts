import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export interface ReceivedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  senderName: string;
  senderIp: string;
  dataUrl: string; // Base64 data URL for instant browser preview and download
  timestamp: number;
  progress: number; // 0–100 (100 = fully received)
}

// Global in-memory storage for received files (Mobile → PC)
const globalForFiles = globalThis as unknown as {
  airdartFiles?: ReceivedFile[];
  airdartUploadProgress?: Record<string, number>; // sessionId → percent
};

const files = globalForFiles.airdartFiles || [];
if (!globalForFiles.airdartFiles) globalForFiles.airdartFiles = files;

const uploadProgress = globalForFiles.airdartUploadProgress || {};
if (!globalForFiles.airdartUploadProgress) globalForFiles.airdartUploadProgress = uploadProgress;

// GET /api/p2p/files - List all received files + in-progress sessions
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session');

  // If mobile polls for its own upload progress ack
  if (sessionId) {
    const progress = uploadProgress[sessionId] ?? -1;
    return NextResponse.json({ success: true, progress });
  }

  return NextResponse.json({
    success: true,
    files: [...files].reverse(), // newest first
    inProgress: Object.entries(uploadProgress).map(([id, progress]) => ({ id, progress })),
  });
}

// POST /api/p2p/files - Mobile uploads a file to PC (JSON base64 or multipart)
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let name = 'received_file';
    let size = 0;
    let type = 'application/octet-stream';
    let senderName = 'Mobile Device';
    let senderIp = '192.168.1.105';
    let dataUrl = '';
    let sessionId = `sess-${Date.now()}`;

    if (contentType.includes('application/json')) {
      const body = await request.json();
      name = body.name || 'received_file';
      size = body.size || 0;
      type = body.type || 'application/octet-stream';
      senderName = body.senderName || 'Mobile Phone';
      senderIp = body.senderIp || '192.168.1.105';
      sessionId = body.sessionId || sessionId;

      if (body.dataUrl) {
        dataUrl = body.dataUrl;
      } else if (body.base64) {
        dataUrl = `data:${type};base64,${body.base64}`;
      }
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      senderName = (formData.get('senderName') as string) || 'Mobile Phone';
      senderIp = (formData.get('senderIp') as string) || '192.168.1.105';
      sessionId = (formData.get('sessionId') as string) || sessionId;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file received in request' },
          { status: 400 }
        );
      }

      name = file.name || 'received_file';
      size = file.size;
      type = file.type || 'application/octet-stream';

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      dataUrl = `data:${type};base64,${buffer.toString('base64')}`;
    }

    if (!dataUrl) {
      return NextResponse.json(
        { success: false, error: 'File content missing or empty' },
        { status: 400 }
      );
    }

    // Mark upload as complete for this session
    uploadProgress[sessionId] = 100;

    const newFile: ReceivedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      size,
      type,
      senderName,
      senderIp,
      dataUrl,
      timestamp: Date.now(),
      progress: 100,
    };

    files.push(newFile);
    console.log(`[P2P Transfer] Received "${newFile.name}" (${newFile.size} bytes) from ${newFile.senderName}`);

    // Clean up old progress entries after 30s
    setTimeout(() => { delete uploadProgress[sessionId]; }, 30_000);

    return NextResponse.json({
      success: true,
      message: 'File received successfully!',
      sessionId,
      file: {
        id: newFile.id,
        name: newFile.name,
        size: newFile.size,
        type: newFile.type,
        senderName: newFile.senderName,
        timestamp: newFile.timestamp,
        progress: 100,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process file upload' },
      { status: 500 }
    );
  }
}

// PATCH /api/p2p/files - Mobile reports chunked upload progress (0–99)
export async function PATCH(request: Request) {
  try {
    const { sessionId, progress } = await request.json();
    if (sessionId && typeof progress === 'number') {
      uploadProgress[sessionId] = Math.min(progress, 99); // 100 only on POST complete
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// DELETE /api/p2p/files - Clear transfer history
export async function DELETE() {
  files.length = 0;
  return NextResponse.json({ success: true, message: 'All files cleared' });
}
