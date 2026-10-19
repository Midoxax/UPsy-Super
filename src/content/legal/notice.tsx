import type { LegalDoc } from "@/components/legal/LegalDocument";
import { COMPANY } from "./company";

const CONTACT = COMPANY.email;
const PRIVACY = COMPANY.email;
const mail = (a: string) => <a href={`mailto:${a}`}>{a}</a>;

const en: LegalDoc = {
  title: "Legal Information",
  seoTitle: "Legal Information — UPSY",
  description:
    "Publisher and hosting information, ethics and confidentiality, and telehealth security at UPSY.",
  updated: "19 October 2026",
  updatedLabel: "Last updated",
  contentsLabel: "Contents",
  sections: [
    {
      id: "publisher",
      title: "Publisher",
      body: (
        <>
          <p>
            <a href="https://www.upsy.ma">www.upsy.ma</a> is published by Mehdi
            Felji, registered in the Moroccan national register of
            auto-entrepreneurs, who is also the director of publication.
          </p>
          <ul>
            <li>Auto-entrepreneur ID: {COMPANY.autoEntrepreneurId}</li>
            <li>Tax ID (IF): {COMPANY.taxId}</li>
            <li>Professional tax no. (TP): {COMPANY.professionalTaxNo}</li>
            <li>Address: {COMPANY.address.join(", ")}</li>
            <li>Email: {mail(CONTACT)}</li>
          </ul>
        </>
      ),
    },
    {
      id: "hosting",
      title: "Hosting",
      body: (
        <p>
          The website is hosted by Cloudflare, Inc., 101 Townsend Street, San
          Francisco, CA 94107, United States. The application's data is stored
          with Supabase, Inc. The full list of service providers is in the{" "}
          <a href="/privacy#processors">Privacy Policy</a>.
        </p>
      ),
    },
    {
      id: "documents",
      title: "Terms and privacy",
      body: (
        <ul>
          <li>
            <a href="/terms">Terms of Service</a>: the rules for using UPSY,
            bookings, cancellations and payments.
          </li>
          <li>
            <a href="/privacy">Privacy Policy</a>: what data we collect, why,
            and your rights under Moroccan Law 09-08 and the GDPR.
          </li>
        </ul>
      ),
    },
    {
      id: "ethics",
      title: "Ethics and confidentiality",
      body: (
        <>
          <p>
            Specialists listed on UPSY are checked before they appear: we verify
            their identity, diplomas and professional accreditation. They
            practise independently and remain bound by the ethical rules of
            their profession.
          </p>
          <p>
            What you share in a session is covered by professional secrecy
            (Article 446 of the Moroccan Penal Code). Your specialist will not
            disclose it without your consent, except where the law requires it
            or where there is a serious and immediate risk to your life or
            someone else's.
          </p>
          <p>
            UPSY administrators cannot browse clinical records. In an
            exceptional case (a safety concern, a request you make or a legal
            obligation) an administrator can open a specific record only after
            writing down the reason, and every such access is permanently
            logged. Administrators are bound by confidentiality.
          </p>
          <p>
            If you have a concern about a specialist's conduct, write to{" "}
            {mail(CONTACT)}. We review every report and may suspend a specialist
            while it is examined.
          </p>
        </>
      ),
    },
    {
      id: "telehealth",
      title: "Telehealth security",
      body: (
        <>
          <p>
            Video sessions run on Jitsi Meet in your browser, with no software
            to install. Audio and video are encrypted between your device and
            the video service. Sessions are not recorded by UPSY.
          </p>
          <p>
            The rest of the platform uses encrypted connections (HTTPS), and
            your data is encrypted at rest. Each person can only see their own
            records, and a specialist only their own clients. You can turn on
            two-factor authentication in your account settings.
          </p>
          <p>For a private session, we recommend that you:</p>
          <ul>
            <li>
              join from a quiet room where you cannot be overheard, ideally with
              headphones;
            </li>
            <li>use your own device rather than a shared or public one;</li>
            <li>
              open the session only from the link in your UPSY account or
              confirmation email;
            </li>
            <li>sign out afterwards if anyone else uses the device.</li>
          </ul>
          <p>
            If you notice anything suspicious, such as an unexpected participant
            or a link you did not request, leave the session and write to{" "}
            {mail(PRIVACY)}.
          </p>
        </>
      ),
    },
  ],
};

