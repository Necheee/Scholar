# Architecture

Overall system design and frontend implementation structure.

---

## System Architecture

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Student UI  │  Sponsor UI  │  Admin UI                  │   │
│  │  (Role-Specific Interfaces)                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                          │
                    REST API (TBD)
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
┌──────▼─────────┐  ┌─────▼──────┐   ┌─────▼──────────┐
│   Database     │  │  Backend   │   │   Fraud        │
│   (TBD)        │  │  API       │   │   Detection    │
│                │  │  (TBD)     │   │   Engine       │
└────────────────┘  └────────────┘   │   (Rule-Based) │
                                     └────────────────┘
```

### Key Integration Points

**Not Yet Implemented:**
- Backend API endpoints
- Database schema
- Authentication service
- Real fraud detection system
- File storage system
- Notification service
**Planned Backend Architecture:**
- **Backend API:** Node.js + Express.js REST API
- **Database:** MongoDB (Users, Profiles, Sponsorships, Applications, Notifications, Fraud Flags, Document Metadata)
- **Authentication:** Custom JWT-based authentication (bcrypt password hashing, role-based authorization for Student/Sponsor/Admin)
- **Fraud Detection Engine:** Custom rule-based system running in the backend (e.g., detecting duplicate applications, inconsistencies). Flags trigger Admin review, not automatic rejection.
- **File Storage:** Cloudinary (Document metadata stored in MongoDB)

**Current State:**
- Frontend shell built
- Routes configured
- Design system established
- Mock data placeholders ready for API integration
- Backend setup about to begin (Phase 6)

---

## Frontend Architecture

### Technology Stack

**Runtime:**
- React 19.2.8 — component framework
- React Router DOM 7.1.1 — client-side routing
- React DOM 19.2.8 — rendering

**Build Tool:**
- Vite 8.2.0 — fast build and dev server

**Styling:**
- Tailwind CSS 4.1.11 — utility-first CSS framework
- @tailwindcss/vite 4.1.11 — Vite integration
- CSS custom properties — design tokens

**Typography:**
- Inter (400, 500, 600, 700, 800) — body and UI text
- Poppins (500, 600, 700) — headings

**Linting:**
- ESLint 10.8.0 — code quality
- ESLint plugins for React

### Folder Structure

```
client/
  public/                    # Static assets
  src/
    app/
      AppShell.jsx          # Role-based app shell component
    components/
      layout/
        Sidebar.jsx         # (Placeholder for future refinement)
      ui/
        Button.jsx          # Reusable button component
        Card.jsx            # (Planned)
        Modal.jsx           # (Planned)
        StatusBadge.jsx     # (Planned)
        Input.jsx           # (Planned)
        ... more UI components
    features/               # (Planned: role-specific features)
      auth/
        Login.jsx           # (Planned)
        Register.jsx        # (Planned)
      student/
        Dashboard.jsx       # (Planned)
        Sponsorships.jsx    # (Planned)
        Application.jsx     # (Planned)
        ... more student pages
      sponsor/
        Dashboard.jsx       # (Planned)
        Opportunities.jsx   # (Planned)
        ... more sponsor pages
      admin/
        Dashboard.jsx       # (Planned)
        FlaggedApps.jsx     # (Planned)
        ... more admin pages
    data/
      mockData.js           # Mock data for development
    styles/
      design-tokens.css     # Design system (colors, shadows, etc.)
    App.jsx                 # Minimal app wrapper
    index.css               # Global styles + Tailwind import
    main.jsx                # Entry point with routing
  index.html
  package.json
  vite.config.js
  eslint.config.js
  .gitignore
