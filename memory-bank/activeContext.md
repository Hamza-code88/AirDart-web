# Active Context - AirDart Web

## Current State
- **Outbox Large-File & Video Streaming:**
  - `DevicesView.tsx` queues outgoing files using `FormData` and `XMLHttpRequest.upload.onprogress`, supporting unlimited file sizes (large videos, photos, archives) without Next.js JSON body size limit (413 Payload Too Large) errors.
  - Added binary streaming endpoint `GET /api/p2p/outbox?id=...&download=true` so connected mobile devices can download video files directly to disk.
  - Dual live progress bars in `DevicesView.tsx`: Coral progress bar for PC file upload to station outbox, plus emerald green progress bar tracking the mobile phone's real-time download progress.
- **Port-Aware P2P Discovery & QR Pairing:**
  - `/api/p2p/heartbeat` and `/api/p2p/handshake` dynamically extract and return `pcPort` from incoming host header.
  - `QrModal.tsx` and `ZeroInstallPairingView.tsx` generate QR code payloads with the active browser port (`window.location.port || '3000'`) and PC Wi-Fi IP (`192.168.1.8`).
  - Active port badge displayed on PC UI: `Phone Connected • [PORT: 3000]` along with local station address `http://192.168.1.8:3000`.

## Recent Major Updates & Architectural Decisions
1. **Multi-Part Streaming Outbox:** Replaced base64 JSON payload with multipart FormData upload to prevent browser memory spikes and 413 errors on videos.
2. **Dynamic Port Negotiation:** Removed hardcoded port 3000 assumptions so PC web app works seamlessly on port 3000, 3001, or Electron desktop shells.
3. **AirGrab Concept:** PC webcam gesture tracking will trigger file grab on fist gesture, streaming to paired mobile.

## Next Steps
- Implement PC webcam gesture tracking (MediaPipe Hand Landmarks) for PC AirGrab gesture trigger.
- Maintain Memory Bank synchronization with every implementation step.
