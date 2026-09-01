# Known Issues

Current blockers, uncertainties, and incomplete items.

---

## ISS-001: npm Not Available in Environment

**Severity:** 🔴 CRITICAL  
**Status:** Open  
**Discovered:** 2026-08-21

**Description:**
The `npm` command cannot be executed in the current development terminal environment. Attempts to run `npm install` and `npm run build` result in "command not found" errors from PowerShell.

**Root Cause:**
- Node.js LTS (or compatible version) is not installed on the development machine
- OR Node.js is installed but not added to system PATH
- OR PATH configuration does not include npm location

**Impact:**
- Phase 1 build cannot be verified
- Cannot run `npm run dev` for local development
- Cannot run `npm run build` for production builds
- Cannot run `npm run lint` for code quality checks
- All subsequent development blocked until resolved

**Evidence:**
```
PS C:\Users\USER\Documents\Scholar\client> npm install
npm : The term 'npm' is not recognized as a cmdlet, function, script file, or operable program.
```

**Attempted Solutions:**
1. ✗ Tried `Set-Location` with Windows path syntax — resulted in shell mode errors
2. ✗ Tried `winget install --id OpenJS.NodeJS.LTS` — no console output confirming installation
3. ✗ Tried searching Program Files for node.exe — not found

**Workaround:**
None. This is a blocker for all development.

**Resolution Required:**
1. Install Node.js LTS from https://nodejs.org/ or via package manager (choco, winget, scoop)
2. Verify installation: `node --version` and `npm --version`
3. Confirm npm is on PATH: `npm config get prefix`
4. If necessary, manually add Node.js bin directory to system PATH
5. Reopen terminal and retry `npm install && npm run build`
6. Update this issue with verification results

**Owner:** Development Environment  
**Assigned To:** Next developer to set up the project

---

## ISS-002: Build Verification Incomplete

**Severity:** 🔴 CRITICAL  
**Status:** Blocked by ISS-001  
**Discovered:** 2026-08-21

**Description:**
Phase 1 application code has been created and configured, but the actual build process has not been run and verified. Unknown whether the code compiles without errors.

**Impact:**
- Cannot confirm Tailwind CSS integration works
- Cannot confirm React Router configuration is correct
- Cannot confirm design tokens CSS is valid
- Cannot test the app visually
- Unknown if there are module resolution errors or import issues

**What IS Known:**
✅ No syntax errors in individual files (verified by VS Code ESLint)
✅ Import paths appear correct
✅ Component structure is valid JSX
✅ CSS syntax is valid

**What IS NOT Known:**
❓ Tailwind CSS v4 plugin resolves correctly
❓ @import 'tailwindcss' works with Vite
❓ Google Fonts @import works in CSS
❓ Vite build outputs correctly
❓ No bundling errors
❓ Runtime behavior

**Resolution Required:**
1. Resolve ISS-001 (npm availability)
2. Run: `cd client && npm install`
3. Run: `npm run build`
4. Review console output for errors
5. If successful: run `npm run dev` and visually inspect in browser
6. Update PROJECT_STATUS.md with build results
7. Close this issue

**Owner:** Build System  
**Blocked By:** ISS-001

---

## ISS-003: No Real Backend Connected

**Severity:** 🟡 EXPECTED  
**Status:** Open (By Design)  
**Discovered:** 2026-08-19

**Description:**
The frontend is being built without a working backend API. All data is mock data.

**Impact:**
- No real data flowing through the system
- Application state cannot persist
- Cannot test actual application workflows
- Cannot test fraud detection integration
- Cannot test user authentication
- Cannot test file uploads
- Cannot test notifications

**Why It's Expected:**
- Per project requirements, frontend and backend are developed separately
- Frontend architecture should be independent of backend technology
- Backend technology and API contract not yet defined

**Mitigation:**
- Mock data structure in place for testing UI
- Route structure prepared for API integration
- Components accept props, ready for real data

