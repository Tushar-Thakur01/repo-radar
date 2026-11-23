# RepoRadar — Production Deployment Plan & Guide

**Target Audience:** Recruiters, Engineering Managers, and Technical Reviewers  
**Cost:** $0.00 / month (100% Free Tiers, No Credit Card Required)  
**Status:** Architecture Analyzed — Ready for Deployment  

---

## 1. Project Architecture & Tech Stack Analysis

| Layer | Local Implementation | Production Deployment Plan | Why Selected |
|---|---|---|---|
| **Frontend & UI** | Next.js 16 (App Router), Tailwind CSS v4, Recharts | **Vercel** (Hobby Tier - Free) | Framework creators; native zero-config support for Next.js 16, App Router, SSR, Server Components, and API routes. Free SSL and custom domain. |
| **Backend & GraphQL** | GraphQL Yoga 6 mounted at `/api/graphql` | Hosted inside the same Next.js monolith on **Vercel** | Single-app monolith architecture eliminates cross-origin CORS issues, avoids maintaining separate servers, and stays within free tier limits. |
| **Database** | SQLite (`prisma/dev.db`) | **Neon Serverless PostgreSQL** (Free Tier - 0.5 GB) | Serverless platforms like Vercel have ephemeral file systems, so SQLite cannot persist data. Neon provides free hosted Postgres with native pooled connection strings (`?sslmode=require`) and no credit card required. |
| **GitHub Integration** | `src/lib/github.ts` (REST API v3) | Server-side API handler calling `api.github.com` | Authenticated requests via server-side `GITHUB_TOKEN` environment variable on Vercel. Keeps tokens completely hidden from client browsers while raising limits to 5,000 req/hr. |
| **AI Summaries** | Ollama (`llama3.2`) + Heuristic Fallback | Built-in **Deterministic Heuristic Engine** | Local Ollama models require 4GB+ RAM and GPU/CPU power unavailable on free cloud hosts. RepoRadar's fallback engine analyzes repository features, READMEs, and topics deterministically without downtime or paid API fees. |
| **Model Context Protocol (MCP)** | Stdio transport in `mcp-server/index.ts` | **Triple-Channel MCP Showcase** (Web Inspector + Remote HTTP/SSE + Stdio) | Gives recruiters 3 ways to test and experience the 9 MCP tools (browser console, remote SSE endpoint, and local Claude Desktop/Cursor configuration). |

---

## 2. Remote MCP Server Strategy for Recruiters

Recruiters review portfolios in a browser and rarely want to install local software or configure JSON files just to see your MCP tools in action. 

To make your MCP server genuinely testable and impressive to external reviewers, RepoRadar uses a **Triple-Channel Showcase**:

1. **In-Browser MCP Tool Console (`/mcp`)**:
   - An interactive page directly on your live website.
   - Allows any recruiter to select from all 9 MCP tools (`get_trending_repositories`, `get_repository_details`, `compare_repositories`, etc.), enter parameters, click **"Execute Tool"**, and see the live result.
   - Displays the raw JSON-RPC 2.0 request and response protocol payloads.
2. **Remote MCP HTTP/SSE Endpoint (`/api/mcp`)**:
   - An SSE endpoint for external MCP clients that support remote HTTP connections.
3. **Local Desktop Integration**:
   - 1-click configuration snippet provided in the UI for reviewers using **Claude Desktop** or **Cursor** locally.

---

## 3. Required Accounts (All Free, No Credit Card Required)

1. **GitHub Account**: To host the source code repository.
2. **Vercel Account**: Sign in with GitHub at [vercel.com](https://vercel.com).
3. **Neon Account**: Sign in with GitHub at [neon.tech](https://neon.tech) to create the free PostgreSQL database.

---

## 4. Production Environment Variables

These variables are set in the **Vercel Project Settings → Environment Variables**:

| Variable | Example Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` | Pooled connection string from Neon. |
| `GITHUB_TOKEN` | `ghp_...` (optional read-only token) | Increases GitHub REST rate limit from 60 to 5,000 req/hr. |
| `NEXT_PUBLIC_APP_URL` | `https://your-app-name.vercel.app` | Production app origin URL. |
| `NODE_ENV` | `production` | Enables production caching, bundling, and security headers. |

---

## 5. Deployment Step-by-Step Procedure

### Step 1: Provision Free Database on Neon
1. Go to [neon.tech](https://neon.tech) and click **Sign in with GitHub**.
2. Click **Create Project**, name it `reporadar-prod`, and choose the nearest AWS region.
3. In the connection details, select **Prisma** format and copy the connection string:
   `postgresql://alex:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`

### Step 2: Push Schema & Seed Initial Repositories to Cloud
We will switch Prisma provider to `postgresql`, run `npx prisma db push` with your Neon connection string, and run `npm run db:seed` so your cloud database starts with the full catalog.

### Step 3: Deploy to Vercel
1. Push your Git repository to your GitHub account.
2. In Vercel, click **Add New... → Project** and import `repo-radar`.
3. Add the environment variables:
   - `DATABASE_URL` (from Neon)
   - `GITHUB_TOKEN` (optional)
   - `NEXT_PUBLIC_APP_URL` (`https://<project-name>.vercel.app`)
4. Click **Deploy**. Vercel will build and launch your site.

### Step 4: Verification & Testing
- Test Dashboard live loading.
- Test Search (e.g., "Next.js", "MCP", "AI").
- Test "Crawl GitHub Live" button to fetch new repositories.
- Test the interactive `/mcp` tool inspector.
- Verify GraphiQL playground at `/api/graphql`.
