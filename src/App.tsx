import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ─── Palette ───────────────────────────────────────────────────────────────────
const AMBER   = "#d97706";
const GOLD    = "#f59e0b";
const BROWN   = "#78350f";
const DARK    = "#451a03";
const GREEN   = "#065f46";

// ─── Demo Data ─────────────────────────────────────────────────────────────────
const MONTHLY = [
  { m: "Mar", total: 38, verified: 31 },
  { m: "Apr", total: 52, verified: 44 },
  { m: "May", total: 61, verified: 55 },
  { m: "Jun", total: 47, verified: 38 },
  { m: "Jul", total: 74, verified: 65 },
  { m: "Aug", total: 83, verified: 71 },
  { m: "Sep", total: 69, verified: 60 },
];

const STATUS_PIE = [
  { name: "Verified", value: 847, color: GREEN },
  { name: "Pending",  value: 134, color: GOLD },
  { name: "Flagged",  value: 23,  color: "#b91c1c" },
];

const BATCHES = [
  { id: "MS-2026-MH-00421", state: "Maharashtra",      harvest: "18 Aug 2026", quality: "PASS",    stage: "Packaged",     trace: "Complete",   status: "Verified", variety: "Multifloral" },
  { id: "MS-2026-UP-00389", state: "Uttar Pradesh",    harvest: "12 Aug 2026", quality: "PASS",    stage: "Distribution", trace: "Complete",   status: "Verified", variety: "Mustard" },
  { id: "MS-2026-WB-00412", state: "West Bengal",      harvest: "05 Aug 2026", quality: "FAIL",    stage: "Laboratory",   trace: "Partial",    status: "Flagged",  variety: "Sunflower" },
  { id: "MS-2026-RJ-00374", state: "Rajasthan",        harvest: "29 Jul 2026", quality: "PASS",    stage: "Consumer",     trace: "Complete",   status: "Verified", variety: "Desert Flora" },
  { id: "MS-2026-KA-00398", state: "Karnataka",        harvest: "22 Jul 2026", quality: "PASS",    stage: "Packaged",     trace: "Complete",   status: "Verified", variety: "Neem" },
  { id: "MS-2026-AP-00361", state: "Andhra Pradesh",   harvest: "15 Jul 2026", quality: "PENDING", stage: "Processing",   trace: "Partial",    status: "Pending",  variety: "Cotton" },
  { id: "MS-2026-MH-00408", state: "Maharashtra",      harvest: "08 Jul 2026", quality: "PASS",    stage: "Distribution", trace: "Complete",   status: "Verified", variety: "Jamun" },
  { id: "MS-2026-HP-00352", state: "Himachal Pradesh", harvest: "01 Jul 2026", quality: "PASS",    stage: "Consumer",     trace: "Complete",   status: "Verified", variety: "Litchi" },
  { id: "MS-2026-AS-00341", state: "Assam",            harvest: "24 Jun 2026", quality: "FAIL",    stage: "Laboratory",   trace: "Incomplete", status: "Flagged",  variety: "Multifloral" },
  { id: "MS-2026-GJ-00377", state: "Gujarat",          harvest: "17 Jun 2026", quality: "PASS",    stage: "Consumer",     trace: "Complete",   status: "Verified", variety: "Coriander" },
  { id: "MS-2026-PB-00366", state: "Punjab",           harvest: "10 Jun 2026", quality: "PENDING", stage: "Collection",   trace: "Partial",    status: "Pending",  variety: "Mustard" },
  { id: "MS-2026-OR-00358", state: "Odisha",           harvest: "03 Jun 2026", quality: "PASS",    stage: "Packaged",     trace: "Complete",   status: "Verified", variety: "Forest" },
];

const SUPPLY_STAGES = [
  { num: "01", label: "Beekeeper",       date: "18 Aug",    entity: "Rajesh Patil, Nashik",      status: "done" },
  { num: "02", label: "Harvest",         date: "19 Aug",    entity: "Farm Unit MH-14",            status: "done" },
  { num: "03", label: "Collection",      date: "20 Aug",    entity: "Nashik Collection Centre",   status: "done" },
  { num: "04", label: "Processing",      date: "22 Aug",    entity: "MH Honey Processing Unit",   status: "done" },
  { num: "05", label: "Lab Testing",     date: "24 Aug",    entity: "FSSAI Lab, Pune",            status: "done" },
  { num: "06", label: "Packaging",       date: "25 Aug",    entity: "Nashik Pack Unit",           status: "done" },
  { num: "07", label: "Distribution",    date: "27 Aug",    entity: "AgriLogix Ltd.",             status: "transit" },
  { num: "08", label: "Consumer",        date: "—",         entity: "—",                          status: "pending" },
];

