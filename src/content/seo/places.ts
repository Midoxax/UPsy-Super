// Local landing pages: one per Moroccan city (/psychologue/<slug>) and one
// per country served online (/psychologue-en-ligne/<slug>). Each carries its
// own copy so no two pages are duplicates. Coordinates match city_coords()
// in the database, so the page lists the psychologists nearest the city.

export type L3 = { en: string; fr: string; ar: string };

export interface City {
  slug: string;
  name: L3;
  region: L3;
  lat: number;
  lng: number;
  /** Nearby towns the page also serves (for search wording). */
  near: string[];
  intro: L3;
}

export interface Country {
  slug: string;
  name: L3;
  /** "de", "du", "d'", "des": French preposition for "in <country>". */
  inFr: string;
  timezone: string;
  /** Hours ahead (+) or behind (-) Morocco (UTC+1). */
  offsetFromMorocco: number;
  intro: L3;
}

export const CITIES: City[] = [
  {
    slug: "casablanca",
    name: { en: "Casablanca", fr: "Casablanca", ar: "الدار البيضاء" },
    region: {
      en: "Casablanca-Settat",
      fr: "Casablanca-Settat",
      ar: "الدار البيضاء سطات",
    },
    lat: 33.5731,
    lng: -7.5898,
    near: ["Mohammedia", "Bouskoura", "Dar Bouazza", "Berrechid"],
    intro: {
      fr: "Casablanca concentre le plus grand nombre de psychologues du pays. Sur U.Psy, vous comparez leurs spécialités, leurs langues de consultation (darija, français, arabe, anglais) et leurs tarifs, puis vous réservez une séance au cabinet ou en visio, sans traverser la ville aux heures de pointe.",
      en: "Casablanca has the largest number of psychologists in the country. On U.Psy you compare their specialties, the languages they work in (Darija, French, Arabic, English) and their fees, then book a session in their office or by video, without crossing the city at rush hour.",
      ar: "تضم الدار البيضاء أكبر عدد من الأخصائيين النفسيين في المغرب. على U.Psy تقارن تخصصاتهم ولغات الاستشارة (الدارجة، الفرنسية، العربية، الإنجليزية) وأسعارهم، ثم تحجز حصة في العيادة أو عبر الفيديو.",
    },
  },
  {
    slug: "rabat",
    name: { en: "Rabat", fr: "Rabat", ar: "الرباط" },
    region: {
      en: "Rabat-Salé-Kénitra",
      fr: "Rabat-Salé-Kénitra",
      ar: "الرباط سلا القنيطرة",
    },
    lat: 34.0209,
    lng: -6.8416,
    near: ["Salé", "Témara", "Kénitra"],
    intro: {
      fr: "À Rabat, Salé et Témara, U.Psy vous met en relation avec des psychologues vérifiés, que vous cherchiez un suivi pour l'anxiété, le stress au travail, le couple ou un accompagnement de votre enfant. Séances au cabinet ou en visio, réservation en ligne en quelques minutes.",
      en: "In Rabat, Salé and Témara, U.Psy connects you with verified psychologists, whether you need help with anxiety, work stress, your relationship or support for your child. Sessions in the office or by video, booked online in a few minutes.",
      ar: "في الرباط وسلا وتمارة، يربطك U.Psy بأخصائيين نفسيين موثوقين، سواء كنت تبحث عن مرافقة للقلق أو ضغط العمل أو العلاقة الزوجية أو دعم طفلك. حصص في العيادة أو عبر الفيديو.",
    },
  },
  {
    slug: "marrakech",
    name: { en: "Marrakech", fr: "Marrakech", ar: "مراكش" },
    region: { en: "Marrakech-Safi", fr: "Marrakech-Safi", ar: "مراكش آسفي" },
    lat: 31.6295,
    lng: -7.9811,
    near: ["Safi", "Essaouira"],
    intro: {
      fr: "Trouver un psychologue à Marrakech, en français, en arabe ou en anglais : les profils U.Psy indiquent l'approche de chaque praticien, ses spécialités et ses disponibilités. Les résidents comme les expatriés peuvent consulter au cabinet ou en ligne.",
      en: "Find a psychologist in Marrakech who works in French, Arabic or English: U.Psy profiles show each practitioner's approach, specialties and availability. Residents and expatriates alike can meet in the office or online.",
      ar: "ابحث عن أخصائي نفسي في مراكش بالفرنسية أو العربية أو الإنجليزية: تعرض ملفات U.Psy منهج كل أخصائي وتخصصاته ومواعيده. للمقيمين والأجانب، في العيادة أو عبر الإنترنت.",
    },
  },
  {
    slug: "fes",
    name: { en: "Fez", fr: "Fès", ar: "فاس" },
    region: { en: "Fès-Meknès", fr: "Fès-Meknès", ar: "فاس مكناس" },
    lat: 34.0181,
    lng: -5.0078,
    near: ["Meknès", "Ifrane", "Sefrou"],
    intro: {
      fr: "Étudiants, familles, professionnels : à Fès, U.Psy facilite l'accès à un psychologue qualifié. Comparez les profils, lisez les avis de patients et réservez en ligne, au cabinet ou en visioconférence si aucun praticien n'est proche de chez vous.",
      en: "Students, families, professionals: in Fez, U.Psy makes it easier to reach a qualified psychologist. Compare profiles, read patient reviews and book online, in the office or by video if no practitioner is close to you.",
      ar: "طلبة وأسر ومهنيون: في فاس يسهّل U.Psy الوصول إلى أخصائي نفسي مؤهل. قارن الملفات واقرأ آراء المرضى واحجز عبر الإنترنت.",
    },
  },
  {
    slug: "tanger",
    name: { en: "Tangier", fr: "Tanger", ar: "طنجة" },
    region: {
      en: "Tanger-Tétouan-Al Hoceïma",
      fr: "Tanger-Tétouan-Al Hoceïma",
      ar: "طنجة تطوان الحسيمة",
    },
    lat: 35.7595,
    lng: -5.834,
    near: ["Tétouan", "Assilah", "M'diq"],
    intro: {
      fr: "À Tanger et dans le Nord, consultez un psychologue en français, en arabe, en espagnol ou en anglais. U.Psy affiche les langues, les tarifs en dirhams et les prochaines disponibilités de chaque praticien, au cabinet ou en ligne.",
      en: "In Tangier and the North, see a psychologist in French, Arabic, Spanish or English. U.Psy shows each practitioner's languages, fees in dirhams and next openings, in the office or online.",
      ar: "في طنجة والشمال، استشر أخصائياً نفسياً بالفرنسية أو العربية أو الإسبانية أو الإنجليزية. يعرض U.Psy لغات كل أخصائي وأسعاره بالدرهم ومواعيده القادمة.",
    },
  },
  {
    slug: "agadir",
    name: { en: "Agadir", fr: "Agadir", ar: "أكادير" },
    region: { en: "Souss-Massa", fr: "Souss-Massa", ar: "سوس ماسة" },
    lat: 30.4278,
    lng: -9.5981,
    near: ["Inezgane", "Taroudant", "Tiznit"],
    intro: {
      fr: "Dans le Souss, l'offre de psychologues reste limitée hors d'Agadir. U.Psy vous donne accès aux praticiens de la ville et, en visio, à des spécialistes de tout le Maroc, avec réservation et paiement en ligne.",
      en: "In the Souss region, few psychologists practise outside Agadir. U.Psy gives you the city's practitioners and, by video, specialists from all over Morocco, with online booking and payment.",
      ar: "في سوس، يبقى عدد الأخصائيين النفسيين محدوداً خارج أكادير. يتيح لك U.Psy أخصائيي المدينة، وعبر الفيديو أخصائيين من كل المغرب.",
    },
  },
  {
    slug: "meknes",
    name: { en: "Meknes", fr: "Meknès", ar: "مكناس" },
    region: { en: "Fès-Meknès", fr: "Fès-Meknès", ar: "فاس مكناس" },
    lat: 33.8935,
    lng: -5.5473,
    near: ["El Hajeb", "Ifrane", "Fès"],
    intro: {
      fr: "Un psychologue à Meknès ou à proximité : U.Psy réunit les praticiens de la région et ceux qui consultent en ligne, pour que vous trouviez rapidement la bonne spécialité et un créneau qui vous convient.",
      en: "A psychologist in or near Meknes: U.Psy brings together the region's practitioners and those who work online, so you quickly find the right specialty and a time that suits you.",
      ar: "أخصائي نفسي في مكناس أو قربها: يجمع U.Psy أخصائيي المنطقة والذين يستشيرون عبر الإنترنت لتجد التخصص المناسب وموعداً يناسبك.",
    },
  },
  {
    slug: "oujda",
    name: { en: "Oujda", fr: "Oujda", ar: "وجدة" },
    region: { en: "Oriental", fr: "Oriental", ar: "الشرق" },
    lat: 34.6814,
    lng: -1.9086,
    near: ["Berkane", "Nador", "Taourirt"],
    intro: {
      fr: "Dans l'Oriental, consulter un psychologue spécialisé demande souvent de voyager. Avec U.Psy, vous rencontrez les praticiens d'Oujda ou consultez en visio un spécialiste de Casablanca ou de Rabat, sans déplacement.",
      en: "In the Oriental region, seeing a specialised psychologist often means travelling. With U.Psy you meet practitioners in Oujda or see a Casablanca or Rabat specialist by video, without the trip.",
      ar: "في جهة الشرق، تتطلب استشارة أخصائي نفسي متخصص السفر غالباً. مع U.Psy تلتقي أخصائيي وجدة أو تستشير أخصائياً من الدار البيضاء أو الرباط عبر الفيديو.",
    },
  },
  {
    slug: "kenitra",
    name: { en: "Kenitra", fr: "Kénitra", ar: "القنيطرة" },
    region: {
      en: "Rabat-Salé-Kénitra",
      fr: "Rabat-Salé-Kénitra",
      ar: "الرباط سلا القنيطرة",
    },
    lat: 34.261,
    lng: -6.5802,
    near: ["Sidi Slimane", "Sidi Kacem", "Salé"],
    intro: {
      fr: "Habitants de Kénitra et du Gharb : réservez un psychologue proche de chez vous ou à Rabat, ou consultez en ligne en soirée et le week-end selon les disponibilités des praticiens.",
      en: "Kenitra and Gharb residents: book a psychologist near you or in Rabat, or see one online in the evening and at weekends, depending on practitioners' openings.",
      ar: "سكان القنيطرة والغرب: احجز أخصائياً نفسياً قريباً منك أو في الرباط، أو استشر عبر الإنترنت مساءً وفي نهاية الأسبوع.",
    },
  },
  {
    slug: "tetouan",
    name: { en: "Tetouan", fr: "Tétouan", ar: "تطوان" },
    region: {
      en: "Tanger-Tétouan-Al Hoceïma",
      fr: "Tanger-Tétouan-Al Hoceïma",
      ar: "طنجة تطوان الحسيمة",
    },
    lat: 35.5889,
    lng: -5.3626,
    near: ["Martil", "M'diq", "Chefchaouen"],
    intro: {
      fr: "À Tétouan, Martil et M'diq, trouvez un psychologue qui parle votre langue, y compris l'espagnol. Les profils U.Psy détaillent les approches (TCC, systémique, psychodynamique) pour vous aider à choisir.",
      en: "In Tetouan, Martil and M'diq, find a psychologist who speaks your language, Spanish included. U.Psy profiles explain each approach (CBT, systemic, psychodynamic) to help you choose.",
      ar: "في تطوان ومرتيل والمضيق، ابحث عن أخصائي نفسي يتحدث لغتك بما فيها الإسبانية. تشرح ملفات U.Psy المناهج العلاجية لمساعدتك على الاختيار.",
    },
  },
  {
    slug: "el-jadida",
    name: { en: "El Jadida", fr: "El Jadida", ar: "الجديدة" },
    region: {
      en: "Casablanca-Settat",
      fr: "Casablanca-Settat",
      ar: "الدار البيضاء سطات",
    },
    lat: 33.2316,
    lng: -8.5007,
    near: ["Azemmour", "Sidi Bennour"],
    intro: {
      fr: "À El Jadida et Azemmour, U.Psy vous propose des psychologues de la région et de Casablanca, au cabinet ou en ligne, avec des tarifs affichés à l'avance et sans frais cachés.",
      en: "In El Jadida and Azemmour, U.Psy offers psychologists from the area and from Casablanca, in the office or online, with fees shown upfront and no hidden costs.",
      ar: "في الجديدة وأزمور، يقترح عليك U.Psy أخصائيين نفسيين من المنطقة ومن الدار البيضاء، في العيادة أو عبر الإنترنت، بأسعار معلنة مسبقاً.",
    },
  },
  {
    slug: "mohammedia",
    name: { en: "Mohammedia", fr: "Mohammedia", ar: "المحمدية" },
    region: {
      en: "Casablanca-Settat",
      fr: "Casablanca-Settat",
      ar: "الدار البيضاء سطات",
    },
    lat: 33.6866,
    lng: -7.383,
    near: ["Casablanca", "Ben Slimane"],
    intro: {
      fr: "Entre Casablanca et Rabat, Mohammedia est bien desservie : U.Psy liste les psychologues les plus proches et ceux qui consultent en visio, pour un suivi régulier sans perdre de temps sur la route.",
      en: "Between Casablanca and Rabat, Mohammedia is well placed: U.Psy lists the nearest psychologists and those who work by video, for regular sessions without time lost on the road.",
      ar: "بين الدار البيضاء والرباط، يعرض U.Psy أقرب الأخصائيين النفسيين إلى المحمدية والذين يستشيرون عبر الفيديو لمتابعة منتظمة.",
    },
  },
  {
    slug: "sale",
    name: { en: "Salé", fr: "Salé", ar: "سلا" },
    region: {
      en: "Rabat-Salé-Kénitra",
      fr: "Rabat-Salé-Kénitra",
      ar: "الرباط سلا القنيطرة",
    },
    lat: 34.0531,
    lng: -6.7985,
    near: ["Rabat", "Sidi Bouknadel"],
    intro: {
      fr: "À Salé, consultez un psychologue de la ville ou de Rabat, juste en face. U.Psy vous montre les créneaux libres et vous permet de réserver et de payer en ligne.",
      en: "In Salé, see a psychologist in town or just across the river in Rabat. U.Psy shows open slots and lets you book and pay online.",
      ar: "في سلا، استشر أخصائياً نفسياً في المدينة أو في الرباط المجاورة. يعرض U.Psy المواعيد المتاحة ويتيح الحجز والدفع عبر الإنترنت.",
    },
  },
  {
    slug: "beni-mellal",
    name: { en: "Beni Mellal", fr: "Béni Mellal", ar: "بني ملال" },
    region: {
      en: "Béni Mellal-Khénifra",
      fr: "Béni Mellal-Khénifra",
      ar: "بني ملال خنيفرة",
    },
    lat: 32.3373,
    lng: -6.3498,
    near: ["Khouribga", "Fquih Ben Salah", "Azilal"],
    intro: {
      fr: "Dans la région de Béni Mellal-Khénifra, les psychologues sont encore rares. U.Psy vous permet de consulter en visio des praticiens qualifiés de tout le Maroc, en arabe, en darija ou en français.",
      en: "In the Béni Mellal-Khénifra region psychologists are still few. U.Psy lets you see qualified practitioners from all over Morocco by video, in Arabic, Darija or French.",
      ar: "في جهة بني ملال خنيفرة لا يزال الأخصائيون النفسيون قلة. يتيح لك U.Psy استشارة أخصائيين مؤهلين من كل المغرب عبر الفيديو بالعربية أو الدارجة أو الفرنسية.",
    },
  },
  {
    slug: "laayoune",
    name: { en: "Laayoune", fr: "Laâyoune", ar: "العيون" },
    region: {
      en: "Laâyoune-Sakia El Hamra",
      fr: "Laâyoune-Sakia El Hamra",
      ar: "العيون الساقية الحمراء",
    },
    lat: 27.1253,
    lng: -13.1625,
    near: ["Dakhla", "Boujdour", "Tarfaya"],
    intro: {
      fr: "À Laâyoune et dans le Sud, la consultation en ligne rapproche les patients des psychologues. Réservez une séance en visio avec un praticien accrédité, aux mêmes conditions de confidentialité qu'au cabinet.",
      en: "In Laayoune and the South, online sessions bring patients closer to psychologists. Book a video session with an accredited practitioner, with the same confidentiality as in the office.",
      ar: "في العيون والجنوب، تقرّب الاستشارة عبر الإنترنت المرضى من الأخصائيين النفسيين. احجز حصة فيديو مع أخصائي معتمد بنفس شروط السرية.",
    },
  },
];

