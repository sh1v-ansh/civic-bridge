import { useState, useRef, useEffect } from "react";

// ─── Hardcoded civic data for ZIP 01003 (Amherst, MA) ───────────────────────
const CIVIC_DATA = {
  zip: "01003",
  city: "Amherst, MA",
  upcomingMeetings: [
    {
      id: 1,
      title: "Town Council — Housing & Zoning Session",
      date: "February 25, 2026",
      time: "6:30 PM",
      location: "Town Hall, 4 Boltwood Ave, Amherst",
      description: "Agenda includes proposed rent stabilization ordinance and affordable housing development near North Amherst. Public comment open.",
      publicComment: true,
      relevantTopics: ["rent", "housing", "affordability"],
    },
    {
      id: 2,
      title: "Amherst School Committee Meeting",
      date: "February 27, 2026",
      time: "7:00 PM",
      location: "Amherst Regional Middle School, 170 Chestnut St",
      description: "Discussion of English Language Learner (ELL) program funding cuts and multilingual family support services. Public comment open.",
      publicComment: true,
      relevantTopics: ["education", "school", "children", "ESL", "language"],
    },
    {
      id: 3,
      title: "Hampshire County Tenant Rights Forum",
      date: "March 3, 2026",
      time: "5:00 PM",
      location: "Jones Library, 43 Squire St, Amherst",
      description: "Tenant advocacy workshop hosted by Valley Community Development. Free legal consultations available. Interpreters available in Spanish and Mandarin.",
      publicComment: false,
      relevantTopics: ["rent", "housing", "eviction", "tenant", "rights"],
    },
    {
      id: 4,
      title: "MA House Hearing — Immigration & Integration Services",
      date: "March 10, 2026",
      time: "10:00 AM",
      location: "State House, Room 222, Boston (also via Zoom)",
      description: "Joint Committee on Immigration, Citizenship and Refugees hearing on H.1234, a bill to expand language access services in state agencies. Written testimony accepted.",
      publicComment: true,
      relevantTopics: ["immigration", "language", "services", "rights"],
    },
    {
      id: 5,
      title: "UMass Community Advisory Board",
      date: "March 12, 2026",
      time: "4:00 PM",
      location: "Campus Center, UMass Amherst, Room 803",
      description: "Review of international student housing policy and off-campus rental disputes. Open to all UMass community members.",
      publicComment: true,
      relevantTopics: ["housing", "students", "international", "rent"],
    },
  ],
  representatives: [
    {
      name: "Mindy Domb",
      title: "State Representative, 3rd Hampshire District",
      email: "mindy.domb@mahouse.gov",
      phone: "(617) 722-2220",
      office: "State House, Room 130, Boston, MA 02133",
    },
    {
      name: "Jo Comerford",
      title: "State Senator, Hampshire, Franklin & Worcester District",
      email: "jo.comerford@masenate.gov",
      phone: "(617) 722-1532",
      office: "State House, Room 511-B, Boston, MA 02133",
    },
    {
      name: "Shalini Agrawal",
      title: "Amherst Town Council, District 1",
      email: "sagrawal@amherstma.gov",
      phone: "(413) 259-3040",
      office: "4 Boltwood Ave, Amherst, MA 01002",
    },
  ],
};

const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇲🇽" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
];

