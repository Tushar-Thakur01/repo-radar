import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aiService } from "@/lib/ai";
import {
  chatRequestSchema,
  errorMessage,
  formatValidationIssues,
} from "@/lib/validation";

export const dynamic = "force-dynamic";

type ChatContextRepo = {
  id: string;
  fullName: string;
  stars: number;
  primaryLanguage: string | null;
  trendingScore: number;
  description: string | null;
  summary: { beginnerTake: string | null } | null;
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatValidationIssues(parsed.error),
        },
        { status: 400 }
      );
    }

    const { message } = parsed.data;
    const q = message.toLowerCase().trim();

    // 1. Tool-based Structured Retrieval against SQLite
    let contextRepos: ChatContextRepo[] = [];
    let toolExplanation = "";

    if (q.includes("mcp") || q.includes("model context protocol")) {
      contextRepos = await prisma.repository.findMany({
        where: {
          OR: [
            { topics: { some: { name: { contains: "mcp" } } } },
            { description: { contains: "mcp" } },
            { fullName: { contains: "mcp" } },
          ],
        },
        include: { topics: true, summary: true },
        take: 4,
      });
      toolExplanation = "Queried database for repositories tagged with Model Context Protocol (MCP).";
    } else if (q.includes("trending") || q.includes("hot") || q.includes("fastest") || q.includes("growth")) {
      contextRepos = await prisma.repository.findMany({
        orderBy: { trendingScore: "desc" },
        include: { topics: true, summary: true },
        take: 4,
      });
      toolExplanation = "Queried top repositories sorted by RepoRadar momentum score.";
    } else if (q.includes("ai") || q.includes("llm") || q.includes("agent")) {
      contextRepos = await prisma.repository.findMany({
        where: {
          OR: [
            { topics: { some: { name: { in: ["ai", "llm", "agents", "machine-learning"] } } } },
            { description: { contains: "llm" } },
            { description: { contains: "ai" } },
          ],
        },
        include: { topics: true, summary: true },
        take: 4,
      });
      toolExplanation = "Filtered repositories matching AI, LLM, and Agent ecosystem tags.";
    } else if (q.includes("graphql")) {
      contextRepos = await prisma.repository.findMany({
        where: {
          OR: [
            { topics: { some: { name: "graphql" } } },
            { description: { contains: "graphql" } },
          ],
        },
        include: { topics: true, summary: true },
        take: 4,
      });
      toolExplanation = "Retrieved repositories related to GraphQL specifications and servers.";
    } else if (q.includes("typescript") || q.includes("python") || q.includes("rust") || q.includes("go")) {
      const match = q.match(/(typescript|python|rust|go)/i);
      const targetLang = match ? match[1] : "TypeScript";
      contextRepos = await prisma.repository.findMany({
        where: {
          primaryLanguage: { equals: targetLang },
        },
        orderBy: { stars: "desc" },
        include: { topics: true, summary: true },
        take: 4,
      });
      toolExplanation = `Retrieved top repositories using ${targetLang}.`;
    } else {
      // General fuzzy search on query keywords
      const words = q.split(/\s+/).filter((w) => w.length > 2);
      contextRepos = await prisma.repository.findMany({
        where: {
          OR: words.map((w) => ({
            OR: [
              { fullName: { contains: w } },
              { description: { contains: w } },
              { topics: { some: { name: { contains: w } } } },
            ],
          })),
        },
        include: { topics: true, summary: true },
        take: 4,
      });
      toolExplanation = `Searched repository catalog for keywords: "${words.join(", ")}"`;
    }

    // 2. Synthesize Grounded Response
    const repoListSummary = contextRepos.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      stars: r.stars,
      language: r.primaryLanguage,
      trendingScore: r.trendingScore,
      description: r.description,
      beginnerTake: r.summary?.beginnerTake,
    }));

    let reply = "";

    // Check if Ollama is available for natural language synthesis
    const status = await aiService.checkOllamaStatus();
    if (status.available && contextRepos.length > 0) {
      try {
        const prompt = `User question: "${message}"
Available verified repository facts from database:
${JSON.stringify(repoListSummary, null, 2)}

Provide a helpful, precise answer grounded strictly in the data above. Do not hallucinate metrics. If data is limited, explain what is available.`;

        const res = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3.2",
            prompt,
            stream: false,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (res.ok) {
          const data = await res.json();
          reply = data.response;
        }
      } catch {
        // Fallback to structured response
      }
    }

    if (!reply) {
      // High-quality deterministic assistant response
      if (contextRepos.length === 0) {
        reply = `I searched the RepoRadar database for "${message}", but didn't find matching repositories in the currently tracked catalog. You can discover and index new repositories anytime via the Discover page!`;
      } else {
        reply = `Based on RepoRadar's database records (${toolExplanation}):\n\n` +
          contextRepos
            .map(
              (r, i) =>
                `**${i + 1}. [${r.fullName}](https://github.com/${r.fullName})** (${r.stars.toLocaleString()} ★ | ${r.primaryLanguage || "General"})\n` +
                `- **Overview**: ${r.description || "Open source project"}\n` +
                `- **Momentum Score**: ${r.trendingScore} / 100\n` +
                (r.summary?.beginnerTake ? `- **Take**: ${r.summary.beginnerTake}\n` : "")
            )
            .join("\n");
      }
    }

    return NextResponse.json({
      reply,
      groundedRepos: repoListSummary,
      toolExplanation,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: errorMessage(error, "Failed to process chat message") },
      { status: 500 }
    );
  }
}
