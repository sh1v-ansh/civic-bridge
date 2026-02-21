#!/usr/bin/env node
// ─── Amherst Civic Calendar Scraper ──────────────────────────────────────────
// Scrapes https://www.amherstma.gov/calendar.aspx for upcoming public meetings
// Run standalone: node scripts/scrapeMeetings.js
// Or as cron: imported by server.js which schedules it every 6 hours

const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const CALENDAR_URL = "https://www.amherstma.gov/calendar.aspx";
const CACHE_PATH = path.join(__dirname, "../data/meetings_cache.json");

// Civic meeting keywords to filter for relevant public meetings
const RELEVANT_KEYWORDS = [
  "town council", "select board", "school committee", "planning board",
  "zoning board", "housing", "tenant", "immigration", "public hearing",
  "advisory board", "community", "forum", "workshop",
];

/**
 * Parse date string from Amherst calendar format.
 * @param {string} dateStr
 * @returns {string} ISO date string or empty string
 */
function parseMeetingDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return dateStr || "";
  }
}

/**
 * Extract relevant topics from meeting title and description.
 * @param {string} text
 * @returns {string[]}
 */
function extractTopics(text) {
  const lower = text.toLowerCase();
  const topicMap = {
    rent: ["rent", "rental", "lease"],
    housing: ["housing", "afford", "zoning", "development"],
    eviction: ["eviction", "evict"],
    education: ["school", "education", "ell", "esol", "student"],
    immigration: ["immigration", "immigrant", "citizenship", "refugee", "language"],
    tenant: ["tenant", "renter", "landlord"],
    rights: ["rights", "legal", "advocacy"],
  };

  const found = [];
  for (const [topic, keywords] of Object.entries(topicMap)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      found.push(topic);
    }
  }
  return found;
}

/**
 * Scrape upcoming meetings from Amherst's government calendar.
 * Returns an array of meeting objects.
 */
async function scrapeMeetings() {
  console.log("[scraper] Fetching Amherst calendar...");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(CALENDAR_URL, {
      headers: {
        "User-Agent": "CivicBridge/1.0 (civic empowerment platform; amherst-ma)",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Calendar returned ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const meetings = [];
    let idCounter = 100; // Start from 100 to not conflict with hardcoded IDs

    // Amherst MA calendar uses various CSS structures — try multiple selectors
    const eventSelectors = [
      ".fc-event",
      ".calendar-event",
      ".event-item",
      "[class*='event']",
      "li.eventItem",
    ];

    for (const selector of eventSelectors) {
      $(selector).each((_, el) => {
        const $el = $(el);
        const title = $el.find("[class*='title'], h3, h4, .event-title, strong").first().text().trim()
          || $el.attr("title")?.trim()
          || $el.text().trim().split("\n")[0];

        if (!title || title.length < 5) return;

        const lower = title.toLowerCase();
        const isRelevant = RELEVANT_KEYWORDS.some((kw) => lower.includes(kw));
        if (!isRelevant) return;

        const dateText = $el.find("[class*='date'], time, .date").first().text().trim()
          || $el.attr("data-date");
        const timeText = $el.find("[class*='time'], .time").first().text().trim();
        const location = $el.find("[class*='location'], .location, address").first().text().trim();
        const description = $el.find("[class*='desc'], p").first().text().trim();
        const link = $el.find("a").first().attr("href");

        meetings.push({
          id: idCounter++,
          title: title.slice(0, 100),
          date: parseMeetingDate(dateText) || dateText,
          time: timeText || "Time TBD",
          location: location || "Amherst Town Hall, 4 Boltwood Ave",
          description: description || title,
          agendaLink: link ? (link.startsWith("http") ? link : `https://www.amherstma.gov${link}`) : null,
          publicComment: lower.includes("public") || lower.includes("hearing") || lower.includes("forum"),
          relevantTopics: extractTopics(title + " " + description),
          scrapedAt: new Date().toISOString(),
        });
      });

      if (meetings.length > 0) break; // Found events with this selector
    }

    if (meetings.length === 0) {
      throw new Error("No meetings found in calendar HTML (structure may have changed)");
    }

    console.log(`[scraper] Found ${meetings.length} relevant meetings`);
    return meetings.slice(0, 15);
  } catch (err) {
    console.warn(`[scraper] Scrape failed: ${err.message}`);
    return null; // Caller should fall back to hardcoded data
  }
}

/**
 * Save meetings to cache file.
 * @param {Array} meetings
 */
function saveCache(meetings) {
  try {
    const data = JSON.stringify({ scraped_at: new Date().toISOString(), meetings }, null, 2);
    fs.writeFileSync(CACHE_PATH, data, "utf8");
    console.log(`[scraper] Cached ${meetings.length} meetings to ${CACHE_PATH}`);
  } catch (err) {
    console.error("[scraper] Failed to write cache:", err.message);
  }
}

/**
 * Load meetings from cache file.
 * @returns {{ meetings: Array, scraped_at: string } | null}
 */
function loadCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) return null;
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Main scraping function — scrape and cache, or load from cache if fresh.
 * @param {boolean} force - Force re-scrape even if cache is fresh
 * @returns {Promise<Array|null>} meetings array, or null to use hardcoded fallback
 */
async function getScrapedMeetings(force = false) {
  if (!force) {
    const cached = loadCache();
    if (cached?.meetings?.length) {
      const ageMs = Date.now() - new Date(cached.scraped_at).getTime();
      if (ageMs < 6 * 60 * 60 * 1000) {
        // Cache is < 6 hours old
        console.log("[scraper] Using cached meetings (fresh)");
        return cached.meetings;
      }
    }
  }

  const meetings = await scrapeMeetings();
  if (meetings && meetings.length > 0) {
    saveCache(meetings);
    return meetings;
  }

  // Fall back to cache even if stale
  const staleCache = loadCache();
  return staleCache?.meetings || null;
}

// Run standalone if called directly
if (require.main === module) {
  getScrapedMeetings(true).then((meetings) => {
    if (meetings) {
      console.log("Scraped meetings:", JSON.stringify(meetings, null, 2));
    } else {
      console.log("No meetings scraped. Will use hardcoded fallback.");
    }
    process.exit(0);
  });
}

module.exports = { getScrapedMeetings };
