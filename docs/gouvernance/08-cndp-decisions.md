# 08 — CNDP : décisions avant dépôt

Version : projet 0.1 — 15 novembre 2026. Complète la section 5 de
[`docs/cndp/DOSSIER_CNDP.md`](../cndp/DOSSIER_CNDP.md), qui reste la référence
pour le contenu des formulaires.

**À faire relire par un avocat marocain avant dépôt**, en particulier le
régime des transferts vers les États-Unis.

## Les quatre décisions

| #   | Question                                                     | Recommandation                                                                                                                                                                                                    | Pourquoi                                                                                                               |
| --- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | Déposer au nom de l'auto-entrepreneur ou attendre une SARL ? | **Déposer maintenant** au nom de l'auto-entrepreneur, puis notifier le changement à la création de la société                                                                                                     | Le risque le plus élevé du registre est de traiter sans autorisation ; chaque semaine d'attente le prolonge            |
| 2   | Un seul traitement ou plusieurs ?                            | **Un seul**, comme rédigé ; accepter la séparation de la newsletter (F211) si la CNDP la demande                                                                                                                  | Moins de formulaires ; la séparation est une formalité de 24 h                                                         |
| 3   | Quel fournisseur d'IA déclarer ?                             | **Un seul, celui réellement actif**, après retrait de l'autre voie du code. À défaut de contrat signé interdisant la réutilisation : désactiver les fonctions d'IA sur le contenu clinique jusqu'à l'autorisation | C'est le seul flux de données de santé vers les États-Unis ; déclarer deux fournisseurs possibles affaiblit le dossier |
| 4   | Que dire des transferts déjà effectués ?                     | **Les déclarer franchement**, avec la date de mise en ligne                                                                                                                                                       | Le dossier le dit déjà : une situation déclarée se régularise mieux qu'une situation découverte                        |

## Ce qui a changé depuis la rédaction du dossier

- **Mesure d'audience de l'auto-évaluation.** Elle envoyait les réponses et
  les scores au gestionnaire de balises. Une correction est proposée
  (`src/lib/analytics/freeScore.ts`). ⚠️ Fusionner cette correction **avant**
  le dépôt : le dossier affirme qu'aucune donnée de santé ne part vers les
  outils de mesure.
- **Stripe :** le formulaire 4 du F118 n'est utile que si le paiement par carte
  est activé. Il ne l'est pas. Ne pas le déposer tant que c'est le cas.

## Ordre de dépôt

1. Compléter les marques ⚠️ du dossier : identité et pièces du responsable,
   date de mise en ligne, nombre et noms des administrateurs.
2. Trancher la décision 3 et mettre à jour l'annexe A.
3. Signer les contrats des sous-traitants (document 05) et joindre ceux de
   Supabase, du fournisseur d'IA et de 8x8.
4. Confirmer auprès de la CNDP le canal de dépôt en vigueur.
5. Déposer **F112 et F118 ensemble**.
6. À réception du numéro : l'ajouter à la politique de confidentialité et le
   noter dans le registre des risques (R1).

## Ce que je ne peux pas faire à votre place

Signer, déposer, et fournir les pièces d'identité et de qualification. Tout
le reste du dossier est prêt à être complété.
