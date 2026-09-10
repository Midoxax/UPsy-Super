/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

type Pillar = 'focus' | 'regulation' | 'recovery' | 'meaning'

interface Props {
  name?: string
  score?: number
  pillars?: Record<Pillar, number>
  weakestPillar?: Pillar
  lang?: 'en' | 'fr' | 'ar'
  bookingUrl?: string
  matchUrl?: string
  resultsUrl?: string
}

const LOGO =
  'https://vuawmihxcaewzmkuarkr.supabase.co/storage/v1/object/public/email-assets/logo.png'

const PILLAR_LABEL: Record<Pillar, Record<'en' | 'fr' | 'ar', string>> = {
  focus: { en: 'Focus', fr: 'Concentration', ar: 'التركيز' },
  regulation: { en: 'Emotional Regulation', fr: 'Régulation émotionnelle', ar: 'التنظيم العاطفي' },
  recovery: { en: 'Recovery & Energy', fr: 'Récupération & énergie', ar: 'التعافي والطاقة' },
  meaning: { en: 'Meaning & Connection', fr: 'Sens & connexion', ar: 'المعنى والتواصل' },
}

const PILLAR_ACTION: Record<Pillar, Record<'en' | 'fr' | 'ar', string>> = {
  focus: {
    en: 'Build a daily attention protocol in 4–6 sessions with a performance psychologist.',
    fr: 'Construisez un protocole d\'attention quotidien en 4 à 6 séances avec un psychologue de la performance.',
    ar: 'ابنِ بروتوكول انتباه يومي في 4-6 جلسات مع أخصائي نفسي للأداء.',
  },
  regulation: {
    en: 'CBT and ACT protocols reduce anxious loops and rumination within weeks.',
    fr: 'Les protocoles TCC et ACT réduisent les boucles anxieuses en quelques semaines.',
    ar: 'بروتوكولات CBT وACT تقلل من حلقات القلق خلال أسابيع.',
  },
  recovery: {
    en: 'CBT-I for sleep and nervous-system regulation restores energy fast.',
    fr: 'La TCC-I pour le sommeil restaure l\'énergie rapidement.',
    ar: 'CBT-I للنوم يعيد الطاقة بسرعة.',
  },
  meaning: {
    en: 'Values-based (ACT) and relational work shift this pillar quickly.',
    fr: 'Le travail axé sur les valeurs (ACT) fait bouger ce pilier rapidement.',
    ar: 'العمل القائم على القيم (ACT) يحرك هذا الركن بسرعة.',
  },
}

const T = {
  en: {
    preview: 'Your Mental Performance Score & next steps',
    hi: (n?: string) => (n ? `Hi ${n},` : 'Hi,'),
    intro: "Thanks for completing your Mental Performance Score. Here is your snapshot and the fastest path forward.",
    overall: 'Overall score',
    breakdown: 'Pillar breakdown',
    priority: 'Your priority pillar',
    nextSteps: 'Next steps',
    step1: 'Book a free 15-minute call with our clinical team — we match you to the right psychologist.',
    step2: 'Prefer to browse? See psychologists trained for your priority pillar.',
    bookCta: 'Book a free call',
    matchCta: 'See matched psychologists',
    footerNote: 'This email is a summary of the quiz you took on U.Psy. It is not a clinical diagnosis.',
  },
  fr: {
    preview: 'Votre score de performance mentale & prochaines étapes',
    hi: (n?: string) => (n ? `Bonjour ${n},` : 'Bonjour,'),
    intro: "Merci d'avoir complété votre Score de performance mentale. Voici votre bilan et la voie la plus rapide pour avancer.",
    overall: 'Score global',
    breakdown: 'Répartition par pilier',
    priority: 'Votre pilier prioritaire',
    nextSteps: 'Prochaines étapes',
    step1: 'Réservez un appel gratuit de 15 minutes avec notre équipe clinique — nous vous jumelons au bon psychologue.',
    step2: 'Préférez parcourir ? Voyez les psychologues formés pour votre pilier prioritaire.',
    bookCta: 'Réserver un appel gratuit',
    matchCta: 'Voir les psychologues correspondants',
    footerNote: "Cet email résume le quiz que vous avez passé sur U.Psy. Ce n'est pas un diagnostic clinique.",
  },
  ar: {
    preview: 'نتيجتك في الأداء النفسي والخطوات التالية',
    hi: (n?: string) => (n ? `مرحبًا ${n}،` : 'مرحبًا،'),
    intro: 'شكرًا لإكمال تقييم الأداء النفسي. إليك ملخصك وأسرع طريق للتقدم.',
    overall: 'النتيجة الإجمالية',
    breakdown: 'التفصيل حسب الركيزة',
    priority: 'ركيزتك ذات الأولوية',
    nextSteps: 'الخطوات التالية',
    step1: 'احجز مكالمة مجانية مدتها 15 دقيقة مع فريقنا السريري — سنطابقك مع الأخصائي المناسب.',
    step2: 'تفضل التصفح؟ شاهد الأخصائيين المدربين لركيزتك ذات الأولوية.',
    bookCta: 'احجز مكالمة مجانية',
    matchCta: 'شاهد الأخصائيين المناسبين',
    footerNote: 'هذا البريد ملخص للاختبار الذي أجريته على U.Psy. ليس تشخيصًا سريريًا.',
  },
}

