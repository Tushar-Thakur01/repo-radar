import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { resolvers } from "@/lib/graphql/resolvers";

describe("Dashboard Search Logic Tests", () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("searches repositories by name (e.g. 'react')", async () => {
    const results = await resolvers.Query.searchRepositories(null, {
      query: "react",
    });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    const hasMatch = results.some(
      (r) =>
        r.name.toLowerCase().includes("react") ||
        r.fullName.toLowerCase().includes("react")
    );
    expect(hasMatch).toBe(true);
  });

  it("searches repositories by owner (e.g. 'vercel')", async () => {
    const results = await resolvers.Query.searchRepositories(null, {
      query: "vercel",
    });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.owner.toLowerCase().includes("vercel"))).toBe(true);
  });

  it("searches repositories by keyword in description (e.g. 'framework')", async () => {
    const results = await resolvers.Query.searchRepositories(null, {
      query: "framework",
    });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it("searches repositories by language filter (e.g. 'TypeScript')", async () => {
    const results = await resolvers.Query.searchRepositories(null, {
      language: "TypeScript",
    });
    expect(Array.isArray(results)).toBe(true);
    results.forEach((r) => {
      expect(r.primaryLanguage).toBe("TypeScript");
    });
  });

  it("returns an empty array when no repositories match without throwing", async () => {
    const results = await resolvers.Query.searchRepositories(null, {
      query: "nonexistent_query_xyz_12345",
    });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });
});
