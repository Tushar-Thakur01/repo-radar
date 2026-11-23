# 📡 RepoRadar

> **Discover what's trending. Understand why. Explore open source with AI.**

RepoRadar is an open-source GitHub intelligence platform that automatically crawls repositories, tracks star velocity with point-in-time snapshots, generates AI architectural breakdowns, provides a factual conversational assistant, and runs its own **genuine Model Context Protocol (MCP) server** over stdio.

---

## ✨ Features

- **📊 Comprehensive Intelligence Dashboard:** Visualizes tracked repositories, star velocity trends, language market share, and popular open-source topics.
- **⚡ Transparent Trending Algorithm:** An open, explainable 3-factor momentum formula (Star Growth 45% + Push Recency 30% + Popularity Baseline 25%) rather than opaque scrapers.
- **🔎 Automated Discovery Engine:** Crawls GitHub API across topics and languages with rate-limit tracking and automatic deduplication into SQLite.
- **📈 Historical Metric Snapshots:** Periodically captures repository metrics (stars, forks, issues) to plot real star velocity over time.
- **🤖 AI Architectural Summaries:** Generates deep technical summaries, architecture profiles, and beginner-friendly takeaways via local Ollama (`llama3.2`) with an intelligent deterministic fallback when offline.
- **⚖️ Side-by-Side Comparison:** Compare 2 or 3 repositories across traction metrics, architectural profiles, and use cases.
- **💬 Grounded AI Assistant:** A conversational assistant that queries your local database to answer questions about open source without hallucinations.
- **🔌 Official MCP Server:** Built using `@modelcontextprotocol/sdk` to expose 9 rich repository intelligence tools to AI agent clients.
- **🌐 Dual API Architecture:** Includes a live GraphQL Yoga endpoint (`/api/graphql`) with GraphiQL IDE plus REST API routes.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Lucide Icons, Recharts
- **Backend API:** GraphQL Yoga (`/api/graphql`), Next.js Route Handlers
- **Database & ORM:** SQLite (`prisma/dev.db`), Prisma 6
- **MCP Server:** `@modelcontextprotocol/sdk` (Stdio transport)
- **AI Engine:** Ollama (`llama3.2`) + Heuristic Architecture Engine
- **Testing & Verification:** Vitest (`npm test`), TypeScript (`tsc --noEmit`), MCP Client verification (`mcp-server/verify.ts`)

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v20+ or v24+
- **Git**

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Tushar-Thakur01/repo-radar.git
cd repo-radar
npm install
```

### 2. Environment Configuration
The project is configured for local development out of the box with SQLite. Copy `.env.example` to `.env.local` if needed:
```powershell
cp .env.example .env.local
```

### 3. Database Initialization
Generate the Prisma Client and seed the local SQLite database:
```powershell
npm run db:push
npm run db:seed
```
*(This creates `prisma/dev.db` seeded with 12 real projects and 36 historical snapshots).*

### 4. Run the Development Server
```powershell
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Main Dashboard:** [http://localhost:3000](http://localhost:3000)
- **GraphiQL Playground:** [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql)
- **Discovery Engine:** [http://localhost:3000/discover](http://localhost:3000/discover)
- **Trending Leaderboard:** [http://localhost:3000/trending](http://localhost:3000/trending)
- **Compare Tool:** [http://localhost:3000/compare](http://localhost:3000/compare)
- **AI Assistant:** [http://localhost:3000/chat](http://localhost:3000/chat)

---

## 🔌 Using the MCP Server

RepoRadar includes a genuine MCP server compliant with Anthropic's Model Context Protocol.

### Verify MCP Tools
Run the built-in MCP verification client:
```powershell
npm run mcp:verify
```

### Connect to an MCP Client (e.g. Claude Desktop)
Add the following to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "reporadar": {
      "command": "node",
      "args": ["path/to/repo-radar/mcp-server/index.ts"]
    }
  }
}
```

### Available MCP Tools
1. `get_trending_repositories`: Retrieve top repositories by momentum score.
2. `search_repositories`: Search repositories by keyword, topic, or language.
3. `get_repository_details`: Full details and metric snapshots for a repository.
4. `get_repository_summary`: AI architectural summary and beginner explanation.
5. `compare_repositories`: Side-by-side comparison of 2-3 repositories.
6. `get_repository_activity`: Historical star and fork snapshots over time.
7. `find_repositories_by_topic`: Discover repositories matching an ecosystem tag.
8. `get_trending_topics`: Most frequent topics across monitored repositories.
9. `get_language_statistics`: Language market share and percentages.

---

## 📋 Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts Next.js development server on port 3000 (Webpack mode) |
| `npm run build` | Builds optimized production bundle |
| `npm run db:push` | Pushes Prisma schema changes to SQLite |
| `npm run db:seed` | Populates SQLite database with 12 repositories and snapshots |
| `npm run db:studio` | Opens visual database browser (Prisma Studio) |
| `npm run mcp:start` | Launches MCP Server on stdio |
| `npm run mcp:verify` | Runs MCP client verification test |
| `npm test` | Runs the Vitest suite (20 tests) |
| `npm run test:watch` | Runs Vitest in watch mode |
| `npx tsc --noEmit` | Validates TypeScript types across the entire project |

---

## 📄 License

MIT License. Built for open-source exploration and intelligence.
