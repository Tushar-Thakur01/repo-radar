import { describe, it, expect } from "vitest";
import { GET, POST } from "@/app/api/mcp/route";

describe("Web MCP API Route (/api/mcp)", () => {
  it("GET /api/mcp returns server spec and all 9 tools", async () => {
    const res = await GET();
    const data = await res.json();
    expect(data.name).toBe("reporadar-mcp-server");
    expect(data.tools).toHaveLength(9);
  });

  it("POST /api/mcp with method 'tools/list' returns tools", async () => {
    const req = new Request("http://localhost/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.result.tools).toHaveLength(9);
    expect(data.id).toBe(1);
  });

  it("POST /api/mcp with method 'tools/call' executes get_trending_repositories", async () => {
    const req = new Request("http://localhost/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "get_trending_repositories",
          arguments: { limit: 3 },
        },
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.result).toBeDefined();
    expect(data.result.content).toHaveLength(1);
    const parsed = JSON.parse(data.result.content[0].text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0]).toHaveProperty("fullName");
    expect(parsed[0]).toHaveProperty("trendingScore");
  });

  it("POST /api/mcp with invalid tool name returns standard JSON-RPC error", async () => {
    const req = new Request("http://localhost/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "non_existent_tool_xyz",
        },
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe(-32000);
  });
});
