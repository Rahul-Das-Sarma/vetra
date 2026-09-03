import type {
  AuditEvent,
  CandidateDossier,
  FirmTemplate,
  RetentionPolicy,
  SearchMandate,
} from "./types";

export const DEMO_TEMPLATES: FirmTemplate[] = [
  {
    id: "tpl-partner-classic",
    name: "Partner Classic",
    description:
      "Two-page executive submittal with career narrative, mandate fit, and compensation.",
    sections: [
      "Executive Summary",
      "Career Timeline",
      "Mandate Fit",
      "Leadership & Scale",
      "Motivation & Relocation",
      "Compensation & Notice",
      "Recruiter Assessment",
    ],
    toneNotes:
      "Third-person professional voice. Concise. No marketing fluff. Flag unknowns explicitly.",
    updatedAt: "2026-08-12T10:00:00.000Z",
  },
  {
    id: "tpl-research-brief",
    name: "Research Brief",
    description:
      "One-page research-led brief emphasizing evidence and open questions.",
    sections: [
      "Candidate Snapshot",
      "Evidence Highlights",
      "Open Questions",
      "Mandate Coverage",
      "Recommended Next Step",
    ],
    toneNotes: "Evidence-first. Prefer short bullets over long narrative.",
    updatedAt: "2026-08-20T14:30:00.000Z",
  },
];

export const DEMO_MANDATES: SearchMandate[] = [
  {
    id: "man-cfo-eu",
    title: "CFO — European Industrial Platform",
    client: "Northbridge Capital",
    role: "Chief Financial Officer",
    geography: "London / Amsterdam / Frankfurt",
    createdAt: "2026-08-01T09:00:00.000Z",
    criteria: [
      {
        id: "c1",
        label: "Public or PE-backed CFO experience",
        type: "must-have",
        covered: true,
      },
      {
        id: "c2",
        label: "Industrial / manufacturing sector exposure",
        type: "must-have",
        covered: true,
      },
      {
        id: "c3",
        label: "M&A and integration leadership",
        type: "must-have",
        covered: true,
      },
      {
        id: "c4",
        label: "German or Dutch language capability",
        type: "nice-to-have",
        covered: false,
        notes: "Not evidenced in CV or screening call",
      },
      {
        id: "c5",
        label: "Willingness to relocate to Amsterdam",
        type: "nice-to-have",
        covered: true,
      },
    ],
  },
  {
    id: "man-vp-ops",
    title: "VP Operations — Healthcare Services",
    client: "Helix Partners",
    role: "VP Operations",
    geography: "United States (remote-friendly)",
    createdAt: "2026-08-18T11:00:00.000Z",
    criteria: [
      {
        id: "c6",
        label: "Multi-site operations leadership (500+ FTEs)",
        type: "must-have",
        covered: false,
      },
      {
        id: "c7",
        label: "Healthcare or regulated services background",
        type: "must-have",
        covered: false,
      },
      {
        id: "c8",
        label: "P&L ownership > $100M",
        type: "nice-to-have",
        covered: false,
      },
    ],
  },
];

