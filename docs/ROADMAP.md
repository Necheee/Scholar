# Development Roadmap

7 phases of incremental development.

---

## Overview

| Phase | Scope                                | Effort   | Status                 |
| ----- | ------------------------------------ | -------- | ---------------------- |
| 1     | Foundation (React, Router, Design)   | Complete | ✅ Complete            |
| 2     | Authentication (Login, Signup, etc.) | 5-7d     | ✅ Complete (UI Mocks) |
| 3     | Student Interface                    | 7-10d    | ✅ Complete (UI Mocks) |
| 4     | Sponsor Interface                    | 7-10d    | ✅ Complete (UI Mocks) |
| 5     | Admin Interface                      | 5-7d     | ✅ Complete (UI Mocks) |
| 6     | Backend Integration                  | 7-14d    | 🔴 Not started (Next)  |
| 7     | Testing & Refinement                 | 3-5d     | 🔴 Not started         |

**Total Estimate:** 3-4 months full-time

---

## Phase 1: Foundation ✅ Complete

**Goal:** Set up tooling, routing, design system

**What's Done:**

- React + Vite configured
- React Router with 3 role paths
- Tailwind v4 + design tokens
- AppShell component
- Folder structure
- Build verified via `npm.cmd`

**What's Pending:**

- None

**Dependency:** None (project start)

---

## Phase 2: Authentication ✅ Complete (UI Mocks)

**Goal:** Login, signup, password reset for all 3 roles

**Components to Build:**

- Landing page
- Login form
- Role selection during signup
- Student/Sponsor/Admin registration forms
- Forgot password / reset flow
- Email verification (if applicable)
- Logout

**Features:**

- Password strength validation
- Email validation
- Duplicate account detection
- Session management
- "Remember me" (optional)
- Error handling

**Dependency:** Phase 1 build must be verified

**Estimated Timeline:** Week 2-3

---

## Phase 3: Student Interface ✅ Complete (UI Mocks)

**Goal:** Core student features (browse, apply, track applications)

**Components:**

- Dashboard (current application status, notifications)
- Sponsorships (browse, filter, details)
- Multi-step application form (5 steps: Academic Info → Reason → ID Doc → Supporting Docs → Review & Submit)
- Application history / drafts
- Profile & academic records
- Notifications
- Seeking Sponsorship toggle

**Features:**

- Draft saving at each form step
- Application progress tracking
- Document upload/download
- Application status timeline
- Notifications for decisions

**Dependency:** Phase 2 (authentication)

**Estimated Timeline:** Week 3-4

---

## Phase 4: Sponsor Interface ✅ Complete (UI Mocks)

**Goal:** Sponsor features (manage opportunities, review applications)

**Components:**

- Dashboard (my sponsorships, application counts)
- My Sponsorships (create, edit, view)
- Applications (to review, filter, sort)
- Application review UI (view documents, make decision)
- Students Seeking Sponsorship (directory, filter)
- Student profile viewer
- Notifications
- Profile

**Features:**

- Create/edit sponsorship opportunities
- Set deadline and acceptance criteria
- Lock sponsorship after first application
- Review applications (approve/reject/request info)
- Browse student directory
- Comment on applications (admin only)

**Dependency:** Phase 2 (authentication)

**Estimated Timeline:** Week 4-5

---

## Phase 5: Admin Interface ✅ Complete (UI Mocks)

**Goal:** Admin oversight and fraud detection

**Components:**

- Dashboard (flagged applications, pending requests, recent activity)
- Flagged Applications (review fraud detection results)
- Information Requests (review responses, manage workflow)
- Recent Activity log
- Notifications
- Profile

**Features:**

- Display fraud detection results (rules triggered, severity)
- Approve/reject/request information on flagged applications
- Manage information requests
- View full application context
- Activity audit log

**Dependency:** Phase 2 (authentication)

**Estimated Timeline:** Week 5-6

---

## Phase 6: Integration & Workflows (Next)

**Goal:** Connect frontend to backend

**Work:**

- Define backend API endpoints
- Integrate authentication (JWT/sessions)
- Connect all forms to API
- Implement file upload/download
- Integrate fraud detection (backend)
- Implement notifications
- Real application state management

**Dependency:** Phases 2-5 complete; backend API designed

**Estimated Timeline:** Week 6-8

---

## Phase 7: Testing & Refinement

**Goal:** Verify and polish

**Work:**

- Responsive design across breakpoints
- Form validation edge cases
- Error state handling
- Empty state handling
- Navigation completeness
- Role-based access verification
- Application workflow end-to-end
- Accessibility (WCAG basics)
- Visual consistency and polish

**Dependency:** Phases 2-6 complete

**Estimated Timeline:** Week 8-9

---

## Deferred (Out of Scope)

- Real-time WebSocket features
- Payment processing
- In-app messaging/chat
- AI recommendation algorithms
- Advanced analytics
- Dark mode (design ready, feature deferred)
- Internationalization (i18n)

---

**Related:** [DECISION_LOG](./DECISION_LOG.md) | [KNOWN_ISSUES](./KNOWN_ISSUES.md)
