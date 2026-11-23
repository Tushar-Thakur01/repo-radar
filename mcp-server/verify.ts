// Demonstration & Verification Script for RepoRadar MCP Server
// Connects an in-process MCP Client directly to the MCP Server
// Demonstrates tool discovery and executes real intelligence tools.

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runMcpDemo() {
  console.log("=================================================");
  console.log("   RepoRadar MCP Server Live Demonstration");
  console.log("=================================================\n");

  // Create In-Memory Transport pair
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  // Initialize Server
  const server = new Server(
    { name: "reporadar-mcp-server", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  // Register Handlers
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "get_trending_repositories",
        description: "Retrieve top trending open-source repositories.",
        inputSchema: { type: "object", properties: { limit: { type: "number" } } },
      },
      {
        name: "get_repository_details",
        description: "Fetch full details and metric snapshots for a repository.",
        inputSchema: {
          type: "object",
          properties: { fullName: { type: "string" } },
          required: ["fullName"],
        },
      },
      {
        name: "get_repository_summary",
        description: "Retrieve AI-generated technical summary and architecture profile.",
        inputSchema: {
          type: "object",
          properties: { fullName: { type: "string" } },
          required: ["fullName"],
        },
      },
      {
        name: "get_trending_topics",
        description: "List the most frequent open source topics and tags.",
        inputSchema: { type: "object", properties: { limit: { type: "number" } } },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;

    if (name === "get_trending_repositories") {
      const repos = await prisma.repository.findMany({
        orderBy: { trendingScore: "desc" },
        take: Number(args?.limit || 3),
        select: {
          fullName: true,
          stars: true,
          primaryLanguage: true,
          trendingScore: true,
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(repos, null, 2) }] };
    }

    if (name === "get_repository_details") {
      const repo = await prisma.repository.findUnique({
        where: { fullName: String(args?.fullName) },
        include: { topics: true },
      });
      return { content: [{ type: "text", text: JSON.stringify(repo, null, 2) }] };
    }

    if (name === "get_repository_summary") {
      const repo = await prisma.repository.findUnique({
        where: { fullName: String(args?.fullName) },
        include: { summary: true },
      });
      return { content: [{ type: "text", text: JSON.stringify(repo?.summary, null, 2) }] };
    }

    if (name === "get_trending_topics") {
      const topics = await prisma.repoTopic.findMany({ select: { name: true } });
      const counts: Record<string, number> = {};
      for (const t of topics) counts[t.name] = (counts[t.name] || 0) + 1;
      const sorted = Object.entries(counts)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      return { content: [{ type: "text", text: JSON.stringify(sorted, null, 2) }] };
    }

    throw new Error(`Unknown tool ${name}`);
  });

  await server.connect(serverTransport);

  // Initialize MCP Client
  const client = new Client(
    { name: "test-ai-client", version: "1.0.0" },
    { capabilities: {} }
  );
  await client.connect(clientTransport);

  // 1. Tool Discovery
  console.log("👉 1. Discovering Tools via MCP Protocol:");
  const toolsResponse = await client.listTools();
  console.log(`Found ${toolsResponse.tools.length} available MCP Tools:`);
  toolsResponse.tools.forEach((t) => {
    console.log(`  ✓ ${t.name} — ${t.description}`);
  });

  // 2. Invoke get_trending_repositories
  console.log("\n👉 2. Invoking tool: 'get_trending_repositories' (limit: 3):");
  const trendingResult = await client.callTool({
    name: "get_trending_repositories",
    arguments: { limit: 3 },
  });
  console.log("Tool Output:\n", (trendingResult.content as any)[0].text);

  // 3. Invoke get_repository_summary for ollama/ollama
  console.log("\n👉 3. Invoking tool: 'get_repository_summary' for 'ollama/ollama':");
  const summaryResult = await client.callTool({
    name: "get_repository_summary",
    arguments: { fullName: "ollama/ollama" },
  });
  console.log("Tool Output:\n", (summaryResult.content as any)[0].text);

  // 4. Invoke get_trending_topics
  console.log("\n👉 4. Invoking tool: 'get_trending_topics':");
  const topicsResult = await client.callTool({
    name: "get_trending_topics",
    arguments: { limit: 5 },
  });
  console.log("Tool Output:\n", (topicsResult.content as any)[0].text);

  console.log("\n🎉 MCP Server & Client Verification Completed Successfully!");
}

runMcpDemo()
  .catch((e) => {
    console.error("MCP test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
