# PRD: ClimaTech — Field Service Management Platform

**Version:** 3.1
**Date:** February 20, 2026
**Author:** Product Team
**Status:** Draft for Review

---

## 1. Executive Summary

ClimaTech is a web-based field service management platform designed for HVAC distribution and installation companies. It replaces informal communication flows (WhatsApp, phone calls) with a structured system that connects operations, technicians, supervisors, and clients in a unified workflow.

The platform solves four critical problems: disorganized daily route coordination and assignments, the lack of organized photo evidence with formal supervisor approvals, the absence of systematic quality control before delivering to the client, and the lack of a centralized, auditable record of every job.

### Core Workflow

```
Operations plans daily routes for each technician
        ↓
Each technician sees their route with stops, instructions, and materials
        ↓
Technician executes at each site and uploads photo evidence
        ↓
Technician marks job as completed
        ↓
Supervisor reviews photos, approves or rejects each one
        ↓
Supervisor approves the complete job
        ↓
Supervisor sends final report to client
```

**Important note:** The client does NOT participate in the photo approval process. The supervisor is the one who reviews and approves all photo evidence. The client only receives the final report once everything has been approved internally.

---

## 2. Context and Problem

### Current State

- 50+ field technicians use WhatsApp to communicate with the office.
- Daily routes are communicated via calls or messages, with no visual planning tool.
- Photo evidence gets lost in chat threads and is not linked to work orders.
- There is no formal quality supervision process for photo evidence.
- Final reports are generated manually or not generated at all.
- There is no traceability or activity log per installation.
- Operations has no real-time visibility into route progress.

### Problem Impact

- **Logistics:** Inefficient routes, technicians unclear about their daily stops, forgotten materials.
- **Operations:** Rework due to lack of prior supervision, inconsistent quality across technicians.
- **Quality:** Without systematic photo review, errors are not caught before client delivery.
- **Legal/Commercial:** No formal, approved evidence of completed work.
- **Efficiency:** Supervisors cannot review multiple installations in an organized way.

### Project Objectives

| Objective | Metric | Target |
|---|---|---|
| Centralize route planning | % of routes assigned in the platform | 95% within 3 months |
| Eliminate WhatsApp for job management | % of jobs managed in the platform | 90% within 3 months |
| Ensure photo review by supervisor | % of photos reviewed before report | 100% |
| Ensure quality supervision | % of jobs reviewed by supervisor | 100% |
| Generate automatic client reports | % of jobs with report sent | 95% |
| Full traceability | Jobs with complete activity log | 100% |
| Reduce logistics errors | Missing materials incidents | -50% |

---

## 3. Users and Roles

### 3.1 Operations (Route Coordinator)

- **Profile:** Office staff responsible for planning daily routes and assigning jobs to technicians.
- **Needs:** Centralized view of all technicians and their routes, create and reorder stops, assign instructions and materials, monitor progress in real time.
- **Estimated volume:** 3–5 users.
- **Primary device:** Desktop/laptop.

### 3.2 Field Technician

- **Profile:** Field personnel who execute the installation or maintenance on site.
- **Needs:** See their daily route with stops in order, clear instructions, materials list, upload photo evidence, mark job as completed.
- **Estimated volume:** 50+ active users.
- **Primary device:** Smartphone (Android/iOS via browser).

### 3.3 Supervisor

- **Profile:** Engineer or senior technician responsible for verifying work quality and photo evidence.
- **Needs:** Review and approve/reject each photo individually, approve or reject the complete job, add observations, send final report to client.
- **Estimated volume:** 5–10 users.
- **Primary device:** Laptop/tablet, also mobile.

### 3.4 Client

- **Profile:** Person or company that contracted the service. Passive role — only receives the final report.
- **Needs:** Receive final report via email with photo evidence, supervisor observations, and work summary. Optionally, view the report on a web portal.
- **Estimated volume:** Variable, one client per job.
- **Primary device:** Any (receives email, optionally views portal).

### 3.5 Administrator

- **Profile:** Operations manager or business owner. Needs full visibility.
- **Needs:** Dashboard with all jobs, daily metrics, filters by status/technician/supervisor, export data.
- **Estimated volume:** 2–5 users.
- **Primary device:** Desktop/laptop.

---

## 4. Detailed Workflow

### 4.1 Route Planning (Operations)

