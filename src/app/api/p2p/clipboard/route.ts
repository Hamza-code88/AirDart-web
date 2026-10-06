import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export interface ClipboardItem {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  type: 'link' | 'snippet' | 'note';
}

const globalForClipboard = globalThis as unknown as {
  airdartClipboard?: ClipboardItem[];
};

const clipboardItems = globalForClipboard.airdartClipboard || [];
if (!globalForClipboard.airdartClipboard) {
  globalForClipboard.airdartClipboard = clipboardItems;
}

function detectType(text: string): 'link' | 'snippet' | 'note' {
  const trimmed = text.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return 'link';
  }
  if (trimmed.includes('\n') || trimmed.length > 80 || trimmed.includes('{') || trimmed.includes('=')) {
    return 'snippet';
  }
  return 'note';
}

// GET /api/p2p/clipboard - Fetch synchronized clipboard items
export async function GET() {
  return NextResponse.json({
    success: true,
    items: [...clipboardItems].reverse(),
    latest: clipboardItems.length > 0 ? clipboardItems[clipboardItems.length - 1] : null,
  });
}

// POST /api/p2p/clipboard - Broadcast new copied text
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ success: false, error: 'Text cannot be empty' }, { status: 400 });
    }

    const item: ClipboardItem = {
      id: `clip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      text,
      sender: body.sender || 'Local Device',
      timestamp: Date.now(),
      type: detectType(text),
    };

    clipboardItems.push(item);
    if (clipboardItems.length > 50) {
      clipboardItems.shift();
    }

    return NextResponse.json({
      success: true,
      item,
      message: 'Clipboard synchronized across local mesh',
    });
  } catch (error) {
    console.error('Clipboard sync error:', error);
    return NextResponse.json({ success: false, error: 'Failed to sync clipboard' }, { status: 500 });
  }
}
