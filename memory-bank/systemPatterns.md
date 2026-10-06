# System Patterns - AirDart Web

## Architecture Overview
- **Framework:** Next.js 16 (App Router), React 19, Tailwind CSS v4.
- **WebRTC Stack:** Standard Web APIs (`window.RTCPeerConnection`, `window.RTCDataChannel`).
- **Binary Streaming:** `ArrayBuffer` chunk reader and writer with backpressure control (`bufferedAmountLowThreshold` on `RTCDataChannel`).
- **Signaling Layer:** Supabase Realtime broadcast channels for ephemeral SDP offer/answer exchange and ICE candidate trickle.
- **File Assembly:** Stream chunks directly into Blobs / `URL.createObjectURL` or `FileSystemWritableFileStream` (File System Access API).
