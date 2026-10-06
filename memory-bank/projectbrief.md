# Project Brief - AirDart Web

## Purpose and Scope
**AirDart Web** is the companion Next.js web application for the AirDart P2P high-speed cross-platform data sharing ecosystem.

It provides a zero-install, browser-based peer receiver and sender that runs on any desktop or mobile browser connected to the local Wi-Fi / Hotspot.

## Core Features
- **Zero-Install Web Receiver:** Anyone on the local network can open the web app (or scan the mobile app's QR code) to immediately receive or send files.
- **Direct WebRTC Data Channels:** Establishes direct P2P connections to mobile phones (`AirDart` Expo app) or other web browsers via native `RTCDataChannel`.
- **Zero Cloud Storage & Zero Data Cost:** Files transfer directly over the local network via 16KB/64KB binary chunks (`ArrayBuffer`) without touching any third-party servers.
- **Supabase Realtime Signaling:** Lightweight QR code handshake and ephemeral broadcast signaling for rapid peer discovery.
- **Shared Clipboard:** Real-time bi-directional clipboard sync between web browsers and mobile apps.
