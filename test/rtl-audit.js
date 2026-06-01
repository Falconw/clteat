/* ============================================================
   TechSys — RTL / overflow audit (Playwright)
   ------------------------------------------------------------
   Loads every page in EN + AR at mobile & desktop, then reports:
     • document horizontal overflow (scrollWidth > clientWidth)
     • every element whose right/left edge exceeds the viewport
   Saves screenshots to test/shots/. Exit code 1 if any overflow,
   so CI fails loudly when RTL/layout regresses.

   Run locally:  npm i -D playwright && npx playwright install chromium
                 node test/rtl-audit.js
   ============================================================ */
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PAGES = ["index.html", "about.html", "services.html", "clients.html", "contact.html"];
const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "narrow", width: 960, height: 860 },
  { name: "desktop", width: 1280, height: 900 },
];
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml" };

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split("?")[0]);
      if (p === "/") p = "/index.html";
      const file = path.join(ROOT, p);
      fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404); return res.end("404"); }
        res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
        res.end(buf);
      });
    });
    srv.listen(0, () => resolve(srv));
  });
}

(async () => {
  const srv = await serve();
  const base = `http://localhost:${srv.address().port}`;
  fs.mkdirSync(path.join(__dirname, "shots"), { recursive: true });
  const browser = await chromium.launch();
  let failures = 0;
  const summary = [];
  const detailLog = [];

  for (const page of PAGES) {
    for (const lang of ["en", "ar"]) {
      for (const vp of VIEWPORTS) {
        const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
        const pg = await ctx.newPage();
        // preset language before any script runs
        await pg.addInitScript((l) => { try { localStorage.setItem("ts-lang", l); } catch (e) {} }, lang);
        await pg.goto(`${base}/${page}`, { waitUntil: "networkidle" });
        await pg.waitForTimeout(400);

        const report = await pg.evaluate(() => {
          const de = document.documentElement;
          const vw = de.clientWidth;
          const docOverflow = de.scrollWidth - vw;
          const offenders = [];
          const isClipped = (el) => {
            // walk ancestors; if any clips overflow, this element can't
            // contribute to document scroll (decorative auras, etc.)
            let n = el.parentElement;
            while (n && n !== document.documentElement) {
              const ov = getComputedStyle(n).overflowX;
              if (ov === "hidden" || ov === "clip" || ov === "auto" || ov === "scroll") return true;
              n = n.parentElement;
            }
            return false;
          };
          document.querySelectorAll("body *").forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return;
            if (isClipped(el)) return;
            const overRight = Math.round(r.right - vw);
            const overLeft = Math.round(-r.left);
            if (overRight > 1 || overLeft > 1) {
              const sel = el.tagName.toLowerCase() +
                (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "");
              offenders.push({ sel: sel.slice(0, 70), overRight, overLeft, w: Math.round(r.width) });
            }
          });
          // de-dupe by selector, keep worst
          const map = {};
          offenders.forEach((o) => {
            const k = o.sel;
            if (!map[k] || Math.max(o.overRight, o.overLeft) > Math.max(map[k].overRight, map[k].overLeft)) map[k] = o;
          });
          return { dir: de.dir, lang: de.lang, docOverflow, vw, offenders: Object.values(map).slice(0, 12) };
        });

        const tag = `${page.replace(".html", "")} · ${lang} · ${vp.name}`;
        // Document horizontal scroll is the real pass/fail signal.
        const bad = report.docOverflow > 1;
        if (bad) failures++;
        const line = `${bad ? "✗" : "✓"} ${tag}  [dir=${report.dir}]  docOverflow=${report.docOverflow}px`;
        summary.push(line);
        detailLog.push(line);
        console.log(line);
        report.offenders.forEach((o) => {
          const ol = `      ↳ ${o.sel}  (overRight=${o.overRight} overLeft=${o.overLeft} w=${o.w})`;
          detailLog.push(ol);
          console.log(ol);
        });

        if (vp.name === "mobile") {
          await pg.screenshot({ path: path.join(__dirname, "shots", `${page.replace(".html", "")}-${lang}.png`), fullPage: true });
        }
        await ctx.close();
      }
    }
  }

  await browser.close();
  srv.close();
  console.log("\n──────── SUMMARY ────────");
  summary.forEach((l) => console.log(l));
  console.log(failures === 0 ? "\n✅ No horizontal overflow anywhere." : `\n❌ ${failures} view(s) overflow. See offenders above.`);

  // Write a machine-readable report back to the repo so it can be reviewed
  // without access to CI logs.
  const reportLines = [
    "# RTL / overflow audit report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${failures === 0 ? "PASS — no horizontal overflow" : "FAIL — " + failures + " view(s) overflow"}`,
    "",
    "```",
    ...detailLog,
    "```",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(ROOT, "test", "REPORT.md"), reportLines);

  process.exit(failures === 0 ? 0 : 1);
})();
