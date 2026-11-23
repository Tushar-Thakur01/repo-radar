# RepoRadar — Architecture & System Design

## 1. System Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Web Browser Client                            │
│           (Next.js App Router — Responsive Dark/Light UI)              │
│   Dashboard (/) │ Discover (/discover) │ Trending (/trending)         │
│   Details (/repos/[id]) │ Compare (/compare) │ AI Chat (/chat)        │
└───────────────┬────────────────────────────────────────┬───────────────┘
                │ GraphQL Queries                        │ REST Requests
                ▼                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js 16 Backend                              │
│                                                                        │
│   /api/graphql (GraphQL Yoga)              /api/discover & /api/chat   │
│   ┌───────────────────────────┐            ┌────────────────────────┐  │
│   │ Resolvers & TypeDefs      │            │ Grounded Retrieval     │  │
│   │ Query: trendingRepos,     │            │ Intent parsing &       │  │
│   │ search, stats, compare    │            │ SQLite query executor  │  │
│   └─────────────┬─────────────┘            └───────────┬────────────┘  │
│                 │                                      │               │
│                 ▼                                      ▼               │
│   ┌────────────────────────────────────────────────────────┐           │
│   │             Service Layer & Prisma ORM                 │           │
│   │  - github.ts (GitHub API crawler & deduplication)      │           │
│   │  - trending.ts (3-factor momentum scoring algorithm)   │           │
│   │  - ai.ts (Ollama client + heuristic offline fallback)  │           │
│   │  - prisma.ts (Singleton database client)               │           │
│   └─────────────┬──────────────────────────────────────────┘           │
└─────────────────┼──────────────────────────────────────────────────────┘
                  │
                  ▼
         ┌───────────────────┐               ┌──────────────────────────┐
         │ SQLite Database   │               │   External Services      │
         │ (prisma/dev.db)   │               │  - GitHub REST API v3    │
         │ - Repository      │               │  - Ollama (localhost)    │
         │ - RepoSnapshot    │               └──────────────────────────┘
         │ - RepoTopic       │
         │ - RepoLanguage    │
         │ - RepoSummary     │
         │ - SavedRepository │
         └───────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│               RepoRadar MCP Server (mcp-server/index.ts)               │
│       Official Model Context Protocol SDK over Stdio Transport         │
│                                                                        │
│   Tools Exposed:                                                       │
│   • get_trending_repositories      • get_repository_activity           │
│   • search_repositories            • find_repositories_by_topic        │
│   • get_repository_details         • get_trending_topics               │
│   • get_repository_summary         • get_language_statistics           │
│   • compare_repositories                                              │
│                                                                        │
│   Connects directly to SQLite via Prisma (Shared Database Architecture)│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Choices & Justification

| Layer | Selection | Justification |
|---|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript | Server Components, App Router, standard React 19 ecosystem. |
| **Styling** | Tailwind CSS v4, Lucide Icons | Utility-first styling with inline theme CSS custom properties. |
| **Charts** | Recharts | React-native interactive SVG area and pie charts. |
| **Database** | SQLite (Local) / PostgreSQL (Prod) | Zero server overhead for local development; 1-line provider change in `schema.prisma` for production. |
| **ORM** | Prisma 6 | Auto-generated type-safe queries, migration support, and relational joins. |
| **API** | GraphQL Yoga | Embedded GraphQL server with zero configuration, built-in GraphiQL IDE. |
| **MCP** | `@modelcontextprotocol/sdk` | Official Anthropic MCP SDK for building standards-compliant AI agent tools. |
| **AI** | Ollama + Heuristic Engine | Runs completely free and private locally. Fallback guarantees 100% uptime when Ollama is offline. |

---

## 3. Data Models (`prisma/schema.prisma`)

1. **`Repository`**: Stores canonical metadata (GitHub ID, full name, owner, stars, forks, issues, language, license, trending score, star growth).
2. **`RepoSnapshot`**: Point-in-time metrics capture (stars, forks, open issues, timestamp) used to calculate historical velocity.
3. **`RepoTopic`**: Tag relations (e.g. `mcp`, `ai`, `typescript`).
4. **`RepoLanguage`**: Language byte distribution.
5. **`RepoSummary`**: AI-generated technical analysis, architecture overview, beginner take, and use cases.
6. **`RepoRelease`**: Release history and changelogs.
7. **`SavedRepository`**: User-saved bookmarks and notes.

---

## 4. Transparent Trending Algorithm (`src/lib/trending.ts`)

```ts
Composite Trending Score (0.0 to 99.9) = 
  (Growth Factor × 0.45) + 
  (Push Recency Factor × 0.30) + 
  (Popularity Factor × 0.25)
```

- **Growth Factor (45%)**: Measures star delta between the two most recent snapshots in SQLite.
- **Push Recency Factor (30%)**: Exponential decay curve based on days since `githubPushedAt`.
- **Popularity Factor (25%)**: Logarithmic scale `log10(stars) / 5.5 * 100` ensuring established projects remain visible while rewarding explosive new momentum.
