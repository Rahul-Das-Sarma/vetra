import type { DossierStatus, WorkflowStep } from "@/lib/types";

export const WORKFLOW_STEPS: { id: WorkflowStep; label: string }[] = [
  { id: "ingest", label: "Ingest" },
  { id: "extract", label: "Extract" },
  { id: "evidence", label: "Evidence" },
  { id: "draft", label: "Draft" },
  { id: "review", label: "Review" },
  { id: "qa", label: "QA" },
  { id: "export", label: "Export" },
];

export function statusLabel(status: DossierStatus) {
  const map: Record<DossierStatus, string> = {
    draft: "Draft",
    extracting: "Extracting",
    review: "In review",
    qa: "QA",
    approved: "Approved",
    exported: "Exported",
  };
  return map[status];
}

/** Soft pastel chips — Spott-style status language */
export function statusChipClass(status: DossierStatus) {
  const map: Record<DossierStatus, string> = {
    draft: "bg-secondary text-secondary-foreground",
    extracting: "bg-accent text-accent-foreground",
    review: "bg-warning text-warning-foreground",
    qa: "bg-warning text-warning-foreground",
    approved: "bg-success text-success-foreground",
    exported: "bg-success text-success-foreground",
  };
  return map[status];
}

export function statusVariant(
  status: DossierStatus
): "default" | "secondary" | "outline" | "destructive" {
  if (status === "exported" || status === "approved") return "default";
  if (status === "review" || status === "qa") return "secondary";
  if (status === "extracting") return "outline";
  return "outline";
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
