"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  sampleRepositories,
  sampleDashboardStats,
  sampleLanguageStats,
  sampleTopicStats,
  sampleTrendingData,
  sampleActivityData,
} from "@/lib/sample-data";
import { fetchGraphQL } from "@/lib/graphql/client";
import { StatCard } from "@/components/dashboard/stat-card";
import { RepoCard } from "@/components/dashboard/repo-card";
import { TrendingChart } from "@/components/dashboard/trending-chart";
import { LanguageChart } from "@/components/dashboard/language-chart";
import { TopicCloud } from "@/components/dashboard/topic-cloud";
import {
  FolderGit2,
  Star,
  Code2,
  Hash,
  TrendingUp,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Flame,
  RefreshCw,
  Database,
  Network,
  Bot,
  AlertCircle,
} from "lucide-react";
import type { Repository, DashboardStats, LanguageStat, TopicStat } from "@/types";

const DASHBOARD_GRAPHQL_QUERY = /* GraphQL */ `
  query GetDashboardData($query: String, $language: String, $sortBy: String) {
    repositoryStats {
      totalRepos
      totalStars
      totalLanguages
      totalTopics
      recentlyAdded
    }
    trendingTopics(limit: 15) {
      topic
      count
    }
    languageStats {
      language
      count
      percentage
    }
    searchRepositories(
      query: $query
      language: $language
      sortBy: $sortBy
      limit: 30
    ) {
      id
      githubId
      fullName
      owner
      name
      description
      url
      homepage
      stars
      forks
      openIssues
      primaryLanguage
      license
      defaultBranch
      isArchived
      isFork
      githubCreatedAt
      githubUpdatedAt
      githubPushedAt
      trendingScore
      starGrowth
      topics {
        name
      }
      summary {
        summary
        beginnerTake
      }
    }
  }
`;