const SAMPLE_DOCS = {
  lease: `NOTICE OF RENT INCREASE

Pursuant to Massachusetts General Laws Chapter 186, Section 15B, you are hereby notified that effective April 1, 2026, the monthly rent for the premises located at 234 Main Street, Apartment 3B, Amherst, Massachusetts 01003 shall increase from $1,450.00 to $1,780.00, representing an increase of $330.00 per month.

You have the right to accept or reject this increase. If you do not wish to accept the increase, you must vacate the premises no later than March 31, 2026, in accordance with the terms of your tenancy at will. Failure to vacate the premises by that date will be considered acceptance of the new rental terms.

Please note that the security deposit held on your behalf ($1,450.00) will be adjusted to reflect the new rental rate within 30 days of the effective date of the increase, or your existing deposit will remain on file and the difference of $330.00 will be due by April 15, 2026.

Any questions regarding this notice should be directed to the property management office at (413) 555-0192 during business hours (Monday–Friday, 9AM–5PM).

Property Management Office
Berkshire Residential Properties LLC`,
  eviction: `SUMMARY PROCESS SUMMONS AND COMPLAINT
HOUSING COURT DEPARTMENT
WESTERN DIVISION

Docket No: 26H83CV000221

TO: Tenant(s) at 567 Orchard Street, Apartment 2, Amherst, MA 01002

You are hereby summoned to appear before the Housing Court, Western Division, located at 37 Elm Street, Springfield, MA 01102 on March 4, 2026 at 9:00 AM.

The landlord, Orchard Properties LLC, claims that you owe unpaid rent in the amount of $3,600.00 for the months of December 2025, January 2026, and February 2026, and that you have violated the terms of your tenancy agreement by harboring unauthorized occupants.

IMPORTANT: If you do not appear in court on the date listed above, a default judgment may be entered against you and you may be ordered to vacate the premises within 48 hours.

You have the right to an attorney. If you cannot afford an attorney, you may be eligible for free legal assistance through Hampshire County Legal Aid at (413) 584-4034. You also have the right to file an Answer to this complaint within the time specified by court rules.`,
  fafsa: `Dear Student,

Your 2025-2026 Free Application for Federal Student Aid (FAFSA) has been processed. Based on information provided on your application, your Expected Family Contribution (EFC) has been calculated at $4,872.

Your Student Aid Report (SAR) indicates the following:
- Federal Pell Grant: You may be eligible for up to $3,775 per academic year
- Federal Direct Subsidized Loan: You are eligible to borrow up to $3,500
- Federal Direct Unsubsidized Loan: You are eligible to borrow up to $2,000
- Federal Work-Study: Tentatively eligible, pending institutional verification

ACTION REQUIRED: To receive your aid, you must:
1. Log into your student financial aid portal at studentaid.gov within 30 days
2. Accept, reduce, or decline each type of aid offered
3. Complete Entrance Counseling if this is your first federal loan
4. Sign a Master Promissory Note (MPN) for any loans you accept

Please note: Verification has been selected for your application. You must submit the following documents to your Financial Aid Office within 21 days or your aid may be delayed or cancelled: (1) IRS Tax Transcript for 2023, (2) Verification Worksheet (available on your student portal).`,
};

