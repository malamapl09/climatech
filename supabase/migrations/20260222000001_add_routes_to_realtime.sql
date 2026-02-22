-- Add routes table to realtime publication
-- (jobs table is already included)
ALTER PUBLICATION supabase_realtime ADD TABLE public.routes;
