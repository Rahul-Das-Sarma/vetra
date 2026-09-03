export type SourceKind = "cv" | "transcript" | "notes" | "mandate";

export type DossierStatus =
  | "draft"
  | "extracting"
  | "review"
  | "qa"
  | "approved"
  | "exported";

export type WorkflowStep =
  | "ingest"
  | "extract"
  | "evidence"
  | "draft"
  | "review"
  | "qa"
  | "export";

export interface SourceRef {
  kind: SourceKind;
  label: string;
  excerpt: string;
  timestamp?: string;
  page?: number;
}

export interface EvidenceClaim {
  id: string;
  claim: string;
  section: string;
  supported: boolean;
  sources: SourceRef[];
  flaggedReason?: string;
}

export interface MandateCriterion {
  id: string;
  label: string;
  type: "must-have" | "nice-to-have";
  covered: boolean;
  notes?: string;
}

export interface SearchMandate {
  id: string;
  title: string;
  client: string;
  role: string;
  geography: string;
  criteria: MandateCriterion[];
  createdAt: string;
}

export interface FirmTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  toneNotes: string;
  updatedAt: string;
}

export interface UploadedSource {
  id: string;
  kind: SourceKind;
  name: string;
  contentPreview: string;
  uploadedAt: string;
}

export interface DossierSection {
  id: string;
  title: string;
  content: string;
}

export interface CandidateDossier {
  id: string;
  candidateName: string;
  targetRole: string;
  client: string;
  status: DossierStatus;
  step: WorkflowStep;
  mandateId: string;
  templateId: string;
  sources: UploadedSource[];
  claims: EvidenceClaim[];
  sections: DossierSection[];
  qaIssues: QaIssue[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

export interface QaIssue {
  id: string;
  severity: "error" | "warning" | "info";
  message: string;
  section?: string;
  resolved: boolean;
}

export interface AuditEvent {
  id: string;
  action: string;
  actor: string;
  entityType: "dossier" | "mandate" | "template" | "settings";
  entityId: string;
  createdAt: string;
  detail?: string;
}

export interface RetentionPolicy {
  retainDays: number;
  autoDeleteExports: boolean;
  trainOnCustomerData: false;
}
