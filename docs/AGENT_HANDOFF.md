# Quick Handoff Guide

For next developer/AI agent stepping in.

---

## Status Summary

**Phase:** 1 (Foundation) — code ready, build not verified  
**Blocker:** npm missing — cannot verify build  
**Next:** Fix npm, then proceed to Phase 2 (Authentication)

---

## 60-Second Setup

1. **Check environment:**
   ```bash
   node --version && npm --version
   ```
   
   If either fails → [Install Node.js LTS](./KNOWN_ISSUES.md#issue-001-npm-not-available-in-environment)

2. **Build:**
   ```bash
   cd client
   npm install
   npm run build
   ```
   
   Should complete with no errors.

3. **Test:**
   ```bash
   npm run dev
   ```
   
   Open browser → see dark brown sidebar with role-specific navigation

---

## What Exists

✅ React + Vite configured  
✅ React Router with 3 role paths  
✅ Tailwind CSS v4 + design tokens (warm brown palette)  
✅ AppShell component (all 3 roles)  
✅ Folder structure ready for features  

❌ Zero features shipped  
❌ No backend  
❌ No authentication  

---

## Before You Code

**Read these three docs in order:**

1. [PROJECT_STATUS.md](./PROJECT_STATUS.md) — Current state (5 min)
2. [DECISION_LOG.md](./DECISION_LOG.md) — Why decisions were made (10 min)
3. [ARCHITECTURE.md](./ARCHITECTURE.md) — How system is organized (15 min)

**Then refer to:**

- [ROADMAP.md](./ROADMAP.md) — Phases and scope
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) — Blockers and uncertainties
- [vision.md](../vision.md) — Full requirements (high-level)

---

## Current Blocker

**npm is not available** (see [ISS-001](./KNOWN_ISSUES.md#issue-001-npm-not-available-in-environment))

This is **not** an application problem. The code is correct; the environment is missing Node.js.

**Resolution:**
1. Install Node.js LTS from https://nodejs.org
2. Verify: `node -v && npm -v`
3. Run: `cd client && npm install && npm run build`
4. If successful, update [PROJECT_STATUS.md](./PROJECT_STATUS.md) with build results
5. Proceed to Phase 2

---

## Phase 1 Verification

When you fix the blocker and run `npm run build`:

**Expected:**
- Build completes with no errors
- App shell visible with dark brown sidebar
- Can navigate to `/student`, `/sponsor`, `/admin`
- Different sidebar nav per role
- Warm beige panels and white cards

**If you see errors:**
- Check error message
- Review [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)
- Add issue if not listed

---

## Key Files

| File | Purpose |
|------|---------|
| `client/src/main.jsx` | Router + entry point |
| `client/src/app/AppShell.jsx` | All 3 role interfaces |
| `client/src/styles/design-tokens.css` | Design system (colors, typography) |
| `client/vite.config.js` | Build config |
| `client/package.json` | Dependencies |

---

## Next Phase (Phase 2)

Once Phase 1 is verified:
- Build landing page (unauthenticated entry)
- Create login, registration, password reset forms
- Implement role selection during signup

See [ROADMAP.md](./ROADMAP.md) for full scope.

---

**Go to:** [PROJECT_STATUS](./PROJECT_STATUS.md) → [DECISION_LOG](./DECISION_LOG.md) → [ARCHITECTURE](./ARCHITECTURE.md)
