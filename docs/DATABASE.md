# Database Schema

ClimaTech uses **Supabase PostgreSQL 15** with Row-Level Security (RLS) on all tables.

**Supabase Project ID:** `rbwyhwgkvdykgjynkypk`

## Custom Enums

```sql
user_role:         'operations' | 'technician' | 'supervisor' | 'admin'
job_status:        'scheduled' | 'in_progress' | 'supervisor_review' | 'approved' | 'report_sent'
photo_status:      'pending' | 'approved' | 'rejected'
service_type:      'installation' | 'maintenance' | 'repair'
activity_type:     'status_change' | 'photo_upload' | 'photo_review' | 'note' | 'report' | 'assignment'
notification_type: 'route_published' | 'job_ready_for_review' | 'photo_rejected' | 'job_rejected' | 'job_approved' | 'report_sent' | 'job_overdue'
```

## Tables

### profiles

Extends `auth.users`. Auto-created on signup via trigger.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | FK → auth.users(id) ON DELETE CASCADE |
| full_name | text NOT NULL | |
| email | text NOT NULL | |
| phone | text | |
| role | user_role | Default: `'technician'` |
| zone | text | Geographic zone |
| supervisor_id | uuid | FK → profiles(id), self-referencing |
| is_active | boolean | Default: `true` |
| created_at | timestamptz | |
| updated_at | timestamptz | Auto-updated via trigger |

**Indexes:** `role`, `supervisor_id`

### clients

Standalone customer records, optionally linked to jobs.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | |
| email | text | |
| phone | text | |
| company | text | |
| created_at | timestamptz | |

**Indexes:** `name`

### routes

Daily route assigned to a technician.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| technician_id | uuid NOT NULL | FK → profiles(id) |
| date | date NOT NULL | |
| published | boolean | Default: `false` |
| published_at | timestamptz | Set when published |
| created_by | uuid NOT NULL | FK → profiles(id) |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | Auto-updated via trigger |

**Unique constraint:** `(technician_id, date)` — one route per technician per day
**Indexes:** `date`, `technician_id`

### jobs

Individual service stop within a route.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| route_id | uuid NOT NULL | FK → routes(id) ON DELETE CASCADE |
| route_order | integer | Default: `0` |
| client_id | uuid | FK → clients(id), nullable |
| client_name | text NOT NULL | Denormalized from client |
| client_email | text | For report delivery |
| client_phone | text | |
| address | text NOT NULL | |
| latitude | double precision | |
| longitude | double precision | |
| service_type | service_type NOT NULL | |
| equipment | text | E.g., "Carrier 24BTU Split" |
| technician_id | uuid NOT NULL | FK → profiles(id) |
| supervisor_id | uuid NOT NULL | FK → profiles(id) |
| estimated_time | integer | Minutes |
| instructions | text | |
| status | job_status | Default: `'scheduled'` |
| supervisor_notes | text | Written during approval |
| report_sent | boolean | Default: `false` |
| report_sent_at | timestamptz | |
| report_token | uuid UNIQUE | For public report URL |
| report_token_expires_at | timestamptz | 30 days from send |
| created_at | timestamptz | |
| updated_at | timestamptz | Auto-updated via trigger |

**Indexes:** `route_id`, `technician_id`, `supervisor_id`, `status`, `report_token`

### photos

Evidence photos uploaded by technicians, reviewed by supervisors.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| job_id | uuid NOT NULL | FK → jobs(id) ON DELETE CASCADE |
| storage_path | text NOT NULL | `{jobId}/{timestamp}.{ext}` |
| description | text NOT NULL | E.g., "Ubicacion propuesta" |
| status | photo_status | Default: `'pending'` |
| reject_reason | text | Set on rejection |
| rejected_by | uuid | FK → profiles(id) |
| approved_by | uuid | FK → profiles(id) |
| uploaded_by | uuid NOT NULL | FK → profiles(id) |
| latitude | double precision | Captured at upload |
| longitude | double precision | |
| replaces_id | uuid | FK → photos(id), self-ref |
| created_at | timestamptz | |

**Indexes:** `job_id`, `status`

### materials

Checklist of equipment/supplies for a job.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| job_id | uuid NOT NULL | FK → jobs(id) ON DELETE CASCADE |
| name | text NOT NULL | |
| quantity | integer | Default: `1` |
| checked | boolean | Default: `false` |
| created_at | timestamptz | |

**Indexes:** `job_id`

### activity_log

Immutable audit trail for every job action.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| job_id | uuid NOT NULL | FK → jobs(id) ON DELETE CASCADE |
| action | text NOT NULL | Human-readable description |
| details | jsonb | Optional metadata |
| performed_by | uuid NOT NULL | FK → profiles(id) |
| type | activity_type NOT NULL | |
| created_at | timestamptz | |

**Indexes:** `job_id`, `created_at`
**Constraint:** No UPDATE or DELETE policies — insert only.

### notifications

In-app alerts with Supabase Realtime.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid NOT NULL | FK → profiles(id) ON DELETE CASCADE |
| type | notification_type NOT NULL | |
| title | text NOT NULL | |
| message | text NOT NULL | |
| job_id | uuid | FK → jobs(id) ON DELETE SET NULL |
| read | boolean | Default: `false` |
| created_at | timestamptz | |

**Indexes:** `user_id`, `(user_id, read=false)` partial index
**Realtime:** Enabled via `ALTER PUBLICATION supabase_realtime ADD TABLE notifications`

## RLS Policies

### Helper Function

```sql
CREATE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$ SELECT role FROM public.profiles WHERE id = auth.uid() $$;
```

### Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| **profiles** | All authenticated | Admin only | Own profile OR admin | — |
| **clients** | ops/admin/supervisor | ops/admin | ops/admin | — |
| **routes** | ops/admin=all; tech=own; sup=tech's | ops/admin | ops/admin | ops/admin (unpublished only) |
| **jobs** | ops/admin=all; tech=own; sup=assigned | ops/admin | ops/admin=any; tech=own; sup=assigned | ops/admin |
| **photos** | Job access | Tech on own jobs | Sup on assigned jobs | — |
| **materials** | Job access | ops/admin | Any authenticated | ops/admin |
| **activity_log** | Job access | Any authenticated | — (immutable) | — (immutable) |
| **notifications** | Own only | Any authenticated | Own only (mark read) | — |

## Storage

### Bucket: `job-photos`

- **Access:** Private (authenticated only)
- **Size limit:** 10MB per file
- **Allowed types:** `image/jpeg`, `image/png`, `image/webp`
- **Path format:** `{jobId}/{timestamp}.{ext}`

**Storage Policies:**
- INSERT: Any authenticated user
- SELECT: Any authenticated user
- DELETE: Admin only

**Signed URLs:**
- Supervisor review: 1 hour expiry
- Client report email: 30 day expiry

## Triggers

All tables with `updated_at` columns have an auto-update trigger:

```sql
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON {table}
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

A trigger on `auth.users` auto-creates a profile row:

```sql
CREATE FUNCTION public.handle_new_user()
  -- Copies raw_user_meta_data.full_name and email into profiles
```

## Entity Relationship Diagram

```
auth.users ─────── profiles ◄──── supervisor_id (self-ref)
                       │
              ┌────────┼──────────────┐
              ▼        ▼              ▼
           routes    jobs ◄──── photos
              │        │              │
              │        ├──── materials replaces_id (self-ref)
              │        ├──── activity_log
              │        └──── notifications
              │
              └── technician_id + created_by → profiles
```
