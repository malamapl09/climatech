-- ============================================================
-- ClimaTech — Initial Schema
-- 8 tables: profiles, clients, routes, jobs, photos, materials, activity_log, notifications
-- ============================================================

-- ── Helper: auto-update updated_at ──
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── Helper: auto-create profile on auth.users insert ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    'technician'
  );
  RETURN NEW;
END;
$$;

-- ── Custom types ──
CREATE TYPE public.user_role AS ENUM ('operations', 'technician', 'supervisor', 'admin');
CREATE TYPE public.job_status AS ENUM ('scheduled', 'in_progress', 'supervisor_review', 'approved', 'report_sent');
CREATE TYPE public.photo_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.service_type AS ENUM ('installation', 'maintenance', 'repair');
CREATE TYPE public.activity_type AS ENUM ('status_change', 'photo_upload', 'photo_review', 'note', 'report', 'assignment');
CREATE TYPE public.notification_type AS ENUM ('route_published', 'job_ready_for_review', 'photo_rejected', 'job_rejected', 'job_approved', 'report_sent');

-- ── 1. profiles ──
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role public.user_role NOT NULL DEFAULT 'technician',
  zone TEXT,
  supervisor_id UUID REFERENCES public.profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_supervisor ON public.profiles(supervisor_id);

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 2. clients ──
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_name ON public.clients(name);

-- ── 3. routes ──
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID NOT NULL REFERENCES public.profiles(id),
  date DATE NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(technician_id, date)
);

CREATE INDEX idx_routes_date ON public.routes(date);
CREATE INDEX idx_routes_technician ON public.routes(technician_id);

CREATE TRIGGER on_routes_updated
  BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── 4. jobs ──
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  route_order INTEGER NOT NULL DEFAULT 1,
  client_id UUID REFERENCES public.clients(id),
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  service_type public.service_type NOT NULL DEFAULT 'installation',
  equipment TEXT,
  technician_id UUID NOT NULL REFERENCES public.profiles(id),
  supervisor_id UUID NOT NULL REFERENCES public.profiles(id),
  estimated_time INTEGER, -- minutes
  instructions TEXT,
  status public.job_status NOT NULL DEFAULT 'scheduled',
  supervisor_notes TEXT,
  report_sent BOOLEAN NOT NULL DEFAULT false,
  report_sent_at TIMESTAMPTZ,
  report_token UUID,
  report_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_route ON public.jobs(route_id);
CREATE INDEX idx_jobs_technician ON public.jobs(technician_id);
CREATE INDEX idx_jobs_supervisor ON public.jobs(supervisor_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_report_token ON public.jobs(report_token) WHERE report_token IS NOT NULL;

CREATE TRIGGER on_jobs_updated
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── 5. photos ──
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  description TEXT NOT NULL,
  status public.photo_status NOT NULL DEFAULT 'pending',
  reject_reason TEXT,
  rejected_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  replaces_id UUID REFERENCES public.photos(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_photos_job ON public.photos(job_id);
CREATE INDEX idx_photos_status ON public.photos(status);

-- ── 6. materials ──
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  checked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_materials_job ON public.materials(job_id);

-- ── 7. activity_log ──
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  performed_by UUID NOT NULL REFERENCES public.profiles(id),
  type public.activity_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_log_job ON public.activity_log(job_id);
CREATE INDEX idx_activity_log_created ON public.activity_log(created_at);

-- ── 8. notifications ──
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE read = false;

-- ── Enable RLS on all tables ──
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ── Enable realtime for notifications ──
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
