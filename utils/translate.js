// ─── LibreTranslate Integration ───────────────────────────────────────────────
// Self-hostable, free translation. Run locally:
// docker run -ti --rm -p 5000:5000 libretranslate/libretranslate

const fetch = require("node-fetch");

const LIBRE_URL = process.env.LIBRE_TRANSLATE_URL || "http://localhost:5000";

// In-memory translation cache: keyed by `${text}_${targetLang}`
const translationCache = new Map();

// Supported target language codes
const SUPPORTED_LANGS = ["es", "zh", "pt", "fr", "ar", "hi", "vi", "ko"];

/**
 * Translate text using LibreTranslate.
 * Falls back to original text (English) if translation service is unavailable.
 *
 * @param {string} text - The text to translate
 * @param {string} targetLang - BCP-47 language code (e.g. "es", "zh", "fr")
 * @returns {Promise<string>} - Translated text, or original on failure
 */
async function translateText(text, targetLang) {
  if (!text || !targetLang || targetLang === "en") return text;
  if (!SUPPORTED_LANGS.includes(targetLang)) return text;

  const cacheKey = `${targetLang}_${text.slice(0, 100)}_${text.length}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(`${LIBRE_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "en",
        target: targetLang,
        format: "text",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`LibreTranslate returned ${response.status}`);
    }

    const data = await response.json();
    const translated = data.translatedText || text;

    // Cache successful translations (limit cache size)
    if (translationCache.size > 500) {
      const firstKey = translationCache.keys().next().value;
      translationCache.delete(firstKey);
    }
    translationCache.set(cacheKey, translated);

    return translated;
  } catch (err) {
    // Graceful fallback: return original English text
    const reason = err.name === "AbortError" ? "timeout" : err.message;
    console.warn(`[translate] LibreTranslate unavailable (${reason}). Falling back to English.`);
    return text;
  }
}

/**
 * Translate multiple strings in parallel.
 * @param {string[]} texts
 * @param {string} targetLang
 * @returns {Promise<string[]>}
 */
async function translateBatch(texts, targetLang) {
  return Promise.all(texts.map((t) => translateText(t, targetLang)));
}

/**
 * Check if LibreTranslate is reachable.
 * @returns {Promise<boolean>}
 */
async function isTranslationAvailable() {
  try {
    const res = await fetch(`${LIBRE_URL}/languages`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

module.exports = { translateText, translateBatch, isTranslationAvailable };
