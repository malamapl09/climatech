-- Add 'cancelled' to job_status enum
ALTER TYPE public.job_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Add 'cancellation' to activity_type enum
ALTER TYPE public.activity_type ADD VALUE IF NOT EXISTS 'cancellation';

-- Add 'job_cancelled' to notification_type enum
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'job_cancelled';

-- Also add 'job_overdue' if it doesn't exist (was referenced in code but never migrated)
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'job_overdue';

-- Add cancellation columns to jobs
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
