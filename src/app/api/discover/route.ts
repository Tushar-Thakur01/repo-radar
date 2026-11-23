import { NextResponse } from "next/server";
import { githubService } from "@/lib/github";
import {
  discoverRequestSchema,
  errorMessage,
  formatValidationIssues,
} from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rateLimit = await githubService.checkRateLimit();
    return NextResponse.json({ rateLimit });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "Failed to check rate limit") },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = discoverRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatValidationIssues(parsed.error),
        },
        { status: 400 }
      );
    }

    const { query, topic, language, limit } = parsed.data;

    const discovered = await githubService.runDiscovery({
      query,
      topic,
      language,
      limit: limit ?? 10,
    });

    const rateLimit = await githubService.checkRateLimit();

    return NextResponse.json({
      success: true,
      count: discovered.length,
      repositories: discovered,
      rateLimit,
    });
  } catch (error) {
    console.error("Discovery error:", error);
    return NextResponse.json(
      { error: errorMessage(error, "Failed to run repository discovery") },
      { status: 500 }
    );
  }
}
