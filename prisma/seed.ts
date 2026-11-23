// Seed script for RepoRadar SQLite database
// Seeds the initial set of 12 real open source repositories with full relationships:
// - Repositories
// - Topics
// - Language bytes
// - Metric Snapshots
// - AI & Heuristic Summaries

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initialRepos = [
  {
    githubId: 10270250,
    fullName: "facebook/react",
    owner: "facebook",
    name: "react",
    description: "The library for web and native user interfaces.",
    url: "https://github.com/facebook/react",
    homepage: "https://react.dev",
    stars: 232000,
    forks: 47400,
    openIssues: 950,
    watchers: 6600,
    primaryLanguage: "JavaScript",
    license: "MIT",
    topics: ["javascript", "react", "frontend", "ui", "library"],
    githubCreatedAt: new Date("2013-05-24T16:15:54Z"),
    githubUpdatedAt: new Date("2024-01-15T10:00:00Z"),
    githubPushedAt: new Date("2024-01-15T08:30:00Z"),
    trendingScore: 92.4,
    starGrowth: 150,
    summary: {
      summary: "React is Facebook's foundational declarative, component-based UI library powering modern web development.",
      architecture: "Virtual DOM reconciliation engine (Fiber) with unidirectional state flow and composable hooks.",
      keyFeatures: "JSX syntax, Hooks API, Concurrent Mode, React Server Components (RSC), Suspense.",
      useCases: "Single-page applications (SPAs), complex web interfaces, component design systems, multi-platform apps via React Native.",
      limitations: "Focuses strictly on the view layer; routing, data fetching, and state management require external packages.",
      beginnerTake: "The industry standard way to build interactive user interfaces by breaking pages down into reusable components.",
      modelName: "baseline-catalog",
      isAiGenerated: false,
    },
  },
  {
    githubId: 70107786,
    fullName: "vercel/next.js",
    owner: "vercel",
    name: "next.js",
    description: "The React Framework for the Web.",
    url: "https://github.com/vercel/next.js",
    homepage: "https://nextjs.org",
    stars: 128000,
    forks: 27200,
    openIssues: 3200,
    watchers: 3100,
    primaryLanguage: "JavaScript",
    license: "MIT",
    topics: ["nextjs", "react", "javascript", "framework", "ssr"],
    githubCreatedAt: new Date("2016-10-05T23:32:51Z"),
    githubUpdatedAt: new Date("2024-01-15T09:00:00Z"),
    githubPushedAt: new Date("2024-01-15T07:45:00Z"),
    trendingScore: 88.0,
    starGrowth: 120,
    summary: {
      summary: "Full-stack React framework featuring hybrid static & server rendering, file-system routing, and smart asset optimization.",
      architecture: "App Router built on React Server Components with Turbopack rust compiler and edge runtime support.",
      keyFeatures: "Server-side rendering (SSR), Static Site Generation (SSG), API Routes, Image optimization, Middleware.",
      useCases: "E-commerce stores, SaaS web portals, production enterprise websites requiring top SEO and performance.",
      limitations: "Fast-evolving API surface with major version architectural shifts between Pages and App routers.",
      beginnerTake: "Takes React and gives you everything needed to build a real production-ready website with routing and server features.",
      modelName: "baseline-catalog",
      isAiGenerated: false,
    },
  },
  {
    githubId: 55400,
    fullName: "ollama/ollama",
    owner: "ollama",
    name: "ollama",
    description: "Get up and running with large language models locally.",
    url: "https://github.com/ollama/ollama",
    homepage: "https://ollama.ai",
    stars: 105000,
    forks: 8200,
    openIssues: 1500,
    watchers: 1200,
    primaryLanguage: "Go",
    license: "MIT",
    topics: ["ai", "llm", "ollama", "local-ai", "machine-learning"],
    githubCreatedAt: new Date("2023-06-27T01:36:55Z"),
    githubUpdatedAt: new Date("2024-01-15T10:00:00Z"),
    githubPushedAt: new Date("2024-01-15T09:00:00Z"),
    trendingScore: 97.8,
    starGrowth: 800,
    summary: {
      summary: "Run open-source large language models (Llama 3, Mistral, Gemma) locally on CPU and GPU with a simple CLI and REST API.",
      architecture: "Go wrapper over llama.cpp C++ inference engine with cross-platform hardware acceleration (Metal, CUDA, ROCm).",
      keyFeatures: "Modelfile configuration, OpenAI-compatible REST endpoints, multi-modal vision support, zero-cloud privacy.",
      useCases: "Local AI assistants, private document retrieval/RAG pipelines, offline coding assistance, local agent backends.",
      limitations: "Resource-intensive; larger parameter models require substantial VRAM or system RAM.",
      beginnerTake: "Like Docker, but for running AI language models directly on your own computer without paying cloud API fees.",
      modelName: "baseline-catalog",
      isAiGenerated: false,
    },
  },
  {
    githubId: 143680936,
    fullName: "langchain-ai/langchain",
    owner: "langchain-ai",
    name: "langchain",
    description: "Build context-aware reasoning applications.",
    url: "https://github.com/langchain-ai/langchain",
    homepage: "https://python.langchain.com",
    stars: 96000,
    forks: 15800,
    openIssues: 1200,
    watchers: 1800,
    primaryLanguage: "Python",
    license: "MIT",
    topics: ["ai", "llm", "agents", "python", "machine-learning"],
    githubCreatedAt: new Date("2022-10-17T02:58:36Z"),
    githubUpdatedAt: new Date("2024-01-15T10:00:00Z"),
    githubPushedAt: new Date("2024-01-15T09:30:00Z"),
    trendingScore: 95.1,
    starGrowth: 500,
    summary: {
      summary: "Comprehensive Python framework orchestrating LLMs, vector stores, prompt templates, and autonomous agents.",
      architecture: "LangChain Expression Language (LCEL) composable pipeline connecting retrievers, models, and output parsers.",
      keyFeatures: "Vector DB integrations, Document loaders, Agent tool-calling loops, LangSmith tracing support.",
      useCases: "Enterprise RAG (Retrieval Augmented Generation), autonomous workflow agents, smart chatbots.",
      limitations: "Rapid abstraction changes and complex class hierarchies can make debugging prompt chains intricate.",
      beginnerTake: "A toolbox that lets your code talk to AI models, search custom documents, and execute real actions.",
      modelName: "baseline-catalog",
      isAiGenerated: false,
    },
  },
  {
    githubId: 39458,
    fullName: "modelcontextprotocol/typescript-sdk",
    owner: "modelcontextprotocol",
    name: "typescript-sdk",
    description: "The official TypeScript SDK for Model Context Protocol servers and clients.",
    url: "https://github.com/modelcontextprotocol/typescript-sdk",
    homepage: "https://modelcontextprotocol.io",
    stars: 5200,
    forks: 480,
    openIssues: 120,
    watchers: 220,
    primaryLanguage: "TypeScript",
    license: "MIT",
    topics: ["mcp", "ai", "typescript", "sdk", "protocol"],
    githubCreatedAt: new Date("2024-11-01T12:00:00Z"),
    githubUpdatedAt: new Date("2024-01-15T10:00:00Z"),
    githubPushedAt: new Date("2024-01-15T09:30:00Z"),
    trendingScore: 90.5,
    starGrowth: 400,
    summary: {
      summary: "Standardized protocol implementation enabling AI applications to securely interface with external tools, files, and databases.",
      architecture: "JSON-RPC 2.0 based protocol supporting Stdio and Server-Sent Events (SSE) transports with bi-directional streaming.",
      keyFeatures: "Tool definitions with JSON schema validation, Resource providers, Prompt templates, Client/Server abstractions.",
      useCases: "Building local agent capabilities, connecting IDE assistants to custom dev tools, structured enterprise data access.",
      limitations: "Emerging specification; ecosystem tooling and hosting patterns are actively developing.",
      beginnerTake: "The open standard USB-cable connecting AI models to your local files, databases, and custom commands.",
      modelName: "baseline-catalog",
      isAiGenerated: false,
    },
  },
  {
    githubId: 458058,
    fullName: "prisma/prisma",
    owner: "prisma",
    name: "prisma",
    description: "Next-generation ORM for Node.js & TypeScript.",
    url: "https://github.com/prisma/prisma",
    homepage: "https://www.prisma.io",
    stars: 40200,
    forks: 1580,
    openIssues: 3100,
    watchers: 900,
    primaryLanguage: "TypeScript",
    license: "Apache-2.0",
    topics: ["prisma", "orm", "typescript", "database", "nodejs"],
    githubCreatedAt: new Date("2016-08-30T11:24:14Z"),
    githubUpdatedAt: new Date("2024-01-15T08:00:00Z"),
    githubPushedAt: new Date("2024-01-15T07:30:00Z"),
    trendingScore: 70.2,
    starGrowth: 60,
    summary: {
      summary: "Type-safe database ORM featuring an intuitive modeling schema, automated migrations, and auto-generated TypeScript queries.",
      architecture: "Declarative schema file feeding a Rust query engine binary that compiles high-performance SQL.",
      keyFeatures: "Prisma Client with end-to-end type safety, Prisma Migrate, Prisma Studio graphical data browser.",
      useCases: "Node.js REST/GraphQL backends, Next.js server components, serverless and edge database access.",
      limitations: "Complex custom aggregations or non-standard SQL extensions sometimes require raw queries.",
      beginnerTake: "Lets you interact with your database using plain JavaScript/TypeScript objects with full autocomplete.",
      modelName: "baseline-catalog",
      isAiGenerated: false,
    },
  },
  {
    githubId: 85326,
    fullName: "astral-sh/ruff",
    owner: "astral-sh",
    name: "ruff",
    description: "An extremely fast Python linter and code formatter, written in Rust.",
    url: "https://github.com/astral-sh/ruff",
    homepage: "https://docs.astral.sh/ruff",
    stars: 34000,
    forks: 1100,
    openIssues: 950,
    watchers: 450,
    primaryLanguage: "Rust",
    license: "MIT",
    topics: ["python", "rust", "linter", "formatter", "developer-tools"],
    githubCreatedAt: new Date("2022-08-30T13:59:33Z"),
    githubUpdatedAt: new Date("2024-01-15T10:00:00Z"),
    githubPushedAt: new Date("2024-01-15T09:30:00Z"),
    trendingScore: 85.3,
    starGrowth: 200,
    summary: {
      summary: "Ultra-fast replacement for Flake8, Black, isort, and pyupgrade, speeding up Python CI pipelines by 10-100x.",
      architecture: "Rust parser and AST validator targeting drop-in parity with standard Python formatting rules.",
      keyFeatures: "Zero-config auto-fix, 800+ lint rules, pyproject.toml configuration, pre-commit hook integration.",
      useCases: "Python monorepos, high-speed CI/CD verification, editor formatting plugins (VS Code / PyCharm).",
      limitations: "Does not perform deep static type checking like mypy or pyright (focused on linting and formatting).",
      beginnerTake: "Cleans up messy Python code and fixes errors in milliseconds instead of waiting minutes.",
      modelName: "baseline-catalog",
      isAiGenerated: false,
    },
  },
  {
    githubId: 76330900,
    fullName: "supabase/supabase",
    owner: "supabase",
    name: "supabase",
    description: "The open source Firebase alternative.",
    url: "https://github.com/supabase/supabase",
    homepage: "https://supabase.com",
    stars: 75000,
    forks: 7300,
    openIssues: 400,
    watchers: 1100,
    primaryLanguage: "TypeScript",
    license: "Apache-2.0",
    topics: ["supabase", "firebase", "database", "postgres", "backend"],
    githubCreatedAt: new Date("2020-01-01T22:45:30Z"),
    githubUpdatedAt: new Date("2024-01-15T09:00:00Z"),
    githubPushedAt: new Date("2024-01-15T08:30:00Z"),
    trendingScore: 78.4,
    starGrowth: 100,
    summary: {
      summary: "Open source Backend-as-a-Service providing a dedicated PostgreSQL database, Auth, Storage, Edge Functions, and Realtime.",
      architecture: "PostgreSQL with PostgREST, GoTrue auth daemon, Realtime Elixir server, and Kong API gateway.",
      keyFeatures: "Row Level Security (RLS), auto-generated REST/GraphQL APIs, vector embeddings (pgvector), instant webhooks.",
      useCases: "Mobile and web backends, rapid MVP prototypes, AI applications using Postgres vector search.",
      limitations: "Requires familiarity with PostgreSQL concepts and SQL policies for advanced security.",
      beginnerTake: "Provides a complete production backend with login, database, and file storage in 5 minutes.",
      modelName: "baseline-catalog",
      isAiGenerated: false,
    },
  },
  {
    githubId: 20929025,
    fullName: "denoland/deno",
    owner: "denoland",
    name: "deno",
    description: "A modern runtime for JavaScript and TypeScript.",
    url: "https://github.com/denoland/deno",
    homepage: "https://deno.land",
    stars: 98000,
    forks: 5400,
    openIssues: 1800,
    watchers: 2400,
    primaryLanguage: "Rust",
    license: "MIT",
    topics: ["deno", "typescript", "javascript", "runtime", "rust"],
    githubCreatedAt: new Date("2018-06-21T00:35:52Z"),
    githubUpdatedAt: new Date("2024-01-15T06:00:00Z"),
    githubPushedAt: new Date("2024-01-15T05:30:00Z"),
    trendingScore: 75.0,
    starGrowth: 80,
    summary: {
      summary: "Secure JavaScript/TypeScript runtime with built-in toolchain, native npm compatibility, and web standards compliance.",
      architecture: "Rust core with V8 JavaScript engine and Tokio asynchronous event loop.",
      keyFeatures: "Secure by default (explicit file/network flags), built-in linter/formatter/test-runner, zero-config TypeScript.",
      useCases: "Cloud edge functions, microservices, standalone CLIs, lightweight web servers.",
      limitations: "While npm compatibility is strong, some deep native Node C++ addons require special handling.",
      beginnerTake: "A cleaner, modern alternative to Node.js that runs TypeScript directly with no compiler setup.",
      modelName: "baseline-catalog",
      isAiGenerated: false,
    },
  },
  {
    githubId: 59100,
    fullName: "tailwindlabs/tailwindcss",
    owner: "tailwindlabs",
    name: "tailwindcss",
    description: "A utility-first CSS framework for rapid UI development.",
    url: "https://github.com/tailwindlabs/tailwindcss",
    homepage: "https://tailwindcss.com",
    stars: 84000,
    forks: 4300,
    openIssues: 70,
    watchers: 1300,
    primaryLanguage: "TypeScript",
    license: "MIT",
    topics: ["css", "tailwindcss", "framework", "utility-first", "design"],
    githubCreatedAt: new Date("2017-11-01T22:21:28Z"),
    githubUpdatedAt: new Date("2024-01-15T07:00:00Z"),
    githubPushedAt: new Date("2024-01-15T06:30:00Z"),
    trendingScore: 72.0,
    starGrowth: 50,
    summary: {
      summary: "Utility-first CSS framework providing low-level styling classes to build custom modern web designs without writing raw CSS.",
      architecture: "JIT (Just-In-Time) compiler engine detecting classes in source code and generating minimal CSS.",
      keyFeatures: "Responsive modifiers, dark mode variants, arbitrary value support, design token variables.",
      useCases: "Component design systems, responsive web apps, SaaS dashboards, Next.js frontend styling.",
      limitations: "Can result in lengthy HTML class attributes if not abstracted into reusable components.",
      beginnerTake: "Allows you to style any website directly in your HTML/JSX without switching back and forth between CSS files.",
      modelName: "baseline-catalog",
      isAiGenerated: false,
    },
  },
  {
    githubId: 44510,
    fullName: "graphql/graphql-js",
    owner: "graphql",
    name: "graphql-js",
    description: "A reference implementation of GraphQL for JavaScript.",
    url: "https://github.com/graphql/graphql-js",
    homepage: "https://graphql.org",
    stars: 20100,
    forks: 2000,
    openIssues: 180,
    watchers: 650,
    primaryLanguage: "TypeScript",
    license: "MIT",
    topics: ["graphql", "javascript", "api", "query-language"],
    githubCreatedAt: new Date("2015-07-01T18:37:51Z"),
    githubUpdatedAt: new Date("2024-01-14T12:00:00Z"),
    githubPushedAt: new Date("2024-01-14T11:00:00Z"),
    trendingScore: 35.0,
    starGrowth: 10,
    summary: {
      summary: "Reference JavaScript implementation of the GraphQL specification for parsing, validating, and executing schema queries.",
      architecture: "Type-system builder, lexer, AST parser, and schema executor validating queries against schemas.",
      keyFeatures: "Schema definition language (SDL), AST visitor pattern, field resolver pipeline, execution context.",
      useCases: "Underlying engine for Apollo Server, GraphQL Yoga, and custom Node.js GraphQL gateways.",
      limitations: "Low-level library; real production backends typically use server wrappers like GraphQL Yoga or Apollo.",
      beginnerTake: "The fundamental engine that makes GraphQL queries work in JavaScript and TypeScript backends.",
      modelName: "baseline-catalog",
      isAiGenerated: false,
    },
  },
  {
    githubId: 36502,
    fullName: "rails/rails",
    owner: "rails",
    name: "rails",
    description: "Ruby on Rails framework for building web applications.",
    url: "https://github.com/rails/rails",
    homepage: "https://rubyonrails.org",
    stars: 56500,
    forks: 21600,
    openIssues: 680,
    watchers: 2500,
    primaryLanguage: "Ruby",
    license: "MIT",
    topics: ["ruby", "rails", "web", "framework", "mvc"],
    githubCreatedAt: new Date("2008-04-11T02:19:47Z"),
    githubUpdatedAt: new Date("2024-01-14T12:00:00Z"),
    githubPushedAt: new Date("2024-01-14T11:30:00Z"),
    trendingScore: 45.0,
    starGrowth: 20,
    summary: {
      summary: "Legendary web-application framework that pioneered convention over configuration, MVC architecture, and developer happiness.",
      architecture: "Model-View-Controller framework built around ActiveRecord ORM, ActionPack routing, and Hotwire HTML-over-the-wire.",
      keyFeatures: "ActiveRecord migrations, Scaffolding generators, Turbo and Stimulus frontend integration, Solid Cache/Queue.",
      useCases: "SaaS startups, enterprise web products (GitHub, Shopify, Basecamp were built on Rails).",
      limitations: "Opinionated architectural conventions differ from modern decoupled client-side React SPAs.",
      beginnerTake: "Everything needed to build and launch a full-featured web business with a single command.",
      modelName: "baseline-catalog",
      isAiGenerated: false,
    },
  },
];

