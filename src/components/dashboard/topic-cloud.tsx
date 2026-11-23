// Topic cloud — shows popular topics
import { cn } from "@/lib/utils";
import type { TopicStat } from "@/types";

interface TopicCloudProps {
  data: TopicStat[];
}

export function TopicCloud({ data }: TopicCloudProps) {
  const max = Math.max(...data.map((d) => d.count));

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">
        Popular Topics
      </h3>
      <div className="flex flex-wrap gap-2">
        {data.map((topic) => {
          const intensity = topic.count / max;
          return (
            <span
              key={topic.topic}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-default",
                intensity >= 0.7
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : intensity >= 0.4
                  ? "bg-secondary text-secondary-foreground border border-transparent"
                  : "bg-muted text-muted-foreground border border-transparent"
              )}
            >
              {topic.topic}
              <span className="text-[10px] opacity-60">({topic.count})</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
