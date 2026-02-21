import { useState, useRef, useEffect, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇲🇽" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
];

const UI_TEXT = {
  en: {
    title: "CivicBridge",
    subtitle: "Your guide to civic participation",
    zipPlaceholder: "Enter ZIP code (e.g. 01003)",
    zipButton: "Find My Representatives",
    tabs: ["Chat", "Meetings", "My Rights", "Legislation", "Write Letter"],
    chatPlaceholder: "Ask about your rights, meetings, or how to participate...",
    sendButton: "Send",
    uploading: "Analyzing document...",
    uploadDoc: "Upload Document",
    dragDrop: "Drag & drop a lease, notice, or letter to analyze",
    meetings: "Upcoming Meetings",
    reps: "Your Representatives",
    rights: "Know Your Rights",
    bills: "Current Legislation",
    letterSubject: "Letter Subject",
    letterRecipient: "Recipient",
    generateLetter: "Generate Letter",
    copyLetter: "Copy Letter",
    shareLink: "Share Link",
    loading: "Loading...",
    error: "Something went wrong. Please try again.",
    publicComment: "Public Comment Open",
    joinMeeting: "Join / Details",
    contactRep: "Contact",
    viewBill: "View Bill",
    letterSubjectPlaceholder: "e.g. Oppose rent increase, support housing bill...",
    recipientPlaceholder: "e.g. Town Council, State Representative...",
  },
  es: {
    title: "CivicBridge",
    subtitle: "Tu guía para la participación cívica",
    zipPlaceholder: "Ingresa tu código postal (ej. 01003)",
    zipButton: "Encontrar mis representantes",
    tabs: ["Chat", "Reuniones", "Mis Derechos", "Legislación", "Escribir Carta"],
    chatPlaceholder: "Pregunta sobre tus derechos, reuniones o cómo participar...",
    sendButton: "Enviar",
    uploading: "Analizando documento...",
    uploadDoc: "Subir Documento",
    dragDrop: "Arrastra un contrato, aviso o carta para analizar",
    meetings: "Próximas Reuniones",
    reps: "Tus Representantes",
    rights: "Conoce Tus Derechos",
    bills: "Legislación Actual",
    letterSubject: "Asunto de la Carta",
    letterRecipient: "Destinatario",
    generateLetter: "Generar Carta",
    copyLetter: "Copiar Carta",
    shareLink: "Compartir Enlace",
    loading: "Cargando...",
    error: "Algo salió mal. Por favor intenta de nuevo.",
    publicComment: "Comentario Público Abierto",
    joinMeeting: "Unirse / Detalles",
    contactRep: "Contactar",
    viewBill: "Ver Proyecto",
    letterSubjectPlaceholder: "ej. Oponerme al aumento de renta...",
    recipientPlaceholder: "ej. Concejo Municipal, Representante Estatal...",
  },
};

const getUI = (lang) => UI_TEXT[lang] || UI_TEXT.en;