const QuizResults = ({
  name,
  score = 0,
  pillars = { focus: 0, regulation: 0, recovery: 0, meaning: 0 },
  weakestPillar = 'focus',
  lang = 'en',
  bookingUrl = 'https://upsy.ma/get-matched',
  matchUrl = 'https://upsy.ma/psychologists',
  resultsUrl = 'https://upsy.ma/free-score',
}: Props) => {
  const t = T[lang] ?? T.en
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const pillarKeys = Object.keys(pillars) as Pillar[]

  return (
    <Html lang={lang} dir={dir}>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO} alt="U.Psy" width="120" height="auto" style={logo} />
          <Heading style={h1}>{t.overall}: {score}/100</Heading>
          <Text style={text}>{t.hi(name)}</Text>
          <Text style={text}>{t.intro}</Text>

          <Section style={scoreBox}>
            <Text style={scoreNumber}>{score}</Text>
            <Text style={scoreCaption}>/ 100</Text>
          </Section>

          <Heading as="h2" style={h2}>{t.breakdown}</Heading>
          <Section>
            {pillarKeys.map((p) => (
              <Section key={p} style={pillarRow}>
                <Text style={pillarLabel}>
                  {PILLAR_LABEL[p][lang]}
                  {p === weakestPillar ? ' ★' : ''}
                </Text>
                <Text style={pillarScore}>{pillars[p]}/100</Text>
              </Section>
            ))}
          </Section>

          <Hr style={hr} />

          <Heading as="h2" style={h2}>{t.priority}: {PILLAR_LABEL[weakestPillar][lang]}</Heading>
          <Text style={text}>{PILLAR_ACTION[weakestPillar][lang]}</Text>

          <Heading as="h2" style={h2}>{t.nextSteps}</Heading>
          <Text style={text}>1. {t.step1}</Text>
          <Button style={button} href={bookingUrl}>{t.bookCta}</Button>
          <Text style={text}>2. {t.step2}</Text>
          <Text style={text}>
            <Link href={matchUrl} style={link}>{t.matchCta} →</Link>
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            {t.footerNote}
            <br />
            <Link href={resultsUrl} style={link}>upsy.ma/free-score</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: QuizResults,
  subject: (data: Props) => {
    const lang = data.lang ?? 'en'
    const s = data.score ?? 0
    if (lang === 'fr') return `Votre score de performance mentale : ${s}/100`
    if (lang === 'ar') return `نتيجتك في الأداء النفسي: ${s}/100`
    return `Your Mental Performance Score: ${s}/100`
  },
  displayName: 'Quiz Results',
  previewData: {
    name: 'Jane',
    score: 68,
    pillars: { focus: 55, regulation: 72, recovery: 60, meaning: 80 },
    weakestPillar: 'focus',
    lang: 'en',
    bookingUrl: 'https://upsy.ma/get-matched',
    matchUrl: 'https://upsy.ma/psychologists?pillar=focus&q=attention&source=free-score',
    resultsUrl: 'https://upsy.ma/free-score',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }
const container = { padding: '40px 32px', maxWidth: '520px', margin: '0 auto' }
const logo = { margin: '0 0 24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#6B1F2A', margin: '0 0 12px' }
const h2 = { fontSize: '15px', fontWeight: 'bold' as const, color: '#6B1F2A', margin: '28px 0 10px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }
const text = { fontSize: '15px', color: '#4A4A4A', lineHeight: '1.6', margin: '0 0 14px' }
const scoreBox = { textAlign: 'center' as const, backgroundColor: '#FAF6F0', borderRadius: '12px', padding: '24px', margin: '20px 0' }
const scoreNumber = { fontSize: '48px', fontWeight: 'bold' as const, color: '#6B1F2A', margin: 0, display: 'inline-block' }
const scoreCaption = { fontSize: '18px', color: '#999', margin: '0 0 0 6px', display: 'inline-block' }
const pillarRow = { padding: '8px 0', borderBottom: '1px solid #EEE' }
const pillarLabel = { fontSize: '14px', color: '#333', margin: 0, display: 'inline-block', width: '70%' }
const pillarScore = { fontSize: '14px', color: '#6B1F2A', fontWeight: 'bold' as const, margin: 0, display: 'inline-block', width: '30%', textAlign: 'right' as const }
const hr = { borderColor: '#EEE', margin: '24px 0' }
const button = { backgroundColor: '#6B1F2A', color: '#ffffff', fontSize: '15px', borderRadius: '8px', padding: '14px 24px', textDecoration: 'none', fontWeight: '600' as const, display: 'inline-block', margin: '4px 0 18px' }
const link = { color: '#6B1F2A', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#999', margin: '20px 0 0', lineHeight: '1.6' }