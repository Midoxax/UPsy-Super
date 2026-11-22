-- LSSPM recruitment assessment ("bilan de recrutement").
--
-- A candidate (applicant or member), after explicit consent, completes:
--   personality (Mini-IPIP6: Big Five + Honesty-Humility), mental balance
--   (WHO-5, K6), validity checks, and situational-judgement vignettes: six
--   core ethics vignettes plus four for each speciality they choose.
-- Likert answers are scored in the browser from public keys. The vignettes'
-- scoring key never leaves the database: candidates fetch the vignettes
-- through recruitment_sjt_get (options shuffled per candidate, no key) and
-- the score is computed here on submission.
-- Access (Law 09-08, health data): the candidate sees their own personality
-- and well-being results; only League reviewers see the full report.
-- Well-being results are for support and supervision, never an automatic
-- rejection: the committee decides.

CREATE TABLE IF NOT EXISTS public.recruitment_sjt_items (
  id text PRIMARY KEY,
  niche text NOT NULL CHECK (niche IN ('core', 'adult', 'child', 'sport', 'neuro', 'work', 'trauma')),
  position integer NOT NULL,
  prompt_fr text NOT NULL,
  prompt_en text NOT NULL,
  -- [{id, fr, en}]
  options jsonb NOT NULL,
  -- {option id: points 0-3}
  key jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.recruitment_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  niches text[] NOT NULL CHECK (cardinality(niches) BETWEEN 1 AND 2
    AND niches <@ ARRAY['adult', 'child', 'sport', 'neuro', 'work', 'trauma']),
  consent_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  likert jsonb NOT NULL DEFAULT '{}'::jsonb,
  sjt_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- {module: {points, max, pct}} computed on submission.
  sjt_scores jsonb,
  committee_note text CHECK (committee_note IS NULL OR length(committee_note) <= 4000),
  committee_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  committee_at timestamptz
);
CREATE INDEX IF NOT EXISTS recruitment_assessments_user_idx ON public.recruitment_assessments (user_id, started_at DESC);

ALTER TABLE public.recruitment_sjt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_assessments ENABLE ROW LEVEL SECURITY;

-- The vignettes and their key: League reviewers only.
DROP POLICY IF EXISTS recruitment_sjt_items_league ON public.recruitment_sjt_items;
CREATE POLICY recruitment_sjt_items_league ON public.recruitment_sjt_items FOR ALL TO authenticated
  USING (public.is_league_reviewer(auth.uid())) WITH CHECK (public.is_league_reviewer(auth.uid()));