```

### Design System (Design Tokens)

**Location:** `client/src/styles/design-tokens.css`

All design decisions are stored as CSS custom properties (variables) for consistency and maintainability.

**Color Tokens:**
```css
--color-ink:               #1f1713  (primary text, dark brown)
--color-ink-soft:          #4a3a32  (secondary text)
--color-panel:             #f5efe8  (main background, warm beige)
--color-surface:           #fffdf9  (card background, warm white)
--color-sidebar:           #2b1f1a  (sidebar background, very dark)
--color-sidebar-soft:      #3d2d28  (sidebar hover state)
--color-border:            #e7d9c7  (borders and dividers)
--color-accent:            #8b5e3c  (primary action buttons)
--color-accent-strong:     #5b3a2b  (hover/pressed state)
--color-success:           #3d6b4d  (success/approved)
--color-warning:           #c78b4d  (warning/flagged)
--color-danger:            #af4a3c  (danger/rejected)
--shadow-soft:             0 12px 30px rgba(48, 32, 26, 0.08)
```

**Typography:**
- Headings (h1–h4): `font-family: 'Poppins', sans-serif`
- Body/UI: `font-family: 'Inter', sans-serif`
- Line height: 1.5 (default)

**Status Badge Colors:**
- Draft: neutral (gray)
- Under Review: warning (orange/yellow)
- Approved: success (green)
- Rejected: danger (red)
- Flagged: warning (orange/red)

**Component Styling:**
- Sidebar width: 280px
- Card border-radius: 20px
- Card shadow: `var(--shadow-soft)`
- Padding unit: 8px multiples

### Role-Based Routing

**Structure:**

```
/
├── / → redirect to /student
├── /student/*                    (Student role shell)
│   ├── / (Dashboard)            (Planned)
│   ├── /sponsorships            (Planned)
│   ├── /application             (Planned)
│   ├── /history                 (Planned)
│   ├── /notifications           (Planned)
│   └── /profile                 (Planned)
├── /sponsor/*                    (Sponsor role shell)
│   ├── / (Dashboard)            (Planned)
│   ├── /opportunities           (Planned)
│   ├── /applications            (Planned)
│   ├── /students                (Planned)
│   ├── /notifications           (Planned)
│   └── /profile                 (Planned)
└── /admin/*                      (Admin role shell)
    ├── / (Dashboard)            (Planned)
    ├── /flagged                 (Planned)
    ├── /requests                (Planned)
    ├── /activity                (Planned)
    ├── /notifications           (Planned)
    └── /profile                 (Planned)
```

**Implementation:**
- Entry point: `client/src/main.jsx`
- Router: `BrowserRouter` from React Router
- App shell: `AppShell.jsx` component (role-aware)
- Role passed as prop to AppShell

**Important Security Note:**
Frontend routing provides UI isolation, not security. Backend MUST validate all requests and enforce authorization.

### Component Architecture

**Implemented Components:**

1. **AppShell** (`client/src/app/AppShell.jsx`)
   - Props: `role` (student, sponsor, admin)
   - Renders: Dark brown sidebar + main panel
   - Navigation: Role-specific NavLink items
   - Layout: Flexbox (sidebar + content)
   - Styling: CSS custom properties for colors

2. **Button** (`client/src/components/ui/Button.jsx`)
   - Props: `children`, `variant`, `type`, spread `...props`
   - Variants: primary, secondary (planned)
   - Styling: Tailwind classes (to be refined)

3. **Sidebar** (`client/src/components/layout/Sidebar.jsx`)
   - Placeholder component
   - Will be refined or merged with AppShell

**Planned Components (Phase 2 onwards):**

Core UI:
- Card — container for content with rounded corners and shadow
- Modal — overlay dialog for confirmations and forms
- Input — text field with label and validation feedback
- Textarea — multi-line text input
- Select — dropdown selector
- StatusBadge — semantic color status indicator
- PageHeader — page title and primary action button
- FileUpload — drag-drop or click file input
- FilePreview — display uploaded document thumbnail
- NotificationItem — single notification in list
- ApplicationTimeline — progress indicator for application states
- EmptyState — message when no data available
- LoadingState — skeleton or spinner while loading
- ErrorState — error message and retry action
- ConfirmationModal — confirm destructive actions

Content-Specific:
- SponsorshipCard — sponsorship opportunity in list
- StudentCard — student profile in directory
- ApplicationCard — application summary in list

### State Management

**Current Decision:** Deferred

**Likely Approaches:**
1. React hooks (useState, useContext) for simple features
2. Context API if cross-component state becomes complex
3. Redux/Zustand if application state becomes unmanageable

**To Be Decided in Phase 3** when feature requirements are clearer.

**Current Implementation:**
- Mock data in `client/src/data/mockData.js`
- No real state management yet
- Props passed to components for development/testing

### Data Flow (Planned)

**Student Application Workflow:**
**Student Application Workflow & Lifecycle:**
*Business Rule:* A student may have only ONE active sponsorship application at a time. An active application (Pending, Under Review, Accepted) prevents new applications. If rejected or draft cancelled, the student can apply again.

```
1. Student visits /student/sponsorships
   ↓
2. Frontend fetches sponsorships (GET /api/sponsorships)
   ↓
3. Display sponsorship cards
   ↓
4. Student clicks sponsorship → /student/application/new/:sponsorshipId
   ↓
5. Multi-step form component with steps:
   - Academic Information (save draft)
   - Reason for Sponsorship (save draft)
   - ID Document (upload + save draft)
   - Supporting Documents (upload + save draft)
   - Review & Submit (final confirmation)
   ↓
6. Student submits → POST /api/applications
   ↓
7. Frontend:
   - Shows submitted confirmation
   - Redirects to /student/application (current status)
   ↓
8. Backend:
   - Stores application with status: "Submitted"
   - Triggers fraud detection rules
   - Updates status: "Under screening"
   ↓
9. Admin reviews flagged applications (if flagged)
   ↓
10. If approved by admin: status → "Under sponsor review"
    If rejected: status → "Rejected", student notified
    If request info: status → "Waiting for additional information"
   ↓
11. Sponsor reviews approved applications
    ↓
12. Sponsor approves/rejects → student notified
    ↓
13. Student sees final decision on /student/application
```

**Sponsor Sponsorship Creation:**

```
1. Sponsor visits /sponsor/opportunities
   ↓
2. Clicks "Create Sponsorship"
   ↓
3. Form with fields:
   - Title, description
   - Eligibility requirements
   - Academic requirements
   - Required documents
   - Deadline, duration
   ↓
4. Submit → POST /api/sponsorships
   ↓
5. Backend validates and stores
   ↓
6. Frontend shows in "My Sponsorships"
   ↓
7. Can edit until first application received
```

**Admin Flagged Application Review:**

```
1. Admin visits /admin/flagged
   ↓
2. Fetches flagged applications (GET /api/admin/flagged-applications)
   ↓
3. Displays application list with flagged count
   ↓
4. Clicks application → /admin/application/:id
   ↓
5. Review page shows:
   - Student info
   - Application fields
   - Documents (preview)
   - Fraud detection results (rules + severity)
   ↓
6. Admin chooses action:
   a) Approve → PATCH /api/admin/applications/:id/approve
   b) Reject (with reason) → PATCH /api/admin/applications/:id/reject
   c) Request Info (with prompt) → PATCH /api/admin/applications/:id/request-info
   ↓
7. Student notified of action
   (or additional information request shown to student)
```

### API Contract (Planned)

Not yet defined. To be created when backend is specified.

**Expected Endpoints (sketch):**

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout

Student:
GET    /api/student/profile
PATCH  /api/student/profile
GET    /api/sponsorships (browse)
GET    /api/sponsorships/:id (details)
POST   /api/applications (create new)
GET    /api/applications/current (current status)
PATCH  /api/applications/:id (save draft)
POST   /api/applications/:id/submit
GET    /api/applications/history
POST   /api/applications/:id/respond-to-request

Sponsor:
GET    /api/sponsor/profile
PATCH  /api/sponsor/profile
POST   /api/sponsorships (create)
GET    /api/sponsorships (my sponsorships)
GET    /api/sponsorships/:id
PATCH  /api/sponsorships/:id (edit before first application)
PATCH  /api/sponsorships/:id/extend-deadline
GET    /api/applications (applications to review)
GET    /api/applications/:id (application details)
PATCH  /api/applications/:id/approve
PATCH  /api/applications/:id/reject
GET    /api/students-seeking-sponsorship (directory)
GET    /api/students/:id/profile (public profile)

Admin:
GET    /api/admin/flagged-applications
GET    /api/admin/applications/:id (full details + fraud results)
PATCH  /api/admin/applications/:id/approve
PATCH  /api/admin/applications/:id/reject
PATCH  /api/admin/applications/:id/request-information
GET    /api/admin/information-requests
GET    /api/admin/applications/:id/information-response
GET    /api/admin/activity (recent activity log)
```

### Security Architecture

**Frontend (UI-Level Protection):**
- Route guards prevent navigation to wrong role pages
- AppShell component enforces role context
- Navigation hides options unavailable to role

**Backend (Required - Not Yet Implemented):**
- Authentication tokens/sessions
- Authorization checks on every endpoint
- Role validation on every request
- Fraud detection results only shown to admin
- Submitted applications locked (backend enforced)
- One-active-application rule enforced (backend)

**Important:** Frontend route protection is NOT sufficient security. Backend must validate all requests.

### Error Handling & Edge Cases

**Planned Patterns (Not Yet Implemented):**

1. **Failed API Requests**
   - Display error state component
   - Show user-friendly error message
   - Provide retry action

2. **Empty States**
   - No applications yet → empty state message
   - No sponsorships available → empty state message
   - No notifications → empty state message

3. **Loading States**
   - Skeleton loaders or spinners while data fetches
   - Disable buttons during submission

4. **Validation**
   - Form field validation before submit
   - File type/size validation before upload
   - Confirmation before destructive actions (delete draft, reject application)

5. **Timeouts**
   - Handle slow API responses
   - Show timeout error after X seconds
   - Allow retry

### Performance Considerations

**Not Yet Implemented:**
- Code splitting per role (can optimize bundle size)
- Lazy loading of pages
- Image optimization
- Caching strategies

**Future Optimizations:**
- Load role-specific code only when needed
- Prefetch common actions
- Cache user profile and sponsorship data
- Minimize re-renders with React.memo/useMemo

---

## Build & Development Setup

**Build Tool:** Vite 8.2.0

**Configuration:** `client/vite.config.js`
- React plugin for JSX support
- Tailwind CSS v4 plugin via @tailwindcss/vite

**Development Server:** `npm run dev`
- Hot module reloading for fast iteration

**Production Build:** `npm run build`
- Outputs optimized files to `client/dist/`

**Preview:** `npm run preview`
- Test production build locally

**Linting:** `npm run lint`
- ESLint configuration in `eslint.config.js`

---

## Responsive Design

**Primary Focus:** Desktop and Laptop

**Secondary Support:** Tablet and Mobile

**Tailwind Configuration:** Default breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

**Sidebar Adaptation (Planned):**
- Desktop: fixed 280px sidebar + flexible content
- Mobile: collapsible sidebar or bottom navigation (TBD)

**Grid/Flex Adjustments (Planned):**
- Multi-column layouts reflow to single column on mobile
- Cards stack vertically
- Forms remain readable

