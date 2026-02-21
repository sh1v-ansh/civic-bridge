// ─── CivicBridge — Express Backend ───────────────────────────────────────────
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const path = require("path");
const { nanoid } = require("nanoid");
const cron = require("node-cron");

const Anthropic = require("@anthropic-ai/sdk");
const { translateText } = require("./utils/translate");
const { getRecentBills } = require("./utils/legislation");
const { getScrapedMeetings } = require("./scripts/scrapeMeetings");
const CIVIC_DATA = require("./data/civicData");
const RIGHTS_DB = require("./data/rightsDB");

const app = express();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Letter Store (7-day expiry via setTimeout) ────────────────────────────
const letterStore = new Map();

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

// Rate limiting: 20 requests/hour per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Rate limit exceeded. Please try again in an hour." },
  skip: (req) => req.method === "GET", // Only limit POST/mutating requests
});
app.use("/api", apiLimiter);

// Session (in-memory store)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "civicbridge-dev-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
      httpOnly: true,
    },
  })
);

// ─── Claude Helper ─────────────────────────────────────────────────────────
async function claude(systemPrompt, userMessage, maxTokens = 1024) {
  const startTime = Date.now();
  const params = {
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: userMessage }],
  };
  if (systemPrompt) params.system = systemPrompt;

  const response = await anthropic.messages.create(params);
  return {
    text: response.content[0].text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    elapsed: Date.now() - startTime,
  };
}

function getLangName(langCode) {
  return CIVIC_DATA.LANGUAGES.find((l) => l.code === langCode)?.label || "Spanish";
}

// ─── POST /api/decode ──────────────────────────────────────────────────────
app.post("/api/decode", async (req, res) => {
  const { docText, language } = req.body;
  if (!docText?.trim()) {
    return res.status(400).json({ error: "No document text provided." });
  }

  const langName = getLangName(language);

  const analysisPrompt = `You are CivicBridge, an AI assistant helping non-native English speakers understand official US government and legal documents.

Your job:
1. Explain the document clearly in plain English — what it says, what it means, what's important
2. Identify the MOST IMPORTANT action the person must take, with any deadlines
3. Identify rights the person has that they might not know about
4. Flag anything unusual, concerning, or potentially illegal

Format with clear sections:
📋 What does this document say?
⚡ Action Required (deadlines and what to do)
⚖️ Your Rights
🚨 Important Alerts

Be warm, thorough, and empowering. This person is counting on you.`;

  const deadlinePrompt = `Extract ALL deadlines and required actions from the document analysis and original document below.
Return ONLY valid JSON in exactly this format:
{
  "deadlines": [
    { "action": "string describing what to do", "date": "YYYY-MM-DD or null if no specific date", "urgency": "critical|soon|informational", "consequence": "string describing what happens if missed" }
  ],
  "classifiedType": "lease|eviction|financial_aid|government_notice|medical|other"
}
Urgency rules: critical = within 7 days or immediate action; soon = within 30 days; informational = no deadline or > 30 days.
Return ONLY the JSON object, no other text.`;

  try {
    const debugMode = req.query.debug === "true";

    // Step 1: Main analysis (English for quality)
    const analysisResult = await claude(
      analysisPrompt,
      `Please analyze this document:\n\n${docText}`,
      1200
    );

    // Step 2: Extract deadlines
    const deadlineResult = await claude(
      null,
      `${deadlinePrompt}\n\n--- Document Analysis ---\n${analysisResult.text}\n\n--- Original Document ---\n${docText}`,
      600
    );

    // Parse deadline JSON
    let deadlines = [];
    let classifiedType = "other";
    try {
      const jsonMatch = deadlineResult.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        deadlines = parsed.deadlines || [];
        classifiedType = parsed.classifiedType || "other";
      }
    } catch (e) {
      console.error("[decode] Failed to parse deadline JSON:", e.message);
    }

    // Step 3: Translate analysis if non-English requested
    let analysis = analysisResult.text;
    let translationFailed = false;
    if (language && language !== "en") {
      try {
        analysis = await translateText(analysisResult.text, language);
      } catch (e) {
        translationFailed = true;
        console.warn("[decode] Translation failed, using English analysis");
      }
    }

    // Get rights for classified document type
    const rights = RIGHTS_DB[classifiedType] || RIGHTS_DB.other;

    // Store in session history
    if (!req.session.docHistory) req.session.docHistory = [];
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      docType: classifiedType,
      deadlines,
      language: language || "en",
      // Store a short snippet of the analysis (not full, to save session memory)
      snippet: analysis.slice(0, 300),
    };
    req.session.docHistory = [historyItem, ...req.session.docHistory].slice(0, 5);

    const responseBody = {
      analysis,
      deadlines,
      classifiedType,
      rights,
      translationFailed,
    };

    if (debugMode) {
      responseBody._debug = {
        analysisTokens: { in: analysisResult.inputTokens, out: analysisResult.outputTokens },
        deadlineTokens: { in: deadlineResult.inputTokens, out: deadlineResult.outputTokens },
        totalElapsed: analysisResult.elapsed + deadlineResult.elapsed,
        translationUsed: language !== "en" && !translationFailed,
      };
    }

    res.json(responseBody);
  } catch (error) {
    console.error("[decode] Error:", error.message);
    res.status(500).json({ error: "Failed to analyze document. Please try again." });
  }
});

