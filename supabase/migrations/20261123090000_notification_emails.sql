-- Email notifications for the League, the passport, interviews and orders.
--
-- Until now these flows either notified in-app only (interviews) or not at
-- all (membership confirmed, payment refused, passport item validated, order
-- paid or shipped). Here:
--
--   1. Triggers on the state tables write an in-app notification at each step
--      that matters to someone, so no RPC has to remember to.
--   2. A notification can be marked for email (email_status = 'pending'). The
--      notification-emails function, run by pg_cron every two minutes, sends
--      them through Resend in the platform's branded layout, honouring the
--      user's preferences and the suppression list, with up to three tries.
--
-- Staff alerts (a payment receipt to check) go to League reviewers (League
-- money) or U.Psy admins (shop money) and are always emailed.

ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS email_league boolean NOT NULL DEFAULT true;

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS email_status text
    CHECK (email_status IS NULL OR email_status IN ('pending', 'sent', 'skipped', 'failed')),
  ADD COLUMN IF NOT EXISTS email_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS emailed_at timestamptz;
CREATE INDEX IF NOT EXISTS notifications_email_pending_idx
  ON public.notifications (created_at) WHERE email_status = 'pending';

-- One notification, optionally emailed. Server-side only.
CREATE OR REPLACE FUNCTION public.notify_user(
  _user uuid, _type text, _title text, _body text, _url text, _email boolean DEFAULT true)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications (user_id, type, title, body, action_url, email_status)
  VALUES (_user, _type, _title, _body, _url, CASE WHEN _email THEN 'pending' END);
$$;

