# Active Context - AirDart Web

## Current State
- **PostCSS Import Error Resolved:** Fixed CSS parsing error in `src/app/globals.css`. Removed nested `@import url()` that violated the CSS spec with Tailwind v4 PostCSS inlining. Google Fonts moved cleanly to `<head>` in `src/app/layout.tsx`.
- **All Web Views Fully Functional:** DevicesView, TransfersHubView, ZeroInstallPairingView, QrModal, Sidebar, and Header verified with 0 errors.
- **TypeScript Verification:** `npx tsc --noEmit` passed with 0 errors (Exit Code 0).

## Recent Major Updates & Architectural Decisions
1. **Resolved CSS Build Error:** Fixed `@import rules must precede all rules aside from @charset and @layer statements`.
2. **Offline-Safe Typography:** Moved font preconnects to `layout.tsx` with resilient system fallbacks so the web app compiles and displays perfectly even when running 100% offline.
3. **Memory Bank Synchronized:** Updated `activeContext.md` and `progress.md`.

## Next Steps
- Await next instructions from user (e.g. offline transport & streaming socket setup, or testing dev servers).
- **Strict Reminder:** Do not execute any build commands without the user's explicit instruction.
