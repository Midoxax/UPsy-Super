import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { workspace_id, messages } = await req.json();
    if (!workspace_id || !Array.isArray(messages)) throw new Error('workspace_id and messages required');

    // Fetch workspace context
    const { data: ws } = await userClient.from('ops_workspaces').select('name, kind').eq('id', workspace_id).maybeSingle();
    const { data: events } = await userClient
      .from('ops_events').select('title, event_type, status')
      .eq('workspace_id', workspace_id).order('created_at', { ascending: false }).limit(10);

    const systemPrompt = `You are the UPSY OPS AI Operations Director for the "${ws?.name ?? 'workspace'}" (${ws?.kind ?? 'institution'}). You orchestrate institutional operations: SOPs, accountability, psychological safety, logistics. Be direct, tactical, and operational. Use plain language. When asked to generate or modify protocols, describe what would change rather than executing — execution happens via the SOP engine.\n\nRecent operations in this workspace:\n${(events ?? []).map((e: any) => `- ${e.title} (${e.event_type}, ${e.status})`).join('\n') || '(none)'}`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: 'rate_limited', message: 'AI rate limit reached. Try again in a moment.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: 'payment_required', message: 'AI credits exhausted. Add funds in Settings → Workspace → Usage.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: `AI ${aiRes.status}: ${errText}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const json = await aiRes.json();
    const reply = json.choices?.[0]?.message?.content ?? '';

    return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('ops-director error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'unknown' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});