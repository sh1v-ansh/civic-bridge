// ─── CivicBridge — Civic Data Layer for ZIP 01003 (Amherst, MA) ──────────────

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

const upcomingMeetings = [
  {
    id: 1,
    title: "Town Council — Housing & Zoning Session",
    date: "February 25, 2026",
    time: "6:30 PM",
    location: "Town Hall, 4 Boltwood Ave, Amherst",
    description:
      "Agenda includes proposed rent stabilization ordinance and affordable housing development near North Amherst. Public comment open.",
    agendaLink: "https://www.amherstma.gov/agendacenter",
    publicComment: true,
    relevantTopics: ["rent", "housing", "affordability"],
  },
  {
    id: 2,
    title: "Amherst School Committee Meeting",
    date: "February 27, 2026",
    time: "7:00 PM",
    location: "Amherst Regional Middle School, 170 Chestnut St",
    description:
      "Discussion of English Language Learner (ELL) program funding cuts and multilingual family support services. Public comment open.",
    agendaLink: "https://www.amherstma.gov/agendacenter",
    publicComment: true,
    relevantTopics: ["education", "school", "children", "ESL", "language"],
  },
  {
    id: 3,
    title: "Hampshire County Tenant Rights Forum",
    date: "March 3, 2026",
    time: "5:00 PM",
    location: "Jones Library, 43 Squire St, Amherst",
    description:
      "Tenant advocacy workshop hosted by Valley Community Development. Free legal consultations available. Interpreters available in Spanish and Mandarin.",
    agendaLink: "https://valleycd.org",
    publicComment: false,
    relevantTopics: ["rent", "housing", "eviction", "tenant", "rights"],
  },
  {
    id: 4,
    title: "MA House Hearing — Immigration & Integration Services",
    date: "March 10, 2026",
    time: "10:00 AM",
    location: "State House, Room 222, Boston (also via Zoom)",
    description:
      "Joint Committee on Immigration, Citizenship and Refugees hearing on H.1234, a bill to expand language access services in state agencies. Written testimony accepted.",
    agendaLink: "https://malegislature.gov",
    publicComment: true,
    relevantTopics: ["immigration", "language", "services", "rights"],
  },
  {
    id: 5,
    title: "UMass Community Advisory Board",
    date: "March 12, 2026",
    time: "4:00 PM",
    location: "Campus Center, UMass Amherst, Room 803",
    description:
      "Review of international student housing policy and off-campus rental disputes. Open to all UMass community members.",
    agendaLink: "https://www.umass.edu",
    publicComment: true,
    relevantTopics: ["housing", "students", "international", "rent"],
  },
];

const representatives = [
  {
    name: "Mindy Domb",
    title: "State Representative, 3rd Hampshire District",
    email: "mindy.domb@mahouse.gov",
    phone: "(617) 722-2220",
    office: "State House, Room 130\nBoston, MA 02133",
    bio: "Rep. Domb has championed tenant protections and language access legislation throughout her tenure, including co-sponsoring the Massachusetts Language Access Coalition bill. She prioritizes affordable housing, immigrant rights, and environmental justice for Western MA communities.",
    recentVotes: [
      {
        bill: "H.4977 — MBTA Communities Zoning Act",
        vote: "Yes",
        description: "Required MBTA communities to allow multi-family housing near transit",
      },
      {
        bill: "H.1234 — Language Access in State Agencies",
        vote: "Yes",
        description: "Required state agencies to provide translation services in top 10 languages",
      },
      {
        bill: "H.3600 — Tenant Opportunity to Purchase Act",
        vote: "Yes",
        description: "Gave tenants the right of first refusal when landlords sell rental properties",
      },
    ],
  },
  {
    name: "Jo Comerford",
    title: "State Senator, Hampshire, Franklin & Worcester District",
    email: "jo.comerford@masenate.gov",
    phone: "(617) 722-1532",
    office: "State House, Room 511-B\nBoston, MA 02133",
    bio: "Senator Comerford is a leading advocate for working families, focusing on affordable housing, food security, and educational equity across Western Massachusetts. She serves on the Senate Committee on Housing and co-chairs the Progressive Caucus.",
    recentVotes: [
      {
        bill: "S.2834 — Affordable Homes Act",
        vote: "Yes",
        description: "Major housing investment bill authorizing $4.1B for affordable housing production",
      },
      {
        bill: "S.1091 — SNAP Access Expansion",
        vote: "Yes",
        description: "Expanded food stamp eligibility for immigrant families and college students",
      },
      {
        bill: "S.2777 — Tenant Protections & Stabilization",
        vote: "Yes",
        description: "Required 90-day notice for rent increases over 5% for long-term tenants",
      },
    ],
  },
  {
    name: "Shalini Agrawal",
    title: "Amherst Town Council, District 1",
    email: "sagrawal@amherstma.gov",
    phone: "(413) 259-3040",
    office: "4 Boltwood Ave\nAmherst, MA 01002",
    bio: "Councilor Agrawal is Amherst's first South Asian elected official and an active voice for immigrant and international communities. She focuses on inclusive zoning, community policing reform, and expanding multilingual services at Town Hall.",
    recentVotes: [
      {
        bill: "Article 2 — Affordable Housing Trust Fund",
        vote: "Yes",
        description: "Allocated $500K annually to Amherst's affordable housing trust fund",
      },
      {
        bill: "Article 7 — Tenant Relocation Assistance",
        vote: "Yes",
        description: "Required landlords to provide 3 months rent as relocation assistance upon eviction",
      },
      {
        bill: "Article 12 — Multilingual Town Services",
        vote: "Yes",
        description: "Funded translation of all town documents into Spanish, Chinese, and Haitian Creole",
      },
    ],
  },
];

module.exports = {
  LANGUAGES,
  upcomingMeetings,
  representatives,
  zip: "01003",
  city: "Amherst, MA",
};
