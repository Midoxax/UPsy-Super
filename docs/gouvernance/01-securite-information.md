# 01 — Politique de sécurité de l'information

|                 |                                                                   |
| --------------- | ----------------------------------------------------------------- |
| Responsable     | FELJI Mehdi, responsable du traitement                            |
| Version         | Projet 0.1 — 15 novembre 2026                                     |
| Prochaine revue | ⚠️ date de signature + 12 mois, ou après incident                 |
| S'applique à    | Fondateur, administrateurs, spécialistes, prestataires techniques |

## 1. Objet

U.Psy traite des données de santé mentale. Leur divulgation peut nuire
durablement à une personne. Cette politique fixe les règles minimales qui
protègent leur confidentialité, leur intégrité et leur disponibilité.

## 2. Principes

1. **Le moins de données possible.** On ne collecte que ce qu'un service rend
   nécessaire, et on ne l'envoie à un tiers que si le service en dépend.
2. **Le moins d'accès possible.** Chacun voit ses propres données. Personne
   ne voit un dossier clinique par défaut, administrateurs compris.
3. **Tout accès exceptionnel laisse une trace** qui ne peut être ni modifiée
   ni supprimée.
4. **Aucune donnée clinique dans une URL, un journal technique ou un outil
   d'analyse.**
5. **Tout changement passe par une revue** et par les contrôles automatiques.

## 3. Règles et contrôles qui les appliquent

| Règle                                             | Contrôle dans le produit                                                         |
| ------------------------------------------------- | -------------------------------------------------------------------------------- |
| Cloisonnement des données par personne            | Sécurité au niveau des lignes sur chaque table ; tests dans `supabase/tests/`    |
| Dossiers cliniques invisibles aux administrateurs | Accès d'urgence motivé par écrit, double authentification exigée, journalisé     |
| Traçabilité                                       | `audit_log` immuable (mise à jour et suppression bloquées)                       |
| Conservation                                      | 10 ans pour le clinique, par table : `docs/data-classification.md`               |
| Consentement avant toute mesure d'audience        | PostHog et Tag Manager ne se chargent qu'après accord : `src/lib/consent.ts`     |
| Analyse sans contenu clinique                     | `src/lib/analytics/funnel.ts`, `src/lib/analytics/freeScore.ts` et leurs tests   |
| Transport chiffré et en-têtes de sécurité         | HSTS, CSP, X-Frame-Options, nosniff                                              |
| Changements maîtrisés                             | Demande de fusion obligatoire : types, lint, secrets, CodeQL, tests de la base   |
| Secrets hors du code                              | Analyse de secrets à chaque changement ; secrets dans les coffres des hébergeurs |

## 4. Responsabilités

- **Responsable du traitement :** approuve cette politique, tient les
  registres 05 et 06, décide en cas d'incident.
- **Administrateurs :** double authentification, aucun partage de compte,
  signalement immédiat de toute anomalie.
- **Spécialistes :** secret professionnel, double authentification, appareil
  verrouillé, aucune copie de notes hors de la plateforme.
- **Prestataires techniques :** aucun accès aux données de production hors
  incident ; tout accès est journalisé.

## 5. Écarts connus à la date de ce projet

- Double authentification non généralisée (document 00, point 1).
- Protection contre les mots de passe compromis désactivée (document 00, point 2).
- Scripts en ligne encore autorisés par la CSP (écart 10 de l'audit).
- Aucun test d'intrusion externe réalisé (écart 7).

## 6. Manquements

Tout manquement est consigné dans le registre des risques. Un manquement
délibéré d'un spécialiste ou d'un prestataire entraîne la suspension de son
accès le temps de l'examen.
