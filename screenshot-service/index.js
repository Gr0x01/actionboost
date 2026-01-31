const express = require("express");
const puppeteer = require("puppeteer-core");
const { URL } = require("url");
const app = express();

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error("API_KEY env var is required");
  process.exit(1);
}

const MAX_CONCURRENT = 3;
let active = 0;

/** Block private/internal IPs and non-http(s) protocols */
function isSafeUrl(raw) {
  try {
    const parsed = new URL(raw);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    const host = parsed.hostname;
    if (
      /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|0\.|::1$|fe80:)/i.test(
        host
      )
    )
      return false;
    if (!host.includes(".")) return false;
    return true;
  } catch {
    return false;
  }
}

function clamp(val, min, max, fallback) {
  const n = parseInt(val, 10);
  if (isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

app.get("/screenshot", async (req, res) => {
  if (req.headers["x-api-key"] !== API_KEY) return res.status(401).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "url required" });
  if (!isSafeUrl(url)) return res.status(400).json({ error: "url not allowed" });

  if (active >= MAX_CONCURRENT) {
    return res.status(429).json({ error: "too many concurrent requests" });
  }

  const width = clamp(req.query.width, 320, 1920, 1280);
  const height = clamp(req.query.height, 200, 1080, 800);

  active++;
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: "/snap/bin/chromium",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });
    const screenshot = await page.screenshot({ type: "jpeg", quality: 80 });
    const buf = Buffer.from(screenshot);
    res.set("Content-Type", "image/jpeg");
    res.set("Content-Length", buf.length.toString());
    res.end(buf);
  } catch (err) {
    console.error("Screenshot error:", err.message);
    res.status(500).json({ error: "Screenshot failed" });
  } finally {
    active--;
    if (browser) {
      browser.close().catch(() => {});
    }
  }
});

app.get("/reddit-proxy", async (req, res) => {
  if (req.headers["x-api-key"] !== API_KEY) return res.status(401).end();

  const { sub, sort = "new", limit = 25 } = req.query;
  if (!sub || !/^[a-zA-Z0-9_]+$/.test(sub)) {
    return res.status(400).json({ error: "valid sub required" });
  }

  try {
    const url = `https://www.reddit.com/r/${sub}/${sort}.json?limit=${limit}`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "boost-bot/1.0 (by /u/actionboost)" },
    });
    if (!resp.ok) {
      return res.status(resp.status).json({ error: `Reddit returned ${resp.status}` });
    }
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error("Reddit proxy error:", err.message);
    res.status(500).json({ error: "Reddit fetch failed" });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log("Screenshot service on :" + PORT));
