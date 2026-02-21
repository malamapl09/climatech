# ClimaTech — HVAC Field Service Management

ClimaTech replaces WhatsApp-based coordination for 50+ HVAC field technicians with a structured web platform. The core value is a **photo-based quality control workflow**: Operations plans routes, technicians execute and upload photo evidence, supervisors review every photo individually, then approve the job and send a branded report to the client.

**Production:** [hvac-fc8fk4ag1-malamapl09s-projects.vercel.app](https://hvac-fc8fk4ag1-malamapl09s-projects.vercel.app)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend + API | Next.js 16 (App Router) on Vercel |
| UI Components | HeroUI v3 (`@heroui/react@beta`) |
| Styling | Tailwind CSS v4 + tailwind-variants |
| Database | Supabase PostgreSQL + RLS |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage (private `job-photos` bucket, 10MB) |
| Realtime | Supabase Realtime (postgres_changes on notifications) |
| Email | Resend + React Email |
| Validation | Zod + react-hook-form |
| Photo compression | browser-image-compression (1MB max, 1920px) |
| Icons | Lucide React |
| Date formatting | date-fns (Spanish locale) |
| Font | DM Sans + JetBrains Mono |

## Workflow

```
Operations          Technician           Supervisor            Client
    |                    |                    |                    |
    |-- Create Route --->|                    |                    |
    |-- Add Stops ------>|                    |                    |
    |-- Publish -------->|                    |                    |
    |                    |-- Start Job        |                    |
    |                    |-- Upload Photos -->|                    |
    |                    |-- Mark Complete -->|                    |
    |                    |                    |-- Review Photos    |
    |                    |                    |-- Approve/Reject   |
    |                    |<-- Rejection ------|                    |
    |                    |-- Re-upload ------>|                    |
    |                    |                    |-- Approve Job      |
    |                    |                    |-- Send Report ---->|
    |                    |                    |                    |-- View Report
```

**Job Status Flow:** `scheduled` → `in_progress` → `supervisor_review` → `approved` → `report_sent`

## Roles

| Role | Dashboard | Capabilities |
|---|---|---|
| **operations** | `/operaciones` | Create routes, assign technicians + supervisors, add stops with client/equipment/materials, publish routes |
| **technician** | `/tecnico` | View daily route, start/complete jobs, upload photo evidence (with GPS), check off materials |
| **supervisor** | `/supervisor` | Review photo evidence (approve/reject each), approve/reject jobs, add observations, send client report |
| **admin** | `/admin` | Dashboard metrics, manage all jobs, create/edit users, assign roles + supervisors |

## Project Structure

```
app/
├── (auth)/
│   ├── layout.tsx                          # Centered card layout
│   └── iniciar-sesion/page.tsx             # Login
├── (dashboard)/
│   ├── layout.tsx                          # Sidebar + header shell
│   ├── dashboard-shell.tsx                 # Client: sidebar toggle, mobile nav
│   ├── operaciones/page.tsx                # Route planning
│   ├── tecnico/
│   │   ├── page.tsx                        # Daily route
│   │   └── trabajo/[id]/                   # Job execution
│   ├── supervisor/
│   │   ├── page.tsx                        # Review queue
│   │   └── trabajo/[id]/                   # Photo + job review
│   ├── admin/
│   │   ├── page.tsx                        # KPI dashboard
│   │   ├── trabajos/page.tsx               # All jobs + filters
│   │   └── usuarios/                       # User management
│   └── notificaciones/page.tsx             # All roles
├── api/
│   ├── jobs/[id]/{start,complete,approve,reject,send-report}/
│   ├── photos/[id]/{approve,reject}/
│   ├── routes/[id]/publish/
│   └── reporte/[token]/                    # Public client report (no auth)
├── globals.css                             # Tailwind + ClimaTech design tokens
├── layout.tsx                              # Root: DM Sans font, Toaster
└── page.tsx                                # Role-based redirect

components/
├── layout/          # Sidebar, Header, MobileNav, nav-config
├── operations/      # RoutePlanner, RouteCard, StopForm
├── technician/      # RouteList, PhotoUpload, PhotoGrid, MaterialsList
├── supervisor/      # ReviewQueue, PhotoReviewCard, JobApprovalForm, ReportPreview
├── admin/           # DashboardStats, JobsTable, JobsFilters, UserForm
└── shared/          # StatusBadge, ServiceTypeBadge, PhotoStatusBadge, WorkflowStepper, ActivityTimeline, FormField, NotificationBell

lib/
├── actions/         # Server actions (auth, routes, jobs, clients, materials, notifications, users, activity-log)
├── email/           # Resend wrapper + React Email templates
├── supabase/        # server.ts, client.ts, admin.ts, middleware.ts
├── utils/           # cn(), date formatters, number formatters
├── labels.ts        # Spanish UI labels
└── constants.ts     # Enums, color mappings

supabase/
├── config.toml
└── migrations/
    ├── 20260221000000_initial_schema.sql   # 8 tables, enums, triggers, indexes
    ├── 20260221000001_rls_policies.sql     # get_my_role() + all RLS policies
    ├── 20260221000002_storage.sql          # job-photos bucket + policies
    └── 20260221000003_seed_data.sql        # Sample data
```

## Getting Started

### Prerequisites

- Node.js 22+ (via nvm)
- Supabase CLI (`npm i -D supabase`)
- A Supabase project (or local via `npx supabase start`)
- A Resend account for email delivery

### Setup

```bash
# Clone
git clone https://github.com/malamapl09/climatech.git
cd climatech

# Install dependencies
npm install

# Environment variables
cp .env.local.example .env.local
# Fill in your Supabase + Resend credentials

# Apply database migrations
npx supabase db push

# Start dev server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=ClimaTech <notificaciones@climaops.app>
```

| Variable | Used By | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + Server | Supabase API endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + Server | Public anon key for RLS-scoped queries |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin operations (user creation) |
| `NEXT_PUBLIC_APP_URL` | Server only | Base URL for report links in emails |
| `RESEND_API_KEY` | Server only | Email delivery via Resend |
| `RESEND_FROM_EMAIL` | Server only | Sender address for emails |

### Create Admin User

After deploying, create the first admin user via Supabase dashboard:

1. Go to **Authentication > Users** and create a user with email + password
2. Go to **Table Editor > profiles** and set the user's `role` to `admin`
3. Log in at `/iniciar-sesion` and use the Admin panel to create other users

## Design System

The app uses a custom design system with CSS variables defined in `globals.css`:

```css
--ct-navy: #1E3A5F        /* Primary brand color */
--ct-navy-light: #2D5F8A  /* Sidebar gradients */
--ct-green: #059669        /* Approved, success */
--ct-amber: #D97706        /* In progress, warnings */
--ct-blue: #0369A1         /* Supervisor review */
--ct-indigo: #4338CA       /* Reports */
--ct-red: #DC2626          /* Rejections, errors */
--ct-bg: #F5F6F8           /* Page background */
--ct-surface: #FFFFFF      /* Card surfaces */
```

## Documentation

- [DATABASE.md](./docs/DATABASE.md) — Schema, tables, RLS policies, storage
- [API.md](./docs/API.md) — API routes, server actions, auth flow, email system
