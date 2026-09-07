"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVetraStore } from "@/lib/store";

export default function NewDossierPage() {
  const router = useRouter();
  const mandates = useVetraStore((s) => s.mandates);
  const templates = useVetraStore((s) => s.templates);
  const createDossier = useVetraStore((s) => s.createDossier);

  const [candidateName, setCandidateName] = useState("");
  const [targetRole, setTargetRole] = useState(mandates[0]?.role ?? "");
  const [client, setClient] = useState(mandates[0]?.client ?? "");
  const [mandateId, setMandateId] = useState(mandates[0]?.id ?? "");
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");

  function onMandateChange(nextId: string) {
    setMandateId(nextId);
    const mandate = mandates.find((m) => m.id === nextId);
    if (mandate) {
      setTargetRole(mandate.role);
      setClient(mandate.client);
    }
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!candidateName.trim() || !mandateId || !templateId) return;
    const id = createDossier({
      candidateName: candidateName.trim(),
      targetRole: targetRole.trim(),
      client: client.trim(),
      mandateId,
      templateId,
    });
    router.push(`/dossiers/${id}`);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          New dossier
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start from a search mandate and firm template, then ingest sources.
        </p>
      </div>

      <Card>
        <form onSubmit={handleCreate}>
          <CardHeader>
            <CardTitle>Candidate intake</CardTitle>
            <CardDescription>
              MVP scope: CV, notes, transcript/audio, mandate, one firm template.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="candidate">Candidate name</Label>
              <Input
                id="candidate"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. Elena March"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mandate">Search mandate</Label>
              <select
                id="mandate"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={mandateId}
                onChange={(e) => onMandateChange(e.target.value)}
                required
              >
                {mandates.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="role">Target role</Label>
                <Input
                  id="role"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client">Client</Label>
                <Input
                  id="client"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="template">Firm dossier template</Label>
              <select
                id="template"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                required
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.description}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2 border-t">
            <Button variant="outline" render={<Link href="/dossiers" />} nativeButton={false}>
              Cancel
            </Button>
            <Button type="submit">Create & continue to ingest</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
