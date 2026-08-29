CREATE OR REPLACE FUNCTION public.ensure_video_room_on_confirm()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'confirmed'
     AND NEW.session_type IN ('video', 'online')
     AND (NEW.video_room_id IS NULL OR NEW.video_room_id = '')
  THEN
    NEW.video_room_id := 'upsy-' || replace(gen_random_uuid()::text, '-', '');
  END IF;
  RETURN NEW;
END;
$$;