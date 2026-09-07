import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_RETENTION,
  DEMO_AUDIT,
  DEMO_DOSSIERS,
  DEMO_MANDATES,
  DEMO_TEMPLATES,
} from "@/lib/mock-data";
import type {
  AuditEvent,
  CandidateDossier,
  DossierSection,
  EvidenceClaim,
  FirmTemplate,
  QaIssue,
  RetentionPolicy,
  SearchMandate,
  UploadedSource,
  WorkflowStep,
} from "@/lib/types";

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

interface VetraState {
  dossiers: CandidateDossier[];
  mandates: SearchMandate[];
  templates: FirmTemplate[];
  auditLog: AuditEvent[];
  retention: RetentionPolicy;
  createDossier: (input: {
    candidateName: string;
    targetRole: string;
    client: string;
    mandateId: string;
    templateId: string;
  }) => string;
  updateDossier: (id: string, patch: Partial<CandidateDossier>) => void;
  setStep: (id: string, step: WorkflowStep) => void;
  addSource: (dossierId: string, source: Omit<UploadedSource, "id" | "uploadedAt">) => void;
  generateDraft: (dossierId: string) => void;
  applyGeneratedDraft: (
    dossierId: string,
    payload: {
      claims: Omit<EvidenceClaim, "id">[];
      sections: Omit<DossierSection, "id">[];
      qaIssues: Omit<QaIssue, "id" | "resolved">[];
    }
  ) => void;
  updateSection: (dossierId: string, sectionId: string, content: string) => void;
  resolveQaIssue: (dossierId: string, issueId: string) => void;
  approveDossier: (dossierId: string) => void;
  markExported: (dossierId: string) => void;
  createMandate: (mandate: Omit<SearchMandate, "id" | "createdAt">) => string;
  upsertTemplate: (template: FirmTemplate) => void;
  setRetention: (policy: RetentionPolicy) => void;
  log: (event: Omit<AuditEvent, "id" | "createdAt">) => void;
  hydrateFromCloud: (workspace: {
    dossiers: CandidateDossier[];
    mandates: SearchMandate[];
    templates: FirmTemplate[];
    auditLog: AuditEvent[];
    retention: RetentionPolicy;
  }) => void;
  getSnapshot: () => {
    dossiers: CandidateDossier[];
    mandates: SearchMandate[];
    templates: FirmTemplate[];
    auditLog: AuditEvent[];
    retention: RetentionPolicy;
  };
}

const STEP_STATUS: Record<WorkflowStep, CandidateDossier["status"]> = {
  ingest: "draft",
  extract: "extracting",
  evidence: "extracting",
  draft: "extracting",
  review: "review",
  qa: "qa",
  export: "approved",
};

