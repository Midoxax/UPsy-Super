// One door to the language model for every edge function.
//
// Claude when ANTHROPIC_API_KEY is set (the default from now on); otherwise
// the Lovable AI gateway (LOVABLE_API_KEY) the functions were first built
// on. Neither set: AiError 503, which callers turn into "not configured".
//
//   aiText   one answer as text
//   aiJson   one answer validated against a JSON schema
//   aiStream a chat answer as OpenAI-style server-sent events
//            (`data: {"choices":[{"delta":{"content":"..."}}]}` … `data: [DONE]`),
//            the shape the app's chat client already reads.
import Anthropic from "npm:@anthropic-ai/sdk@0.133.0";

const MODEL = "claude-opus-5-5";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const GATEWAY_MODEL = "google/gemini-2.5-flash";
// Routes a declined request to another model instead of failing it.
const FALLBACK = {
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",
} as const;

export type ChatMessage = { role: "user" | "assistant"; content: string };
type Effort = "low" | "medium" | "high";

export class AiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** The model that answers, for audit columns. */
export const aiModel = () =>
  Deno.env.get("ANTHROPIC_API_KEY") ? MODEL : GATEWAY_MODEL;

export const aiConfigured = () =>
  !!(Deno.env.get("ANTHROPIC_API_KEY") || Deno.env.get("LOVABLE_API_KEY"));

function claude(): Anthropic | null {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  return apiKey ? new Anthropic({ apiKey }) : null;
}

function gatewayKey(): string {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key)
    throw new AiError(
      503,
      "AI is not configured: set ANTHROPIC_API_KEY in the function secrets",
    );
  return key;
}

/** Claude needs the conversation to open with the user and alternate. */
function tidy(messages: ChatMessage[]): ChatMessage[] {
  const out: ChatMessage[] = [];
  for (const m of messages) {
    const content = String(m.content ?? "").trim();
    if (!content || (m.role !== "user" && m.role !== "assistant")) continue;
    if (!out.length && m.role === "assistant") continue;
    const last = out[out.length - 1];
    if (last?.role === m.role) last.content += `\n\n${content}`;
    else out.push({ role: m.role, content });
  }
  return out;
}

function fromApiError(e: unknown): never {
  if (e instanceof AiError) throw e;
  if (e instanceof Anthropic.RateLimitError)
    throw new AiError(429, "AI rate limit reached, try again in a moment");
  if (e instanceof Anthropic.APIError)
    throw new AiError(502, `AI error ${e.status ?? ""}`.trim());
  throw new AiError(502, "AI request failed");
}

async function gateway(body: Record<string, unknown>): Promise<Response> {
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${gatewayKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: GATEWAY_MODEL, ...body }),
  });
  if (res.status === 429) throw new AiError(429, "AI rate limit reached");
  if (res.status === 402) throw new AiError(402, "AI credits exhausted");
  if (!res.ok) throw new AiError(502, `AI gateway ${res.status}`);
  return res;
}

export async function aiText(o: {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  effort?: Effort;
}): Promise<string> {
  const client = claude();
  if (!client) {
    const res = await gateway({
      messages: [{ role: "system", content: o.system }, ...o.messages],
    });
    return (await res.json()).choices?.[0]?.message?.content ?? "";
  }
  try {
    const msg = await client.beta.messages.create({
      ...FALLBACK,
      model: MODEL,
      max_tokens: o.maxTokens ?? 8000,
      output_config: { effort: o.effort ?? "low" },
      system: o.system,
      messages: tidy(o.messages),
    } as never);
    if (msg.stop_reason === "refusal")
      throw new AiError(422, "The request was declined");
    return msg.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("");
  } catch (e) {
    fromApiError(e);
  }
}

export async function aiJson<T>(o: {
  system: string;
  messages: ChatMessage[];
  /** JSON Schema: every object needs additionalProperties: false. */
  schema: Record<string, unknown>;
  maxTokens?: number;
  effort?: Effort;
}): Promise<T> {
  const client = claude();
  let text: string;
  if (!client) {
    const res = await gateway({
      messages: [
        {
          role: "system",
          content: `${o.system}\n\nAnswer with one JSON object matching this JSON Schema, and nothing else:\n${JSON.stringify(o.schema)}`,
        },
        ...o.messages,
      ],
      response_format: { type: "json_object" },
    });
    text = (await res.json()).choices?.[0]?.message?.content ?? "";
  } else {
    try {
      const msg = await client.beta.messages.create({
        ...FALLBACK,
        model: MODEL,
        max_tokens: o.maxTokens ?? 16000,
        output_config: {
          effort: o.effort ?? "medium",
          format: { type: "json_schema", schema: o.schema },
        },
        system: o.system,
        messages: tidy(o.messages),
      } as never);
      if (msg.stop_reason === "refusal")
        throw new AiError(422, "The request was declined");
      if (msg.stop_reason === "max_tokens")
        throw new AiError(502, "The AI answer was cut off");
      text = msg.content
        .flatMap((b) => (b.type === "text" ? [b.text] : []))
        .join("");
    } catch (e) {
      fromApiError(e);
    }
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new AiError(502, "The AI answer was not valid JSON");
  }
}

export async function aiStream(o: {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
}): Promise<ReadableStream<Uint8Array>> {
  const client = claude();
  if (!client) {
    const res = await gateway({
      messages: [{ role: "system", content: o.system }, ...o.messages],
      stream: true,
    });
    return res.body!;
  }
  const enc = new TextEncoder();
  const sse = (data: string) => enc.encode(`data: ${data}\n\n`);
  const stream = client.beta.messages.stream({
    ...FALLBACK,
    model: MODEL,
    max_tokens: o.maxTokens ?? 8000,
    output_config: { effort: "low" },
    system: o.system,
    messages: tidy(o.messages),
  } as never);
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const ev of stream) {
          if (
            ev.type === "content_block_delta" &&
            ev.delta.type === "text_delta"
          )
            controller.enqueue(
              sse(
                JSON.stringify({
                  choices: [{ delta: { content: ev.delta.text } }],
                }),
              ),
            );
        }
      } catch (e) {
        console.error("aiStream:", e instanceof Error ? e.message : e);
      }
      controller.enqueue(sse("[DONE]"));
      controller.close();
    },
    cancel() {
      stream.abort();
    },
  });
}

/** JSON error response for an AiError (or anything else). */
export function aiErrorResponse(
  e: unknown,
  headers: Record<string, string>,
): Response {
  const status = e instanceof AiError ? e.status : 500;
  const message = e instanceof Error ? e.message : "AI error";
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