// ─── POST /api/discover ────────────────────────────────────────────────────
app.post("/api/discover", async (req, res) => {
  const { concern } = req.body;

  try {
    // Get meetings (try scraped, fallback to hardcoded)
    let meetings = CIVIC_DATA.upcomingMeetings;
    try {
      const scraped = await getScrapedMeetings();
      if (scraped && scraped.length > 0) {
        meetings = scraped;
      }
    } catch (e) {
      console.warn("[discover] Scraper error, using hardcoded meetings");
    }

    let meetingIds = [];
    let debugInfo = null;

    if (concern?.trim()) {
      const systemPrompt = `You are a civic engagement assistant. Given a person's concern (possibly in a non-English language), identify which civic meetings are most relevant. Return ONLY a JSON array of meeting IDs (numbers), sorted by relevance. Example: [3, 1, 5]. Return nothing else.

Available meetings:
${meetings.map((m) => `ID ${m.id}: "${m.title}" — ${m.description} Topics: ${m.relevantTopics.join(", ")}`).join("\n")}`;

      const debugMode = req.query.debug === "true";
      const startTime = Date.now();
      const result = await claude(systemPrompt, `My concern: ${concern}`, 200);

      try {
        meetingIds = JSON.parse(result.text.match(/\[[\d,\s]+\]/)?.[0] || "[]");
      } catch {
        meetingIds = [];
      }

      if (debugMode) {
        debugInfo = {
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          elapsed: Date.now() - startTime,
        };
      }
    }

    // Get relevant bills
    const bills = await getRecentBills();

    const responseBody = { meetingIds, bills, meetings };
    if (debugInfo) responseBody._debug = debugInfo;
    res.json(responseBody);
  } catch (error) {
    console.error("[discover] Error:", error.message);
    res.status(500).json({ error: "Failed to process request." });
  }
});

// ─── POST /api/speak ───────────────────────────────────────────────────────
app.post("/api/speak", async (req, res) => {
  const { concern, docType, repIndex, language } = req.body;
  if (!concern?.trim()) {
    return res.status(400).json({ error: "No concern provided." });
  }

  const rep = CIVIC_DATA.representatives[repIndex ?? 0];
  const langName = getLangName(language);

  let docTypeDesc;
  switch (docType) {
    case "testimony":
      docTypeDesc = "spoken testimony script for a public hearing";
      break;
    case "publiccomment":
      docTypeDesc = "written public comment";
      break;
    case "complaint":
      docTypeDesc = "formal complaint letter";
      break;
    default:
      docTypeDesc = `letter addressed to ${rep.name}, ${rep.title}`;
  }

  const systemPrompt = `You are CivicBridge, helping a non-native English speaker communicate with their government. The user will describe their concern in any language. You must:

1. Understand their concern fully, even if written in ${langName}
2. Generate a professional, formal ${docTypeDesc} in ENGLISH
3. The letter should be warm but formal, specific, and compelling
4. Reference the person's community (Amherst, MA, ZIP 01003) where relevant
5. End with: "Translated from ${langName} — written with assistance from CivicBridge (civicbridge.amherst.ma)"
6. After the letter, write exactly "---" on its own line, then provide a brief summary in ${langName} explaining what the letter says, so the person can verify it reflects their intent.

Letter length: 200-350 words. Summary: 3-5 sentences.`;

  try {
    const debugMode = req.query.debug === "true";
    const result = await claude(systemPrompt, `My concern (in my own words): ${concern}`, 1400);

    const parts = result.text.split(/\n---\n/);
    const letter = parts[0]?.trim() || result.text;
    let summary = parts[1]?.trim() || "";

    // If summary needs translation and Claude didn't write it in target language
    if (!summary && language && language !== "en") {
      try {
        summary = await translateText(
          `Summary: The letter above explains your concern about ${concern.slice(0, 100)} and requests action from your representative.`,
          language
        );
      } catch {
        summary = "";
      }
    }

    // Store letter for sharing
    const letterId = nanoid(8);
    letterStore.set(letterId, {
      letter,
      summary,
      repInfo: docType === "representative" ? rep : null,
      language,
      createdAt: Date.now(),
    });

    // Auto-expire after 7 days
    setTimeout(() => letterStore.delete(letterId), 7 * 24 * 60 * 60 * 1000);

    const responseBody = { letter, summary, letterId };
    if (debugMode) {
      responseBody._debug = {
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        elapsed: result.elapsed,
      };
    }

    res.json(responseBody);
  } catch (error) {
    console.error("[speak] Error:", error.message);
    res.status(500).json({ error: "Failed to generate letter. Please try again." });
  }
});

