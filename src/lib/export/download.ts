import { saveAs } from "file-saver";
import { buildDossierDocx, dossierExportFilename } from "@/lib/export/docx";
import { buildDossierPdf } from "@/lib/export/pdf";
import type { CandidateDossier } from "@/lib/types";

export async function downloadDossierExport(input: {
  format: "docx" | "pdf";
  dossier: CandidateDossier;
  templateName?: string;
  mandateTitle?: string;
}) {
  const { format, dossier, templateName, mandateTitle } = input;
  const filename = dossierExportFilename(dossier.candidateName, format);

  if (format === "docx") {
    const blob = await buildDossierDocx({ dossier, templateName, mandateTitle });
    saveAs(blob, filename);
    return;
  }

  const blob = buildDossierPdf({ dossier, templateName, mandateTitle });
  saveAs(blob, filename);
}