// ─── API helpers ──────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Inline styles (no build-time CSS dependency) ─────────────────────────────
const S = {
  app: {
    fontFamily: "'Segoe UI', Arial, sans-serif",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    color: "#f1f5f9",
  },
  header: {
    background: "rgba(15,23,42,0.95)",
    borderBottom: "1px solid rgba(99,102,241,0.3)",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(12px)",
  },
  logo: { fontSize: 22, fontWeight: 700, color: "#818cf8", letterSpacing: "-0.5px" },
  logoSub: { fontSize: 12, color: "#94a3b8", marginTop: 1 },
  langSelect: {
    background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(99,102,241,0.3)",
    borderRadius: 8,
    color: "#f1f5f9",
    padding: "6px 10px",
    fontSize: 13,
    cursor: "pointer",
  },
  main: { maxWidth: 900, margin: "0 auto", padding: "24px 16px" },
  card: {
    background: "rgba(30,41,59,0.6)",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backdropFilter: "blur(8px)",
  },
  zipRow: { display: "flex", gap: 10, marginBottom: 20 },
  input: {
    flex: 1,
    background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(99,102,241,0.3)",
    borderRadius: 10,
    color: "#f1f5f9",
    padding: "10px 14px",
    fontSize: 14,
    outline: "none",
  },
  btn: {
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    border: "none",
    borderRadius: 10,
    color: "#fff",
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnSecondary: {
    background: "rgba(99,102,241,0.15)",
    border: "1px solid rgba(99,102,241,0.4)",
    borderRadius: 10,
    color: "#a5b4fc",
    padding: "8px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  tabs: { display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" },
  tab: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    background: "rgba(30,41,59,0.6)",
    color: "#94a3b8",
    transition: "all 0.15s",
  },
  tabActive: {
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "#fff",
  },
  chatBox: {
    height: 380,
    overflowY: "auto",
    background: "rgba(15,23,42,0.5)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  bubble: (role) => ({
    maxWidth: "80%",
    padding: "10px 14px",
    borderRadius: role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    background:
      role === "user"
        ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
        : "rgba(30,41,59,0.9)",
    alignSelf: role === "user" ? "flex-end" : "flex-start",
    fontSize: 14,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    border: role === "assistant" ? "1px solid rgba(99,102,241,0.2)" : "none",
  }),
  inputRow: { display: "flex", gap: 8 },
  badge: (color) => ({
    display: "inline-block",
    background: color === "green" ? "rgba(16,185,129,0.15)" : "rgba(99,102,241,0.15)",
    border: `1px solid ${color === "green" ? "rgba(16,185,129,0.4)" : "rgba(99,102,241,0.4)"}`,
    borderRadius: 20,
    padding: "2px 10px",
    fontSize: 11,
    color: color === "green" ? "#34d399" : "#a5b4fc",
    fontWeight: 600,
  }),
  meetingCard: {
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(99,102,241,0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  meetingTitle: { fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 },
  meetingMeta: { fontSize: 12, color: "#64748b", marginBottom: 8 },
  meetingDesc: { fontSize: 13, color: "#94a3b8", lineHeight: 1.5, marginBottom: 10 },
  repCard: {
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(99,102,241,0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  repName: { fontSize: 15, fontWeight: 600, color: "#a5b4fc", marginBottom: 2 },
  repTitle: { fontSize: 12, color: "#64748b", marginBottom: 8 },
  rightsSection: { marginBottom: 16 },
  rightsCat: { fontSize: 13, fontWeight: 700, color: "#818cf8", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 },
  rightsList: { listStyle: "none", padding: 0, margin: 0 },
  rightsItem: {
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
    padding: "6px 0",
    borderBottom: "1px solid rgba(99,102,241,0.1)",
    fontSize: 13,
    color: "#cbd5e1",
    lineHeight: 1.5,
  },
  billCard: {
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(99,102,241,0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  billId: { fontSize: 11, color: "#6366f1", fontWeight: 700, marginBottom: 3 },
  billTitle: { fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 },
  billDesc: { fontSize: 13, color: "#94a3b8", lineHeight: 1.5, marginBottom: 8 },
  letterBox: {
    background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: 12,
    padding: 16,
    marginTop: 14,
    whiteSpace: "pre-wrap",
    fontSize: 13,
    lineHeight: 1.7,
    color: "#e2e8f0",
    maxHeight: 400,
    overflowY: "auto",
  },
  dropzone: {
    border: "2px dashed rgba(99,102,241,0.4)",
    borderRadius: 12,
    padding: "24px 20px",
    textAlign: "center",
    color: "#64748b",
    fontSize: 13,
    cursor: "pointer",
    marginBottom: 14,
    transition: "all 0.2s",
  },
  spinner: {
    display: "inline-block",
    width: 14,
    height: 14,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginRight: 6,
    verticalAlign: "middle",
  },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 14 },
  toastContainer: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  toast: {
    background: "rgba(30,41,59,0.95)",
    border: "1px solid rgba(99,102,241,0.4)",
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 13,
    color: "#a5b4fc",
    backdropFilter: "blur(8px)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
  },
};

// ─── Toast hook ───────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, duration = 3000) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
  }, []);
  return { toasts, show };
}

// ─── Streaming chat hook ───────────────────────────────────────────────────────
function useChatStream() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm CivicBridge, your civic participation guide. I can help you understand your rights, find local meetings, navigate legislation, and more. Enter your ZIP code above to get started, or ask me anything!",
    },
  ]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef(null);

  const send = useCallback(async (text, lang, zip) => {
    if (!text.trim() || streaming) return;
    setStreaming(true);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    abortRef.current = new AbortController();
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, lang, zip }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("Chat failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop();
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") break;
            try {
              const { delta } = JSON.parse(payload);
              if (delta) {
                setMessages((m) => {
                  const updated = [...m];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: updated[updated.length - 1].content + delta,
                  };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages((m) => {
          const updated = [...m];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
          };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
    }
  }, [streaming]);

  const stop = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
  }, []);

  return { messages, streaming, send, stop };
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("en");
  const [zip, setZip] = useState("");
  const [submittedZip, setSubmittedZip] = useState("");
  const [tab, setTab] = useState(0);
  const [chatInput, setChatInput] = useState("");

  // Data state
  const [civicData, setCivicData] = useState(null);
  const [rightsData, setRightsData] = useState(null);
  const [bills, setBills] = useState([]);
  const [loadingCivic, setLoadingCivic] = useState(false);
  const [loadingBills, setLoadingBills] = useState(false);

  // Document upload
  const [docUploading, setDocUploading] = useState(false);
  const [docAnalysis, setDocAnalysis] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  // Letter generation
  const [letterSubject, setLetterSubject] = useState("");
  const [letterRecipient, setLetterRecipient] = useState("");
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [letter, setLetter] = useState(null);
  const [letterId, setLetterId] = useState(null);

  const chatEndRef = useRef(null);
  const { messages, streaming, send, stop } = useChatStream();
  const { toasts, show: showToast } = useToast();
  const ui = getUI(lang);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load rights data once
  useEffect(() => {
    apiFetch("/api/rights")
      .then(setRightsData)
      .catch(() => {});
  }, []);

  // Load civic data when ZIP submitted
  const handleZipSubmit = useCallback(async () => {
    if (!zip.trim()) return;
    setLoadingCivic(true);
    setLoadingBills(true);
    setSubmittedZip(zip.trim());
    try {
      const data = await apiFetch(`/api/civic-data?zip=${encodeURIComponent(zip.trim())}&lang=${lang}`);
      setCivicData(data);
    } catch {
      showToast("Could not load civic data. Using sample data.");
    } finally {
      setLoadingCivic(false);
    }
    try {
      const data = await apiFetch(`/api/bills?zip=${encodeURIComponent(zip.trim())}`);
      setBills(data.bills || []);
    } catch {
      setBills([]);
    } finally {
      setLoadingBills(false);
    }
  }, [zip, lang]);

  // Document upload handler
  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setDocUploading(true);
    setDocAnalysis(null);
    const fd = new FormData();
    fd.append("document", file);
    if (lang !== "en") fd.append("lang", lang);
    try {
      const result = await fetch(`${API_BASE}/api/analyze-document`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (!result.ok) throw new Error("Upload failed");
      const data = await result.json();
      setDocAnalysis(data.analysis);
      setTab(0); // Switch to chat to show analysis context
    } catch {
      showToast("Document upload failed. Please try again.");
    } finally {
      setDocUploading(false);
    }
  }, [lang]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // Letter generation
  const handleGenerateLetter = useCallback(async () => {
    if (!letterSubject.trim()) return;
    setGeneratingLetter(true);
    setLetter(null);
    try {
      const data = await apiFetch("/api/generate-letter", {
        method: "POST",
        body: JSON.stringify({
          subject: letterSubject,
          recipient: letterRecipient,
          zip: submittedZip,
          lang,
          context: civicData
            ? `City: ${civicData.city || ""}. Representatives: ${(civicData.representatives || []).map((r) => r.name).join(", ")}.`
            : "",
        }),
      });
      setLetter(data.letter);
      setLetterId(data.id);
    } catch {
      showToast("Letter generation failed. Please try again.");
    } finally {
      setGeneratingLetter(false);
    }
  }, [letterSubject, letterRecipient, submittedZip, lang, civicData]);

  const copyLetter = useCallback(() => {
    if (letter) {
      navigator.clipboard.writeText(letter).then(() => showToast("Letter copied to clipboard!"));
    }
  }, [letter, showToast]);

  const shareLetter = useCallback(async () => {
    if (!letterId) return;
    const url = `${API_BASE}/api/letter/${letterId}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Shareable link copied!");
    } catch {
      showToast(`Link: ${url}`);
    }
  }, [letterId]);

  // ─── Render helpers ──────────────────────────────────────────────────────────

  const renderChat = () => (
    <>
      <div style={S.chatBox}>
        {messages.map((m, i) => (
          <div key={i} style={S.bubble(m.role)}>
            {m.content || (streaming && i === messages.length - 1 ? "▍" : "")}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Document drop zone */}
      <div
        style={{ ...S.dropzone, borderColor: dragOver ? "#6366f1" : "rgba(99,102,241,0.4)", background: dragOver ? "rgba(99,102,241,0.05)" : "transparent" }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
      >
        {docUploading ? (
          <span><span style={S.spinner} />  {ui.uploading}</span>
        ) : (
          <>📎 {ui.dragDrop}</>
        )}
        <input ref={fileRef} type="file" style={{ display: "none" }} accept=".pdf,.txt,.doc,.docx,image/*" onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      {docAnalysis && (
        <div style={{ ...S.card, marginBottom: 12, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.3)" }}>
          <div style={{ fontSize: 12, color: "#818cf8", fontWeight: 700, marginBottom: 6 }}>DOCUMENT ANALYSIS</div>
          <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{docAnalysis}</div>
        </div>
      )}

      <div style={S.inputRow}>
        <input
          style={{ ...S.input, flex: 1 }}
          placeholder={ui.chatPlaceholder}
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (streaming) stop();
              else { send(chatInput, lang, submittedZip); setChatInput(""); }
            }
          }}
        />
        <button
          style={S.btn}
          onClick={() => {
            if (streaming) stop();
            else { send(chatInput, lang, submittedZip); setChatInput(""); }
          }}
        >
          {streaming ? "■ Stop" : ui.sendButton}
        </button>
      </div>
    </>
  );

  const renderMeetings = () => {
    const meetings = civicData?.upcomingMeetings || [];
    const reps = civicData?.representatives || [];
    return (
      <>
        <div style={S.sectionTitle}>{ui.meetings}</div>
        {loadingCivic ? (
          <div style={{ color: "#64748b", fontSize: 13 }}>{ui.loading}</div>
        ) : meetings.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: 13 }}>Enter your ZIP code to see local meetings.</div>
        ) : (
          meetings.map((m) => (
            <div key={m.id} style={S.meetingCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={S.meetingTitle}>{m.title}</div>
                {m.publicComment && <span style={S.badge("green")}>{ui.publicComment}</span>}
              </div>
              <div style={S.meetingMeta}>📅 {m.date} · {m.time} &nbsp;|&nbsp; 📍 {m.location}</div>
              <div style={S.meetingDesc}>{m.description}</div>
              {m.agendaLink && (
                <a href={m.agendaLink} target="_blank" rel="noreferrer" style={{ ...S.btnSecondary, textDecoration: "none", display: "inline-block", fontSize: 12 }}>
                  {ui.joinMeeting} ↗
                </a>
              )}
            </div>
          ))
        )}

        <div style={{ ...S.sectionTitle, marginTop: 24 }}>{ui.reps}</div>
        {loadingCivic ? (
          <div style={{ color: "#64748b", fontSize: 13 }}>{ui.loading}</div>
        ) : reps.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: 13 }}>Enter your ZIP code to see your representatives.</div>
        ) : (
          reps.map((r, i) => (
            <div key={i} style={S.repCard}>
              <div style={S.repName}>{r.name}</div>
              <div style={S.repTitle}>{r.title}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {r.email && (
                  <a href={`mailto:${r.email}`} style={{ ...S.btnSecondary, textDecoration: "none", fontSize: 12 }}>
                    ✉ {ui.contactRep}
                  </a>
                )}
                {r.phone && (
                  <a href={`tel:${r.phone}`} style={{ ...S.btnSecondary, textDecoration: "none", fontSize: 12 }}>
                    📞 {r.phone}
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </>
    );
  };

  const renderRights = () => {
    const categories = rightsData?.categories || [];
    return (
      <>
        <div style={S.sectionTitle}>{ui.rights}</div>
        {categories.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: 13 }}>{ui.loading}</div>
        ) : (
          categories.map((cat, i) => (
            <div key={i} style={S.rightsSection}>
              <div style={S.rightsCat}>{cat.name}</div>
              <ul style={S.rightsList}>
                {cat.rights.map((r, j) => (
                  <li key={j} style={S.rightsItem}>
                    <span style={{ color: "#6366f1", flexShrink: 0 }}>›</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </>
    );
  };

  const renderBills = () => (
    <>
      <div style={S.sectionTitle}>{ui.bills}</div>
      {loadingBills ? (
        <div style={{ color: "#64748b", fontSize: 13 }}>{ui.loading}</div>
      ) : bills.length === 0 ? (
        <div style={{ color: "#64748b", fontSize: 13 }}>Enter your ZIP code to see relevant legislation.</div>
      ) : (
        bills.map((b, i) => (
          <div key={i} style={S.billCard}>
            <div style={S.billId}>{b.identifier || b.id}</div>
            <div style={S.billTitle}>{b.title}</div>
            {b.description && <div style={S.billDesc}>{b.description}</div>}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {b.session && <span style={S.badge()}>{b.session}</span>}
              {b.classification && <span style={S.badge()}>{b.classification[0]}</span>}
              {b.openstates_url && (
                <a href={b.openstates_url} target="_blank" rel="noreferrer" style={{ ...S.btnSecondary, textDecoration: "none", fontSize: 12 }}>
                  {ui.viewBill} ↗
                </a>
              )}
            </div>
          </div>
        ))
      )}
    </>
  );

  const renderLetter = () => (
    <>
      <div style={S.sectionTitle}>{ui.tabs[4]}</div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>{ui.letterSubject}</label>
        <input
          style={{ ...S.input, width: "100%", boxSizing: "border-box" }}
          placeholder={ui.letterSubjectPlaceholder}
          value={letterSubject}
          onChange={(e) => setLetterSubject(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>{ui.letterRecipient}</label>
        <input
          style={{ ...S.input, width: "100%", boxSizing: "border-box" }}
          placeholder={ui.recipientPlaceholder}
          value={letterRecipient}
          onChange={(e) => setLetterRecipient(e.target.value)}
        />
      </div>
      <button
        style={{ ...S.btn, width: "100%", padding: "12px", fontSize: 14, opacity: generatingLetter ? 0.7 : 1 }}
        onClick={handleGenerateLetter}
        disabled={generatingLetter || !letterSubject.trim()}
      >
        {generatingLetter ? <><span style={S.spinner} /> Generating...</> : ui.generateLetter}
      </button>

      {letter && (
        <>
          <div style={S.letterBox}>{letter}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button style={S.btnSecondary} onClick={copyLetter}>📋 {ui.copyLetter}</button>
            {letterId && (
              <button style={S.btnSecondary} onClick={shareLetter}>🔗 {ui.shareLink}</button>
            )}
          </div>
        </>
      )}
    </>
  );

  const tabContent = [renderChat, renderMeetings, renderRights, renderBills, renderLetter];

  return (
    <div style={S.app}>
      {/* Keyframe animation injected once */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} * { box-sizing: border-box; } body { margin: 0; }`}</style>

      {/* Header */}
      <header style={S.header}>
        <div>
          <div style={S.logo}>🏛 {ui.title}</div>
          <div style={S.logoSub}>{ui.subtitle}</div>
        </div>
        <select
          style={S.langSelect}
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
          ))}
        </select>
      </header>

      {/* Main */}
      <main style={S.main}>
        {/* ZIP lookup */}
        <div style={S.card}>
          <div style={S.zipRow}>
            <input
              style={S.input}
              placeholder={ui.zipPlaceholder}
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleZipSubmit()}
              maxLength={10}
            />
            <button style={S.btn} onClick={handleZipSubmit}>
              {loadingCivic ? <><span style={S.spinner} />{ui.loading}</> : ui.zipButton}
            </button>
          </div>
          {submittedZip && civicData?.city && (
            <div style={{ fontSize: 12, color: "#64748b" }}>
              📍 Showing results for <strong style={{ color: "#a5b4fc" }}>{civicData.city}</strong> ({submittedZip})
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {ui.tabs.map((label, i) => (
            <button
              key={i}
              style={{ ...S.tab, ...(tab === i ? S.tabActive : {}) }}
              onClick={() => setTab(i)}
            >
              {["💬", "📅", "⚖️", "📋", "✉️"][i]} {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={S.card}>{tabContent[tab]()}</div>
      </main>

      {/* Toasts */}
      <div style={S.toastContainer}>
        {toasts.map((t) => (
          <div key={t.id} style={S.toast}>{t.msg}</div>
        ))}
      </div>
    </div>
  );
}