async function main() {
  console.log("🌱 Starting RepoRadar SQLite Database Seed...");

  for (const repoData of initialRepos) {
    const { topics, summary, ...repoFields } = repoData;

    // Upsert repository
    const repo = await prisma.repository.upsert({
      where: { fullName: repoFields.fullName },
      update: {
        stars: repoFields.stars,
        forks: repoFields.forks,
        openIssues: repoFields.openIssues,
        trendingScore: repoFields.trendingScore,
        starGrowth: repoFields.starGrowth,
      },
      create: {
        ...repoFields,
      },
    });

    // Seed topics
    for (const topicName of topics) {
      await prisma.repoTopic.upsert({
        where: {
          repositoryId_name: {
            repositoryId: repo.id,
            name: topicName,
          },
        },
        update: {},
        create: {
          repositoryId: repo.id,
          name: topicName,
        },
      });
    }

    // Seed historical snapshots (3 snapshots: 14 days ago, 7 days ago, now)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const snapshots = [
      {
        stars: Math.max(0, repo.stars - repo.starGrowth * 2),
        forks: Math.max(0, repo.forks - 20),
        openIssues: repo.openIssues + 5,
        watchers: repo.watchers - 10,
        capturedAt: twoWeeksAgo,
      },
      {
        stars: Math.max(0, repo.stars - repo.starGrowth),
        forks: Math.max(0, repo.forks - 10),
        openIssues: repo.openIssues + 2,
        watchers: repo.watchers - 5,
        capturedAt: weekAgo,
      },
      {
        stars: repo.stars,
        forks: repo.forks,
        openIssues: repo.openIssues,
        watchers: repo.watchers,
        capturedAt: now,
      },
    ];

    for (const snap of snapshots) {
      await prisma.repoSnapshot.create({
        data: {
          repositoryId: repo.id,
          ...snap,
        },
      });
    }

    // Seed summary
    if (summary) {
      await prisma.repoSummary.upsert({
        where: { repositoryId: repo.id },
        update: summary,
        create: {
          repositoryId: repo.id,
          ...summary,
        },
      });
    }

    console.log(`✅ Seeded: ${repo.fullName} (${repo.stars.toLocaleString()} stars)`);
  }

  const count = await prisma.repository.count();
  const snapshotCount = await prisma.repoSnapshot.count();
  const topicCount = await prisma.repoTopic.count();

  console.log("\n📊 Seed Summary:");
  console.log(`- Repositories: ${count}`);
  console.log(`- Historical Snapshots: ${snapshotCount}`);
  console.log(`- Topic Relations: ${topicCount}`);
  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
