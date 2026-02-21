-- ============================================================
-- ClimaTech — Sample seed data
-- Run after creating users via Supabase Auth or admin API
-- ============================================================

-- Note: In production, users are created via Supabase Auth.
-- This seed inserts sample clients for testing.

INSERT INTO public.clients (id, name, email, phone, company)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Maria Rodriguez', 'maria@example.com', '809-555-0101', 'Oficinas MR'),
  ('00000000-0000-0000-0000-000000000002', 'Carlos Perez', 'carlos@example.com', '809-555-0102', 'Restaurante El Sabor'),
  ('00000000-0000-0000-0000-000000000003', 'Ana Gutierrez', 'ana@example.com', '809-555-0103', 'Clinica Salud Plus'),
  ('00000000-0000-0000-0000-000000000004', 'Roberto Diaz', 'roberto@example.com', '809-555-0104', 'Hotel Tropical'),
  ('00000000-0000-0000-0000-000000000005', 'Laura Fernandez', 'laura@example.com', '809-555-0105', NULL);
