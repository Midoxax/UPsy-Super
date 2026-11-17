import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { aiModel, effortFor, modelFor } from "../_shared/ai.ts";

Deno.test("ai routing — deep work goes to Fable, frequent work to Opus", () => {
  assertEquals(modelFor("deep"), "claude-fable-5-2");
  assertEquals(modelFor("fast"), "claude-opus-5-5");
});

Deno.test(
  "ai routing — a tier sets the default effort, a caller can override",
  () => {
    assertEquals(effortFor("deep"), "medium");
    assertEquals(effortFor("fast"), "low");
    assertEquals(effortFor("deep", "low"), "low");
    assertEquals(effortFor("fast", "high"), "high");
  },
);

Deno.test(
  "ai routing — the audited model follows the tier, or the gateway without a key",
  () => {
    const prev = Deno.env.get("ANTHROPIC_API_KEY");
    try {
      Deno.env.set("ANTHROPIC_API_KEY", "test");
      assertEquals(aiModel("deep"), "claude-fable-5-2");
      assertEquals(aiModel("fast"), "claude-opus-5-5");
      assertEquals(aiModel(), "claude-opus-5-5");
      Deno.env.delete("ANTHROPIC_API_KEY");
      assertEquals(aiModel("deep"), "google/gemini-2.5-flash");
    } finally {
      if (prev === undefined) Deno.env.delete("ANTHROPIC_API_KEY");
      else Deno.env.set("ANTHROPIC_API_KEY", prev);
    }
  },
);
