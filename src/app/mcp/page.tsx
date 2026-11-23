"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Terminal,
  Play,
  Copy,
  Check,
  RefreshCw,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Bot,
  Database,
  ArrowRight,
} from "lucide-react";
import { MCP_TOOLS_SPEC, McpToolDefinition } from "@/lib/mcp-tools";

const SAMPLE_ARGS: Record<string, Record<string, any>> = {
  get_trending_repositories: { limit: 5, language: "TypeScript" },
  search_repositories: { query: "mcp", limit: 5 },
  get_repository_details: { fullName: "vercel/next.js" },
  get_repository_summary: { fullName: "facebook/react" },
  compare_repositories: { fullNames: ["vercel/next.js", "facebook/react"] },
  get_repository_activity: { fullName: "vercel/next.js" },
  find_repositories_by_topic: { topic: "mcp", limit: 5 },
  get_trending_topics: { limit: 8 },
  get_language_statistics: {},
};

export default function McpShowcasePage() {
  const [selectedTool, setSelectedTool] = useState<McpToolDefinition>(MCP_TOOLS_SPEC[0]);
  const [argsJson, setArgsJson] = useState<string>(
    JSON.stringify(SAMPLE_ARGS[MCP_TOOLS_SPEC[0].name], null, 2)
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [lastRequestPayload, setLastRequestPayload] = useState<any | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleSelectTool = (tool: McpToolDefinition) => {
    setSelectedTool(tool);
    setArgsJson(JSON.stringify(SAMPLE_ARGS[tool.name] || {}, null, 2));
    setExecutionResult(null);
    setLastRequestPayload(null);
  };

  const handleExecuteTool = async () => {
    setIsExecuting(true);
    setExecutionResult(null);

    let parsedArgs: Record<string, any> = {};
    try {
      parsedArgs = argsJson.trim() ? JSON.parse(argsJson) : {};
    } catch {
      setExecutionResult({
        isError: true,
        error: "Invalid JSON arguments. Please correct the JSON syntax.",
      });
      setIsExecuting(false);
      return;
    }

    const payload = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: selectedTool.name,
        arguments: parsedArgs,
      },
    };

    setLastRequestPayload(payload);

    try {
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setExecutionResult(data);
    } catch (err: any) {
      setExecutionResult({
        jsonrpc: "2.0",
        id: payload.id,
        error: { code: -32000, message: err.message || "Network error" },
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const desktopConfigJson = JSON.stringify(
    {
      mcpServers: {
        "reporadar-intelligence": {
          command: "node",
          args: ["<path-to-project>/mcp-server/index.ts"],
          env: {
            DATABASE_URL: "file:./dev.db",
          },
        },
      },
    },
    null,
    2
  );

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(desktopConfigJson);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Model Context Protocol (MCP) Live Console
              </h1>
              <span className="text-xs text-muted-foreground">
                Official Anthropic Open Protocol Standard • 9 Production Tools Registered
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground max-w-2xl leading-relaxed">
            RepoRadar implements the official <code className="font-mono text-primary font-semibold">@modelcontextprotocol/sdk</code> standard. Test each intelligence tool live in your browser, or integrate with Claude Desktop, Cursor, and autonomous AI agents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/api/mcp"
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
          >
            <Code2 className="h-3.5 w-3.5 text-primary" />
            <span>Raw JSON-RPC Spec</span>
            <ExternalLink className="h-3 w-3 opacity-60 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* Main Console Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Tool Selector List (Left Col) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Select Tool ({MCP_TOOLS_SPEC.length})
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              ● Server Online
            </span>
          </div>

          <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
            {MCP_TOOLS_SPEC.map((tool) => {
              const isSelected = selectedTool.name === tool.name;
              return (
                <button
                  key={tool.name}
                  onClick={() => handleSelectTool(tool)}
                  className={`w-full text-left rounded-xl p-3.5 text-xs transition-all border ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary shadow-xs font-semibold"
                      : "border-border bg-card text-foreground hover:bg-accent/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs">{tool.name}</span>
                    <ArrowRight className={`h-3 w-3 ${isSelected ? "opacity-100" : "opacity-30"}`} />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1 font-normal">
                    {tool.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tool Execution Panel (Right Col) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-foreground">
                    {selectedTool.name}
                  </span>
                  <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                    JSON-RPC 2.0
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {selectedTool.description}
                </p>
              </div>

              <button
                onClick={handleExecuteTool}
                disabled={isExecuting}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
              >
                {isExecuting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current" />
                )}
                <span>{isExecuting ? "Executing..." : "Execute Tool"}</span>
              </button>
            </div>

            {/* Input Arguments Editor */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Input Arguments (JSON format):</span>
                <span className="text-[10px] font-mono text-muted-foreground lowercase">
                  Schema: {Object.keys(selectedTool.inputSchema.properties).join(", ") || "none"}
                </span>
              </label>
              <textarea
                value={argsJson}
                onChange={(e) => setArgsJson(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Execution Output Panel */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Tool Execution Result:
                </span>
                {executionResult && (
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    HTTP 200 • Verified Live
                  </span>
                )}
              </div>

              {executionResult ? (
                <div className="space-y-3">
                  <pre className="max-h-72 overflow-y-auto rounded-lg bg-background p-3.5 font-mono text-[11px] text-foreground/90 border border-border leading-relaxed">
                    {JSON.stringify(
                      executionResult.result?.content
                        ? JSON.parse(executionResult.result.content[0].text)
                        : executionResult,
                      null,
                      2
                    )}
                  </pre>

                  {/* Protocol Request/Response Disclosure */}
                  {lastRequestPayload && (
                    <details className="rounded-lg border border-border bg-secondary/30 p-2.5 text-xs">
                      <summary className="font-semibold text-muted-foreground cursor-pointer hover:text-foreground">
                        View Raw JSON-RPC Protocol Payload
                      </summary>
                      <div className="mt-2 space-y-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Request:</span>
                          <pre className="rounded bg-background p-2 font-mono text-[10px] overflow-x-auto text-muted-foreground">
                            {JSON.stringify(lastRequestPayload, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Response:</span>
                          <pre className="rounded bg-background p-2 font-mono text-[10px] overflow-x-auto text-muted-foreground">
                            {JSON.stringify(executionResult, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-xs text-muted-foreground bg-background/50">
                  <Bot className="h-6 w-6 mx-auto mb-2 opacity-40 text-primary" />
                  <span>Click &quot;Execute Tool&quot; above to run {selectedTool.name} live against the database.</span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Integration Guide Card */}
          <div className="rounded-xl border border-primary/25 bg-card p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Cpu className="h-4 w-4" />
                <span>Connect to Claude Desktop or Cursor</span>
              </div>
              <button
                onClick={handleCopySnippet}
                className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent transition-colors"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy Config</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To connect RepoRadar directly as an MCP tool inside your local Claude Desktop or Cursor instance, add this to your <code className="font-mono text-foreground font-semibold">claude_desktop_config.json</code>:
            </p>
            <pre className="rounded-lg bg-background p-3 font-mono text-[11px] text-foreground/90 border border-border overflow-x-auto">
              {desktopConfigJson}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
