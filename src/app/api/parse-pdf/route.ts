import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const data = new Uint8Array(await file.arrayBuffer());
    const parser = new PDFParse({ data });
    try {
      const result = await parser.getText();
      const text = (result.text || "").replace(/\s+\n/g, "\n").trim();

      if (!text) {
        return NextResponse.json(
          {
            error:
              "No text extracted from PDF (it may be scanned/image-only).",
          },
          { status: 422 }
        );
      }

      return NextResponse.json({ text });
    } finally {
      await parser.destroy();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF parse failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
