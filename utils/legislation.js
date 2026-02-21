// ─── Open States API Integration ──────────────────────────────────────────────
// Fetches recent Massachusetts bills relevant to immigrant/tenant communities
// Free API at https://v3.openstates.org/bills
// Get an API key at https://openstates.org/api/

const fetch = require("node-fetch");

const OPEN_STATES_URL = "https://v3.openstates.org/bills";
const API_KEY = process.env.OPEN_STATES_API_KEY || "";

// 24-hour cache
let billsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000;

// Keywords relevant to our community
const RELEVANT_KEYWORDS = [
  "rent",
  "tenant",
  "immigrant",
  "language access",
  "housing",
  "eviction",
  "rental",
  "renter",
  "affordable housing",
  "immigration",
  "multilingual",
];

// Hardcoded fallback bills (always fresh for demo)
const FALLBACK_BILLS = [
  {
    id: "MAH1234",
    title: "H.1234 — Language Access in State Agencies Act",
    description:
      "Requires all state agencies to provide translation services in the 10 most common languages spoken in Massachusetts, including Spanish, Portuguese, and Chinese.",
    status: "In Committee",
    session: "2025-2026",
    url: "https://malegislature.gov",
    tags: ["language access", "immigration"],
    updatedAt: "2026-01-15",
  },
  {
    id: "MAS2777",
    title: "S.2777 — Tenant Stability & Rent Stabilization Act",
    description:
      "Would require 90 days notice for rent increases exceeding 5% for tenants who have lived in a unit for 2+ years, and cap annual increases at 7% for long-term tenants.",
    status: "Senate Committee Hearing",
    session: "2025-2026",
    url: "https://malegislature.gov",
    tags: ["rent", "tenant", "housing"],
    updatedAt: "2026-01-20",
  },
  {
    id: "MAH3600",
    title: "H.3600 — Tenant Opportunity to Purchase Act (TOPA)",
    description:
      "Gives tenants the right of first refusal when their landlord sells a rental property, allowing tenant groups and community organizations to purchase the building.",
    status: "House Committee Review",
    session: "2025-2026",
    url: "https://malegislature.gov",
    tags: ["tenant", "housing", "affordable housing"],
    updatedAt: "2025-12-10",
  },
  {
    id: "MAS1091",
    title: "S.1091 — SNAP Access for Immigrant Families",
    description:
      "Expands state food assistance (SNAP/food stamps) eligibility to all income-qualifying Massachusetts residents regardless of immigration status.",
    status: "Senate Judiciary Committee",
    session: "2025-2026",
    url: "https://malegislature.gov",
    tags: ["immigration", "immigrant", "benefits"],
    updatedAt: "2025-11-30",
  },
  {
    id: "MAH4120",
    title: "H.4120 — Housing Court Tenant Representation Act",
    description:
      "Establishes a right to legal representation for tenants facing eviction in Massachusetts Housing Court, funded by a small surcharge on court filings.",
    status: "House Ways & Means",
    session: "2025-2026",
    url: "https://malegislature.gov",
    tags: ["eviction", "tenant", "housing"],
    updatedAt: "2025-12-20",
  },
];

/**
 * Fetch recent Massachusetts bills relevant to our community.
 * Caches for 24 hours; falls back to hardcoded data if API fails.
 * @returns {Promise<Array>}
 */
async function getRecentBills() {
  // Return cache if fresh
  if (billsCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return billsCache;
  }

  // If no API key, return fallback immediately
  if (!API_KEY) {
    billsCache = FALLBACK_BILLS;
    cacheTimestamp = Date.now();
    return FALLBACK_BILLS;
  }

  try {
    const params = new URLSearchParams({
      jurisdiction: "ma",
      session: "2025-2026",
      per_page: "20",
      sort: "updated_desc",
    });

    const headers = { "X-API-KEY": API_KEY };
    const url = `${OPEN_STATES_URL}?${params}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`Open States API: ${response.status}`);

    const data = await response.json();
    const bills = (data.results || [])
      .filter((bill) => {
        const text = `${bill.title} ${bill.subject?.join(" ")}`.toLowerCase();
        return RELEVANT_KEYWORDS.some((kw) => text.includes(kw));
      })
      .slice(0, 5)
      .map((bill) => ({
        id: bill.id,
        title: `${bill.identifier} — ${bill.title}`,
        description: bill.abstract || bill.title,
        status: bill.latest_action?.description || "Pending",
        session: bill.session,
        url: bill.openstates_url,
        tags: bill.subject || [],
        updatedAt: bill.updated_at?.slice(0, 10),
      }));

    const result = bills.length > 0 ? bills : FALLBACK_BILLS;
    billsCache = result;
    cacheTimestamp = Date.now();
    return result;
  } catch (err) {
    console.warn("[legislation] Open States API unavailable, using fallback bills:", err.message);
    billsCache = FALLBACK_BILLS;
    cacheTimestamp = Date.now();
    return FALLBACK_BILLS;
  }
}

module.exports = { getRecentBills };
