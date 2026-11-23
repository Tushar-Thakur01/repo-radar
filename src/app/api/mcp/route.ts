import { NextResponse } from "next/server";
import { MCP_TOOLS_SPEC, executeMcpTool } from "@/lib/mcp-tools";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    name: "reporadar-mcp-server",
    version: "1.0.0",
    protocolVersion: "2024-11-05",
    description: "RepoRadar Model Context Protocol server exposing repository intelligence tools.",
    tools: MCP_TOOLS_SPEC,
    endpoints: {
      jsonRpc: "/api/mcp",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          error: { code: -32700, message: "Parse error: Invalid JSON" },
          id: null,
        },
        { status: 400 }
      );
    }

    const { jsonrpc, id, method, params } = body;

    // Handle tools/list
    if (method === "tools/list") {
      return NextResponse.json({
        jsonrpc: jsonrpc || "2.0",
        id: id ?? null,
        result: {
          tools: MCP_TOOLS_SPEC,
        },
      });
    }

    // Handle tools/call
    if (method === "tools/call") {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};

      if (!toolName) {
        return NextResponse.json(
          {
            jsonrpc: jsonrpc || "2.0",
            id: id ?? null,
            error: { code: -32602, message: "Invalid params: missing tool name" },
          },
          { status: 400 }
        );
      }

      try {
        const result = await executeMcpTool(toolName, toolArgs);
        return NextResponse.json({
          jsonrpc: jsonrpc || "2.0",
          id: id ?? null,
          result,
        });
      } catch (toolError: any) {
        return NextResponse.json({
          jsonrpc: jsonrpc || "2.0",
          id: id ?? null,
          error: {
            code: -32000,
            message: toolError.message || "Error executing MCP tool",
          },
        });
      }
    }

    // Handle ping
    if (method === "ping") {
      return NextResponse.json({
        jsonrpc: jsonrpc || "2.0",
        id: id ?? null,
        result: {},
      });
    }

    return NextResponse.json(
      {
        jsonrpc: jsonrpc || "2.0",
        id: id ?? null,
        error: { code: -32601, message: `Method not found: ${method}` },
      },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32603, message: error.message || "Internal server error" },
      },
      { status: 500 }
    );
  }
}
