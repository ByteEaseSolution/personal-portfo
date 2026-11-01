/* ============================================================================
   Serverless PDF generator (Vercel, Node.js runtime).
   ----------------------------------------------------------------------------
   Renders this same site through headless Chromium and returns a PDF built
   from css/print.css — i.e. the exact decorated keepsake, with full control
   over page breaks, margins and the page frame. No browser print dialog.

   It renders /index.html, which reads its content from js/data.js (the
   published content), so the PDF always matches what visitors see. After you
   edit via admin.html, remember to Download data.js, commit and push so this
   reflects your latest content.
   ========================================================================== */

const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

module.exports = async (req, res) => {
  let browser;
  try {
    // Build the absolute URL of our own index.html on this deployment.
    const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0];
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const url = `${proto}://${host}/index.html`;

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1240, height: 1754 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0", timeout: 45000 });

    // Make sure web fonts (and any images) have settled before printing.
    try { await page.evaluate(() => document.fonts && document.fonts.ready); } catch (e) {}

    // page.pdf() uses print-media CSS, so css/print.css applies automatically.
    const pdf = await page.pdf({
      printBackground: true,      // paint the rose frame, chips, cards
      preferCSSPageSize: true,    // honour @page size (A4) + margins from print.css
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="Samir-Portfolio.pdf"');
    res.setHeader("Cache-Control", "no-store");
    res.end(pdf);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "PDF generation failed", detail: String((err && err.message) || err) }));
  } finally {
    if (browser) { try { await browser.close(); } catch (e) {} }
  }
};
