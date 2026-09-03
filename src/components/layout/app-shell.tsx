"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderKanban,
  LayoutDashboard,
  Search,
  ScrollText,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dossiers", label: "Dossiers", icon: FileText },
  { href: "/mandates", label: "Mandates", icon: FolderKanban },
  { href: "/templates", label: "Templates", icon: ScrollText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 flex h-screen w-[232px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-5 text-sidebar-foreground">
        <div className="mb-6 px-2">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="text-[15px] font-semibold tracking-tight text-foreground">
                Vetra
              </div>
              <div className="text-[11px] text-muted-foreground">
                Dossier workspace
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl bg-accent/70 p-3 text-[11px] leading-relaxed text-accent-foreground">
          <p className="font-semibold">Do more, click less</p>
          <p className="mt-1 opacity-80">
            File-in → evidence → firm dossier. Coexists with your stack.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-12 items-center gap-3 border-b border-border bg-card/90 px-5 backdrop-blur">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-muted-foreground">
            <Search className="size-3.5 shrink-0" />
            <span className="truncate">Search dossiers, mandates, candidates…</span>
            <kbd className="ml-auto hidden rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium sm:inline">
              ⌘K
            </kbd>
          </div>
          <div className="flex items-center gap-2">
            <span className="spott-chip bg-success text-success-foreground">
              Pilot
            </span>
            <div className="flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              Y
            </div>
          </div>
        </header>
        <main className="flex-1 px-5 py-5">{children}</main>
      </div>
    </div>
  );
}
