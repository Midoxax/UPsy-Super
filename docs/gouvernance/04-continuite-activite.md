# 04 — Continuité d'activité et sauvegardes

|                 |                                        |
| --------------- | -------------------------------------- |
| Responsable     | FELJI Mehdi, responsable du traitement |
| Version         | Projet 0.1 — 15 novembre 2026          |
| Prochaine revue | Après chaque exercice de restauration  |

## 1. Ce qui doit continuer

| Priorité | Service                                      | Interruption tolérée  | Perte de données tolérée |
| -------- | -------------------------------------------- | --------------------- | ------------------------ |
| 1        | Séances en cours et à venir (visio, rappels) | ⚠️ proposition : 4 h  | aucune                   |
| 2        | Accès des spécialistes aux notes             | ⚠️ proposition : 8 h  | ⚠️ proposition : 1 h     |
| 3        | Prise de rendez-vous et paiement             | ⚠️ proposition : 24 h | ⚠️ proposition : 1 h     |
| 4        | Site vitrine, contenus, auto-évaluation      | ⚠️ proposition : 48 h | 24 h                     |

Les durées sont des propositions à valider : elles engagent ce qui sera promis
aux organisations clientes.

## 2. Sauvegardes

- Base de données : sauvegardes quotidiennes automatiques chez Supabase.
  ⚠️ Confirmer que la restauration à un instant donné est incluse dans l'offre
  souscrite et noter ici la durée de rétention.
- Fichiers : les objets stockés ne sont **pas** couverts par la sauvegarde de
  la base. Le dépôt `user-documents` doit être copié séparément — _à mettre en
  place_.
- Code et configuration : dépôt GitHub ; les déploiements sont reproductibles.
- Avant toute migration destructive : sauvegarde à la demande, point de
  restauration noté dans la demande de fusion.

## 3. Exercice de restauration (trimestriel)

1. Restaurer la base dans un projet de test.
2. Comparer le nombre de lignes des dix plus grandes tables.
3. Déchiffrer une note clinique de test de bout en bout.
4. Chronométrer, puis consigner : date, durée, écarts, corrections.

**Aucun exercice n'a encore été réalisé.** Tant que c'est le cas, la durée de
reprise réelle est inconnue et ne doit être promise à personne.

## 4. Scénarios

| Scénario                        | Réponse                                                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Panne de l'hébergeur de la base | Message d'état sur le site ; les spécialistes préviennent leurs clients ; visio de secours                     |
| Panne de la visio               | Bascule sur un lien de secours convenu avec le spécialiste ; la séance n'est pas facturée si elle n'a pas lieu |
| Déploiement défectueux          | Retour à la version précédente (`rollback.yml`)                                                                |
| Indisponibilité du fondateur    | ⚠️ Un suppléant doit détenir un accès de secours scellé et savoir appliquer le document 03                     |
| Perte d'un compte d'hébergement | Codes de secours hors ligne ; second propriétaire sur chaque compte — _à mettre en place_                      |

## 5. Dépendance à une seule personne

Aujourd'hui, le fondateur est à la fois responsable du traitement,
responsable clinique, administrateur et décideur technique. C'est le premier
risque de continuité. Mesure minimale : un suppléant nommé pour les incidents
et un second propriétaire sur les comptes Supabase, Cloudflare, GitHub et le
registraire du domaine.
