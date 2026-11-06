import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { keywordScreen } from "../_shared/crisis-screening.ts";

Deno.test(
  "crisis screening — explicit high-risk multilingual phrases are high",
  () => {
    assertEquals(keywordScreen("I want to die tonight"), "high");
    assertEquals(keywordScreen("Je veux me suicider"), "high");
    assertEquals(keywordScreen("أنتحر"), "high");
    assertEquals(keywordScreen("bghit nmout"), "high");
    assertEquals(keywordScreen("بغيت نموت"), "high");
  },
);

Deno.test("crisis screening — matching ignores case and diacritics", () => {
  assertEquals(keywordScreen("JE SUIS DESESPERE"), "moderate");
  assertEquals(keywordScreen("انتحر"), "high");
  assertEquals(keywordScreen("SUICIDAL thoughts"), "high");
});

Deno.test("crisis screening — moderate hopelessness is moderate", () => {
  assertEquals(keywordScreen("I feel hopeless and worthless"), "moderate");
  assertEquals(keywordScreen("Je suis sans espoir"), "moderate");
});

Deno.test("crisis screening — ordinary distress remains low", () => {
  assertEquals(keywordScreen("I am stressed about tomorrow's exam"), "low");
});
