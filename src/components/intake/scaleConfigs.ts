import type { ScaleConfig } from "./PsychometricScale";

export const PHQ9_CONFIG: ScaleConfig = {
  id: "phq9",
  title: "PHQ-9 — Dépression",
  instruction:
    "Au cours des 2 dernières semaines, à quelle fréquence as-tu été affecté·e par les problèmes suivants ?",
  crisisItemId: 9,
  options: [
    { value: 0, label: "Jamais" },
    { value: 1, label: "Plusieurs jours" },
    { value: 2, label: "Plus de la moitié des jours" },
    { value: 3, label: "Presque tous les jours" },
  ],
  items: [
    { id: 1, text: "Peu d'intérêt ou de plaisir à faire les choses" },
    { id: 2, text: "Sentiment d'être triste, déprimé·e ou désespéré·e" },
    {
      id: 3,
      text: "Difficultés à s'endormir, rester endormi·e, ou dormir trop",
    },
    { id: 4, text: "Sensation de fatigue ou peu d'énergie" },
    { id: 5, text: "Manque d'appétit ou alimentation excessive" },
    {
      id: 6,
      text: "Mauvaise opinion de toi-même, sentiment d'être un·e raté·e ou d'avoir déçu ses proches",
    },
    { id: 7, text: "Difficultés à se concentrer (lecture, télé, travail…)" },
    {
      id: 8,
      text: "Lenteur ou agitation visibles, ou être plus agité·e que d'habitude",
    },
    {
      id: 9,
      text: "Pensées qu'il vaudrait mieux ne plus être en vie ou de te faire du mal",
    },
  ],
  scoringBands: [
    { min: 0, max: 4, label: "Symptômes minimaux", color: "green" },
    { min: 5, max: 9, label: "Dépression légère", color: "yellow" },
    { min: 10, max: 14, label: "Dépression modérée", color: "orange" },
    { min: 15, max: 19, label: "Dépression modérément sévère", color: "red" },
    { min: 20, max: 27, label: "Dépression sévère", color: "darkred" },
  ],
};

export const GAD7_CONFIG: ScaleConfig = {
  id: "gad7",
  title: "GAD-7 — Anxiété",
  instruction:
    "Au cours des 2 dernières semaines, à quelle fréquence as-tu été affecté·e par les problèmes suivants ?",
  options: [
    { value: 0, label: "Jamais" },
    { value: 1, label: "Plusieurs jours" },
    { value: 2, label: "Plus de la moitié des jours" },
    { value: 3, label: "Presque tous les jours" },
  ],
  items: [
    { id: 1, text: "Sensation de nervosité, anxiété ou de tension" },
    { id: 2, text: "Incapable d'arrêter ou de contrôler tes inquiétudes" },
    { id: 3, text: "Inquiétudes excessives à propos de tout et de rien" },
    { id: 4, text: "Difficulté à te détendre" },
    { id: 5, text: "Si agité·e qu'il est difficile de tenir en place" },
    { id: 6, text: "Devenir facilement contrarié·e ou irritable" },
    { id: 7, text: "Avoir peur que quelque chose d'horrible ne survienne" },
  ],
  scoringBands: [
    { min: 0, max: 4, label: "Anxiété minimale", color: "green" },
    { min: 5, max: 9, label: "Anxiété légère", color: "yellow" },
    { min: 10, max: 14, label: "Anxiété modérée", color: "orange" },
    { min: 15, max: 21, label: "Anxiété sévère", color: "red" },
  ],
};