const fr: LegalDoc = {
  title: "Mentions légales",
  seoTitle: "Mentions légales — UPSY",
  description:
    "Éditeur et hébergement, éthique et confidentialité, et sécurité de la téléconsultation chez UPSY.",
  updated: "19 octobre 2026",
  updatedLabel: "Dernière mise à jour",
  contentsLabel: "Sommaire",
  sections: [
    {
      id: "publisher",
      title: "Éditeur",
      body: (
        <>
          <p>
            Le site <a href="https://www.upsy.ma">www.upsy.ma</a> est édité par
            Mehdi Felji, inscrit au registre national de l'auto-entrepreneur,
            également directeur de la publication.
          </p>
          <ul>
            <li>
              Identifiant auto-entrepreneur : {COMPANY.autoEntrepreneurId}
            </li>
            <li>Identifiant fiscal (IF) : {COMPANY.taxId}</li>
            <li>
              N° de taxe professionnelle (TP) : {COMPANY.professionalTaxNo}
            </li>
            <li>Adresse : {COMPANY.address.join(", ")}</li>
            <li>E-mail : {mail(CONTACT)}</li>
          </ul>
        </>
      ),
    },
    {
      id: "hosting",
      title: "Hébergement",
      body: (
        <p>
          Le site est hébergé par Cloudflare, Inc., 101 Townsend Street, San
          Francisco, CA 94107, États-Unis. Les données de l'application sont
          stockées chez Supabase, Inc. La liste complète des prestataires figure
          dans la{" "}
          <a href="/fr/privacy#processors">Politique de confidentialité</a>.
        </p>
      ),
    },
    {
      id: "documents",
      title: "Conditions et confidentialité",
      body: (
        <ul>
          <li>
            <a href="/fr/terms">Conditions générales d'utilisation</a> : les
            règles d'utilisation d'UPSY, les réservations, les annulations et
            les paiements.
          </li>
          <li>
            <a href="/fr/privacy">Politique de confidentialité</a> : les données
            que nous collectons, pourquoi, et vos droits au titre de la loi
            marocaine 09-08 et du RGPD.
          </li>
        </ul>
      ),
    },
    {
      id: "ethics",
      title: "Éthique et confidentialité",
      body: (
        <>
          <p>
            Les spécialistes présents sur UPSY sont vérifiés avant leur mise en
            ligne : nous contrôlons leur identité, leurs diplômes et leur
            accréditation professionnelle. Ils exercent de manière indépendante
            et restent soumis aux règles déontologiques de leur profession.
          </p>
          <p>
            Ce que vous confiez en séance est couvert par le secret
            professionnel (article 446 du Code pénal marocain). Votre
            spécialiste ne le divulgue pas sans votre consentement, sauf lorsque
            la loi l'exige ou en cas de risque grave et immédiat pour votre vie
            ou celle d'autrui.
          </p>
          <p>
            Les administrateurs d'UPSY ne peuvent pas consulter les dossiers
            cliniques. Dans un cas exceptionnel (risque pour la sécurité,
            demande de votre part ou obligation légale), un administrateur ne
            peut ouvrir un dossier précis qu'après en avoir écrit le motif, et
            chaque accès est journalisé de façon permanente. Les administrateurs
            sont tenus à la confidentialité.
          </p>
          <p>
            Si le comportement d'un spécialiste vous préoccupe, écrivez à{" "}
            {mail(CONTACT)}. Nous examinons chaque signalement et pouvons
            suspendre un spécialiste pendant l'examen.
          </p>
        </>
      ),
    },
    {
      id: "telehealth",
      title: "Sécurité de la téléconsultation",
      body: (
        <>
          <p>
            Les séances vidéo se déroulent sur Jitsi Meet, dans votre
            navigateur, sans logiciel à installer. Le son et l'image sont
            chiffrés entre votre appareil et le service vidéo. UPSY n'enregistre
            pas les séances.
          </p>
          <p>
            Le reste de la plateforme utilise des connexions chiffrées (HTTPS),
            et vos données sont chiffrées au repos. Chaque personne ne voit que
            ses propres dossiers, et un spécialiste uniquement ses propres
            clients. Vous pouvez activer l'authentification à deux facteurs dans
            les paramètres de votre compte.
          </p>
          <p>
            Pour une séance en toute confidentialité, nous vous recommandons de
            :
          </p>
          <ul>
            <li>
              vous connecter depuis une pièce calme où l'on ne peut pas vous
              entendre, idéalement avec un casque ;
            </li>
            <li>
              utiliser votre propre appareil plutôt qu'un appareil partagé ou
              public ;
            </li>
            <li>
              ouvrir la séance uniquement depuis le lien de votre compte UPSY ou
              de l'e-mail de confirmation ;
            </li>
            <li>
              vous déconnecter ensuite si d'autres personnes utilisent
              l'appareil.
            </li>
          </ul>
          <p>
            Si vous remarquez quelque chose de suspect, comme un participant
            inattendu ou un lien que vous n'avez pas demandé, quittez la séance
            et écrivez à {mail(PRIVACY)}.
          </p>
        </>
      ),
    },
  ],
};

export const noticeDocs = { en, fr };