**Resolution Required:**
1. Define backend technology and architecture
2. Define API endpoints and contracts
3. Implement backend services
4. Connect frontend to backend (Phase 6)
5. Test end-to-end workflows

**Owner:** Project Architecture  
**Timeline:** Phase 6

---

## ISS-004: State Management Not Yet Decided

**Severity:** 🟢 MINOR  
**Status:** Deferred (By Design)  
**Discovered:** 2026-08-19

**Description:**
No state management library or pattern has been selected. Currently using React component state.

**Impact:**
- Large components may need refactoring when state becomes complex
- May need to extract Context API or introduce Redux/Zustand later
- Possible prop-drilling if state needs to cross many components

**Why Deferred:**
- Phase 1 only has one component (AppShell)
- Feature requirements will clarify state complexity
- Premature optimization before feature implementation

**Current Approach:**
- Use React hooks (useState, useReducer) for component-local state
- Use React Context if cross-component state needed
- Defer external library decision until features are built

**Resolution Required:**
- Revisit when Phase 3 (Student features) is underway
- Assess state complexity
- Decide between: hooks, Context API, Redux, Zustand, or other pattern
- Implement pattern consistently across codebase

**Owner:** Architecture  
**Timeline:** Phase 3

---

## ISS-005: No Responsive Design Yet

**Severity:** 🟢 MINOR  
**Status:** Not Started  
**Discovered:** 2026-08-21

**Description:**
Design tokens and initial layout are desktop-focused. Mobile/tablet responsiveness not yet implemented.

**Impact:**
- App may not display well on smaller screens
- Sidebar may overflow on mobile
- Grid layouts may not reflow to single column
- Touch targets may be too small

**Current Design Focus:**
- Desktop: 1126px + 100% viewport
- Sidebar: 280px fixed width
- Grid: 2-column for cards

**Resolution Required:**
1. Add media queries for tablet (768px breakpoint)
2. Add media queries for mobile (640px breakpoint)
3. Implement sidebar collapsing or bottom navigation on mobile
4. Reflow grid layouts to single column on small screens
5. Ensure touch targets are adequate (min 48px)
6. Test on actual devices or responsive browser tools

**Owner:** Frontend Design  
**Timeline:** Phase 7 (Testing & Refinement) or earlier if mobile usage is anticipated

---

## ISS-006: No Error Handling Patterns

**Severity:** 🟡 MEDIUM  
**Status:** Not Started  
**Discovered:** 2026-08-21

**Description:**
No error handling, loading states, or empty states have been implemented.

**Impact:**
- User has no feedback if data load fails
- User has no indication while waiting for data
- User sees blank screen if no data available
- No retry mechanism for failed requests

**What's Missing:**
- Error boundary components
- Error state components
- Loading skeleton/spinner components
- Empty state messages
- Timeout handling
- Retry logic

**Resolution Required:**
1. Create ErrorState component
2. Create LoadingState component
3. Create EmptyState component
4. Implement error handling in data fetching
5. Implement loading states in UI
6. Add timeout and retry logic
7. Test error scenarios

**Owner:** Frontend Components  
**Timeline:** Phase 3+ (when data fetching begins)

---

## ISS-007: No Form Validation Logic

**Severity:** 🟡 MEDIUM  
**Status:** Not Started  
**Discovered:** 2026-08-21

**Description:**
Multi-step application form and other forms do not yet exist. When created, they will need validation logic.

**Impact:**
- User can submit invalid data
- Server must validate (which is correct, but UX suffers)
- No inline feedback for errors

**What's Needed:**
- Client-side validation for all forms
- Real-time validation feedback
- Error messages displayed near fields
- Confirmation before destructive actions
- File type/size validation before upload

**Resolution Required:**
1. Select validation library (Zod, Yup, React Hook Form, Valibot, etc.) OR implement custom
2. Create form validation rules
3. Implement inline error display
4. Add field-level feedback
5. Test edge cases and error scenarios

