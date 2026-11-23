"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  GitCompare,
  Star,
  GitFork,
  CircleDot,
  TrendingUp,
  Layers,
  ArrowRight,
  Sparkles,
  Bot,
  ExternalLink,
  Check,
} from "lucide-react";
import { fetchGraphQL } from "@/lib/graphql/client";
import { sampleRepositories } from "@/lib/sample-data";
import type { Repository } from "@/types";

const COMPARE_QUERY = /* GraphQL */ `
  query CompareData($ids: [ID!]!) {
    compareRepositories(ids: $ids) {
      repositories {
        id
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
          architecture
          useCases
          beginnerTake
        }
      }
    }
  }
`;

const ALL_REPOS_QUERY = /* GraphQL */ `
  query GetAllRepos {
    searchRepositories(limit: 50) {
      id
      fullName
      primaryLanguage
      stars
    }
  }
`;

function CompareContent() {
  const searchParams = useSearchParams();
  const repo1Param = searchParams.get("repo1");

  const [availableRepos, setAvailableRepos] = useState<any[]>(sampleRepositories);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparedRepos, setComparedRepos] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load repo list
  useEffect(() => {
    fetchGraphQL(ALL_REPOS_QUERY)
      .then((res) => {
        if (res.data?.searchRepositories && res.data.searchRepositories.length > 0) {
          setAvailableRepos(res.data.searchRepositories);
          // Default selection: first 2 or query param
          if (repo1Param) {
            setSelectedIds([repo1Param, res.data.searchRepositories[1]?.id].filter(Boolean));
          } else {
            setSelectedIds([
              res.data.searchRepositories[0]?.id,
              res.data.searchRepositories[1]?.id,
            ].filter(Boolean));
          }
        } else {
          setSelectedIds([sampleRepositories[0].id, sampleRepositories[1].id]);
        }
      })
      .catch(() => {
        setSelectedIds([sampleRepositories[0].id, sampleRepositories[1].id]);
      });
  }, [repo1Param]);

  // Fetch comparison data when selectedIds changes
  useEffect(() => {
    if (selectedIds.length === 0) return;
    setIsLoading(true);

    fetchGraphQL(COMPARE_QUERY, { ids: selectedIds })
      .then((res) => {
        if (res.data?.compareRepositories?.repositories) {
          const mapped: Repository[] = res.data.compareRepositories.repositories.map((r: any) => ({
            id: r.id,
            githubId: 0,
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
          setComparedRepos(mapped);
        } else {
          // Fallback to sample matching
          const matched = sampleRepositories.filter((r) => selectedIds.includes(r.id));
          setComparedRepos(matched.length > 0 ? matched : sampleRepositories.slice(0, 2));
        }
      })
      .catch(() => {
        const matched = sampleRepositories.filter((r) => selectedIds.includes(r.id));
        setComparedRepos(matched.length > 0 ? matched : sampleRepositories.slice(0, 2));
      })
      .finally(() => setIsLoading(false));
  }, [selectedIds]);

  const toggleRepoSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      } else {
        setSelectedIds([selectedIds[1], selectedIds[2], id]);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Side-by-Side Repository Comparison
          </h1>
          <span className="demo-badge">Multi-Dimensional</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare technical architecture, momentum velocity, community traction, and AI evaluations.
        </p>
      </div>

      {/* Repository Selector Chips */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Select 2 or 3 Repositories to Compare:
        </div>
        <div className="flex flex-wrap gap-2">
          {availableRepos.map((r) => {
            const isSelected = selectedIds.includes(r.id);
            return (
              <button
                key={r.id}
                onClick={() => toggleRepoSelection(r.id)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border-border bg-background text-foreground hover:bg-accent"
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5" />}
                <span>{r.fullName}</span>
                <span className="opacity-70 text-[10px]">
                  ({(r.stars / 1000).toFixed(0)}k ★)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-[700px]">
          {comparedRepos.map((repo) => (
            <div
              key={repo.id}
              className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground">{repo.owner}</span>
                    <h2 className="text-lg font-bold text-foreground">{repo.name}</h2>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <TrendingUp className="h-3 w-3" />
                    <span>Score: {repo.trendingScore}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {repo.description || "No description provided."}
                </p>

                {/* Primary Metric Grid */}
                <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-background p-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Stars</span>
                    <span className="font-bold text-foreground">
                      {repo.stars.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Forks</span>
                    <span className="font-bold text-foreground">
                      {repo.forks.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground block text-[11px]">Language</span>
                    <span className="font-bold text-foreground">
                      {repo.language || "Unknown"}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground block text-[11px]">Star Velocity</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      +{repo.starGrowth} growth
                    </span>
                  </div>
                </div>

                {/* AI Architectural Summary */}
                <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-primary">
                    <Bot className="h-3.5 w-3.5" />
                    <span>AI Architectural Profile</span>
                  </div>
                  <p className="text-foreground/80 leading-relaxed">
                    {repo.aiSummary ||
                      "Engineered with modular open source conventions. Optimized for community collaboration and production scalability."}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-border">
                <Link
                  href={`/repos/${repo.id}`}
                  className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <span>Inspect Full Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
          Loading comparison engine...
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}

