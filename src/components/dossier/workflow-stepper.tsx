"use client";

import { WORKFLOW_STEPS } from "@/lib/format";
import type { WorkflowStep } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WorkflowStepper({
  current,
  onSelect,
}: {
  current: WorkflowStep;
  onSelect?: (step: WorkflowStep) => void;
}) {
  const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === current);

  return (
    <ol className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1.5 shadow-[0_1px_2px_rgb(12_27_46_/_0.04)]">
      {WORKFLOW_STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = step.id === current;
        return (
          <li key={step.id} className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => onSelect?.(step.id)}
              className={cn(
                "flex w-full flex-col rounded-lg px-2.5 py-2 text-left transition-colors",
                active && "bg-accent text-accent-foreground",
                done && !active && "bg-success/60 text-success-foreground",
                !done && !active && "text-muted-foreground hover:bg-muted"
              )}
            >
              <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="truncate text-[12px] font-semibold">{step.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
