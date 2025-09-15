// nike.mjs — Minimal, komplett version (namn, pris, URL, bild → CSV)
import fs from "node:fs";
import puppeteer from "puppeteer";

// Kör så här: node nike.mjs "https://www.nike.com/w/mens-shoes-nik1zy7ok"
const CATEGORY_URL =
  process.argv[2] || "https://www.nike.com/w/mens-shoes-nik1zy7ok";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function toCSV(rows, catUrl) {
  const header = "name,price,url,image,category_url,timestamp\n";
  const ts = new Date().toISOString();
  const esc = (s = "") => `"${String(s).replace(/"/g, '""')}"`;
  const body = rows
    .map((r) => [esc(r.name), esc(r.price), esc(r.url), esc(r.image), esc(catUrl), esc(ts)].join(","))
    .join("\n");
  return header + body;
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({ "Accept-Language": "sv-SE,sv;q=0.9,en;q=0.8" });

  try {
    await page.goto(CATEGORY_URL, { waitUntil: "networkidle2", timeout: 90000 });

    const CARD_SEL =
      'a[data-testid="product-card__link-overlay"], a.product-card__link-overlay, a.product-card__img-link';
    await page.waitForSelector(CARD_SEL, { timeout: 30000 });
    await sleep(500);

    const items = await page.$$eval("body", () => {
      const SEL = {
        card: 'a[data-testid="product-card__link-overlay"], a.product-card__link-overlay, a.product-card__img-link',
        name: '[data-testid="product-card__title"], .product-card__title, [data-test="product-card__title"]',
        price: '[data-testid="product-price"], .product-price, [data-test="product-price"]'
      };
      const pick = (root, sels) => {
        for (const s of sels.split(",")) {
          const el = root.querySelector(s.trim());
          if (el) return el;
        }
        return null;
      };

      const cards = Array.from(document.querySelectorAll(SEL.card));
      return cards
        .map((a) => {
          const root = a.closest("[data-testid='product-card'], .product-card") || a;
          const nameEl = pick(root, SEL.name);
          const priceEl = pick(root, SEL.price);
          const imgEl = root.querySelector("img") || a.querySelector("img");
          return {
            name: nameEl?.textContent?.trim() || "",
            price: (priceEl?.textContent || "").replace(/\s+/g, " ").trim(),
            url: a.href || "",
            image: imgEl?.getAttribute("src") || imgEl?.getAttribute("data-src") || ""
          };
        })
        .filter((x) => x.name && x.url);
    });

    const outPath = `./nike_${new Date().toISOString().slice(0, 10)}.csv`;
    fs.writeFileSync(outPath, toCSV(items, CATEGORY_URL), "utf-8");
    console.log(`✅ Sparade ${items.length} produkter till ${outPath}`);
  } catch (e) {
    console.error("❌ Fel:", e.message);
  } finally {
    await browser.close();
  }
})();
