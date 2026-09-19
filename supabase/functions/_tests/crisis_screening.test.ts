import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { keywordScreen, mergeRisk } from "../_shared/crisis-screening.ts";

Deno.test("crisis screening — explicit high-risk multilingual phrases are high", () => {
  assertEquals(keywordScreen("I want to die tonight"), "high");
  assertEquals(keywordScreen("Je veux me suicider"), "high");
  assertEquals(keywordScreen("أنتحر"), "high");
});

Deno.test("crisis screening — moderate hopelessness is moderate", () => {
  assertEquals(keywordScreen("I feel hopeless and worthless"), "moderate");
  assertEquals(keywordScreen("Je suis sans espoir"), "moderate");
});

Deno.test("crisis screening — ordinary distress remains low", () => {
  assertEquals(keywordScreen("I am stressed about tomorrow's exam"), "low");
});

Deno.test("crisis screening — blended result never downgrades keyword severity", () => {
  assertEquals(mergeRisk("low", "high"), "high");
  assertEquals(mergeRisk("moderate", "high"), "high");
  assertEquals(mergeRisk("high", "moderate"), "high");
  assertEquals(mergeRisk("low", "moderate"), "moderate");
});
