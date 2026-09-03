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
  updateSection: (dossierId: string, sectionId: string, content: string) => void;
  resolveQaIssue: (dossierId: string, issueId: string) => void;
  approveDossier: (dossierId: string) => void;
  markExported: (dossierId: string) => void;
  createMandate: (mandate: Omit<SearchMandate, "id" | "createdAt">) => string;
  upsertTemplate: (template: FirmTemplate) => void;
  setRetention: (policy: RetentionPolicy) => void;
  log: (event: Omit<AuditEvent, "id" | "createdAt">) => void;
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
        const dossier = get().dossiers.find((d) => d.id === dossierId);
        const template = get().templates.find((t) => t.id === dossier?.templateId);
        if (!dossier || !template) return;

        const claims: EvidenceClaim[] = [
          {
            id: id("cl"),
            claim: `${dossier.candidateName} is being presented for ${dossier.targetRole}.`,
            section: template.sections[0] ?? "Executive Summary",
            supported: true,
            sources: dossier.sources.slice(0, 1).map((s) => ({
              kind: s.kind,
              label: s.name,
              excerpt: s.contentPreview.slice(0, 120),
            })),
          },
          {
            id: id("cl"),
            claim: "Material compensation or motivation details require recruiter confirmation.",
            section: "Compensation & Notice",
            supported: false,
            flaggedReason: "Insufficient source coverage in uploaded materials.",
            sources: [],
          },
        ];

        const sections: DossierSection[] = template.sections.map((title, index) => ({
          id: id("sec"),
          title,
          content:
            index === 0
              ? `${dossier.candidateName} — draft dossier for ${dossier.targetRole} (${dossier.client}). Generated in firm template “${template.name}”. Recruiter judgment required before client release.`
              : `[Draft] Populate from sources. Tone: ${template.toneNotes}`,
        }));

        const qaIssues: QaIssue[] = [
          {
            id: id("qa"),
            severity: "warning",
            message: "Draft generated from limited sources. Complete evidence review before approval.",
            resolved: false,
          },
          {
            id: id("qa"),
            severity: "error",
            message: "At least one claim lacks source evidence.",
            section: "Compensation & Notice",
            resolved: false,
          },
        ];

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
          detail: `Template: ${template.name}`,
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
    }),
    { name: "vetra-store" }
  )
);
