// Repository card — shows a single repo in the dashboard grid
"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Star,
  GitFork,
  CircleDot,
  ExternalLink,
  TrendingUp,
  Clock,
} from "lucide-react";
import type { Repository } from "@/types";

interface RepoCardProps {
  repo: Repository;
  compact?: boolean;
  showTrending?: boolean;
  className?: string;
}

export function RepoCard({
  repo,
  compact = false,
  showTrending = true,
  className,
}: RepoCardProps) {
  const languageColors: Record<string, string> = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Rust: "#dea584",
    Go: "#00ADD8",
    Ruby: "#701516",
    Java: "#b07219",
    "C++": "#f34b7d",
    C: "#555555",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
  };

  return (
    <Link
      href={`/repos/${repo.id}`}
      className={cn(
        "group block rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-all",
        "hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <img
              src={`https://github.com/${repo.owner}.png?size=32`}
              alt={repo.owner}
              className="h-6 w-6 rounded-full border bg-muted"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <h3 className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
              {repo.owner}/<span className="font-bold">{repo.name}</span>
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {repo.sourceLabel && (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[9px] font-medium tracking-wide",
                repo.dataSource === "live"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/50"
                  : repo.dataSource === "demo"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/50"
                  : "bg-secondary text-secondary-foreground border border-border"
              )}
            >
              {repo.sourceLabel}
            </span>
          )}
          {showTrending && repo.trendingScore && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                repo.trendingScore >= 80
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : repo.trendingScore >= 50
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <TrendingUp className="h-3 w-3" />
              {repo.trendingScore}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {!compact && repo.description && (
        <p className="mt-2.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {repo.description}
        </p>
      )}

      {/* Topics */}
      {!compact && repo.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
            >
              {topic}
            </span>
          ))}
          {repo.topics.length > 4 && (
            <span className="inline-flex items-center text-[11px] text-muted-foreground">
              +{repo.topics.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-full border"
              style={{
                backgroundColor:
                  languageColors[repo.language] || "#64748b",
              }}
            />
            <span>{repo.language}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5" />
          <span>{formatNumber(repo.stars)}</span>
        </div>
        <div className="flex items-center gap-1">
          <GitFork className="h-3.5 w-3.5" />
          <span>{formatNumber(repo.forks)}</span>
        </div>
        <div className="flex items-center gap-1">
          <CircleDot className="h-3.5 w-3.5" />
          <span>{formatNumber(repo.openIssues)}</span>
        </div>
        {repo.starGrowth && repo.starGrowth > 0 && (
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 ml-auto">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+{formatNumber(repo.starGrowth)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}
