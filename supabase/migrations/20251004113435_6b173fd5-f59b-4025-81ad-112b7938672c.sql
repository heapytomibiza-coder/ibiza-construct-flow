-- Enable realtime for booking_requests table
-- (jobs and notifications already enabled)

ALTER TABLE public.booking_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_requests;