// Shared MCP Tool definitions and execution logic for RepoRadar
// Used by both the Stdio MCP Server and the Web API Route /api/mcp

import { prisma } from "./prisma";

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export const MCP_TOOLS_SPEC: McpToolDefinition[] = [
  {
    name: "get_trending_repositories",
    description: "Retrieve top trending open-source repositories ranked by RepoRadar's velocity index.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum repositories to return (default: 5, max: 20)",
        },
        language: {
          type: "string",
          description: "Optional programming language filter (e.g. TypeScript, Python, Rust)",
        },
      },
    },
  },
  {
    name: "search_repositories",
    description: "Search repositories in the intelligence database by keyword, topic, or language.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search keywords matching repository name, owner, or description",
        },
        language: {
          type: "string",
          description: "Language filter",
        },
        topic: {
          type: "string",
          description: "Topic tag filter (e.g. mcp, ai, react, rust)",
        },
        limit: {
          type: "number",
          description: "Maximum results (default: 5)",
        },
      },
    },
  },
  {
    name: "get_repository_details",
    description: "Fetch full details, metric snapshots, topics, and licensing for a repository.",
    inputSchema: {
      type: "object",
      properties: {
        fullName: {
          type: "string",
          description: "Full repository name (e.g. 'facebook/react' or 'ollama/ollama')",
        },
      },
      required: ["fullName"],
    },
  },
  {
    name: "get_repository_summary",
    description: "Retrieve AI-generated technical summary, architecture profile, and beginner breakdown for a repository.",
    inputSchema: {
      type: "object",
      properties: {
        fullName: {
          type: "string",
          description: "Full repository name (e.g. 'vercel/next.js')",
        },
      },
      required: ["fullName"],
    },
  },
  {
    name: "compare_repositories",
    description: "Compare metrics, momentum scores, and architectures of two or more repositories side-by-side.",
    inputSchema: {
      type: "object",
      properties: {
        fullNames: {
          type: "array",
          items: { type: "string" },
          description: "List of 2-3 full repository names to compare",
        },
      },
      required: ["fullNames"],
    },
  },
  {
    name: "get_repository_activity",
    description: "Retrieve historical star and fork growth snapshots over time for a repository.",
    inputSchema: {
      type: "object",
      properties: {
        fullName: {
          type: "string",
          description: "Full repository name",
        },
      },
      required: ["fullName"],
    },
  },
  {
    name: "find_repositories_by_topic",
    description: "Discover repositories associated with a specific ecosystem topic (e.g. mcp, ai, agents, database).",
    inputSchema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "Topic tag name",
        },
        limit: {
          type: "number",
          description: "Maximum repositories to return (default: 10)",
        },
      },
      required: ["topic"],
    },
  },
  {
    name: "get_trending_topics",
    description: "List the most frequent open source topics and tags across monitored repositories.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of top topics to return (default: 10)",
        },
      },
    },
  },
  {
    name: "get_language_statistics",
    description: "Get the distribution and market share percentage of programming languages across repositories.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

export async function executeMcpTool(name: string, args: Record<string, any> = {}) {
  switch (name) {
    case "get_trending_repositories": {
      const limit = typeof args?.limit === "number" ? args.limit : 5;
      const language = typeof args?.language === "string" ? args.language : undefined;

      const where: any = {};
      if (language && language !== "all") {
        where.primaryLanguage = language;
      }

      const repos = await prisma.repository.findMany({
        where,
        orderBy: { trendingScore: "desc" },
        take: limit,
        select: {
          fullName: true,
          stars: true,
          forks: true,
          primaryLanguage: true,
          trendingScore: true,
          starGrowth: true,
          description: true,
        },
      });

      return {
        content: [{ type: "text", text: JSON.stringify(repos, null, 2) }],
      };
    }

    case "search_repositories": {
      const query = typeof args?.query === "string" ? args.query.trim() : "";
      const language = typeof args?.language === "string" ? args.language : undefined;
      const topic = typeof args?.topic === "string" ? args.topic : undefined;
      const limit = typeof args?.limit === "number" ? args.limit : 5;

      const where: any = {};
      if (query) {
        where.OR = [
          { fullName: { contains: query } },
          { name: { contains: query } },
          { owner: { contains: query } },
          { description: { contains: query } },
          { primaryLanguage: { contains: query } },
        ];
      }
      if (language && language !== "all") {
        where.primaryLanguage = language;
      }
      if (topic) {
        where.topics = { some: { name: topic.toLowerCase() } };
      }

      const results = await prisma.repository.findMany({
        where,
        take: limit,
        orderBy: { stars: "desc" },
        select: {
          fullName: true,
          stars: true,
          primaryLanguage: true,
          trendingScore: true,
          description: true,
          url: true,
        },
      });

      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }

    case "get_repository_details": {
      const fullName = String(args?.fullName || "");
      const repo = await prisma.repository.findUnique({
        where: { fullName },
        include: {
          topics: true,
          snapshots: { orderBy: { capturedAt: "asc" }, take: 5 },
          summary: true,
        },
      });

      if (!repo) {
        return {
          content: [{ type: "text", text: `Repository "${fullName}" was not found in the RepoRadar database.` }],
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(repo, null, 2) }],
      };
    }

    case "get_repository_summary": {
      const fullName = String(args?.fullName || "");
      const repo = await prisma.repository.findUnique({
        where: { fullName },
        include: { summary: true },
      });

      if (!repo || !repo.summary) {
        return {
          content: [{ type: "text", text: `No AI summary available for "${fullName}".` }],
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(repo.summary, null, 2) }],
      };
    }

    case "compare_repositories": {
      const fullNames = Array.isArray(args?.fullNames) ? args.fullNames : [];
      const repos = await prisma.repository.findMany({
        where: { fullName: { in: fullNames } },
        include: { summary: true, topics: true },
      });

      const comparison = repos.map((r) => ({
        fullName: r.fullName,
        stars: r.stars,
        forks: r.forks,
        openIssues: r.openIssues,
        language: r.primaryLanguage,
        trendingScore: r.trendingScore,
        starGrowth: r.starGrowth,
        architecture: r.summary?.architecture || "Not specified",
        beginnerTake: r.summary?.beginnerTake || r.description,
      }));

      return {
        content: [{ type: "text", text: JSON.stringify(comparison, null, 2) }],
      };
    }

    case "get_repository_activity": {
      const fullName = String(args?.fullName || "");
      const repo = await prisma.repository.findUnique({
        where: { fullName },
        include: {
          snapshots: { orderBy: { capturedAt: "asc" } },
        },
      });

      if (!repo) {
        return {
          content: [{ type: "text", text: `Repository "${fullName}" not found.` }],
        };
      }

      const activity = repo.snapshots.map((s) => ({
        capturedAt: s.capturedAt,
        stars: s.stars,
        forks: s.forks,
        openIssues: s.openIssues,
      }));

      return {
        content: [{ type: "text", text: JSON.stringify({ repository: fullName, snapshots: activity }, null, 2) }],
      };
    }

    case "find_repositories_by_topic": {
      const topic = String(args?.topic || "").toLowerCase();
      const limit = typeof args?.limit === "number" ? args.limit : 10;

      const repos = await prisma.repository.findMany({
        where: {
          topics: { some: { name: topic } },
        },
        take: limit,
        orderBy: { stars: "desc" },
        select: {
          fullName: true,
          stars: true,
          primaryLanguage: true,
          trendingScore: true,
          description: true,
        },
      });

      return {
        content: [{ type: "text", text: JSON.stringify({ topic, count: repos.length, repositories: repos }, null, 2) }],
      };
    }

    case "get_trending_topics": {
      const limit = typeof args?.limit === "number" ? args.limit : 10;
      const topics = await prisma.repoTopic.findMany({
        select: { name: true },
      });

      const frequency: Record<string, number> = {};
      for (const t of topics) {
        frequency[t.name] = (frequency[t.name] || 0) + 1;
      }

      const sorted = Object.entries(frequency)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return {
        content: [{ type: "text", text: JSON.stringify(sorted, null, 2) }],
      };
    }

    case "get_language_statistics": {
      const repos = await prisma.repository.findMany({
        select: { primaryLanguage: true },
      });

      const total = repos.length;
      const counts: Record<string, number> = {};
      for (const r of repos) {
        if (r.primaryLanguage) {
          counts[r.primaryLanguage] = (counts[r.primaryLanguage] || 0) + 1;
        }
      }

      const stats = Object.entries(counts)
        .map(([language, count]) => ({
          language,
          count,
          percentage: Math.round((count / (total || 1)) * 100),
        }))
        .sort((a, b) => b.count - a.count);

      return {
        content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
