import type { Commitment } from "./types";

/** Versions: a new text means members accept it again. */
export const COMMITMENT_VERSION = {
  reglement: "2026-09",
  honour: "2026-11",
  ethics: "2026-11",
};

/** Member's honour declaration (signed, then legalised at the commune). */
export const HONOUR: Record<"fr" | "en", Commitment> = {
  fr: {
    title: "Déclaration sur l'honneur de l'adhérent(e)",
    intro:
      "Je soussigné(e), candidat(e) à l'adhésion ou membre de la Ligue des Spécialistes de la Santé Psychique et Mentale (LSSPM), déclare sur l'honneur que :",
    fields: [
      "Nom et prénom",
      "N° de carte nationale d'identité",
      "Adresse",
      "Téléphone et e-mail",
      "Catégorie d'adhésion",
    ],
    items: [
      "Les informations et documents que j'ai fournis (identité, diplômes, attestations, curriculum vitae, expériences, publications) sont exacts, complets et authentiques ; je sais que toute fausse déclaration entraîne le rejet de ma demande ou mon exclusion (règlement intérieur, art. 14).",
      "Je suis titulaire des diplômes déclarés et je n'exerce que dans les limites de ma formation et des autorisations requises par la loi.",
      "Je n'ai fait l'objet d'aucune condamnation pour crime par jugement définitif et je jouis de ma pleine capacité juridique (art. 13 et 14).",
      "Je n'exerce aucune responsabilité dans une instance ou organisation non autorisée légalement, et je déclarerai à la Ligue toute responsabilité de direction syndicale ou partisane (art. 14).",
      "J'ai lu les statuts et le règlement intérieur de la Ligue et je m'engage à les respecter, ainsi que les décisions de ses organes légitimes (art. 4 et 12).",
      "Je m'engage à respecter la charte éthique et déontologique de la Ligue, le secret professionnel et la confidentialité des personnes que j'accompagne.",
      "Je m'engage à préserver la confidentialité des documents et informations de la Ligue et à ne pas utiliser son nom à des fins personnelles ou politiques (art. 12 et 14).",
      "Je déclarerai tout conflit d'intérêts et participerai activement aux activités de la Ligue selon mes moyens (art. 12).",
      "J'accepte que mes données personnelles soient traitées par la Ligue pour la gestion de mon adhésion, conformément à la loi 09-08.",
    ],
    closing: [
      "Fait à ………………………… le …………………………",
      "Signature de l'adhérent(e), précédée de la mention « Lu et approuvé »",
      "Signature légalisée (cachet de l'autorité compétente)",
    ],
    notice:
      "Projet de texte proposé par U.Psy à partir du règlement intérieur ; il entre en application après adoption par le bureau exécutif.",
  },
  en: {
    title: "Member's sworn declaration",
    intro:
      "I, the undersigned, applicant for or member of the League of Specialists in Psychological and Mental Health (LSSPM), solemnly declare that:",
    fields: [
      "Full name",
      "National ID card number",
      "Address",
      "Phone and email",
      "Membership category",
    ],
    items: [
      "The information and documents I have provided (identity, degrees, certificates, CV, experience, publications) are accurate, complete and genuine; I know that any false statement leads to the rejection of my application or my exclusion (internal rules, art. 14).",
      "I hold the degrees declared and practise only within the limits of my training and the authorisations required by law.",
      "I have not been convicted of a crime by final judgment and I have full legal capacity (art. 13 and 14).",
      "I hold no responsibility in a body or organisation not legally authorised, and I will inform the League of any trade-union or party leadership position (art. 14).",
      "I have read the League's statutes and internal rules and undertake to respect them and the decisions of its lawful bodies (art. 4 and 12).",
      "I undertake to respect the League's ethics charter, professional secrecy and the confidentiality of the people I support.",
      "I undertake to keep the League's documents and information confidential and not to use its name for personal or political ends (art. 12 and 14).",
      "I will declare any conflict of interest and take an active part in the League's activities within my means (art. 12).",
      "I agree that the League processes my personal data to manage my membership, under Law 09-08.",
    ],
    closing: [
      "Done at ………………………… on …………………………",
      "Member's signature, preceded by “Read and approved”",
      "Legalised signature (stamp of the competent authority)",
    ],
    notice:
      "Draft text proposed by U.Psy from the internal rules; it applies once adopted by the executive bureau.",
  },
};

/** Executive bureau members' honour and confidentiality commitment
 *  (translation of the League's Arabic document). */
