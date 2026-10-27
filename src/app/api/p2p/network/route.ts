import { NextResponse } from 'next/server';
import { getRealLocalIpv4 } from '@/lib/networkUtils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const net = getRealLocalIpv4();
    return NextResponse.json({
      success: true,
      primaryIp: net.ip,
      iface: net.iface,
      allAddresses: net.all,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      primaryIp: '127.0.0.1',
      iface: 'unknown',
      allAddresses: [],
    });
  }
}