DROP POLICY IF EXISTS recruitment_assessments_read ON public.recruitment_assessments;
CREATE POLICY recruitment_assessments_read ON public.recruitment_assessments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_league_reviewer(auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recruitment_sjt_items TO authenticated;
GRANT SELECT ON public.recruitment_assessments TO authenticated;

-- Start (consent given in the UI); one assessment in progress at a time.
CREATE OR REPLACE FUNCTION public.recruitment_assessment_start(_niches text[])
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  SELECT id INTO _id FROM public.recruitment_assessments
  WHERE user_id = auth.uid() AND completed_at IS NULL;
  IF _id IS NOT NULL THEN
    UPDATE public.recruitment_assessments SET niches = _niches WHERE id = _id;
    RETURN _id;
  END IF;
  -- One completed assessment per year: no retaking until the answers fit.
  IF EXISTS (SELECT 1 FROM public.recruitment_assessments WHERE user_id = auth.uid()
             AND completed_at > now() - interval '1 year') THEN
    RAISE EXCEPTION 'already completed this year';
  END IF;
  INSERT INTO public.recruitment_assessments (niches) VALUES (_niches) RETURNING id INTO _id;
  RETURN _id;
END $$;

-- The vignettes for an assessment, options shuffled per candidate, no key.
CREATE OR REPLACE FUNCTION public.recruitment_sjt_get(_assessment uuid)
RETURNS TABLE (id text, niche text, prompt_fr text, prompt_en text, options jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT i.id, i.niche, i.prompt_fr, i.prompt_en,
         (SELECT jsonb_agg(o ORDER BY md5(i.id || (o ->> 'id') || a.user_id::text))
          FROM jsonb_array_elements(i.options) o)
  FROM public.recruitment_assessments a
  JOIN public.recruitment_sjt_items i ON i.is_active AND (i.niche = 'core' OR i.niche = ANY (a.niches))
  WHERE a.id = _assessment AND a.user_id = auth.uid() AND a.completed_at IS NULL
  ORDER BY (i.niche <> 'core'), i.niche, i.position;
$$;

-- Submit: stores the answers and scores the vignettes per module.
CREATE OR REPLACE FUNCTION public.recruitment_assessment_submit(
  _assessment uuid, _likert jsonb, _sjt jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _scores jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.recruitment_assessments
                 WHERE id = _assessment AND user_id = auth.uid() AND completed_at IS NULL) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  SELECT jsonb_object_agg(niche, jsonb_build_object('points', pts, 'max', mx, 'answered', n,
                                                    'pct', round(100.0 * pts / nullif(mx, 0))))
  INTO _scores
  FROM (SELECT i.niche, sum(coalesce((i.key ->> (_sjt ->> i.id))::int, 0)) AS pts,
               3 * count(*) AS mx, count(_sjt ->> i.id) AS n
        FROM public.recruitment_assessments a
        JOIN public.recruitment_sjt_items i ON i.is_active AND (i.niche = 'core' OR i.niche = ANY (a.niches))
        WHERE a.id = _assessment GROUP BY i.niche) s;
  UPDATE public.recruitment_assessments SET likert = coalesce(_likert, '{}'::jsonb),
    sjt_answers = coalesce(_sjt, '{}'::jsonb), sjt_scores = _scores, completed_at = now()
  WHERE id = _assessment;
  PERFORM public.notify_league_staff('Bilan de recrutement complété',
    'Un candidat a complété le bilan de recrutement. Le rapport est dans le portail de la Ligue.', '/league');
END $$;

CREATE OR REPLACE FUNCTION public.recruitment_assessment_note(_assessment uuid, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_league_reviewer(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.recruitment_assessments SET committee_note = nullif(trim(_note), ''),
    committee_by = auth.uid(), committee_at = now() WHERE id = _assessment;
END $$;

REVOKE ALL ON FUNCTION public.recruitment_assessment_start(text[]), public.recruitment_sjt_get(uuid),
  public.recruitment_assessment_submit(uuid, jsonb, jsonb), public.recruitment_assessment_note(uuid, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.recruitment_assessment_start(text[]), public.recruitment_sjt_get(uuid),
  public.recruitment_assessment_submit(uuid, jsonb, jsonb), public.recruitment_assessment_note(uuid, text)
  TO authenticated;

-- The committee's list: every assessment with the candidate's name.
CREATE OR REPLACE FUNCTION public.recruitment_assessments_desk()
RETURNS TABLE (id uuid, user_id uuid, full_name text, email text, niches text[],
               started_at timestamptz, completed_at timestamptz, likert jsonb,
               sjt_scores jsonb, committee_note text, passport_validated integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_league_reviewer(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT a.id, a.user_id, p.full_name, u.email::text, a.niches, a.started_at, a.completed_at,
         a.likert, a.sjt_scores, a.committee_note,
         (SELECT count(*)::int FROM public.passport_entries e
          WHERE e.user_id = a.user_id AND e.status = 'validated')
  FROM public.recruitment_assessments a
  JOIN auth.users u ON u.id = a.user_id
  LEFT JOIN public.profiles p ON p.id = a.user_id
  ORDER BY a.completed_at DESC NULLS LAST, a.started_at DESC;
END $$;
REVOKE ALL ON FUNCTION public.recruitment_assessments_desk() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.recruitment_assessments_desk() TO authenticated;

-- Vignettes (draft key: 3 best practice, 2 acceptable, 1 insufficient,
-- 0 harmful), to be validated by the League's expert committee.
CREATE OR REPLACE FUNCTION pg_temp.v(_id text, _niche text, _pos int, _pfr text, _pen text,
  _a text[], _b text[], _c text[], _d text[], _ka int, _kb int, _kc int, _kd int) RETURNS void
LANGUAGE sql AS $$
  INSERT INTO public.recruitment_sjt_items (id, niche, position, prompt_fr, prompt_en, options, key)
  VALUES (_id, _niche, _pos, _pfr, _pen,
    jsonb_build_array(jsonb_build_object('id', 'a', 'fr', _a[1], 'en', _a[2]),
                      jsonb_build_object('id', 'b', 'fr', _b[1], 'en', _b[2]),
                      jsonb_build_object('id', 'c', 'fr', _c[1], 'en', _c[2]),
                      jsonb_build_object('id', 'd', 'fr', _d[1], 'en', _d[2])),
    jsonb_build_object('a', _ka, 'b', _kb, 'c', _kc, 'd', _kd))
  ON CONFLICT (id) DO UPDATE SET prompt_fr = EXCLUDED.prompt_fr, prompt_en = EXCLUDED.prompt_en,
    options = EXCLUDED.options, key = EXCLUDED.key, niche = EXCLUDED.niche, position = EXCLUDED.position;
$$;

SELECT pg_temp.v('core1', 'core', 1,
  'Un patient adulte vous révèle des idées de suicide avec un plan précis pour ce soir.',
  'An adult patient tells you about suicidal thoughts with a precise plan for tonight.',
  ARRAY['Respecter le secret absolu et le revoir la semaine prochaine.', 'Keep strict secrecy and see them next week.'],
  ARRAY['Évaluer immédiatement le risque, construire avec lui un plan de sécurité et, si le danger est imminent, organiser une prise en charge d''urgence en l''en informant.', 'Assess the risk at once, build a safety plan with them and, if the danger is imminent, arrange emergency care, telling them so.'],
  ARRAY['Appeler sa famille sans l''en informer.', 'Call their family without telling them.'],
  ARRAY['Lui conseiller de consulter un psychiatre quand il le pourra.', 'Advise them to see a psychiatrist when they can.'],
  0, 3, 1, 1);
SELECT pg_temp.v('core2', 'core', 2,
  'Un ancien patient, suivi jusqu''il y a six mois, vous propose un partenariat commercial lucratif.',
  'A former patient, seen until six months ago, offers you a lucrative business partnership.',
  ARRAY['Accepter puisque la thérapie est terminée.', 'Accept, since therapy has ended.'],
  ARRAY['Décliner en expliquant le risque de relation multiple et son impact sur une éventuelle reprise de suivi.', 'Decline, explaining the risk of a dual relationship and its effect on any return to therapy.'],
  ARRAY['Accepter à condition de ne plus jamais le recevoir en consultation.', 'Accept on condition of never seeing them as a patient again.'],
  ARRAY['Demander l''avis d''un collègue puis accepter s''il ne voit pas d''objection.', 'Ask a colleague and accept if they see no objection.'],
  0, 3, 1, 1);
SELECT pg_temp.v('core3', 'core', 3,
  'On vous demande d''évaluer un enfant pour un trouble du spectre de l''autisme alors que vous n''êtes pas formé(e) aux outils requis.',
  'You are asked to assess a child for autism spectrum disorder although you are not trained in the required tools.',
  ARRAY['Utiliser un questionnaire trouvé en ligne.', 'Use a questionnaire found online.'],
  ARRAY['Accepter et vous former rapidement sur internet.', 'Accept and train yourself quickly online.'],
  ARRAY['Expliquer les limites de votre compétence et orienter vers un professionnel formé, en restant disponible pour votre part du travail.', 'Explain the limits of your competence and refer to a trained professional, staying available for your part of the work.'],
  ARRAY['Refuser sans proposer d''orientation.', 'Decline without suggesting a referral.'],
  0, 1, 3, 1);
SELECT pg_temp.v('core4', 'core', 4,
  'Vous apprenez qu''un collègue partage dans un groupe de messagerie des informations permettant d''identifier ses patients.',
  'You learn that a colleague shares information identifying their patients in a messaging group.',
  ARRAY['Ne rien faire, cela ne vous concerne pas.', 'Do nothing; it is not your business.'],
  ARRAY['En parler d''abord directement avec lui et, si cela continue, saisir la commission d''éthique de la Ligue.', 'Raise it with them directly first and, if it continues, refer it to the League''s ethics committee.'],
  ARRAY['Publier une alerte sur les réseaux sociaux.', 'Post a warning on social media.'],
  ARRAY['Prévenir vous-même les patients concernés.', 'Warn the patients concerned yourself.'],
  0, 3, 0, 1);
SELECT pg_temp.v('core5', 'core', 5,
  'Les parents d''un adolescent de 15 ans exigent de connaître le contenu de ses séances.',
  'The parents of a 15-year-old demand to know what is said in the sessions.',
  ARRAY['Leur transmettre vos notes.', 'Give them your notes.'],
  ARRAY['Refuser de les recevoir.', 'Refuse to meet them.'],
  ARRAY['Convenir dès le départ, avec l''adolescent et ses parents, de ce qui sera partagé, préserver la confidentialité sauf danger et proposer des points réguliers sans détails intimes.', 'Agree from the start, with the teenager and the parents, on what will be shared, keep confidentiality except in danger, and offer regular updates without intimate details.'],
  ARRAY['Demander à l''adolescent de tout raconter lui-même à ses parents.', 'Ask the teenager to tell the parents everything themselves.'],
  0, 1, 3, 1);
SELECT pg_temp.v('core6', 'core', 6,
  'Après plusieurs mois de surcharge, vous remarquez de l''irritabilité et des oublis en séance.',
  'After months of overload, you notice irritability and lapses of memory in sessions.',
  ARRAY['Continuer : c''est passager.', 'Carry on; it will pass.'],
  ARRAY['Réduire votre charge, recourir à la supervision et, si besoin, à un suivi personnel.', 'Reduce your caseload, use supervision and, if needed, personal therapy.'],
  ARRAY['Prendre un congé sans prévenir vos patients.', 'Take leave without telling your patients.'],
  ARRAY['Allonger les séances pour compenser.', 'Lengthen sessions to make up for it.'],
  0, 3, 1, 0);

SELECT pg_temp.v('adult1', 'adult', 1,
  'Un patient vous demande de lui prescrire un anxiolytique.',
  'A patient asks you to prescribe an anxiolytic.',
  ARRAY['Lui conseiller un produit en vente libre.', 'Recommend an over-the-counter product.'],
  ARRAY['Expliquer que la prescription relève du médecin, orienter vers un médecin ou un psychiatre et proposer une prise en charge psychologique.', 'Explain that prescribing is a doctor''s role, refer to a doctor or psychiatrist and offer psychological care.'],
  ARRAY['Lui donner le nom d''un médicament à demander.', 'Give them the name of a drug to ask for.'],
  ARRAY['Refuser sans explication.', 'Refuse without explanation.'],
  1, 3, 0, 1);
SELECT pg_temp.v('adult2', 'adult', 2,
  'À la fin de la thérapie, une patiente vous offre un cadeau de valeur.',
  'At the end of therapy, a patient offers you a valuable gift.',
  ARRAY['Accepter, cela lui fait plaisir.', 'Accept; it pleases her.'],
  ARRAY['Réfléchir avec elle au sens du geste et décliner avec tact un cadeau de valeur (un geste symbolique peut être accepté).', 'Explore the meaning of the gesture with her and tactfully decline a valuable gift (a symbolic token may be accepted).'],
  ARRAY['Refuser sèchement.', 'Refuse curtly.'],
  ARRAY['Accepter et lui offrir un cadeau en retour.', 'Accept and give her a gift in return.'],
  1, 3, 1, 0);
SELECT pg_temp.v('adult3', 'adult', 3,
  'Après dix séances, aucun progrès n''est observé.',
  'After ten sessions, no progress is seen.',
  ARRAY['Continuer à l''identique.', 'Carry on the same way.'],
  ARRAY['Réévaluer avec le patient les objectifs, l''alliance et la formulation clinique, envisager une autre approche ou une orientation.', 'Review goals, alliance and the clinical formulation with the patient, and consider another approach or a referral.'],
  ARRAY['Mettre fin au suivi sans proposition.', 'End therapy without any proposal.'],
  ARRAY['Augmenter la fréquence des séances.', 'Increase session frequency.'],
  0, 3, 0, 1);
SELECT pg_temp.v('adult4', 'adult', 4,
  'Un patient demande à vous suivre sur vos réseaux sociaux personnels.',
  'A patient asks to follow you on your personal social media.',
  ARRAY['Accepter, c''est moderne.', 'Accept; it is modern.'],
  ARRAY['Expliquer votre politique sur les réseaux sociaux et maintenir la relation dans le cadre professionnel.', 'Explain your social media policy and keep the relationship within the professional frame.'],
  ARRAY['Ignorer la demande.', 'Ignore the request.'],
  ARRAY['Accepter mais ne jamais interagir.', 'Accept but never interact.'],
  0, 3, 1, 1);

SELECT pg_temp.v('child1', 'child', 1,
  'Un enfant de 8 ans décrit et dessine des scènes évoquant une maltraitance par un adulte de son entourage.',
  'An 8-year-old describes and draws scenes suggesting abuse by an adult close to them.',
  ARRAY['Confronter les parents en séance commune.', 'Confront the parents in a joint session.'],
  ARRAY['Recueillir ses propos sans suggestion, les consigner fidèlement et engager les démarches de protection prévues par la loi (signalement au parquet, dispositifs de protection de l''enfance).', 'Gather the child''s words without suggestion, record them faithfully and start the protection steps the law provides (report to the prosecutor, child protection services).'],
  ARRAY['Attendre d''avoir des preuves certaines.', 'Wait until you have certain proof.'],
  ARRAY['En parler au directeur de l''école.', 'Tell the school head.'],
  0, 3, 0, 1);
SELECT pg_temp.v('child2', 'child', 2,
  'L''école demande un diagnostic de TDAH pour un élève après un seul entretien.',
  'The school asks for an ADHD diagnosis for a pupil after a single interview.',
  ARRAY['Le poser pour aider l''école.', 'Give it to help the school.'],
  ARRAY['Expliquer qu''un diagnostic exige une évaluation multi-informateurs et multi-contextes, proposer cette évaluation et une orientation médicale.', 'Explain that a diagnosis needs a multi-informant, multi-setting assessment, and offer that assessment and a medical referral.'],
  ARRAY['Refuser de répondre à l''école.', 'Refuse to answer the school.'],
  ARRAY['Faire remplir un questionnaire aux enseignants et conclure sur cette base.', 'Have teachers fill in a questionnaire and conclude from it.'],
  0, 3, 1, 1);
SELECT pg_temp.v('child3', 'child', 3,
  'Des parents séparés et en conflit vous demandent chacun un rapport pour le juge.',
  'Separated parents in conflict each ask you for a report for the judge.',
  ARRAY['Rédiger un rapport pour chacun.', 'Write a report for each.'],
  ARRAY['Clarifier votre rôle : thérapeute de l''enfant ou expert désigné, pas les deux ; ne pas produire de rapport partisan.', 'Clarify your role: the child''s therapist or a court-appointed expert, not both; do not write a partisan report.'],
  ARRAY['Rédiger un rapport favorable au parent qui a pris rendez-vous.', 'Write a report favouring the parent who booked.'],
  ARRAY['Envoyer un rapport neutre au juge sans mandat.', 'Send a neutral report to the judge without a mandate.'],
  0, 3, 0, 1);
SELECT pg_temp.v('child4', 'child', 4,
  'Un adolescent vous écrit la nuit sur une messagerie pour parler de ses angoisses.',
  'A teenager messages you at night about their anxieties.',
  ARRAY['Répondre à toute heure pour préserver l''alliance.', 'Reply at any hour to keep the alliance.'],
  ARRAY['Poser un cadre de contact clair, donner les ressources de crise et reprendre le sujet en séance.', 'Set clear contact rules, give crisis resources and take it up in session.'],
  ARRAY['Le bloquer sans explication.', 'Block them without explanation.'],
  ARRAY['Lui donner votre numéro personnel.', 'Give them your personal number.'],
  1, 3, 0, 0);

SELECT pg_temp.v('sport1', 'sport', 1,
  'Un entraîneur vous demande le contenu des séances d''un athlète pour décider de sa titularisation.',
  'A coach asks what an athlete says in sessions to decide whether to start them.',
  ARRAY['Donner les informations : c''est le club qui paie.', 'Give the information; the club pays.'],
  ARRAY['Rappeler le cadre convenu : retours généraux avec l''accord de l''athlète, sans contenu confidentiel, et proposer une réunion à trois.', 'Recall the agreed frame: general feedback with the athlete''s consent, no confidential content, and offer a three-way meeting.'],
  ARRAY['Refuser tout contact avec l''entraîneur.', 'Refuse any contact with the coach.'],
  ARRAY['Donner un avis général sur sa santé mentale.', 'Give a general opinion on their mental health.'],
  0, 3, 1, 1);
SELECT pg_temp.v('sport2', 'sport', 2,
  'Avant une compétition par catégorie de poids, un athlète de 17 ans perd du poids rapidement et commente sans cesse son corps.',
  'Before a weight-class competition, a 17-year-old athlete loses weight fast and keeps commenting on their body.',
  ARRAY['Lui apprendre des techniques de visualisation pour la pesée.', 'Teach visualisation techniques for the weigh-in.'],
  ARRAY['Évaluer un possible trouble des conduites alimentaires, informer ses représentants légaux et orienter vers une équipe médicale et nutritionnelle.', 'Assess for a possible eating disorder, inform the legal guardians and refer to a medical and nutrition team.'],
  ARRAY['Attendre la fin de la saison.', 'Wait until the end of the season.'],
  ARRAY['Demander à l''entraîneur d''adapter l''entraînement.', 'Ask the coach to adjust training.'],
  0, 3, 0, 1);
SELECT pg_temp.v('sport3', 'sport', 3,
  'La veille d''une finale, une joueuse anxieuse avant les tirs au but vous demande une méthode rapide.',
  'The day before a final, a player anxious about penalty shoot-outs asks for a quick method.',
  ARRAY['Introduire une technique nouvelle et complexe.', 'Introduce a new, complex technique.'],
  ARRAY['Proposer une routine courte qu''elle maîtrise déjà (respiration, routine pré-performance, attention sur des indices de la tâche) et planifier un travail de fond après la finale.', 'Offer a short routine she already masters (breathing, pre-performance routine, focus on task cues) and plan deeper work after the final.'],
  ARRAY['Lui conseiller de ne pas tirer.', 'Advise her not to take a penalty.'],
  ARRAY['Lui dire que l''anxiété est normale et qu''il suffit d''y croire.', 'Tell her anxiety is normal and she just has to believe.'],
  1, 3, 1, 0);
SELECT pg_temp.v('sport4', 'sport', 4,
  'Après une blessure grave, un athlète professionnel se replie sur lui-même et dit que sa vie est « finie ».',
  'After a serious injury, a professional athlete withdraws and says their life is "over".',
  ARRAY['Travailler uniquement la motivation au retour au jeu.', 'Work only on motivation to return to play.'],
  ARRAY['Évaluer la dépression et le risque suicidaire, coordonner avec l''équipe médicale et accompagner l''identité au-delà du sport.', 'Assess depression and suicide risk, coordinate with the medical team and support identity beyond sport.'],
  ARRAY['L''encourager à reprendre vite pour retrouver le moral.', 'Encourage a quick return to lift their mood.'],
  ARRAY['Attendre qu''il demande de l''aide.', 'Wait until they ask for help.'],
  1, 3, 0, 0);

SELECT pg_temp.v('neuro1', 'neuro', 1,
  'La famille d''un patient de 72 ans qui se plaint de sa mémoire veut un « test rapide » pour savoir s''il a la maladie d''Alzheimer.',
  'The family of a 72-year-old with memory complaints wants a "quick test" to know whether he has Alzheimer''s disease.',
  ARRAY['Faire un test de dépistage et annoncer le diagnostic.', 'Run a screening test and announce the diagnosis.'],
  ARRAY['Expliquer qu''un dépistage ne fait pas un diagnostic, réaliser une évaluation neuropsychologique complète et normée et orienter vers une consultation mémoire.', 'Explain that screening is not diagnosis, carry out a full normed neuropsychological assessment and refer to a memory clinic.'],
  ARRAY['Refuser toute évaluation.', 'Refuse any assessment.'],
  ARRAY['Conseiller des exercices de mémoire en ligne.', 'Suggest online memory exercises.'],
  0, 3, 1, 1);
SELECT pg_temp.v('neuro2', 'neuro', 2,
  'Pendant un bilan, vous constatez que le patient maîtrise mal la langue des normes du test.',
  'During an assessment, you see the patient has a poor command of the language of the test norms.',
  ARRAY['Appliquer le test et l''interpréter avec les normes habituelles.', 'Give the test and interpret it with the usual norms.'],
  ARRAY['Adapter la passation (langue, interprète formé), choisir des outils moins dépendants de la langue et signaler la limite dans le compte rendu.', 'Adapt administration (language, trained interpreter), choose less language-dependent tools and state the limitation in the report.'],
  ARRAY['Traduire vous-même les items au fil de la passation sans le signaler.', 'Translate items yourself on the fly without saying so.'],
  ARRAY['Annuler le bilan.', 'Cancel the assessment.'],
  0, 3, 1, 1);
SELECT pg_temp.v('neuro3', 'neuro', 3,
  'Un avocat vous confie une expertise après un traumatisme crânien en insistant pour un résultat favorable à son client.',
  'A lawyer commissions an assessment after a head injury, insisting on a result favourable to the client.',
  ARRAY['Accepter et orienter les conclusions.', 'Accept and steer the conclusions.'],
  ARRAY['N''accepter qu''en garantissant votre indépendance, utiliser des tests de validité de la performance et rapporter les résultats tels qu''ils sont.', 'Accept only with guaranteed independence, use performance validity tests and report the results as they are.'],
  ARRAY['Refuser toute expertise médico-légale.', 'Refuse all forensic work.'],
  ARRAY['Accepter sans tests de validité pour gagner du temps.', 'Accept without validity tests to save time.'],
  0, 3, 1, 0);
SELECT pg_temp.v('neuro4', 'neuro', 4,
  'Les résultats d''un bilan sont inattendus et incohérents avec le fonctionnement quotidien rapporté.',
  'Assessment results are unexpected and inconsistent with the daily functioning reported.',
  ARRAY['Les rapporter tels quels.', 'Report them as they are.'],
  ARRAY['Vérifier la cotation, l''effort, la fatigue, l''humeur et les facteurs culturels, et croiser avec l''anamnèse avant de conclure.', 'Check scoring, effort, fatigue, mood and cultural factors, and cross-check the history before concluding.'],
  ARRAY['Retirer les scores incohérents du compte rendu.', 'Remove the inconsistent scores from the report.'],
  ARRAY['Conclure à une simulation.', 'Conclude malingering.'],
  1, 3, 0, 0);

SELECT pg_temp.v('work1', 'work', 1,
  'Une entreprise vous demande la liste des salariés « fragiles » repérés lors d''ateliers de bien-être.',
  'A company asks for the list of "fragile" employees spotted during well-being workshops.',
  ARRAY['Fournir la liste nominative.', 'Provide the list of names.'],
  ARRAY['Refuser toute donnée individuelle et proposer un rapport collectif anonymisé avec des recommandations organisationnelles.', 'Refuse any individual data and offer an anonymised collective report with organisational recommendations.'],
  ARRAY['Fournir la liste avec l''accord oral des salariés.', 'Provide the list with employees'' verbal consent.'],
  ARRAY['Transmettre seulement les cas les plus graves.', 'Pass on only the most serious cases.'],
  0, 3, 1, 0);
SELECT pg_temp.v('work2', 'work', 2,
  'Dans un suivi financé par l''employeur, un salarié vous révèle un harcèlement moral par son manager.',
  'In therapy paid by the employer, an employee reveals bullying by their manager.',
  ARRAY['Informer directement le manager.', 'Tell the manager directly.'],
  ARRAY['Accompagner le salarié, l''informer de ses droits et des recours internes et externes, et n''agir auprès de l''employeur qu''avec son accord, sauf danger.', 'Support the employee, inform them of their rights and internal and external remedies, and act with the employer only with their consent, unless there is danger.'],
  ARRAY['Lui conseiller de démissionner.', 'Advise them to resign.'],
  ARRAY['Mettre fin au suivi pour éviter un conflit avec l''employeur.', 'End therapy to avoid a conflict with the employer.'],
  0, 3, 1, 0);
SELECT pg_temp.v('work3', 'work', 3,
  'On vous demande de « valider » psychologiquement un licenciement déjà décidé.',
  'You are asked to "validate" psychologically a dismissal already decided.',
  ARRAY['Rédiger l''avis demandé.', 'Write the requested opinion.'],
  ARRAY['Refuser d''instrumentaliser l''évaluation et proposer un accompagnement du changement respectueux des personnes.', 'Refuse to misuse assessment and offer change support that respects the people involved.'],
  ARRAY['Faire passer un test de personnalité pour justifier la décision.', 'Give a personality test to justify the decision.'],
  ARRAY['Accepter si la mission est bien rémunérée.', 'Accept if the assignment pays well.'],
  0, 3, 0, 0);
SELECT pg_temp.v('work4', 'work', 4,
  'Après un accident grave sur un chantier, la direction veut un « débriefing obligatoire » pour tous dès le lendemain.',
  'After a serious accident on a site, management wants a "mandatory debriefing" for everyone the next day.',
  ARRAY['Organiser un débriefing collectif obligatoire et détaillé.', 'Run a mandatory, detailed group debriefing.'],
  ARRAY['Proposer des premiers secours psychologiques volontaires, une information sur les réactions normales et un repérage des personnes à risque avec un suivi.', 'Offer voluntary psychological first aid, information on normal reactions and screening of people at risk with follow-up.'],
  ARRAY['Refuser toute intervention.', 'Refuse to intervene.'],
  ARRAY['Faire raconter l''accident en détail à chacun.', 'Have everyone recount the accident in detail.'],
  1, 3, 0, 0);

SELECT pg_temp.v('trauma1', 'trauma', 1,
  'Une femme victime de violences conjugales souhaite rentrer chez elle ce soir.',
  'A woman who suffers domestic violence wants to go home tonight.',
  ARRAY['Lui interdire de rentrer.', 'Forbid her to go home.'],
  ARRAY['Respecter son choix, évaluer le danger, construire un plan de sécurité et l''informer des ressources (écoute, hébergement, plainte).', 'Respect her choice, assess the danger, build a safety plan and tell her about resources (helplines, shelter, filing a complaint).'],
  ARRAY['Appeler la police sans son accord dans tous les cas.', 'Call the police without her consent in every case.'],
  ARRAY['Ne rien aborder pour ne pas la brusquer.', 'Raise nothing so as not to upset her.'],
  0, 3, 1, 0);
SELECT pg_temp.v('trauma2', 'trauma', 2,
  'Après une catastrophe, des personnes très choquées refusent de parler.',
  'After a disaster, deeply shocked people refuse to talk.',
  ARRAY['Insister pour qu''elles racontent ce qu''elles ont vécu.', 'Insist that they tell what they went through.'],
  ARRAY['Appliquer les premiers secours psychologiques : sécurité, besoins de base, présence calme, information, mise en lien avec les proches.', 'Apply psychological first aid: safety, basic needs, calm presence, information, connecting with loved ones.'],
  ARRAY['Leur prescrire des exercices d''exposition.', 'Prescribe exposure exercises.'],
  ARRAY['Les laisser seules.', 'Leave them alone.'],
  0, 3, 0, 0);
SELECT pg_temp.v('trauma3', 'trauma', 3,
  'Un patient exprime des idées homicides envers une personne identifiée.',
  'A patient expresses homicidal thoughts about an identified person.',
  ARRAY['Garder le secret.', 'Keep it secret.'],
  ARRAY['Évaluer la dangerosité et, en cas de danger grave et imminent, prendre les mesures de protection prévues par la loi en documentant votre démarche.', 'Assess dangerousness and, in serious and imminent danger, take the protective steps the law provides, documenting what you do.'],
  ARRAY['Prévenir immédiatement la personne sans évaluer.', 'Warn the person at once without assessing.'],
  ARRAY['Mettre fin au suivi.', 'End therapy.'],
  0, 3, 1, 0);
SELECT pg_temp.v('trauma4', 'trauma', 4,
  'Après plusieurs récits traumatiques difficiles dans la semaine, vous faites des cauchemars.',
  'After several hard trauma accounts this week, you have nightmares.',
  ARRAY['Les ignorer.', 'Ignore them.'],
  ARRAY['Reconnaître un possible traumatisme vicariant, en parler en supervision et ajuster votre charge.', 'Recognise possible vicarious trauma, discuss it in supervision and adjust your caseload.'],
  ARRAY['Cesser de recevoir des victimes sans en parler.', 'Stop seeing victims without discussing it.'],
  ARRAY['Écouter moins attentivement pour vous protéger.', 'Listen less closely to protect yourself.'],
  0, 3, 1, 0);
