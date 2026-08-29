import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const MatchRequestSchema = z.object({
  specialtyNeeded: z.string().uuid("Invalid specialty ID format"),
  languagesPreferred: z.array(z.string().uuid("Invalid language ID format"))
    .min(1, "At least one language is required")
    .max(10, "Maximum 10 languages allowed"),
  budgetMax: z.number().positive("Budget must be positive").max(10000, "Budget exceeds maximum").optional(),
  locationCity: z.string().max(100, "City name too long").optional(),
  prefersOnline: z.boolean()
});

interface MatchRequest {
  specialtyNeeded: string;
  languagesPreferred: string[];
  budgetMax?: number;
  locationCity?: string;
  prefersOnline: boolean;
}

// Rate limiting storage (in-memory for simplicity)
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

// Error sanitization utility
function sanitizeError(error: any): string {
  const errorMap: Record<string, string> = {
    'duplicate key': 'A record with this information already exists',
    'foreign key': 'Referenced resource not found',
    'not null': 'Required field is missing',
    'invalid input': 'Invalid data provided',
    'connection': 'Service temporarily unavailable',
    'timeout': 'Request timed out, please try again',
  };
  
  const errorMsg = error.message?.toLowerCase() || '';
  for (const [key, message] of Object.entries(errorMap)) {
    if (errorMsg.includes(key)) {
      return message;
    }
  }
  
  return 'An error occurred while finding matches';
}

// Rate limiting check
function checkRateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimiter.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimiter.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: 10 requests per minute per IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    if (!checkRateLimit(clientIp, 10, 60000)) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Too many requests. Please try again in a minute.' 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Validate input
    const rawBody = await req.json();
    let validatedInput: MatchRequest;
    
    try {
      validatedInput = MatchRequestSchema.parse(rawBody);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.warn("Validation error:", validationError.errors);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid request data',
            details: validationError.errors.map(e => e.message)
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw validationError;
    }

    const { specialtyNeeded, languagesPreferred, budgetMax, locationCity, prefersOnline } = validatedInput;

    console.log("Finding matches for:", { specialtyNeeded, languagesPreferred, budgetMax, locationCity, prefersOnline });

    // Try strict matching first
    let query = supabaseClient
      .from("psychologist_profiles")
      .select(`
        id,
        full_name,
        bio,
        photo_url,
        city,
        is_accredited,
        offers_online,
        offers_in_person,
        hourly_rate_mad,
        calendly_url,
        slug,
        psychologist_specialties!inner(specialty_id),
        psychologist_languages!inner(language_id)
      `)
      .eq("is_published", true)
      .eq("psychologist_specialties.specialty_id", specialtyNeeded);

    // Filter by online/in-person preference
    if (prefersOnline) {
      query = query.eq("offers_online", true);
    } else {
      query = query.eq("offers_in_person", true);
    }

    // Filter by budget if provided
    if (budgetMax) {
      query = query.lte("hourly_rate_mad", budgetMax);
    }

    let { data: profiles, error } = await query;

    if (error) {
      console.error("Error fetching profiles:", error);
      throw error;
    }

    console.log("Found strict matches:", profiles?.length);

    // Fallback: If no matches, relax specialty requirement
    if (!profiles || profiles.length === 0) {
      console.log("No strict matches, trying fallback without specialty filter...");
      
      let fallbackQuery = supabaseClient
        .from("psychologist_profiles")
        .select(`
          id,
          full_name,
          bio,
          photo_url,
          city,
          is_accredited,
          offers_online,
          offers_in_person,
          hourly_rate_mad,
          calendly_url,
          slug,
          psychologist_specialties(specialty_id),
          psychologist_languages(language_id)
        `)
        .eq("is_published", true);

      if (prefersOnline) {
        fallbackQuery = fallbackQuery.eq("offers_online", true);
      } else {
        fallbackQuery = fallbackQuery.eq("offers_in_person", true);
      }

      const fallbackResult = await fallbackQuery;
      profiles = fallbackResult.data;
      
      console.log("Fallback found profiles:", profiles?.length);
    }

    // Score and rank matches
    const scoredMatches = (profiles || []).map((profile: any) => {
      let score = 0;

      // Check language match
      const profileLanguageIds = profile.psychologist_languages.map((pl: any) => pl.language_id);
      const languageMatch = languagesPreferred.some((lang) => profileLanguageIds.includes(lang));
      if (languageMatch) score += 3;

      // Check city match (exact or nearby)
      if (locationCity && profile.city) {
        const cityLower = profile.city.toLowerCase();
        const searchCityLower = locationCity.toLowerCase();
        if (cityLower === searchCityLower) {
          score += 2;
        } else if (cityLower.includes(searchCityLower) || searchCityLower.includes(cityLower)) {
          score += 1; // Partial city match
        }
      }
      
      // Bonus for online if no city preference
      if (!locationCity && profile.offers_online) {
        score += 1;
      }

      // Bonus for accreditation
      if (profile.is_accredited) score += 1;

      // Bonus for having calendly link
      if (profile.calendly_url) score += 1;

      return {
        ...profile,
        score,
      };
    });

    // Sort by score and take top 3
    const topMatches = scoredMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((match) => {
        // Fetch full specialty and language data
        const { psychologist_specialties, psychologist_languages, score, ...rest } = match;
        return rest;
      });

    console.log("Top matches:", topMatches.length);

    // Fetch full specialty and language data for the top matches
    const enrichedMatches = await Promise.all(
      topMatches.map(async (match: any) => {
        const { data: specialties } = await supabaseClient
          .from("psychologist_specialties")
          .select("specialty_id, specialties(id, name)")
          .eq("psychologist_id", match.id);

        const { data: languages } = await supabaseClient
          .from("psychologist_languages")
          .select("language_id, languages(id, name)")
          .eq("psychologist_id", match.id);

        return {
          ...match,
          specialties: specialties?.map((s: any) => s.specialties) || [],
          languages: languages?.map((l: any) => l.languages) || [],
        };
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        matches: enrichedMatches,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    // Log full error details server-side for debugging
    console.error("Error in find-matches:", {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return sanitized error to client
    return new Response(
      JSON.stringify({
        success: false,
        error: sanitizeError(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
