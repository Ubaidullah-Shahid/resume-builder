import PDFDocument from "pdfkit";

export function renderResumePdf(res, data) {
  const doc = new PDFDocument({ size: "A4", margins: { top: 50, bottom: 50, left: 56, right: 56 } });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${(data.fullName || "resume").replace(/[^a-z0-9]+/gi, "-")}.pdf"`);
  doc.pipe(res);

  doc.font("Helvetica-Bold").fontSize(22).text(data.fullName || "Untitled");
  if (data.title) doc.font("Helvetica").fontSize(12).fillColor("#555").text(data.title);
  doc.moveDown();

  if (data.summary) {
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#000").text("SUMMARY");
    doc.font("Helvetica").fontSize(10.5).text(data.summary);
    doc.moveDown();
  }

  if (Array.isArray(data.experience)) {
    doc.font("Helvetica-Bold").fontSize(11).text("EXPERIENCE");
    data.experience.forEach((job) => {
      doc.font("Helvetica-Bold").fontSize(11).text(`${job.role || ""} — ${job.company || ""}`);
      (job.bullets || []).forEach((b) => doc.font("Helvetica").fontSize(10).text(`• ${b}`));
      doc.moveDown(0.5);
    });
  }

  doc.end();
}