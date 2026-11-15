# 06 — Registre des risques

|             |                                        |
| ----------- | -------------------------------------- |
| Responsable | FELJI Mehdi, responsable du traitement |
| Version     | Projet 0.1 — 15 novembre 2026          |
| Revue       | Trimestrielle, et après tout incident  |

Échelle : probabilité et impact de 1 (faible) à 3 (fort). Niveau = produit.
Les constats chiffrés viennent d'une lecture de la base de production le
15 novembre 2026 (comptages uniquement, aucun contenu).

| #   | Risque                                                                                                                                   | P   | I   | Niveau | Traitement                                                                                                           | Échéance |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | --- | --- | ------ | -------------------------------------------------------------------------------------------------------------------- | -------- |
| R1  | Traitement de données de santé et transferts à l'étranger sans autorisation de la CNDP                                                   | 3   | 3   | **9**  | Déposer F112 et F118 ensemble (document 08)                                                                          | ⚠️       |
| R2  | Compte administrateur ou spécialiste compromis faute de double authentification                                                          | 2   | 3   | **6**  | Document 00, point 1 ; la rendre bloquante pour le rôle psychologue                                                  | ⚠️       |
| R3  | Texte lié à la santé envoyé à un fournisseur d'IA non confirmé, sans contrat signé                                                       | 2   | 3   | **6**  | Confirmer le fournisseur, signer, retirer la passerelle inutilisée (document 05)                                     | ⚠️       |
| R4  | Tout repose sur une seule personne (clinique, technique, administratif)                                                                  | 3   | 2   | **6**  | Suppléant nommé ; second propriétaire sur les comptes (document 04)                                                  | ⚠️       |
| R5  | Sauvegarde jamais restaurée : durée de reprise inconnue                                                                                  | 2   | 3   | **6**  | Premier exercice de restauration (document 04)                                                                       | ⚠️       |
| R6  | Urgence pendant une séance à distance sans personne à prévenir ni adresse connue                                                         | 1   | 3   | 3      | Contact d'urgence et lieu demandés à la réservation (document 07)                                                    | ⚠️       |
| R7  | Offre de soins insuffisante : **1 spécialiste publié**, 7 profils non publiés                                                            | 3   | 2   | **6**  | Publier les profils vérifiés ; aucun effort d'acquisition côté clients avant d'avoir au moins 5 spécialistes publiés | ⚠️       |
| R8  | Réservations qui n'aboutissent pas : 17 réservations au total, 13 annulées, 1 payée                                                      | 3   | 2   | **6**  | Comprendre la cause (tests, paiement, disponibilité) avant d'investir en publicité                                   | ⚠️       |
| R9  | Aucun paiement enregistré dans la table des paiements : le circuit d'encaissement n'est pas prouvé                                       | 3   | 2   | **6**  | Un paiement réel de bout en bout, rapproché, facturé                                                                 | ⚠️       |
| R10 | Prix plancher incohérent : 200 MAD dans la configuration, 300 MAD dans la stratégie                                                      | 2   | 1   | 2      | Décider, puis aligner la configuration                                                                               | ⚠️       |
| R11 | Exercice d'un spécialiste sans droit d'exercer à jour                                                                                    | 1   | 3   | 3      | Revérification annuelle (document 07)                                                                                | ⚠️       |
| R12 | Outil de mesure présenté comme clinique alors qu'il n'est pas validé (auto-évaluation en 12 items)                                       | 2   | 2   | 4      | Libellés descriptifs en place ; plan de validation en contexte marocain                                              | ⚠️       |
| R13 | Dérive des dépendances dans l'intégration continue (cas Prettier, 13 novembre)                                                           | 2   | 1   | 2      | Versions figées pour les outils de contrôle                                                                          | ⚠️       |
| R14 | Vue de base de données exécutée avec les droits de son créateur (avis de sécurité Supabase)                                              | 2   | 2   | 4      | Revue des fonctions et vues à droits élevés (backlog 3.1)                                                            | ⚠️       |
| R15 | Numéros d'urgence incomplets dans les conditions d'utilisation (15 et 19) par rapport à ceux affichés dans le produit (141, 19, 177, 15) | 1   | 2   | 2      | Aligner les trois langues sur `src/lib/crisisLines.ts`                                                               | ⚠️       |

## Lecture

- **Le risque le plus élevé est administratif (R1), pas technique.**
- R7, R8 et R9 sont des risques d'activité : la plateforme est construite,
  mais l'offre de spécialistes et le circuit de paiement ne sont pas encore
  éprouvés par des clients réels. Toute projection de revenus doit partir de
  là.
- Les comptages peuvent inclure des essais internes. ⚠️ À confirmer par le
  fondateur, qui seul sait quelles réservations étaient des tests.

## Journal des revues

| Date | Par | Changements |
| ---- | --- | ----------- |
| ⚠️   |     |             |
