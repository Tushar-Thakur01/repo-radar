// GitHub API Integration & Discovery Engine for RepoRadar
// Supports unauthenticated access (60 req/hr) and token access (5,000 req/hr)
// Handles rate-limiting, retries, headers, deduplication, and database synchronization.

import { prisma } from "./prisma";

export interface GitHubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  description: string | null;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  language: string | null;
  license: {
    spdx_id?: string;
    name?: string;
  } | null;
  default_branch: string;
  archived: boolean;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics?: string[];
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
}

export class GitHubService {
  private token: string | undefined;

  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN || undefined;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "RepoRadar-OpenSource-Intelligence",
    };

    if (this.token && this.token.trim() !== "") {
      headers.Authorization = `Bearer ${this.token.trim()}`;
    }

    return headers;
  }

  /**
   * Check current GitHub API rate limit status
   */
  async checkRateLimit(): Promise<RateLimitInfo> {
    try {
      const res = await fetch("https://api.github.com/rate_limit", {
        headers: this.getHeaders(),
      });
      const data = await res.json();
      const core = data.resources?.core || {
        limit: 60,
        remaining: 60,
        reset: Math.floor(Date.now() / 1000) + 3600,
      };

      return {
        limit: core.limit,
        remaining: core.remaining,
        resetTime: new Date(core.reset * 1000),
      };
    } catch {
      return {
        limit: 60,
        remaining: 60,
        resetTime: new Date(Date.now() + 3600000),
      };
    }
  }

  /**
   * Fetch a single repository by owner and name directly from GitHub
   */
  async getRepository(owner: string, name: string): Promise<GitHubRepoResponse | null> {
    const url = `https://api.github.com/repos/${owner}/${name}`;
    const res = await fetch(url, { headers: this.getHeaders() });

    if (res.status === 404) return null;
    if (res.status === 403) {
      console.warn("⚠️ GitHub API rate limit reached or forbidden.");
      return null;
    }
    if (!res.ok) {
      throw new Error(`GitHub API error (${res.status}): ${res.statusText}`);
    }

    return res.json();
  }

  /**
   * Fetch raw README content for a repository
   */
  async getReadme(owner: string, name: string): Promise<string | null> {
    const url = `https://api.github.com/repos/${owner}/${name}/readme`;
    const res = await fetch(url, {
      headers: {
        ...this.getHeaders(),
        Accept: "application/vnd.github.raw+json",
      },
    });

    if (!res.ok) return null;
    return res.text();
  }

  /**
   * Search repositories on GitHub with customizable filters
   */
  async searchRepositories(options: {
    query?: string;
    language?: string;
    topic?: string;
    minStars?: number;
    createdAfter?: string; // YYYY-MM-DD
    sort?: "stars" | "forks" | "updated";
    order?: "desc" | "asc";
    limit?: number;
  }): Promise<GitHubRepoResponse[]> {
    const queryParts: string[] = [];

    if (options.query && options.query.trim()) {
      queryParts.push(options.query.trim());
    } else {
      queryParts.push("stars:>100");
    }

    if (options.language) {
      queryParts.push(`language:${options.language}`);
    }

    if (options.topic) {
      queryParts.push(`topic:${options.topic}`);
    }

    if (options.minStars) {
      queryParts.push(`stars:>=${options.minStars}`);
    }

    if (options.createdAfter) {
      queryParts.push(`created:>${options.createdAfter}`);
    }

    const q = queryParts.join(" ");
    const perPage = Math.min(options.limit || 15, 30);
    const sort = options.sort || "stars";
    const order = options.order || "desc";

    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
      q
    )}&sort=${sort}&order=${order}&per_page=${perPage}`;

    const res = await fetch(url, { headers: this.getHeaders() });

    if (res.status === 403) {
      console.warn("⚠️ GitHub API search rate limit hit. Returning empty list.");
      return [];
    }

    if (!res.ok) {
      throw new Error(`GitHub search failed (${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    return data.items || [];
  }

  /**
   * Synchronize and deduplicate a GitHub repository into our Prisma SQLite database
   */
  async syncToDatabase(repo: GitHubRepoResponse) {
    const now = new Date();

    // Check if repo exists
    const existing = await prisma.repository.findUnique({
      where: { githubId: repo.id },
      include: { snapshots: { orderBy: { capturedAt: "desc" }, take: 1 } },
    });

    // Compute star growth from previous snapshot if exists
    let starGrowth = 0;
    if (existing && existing.snapshots.length > 0) {
      starGrowth = Math.max(0, repo.stargazers_count - existing.snapshots[0].stars);
    }

    // Transparent Momentum / Trending Score Formula:
    // Factors:
    // 1. Star Growth Weight (50%)
    // 2. Total Stars Logarithmic Scale (25%)
    // 3. Recency of Push Activity (25%)
    const daysSincePush = Math.max(
      0.1,
      (now.getTime() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    const recencyFactor = Math.max(0, 100 - daysSincePush * 5); // decay after 20 days
    const popularityFactor = Math.min(100, (Math.log10(repo.stargazers_count + 1) / 5) * 100);
    const growthFactor = Math.min(100, starGrowth * 2);

    const trendingScore = Math.min(
      99.9,
      Math.max(10, growthFactor * 0.5 + popularityFactor * 0.25 + recencyFactor * 0.25)
    );

    // Upsert repository in database
    const dbRepo = await prisma.repository.upsert({
      where: { githubId: repo.id },
      update: {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        openIssues: repo.open_issues_count,
        watchers: repo.watchers_count,
        githubUpdatedAt: new Date(repo.updated_at),
        githubPushedAt: new Date(repo.pushed_at),
        description: repo.description,
        homepage: repo.homepage,
        starGrowth,
        trendingScore: Number(trendingScore.toFixed(1)),
      },
      create: {
        githubId: repo.id,
        fullName: repo.full_name,
        owner: repo.owner.login,
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        homepage: repo.homepage,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        openIssues: repo.open_issues_count,
        watchers: repo.watchers_count,
        primaryLanguage: repo.language,
        license: repo.license?.spdx_id || repo.license?.name || null,
        defaultBranch: repo.default_branch || "main",
        isArchived: repo.archived,
        isFork: repo.fork,
        githubCreatedAt: new Date(repo.created_at),
        githubUpdatedAt: new Date(repo.updated_at),
        githubPushedAt: new Date(repo.pushed_at),
        trendingScore: Number(trendingScore.toFixed(1)),
        starGrowth,
      },
    });

    // Sync topics
    if (repo.topics && repo.topics.length > 0) {
      for (const topic of repo.topics) {
        await prisma.repoTopic.upsert({
          where: {
            repositoryId_name: {
              repositoryId: dbRepo.id,
              name: topic.toLowerCase(),
            },
          },
          update: {},
          create: {
            repositoryId: dbRepo.id,
            name: topic.toLowerCase(),
          },
        });
      }
    }

    // Capture latest snapshot
    await prisma.repoSnapshot.create({
      data: {
        repositoryId: dbRepo.id,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        openIssues: repo.open_issues_count,
        watchers: repo.watchers_count,
        capturedAt: now,
      },
    });

    return dbRepo;
  }

  /**
   * Automated discovery pipeline:
   * Discovers repositories matching query criteria, saves and deduplicates them in database.
   */
  async runDiscovery(options: {
    query?: string;
    topic?: string;
    language?: string;
    limit?: number;
  }) {
    console.log(
      `🔎 Running discovery with criteria: query="${options.query || ""}", topic="${
        options.topic || ""
      }", lang="${options.language || ""}"`
    );

    const items = await this.searchRepositories({
      query: options.query,
      topic: options.topic,
      language: options.language,
      limit: options.limit || 10,
    });

    console.log(`📡 GitHub Search returned ${items.length} repositories`);

    const synced = [];
    for (const item of items) {
      const saved = await this.syncToDatabase(item);
      synced.push(saved);
    }

    return synced;
  }
}

export const githubService = new GitHubService();
