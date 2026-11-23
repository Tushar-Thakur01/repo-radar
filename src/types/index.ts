// TypeScript types used throughout RepoRadar
// These define the shape of our data

/** A GitHub repository stored in our database */
export interface Repository {
  id: string;
  githubId: number;
  fullName: string;      // e.g. "facebook/react"
  owner: string;         // e.g. "facebook"
  name: string;          // e.g. "react"
  description: string | null;
  url: string;           // GitHub URL
  homepage: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  license: string | null;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  defaultBranch: string;
  isArchived: boolean;
  isFork: boolean;
  // Calculated fields
  trendingScore?: number;
  starGrowth?: number;
  dataSource?: "live" | "cached" | "demo";
  sourceLabel?: string;
  // AI fields
  aiSummary?: string | null;
  aiAnalyzedAt?: string | null;
}

/** A snapshot of repository metrics at a point in time */
export interface RepoSnapshot {
  id: string;
  repositoryId: string;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  capturedAt: string;
}

/** Statistics for the dashboard */
export interface DashboardStats {
  totalRepos: number;
  totalStars: number;
  totalLanguages: number;
  totalTopics: number;
  recentlyAdded: number;
}

/** Language distribution */
export interface LanguageStat {
  language: string;
  count: number;
  percentage: number;
}

/** Topic distribution */
export interface TopicStat {
  topic: string;
  count: number;
}

/** Time series data point for charts */
export interface TimeSeriesPoint {
  date: string;
  value: number;
}

/** Repository comparison result */
export interface RepoComparison {
  repositories: Repository[];
  comparison: {
    stars: { repoId: string; value: number }[];
    forks: { repoId: string; value: number }[];
    issues: { repoId: string; value: number }[];
    languages: { repoId: string; value: string | null }[];
  };
}

/** Chat message for the AI assistant */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

/** Filter options for repository search */
export interface RepoFilters {
  language?: string;
  topic?: string;
  minStars?: number;
  maxStars?: number;
  sortBy?: "stars" | "forks" | "updated" | "trending" | "created";
  sortOrder?: "asc" | "desc";
  search?: string;
  limit?: number;
  offset?: number;
}
