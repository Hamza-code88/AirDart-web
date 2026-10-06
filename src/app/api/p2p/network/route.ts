import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  try {
    const interfaces = os.networkInterfaces();
    const addresses: { iface: string; ip: string }[] = [];

    for (const [name, addrs] of Object.entries(interfaces)) {
      if (!addrs) continue;
      for (const addr of addrs) {
        // Look for IPv4 non-internal addresses
        if (addr.family === 'IPv4' && !addr.internal) {
          addresses.push({ iface: name, ip: addr.address });
        }
      }
    }

    // Prioritize Wi-Fi / WLAN or first non-internal interface
    const primary =
      addresses.find((a) => /wi-?fi|wlan|wireless/i.test(a.iface)) ||
      addresses.find((a) => /ethernet|eth/i.test(a.iface)) ||
      addresses[0] || { iface: 'localhost', ip: '127.0.0.1' };

    return NextResponse.json({
      success: true,
      primaryIp: primary.ip,
      iface: primary.iface,
      allAddresses: addresses,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      primaryIp: '127.0.0.1',
      allAddresses: [],
    });
  }
}