export default function DashboardPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"trending" | "stars" | "growth" | "forks">("trending");

  // Live GraphQL state
  const [repositories, setRepositories] = useState<Repository[]>(sampleRepositories);
  const [stats, setStats] = useState<DashboardStats>(sampleDashboardStats);
  const [langStats, setLangStats] = useState<LanguageStat[]>(sampleLanguageStats);
  const [topicStats, setTopicStats] = useState<TopicStat[]>(sampleTopicStats);
  const [isUsingGraphQL, setIsUsingGraphQL] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSearchingGitHub, setIsSearchingGitHub] = useState<boolean>(false);
  const [searchNotification, setSearchNotification] = useState<string | null>(null);

  // Fetch data from GraphQL API
  const loadData = async (silent = false, queryToUse = searchQuery) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetchGraphQL(DASHBOARD_GRAPHQL_QUERY, {
        query: queryToUse.trim() || undefined,
        language: selectedLanguage !== "all" ? selectedLanguage : undefined,
        sortBy,
      });

      if (res.data?.searchRepositories) {
        // Transform GraphQL response to Repository model with transparent provenance
        const mapped: Repository[] = res.data.searchRepositories.map((r: any) => {
          let dataSource: "live" | "cached" | "demo" = "cached";
          let sourceLabel = "Database Cache";

          if (r.id?.startsWith("demo-")) {
            dataSource = "demo";
            sourceLabel = "Demo Data";
          } else if (r.summary?.modelName === "baseline-catalog") {
            dataSource = "cached";
            sourceLabel = "Seeded Data";
          } else {
            dataSource = "live";
            sourceLabel = "GitHub Synced";
          }

          return {
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
            topics: r.topics ? r.topics.map((t: any) => t.name) : [],
            createdAt: r.githubCreatedAt,
            updatedAt: r.githubUpdatedAt,
            pushedAt: r.githubPushedAt,
            defaultBranch: r.defaultBranch || "main",
            isArchived: r.isArchived ?? false,
            isFork: r.isFork ?? false,
            trendingScore: r.trendingScore,
            starGrowth: r.starGrowth,
            aiSummary: r.summary?.summary,
            dataSource,
            sourceLabel,
          };
        });

        setRepositories(mapped);
        setIsUsingGraphQL(true);

        if (res.data.repositoryStats) {
          setStats(res.data.repositoryStats);
        }
        if (res.data.languageStats && res.data.languageStats.length > 0) {
          setLangStats(res.data.languageStats);
        }
        if (res.data.trendingTopics && res.data.trendingTopics.length > 0) {
          setTopicStats(res.data.trendingTopics);
        }
      }
    } catch (e) {
      console.warn("GraphQL fetch failed, using fallback data:", e);
      setIsUsingGraphQL(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedLanguage, sortBy]);

  // Handle local database search submission (Button click or Enter key)
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchNotification(null);
    setSearchQuery(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setSearchNotification(null);
  };

  // Live GitHub discovery search fallback
  const handleSearchGitHubLive = async () => {
    const q = (searchInput || searchQuery).trim();
    if (!q) return;

    setIsSearchingGitHub(true);
    setSearchNotification(null);

    try {
      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, limit: 10 }),
      });

      const data = await res.json();
      if (data.success && data.repositories) {
        setSearchNotification(
          `Discovered ${data.count} repositories directly on GitHub and synced them to your database!`
        );
        // Refresh local GraphQL data with the query
        setSearchQuery(q);
        await loadData(false, q);
      } else {
        setSearchNotification(data.error || `No repositories found on GitHub for "${q}".`);
      }
    } catch (err: any) {
      setSearchNotification(`GitHub search failed: ${err.message}`);
    } finally {
      setIsSearchingGitHub(false);
    }
  };

  // Available languages list
  const languages = useMemo(() => {
    const set = new Set<string>();
    repositories.forEach((r) => {
      if (r.language) set.add(r.language);
    });
    return Array.from(set).sort();
  }, [repositories]);

  // Client-side topic filter (topic filtering is snappy in memory)
  const filteredRepos = useMemo(() => {
    if (selectedTopic === "all") return repositories;
    return repositories.filter((r) => r.topics.includes(selectedTopic));
  }, [repositories, selectedTopic]);

  // Top trending highlight
  const topTrending = useMemo(() => {
    return [...repositories]
      .sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0))
      .slice(0, 3);
  }, [repositories]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Repository Intelligence Dashboard
            </h1>
            {isUsingGraphQL ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                GraphQL + SQLite Live
              </span>
            ) : (
              <span className="demo-badge">Connecting to GraphQL...</span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Track open source trajectory, momentum scores, language analytics & AI summaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSearchGitHubLive}
            disabled={isSearchingGitHub}
            title="Search GitHub live and import matching repositories"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span>{isSearchingGitHub ? "Syncing..." : "Live GitHub Crawl"}</span>
          </button>
          <Link
            href="/api/graphql"
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Network className="h-3.5 w-3.5 text-primary" />
            <span>GraphiQL IDE</span>
          </Link>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <Link
            href="/chat"
            className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/90 transition-colors"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Ask AI Assistant</span>
          </Link>
        </div>
      </div>

      {/* AI Intelligence Spotlight Banner */}
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Bot className="h-4 w-4" />
              <span>Trending Radar Insight</span>
            </div>
            <p className="text-xs text-foreground/80 max-w-2xl leading-relaxed">
              AI agent ecosystems and Model Context Protocol (MCP) integrations are experiencing the highest relative growth this week (+800% star acceleration). Repositories like <code className="bg-primary/10 px-1 py-0.5 rounded font-mono font-semibold">ollama/ollama</code> and <code className="bg-primary/10 px-1 py-0.5 rounded font-mono font-semibold">modelcontextprotocol/typescript-sdk</code> dominate momentum indicators.
            </p>
          </div>
          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline shrink-0"
          >
            <span>Compare top AI frameworks</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Repositories Monitored"
          value={stats.totalRepos}
          icon={FolderGit2}
          description="High-signal open source projects"
          trend={{ value: 18, label: "vs last month", isPositive: true }}
        />
        <StatCard
          title="Aggregated Stars"
          value={stats.totalStars}
          icon={Star}
          description="Community appreciation total"
          trend={{ value: 12.4, label: "momentum increase", isPositive: true }}
        />
        <StatCard
          title="Active Languages"
          value={stats.totalLanguages}
          icon={Code2}
          description="JavaScript, TypeScript, Rust, Go..."
        />
        <StatCard
          title="Tracked Topics & Tags"
          value={stats.totalTopics}
          icon={Hash}
          description="AI, GraphQL, ORM, Web, MCP"
        />
      </div>

      {/* Charts Section: Trending & Language Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendingChart
            data={sampleTrendingData}
            title="Aggregated Repository Momentum (Weekly Velocity)"
            subtitle="Calculated trajectory based on snapshot momentum algorithms"
            badge="Simulated Sample"
            color="#2563eb"
            height={240}
          />
        </div>
        <div className="lg:col-span-1">
          <LanguageChart data={langStats} />
        </div>
      </div>

      {/* Quick Spotlight: Top 3 Trending */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-foreground">Top Momentum Repositories</h2>
          </div>
          <span className="text-xs text-muted-foreground">Calculated with RepoRadar Trending Index</span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {topTrending.map((repo) => (
            <RepoCard key={repo.id} repo={repo} showTrending={true} />
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        {searchNotification && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-between">
            <span>{searchNotification}</span>
            <button
              onClick={() => setSearchNotification(null)}
              className="font-bold ml-2 text-emerald-700 hover:text-emerald-900"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search repository by name, owner, description or topic..."
                className="w-full rounded-lg border border-border bg-background pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm font-bold"
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
            </button>

            <button
              type="button"
              onClick={handleSearchGitHubLive}
              disabled={isSearchingGitHub || !searchInput.trim()}
              title="Crawl GitHub directly for this query and sync matching repositories into database"
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors disabled:opacity-40 shrink-0"
            >
              {isSearchingGitHub ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-500" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              )}
              <span>Crawl GitHub</span>
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3">
            {/* Language filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Languages</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort order */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="trending">Momentum Score</option>
                <option value="stars">Total Stars</option>
                <option value="growth">Recent Star Growth</option>
                <option value="forks">Fork Count</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info & Quick Topic Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredRepos.length}</span> repositories
            {isUsingGraphQL && (
              <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-medium">
                (Queried live via GraphQL)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
            <span className="text-muted-foreground mr-1">Filter topic:</span>
            <button
              onClick={() => setSelectedTopic("all")}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                selectedTopic === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              All
            </button>
            {["ai", "mcp", "typescript", "react", "rust", "database"].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTopic(selectedTopic === t ? "all" : t)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  selectedTopic === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Repository Cards Grid */}
      {filteredRepos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRepos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card/40 space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <h3 className="text-sm font-semibold text-foreground">
            {searchQuery
              ? `No repositories found matching "${searchQuery}" in local database`
              : "No repositories found"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            {searchQuery
              ? `You can crawl GitHub live to discover, import, and index "${searchQuery}" directly into RepoRadar.`
              : "Try adjusting your search criteria or reset filters to view all projects."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {searchQuery && (
              <button
                onClick={handleSearchGitHubLive}
                disabled={isSearchingGitHub}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 disabled:opacity-50 transition-colors"
              >
                {isSearchingGitHub ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span>Search GitHub Live for &quot;{searchQuery}&quot;</span>
              </button>
            )}
            <button
              onClick={() => {
                handleClearSearch();
                setSelectedLanguage("all");
                setSelectedTopic("all");
              }}
              className="rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Bottom Topic Cloud & Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopicCloud data={topicStats} />
        </div>
        <div className="lg:col-span-1">
          <TrendingChart
            data={sampleActivityData}
            title="Repository Release Activity"
            subtitle="Cadence and push frequency tracking"
            badge="Illustrative Sample"
            color="#8b5cf6"
            height={180}
          />
        </div>
      </div>
    </div>
  );
}
