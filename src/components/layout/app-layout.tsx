"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Compass,
  TrendingUp,
  GitCompare,
  MessageSquare,
  Radar,
  Moon,
  Sun,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  Database,
  Cpu,
  Layers,
  GitBranch,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: "Discover",
    href: "/discover",
    icon: Compass,
    badge: "API",
  },
  {
    label: "Trending",
    href: "/trending",
    icon: TrendingUp,
    badge: null,
  },
  {
    label: "Compare",
    href: "/compare",
    icon: GitCompare,
    badge: null,
  },
  {
    label: "AI Assistant",
    href: "/chat",
    icon: MessageSquare,
    badge: "Ollama",
  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r bg-sidebar border-sidebar-border transition-all duration-300",
          collapsed ? "w-18" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25">
              <Radar className="h-5 w-5 animate-pulse" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-foreground">
                  RepoRadar
                </span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Open Source Intelligence
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {!collapsed ? "Navigation" : "•••"}
          </div>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}

          {!collapsed && (
            <div className="pt-6">
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                System Status
              </div>
              <div className="mt-2 space-y-2 rounded-lg border border-border bg-card/50 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    GraphQL API
                  </span>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    SQLite DB
                  </span>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    MCP Server
                  </span>
                  <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                    Ready
                  </span>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Footer actions */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          {/* Theme switcher */}
          <div className="flex items-center gap-1 rounded-lg bg-secondary/60 p-1">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "flex-1 flex items-center justify-center rounded-md py-1.5 text-xs transition-colors",
                theme === "light"
                  ? "bg-card text-card-foreground shadow-xs font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Light mode"
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "flex-1 flex items-center justify-center rounded-md py-1.5 text-xs transition-colors",
                theme === "dark"
                  ? "bg-card text-card-foreground shadow-xs font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Dark mode"
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme("system")}
              className={cn(
                "flex-1 flex items-center justify-center rounded-md py-1.5 text-xs transition-colors",
                theme === "system"
                  ? "bg-card text-card-foreground shadow-xs font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="System theme"
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Collapse sidebar button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center rounded-lg border border-border py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 min-w-0",
          collapsed ? "lg:pl-18" : "lg:pl-64"
        )}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 md:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* <div className="relative hidden sm:block w-72 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Quick search repositories, topics, languages..."
                className="w-full rounded-lg border border-border bg-card/60 pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div> */}
          </div>

          <div className="flex items-center gap-3">
            <div className="demo-badge text-[11px] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
              Real & Demo Data Ready
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              <GitBranch className="h-3.5 w-3.5 text-primary" />
              <span>GitHub</span>
            </a>
          </div>
        </header>

        {/* Page Children */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-6 px-4 md:px-8 text-center text-xs text-muted-foreground">
          <p>
            RepoRadar — Autonomous Full-Stack Open Source Intelligence Platform
            with GraphQL, Prisma & MCP.
          </p>
        </footer>
      </div>
    </div>
  );
}
