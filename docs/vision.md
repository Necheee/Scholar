You are helping me build the frontend for my BSc Computer Science final-year project.

PROJECT TITLE:
“Development of a Secure Student Sponsorship Management System with Rule-Based Fraud Detection”

IMPORTANT:
This is a BSc final-year project, so the system should be realistic and professionally designed, but it must remain manageable in scope. Do not unnecessarily introduce enterprise-level features, complicated architecture, excessive animations, payment systems, messaging systems, recommendation algorithms, or other features that are not part of the requirements below.

I am a student learning React, so act as a technical mentor as well as an implementation agent. Do not blindly generate large amounts of code without explaining what we are building and why. Work incrementally. Before making major architectural or design decisions that have not already been specified, discuss them with me.

==================================================
1. TECHNOLOGY STACK
==================================================

Frontend:
- React
- Vite
- Tailwind CSS
- React Router

Use a component-based React architecture.

We will eventually connect the frontend to a backend/API, but for the initial frontend development, focus on the UI structure, navigation, reusable components, states, and frontend behavior.

Do not assume a backend implementation unless I explicitly provide one.

==================================================
2. SYSTEM USERS / ROLES
==================================================

There are exactly THREE primary roles:

1. Student
2. Sponsor
3. Admin

Each role must have a role-specific interface and sidebar navigation.

The system should use protected routes and role-based access.

Students must not access Sponsor/Admin pages.
Sponsors must not access Student/Admin pages.
Admins must not access Student/Sponsor functionality unless explicitly required.

The frontend should reflect these role boundaries, but remember that real authorization must eventually be enforced by the backend as well.

==================================================
3. CORE SYSTEM CONCEPT
==================================================

This is a Student Sponsorship Management System.

The basic model is:

Sponsors create sponsorship opportunities.

Students can:
- Browse available sponsorship opportunities
- View sponsorship details
- Apply for a sponsorship
- Track their application
- Respond if additional information is requested
- Make themselves discoverable to sponsors if they are seeking sponsorship

Applications go through a rule-based fraud detection process BEFORE reaching the sponsor.

The important workflow is:

Student submits application
        ↓
Rule-based fraud detection
        ↓
   ┌───────────────┐
   ↓               ↓
Pass             Flagged
   ↓               ↓
Sponsor         Admin Review
Review              ↓
   ↓          ┌─────┼─────┐
Approve     Approve Reject Request
   ↓                      ↓
Approved              Additional
   ↓                  Information
Student                    ↓
notified                Student responds
                           ↓
                       Admin reviews
                           ↓
                       Sponsor review
                           ↓
                     Approve / Reject

IMPORTANT:
A flagged application is NOT automatically rejected.

A flagged application must be reviewed by the Admin.

The Sponsor should NOT see the fraud-detection information.

The Sponsor only receives applications that have passed the security screening/review process and are ready for sponsor consideration.

==================================================
4. STUDENT APPLICATION RULES
==================================================

A student can only have ONE application process at a time.

A student's application process can be:

- Draft
- Submitted
- Under screening
- Under Admin review
- Waiting for additional information
- Under Sponsor review
- Approved
- Rejected

Draft:
- The student can save an incomplete application.
- The student can continue the draft later.
- The student can delete/cancel the draft.
- After deleting/cancelling a draft, the student can start another application.

Once submitted:
- The application becomes LOCKED.
- The student cannot directly edit the submitted application.
- If information needs to be changed, the Admin must request additional information.
- The student responds to that request rather than editing the original submission.

Application eligibility rule:

The student CANNOT start another application if the current application is:
- Submitted
- Under screening
- Under Admin review
- Waiting for additional information
- Under Sponsor review
- Approved

The student CAN start another application after the current application has been rejected.

The student also cannot apply to the same sponsorship opportunity twice.

==================================================
5. STUDENT APPLICATION FORM
==================================================

The application must be a MULTI-STEP FORM.

Use these five steps:

STEP 1:
Academic Information

STEP 2:
Reason for Requesting Sponsorship

