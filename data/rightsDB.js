// ─── Massachusetts-Specific Rights Database ───────────────────────────────────
// Curated for tenants, immigrants, and students in Amherst, MA (01003)

const RIGHTS_DB = {
  lease: {
    title: "Rent Increase & Lease Rights (Massachusetts)",
    rights: [
      "Landlord must give at least 30 days written notice for rent increases on month-to-month tenancies",
      "Rent increases cannot be retaliatory (e.g., in response to you complaining about conditions or reporting code violations)",
      "Security deposit cannot exceed one month's rent under MA General Laws Chapter 186, Section 15B",
      "Your security deposit must be held in a separate, interest-bearing bank account and you must receive the account info within 30 days",
      "Landlord must return security deposit within 30 days of move-out, or provide itemized reasons for deductions",
      "You cannot be evicted without a court order — a landlord cannot change locks, remove doors, or shut off utilities to force you out",
      "If you are undocumented, you still have full tenant rights under Massachusetts law",
    ],
    resources: [
      { label: "MA Tenant Rights Hotline", phone: "617-603-1700" },
      { label: "Hampshire County Legal Aid", phone: "413-584-4034" },
      { label: "Valley Community Development", phone: "413-586-5855" },
      { label: "Community Legal Aid (Western MA)", phone: "413-781-7814" },
    ],
  },
  eviction: {
    title: "Eviction Defense Rights (Massachusetts)",
    rights: [
      "A landlord CANNOT evict you without going to court — there is no such thing as a 'self-help eviction' in MA",
      "You must be served with a formal Summary Process Summons. You have the right to respond (file an Answer) in court",
      "You have the right to a jury trial in eviction cases",
      "You may raise defenses including: failure to maintain habitable conditions, retaliation, discrimination, or procedural errors by the landlord",
      "You can apply for Emergency Rental Assistance (RAFT) even after eviction proceedings have started",
      "If you have children under 18 or a disability, the court may provide additional protections and resources",
      "If you cannot afford an attorney, you may qualify for free legal representation through Hampshire County Legal Aid",
      "Immigrants and undocumented residents have the same eviction defense rights as any tenant in Massachusetts",
    ],
    resources: [
      { label: "Hampshire County Legal Aid (URGENT)", phone: "413-584-4034" },
      { label: "Community Legal Aid Hotline", phone: "855-252-5342" },
      { label: "MA Emergency Rental Assistance (RAFT)", phone: "617-603-1700" },
      { label: "Tenant Protection Project (Western MA)", phone: "413-781-7814" },
    ],
  },
  financial_aid: {
    title: "Student Financial Aid Rights (Federal & Massachusetts)",
    rights: [
      "FAFSA verification is common — it does NOT mean you did anything wrong. It is a routine audit",
      "You have the right to appeal your Expected Family Contribution (EFC) if your family's financial situation has changed",
      "You cannot lose financial aid solely because of immigration status in Massachusetts — undocumented students may qualify for state aid",
      "Your financial aid cannot be reduced mid-year without notification and an opportunity to appeal",
      "FERPA protects your academic records — the school cannot share your financial information with parents without your consent if you are over 18",
      "Work-study jobs must pay at least minimum wage and cannot interfere with your required academic progress",
      "You have 30 days from an aid decision to submit an appeal — request an appeal form from your Financial Aid Office",
    ],
    resources: [
      { label: "UMass Financial Aid Office", phone: "413-545-0801" },
      { label: "MA Office of Student Financial Assistance", phone: "617-391-6070" },
      { label: "Federal Student Aid Ombudsman", phone: "877-557-2575" },
      { label: "UMass Student Legal Services", phone: "413-545-2684" },
    ],
  },
  government_notice: {
    title: "Government Notice & Benefits Rights (Massachusetts)",
    rights: [
      "You have the right to receive government communications in your language under MA Executive Order 615 (Language Access)",
      "You can request an interpreter for any government appointment, hearing, or proceeding — free of charge",
      "If you disagree with a government decision, you almost always have the right to appeal within a specified timeframe",
      "Government agencies cannot share your personal information with ICE or immigration enforcement without a judicial warrant in Massachusetts",
      "You are NOT required to answer questions from government officials without an attorney present",
      "If you receive a notice you do not understand, you have the right to request clarification before any deadlines pass",
    ],
    resources: [
      { label: "MA Language Access Coordinator", phone: "617-727-7775" },
      { label: "Pioneer Valley Workers Center", phone: "413-532-1491" },
      { label: "MIRA Coalition (Immigrant Rights)", phone: "617-350-5480" },
      { label: "ACLU of Massachusetts", phone: "617-482-3170" },
    ],
  },
  medical: {
    title: "Healthcare Rights (Massachusetts)",
    rights: [
      "In Massachusetts, you have the right to emergency medical care regardless of immigration status or ability to pay",
      "MassHealth (Medicaid) covers all low-income residents — undocumented residents qualify for Emergency MassHealth",
      "You have the right to an interpreter at all medical appointments — ask your provider to arrange this at no cost",
      "Medical providers cannot share your records without your written consent, with limited exceptions",
      "You can appeal insurance denials — insurers must provide written reasons and instructions for appeal",
      "Massachusetts prohibits medical debt from being used to deny you housing or reported to immigration authorities",
      "Community health centers (FQHCs) must serve all patients on a sliding-fee scale regardless of ability to pay",
    ],
    resources: [
      { label: "Amherst Health Department", phone: "413-259-3078" },
      { label: "CHC of Franklin County (sliding scale)", phone: "413-863-3200" },
      { label: "MassHealth Enrollment Center", phone: "800-841-2900" },
      { label: "BHN Crisis Services (mental health)", phone: "800-762-2000" },
    ],
  },
  other: {
    title: "General Rights in Massachusetts",
    rights: [
      "You have the right to remain silent and to an attorney before answering questions from law enforcement",
      "Massachusetts is a 'sanctuary state' — local police are prohibited from enforcing federal immigration law",
      "You have the right to equal treatment regardless of national origin, language, or immigration status in housing, employment, and public services",
      "Any contract or agreement signed under duress or without full understanding of its terms may be voidable",
      "You can always request legal advice before signing any document or agreeing to any terms",
    ],
    resources: [
      { label: "Hampshire County Legal Aid", phone: "413-584-4034" },
      { label: "Pioneer Valley Workers Center", phone: "413-532-1491" },
      { label: "Community Legal Aid (Western MA)", phone: "413-781-7814" },
      { label: "MIRA Coalition", phone: "617-350-5480" },
    ],
  },
};

module.exports = RIGHTS_DB;