1. Operations accesses the Operations Center and sees the list of all available technicians.
2. For each technician, Operations creates the daily route by adding stops (jobs) in order.
3. Each stop includes:
   - Client data (name, phone, email).
   - Site address.
   - Service type (Installation, Maintenance, Repair).
   - Equipment to install or service.
   - Estimated visit time.
   - Specific instructions for the technician.
   - List of materials the technician must bring.
   - Assigned supervisor.
4. Operations can reorder stops to optimize the route.
5. Once finished, Operations publishes the routes. Technicians receive notification.
6. Operations monitors progress in real time: which technicians are on site, which have finished, which are running late.

### 4.2 Daily Route (Technician)

1. The technician opens the app and sees their daily route as an ordered list of stops.
2. For each stop they can see:
   - Stop number in the sequence.
   - Client name and service type.
   - Address with navigation link.
   - Estimated time.
   - Detailed work instructions.
   - List of required materials.
3. The active stop (in progress) is visually highlighted with all information expanded.
4. Completed stops are marked with a status indicator.
5. Upcoming stops show a summary so the technician can prepare.

### 4.3 Field Execution (Technician)

1. The technician indicates they are on their way. Status changes to **In Progress**.
2. Upon arrival, they log their arrival on site.
3. During the installation, the technician uploads photo evidence at key points:
   - Proposed location for units.
   - Pipe routing.
   - Completed perforations.
   - Mounted equipment.
   - Electrical connections.
   - Functionality tests.
4. Each photo includes a mandatory description and is recorded with a timestamp.
5. The technician can add text notes to the activity log at any time.

### 4.4 Technician Completion

1. When the technician finishes the job, they mark the stop as completed.
2. The status changes to **Supervisor Review**.
3. The assigned supervisor receives a notification with the number of photos to review.
4. The technician can continue to the next stop on their route.

### 4.5 Supervisor Review (Photos + Job)

This is the key quality control step. The supervisor performs two levels of review:

**Photo Review (individual):**
1. The supervisor sees all photos uploaded by the technician.
2. For each photo, the supervisor can:
   - **Approve**: the photo is marked as approved.
   - **Reject**: must provide a reason (e.g., "blurry photo", "connection not fully visible", "missing drainage photo").
3. If a photo is rejected, the technician receives a notification and must upload a new photo.

**Job Approval (global):**
1. Once all photos are approved, the supervisor can approve the complete job.
2. The supervisor writes their general observations about the work.
3. Two possible actions:
   - **Approve job**: status changes to **Approved by Supervisor**. Report sending is enabled.
   - **Reject job**: must provide a reason. The job returns to **In Progress** and the technician receives a notification with the required corrections.

### 4.6 Sending Report to Client

1. With the job approved, the supervisor can preview the final report.
2. The report includes:
   - Client data and address.
   - Service type and equipment installed/serviced.
   - All photo evidence approved by the supervisor.
   - Supervisor observations.
   - Activity summary.
3. The supervisor confirms sending. The report is sent to the client's email.
4. The status changes to **Report Sent**.

**The client does NOT participate in any approval step. They only receive the finished product: the final report.**

---

## 5. Job States

| State | Description | Next State |
|---|---|---|
| **Scheduled** | Job created by operations and assigned to a technician's route. | In Progress |
| **In Progress** | Technician on site executing the job and uploading photos. | Supervisor Review |
| **Supervisor Review** | Technician finished. Supervisor reviews each photo and the complete job. | Approved by Supervisor / In Progress (rejection) |
| **Approved by Supervisor** | All photos approved and job approved. Ready to send report. | Report Sent |
| **Report Sent** | Final report sent to client. Job closed. | — (final state) |

---

## 6. Functional Requirements

### 6.1 Route Planning (Operations)

| ID | Requirement | Priority |
|---|---|---|
| F-001 | Operations Center view with all technicians and their daily routes. | High |
| F-002 | Create daily route for each technician by adding stops in sequential order. | High |
| F-003 | Each stop includes: client, address, service type, equipment, estimated time, instructions, and materials. | High |
| F-004 | Reorder stops within a route via drag-and-drop. | High |
| F-005 | Assign supervisor to each job at planning time. | High |
| F-006 | Publish routes — technicians receive notification of their daily route. | High |
| F-007 | Monitor progress in real time: status of each technician and their stops. | High |
| F-008 | Expandable view per technician showing the route timeline. | High |
| F-009 | Visual status indicators per technician: on site, in transit, delayed. | Medium |
| F-010 | Reassign a job from one technician to another during the day. | Medium |
| F-011 | Add an emergency stop to an already published route. | Medium |
| F-012 | Workload indicators per technician (number of stops, estimated hours). | Medium |
| F-013 | Duplicate a previous day's route as a template. | Low |
| F-014 | Map view with location of all technicians and their stops. | Low |