// ─── POST /api/translate ───────────────────────────────────────────────────
app.post("/api/translate", async (req, res) => {
  const { text, targetLang } = req.body;
  if (!text || !targetLang) {
    return res.status(400).json({ error: "Missing text or targetLang." });
  }

  try {
    const translated = await translateText(text, targetLang);
    res.json({ translated, fallback: translated === text && targetLang !== "en" });
  } catch (error) {
    console.error("[translate] Error:", error.message);
    res.status(500).json({ error: "Translation failed.", translated: text });
  }
});

// ─── GET /api/history ──────────────────────────────────────────────────────
app.get("/api/history", (req, res) => {
  res.json({ history: req.session.docHistory || [] });
});

// ─── GET /api/meetings ─────────────────────────────────────────────────────
app.get("/api/meetings", async (req, res) => {
  try {
    const scraped = await getScrapedMeetings();
    const meetings = (scraped && scraped.length > 0) ? scraped : CIVIC_DATA.upcomingMeetings;
    res.json({ meetings });
  } catch {
    res.json({ meetings: CIVIC_DATA.upcomingMeetings });
  }
});

// ─── GET /letter/:id ───────────────────────────────────────────────────────
app.get("/letter/:id", (req, res) => {
  const data = letterStore.get(req.params.id);
  if (!data) {
    return res.status(404).send(`<!DOCTYPE html>
<html><head><title>Letter Not Found</title><meta charset="UTF-8">
<style>body{font-family:Georgia,serif;max-width:600px;margin:80px auto;text-align:center;color:#444}h1{color:#c00}</style>
</head><body><h1>Letter Not Found</h1>
<p>This letter link has expired (letters are kept for 7 days) or the ID is incorrect.</p>
<p>Please generate a new letter at <a href="/">CivicBridge</a>.</p>
</body></html>`);
  }

  const { letter, repInfo } = data;
  const recipientBlock = repInfo
    ? `<div class="recipient"><strong>To:</strong><br>${repInfo.name}<br>${repInfo.title}<br><pre style="font-family:inherit;margin:0">${repInfo.office}</pre></div>`
    : "";

  const safeText = letter
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CivicBridge Letter</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; max-width: 700px; margin: 40px auto; padding: 0 24px; line-height: 1.8; color: #222; background: #fafaf8; }
    .letter-container { background: #fff; border: 1px solid #ddd; padding: 48px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .cb-header { display:flex; align-items:center; gap:10px; margin-bottom:32px; padding-bottom:20px; border-bottom:2px solid #eab308; }
    .cb-logo { font-size:22px; }
    .cb-title { font-family:sans-serif; font-weight:700; font-size:18px; color:#222; }
    .recipient { background:#f5f5f0; border-left:3px solid #eab308; padding:12px 16px; margin-bottom:32px; font-size:15px; line-height:1.6; }
    .letter-body { white-space:pre-wrap; font-size:15px; line-height:1.9; }
    .print-btn { display:block; margin:32px auto 8px; padding:11px 28px; background:#1a1a2e; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:15px; font-family:sans-serif; font-weight:600; }
    .print-btn:hover { background:#2d2d52; }
    .footer { margin-top:32px; padding-top:16px; border-top:1px solid #e0e0e0; font-size:12px; color:#888; font-family:sans-serif; text-align:center; }
    @media print { .print-btn, .cb-header { display:none; } body { background:#fff; } .letter-container { border:none; box-shadow:none; padding:0; } }
  </style>
</head>
<body>
  <div class="letter-container">
    <div class="cb-header">
      <span class="cb-logo">⚖</span>
      <span class="cb-title">CivicBridge — Civic Letter</span>
    </div>
    ${recipientBlock}
    <div class="letter-body">${safeText}</div>
    <button class="print-btn" onclick="window.print()">🖨 Print Letter</button>
    <div class="footer">Generated by <strong>CivicBridge</strong> — Civic empowerment platform for Amherst, MA (01003) · This letter was reviewed and sent by a community member.</div>
  </div>
</body>
</html>`);
});

// ─── Serve static frontend in production ───────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

// ─── Cron: Scrape meetings every 6 hours ──────────────────────────────────
cron.schedule("0 */6 * * *", async () => {
  console.log("[cron] Running scheduled meeting scrape...");
  try {
    await getScrapedMeetings(true);
  } catch (e) {
    console.error("[cron] Scrape failed:", e.message);
  }
});

// ─── Start server ─────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "3001", 10);
app.listen(PORT, () => {
  console.log(`
  ⚖  CivicBridge backend running
  ─────────────────────────────────
  Local:   http://localhost:${PORT}
  API:     http://localhost:${PORT}/api/decode
  Letters: http://localhost:${PORT}/letter/:id
  ─────────────────────────────────
  LibreTranslate: ${process.env.LIBRE_TRANSLATE_URL || "http://localhost:5000"}
  Claude model:   claude-sonnet-4-20250514
  `);
});
