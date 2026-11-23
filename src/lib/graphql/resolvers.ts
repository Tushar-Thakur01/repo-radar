// GraphQL Resolvers for RepoRadar
// Resolvers connect the GraphQL query types directly to Prisma database queries

import { prisma } from "../prisma";

export const resolvers = {
  Repository: {
    githubCreatedAt: (parent: any) =>
      parent.githubCreatedAt instanceof Date
        ? parent.githubCreatedAt.toISOString()
        : parent.githubCreatedAt,
    githubUpdatedAt: (parent: any) =>
      parent.githubUpdatedAt instanceof Date
        ? parent.githubUpdatedAt.toISOString()
        : parent.githubUpdatedAt,
    githubPushedAt: (parent: any) =>
      parent.githubPushedAt instanceof Date
        ? parent.githubPushedAt.toISOString()
        : parent.githubPushedAt,
    createdAt: (parent: any) =>
      parent.createdAt instanceof Date
        ? parent.createdAt.toISOString()
        : parent.createdAt,
    updatedAt: (parent: any) =>
      parent.updatedAt instanceof Date
        ? parent.updatedAt.toISOString()
        : parent.updatedAt,
    topics: async (parent: any) => {
      if (parent.topics && Array.isArray(parent.topics)) return parent.topics;
      return prisma.repoTopic.findMany({ where: { repositoryId: parent.id } });
    },
    languages: async (parent: any) => {
      if (parent.languages && Array.isArray(parent.languages))
        return parent.languages;
      return prisma.repoLanguage.findMany({
        where: { repositoryId: parent.id },
      });
    },
    snapshots: async (parent: any, { limit = 10 }: { limit?: number }) => {
      return prisma.repoSnapshot.findMany({
        where: { repositoryId: parent.id },
        orderBy: { capturedAt: "asc" },
        take: limit,
      });
    },
    summary: async (parent: any) => {
      if (parent.summary !== undefined) return parent.summary;
      return prisma.repoSummary.findUnique({
        where: { repositoryId: parent.id },
      });
    },
    isSaved: async (parent: any) => {
      const saved = await prisma.savedRepository.findUnique({
        where: { repositoryId: parent.id },
      });
      return !!saved;
    },
  },

  Snapshot: {
    capturedAt: (parent: any) =>
      parent.capturedAt instanceof Date
        ? parent.capturedAt.toISOString()
        : parent.capturedAt,
  },

  Summary: {
    createdAt: (parent: any) =>
      parent.createdAt instanceof Date
        ? parent.createdAt.toISOString()
        : parent.createdAt,
  },

  SavedRepository: {
    createdAt: (parent: any) =>
      parent.createdAt instanceof Date
        ? parent.createdAt.toISOString()
        : parent.createdAt,
    repository: async (parent: any) => {
      return prisma.repository.findUnique({
        where: { id: parent.repositoryId },
        include: { topics: true, summary: true },
      });
    },
  },

  Query: {
    trendingRepositories: async (
      _: any,
      { limit = 10, language }: { limit?: number; language?: string }
    ) => {
      const where: any = {};
      if (language && language !== "all") {
        where.primaryLanguage = language;
      }
      return prisma.repository.findMany({
        where,
        orderBy: { trendingScore: "desc" },
        take: limit,
        include: { topics: true, summary: true },
      });
    },

    searchRepositories: async (
      _: any,
      {
        query,
        language,
        topic,
        minStars,
        sortBy = "trending",
        limit = 20,
        offset = 0,
      }: {
        query?: string;
        language?: string;
        topic?: string;
        minStars?: number;
        sortBy?: string;
        limit?: number;
        offset?: number;
      }
    ) => {
      const where: any = {};

      if (query && query.trim() !== "") {
        const q = query.trim();
        where.OR = [
          { fullName: { contains: q } },
          { name: { contains: q } },
          { owner: { contains: q } },
          { description: { contains: q } },
          { primaryLanguage: { contains: q } },
          { topics: { some: { name: { contains: q } } } },
        ];
      }

      if (language && language !== "all") {
        where.primaryLanguage = language;
      }

      if (topic && topic !== "all") {
        where.topics = { some: { name: topic } };
      }

      if (minStars) {
        where.stars = { gte: minStars };
      }

      let orderBy: any = { trendingScore: "desc" };
      if (sortBy === "stars") orderBy = { stars: "desc" };
      if (sortBy === "growth") orderBy = { starGrowth: "desc" };
      if (sortBy === "forks") orderBy = { forks: "desc" };
      if (sortBy === "issues") orderBy = { openIssues: "desc" };
      if (sortBy === "updated") orderBy = { githubUpdatedAt: "desc" };

      return prisma.repository.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: { topics: true, summary: true },
      });
    },

    repository: async (
      _: any,
      { id, fullName }: { id?: string; fullName?: string }
    ) => {
      if (id) {
        return prisma.repository.findUnique({
          where: { id },
          include: { topics: true, languages: true, summary: true },
        });
      }
      if (fullName) {
        return prisma.repository.findUnique({
          where: { fullName },
          include: { topics: true, languages: true, summary: true },
        });
      }
      return null;
    },

    repositoryStats: async () => {
      const totalRepos = await prisma.repository.count();
      const allRepos = await prisma.repository.findMany({
        select: { stars: true, primaryLanguage: true },
      });

      const totalStars = allRepos.reduce((acc, r) => acc + r.stars, 0);
      const languages = new Set(
        allRepos.map((r) => r.primaryLanguage).filter(Boolean)
      );

      const topicCount = await prisma.repoTopic
        .findMany({ select: { name: true }, distinct: ["name"] })
        .then((res) => res.length);

      return {
        totalRepos,
        totalStars,
        totalLanguages: languages.size,
        totalTopics: topicCount,
        recentlyAdded: Math.min(totalRepos, 5),
      };
    },

    trendingTopics: async (_: any, { limit = 15 }: { limit?: number }) => {
      const topics = await prisma.repoTopic.findMany({
        select: { name: true },
      });

      const frequency: Record<string, number> = {};
      for (const t of topics) {
        frequency[t.name] = (frequency[t.name] || 0) + 1;
      }

      return Object.entries(frequency)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    },

    languageStats: async () => {
      const repos = await prisma.repository.findMany({
        select: { primaryLanguage: true },
      });

      const total = repos.length;
      if (total === 0) return [];

      const frequency: Record<string, number> = {};
      for (const r of repos) {
        if (r.primaryLanguage) {
          frequency[r.primaryLanguage] =
            (frequency[r.primaryLanguage] || 0) + 1;
        }
      }

      return Object.entries(frequency)
        .map(([language, count]) => ({
          language,
          count,
          percentage: Math.round((count / total) * 100),
        }))
        .sort((a, b) => b.count - a.count);
    },

    compareRepositories: async (
      _: any,
      { ids }: { ids: string[] }
    ) => {
      const repositories = await prisma.repository.findMany({
        where: { id: { in: ids } },
        include: { topics: true, summary: true },
      });

      const starsComparison = repositories.map((r) => ({
        repoId: r.id,
        fullName: r.fullName,
        value: r.stars,
      }));

      const forksComparison = repositories.map((r) => ({
        repoId: r.id,
        fullName: r.fullName,
        value: r.forks,
      }));

      const issuesComparison = repositories.map((r) => ({
        repoId: r.id,
        fullName: r.fullName,
        value: r.openIssues,
      }));

      const growthComparison = repositories.map((r) => ({
        repoId: r.id,
        fullName: r.fullName,
        value: r.starGrowth,
      }));

      return {
        repositories,
        starsComparison,
        forksComparison,
        issuesComparison,
        growthComparison,
      };
    },

    repositoryActivity: async (
      _: any,
      { id }: { id: string }
    ) => {
      const snapshots = await prisma.repoSnapshot.findMany({
        where: { repositoryId: id },
        orderBy: { capturedAt: "asc" },
      });

      return snapshots.map((s, idx) => ({
        date: new Date(s.capturedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: s.stars,
      }));
    },

    savedRepositories: async () => {
      return prisma.savedRepository.findMany({
        include: {
          repository: {
            include: { topics: true, summary: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    },
  },

  Mutation: {
    toggleSaveRepository: async (
      _: any,
      { id, notes }: { id: string; notes?: string }
    ) => {
      const existing = await prisma.savedRepository.findUnique({
        where: { repositoryId: id },
      });

      if (existing) {
        await prisma.savedRepository.delete({ where: { repositoryId: id } });
        return null;
      }

      return prisma.savedRepository.create({
        data: {
          repositoryId: id,
          notes: notes || null,
        },
        include: {
          repository: {
            include: { topics: true, summary: true },
          },
        },
      });
    },

    triggerSnapshot: async (
      _: any,
      { repositoryId }: { repositoryId: string }
    ) => {
      const repo = await prisma.repository.findUnique({
        where: { id: repositoryId },
      });

      if (!repo) throw new Error("Repository not found");

      return prisma.repoSnapshot.create({
        data: {
          repositoryId,
          stars: repo.stars,
          forks: repo.forks,
          openIssues: repo.openIssues,
          watchers: repo.watchers,
        },
      });
    },
  },
};