### 6.2 Daily Route (Technician View)

| ID | Requirement | Priority |
|---|---|---|
| F-020 | Daily route view with all stops in sequential order. | High |
| F-021 | Route summary: total stops, completed, pending. | High |
| F-022 | Active stop visually highlighted with expanded information (instructions, materials, address). | High |
| F-023 | Materials list per stop for verification before departure. | High |
| F-024 | Specific instructions visible for each stop. | High |
| F-025 | Estimated time per stop. | High |
| F-026 | Upcoming stops with visible summary for preparation. | High |
| F-027 | Completed stops with status indicator. | High |
| F-028 | Navigation link (Google Maps / Waze) from the address. | Medium |
| F-029 | Materials checklist that the technician can mark as verified. | Medium |
| F-030 | Service type indicator with color coding. | Medium |

### 6.3 Job Management

| ID | Requirement | Priority |
|---|---|---|
| F-040 | Create work order with client data, address, equipment, service type, technician, and supervisor. | High |
| F-041 | Service types: Installation, Maintenance, Repair. | High |
| F-042 | Edit work order before execution begins. | High |
| F-043 | Cancel work order with mandatory reason. | Medium |
| F-044 | Reassign technician or supervisor at any time. | Medium |

### 6.4 Photos and Evidence

| ID | Requirement | Priority |
|---|---|---|
| F-050 | Upload photos from device camera or gallery. | High |
| F-051 | Each photo requires a mandatory description. | High |
| F-052 | Automatically record timestamp and geolocation for each photo. | High |
| F-053 | Automatic image compression to optimize bandwidth. | High |
| F-054 | Photos remain in "pending" status until the supervisor reviews them. | High |
| F-055 | Photo gallery with filter by status (approved, pending, rejected). | Medium |
| F-056 | Allow uploading a replacement photo linked to the original rejected one. | Medium |

### 6.5 Photo Review by Supervisor

| ID | Requirement | Priority |
|---|---|---|
| F-060 | Supervisor can see all photos for a job pending review. | High |
| F-061 | Supervisor can approve each photo individually. | High |
| F-062 | Supervisor can reject each photo individually with a mandatory reason. | High |
| F-063 | If a photo is rejected, the technician receives immediate notification with the reason. | High |
| F-064 | Visual counter of photos to review, approved, and rejected. | High |
| F-065 | Supervisor CANNOT approve the complete job until all photos have been reviewed (approved or replaced). | High |
| F-066 | Technician can upload a new photo as replacement for a rejected one. | High |

### 6.6 Job Approval by Supervisor

| ID | Requirement | Priority |
|---|---|---|
| F-070 | Supervisor dashboard showing jobs pending review as priority. | High |
| F-071 | Supervisor can see the complete activity log for the job. | High |
| F-072 | Supervisor observations field (free text). | High |
| F-073 | Approve complete job — only enabled when all photos are approved. | High |
| F-074 | Reject complete job — requires reason, returns job to In Progress. | High |
| F-075 | On rejection, technician receives notification with required corrections. | High |
| F-076 | Metrics for technicians assigned to the supervisor. | Medium |

### 6.7 Activity Log

| ID | Requirement | Priority |
|---|---|---|
| F-080 | Automatic recording of all status changes with timestamp. | High |
| F-081 | Automatic recording of each photo upload with description. | High |
| F-082 | Automatic recording of each photo approval/rejection by the supervisor. | High |
| F-083 | Allow technician to add manual text notes. | High |
| F-084 | Each entry records who performed the action and when. | High |
| F-085 | Activity log is immutable — entries cannot be edited or deleted. | High |

### 6.8 Client Report

| ID | Requirement | Priority |
|---|---|---|
| F-090 | Auto-generate report with job data, approved photos, and supervisor observations. | High |
| F-091 | Report includes: service type, equipment, technician, approved photos, observations. | High |
| F-092 | Preview report before sending. | High |
| F-093 | Send report via email to the client. | High |
| F-094 | Record report send date and time in the activity log. | High |
| F-095 | Also send report via WhatsApp as a link. | Medium |
| F-096 | Client can download the report as PDF from a web link. | Medium |
| F-097 | Read-only web portal where the client can view their report (no approval buttons). | Medium |