// ─── API CALL ────────────────────────────────────────────────────────────────
async function callClaude(systemPrompt, userMessage) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "Error: Could not get response.";
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function CivicBridge() {
  const [mode, setMode] = useState("home");
  const [language, setLanguage] = useState("es");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [animateIn, setAnimateIn] = useState(true);

  const selectedLang = LANGUAGES.find((l) => l.code === language);

  const switchMode = (newMode) => {
    setAnimateIn(false);
    setTimeout(() => {
      setMode(newMode);
      setAnimateIn(true);
    }, 200);
  };

  return (
    <div style={styles.root}>
      {/* Background texture */}
      <div style={styles.bgGrain} />
      <div style={styles.bgAccent} />

      {/* Header */}
      <header style={styles.header}>
        <button onClick={() => switchMode("home")} style={styles.logoBtn}>
          <span style={styles.logoMark}>⚖</span>
          <span style={styles.logoText}>CivicBridge</span>
        </button>

        <div style={styles.headerRight}>
          <div style={styles.langSelector}>
            <button
              style={styles.langBtn}
              onClick={() => setLangMenuOpen(!langMenuOpen)}
            >
              <span>{selectedLang.flag}</span>
              <span style={{ fontFamily: "monospace", fontSize: 13 }}>
                {selectedLang.label}
              </span>
              <span style={{ opacity: 0.5 }}>▾</span>
            </button>
            {langMenuOpen && (
              <div style={styles.langDropdown}>
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    style={{
                      ...styles.langOption,
                      background: l.code === language ? "rgba(234,179,8,0.15)" : "transparent",
                    }}
                    onClick={() => { setLanguage(l.code); setLangMenuOpen(false); }}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main
        style={{
          ...styles.main,
          opacity: animateIn ? 1 : 0,
          transform: animateIn ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        {mode === "home" && <HomeScreen switchMode={switchMode} language={language} selectedLang={selectedLang} />}
        {mode === "decode" && <DecodeMode language={language} selectedLang={selectedLang} />}
        {mode === "discover" && <DiscoverMode language={language} selectedLang={selectedLang} />}
        {mode === "speak" && <SpeakMode language={language} selectedLang={selectedLang} />}
      </main>
    </div>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────
function HomeScreen({ switchMode, language, selectedLang }) {
  const cards = [
    {
      mode: "decode",
      icon: "📄",
      titleEn: "Decode",
      descEn: "Upload any government document — lease, notice, form — and understand it in your language.",
      color: "#3b82f6",
    },
    {
      mode: "discover",
      icon: "🗺",
      titleEn: "Discover",
      descEn: "Find upcoming meetings, hearings, and events in Amherst (01003) that affect your life.",
      color: "#10b981",
    },
    {
      mode: "speak",
      icon: "✍️",
      titleEn: "Speak",
      descEn: "Describe your concern in your language. We'll write a formal letter to your representative.",
      color: "#f59e0b",
    },
  ];

  return (
    <div style={styles.homeWrap}>
      <div style={styles.heroSection}>
        <div style={styles.badge}>Amherst, MA · ZIP 01003</div>
        <h1 style={styles.heroTitle}>
          Your Voice.<br />
          <span style={styles.heroAccent}>In Any Language.</span>
        </h1>
        <p style={styles.heroSub}>
          Government documents, civic meetings, and elected officials — made accessible for everyone, regardless of what language you speak.
        </p>
      </div>

      <div style={styles.cardGrid}>
        {cards.map((card) => (
          <button
            key={card.mode}
            style={{ ...styles.modeCard, "--card-color": card.color }}
            onClick={() => switchMode(card.mode)}
          >
            <div style={{ ...styles.cardIconWrap, background: card.color + "22", border: `1px solid ${card.color}44` }}>
              <span style={styles.cardIcon}>{card.icon}</span>
            </div>
            <div style={{ ...styles.cardColorBar, background: card.color }} />
            <h3 style={{ ...styles.cardTitle, color: card.color }}>{card.titleEn}</h3>
            <p style={styles.cardDesc}>{card.descEn}</p>
            <div style={{ ...styles.cardArrow, color: card.color }}>→</div>
          </button>
        ))}
      </div>

      <div style={styles.statsRow}>
        {[["44.9M", "immigrants in the US"], ["67%", "face language barriers in civic life"], ["01003", "Amherst, MA — your community"]].map(([num, label]) => (
          <div key={num} style={styles.statItem}>
            <div style={styles.statNum}>{num}</div>
            <div style={styles.statLabel}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DECODE MODE ─────────────────────────────────────────────────────────────
function DecodeMode({ language, selectedLang }) {
  const [docText, setDocText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);

  const loadSample = (key) => {
    setSelectedSample(key);
    setDocText(SAMPLE_DOCS[key]);
    setResult(null);
  };

  const decode = async () => {
    if (!docText.trim()) return;
    setLoading(true);
    setResult(null);
    const langName = LANGUAGES.find((l) => l.code === language)?.label || "Spanish";
    const systemPrompt = `You are CivicBridge, an AI assistant that helps non-native English speakers understand official US government and legal documents. 

Your job is to:
1. Explain the document in plain, simple ${langName} (not English). Use everyday language a non-native speaker would understand.
2. Identify the MOST IMPORTANT action the person must take, and any deadlines.
3. Identify any rights the person has that they might not know about.
4. Flag anything that seems unfair, unusual, or potentially illegal.

Format your response in ${langName} with these clear sections:
📋 ¿Qué dice este documento? (What does this document say?)
⚡ Acción requerida (Action required — deadlines, what to do)
⚖️ Tus derechos (Your rights)
🚨 Alertas importantes (Important alerts / anything concerning)

Be warm, clear, and empowering. This person is counting on you.`;

    const result = await callClaude(systemPrompt, `Please analyze this document:\n\n${docText}`);
    setResult(result);
    setLoading(false);
  };

  return (
    <div style={styles.modeWrap}>
      <ModeHeader
        icon="📄"
        title="Decode Documents"
        subtitle={`Understand any official document in ${selectedLang.flag} ${selectedLang.label}`}
        color="#3b82f6"
      />

      <div style={styles.sampleRow}>
        <span style={styles.sampleLabel}>Try a sample:</span>
        {[["lease", "Rent Increase Notice"], ["eviction", "Eviction Summons"], ["fafsa", "FAFSA Aid Letter"]].map(([key, label]) => (
          <button
            key={key}
            style={{ ...styles.sampleBtn, background: selectedSample === key ? "#3b82f620" : "transparent", borderColor: selectedSample === key ? "#3b82f6" : "#ffffff20" }}
            onClick={() => loadSample(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <textarea
        style={styles.docTextarea}
        placeholder="Paste your document text here, or click a sample above..."
        value={docText}
        onChange={(e) => { setDocText(e.target.value); setResult(null); }}
        rows={10}
      />

      <button
        style={{ ...styles.primaryBtn, background: loading ? "#ffffff20" : "#3b82f6", cursor: loading ? "not-allowed" : "pointer" }}
        onClick={decode}
        disabled={loading || !docText.trim()}
      >
        {loading ? <Spinner /> : `🔍 Analyze in ${selectedLang.flag} ${selectedLang.label}`}
      </button>

      {result && (
        <div style={{ ...styles.resultBox, borderColor: "#3b82f640" }}>
          <div style={styles.resultHeader}>
            <span style={{ color: "#3b82f6", fontWeight: 700 }}>📄 Analysis Complete</span>
            <span style={styles.langTag}>{selectedLang.flag} {selectedLang.label}</span>
          </div>
          <div style={styles.resultText}>{result}</div>
        </div>
      )}
    </div>
  );
}

// ─── DISCOVER MODE ────────────────────────────────────────────────────────────
function DiscoverMode({ language, selectedLang }) {
  const [concern, setConcern] = useState("");
  const [filtered, setFiltered] = useState(null);
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [translatingId, setTranslatingId] = useState(null);

  const findMeetings = async () => {
    if (!concern.trim()) {
      setFiltered(CIVIC_DATA.upcomingMeetings);
      return;
    }
    setLoading(true);
    const systemPrompt = `You are a civic engagement assistant. Given a person's concern (possibly in a non-English language), identify which of the following civic meetings are most relevant to them. Return ONLY a JSON array of meeting IDs (numbers) that are relevant, sorted by relevance. Example: [3, 1, 5]. Return nothing else.

Available meetings:
${CIVIC_DATA.upcomingMeetings.map((m) => `ID ${m.id}: "${m.title}" — ${m.description} Topics: ${m.relevantTopics.join(", ")}`).join("\n")}`;

    try {
      const result = await callClaude(systemPrompt, `My concern: ${concern}`);
      const ids = JSON.parse(result.match(/\[[\d,\s]+\]/)?.[0] || "[]");
      const sorted = ids.length
        ? ids.map((id) => CIVIC_DATA.upcomingMeetings.find((m) => m.id === id)).filter(Boolean)
        : CIVIC_DATA.upcomingMeetings;
      setFiltered(sorted);
    } catch {
      setFiltered(CIVIC_DATA.upcomingMeetings);
    }
    setLoading(false);
  };

  const translateMeeting = async (meeting) => {
    if (translations[meeting.id] || language === "en") return;
    setTranslatingId(meeting.id);
    const langName = LANGUAGES.find((l) => l.code === language)?.label || "Spanish";
    const systemPrompt = `Translate the following civic meeting details to ${langName}. Be clear and friendly. Return ONLY the translated text with the same structure. Include a one-sentence explanation of what this type of meeting is and why attending matters.`;
    const text = `Meeting: ${meeting.title}\nDate: ${meeting.date} at ${meeting.time}\nLocation: ${meeting.location}\nDescription: ${meeting.description}${meeting.publicComment ? "\n✅ Public comment is OPEN — your voice counts here!" : ""}`;
    const result = await callClaude(systemPrompt, text);
    setTranslations((prev) => ({ ...prev, [meeting.id]: result }));
    setTranslatingId(null);
  };

  const handleExpand = (meeting) => {
    const newId = expandedId === meeting.id ? null : meeting.id;
    setExpandedId(newId);
    if (newId && language !== "en") translateMeeting(meeting);
  };

  const meetings = filtered || CIVIC_DATA.upcomingMeetings;

  return (
    <div style={styles.modeWrap}>
      <ModeHeader
        icon="🗺"
        title="Discover Civic Events"
        subtitle={`Upcoming meetings in Amherst, MA (01003) — explain in ${selectedLang.flag} ${selectedLang.label}`}
        color="#10b981"
      />

      <div style={styles.searchRow}>
        <input
          style={styles.searchInput}
          placeholder="What are you concerned about? (in any language)"
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && findMeetings()}
        />
        <button
          style={{ ...styles.searchBtn, background: loading ? "#ffffff20" : "#10b981" }}
          onClick={findMeetings}
          disabled={loading}
        >
          {loading ? <Spinner /> : "Find"}
        </button>
      </div>
      {filtered !== null && (
        <p style={styles.filterNote}>
          {meetings.length} relevant meeting{meetings.length !== 1 ? "s" : ""} found — click any to translate
        </p>
      )}

      <div style={styles.meetingList}>
        {meetings.map((meeting) => (
          <div key={meeting.id} style={styles.meetingCard}>
            <button style={styles.meetingHeader} onClick={() => handleExpand(meeting)}>
              <div style={styles.meetingLeft}>
                <div style={styles.meetingTitle}>{meeting.title}</div>
                <div style={styles.meetingMeta}>
                  📅 {meeting.date} · ⏰ {meeting.time}
                  {meeting.publicComment && (
                    <span style={styles.commentBadge}>💬 Public Comment Open</span>
                  )}
                </div>
              </div>
              <span style={{ color: "#10b981", fontSize: 18 }}>
                {expandedId === meeting.id ? "▲" : "▼"}
              </span>
            </button>

            {expandedId === meeting.id && (
              <div style={styles.meetingBody}>
                <div style={styles.meetingLocation}>📍 {meeting.location}</div>
                <div style={styles.meetingDesc}>{meeting.description}</div>

                {language !== "en" && (
                  <div style={{ ...styles.translationBox, borderColor: "#10b98140" }}>
                    <div style={{ color: "#10b981", fontWeight: 600, marginBottom: 8, fontSize: 13 }}>
                      {selectedLang.flag} {selectedLang.label} Translation
                    </div>
                    {translatingId === meeting.id ? (
                      <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#ffffff60" }}>
                        <Spinner /> Translating...
                      </div>
                    ) : translations[meeting.id] ? (
                      <div style={styles.resultText}>{translations[meeting.id]}</div>
                    ) : (
                      <div style={{ color: "#ffffff40" }}>Translation will appear here...</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={styles.repsSection}>
        <h3 style={styles.repsTitle}>📬 Your Representatives</h3>
        {CIVIC_DATA.representatives.map((rep) => (
          <div key={rep.name} style={styles.repCard}>
            <div style={styles.repName}>{rep.name}</div>
            <div style={styles.repTitle}>{rep.title}</div>
            <div style={styles.repContact}>
              <a href={`mailto:${rep.email}`} style={styles.repLink}>✉ {rep.email}</a>
              <span style={styles.repPhone}>📞 {rep.phone}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SPEAK MODE ──────────────────────────────────────────────────────────────
function SpeakMode({ language, selectedLang }) {
  const [concern, setConcern] = useState("");
  const [docType, setDocType] = useState("representative");
  const [selectedRep, setSelectedRep] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const DOC_TYPES = [
    { key: "representative", label: "Letter to Representative", icon: "📬" },
    { key: "testimony", label: "Public Testimony Script", icon: "🎤" },
    { key: "publiccomment", label: "Written Public Comment", icon: "📝" },
    { key: "complaint", label: "Formal Complaint", icon: "⚠️" },
  ];

  const generate = async () => {
    if (!concern.trim()) return;
    setLoading(true);
    setResult(null);

    const rep = CIVIC_DATA.representatives[selectedRep];
    const langName = LANGUAGES.find((l) => l.code === language)?.label || "Spanish";
    const systemPrompt = `You are CivicBridge, helping a non-native English speaker communicate with their government. The user will describe their concern in any language. You must:

1. Understand their concern fully, even if written in ${langName}
2. Generate a professional, formal ${docType === "representative" ? "letter addressed to " + rep.name + ", " + rep.title : docType === "testimony" ? "spoken testimony script for a public hearing" : docType === "publiccomment" ? "written public comment" : "formal complaint letter"} in ENGLISH
3. The letter should be warm but formal, specific, and compelling
4. Reference the person's community (Amherst, MA, 01003) and local context where relevant
5. End with: "Translated from ${langName} — written with assistance from CivicBridge"
6. After the letter, on a new line write "---" then provide a brief summary back in ${langName} explaining what the letter says so the person can verify it says what they meant.

The letter should be 200-350 words — long enough to be taken seriously, short enough to be read.`;

    const result = await callClaude(systemPrompt, `My concern (in my own words): ${concern}`);
    setResult(result);
    setLoading(false);
  };

  const copy = () => {
    if (result) {
      navigator.clipboard.writeText(result.split("---")[0].trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const parts = result?.split("---") || [];
  const letterPart = parts[0]?.trim();
  const summaryPart = parts[1]?.trim();

  return (
    <div style={styles.modeWrap}>
      <ModeHeader
        icon="✍️"
        title="Speak to Power"
        subtitle={`Describe your concern in ${selectedLang.flag} ${selectedLang.label} — we write the letter`}
        color="#f59e0b"
      />

      <div style={styles.speakSection}>
        <label style={styles.fieldLabel}>What do you want to say? (write in any language)</label>
        <textarea
          style={{ ...styles.docTextarea, minHeight: 120 }}
          placeholder={`Describe your concern freely in ${selectedLang.label}...`}
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
          rows={5}
        />

        <label style={styles.fieldLabel}>Type of document</label>
        <div style={styles.docTypeGrid}>
          {DOC_TYPES.map((dt) => (
            <button
              key={dt.key}
              style={{
                ...styles.docTypeBtn,
                background: docType === dt.key ? "#f59e0b20" : "transparent",
                borderColor: docType === dt.key ? "#f59e0b" : "#ffffff20",
                color: docType === dt.key ? "#f59e0b" : "#ffffff80",
              }}
              onClick={() => setDocType(dt.key)}
            >
              <span style={{ fontSize: 18 }}>{dt.icon}</span>
              <span style={{ fontSize: 12 }}>{dt.label}</span>
            </button>
          ))}
        </div>

        {docType === "representative" && (
          <>
            <label style={styles.fieldLabel}>Send to</label>
            <div style={styles.repSelectRow}>
              {CIVIC_DATA.representatives.map((rep, i) => (
                <button
                  key={rep.name}
                  style={{
                    ...styles.repSelectBtn,
                    background: selectedRep === i ? "#f59e0b20" : "transparent",
                    borderColor: selectedRep === i ? "#f59e0b" : "#ffffff20",
                  }}
                  onClick={() => setSelectedRep(i)}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, color: selectedRep === i ? "#f59e0b" : "#fff" }}>{rep.name}</div>
                  <div style={{ fontSize: 11, color: "#ffffff50" }}>{rep.title}</div>
                </button>
              ))}
            </div>
          </>
        )}

        <button
          style={{ ...styles.primaryBtn, background: loading ? "#ffffff20" : "#f59e0b", color: loading ? "#fff" : "#000", cursor: loading ? "not-allowed" : "pointer" }}
          onClick={generate}
          disabled={loading || !concern.trim()}
        >
          {loading ? <Spinner /> : `✍️ Generate Letter in English`}
        </button>
      </div>

      {result && (
        <div style={styles.letterWrap}>
          <div style={styles.letterHeader}>
            <span style={{ color: "#f59e0b", fontWeight: 700 }}>📬 Your Letter (English)</span>
            <button style={styles.copyBtn} onClick={copy}>
              {copied ? "✓ Copied!" : "Copy Letter"}
            </button>
          </div>
          <div style={{ ...styles.resultText, fontFamily: "'Georgia', serif", lineHeight: 1.8 }}>
            {letterPart}
          </div>

          {summaryPart && (
            <div style={{ ...styles.translationBox, marginTop: 16, borderColor: "#f59e0b40" }}>
              <div style={{ color: "#f59e0b", fontWeight: 600, marginBottom: 8, fontSize: 13 }}>
                {selectedLang.flag} Summary in {selectedLang.label}
              </div>
              <div style={styles.resultText}>{summaryPart}</div>
            </div>
          )}

          {docType === "representative" && (
            <div style={styles.sendNote}>
              Send to: <a href={`mailto:${CIVIC_DATA.representatives[selectedRep].email}`} style={styles.repLink}>
                {CIVIC_DATA.representatives[selectedRep].email}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function ModeHeader({ icon, title, subtitle, color }) {
  return (
    <div style={styles.modeHeaderWrap}>
      <div style={{ ...styles.modeIconBig, background: color + "22", border: `1px solid ${color}55` }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
      </div>
      <h2 style={{ ...styles.modeTitle, color }}>{title}</h2>
      <p style={styles.modeSub}>{subtitle}</p>
      <div style={{ ...styles.modeDivider, background: color }} />
    </div>
  );
}

function Spinner() {
  return (
    <span style={styles.spinner} />
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: "100vh",
    background: "#0a0a0f",
    color: "#f0ece4",
    fontFamily: "'IBM Plex Sans', 'Helvetica Neue', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  bgGrain: {
    position: "fixed",
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
    pointerEvents: "none",
    zIndex: 0,
  },
  bgAccent: {
    position: "fixed",
    top: "-30%",
    right: "-20%",
    width: "60vw",
    height: "60vw",
    background: "radial-gradient(circle, rgba(234,179,8,0.04) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    height: 60,
    background: "rgba(10,10,15,0.85)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  logoBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 0,
  },
  logoMark: {
    fontSize: 22,
    color: "#eab308",
  },
  logoText: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 17,
    fontWeight: 700,
    color: "#f0ece4",
    letterSpacing: "-0.5px",
  },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  langSelector: { position: "relative" },
  langBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    color: "#f0ece4",
    cursor: "pointer",
    padding: "6px 12px",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
  },
  langDropdown: {
    position: "absolute",
    top: "calc(100% + 6px)",
    right: 0,
    background: "#16161f",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 6,
    minWidth: 160,
    zIndex: 200,
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  },
  langOption: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 12px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    color: "#f0ece4",
    fontSize: 13,
    width: "100%",
    textAlign: "left",
  },
  main: {
    position: "relative",
    zIndex: 1,
    maxWidth: 760,
    margin: "0 auto",
    padding: "40px 20px 80px",
  },
  // Home
  homeWrap: { display: "flex", flexDirection: "column", gap: 48 },
  heroSection: { textAlign: "center", padding: "20px 0 8px" },
  badge: {
    display: "inline-block",
    background: "rgba(234,179,8,0.12)",
    border: "1px solid rgba(234,179,8,0.3)",
    color: "#eab308",
    borderRadius: 20,
    padding: "4px 14px",
    fontSize: 12,
    fontFamily: "'IBM Plex Mono', monospace",
    marginBottom: 20,
    letterSpacing: "0.5px",
  },
  heroTitle: {
    fontSize: "clamp(36px, 7vw, 58px)",
    fontWeight: 800,
    lineHeight: 1.1,
    margin: "0 0 16px",
    letterSpacing: "-2px",
    color: "#f0ece4",
  },
  heroAccent: { color: "#eab308" },
  heroSub: {
    fontSize: 17,
    color: "#ffffff70",
    maxWidth: 500,
    margin: "0 auto",
    lineHeight: 1.6,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },
  modeCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "24px 20px",
    cursor: "pointer",
    textAlign: "left",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.2s ease",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardIcon: { fontSize: 22 },
  cardColorBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: "-0.5px",
    margin: 0,
  },
  cardDesc: {
    fontSize: 13,
    color: "#ffffff60",
    lineHeight: 1.5,
    margin: 0,
    flexGrow: 1,
  },
  cardArrow: { fontSize: 20, fontWeight: 700, alignSelf: "flex-end" },
  statsRow: {
    display: "flex",
    gap: 0,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    overflow: "hidden",
  },
  statItem: {
    flex: 1,
    padding: "20px 16px",
    textAlign: "center",
    borderRight: "1px solid rgba(255,255,255,0.08)",
  },
  statNum: {
    fontSize: 28,
    fontWeight: 800,
    color: "#eab308",
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: "-1px",
  },
  statLabel: { fontSize: 11, color: "#ffffff40", marginTop: 4, lineHeight: 1.4 },
  // Mode pages
  modeWrap: { display: "flex", flexDirection: "column", gap: 24 },
  modeHeaderWrap: { textAlign: "center", paddingBottom: 8 },
  modeIconBig: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 32,
    fontWeight: 800,
    margin: "0 0 8px",
    letterSpacing: "-1px",
  },
  modeSub: { fontSize: 15, color: "#ffffff60", margin: "0 0 16px" },
  modeDivider: { height: 2, width: 40, margin: "0 auto", borderRadius: 2, opacity: 0.5 },
  // Decode
  sampleRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  sampleLabel: { fontSize: 12, color: "#ffffff40", fontFamily: "monospace" },
  sampleBtn: {
    border: "1px solid",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
    color: "#ffffff80",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  docTextarea: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    color: "#f0ece4",
    fontSize: 13,
    fontFamily: "'IBM Plex Mono', monospace",
    resize: "vertical",
    lineHeight: 1.6,
    outline: "none",
    boxSizing: "border-box",
  },
  primaryBtn: {
    width: "100%",
    padding: "14px 24px",
    borderRadius: 10,
    border: "none",
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "all 0.2s",
  },
  resultBox: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid",
    borderRadius: 12,
    padding: 20,
    animation: "fadeIn 0.3s ease",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  langTag: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 4,
    padding: "2px 8px",
    fontSize: 12,
    color: "#ffffff60",
  },
  resultText: {
    fontSize: 14,
    lineHeight: 1.9,
    color: "#e0dcd4",
    whiteSpace: "pre-wrap",
  },
  // Discover
  searchRow: { display: "flex", gap: 8 },
  searchInput: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "12px 16px",
    color: "#f0ece4",
    fontSize: 14,
    outline: "none",
  },
  searchBtn: {
    border: "none",
    borderRadius: 10,
    padding: "12px 20px",
    fontSize: 14,
    fontWeight: 700,
    color: "#000",
    cursor: "pointer",
    minWidth: 70,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  filterNote: { fontSize: 12, color: "#ffffff40", margin: 0 },
  meetingList: { display: "flex", flexDirection: "column", gap: 8 },
  meetingCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    overflow: "hidden",
  },
  meetingHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 18px",
    background: "none",
    border: "none",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    gap: 12,
  },
  meetingLeft: { flex: 1 },
  meetingTitle: { fontSize: 15, fontWeight: 700, color: "#f0ece4", marginBottom: 4 },
  meetingMeta: {
    fontSize: 12,
    color: "#ffffff50",
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  commentBadge: {
    background: "rgba(16,185,129,0.15)",
    border: "1px solid rgba(16,185,129,0.3)",
    color: "#10b981",
    borderRadius: 4,
    padding: "1px 7px",
    fontSize: 11,
  },
  meetingBody: {
    padding: "0 18px 18px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    paddingTop: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  meetingLocation: { fontSize: 13, color: "#ffffff60" },
  meetingDesc: { fontSize: 13, color: "#ffffff80", lineHeight: 1.6 },
  translationBox: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid",
    borderRadius: 10,
    padding: 14,
  },
  repsSection: {
    marginTop: 8,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  repsTitle: {
    fontSize: 16,
    fontWeight: 700,
    margin: "0 0 4px",
    color: "#ffffff80",
  },
  repCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  repName: { fontWeight: 700, fontSize: 14 },
  repTitle: { fontSize: 12, color: "#ffffff50" },
  repContact: { display: "flex", gap: 16, marginTop: 4, flexWrap: "wrap" },
  repLink: { color: "#3b82f6", fontSize: 12, textDecoration: "none" },
  repPhone: { fontSize: 12, color: "#ffffff40" },
  // Speak
  speakSection: { display: "flex", flexDirection: "column", gap: 14 },
  fieldLabel: { fontSize: 12, color: "#ffffff50", fontFamily: "monospace", letterSpacing: "0.5px" },
  docTypeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 8,
  },
  docTypeBtn: {
    border: "1px solid",
    borderRadius: 8,
    padding: "10px 12px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    transition: "all 0.15s",
  },
  repSelectRow: { display: "flex", flexDirection: "column", gap: 8 },
  repSelectBtn: {
    border: "1px solid",
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer",
    textAlign: "left",
    background: "transparent",
    transition: "all 0.15s",
  },
  letterWrap: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(245,158,11,0.3)",
    borderRadius: 14,
    padding: 24,
  },
  letterHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  copyBtn: {
    background: "rgba(245,158,11,0.15)",
    border: "1px solid rgba(245,158,11,0.3)",
    color: "#f59e0b",
    borderRadius: 6,
    padding: "5px 12px",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 600,
  },
  sendNote: {
    marginTop: 16,
    paddingTop: 12,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    fontSize: 12,
    color: "#ffffff40",
  },
  spinner: {
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.2)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};

// Inject keyframes
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;600;700;800&display=swap');
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; }
    button:hover { opacity: 0.88; }
    textarea:focus, input:focus { border-color: rgba(255,255,255,0.25) !important; }
    .meeting-card:hover { border-color: rgba(16,185,129,0.25) !important; }
  `;
  document.head.appendChild(style);
}
