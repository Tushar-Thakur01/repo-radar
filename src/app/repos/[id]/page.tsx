import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { aiService } from "@/lib/ai";
import { githubService } from "@/lib/github";
import {
  Star,
  GitFork,
  CircleDot,
  Eye,
  ExternalLink,
  Calendar,
  Clock,
  Sparkles,
  Bot,
  TrendingUp,
  Shield,
  Layers,
  ArrowLeft,
  GitBranch,
  BookOpen,
} from "lucide-react";
import { TrendingChart } from "@/components/dashboard/trending-chart";

export const dynamic = "force-dynamic";

export default async function RepoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch repository with all relations from SQLite
  const repo = await prisma.repository.findFirst({
    where: {
      OR: [{ id }, { fullName: decodeURIComponent(id) }],
    },
    include: {
      topics: true,
      languages: true,
      snapshots: {
        orderBy: { capturedAt: "asc" },
      },
      summary: true,
      releases: true,
    },
  });

  if (!repo) {
    notFound();
  }

  // Ensure AI summary exists (generate if missing)
  let summary = repo.summary;
  if (!summary) {
    try {
      summary = (await aiService.analyzeRepository(repo.id)) as any;
    } catch {
      // ignore
    }
  }

  // Format snapshots for chart
  const snapshotData = repo.snapshots.map((s, idx) => ({
    date: new Date(s.capturedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: s.stars,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/compare?repo1=${repo.id}`}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
          >
            Compare with another repo
          </Link>
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open on GitHub</span>
          </a>
        </div>
      </div>

      {/* Main Repository Header Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <img
              src={`https://github.com/${repo.owner}.png?size=64`}
              alt={repo.owner}
              className="h-12 w-12 rounded-xl border bg-muted shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {repo.owner}
                </span>
                <span className="text-muted-foreground">/</span>
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                  {repo.name}
                </h1>
              </div>
              <p className="mt-1 text-xs text-muted-foreground max-w-2xl leading-relaxed">
                {repo.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Trending Score Badge */}
          <div className="flex sm:flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Momentum: {repo.trendingScore}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              +{repo.starGrowth} stars growth
            </span>
          </div>
        </div>

        {/* Topics */}
        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {repo.topics.map((t) => (
              <span
                key={t.name}
                className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
              >
                #{t.name}
              </span>
            ))}
          </div>
        )}

        {/* Primary Metrics Row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-border pt-4 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="h-4 w-4 text-amber-500" />
            <div>
              <span className="font-bold text-foreground text-sm block">
                {repo.stars.toLocaleString()}
              </span>
              <span>Total Stars</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <GitFork className="h-4 w-4 text-primary" />
            <div>
              <span className="font-bold text-foreground text-sm block">
                {repo.forks.toLocaleString()}
              </span>
              <span>Forks</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <CircleDot className="h-4 w-4 text-rose-500" />
            <div>
              <span className="font-bold text-foreground text-sm block">
                {repo.openIssues.toLocaleString()}
              </span>
              <span>Open Issues</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Layers className="h-4 w-4 text-emerald-500" />
            <div>
              <span className="font-bold text-foreground text-sm block">
                {repo.primaryLanguage || "Multiple"}
              </span>
              <span>Main Language</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Deep Analysis Section */}
      {summary && (
        <div className="rounded-xl border border-primary/25 bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Bot className="h-4 w-4" />
              <span>AI Repository Intelligence Analysis</span>
            </div>
            <span className="text-[10px] font-mono rounded bg-primary/10 px-2 py-0.5 text-primary font-semibold">
              Model: {summary.modelName}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-xs leading-relaxed">
            <div className="space-y-1.5 rounded-lg border border-border bg-background p-4">
              <h3 className="font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Executive Summary</span>
              </h3>
              <p className="text-muted-foreground">{summary.summary}</p>
            </div>

            <div className="space-y-1.5 rounded-lg border border-border bg-background p-4">
              <h3 className="font-bold text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <span>Architecture & Design</span>
              </h3>
              <p className="text-muted-foreground">{summary.architecture}</p>
            </div>

            <div className="space-y-1.5 rounded-lg border border-border bg-background p-4">
              <h3 className="font-bold text-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span>Beginner's Explanation</span>
              </h3>
              <p className="text-muted-foreground">{summary.beginnerTake}</p>
            </div>

            <div className="space-y-1.5 rounded-lg border border-border bg-background p-4">
              <h3 className="font-bold text-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>Key Use Cases & Limitations</span>
              </h3>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Use Cases:</strong>{" "}
                {summary.useCases}
              </p>
              <p className="text-muted-foreground pt-1">
                <strong className="text-foreground">Limitations:</strong>{" "}
                {summary.limitations}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Historical Star Growth Chart */}
      <div className="space-y-2">
        <h2 className="text-base font-bold text-foreground">
          Historical Metric Snapshots
        </h2>
        <p className="text-xs text-muted-foreground">
          Verifiable metric captures recorded by RepoRadar's snapshot scheduler.
        </p>
        <TrendingChart
          data={snapshotData}
          title={`${repo.fullName} Star Velocity`}
          color="#2563eb"
          height={240}
        />
      </div>

      {/* Metadata & Timestamps */}
      <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>Created: {new Date(repo.githubCreatedAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>Last Commit: {new Date(repo.githubPushedAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          <span>License: {repo.license || "Open Source"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <GitBranch className="h-3.5 w-3.5" />
          <span>Default Branch: {repo.defaultBranch}</span>
        </div>
      </div>
    </div>
  );
}
