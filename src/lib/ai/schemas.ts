import { z } from "zod";

export const sourceKindSchema = z.enum(["cv", "transcript", "notes", "mandate"]);

export const extractedFactSchema = z.object({
  label: z.string().describe("Short label for the fact, e.g. Current role"),
  value: z.string().describe("The extracted fact value"),
  section: z
    .string()
    .describe("Suggested dossier section this fact belongs to"),
  sourceKind: sourceKindSchema,
  sourceLabel: z.string().describe("Which uploaded source file/name"),
  excerpt: z
    .string()
    .describe("Exact or near-exact quote from the source supporting this fact"),
  supported: z
    .boolean()
    .describe("True only if the excerpt clearly supports the value"),
});

export const extractionSchema = z.object({
  candidateName: z.string().optional(),
  facts: z.array(extractedFactSchema).max(40),
  openQuestions: z
    .array(z.string())
    .max(15)
    .describe("Important unknowns not evidenced in the sources"),
});

export const draftClaimSchema = z.object({
  claim: z.string(),
  section: z.string(),
  supported: z.boolean(),
  flaggedReason: z
    .string()
    .optional()
    .describe("Required when supported is false"),
  sources: z
    .array(
      z.object({
        kind: sourceKindSchema,
        label: z.string(),
        excerpt: z.string(),
        timestamp: z.string().optional(),
      })
    )
    .default([]),
});

export const draftSectionSchema = z.object({
  title: z.string(),
  content: z
    .string()
    .describe("Client-ready prose or bullets for this section"),
});

export const qaIssueSchema = z.object({
  severity: z.enum(["error", "warning", "info"]),
  message: z.string(),
  section: z.string().optional(),
});

export const dossierDraftSchema = z.object({
  claims: z.array(draftClaimSchema).max(40),
  sections: z.array(draftSectionSchema).max(20),
  qaIssues: z.array(qaIssueSchema).max(20),
});

export type ExtractionResult = z.infer<typeof extractionSchema>;
export type DossierDraftResult = z.infer<typeof dossierDraftSchema>;
