/**
 * Unit tests for lib/guidelines.ts
 * Validates the static guidelines data used by R7
 * Maps to: R7
 */

import { guidelines, Guideline } from "@/lib/guidelines";

const VALID_CATEGORIES: Guideline["category"][] = [
  "General",
  "Exams",
  "Assignments",
  "Ethics",
];

describe("guidelines data", () => {
  it("exports a non-empty array", () => {
    expect(Array.isArray(guidelines)).toBe(true);
    expect(guidelines.length).toBeGreaterThan(0);
  });

  it("every guideline has a non-empty id", () => {
    guidelines.forEach((g) => {
      expect(typeof g.id).toBe("string");
      expect(g.id.trim().length).toBeGreaterThan(0);
    });
  });

  it("every guideline has a non-empty title", () => {
    guidelines.forEach((g) => {
      expect(typeof g.title).toBe("string");
      expect(g.title.trim().length).toBeGreaterThan(0);
    });
  });

  it("every guideline has a non-empty shortDescription", () => {
    guidelines.forEach((g) => {
      expect(typeof g.shortDescription).toBe("string");
      expect(g.shortDescription.trim().length).toBeGreaterThan(0);
    });
  });

  it("every guideline has a non-empty content string", () => {
    guidelines.forEach((g) => {
      expect(typeof g.content).toBe("string");
      expect(g.content.trim().length).toBeGreaterThan(0);
    });
  });

  it("every guideline has a valid category", () => {
    guidelines.forEach((g) => {
      expect(VALID_CATEGORIES).toContain(g.category);
    });
  });

  it("every guideline has a lastUpdated field in YYYY-MM-DD format", () => {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    guidelines.forEach((g) => {
      expect(g.lastUpdated).toMatch(datePattern);
    });
  });

  it("all guideline ids are unique", () => {
    const ids = guidelines.map((g) => g.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("covers all four required categories", () => {
    const categories = new Set(guidelines.map((g) => g.category));
    VALID_CATEGORIES.forEach((cat) => {
      expect(categories.has(cat)).toBe(true);
    });
  });
});