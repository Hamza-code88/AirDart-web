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
}

// Global in-memory storage for transferred files across dev reloads
const globalForFiles = globalThis as unknown as {
  airdartFiles?: ReceivedFile[];
};

const files = globalForFiles.airdartFiles || [];
if (!globalForFiles.airdartFiles) {
  globalForFiles.airdartFiles = files;
}

// GET /api/p2p/files - List all received files
export async function GET() {
  return NextResponse.json({
    success: true,
    files: [...files].reverse(), // newest first
  });
}

// POST /api/p2p/files - Upload file from mobile phone (supports JSON Base64 and FormData)
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let name = 'received_file';
    let size = 0;
    let type = 'application/octet-stream';
    let senderName = 'Mobile Device';
    let senderIp = '192.168.1.105';
    let dataUrl = '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      name = body.name || 'received_file';
      size = body.size || 0;
      type = body.type || 'application/octet-stream';
      senderName = body.senderName || 'Mobile Phone';
      senderIp = body.senderIp || '192.168.1.105';

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

    const newFile: ReceivedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      size,
      type,
      senderName,
      senderIp,
      dataUrl,
      timestamp: Date.now(),
    };

    files.push(newFile);
    console.log(`[P2P Transfer] Received file "${newFile.name}" (${newFile.size} bytes) from ${newFile.senderName}`);

    return NextResponse.json({
      success: true,
      message: 'File received successfully!',
      file: {
        id: newFile.id,
        name: newFile.name,
        size: newFile.size,
        type: newFile.type,
        senderName: newFile.senderName,
        timestamp: newFile.timestamp,
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

// DELETE /api/p2p/files - Clear transfer history
export async function DELETE() {
  files.length = 0;
  return NextResponse.json({ success: true, message: 'All files cleared' });
}
