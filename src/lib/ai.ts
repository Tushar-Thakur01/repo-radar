// AI Repository Analysis Service for RepoRadar
// Integrates with local Ollama when available, and provides an intelligent
// deterministic heuristic fallback when offline.
// All summaries are cached in SQLite via Prisma.

import { prisma } from "./prisma";

export interface AISummaryResult {
  summary: string;
  architecture: string;
  keyFeatures: string;
  useCases: string;
  limitations: string;
  beginnerTake: string;
  modelName: string;
  isAiGenerated: boolean;
}

export class AIService {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    this.model = process.env.OLLAMA_MODEL || "llama3.2";
  }

  /**
   * Check if local Ollama daemon is reachable
   */
  async checkOllamaStatus(): Promise<{ available: boolean; models: string[] }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(1500),
      });
      if (!res.ok) return { available: false, models: [] };
      const data = await res.json();
      const models = (data.models || []).map((m: any) => m.name);
      return { available: true, models };
    } catch {
      return { available: false, models: [] };
    }
  }

  /**
   * Deterministic heuristic analysis when Ollama is offline
   * Extracts insight from topics, description, language, and README structure
   */
  generateHeuristicAnalysis(repo: {
    fullName: string;
    description: string | null;
    primaryLanguage: string | null;
    stars: number;
    topics: string[];
    readmeContent?: string | null;
  }): AISummaryResult {
    const lang = repo.primaryLanguage || "Software";
    const desc = repo.description || "Open source project";
    const topicsStr = repo.topics.length > 0 ? repo.topics.slice(0, 5).join(", ") : "general development";

    // Extract potential sections from README if available
    let keyFeatures = "Modular architecture, active community development, open-source licensing.";
    if (repo.readmeContent) {
      const featuresMatch = repo.readmeContent.match(/##?\s*(?:features|highlights|why)[^\n]*\n([\s\S]{50,400}?)(?=\n##|$)/i);
      if (featuresMatch && featuresMatch[1]) {
        keyFeatures = featuresMatch[1].replace(/[*#`]/g, "").trim().slice(0, 300);
      }
    }

    return {
      summary: `${repo.fullName} is an open-source ${lang} project designed for ${desc.toLowerCase().replace(/\.$/, "")}. Tracked across tags: ${topicsStr}.`,
      architecture: `Engineered primarily in ${lang} with clean modular components. Relies on modern ${lang} packaging and dependencies.`,
      keyFeatures,
      useCases: `Enterprise software development, modern web and systems engineering, and open-source tooling workflows.`,
      limitations: `Requires understanding of ${lang} idioms and regular maintenance to match upstream ecosystem shifts.`,
      beginnerTake: `A reliable tool in the ${lang} ecosystem that solves "${desc}". Great project to star, inspect, and learn from.`,
      modelName: "heuristic-fallback-v1",
      isAiGenerated: false,
    };
  }

  /**
   * Analyze a repository using Ollama if online, or fallback gracefully
   */
  async analyzeRepository(
    repositoryId: string,
    readmeContent?: string | null
  ): Promise<AISummaryResult> {
    // 1. Check existing cached summary in database
    const cached = await prisma.repoSummary.findUnique({
      where: { repositoryId },
    });

    if (cached) {
      return {
        summary: cached.summary,
        architecture: cached.architecture || "Not specified",
        keyFeatures: cached.keyFeatures || "Not specified",
        useCases: cached.useCases || "Not specified",
        limitations: cached.limitations || "Not specified",
        beginnerTake: cached.beginnerTake || "Not specified",
        modelName: cached.modelName,
        isAiGenerated: cached.isAiGenerated,
      };
    }

    // 2. Fetch repository details
    const repo = await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: { topics: true },
    });

    if (!repo) throw new Error(`Repository ${repositoryId} not found`);

    const topics = repo.topics.map((t) => t.name);

    // 3. Attempt Ollama AI generation
    const status = await this.checkOllamaStatus();
    let result: AISummaryResult;

    if (status.available) {
      try {
        const prompt = `You are RepoRadar's senior AI software architect. Analyze this GitHub repository based on its facts:
Repository: ${repo.fullName}
Primary Language: ${repo.primaryLanguage || "Unknown"}
Description: ${repo.description || "None provided"}
Topics: ${topics.join(", ")}
README Sample: ${readmeContent ? readmeContent.slice(0, 1500) : "Not available"}

Provide structured JSON with these exact string keys:
{
  "summary": "2 concise sentences explaining what it does",
  "architecture": "Architecture and design pattern overview",
  "keyFeatures": "Key features bullet points",
  "useCases": "Realistic real-world use cases",
  "limitations": "Potential limitations or caveats",
  "beginnerTake": "Explanation in simple terms for a beginner"
}
Output only valid JSON.`;

        const res = await fetch(`${this.baseUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: this.model,
            prompt,
            format: "json",
            stream: false,
          }),
          signal: AbortSignal.timeout(25000),
        });

        if (res.ok) {
          const data = await res.json();
          const parsed = JSON.parse(data.response);
          result = {
            summary: parsed.summary || repo.description || "",
            architecture: parsed.architecture || "Modular design",
            keyFeatures: parsed.keyFeatures || "Core features",
            useCases: parsed.useCases || "General development",
            limitations: parsed.limitations || "None noted",
            beginnerTake: parsed.beginnerTake || "Good open source utility.",
            modelName: `ollama:${this.model}`,
            isAiGenerated: true,
          };
        } else {
          result = this.generateHeuristicAnalysis({
            fullName: repo.fullName,
            description: repo.description,
            primaryLanguage: repo.primaryLanguage,
            stars: repo.stars,
            topics,
            readmeContent,
          });
        }
      } catch (ollamaErr) {
        console.warn("Ollama generation timed out or failed, falling back to heuristic:", ollamaErr);
        result = this.generateHeuristicAnalysis({
          fullName: repo.fullName,
          description: repo.description,
          primaryLanguage: repo.primaryLanguage,
          stars: repo.stars,
          topics,
          readmeContent,
        });
      }
    } else {
      // Graceful offline fallback
      result = this.generateHeuristicAnalysis({
        fullName: repo.fullName,
        description: repo.description,
        primaryLanguage: repo.primaryLanguage,
        stars: repo.stars,
        topics,
        readmeContent,
      });
    }

    // 4. Cache in database
    await prisma.repoSummary.upsert({
      where: { repositoryId: repo.id },
      update: {
        ...result,
      },
      create: {
        repositoryId: repo.id,
        ...result,
      },
    });

    return result;
  }
}

export const aiService = new AIService();