// Cohen, Kamarck & Mermelstein (1983) PSS-10, items in the original order,
// validated French wording (Bellinghausen et al., 2009). Items 4, 5, 7 and 8
// are positively worded and reverse-scored (4 - answer). Total 0-40.
// EN originals, for reference: 1 upset because of something that happened
// unexpectedly; 2 unable to control the important things in your life;
// 3 nervous and "stressed"; 4 confident about your ability to handle your
// personal problems; 5 that things were going your way; 6 that you could not
// cope with all the things that you had to do; 7 able to control irritations
// in your life; 8 that you were on top of things; 9 angered because of things
// that were outside of your control; 10 difficulties were piling up so high
// that you could not overcome them.
export const PSS10_CONFIG: ScaleConfig = {
  id: "pss10",
  title: "PSS-10 — Stress perçu",
  instruction:
    "Au cours du dernier mois, combien de fois vous êtes-vous senti(e)…",
  options: [
    { value: 0, label: "Jamais" },
    { value: 1, label: "Presque jamais" },
    { value: 2, label: "Parfois" },
    { value: 3, label: "Assez souvent" },
    { value: 4, label: "Très souvent" },
  ],
  items: [
    { id: 1, text: "…dérangé(e) par un événement inattendu ?" },
    {
      id: 2,
      text: "…incapable de contrôler les choses importantes de votre vie ?",
    },
    { id: 3, text: "…nerveux(se) et stressé(e) ?" },
    {
      id: 4,
      text: "…confiant(e) dans votre capacité à prendre en main vos problèmes personnels ?",
      reversed: true,
    },
    {
      id: 5,
      text: "…que les choses allaient comme vous le vouliez ?",
      reversed: true,
    },
    {
      id: 6,
      text: "…que vous ne pouviez pas assumer toutes les choses que vous deviez faire ?",
    },
    {
      id: 7,
      text: "…capable de maîtriser votre énervement ?",
      reversed: true,
    },
    {
      id: 8,
      text: "…que vous dominiez la situation ?",
      reversed: true,
    },
    {
      id: 9,
      text: "…irrité(e) parce que les événements échappaient à votre contrôle ?",
    },
    {
      id: 10,
      text: "…que les difficultés s'accumulaient à un tel point que vous ne pouviez les surmonter ?",
    },
  ],
  scoringBands: [
    { min: 0, max: 13, label: "Stress faible", color: "green" },
    { min: 14, max: 26, label: "Stress modéré", color: "orange" },
    { min: 27, max: 40, label: "Stress élevé", color: "red" },
  ],
};

export const AUDIT_C_CONFIG: ScaleConfig = {
  id: "audit_c",
  title: "AUDIT-C — Consommation d'alcool",
  instruction: "Quelques questions sur ta consommation d'alcool.",
  options: [],
  items: [
    {
      id: 1,
      text: "À quelle fréquence consommes-tu des boissons alcoolisées ?",
    },
    {
      id: 2,
      text: "Combien de verres standards consommes-tu un jour typique où tu bois ?",
    },
    {
      id: 3,
      text: "À quelle fréquence consommes-tu 6 verres ou plus en une seule occasion ?",
    },
  ],
  scoringBands: [
    { min: 0, max: 2, label: "Consommation faible", color: "green" },
    { min: 3, max: 4, label: "Consommation modérée", color: "yellow" },
    { min: 5, max: 12, label: "Consommation à risque", color: "red" },
  ],
};

// AUDIT-C has per-item custom options
export const AUDIT_C_ITEM_OPTIONS: Record<
  number,
  { value: number; label: string }[]
> = {
  1: [
    { value: 0, label: "Jamais" },
    { value: 1, label: "Mensuellement ou moins" },
    { value: 2, label: "2-4×/mois" },
    { value: 3, label: "2-3×/semaine" },
    { value: 4, label: "4×/semaine ou +" },
  ],
  2: [
    { value: 0, label: "1 ou 2" },
    { value: 1, label: "3 ou 4" },
    { value: 2, label: "5 ou 6" },
    { value: 3, label: "7-9" },
    { value: 4, label: "10+" },
  ],
  3: [
    { value: 0, label: "Jamais" },
    { value: 1, label: "Moins d'1×/mois" },
    { value: 2, label: "Mensuellement" },
    { value: 3, label: "Hebdomadaire" },
    { value: 4, label: "Quotidien" },
  ],
};