-- Every League reviewer (League role, not a U.Psy admin).
CREATE OR REPLACE FUNCTION public.notify_league_staff(_title text, _body text, _url text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications (user_id, type, title, body, action_url, email_status)
  SELECT DISTINCT r.user_id, 'league_staff', _title, _body, _url, 'pending'
  FROM public.user_roles r
  WHERE r.role = 'league'::app_role AND public.is_league_reviewer(r.user_id);
$$;

-- Every U.Psy admin.
CREATE OR REPLACE FUNCTION public.notify_admins(_title text, _body text, _url text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications (user_id, type, title, body, action_url, email_status)
  SELECT DISTINCT r.user_id, 'shop_admin', _title, _body, _url, 'pending'
  FROM public.user_roles r WHERE r.role = 'admin'::app_role;
$$;

REVOKE ALL ON FUNCTION public.notify_user(uuid, text, text, text, text, boolean),
  public.notify_league_staff(text, text, text), public.notify_admins(text, text, text)
  FROM PUBLIC, anon, authenticated;

-- Interviews: the existing in-app notices are now emailed too.
CREATE OR REPLACE FUNCTION public.recruitment_notify(_user uuid, _title text, _body text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT public.notify_user(_user, 'recruitment', _title, _body, '/dashboard', true);
$$;

CREATE OR REPLACE FUNCTION public.fr_date(_d date) RETURNS text
LANGUAGE sql IMMUTABLE SET search_path = public AS $$ SELECT to_char(_d, 'DD/MM/YYYY') $$;

-- Membership confirmed.
CREATE OR REPLACE FUNCTION public.league_membership_notify() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status IS DISTINCT FROM 'active' THEN
    PERFORM public.notify_user(NEW.user_id, 'league',
      'Votre adhésion à la LSSPM est confirmée',
      'Bienvenue dans la Ligue des Spécialistes de la Santé Psychique et Mentale.' || E'\n\n' ||
      'Numéro de membre : ' || coalesce(NEW.member_number, '—') || E'\n' ||
      'Valable du ' || public.fr_date(NEW.starts_on) || ' au ' || public.fr_date(NEW.ends_on) || '.',
      '/dashboard');
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS league_membership_notify ON public.league_memberships;
CREATE TRIGGER league_membership_notify AFTER UPDATE OF status ON public.league_memberships
  FOR EACH ROW EXECUTE FUNCTION public.league_membership_notify();

-- Membership payment: a receipt to check (League staff), or refused (member).
CREATE OR REPLACE FUNCTION public.league_payment_notify() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'submitted' THEN
    PERFORM public.notify_league_staff('Un paiement de cotisation est à vérifier',
      'Un reçu de ' || NEW.amount_mad || ' MAD a été envoyé. Vérifiez-le dans le portail de la Ligue.',
      '/league');
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'rejected' AND OLD.status = 'submitted' THEN
    PERFORM public.notify_user(NEW.user_id, 'league',
      'Votre paiement de cotisation n''a pas été validé',
      coalesce('Motif : ' || NEW.review_note || E'\n\n', '') ||
      'Vous pouvez envoyer un nouveau reçu depuis votre tableau de bord.',
      '/dashboard');
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS league_payment_notify ON public.league_payments;
CREATE TRIGGER league_payment_notify AFTER INSERT OR UPDATE OF status ON public.league_payments
  FOR EACH ROW EXECUTE FUNCTION public.league_payment_notify();

-- Passport item reviewed by the League.
CREATE OR REPLACE FUNCTION public.passport_entry_notify() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND OLD.status = 'submitted'
     AND NEW.status IN ('validated', 'rejected') THEN
    PERFORM public.notify_user(NEW.user_id, 'passport',
      CASE NEW.status WHEN 'validated' THEN 'Élément de passeport validé'
                      ELSE 'Élément de passeport non validé' END,
      '« ' || NEW.title || ' »' ||
      CASE NEW.status WHEN 'validated' THEN ' a été validé par la Ligue.'
                      ELSE ' n''a pas été validé.' END ||
      coalesce(E'\n\nMotif : ' || NEW.review_note, ''),
      '/dashboard');
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS passport_entry_notify ON public.passport_entries;
CREATE TRIGGER passport_entry_notify AFTER UPDATE OF status ON public.passport_entries
  FOR EACH ROW EXECUTE FUNCTION public.passport_entry_notify();

-- Publication orders.
CREATE OR REPLACE FUNCTION public.publication_order_notify() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _title text; _slug text; _url text;
BEGIN
  SELECT coalesce(title_fr, title), slug INTO _title, _slug
  FROM public.publications WHERE id = NEW.publication_id;
  _url := '/publications/' || _slug;
  IF TG_OP = 'INSERT' THEN
    PERFORM public.notify_user(NEW.user_id, 'shop', 'Commande enregistrée : ' || _title,
      'Montant à régler : ' || NEW.total_mad || ' MAD.' || E'\n\n' ||
      'Réglez par virement ou versement puis envoyez le reçu depuis la page de la publication, '
      || 'ou réglez en espèces ou par chèque auprès de U.Psy.', _url);
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'payment_submitted' THEN
      PERFORM public.notify_admins('Reçu de paiement à vérifier : ' || _title,
        'Commande de ' || NEW.total_mad || ' MAD. Vérifiez-la dans Admin → Publications.',
        '/admin');
    ELSIF NEW.status = 'paid' THEN
      PERFORM public.notify_user(NEW.user_id, 'shop', 'Paiement confirmé : ' || _title,
        'Facture ' || NEW.invoice_number || '.' || E'\n\n' ||
        CASE NEW.format WHEN 'ebook' THEN 'Votre ebook est disponible au téléchargement.'
                        ELSE 'Votre commande sera expédiée prochainement.' END, _url);
    ELSIF NEW.status = 'shipped' THEN
      PERFORM public.notify_user(NEW.user_id, 'shop', 'Commande expédiée : ' || _title,
        coalesce(NEW.review_note, 'Votre commande est en route.'), _url);
    ELSIF NEW.status = 'awaiting_payment' AND OLD.status = 'payment_submitted' THEN
      PERFORM public.notify_user(NEW.user_id, 'shop', 'Paiement non validé : ' || _title,
        coalesce('Motif : ' || NEW.review_note || E'\n\n', '') ||
        'Vous pouvez envoyer un nouveau reçu depuis la page de la publication.', _url);
    ELSIF NEW.status = 'cancelled' AND auth.uid() IS DISTINCT FROM NEW.user_id THEN
      PERFORM public.notify_user(NEW.user_id, 'shop', 'Commande annulée : ' || _title,
        coalesce(NEW.review_note, 'Votre commande a été annulée par U.Psy.'), _url);
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS publication_order_notify ON public.publication_orders;
CREATE TRIGGER publication_order_notify AFTER INSERT OR UPDATE OF status ON public.publication_orders
  FOR EACH ROW EXECUTE FUNCTION public.publication_order_notify();

REVOKE ALL ON FUNCTION public.league_membership_notify(), public.league_payment_notify(),
  public.passport_entry_notify(), public.publication_order_notify() FROM PUBLIC, anon, authenticated;

-- The sender: pg_cron calls notification-emails every two minutes with a
-- Vault secret the function checks with cron_secret_ok().
DO $$
BEGIN
  IF to_regnamespace('vault') IS NULL OR to_regnamespace('cron') IS NULL THEN
    RETURN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'notification_emails_cron_secret') THEN
    PERFORM vault.create_secret(
      replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
      'notification_emails_cron_secret',
      'Bearer token the notification-emails cron job sends to notification-emails');
  END IF;
  PERFORM cron.schedule(
    'notification-emails',
    '*/2 * * * *',
    $cmd$
    SELECT net.http_post(
      url := 'https://skxxvgjjdshcopybokdt.supabase.co/functions/v1/notification-emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets
                                       WHERE name = 'notification_emails_cron_secret')),
      body := '{}'::jsonb
    ) AS request_id
    WHERE EXISTS (SELECT 1 FROM public.notifications WHERE email_status = 'pending');
    $cmd$);
END $$;
