# API Reference

ClimaTech uses two patterns for data operations:

- **Server Actions** (`lib/actions/`) — CRUD operations called from Server Components and Client Components via `useTransition`
- **API Routes** (`app/api/`) — Business logic with side effects (status transitions, notifications, emails)

All endpoints require authentication unless noted otherwise.

## API Routes

### Jobs

#### POST `/api/jobs/[id]/start`

Transitions a job from `scheduled` to `in_progress`.

**Auth:** Technician must be assigned to the job.

**Side effects:**
- Updates job status
- Logs activity: `"Trabajo iniciado"`

**Errors:**
- 401 — Not authenticated
- 403 — Not the assigned technician
- 400 — Job not in `scheduled` status

---

#### POST `/api/jobs/[id]/complete`

Technician submits job for supervisor review.

**Auth:** Technician must be assigned to the job.

**Validation:** Job must have at least 1 photo.

**Side effects:**
- Updates job status to `supervisor_review`
- Creates notification for the assigned supervisor (`job_ready_for_review`)
- Logs activity: `"Trabajo enviado a revision del supervisor"`

**Errors:**
- 400 — No photos uploaded
- 400 — Job not in `in_progress` status

---

#### POST `/api/jobs/[id]/approve`

Supervisor approves the completed job.

**Auth:** Supervisor must be assigned to the job.

**Validation:** All photos must be approved (no pending or rejected).

**Body:**
```json
{ "notes": "Optional supervisor observations" }
```

**Side effects:**
- Updates job status to `approved` and sets `supervisor_notes`
- Creates notification for technician (`job_approved`)
- Logs activity: `"Trabajo aprobado por supervisor"`

---

#### POST `/api/jobs/[id]/reject`

Supervisor rejects the job, returning it to the technician.

**Auth:** Supervisor must be assigned to the job.

**Body (required):**
```json
{ "reason": "Description of what needs to be fixed" }
```

**Side effects:**
- Updates job status back to `in_progress`
- Creates notification for technician (`job_rejected`)
- Logs activity: `"Trabajo rechazado: {reason}"`

---

#### POST `/api/jobs/[id]/send-report`

Generates a report token, renders email, sends to client.

**Auth:** Supervisor must be assigned. Job must be `approved`.

**Validation:** Client email must exist on the job.

**Side effects:**
- Generates UUID report token (30-day expiry)
- Generates signed photo URLs (30-day expiry)
- Renders React Email template with job data + photos
- Sends email via Resend
- Updates job status to `report_sent`
- If email fails, **rolls back** status to `approved`
- Logs activity: `"Reporte enviado al cliente: {email}"`

**Response:**
```json
{ "success": true, "reportUrl": "https://app/api/reporte/{token}" }
```

### Photos

#### POST `/api/photos/[id]/approve`

Supervisor approves a photo.

**Auth:** Supervisor of the photo's job.

**Side effects:**
- Updates photo status to `approved`, sets `approved_by`
- Logs activity: `"Foto aprobada: {description}"`

---

#### POST `/api/photos/[id]/reject`

Supervisor rejects a photo with a reason.

**Auth:** Supervisor of the photo's job.

**Body (required):**
```json
{ "reason": "Photo is blurry" }
```

**Side effects:**
- Updates photo status to `rejected`, sets `reject_reason` and `rejected_by`
- Creates notification for technician (`photo_rejected`)
- Logs activity: `"Foto rechazada: {description} - {reason}"`

### Routes

#### POST `/api/routes/[id]/publish`

Publishes a route, making it visible to the assigned technician.

**Auth:** Operations or admin role.

**Validation:** Route must have at least 1 job.

**Side effects:**
- Sets `published = true` and `published_at = now()`
- Creates notification for the technician (`route_published`)
- Logs activity on each job: `"Ruta publicada"`

### Public

#### GET `/api/reporte/[token]`

**No authentication required.** Returns an HTML page with the job report.

**Validation:** Token must exist and not be expired (30-day window).

**Response:** Rendered HTML with:
- ClimaTech branding
- Client info, service type, equipment
- Approved photos with signed URLs
- Supervisor observations
- Technician name

---

## Server Actions

Located in `lib/actions/`. Called from Server Components and Client Components.

### auth.ts

| Function | Returns | Description |
|---|---|---|
| `login(formData)` | Redirect or `{ error }` | Email + password sign-in |
| `signOut()` | Redirect | Terminates session |

### routes.ts

| Function | Returns | Description |
|---|---|---|
| `getRoutesForDate(date)` | `RouteWithJobs[]` | All routes for a given date with technician + jobs |
| `getRoute(id)` | `RouteWithJobs` | Single route with jobs sorted by `route_order` |
| `createRoute({ technicianId, date, notes })` | `Route` | Creates route, sets `created_by` |
| `updateRoute(id, { notes })` | `Route` | Updates route notes |
| `deleteRoute(id)` | `void` | Throws if route is published |

### jobs.ts