export const CONFIDENTIALITY: Record<"fr" | "en", Commitment> = {
  fr: {
    title: "Engagement d'honneur et de confidentialité",
    intro:
      "En ma qualité de membre du bureau exécutif de la Ligue, et après avoir pris connaissance des statuts et du règlement intérieur de la Ligue, je déclare et m'engage à ce qui suit :",
    fields: [
      "Nom complet",
      "N° de carte nationale d'identité",
      "Fonction au sein du bureau exécutif",
      "Adresse",
      "Téléphone et e-mail officiels",
    ],
    items: [
      "Respecter les statuts et le règlement intérieur de la Ligue ainsi que les décisions de ses organes compétents, et accomplir mes missions avec intégrité, impartialité et responsabilité, au service des objectifs de la Ligue et de ses intérêts légitimes.",
      "Préserver la confidentialité totale de toutes les informations, documents et données dont j'ai connaissance ou que j'obtiens du fait de mon appartenance ou de l'exercice de mes missions au sein du bureau exécutif, quels que soient leur forme, leur support de conservation ou leur source.",
      "La confidentialité couvre notamment les données relatives aux membres, adhérents, bénéficiaires, collaborateurs et partenaires, les documents administratifs, financiers et organisationnels, la correspondance, les procès-verbaux, les rapports, les bases de données, les mots de passe, les données personnelles, les informations professionnelles ou privées, et toute information non accessible au public.",
      "Ne pas divulguer, publier, transmettre, faire fuiter, partager, faire circuler ni permettre à quiconque de prendre connaissance, en tout ou en partie, des informations, documents et données confidentiels, par quelque moyen que ce soit, y compris oral, écrit, électronique, numérique ou par les réseaux sociaux, sauf dans les limites permises par la loi ou autorisées par l'organe compétent de la Ligue.",
      "Ne pas copier, photographier, télécharger, extraire, envoyer, stocker ni conserver tout document, information ou donnée appartenant à la Ligue ou lié à ses missions en dehors des moyens ou lieux agréés par la Ligue, sauf nécessité professionnelle légitime et dans les limites des missions qui me sont confiées.",
      "Utiliser les données et documents qui me parviennent exclusivement pour l'exécution des missions liées à ma qualité de membre du bureau exécutif, et ne pas les exploiter à mon profit ou au profit d'autrui, ni les utiliser pour obtenir un avantage ou un intérêt particulier, direct ou indirect.",
      "Respecter les règles de protection des données à caractère personnel, et ne les collecter, utiliser, transmettre, partager ou conserver que dans la limite de la finalité légitime et des missions qui me sont confiées, conformément aux instructions et règles adoptées par la Ligue et aux lois en vigueur.",
      "Prendre les mesures nécessaires pour protéger les documents et données placés sous ma responsabilité ou auxquels j'ai accès, ne pas les laisser exposés ou accessibles à des personnes non autorisées, et préserver la confidentialité des moyens d'accès, des comptes et des mots de passe sans en permettre l'usage à autrui.",
      "Informer immédiatement le président de la Ligue ou l'organe compétent de toute perte, vol, accès non autorisé, divulgation, circulation illégale ou usage non autorisé de tout document, information ou donnée.",
      "À la fin, la suspension ou le retrait de mon appartenance ou de mes missions, restituer tous les documents, dossiers, moyens et données placés sous ma responsabilité, sans en conserver de copies papier ou électroniques, photos, enregistrements ou extraits, sauf autorisation écrite ou obligation légale contraire.",
      "Reconnaître que l'obligation de confidentialité ne prend pas fin avec mon appartenance ou mes missions au sein du bureau exécutif, mais se poursuit pour toutes les informations et données dont j'ai eu connaissance dans l'exercice de mes missions, sauf si elles deviennent légitimement publiques ou si la loi ou l'organe compétent en autorise la divulgation.",
      "Ne faire aucune déclaration, communiqué, publication ou communication au nom de la Ligue ou du bureau exécutif, et ne pas représenter la Ligue auprès de tiers, sauf dans les limites des pouvoirs qui me sont officiellement conférés.",
      "Éviter toute situation pouvant conduire à un conflit d'intérêts et informer le bureau exécutif de tout intérêt personnel, relation ou circonstance susceptible d'affecter mon impartialité ou la bonne exécution de mes missions.",
      "Reconnaître que tout manquement au présent engagement peut m'exposer à des poursuites conformément aux statuts et au règlement intérieur de la Ligue, sans préjudice de toute responsabilité civile, pénale ou administrative pouvant en découler, le cas échéant, conformément aux lois en vigueur.",
      "Reconnaître avoir lu et compris le présent engagement, m'engager à le respecter intégralement et de bonne foi, et le signer de ma libre volonté.",
    ],
    closing: [
      "Fait à ………………………… le …………………………",
      "Signature du membre concerné — nom complet",
    ],
    notice:
      "Traduction de l'engagement officiel de la Ligue (original en arabe), à signer par les membres du bureau exécutif.",
  },
  en: {
    title: "Honour and confidentiality commitment",
    intro:
      "As a member of the League's executive bureau, and having read the League's statutes and internal rules, I declare and undertake as follows:",
    fields: [
      "Full name",
      "National ID card number",
      "Position in the executive bureau",
      "Address",
      "Official phone and email",
    ],
    items: [
      "To respect the League's statutes and internal rules and the decisions of its competent bodies, and to carry out my tasks with integrity, impartiality and responsibility, in the service of the League's aims and legitimate interests.",
      "To keep strictly confidential all information, documents and data that I learn of or obtain through my membership or my tasks in the executive bureau, whatever their form, storage medium or source.",
      "Confidentiality covers in particular data on members, applicants, beneficiaries, collaborators and partners; administrative, financial and organisational documents; correspondence, minutes, reports, databases, passwords, personal data, professional or private information, and any information not available to the public.",
      "Not to disclose, publish, transmit, leak, share, circulate or allow anyone to see, in whole or in part, confidential information, documents and data, by any means, including oral, written, electronic, digital or social media, except as permitted by law or authorised by the League's competent body.",
      "Not to copy, photograph, download, extract, send, store or keep any document, information or data belonging to the League or related to its tasks outside the means or places approved by the League, except for a legitimate professional need and within the limits of the tasks entrusted to me.",
      "To use the data and documents I receive solely to carry out the tasks of my position in the executive bureau, and not to exploit them for my own benefit or that of others, or use them to obtain any particular advantage or interest, direct or indirect.",
      "To respect personal data protection rules, and to collect, use, transmit, share or keep such data only within the limits of the legitimate purpose and the tasks entrusted to me, in accordance with the instructions and rules adopted by the League and the laws in force.",
      "To take the necessary measures to protect the documents and data under my responsibility or to which I have access, not to leave them exposed or accessible to unauthorised persons, and to keep access means, accounts and passwords confidential without allowing others to use them.",
      "To inform the president of the League or the competent body immediately of any loss, theft, unauthorised access, disclosure, unlawful circulation or unauthorised use of any document, information or data.",
      "When my membership or tasks end, are suspended or withdrawn, to return all documents, files, means and data under my responsibility, without keeping any paper or electronic copies, photos, recordings or extracts, unless written permission or a legal obligation requires otherwise.",
      "To acknowledge that the duty of confidentiality does not end with my membership or tasks in the executive bureau, but continues for all information and data I learned in the course of my tasks, unless it lawfully becomes public or the law or the competent body authorises its disclosure.",
      "Not to make any statement, announcement, publication or communication in the name of the League or the executive bureau, nor represent the League before third parties, except within the powers officially conferred on me.",
      "To avoid any situation that may lead to a conflict of interest and inform the executive bureau of any personal interest, relationship or circumstance that may affect my impartiality or the proper performance of my tasks.",
      "To acknowledge that any breach of this commitment may expose me to proceedings under the League's statutes and internal rules, without prejudice to any civil, criminal or administrative liability that may arise, where applicable, under the laws in force.",
      "To acknowledge that I have read and understood this commitment, undertake to respect it fully and in good faith, and sign it of my own free will.",
    ],
    closing: [
      "Done at ………………………… on …………………………",
      "Signature of the member concerned — full name",
    ],
    notice:
      "Translation of the League's official commitment (Arabic original), to be signed by executive bureau members.",
  },
};