STEP 3:
Identification Document

STEP 4:
Supporting Documents

STEP 5:
Review and Submit

The application should support saving as a draft.

At the final Review & Submit step, the student should be able to review everything before submission.

Once submitted, the application is locked.

==================================================
6. DOCUMENT UPLOADS
==================================================

Required/relevant application documents can include:

- School transcript
- Identification document
- Reason for requesting sponsorship
- Other supporting documents that may help with fraud detection

Allowed file types:

- PDF
- JPG/JPEG
- PNG

The frontend should validate file type and eventually file size.

Uploaded documents should not simply show filenames.

The student should be able to:
- Preview
- Replace
- Remove before submission where appropriate

After submission, documents become locked.

==================================================
7. STUDENT DASHBOARD
==================================================

The Student dashboard must remain simple.

It should contain:

1. Current Application
   - Show the application's progress/status.

2. Available Sponsorships
   - Show available sponsorship opportunities.

3. Recent Notifications

4. Application History

Do not turn this into an analytics dashboard with unnecessary charts.

==================================================
8. STUDENT SIDEBAR
==================================================

Student navigation:

- Dashboard
- Sponsorships
- My Application
- Application History
- Notifications
- Profile

Profile should include:
- Personal information
- Academic records
- Seeking Sponsorship setting

==================================================
9. STUDENT ACADEMIC RECORDS
==================================================

Students may have academic information associated with different school sessions.

Do NOT design the profile as though a student's academic information only exists for one session.

The interface should allow academic records to be maintained by academic session.

For example:

2025/2026
Programme
Level
Academic information

2026/2027
Programme
Level
Academic information

The exact backend structure will be decided later.

==================================================
10. SEEKING SPONSORSHIP FEATURE
==================================================

Students can indicate that they are seeking sponsorship.

The profile should contain a setting:
“Seeking Sponsorship”

ON:
The student's sponsorship-seeking profile is visible to registered sponsors.

OFF:
The profile is not visible in the sponsor directory.

All registered sponsors can browse students who have enabled this setting.

However, sponsors should NOT see sensitive application documents from this profile.

Sponsors can see relevant basic information such as:

- Student name
- Institution
- Programme/department
- Level
- Academic session
- Academic performance
- Reason for seeking sponsorship

Sponsors must NOT see:
- Transcript
- Identification document
- Supporting documents
- Internal fraud information
- Admin notes
- Private account information

Those documents are only accessible to a sponsor when the student formally applies to one of the sponsor's sponsorship opportunities and the application reaches the sponsor.

==================================================
11. SPONSOR DASHBOARD
==================================================

The Sponsor dashboard should be simple.

Main sections:

1. My Sponsorship Opportunities
2. Applications to Review

Do not create an excessive statistics/analytics dashboard.

==================================================
12. SPONSOR SIDEBAR
==================================================

Sponsor navigation:

- Dashboard
- My Sponsorships
- Applications
- Students Seeking Sponsorship
- Notifications
- Profile

==================================================
13. SPONSORSHIP OPPORTUNITIES
==================================================

Sponsors can create sponsorship opportunities.

A sponsorship opportunity contains:

- Sponsorship title
- Description
- Eligibility requirements
- Academic requirements
- Required documents
- Application deadline
- Sponsorship duration

When a sponsor creates an opportunity:

Sponsor creates opportunity
        ↓
Basic frontend/backend validation
        ↓
Opportunity becomes Active
        ↓
Students can view/apply

There is NO Admin approval step for sponsorship opportunities.

==================================================
14. SPONSORSHIP EDITING RULE
==================================================

A sponsor can edit a sponsorship opportunity ONLY before the first student application is received.

Once the first student applies:
- Sponsorship details become locked for editing.

The frontend should clearly communicate this state.

==================================================
15. SPONSORSHIP DEADLINE
==================================================

Before the deadline:
- The sponsorship is active.
- The sponsor may extend the deadline.

When the deadline passes:
- The system automatically closes the sponsorship opportunity.
- Students can no longer submit new applications.
- Existing applications remain available for processing.