| Function | Returns | Description |
|---|---|---|
| `getJobsForRoute(routeId)` | `JobWithPhotos[]` | Jobs ordered by `route_order` |
| `getJob(id)` | `JobWithDetails` | Full join: photos, materials, tech, supervisor, log |
| `createJob(data)` | `Job` | Creates job with `status = "scheduled"` |
| `updateJob(id, data)` | `Job` | Whitelisted fields only |
| `deleteJob(id)` | `void` | Cascades to photos, materials, log |

### clients.ts

| Function | Returns | Description |
|---|---|---|
| `getClients()` | `Client[]` | All clients ordered by name |
| `createOrFindClient(input)` | `Client` | Finds by email or creates new |

### materials.ts

| Function | Returns | Description |
|---|---|---|
| `getMaterials(jobId)` | `Material[]` | All materials for a job |
| `addMaterials(jobId, items)` | `Material[]` | Batch insert with `checked = false` |
| `updateMaterial(id, data)` | `Material` | Update name, quantity, or checked |
| `deleteMaterial(id)` | `void` | |

### activity-log.ts

| Function | Returns | Description |
|---|---|---|
| `logActivity({ jobId, action, details, type })` | `void` | Insert log entry with current user |
| `getActivityLog(jobId)` | `ActivityEntry[]` | Entries with performer name, sorted by date |

### notifications.ts

| Function | Returns | Description |
|---|---|---|
| `createNotification({ userId, type, title, message, jobId })` | `void` | Insert notification |
| `getNotifications()` | `Notification[]` | Current user, limit 50, newest first |
| `markAsRead(id)` | `void` | Mark single notification read |
| `markAllAsRead()` | `void` | Mark all of current user's notifications read |

### users.ts (Admin only)

| Function | Returns | Description |
|---|---|---|
| `getUsers()` | `ProfileWithSupervisor[]` | All users with supervisor name |
| `getUser(id)` | `Profile` | Single user |
| `createUser(data)` | `AuthUser` | Uses admin client for `auth.admin.createUser` |
| `updateUser(id, data)` | `void` | Update name, phone, role, zone, supervisor, active |
| `toggleUserActive(id, isActive)` | `void` | Enable/disable user |

---

## Authentication Flow

### Supabase Clients

Three client types, each for a different context:

```
lib/supabase/server.ts  → createClient()       → Cookie-based, used in Server Components + Actions
lib/supabase/client.ts  → createClient()       → Browser-based, used in Client Components
lib/supabase/admin.ts   → createAdminClient()  → Service role key, used for user creation
```

### Middleware

`middleware.ts` runs on every request:

1. Refreshes the auth session (updates cookies)
2. Unauthenticated users → redirect to `/iniciar-sesion`
3. Authenticated users on auth pages → redirect to `/`
4. Public route `/api/reporte/[token]` passes through without auth

### Role-Based Routing

The root page (`/`) reads the user's profile role and redirects:

| Role | Redirect |
|---|---|
| operations | `/operaciones` |
| technician | `/tecnico` |
| supervisor | `/supervisor` |
| admin | `/admin` |

Each dashboard section has its own `layout.tsx` that calls `requireRole()` to enforce access.

---

## Email System

### Sending Email

`lib/email/send.ts` wraps the Resend SDK:

```typescript
sendEmail({ to: string, subject: string, html: string })
```

Uses `RESEND_API_KEY` and `RESEND_FROM_EMAIL` env vars.

### Templates

`lib/email/templates/client-report.tsx` — React Email component for client reports:

- Navy branded header with ClimaTech logo
- Job details: client, address, service type, equipment
- Supervisor observations
- Approved photo gallery
- Link to online report (`/api/reporte/[token]`)

---

## Data Flow Patterns

### Server Component → Client Component

```
Server Page (fetches data via Supabase)
  └── Client Component (receives data as props)
        ├── Displays UI
        └── Calls fetch("/api/...") for mutations
              └── On success: router.refresh() to revalidate server data
```

### Photo Upload Flow

```
Client: PhotoUpload component
  1. File input (accept="image/*" capture="environment")
  2. Validate type (jpeg/png/webp) and size (<10MB)
  3. Compress with browser-image-compression (maxSizeMB: 1, maxWidthOrHeight: 1920)
  4. Capture GPS coordinates via navigator.geolocation
  5. Upload to Supabase Storage: job-photos/{jobId}/{timestamp}.{ext}
  6. Insert photo record in photos table
  7. Insert activity_log entry
  8. Call onUploaded() → parent calls router.refresh()
```

### Notification Delivery

```
API Route (e.g., /api/jobs/[id]/complete)
  1. Update job status
  2. Insert notification into notifications table
  3. Supabase Realtime broadcasts INSERT to subscribers

Client: NotificationBell component
  1. Subscribes to postgres_changes on notifications table
  2. Filters for current user's notifications
  3. Shows toast via Sonner
  4. Updates unread count badge
```

### Report Generation

```
Supervisor clicks "Send Report"
  1. POST /api/jobs/[id]/send-report
  2. Server generates UUID report token (30-day expiry)
  3. Server generates signed photo URLs (30-day expiry)
  4. Server renders React Email template → HTML
  5. Server persists token + updates status to report_sent
  6. Server sends email via Resend
  7. If email fails → rollback status to approved
  8. Client link: /api/reporte/{token} → public HTML page
```
