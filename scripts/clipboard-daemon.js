const { exec } = require('child_process');
const http = require('http');

let lastCopiedText = '';
let isChecking = false;

console.log('============================================================');
console.log('  AirDart Windows Auto-Clipboard Sync Daemon');
console.log('============================================================');
console.log('Status: ACTIVE');
console.log('Monitoring Windows OS Clipboard for Ctrl+C...');
console.log('Target: Local Mobile App on Wi-Fi (via AirDart Web)\n');

function checkClipboard() {
  if (isChecking) return;
  isChecking = true;

  exec(
    'powershell.exe -NoProfile -NonInteractive -Command "$v = Get-Clipboard -Raw; if ($v) { [Console]::Out.Write($v) }"',
    { windowsHide: true, maxBuffer: 1024 * 1024 * 2 },
    (error, stdout) => {
      isChecking = false;
      if (!error && stdout) {
        const text = stdout.trim();
        // Ignore if unchanged or empty or very long binary dumps
        if (text && text !== lastCopiedText && text.length < 50000) {
          lastCopiedText = text;
          syncToLocalMesh(text);
        }
      }
      setTimeout(checkClipboard, 700);
    }
  );
}

function syncToLocalMesh(text) {
  const payload = JSON.stringify({
    text,
    sender: 'Windows PC (Auto-Sync)',
  });

  const req = http.request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/p2p/clipboard',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    },
    (res) => {
      const preview = text.length > 55 ? text.substring(0, 52) + '...' : text.replace(/\r?\n/g, ' ');
      console.log(`[${new Date().toLocaleTimeString()}] Beamed to Phone: "${preview}"`);
    }
  );

  req.on('error', () => {
    // Server standby
  });

  req.write(payload);
  req.end();
}

checkClipboard();