The frontend should distinguish:
- Active
- Closed

==================================================
16. STUDENT SPONSORSHIP BROWSING
==================================================

Students browse available sponsorships as CARDS.

Each card can display:

- Sponsorship title
- Short description
- Application deadline
- Sponsorship duration
- Relevant summary information
- View Details action

Clicking a card opens a detailed sponsorship page.

The detailed page contains:

- Sponsorship title
- Description
- Eligibility requirements
- Academic requirements
- Required documents
- Application deadline
- Sponsorship duration
- Apply button

Clicking Apply takes the student DIRECTLY to the application form.

Do NOT add a separate confirmation/eligibility page before the form.

==================================================
17. SPONSOR APPLICATION REVIEW
==================================================

Sponsors can view applications that have passed the required security screening/review process.

The sponsor sees the complete cleared application, including:

- Student name
- Institution
- Programme
- Department
- Level
- Academic session
- Academic information
- Reason for requesting sponsorship
- Transcript
- Identification document
- Supporting documents
- Application date

The sponsor must NOT see:
- Fraud rules
- Fraud scores
- Fraud severity
- Admin notes
- Internal security evidence

The sponsor simply receives applications that are ready for sponsor review.

Sponsor actions:

- Approve
- Reject

If the sponsor rejects:
- They MUST provide a reason for rejection.

After approval:
- Application becomes Approved.
- Student is notified.

==================================================
18. SPONSOR STUDENT DIRECTORY
==================================================

Create a “Students Seeking Sponsorship” page.

This page shows students who have enabled “Seeking Sponsorship.”

Use cards for browsing.

Example information:
- Name
- Programme
- Institution
- Level
- Academic session
- Seeking Sponsorship indicator

Clicking the card opens the student's sponsorship-seeking profile.

The sponsor can see basic sponsorship-related information only.

No application documents should be exposed from this page.

==================================================
19. ADMIN DASHBOARD
==================================================

The Admin dashboard should also remain simple.

It contains:

1. Flagged Applications
2. Pending Information Requests
3. Recent Activity

Do not create an unnecessary analytics-heavy admin dashboard.

==================================================
20. ADMIN SIDEBAR
==================================================

Admin navigation:

- Dashboard
- Flagged Applications
- Information Requests
- Recent Activity
- Notifications
- Profile

==================================================
21. FRAUD DETECTION
==================================================

Fraud detection is RULE-BASED.

The frontend does NOT need to implement the actual fraud-detection engine unless I explicitly ask for it.

The frontend needs to DISPLAY the results received from the backend.

The system can compare application information against:

- Existing student profile information
- Existing academic records
- Previous applications
- Other relevant stored information

Possible examples of rules include:
- Duplicate application detection
- Information inconsistency
- Academic record mismatch
- Other contradictory information

The system can trigger MULTIPLE rules for one application.

Each triggered rule has a severity:

- Low
- Medium
- High

The Admin should see BOTH:

1. Overall risk level
2. Individual triggered rules

Example:

OVERALL:
HIGH RISK — 3 RULES TRIGGERED

Then:

High — Duplicate Application
Explanation/evidence

Medium — Information Inconsistency
Explanation/evidence

Low — Academic Record Mismatch
Explanation/evidence

Severity does NOT automatically determine the final outcome.

The Admin still decides.

==================================================
22. ADMIN FLAGGED APPLICATION REVIEW
==================================================

This is one of the most important screens in the system.

The Admin review page should contain:

STUDENT INFORMATION
- Student name
- Institution
- Programme
- Level
- Academic session

APPLICATION INFORMATION
- Reason for sponsorship
- Submitted information

DOCUMENTS
- Transcript
- Identification document
- Supporting documents
- Preview functionality

FRAUD DETECTION RESULTS
- Overall risk level
- Number of rules triggered
- Individual rules
- Severity
- Explanation/evidence

ADMIN ACTIONS
- Approve
- Reject
- Request Additional Information

If Admin approves:
- Application proceeds to Sponsor Review.