export const useVetraStore = create<VetraState>()(
  persist(
    (set, get) => ({
      dossiers: DEMO_DOSSIERS,
      mandates: DEMO_MANDATES,
      templates: DEMO_TEMPLATES,
      auditLog: DEMO_AUDIT,
      retention: DEFAULT_RETENTION,

      log: (event) =>
        set((state) => ({
          auditLog: [
            {
              ...event,
              id: id("aud"),
              createdAt: nowIso(),
            },
            ...state.auditLog,
          ],
        })),

      createDossier: (input) => {
        const dossierId = id("dos");
        const dossier: CandidateDossier = {
          id: dossierId,
          ...input,
          status: "draft",
          step: "ingest",
          sources: [],
          claims: [],
          sections: [],
          qaIssues: [],
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((state) => ({ dossiers: [dossier, ...state.dossiers] }));
        get().log({
          action: "dossier.created",
          actor: "you@vetra.app",
          entityType: "dossier",
          entityId: dossierId,
          detail: input.candidateName,
        });
        return dossierId;
      },

      updateDossier: (dossierId, patch) =>
        set((state) => ({
          dossiers: state.dossiers.map((d) =>
            d.id === dossierId ? { ...d, ...patch, updatedAt: nowIso() } : d
          ),
        })),

      setStep: (dossierId, step) => {
        get().updateDossier(dossierId, {
          step,
          status: STEP_STATUS[step],
        });
        get().log({
          action: `dossier.step.${step}`,
          actor: "you@vetra.app",
          entityType: "dossier",
          entityId: dossierId,
        });
      },

      addSource: (dossierId, source) => {
        const next: UploadedSource = {
          ...source,
          id: id("src"),
          uploadedAt: nowIso(),
        };
        set((state) => ({
          dossiers: state.dossiers.map((d) =>
            d.id === dossierId
              ? { ...d, sources: [...d.sources, next], updatedAt: nowIso() }
              : d
          ),
        }));
        get().log({
          action: "source.uploaded",
          actor: "you@vetra.app",
          entityType: "dossier",
          entityId: dossierId,
          detail: `${source.kind}: ${source.name}`,
        });
      },

      generateDraft: (dossierId) => {
        // Offline/mock fallback when API is unavailable
        const dossier = get().dossiers.find((d) => d.id === dossierId);
        const template = get().templates.find((t) => t.id === dossier?.templateId);
        if (!dossier || !template) return;

        get().applyGeneratedDraft(dossierId, {
          claims: [
            {
              claim: `${dossier.candidateName} is being presented for ${dossier.targetRole}.`,
              section: template.sections[0] ?? "Executive Summary",
              supported: dossier.sources.length > 0,
              sources: dossier.sources.slice(0, 1).map((s) => ({
                kind: s.kind,
                label: s.name,
                excerpt: s.contentPreview.slice(0, 120),
              })),
              flaggedReason:
                dossier.sources.length === 0
                  ? "No sources uploaded for mock generation."
                  : undefined,
            },
            {
              claim:
                "Material compensation or motivation details require recruiter confirmation.",
              section: "Compensation & Notice",
              supported: false,
              flaggedReason: "Insufficient source coverage in uploaded materials.",
              sources: [],
            },
          ],
          sections: template.sections.map((title, index) => ({
            title,
            content:
              index === 0
                ? `${dossier.candidateName} — mock draft for ${dossier.targetRole} (${dossier.client}). Use Generate with OPENAI_API_KEY for real AI.`
                : `[Mock draft] Populate from sources. Tone: ${template.toneNotes}`,
          })),
          qaIssues: [
            {
              severity: "warning",
              message:
                "Mock draft only. Add OPENAI_API_KEY and regenerate for source-grounded AI output.",
            },
            {
              severity: "error",
              message: "At least one claim lacks source evidence.",
              section: "Compensation & Notice",
            },
          ],
        });
      },

      applyGeneratedDraft: (dossierId, payload) => {
        const dossier = get().dossiers.find((d) => d.id === dossierId);
        const template = get().templates.find((t) => t.id === dossier?.templateId);
        if (!dossier) return;

        const claims: EvidenceClaim[] = payload.claims.map((c) => ({
          ...c,
          id: id("cl"),
        }));
        const sections: DossierSection[] = payload.sections.map((s) => ({
          ...s,
          id: id("sec"),
        }));
        const qaIssues: QaIssue[] = payload.qaIssues.map((q) => ({
          ...q,
          id: id("qa"),
          resolved: false,
        }));

        get().updateDossier(dossierId, {
          claims,
          sections,
          qaIssues,
          step: "review",
          status: "review",
        });
        get().log({
          action: "dossier.generated",
          actor: "you@vetra.app",
          entityType: "dossier",
          entityId: dossierId,
          detail: template
            ? `Template: ${template.name}`
            : "AI / mock generation",
        });
      },

      updateSection: (dossierId, sectionId, content) =>
        set((state) => ({
          dossiers: state.dossiers.map((d) =>
            d.id === dossierId
              ? {
                  ...d,
                  updatedAt: nowIso(),
                  sections: d.sections.map((s) =>
                    s.id === sectionId ? { ...s, content } : s
                  ),
                }
              : d
          ),
        })),

      resolveQaIssue: (dossierId, issueId) =>
        set((state) => ({
          dossiers: state.dossiers.map((d) =>
            d.id === dossierId
              ? {
                  ...d,
                  updatedAt: nowIso(),
                  qaIssues: d.qaIssues.map((q) =>
                    q.id === issueId ? { ...q, resolved: true } : q
                  ),
                }
              : d
          ),
        })),

      approveDossier: (dossierId) => {
        get().updateDossier(dossierId, {
          status: "approved",
          step: "export",
          approvedAt: nowIso(),
        });
        get().log({
          action: "dossier.approved",
          actor: "you@vetra.app",
          entityType: "dossier",
          entityId: dossierId,
          detail: "Human approval recorded. AI did not make the hiring decision.",
        });
      },

      markExported: (dossierId) => {
        get().updateDossier(dossierId, { status: "exported", step: "export" });
        get().log({
          action: "dossier.exported",
          actor: "you@vetra.app",
          entityType: "dossier",
          entityId: dossierId,
          detail: "DOCX + PDF export marked complete (demo)",
        });
      },

      createMandate: (mandate) => {
        const mandateId = id("man");
        set((state) => ({
          mandates: [
            { ...mandate, id: mandateId, createdAt: nowIso() },
            ...state.mandates,
          ],
        }));
        get().log({
          action: "mandate.created",
          actor: "you@vetra.app",
          entityType: "mandate",
          entityId: mandateId,
          detail: mandate.title,
        });
        return mandateId;
      },

      upsertTemplate: (template) => {
        set((state) => {
          const exists = state.templates.some((t) => t.id === template.id);
          return {
            templates: exists
              ? state.templates.map((t) => (t.id === template.id ? template : t))
              : [template, ...state.templates],
          };
        });
        get().log({
          action: "template.upserted",
          actor: "you@vetra.app",
          entityType: "template",
          entityId: template.id,
          detail: template.name,
        });
      },

      setRetention: (policy) => {
        set({ retention: { ...policy, trainOnCustomerData: false } });
        get().log({
          action: "settings.retention_updated",
          actor: "you@vetra.app",
          entityType: "settings",
          entityId: "retention",
          detail: `${policy.retainDays} days; no training on customer data`,
        });
      },

      hydrateFromCloud: (workspace) => {
        set({
          dossiers: workspace.dossiers,
          mandates: workspace.mandates,
          templates: workspace.templates,
          auditLog: workspace.auditLog,
          retention: {
            ...workspace.retention,
            trainOnCustomerData: false,
          },
        });
      },

      getSnapshot: () => {
        const s = get();
        return {
          dossiers: s.dossiers,
          mandates: s.mandates,
          templates: s.templates,
          auditLog: s.auditLog,
          retention: s.retention,
        };
      },
    }),
    { name: "vetra-store" }
  )
);
