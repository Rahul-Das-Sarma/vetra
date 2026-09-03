"use client";

import { useState } from "react";
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

export default function MandatesPage() {
  const mandates = useVetraStore((s) => s.mandates);
  const createMandate = useVetraStore((s) => s.createMandate);

  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [role, setRole] = useState("");
  const [geography, setGeography] = useState("");
  const [mustHave, setMustHave] = useState("");
  const [niceToHave, setNiceToHave] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const must = mustHave
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const nice = niceToHave
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    createMandate({
      title: title.trim(),
      client: client.trim() || "Client TBD",
      role: role.trim() || "Role TBD",
      geography: geography.trim() || "Flexible",
      criteria: [
        ...must.map((label, i) => ({
          id: `mh-${i}`,
          label,
          type: "must-have" as const,
          covered: false,
        })),
        ...nice.map((label, i) => ({
          id: `nh-${i}`,
          label,
          type: "nice-to-have" as const,
          covered: false,
        })),
      ],
    });

    setTitle("");
    setClient("");
    setRole("");
    setGeography("");
    setMustHave("");
    setNiceToHave("");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Search mandates
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Must-have and nice-to-have criteria used for mandate/evidence alignment.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create mandate</CardTitle>
            <CardDescription>
              One line per criterion. Coverage is evaluated during dossier QA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="CFO — European Industrial Platform"
                  required
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="client">Client</Label>
                  <Input
                    id="client"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="geo">Geography</Label>
                <Input
                  id="geo"
                  value={geography}
                  onChange={(e) => setGeography(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="must">Must-have (one per line)</Label>
                <textarea
                  id="must"
                  className="min-h-24 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={mustHave}
                  onChange={(e) => setMustHave(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nice">Nice-to-have (one per line)</Label>
                <textarea
                  id="nice"
                  className="min-h-20 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={niceToHave}
                  onChange={(e) => setNiceToHave(e.target.value)}
                />
              </div>
              <Button type="submit">Save mandate</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {mandates.map((mandate) => (
            <Card key={mandate.id}>
              <CardHeader>
                <CardTitle>{mandate.title}</CardTitle>
                <CardDescription>
                  {mandate.client} · {mandate.role} · {mandate.geography}
                  <span className="block mt-1">
                    Created {formatDate(mandate.createdAt)}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {mandate.criteria.map((c) => (
                  <Badge
                    key={c.id}
                    variant={c.type === "must-have" ? "default" : "outline"}
                  >
                    {c.type === "must-have" ? "Must" : "Nice"}: {c.label}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
