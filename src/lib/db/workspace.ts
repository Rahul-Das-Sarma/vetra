import { desc, eq } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import {
  auditEvents,
  dossiers,
  firms,
  mandates,
  templates,
} from "@/lib/db/schema";
import {
  DEMO_TEMPLATES,
  DEFAULT_RETENTION,
} from "@/lib/mock-data";
import type {
  AuditEvent,
  CandidateDossier,
  FirmTemplate,
  RetentionPolicy,
  SearchMandate,
} from "@/lib/types";

export type WorkspacePayload = {
  firmId: string;
  firmName: string;
  dossiers: CandidateDossier[];
  mandates: SearchMandate[];
  templates: FirmTemplate[];
  auditLog: AuditEvent[];
  retention: RetentionPolicy;
};

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function requireClerkUserId() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function ensureFirm(clerkUserId: string) {
  const db = getDb();
  const existing = await db
    .select()
    .from(firms)
    .where(eq(firms.clerkUserId, clerkUserId))
    .limit(1);

  if (existing[0]) return existing[0];

  const user = await currentUser();
  const firmName =
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress ||
    "My executive search firm";

  const created = await db
    .insert(firms)
    .values({
      clerkUserId,
      name: firmName,
      retainDays: DEFAULT_RETENTION.retainDays,
      autoDeleteExports: DEFAULT_RETENTION.autoDeleteExports,
    })
    .returning();

  const firm = created[0];

  await db.insert(templates).values(
    DEMO_TEMPLATES.map((t) => ({
      id: `${t.id}-${firm.id.slice(0, 8)}`,
      firmId: firm.id,
      name: t.name,
      description: t.description,
      sections: t.sections,
      toneNotes: t.toneNotes,
      updatedAt: new Date(),
    }))
  );

  return firm;
}

export async function loadWorkspace(
  clerkUserId: string
): Promise<WorkspacePayload> {
  const db = getDb();
  const firm = await ensureFirm(clerkUserId);

  const [tplRows, manRows, dosRows, audRows] = await Promise.all([
    db.select().from(templates).where(eq(templates.firmId, firm.id)),
    db.select().from(mandates).where(eq(mandates.firmId, firm.id)),
    db.select().from(dossiers).where(eq(dossiers.firmId, firm.id)),
    db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.firmId, firm.id))
      .orderBy(desc(auditEvents.createdAt))
      .limit(200),
  ]);

  return {
    firmId: firm.id,
    firmName: firm.name,
    templates: tplRows.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      sections: t.sections,
      toneNotes: t.toneNotes,
      updatedAt: t.updatedAt.toISOString(),
    })),
    mandates: manRows.map((m) => ({
      id: m.id,
      title: m.title,
      client: m.client,
      role: m.role,
      geography: m.geography,
      criteria: m.criteria as SearchMandate["criteria"],
      createdAt: m.createdAt.toISOString(),
    })),
    dossiers: dosRows.map((d) => ({
      id: d.id,
      candidateName: d.candidateName,
      targetRole: d.targetRole,
      client: d.client,
      status: d.status as CandidateDossier["status"],
      step: d.step as CandidateDossier["step"],
      mandateId: d.mandateId,
      templateId: d.templateId,
      sources: d.sources as CandidateDossier["sources"],
      claims: d.claims as CandidateDossier["claims"],
      sections: d.sections as CandidateDossier["sections"],
      qaIssues: d.qaIssues as CandidateDossier["qaIssues"],
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      approvedAt: d.approvedAt?.toISOString(),
    })),
    auditLog: audRows.map((a) => ({
      id: a.id,
      action: a.action,
      actor: a.actor,
      entityType: a.entityType as AuditEvent["entityType"],
      entityId: a.entityId,
      detail: a.detail ?? undefined,
      createdAt: a.createdAt.toISOString(),
    })),
    retention: {
      retainDays: firm.retainDays,
      autoDeleteExports: firm.autoDeleteExports,
      trainOnCustomerData: false,
    },
  };
}

export async function saveWorkspace(
  clerkUserId: string,
  payload: {
    dossiers: CandidateDossier[];
    mandates: SearchMandate[];
    templates: FirmTemplate[];
    auditLog: AuditEvent[];
    retention: RetentionPolicy;
    firmName?: string;
  }
) {
  const db = getDb();
  const firm = await ensureFirm(clerkUserId);
  const now = new Date();

  await db
    .update(firms)
    .set({
      name: payload.firmName ?? firm.name,
      retainDays: payload.retention.retainDays,
      autoDeleteExports: payload.retention.autoDeleteExports,
      updatedAt: now,
    })
    .where(eq(firms.id, firm.id));

  await db.delete(templates).where(eq(templates.firmId, firm.id));
  await db.delete(mandates).where(eq(mandates.firmId, firm.id));
  await db.delete(dossiers).where(eq(dossiers.firmId, firm.id));
  await db.delete(auditEvents).where(eq(auditEvents.firmId, firm.id));

  if (payload.templates.length) {
    await db.insert(templates).values(
      payload.templates.map((t) => ({
        id: t.id,
        firmId: firm.id,
        name: t.name,
        description: t.description,
        sections: t.sections,
        toneNotes: t.toneNotes,
        updatedAt: new Date(t.updatedAt),
      }))
    );
  }

  if (payload.mandates.length) {
    await db.insert(mandates).values(
      payload.mandates.map((m) => ({
        id: m.id,
        firmId: firm.id,
        title: m.title,
        client: m.client,
        role: m.role,
        geography: m.geography,
        criteria: m.criteria,
        createdAt: new Date(m.createdAt),
      }))
    );
  }

  if (payload.dossiers.length) {
    await db.insert(dossiers).values(
      payload.dossiers.map((d) => ({
        id: d.id,
        firmId: firm.id,
        candidateName: d.candidateName,
        targetRole: d.targetRole,
        client: d.client,
        status: d.status,
        step: d.step,
        mandateId: d.mandateId,
        templateId: d.templateId,
        sources: d.sources,
        claims: d.claims,
        sections: d.sections,
        qaIssues: d.qaIssues,
        createdAt: new Date(d.createdAt),
        updatedAt: new Date(d.updatedAt),
        approvedAt: d.approvedAt ? new Date(d.approvedAt) : null,
      }))
    );
  }

  if (payload.auditLog.length) {
    await db.insert(auditEvents).values(
      payload.auditLog.slice(0, 200).map((a) => ({
        id: a.id || newId("aud"),
        firmId: firm.id,
        action: a.action,
        actor: a.actor,
        entityType: a.entityType,
        entityId: a.entityId,
        detail: a.detail ?? null,
        createdAt: new Date(a.createdAt),
      }))
    );
  }

  return { firmId: firm.id };
}

export { isDatabaseConfigured };
