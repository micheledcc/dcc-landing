import assert from "node:assert/strict";
import { test } from "node:test";
import { createCanvas } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// Synthetic content only: no business/investor document is embedded in a test.
function testPdf(): Uint8Array {
  const stream = "BT /F1 12 Tf 10 100 Td (DCC preview test) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(pdf));
}

test("patched PDF renderer parses and renders a page using the viewer's canvas API", async () => {
  const task = getDocument({ data: testPdf(), useSystemFonts: true });
  const document = await task.promise;
  try {
    assert.equal(document.numPages, 1);
    const page = await document.getPage(1);
    const text = await page.getTextContent();
    assert.ok(text.items.some((item) => "str" in item && item.str === "DCC preview test"));
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = createCanvas(viewport.width, viewport.height);
    await page.render({ canvas: canvas as unknown as HTMLCanvasElement, canvasContext: canvas.getContext("2d") as unknown as CanvasRenderingContext2D, viewport }).promise;
    assert.equal(canvas.width, 300);
    assert.ok(canvas.toBuffer("image/png").length > 500);
  } finally { await task.destroy(); }
});
