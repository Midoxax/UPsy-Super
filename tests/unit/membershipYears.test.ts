import { describe, expect, it } from "vitest";
import { membershipYears } from "@/lib/league/membershipYears";

describe("membershipYears", () => {
  it("covers one year before October", () => {
    expect(membershipYears("2026-03-10", "2026-12-31")).toEqual(["2026"]);
  });
  it("covers this year and the next from 1 October", () => {
    expect(membershipYears("2026-10-01", "2027-12-31")).toEqual([
      "2026",
      "2027",
    ]);
  });
  it("covers the renewed year only", () => {
    expect(membershipYears("2027-01-01", "2027-12-31")).toEqual(["2027"]);
  });
});