### 6.9 Admin Panel

| ID | Requirement | Priority |
|---|---|---|
| F-100 | Dashboard with daily metrics: total jobs, by status, by service type. | High |
| F-101 | Table of all jobs with filters by status, technician, supervisor, type, date. | High |
| F-102 | Detail view of any job with photos and activity log. | High |
| F-103 | Export job list to CSV/Excel. | Medium |
| F-104 | User management: create, edit, deactivate technicians, supervisors, and operators. | High |
| F-105 | Assignment of technicians to supervisors. | High |
| F-106 | Historical reports by period. | Medium |

### 6.10 Notifications

| ID | Requirement | Priority |
|---|---|---|
| F-110 | Notify technician when Operations publishes their daily route. | High |
| F-111 | Notify supervisor when a job is ready for review (with # of photos). | High |
| F-112 | Notify technician when supervisor rejects a photo (with reason). | High |
| F-113 | Notify technician when supervisor rejects the complete job (with reason). | High |
| F-114 | Email notification to client with the final report. | High |
| F-115 | Alert Operations when a technician is running late on their route. | Medium |
| F-116 | Configurable notifications (enable/disable by type). | Low |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| ID | Requirement |
|---|---|
| NF-001 | Photo upload must complete in under 5 seconds on a 4G connection. |
| NF-002 | Operations and admin dashboard must load in under 2 seconds. |
| NF-003 | Push notifications must be delivered in under 10 seconds. |
| NF-004 | Platform must support 100 concurrent users without degradation. |

### 7.2 Availability and Reliability

| ID | Requirement |
|---|---|
| NF-010 | 99.5% availability during business hours (Mon–Sat 7:00 AM–8:00 PM). |
| NF-011 | Uploaded photos must not be lost under any circumstance (redundant storage). |
| NF-012 | If connection is lost, photos must be stored locally and uploaded upon reconnection. |

### 7.3 Security

| ID | Requirement |
|---|---|
| NF-020 | Email and password authentication for internal users via Supabase Auth (operations, technicians, supervisors, admin). |
| NF-021 | Client portal is read-only — accessible by token link, with no ability to modify data. |
| NF-022 | Client access tokens expire after 30 days. |
| NF-023 | All communications over HTTPS. |
| NF-024 | Photos are stored in Supabase Storage with a private bucket and access policies integrated with Auth. |
| NF-025 | Roles and permissions: each role can only perform the actions defined for their profile. |

### 7.4 Usability

| ID | Requirement |
|---|---|
| NF-030 | Interface entirely in Spanish (target user base). |
| NF-031 | Mobile-first design for the technician view. |
| NF-032 | Photo upload must be achievable in a maximum of 3 taps. |
| NF-033 | Clear iconography and consistent color codes for statuses and service types. |
| NF-034 | Technician's route must be readable at a glance, prioritizing the active stop. |

### 7.5 Scalability

| ID | Requirement |
|---|---|
| NF-040 | Architecture must support growth to 200 technicians without major changes. |
| NF-041 | Photo storage must scale automatically. |

---

## 8. Proposed Technical Architecture

### 8.1 Technology Stack

The stack prioritizes operational simplicity and reduced cost. By using managed services (Supabase + Vercel), DevOps tasks are eliminated and the infrastructure to maintain is reduced to just 3 services instead of 6-7 separate components.

| Component | Technology | Justification |
|---|---|---|
| **Frontend + API** | Next.js on Vercel | Full-stack framework: React for the frontend, API Routes for backend logic. Automatic deployments with Git push. SSR for the client portal. |
| **Database** | Supabase (PostgreSQL) | Managed PostgreSQL with visual dashboard, Row Level Security (RLS) for role-based permissions, automatic REST API over tables. |
| **Authentication** | Supabase Auth | Built-in authentication with email/password. Automatic JWT handling, sessions, and refresh tokens. No additional configuration needed. |
| **Photo Storage** | Supabase Storage | S3-compatible buckets with access policies integrated with Auth. Image transformations for automatic compression. |
| **Real-time** | Supabase Realtime | Supervisor sees new photos and status changes instantly without polling. Subscriptions to PostgreSQL table changes. |
| **Email** | Resend | Modern API for sending client reports and notifications. Native integration with React Email for professional HTML templates. |
| **Push Notifications** | Firebase Cloud Messaging | For Phase 2: push notifications to field technicians (rejected photo, published route). Cross-platform and free up to high volumes. |

**Why this stack instead of traditional infrastructure?**

The company's business is installing air conditioners, not managing servers. Supabase consolidates the database, authentication, photo storage, and real-time functionality into a single service. Vercel handles deployment with zero configuration. This means fewer things that can break, fewer bills to manage, and a smaller development team needed to maintain the platform.

### 8.2 Core Data Model

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Users      │     │    Routes     │     │    Jobs       │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id            │     │ id            │     │ id            │
│ name          │────▶│ tech_id (FK)  │────▶│ route_id (FK) │
│ email         │     │ date          │     │ route_order   │
│ role          │     │ published     │     │ client_name   │
│ password_hash │     │ published_at  │     │ client_email  │
│ phone         │     │ created_by    │     │ client_phone  │
│ zone          │     │ notes         │     │ address       │
│ active        │     │ created_at    │     │ service_type  │
│ supervisor_id │     └──────────────┘     │ equipment     │
│ created_at    │                           │ tech_id (FK)  │
└──────────────┘     ┌──────────────┐     │ sup_id (FK)   │
                      │   Photos      │     │ estimated_time│
                      ├──────────────┤     │ instructions  │
                      │ id            │     │ status        │
                      │ job_id (FK)   │◀────│ sup_notes     │
                      │ url           │     │ report_sent   │
                      │ description   │     │ report_token  │
                      │ status        │     │ created_at    │
                      │ reject_reason │     └──────────────┘
                      │ rejected_by   │
                      │ approved_by   │     ┌──────────────┐
                      │ uploaded_by   │     │  Materials    │
                      │ latitude      │     ├──────────────┤
                      │ longitude     │     │ id            │
                      │ replaces_id   │     │ job_id (FK)   │
                      │ created_at    │     │ name          │
                      └──────────────┘     │ checked       │
                                            │ created_at    │
                      ┌──────────────┐     └──────────────┘
                      │ Activity Log │
                      ├──────────────┤
                      │ id            │
                      │ job_id (FK)   │
                      │ action        │
                      │ performed_by  │
                      │ type          │
                      │ created_at    │
                      └──────────────┘
```

**Note on Photos:** `status` can be: `pending`, `approved`, `rejected`. The `rejected_by` and `approved_by` fields record which supervisor took the action. `replaces_id` links a replacement photo to the original rejected one.

**Note on Supabase RLS:** Row Level Security policies are implemented per role:
- **Operations** can read/write routes and jobs.
- **Technician** only sees jobs assigned to their route. Can insert photos and notes in the activity log.
- **Supervisor** sees all jobs from their assigned technicians. Can update photo and job status.
- **Admin** has full read access to all tables.
- **Client** (via public token) can only read the report for their specific job.

### 8.3 API Endpoints (Next.js API Routes + Supabase)

With Supabase, many CRUD operations are performed directly from the frontend using the Supabase client with Row Level Security (RLS) to control permissions. Next.js API Routes are used only for business logic that requires server-side processing.

**Direct operations with Supabase Client (frontend):**
- Reading routes, jobs, photos, activity log — filtered by RLS based on user role.
- Creating stops and routes by Operations.
- Uploading photos to Supabase Storage by technicians.
- Simple status changes (technician logs arrival, in transit, etc.).
- Real-time subscription to changes (supervisor sees new photos instantly).

**Next.js API Routes (server logic):**
- `POST /api/jobs/[id]/complete` — Technician marks job as completed (validates photos, changes status, notifies supervisor).
- `POST /api/photos/[id]/approve` — Supervisor approves photo (updates status, logs in activity log).
- `POST /api/photos/[id]/reject` — Supervisor rejects photo (validates reason, notifies technician).
- `POST /api/jobs/[id]/approve` — Supervisor approves job (validates all photos approved, changes status).
- `POST /api/jobs/[id]/reject` — Supervisor rejects job (returns to In Progress, notifies technician).
- `POST /api/jobs/[id]/send-report` — Generates and sends report via email through Resend.
- `POST /api/routes/[id]/publish` — Publishes route and sends notifications to technicians.
- `GET /api/report/[token]` — Public read-only portal for client to view their report.

---

## 9. Phase Plan

### Phase 1 — MVP (10–12 weeks)

**Objective:** Fully functional workflow to validate with a pilot group of 10 technicians.

Includes:
- Operations Center: route creation, stop assignment with instructions and materials.
- Daily route view for technicians with stops, instructions, and materials.
- Photo upload by technicians with description and timestamp.
- Photo review by supervisor: approve/reject individually.
- Complete job approval by supervisor.
- Report generation and sending via email to client.
- Automatic activity log.
- Admin dashboard with basic metrics.
- Email notifications.
- Basic authentication (login/password).
- Service types: Installation, Maintenance, Repair.

Does not include:
- Push notifications.
- Offline mode.
- Drag-and-drop for reordering routes.
- Historical reports.
- CSV export.
- Client web portal (email only).

### Phase 2 — Full Production (6–8 weeks)

- Push notifications (Firebase).
- Drag-and-drop for reordering stops in a route.
- Read-only web portal for client to view their report.
- Offline mode: local photo queue that syncs upon reconnection.
- Historical reports and CSV/Excel export.
- Full user management from the admin panel.
- Report delivery via WhatsApp as a link.
- PDF report download.
- Geolocation in photos.
- Advanced dashboard filters.
- Alerts to Operations when technicians are running late.
- Verifiable materials checklist for the technician.

### Phase 3 — Optimization and Scale (ongoing)

- Native app or PWA for technicians.
- Real-time map with technician locations (GPS).
- Automatic route optimization by distance/time.
- Google Maps / Waze integration.
- Integration with existing ERP/CRM systems.
- Digital client signature upon receiving the report.
- Post-service satisfaction survey.
- Advanced dashboard (average times, technician ranking, rejection rate).
- Materials inventory management integrated with route planning.

---

## 10. Success Metrics

| Metric | How It's Measured | Phase 1 Target | Phase 2 Target |
|---|---|---|---|
| Centralized planning adoption | % of routes created in the platform | 80% | 95% |
| Technician adoption | % of jobs with photos uploaded | 80% | 95% |
| Complete photo review | % of photos reviewed by supervisor | 100% | 100% |
| Supervision rate | % of jobs approved by supervisor | 100% | 100% |
| Reports sent | % of closed jobs with client report | 85% | 95% |
| Logistics incidents | Missing materials or address errors | -30% | -60% |
| Technician satisfaction | Internal NPS survey | > 30 | > 50 |
| Supervisor review time | Average time from technician completion to approval | < 2 hours | < 1 hour |
| Rework reduction | Comparison with prior period | -20% | -40% |

---

## 11. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Technicians do not adopt the tool. | High | High | In-person training, simple UX, pilot with champion technicians, company policy. |
| Supervisors become a bottleneck reviewing photos. | High | High | Priority notifications, review SLA (e.g., 2 hours), automatic escalation, batch photo approval option. |
| Operations finds planning slower than current method. | Medium | High | Fast UX with templates and duplication, validate flow with the operations team from the design phase. |
| Limited connectivity at installation sites. | Medium | High | Offline mode in Phase 2, aggressive photo compression. |
| Photo review volume overwhelms supervisors. | Medium | Medium | Batch approval option, smart filters, automatic prioritization. |
| Materials list not kept up to date. | Medium | Medium | Integrate with inventory in Phase 3. |

---

## 12. Explicitly Out of Scope

- Photo approval by the client (the supervisor is the only one who approves photos).
- Real-time chat between technician and client.
- Equipment and materials inventory management.
- Quotation and invoicing.
- Automatic GPS-based route optimization (Phase 3).
- Native iOS/Android app (Phase 3).
- ERP or accounting software integration.

---

## 13. Appendix: Interactive Prototype

A functional React prototype was developed demonstrating the full workflow with five views:

1. **🗺️ Operations** — Operations center with all technicians, expandable routes, and real-time status.
2. **📊 Admin** — Dashboard with metrics and complete job table.
3. **🔍 Supervisor** — Panel with jobs pending photo review. Can approve/reject each photo then approve the complete job. Sends report to client.
4. **🔧 Technician** — Daily route with numbered stops, active stop with expanded instructions and materials.
5. **👤 Client** — Read-only portal showing final reports that have been sent to them.

The prototype includes functional interactions: the supervisor can approve photos one by one, approve the job, and send the report. Available as a `.jsx` file.

**Note:** The app interface itself is in Spanish (target user base is Spanish-speaking), while this PRD is in English for stakeholder documentation purposes.
