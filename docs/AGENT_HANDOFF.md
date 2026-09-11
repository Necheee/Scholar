# Quick Handoff Guide

For next developer/AI agent stepping in.

---

## Status Summary

**Phase:** 6 (Integration & Workflows) — Next up  
**Blocker:** None  
**Next:** Plan the backend architecture and begin connecting the frontend UI mocks to real API endpoints.

---

## 60-Second Setup

1. **Check environment:**

   ```bash
   node --version && npm --version
   ```

   _Note: In this Windows PowerShell environment, you MUST use `npm.cmd` instead of `npm` to bypass execution policies._

2. **Build:**

   ```bash
   cd client
   npm.cmd install
   npm.cmd run build
   ```

   Should complete with no errors.

3. **Test:**

   ```bash
   npm.cmd run dev
   ```

   Open browser → see the application. Role state is persisted in localStorage.

---

## What Exists

✅ React + Vite configured  
✅ React Router with 3 role paths flattened correctly  
✅ Custom CSS design tokens (warm brown/beige palette) strictly used for dashboards  
✅ AppShell component (all 3 roles)  
✅ **Student UI Mocked:** Dashboard, 5-step Application Wizard, History  
✅ **Sponsor UI Mocked:** Dashboard, Opportunities, Application Review  
✅ **Admin UI Mocked:** Dashboard, Flagged Applications Fraud Review  
✅ Build completely verified via `npm.cmd`

❌ No backend / database  
❌ Real authentication is not implemented (currently just mocked via localStorage)  
❌ Real-time backend integration

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

## Current Blockers

**None.**
The previous blocker regarding `npm` not being available has been resolved by using `npm.cmd` in PowerShell.

---

## Key Files

| File                                  | Purpose                                                                                |
| ------------------------------------- | -------------------------------------------------------------------------------------- |
| `client/src/main.jsx`                 | Router + entry point                                                                   |
| `client/src/app/AppShell.jsx`         | All 3 role interfaces                                                                  |
| `client/src/styles/design-tokens.css` | Design system (colors, typography). **MANDATORY** for dashboard layouts (see DEC-026). |
| `client/vite.config.js`               | Build config                                                                           |
| `client/package.json`                 | Dependencies                                                                           |

---

## Next Phase (Phase 6: Integration & Workflows)

Now that the UI mocks for Phases 1-5 are complete and build verified, it's time to connect the frontend to a real backend.

1. **Define Backend Technology & Architecture:** Decide on the database and API layer.
2. **Implement Real Auth:** Swap the mock `localStorage` auth with a real JWT/session implementation.
3. **Connect Forms:** Connect the Student application wizard, Sponsor opportunity forms, and Admin review actions to real API endpoints.

See [ROADMAP.md](./ROADMAP.md) for full scope.

---

**Go to:** [PROJECT_STATUS](./PROJECT_STATUS.md) → [DECISION_LOG](./DECISION_LOG.md) → [ARCHITECTURE](./ARCHITECTURE.md)
