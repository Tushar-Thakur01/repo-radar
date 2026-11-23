import { describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const EXPECTED_TOOLS = [
  "get_trending_repositories",
  "search_repositories",
  "get_repository_details",
  "get_repository_summary",
  "compare_repositories",
  "get_repository_activity",
  "find_repositories_by_topic",
  "get_trending_topics",
  "get_language_statistics",
];

describe("RepoRadar MCP server", () => {
  it("exposes 9 well-formed tools over stdio", async () => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["mcp-server/index.ts"],
      cwd: process.cwd(),
      stderr: "pipe",
    });
    const client = new Client({ name: "reporadar-test", version: "1.0.0" });

    try {
      await client.connect(transport);
      const { tools } = await client.listTools();

      expect(tools).toHaveLength(EXPECTED_TOOLS.length);
      expect(tools.map((tool) => tool.name).sort()).toEqual(
        [...EXPECTED_TOOLS].sort()
      );
      expect(new Set(tools.map((tool) => tool.name)).size).toBe(tools.length);

      for (const tool of tools) {
        expect(tool.name).toMatch(/^[a-z_]+$/);
        expect(tool.description?.length ?? 0).toBeGreaterThan(0);
        expect(tool.inputSchema).toMatchObject({ type: "object" });

        const required = tool.inputSchema.required ?? [];
        for (const field of required) {
          expect(tool.inputSchema.properties).toHaveProperty(field);
        }
      }
    } finally {
      await client.close();
    }
  }, 20000);
});
