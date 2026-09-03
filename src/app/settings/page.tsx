"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";
import { useVetraStore } from "@/lib/store";

export default function SettingsPage() {
  const retention = useVetraStore((s) => s.retention);
  const setRetention = useVetraStore((s) => s.setRetention);
  const auditLog = useVetraStore((s) => s.auditLog);
  const [days, setDays] = useState(String(retention.retainDays));
  const [autoDelete, setAutoDelete] = useState(retention.autoDeleteExports);

  function saveRetention(e: React.FormEvent) {
    e.preventDefault();
    setRetention({
      retainDays: Number(days) || 90,
      autoDeleteExports: autoDelete,
      trainOnCustomerData: false,
    });
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Settings & audit
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configurable retention, no training on customer data, basic audit log.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4" />
              Retention & privacy
            </CardTitle>
            <CardDescription>
              CVs, compensation and interview notes are confidential. DPA,
              encryption and access controls belong in production hardening.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveRetention} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="days">Retain materials (days)</Label>
                <Input
                  id="days"
                  type="number"
                  min={7}
                  max={3650}
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoDelete}
                  onChange={(e) => setAutoDelete(e.target.checked)}
                  className="size-4 rounded border"
                />
                Auto-delete generated exports after retention window
              </label>
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Policy</Badge>
                  <span className="font-medium">No training on customer data</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  This toggle is fixed off for Vetra pilots and cannot be enabled.
                </p>
              </div>
              <Button type="submit">Save retention policy</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit log</CardTitle>
            <CardDescription>
              Generation, approval, export and settings changes.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[32rem] space-y-3 overflow-y-auto">
            {auditLog.map((event) => (
              <div key={event.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{event.action}</p>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(event.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {event.entityType}:{event.entityId} · {event.actor}
                </p>
                {event.detail && (
                  <p className="mt-1 text-xs text-muted-foreground">{event.detail}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
