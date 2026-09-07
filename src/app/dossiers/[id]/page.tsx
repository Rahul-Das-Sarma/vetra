"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileUp,
  Link2,
  Sparkles,
} from "lucide-react";
import { WorkflowStepper } from "@/components/dossier/workflow-stepper";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, initials, statusChipClass, statusLabel } from "@/lib/format";
import { useVetraStore } from "@/lib/store";
import type { SourceKind, WorkflowStep } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function DossierDetailPage() {
  const params = useParams<{ id: string }>();
  const dossierId = params.id;

  const dossier = useVetraStore((s) => s.dossiers.find((d) => d.id === dossierId));
  const mandates = useVetraStore((s) => s.mandates);
  const templates = useVetraStore((s) => s.templates);
  const addSource = useVetraStore((s) => s.addSource);
  const setStep = useVetraStore((s) => s.setStep);
  const generateDraft = useVetraStore((s) => s.generateDraft);
  const applyGeneratedDraft = useVetraStore((s) => s.applyGeneratedDraft);
  const updateSection = useVetraStore((s) => s.updateSection);
  const resolveQaIssue = useVetraStore((s) => s.resolveQaIssue);
  const approveDossier = useVetraStore((s) => s.approveDossier);
  const markExported = useVetraStore((s) => s.markExported);

  const [sourceKind, setSourceKind] = useState<SourceKind>("cv");
  const [sourceName, setSourceName] = useState("");
  const [sourcePreview, setSourcePreview] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [ingestError, setIngestError] = useState("");
  const [parsingFile, setParsingFile] = useState(false);

  const mandate = useMemo(
    () => mandates.find((m) => m.id === dossier?.mandateId),
    [mandates, dossier?.mandateId]
  );
  const template = useMemo(
    () => templates.find((t) => t.id === dossier?.templateId),
    [templates, dossier?.templateId]
  );

  if (!dossier) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Dossier not found</h1>
        <Button render={<Link href="/dossiers" />} nativeButton={false}>Back to dossiers</Button>
      </div>
    );
  }

  const supportedClaims = dossier.claims.filter((c) => c.supported).length;
  const openQa = dossier.qaIssues.filter((q) => !q.resolved);

  const tabValue =
    dossier.step === "extract" || dossier.step === "draft"
      ? "review"
      : dossier.step === "evidence"
        ? "evidence"
        : dossier.step === "qa"
          ? "qa"
          : dossier.step === "export"
            ? "export"
            : dossier.step === "review"
              ? "review"
              : "ingest";

  function handleAddSource(e: React.FormEvent) {
    e.preventDefault();
    if (!sourceName.trim()) return;
    addSource(dossier!.id, {
      kind: sourceKind,
      name: sourceName.trim(),
      contentPreview: sourcePreview.trim() || `${sourceKind} uploaded (demo)`,
    });
    setSourceName("");
    setSourcePreview("");
  }

  async function runGenerate() {
    if (!dossier) return;
    setGenerating(true);
    setGenerateError("");
    setStep(dossier.id, "extract");

    try {
      const res = await fetch("/api/dossiers/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName: dossier.candidateName,
          targetRole: dossier.targetRole,
          client: dossier.client,
          templateName: template?.name,
          templateSections: template?.sections ?? [],
          toneNotes: template?.toneNotes,
          mandateTitle: mandate?.title,
          mandateCriteria: mandate?.criteria.map((c) => ({
            label: c.label,
            type: c.type,
          })),
          sources: dossier.sources.map((s) => ({
            kind: s.kind,
            name: s.name,
            content: s.contentPreview,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      applyGeneratedDraft(dossier.id, {
        claims: data.draft.claims,
        sections: data.draft.sections,
        qaIssues: data.draft.qaIssues,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Generation failed";
      setGenerateError(`${message} Falling back to mock draft.`);
      generateDraft(dossier.id);
    } finally {
      setGenerating(false);
    }
  }

  async function handleExport(format: "docx" | "pdf") {
    if (!dossier) return;
    if (dossier.sections.length === 0) {
      setExportMessage("Generate and review a draft before exporting.");
      return;
    }
    setExporting(true);
    setExportMessage("");
    try {
      const { downloadDossierExport } = await import("@/lib/export/download");
      await downloadDossierExport({
        format,
        dossier,
        templateName: template?.name,
        mandateTitle: mandate?.title,
      });
      markExported(dossier.id);
      setExportMessage(`${format.toUpperCase()} downloaded.`);
    } catch (err) {
      setExportMessage(
        err instanceof Error ? err.message : "Export failed"
      );
    } finally {
      setExporting(false);
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !dossier) return;
    setParsingFile(true);
    setIngestError("");
    try {
      const { extractTextFromFile } = await import("@/lib/ingest/extract-text");
      const text = await extractTextFromFile(file);
      if (!text) {
        throw new Error("No text extracted from file.");
      }
      addSource(dossier.id, {
        kind: sourceKind,
        name: file.name,
        contentPreview: text.slice(0, 50000),
      });
    } catch (err) {
      setIngestError(err instanceof Error ? err.message : "File parse failed");
    } finally {
      setParsingFile(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
              {initials(dossier.candidateName)}
            </div>
            <h1 className="text-xl font-semibold tracking-tight">
              {dossier.candidateName}
            </h1>
            <span className={cn("spott-chip", statusChipClass(dossier.status))}>
              {statusLabel(dossier.status)}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {dossier.targetRole} · {dossier.client} · Updated{" "}
            {formatDate(dossier.updatedAt)}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Template: {template?.name ?? "—"} · Mandate: {mandate?.title ?? "—"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link href="/dossiers" />} nativeButton={false}>
            All dossiers
          </Button>
          <Button onClick={runGenerate} disabled={generating}>
            <Sparkles data-icon="inline-start" />
            {generating ? "Generating…" : "Generate draft"}
          </Button>
        </div>
      </div>

      {generateError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] text-destructive">
          {generateError}
        </p>
      ) : null}

      <WorkflowStepper
        current={dossier.step}
        onSelect={(step: WorkflowStep) => setStep(dossier.id, step)}
      />

      <Tabs
        value={tabValue}
        onValueChange={(v) => setStep(dossier.id, v as WorkflowStep)}
      >
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="ingest">Ingest</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="review">Draft / Review</TabsTrigger>
          <TabsTrigger value="qa">QA</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="ingest" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload sources</CardTitle>
                <CardDescription>
                  Upload PDF/DOCX/TXT or paste text. Parsed text is stored locally
                  for generation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSource} className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="kind">Source type</Label>
                    <select
                      id="kind"
                      className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                      value={sourceKind}
                      onChange={(e) => setSourceKind(e.target.value as SourceKind)}
                    >
                      <option value="cv">CV</option>
                      <option value="transcript">Transcript / audio notes</option>
                      <option value="notes">Recruiter notes</option>
                      <option value="mandate">Mandate excerpt</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="file-upload">Upload file</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={handleFileSelected}
                      disabled={parsingFile}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {parsingFile
                        ? "Extracting text…"
                        : "PDF, DOCX, or TXT. Or paste below."}
                    </p>
                    {ingestError ? (
                      <p className="text-[12px] text-destructive">{ingestError}</p>
                    ) : null}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="filename">File / label</Label>
                    <Input
                      id="filename"
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      placeholder="Elena_March_CV.pdf"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="preview">Paste excerpt / notes</Label>
                    <Textarea
                      id="preview"
                      value={sourcePreview}
                      onChange={(e) => setSourcePreview(e.target.value)}
                      placeholder="Paste CV highlights, transcript snippets, or recruiter notes…"
                      className="min-h-28"
                    />
                  </div>
                  <Button type="submit">
                    <FileUp data-icon="inline-start" />
                    Add source
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingested materials</CardTitle>
                <CardDescription>
                  {dossier.sources.length} source
                  {dossier.sources.length === 1 ? "" : "s"} attached
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dossier.sources.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No sources yet. Upload a CV to begin.
                  </p>
                )}
                {dossier.sources.map((source) => (
                  <div
                    key={source.id}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{source.name}</p>
                      <Badge variant="outline">{source.kind}</Badge>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {source.contentPreview}
                    </p>
                  </div>
                ))}
                {dossier.sources.length > 0 && (
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={runGenerate}
                  >
                    <Sparkles data-icon="inline-start" />
                    Extract + draft dossier
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Search mandate coverage</CardTitle>
              <CardDescription>
                Must-have / nice-to-have criteria from the linked mandate.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {mandate?.criteria.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background/60 p-3"
                >
                  <div>
                    <p className="text-[13px] font-medium">{c.label}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {c.type}
                      {c.notes ? ` · ${c.notes}` : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "spott-chip shrink-0",
                      c.covered
                        ? "bg-success text-success-foreground"
                        : "bg-warning text-warning-foreground"
                    )}
                  >
                    {c.covered ? "Covered" : "Open"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evidence map</CardTitle>
              <CardDescription>
                Every material claim is tied to CV, transcript timestamp, or
                recruiter note. Unsupported claims are flagged.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span>
                  {supportedClaims}/{dossier.claims.length || 0} claims evidenced
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span>
                  {dossier.claims.filter((c) => !c.supported).length} flagged
                </span>
              </div>
              {dossier.claims.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Generate a draft to populate claims and provenance.
                </p>
              )}
              {dossier.claims.map((claim) => (
                <div
                  key={claim.id}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{claim.claim}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Section: {claim.section}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "spott-chip shrink-0",
                        claim.supported
                          ? "bg-success text-success-foreground"
                          : "bg-warning text-warning-foreground"
                      )}
                    >
                      {claim.supported ? "Supported" : "Unsupported"}
                    </span>
                  </div>
                  {!claim.supported && claim.flaggedReason && (
                    <p className="mt-2 flex items-start gap-2 text-xs text-destructive">
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                      {claim.flaggedReason}
                    </p>
                  )}
                  <div className="mt-3 space-y-2">
                    {claim.sources.map((src, idx) => (
                      <div
                        key={`${claim.id}-${idx}`}
                        className="rounded-lg bg-muted/50 px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2 font-medium">
                          <Link2 className="size-3.5" />
                          {src.label}
                          {src.timestamp ? ` · ${src.timestamp}` : ""}
                          {src.page ? ` · p.${src.page}` : ""}
                        </div>
                        <p className="mt-1 text-muted-foreground">
                          “{src.excerpt}”
                        </p>
                      </div>
                    ))}
                    {claim.sources.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        No source linked.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Firm-template draft</CardTitle>
              <CardDescription>
                Edit in your firm’s structure and language. AI assists; you approve.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dossier.sections.length === 0 && (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No draft yet. Generate from ingested sources.
                  </p>
                  <Button className="mt-3" onClick={runGenerate}>
                    Generate draft
                  </Button>
                </div>
              )}
              {dossier.sections.map((section) => (
                <div key={section.id} className="grid gap-2">
                  <Label htmlFor={section.id}>{section.title}</Label>
                  <Textarea
                    id={section.id}
                    value={section.content}
                    onChange={(e) =>
                      updateSection(dossier.id, section.id, e.target.value)
                    }
                    className="min-h-28"
                  />
                </div>
              ))}
              {dossier.sections.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="secondary" onClick={() => setStep(dossier.id, "qa")}>
                    Continue to QA
                  </Button>
                  <Button onClick={() => approveDossier(dossier.id)}>
                    <CheckCircle2 data-icon="inline-start" />
                    Approve for export
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qa" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>QA checks</CardTitle>
              <CardDescription>
                Inconsistencies, missing evidence, compensation conflicts, dates,
                and mandate coverage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dossier.qaIssues.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No QA items yet. Generate a draft first.
                </p>
              )}
              {dossier.qaIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          issue.severity === "error"
                            ? "destructive"
                            : issue.severity === "warning"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {issue.severity}
                      </Badge>
                      {issue.section && (
                        <span className="text-xs text-muted-foreground">
                          {issue.section}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm">{issue.message}</p>
                  </div>
                  {issue.resolved ? (
                    <Badge variant="secondary">Resolved</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveQaIssue(dossier.id, issue.id)}
                    >
                      Mark resolved
                    </Button>
                  )}
                </div>
              ))}
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                Open issues: {openQa.length}. Resolve material errors before client
                submission.
              </div>
              <Button onClick={() => approveDossier(dossier.id)}>
                Record human approval
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export</CardTitle>
              <CardDescription>
                DOCX + PDF for MVP. Secure web link later. Retention policy applies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleExport("docx")}
                  disabled={
                    exporting ||
                    dossier.sections.length === 0 ||
                    dossier.status === "extracting"
                  }
                >
                  <Download data-icon="inline-start" />
                  {exporting ? "Exporting…" : "Export DOCX"}
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleExport("pdf")}
                  disabled={
                    exporting ||
                    dossier.sections.length === 0 ||
                    dossier.status === "extracting"
                  }
                >
                  <Download data-icon="inline-start" />
                  {exporting ? "Exporting…" : "Export PDF"}
                </Button>
              </div>
              {exportMessage && (
                <p className="text-sm text-muted-foreground">{exportMessage}</p>
              )}
              <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
                Explicitly not in MVP: ATS/CRM, LinkedIn scraping, sourcing,
                ranking, email campaigns, client billing, or job-board integrations.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
