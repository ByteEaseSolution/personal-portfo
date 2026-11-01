/* "Download as PDF" behaviour.
   - On the hosted site (Vercel): calls /api/pdf, which renders a polished,
     server-generated PDF and downloads it — no print dialog.
   - Locally (file:// or a plain static server without the API): falls back to
     the browser's print dialog, which uses the same css/print.css. */

function downloadPDF() {
  const overlay = document.getElementById("pdf-overlay");
  const onWeb = location.protocol === "http:" || location.protocol === "https:";

  // Opened as a local file → straight to the print dialog.
  if (!onWeb) { window.print(); return; }

  if (overlay) overlay.classList.add("show");

  fetch("/api/pdf")
    .then((r) => {
      if (!r.ok) throw new Error("api-unavailable");
      return r.blob();
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Samir-Portfolio.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      if (overlay) overlay.classList.remove("show");
    })
    .catch(() => {
      // No serverless API here (e.g. local preview) → use the print dialog.
      if (overlay) overlay.classList.remove("show");
      window.print();
    });
}
