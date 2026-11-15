# 03 — Plan de réponse aux incidents

|             |                                                  |
| ----------- | ------------------------------------------------ |
| Responsable | FELJI Mehdi, responsable du traitement           |
| Suppléant   | ⚠️ à désigner (une seule personne ne suffit pas) |
| Version     | Projet 0.1 — 15 novembre 2026                    |
| Exercice    | Une simulation par an, datée dans le registre 06 |

## 1. Ce qui compte comme incident

Tout événement qui expose, altère ou rend indisponibles des données
personnelles : compte compromis, accès non autorisé, fuite d'un secret, envoi
à un mauvais destinataire, perte d'un appareil d'un spécialiste, panne
prolongée, faille signalée par un tiers.

## 2. Les cinq étapes

| Étape                    | Délai visé       | Actions                                                                                                                 |
| ------------------------ | ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1. Contenir              | Immédiat         | Révoquer l'identifiant en cause ; désactiver la route ou la fonction ; revenir à la version précédente (`rollback.yml`) |
| 2. Évaluer               | Sous 24 h        | Quelles données, de qui, combien de personnes, sur quelle période. Sources : `audit_log`, journaux applicatifs          |
| 3. Préserver             | Avant correction | Copier les journaux et l'état de la base                                                                                |
| 4. Notifier              | Sous 72 h        | Voir section 3                                                                                                          |
| 5. Corriger et consigner | Sous 15 jours    | Correctif, puis compte rendu : chronologie, cause, ce qui a retardé la détection, ce qui change                         |

## 3. Notification

- **CNDP :** U.Psy se fixe un délai interne de 72 heures après la découverte
  dès qu'il existe un risque pour les personnes. ⚠️ Faire confirmer par
  l'avocat le délai et la forme exigés par la loi 09-08 et ses textes
  d'application ; le délai de 72 heures est celui du RGPD (art. 33), retenu
  ici comme règle la plus stricte.
- **Personnes concernées :** sans délai si le risque est élevé (contenu
  clinique, identité associée à un suivi). Message clair : ce qui s'est passé,
  quelles données, ce que la personne peut faire, qui contacter.
- **Spécialistes concernés :** en même temps que leurs clients, jamais après.
- **Sous-traitant en cause :** par écrit, en invoquant le contrat.

## 4. Niveaux de gravité

| Niveau | Exemple                                               | Qui décide                               |
| ------ | ----------------------------------------------------- | ---------------------------------------- |
| 1      | Contenu clinique exposé, même pour une seule personne | Responsable du traitement, immédiatement |
| 2      | Données d'identité ou de contact exposées             | Responsable du traitement, sous 24 h     |
| 3      | Indisponibilité sans exposition                       | Responsable technique                    |

## 5. Contacts

- Signalement interne et externe : contact@upsy.ma
- CNDP : ⚠️ canal de notification à noter après le dépôt du dossier.
- Avocat : ⚠️
- Supports des hébergeurs : via leurs tableaux de bord (Supabase, Cloudflare).

## 6. Ce qu'on ne fait pas

- Corriger avant d'avoir préservé les preuves.
- Laisser les 72 heures s'écouler en discussion interne.
- Minimiser dans le message aux personnes concernées.
