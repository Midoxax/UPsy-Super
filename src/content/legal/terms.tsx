import type { LegalDoc } from "@/components/legal/LegalDocument";

const CONTACT = "contact@upsy.ma";
const mail = (a: string) => <a href={`mailto:${a}`}>{a}</a>;

const en: LegalDoc = {
  title: "Terms of Service",
  seoTitle: "Terms of Service — UPSY",
  description:
    "The terms that govern use of the UPSY platform: accounts, bookings, cancellations, payments, specialists and liability.",
  updated: "19 October 2026",
  updatedLabel: "Last updated",
  contentsLabel: "Contents",
  intro: (
    <p>
      These terms form the agreement between you and UPSY when you use{" "}
      <a href="https://www.upsy.ma">www.upsy.ma</a> and its services. By
      creating an account or booking a session, you accept them. Please also
      read our <a href="/privacy">Privacy Policy</a>.
    </p>
  ),
  sections: [
    {
      id: "service",
      title: "The service",
      body: (
        <p>
          UPSY connects people with accredited psychologists and performance
          specialists, and provides tools to support that work: booking, video
          sessions, questionnaires, journaling, programmes, courses and
          AI-assisted features. UPSY is operated by Mehdi Felji,
          auto-entrepreneur registered in Morocco.
        </p>
      ),
    },
    {
      id: "emergency",
      title: "Not an emergency service",
      body: (
        <p>
          <strong>
            UPSY is not a crisis or emergency service. If you or someone else is
            in immediate danger, call the emergency services (15 for ambulance
            and fire, 19 for the police in Morocco) or go to the nearest
            emergency department.
          </strong>{" "}
          Messages sent through the platform may not be read straight away.
        </p>
      ),
    },
    {
      id: "account",
      title: "Your account",
      body: (
        <ul>
          <li>
            You must be 18 or older, or have the authorisation of a parent or
            legal guardian.
          </li>
          <li>Give accurate information and keep it up to date.</li>
          <li>
            Keep your password confidential. You are responsible for activity on
            your account; tell us at once at {mail(CONTACT)} if you think
            someone else has accessed it.
          </li>
          <li>
            One account per person. Accounts may not be shared or transferred.
          </li>
        </ul>
      ),
    },
    {
      id: "specialists",
      title: "Specialists",
      body: (
        <>
          <p>
            Specialists on UPSY are independent professionals. We check their
            identity, diplomas and accreditation before they are listed, but the
            therapeutic relationship is between you and your specialist, who is
            responsible for the care they provide and bound by professional
            secrecy.
          </p>
          <p>
            Specialists using UPSY also accept the specialist terms presented
            when they apply, including the commission and plan they choose.
          </p>
        </>
      ),
    },
    {
      id: "bookings",
      title: "Bookings and cancellations",
      body: (
        <ul>
          <li>
            <strong>Free cancellation:</strong> you can cancel or reschedule up
            to 24 hours before your appointment at no charge.
          </li>
          <li>
            <strong>Late cancellation:</strong> cancellations within 24 hours of
            the session are charged 50% of the session fee.
          </li>
          <li>
            <strong>No-show:</strong> a missed appointment without notice is
            charged the full session fee.
          </li>
          <li>Exceptions may be made in emergencies.</li>
        </ul>
      ),
    },
    {
      id: "payments",
      title: "Prices and payment",
      body: (
        <p>
          Prices are shown in Moroccan dirhams (MAD) before you confirm a
          booking or purchase. Online payments are processed by Stripe; we do
          not see or store your card details. Receipts are available for your
          records and for any insurance claim. Psychology sessions are not
          currently reimbursed by the AMO.
        </p>
      ),
    },
    {
      id: "courses",
      title: "Courses and programmes",
      body: (
        <p>
          Paid courses and programmes give you personal access to the content
          for the period shown at purchase. Content may not be copied, shared or
          resold. Refund conditions for a course are those shown on its page at
          the time of purchase, without prejudice to your rights as a consumer
          under Moroccan law.
        </p>
      ),
    },
    {
      id: "ai",
      title: "AI features",
      body: (
        <p>
          AI-assisted features, such as the assistant, summaries and preparation
          briefs, provide general support. They can be wrong, they are not a
          diagnosis or medical advice, and they do not replace a specialist. How
          these features handle your data is described in the{" "}
          <a href="/privacy#ai">Privacy Policy</a>.
        </p>
      ),
    },
    {
      id: "use",
      title: "Acceptable use",
      body: (
        <>
          <p>You agree not to:</p>
          <ul>
            <li>harass, threaten or harm specialists or other users;</li>
            <li>
              record a session without the explicit consent of everyone in it;
            </li>
            <li>impersonate someone or give false professional credentials;</li>
            <li>
              copy, scrape, reverse engineer or disrupt the platform, or try to
              access data that is not yours;
            </li>
            <li>use UPSY for any unlawful purpose.</li>
          </ul>
        </>
      ),
    },
    {
      id: "ip",
      title: "Intellectual property",
      body: (
        <p>
          The platform, its design, texts, programmes and courses belong to UPSY
          or its licensors. You keep the rights to what you write, such as your
          journal, and allow us to store and process it only to provide the
          service to you.
        </p>
      ),
    },
    {
      id: "termination",
      title: "Suspension and closing your account",
      body: (
        <p>
          You can close your account at any time by writing to {mail(CONTACT)}.
          We may suspend or close an account that breaks these terms, after
          notice where possible, or immediately in case of serious misuse or
          danger to others. What happens to your data is described in the{" "}
          <a href="/privacy#retention">Privacy Policy</a>.
        </p>
      ),
    },
    {
      id: "liability",
      title: "Liability",
      body: (
        <p>
          We work to keep UPSY available and secure, but cannot guarantee
          uninterrupted service. Within the limits of the law, UPSY is not
          liable for the clinical care provided by independent specialists, or
          for indirect losses. Nothing in these terms limits your rights as a
          consumer under Moroccan Law 31-08, or liability that cannot be
          excluded by law.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to these terms",
      body: (
        <p>
          We may update these terms. The date at the top shows the latest
          version. If a change is significant, we will tell you by email or in
          the app before it applies. If you do not accept it, you can close your
          account.
        </p>
      ),
    },
    {
      id: "law",
      title: "Governing law and disputes",
      body: (
        <p>
          These terms are governed by Moroccan law. Please contact us first so
          we can try to resolve any issue amicably. Failing that, disputes are
          subject to the courts of Casablanca, without prejudice to any
          consumer's right to bring a claim before the court of their place of
          residence.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      body: <p>UPSY, Mehdi Felji. Email: {mail(CONTACT)}.</p>,
    },
  ],
};

const fr: LegalDoc = {
  title: "Conditions générales d'utilisation",
  seoTitle: "Conditions générales d'utilisation — UPSY",
  description:
    "Les conditions qui encadrent l'utilisation de la plateforme UPSY : compte, réservations, annulations, paiements, spécialistes et responsabilité.",
  updated: "19 octobre 2026",
  updatedLabel: "Dernière mise à jour",
  contentsLabel: "Sommaire",
  intro: (
    <p>
      Ces conditions constituent l'accord entre vous et UPSY lorsque vous
      utilisez <a href="https://www.upsy.ma">www.upsy.ma</a> et ses services. En
      créant un compte ou en réservant une séance, vous les acceptez. Consultez
      également notre <a href="/fr/privacy">Politique de confidentialité</a>.
    </p>
  ),
  sections: [
    {
      id: "service",
      title: "Le service",
      body: (
        <p>
          UPSY met en relation des personnes avec des psychologues et des
          spécialistes de la performance accrédités, et fournit des outils pour
          accompagner ce travail : réservation, séances vidéo, questionnaires,
          journal, programmes, formations et fonctionnalités assistées par l'IA.
          UPSY est exploité par Mehdi Felji, auto-entrepreneur immatriculé au
          Maroc.
        </p>
      ),
    },
    {
      id: "emergency",
      title: "Ce n'est pas un service d'urgence",
      body: (
        <p>
          <strong>
            UPSY n'est pas un service de crise ou d'urgence. Si vous ou une
            autre personne êtes en danger immédiat, appelez les services
            d'urgence (15 pour la protection civile, 19 pour la police au Maroc)
            ou rendez-vous aux urgences les plus proches.
          </strong>{" "}
          Les messages envoyés par la plateforme peuvent ne pas être lus
          immédiatement.
        </p>
      ),
    },
    {
      id: "account",
      title: "Votre compte",
      body: (
        <ul>
          <li>
            Vous devez avoir 18 ans ou plus, ou disposer de l'autorisation d'un
            parent ou tuteur légal.
          </li>
          <li>Fournissez des informations exactes et tenez-les à jour.</li>
          <li>
            Gardez votre mot de passe confidentiel. Vous êtes responsable de
            l'activité de votre compte ; prévenez-nous sans délai à{" "}
            {mail(CONTACT)} si vous pensez qu'une autre personne y a accédé.
          </li>
          <li>
            Un compte par personne. Un compte ne peut être ni partagé ni cédé.
          </li>
        </ul>
      ),
    },
    {
      id: "specialists",
      title: "Les spécialistes",
      body: (
        <>
          <p>
            Les spécialistes présents sur UPSY sont des professionnels
            indépendants. Nous vérifions leur identité, leurs diplômes et leurs
            accréditations avant leur mise en ligne, mais la relation
            thérapeutique s'établit entre vous et votre spécialiste, qui est
            responsable des soins qu'il fournit et tenu au secret professionnel.
          </p>
          <p>
            Les spécialistes qui utilisent UPSY acceptent également les
            conditions spécialistes présentées lors de leur candidature, y
            compris la commission et la formule choisies.
          </p>
        </>
      ),
    },
    {
      id: "bookings",
      title: "Réservations et annulations",
      body: (
        <ul>
          <li>
            <strong>Annulation gratuite :</strong> vous pouvez annuler ou
            reporter jusqu'à 24 heures avant votre rendez-vous, sans frais.
          </li>
          <li>
            <strong>Annulation tardive :</strong> une annulation moins de 24
            heures avant la séance est facturée 50 % du tarif de la séance.
          </li>
          <li>
            <strong>Absence :</strong> un rendez-vous manqué sans prévenir est
            facturé au tarif plein.
          </li>
          <li>Des exceptions sont possibles en cas d'urgence.</li>
        </ul>
      ),
    },
    {
      id: "payments",
      title: "Prix et paiement",
      body: (
        <p>
          Les prix sont indiqués en dirhams marocains (MAD) avant la
          confirmation d'une réservation ou d'un achat. Les paiements en ligne
          sont traités par Stripe ; nous ne voyons ni ne conservons vos
          coordonnées bancaires. Des reçus sont disponibles pour vos dossiers et
          pour toute demande auprès d'une assurance. Les séances de psychologie
          ne sont pas actuellement remboursées par l'AMO.
        </p>
      ),
    },
    {
      id: "courses",
      title: "Formations et programmes",
      body: (
        <p>
          Les formations et programmes payants vous donnent un accès personnel
          au contenu pour la durée indiquée lors de l'achat. Le contenu ne peut
          être ni copié, ni partagé, ni revendu. Les conditions de remboursement
          d'une formation sont celles affichées sur sa page au moment de
          l'achat, sans préjudice de vos droits de consommateur au titre du
          droit marocain.
        </p>
      ),
    },
    {
      id: "ai",
      title: "Fonctionnalités d'IA",
      body: (
        <p>
          Les fonctionnalités assistées par l'IA, comme l'assistant, les
          synthèses et les notes de préparation, apportent une aide générale.
          Elles peuvent se tromper, ne constituent ni un diagnostic ni un avis
          médical, et ne remplacent pas un spécialiste. Le traitement de vos
          données par ces fonctionnalités est décrit dans la{" "}
          <a href="/fr/privacy#ai">Politique de confidentialité</a>.
        </p>
      ),
    },
    {
      id: "use",
      title: "Utilisation acceptable",
      body: (
        <>
          <p>Vous vous engagez à ne pas :</p>
          <ul>
            <li>
              harceler, menacer ou nuire aux spécialistes ou aux autres
              utilisateurs ;
            </li>
            <li>
              enregistrer une séance sans le consentement explicite de tous les
              participants ;
            </li>
            <li>
              usurper une identité ou fournir de faux titres professionnels ;
            </li>
            <li>
              copier, extraire, désassembler ou perturber la plateforme, ou
              tenter d'accéder à des données qui ne sont pas les vôtres ;
            </li>
            <li>utiliser UPSY à des fins illicites.</li>
          </ul>
        </>
      ),
    },
    {
      id: "ip",
      title: "Propriété intellectuelle",
      body: (
        <p>
          La plateforme, son design, ses textes, programmes et formations
          appartiennent à UPSY ou à ses concédants. Vous conservez vos droits
          sur ce que vous écrivez, comme votre journal, et nous autorisez à le
          conserver et le traiter uniquement pour vous fournir le service.
        </p>
      ),
    },
    {
      id: "termination",
      title: "Suspension et fermeture du compte",
      body: (
        <p>
          Vous pouvez fermer votre compte à tout moment en écrivant à{" "}
          {mail(CONTACT)}. Nous pouvons suspendre ou fermer un compte qui
          enfreint ces conditions, après avertissement lorsque c'est possible,
          ou immédiatement en cas d'abus grave ou de danger pour autrui. Le sort
          de vos données est décrit dans la{" "}
          <a href="/fr/privacy#retention">Politique de confidentialité</a>.
        </p>
      ),
    },
    {
      id: "liability",
      title: "Responsabilité",
      body: (
        <p>
          Nous faisons le nécessaire pour que UPSY reste disponible et sûr, sans
          pouvoir garantir un service ininterrompu. Dans les limites de la loi,
          UPSY n'est pas responsable des soins fournis par les spécialistes
          indépendants, ni des préjudices indirects. Rien dans ces conditions ne
          limite vos droits de consommateur au titre de la loi marocaine 31-08,
          ni une responsabilité qui ne peut être exclue par la loi.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Modification des conditions",
      body: (
        <p>
          Nous pouvons modifier ces conditions. La date en haut de page indique
          la version en vigueur. En cas de changement important, nous vous en
          informerons par e-mail ou dans l'application avant son entrée en
          vigueur. Si vous ne l'acceptez pas, vous pouvez fermer votre compte.
        </p>
      ),
    },
    {
      id: "law",
      title: "Droit applicable et litiges",
      body: (
        <p>
          Ces conditions sont régies par le droit marocain. Contactez-nous
          d'abord afin que nous puissions tenter de résoudre tout différend à
          l'amiable. À défaut, les litiges relèvent des tribunaux de Casablanca,
          sans préjudice du droit de tout consommateur de saisir le tribunal de
          son lieu de résidence.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      body: <p>UPSY, Mehdi Felji. E-mail : {mail(CONTACT)}.</p>,
    },
  ],
};

export const termsDocs = { en, fr };