If Admin rejects:
- Application becomes Rejected.
- Student is notified.

If Admin requests additional information:
- Student receives a request.

==================================================
23. ADDITIONAL INFORMATION WORKFLOW
==================================================

Admin can request additional information from a student.

The Admin enters what information/document is required.

Example:

“Please upload an updated transcript.”

Student receives a notification/request.

Student responds.

The response is then available to the Admin for review.

The original submitted application remains locked.

==================================================
24. ADMIN INFORMATION REQUESTS
==================================================

Admin has an “Information Requests” page.

It shows requests such as:

- Student
- Application
- Information requested
- Date
- Status

Possible state:
- Awaiting Student Response
- Student Responded
- Under Admin Review

==================================================
25. ADMIN ACTIVITY
==================================================

Admin has a simple Recent Activity page.

Examples:

- Application flagged
- Student responded to information request
- Sponsor approved application
- Sponsor rejected application
- Admin reviewed application

Do not over-engineer this into a complicated analytics system.

==================================================
26. APPLICATION STATUS / PROGRESS TRACKER
==================================================

Students should see an application progress tracker.

General flow:

Submitted
    ↓
Security Screening
    ↓
Admin Review (only if flagged)
    ↓
Sponsor Review
    ↓
Approved / Rejected

The frontend should adapt the timeline based on the application's actual status.

For example, a normal application might appear:

Submitted ✓
Security Screening ✓
Sponsor Review ●
Decision ○

A flagged application might appear:

Submitted ✓
Security Screening ✓
Admin Review ●
Sponsor Review ○
Decision ○

The student should NOT see the specific fraud rules.

==================================================
27. NOTIFICATIONS
==================================================

Notifications should be simple and relevant.

Student notifications:
- Successful submission
- Application under review
- Additional information requested
- Application accepted
- Application rejected

Sponsor notifications:
- New cleared application available

Admin notifications:
- Application flagged
- Student responded to information request
- Sponsor approved application
- Sponsor rejected application

Do not build a full messaging/chat system.

==================================================
28. VISUAL DESIGN
==================================================

The overall visual direction is:

ELEGANT + POLISHED

Color palette:
- Beige
- Brown
- Warm white
- Neutral supporting tones

Main layout:
- Dark brown sidebar
- Beige main background
- Warm-white cards

Typography:
- Poppins for headings
- Inter for body/UI text

Cards:
- Softly rounded
- Subtle shadows
- Clean spacing

Buttons:
- Primary actions: solid brown
- Secondary actions: outline/neutral

Examples of primary actions:
- Apply
- Create Sponsorship
- Submit
- Approve
- Send Request

Examples of secondary actions:
- View Details
- Cancel
- Back
- Preview

Status badges:
Use subtle semantic colors.

Examples:
- Draft → neutral
- Under Review → yellow/orange
- Approved → green
- Rejected → red
- Flagged → orange/red
- Active → green
- Closed → neutral

Fraud severity:
- Low → yellow
- Medium → orange
- High → red

Do not use the status colors as the main visual theme. They should only communicate state.

Icons:
- Simple outline icons
- Avoid overly decorative icons

Dashboard density:
- Balanced
- Enough whitespace for an elegant interface
- Enough information visible without excessive scrolling

==================================================
29. RESPONSIVE DESIGN
==================================================

The frontend must be responsive.

Primary focus:
- Desktop
- Laptop

But it should also work reasonably on:
- Tablet
- Mobile

On smaller screens, the sidebar should adapt appropriately rather than forcing the desktop layout.

==================================================
30. REUSABLE COMPONENTS
==================================================

Use reusable components where appropriate.

Potential shared components include:

- Button
- Input
- Textarea
- Select
- Modal
- Card
- StatusBadge
- Sidebar
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

Do not create components unnecessarily just to make the folder structure look sophisticated.

==================================================
31. IMPORTANT EMPTY / LOADING / ERROR STATES
==================================================

The UI should account for:

