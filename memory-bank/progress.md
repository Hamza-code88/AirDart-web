# Progress - AirDart Web

## Completed Features
- [x] Initialized Next.js 16 project `airdart-web` with App Router, TypeScript, and Tailwind CSS.
- [x] Extracted and analyzed UI design pack `web airdart_p2p_file_sharing.zip` (3 views + `DESIGN.md`).
- [x] Installed `lucide-react` icons.
- [x] Fixed Turbopack PostCSS CSS parsing error (`@import url` conflict with `@import "tailwindcss"`).
- [x] Cleanly linked Google Fonts `Plus Jakarta Sans` & `Inter` in `layout.tsx` with offline system fallbacks.
- [x] Built Sidebar navigation component ([Sidebar.tsx](file:///d:/react%20projs/cv%20projects/airdart-web/src/components/Sidebar.tsx)).
- [x] Built Header component with local Wi-Fi IP and security badges ([Header.tsx](file:///d:/react%20projs/cv%20projects/airdart-web/src/components/Header.tsx)).
- [x] Built **View 1: Devices & Live P2P Sharing** ([DevicesView.tsx](file:///d:/react%20projs/cv%20projects/airdart-web/src/components/views/DevicesView.tsx)).
- [x] Built **View 2: Transfers & Shared Hub** ([TransfersHubView.tsx](file:///d:/react%20projs/cv%20projects/airdart-web/src/components/views/TransfersHubView.tsx)).
- [x] Built **View 3: Zero-Install Pairing** ([ZeroInstallPairingView.tsx](file:///d:/react%20projs/cv%20projects/airdart-web/src/components/views/ZeroInstallPairingView.tsx)).
- [x] Built Zero-Install Pairing Modal ([QrModal.tsx](file:///d:/react%20projs/cv%20projects/airdart-web/src/components/modals/QrModal.tsx)).
- [x] Integrated all views in [page.tsx](file:///d:/react%20projs/cv%20projects/airdart-web/src/app/page.tsx) with interactive state switching.
- [x] Verified zero TypeScript compilation errors (`npx tsc --noEmit` Exit Code 0).

- [x] **P2P Outbox Streaming & Dual Real-Time Progress Bars:**
  - Implemented `FormData` + `XMLHttpRequest` file queueing in `DevicesView.tsx` with upload progress.
  - Implemented direct binary stream endpoint `GET /api/p2p/outbox?id=...&download=true` for video and large file downloads.
  - Dual live progress bars: PC encoding bar (coral) + Mobile download bar (green) polling real `mobileProgress`.
- [x] **Dynamic Port & IP Discovery:**
  - `/api/p2p/heartbeat` & `/api/p2p/handshake` return `pcPort` from host headers.
  - `QrModal.tsx` and `ZeroInstallPairingView.tsx` generate QR codes using active browser port.
  - `DevicesView.tsx` displays active connected port (`PORT: 3000`) and station address `http://192.168.1.8:3000`.

## Remaining Roadmap Items
- [ ] Implement PC webcam gesture tracking (MediaPipe Hand Landmarks) for PC AirGrab gesture trigger.
- [ ] Connect Electron desktop shell bindings for offline background sync.
- [ ] (Awaiting user permission) Build production release when requested.
