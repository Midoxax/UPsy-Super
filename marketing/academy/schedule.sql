-- U.Psy Academy: social publishing schedule.
--
-- Run in the Supabase SQL editor after the content-automation migration
-- (20261022110000) is applied. Set the launch date on the first line of the
-- query: every post is placed relative to it (teaser 7 days before, closing
-- 21 days after). Posts go in as 'pending': approve them in Admin > Content
-- automation and the hourly job publishes each one at its time, to every
-- network whose credentials are set. Re-running changes nothing that exists.
--
-- Images are served from public/campaign/academy/ (render: scripts/campaign/render.mjs).
WITH cfg AS (SELECT date '2026-11-16' AS launch),   -- <<< launch day (J0)
posts (slug, network, caption, link, image_url, day_offset, at_local) AS (VALUES
  ('academy-01-teaser', 'linkedin', 'La santé mentale au Maroc mérite l''excellence. Quelque chose se prépare pour les psychologues, les sportifs et les organisations. Rendez-vous très bientôt.

👉 upsy.ma/academy

#psychologie #santementale #psychologiedusport #formation #Maroc', 'https://www.upsy.ma/academy?utm_source=linkedin&utm_medium=social&utm_campaign=academy&utm_content=01-teaser', 'https://www.upsy.ma/campaign/academy/li/01-teaser.jpg', -7, '09:30'),
  ('academy-01-teaser', 'facebook', 'La santé mentale au Maroc mérite l''excellence. Quelque chose se prépare pour les psychologues, les sportifs et les organisations. Rendez-vous très bientôt.

👉 upsy.ma/academy

#santementale #Maroc #psychologie', 'https://www.upsy.ma/academy?utm_source=facebook&utm_medium=social&utm_campaign=academy&utm_content=01-teaser', 'https://www.upsy.ma/campaign/academy/ig/01-teaser.jpg', -7, '13:00'),
  ('academy-01-teaser', 'instagram', 'La santé mentale au Maroc mérite l''excellence. Quelque chose se prépare pour les psychologues, les sportifs et les organisations. Rendez-vous très bientôt.

👉 upsy.ma/academy

#santementale #psychologiedusport #preparationmentale #psychologue #Maroc #formation', 'https://www.upsy.ma/academy?utm_source=instagram&utm_medium=social&utm_campaign=academy&utm_content=01-teaser', 'https://www.upsy.ma/campaign/academy/ig/01-teaser.jpg', -7, '20:00'),
  ('academy-02-launch', 'linkedin', 'U.Psy Academy est lancée. Quatre parcours certifiants, en présentiel et en ligne : psychologie du sport et de la performance, préparation mentale à la compétition, résilience et leadership, pratique clinique avancée. Former l''excellence, ouvrir l''accès. Candidatures ouvertes pour la première promotion.

👉 upsy.ma/academy

#psychologie #santementale #psychologiedusport #formation #Maroc', 'https://www.upsy.ma/academy?utm_source=linkedin&utm_medium=social&utm_campaign=academy&utm_content=02-launch', 'https://www.upsy.ma/campaign/academy/li/02-launch.jpg', 0, '09:30'),
  ('academy-02-launch', 'facebook', 'U.Psy Academy est lancée. Quatre parcours certifiants, en présentiel et en ligne : psychologie du sport et de la performance, préparation mentale à la compétition, résilience et leadership, pratique clinique avancée. Former l''excellence, ouvrir l''accès. Candidatures ouvertes pour la première promotion.

👉 upsy.ma/academy

#santementale #Maroc #psychologie', 'https://www.upsy.ma/academy?utm_source=facebook&utm_medium=social&utm_campaign=academy&utm_content=02-launch', 'https://www.upsy.ma/campaign/academy/ig/02-launch.jpg', 0, '13:00'),
  ('academy-02-launch', 'instagram', 'U.Psy Academy est lancée. Quatre parcours certifiants, en présentiel et en ligne : psychologie du sport et de la performance, préparation mentale à la compétition, résilience et leadership, pratique clinique avancée. Former l''excellence, ouvrir l''accès. Candidatures ouvertes pour la première promotion.

👉 upsy.ma/academy

#santementale #psychologiedusport #preparationmentale #psychologue #Maroc #formation', 'https://www.upsy.ma/academy?utm_source=instagram&utm_medium=social&utm_campaign=academy&utm_content=02-launch', 'https://www.upsy.ma/campaign/academy/ig/02-launch.jpg', 0, '20:00'),
  ('academy-03-track-sport', 'linkedin', 'Parcours 01 · Certification en psychologie du sport et de la performance. Évaluation et profilage mental, préparation à la compétition, intervention en club et en fédération, avec des cas supervisés. Pour les psychologues et les professionnels de l''accompagnement.

👉 upsy.ma/academy

#psychologie #santementale #psychologiedusport #formation #Maroc', 'https://www.upsy.ma/academy?utm_source=linkedin&utm_medium=social&utm_campaign=academy&utm_content=03-track-sport', 'https://www.upsy.ma/campaign/academy/li/03-track-sport.jpg', 2, '09:30'),
  ('academy-03-track-sport', 'facebook', 'Parcours 01 · Certification en psychologie du sport et de la performance. Évaluation et profilage mental, préparation à la compétition, intervention en club et en fédération, avec des cas supervisés. Pour les psychologues et les professionnels de l''accompagnement.

👉 upsy.ma/academy

#santementale #Maroc #psychologie', 'https://www.upsy.ma/academy?utm_source=facebook&utm_medium=social&utm_campaign=academy&utm_content=03-track-sport', 'https://www.upsy.ma/campaign/academy/ig/03-track-sport.jpg', 2, '13:00'),
  ('academy-03-track-sport', 'instagram', 'Parcours 01 · Certification en psychologie du sport et de la performance. Évaluation et profilage mental, préparation à la compétition, intervention en club et en fédération, avec des cas supervisés. Pour les psychologues et les professionnels de l''accompagnement.

👉 upsy.ma/academy

#santementale #psychologiedusport #preparationmentale #psychologue #Maroc #formation', 'https://www.upsy.ma/academy?utm_source=instagram&utm_medium=social&utm_campaign=academy&utm_content=03-track-sport', 'https://www.upsy.ma/campaign/academy/ig/03-track-sport.jpg', 2, '20:00'),
  ('academy-04-track-athletes', 'linkedin', 'Parcours 02 · Préparation mentale à la compétition. Concentration, routines, gestion de la pression, rebond après l''échec, et un suivi dans l''Espace Athlète. Pour les sportifs, les entraîneurs et les clubs.

👉 upsy.ma/academy

#psychologie #santementale #psychologiedusport #formation #Maroc', 'https://www.upsy.ma/academy?utm_source=linkedin&utm_medium=social&utm_campaign=academy&utm_content=04-track-athletes', 'https://www.upsy.ma/campaign/academy/li/04-track-athletes.jpg', 4, '09:30'),
  ('academy-04-track-athletes', 'facebook', 'Parcours 02 · Préparation mentale à la compétition. Concentration, routines, gestion de la pression, rebond après l''échec, et un suivi dans l''Espace Athlète. Pour les sportifs, les entraîneurs et les clubs.

👉 upsy.ma/academy

#santementale #Maroc #psychologie', 'https://www.upsy.ma/academy?utm_source=facebook&utm_medium=social&utm_campaign=academy&utm_content=04-track-athletes', 'https://www.upsy.ma/campaign/academy/ig/04-track-athletes.jpg', 4, '13:00'),
  ('academy-04-track-athletes', 'instagram', 'Parcours 02 · Préparation mentale à la compétition. Concentration, routines, gestion de la pression, rebond après l''échec, et un suivi dans l''Espace Athlète. Pour les sportifs, les entraîneurs et les clubs.

👉 upsy.ma/academy

#santementale #psychologiedusport #preparationmentale #psychologue #Maroc #formation', 'https://www.upsy.ma/academy?utm_source=instagram&utm_medium=social&utm_campaign=academy&utm_content=04-track-athletes', 'https://www.upsy.ma/campaign/academy/ig/04-track-athletes.jpg', 4, '20:00'),
  ('academy-05-track-orgs', 'linkedin', 'Parcours 03 · Résilience et leadership. Prévenir l''épuisement, installer la sécurité psychologique, mesurer et piloter le bien-être. Pour les entreprises, les fédérations et les institutions.

👉 upsy.ma/academy

#psychologie #santementale #psychologiedusport #formation #Maroc', 'https://www.upsy.ma/academy?utm_source=linkedin&utm_medium=social&utm_campaign=academy&utm_content=05-track-orgs', 'https://www.upsy.ma/campaign/academy/li/05-track-orgs.jpg', 6, '09:30'),
  ('academy-05-track-orgs', 'facebook', 'Parcours 03 · Résilience et leadership. Prévenir l''épuisement, installer la sécurité psychologique, mesurer et piloter le bien-être. Pour les entreprises, les fédérations et les institutions.

👉 upsy.ma/academy

#santementale #Maroc #psychologie', 'https://www.upsy.ma/academy?utm_source=facebook&utm_medium=social&utm_campaign=academy&utm_content=05-track-orgs', 'https://www.upsy.ma/campaign/academy/ig/05-track-orgs.jpg', 6, '13:00'),
  ('academy-05-track-orgs', 'instagram', 'Parcours 03 · Résilience et leadership. Prévenir l''épuisement, installer la sécurité psychologique, mesurer et piloter le bien-être. Pour les entreprises, les fédérations et les institutions.

👉 upsy.ma/academy

#santementale #psychologiedusport #preparationmentale #psychologue #Maroc #formation', 'https://www.upsy.ma/academy?utm_source=instagram&utm_medium=social&utm_campaign=academy&utm_content=05-track-orgs', 'https://www.upsy.ma/campaign/academy/ig/05-track-orgs.jpg', 6, '20:00'),
  ('academy-06-track-clinical', 'linkedin', 'Parcours 04 · Pratique clinique avancée. Évaluation structurée, interventions fondées sur les preuves, gestion du risque, téléconsultation éthique, supervision en petits groupes. En lien avec la LSSPM.

👉 upsy.ma/academy

#psychologie #santementale #psychologiedusport #formation #Maroc', 'https://www.upsy.ma/academy?utm_source=linkedin&utm_medium=social&utm_campaign=academy&utm_content=06-track-clinical', 'https://www.upsy.ma/campaign/academy/li/06-track-clinical.jpg', 8, '09:30'),
  ('academy-06-track-clinical', 'facebook', 'Parcours 04 · Pratique clinique avancée. Évaluation structurée, interventions fondées sur les preuves, gestion du risque, téléconsultation éthique, supervision en petits groupes. En lien avec la LSSPM.

👉 upsy.ma/academy

#santementale #Maroc #psychologie', 'https://www.upsy.ma/academy?utm_source=facebook&utm_medium=social&utm_campaign=academy&utm_content=06-track-clinical', 'https://www.upsy.ma/campaign/academy/ig/06-track-clinical.jpg', 8, '13:00'),
  ('academy-06-track-clinical', 'instagram', 'Parcours 04 · Pratique clinique avancée. Évaluation structurée, interventions fondées sur les preuves, gestion du risque, téléconsultation éthique, supervision en petits groupes. En lien avec la LSSPM.

👉 upsy.ma/academy

#santementale #psychologiedusport #preparationmentale #psychologue #Maroc #formation', 'https://www.upsy.ma/academy?utm_source=instagram&utm_medium=social&utm_campaign=academy&utm_content=06-track-clinical', 'https://www.upsy.ma/campaign/academy/ig/06-track-clinical.jpg', 8, '20:00'),
  ('academy-07-hybrid', 'linkedin', 'Le format hybride U.Psy : des journées intensives en présentiel, des modules en ligne à votre rythme, des classes virtuelles et des cas réels supervisés. Accessible depuis le Maroc, l''Afrique et la diaspora.

👉 upsy.ma/academy

#psychologie #santementale #psychologiedusport #formation #Maroc', 'https://www.upsy.ma/academy?utm_source=linkedin&utm_medium=social&utm_campaign=academy&utm_content=07-hybrid', 'https://www.upsy.ma/campaign/academy/li/07-hybrid.jpg', 10, '09:30'),
  ('academy-07-hybrid', 'facebook', 'Le format hybride U.Psy : des journées intensives en présentiel, des modules en ligne à votre rythme, des classes virtuelles et des cas réels supervisés. Accessible depuis le Maroc, l''Afrique et la diaspora.

👉 upsy.ma/academy

#santementale #Maroc #psychologie', 'https://www.upsy.ma/academy?utm_source=facebook&utm_medium=social&utm_campaign=academy&utm_content=07-hybrid', 'https://www.upsy.ma/campaign/academy/ig/07-hybrid.jpg', 10, '13:00'),
  ('academy-07-hybrid', 'instagram', 'Le format hybride U.Psy : des journées intensives en présentiel, des modules en ligne à votre rythme, des classes virtuelles et des cas réels supervisés. Accessible depuis le Maroc, l''Afrique et la diaspora.

👉 upsy.ma/academy

#santementale #psychologiedusport #preparationmentale #psychologue #Maroc #formation', 'https://www.upsy.ma/academy?utm_source=instagram&utm_medium=social&utm_campaign=academy&utm_content=07-hybrid', 'https://www.upsy.ma/campaign/academy/ig/07-hybrid.jpg', 10, '20:00'),
  ('academy-08-mission', 'linkedin', 'La plupart des personnes qui ont besoin d''un psychologue n''en voient jamais. Former les meilleurs professionnels et les rendre accessibles, c''est le même combat.

👉 upsy.ma/academy

#psychologie #santementale #psychologiedusport #formation #Maroc', 'https://www.upsy.ma/academy?utm_source=linkedin&utm_medium=social&utm_campaign=academy&utm_content=08-mission', 'https://www.upsy.ma/campaign/academy/li/08-mission.jpg', 12, '09:30'),
  ('academy-08-mission', 'facebook', 'La plupart des personnes qui ont besoin d''un psychologue n''en voient jamais. Former les meilleurs professionnels et les rendre accessibles, c''est le même combat.

👉 upsy.ma/academy

#santementale #Maroc #psychologie', 'https://www.upsy.ma/academy?utm_source=facebook&utm_medium=social&utm_campaign=academy&utm_content=08-mission', 'https://www.upsy.ma/campaign/academy/ig/08-mission.jpg', 12, '13:00'),
  ('academy-08-mission', 'instagram', 'La plupart des personnes qui ont besoin d''un psychologue n''en voient jamais. Former les meilleurs professionnels et les rendre accessibles, c''est le même combat.

👉 upsy.ma/academy

#santementale #psychologiedusport #preparationmentale #psychologue #Maroc #formation', 'https://www.upsy.ma/academy?utm_source=instagram&utm_medium=social&utm_campaign=academy&utm_content=08-mission', 'https://www.upsy.ma/campaign/academy/ig/08-mission.jpg', 12, '20:00'),
  ('academy-09-league', 'linkedin', 'Un réseau évalué par la Ligue. En collaboration avec la Ligue des Spécialistes de la Santé Psychologique et Mentale (LSSPM), chaque dossier partagé est noté de 0 à 5 : formation, expérience, complétude, spécialisation, déontologie.

👉 upsy.ma/academy

#psychologie #santementale #psychologiedusport #formation #Maroc', 'https://www.upsy.ma/academy?utm_source=linkedin&utm_medium=social&utm_campaign=academy&utm_content=09-league', 'https://www.upsy.ma/campaign/academy/li/09-league.jpg', 14, '09:30'),
  ('academy-09-league', 'facebook', 'Un réseau évalué par la Ligue. En collaboration avec la Ligue des Spécialistes de la Santé Psychologique et Mentale (LSSPM), chaque dossier partagé est noté de 0 à 5 : formation, expérience, complétude, spécialisation, déontologie.

👉 upsy.ma/academy

#santementale #Maroc #psychologie', 'https://www.upsy.ma/academy?utm_source=facebook&utm_medium=social&utm_campaign=academy&utm_content=09-league', 'https://www.upsy.ma/campaign/academy/ig/09-league.jpg', 14, '13:00'),
  ('academy-09-league', 'instagram', 'Un réseau évalué par la Ligue. En collaboration avec la Ligue des Spécialistes de la Santé Psychologique et Mentale (LSSPM), chaque dossier partagé est noté de 0 à 5 : formation, expérience, complétude, spécialisation, déontologie.

👉 upsy.ma/academy

#santementale #psychologiedusport #preparationmentale #psychologue #Maroc #formation', 'https://www.upsy.ma/academy?utm_source=instagram&utm_medium=social&utm_campaign=academy&utm_content=09-league', 'https://www.upsy.ma/campaign/academy/ig/09-league.jpg', 14, '20:00'),
  ('academy-10-founder', 'linkedin', '« La performance et la santé mentale ne s''opposent pas. Les former ensemble, c''est notre métier. » Mehdi Felji, psychologue clinicien du sport et fondateur d''U.Psy.

👉 upsy.ma/academy

#psychologie #santementale #psychologiedusport #formation #Maroc', 'https://www.upsy.ma/academy?utm_source=linkedin&utm_medium=social&utm_campaign=academy&utm_content=10-founder', 'https://www.upsy.ma/campaign/academy/li/10-founder.jpg', 16, '09:30'),
  ('academy-10-founder', 'facebook', '« La performance et la santé mentale ne s''opposent pas. Les former ensemble, c''est notre métier. » Mehdi Felji, psychologue clinicien du sport et fondateur d''U.Psy.

👉 upsy.ma/academy

#santementale #Maroc #psychologie', 'https://www.upsy.ma/academy?utm_source=facebook&utm_medium=social&utm_campaign=academy&utm_content=10-founder', 'https://www.upsy.ma/campaign/academy/ig/10-founder.jpg', 16, '13:00'),
  ('academy-10-founder', 'instagram', '« La performance et la santé mentale ne s''opposent pas. Les former ensemble, c''est notre métier. » Mehdi Felji, psychologue clinicien du sport et fondateur d''U.Psy.

👉 upsy.ma/academy

#santementale #psychologiedusport #preparationmentale #psychologue #Maroc #formation', 'https://www.upsy.ma/academy?utm_source=instagram&utm_medium=social&utm_campaign=academy&utm_content=10-founder', 'https://www.upsy.ma/campaign/academy/ig/10-founder.jpg', 16, '20:00'),
  ('academy-11-ambassadors', 'linkedin', 'Programme Ambassadeurs U.Psy : les psychologues certifiés de la première promotion bénéficient de 0 % de commission pendant 3 mois, des fonctionnalités Pro offertes jusqu''au 6e mois et d''un badge Ambassadeur.

👉 upsy.ma/academy

#psychologie #santementale #psychologiedusport #formation #Maroc', 'https://www.upsy.ma/academy?utm_source=linkedin&utm_medium=social&utm_campaign=academy&utm_content=11-ambassadors', 'https://www.upsy.ma/campaign/academy/li/11-ambassadors.jpg', 18, '09:30'),
  ('academy-11-ambassadors', 'facebook', 'Programme Ambassadeurs U.Psy : les psychologues certifiés de la première promotion bénéficient de 0 % de commission pendant 3 mois, des fonctionnalités Pro offertes jusqu''au 6e mois et d''un badge Ambassadeur.

👉 upsy.ma/academy

#santementale #Maroc #psychologie', 'https://www.upsy.ma/academy?utm_source=facebook&utm_medium=social&utm_campaign=academy&utm_content=11-ambassadors', 'https://www.upsy.ma/campaign/academy/ig/11-ambassadors.jpg', 18, '13:00'),
  ('academy-11-ambassadors', 'instagram', 'Programme Ambassadeurs U.Psy : les psychologues certifiés de la première promotion bénéficient de 0 % de commission pendant 3 mois, des fonctionnalités Pro offertes jusqu''au 6e mois et d''un badge Ambassadeur.

👉 upsy.ma/academy

#santementale #psychologiedusport #preparationmentale #psychologue #Maroc #formation', 'https://www.upsy.ma/academy?utm_source=instagram&utm_medium=social&utm_campaign=academy&utm_content=11-ambassadors', 'https://www.upsy.ma/campaign/academy/ig/11-ambassadors.jpg', 18, '20:00'),
  ('academy-12-closing', 'linkedin', 'Première promotion U.Psy Academy : les places sont limitées pour garantir la supervision. Candidatures ouvertes pour les quatre parcours ; entretien court, réponse rapide.

👉 upsy.ma/academy

#psychologie #santementale #psychologiedusport #formation #Maroc', 'https://www.upsy.ma/academy?utm_source=linkedin&utm_medium=social&utm_campaign=academy&utm_content=12-closing', 'https://www.upsy.ma/campaign/academy/li/12-closing.jpg', 21, '09:30'),
  ('academy-12-closing', 'facebook', 'Première promotion U.Psy Academy : les places sont limitées pour garantir la supervision. Candidatures ouvertes pour les quatre parcours ; entretien court, réponse rapide.

👉 upsy.ma/academy

#santementale #Maroc #psychologie', 'https://www.upsy.ma/academy?utm_source=facebook&utm_medium=social&utm_campaign=academy&utm_content=12-closing', 'https://www.upsy.ma/campaign/academy/ig/12-closing.jpg', 21, '13:00'),
  ('academy-12-closing', 'instagram', 'Première promotion U.Psy Academy : les places sont limitées pour garantir la supervision. Candidatures ouvertes pour les quatre parcours ; entretien court, réponse rapide.

👉 upsy.ma/academy

#santementale #psychologiedusport #preparationmentale #psychologue #Maroc #formation', 'https://www.upsy.ma/academy?utm_source=instagram&utm_medium=social&utm_campaign=academy&utm_content=12-closing', 'https://www.upsy.ma/campaign/academy/ig/12-closing.jpg', 21, '20:00')
)
INSERT INTO public.social_posts (slug, network, status, caption, link, image_url, scheduled_for)
SELECT p.slug, p.network, 'pending', p.caption, p.link, p.image_url,
       -- Local Moroccan time; the database applies the right offset for the date.
       ((cfg.launch + p.day_offset) + p.at_local::time) AT TIME ZONE 'Africa/Casablanca'
FROM posts p CROSS JOIN cfg
ON CONFLICT (slug, network) DO NOTHING;
