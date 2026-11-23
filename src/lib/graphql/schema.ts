// GraphQL Schema Definitions (SDL) for RepoRadar
// Defines queries, mutations, and domain types

export const typeDefs = /* GraphQL */ `
  type Topic {
    id: ID!
    name: String!
  }

  type Language {
    id: ID!
    name: String!
    bytes: Int!
  }

  type Snapshot {
    id: ID!
    stars: Int!
    forks: Int!
    openIssues: Int!
    watchers: Int!
    capturedAt: String!
  }

  type Summary {
    id: ID!
    summary: String!
    architecture: String
    keyFeatures: String
    useCases: String
    limitations: String
    beginnerTake: String
    modelName: String!
    isAiGenerated: Boolean!
    createdAt: String!
  }

  type Repository {
    id: ID!
    githubId: Int!
    fullName: String!
    owner: String!
    name: String!
    description: String
    url: String!
    homepage: String
    stars: Int!
    forks: Int!
    openIssues: Int!
    watchers: Int!
    primaryLanguage: String
    license: String
    defaultBranch: String!
    isArchived: Boolean!
    isFork: Boolean!
    githubCreatedAt: String!
    githubUpdatedAt: String!
    githubPushedAt: String!
    trendingScore: Float!
    starGrowth: Int!
    createdAt: String!
    updatedAt: String!
    topics: [Topic!]!
    languages: [Language!]!
    snapshots(limit: Int): [Snapshot!]!
    summary: Summary
    isSaved: Boolean!
  }

  type DashboardStats {
    totalRepos: Int!
    totalStars: Int!
    totalLanguages: Int!
    totalTopics: Int!
    recentlyAdded: Int!
  }

  type LanguageStat {
    language: String!
    count: Int!
    percentage: Float!
  }

  type TopicStat {
    topic: String!
    count: Int!
  }

  type ActivityPoint {
    date: String!
    value: Int!
  }

  type MetricComparison {
    repoId: ID!
    fullName: String!
    value: Float!
  }

  type RepoComparison {
    repositories: [Repository!]!
    starsComparison: [MetricComparison!]!
    forksComparison: [MetricComparison!]!
    issuesComparison: [MetricComparison!]!
    growthComparison: [MetricComparison!]!
  }

  type SavedRepository {
    id: ID!
    repositoryId: ID!
    notes: String
    createdAt: String!
    repository: Repository!
  }

  type Query {
    trendingRepositories(limit: Int, language: String): [Repository!]!
    searchRepositories(
      query: String
      language: String
      topic: String
      minStars: Int
      sortBy: String
      limit: Int
      offset: Int
    ): [Repository!]!
    repository(id: ID, fullName: String): Repository
    repositoryStats: DashboardStats!
    trendingTopics(limit: Int): [TopicStat!]!
    languageStats: [LanguageStat!]!
    compareRepositories(ids: [ID!]!): RepoComparison!
    repositoryActivity(id: ID!): [ActivityPoint!]!
    savedRepositories: [SavedRepository!]!
  }

  type Mutation {
    toggleSaveRepository(id: ID!, notes: String): SavedRepository
    triggerSnapshot(repositoryId: ID!): Snapshot!
  }
`;
