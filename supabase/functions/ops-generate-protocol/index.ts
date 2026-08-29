import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const TOOL = {
  type: 'function',
  function: {
    name: 'create_protocol',
    description: 'Create a full operational protocol for an event with phases and tasks.',
    parameters: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      summary: { type: 'string' },
      phases: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            tasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  owner_role: { type: 'string' },
                  days_before_event: { type: 'number' },
                  proof_required: { type: 'boolean' },
                  psych_safety_flag: { type: 'boolean' },
                },
                required: ['title', 'owner_role'],
              },
            },
          },
          required: ['title', 'tasks'],
        },
      },
    },
    required: ['title', 'phases'],
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData.user;
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { workspace_id, intake } = await req.json();
    if (!workspace_id || !intake) throw new Error('workspace_id and intake required');

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Verify membership
    const { data: member } = await admin
      .from('ops_workspace_members')
      .select('role')
      .eq('workspace_id', workspace_id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!member || !['director', 'operator'].includes(member.role)) {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Call Claude
    const systemPrompt = `You are the UPSY OPS Director — an expert in psychological-safety-aware event operations for institutions in Morocco (clinics, federations, NGOs, universities). Generate a complete operational protocol given the intake. Use the create_protocol tool. Be thorough: 3-6 phases (preparation → logistics → execution → debrief → archive). Each phase 3-8 concrete tasks with realistic owner roles (Director, Logistics Lead, Psych Safety Officer, Comms Lead, etc). When psychological sensitivity is high or trauma-informed, flag psych_safety_flag=true on relevant tasks and include calm-room / debriefing tasks. Days_before_event: negative = before event, 0 = event day, positive = after.`;

    const userPrompt = `Generate the protocol for this operation:\n${JSON.stringify(intake, null, 2)}`;

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
          { role: 'user', content: userPrompt },
        ],
        tools: [TOOL],
        tool_choice: { type: 'function', function: { name: 'create_protocol' } },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('AI error:', aiRes.status, errText);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: 'rate_limited', message: 'AI rate limit reached. Try again in a moment.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: 'payment_required', message: 'AI credits exhausted. Add funds in Settings → Workspace → Usage.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: `AI ${aiRes.status}: ${errText}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error('No tool_call in AI response');
    const protocol = JSON.parse(toolCall.function.arguments) as { title: string; phases: Array<{ title: string; description?: string; tasks: any[] }> };

    // Compute deadlines: use start_at if available, else now + 30d
    const baseDate = intake.start_at ? new Date(intake.start_at) : new Date(Date.now() + 30 * 86400000);

    // Create event
    const { data: eventRow, error: eventErr } = await admin
      .from('ops_events')
      .insert({
        workspace_id,
        title: intake.title || protocol.title,
        event_type: intake.event_type,
        intake,
        status: 'planning',
        start_at: baseDate.toISOString(),
        created_by: user.id,
      })
      .select()
      .single();
    if (eventErr) throw eventErr;

    // Create phases + tasks
    for (let i = 0; i < protocol.phases.length; i++) {
      const p = protocol.phases[i];
      const { data: phaseRow, error: phaseErr } = await admin
        .from('ops_protocol_phases')
        .insert({ event_id: eventRow.id, order_index: i, title: p.title, description: p.description ?? null })
        .select()
        .single();
      if (phaseErr) throw phaseErr;

      const taskRows = p.tasks.map((t: any) => ({
        event_id: eventRow.id,
        phase_id: phaseRow.id,
        title: t.title,
        description: t.description ?? null,
        owner_role: t.owner_role ?? null,
        proof_required: !!t.proof_required,
        psych_safety_flag: !!t.psych_safety_flag,
        deadline: new Date(baseDate.getTime() + (t.days_before_event ?? 0) * 86400000).toISOString(),
        state: 'pending',
      }));
      if (taskRows.length) {
        const { error: taskErr } = await admin.from('ops_tasks').insert(taskRows);
        if (taskErr) throw taskErr;
      }
    }

    return new Response(JSON.stringify({ event_id: eventRow.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('ops-generate-protocol error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'unknown' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});