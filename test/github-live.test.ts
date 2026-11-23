import { describe, it, expect, beforeAll } from "vitest";
import { githubService } from "@/lib/github";

describe("Real GitHub API Verification", () => {
  let hasNetwork = false;

  beforeAll(async () => {
    try {
      const res = await fetch("https://api.github.com", { method: "HEAD" });
      hasNetwork = res.status > 0;
    } catch {
      hasNetwork = false;
      console.warn("⚠️ No external network connectivity detected (sandbox isolation active). Skipping live network calls.");
    }
  });

  it("fetches rate limit status from api.github.com", async () => {
    const rateLimit = await githubService.checkRateLimit();
    expect(rateLimit.limit).toBeGreaterThan(0);
    expect(rateLimit.remaining).toBeGreaterThanOrEqual(0);
    expect(rateLimit.resetTime).toBeInstanceOf(Date);
  });

  it("fetches real live repository data for vercel/next.js", async ({ skip }) => {
    if (!hasNetwork) skip();
    const repo = await githubService.getRepository("vercel", "next.js");
    expect(repo).not.toBeNull();
    if (repo) {
      console.log("vercel/next.js live stats:", {
        full_name: repo.full_name,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        url: repo.html_url,
        updated_at: repo.updated_at,
      });
      expect(repo.full_name).toBe("vercel/next.js");
      expect(repo.html_url).toBe("https://github.com/vercel/next.js");
      expect(repo.stargazers_count).toBeGreaterThan(100000); // Next.js has >100k stars
      expect(repo.owner.login.toLowerCase()).toBe("vercel");
    }
  });

  it("fetches real live repository data for prisma/prisma", async ({ skip }) => {
    if (!hasNetwork) skip();
    const repo = await githubService.getRepository("prisma", "prisma");
    expect(repo).not.toBeNull();
    if (repo) {
      console.log("prisma/prisma live stats:", {
        full_name: repo.full_name,
        stars: repo.stargazers_count,
        language: repo.language,
        url: repo.html_url,
      });
      // GitHub renamed prisma/prisma to prisma/orm
      expect(["prisma/prisma", "prisma/orm"]).toContain(repo.full_name);
      expect(repo.stargazers_count).toBeGreaterThan(35000);
    }
  });

  it("fetches real live repository data for modelcontextprotocol/servers", async ({ skip }) => {
    if (!hasNetwork) skip();
    const repo = await githubService.getRepository("modelcontextprotocol", "servers");
    expect(repo).not.toBeNull();
    if (repo) {
      console.log("modelcontextprotocol/servers live stats:", {
        full_name: repo.full_name,
        stars: repo.stargazers_count,
        url: repo.html_url,
      });
      expect(repo.full_name).toBe("modelcontextprotocol/servers");
      expect(repo.stargazers_count).toBeGreaterThan(1000);
    }
  });

  it("performs real search on GitHub for query 'mcp'", async ({ skip }) => {
    if (!hasNetwork) skip();
    const results = await githubService.searchRepositories({
      query: "mcp",
      limit: 5,
    });
    console.log(`Found ${results.length} search results for 'mcp':`);
    results.forEach((r) => {
      console.log(`- ${r.full_name}: ${r.stargazers_count} stars`);
    });
    expect(Array.isArray(results)).toBe(true);
    if (results.length > 0) {
      expect(results[0]).toHaveProperty("full_name");
      expect(results[0]).toHaveProperty("stargazers_count");
    }
  });
});