/** Ethics charter of the profession (draft for adoption by the bureau). */
export const ETHICS: Record<"fr" | "en", Commitment> = {
  fr: {
    title: "Charte éthique et déontologique du psychologue",
    intro:
      "Les membres de la LSSPM exercent dans le respect de la personne, de la loi marocaine et des principes reconnus de la profession. Ils s'engagent à :",
    items: [
      "Respect de la personne — Respecter la dignité, la liberté, l'intimité et les droits fondamentaux de chacun, sans discrimination d'origine, de sexe, de religion, d'opinion, de handicap, d'âge ou de situation sociale.",
      "Consentement libre et éclairé — Informer la personne de la nature, des objectifs, des modalités, de la durée et des limites de l'intervention, et recueillir son consentement ; pour un mineur ou une personne protégée, recueillir celui de son représentant légal tout en associant la personne à la décision.",
      "Secret professionnel et confidentialité — Garder le secret sur tout ce qui est confié ou constaté dans l'exercice, conformément au Code pénal (art. 446) et à la loi 09-08 ; ne le lever que dans les cas prévus par la loi, notamment en cas de danger grave et imminent pour la personne ou pour autrui.",
      "Compétence — N'intervenir que dans les limites de sa formation, de son expérience et de ses qualifications ; orienter vers un confrère compétent lorsque la situation l'exige ; se former tout au long de sa carrière et recourir à la supervision.",
      "Rigueur des évaluations — Utiliser des outils validés et adaptés à la personne et au contexte, en connaître les limites, interpréter les résultats avec prudence, protéger les protocoles et restituer les conclusions de façon compréhensible.",
      "Responsabilité et indépendance — Assumer ses choix, méthodes et conclusions ; refuser toute pression contraire à l'intérêt de la personne ; ne pas laisser un employeur, un financeur ou une institution dicter un acte contraire à la déontologie.",
      "Limites de la relation — Ne pas établir avec une personne accompagnée de relation personnelle, sentimentale, sexuelle, financière ou commerciale ; éviter les relations multiples susceptibles de nuire à l'objectivité.",
      "Conflits d'intérêts — Déclarer et éviter toute situation où un intérêt personnel pourrait altérer le jugement professionnel.",
      "Pratique à distance et numérique — Garantir la sécurité et la confidentialité des échanges, vérifier l'identité de la personne, prévoir la conduite à tenir en cas de crise, et respecter les mêmes exigences qu'en présentiel.",
      "Recherche — Obtenir un consentement éclairé, protéger les participants et leurs données, ne jamais falsifier ni plagier, et publier de façon honnête.",
      "Communication et publicité — Présenter ses titres, diplômes et compétences avec exactitude ; ne pas promettre de résultats ; ne pas utiliser de témoignages de personnes accompagnées.",
      "Confraternité — Respecter ses confrères, ne pas dénigrer, collaborer dans l'intérêt des personnes, et signaler à la Ligue les manquements graves dont on a connaissance.",
      "Situations de vulnérabilité — Accorder une attention particulière aux mineurs, aux personnes en crise, aux victimes de violence et aux sportifs soumis à pression, et prendre les mesures de protection qu'impose la loi.",
      "Manquements — Tout manquement à la présente charte peut être porté devant la commission d'éthique et des litiges et donner lieu aux sanctions prévues au règlement intérieur (art. 15 à 17).",
    ],
    closing: [
      "Fait à ………………………… le …………………………",
      "Signature précédée de la mention « Lu et approuvé »",
    ],
    notice:
      "Projet de charte proposé par U.Psy, fondé sur les principes reconnus de la profession (notamment le méta-code de l'EFPA) et le droit marocain ; il entre en application après adoption par le bureau exécutif de la Ligue.",
  },
  en: {
    title: "Ethics charter of the psychologist",
    intro:
      "LSSPM members practise with respect for the person, Moroccan law and the recognised principles of the profession. They undertake to:",
    items: [
      "Respect for the person — Respect everyone's dignity, freedom, privacy and fundamental rights, without discrimination on grounds of origin, sex, religion, opinion, disability, age or social situation.",
      "Free and informed consent — Explain the nature, aims, methods, duration and limits of the intervention and obtain consent; for a minor or protected person, obtain the legal representative's consent while involving the person in the decision.",
      "Professional secrecy and confidentiality — Keep secret everything confided or observed in practice, under the Penal Code (art. 446) and Law 09-08; lift it only where the law provides, in particular in case of serious and imminent danger to the person or others.",
      "Competence — Work only within the limits of one's training, experience and qualifications; refer to a competent colleague when needed; keep learning throughout one's career and use supervision.",
      "Rigorous assessment — Use validated tools suited to the person and context, know their limits, interpret results cautiously, protect test materials and explain conclusions clearly.",
      "Responsibility and independence — Own one's choices, methods and conclusions; refuse any pressure against the person's interest; never let an employer, funder or institution dictate an act contrary to ethics.",
      "Boundaries — Have no personal, romantic, sexual, financial or commercial relationship with a person one supports; avoid multiple relationships that could impair objectivity.",
      "Conflicts of interest — Declare and avoid any situation where a personal interest could affect professional judgment.",
      "Remote and digital practice — Ensure secure and confidential exchanges, verify the person's identity, plan what to do in a crisis, and meet the same standards as in person.",
      "Research — Obtain informed consent, protect participants and their data, never falsify or plagiarise, and publish honestly.",
      "Communication and advertising — Present one's titles, degrees and skills accurately; promise no results; use no testimonials from people supported.",
      "Collegiality — Respect colleagues, do not disparage, collaborate in the interest of the people supported, and report serious breaches one knows of to the League.",
      "Vulnerable situations — Give particular care to minors, people in crisis, victims of violence and athletes under pressure, and take the protective measures the law requires.",
      "Breaches — Any breach of this charter may be referred to the ethics and disputes committee and lead to the sanctions of the internal rules (art. 15 to 17).",
    ],
    closing: [
      "Done at ………………………… on …………………………",
      "Signature preceded by “Read and approved”",
    ],
    notice:
      "Draft charter proposed by U.Psy, based on the profession's recognised principles (notably the EFPA meta-code) and Moroccan law; it applies once adopted by the League's executive bureau.",
  },
};
