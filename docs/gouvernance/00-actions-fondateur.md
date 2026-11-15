# 00 — Actions que seul le fondateur peut faire

Environ une heure au total. Cocher, dater, puis reporter la date dans le
registre concerné.

## 1. Double authentification des administrateurs (écart 2)

- [ ] Se connecter sur upsy.ma avec chaque compte administrateur, ouvrir
      `/auth/mfa-setup`, enregistrer une application d'authentification.
- [ ] Conserver les codes de secours hors ligne (papier, coffre).
- [ ] Demander la même chose à chaque spécialiste avant sa publication.

_Pourquoi maintenant :_ l'accès d'urgence aux dossiers cliniques refuse déjà un
administrateur sans double authentification. Tant qu'elle n'est pas activée,
cet accès est inutilisable le jour où il sera nécessaire.

_Constat du 15 novembre :_ la base compte 2 comptes administrateur et 10 comptes
psychologue. L'audit du 5 novembre relevait 0 inscription sur 2 et 0 sur 10 ;
ce point n'a pas été revérifié depuis.

## 2. Protection contre les mots de passe compromis (écart 3)

- [ ] Tableau de bord Supabase → Authentication → Providers → Email → activer
      « Leaked password protection ».

_Constat du 15 novembre :_ l'avertissement `auth_leaked_password_protection`
est toujours présent dans les avis de sécurité du projet. Le réglage est donc
encore désactivé.

## 3. Contrats de sous-traitance (écart 6)

- [ ] Télécharger et signer le contrat de traitement des données (DPA) de
      chaque sous-traitant listé dans le
      [registre](05-registre-sous-traitants.md).
- [ ] Ranger les exemplaires signés dans un seul dossier et inscrire la date
      dans le registre.

## 4. Sauvegardes (écart 5)

- [ ] Vérifier dans Supabase → Database → Backups que la restauration à un
      instant donné (PITR) est incluse dans l'offre souscrite. ⚠️ Noter l'offre
      et la durée de rétention dans le document 04.
- [ ] Planifier le premier exercice de restauration (document 04, section 3).

## 5. Décisions à prendre

- [ ] Les quatre décisions du document [08](08-cndp-decisions.md).
- [ ] Relire et signer les documents 01 à 07.

## Après coup

Une fois les points 1 et 2 cochés, une vérification en lecture seule des avis
de sécurité du projet confirme que l'avertissement a disparu.
