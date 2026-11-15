# 05 — Registre des sous-traitants

|             |                                                             |
| ----------- | ----------------------------------------------------------- |
| Responsable | FELJI Mehdi, responsable du traitement                      |
| Version     | Projet 0.1 — 15 novembre 2026                               |
| Mise à jour | À chaque ajout, retrait ou changement de pays d'hébergement |

Source : politique de confidentialité, dossier CNDP (`docs/cndp/`) et code.
**Aucun contrat n'est enregistré comme signé à ce jour.** La colonne « DPA
signé le » se remplit au fur et à mesure (document 00, point 3).

| Sous-traitant                       | Rôle                             | Pays                                 | Données                                           | Santé ?                                 | DPA signé le |
| ----------------------------------- | -------------------------------- | ------------------------------------ | ------------------------------------------------- | --------------------------------------- | ------------ |
| Supabase                            | Base, authentification, fichiers | Royaume-Uni (Londres)                | Comptes, réservations, dossiers cliniques, notes  | **Oui**                                 | ⚠️           |
| Cloudflare                          | Exécution du site, protection    | États-Unis, réseau mondial           | Adresse IP, pages en transit                      | Non                                     | ⚠️           |
| Resend                              | Emails de service, newsletter    | États-Unis                           | Nom, email, date du rendez-vous                   | Non                                     | ⚠️           |
| 8x8 (Jitsi as a Service)            | Visioconférence                  | États-Unis ; serveurs ⚠️ à confirmer | Flux audio et vidéo en direct, non enregistrés    | **Oui** (contenu de séance, en transit) | ⚠️           |
| Fournisseur d'IA                    | Synthèses, résumés, assistant    | États-Unis                           | Texte lié à la santé, après consentement distinct | **Oui**                                 | ⚠️           |
| PostHog                             | Mesure d'audience                | UE (Allemagne)                       | Navigation pseudonyme, après consentement         | Non                                     | ⚠️           |
| Google (Tag Manager, Maps, Sign-In) | Balises, cartes, connexion       | États-Unis                           | Navigation si consentement, connexion             | Non                                     | ⚠️           |
| Meta (WhatsApp)                     | Rappels                          | États-Unis, Irlande                  | Téléphone, date du rendez-vous                    | Non                                     | ⚠️           |
| Sentry                              | Rapports d'erreur                | États-Unis                           | Erreurs techniques, données personnelles retirées | Non                                     | ⚠️           |
| Apple (Sign in with Apple)          | Connexion                        | États-Unis                           | Nom, email                                        | Non                                     | ⚠️           |
| Stripe                              | Paiement par carte               | Irlande                              | Nom, email, montant                               | Non                                     | ⚠️ si activé |
| GitHub                              | Code source                      | États-Unis                           | Aucune donnée de production                       | Non                                     | ⚠️           |

## Points à régler

1. **Fournisseur d'IA.** Le code appelle Anthropic lorsque la clé
   correspondante est configurée, et sinon une passerelle tierce (Lovable).
   ⚠️ Confirmer lequel est actif en production, retirer l'autre, et obtenir un
   contrat qui interdit la réutilisation des données. C'est le flux que la
   CNDP examinera de plus près.
2. **8x8 :** confirmer la région des serveurs de visio.
3. **Resend :** confirmer la durée de conservation des journaux d'envoi.
4. **Règle d'entrée :** aucun nouveau sous-traitant ne reçoit de données avant
   son inscription ici, la mise à jour de la politique de confidentialité et,
   hors pays adéquats, l'accord de la CNDP.

## Règle pour les outils de publicité

Aucune réponse à un questionnaire, aucun score ni aucun résultat ne part vers
Tag Manager ou un outil publicitaire. Voir `src/lib/analytics/freeScore.ts`.