**Owner:** Frontend Forms  
**Timeline:** Phase 3-4 (when forms are implemented)

---

## ISS-008: No File Upload/Preview System

**Severity:** 🟡 MEDIUM  
**Status:** Not Started  
**Discovered:** 2026-08-21

**Description:**
Students need to upload identification documents and supporting files. This system is not yet built.

**Impact:**
- Cannot test document upload workflow
- Cannot test file preview functionality
- Cannot test file removal before submission
- Cannot test file type/size validation

**Requirements:**
- Drag-drop file upload
- Click to browse file upload
- Preview documents before submission
- Remove uploaded documents
- Validate file type (PDF, JPG, PNG only)
- Validate file size
- Display upload errors clearly

**Resolution Required:**
1. Create FileUpload component
2. Create FilePreview component
3. Implement file type validation
4. Implement file size validation
5. Handle upload errors
6. Connect to backend file storage (TBD)

**Owner:** Frontend Components  
**Timeline:** Phase 3 (Student Application Form)

---

## ISS-009: No Notification System

**Severity:** 🟡 MEDIUM  
**Status:** Not Started  
**Discovered:** 2026-08-21

**Description:**
Notifications are required for application status changes, information requests, etc. System not yet built.

**Current State:**
- Route exists: `/student/notifications`, `/sponsor/notifications`, `/admin/notifications`
- No component or notification display logic

**What's Needed:**
- Notification list component
- Real-time notification delivery (WebSocket or polling?)
- In-app notification toast/banner
- Mark as read/unread
- Notification filtering per role

**Resolution Required:**
1. Define notification architecture (WebSocket vs. polling vs. pull)
2. Create Notification component
3. Create NotificationItem component
4. Implement notification fetch/display
5. Handle notification actions (mark read, delete, etc.)
6. Add real-time updates if using WebSocket

**Owner:** Frontend & Backend  
**Timeline:** Phase 6+ (Integration)

---

## ISS-010: Design System Not Tested Visually

**Severity:** 🟢 MINOR  
**Status:** Blocked by ISS-001  
**Discovered:** 2026-08-21

**Description:**
Design tokens are defined in CSS, but not yet visually verified in the browser.

**Impact:**
- Unknown if colors look as intended
- Unknown if shadows/spacing feel right
- Unknown if typography hierarchy is clear
- Possible need for design adjustment

**Resolution Required:**
1. Resolve ISS-001 (npm availability)
2. Run dev server: `npm run dev`
3. Open browser to /student, /sponsor, /admin routes
4. Visually inspect colors, shadows, spacing
5. Verify sidebar is dark brown, main panel is warm beige
6. Verify cards have appropriate shadow and rounded corners
7. Verify typography hierarchy (Poppins headings, Inter body)
8. Document any visual adjustments needed
9. Update design-tokens.css if necessary

**Owner:** Design/Frontend  
**Timeline:** Post Phase 1 verification

---

## ISS-011: Component Library Not Fully Fleshed Out

**Severity:** 🟢 MINOR  
**Status:** Not Started  
**Discovered:** 2026-08-21

**Description:**
Only Button component started. Other planned reusable components (Card, Modal, Input, etc.) do not yet exist.

**Impact:**
- Developers may duplicate component logic
- Inconsistent styling across pages
- More work later to refactor

**Planned Components:**
- Card
- Modal
- Input
- Textarea
- Select
- StatusBadge
- PageHeader
- FileUpload
- FilePreview
- NotificationItem
- ApplicationTimeline
- SponsorshipCard
- StudentCard
- EmptyState
- LoadingState
- ErrorState
- ConfirmationModal

**Resolution Required:**
- Build component library as features are implemented
- Standardize before features diverge
- Create Storybook or component documentation

**Owner:** Frontend Components  
**Timeline:** Ongoing (Phases 2-5)

