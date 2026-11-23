// Language chart — shows distribution of programming languages
"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { LanguageStat } from "@/types";

interface LanguageChartProps {
  data: LanguageStat[];
}

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Ruby: "#701516",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
};

const DEFAULT_COLORS = [
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#8b5cf6",
];

export function LanguageChart({ data }: LanguageChartProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">
        Languages
      </h3>
      <div className="flex items-center gap-6">
        <div className="w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={55}
                dataKey="count"
                nameKey="language"
                strokeWidth={2}
                stroke="var(--card)"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.language}
                    fill={
                      LANGUAGE_COLORS[entry.language] ||
                      DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  fontSize: "0.75rem",
                  color: "var(--card-foreground)",
                }}
                formatter={(value: any, name: any) => [
                  `${value} repos`,
                  String(name),
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {data.slice(0, 6).map((lang) => (
            <div key={lang.language} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    LANGUAGE_COLORS[lang.language] || "#64748b",
                }}
              />
              <span className="text-xs text-card-foreground truncate flex-1">
                {lang.language}
              </span>
              <span className="text-xs text-muted-foreground">
                {lang.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
