// Sidebar navigation component
// The main navigation for RepoRadar
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  GitCompare,
  MessageSquare,
  Compass,
  TrendingUp,
  Settings,
  Radar,
  Moon,
  Sun,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview and stats",
  },
  {
    label: "Discover",
    href: "/discover",
    icon: Compass,
    description: "Find repositories",
  },
  {
    label: "Trending",
    href: "/trending",
    icon: TrendingUp,
    description: "What's hot",
  },
  {
    label: "Compare",
    href: "/compare",
    icon: GitCompare,
    description: "Side by side",
  },
  {
    label: "MCP Tools",
    href: "/mcp",
    icon: Terminal,
    description: "Live protocol console",
  },
  {
    label: "AI Assistant",
    href: "/chat",
    icon: MessageSquare,
    description: "Ask about repos",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r transition-all duration-300",
        "bg-sidebar text-sidebar-foreground border-sidebar-border",
        "flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Radar className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">RepoRadar</span>
            <span className="text-[10px] text-muted-foreground">
              GitHub Intelligence
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border p-2 space-y-1">
        {/* Theme toggle */}
        <div className="flex items-center gap-1 px-1">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "flex-1 flex items-center justify-center rounded-md p-2 transition-colors",
              theme === "light"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Light mode"
          >
            <Sun className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex-1 flex items-center justify-center rounded-md p-2 transition-colors",
              theme === "dark"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Dark mode"
          >
            <Moon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTheme("system")}
            className={cn(
              "flex-1 flex items-center justify-center rounded-md p-2 transition-colors",
              theme === "system"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="System theme"
          >
            <Monitor className="h-4 w-4" />
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
