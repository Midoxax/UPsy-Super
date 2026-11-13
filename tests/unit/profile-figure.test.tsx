import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/motion/canAffordWebGL", () => ({ canAffordWebGL: () => false }));

import { ProfileFigure } from "@/components/profile/ProfileFigure";

const labels = {
  focus: "Focus",
  regulation: "Emotional regulation",
  recovery: "Recovery & energy",
  meaning: "Meaning & connection",
};

describe("ProfileFigure", () => {
  it("exposes every pillar and score as the image's text alternative", () => {
    render(
      <ProfileFigure
        scores={{ focus: 80, regulation: 45, recovery: 60, meaning: 30 }}
        labels={labels}
        caption="Your profile"
      />,
    );
    const img = screen.getByRole("img");
    const name = img.getAttribute("aria-label") ?? "";
    expect(name).toContain("Your profile");
    expect(name).toContain("Focus 80");
    expect(name).toContain("Emotional regulation 45");
    expect(name).toContain("Recovery & energy 60");
    expect(name).toContain("Meaning & connection 30");
  });

  it("renders the SVG outline, and no canvas, when WebGL is not affordable", () => {
    const { container } = render(
      <ProfileFigure
        scores={{ focus: 50, regulation: 50, recovery: 50, meaning: 50 }}
        labels={labels}
        caption="Your profile"
      />,
    );
    expect(container.querySelector("svg path")).not.toBeNull();
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("uses one colour for every profile, high or low", () => {
    const fill = (n: number) => {
      const { container } = render(
        <ProfileFigure
          scores={{ focus: n, regulation: n, recovery: n, meaning: n }}
          labels={labels}
          caption="Your profile"
        />,
      );
      const path = container.querySelector("svg path");
      return `${path?.getAttribute("fill")}|${path?.getAttribute("stroke")}`;
    };
    expect(fill(5)).toBe(fill(95));
  });
});
