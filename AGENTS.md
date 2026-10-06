# AI Agent Instructions - AirDart Web

**CRITICAL INSTRUCTIONS FOR ALL AI SESSIONS:**

1. **Read the Memory Bank:** Before beginning any task, you MUST read all markdown files located in the `memory-bank/` directory (`projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, `activeContext.md`, `progress.md`). This ensures you understand the project's purpose, architecture, and current active context.
2. **Update the Memory Bank:** After completing ANY task (feature addition, bug fix, architectural change), you MUST update `memory-bank/progress.md` and `memory-bank/activeContext.md` to reflect your changes. If your work affects architecture or dependencies, update `systemPatterns.md` and `techContext.md` accordingly.
3. **Do not guess context:** Base your understanding strictly on the codebase and the `memory-bank`. If something is unclear, investigate using filesystem tools before making assumptions.

---

## ⚠️ ABSOLUTE MANDATORY RULE: NO BUILDS WITHOUT USER PERMISSION
> **BUILD CHALANA MERY IJAZAT K BAGIR NAI KARO GY. JAB MA BOLONGA TAB BUILD CHALAO GY.**
> 
> Under **NO circumstances** should you run any build command (`next build`, `npm run build`, etc.) on your own.
> Only run builds when the USER explicitly instructs you in the prompt to run a build.

---

## Next.js Best Practices
- This is a Next.js 16 App Router application.
- All code resides under `src/app/`, `src/components/`, `src/lib/`.
- Prioritize high-performance, memory-safe WebRTC DataChannel streaming and native Web APIs.
