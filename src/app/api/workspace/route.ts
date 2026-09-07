import { NextResponse } from "next/server";
import {
  isDatabaseConfigured,
  loadWorkspace,
  requireClerkUserId,
  saveWorkspace,
} from "@/lib/db/workspace";
import type {
  AuditEvent,
  CandidateDossier,
  FirmTemplate,
  RetentionPolicy,
  SearchMandate,
} from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            "DATABASE_URL not configured. Using local demo mode until Supabase is connected.",
          configured: false,
        },
        { status: 503 }
      );
    }
    const userId = await requireClerkUserId();
    const workspace = await loadWorkspace(userId);
    return NextResponse.json({ configured: true, workspace });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "DATABASE_URL not configured" },
        { status: 503 }
      );
    }
    const userId = await requireClerkUserId();
    const body = (await req.json()) as {
      dossiers: CandidateDossier[];
      mandates: SearchMandate[];
      templates: FirmTemplate[];
      auditLog: AuditEvent[];
      retention: RetentionPolicy;
      firmName?: string;
    };

    const result = await saveWorkspace(userId, body);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
