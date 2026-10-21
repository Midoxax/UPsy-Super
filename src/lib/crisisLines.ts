// Emergency numbers shown wherever someone may be in danger. Only official
// Moroccan emergency services: no helpline number is listed until it has
// been confirmed with the organisation that runs it.
export const CRISIS_LINES = [
  { name: "SAMU — urgence médicale", phone: "141" },
  { name: "Police", phone: "19" },
  { name: "Gendarmerie royale", phone: "177" },
  { name: "Protection civile", phone: "15" },
] as const;