export const COUNTRIES: Country[] = [
  {
    slug: "senegal",
    name: { en: "Senegal", fr: "Sénégal", ar: "السنغال" },
    inFr: "au",
    timezone: "GMT",
    offsetFromMorocco: -1,
    intro: {
      fr: "Depuis Dakar, Thiès ou Saint-Louis, consultez en visio un psychologue francophone formé et vérifié. Le décalage avec le Maroc n'est que d'une heure : les créneaux du soir et du week-end restent accessibles.",
      en: "From Dakar, Thiès or Saint-Louis, see a trained, verified French-speaking psychologist by video. Senegal is only one hour behind Morocco, so evening and weekend slots stay within reach.",
      ar: "من داكار أو تييس أو سان لوي، استشر عبر الفيديو أخصائياً نفسياً ناطقاً بالفرنسية ومعتمداً. فارق التوقيت مع المغرب ساعة واحدة فقط.",
    },
  },
  {
    slug: "cote-d-ivoire",
    name: { en: "Côte d'Ivoire", fr: "Côte d'Ivoire", ar: "ساحل العاج" },
    inFr: "en",
    timezone: "GMT",
    offsetFromMorocco: -1,
    intro: {
      fr: "À Abidjan comme à Yamoussoukro, U.Psy vous donne accès à des psychologues francophones en visioconférence : anxiété, stress professionnel, couple, deuil, performance. Réservation en ligne et séances confidentielles.",
      en: "In Abidjan or Yamoussoukro, U.Psy gives you French-speaking psychologists by video: anxiety, work stress, relationships, grief, performance. Online booking and confidential sessions.",
      ar: "في أبيدجان أو ياموسوكرو، يتيح لك U.Psy أخصائيين نفسيين ناطقين بالفرنسية عبر الفيديو: القلق، ضغط العمل، العلاقات، الحداد، الأداء.",
    },
  },
  {
    slug: "tunisie",
    name: { en: "Tunisia", fr: "Tunisie", ar: "تونس" },
    inFr: "en",
    timezone: "UTC+1",
    offsetFromMorocco: 0,
    intro: {
      fr: "Même fuseau horaire, mêmes langues : depuis Tunis, Sfax ou Sousse, consultez en ligne un psychologue qui parle arabe et français et comprend le contexte maghrébin.",
      en: "Same time zone, same languages: from Tunis, Sfax or Sousse, see a psychologist online who speaks Arabic and French and understands the Maghreb context.",
      ar: "نفس التوقيت ونفس اللغات: من تونس أو صفاقس أو سوسة، استشر عبر الإنترنت أخصائياً نفسياً يتحدث العربية والفرنسية ويفهم السياق المغاربي.",
    },
  },
  {
    slug: "algerie",
    name: { en: "Algeria", fr: "Algérie", ar: "الجزائر" },
    inFr: "en",
    timezone: "UTC+1",
    offsetFromMorocco: 0,
    intro: {
      fr: "Depuis Alger, Oran ou Constantine, prenez rendez-vous en visio avec un psychologue arabophone ou francophone. Même fuseau horaire que le Maroc, séances confidentielles et réservation en quelques minutes.",
      en: "From Algiers, Oran or Constantine, book a video session with an Arabic- or French-speaking psychologist. Same time zone as Morocco, confidential sessions, booked in minutes.",
      ar: "من الجزائر العاصمة أو وهران أو قسنطينة، احجز حصة فيديو مع أخصائي نفسي ناطق بالعربية أو الفرنسية. نفس توقيت المغرب.",
    },
  },
  {
    slug: "cameroun",
    name: { en: "Cameroon", fr: "Cameroun", ar: "الكاميرون" },
    inFr: "au",
    timezone: "UTC+1",
    offsetFromMorocco: 0,
    intro: {
      fr: "À Douala, Yaoundé ou ailleurs au Cameroun, l'accès à un psychologue peut être difficile. U.Psy propose des séances en ligne en français avec des praticiens vérifiés, au même fuseau horaire que le Maroc.",
      en: "In Douala, Yaoundé or elsewhere in Cameroon, reaching a psychologist can be hard. U.Psy offers online sessions in French with verified practitioners, in the same time zone as Morocco.",
      ar: "في دوالا أو ياوندي، قد يصعب الوصول إلى أخصائي نفسي. يقترح U.Psy حصصاً عبر الإنترنت بالفرنسية مع أخصائيين موثوقين.",
    },
  },
  {
    slug: "mauritanie",
    name: { en: "Mauritania", fr: "Mauritanie", ar: "موريتانيا" },
    inFr: "en",
    timezone: "GMT",
    offsetFromMorocco: -1,
    intro: {
      fr: "Depuis Nouakchott ou Nouadhibou, consultez en arabe ou en français un psychologue en visio. Une heure de décalage seulement avec le Maroc et des praticiens habitués au contexte culturel sahélien et maghrébin.",
      en: "From Nouakchott or Nouadhibou, see a psychologist by video in Arabic or French. Only one hour's difference with Morocco, with practitioners familiar with the Sahel and Maghreb context.",
      ar: "من نواكشوط أو نواذيبو، استشر أخصائياً نفسياً عبر الفيديو بالعربية أو الفرنسية. فارق ساعة واحدة فقط مع المغرب.",
    },
  },
  {
    slug: "gabon",
    name: { en: "Gabon", fr: "Gabon", ar: "الغابون" },
    inFr: "au",
    timezone: "UTC+1",
    offsetFromMorocco: 0,
    intro: {
      fr: "À Libreville ou Port-Gentil, U.Psy vous met en relation avec des psychologues francophones en ligne, pour un suivi régulier et confidentiel, au même fuseau horaire que le Maroc.",
      en: "In Libreville or Port-Gentil, U.Psy connects you with French-speaking psychologists online, for regular, confidential sessions in the same time zone as Morocco.",
      ar: "في ليبرفيل أو بور جانتي، يربطك U.Psy بأخصائيين نفسيين ناطقين بالفرنسية عبر الإنترنت لمتابعة منتظمة وسرية.",
    },
  },
  {
    slug: "mali",
    name: { en: "Mali", fr: "Mali", ar: "مالي" },
    inFr: "au",
    timezone: "GMT",
    offsetFromMorocco: -1,
    intro: {
      fr: "Depuis Bamako, consultez un psychologue francophone en visio, avec réservation en ligne et séances confidentielles. Seulement une heure de décalage avec le Maroc.",
      en: "From Bamako, see a French-speaking psychologist by video, with online booking and confidential sessions. Only one hour behind Morocco.",
      ar: "من باماكو، استشر أخصائياً نفسياً ناطقاً بالفرنسية عبر الفيديو، مع حجز إلكتروني وحصص سرية.",
    },
  },
  {
    slug: "burkina-faso",
    name: { en: "Burkina Faso", fr: "Burkina Faso", ar: "بوركينا فاسو" },
    inFr: "au",
    timezone: "GMT",
    offsetFromMorocco: -1,
    intro: {
      fr: "À Ouagadougou ou Bobo-Dioulasso, trouvez un psychologue francophone qui consulte en ligne. Les profils U.Psy détaillent les spécialités, les approches et les tarifs.",
      en: "In Ouagadougou or Bobo-Dioulasso, find a French-speaking psychologist who works online. U.Psy profiles detail specialties, approaches and fees.",
      ar: "في واغادوغو أو بوبو ديولاسو، ابحث عن أخصائي نفسي ناطق بالفرنسية يستشير عبر الإنترنت.",
    },
  },
  {
    slug: "benin",
    name: { en: "Benin", fr: "Bénin", ar: "بنين" },
    inFr: "au",
    timezone: "UTC+1",
    offsetFromMorocco: 0,
    intro: {
      fr: "Depuis Cotonou ou Porto-Novo, réservez une séance en visio avec un psychologue francophone vérifié, au même fuseau horaire que le Maroc.",
      en: "From Cotonou or Porto-Novo, book a video session with a verified French-speaking psychologist, in the same time zone as Morocco.",
      ar: "من كوتونو أو بورتو نوفو، احجز حصة فيديو مع أخصائي نفسي ناطق بالفرنسية ومعتمد.",
    },
  },
  {
    slug: "guinee",
    name: { en: "Guinea", fr: "Guinée", ar: "غينيا" },
    inFr: "en",
    timezone: "GMT",
    offsetFromMorocco: -1,
    intro: {
      fr: "À Conakry, l'offre de psychologues reste rare. U.Psy vous permet de consulter en ligne, en français, des praticiens formés et vérifiés.",
      en: "In Conakry psychologists are still scarce. U.Psy lets you see trained, verified practitioners online, in French.",
      ar: "في كوناكري لا يزال الأخصائيون النفسيون قلة. يتيح لك U.Psy الاستشارة عبر الإنترنت بالفرنسية مع أخصائيين مؤهلين.",
    },
  },
  {
    slug: "rdc",
    name: { en: "DR Congo", fr: "RD Congo", ar: "جمهورية الكونغو الديمقراطية" },
    inFr: "en",
    timezone: "UTC+1 / UTC+2",
    offsetFromMorocco: 0,
    intro: {
      fr: "De Kinshasa à Lubumbashi, consultez un psychologue francophone en visio. Les séances se tiennent sur une plateforme sécurisée et se réservent en ligne.",
      en: "From Kinshasa to Lubumbashi, see a French-speaking psychologist by video. Sessions run on a secure platform and are booked online.",
      ar: "من كينشاسا إلى لوبومباشي، استشر أخصائياً نفسياً ناطقاً بالفرنسية عبر الفيديو على منصة آمنة.",
    },
  },
  {
    slug: "france",
    name: { en: "France", fr: "France", ar: "فرنسا" },
    inFr: "en",
    timezone: "UTC+1 / UTC+2",
    offsetFromMorocco: 0,
    intro: {
      fr: "Marocains de France et familles franco-maghrébines : consultez en ligne un psychologue qui parle darija, arabe et français et connaît les deux cultures. Séances en visio, réservation et paiement en ligne.",
      en: "Moroccans in France and French-Maghrebi families: see a psychologist online who speaks Darija, Arabic and French and knows both cultures. Video sessions, online booking and payment.",
      ar: "مغاربة فرنسا والأسر الفرنسية المغاربية: استشر عبر الإنترنت أخصائياً نفسياً يتحدث الدارجة والعربية والفرنسية ويعرف الثقافتين.",
    },
  },
  {
    slug: "belgique",
    name: { en: "Belgium", fr: "Belgique", ar: "بلجيكا" },
    inFr: "en",
    timezone: "UTC+1 / UTC+2",
    offsetFromMorocco: 0,
    intro: {
      fr: "Depuis Bruxelles, Anvers ou Liège, la communauté marocaine de Belgique peut consulter un psychologue en darija, en arabe ou en français, en visio, avec des praticiens qui comprennent la double culture.",
      en: "From Brussels, Antwerp or Liège, Belgium's Moroccan community can see a psychologist in Darija, Arabic or French by video, with practitioners who understand a dual culture.",
      ar: "من بروكسل أو أنتويرب أو لييج، يمكن للجالية المغربية في بلجيكا استشارة أخصائي نفسي بالدارجة أو العربية أو الفرنسية عبر الفيديو.",
    },
  },
  {
    slug: "canada",
    name: { en: "Canada", fr: "Canada", ar: "كندا" },
    inFr: "au",
    timezone: "UTC−5 / UTC−8",
    offsetFromMorocco: -5,
    intro: {
      fr: "Au Québec et ailleurs au Canada, consultez en ligne un psychologue qui parle darija, arabe et français. Les séances du matin au Maroc tombent tôt le matin à Montréal : choisissez les créneaux de fin de journée marocaine.",
      en: "In Quebec and across Canada, see a psychologist online who speaks Darija, Arabic and French. Morocco's late-afternoon slots fall in the Montreal morning.",
      ar: "في كيبيك وكندا، استشر عبر الإنترنت أخصائياً نفسياً يتحدث الدارجة والعربية والفرنسية. اختر مواعيد آخر النهار بتوقيت المغرب.",
    },
  },
];

export const citySlugs = CITIES.map((c) => c.slug);
export const countrySlugs = COUNTRIES.map((c) => c.slug);
