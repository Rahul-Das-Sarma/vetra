"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useVetraStore } from "@/lib/store";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function CloudSyncInner() {
  const { isSignedIn, isLoaded } = useAuth();
  const hydrateFromCloud = useVetraStore((s) => s.hydrateFromCloud);
  const getSnapshot = useVetraStore((s) => s.getSnapshot);
  const [status, setStatus] = useState<"idle" | "loading" | "synced" | "error">(
    "idle"
  );
  const [error, setError] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedOnce = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || loadedOnce.current) return;
    loadedOnce.current = true;
    setStatus("loading");
    fetch("/api/workspace")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load workspace");
        }
        hydrateFromCloud(data.workspace);
        setStatus("synced");
      })
      .catch((err) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Sync failed");
      });
  }, [isLoaded, isSignedIn, hydrateFromCloud]);

  useEffect(() => {
    if (!isSignedIn) return;

    const unsub = useVetraStore.subscribe(() => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const snap = getSnapshot();
        fetch("/api/workspace", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(snap),
        }).catch(() => {
          /* ignore transient save errors in UI */
        });
      }, 1200);
    });

    return () => {
      unsub();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [isSignedIn, getSnapshot]);

  if (status === "loading") {
    return (
      <div className="border-b border-border bg-muted/40 px-5 py-1.5 text-[11px] text-muted-foreground">
        Loading workspace from Supabase…
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="border-b border-destructive/20 bg-destructive/5 px-5 py-1.5 text-[11px] text-destructive">
        Cloud sync: {error}
      </div>
    );
  }
  if (status === "synced") {
    return (
      <div className="border-b border-border bg-success/10 px-5 py-1.5 text-[11px] text-success-foreground">
        Synced with Supabase
      </div>
    );
  }
  return null;
}

export function CloudSyncBanner() {
  if (!clerkEnabled) return null;
  return <CloudSyncInner />;
}
