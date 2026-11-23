import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSchema, createYoga } from "graphql-yoga";
import { resolvers } from "../src/lib/graphql/resolvers";
import { typeDefs } from "../src/lib/graphql/schema";

const prismaMock = vi.hoisted(() => ({
  repository: {
    count: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  repoTopic: { findMany: vi.fn() },
  repoSnapshot: { findMany: vi.fn() },
  repoSummary: { findUnique: vi.fn() },
  savedRepository: { findUnique: vi.fn() },
}));

vi.mock("../src/lib/prisma", () => ({ prisma: prismaMock }));

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: "/api/graphql",
});

const NOW = new Date("2024-01-01T00:00:00.000Z");

function makeRepo(overrides: Record<string, unknown> = {}) {
  return {
    id: "repo-1",
    githubId: 1,
    fullName: "acme/one",
    owner: "acme",
    name: "one",
    description: "First test repository",
    url: "https://github.com/acme/one",
    homepage: null,
    stars: 1000,
    forks: 10,
    openIssues: 2,
    watchers: 5,
    primaryLanguage: "TypeScript",
    license: "MIT",
    defaultBranch: "main",
    isArchived: false,
    isFork: false,
    githubCreatedAt: NOW,
    githubUpdatedAt: NOW,
    githubPushedAt: NOW,
    trendingScore: 90,
    starGrowth: 15,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

async function execute(source: string) {
  const response = await yoga.fetch("http://localhost/api/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: source }),
  });

  return (await response.json()) as {
    data?: Record<string, unknown>;
    errors?: Array<{ message: string }>;
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GraphQL query execution", () => {
  it("returns trending repositories ordered by score", async () => {
    prismaMock.repository.findMany.mockResolvedValue([
      makeRepo(),
      makeRepo({
        id: "repo-2",
        githubId: 2,
        fullName: "acme/two",
        name: "two",
        stars: 500,
        trendingScore: 75,
      }),
    ]);

    const result = await execute(/* GraphQL */ `
      query {
        trendingRepositories(limit: 2) {
          fullName
          stars
          trendingScore
        }
      }
    `);

    expect(result.errors).toBeUndefined();
    expect(result.data?.trendingRepositories).toEqual([
      { fullName: "acme/one", stars: 1000, trendingScore: 90 },
      { fullName: "acme/two", stars: 500, trendingScore: 75 },
    ]);
    expect(prismaMock.repository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { trendingScore: "desc" },
        take: 2,
      })
    );
  });

  it("applies the language filter", async () => {
    prismaMock.repository.findMany.mockResolvedValue([makeRepo()]);

    await execute(/* GraphQL */ `
      query {
        trendingRepositories(limit: 5, language: "TypeScript") {
          fullName
        }
      }
    `);

    expect(prismaMock.repository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { primaryLanguage: "TypeScript" },
        take: 5,
      })
    );
  });

  it("computes dashboard repository stats", async () => {
    prismaMock.repository.count.mockResolvedValue(3);
    prismaMock.repository.findMany.mockResolvedValue([
      { stars: 100, primaryLanguage: "TypeScript" },
      { stars: 200, primaryLanguage: "Python" },
      { stars: 50, primaryLanguage: null },
    ]);
    prismaMock.repoTopic.findMany.mockResolvedValue([
      { name: "ai" },
      { name: "react" },
    ]);

    const result = await execute(/* GraphQL */ `
      query {
        repositoryStats {
          totalRepos
          totalStars
          totalLanguages
          totalTopics
          recentlyAdded
        }
      }
    `);

    expect(result.errors).toBeUndefined();
    expect(result.data?.repositoryStats).toEqual({
      totalRepos: 3,
      totalStars: 350,
      totalLanguages: 2,
      totalTopics: 2,
      recentlyAdded: 3,
    });
  });
});
