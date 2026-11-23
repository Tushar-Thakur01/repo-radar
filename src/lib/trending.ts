// RepoRadar Transparent Trending Algorithm & Snapshot Engine
// Computes an explainable momentum score between 0.0 and 99.9

import { prisma } from "./prisma";

export interface TrendingBreakdown {
  score: number;
  growthFactor: number;
  recencyFactor: number;
  popularityFactor: number;
  explanation: string;
}

/**
 * Transparent scoring formula:
 * 1. Growth Weight (45%): Star delta captured across snapshots
 * 2. Activity / Recency Weight (30%): Days since last commit/push
 * 3. Logarithmic Popularity Weight (25%): Overall community adoption scale
 */
export function calculateTrendingScore(params: {
  stars: number;
  starGrowth: number;
  pushedAt: Date | string;
  createdAt: Date | string;
}): TrendingBreakdown {
  const now = new Date();
  const pushDate = new Date(params.pushedAt);
  const createdDate = new Date(params.createdAt);

  // 1. Recency Factor (0 - 100)
  // Repos pushed within 24h get 100; decreases by 4 points per inactive day
  const daysSincePush = Math.max(0, (now.getTime() - pushDate.getTime()) / (1000 * 60 * 60 * 24));
  const recencyFactor = Math.max(10, Math.min(100, 100 - daysSincePush * 4));

  // 2. Growth Factor (0 - 100)
  // Higher weight for recent additions
  const growthFactor = Math.min(100, Math.max(10, params.starGrowth * 2.5));

  // 3. Popularity Factor (0 - 100)
  // Logarithmic scale so 1k stars = ~60, 10k stars = ~80, 100k+ stars = ~95-100
  const popularityFactor = Math.min(
    100,
    Math.max(10, (Math.log10(Math.max(1, params.stars)) / 5.5) * 100)
  );

  // Weighted composite score
  const compositeScore =
    growthFactor * 0.45 + recencyFactor * 0.3 + popularityFactor * 0.25;

  const score = Number(Math.min(99.9, Math.max(10.0, compositeScore)).toFixed(1));

  let explanation = "Steady momentum based on overall popularity.";
  if (growthFactor > 60) {
    explanation = "High star growth detected over recent snapshot intervals.";
  } else if (recencyFactor > 80 && growthFactor > 30) {
    explanation = "Strong recent commit activity combined with positive community expansion.";
  }

  return {
    score,
    growthFactor: Number(growthFactor.toFixed(1)),
    recencyFactor: Number(recencyFactor.toFixed(1)),
    popularityFactor: Number(popularityFactor.toFixed(1)),
    explanation,
  };
}

/**
 * Capture a new snapshot for a repository
 */
export async function captureSnapshot(repositoryId: string) {
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
  });

  if (!repo) throw new Error(`Repository ${repositoryId} not found`);

  return prisma.repoSnapshot.create({
    data: {
      repositoryId: repo.id,
      stars: repo.stars,
      forks: repo.forks,
      openIssues: repo.openIssues,
      watchers: repo.watchers,
      capturedAt: new Date(),
    },
  });
}

/**
 * Recalculate trending scores for all repositories in the database
 */
export async function updateAllTrendingScores() {
  const repos = await prisma.repository.findMany({
    include: {
      snapshots: {
        orderBy: { capturedAt: "desc" },
        take: 2,
      },
    },
  });

  const updates = [];
  for (const repo of repos) {
    let starGrowth = repo.starGrowth;

    if (repo.snapshots.length >= 2) {
      starGrowth = Math.max(0, repo.snapshots[0].stars - repo.snapshots[1].stars);
    }

    const { score } = calculateTrendingScore({
      stars: repo.stars,
      starGrowth,
      pushedAt: repo.githubPushedAt,
      createdAt: repo.githubCreatedAt,
    });

    const updated = await prisma.repository.update({
      where: { id: repo.id },
      data: {
        starGrowth,
        trendingScore: score,
      },
    });

    updates.push(updated);
  }

  return updates;
}