export const DEMO_DOSSIERS: CandidateDossier[] = [
  {
    id: "dos-elena-march",
    candidateName: "Elena March",
    targetRole: "Chief Financial Officer",
    client: "Northbridge Capital",
    status: "review",
    step: "review",
    mandateId: "man-cfo-eu",
    templateId: "tpl-partner-classic",
    createdAt: "2026-09-01T08:15:00.000Z",
    updatedAt: "2026-09-01T08:42:00.000Z",
    sources: [
      {
        id: "src-cv",
        kind: "cv",
        name: "Elena_March_CV.pdf",
        contentPreview:
          "CFO, Meridian Industrial Group (2021–present). Previously Group Finance Director, Atlas Components.",
        uploadedAt: "2026-09-01T08:15:00.000Z",
      },
      {
        id: "src-tr",
        kind: "transcript",
        name: "Screening_Call_Elena_March.txt",
        contentPreview:
          "Open to Amsterdam relocation; current package ~€420k total; notice period 6 months.",
        uploadedAt: "2026-09-01T08:18:00.000Z",
      },
      {
        id: "src-notes",
        kind: "notes",
        name: "Recruiter notes",
        contentPreview:
          "Strong PE communication. Credible on bolt-on M&A. Soft on German language.",
        uploadedAt: "2026-09-01T08:20:00.000Z",
      },
    ],
    claims: [
      {
        id: "cl-1",
        claim: "Currently CFO at Meridian Industrial Group since 2021.",
        section: "Career Timeline",
        supported: true,
        sources: [
          {
            kind: "cv",
            label: "CV — Career history",
            excerpt: "CFO, Meridian Industrial Group, 2021–Present",
            page: 1,
          },
        ],
      },
      {
        id: "cl-2",
        claim: "Led three bolt-on acquisitions totaling ~€180M enterprise value.",
        section: "Leadership & Scale",
        supported: true,
        sources: [
          {
            kind: "transcript",
            label: "Screening call",
            excerpt:
              "We completed three bolt-ons; combined EV was roughly one-eighty.",
            timestamp: "18:42",
          },
          {
            kind: "notes",
            label: "Recruiter notes",
            excerpt: "Credible on bolt-on M&A; pressed on integration ownership.",
          },
        ],
      },
      {
        id: "cl-3",
        claim: "Fluent German suitable for board-level dialogue.",
        section: "Mandate Fit",
        supported: false,
        flaggedReason: "No supporting source; contradicting recruiter note.",
        sources: [
          {
            kind: "notes",
            label: "Recruiter notes",
            excerpt: "Soft on German language.",
          },
        ],
      },
      {
        id: "cl-4",
        claim: "Target total compensation circa €420k; 6-month notice period.",
        section: "Compensation & Notice",
        supported: true,
        sources: [
          {
            kind: "transcript",
            label: "Screening call",
            excerpt:
              "Current package around four-twenty total cash and bonus; notice is six months.",
            timestamp: "41:05",
          },
        ],
      },
      {
        id: "cl-5",
        claim: "Open to relocating to Amsterdam within 90 days of acceptance.",
        section: "Motivation & Relocation",
        supported: true,
        sources: [
          {
            kind: "transcript",
            label: "Screening call",
            excerpt: "Amsterdam works; I can move within a quarter if needed.",
            timestamp: "36:12",
          },
        ],
      },
    ],
    sections: [
      {
        id: "sec-1",
        title: "Executive Summary",
        content:
          "Elena March is a PE-fluent CFO with industrial platform experience and hands-on M&A integration ownership. She presents as commercially crisp, credible on bolt-on activity, and open to Amsterdam relocation. German language capability is not evidenced and should not be positioned as a strength.",
      },
      {
        id: "sec-2",
        title: "Career Timeline",
        content:
          "2021–Present — CFO, Meridian Industrial Group\n2016–2021 — Group Finance Director, Atlas Components\n2011–2016 — Finance Director, EMEA, Kelvin Systems",
      },
      {
        id: "sec-3",
        title: "Mandate Fit",
        content:
          "Strong alignment on PE-backed CFO experience, industrial exposure, and M&A leadership. Nice-to-have language criterion is currently uncovered.",
      },
      {
        id: "sec-4",
        title: "Leadership & Scale",
        content:
          "At Meridian, Elena reports to the CEO and partners closely with the operating partner. She cites leadership of three bolt-on acquisitions (~€180M combined EV) with ownership of diligence and post-deal finance integration.",
      },
      {
        id: "sec-5",
        title: "Motivation & Relocation",
        content:
          "Motivated by a larger European platform mandate and clearer path to board exposure. Confirmed willingness to relocate to Amsterdam.",
      },
      {
        id: "sec-6",
        title: "Compensation & Notice",
        content:
          "Indicative current package ~€420k total. Notice period stated as 6 months. Exact equity/LTIP detail not fully confirmed — verify before client submission.",
      },
      {
        id: "sec-7",
        title: "Recruiter Assessment",
        content:
          "Recommended for shortlist with a clear caveat on language. Strong client-facing presence; judgment remains with the partner on mandate trade-offs.",
      },
    ],
    qaIssues: [
      {
        id: "qa-1",
        severity: "error",
        message: "Unsupported claim: German fluency. Remove or rephrase before approval.",
        section: "Mandate Fit",
        resolved: false,
      },
      {
        id: "qa-2",
        severity: "warning",
        message: "Equity/LTIP detail incomplete relative to compensation section.",
        section: "Compensation & Notice",
        resolved: false,
      },
      {
        id: "qa-3",
        severity: "info",
        message: "4 of 5 mandate criteria have evidence coverage.",
        resolved: false,
      },
    ],
  },
  {
    id: "dos-james-okonkwo",
    candidateName: "James Okonkwo",
    targetRole: "VP Operations",
    client: "Helix Partners",
    status: "draft",
    step: "ingest",
    mandateId: "man-vp-ops",
    templateId: "tpl-research-brief",
    createdAt: "2026-09-02T16:00:00.000Z",
    updatedAt: "2026-09-02T16:05:00.000Z",
    sources: [
      {
        id: "src-cv-2",
        kind: "cv",
        name: "James_Okonkwo_Resume.docx",
        contentPreview: "SVP Operations, CareBridge Health — draft intake only.",
        uploadedAt: "2026-09-02T16:00:00.000Z",
      },
    ],
    claims: [],
    sections: [],
    qaIssues: [],
  },
];

export const DEMO_AUDIT: AuditEvent[] = [
  {
    id: "aud-1",
    action: "dossier.generated",
    actor: "you@vetra.app",
    entityType: "dossier",
    entityId: "dos-elena-march",
    createdAt: "2026-09-01T08:25:00.000Z",
    detail: "Generated Partner Classic draft from CV + transcript + notes",
  },
  {
    id: "aud-2",
    action: "claim.flagged",
    actor: "system",
    entityType: "dossier",
    entityId: "dos-elena-march",
    createdAt: "2026-09-01T08:26:00.000Z",
    detail: "German fluency unsupported",
  },
  {
    id: "aud-3",
    action: "mandate.created",
    actor: "you@vetra.app",
    entityType: "mandate",
    entityId: "man-cfo-eu",
    createdAt: "2026-08-01T09:00:00.000Z",
  },
];

export const DEFAULT_RETENTION: RetentionPolicy = {
  retainDays: 90,
  autoDeleteExports: true,
  trainOnCustomerData: false,
};
