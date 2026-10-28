# AirDart-web — Zero-Install Web & Desktop Client for AirDart

AirDart-web is the PC side of AirDart. Open it in a browser or as a desktop app and transfer unlimited files — and sync clipboards — with your phone over your local LAN, with zero cloud bandwidth.

> Status: **In active development.** Companion app: [Hamza-code88/AirDart-App](https://github.com/Hamza-code88/AirDart-App) (React Native mobile client).

## What it does

- **PC ↔ phone file transfer** over LAN — no internet, no cloud, no cable
- **Zero-install web client** — open it in the browser, no signup
- **Clipboard sync** with the phone (via the clipboard daemon)
- **Desktop app** via Electron

## How it works

```
PC (Next.js + Electron)  ⇄  LAN (HTTP, port 3000)  ⇄  Phone (AirDart-App)
```

- The web client serves the local API the phone talks to, including `/api/p2p/heartbeat` and `/api/p2p/outbox`.
- Phone and PC must be on the **same Wi-Fi network**.

## Tech stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- Electron (desktop build)
- Node clipboard daemon (`scripts/clipboard-daemon.js`)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — the dev server listens on `0.0.0.0` so other devices on your LAN can reach it.

Desktop app:

```bash
npm run desktop
```

Clipboard daemon:

```bash
npm run sync:clipboard
```

## Screenshots / Demo

<!-- Add 4–5 screenshots here, plus a 30-second screen recording of a phone → PC transfer -->

## Project structure

```
app/                     # Next.js app (pages + /api/p2p routes)
electron/                # Desktop shell (main.js)
scripts/                 # Clipboard daemon
```

## Roadmap

- [ ] Transfer progress + resume after a dropped connection
- [ ] Full LAN discovery (no manual IP entry)
- [ ] Packaged desktop release

## Author

Hamza Khan — Full-Stack Developer (Next.js, React Native, Supabase)
Portfolio: https://www.hamzacode88.com/ · GitHub: https://github.com/Hamza-code88
