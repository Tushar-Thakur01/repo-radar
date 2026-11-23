import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { calculateTrendingScore } from "../src/lib/trending";

const NOW = new Date("2026-01-15T12:00:00.000Z");
const CREATED_AT = new Date("2020-01-01T00:00:00.000Z");

function daysBefore(days: number): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
}

function score(overrides: Partial<Parameters<typeof calculateTrendingScore>[0]> = {}) {
  return calculateTrendingScore({
    stars: 10000,
    starGrowth: 50,
    pushedAt: NOW,
    createdAt: CREATED_AT,
    ...overrides,
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("calculateTrendingScore", () => {
  it("keeps scores inside the documented 10.0-99.9 range", () => {
    const result = score();
    expect(result.score).toBeGreaterThanOrEqual(10);
    expect(result.score).toBeLessThanOrEqual(99.9);
    expect(Number.isFinite(result.score)).toBe(true);
  });

  it("rewards stronger star growth", () => {
    const slow = score({ starGrowth: 5 });
    const fast = score({ starGrowth: 80 });
    expect(fast.score).toBeGreaterThan(slow.score);
    expect(fast.growthFactor).toBeGreaterThan(slow.growthFactor);
  });

  it("rewards recently pushed repositories", () => {
    const fresh = score({ pushedAt: NOW });
    const stale = score({ pushedAt: daysBefore(30) });
    expect(fresh.score).toBeGreaterThan(stale.score);
    expect(fresh.recencyFactor).toBeGreaterThan(stale.recencyFactor);
  });

  it("decays recency by 4 points per inactive day", () => {
    const result = score({ pushedAt: daysBefore(10) });
    expect(result.recencyFactor).toBe(60);
  });

  it("handles zero stars and negative growth without NaN", () => {
    const result = score({ stars: 0, starGrowth: -50 });
    expect(result.score).toBeGreaterThanOrEqual(10);
    expect(result.growthFactor).toBe(10);
    expect(result.popularityFactor).toBe(10);
    expect(Number.isNaN(result.score)).toBe(false);
  });

  it("keeps very old repositories above the score floor", () => {
    const result = score({
      pushedAt: daysBefore(3650),
      stars: 1,
      starGrowth: 0,
    });
    expect(result.score).toBe(10);
    expect(result.recencyFactor).toBe(10);
  });
});
