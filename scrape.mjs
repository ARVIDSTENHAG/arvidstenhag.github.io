import fs from "node:fs";
import puppeteer from "puppeteer";

const URL = "https://www.prisjakt.nu/c/datorskarmar";
const SELECTOR = '[data-test="ProductName"]';
const CSV_PATH = "./resultat.csv";

function saveToCSV(rows, path) {
  const header = "headline,url,timestamp\n";
  const ts = new Date().toISOString();
  const body = rows.map(r => {
    const h = (r.headline || "").replace(/"/g, '""');
    const u = (r.url || "").replace(/"/g, '""');
    return `"${h}","${u}","${ts}"`;
  }).join("\n");
  fs.writeFileSync(path, header + body, "utf-8");
  console.log(`✅ Sparade ${rows.length} rader till ${path}`);
}

(async () => {
  const browser = await puppeteer.launch(); // kör headless Chrome
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (compatible; SimpleScraper/1.0)");

  try {
    await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector(SELECTOR, { timeout: 20000 });

    const data = await page.$$eval(SELECTOR, els =>
      els.map(el => {
        const headline = (el.textContent || "").trim();
        const a = el.closest("a");
        const url = a ? a.href : "";
        return { headline, url };
      }).filter(x => x.headline)
    );

    saveToCSV(data, CSV_PATH);
  } catch (err) {
    console.error("❌ Fel:", err.message);
  } finally {
    await browser.close();
  }
})();
