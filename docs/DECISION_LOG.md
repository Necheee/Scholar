# Decision Log

Major product, architecture, and technical decisions.

---

## DEC-001 — Technology Stack

**Decision:** React + Vite + Tailwind CSS + React Router

**Reason:** Developer is learning React; these tools fit scope and support role-based routing.

**Status:** ✅ Accepted — Implemented

---

## DEC-002 — Three User Roles

**Decision:** Exactly three roles: Student, Sponsor, Admin

**Reason:** Reflects business model; different workflows per role.

**Status:** ✅ Accepted — Routing implemented

---

## DEC-003 — One Active Application Per Student

**Decision:** Students can have only ONE active application at a time.

**Reason:** Prevents confusion and duplicate submissions.

**Status:** ✅ Accepted — Not yet implemented in UI

---

## DEC-004 — Submitted Applications Locked

**Decision:** Submitted applications cannot be edited by students.

**Reason:** Prevents tampering; requires formal information request for changes.

**Status:** ✅ Accepted — Not yet implemented in UI

---

## DEC-005 — Fraud Screening Before Sponsor Review

**Decision:** All applications go through fraud detection before sponsors see them.

**Reason:** Acts as security gate; sponsors see only cleared applications.

**Status:** ✅ Accepted — Not yet implemented

---

## DEC-006 — Flagged Applications Require Admin Review

**Decision:** Flagged applications go to Admin for review (not auto-rejected).

**Reason:** Human judgment needed for false positives; maintains fairness.

**Status:** ✅ Accepted — Not yet implemented

---

## DEC-007 — Information Requests Separate from Submission

**Decision:** Admin requests information; students respond separately (not re-editing).

**Reason:** Maintains locked submission; creates clear audit trail.

**Status:** ✅ Accepted — Not yet implemented

---

## DEC-008 — Sponsorships Locked After First Application

**Decision:** Sponsors cannot edit sponsorship details after first application received.

**Reason:** Prevents mid-process requirement changes; maintains fairness.

**Status:** ✅ Accepted — Not yet implemented

---

## DEC-009 — Auto-Close Sponsorships at Deadline

**Decision:** Sponsorships automatically close when deadline passes.

**Reason:** Prevents confusion; maintains urgency; reduces manual work.

**Status:** ✅ Accepted — Not yet implemented

---

## DEC-010 — "Seeking Sponsorship" Directory

**Decision:** Students can opt in to be discoverable by sponsors.

**Reason:** Enables proactive matching; complements application workflow.

**Status:** ✅ Accepted — Not yet implemented

---

## DEC-011 — Role-Based Information Boundaries

**Decision:** Fraud info, admin notes, and sensitive docs are isolated per role.

**Reason:** Students/sponsors must not see fraud details or admin evidence.

**Status:** ✅ Accepted — Routing structure implemented

---

## DEC-012 — Simple Dashboards Only

**Decision:** Dashboards contain only core sections; no analytics or charts.

**Reason:** Keeps scope manageable; improves usability through focus.

**Status:** ✅ Accepted — Not yet implemented

---

## DEC-013 — 5-Step Application Form

**Decision:** Application form: Academic Info → Reason → ID Doc → Supporting Docs → Review & Submit

**Reason:** Breaks complexity; enables draft saving at each step.

**Status:** ✅ Accepted — Not yet implemented

---

## DEC-014 — Role-Based Sidebar Navigation

**Decision:** Each role has dark brown sidebar with role-specific nav items.

**Reason:** Provides visual role context; prevents accidental cross-role access.

**Status:** ✅ Accepted — Implemented

---

## DEC-015 — Warm, Elegant Design System

**Decision:** Beige + brown + warm white palette with dark brown sidebar. Poppins headings, Inter body text.

**Reason:** Professional, sophisticated, distinct from typical blue/purple tech.

**Status:** ✅ Accepted — Implemented (design tokens)

---

## DEC-016 — Frontend Role-Based Routing

**Decision:** React Router enforces role routing; backend must re-validate.

**Reason:** Improves UX; first-pass protection (not sufficient security).

**Status:** ✅ Accepted — Routing structure implemented

---

## DEC-017 — State Management Deferred

**Decision:** Will decide when features are clearer.

**Reason:** Premature selection without feature complexity understood.

**Status:** ⏳ Deferred — Phase 3+

---

## DEC-018 — Frontend First, Backend Later

**Decision:** Frontend developed without backend; mock data for testing.

**Reason:** Enables parallel development and rapid UI iteration.

**Status:** ✅ Accepted — Mock data in place

---

## DEC-019 — Scope: Exclude Enterprise Features

**Decision:** No payments, chat, AI recommendations, real-time WebSockets, or unnecessary complexity.

**Reason:** BSc project; focus on core functionality and clarity.

**Status:** ✅ Accepted — Guiding principle

---

## DEC-020 — Incremental Development

**Decision:** Build phase-by-phase with documentation and review before major changes.

**Reason:** Developer is learning; enables feedback and continuity.

**Status:** ✅ Accepted — Process principle

---

## DEC-021 — Tailwind v4 with @tailwindcss/vite

**Decision:** Use Tailwind CSS v4 with Vite plugin (not PostCSS).

**Reason:** Cleaner Vite integration; aligns with design token system.

**Status:** ✅ Accepted — Implemented

---

## DEC-022 — React Router v7 with Wildcard Routes

**Decision:** Use React Router v7 with `/role/*` for nested role routing.

**Reason:** Latest stable; supports future sub-routes per role.

**Status:** ✅ Accepted — Implemented

---

## DEC-023 — Google Fonts: Inter + Poppins

**Decision:** Load Inter (body) and Poppins (headings) from Google Fonts.

**Reason:** Professional, accessible, free, no file management.

**Status:** ✅ Accepted — Implemented

---

## DEC-024 — CSS Custom Properties for Design Tokens

**Decision:** All colors, shadows, and typography use CSS variables.

**Reason:** Single source of truth; global updates; enables future theming.

**Status:** ✅ Accepted — Implemented

---

## DEC-025 — Single AppShell Component

**Decision:** One AppShell component with role prop for all role contexts.

**Reason:** Centralizes role logic; config-driven; easy to maintain.

**Status:** ✅ Accepted — Implemented

