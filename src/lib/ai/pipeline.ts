import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import {
  dossierDraftSchema,
  extractionSchema,
  type DossierDraftResult,
  type ExtractionResult,
} from "@/lib/ai/schemas";

export type PipelineSource = {
  kind: "cv" | "transcript" | "notes" | "mandate";
  name: string;
  content: string;
};

export type PipelineInput = {
  candidateName: string;
  targetRole: string;
  client: string;
  templateName: string;
  templateSections: string[];
  toneNotes: string;
  mandateTitle?: string;
  mandateCriteria?: { label: string; type: "must-have" | "nice-to-have" }[];
  sources: PipelineSource[];
};

function getModel() {
  const modelId = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
  return openai(modelId);
}

function assertApiKey() {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new Error(
      "OPENAI_API_KEY is missing. Add it to .env.local and restart the dev server."
    );
  }
}

function formatSources(sources: PipelineSource[]) {
  if (sources.length === 0) {
    return "(No sources uploaded. Mark most claims as unsupported.)";
  }
  return sources
    .map(
      (s, i) =>
        `--- SOURCE ${i + 1} [${s.kind}] ${s.name} ---\n${s.content.slice(0, 12000)}`
    )
    .join("\n\n");
}

export async function extractFacts(
  input: PipelineInput
): Promise<ExtractionResult> {
  assertApiKey();

  const { output } = await generateText({
    model: getModel(),
    output: Output.object({ schema: extractionSchema }),
    system: `You extract structured facts for an executive-search candidate dossier.
Rules:
- Use ONLY the provided sources. Do not invent employers, dates, titles, compensation, or degrees.
- Every fact must include an excerpt from a source. If you cannot quote support, set supported=false.
- Prefer precise, recruiter-useful facts (roles, dates, team size, achievements, geography, notice, compensation, motivation).
- JSON only via the schema.`,
    prompt: `Candidate (hint): ${input.candidateName}
Target role: ${input.targetRole}
Client: ${input.client}
Mandate: ${input.mandateTitle ?? "n/a"}

SOURCES:
${formatSources(input.sources)}`,
  });

  if (!output) {
    throw new Error("Extraction returned no structured output.");
  }
  return output;
}

export async function draftDossier(
  input: PipelineInput,
  extraction: ExtractionResult
): Promise<DossierDraftResult> {
  assertApiKey();

  const criteria =
    input.mandateCriteria
      ?.map((c) => `- [${c.type}] ${c.label}`)
      .join("\n") ?? "(none)";

  const { output } = await generateText({
    model: getModel(),
    output: Output.object({ schema: dossierDraftSchema }),
    system: `You write firm-specific executive candidate dossiers for human recruiter review.
Rules:
- Never make a hiring decision. Present evidence and gaps.
- Use ONLY extracted facts and sources. Do not invent material claims.
- Every material claim needs sources[] with excerpts, or supported=false with flaggedReason.
- Follow the exact section titles provided by the firm template.
- Match tone notes. Third-person professional voice unless tone says otherwise.
- QA must flag missing must-haves, unsupported claims, date/comp conflicts, and thin evidence.`,
    prompt: `Write a draft dossier.

Candidate: ${extraction.candidateName || input.candidateName}
Target role: ${input.targetRole}
Client: ${input.client}
Template: ${input.templateName}
Required sections (in order): ${input.templateSections.join(" | ")}
Tone: ${input.toneNotes}

Mandate criteria:
${criteria}

Extracted facts JSON:
${JSON.stringify(extraction.facts, null, 2)}

Open questions:
${JSON.stringify(extraction.openQuestions, null, 2)}

Raw sources (for citations):
${formatSources(input.sources)}

Return claims, one section object per required section title, and qaIssues.`,
  });

  if (!output) {
    throw new Error("Draft generation returned no structured output.");
  }

  // Ensure every template section exists even if the model skips one
  const byTitle = new Map(output.sections.map((s) => [s.title, s]));
  const sections = input.templateSections.map((title) => {
    const existing = byTitle.get(title);
    return (
      existing ?? {
        title,
        content:
          "[Draft] Insufficient evidenced material for this section. Recruiter input required.",
      }
    );
  });

  return { ...output, sections };
}

export async function runDossierPipeline(input: PipelineInput) {
  const extraction = await extractFacts(input);
  const draft = await draftDossier(input, extraction);
  return { extraction, draft };
}
