/** The app reads the 403 code the AI functions return when consent is missing. */
import { describe, it, expect, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
import { aiConsentErrorCode } from "@/hooks/useAiConsent";

const err = (status: number, body: unknown) => ({
  context: new Response(JSON.stringify(body), { status }),
});

describe("aiConsentErrorCode", () => {
  it("recognises the caller's and the client's missing consent", async () => {
    expect(
      await aiConsentErrorCode(err(403, { code: "ai_consent_required" })),
    ).toBe("ai_consent_required");
    expect(
      await aiConsentErrorCode(
        err(403, { code: "client_ai_consent_required" }),
      ),
    ).toBe("client_ai_consent_required");
  });

  it("ignores other errors", async () => {
    expect(
      await aiConsentErrorCode(err(403, { error: "Forbidden" })),
    ).toBeNull();
    expect(
      await aiConsentErrorCode(err(500, { code: "ai_consent_required" })),
    ).toBeNull();
    expect(await aiConsentErrorCode(new Error("x"))).toBeNull();
    expect(await aiConsentErrorCode(null)).toBeNull();
  });
});
