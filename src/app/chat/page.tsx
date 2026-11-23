"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Database,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import type { ChatMessage } from "@/types";

const SUGGESTED_PROMPTS = [
  "What are the trending AI agent projects?",
  "Find repositories that use or implement MCP",
  "Recommend repositories suitable for learning GraphQL",
  "Show fastest-growing TypeScript frameworks",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      groundedRepos?: any[];
      toolExplanation?: string;
    }>
  >([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am **RepoRadar AI Assistant**. I have direct access to your local SQLite repository database and GitHub intelligence tools. Ask me about trending open-source projects, architecture comparisons, MCP tools, or frameworks to learn!",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const newMessages = [
      ...messages,
      { id: userMsgId, role: "user" as const, content: text },
    ];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.reply,
            groundedRepos: data.groundedRepos,
            toolExplanation: data.toolExplanation,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "Sorry, I encountered an issue processing that query.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Network error contacting repository intelligence service.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              RepoRadar AI Assistant
            </h1>
            <span className="demo-badge">Grounded in Database</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Queries live repository metrics, summaries & topics without hallucinations.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Factual Grounding Active</span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs leading-relaxed ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-4 shadow-xs space-y-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-card border border-border text-foreground"
              }`}
            >
              {/* Tool provenance pill */}
              {msg.toolExplanation && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground border-b border-border/60 pb-2">
                  <Database className="h-3 w-3 text-primary" />
                  <span>{msg.toolExplanation}</span>
                </div>
              )}

              {/* Message text with formatting */}
              <div className="whitespace-pre-line leading-relaxed">
                {msg.content}
              </div>

              {/* Grounded Repositories quick links */}
              {msg.groundedRepos && msg.groundedRepos.length > 0 && (
                <div className="pt-2 border-t border-border/60 space-y-1.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Direct Repository References:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundedRepos.map((r: any) => (
                      <Link
                        key={r.id}
                        href={`/repos/${r.id}`}
                        className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground hover:bg-accent transition-colors"
                      >
                        <span>{r.fullName}</span>
                        <ArrowRight className="h-3 w-3 opacity-60" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 text-xs justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-muted-foreground flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
              <span>Querying repository intelligence database...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Prompts */}
      <div className="py-2 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-muted-foreground shrink-0 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>Suggestions:</span>
        </span>
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="rounded-full border border-border bg-card px-3 py-1 text-muted-foreground hover:text-foreground hover:border-primary/40 shrink-0 transition-colors disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 border-t border-border pt-3"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question about open source repositories (e.g. 'Show fastest growing AI frameworks')..."
          disabled={isLoading}
          className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