- No current application
- No available sponsorships
- No application history
- No notifications
- No students seeking sponsorship
- No flagged applications
- No pending information requests
- Loading data
- Failed API request
- Invalid form input
- Invalid file upload
- Expired sponsorship opportunity

Do not leave blank screens when there is no data.

==================================================
32. SECURITY-RELATED FRONTEND BEHAVIOR
==================================================

The frontend should demonstrate good security practices.

Include:

- Protected routes
- Role-aware navigation
- Form validation
- File type validation
- File size validation
- Locked submitted applications
- Clear authentication states
- Proper error states
- No exposure of internal fraud information to students/sponsors

IMPORTANT:
Do not treat frontend authorization as actual security.

Backend authorization will eventually enforce the real permissions.

Never place secrets/API keys/passwords directly into frontend code.

==================================================
33. PROJECT SCOPE
==================================================

This is a BSc final-year project.

Prioritize:
- Core functionality
- Clean architecture
- Usability
- Security awareness
- Demonstrable workflow
- Maintainable React components
- Good UI

Avoid:
- Payment processing
- Chat/messaging
- Complex recommendation algorithms
- AI fraud detection
- Social features
- Excessive analytics
- Unnecessary animations
- Complex real-time features unless later required
- Enterprise-level microfrontend architecture
- Overengineering

==================================================
34. DEVELOPMENT APPROACH
==================================================

IMPORTANT FOR HOW YOU WORK WITH ME:

I am learning React.

Do NOT immediately generate the entire frontend.

Work with me incrementally.

Before implementing a major section:
1. Explain what we are building.
2. Explain why the structure makes sense.
3. Identify the React concepts involved.
4. Then implement it.
5. Explain important parts of the implementation.
6. Let me review it before moving to the next major section.

If a requirement is ambiguous, ask me before making a major assumption.

Do not change decisions that I have already explicitly made unless you identify a genuine technical problem.

If you think a feature should be added, explain:
- Why it is necessary
- What problem it solves
- How much complexity it adds

Then let me decide.

==================================================
35. DEVELOPMENT ORDER
==================================================

Follow this general implementation order:

PHASE 1:
Project setup
- React
- Vite
- Tailwind CSS
- React Router
- Fonts
- Global design tokens/styles
- Folder/component structure

PHASE 2:
Shared layout
- Sidebar
- Page header
- Main content layout
- Buttons
- Cards
- Status badges
- Forms
- Modals

PHASE 3:
Authentication UI
- Landing page
- Login
- Student registration
- Sponsor registration
- Forgot password

PHASE 4:
Student interface
- Dashboard
- Sponsorship browsing
- Sponsorship details
- Application form
- Draft functionality
- Application tracking
- Application history
- Notifications
- Profile
- Academic records
- Seeking Sponsorship

PHASE 5:
Sponsor interface
- Dashboard
- My Sponsorships
- Create Sponsorship
- Sponsorship details
- Applications
- Application details
- Students Seeking Sponsorship
- Student profile
- Notifications
- Profile

PHASE 6:
Admin interface
- Dashboard
- Flagged applications
- Flagged application details/review
- Fraud results display
- Request additional information
- Information requests
- Recent activity
- Notifications
- Profile

PHASE 7:
Connect frontend workflows
- Application states
- Role-based navigation
- Protected routes
- Forms
- Loading/error/empty states
- Notifications
- API integration when backend is ready

PHASE 8:
Testing and refinement
- Responsive behavior
- Validation
- Navigation
- Role permissions
- Application workflow
- UI consistency
- Accessibility basics

==================================================
36. FIRST TASK
==================================================

DO NOT START CODING THE ENTIRE APPLICATION.

First, inspect the current project structure.

Then tell me:

1. What files/folders currently exist.
2. Whether React/Vite/Tailwind are already configured.
3. What needs to be installed or configured.
4. Your recommended folder/component architecture based on the requirements above.
5. Any conflicts between the existing project and this specification.

Then WAIT for my approval before making major structural changes.

Do not generate all pages at once.

We will build this frontend collaboratively and incrementally.