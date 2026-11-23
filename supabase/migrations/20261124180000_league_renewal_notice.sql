-- Found by the end-to-end renewal test: a renewal sent the same notices as a
-- first membership ("Bienvenue dans la Ligue", "Nouvelle adhésion confirmée").
-- A membership confirmed while the member already has another active one is
-- a renewal, and now says so to the member and to the League.

CREATE OR REPLACE FUNCTION public.league_membership_notify() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _receipt text; _name text; _renewal boolean;
BEGIN
  IF NEW.status = 'active' AND OLD.status IS DISTINCT FROM 'active' THEN
    SELECT receipt_number INTO _receipt FROM public.league_payments
    WHERE membership_id = NEW.id AND status = 'verified' ORDER BY verified_at DESC LIMIT 1;
    _renewal := EXISTS (SELECT 1 FROM public.league_memberships
                        WHERE user_id = NEW.user_id AND id <> NEW.id AND status = 'active');
    PERFORM public.notify_user(NEW.user_id, 'league',
      CASE WHEN _renewal THEN 'Votre adhésion à la LSSPM est renouvelée'
           ELSE 'Votre adhésion à la LSSPM est confirmée' END,
      CASE WHEN _renewal THEN 'Merci de votre fidélité à la Ligue des Spécialistes de la Santé Psychique et Mentale.'
           ELSE 'Bienvenue dans la Ligue des Spécialistes de la Santé Psychique et Mentale.' END || E'\n\n' ||
      'Numéro de membre : ' || coalesce(NEW.member_number, '—') || E'\n' ||
      'Valable du ' || public.fr_date(NEW.starts_on) || ' au ' || public.fr_date(NEW.ends_on) || '.' || E'\n' ||
      coalesce('Reçu de paiement : ' || _receipt || E'\n', '') ||
      'Attestation d''adhésion : ' || coalesce(NEW.attestation_number, '—') || E'\n\n' ||
      'Votre carte de membre numérique, votre attestation et votre reçu sont téléchargeables depuis votre tableau de bord.',
      '/dashboard');
    SELECT full_name INTO _name FROM public.profiles WHERE id = NEW.user_id;
    PERFORM public.notify_league_staff(
      CASE WHEN _renewal THEN 'Renouvellement confirmé : ' ELSE 'Nouvelle adhésion confirmée : ' END
        || coalesce(_name, NEW.member_number),
      'Membre n° ' || coalesce(NEW.member_number, '—') || ', attestation ' ||
      coalesce(NEW.attestation_number, '—') || ', valable jusqu''au ' || public.fr_date(NEW.ends_on) ||
      '. L''attestation est téléchargeable dans le portail.',
      '/league');
  END IF;
  RETURN NEW;
END $$;
