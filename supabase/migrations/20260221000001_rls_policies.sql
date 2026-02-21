-- ============================================================
-- ClimaTech — RLS Policies
-- ============================================================

-- ── Helper function: get current user's role ──
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ════════════════════════════════════════
-- PROFILES
-- ════════════════════════════════════════

-- Everyone can read active profiles (needed for dropdowns, names)
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile (phone, etc.)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin can update any profile
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- Admin can insert profiles (user creation)
CREATE POLICY "profiles_insert_admin"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'admin');

-- ════════════════════════════════════════
-- CLIENTS
-- ════════════════════════════════════════

-- Operations and admin can do everything with clients
CREATE POLICY "clients_select"
  ON public.clients FOR SELECT
  TO authenticated
  USING (public.get_my_role() IN ('operations', 'admin', 'supervisor'));

CREATE POLICY "clients_insert"
  ON public.clients FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() IN ('operations', 'admin'));

CREATE POLICY "clients_update"
  ON public.clients FOR UPDATE
  TO authenticated
  USING (public.get_my_role() IN ('operations', 'admin'))
  WITH CHECK (public.get_my_role() IN ('operations', 'admin'));

-- ════════════════════════════════════════
-- ROUTES
-- ════════════════════════════════════════

-- Operations/admin full access
CREATE POLICY "routes_select_ops_admin"
  ON public.routes FOR SELECT
  TO authenticated
  USING (
    public.get_my_role() IN ('operations', 'admin')
  );

-- Technician sees own routes
CREATE POLICY "routes_select_technician"
  ON public.routes FOR SELECT
  TO authenticated
  USING (
    public.get_my_role() = 'technician'
    AND technician_id = auth.uid()
  );

-- Supervisor sees routes of their technicians
CREATE POLICY "routes_select_supervisor"
  ON public.routes FOR SELECT
  TO authenticated
  USING (
    public.get_my_role() = 'supervisor'
    AND technician_id IN (
      SELECT id FROM public.profiles WHERE supervisor_id = auth.uid()
    )
  );

-- Operations/admin can create routes
CREATE POLICY "routes_insert"
  ON public.routes FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() IN ('operations', 'admin'));

-- Operations/admin can update routes
CREATE POLICY "routes_update"
  ON public.routes FOR UPDATE
  TO authenticated
  USING (public.get_my_role() IN ('operations', 'admin'))
  WITH CHECK (public.get_my_role() IN ('operations', 'admin'));

-- Operations/admin can delete routes (only unpublished)
CREATE POLICY "routes_delete"
  ON public.routes FOR DELETE
  TO authenticated
  USING (
    public.get_my_role() IN ('operations', 'admin')
    AND published = false
  );

-- ════════════════════════════════════════
-- JOBS
-- ════════════════════════════════════════

-- Operations/admin full read
CREATE POLICY "jobs_select_ops_admin"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (public.get_my_role() IN ('operations', 'admin'));

-- Technician sees own jobs
CREATE POLICY "jobs_select_technician"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (
    public.get_my_role() = 'technician'
    AND technician_id = auth.uid()
  );

-- Supervisor sees jobs assigned to them
CREATE POLICY "jobs_select_supervisor"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (
    public.get_my_role() = 'supervisor'
    AND supervisor_id = auth.uid()
  );

-- Operations/admin can insert jobs
CREATE POLICY "jobs_insert"
  ON public.jobs FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() IN ('operations', 'admin'));

-- Operations/admin can update any job
CREATE POLICY "jobs_update_ops_admin"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (public.get_my_role() IN ('operations', 'admin'))
  WITH CHECK (public.get_my_role() IN ('operations', 'admin'));

-- Technician can update own jobs (status, notes)
CREATE POLICY "jobs_update_technician"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() = 'technician'
    AND technician_id = auth.uid()
  )
  WITH CHECK (
    public.get_my_role() = 'technician'
    AND technician_id = auth.uid()
  );

-- Supervisor can update jobs assigned to them
CREATE POLICY "jobs_update_supervisor"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() = 'supervisor'
    AND supervisor_id = auth.uid()
  )
  WITH CHECK (
    public.get_my_role() = 'supervisor'
    AND supervisor_id = auth.uid()
  );

-- Operations/admin can delete jobs
CREATE POLICY "jobs_delete"
  ON public.jobs FOR DELETE
  TO authenticated
  USING (public.get_my_role() IN ('operations', 'admin'));

-- ════════════════════════════════════════
-- PHOTOS
-- ════════════════════════════════════════

-- All authenticated users who can see the job can see its photos
CREATE POLICY "photos_select"
  ON public.photos FOR SELECT
  TO authenticated
  USING (
    job_id IN (SELECT id FROM public.jobs)
  );

-- Technician can insert photos on their jobs
CREATE POLICY "photos_insert_technician"
  ON public.photos FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_my_role() = 'technician'
    AND job_id IN (
      SELECT id FROM public.jobs WHERE technician_id = auth.uid()
    )
  );

-- Supervisor can update photo status (approve/reject)
CREATE POLICY "photos_update_supervisor"
  ON public.photos FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() = 'supervisor'
    AND job_id IN (
      SELECT id FROM public.jobs WHERE supervisor_id = auth.uid()
    )
  )
  WITH CHECK (
    public.get_my_role() = 'supervisor'
    AND job_id IN (
      SELECT id FROM public.jobs WHERE supervisor_id = auth.uid()
    )
  );

-- ════════════════════════════════════════
-- MATERIALS
-- ════════════════════════════════════════

-- Visible to anyone who can see the job
CREATE POLICY "materials_select"
  ON public.materials FOR SELECT
  TO authenticated
  USING (
    job_id IN (SELECT id FROM public.jobs)
  );

-- Operations/admin can manage materials
CREATE POLICY "materials_insert"
  ON public.materials FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() IN ('operations', 'admin'));

CREATE POLICY "materials_update"
  ON public.materials FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "materials_delete"
  ON public.materials FOR DELETE
  TO authenticated
  USING (public.get_my_role() IN ('operations', 'admin'));

-- ════════════════════════════════════════
-- ACTIVITY LOG — INSERT only, immutable
-- ════════════════════════════════════════

CREATE POLICY "activity_log_select"
  ON public.activity_log FOR SELECT
  TO authenticated
  USING (
    job_id IN (SELECT id FROM public.jobs)
  );

-- All authenticated can insert (called from server actions)
CREATE POLICY "activity_log_insert"
  ON public.activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- No UPDATE or DELETE policies — immutable

-- ════════════════════════════════════════
-- NOTIFICATIONS
-- ════════════════════════════════════════

-- Users see their own notifications
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- System can insert notifications for anyone (via service role or server action)
CREATE POLICY "notifications_insert"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
