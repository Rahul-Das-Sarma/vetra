import { NextResponse } from "next/server";
import { runDossierPipeline, type PipelineSource } from "@/lib/ai/pipeline";

export const runtime = "nodejs";
export const maxDuration = 60;

type GenerateBody = {
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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateBody;

    if (!body.candidateName?.trim() || !body.templateSections?.length) {
      return NextResponse.json(
        { error: "candidateName and templateSections are required." },
        { status: 400 }
      );
    }

    const result = await runDossierPipeline({
      candidateName: body.candidateName,
      targetRole: body.targetRole || "Executive role",
      client: body.client || "Client",
      templateName: body.templateName || "Firm template",
      templateSections: body.templateSections,
      toneNotes:
        body.toneNotes ||
        "Third-person professional voice. Concise. Flag unknowns explicitly.",
      mandateTitle: body.mandateTitle,
      mandateCriteria: body.mandateCriteria,
      sources: Array.isArray(body.sources) ? body.sources : [],
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    const status = message.includes("OPENAI_API_KEY") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
