import type { LegalDoc } from "@/components/legal/LegalDocument";
import { COMPANY } from "./company";

const PRIVACY = COMPANY.email;
const mail = (a: string) => <a href={`mailto:${a}`}>{a}</a>;

const en: LegalDoc = {
  title: "Privacy Policy",
  seoTitle: "Privacy Policy — UPSY",
  description:
    "How UPSY collects, uses, stores and protects personal and health data, under Moroccan Law 09-08 and the GDPR.",
  updated: "21 October 2026",
  updatedLabel: "Last updated",
  contentsLabel: "Contents",
  intro: (
    <p>
      UPSY is a psychology and performance platform. Some of what you share with
      us, such as questionnaire answers, journal entries and session notes, is
      health data, which the law treats as sensitive. This policy explains what
      we collect, why, who processes it on our behalf, how long we keep it, and
      how to exercise your rights.
    </p>
  ),
  sections: [
    {
      id: "controller",
      title: "Who is responsible for your data",
      body: (
        <p>
          The data controller is UPSY, operated by Mehdi Felji, registered as an
          auto-entrepreneur in Morocco, website{" "}
          <a href="https://upsy.ma">upsy.ma</a>. For any question about your
          data, write to {mail(PRIVACY)}.
        </p>
      ),
    },
    {
      id: "data",
      title: "What we collect",
      body: (
        <ul>
          <li>
            <strong>Account data:</strong> name, email address, phone number
            (optional), password (stored only as a hash), profile photo,
            language and role (client, specialist, organisation).
          </li>
          <li>
            <strong>Sign-in with Google or Apple:</strong> your name, email
            address and profile picture, as shared by that provider.
          </li>
          <li>
            <strong>Health and wellbeing data:</strong> answers to screening
            questionnaires (such as GAD-7 and PHQ-9), intake forms, journal
            entries, check-ins, messages to the AI assistant, and notes your
            specialist writes about your sessions.
          </li>
          <li>
            <strong>Booking data:</strong> appointments, their status and the
            specialist involved.
          </li>
          <li>
            <strong>Payment data:</strong> purchases and payment confirmations.
            If you pay a session by transfer: the receipt you upload, the
            transfer reference and the amount. Receipts are visible only to you,
            to the specialist for that session and to UPSY staff who check
            payments. Card details for course purchases and subscriptions are
            entered directly with our payment provider (Stripe) and never reach
            our servers.
          </li>
          <li>
            <strong>Specialist applications:</strong> identity, diplomas,
            accreditation and professional documents, stored in a private,
            access-restricted space.
          </li>
          <li>
            <strong>Technical data:</strong> IP address and browser information
            in server logs, error reports, and usage statistics (see section 9).
          </li>
        </ul>
      ),
    },
    {
      id: "purposes",
      title: "Why we use it, and on what legal basis",
      body: (
        <ul>
          <li>
            <strong>Providing the service</strong> (your account, matching you
            with a specialist, bookings, video sessions, clinical tools):
            performance of our contract with you.
          </li>
          <li>
            <strong>Processing health data:</strong> your explicit consent,
            which you give when you use the clinical features and can withdraw
            at any time (section 8).
          </li>
          <li>
            <strong>Safety:</strong> some messages are screened automatically
            for signs of crisis so that emergency resources can be shown to you
            (section 4). This rests on your consent and on protecting your vital
            interests.
          </li>
          <li>
            <strong>Payments, invoicing and accounting:</strong> our contract
            with you and our legal obligations.
          </li>
          <li>
            <strong>Security, fraud prevention and fixing errors:</strong> our
            legitimate interest in running a safe and reliable platform.
          </li>
          <li>
            <strong>Service emails</strong> (confirmations, reminders, account
            security): performance of the contract. We send marketing messages
            only with your consent.
          </li>
        </ul>
      ),
    },
    {
      id: "ai",
      title: "AI features",
      body: (
        <>
          <p>
            Some features use AI models: the AI assistant, journal summaries,
            session summaries, the preparation briefs specialists can generate
            before a session, and crisis screening. To produce a result, the
            text that feature needs (for example your journal entry or your
            message) is sent to an AI model and the answer is sent back.
          </p>
          <p>
            These requests go through the Lovable AI gateway to models from
            Google (Gemini) and OpenAI. We send only the data the feature needs
            and do not sell it.
          </p>
          <p>
            AI output is a support tool, not a diagnosis or treatment decision.
            Your specialist remains responsible for clinical judgement.
          </p>
        </>
      ),
    },
    {
      id: "sharing",
      title: "Who we share it with",
      body: (
        <>
          <p>We do not sell your data. We share it only with:</p>
          <ul>
            <li>
              <strong>Your specialist:</strong> the specialist you book sees
              what they need to care for you. If you join through an
              organisation (for example a club or employer), it sees aggregated
              results such as team survey summaries, not your individual
              sessions, notes or journal.
            </li>
            <li>
              <strong>UPSY administrators:</strong> a small number of people,
              bound by confidentiality, who run the service. They cannot browse
              clinical records (session notes, questionnaires, intake forms,
              treatment plans, mood and journal entries) or the files you
              upload. In an exceptional case (a safety concern, a request you
              make or a legal obligation) an administrator can open a specific
              record only after writing down the reason; every such access is
              permanently logged. Crisis alerts remain visible to administrators
              so that someone can always respond.
            </li>
            <li>
              <strong>Service providers</strong> that process data on our behalf
              and under our instructions (section 6).
            </li>
            <li>
              <strong>Authorities,</strong> when the law requires it, or when
              disclosure is necessary to protect someone's life.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "processors",
      title: "Service providers and international transfers",
      body: (
        <>
          <ul>
            <li>
              Supabase: database, sign-in, file storage and server functions.
            </li>
            <li>Cloudflare: website hosting and delivery.</li>
            <li>
              Lovable, Google and OpenAI: AI features (section 4) and email
              delivery infrastructure.
            </li>
            <li>Resend: sending service emails.</li>
            <li>Stripe: card payments for courses and subscriptions.</li>
            <li>
              Our bank, CashPlus and Wafacash: receiving session payments you
              send by transfer.
            </li>
            <li>Jitsi Meet: video sessions.</li>
            <li>PostHog: anonymised usage statistics, hosted in the EU.</li>
            <li>
              Sentry: error reports, with personal details removed before
              sending.
            </li>
            <li>Google: Tag Manager, Maps and Sign-In; Apple: Sign-In.</li>
          </ul>
          <p>
            These providers are located outside Morocco, mainly in the European
            Union and the United States. Transfers are made under the conditions
            of Law 09-08 and subject to the authorisations of the CNDP, whose
            declaration procedure is in progress, and under contractual
            safeguards with each provider.
          </p>
        </>
      ),
    },
    {
      id: "retention",
      title: "How long we keep it",
      body: (
        <ul>
          <li>
            <strong>Account data:</strong> while your account is active. When
            you ask us to delete your account, it is deleted or anonymised
            within 30 days, except what we are legally required to keep.
          </li>
          <li>
            <strong>Clinical records</strong> (session notes, questionnaires,
            intake forms, treatment plans, mood, journal and AI conversations):
            10 years after your last activity on UPSY, the common international
            standard for health records. They are then deleted automatically. If
            you delete your account earlier, they stay locked, visible only to
            the specialist who wrote them, until that period ends.
          </li>
          <li>
            <strong>Invoices and payment records:</strong> 10 years, as Moroccan
            accounting law requires.
          </li>
          <li>
            <strong>Security audit log</strong> (who accessed what, never the
            content): 6 years.
          </li>
          <li>
            <strong>Logs and error reports:</strong> for a limited period, only
            as long as needed for security and fixing problems.
          </li>
        </ul>
      ),
    },
    {
      id: "rights",
      title: "Your rights",
      body: (
        <>
          <p>
            You can ask to access your data, correct it, delete it, receive a
            copy in a reusable format, restrict how it is used, or object to its
            use. Where we rely on your consent, you can withdraw it at any time;
            this does not affect processing already carried out.
          </p>
          <p>
            The quickest way is the <strong>Privacy</strong> tab of your
            dashboard: download a copy of your data at any time, and send a
            request to correct, restrict, object or delete. You can also write
            to {mail(PRIVACY)} from the email address on your account. We reply
            within one month.
          </p>
          <p>
            Each deletion request is checked by a person, to confirm it comes
            from you, and carried out within 30 days. Clinical records and
            invoices are kept for the periods in section 7, because the law
            requires it.
          </p>
          <p>
            You can also complain to the CNDP, the Moroccan data protection
            authority (<a href="https://www.cndp.ma">www.cndp.ma</a>), or, if
            you live in the European Union, to your local data protection
            authority.
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      title: "Cookies and local storage",
      body: (
        <ul>
          <li>
            <strong>Necessary:</strong> keeping you signed in (stored in your
            browser), and remembering your language (a cookie named{" "}
            <code>lng</code>, kept 180 days) and your light or dark theme.
          </li>
          <li>
            <strong>Statistics:</strong> PostHog measures how the site is used,
            with IP addresses anonymised, no automatic click tracking and no
            session recording.
          </li>
          <li>
            <strong>Error reports:</strong> Sentry receives technical details
            when something breaks, with personal details removed.
          </li>
          <li>
            <strong>Google Tag Manager</strong> loads measurement tags we
            configure.
          </li>
        </ul>
      ),
    },
    {
      id: "security",
      title: "Security",
      body: (
        <p>
          Data is encrypted in transit and at rest. Access is controlled per
          user and per role, so a specialist sees only their own clients and a
          client only their own records. Email verification is required,
          passwords are checked against known leaks, and two-factor
          authentication is available. If a breach affects your data, we will
          inform you and the competent authorities as the law requires.
        </p>
      ),
    },
    {
      id: "minors",
      title: "Minors",
      body: (
        <p>
          UPSY is intended for adults. A person under 18 may use it only with
          the authorisation of a parent or legal guardian, who can exercise the
          rights described above on their behalf.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: (
        <p>
          We will update this page when our practices change and show the new
          date at the top. If a change is significant, we will tell you by email
          or in the app before it applies.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      body: (
        <p>UPSY, Mehdi Felji. Data protection requests: {mail(PRIVACY)}.</p>
      ),
    },
  ],
};

const fr: LegalDoc = {
  title: "Politique de confidentialité",
  seoTitle: "Politique de confidentialité — UPSY",
  description:
    "Comment UPSY collecte, utilise, conserve et protège les données personnelles et de santé, conformément à la loi marocaine 09-08 et au RGPD.",
  updated: "21 octobre 2026",
  updatedLabel: "Dernière mise à jour",
  contentsLabel: "Sommaire",
  intro: (
    <p>
      UPSY est une plateforme de psychologie et de performance. Une partie de ce
      que vous nous confiez, comme vos réponses aux questionnaires, votre
      journal ou les notes de séance, constitue des données de santé, que la loi
      considère comme sensibles. Cette politique explique ce que nous
      collectons, pourquoi, qui les traite pour notre compte, combien de temps
      nous les conservons et comment exercer vos droits.
    </p>
  ),
  sections: [
    {
      id: "controller",
      title: "Responsable du traitement",
      body: (
        <p>
          Le responsable du traitement est UPSY, exploité par Mehdi Felji,
          auto-entrepreneur immatriculé au Maroc, site{" "}
          <a href="https://upsy.ma">upsy.ma</a>. Pour toute question sur vos
          données, écrivez à {mail(PRIVACY)}.
        </p>
      ),
    },
    {
      id: "data",
      title: "Données collectées",
      body: (
        <ul>
          <li>
            <strong>Données de compte :</strong> nom, adresse e-mail, numéro de
            téléphone (facultatif), mot de passe (conservé uniquement sous forme
            chiffrée), photo de profil, langue et rôle (client, spécialiste,
            organisation).
          </li>
          <li>
            <strong>Connexion avec Google ou Apple :</strong> votre nom, votre
            adresse e-mail et votre photo de profil, tels que transmis par ce
            fournisseur.
          </li>
          <li>
            <strong>Données de santé et de bien-être :</strong> réponses aux
            questionnaires de dépistage (comme le GAD-7 et le PHQ-9),
            formulaires d'accueil, entrées de journal, bilans, messages à
            l'assistant IA et notes rédigées par votre spécialiste sur vos
            séances.
          </li>
          <li>
            <strong>Données de réservation :</strong> rendez-vous, leur statut
            et le spécialiste concerné.
          </li>
          <li>
            <strong>Données de paiement :</strong> achats et confirmations de
            paiement. Si vous réglez une séance par virement : le justificatif
            que vous déposez, la référence du virement et le montant. Les
            justificatifs ne sont visibles que par vous, par le spécialiste de
            la séance concernée et par l'équipe UPSY chargée de vérifier les
            paiements. Les coordonnées de carte pour l'achat de formations et
            les abonnements sont saisies directement chez notre prestataire de
            paiement (Stripe) et n'atteignent jamais nos serveurs.
          </li>
          <li>
            <strong>Candidatures des spécialistes :</strong> identité, diplômes,
            accréditations et documents professionnels, conservés dans un espace
            privé à accès restreint.
          </li>
          <li>
            <strong>Données techniques :</strong> adresse IP et informations du
            navigateur dans les journaux serveur, rapports d'erreur et
            statistiques d'utilisation (voir section 9).
          </li>
        </ul>
      ),
    },
    {
      id: "purposes",
      title: "Finalités et bases légales",
      body: (
        <ul>
          <li>
            <strong>Fournir le service</strong> (votre compte, la mise en
            relation avec un spécialiste, les réservations, les séances vidéo,
            les outils cliniques) : exécution de notre contrat avec vous.
          </li>
          <li>
            <strong>Traitement des données de santé :</strong> votre
            consentement explicite, donné lorsque vous utilisez les
            fonctionnalités cliniques et retirable à tout moment (section 8).
          </li>
          <li>
            <strong>Sécurité des personnes :</strong> certains messages sont
            analysés automatiquement pour repérer des signes de crise afin de
            vous proposer des ressources d'urgence (section 4). Ce traitement
            repose sur votre consentement et sur la protection de vos intérêts
            vitaux.
          </li>
          <li>
            <strong>Paiements, facturation et comptabilité :</strong> notre
            contrat avec vous et nos obligations légales.
          </li>
          <li>
            <strong>
              Sécurité, prévention de la fraude et correction des erreurs :
            </strong>{" "}
            notre intérêt légitime à exploiter une plateforme sûre et fiable.
          </li>
          <li>
            <strong>E-mails de service</strong> (confirmations, rappels,
            sécurité du compte) : exécution du contrat. Nous n'envoyons de
            messages commerciaux qu'avec votre consentement.
          </li>
        </ul>
      ),
    },
    {
      id: "ai",
      title: "Fonctionnalités d'intelligence artificielle",
      body: (
        <>
          <p>
            Certaines fonctionnalités utilisent des modèles d'IA : l'assistant
            IA, les synthèses de journal, les résumés de séance, les notes de
            préparation que les spécialistes peuvent générer avant une séance,
            et le repérage des situations de crise. Pour produire un résultat,
            le texte nécessaire à la fonctionnalité (par exemple votre entrée de
            journal ou votre message) est envoyé à un modèle d'IA, qui renvoie
            sa réponse.
          </p>
          <p>
            Ces requêtes passent par la passerelle IA de Lovable vers des
            modèles de Google (Gemini) et d'OpenAI. Nous n'envoyons que les
            données nécessaires à la fonctionnalité et ne les vendons pas.
          </p>
          <p>
            Les résultats de l'IA sont une aide, pas un diagnostic ni une
            décision de traitement. Votre spécialiste reste responsable du
            jugement clinique.
          </p>
        </>
      ),
    },
    {
      id: "sharing",
      title: "Destinataires",
      body: (
        <>
          <p>
            Nous ne vendons pas vos données. Nous les partageons uniquement avec
            :
          </p>
          <ul>
            <li>
              <strong>Votre spécialiste :</strong> le spécialiste que vous
              réservez voit ce qui lui est nécessaire pour vous accompagner. Si
              vous rejoignez UPSY par une organisation (par exemple un club ou
              un employeur), celle-ci voit des résultats agrégés, comme les
              synthèses d'enquêtes d'équipe, et non vos séances, notes ou
              journal individuels.
            </li>
            <li>
              <strong>Les administrateurs d'UPSY :</strong> un nombre restreint
              de personnes, tenues à la confidentialité, qui font fonctionner le
              service. Elles ne peuvent pas consulter les dossiers cliniques
              (notes de séance, questionnaires, formulaires d'accueil, plans de
              traitement, humeur et journal) ni les fichiers que vous déposez.
              Dans un cas exceptionnel (risque pour la sécurité, demande de
              votre part ou obligation légale), un administrateur ne peut ouvrir
              un dossier précis qu'après en avoir écrit le motif ; chaque accès
              est journalisé de façon permanente. Les alertes de crise restent
              visibles des administrateurs afin que quelqu'un puisse toujours y
              répondre.
            </li>
            <li>
              <strong>Nos prestataires,</strong> qui traitent les données pour
              notre compte et selon nos instructions (section 6).
            </li>
            <li>
              <strong>Les autorités,</strong> lorsque la loi l'exige, ou lorsque
              la communication est nécessaire pour protéger la vie d'une
              personne.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "processors",
      title: "Prestataires et transferts internationaux",
      body: (
        <>
          <ul>
            <li>
              Supabase : base de données, connexion, stockage de fichiers et
              fonctions serveur.
            </li>
            <li>Cloudflare : hébergement et diffusion du site.</li>
            <li>
              Lovable, Google et OpenAI : fonctionnalités d'IA (section 4) et
              infrastructure d'envoi des e-mails.
            </li>
            <li>Resend : envoi des e-mails de service.</li>
            <li>Stripe : paiements par carte des formations et abonnements.</li>
            <li>
              Notre banque, CashPlus et Wafacash : réception des paiements de
              séances que vous effectuez par virement.
            </li>
            <li>Jitsi Meet : séances vidéo.</li>
            <li>
              PostHog : statistiques d'utilisation anonymisées, hébergées dans
              l'Union européenne.
            </li>
            <li>
              Sentry : rapports d'erreur, dont les données personnelles sont
              retirées avant envoi.
            </li>
            <li>
              Google : Tag Manager, Maps et connexion ; Apple : connexion.
            </li>
          </ul>
          <p>
            Ces prestataires sont situés hors du Maroc, principalement dans
            l'Union européenne et aux États-Unis. Les transferts sont effectués
            dans les conditions prévues par la loi 09-08, sous réserve des
            autorisations de la CNDP, dont la procédure de déclaration est en
            cours, et avec des garanties contractuelles auprès de chaque
            prestataire.
          </p>
        </>
      ),
    },
    {
      id: "retention",
      title: "Durées de conservation",
      body: (
        <ul>
          <li>
            <strong>Données de compte :</strong> tant que votre compte est
            actif. Lorsque vous demandez la suppression de votre compte, ces
            données sont supprimées ou anonymisées sous 30 jours, sauf ce que la
            loi nous oblige à conserver.
          </li>
          <li>
            <strong>Dossiers cliniques</strong> (notes de séance,
            questionnaires, formulaires d'accueil, plans de traitement, humeur,
            journal et conversations avec l'IA) : 10 ans après votre dernière
            activité sur UPSY, la norme internationale courante pour les
            dossiers de santé. Ils sont ensuite supprimés automatiquement. Si
            vous supprimez votre compte avant, ils restent verrouillés, visibles
            uniquement du spécialiste qui les a rédigés, jusqu'à la fin de cette
            durée.
          </li>
          <li>
            <strong>Factures et justificatifs de paiement :</strong> 10 ans,
            comme l'exige le droit comptable marocain.
          </li>
          <li>
            <strong>Journal d'audit de sécurité</strong> (qui a accédé à quoi,
            jamais le contenu) : 6 ans.
          </li>
          <li>
            <strong>Journaux et rapports d'erreur :</strong> pour une durée
            limitée, le temps nécessaire à la sécurité et à la correction des
            problèmes.
          </li>
        </ul>
      ),
    },
    {
      id: "rights",
      title: "Vos droits",
      body: (
        <>
          <p>
            Vous pouvez demander l'accès à vos données, leur rectification, leur
            suppression, leur portabilité dans un format réutilisable, la
            limitation de leur traitement, ou vous opposer à leur utilisation.
            Lorsque le traitement repose sur votre consentement, vous pouvez le
            retirer à tout moment ; cela n'affecte pas les traitements déjà
            effectués.
          </p>
          <p>
            Le plus simple est l'onglet <strong>Privacy</strong>
            (confidentialité) de votre tableau de bord : téléchargez une copie
            de vos données à tout moment et envoyez une demande de
            rectification, de limitation, d'opposition ou de suppression. Vous
            pouvez aussi écrire à {mail(PRIVACY)} depuis l'adresse e-mail de
            votre compte. Nous répondons dans un délai d'un mois.
          </p>
          <p>
            Chaque demande de suppression est vérifiée par une personne, pour
            s'assurer qu'elle émane bien de vous, et traitée sous 30 jours. Les
            dossiers cliniques et les factures sont conservés pendant les durées
            indiquées à la section 7, car la loi l'exige.
          </p>
          <p>
            Vous pouvez également saisir la CNDP, l'autorité marocaine de
            protection des données (
            <a href="https://www.cndp.ma">www.cndp.ma</a>), ou, si vous résidez
            dans l'Union européenne, l'autorité de protection des données de
            votre pays.
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      title: "Cookies et stockage local",
      body: (
        <ul>
          <li>
            <strong>Nécessaires :</strong> maintien de votre connexion (stocké
            dans votre navigateur), mémorisation de votre langue (cookie{" "}
            <code>lng</code>, conservé 180 jours) et de votre thème clair ou
            sombre.
          </li>
          <li>
            <strong>Statistiques :</strong> PostHog mesure l'utilisation du
            site, avec adresses IP anonymisées, sans suivi automatique des clics
            ni enregistrement des sessions.
          </li>
          <li>
            <strong>Rapports d'erreur :</strong> Sentry reçoit des informations
            techniques en cas de panne, sans données personnelles.
          </li>
          <li>
            <strong>Google Tag Manager</strong> charge les balises de mesure que
            nous configurons.
          </li>
        </ul>
      ),
    },
    {
      id: "security",
      title: "Sécurité",
      body: (
        <p>
          Les données sont chiffrées en transit et au repos. L'accès est
          contrôlé par utilisateur et par rôle : un spécialiste ne voit que ses
          propres clients, et un client uniquement ses propres dossiers. La
          vérification de l'adresse e-mail est obligatoire, les mots de passe
          sont comparés aux bases de fuites connues, et l'authentification à
          deux facteurs est disponible. En cas de violation affectant vos
          données, nous vous en informerons, ainsi que les autorités
          compétentes, conformément à la loi.
        </p>
      ),
    },
    {
      id: "minors",
      title: "Mineurs",
      body: (
        <p>
          UPSY s'adresse aux adultes. Une personne de moins de 18 ans ne peut
          l'utiliser qu'avec l'autorisation d'un parent ou tuteur légal, qui
          peut exercer pour elle les droits décrits ci-dessus.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Modifications",
      body: (
        <p>
          Nous mettrons cette page à jour lorsque nos pratiques évoluent, avec
          la nouvelle date en haut de page. En cas de changement important, nous
          vous en informerons par e-mail ou dans l'application avant son entrée
          en vigueur.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      body: (
        <p>
          UPSY, Mehdi Felji. Demandes relatives aux données : {mail(PRIVACY)}.
        </p>
      ),
    },
  ],
};

export const privacyDocs = { en, fr };
