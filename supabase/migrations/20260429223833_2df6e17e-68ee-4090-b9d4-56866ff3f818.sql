CREATE OR REPLACE FUNCTION public.notify_on_ticket_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket RECORD;
  v_admin_id uuid;
BEGIN
  SELECT id, user_id, subject INTO v_ticket
  FROM public.support_tickets
  WHERE id = NEW.ticket_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Admin replied → notify the ticket owner
  IF NEW.author_role = 'admin' AND v_ticket.user_id IS NOT NULL AND NEW.author_id <> v_ticket.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, body, action_url, metadata)
    VALUES (
      v_ticket.user_id,
      'support_reply',
      'New reply from support',
      'Re: ' || COALESCE(v_ticket.subject, 'Your ticket'),
      '/my-space?tab=support&ticket=' || v_ticket.id::text,
      jsonb_build_object('ticket_id', v_ticket.id)
    );
  END IF;

  -- User replied → notify all admins (except the sender)
  IF NEW.author_role = 'user' THEN
    FOR v_admin_id IN
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    LOOP
      IF v_admin_id <> NEW.author_id THEN
        INSERT INTO public.notifications (user_id, type, title, body, action_url, metadata)
        VALUES (
          v_admin_id,
          'support_user_reply',
          'New support reply from user',
          'Re: ' || COALESCE(v_ticket.subject, 'Ticket'),
          '/admin?tab=support',
          jsonb_build_object('ticket_id', v_ticket.id)
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_ticket_message ON public.support_ticket_messages;

CREATE TRIGGER trg_notify_on_ticket_message
AFTER INSERT ON public.support_ticket_messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_ticket_message();