const NAV = ["About", "How It Works", "Dashboard", "Batches", "Verify", "Contact"];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function Badge({ s }: { s: string }) {
  const cls: Record<string, string> = {
    PASS: "badge-pass", FAIL: "badge-fail", PENDING: "badge-pending",
    Verified: "badge-pass", Flagged: "badge-flagged", Pending: "badge-pending",
    Complete: "badge-blue", Partial: "badge-pending", Incomplete: "badge-flagged",
  };
  return <span className={`badge ${cls[s] ?? "badge-pending"}`}>{s}</span>;
}

function HexIcon({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative flex items-center justify-center w-14 h-14 ${className}`}>
      <svg viewBox="0 0 56 64" className="absolute inset-0 w-full h-full" fill="none">
        <polygon points="28,2 54,16 54,48 28,62 2,48 2,16" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
      </svg>
      <span className="relative z-10 text-2xl">{children}</span>
    </div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ search, setSearch, active, setActive }: {
  search: string; setSearch: (v: string) => void;
  active: string; setActive: (v: string) => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setAvatarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-amber-100" : "bg-amber-50/90 border-b border-amber-200"}`}>
      <div className="max-w-screen-xl mx-auto px-5 flex items-center gap-4 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => { setActive("About"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
            <polygon points="16,2 30,9.5 30,24.5 16,32 2,24.5 2,9.5" fill="#d97706" />
            <polygon points="16,7 26,13 26,25 16,31 6,25 6,13" fill="#f59e0b" opacity="0.3" />
            <text x="16" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill="white" fontFamily="serif">म</text>
          </svg>
          <div className="leading-tight">
            <span className="text-[15px] font-semibold text-amber-900 tracking-tight" style={{ fontFamily: "Fraunces, serif" }}>MadhuSmriti</span>
            <p className="text-[9px] text-amber-600 tracking-widest uppercase font-medium leading-none mt-0.5">Honey Traceability</p>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 ml-3">
          {NAV.map((link) => (
            <button key={link} onClick={() => {
              setActive(link);
              const el = document.getElementById(`section-${link.replace(/\s+/g, "-").toLowerCase()}`);
              el?.scrollIntoView({ behavior: "smooth" });
            }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${active === link ? "bg-amber-100 text-amber-800" : "text-amber-900/70 hover:text-amber-900 hover:bg-amber-50"}`}>
              {link}
            </button>
          ))}
        </nav>
        <div className="flex-1" />

        {/* Search */}
        <div className="relative hidden lg:block">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-400 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input type="text" placeholder="Search batch ID…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border border-amber-200 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400 w-44 transition-all focus:w-56 placeholder:text-amber-300 font-mono text-amber-900" />
        </div>

        {/* New Batch */}
        <button className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
          + New Batch
        </button>

        {/* Avatar */}
        <div className="relative shrink-0" ref={dropRef}>
          <button onClick={() => setAvatarOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-amber-100 transition-colors">
            <div className="w-7 h-7 rounded-full bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-amber-900 text-xs font-bold">AK</div>
            <svg className={`w-3 h-3 text-amber-600 transition-transform ${avatarOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {avatarOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-amber-100 rounded-xl shadow-xl py-1 z-50">
              <div className="px-3 py-2 border-b border-amber-50">
                <p className="text-sm font-semibold text-amber-900">Amit Kumar</p>
                <p className="text-xs text-amber-500">Admin · Demo Portal</p>
              </div>
              {["My Profile", "Settings", "Activity Log", "Sign Out"].map((item) => (
                <button key={item} className="w-full text-left px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-50 transition-colors">{item}</button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-amber-800" onClick={() => setMobileOpen((v) => !v)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-amber-50 border-t border-amber-200 px-5 py-3 space-y-1">
          {NAV.map((link) => (
            <button key={link} onClick={() => { setActive(link); setMobileOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm text-amber-800 rounded-lg hover:bg-amber-100 transition-colors">{link}</button>
          ))}
        </div>
      )}
    </header>
  );
}

// ─── Hero Section ──────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="section-about" className="hc-tile relative overflow-hidden">
      {/* Glow spots */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-yellow-400/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-screen-xl mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            Smart India Hackathon 2026 · Prototype Demo
          </div>

          <h1 className="text-5xl lg:text-6xl font-light text-white leading-tight mb-4" style={{ fontFamily: "Fraunces, serif" }}>
            MadhuSmriti
            <span className="block text-amber-400 italic mt-1">माधुस्मृति</span>
          </h1>

          <p className="text-lg text-amber-100/80 leading-relaxed mb-4 max-w-xl">
            A digital platform for honey quality verification, supply-chain transparency, and adulteration detection — built for farmers, authorities, and consumers.
          </p>
          <p className="text-sm text-amber-300/70 italic mb-8" style={{ fontFamily: "Fraunces, serif" }}>
            "From Hive to Home — Verified Honey, Transparent Supply."
          </p>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => document.getElementById("section-dashboard")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-lg shadow-amber-900/30">
              View Dashboard →
            </button>
            <button onClick={() => document.getElementById("section-how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="border border-amber-500/50 hover:border-amber-400 text-amber-200 hover:text-amber-100 font-medium text-sm px-6 py-3 rounded-xl transition-colors">
              How It Works
            </button>
          </div>
        </div>

        {/* Floating stat chips */}
        <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col gap-4">
          {[
            { label: "Registered Batches", value: "1,004", icon: "🍯" },
            { label: "Verified Batches",   value: "847",   icon: "✓" },
            { label: "States Covered",     value: "18",    icon: "📍" },
            { label: "Flagged",            value: "23",    icon: "⚠" },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-3 flex items-center gap-3 w-52">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-xs text-amber-300 leading-none mb-0.5">{s.label}</p>
                <p className="text-xl font-bold text-white font-mono">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Problem / About ──────────────────────────────────────────────────────────
function About() {
  return (
    <section className="bg-amber-50 hc-light py-20 px-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-amber-600 tracking-widest uppercase mb-2">Why MadhuSmriti?</p>
          <h2 className="text-4xl font-light text-amber-950 mb-4" style={{ fontFamily: "Fraunces, serif" }}>
            India's Honey Problem is Real
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Honey is one of the most adulterated foods globally. Consumers cannot identify adulteration, and the origin of honey is rarely traceable. MadhuSmriti changes that.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {[
            { icon: "🧪", title: "Widespread Adulteration", stat: "~68%", desc: "of commercial honey samples in India reportedly contain adulterants such as sugar syrup, rice syrup, or artificial additives." },
            { icon: "🔍", title: "No Consumer Visibility", stat: "0 info", desc: "Consumers receive zero verifiable information about honey's origin, beekeeper identity, harvest date, or testing status." },
            { icon: "📋", title: "Regulatory Gaps", stat: "Manual", desc: "Quality checks and documentation happen in silos. There is no unified digital system linking beekeepers, labs, and regulators." },
          ].map((c) => (
            <div key={c.title} className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm">
              <div className="text-3xl mb-3">{c.icon}</div>
              <div className="text-3xl font-bold text-amber-600 font-mono mb-1" style={{ fontFamily: "Fraunces, serif" }}>{c.stat}</div>
              <h3 className="text-base font-semibold text-amber-950 mb-2">{c.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Solution statement */}
        <div className="bg-amber-800 rounded-3xl px-8 py-10 flex flex-col lg:flex-row items-center gap-8">
          <div className="shrink-0 hidden lg:block">
            <svg viewBox="0 0 80 92" className="w-20" fill="none">
              <polygon points="40,3 77,23 77,69 40,89 3,69 3,23" fill="#f59e0b" opacity="0.3" stroke="#fbbf24" strokeWidth="2" />
              <polygon points="40,14 66,29 66,59 40,74 14,59 14,29" fill="#d97706" opacity="0.5" />
              <text x="40" y="52" textAnchor="middle" fontSize="22" fill="white" fontFamily="serif" fontWeight="600">म</text>
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-light text-white mb-3" style={{ fontFamily: "Fraunces, serif" }}>
              MadhuSmriti brings the entire honey supply chain onto one transparent, verifiable platform.
            </h3>
            <p className="text-amber-200/80 text-sm leading-relaxed">
              Beekeepers register harvests digitally. Laboratories upload test results. Every step from hive to shelf receives a tamper-resistant digital record. Consumers scan a QR code and instantly know everything about their honey. Regulators monitor anomalies in real time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "01", icon: "🐝", title: "Register Honey Batch", desc: "Beekeepers register harvests with location, hive count, variety, and date. Each batch receives a unique MadhuSmriti ID." },
    { n: "02", icon: "🔬", title: "Test Quality", desc: "Accredited labs upload test results — moisture, HMF, sugars, acidity, diastase — directly into the platform against the batch record." },
    { n: "03", icon: "🗺", title: "Record Supply Chain", desc: "Every handoff — collection, processing, packaging, dispatch — is logged with entity, date, location, and a digital record reference." },
    { n: "04", icon: "📱", title: "Consumer Verification", desc: "Consumers scan the QR code on packaging to see the complete journey, quality test results, and platform authenticity assessment." },
  ];

  return (
    <section id="section-how-it-works" className="bg-white py-20 px-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-amber-600 tracking-widest uppercase mb-2">Platform Flow</p>
          <h2 className="text-4xl font-light text-amber-950" style={{ fontFamily: "Fraunces, serif" }}>How MadhuSmriti Works</h2>
        </div>

        {/* Steps connected by line */}
        <div className="relative">
          <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center">
                <HexIcon className="mb-5 z-10">{s.icon}</HexIcon>
                <p className="text-[10px] font-mono text-amber-500 tracking-widest mb-1">STEP {s.n}</p>
                <h3 className="text-base font-semibold text-amber-950 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature pills */}
        <div className="mt-14 flex flex-wrap justify-center gap-2">
          {["QR Batch Identification", "Lab Data Integration", "Multi-Stage Traceability", "Adulteration Risk Score", "Regulator Dashboard", "Consumer Transparency", "State-wise Analytics", "Tamper-resistant Records"].map((f) => (
            <span key={f} className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-full">{f}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Dashboard Section ────────────────────────────────────────────────────────
const BarTip = ({ active, payload, label }: any) => !active ? null : (
  <div className="bg-white border border-amber-200 rounded-lg shadow-lg px-3 py-2 text-xs">
    <p className="font-semibold text-amber-900 mb-1">{label} 2026</p>
    {payload?.map((p: any) => <p key={p.name} style={{ color: p.color }}>{p.name}: <b className="font-mono">{p.value}</b></p>)}
  </div>
);
const PieTip = ({ active, payload }: any) => !active ? null : (
  <div className="bg-white border border-amber-200 rounded-lg shadow-lg px-3 py-2 text-xs">
    <p className="text-amber-900 font-medium">{payload[0]?.name}: <b className="font-mono">{payload[0]?.value}</b></p>
  </div>
);

function Dashboard() {
  return (
    <section id="section-dashboard" className="bg-amber-950 hc-tile py-16 px-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <span className="text-xs font-mono text-amber-400 tracking-widest uppercase">Live Overview · Demo Data</span>
            <h2 className="text-3xl font-light text-white mt-1" style={{ fontFamily: "Fraunces, serif" }}>Platform Dashboard</h2>
          </div>
          <span className="text-xs text-amber-500 font-mono border border-amber-700 px-3 py-1 rounded-full">September 2026</span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Batches",   value: "1,004", sub: "+83 this month",  icon: "🍯" },
            { label: "Verified",        value: "847",   sub: "84.4% rate",      icon: "✅" },
            { label: "Quality Tested",  value: "971",   sub: "96.7% coverage",  icon: "⚗️" },
            { label: "Flagged",         value: "23",    sub: "2.3% anomaly rate",icon: "⚠️" },
          ].map((s) => (
            <div key={s.label} className="bg-white/8 border border-amber-700/30 rounded-2xl px-5 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="text-3xl font-bold text-white font-mono">{s.value}</p>
                  <p className="text-xs text-amber-500 mt-1">{s.sub}</p>
                </div>
                <span className="text-2xl opacity-70">{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2 bg-white/8 border border-amber-700/30 rounded-2xl p-5">
            <p className="text-xs text-amber-400 uppercase tracking-widest mb-4">Monthly Batch Activity</p>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={MONTHLY} barGap={2} barCategoryGap="32%">
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="m" tick={{ fill: "#fbbf24", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#fbbf24", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<BarTip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="total"    name="Total"    fill={GOLD}  radius={[3,3,0,0]} maxBarSize={22} />
                <Bar dataKey="verified" name="Verified" fill={GREEN} radius={[3,3,0,0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-amber-400"><span className="w-3 h-2 rounded-sm inline-block" style={{ background: GOLD }} />Total</span>
              <span className="flex items-center gap-1.5 text-xs text-amber-400"><span className="w-3 h-2 rounded-sm inline-block" style={{ background: GREEN }} />Verified</span>
            </div>
          </div>

          <div className="bg-white/8 border border-amber-700/30 rounded-2xl p-5">
            <p className="text-xs text-amber-400 uppercase tracking-widest mb-4">Status Distribution</p>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={STATUS_PIE} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value" stroke="none">
                  {STATUS_PIE.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip content={<PieTip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {STATUS_PIE.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />{s.name}
                  </span>
                  <span className="font-mono text-white font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Supply chain */}
        <div className="bg-white/8 border border-amber-700/30 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-amber-400 uppercase tracking-widest">Supply Chain Trace</p>
              <p className="font-mono text-sm text-amber-200 mt-0.5">MS-2026-MH-00421</p>
            </div>
            <span className="badge badge-pass">Verified</span>
          </div>
          <div className="flex flex-wrap gap-0">
            {SUPPLY_STAGES.map((st, i) => (
              <div key={st.num} className="flex items-center">
                <div className="flex flex-col items-center gap-1 w-24 text-center">
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold
                    ${st.status === "done"    ? "bg-green-900 border-green-500 text-green-300" :
                      st.status === "transit" ? "bg-amber-900 border-amber-500 text-amber-300" :
                                               "bg-amber-950 border-amber-700/40 text-amber-700"}`}>
                    {st.status === "done" ? "✓" : st.status === "transit" ? "↑" : "○"}
                  </div>
                  <p className="text-[10px] font-semibold text-amber-200 leading-tight">{st.label}</p>
                  <p className="text-[9px] text-amber-500 font-mono">{st.date}</p>
                </div>
                {i < SUPPLY_STAGES.length - 1 && (
                  <div className={`flex-1 h-0.5 w-4 mx-0.5 mb-6 ${st.status === "done" ? "bg-green-600" : "bg-amber-800"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Batches Table ────────────────────────────────────────────────────────────
function BatchesTable({ search }: { search: string }) {
  const [filter, setFilter]  = useState<"All"|"Verified"|"Flagged"|"Pending">("All");
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");
  const [page, setPage] = useState(1);
  const [selectedBatch, setSelectedBatch] = useState<typeof BATCHES[number] | null>(null);
  const PER_PAGE = 8;

  const rows = BATCHES.filter((b) => {
    const q = search.toLowerCase();
    return (!q || b.id.toLowerCase().includes(q) || b.state.toLowerCase().includes(q) || b.variety.toLowerCase().includes(q))
      && (filter === "All" || b.status === filter);
  }).sort((a, b) => {
    const av = (a as any)[sortKey]; const bv = (b as any)[sortKey];
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const pages = Math.ceil(rows.length / PER_PAGE);
  const visible = rows.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const sort = (k: string) => { setSortKey(k); setSortDir((d) => k === sortKey ? (d === "asc" ? "desc" : "asc") : "asc"); setPage(1); };
  const ColHead = ({ k, label }: { k: string; label: string }) => (
    <th onClick={() => sort(k)} className="text-left px-4 py-3 text-[11px] font-semibold text-amber-600 uppercase tracking-wider cursor-pointer whitespace-nowrap select-none hover:text-amber-800">
      {label} {sortKey === k ? (sortDir === "asc" ? "↑" : "↓") : <span className="text-amber-200">↕</span>}
    </th>
  );

  return (
    <section id="section-batches" className="bg-amber-50 hc-light py-16 px-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-amber-600 tracking-widest uppercase mb-1">Batch Registry</p>
            <h2 className="text-3xl font-light text-amber-950" style={{ fontFamily: "Fraunces, serif" }}>Honey Batches</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-white border border-amber-200 rounded-xl p-1 gap-0.5">
              {(["All","Verified","Flagged","Pending"] as const).map((f) => (
                <button key={f} onClick={() => { setFilter(f); setPage(1); }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${filter === f ? "bg-amber-500 text-white shadow-sm" : "text-amber-700 hover:bg-amber-50"}`}>{f}</button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 text-xs text-amber-700 border border-amber-200 bg-white rounded-xl px-3 py-2 hover:bg-amber-50 transition-colors">
              ↓ Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-amber-50 border-b border-amber-100">
                  <ColHead k="id"      label="Batch ID" />
                  <ColHead k="state"   label="State" />
                  <ColHead k="variety" label="Variety" />
                  <ColHead k="harvest" label="Harvest Date" />
                  <ColHead k="quality" label="Quality" />
                  <ColHead k="stage"   label="Stage" />
                  <ColHead k="trace"   label="Traceability" />
                  <ColHead k="status"  label="Status" />
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {visible.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-16 text-amber-300 text-sm">No batches match your search</td></tr>
                ) : visible.map((b) => (
                  <tr key={b.id} className="data-row transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-amber-800 font-semibold whitespace-nowrap">{b.id}</td>
                    <td className="px-4 py-3 text-amber-900">{b.state}</td>
                    <td className="px-4 py-3 text-amber-600 text-xs italic" style={{ fontFamily: "Fraunces, serif" }}>{b.variety}</td>
                    <td className="px-4 py-3 text-amber-700 font-mono text-xs whitespace-nowrap">{b.harvest}</td>
                    <td className="px-4 py-3"><Badge s={b.quality} /></td>
                    <td className="px-4 py-3 text-amber-700 text-xs">{b.stage}</td>
                    <td className="px-4 py-3"><Badge s={b.trace} /></td>
                    <td className="px-4 py-3"><Badge s={b.status} /></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedBatch(b)}
                        className="text-xs text-amber-600 hover:text-amber-800 font-medium transition-colors">
                        QR / View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="px-5 py-3 border-t border-amber-100 flex items-center justify-between">
              <p className="text-xs text-amber-500 font-mono">{(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, rows.length)} of {rows.length}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1,p-1))} disabled={page===1}
                  className="px-2.5 py-1 text-xs border border-amber-200 rounded-lg disabled:opacity-40 hover:bg-amber-50 text-amber-700 transition-colors">← Prev</button>
                {Array.from({ length: pages }, (_,i) => i+1).map((n) => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-7 h-7 text-xs rounded-lg transition-colors ${n===page ? "bg-amber-500 text-white" : "border border-amber-200 text-amber-600 hover:bg-amber-50"}`}>{n}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(pages,p+1))} disabled={page===pages}
                  className="px-2.5 py-1 text-xs border border-amber-200 rounded-lg disabled:opacity-40 hover:bg-amber-50 text-amber-700 transition-colors">Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedBatch && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    onClick={() => setSelectedBatch(null)}
  >
    <div
      className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setSelectedBatch(null)}
        className="absolute"
      >
        ×
      </button>

      <p className="text-sm text-amber-600 font-semibold mb-2">
        MADHUSMRITI
      </p>

      <h3
        className="text-3xl text-amber-950 mb-2"
        style={{ fontFamily: "Fraunces, serif" }}
      >
        Batch QR Code
      </h3>

      <p className="text-gray-500 text-sm mb-6">
        Scan this QR code to verify this honey batch.
      </p>

      <div className="flex justify-center mb-6">
        <QRCodeSVG
          value={`${window.location.origin}/?batch=${selectedBatch.id}`}
          size={220}
        />
      </div>

      <div className="bg-amber-50 rounded-xl p-4">
        <p className="text-xs text-amber-600 uppercase">
          Batch ID
        </p>

        <p className="font-mono font-bold text-amber-950 mt-1">
          {selectedBatch.id}
        </p>
      </div>

      <button
        onClick={() => setSelectedBatch(null)}
        className="mt-6 px-6 py-2 rounded-xl bg-amber-600 text-white font-semibold"
      >
        Close
      </button>
    </div>
  </div>
)}
    </section>
  );
}

// ─── App Coming Soon ──────────────────────────────────────────────────────────
function AppComingSoon() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="bg-white py-20 px-6 relative overflow-hidden">
      {/* Decorative honeycomb rings */}
      <div className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 opacity-[0.06]">
        <svg viewBox="0 0 320 370" className="w-64" fill="none">
          <polygon points="160,10 306,88 306,246 160,324 14,246 14,88" stroke="#d97706" strokeWidth="2" />
          <polygon points="160,40 276,106 276,238 160,304 44,238 44,106" stroke="#d97706" strokeWidth="2" />
          <polygon points="160,70 246,124 246,230 160,284 74,230 74,124" stroke="#d97706" strokeWidth="2" />
        </svg>
      </div>
      <div className="pointer-events-none absolute -right-20 top-1/2 -translate-y-1/2 opacity-[0.06]">
        <svg viewBox="0 0 320 370" className="w-64" fill="none">
          <polygon points="160,10 306,88 306,246 160,324 14,246 14,88" stroke="#d97706" strokeWidth="2" />
          <polygon points="160,40 276,106 276,238 160,304 44,238 44,106" stroke="#d97706" strokeWidth="2" />
          <polygon points="160,70 246,124 246,230 160,284 74,230 74,124" stroke="#d97706" strokeWidth="2" />
        </svg>
      </div>

      <div className="relative max-w-screen-xl mx-auto">
        <div className="max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300 text-amber-700 text-xs font-mono px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            Coming Soon · In Active Development
          </div>

          <h2 className="text-4xl font-light text-amber-950 mb-3" style={{ fontFamily: "Fraunces, serif" }}>
            MadhuSmriti is coming<br />
            <span className="italic text-amber-600">to your phone.</span>
          </h2>
          <p className="text-gray-500 mb-10 leading-relaxed">
            We are building the MadhuSmriti mobile app for Android. Scan QR codes, verify honey batches, trace supply chains, and access quality reports — right from your pocket.
          </p>

          {/* Phone mockup + Play Store badge */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-10">
            {/* Phone mockup */}
            <div className="relative">
              <div className="w-36 h-64 bg-amber-950 rounded-3xl border-4 border-amber-800 shadow-2xl shadow-amber-900/30 flex flex-col overflow-hidden">
                {/* Screen */}
                <div className="flex-1 bg-amber-900 m-2 rounded-2xl flex flex-col items-center justify-center gap-3 p-3">
                  <svg viewBox="0 0 28 32" className="w-10 h-10" fill="none">
                    <polygon points="14,2 26,9 26,23 14,30 2,23 2,9" fill="#d97706" />
                    <polygon points="14,7 22,12 22,22 14,27 6,22 6,12" fill="#f59e0b" opacity="0.5" />
                    <text x="14" y="22" textAnchor="middle" fontSize="10" fill="white" fontFamily="serif" fontWeight="700">म</text>
                  </svg>
                  <p className="text-amber-300 text-[10px] font-semibold text-center leading-tight" style={{ fontFamily: "Fraunces, serif" }}>MadhuSmriti</p>
                  <div className="w-full bg-amber-800/50 rounded-lg p-2 text-center">
                    <p className="text-[8px] text-amber-400 font-mono">SCAN QR TO VERIFY</p>
                    <div className="w-8 h-8 border-2 border-dashed border-amber-500/60 rounded mx-auto mt-1 flex items-center justify-center">
                      <span className="text-amber-500 text-sm">⊞</span>
                    </div>
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="h-1.5 bg-green-700/60 rounded-full w-full" />
                    <div className="h-1.5 bg-amber-700/60 rounded-full w-4/5" />
                    <div className="h-1.5 bg-amber-800/40 rounded-full w-3/5" />
                  </div>
                </div>
                {/* Home bar */}
                <div className="h-5 flex items-center justify-center">
                  <div className="w-10 h-1 bg-amber-700 rounded-full" />
                </div>
              </div>
              {/* Glow */}
              <div className="absolute inset-0 -z-10 bg-amber-500/10 blur-2xl rounded-full scale-110" />
            </div>

            {/* Feature list */}
            <div className="text-left space-y-3">
              {[
                { icon: "📱", text: "Scan QR codes on honey packaging" },
                { icon: "✅", text: "Instant batch verification results" },
                { icon: "🗺️", text: "Full supply chain journey view" },
                { icon: "🔬", text: "Lab quality test report access" },
                { icon: "🔔", text: "Alerts for flagged or recalled batches" },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3">
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-sm text-gray-600">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Google Play badge (styled) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-3 bg-gray-950 text-white rounded-xl px-5 py-3 shadow-lg cursor-pointer hover:bg-gray-800 transition-colors">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                <path d="M3.18 1.03C2.44 1.43 2 2.22 2 3.15v17.7c0 .93.44 1.72 1.18 2.12L13.37 12 3.18 1.03z" fill="#4CAF50" />
                <path d="M17.5 8.5l-2.62-1.52L7.87 12l7.01 5.02L17.5 15.5c.76-.44 1.24-1.25 1.24-2.1V10.6c0-.85-.48-1.66-1.24-2.1z" fill="#FFEB3B" />
                <path d="M3.18 22.97l10.19-10.97-7.01-5.02L3.18 22.97z" fill="#F44336" />
                <path d="M13.37 12 3.18 1.03l10.19 5.95 1.94 1.12L13.37 12z" fill="#2196F3" />
              </svg>
              <div className="text-left">
                <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-none">Get it on</p>
                <p className="text-base font-semibold leading-tight">Google Play</p>
              </div>
              <span className="ml-2 text-xs bg-amber-500 text-black font-bold px-2 py-0.5 rounded-full">Soon</span>
            </div>
          </div>

          {/* Notify form */}
          {!submitted ? (
            <div>
              <p className="text-sm text-gray-500 mb-3">Get notified when we launch on the Play Store</p>
              <form
                onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSubmitted(true); }}
                className="flex gap-2 max-w-sm mx-auto"
              >
                <input
                  type="email" required placeholder="your@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2 text-sm border border-amber-200 rounded-xl bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder:text-amber-300"
                />
                <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors whitespace-nowrap">
                  Notify Me
                </button>
              </form>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-5 py-3 rounded-xl">
              <span className="text-green-500">✓</span> You&apos;re on the list! We&apos;ll notify you at launch.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
// ─── Verify Honey Batch ───────────────────────────────────────────────────────
function Verify() {
  const [batchId, setBatchId] = useState("");
  const [result, setResult] = useState<"verified" | "flagged" | null>(null);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const qrBatchId = params.get("batch");

  if (qrBatchId) {
    setBatchId(qrBatchId);

    const batch = BATCHES.find(
      (b) => b.id.toUpperCase() === qrBatchId.toUpperCase()
    );

    if (batch) {
      setResult("verified");
    } else {
      setResult("flagged");
    }

    setTimeout(() => {
      document
        .getElementById("section-verify")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  }
}, []);

  const verifyBatch = () => {
  const id = batchId.trim().toUpperCase();

  if (!id) {
    setResult(null);
    return;
  }

  const batch = BATCHES.find(
    (b) => b.id.toUpperCase() === id
  );

  if (batch) {
    setResult("verified");
  } else {
    setResult("flagged");
  }
};

  return (
    <section
      id="section-verify"
      className="bg-amber-50 px-6 py-20 border-t border-amber-200"
    >
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-amber-700 font-semibold tracking-widest uppercase text-sm mb-3">
            Consumer Verification
          </p>

          <h2
            className="text-4xl md:text-5xl text-amber-950 mb-4"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Verify Your Honey
          </h2>

          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter the batch ID printed on your honey package to verify its
            authenticity and trace its journey from hive to home.
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-200">

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Honey Batch ID
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") verifyBatch();
                }}
                placeholder="e.g. MS-2026-MH-00421"
                className="flex-1 px-4 py-3 rounded-xl border border-amber-200 outline-none focus:ring-2 focus:ring-amber-400"
              />

              <button
                onClick={verifyBatch}
                className="px-7 py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition"
              >
                Verify Batch
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Demo IDs: MS-2026-MH-00421, MS-2026-KL-00218
            </p>
          </div>
        </div>

        {/* Verification Result */}
        {result && (
          <div className="max-w-4xl mx-auto mt-10">

            {result === "verified" ? (
              <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">

                {/* Status */}
                <div className="bg-green-50 px-6 py-5 border-b border-green-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                      ✓
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-green-800">
                        Verified Honey
                      </h3>

                      <p className="text-green-700 text-sm">
                        This batch has passed verification.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Batch Information */}
                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-4 mb-8">

                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase">
                        Batch ID
                      </p>
                      <p className="font-semibold text-amber-950 mt-1">
                        {batchId.toUpperCase()}
                      </p>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase">
                        Quality
                      </p>
                      <p className="font-semibold text-green-700 mt-1">
                        ✓ Passed
                      </p>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase">
                        Traceability
                      </p>
                      <p className="font-semibold text-green-700 mt-1">
                        ✓ Complete
                      </p>
                    </div>

                  </div>

                  {/* Honey Journey */}
                  <h4 className="text-xl font-semibold text-amber-950 mb-6">
                    Honey Journey
                  </h4>

                  <div className="space-y-4">

                    {[
                      ["🐝", "Beekeeper", "Hive registered"],
                      ["🍯", "Harvest", "Honey harvested"],
                      ["🏭", "Processing", "Batch processed"],
                      ["🔬", "Laboratory", "Quality tested"],
                      ["📦", "Packaging", "Batch packaged"],
                      ["🚚", "Distribution", "Ready for market"],
                    ].map(([icon, title, description], index) => (
                      <div
                        key={title}
                        className="flex items-center gap-4"
                      >
                        <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-xl">
                          {icon}
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {title}
                          </p>

                          <p className="text-sm text-gray-500">
                            {description}
                          </p>
                        </div>

                        <span className="text-green-600 font-semibold text-sm">
                          ✓ Complete
                        </span>
                      </div>
                    ))}

                  </div>

                  {/* Blockchain */}
                  <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">
                          Blockchain Record
                        </p>
                        <p className="text-sm text-gray-500">
                          Tamper-resistant traceability record
                        </p>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                        VERIFIED
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            ) : (

              /* Flagged Result */
              <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">

                <div className="bg-red-50 px-6 py-5 border-b border-red-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl">
                      !
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-red-800">
                        Batch Could Not Be Verified
                      </h3>

                      <p className="text-red-700 text-sm">
                        Please check the batch ID or contact the seller.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600">
                    No verified record was found for:
                  </p>

                  <p className="font-bold text-gray-900 mt-2">
                    {batchId.toUpperCase()}
                  </p>

                  <div className="mt-5 p-4 rounded-xl bg-red-50 text-red-800 text-sm">
                    ⚠ Do not assume this honey is authentic until the batch
                    can be verified through MadhuSmriti.
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}
// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-amber-950 hc-tile border-t border-amber-800 px-6 py-10">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <svg viewBox="0 0 28 32" className="w-7 h-7" fill="none">
                <polygon points="14,2 26,9 26,23 14,30 2,23 2,9" fill="#d97706" />
                <text x="14" y="21" textAnchor="middle" fontSize="11" fill="white" fontFamily="serif" fontWeight="700">म</text>
              </svg>
              <span className="text-amber-300 font-semibold" style={{ fontFamily: "Fraunces, serif" }}>MadhuSmriti</span>
            </div>
            <p className="text-amber-500 text-xs max-w-xs leading-relaxed">
              A honey quality verification and supply-chain traceability prototype developed for Smart India Hackathon 2026.
            </p>
          </div>
          <div className="text-xs text-amber-600 space-y-1">
            <p className="font-semibold text-amber-400 uppercase tracking-wider mb-2">Disclaimer</p>
            <p>This is a prototype demo. Not an official FSSAI,</p>
            <p>government, or laboratory-certified system.</p>
            <p>All data shown is fictional and for demonstration only.</p>
          </div>
        </div>
        <div className="border-t border-amber-800/50 pt-4 flex flex-wrap justify-between gap-2">
          <p className="text-xs text-amber-700 font-mono">MadhuSmriti · Smart India Hackathon 2026 · Prototype</p>
          <p className="text-xs text-amber-700">माधुस्मृति — From Hive to Home</p>
        </div>
      </div>
    </footer>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("About");
  return (
    <div className="min-h-full flex flex-col">
      <Navbar search={search} setSearch={setSearch} active={active} setActive={setActive} />
      <main className="flex-1">
        <Hero />
        <About />
        <HowItWorks />
        <Dashboard />
        <BatchesTable search={search} />
        <AppComingSoon />
        <Verify />
      </main>
      <Footer />
    </div>
  );
}
