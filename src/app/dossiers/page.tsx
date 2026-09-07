"use client";

import Link from "next/link";
import { FilePlus2, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, initials, statusChipClass, statusLabel } from "@/lib/format";
import { useVetraStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function DossiersPage() {
  const dossiers = useVetraStore((s) => s.dossiers);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dossiers</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            List view of client-ready presentations — dense, low-click.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="spott-chip bg-accent text-accent-foreground">
            <LayoutList className="mr-1 size-3" />
            List
          </span>
          <Button render={<Link href="/dossiers/new" />} nativeButton={false}>
            <FilePlus2 data-icon="inline-start" />
            New dossier
          </Button>
        </div>
      </div>

      <div className="spott-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold">All dossiers</h2>
            <p className="text-[12px] text-muted-foreground">
              AI drafts · recruiter approves · never auto-decides
            </p>
          </div>
          <span className="text-[12px] text-muted-foreground">
            {dossiers.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Candidate</th>
                <th className="px-4 py-2.5 font-medium">Role / Client</th>
                <th className="px-4 py-2.5 font-medium">Stage</th>
                <th className="px-4 py-2.5 font-medium">Evidence</th>
                <th className="px-4 py-2.5 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dossiers.map((d) => {
                const supported = d.claims.filter((c) => c.supported).length;
                return (
                  <tr key={d.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dossiers/${d.id}`}
                        className="flex items-center gap-2.5 font-semibold hover:text-primary"
                      >
                        <span className="flex size-8 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                          {initials(d.candidateName)}
                        </span>
                        {d.candidateName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {d.targetRole}
                      <div className="text-[12px]">{d.client}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("spott-chip", statusChipClass(d.status))}>
                        {statusLabel(d.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {d.claims.length === 0
                        ? "—"
                        : `${supported}/${d.claims.length} evidenced`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(d.updatedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
