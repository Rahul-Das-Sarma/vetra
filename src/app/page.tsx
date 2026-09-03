"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FilePlus2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, initials, statusChipClass, statusLabel } from "@/lib/format";
import { useVetraStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const dossiers = useVetraStore((s) => s.dossiers);
  const mandates = useVetraStore((s) => s.mandates);
  const auditLog = useVetraStore((s) => s.auditLog);

  const inReview = dossiers.filter((d) => d.status === "review" || d.status === "qa").length;
  const unsupportedClaims = dossiers.reduce(
    (sum, d) => sum + d.claims.filter((c) => !c.supported).length,
    0
  );
  const approved = dossiers.filter(
    (d) => d.status === "approved" || d.status === "exported"
  ).length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            See what needs action across dossiers, evidence and approvals.
          </p>
        </div>
        <Button render={<Link href="/dossiers/new" />}>
          <FilePlus2 data-icon="inline-start" />
          New dossier
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Active dossiers",
            value: dossiers.length,
            hint: "In workspace",
            icon: null,
          },
          {
            label: "Needs action",
            value: inReview,
            hint: "Review / QA",
            icon: <Clock3 className="size-4 text-warning-foreground" />,
          },
          {
            label: "Unsupported claims",
            value: unsupportedClaims,
            hint: "Evidence gaps",
            icon: <ShieldAlert className="size-4 text-destructive" />,
          },
          {
            label: "Approved",
            value: approved,
            hint: `${mandates.length} mandates`,
            icon: <CheckCircle2 className="size-4 text-success-foreground" />,
          },
        ].map((stat) => (
          <div key={stat.label} className="spott-card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12px] font-medium text-muted-foreground">
                {stat.label}
              </p>
              {stat.icon}
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{stat.value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <div className="spott-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Recent dossiers</h2>
              <p className="text-[12px] text-muted-foreground">
                Open a row to continue the workflow.
              </p>
            </div>
            <Link
              href="/dossiers"
              className="text-[12px] font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {dossiers.map((dossier) => (
              <Link
                key={dossier.id}
                href={`/dossiers/${dossier.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
                  {initials(dossier.candidateName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-semibold">
                      {dossier.candidateName}
                    </p>
                    <span
                      className={cn(
                        "spott-chip shrink-0",
                        statusChipClass(dossier.status)
                      )}
                    >
                      {statusLabel(dossier.status)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                    {dossier.targetRole} · {dossier.client}
                  </p>
                </div>
                <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">
                  {formatDate(dossier.updatedAt)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="spott-card overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Activity</h2>
            <p className="text-[12px] text-muted-foreground">
              Live audit trail for trust and QA.
            </p>
          </div>
          <div className="divide-y divide-border">
            {auditLog.slice(0, 6).map((event) => (
              <div key={event.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-medium">{event.action}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatDate(event.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {event.actor}
                  {event.detail ? ` · ${event.detail}` : ""}
                </p>
              </div>
            ))}
            {auditLog.length === 0 && (
              <div className="flex items-center gap-2 px-4 py-6 text-[13px] text-muted-foreground">
                <AlertTriangle className="size-4" />
                No activity yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
