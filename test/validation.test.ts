import { describe, expect, it } from "vitest";
import {
  chatRequestSchema,
  discoverRequestSchema,
  formatValidationIssues,
  MAX_CHAT_MESSAGE_LENGTH,
  MAX_DISCOVER_LIMIT,
} from "../src/lib/validation";

describe("chatRequestSchema", () => {
  it("accepts and trims a normal message", () => {
    const result = chatRequestSchema.safeParse({ message: "  trending repos  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.message).toBe("trending repos");
  });

  it("rejects empty, whitespace-only, and non-string messages", () => {
    expect(chatRequestSchema.safeParse({ message: "" }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ message: "   " }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ message: 42 }).success).toBe(false);
    expect(chatRequestSchema.safeParse({}).success).toBe(false);
    expect(chatRequestSchema.safeParse(null).success).toBe(false);
  });

  it("rejects oversized messages", () => {
    const result = chatRequestSchema.safeParse({
      message: "x".repeat(MAX_CHAT_MESSAGE_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });
});

describe("discoverRequestSchema", () => {
  it("accepts an empty filter object", () => {
    expect(discoverRequestSchema.safeParse({}).success).toBe(true);
  });

  it("coerces and bounds the limit", () => {
    const parsed = discoverRequestSchema.safeParse({ limit: "12" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.limit).toBe(12);

    expect(discoverRequestSchema.safeParse({ limit: 0 }).success).toBe(false);
    expect(
      discoverRequestSchema.safeParse({ limit: MAX_DISCOVER_LIMIT + 1 }).success
    ).toBe(false);
    expect(discoverRequestSchema.safeParse({ limit: 2.5 }).success).toBe(false);
  });

  it("rejects oversized string filters", () => {
    expect(discoverRequestSchema.safeParse({ query: "x".repeat(201) }).success).toBe(
      false
    );
    expect(discoverRequestSchema.safeParse({ topic: "x".repeat(101) }).success).toBe(
      false
    );
    expect(
      discoverRequestSchema.safeParse({ language: "x".repeat(101) }).success
    ).toBe(false);
  });
});

describe("formatValidationIssues", () => {
  it("returns readable paths and messages", () => {
    const parsed = chatRequestSchema.safeParse({ message: "" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issues = formatValidationIssues(parsed.error);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toContain("message:");
    }
  });
});
