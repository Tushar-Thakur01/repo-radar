"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Database,
  Terminal,
} from "lucide-react";
import { RepoCard } from "@/components/dashboard/repo-card";
import type { Repository } from "@/types";

const DISCOVERY_PRESETS = [
  {
    id: "mcp",
    name: "Model Context Protocol (MCP)",
    description: "Tools, servers, and clients implementing Anthropic's open MCP standard.",
    topic: "mcp",
    icon: Terminal,
    color: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: "ai-agents",
    name: "Autonomous AI Agents",
    description: "Next-generation LLM agents, memory pipelines, and tool orchestration.",
    topic: "agents",
    query: "ai agents",
    icon: Cpu,
    color: "from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    id: "devtools-rust",
    name: "Rust Developer Tooling",
    description: "Blazing fast linters, bundlers, compilers, and CLI developer utilities.",
    language: "Rust",
    topic: "developer-tools",
    icon: Layers,
    color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    id: "database",
    name: "Modern Databases & ORMs",
    description: "Postgres extensions, vector indexes, embedded databases, and type-safe ORMs.",
    topic: "database",
    icon: Database,
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
  },
];

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("all");
  const [isRunning, setIsRunning] = useState(false);
  const [rateLimit, setRateLimit] = useState<{ limit: number; remaining: number } | null>(null);
  const [discoveredRepos, setDiscoveredRepos] = useState<Repository[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Check rate limit on mount
  useEffect(() => {
    fetch("/api/discover")
      .then((res) => res.json())
      .then((data) => {
        if (data.rateLimit) setRateLimit(data.rateLimit);
      })
      .catch(() => {});
  }, []);

  const handleRunDiscovery = async (customOptions?: { query?: string; topic?: string; language?: string }) => {
    setIsRunning(true);
    setNotification(null);

    const payload = {
      query: customOptions?.query ?? (query.trim() || undefined),
      topic: customOptions?.topic ?? (topic.trim() || undefined),
      language:
        customOptions?.language ?? (language !== "all" ? language : undefined),
      limit: 8,
    };

    try {
      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.rateLimit) setRateLimit(data.rateLimit);

      if (data.success && data.repositories) {
        setNotification(
          `Successfully discovered & synced ${data.count} repositories to your SQLite database!`
        );
        // Map discovered repos
        const mapped: Repository[] = data.repositories.map((r: any) => ({
          id: r.id,
          githubId: r.githubId,
          fullName: r.fullName,
          owner: r.owner,
          name: r.name,
          description: r.description,
          url: r.url,
          homepage: r.homepage,
          stars: r.stars,
          forks: r.forks,
          openIssues: r.openIssues,
          language: r.primaryLanguage,
          license: r.license,
          topics: [],
          createdAt: r.githubCreatedAt,
          updatedAt: r.githubUpdatedAt,
          pushedAt: r.githubPushedAt,
          defaultBranch: r.defaultBranch || "main",
          isArchived: r.isArchived ?? false,
          isFork: r.isFork ?? false,
          trendingScore: r.trendingScore,
          starGrowth: r.starGrowth,
        }));
        setDiscoveredRepos(mapped);
      } else {
        setNotification(data.error || "No new repositories found for this query.");
      }
    } catch (err: any) {
      setNotification(`Discovery error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Automated Repository Discovery Engine
            </h1>
            <span className="demo-badge">Real GitHub API</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Crawl, index, and score emerging open-source repositories by category, topic, or language.
          </p>
        </div>

        {/* Rate limit status pill */}
        {rateLimit && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs">
            <GitBranch className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">GitHub API:</span>
            <span className="font-mono font-bold text-foreground">
              {rateLimit.remaining} / {rateLimit.limit}
            </span>
            <span className="text-[10px] text-muted-foreground">calls remaining</span>
          </div>
        )}
      </div>

      {/* Discovery Presets */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          High-Velocity Discovery Channels
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DISCOVERY_PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                onClick={() =>
                  handleRunDiscovery({
                    query: preset.query,
                    topic: preset.topic,
                    language: preset.language,
                  })
                }
                disabled={isRunning}
                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 text-left shadow-xs transition-all hover:border-primary/30 hover:shadow-md disabled:opacity-50"
              >
                <div>
                  <div
                    className={`inline-flex rounded-lg bg-linear-to-br p-2.5 ${preset.color} mb-3`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {preset.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <span>Run Discovery</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Discovery Query Builder */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-foreground">Custom Search Parameters</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Keywords or Search Phrase
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. web assembly, vector database"
                className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              GitHub Topic Tag
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. mcp, llm, graphql, rust"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Primary Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              <option value="all">Any Language</option>
              <option value="TypeScript">TypeScript</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Rust">Rust</option>
              <option value="Go">Go</option>
              <option value="C++">C++</option>
              <option value="Ruby">Ruby</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Discovered items are deduplicated and saved to your SQLite database automatically with fresh snapshots.
          </p>
          <button
            onClick={() => handleRunDiscovery()}
            disabled={isRunning}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "Crawling GitHub..." : "Execute Discovery"}</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Newly Discovered Repositories Section */}
      {discoveredRepos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Recently Discovered Repositories ({discoveredRepos.length})
              </h2>
            </div>
            <Link
              href="/"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View in Main Dashboard</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {discoveredRepos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} showTrending={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
