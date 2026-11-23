import { describe, expect, it } from "vitest";
import { AIService } from "../src/lib/ai";

const service = new AIService();

const baseRepo = {
  fullName: "acme/rocket",
  description: "A fast TypeScript toolkit.",
  primaryLanguage: "TypeScript",
  stars: 1234,
  topics: ["typescript", "tooling"],
};

describe("AIService.generateHeuristicAnalysis", () => {
  it("returns complete, non-empty offline summaries", () => {
    const result = service.generateHeuristicAnalysis(baseRepo);

    expect(result.summary).toContain("acme/rocket");
    expect(result.summary).toContain("TypeScript");
    expect(result.architecture.length).toBeGreaterThan(0);
    expect(result.keyFeatures.length).toBeGreaterThan(0);
    expect(result.useCases.length).toBeGreaterThan(0);
    expect(result.limitations.length).toBeGreaterThan(0);
    expect(result.beginnerTake.length).toBeGreaterThan(0);
    expect(result.modelName).toContain("heuristic");
    expect(result.isAiGenerated).toBe(false);
  });

  it("handles missing descriptions and topics", () => {
    const result = service.generateHeuristicAnalysis({
      ...baseRepo,
      description: null,
      primaryLanguage: null,
      topics: [],
    });

    expect(result.summary).toContain("acme/rocket");
    expect(result.summary).toContain("open source project");
    expect(result.summary).not.toContain("null");
  });

  it("extracts feature bullets from README content", () => {
    const readme = [
      "## Features",
      "- Zero configuration setup for local development",
      "- Type-safe API with automatic validation",
      "- Works fully offline with a deterministic fallback",
      "## Installation",
      "Run npm install.",
    ].join("\n");

    const result = service.generateHeuristicAnalysis({
      ...baseRepo,
      readmeContent: readme,
    });

    expect(result.keyFeatures).toContain("Zero configuration");
    expect(result.keyFeatures).toContain("Type-safe API");
    expect(result.keyFeatures).not.toContain("## Installation");
  });
});
