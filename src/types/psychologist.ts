export interface Specialty {
  id: string;
  name: string;
}

export interface Language {
  id: string;
  name: string;
}

export interface TherapyApproach {
  id: string;
  name: string;
}

export interface PsychologistProfile {
  id: string;
  full_name: string;
  bio: string | null;
  photo_url: string | null;
  city: string | null;
  gender: string | null;
  is_accredited: boolean;
  accreditation_level: string | null;
  offers_online: boolean;
  offers_in_person: boolean;
  hourly_rate_mad: number | null;
  calendly_url: string | null;
  is_published: boolean;
  slug: string;
  specialties: Specialty[];
  languages: Language[];
  therapy_approaches?: TherapyApproach[];
  created_at?: string;
  updated_at?: string;
}

export interface FilterState {
  specialties: string[];
  languages: string[];
  therapyApproaches: string[];
  city: string;
  online: boolean;
  inPerson: boolean;
  gender: string;
  availability: string;
  minPrice: number;
  maxPrice: number;
}
