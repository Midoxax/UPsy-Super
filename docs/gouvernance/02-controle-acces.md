# 02 — Politique de contrôle d'accès

|                 |                                        |
| --------------- | -------------------------------------- |
| Responsable     | FELJI Mehdi, responsable du traitement |
| Version         | Projet 0.1 — 15 novembre 2026          |
| Prochaine revue | ⚠️ date de signature + 12 mois         |

## 1. Rôles et ce que chacun peut voir

| Rôle                      | Voit                                        | Ne voit jamais                            |
| ------------------------- | ------------------------------------------- | ----------------------------------------- |
| Client                    | Ses rendez-vous, ses résultats, son journal | Les données d'un autre client             |
| Spécialiste               | Ses propres clients et ses notes            | Les clients d'un confrère                 |
| Organisation, club, ligue | Des agrégats de son effectif                | Un résultat ou une note individuelle      |
| Administrateur            | Comptes, paiements, exploitation            | Le contenu clinique, hors accès d'urgence |
| Prestataire technique     | Le code, les environnements de test         | Les données de production, hors incident  |

Les rôles présents en base au 15 novembre 2026 : administrateur, psychologue,
athlète, coach, ligue, organisation, utilisateur.

## 2. Attribution et retrait

1. Un rôle est attribué par un administrateur, sur demande écrite, pour un
   besoin précis.
2. Un spécialiste n'est publié qu'après vérification de ses diplômes et de son
   droit d'exercer (document 07, section 4).
3. Tout départ entraîne le retrait du rôle **le jour même**.
4. Revue des comptes à privilèges **chaque trimestre** : liste des
   administrateurs et des spécialistes, confirmation que chacun est encore
   légitime. La revue est datée dans le registre des risques.

## 3. Authentification

- Double authentification **obligatoire** pour les administrateurs.
- Double authentification **obligatoire** pour les spécialistes — _à mettre en
  place_ : aujourd'hui proposée, pas encore imposée. Étape suivante : la
  rendre bloquante pour le rôle psychologue une fois les comptes existants
  inscrits.
- Refus des mots de passe connus comme compromis — _à activer_ (document 00).
- Déconnexion automatique après inactivité : en place.
- Aucun compte partagé. Un compte, une personne.

## 4. Accès d'urgence au dossier clinique

- Réservé aux administrateurs, avec double authentification.
- Motif écrit obligatoire avant l'ouverture.
- Chaque ouverture est inscrite dans le journal d'audit, qui ne peut pas être
  modifié.
- Cas admis : danger pour la personne, demande de l'intéressé, obligation
  légale, incident technique empêchant le spécialiste d'accéder au dossier.
- Chaque usage est relu par le responsable clinique dans les 7 jours.

## 5. Accès des outils et des assistants automatisés

- Lecture seule par défaut. Toute écriture en production passe par une
  demande de fusion relue.
- Aucune donnée clinique n'est copiée dans un outil externe pour analyse.
