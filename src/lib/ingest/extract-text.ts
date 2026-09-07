import mammoth from "mammoth";

export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (
    type === "text/plain" ||
    type === "text/markdown" ||
    name.endsWith(".txt") ||
    name.endsWith(".md")
  ) {
    return file.text();
  }

  if (
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value.trim();
  }

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/parse-pdf", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "PDF parse failed");
    }
    return String(data.text || "").trim();
  }

  // Fallback: try reading as text
  try {
    const text = await file.text();
    if (text && !text.includes("\u0000")) return text.trim();
  } catch {
    /* ignore */
  }

  throw new Error(
    "Unsupported file type. Use PDF, DOCX, or TXT (or paste text manually)."
  );
}
