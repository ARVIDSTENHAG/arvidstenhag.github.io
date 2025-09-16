import puppeteer from "puppeteer";
import { createObjectCsvWriter as createCsvWriter } from "csv-writer";

/* ====== INSTÄLLNINGAR ====== */
const START_URL   = "https://www.blocket.se/annonser/hela_sverige?q=barnvagn";
const LIST_PAGES  = 2;     // hur många resultatsidor du vill gå igenom
const MAX_ADS     = 80;    // max antal annonser totalt
const CONCURRENCY = 2;     // hur många annons-sidor parallellt (håll lågt)
const OUT_FILE    = "barnvagnar_bloket.csv";
/* =========================== */

const csvWriter = createCsvWriter({
  path: OUT_FILE,
  header: [
    { id: "title",     title: "title" },
    { id: "price_sek", title: "price_sek" },
    { id: "location",  title: "location" },
    { id: "posted",    title: "posted" },
    { id: "link",      title: "link" }
  ],
  append: false
});

const sleep = (ms) => new Promise(res => setTimeout(res, ms));
const parsePrice = (txt = "") => {
  const n = (txt.match(/\d[\d\s]*/)?.[0] || "").replace(/\s+/g, "");
  return n ? Number(n) : null;
};

async function dismissBanners(page) {
  // Försöker klicka bort vanliga cookie/pop-up knappar
  try {
    await page.evaluate(() => {
      const clickByText = (words) => {
        const els = Array.from(document.querySelectorAll("button, a, div[role='button']"));
        for (const w of words) {
          const el = els.find(e => (e.textContent || "").toLowerCase().includes(w));
          if (el) { el.click(); return true; }
        }
        return false;
      };
      clickByText(["godkänn", "acceptera", "ok"]);
    });
  } catch {}
}

async function collectListingLinks(page) {
  let url = START_URL;
  const found = new Set();

  for (let i = 1; i <= LIST_PAGES && url; i++) {
    console.log(`👉 Lista sida ${i}: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await dismissBanners(page);
    await page.waitForSelector("a[href*='/annons/']", { timeout: 15000 }).catch(() => {});
    await sleep(600);

    const links = await page.evaluate(() => {
      const out = new Set();
      for (const a of Array.from(document.querySelectorAll('a[href*="/annons/"]'))) {
        let href = a.href;
        if (!href) continue;
        if (href.startsWith("/")) href = location.origin + href;
        if (/\/annons\//.test(href)) out.add(href.split("?")[0]);
      }
      return Array.from(out);
    });

    links.forEach(l => found.add(l));
    console.log(`   → hittade ${links.length} (totalt: ${found.size})`);

    // försök hitta "nästa" – annars öka ?page
    const next = await page.evaluate(() => {
      const a = Array.from(document.querySelectorAll("a"))
        .find(x => /nästa|next|›/i.test(x.textContent || ""));
      return a?.href || null;
    });

    if (next) {
      url = next;
    } else {
      try {
        const u = new URL(url);
        const cur = Number(u.searchParams.get("page") || "1");
        u.searchParams.set("page", String(cur + 1));
        url = i === 1 ? u.toString() : null;
      } catch { url = null; }
    }

    await sleep(900 + Math.floor(Math.random() * 400));
  }

  const arr = Array.from(found).slice(0, MAX_ADS);
  console.log(`🔗 Totalt ${arr.length} länkar att läsa i detalj.`);
  return arr;
}

async function extractAd(browser, link, idx) {
  const page = await browser.newPage();
  try {
    await page.goto(link, { waitUntil: "networkidle2", timeout: 60000 });
    await dismissBanners(page);
    await page.waitForSelector("h1, h2, [data-testid*='title']", { timeout: 12000 }).catch(() => {});
    await sleep(400);

    // 1) Försök JSON-LD först
    const jsonLd = await page.evaluate(() => {
      const out = [];
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        try { out.push(JSON.parse(s.textContent || "{}")); } catch {}
      }
      return out;
    });

    let title = "";
    let priceRaw = "";
    let location = "";
    let posted = "";

    const getFirst = (v) => Array.isArray(v) ? v[0] : v;

    for (const node of jsonLd) {
      const arr = Array.isArray(node) ? node : [node];
      for (const item0 of arr) {
        const item = item0 || {};
        title = title || item.name || item.headline || "";
        const offers = item.offers ?? getFirst(item.offers);
        if (!priceRaw && offers) {
          if (Array.isArray(offers) && offers[0]?.price) priceRaw = String(offers[0].price);
          else if (offers?.price) priceRaw = String(offers.price);
        }
        if (!priceRaw && item.price) priceRaw = String(item.price);

        if (!location) {
          location =
            item.areaServed?.name ||
            item.address?.addressLocality ||
            item.location?.name ||
            "";
        }
        posted = posted || item.datePosted || item.datePublished || item.uploadDate || "";
      }
    }

    // 2) Fallback: synlig DOM
    if (!title) {
      title = await page.$eval("h1, h2, [data-testid*='title']", el => el.textContent.trim()).catch(() => "");
    }
    if (!priceRaw) {
      priceRaw = await page.$eval(
        '[data-testid*="price"], [class*="price"], [itemprop="price"]',
        el => el.textContent.trim()
      ).catch(() => "");
    }
    if (!location) {
      location = await page.$eval(
        '[data-testid*="location"], [class*="location"], [itemprop="addressLocality"]',
        el => el.textContent.trim()
      ).catch(() => "");
    }
    if (!posted) {
      posted = await page.$eval("time,[datetime]", el => el.textContent.trim()).catch(() => "");
    }

    const price_sek = parsePrice(priceRaw || "");
    if (Number.isFinite(price_sek) && price_sek > 0) {
      console.log(`   [${idx}] OK: ${title?.slice(0,40)} | ${price_sek} kr | ${location || "-"}`);
      return { title, price_sek, location: location || "", posted, link };
    } else {
      console.log(`   [${idx}] SKIPPAS (inget pris): ${link}`);
      return null;
    }
  } catch (e) {
    console.log(`   [${idx}] FEL: ${link} (${e.message})`);
    return null;
  } finally {
    await page.close();
  }
}

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1366, height: 900 },
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36"
  );

  const links = await collectListingLinks(page);
  const out = [];

  let i = 0;
  while (i < links.length) {
    const chunk = links.slice(i, i + CONCURRENCY);
    const batch = await Promise.all(chunk.map((l, k) => extractAd(browser, l, i + k + 1)));
    out.push(...batch.filter(Boolean));
    i += CONCURRENCY;
    await sleep(600);
  }

  // skriv CSV – endast annonser som har pris (övriga redan filtrerade)
  await csvWriter.writeRecords(out);
  console.log(`✅ KLART: ${out.length} annonser med pris sparade i ${OUT_FILE}`);

  await browser.close();
}

run().catch(e => {
  console.error("Fel:", e);
  process.exit(1);
});
