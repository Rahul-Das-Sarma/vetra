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
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import { useVetraStore } from "@/lib/store";

export default function TemplatesPage() {
  const templates = useVetraStore((s) => s.templates);
  const upsertTemplate = useVetraStore((s) => s.upsertTemplate);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sections, setSections] = useState(
    "Executive Summary\nCareer Timeline\nMandate Fit\nRecruiter Assessment"
  );
  const [toneNotes, setToneNotes] = useState(
    "Third-person professional. Exact firm phrasing. Flag unknowns."
  );

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    upsertTemplate({
      id: `tpl-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      description: description.trim() || "Custom firm dossier template",
      sections: sections
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      toneNotes: toneNotes.trim(),
      updatedAt: new Date().toISOString(),
    });
    setName("");
    setDescription("");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Firm templates
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Exact template fidelity is the core wedge — configure your firm’s
          dossier structure and tone.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configure template</CardTitle>
            <CardDescription>
              Upload/configure one firm dossier template for MVP pilots.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="name">Template name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Partner Classic"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Description</Label>
                <Input
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sections">Sections (one per line)</Label>
                <Textarea
                  id="sections"
                  value={sections}
                  onChange={(e) => setSections(e.target.value)}
                  className="min-h-32"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tone">Language / methodology notes</Label>
                <Textarea
                  id="tone"
                  value={toneNotes}
                  onChange={(e) => setToneNotes(e.target.value)}
                />
              </div>
              <Button type="submit">Save template</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>
                  {template.description}
                  <span className="mt-1 block">
                    Updated {formatDate(template.updatedAt)}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {template.sections.map((section) => (
                    <Badge key={section} variant="outline">
                      {section}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {template.toneNotes}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
