import os from 'os';

export function getRealLocalIpv4(): { ip: string; iface: string; all: { iface: string; ip: string }[] } {
  try {
    const interfaces = os.networkInterfaces();
    const validAddresses: { iface: string; ip: string; isWifi: boolean }[] = [];

    const isVirtual = (name: string, ip: string) => {
      const virtualKeywords = [
        'virtual',
        'vbox',
        'vmware',
        'wsl',
        'hyper-v',
        'vethernet',
        'tailscale',
        'zerotier',
        'loopback',
        'docker',
        'npcap',
        'tap',
        'teredo',
        'pseudo',
        'isatap',
        'bridge',
      ];
      const lowerName = name.toLowerCase();
      if (virtualKeywords.some((kw) => lowerName.includes(kw))) return true;

      // Exclude loopback, link-local, and VirtualBox default host-only network
      if (ip.startsWith('127.') || ip.startsWith('169.254.') || ip.startsWith('192.168.56.')) {
        return true;
      }
      return false;
    };

    for (const [name, addrs] of Object.entries(interfaces)) {
      if (!addrs) continue;
      for (const addr of addrs) {
        if (addr.family === 'IPv4' && !addr.internal) {
          if (!isVirtual(name, addr.address)) {
            const isWifi = /wi-?fi|wlan|wireless/i.test(name);
            validAddresses.push({ iface: name, ip: addr.address, isWifi });
          }
        }
      }
    }

    // Sort: Wi-Fi first, then Ethernet, then others
    validAddresses.sort((a, b) => {
      if (a.isWifi && !b.isWifi) return -1;
      if (!a.isWifi && b.isWifi) return 1;
      return 0;
    });

    if (validAddresses.length > 0) {
      return {
        ip: validAddresses[0].ip,
        iface: validAddresses[0].iface,
        all: validAddresses.map((v) => ({ iface: v.iface, ip: v.ip })),
      };
    }

    // Fallback: search for first non-internal non-loopback IPv4
    for (const [name, addrs] of Object.entries(interfaces)) {
      if (!addrs) continue;
      for (const addr of addrs) {
        if (addr.family === 'IPv4' && !addr.internal && !addr.address.startsWith('127.')) {
          return { ip: addr.address, iface: name, all: [{ iface: name, ip: addr.address }] };
        }
      }
    }
  } catch {}

  return { ip: '127.0.0.1', iface: 'localhost', all: [] };
}
