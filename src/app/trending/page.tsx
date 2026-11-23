"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Flame,
  Zap,
  Clock,
  Sparkles,
  Star,
  GitFork,
  ArrowRight,
  Info,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { fetchGraphQL } from "@/lib/graphql/client";
import { sampleRepositories } from "@/lib/sample-data";
import { RepoCard } from "@/components/dashboard/repo-card";
import type { Repository } from "@/types";

const TRENDING_PAGE_QUERY = /* GraphQL */ `
  query GetTrendingPage($language: String) {
    trendingRepositories(limit: 20, language: $language) {
      id
      githubId
      fullName
      owner
      name
      description
      url
      stars
      forks
      openIssues
      primaryLanguage
      license
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

export default function TrendingPage() {
  const [repos, setRepos] = useState<Repository[]>(sampleRepositories);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    fetchGraphQL(TRENDING_PAGE_QUERY, {
      language: selectedLanguage !== "all" ? selectedLanguage : undefined,
    })
      .then((res) => {
        if (res.data?.trendingRepositories) {
          const mapped: Repository[] = res.data.trendingRepositories.map((r: any) => ({
            id: r.id,
            githubId: r.githubId,
            fullName: r.fullName,
            owner: r.owner,
            name: r.name,
            description: r.description,
            url: r.url,
            homepage: null,
            stars: r.stars,
            forks: r.forks,
            openIssues: r.openIssues,
            language: r.primaryLanguage,
            license: r.license,
            topics: r.topics ? r.topics.map((t: any) => t.name) : [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            pushedAt: new Date().toISOString(),
            defaultBranch: "main",
            isArchived: false,
            isFork: false,
            trendingScore: r.trendingScore,
            starGrowth: r.starGrowth,
            aiSummary: r.summary?.summary,
          }));
          setRepos(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [selectedLanguage]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Trending Velocity Index
            </h1>
            <span className="demo-badge">Autonomous Ranking</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Ranked by star acceleration, recent push frequency, and community expansion.
          </p>
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Filter by Language:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Ecosystems</option>
            <option value="TypeScript">TypeScript</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="Rust">Rust</option>
            <option value="Go">Go</option>
          </select>
        </div>
      </div>

      {/* Algorithm Transparency Card */}
      <div className="rounded-xl border border-primary/20 bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <ShieldCheck className="h-4 w-4" />
          <span>How the RepoRadar Trending Score is Calculated</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Unlike opaque third-party scrapers, RepoRadar computes an open and explainable momentum score from verifiable metrics:
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-1">
          <div className="rounded-lg border border-border bg-background p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">1. Star Delta (45%)</span>
              <span className="text-[10px] font-mono text-primary font-semibold">Weight: 0.45</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Rate of new stars gained across historical snapshot intervals in our database.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-background p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">2. Push Recency (30%)</span>
              <span className="text-[10px] font-mono text-primary font-semibold">Weight: 0.30</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Exponential decay curve penalizing repositories without active commits or releases.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-background p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">3. Popularity Baseline (25%)</span>
              <span className="text-[10px] font-mono text-primary font-semibold">Weight: 0.25</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Logarithmic star scale preventing micro-repos with 1 star from artificially topping the leaderboard.
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Top Trending Repositories ({repos.length})
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo, idx) => (
            <div key={repo.id} className="relative">
              <div className="absolute -top-2.5 -left-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-md">
                #{idx + 1}
              </div>
              <RepoCard repo={repo} showTrending={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
