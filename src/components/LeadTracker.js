import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import {
  Users,
  Target,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building,
  LogOut,
  DollarSign,
  TrendingUp,
  Thermometer,
  Flame,
  UserPlus,
  Settings,
  Trophy,
  BarChart3,
  Calendar,
  TrendingDown,
  Award,
  Zap,
  AlertTriangle,
  CheckCircle,
  X,
  Bell,
  Sun,
  Moon,
  Palette,
  Filter,
  ChevronDown,
  ExternalLink,
  Camera,
  Upload,
  Phone,
  MessageSquare,
  Sword,
  Crown,
  Star,
  Clock,
  Bot,
  Cat,
  Headphones,
  FileText,
  Plus,
  Edit,
  Save,
  Users2,
  Activity,
  Timer,
  PhoneCall,
  MapPin,
  Check,
  Loader,
  RefreshCw,
  Download,
  Search,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLeads } from "../hooks/useLeads";
import { useFirestore, fetchAgentGoalsStandalone } from "../hooks/useFirestore";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// Global state for leads data
let globalLeadsData = [];

// Agent and team data will be populated from real data
const mockAgents = [];

const mockFive9Data = {};

// Theme system
// NOTE: the `dash` sub-object holds the new "bento dark" Dashboard-tab surface
// tokens. Data colors (sale/dash-sale/referral/etc.) live in styles.css :root and
// stay consistent across every theme — only the surface tokens change per theme.
const themes = {
  default: {
    primary: "from-indigo-900 via-purple-900 to-pink-900",
    accent: "from-blue-500 to-purple-600",
    card: "bg-white/10",
    dash: {
      bg: "#0e0e14",
      card: "#1a1a26",
      cardHover: "#1f1f2e",
      border: "rgba(255,255,255,0.05)",
    },
  },
  ocean: {
    primary: "from-blue-900 via-cyan-900 to-teal-900",
    accent: "from-cyan-500 to-blue-600",
    card: "bg-blue-500/10",
    dash: {
      bg: "#0a1628",
      card: "#0f2035",
      cardHover: "#132940",
      border: "rgba(255,255,255,0.06)",
    },
  },
  forest: {
    primary: "from-green-900 via-emerald-900 to-teal-900",
    accent: "from-green-500 to-emerald-600",
    card: "bg-green-500/10",
    dash: {
      bg: "#0a1410",
      card: "#0f1f18",
      cardHover: "#132a20",
      border: "rgba(255,255,255,0.06)",
    },
  },
  sunset: {
    primary: "from-orange-900 via-red-900 to-pink-900",
    accent: "from-orange-500 to-red-600",
    card: "bg-orange-500/10",
    dash: {
      bg: "#1a0e0a",
      card: "#261612",
      cardHover: "#2e1c16",
      border: "rgba(255,255,255,0.06)",
    },
  },
  midnight: {
    primary: "from-slate-900 via-gray-900 to-black",
    accent: "from-gray-500 to-slate-600",
    card: "bg-slate-500/10",
    dash: {
      bg: "#0a0a0e",
      card: "#14141a",
      cardHover: "#1a1a22",
      border: "rgba(255,255,255,0.05)",
    },
  },
  aurora: {
    primary: "from-violet-900 via-purple-900 to-fuchsia-900",
    accent: "from-violet-500 to-fuchsia-600",
    card: "bg-violet-500/10",
    dash: {
      bg: "#100a1a",
      card: "#1a1228",
      cardHover: "#221830",
      border: "rgba(255,255,255,0.06)",
    },
  },
  helloKitty: {
    primary: "from-pink-400 via-pink-300 to-rose-200",
    accent: "from-pink-500 to-red-400",
    card: "bg-white/30",
    isLight: true,
    // Keep Hello Kitty light — pink surfaces, dark text.
    dash: {
      bg: "#fff0f6",
      card: "#ffffff",
      cardHover: "#fff5fa",
      border: "rgba(219,39,119,0.25)",
      text: "#4a1942",
      textSub: "#9b5d8b",
      textDim: "#c98bb3",
      isLight: true,
    },
  },
  runescape: {
    primary: "from-stone-950 via-amber-950 to-yellow-950",
    accent: "from-yellow-600 to-amber-700",
    card: "bg-amber-500/10",
    dash: {
      bg: "#0e0c08",
      card: "#1a1710",
      cardHover: "#221f16",
      border: "rgba(255,255,255,0.06)",
    },
  },
  // ── HALO THEME FAMILY ──────────────────────────────────────────────────
  // UNSC base: near-black bg, cyan VISR HUD accent, Spartan-green brand. The
  // halo-active class (added on the page wrapper) layers the HUD chrome on top
  // via HaloDecorations' style block. Data colors stay constant across themes.
  halo: {
    primary: "from-[#0A0E10] via-[#0d1519] to-[#0A0E10]",
    accent: "from-[#0E7A8C] to-[#21CFE8]",
    card: "bg-[#121821]/80",
    dash: {
      bg: "#0A0E10",
      card: "#121821",
      cardHover: "#1A2230",
      border: "rgba(33,207,232,0.20)",
      text: "#e8f6f9",
      textSub: "#7fa6b0",
      textDim: "#3c5560",
    },
  },
  // Forerunner: warm tan/steel with hard-light amber accents.
  haloForerunner: {
    primary: "from-[#0c0a06] via-[#171008] to-[#0c0a06]",
    accent: "from-[#9a5208] to-[#FF8A12]",
    card: "bg-[#171208]/80",
    dash: {
      bg: "#0c0a06",
      card: "#171208",
      cardHover: "#211a0e",
      border: "rgba(255,138,18,0.22)",
      text: "#f6efe2",
      textSub: "#b0a07f",
      textDim: "#5c503c",
    },
  },
  // Banished: black + bone + Atriox red — a "danger admin console" mood.
  haloBanished: {
    primary: "from-[#0a0606] via-[#160a0a] to-[#0a0606]",
    accent: "from-[#7a1414] to-[#B22222]",
    card: "bg-[#160b0b]/80",
    dash: {
      bg: "#0a0606",
      card: "#160b0b",
      cardHover: "#1e0f0f",
      border: "rgba(178,34,34,0.26)",
      text: "#f6e8e8",
      textSub: "#b08080",
      textDim: "#5c3c3c",
    },
  },
};

// Default "bento dark" tokens used as a fallback if a theme lacks `dash`.
const DEFAULT_DASH_TOKENS = {
  bg: "#0e0e14",
  card: "#1a1a26",
  cardHover: "#1f1f2e",
  border: "rgba(255,255,255,0.05)",
  text: "#f0f0f5",
  textSub: "#7a7a8e",
  textDim: "#3d3d50",
};

// Data colors for lead types (consistent across all themes).
const DASH_DATA_COLORS = {
  sale: "#84cc16",
  dashSale: "#22d3ee",
  referral: "#8b5cf6",
  negative: "#f43f5e",
  warning: "#f59e0b",
  callback: "#22d3ee",
  pink: "#ec4899",
  neutral: "#7a7a8e",
};

// Map a lead type string to its data color.
const getLeadTypeColor = (leadType = "") => {
  if (leadType.startsWith("Dash Sale")) return DASH_DATA_COLORS.dashSale;
  if (leadType.startsWith("Referral Sale")) return DASH_DATA_COLORS.referral;
  if (leadType.startsWith("Sale")) return DASH_DATA_COLORS.sale;
  if (leadType.startsWith("Immediate Dc") || leadType.startsWith("Third Party"))
    return DASH_DATA_COLORS.negative;
  if (
    leadType.startsWith("No SEP") ||
    leadType.startsWith("No Value") ||
    leadType.startsWith("Med Supp")
  )
    return DASH_DATA_COLORS.warning;
  if (
    leadType.startsWith("Tier 1") ||
    leadType.startsWith("Not Appointed") ||
    leadType.startsWith("Spanish")
  )
    return DASH_DATA_COLORS.pink;
  return DASH_DATA_COLORS.neutral;
};

const isSaleLeadType = (leadType = "") =>
  ["Sale", "Dash Sale", "Referral Sale"].some((t) => leadType.startsWith(t));

// Convert a hex color to an rgba() string with the given alpha.
const hexToRgba = (hex, alpha = 1) => {
  const m = hex.replace("#", "");
  const full =
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Animated number counter — eases from 0 to `value` over ~900ms on mount and
// whenever `value` changes (handles async data load).
const AnimatedNumber = ({
  value = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  style,
  duration = 900,
}) => {
  const [display, setDisplay] = React.useState(0);
  const rafRef = React.useRef(null);
  const target = Number(value) || 0;

  React.useEffect(() => {
    const start = performance.now();
    const from = 0;
    const animate = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (target - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(target);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return (
    <span className={className} style={style}>
      {prefix}
      {display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

// Human-readable label + color for a dash-call result.
const DASH_RESULT_META = {
  connected: { label: "Connected", color: "#84cc16" },
  no_answer: { label: "No Answer", color: "#f43f5e" },
  voicemail: { label: "Voicemail", color: "#f59e0b" },
  busy: { label: "Busy", color: "#8b5cf6" },
};

// =============================================================================
// TRAINING REFERENCE DATA (Rebuttals / Pitches / SEPs)
// Hardcoded reference material for now — no Firestore. Content is placeholder
// ("[Content to be added]") and will be filled in / moved to Firestore later.
// Each item carries a sequence of flashcard `steps` ({ title, content }).
// =============================================================================

// Shared step templates (fresh array per item so navigation state stays per-item).
const sepSteps = () => [
  { title: "Identify the SEP", content: "[Content to be added]" },
  { title: "Ask the qualifying question", content: "[Content to be added]" },
  { title: "Confirm and proceed", content: "[Content to be added]" },
];
const rebuttalSteps = () => [
  { title: "Acknowledge", content: "[Content to be added]" },
  { title: "Reframe", content: "[Content to be added]" },
  { title: "Redirect", content: "[Content to be added]" },
];
const pitchSteps = () => [
  { title: "Setup", content: "[Content to be added]" },
  { title: "Hook", content: "[Content to be added]" },
  { title: "Value Prop", content: "[Content to be added]" },
  { title: "Close", content: "[Content to be added]" },
];

// SEP item helper. opts: { tags: string[], requiresSup: bool }
const sep = (code, name, opts = {}) => ({
  code,
  name,
  tags: opts.tags || [],
  requiresSup: !!opts.requiresSup,
  steps: sepSteps(),
});

// NOTE: "Visible in MARX" tags below are placeholders to demonstrate the tag UI
// and should be verified against MARX before this ships as real reference data.
const SEP_DATA = {
  categories: [
    {
      id: "enrollment",
      name: "Enrollment Period SEPs",
      icon: "📋",
      color: "#22d3ee",
      items: [
        sep("OEP", "Open Enrollment Period (Jan 1 – Mar 31)", { tags: ["Visible in MARX"] }),
        sep("IEP", "Initial Election Period"),
        sep("OEP-N", "Open Enrollment Period — New"),
        sep("ICEP", "Initial Coverage Election Period", { tags: ["Visible in MARX"] }),
        sep("IEP 2", "Initial Election Period 2 (Turning 65)"),
        sep("RET", "Retroactive Enrollment"),
      ],
    },
    {
      id: "life",
      name: "Life Event SEPs",
      icon: "🏠",
      color: "#84cc16",
      items: [
        sep("MOVE", "Change of Address / Relocation"),
        sep("LEC", "Loss of Employer Coverage"),
        sep("LTC", "Leaving Long Term Care Facility"),
        sep("INC", "Incarceration Release"),
      ],
    },
    {
      id: "medicaid",
      name: "Medicaid & LIS (Extra Help) SEPs",
      icon: "🏥",
      color: "#8b5cf6",
      items: [
        sep("MCD", "Change in Medicaid Status"),
        sep("MCD-GAIN", "Gaining Medicaid"),
        sep("MCD-LOSS", "Loss of Medicaid"),
        sep("NLS", "Gain/Loss/Change in LIS (Extra Help) Status"),
      ],
    },
    {
      id: "plan",
      name: "Plan-Based SEPs",
      icon: "📄",
      color: "#f59e0b",
      items: [
        sep("LCC", "Loss of Chronic Condition Plan"),
        sep("SNP", "Special Needs Plan Eligibility"),
        sep("DIF", "Deemed / Auto-Assigned to Plan", { tags: ["Visible in MARX"] }),
        sep("MYT", "Plan Termination (Mid-Year)"),
        sep("EOC", "End of Contract — Plan Cancellation"),
        sep("5 STAR", "5-Star Plan Enrollment", { tags: ["Visible in MARX"] }),
      ],
    },
    {
      id: "chronic",
      name: "Chronic Condition & Special Need SEPs",
      icon: "⚕️",
      color: "#ec4899",
      items: [
        sep("CSN", "Chronic Special Needs Plan (C-SNP)", { requiresSup: true }),
        sep("CDC", "Coordinated Care / VA / IHS", { requiresSup: true }),
        sep("INT", "Institutional (HIDE/FIDE)", { requiresSup: true }),
      ],
    },
    {
      id: "pharma",
      name: "Pharmaceutical Assistance SEPs",
      icon: "💊",
      color: "#f43f5e",
      items: [
        sep("SPAP", "State Pharmaceutical Assistance Program"),
        sep("SPAP LOSS", "Loss of SPAP Coverage"),
      ],
    },
    {
      id: "disaster",
      name: "Disaster Relief SEPs",
      icon: "🌪️",
      color: "#60a5fa",
      items: [sep("FEMA", "FEMA-Declared Disaster Area", { tags: ["Visible in MARX"] })],
    },
  ],
};

const REBUTTALS_DATA = {
  categories: [
    {
      id: "soa",
      name: "SOA / Scope of Appointment Rebuttals",
      icon: "🛡️",
      color: "#22d3ee",
      items: [
        { name: "I didn't agree to this call", steps: rebuttalSteps() },
        { name: "I don't want to sign anything", steps: rebuttalSteps() },
        { name: "What is an SOA?", steps: rebuttalSteps() },
      ],
    },
    {
      id: "meds",
      name: "Medication Rebuttals",
      icon: "💊",
      color: "#84cc16",
      items: [
        { name: "I don't want to change my medications", steps: rebuttalSteps() },
        { name: "My doctor won't approve this", steps: rebuttalSteps() },
        { name: "I need to check with my pharmacist", steps: rebuttalSteps() },
      ],
    },
    {
      id: "doctor",
      name: "Doctor / Provider Rebuttals",
      icon: "👨‍⚕️",
      color: "#8b5cf6",
      items: [
        { name: "I don't want to change my doctor", steps: rebuttalSteps() },
        { name: "My doctor isn't in your network", steps: rebuttalSteps() },
        { name: "I need to ask my doctor first", steps: rebuttalSteps() },
      ],
    },
    {
      id: "cost",
      name: "Cost / Value Rebuttals",
      icon: "💰",
      color: "#f59e0b",
      items: [
        { name: "I can't afford it", steps: rebuttalSteps() },
        { name: "My current plan is cheaper", steps: rebuttalSteps() },
        { name: "I don't see the value", steps: rebuttalSteps() },
      ],
    },
    {
      id: "thirdparty",
      name: "Third Party Rebuttals",
      icon: "👨‍👩‍👧",
      color: "#ec4899",
      items: [
        { name: "I need to talk to my son/daughter first", steps: rebuttalSteps() },
        { name: "My spouse handles this", steps: rebuttalSteps() },
        { name: "Let me think about it", steps: rebuttalSteps() },
      ],
    },
    {
      id: "resistance",
      name: "General Resistance",
      icon: "🚫",
      color: "#f43f5e",
      items: [
        { name: "I'm not interested", steps: rebuttalSteps() },
        { name: "I already have coverage", steps: rebuttalSteps() },
        { name: "Call me back later", steps: rebuttalSteps() },
        { name: "Take me off your list", steps: rebuttalSteps() },
      ],
    },
  ],
};

const PITCHES_DATA = {
  categories: [
    {
      id: "opening",
      name: "Opening Pitches",
      icon: "📞",
      color: "#22d3ee",
      items: [
        { name: "Cold Call Introduction", steps: pitchSteps() },
        { name: "Warm Transfer Introduction", steps: pitchSteps() },
        { name: "Callback Introduction", steps: pitchSteps() },
        { name: "Dash Call Introduction", steps: pitchSteps() },
      ],
    },
    {
      id: "value",
      name: "Value Pitches",
      icon: "💎",
      color: "#84cc16",
      items: [
        { name: "Dental / Vision / Hearing Benefits", steps: pitchSteps() },
        { name: "OTC (Over-the-Counter) Benefits", steps: pitchSteps() },
        { name: "Transportation Benefits", steps: pitchSteps() },
        { name: "Grocery / Food Card Benefits", steps: pitchSteps() },
        { name: "Prescription Drug Savings", steps: pitchSteps() },
      ],
    },
    {
      id: "plantype",
      name: "Plan Type Pitches",
      icon: "🏥",
      color: "#8b5cf6",
      items: [
        { name: "MAPD (Medicare Advantage Prescription Drug)", steps: pitchSteps() },
        { name: "DSNP (Dual Special Needs Plan)", steps: pitchSteps() },
        { name: "HMO vs PPO Explanation", steps: pitchSteps() },
        { name: "Med Supp Comparison", steps: pitchSteps() },
      ],
    },
    {
      id: "switch",
      name: "Carrier Switch Pitches",
      icon: "🔄",
      color: "#f59e0b",
      items: [
        { name: "Switching from UHC", steps: pitchSteps() },
        { name: "Switching from Humana", steps: pitchSteps() },
        { name: "Switching from Aetna", steps: pitchSteps() },
        { name: "Generic Carrier Switch", steps: pitchSteps() },
      ],
    },
    {
      id: "closing",
      name: "Closing Pitches",
      icon: "🎯",
      color: "#ec4899",
      items: [
        { name: "Standard Close", steps: pitchSteps() },
        { name: "Urgency Close", steps: pitchSteps() },
        { name: "Benefit Summary Close", steps: pitchSteps() },
        { name: "Referral Ask", steps: pitchSteps() },
      ],
    },
  ],
};

const flashItemKey = (cat, item) => `${cat.id}::${item.code || item.name}`;

// Shared collapsible-dropdown / flashcard UI used by the Rebuttals, Pitches and
// SEPs tabs. Theme surface tokens are inherited via CSS vars from the wrapper.
const FlashcardReference = ({ data, searchPlaceholder = "Search…", rootStyle }) => {
  const [queryStr, setQueryStr] = React.useState("");
  const [expanded, setExpanded] = React.useState({});
  const [stepByItem, setStepByItem] = React.useState({});

  const q = queryStr.trim().toLowerCase();
  const categories = data.categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (it) =>
          !q ||
          (it.code || "").toLowerCase().includes(q) ||
          (it.name || "").toLowerCase().includes(q)
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  const allKeys = [];
  categories.forEach((cat) =>
    cat.items.forEach((it) => allKeys.push(flashItemKey(cat, it)))
  );
  const allExpanded = allKeys.length > 0 && allKeys.every((k) => expanded[k]);

  const toggleAll = () => {
    if (allExpanded) {
      setExpanded({});
    } else {
      const next = {};
      allKeys.forEach((k) => (next[k] = true));
      setExpanded(next);
    }
  };
  const toggleItem = (k) => setExpanded((p) => ({ ...p, [k]: !p[k] }));
  const setStep = (k, idx) => setStepByItem((p) => ({ ...p, [k]: idx }));

  return (
    <div className="dash-root" style={rootStyle}>
      {/* Header: search + expand/collapse toggle */}
      <div className="flex items-center justify-between gap-3 flex-wrap" style={{ flexShrink: 0 }}>
        <div style={{ position: "relative", flex: "1 1 240px", maxWidth: "440px" }}>
          <Search
            className="w-4 h-4"
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }}
          />
          <input
            type="text"
            value={queryStr}
            onChange={(e) => setQueryStr(e.target.value)}
            placeholder={searchPlaceholder}
            className="dash-input"
            style={{ width: "100%", padding: "8px 10px 8px 32px", fontSize: "0.85rem" }}
          />
        </div>
        <button
          onClick={toggleAll}
          className="dash-card dash-card-hover dash-mono"
          style={{ padding: "8px 12px", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-sub)", letterSpacing: "0.04em" }}
        >
          {allExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>

      {/* Scrollable category list */}
      <div className="lead-log-scroll" style={{ flex: "1 1 auto", minHeight: 0, paddingRight: "4px" }}>
        {categories.length === 0 ? (
          <div className="dash-sub text-center" style={{ padding: "40px 0", fontSize: "0.9rem" }}>
            No matches for "{queryStr}"
          </div>
        ) : (
          categories.map((cat, ci) => (
            <div
              key={cat.id}
              className="dash-animate"
              style={{ animationDelay: `${0.05 + ci * 0.05}s`, marginBottom: "16px" }}
            >
              {/* Category header */}
              <div
                style={{
                  borderLeft: `3px solid ${cat.color}`,
                  background: "var(--card)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 14px",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "1rem" }}>{cat.icon}</span>
                <span style={{ color: cat.color, fontWeight: 700, fontSize: "0.9rem" }}>{cat.name}</span>
                <span className="dash-dim dash-mono" style={{ fontSize: "0.7rem", marginLeft: "auto" }}>
                  {cat.items.length}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {cat.items.map((it) => {
                  const k = flashItemKey(cat, it);
                  const isOpen = !!expanded[k];
                  const stepIdx = Math.min(stepByItem[k] || 0, it.steps.length - 1);
                  const step = it.steps[stepIdx];
                  return (
                    <div
                      key={k}
                      className="dash-card"
                      style={{ overflow: "hidden", background: isOpen ? "var(--card-hover)" : "var(--card)" }}
                    >
                      {/* Clickable row */}
                      <button
                        onClick={() => toggleItem(k)}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", textAlign: "left" }}
                      >
                        {it.code && (
                          <span className="dash-mono" style={{ color: cat.color, fontWeight: 700, fontSize: "0.8rem", minWidth: "62px", flexShrink: 0 }}>
                            {it.code}
                          </span>
                        )}
                        <span
                          style={{ flex: 1, minWidth: 0, color: "var(--text)", fontSize: "0.85rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        >
                          {it.name}
                        </span>
                        {it.requiresSup && (
                          <span
                            className="dash-mono"
                            style={{ flexShrink: 0, fontSize: "0.6rem", fontWeight: 700, padding: "3px 7px", borderRadius: "var(--radius-xs)", background: hexToRgba("#f59e0b", 0.15), color: "#f59e0b", whiteSpace: "nowrap" }}
                          >
                            ⚠️ REQUIRES SUP APPROVAL
                          </span>
                        )}
                        {(it.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="dash-mono"
                            style={{ flexShrink: 0, fontSize: "0.6rem", fontWeight: 700, padding: "3px 7px", borderRadius: "var(--radius-xs)", background: hexToRgba("#22d3ee", 0.15), color: "#22d3ee", whiteSpace: "nowrap" }}
                          >
                            → {tag}
                          </span>
                        ))}
                        <ChevronDown
                          className="w-4 h-4"
                          style={{ flexShrink: 0, color: "var(--text-sub)", transition: "transform 0.2s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      </button>

                      {/* Expanded flashcard */}
                      {isOpen && (
                        <div className="flash-expand" style={{ padding: "0 14px 14px 14px" }}>
                          <div
                            key={stepIdx}
                            className="flash-step"
                            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "14px" }}
                          >
                            <div className="flex items-center gap-2" style={{ marginBottom: "8px" }}>
                              <span
                                className="dash-mono"
                                style={{ width: "26px", height: "26px", borderRadius: "50%", background: hexToRgba(cat.color, 0.2), color: cat.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0 }}
                              >
                                {stepIdx + 1}
                              </span>
                              <span style={{ color: "var(--text)", fontWeight: 700, fontSize: "0.9rem" }}>{step.title}</span>
                            </div>
                            <div className="dash-sub" style={{ fontSize: "0.85rem", minHeight: "40px", lineHeight: 1.5 }}>
                              {step.content}
                            </div>
                            <div className="flex items-center justify-between" style={{ marginTop: "12px", gap: "8px" }}>
                              <button
                                onClick={() => setStep(k, stepIdx - 1)}
                                disabled={stepIdx === 0}
                                className="dash-card dash-card-hover"
                                style={{ padding: "6px 12px", fontSize: "0.78rem", fontWeight: 600, color: "var(--text)", opacity: stepIdx === 0 ? 0.4 : 1, cursor: stepIdx === 0 ? "not-allowed" : "pointer" }}
                              >
                                ← Previous
                              </button>
                              <span className="dash-mono dash-sub" style={{ fontSize: "0.72rem" }}>
                                Step {stepIdx + 1} of {it.steps.length}
                              </span>
                              <button
                                onClick={() => setStep(k, stepIdx + 1)}
                                disabled={stepIdx === it.steps.length - 1}
                                className="dash-card dash-card-hover"
                                style={{ padding: "6px 12px", fontSize: "0.78rem", fontWeight: 600, color: "var(--text)", opacity: stepIdx === it.steps.length - 1 ? 0.4 : 1, cursor: stepIdx === it.steps.length - 1 ? "not-allowed" : "pointer" }}
                              >
                                Next →
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Hello Kitty Decorations Component
const HelloKittyDecorations = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <>
      {/* Floating decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top left bow */}
        <div className="absolute top-20 left-4 text-4xl animate-bounce" style={{ animationDuration: '3s' }}>
          🎀
        </div>
        {/* Top right hearts */}
        <div className="absolute top-32 right-8 text-2xl animate-pulse" style={{ animationDuration: '2s' }}>
          💕
        </div>
        {/* Bottom left flower */}
        <div className="absolute bottom-40 left-10 text-3xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
          🌸
        </div>
        {/* Bottom right bow */}
        <div className="absolute bottom-28 right-12 text-3xl animate-pulse" style={{ animationDuration: '2.5s' }}>
          🎀
        </div>
        {/* Middle decorations */}
        <div className="absolute top-1/2 left-6 text-2xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
          ✨
        </div>
        <div className="absolute top-1/3 right-6 text-2xl animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1.5s' }}>
          💖
        </div>
      </div>

      {/* Hello Kitty watermark in corner */}
      <div className="fixed bottom-4 left-4 pointer-events-none z-0 opacity-20">
        <svg width="80" height="80" viewBox="0 0 100 100">
          <ellipse cx="50" cy="55" rx="42" ry="38" fill="white" stroke="#333" strokeWidth="2"/>
          <path d="M 15 35 Q 8 15 25 20 Q 30 25 28 35" fill="white" stroke="#333" strokeWidth="2"/>
          <path d="M 85 35 Q 92 15 75 20 Q 70 25 72 35" fill="white" stroke="#333" strokeWidth="2"/>
          <ellipse cx="82" cy="22" rx="12" ry="8" fill="#FF0000"/>
          <ellipse cx="68" cy="28" rx="8" ry="6" fill="#FF0000"/>
          <circle cx="75" cy="25" r="4" fill="#FF0000"/>
          <ellipse cx="35" cy="52" rx="4" ry="5" fill="#333"/>
          <ellipse cx="65" cy="52" rx="4" ry="5" fill="#333"/>
          <ellipse cx="50" cy="62" rx="3" ry="2.5" fill="#FFD700"/>
          <line x1="5" y1="50" x2="25" y2="55" stroke="#333" strokeWidth="1.5"/>
          <line x1="5" y1="58" x2="25" y2="60" stroke="#333" strokeWidth="1.5"/>
          <line x1="5" y1="66" x2="25" y2="65" stroke="#333" strokeWidth="1.5"/>
          <line x1="95" y1="50" x2="75" y2="55" stroke="#333" strokeWidth="1.5"/>
          <line x1="95" y1="58" x2="75" y2="60" stroke="#333" strokeWidth="1.5"/>
          <line x1="95" y1="66" x2="75" y2="65" stroke="#333" strokeWidth="1.5"/>
        </svg>
      </div>

      {/* Custom CSS for Hello Kitty theme */}
      <style>{`
        /* Hello Kitty theme custom styles */
        .hello-kitty-active {
          --hk-pink: #FF69B4;
          --hk-light-pink: #FFB6C1;
          --hk-red: #FF4444;
        }

        /* Add subtle pattern overlay */
        .hello-kitty-active::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
          z-index: 0;
        }

        /* Fix text readability on light pink background */
        .hello-kitty-active .text-white {
          color: #4a1942 !important;
          text-shadow: none;
        }

        .hello-kitty-active .text-gray-300 {
          color: #6b2d5b !important;
        }

        .hello-kitty-active .text-gray-400 {
          color: #8b4d7b !important;
        }

        .hello-kitty-active .text-xs.text-gray-400 {
          color: #9b5d8b !important;
        }

        /* Keep colored text visible but darker */
        .hello-kitty-active .text-blue-400 {
          color: #1e40af !important;
        }

        .hello-kitty-active .text-green-400 {
          color: #166534 !important;
        }

        .hello-kitty-active .text-cyan-400 {
          color: #0e7490 !important;
        }

        .hello-kitty-active .text-purple-400 {
          color: #7c3aed !important;
        }

        .hello-kitty-active .text-pink-400 {
          color: #be185d !important;
        }

        .hello-kitty-active .text-yellow-400 {
          color: #b45309 !important;
        }

        .hello-kitty-active .text-red-400 {
          color: #b91c1c !important;
        }

        /* Make cards more visible */
        .hello-kitty-active .bg-white\\/10,
        .hello-kitty-active .bg-white\\/30,
        .hello-kitty-active .bg-white\\/5 {
          background-color: rgba(255, 255, 255, 0.7) !important;
          border-color: rgba(219, 39, 119, 0.3) !important;
        }

        .hello-kitty-active .bg-slate-800 {
          background-color: rgba(255, 255, 255, 0.8) !important;
        }

        .hello-kitty-active .border-white\\/20 {
          border-color: rgba(219, 39, 119, 0.3) !important;
        }

        .hello-kitty-active .border-slate-700 {
          border-color: rgba(219, 39, 119, 0.3) !important;
        }

        /* Cute rounded corners for cards */
        .hello-kitty-active .rounded-xl {
          border-radius: 1.5rem;
        }

        /* Add subtle glow to accent buttons */
        .hello-kitty-active button[class*="from-pink"] {
          box-shadow: 0 0 15px rgba(255, 105, 180, 0.4);
        }

        /* Header text */
        .hello-kitty-active h1,
        .hello-kitty-active h2,
        .hello-kitty-active h3,
        .hello-kitty-active h4,
        .hello-kitty-active h5 {
          color: #4a1942 !important;
        }

        /* Chart labels */
        .hello-kitty-active .recharts-cartesian-axis-tick-value {
          fill: #4a1942 !important;
        }

        .hello-kitty-active .recharts-legend-item-text {
          color: #4a1942 !important;
        }
      `}</style>
    </>
  );
};

// Hello Kitty Header Bow Component
const HelloKittyBow = ({ isActive, isRuneScape }) => {
  if (isRuneScape) return (
    <span className="ml-2 text-2xl animate-pulse" title="RuneScape Mode!">⚔️</span>
  );
  if (!isActive) return null;
  return (
    <span className="ml-2 text-2xl animate-pulse" title="Hello Kitty Mode!">🎀</span>
  );
};

// Hello Kitty Face SVG Component - the iconic Hello Kitty logo
const HelloKittyFace = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    {/* Face outline */}
    <ellipse cx="50" cy="55" rx="42" ry="38" fill="white" stroke="#333" strokeWidth="2"/>
    {/* Left ear */}
    <path d="M 15 35 Q 8 15 25 20 Q 30 25 28 35" fill="white" stroke="#333" strokeWidth="2"/>
    {/* Right ear */}
    <path d="M 85 35 Q 92 15 75 20 Q 70 25 72 35" fill="white" stroke="#333" strokeWidth="2"/>
    {/* Red bow */}
    <ellipse cx="82" cy="22" rx="12" ry="8" fill="#FF0000"/>
    <ellipse cx="68" cy="28" rx="8" ry="6" fill="#FF0000"/>
    <circle cx="75" cy="25" r="4" fill="#FF0000"/>
    {/* Left eye */}
    <ellipse cx="35" cy="52" rx="4" ry="5" fill="#333"/>
    {/* Right eye */}
    <ellipse cx="65" cy="52" rx="4" ry="5" fill="#333"/>
    {/* Nose */}
    <ellipse cx="50" cy="62" rx="3" ry="2.5" fill="#FFD700"/>
    {/* Left whiskers */}
    <line x1="5" y1="50" x2="25" y2="55" stroke="#333" strokeWidth="1.5"/>
    <line x1="5" y1="58" x2="25" y2="60" stroke="#333" strokeWidth="1.5"/>
    <line x1="5" y1="66" x2="25" y2="65" stroke="#333" strokeWidth="1.5"/>
    {/* Right whiskers */}
    <line x1="95" y1="50" x2="75" y2="55" stroke="#333" strokeWidth="1.5"/>
    <line x1="95" y1="58" x2="75" y2="60" stroke="#333" strokeWidth="1.5"/>
    <line x1="95" y1="66" x2="75" y2="65" stroke="#333" strokeWidth="1.5"/>
  </svg>
);

// Hello Kitty Icon mappings - replaces regular icons with cute alternatives
const helloKittyIconEmojis = {
  target: "💖",      // Goals/targets
  trending: "✨",    // Trends/growth
  dollar: "🌸",      // Revenue/money
  trophy: "👑",      // Awards
  bell: "🔔",        // Notifications
  fire: "💕",        // Hot/fire
  star: "⭐",        // Star
  check: "💖",       // Success
  alert: "😿",       // Warning
  mail: "💌",        // Email
  referral: "🎁",    // Referrals
  headphones: "🎧",  // Support
};

// Icon types that should use Hello Kitty face
const helloKittyFaceTypes = ['shield', 'users', 'user', 'chart'];

// Themed Icon Component - shows themed face or emoji when special themes are active
const HALO_ICON_MAP = {
  target: "helmet",
  chart: "scan",
  rebuttals: "shield",
  planselection: "datapad",
  pitches: "sword",
  seps: "waypoint",
  trophy: "medal",
  star: "medal",
  dollar: "credit",
  users: "fireteam",
  user: "helmet",
  trending: "scan",
  referral: "fists",
  bell: "comm",
  headphones: "comm",
};
const renderHaloIcon = (kind, props) => {
  switch (kind) {
    case "helmet": return <HaloSpartanHelmet {...props} />;
    case "scan": return <HaloVisrScan {...props} />;
    case "shield": return <HaloShieldIcon {...props} />;
    case "datapad": return <HaloDatapad {...props} />;
    case "sword": return <HaloEnergySword {...props} />;
    case "waypoint": return <HaloWaypointIcon {...props} />;
    case "medal": return <HaloMedalIcon {...props} />;
    case "credit": return <HaloCredit {...props} />;
    case "fireteam": return <HaloFireteam {...props} />;
    case "fists": return <HaloFists {...props} />;
    case "comm": return <HaloCommHelmet {...props} />;
    default: return null;
  }
};

const HelloKittyIcon = ({ icon: Icon, iconType, isHelloKitty, isRuneScape, isHalo, className = "", size, ...props }) => {
  if (isHalo) {
    const kind = HALO_ICON_MAP[iconType];
    if (kind) return renderHaloIcon(kind, { size: size || 20, className });
  }
  if (isHelloKitty) {
    // Use Hello Kitty face for user/avatar related icons
    if (helloKittyFaceTypes.includes(iconType)) {
      return <HelloKittyFace size={size || 20} className={className} />;
    }
    // Use emoji for other icons
    if (helloKittyIconEmojis[iconType]) {
      return (
        <span
          className={`inline-flex items-center justify-center ${className}`}
          style={{ fontSize: '1.25rem', lineHeight: 1 }}
          {...props}
        >
          {helloKittyIconEmojis[iconType]}
        </span>
      );
    }
  }
  if (isRuneScape) {
    // Use Gnome Child for user/avatar related icons
    if (runescapeFaceTypes.includes(iconType)) {
      return <RuneScapeGnomeChild size={size || 20} className={className} />;
    }
    // Use RuneScape emoji for other icons
    if (runescapeIconEmojis[iconType]) {
      return (
        <span
          className={`inline-flex items-center justify-center ${className}`}
          style={{ fontSize: '1.25rem', lineHeight: 1 }}
          {...props}
        >
          {runescapeIconEmojis[iconType]}
        </span>
      );
    }
  }
  return <Icon className={className} {...props} />;
};

// Themed Avatar Component - shows themed face instead of initials
const HelloKittyAvatar = ({ name, isHelloKitty, isRuneScape, className = "" }) => {
  if (isHelloKitty) {
    return (
      <div className={`bg-gradient-to-r from-pink-100 to-pink-50 rounded-full flex items-center justify-center ${className}`}>
        <HelloKittyFace size={32} />
      </div>
    );
  }
  if (isRuneScape) {
    return (
      <div className={`bg-gradient-to-r from-amber-800 to-yellow-700 rounded-full flex items-center justify-center ${className}`}>
        <RuneScapeGnomeChild size={32} />
      </div>
    );
  }
  return (
    <div className={`bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold ${className}`}>
      {name?.split(" ").map((n) => n[0]).join("") || "?"}
    </div>
  );
};

// Themed Logo Component for header
const HelloKittyLogo = ({ isHelloKitty, isRuneScape, isHalo, className = "" }) => {
  if (isHelloKitty) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <HelloKittyFace size={28} />
      </div>
    );
  }
  if (isRuneScape) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <RuneScapeGoldCoin size={28} />
      </div>
    );
  }
  if (isHalo) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <HaloSpartanHelmet size={26} style={{ color: "#fff" }} />
      </div>
    );
  }
  return <Shield className={className} />;
};

// RuneScape Gold Coin SVG Component - the iconic OSRS gold piece
const RuneScapeGoldCoin = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    {/* Coin shadow/depth */}
    <ellipse cx="50" cy="56" rx="38" ry="36" fill="#8B6914"/>
    {/* Coin body */}
    <ellipse cx="50" cy="50" rx="38" ry="36" fill="#FFD700"/>
    {/* Coin highlight */}
    <ellipse cx="42" cy="42" rx="20" ry="18" fill="#FFF8DC" opacity="0.3"/>
    {/* Inner ring */}
    <ellipse cx="50" cy="50" rx="30" ry="28" fill="none" stroke="#DAA520" strokeWidth="2"/>
    {/* GP text */}
    <text x="50" y="58" textAnchor="middle" fill="#8B6914" fontSize="24" fontWeight="bold" fontFamily="serif">GP</text>
  </svg>
);

// RuneScape Gnome Child SVG Component - the iconic meme
const RuneScapeGnomeChild = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    {/* Head */}
    <circle cx="50" cy="62" r="28" fill="#E8D5B7"/>
    {/* Hat - green pointy gnome hat */}
    <path d="M 22 52 L 50 5 L 78 52 Z" fill="#2D5A27"/>
    {/* Hat band */}
    <rect x="22" y="48" width="56" height="6" rx="2" fill="#1a3a15"/>
    {/* Eyes - big and round */}
    <circle cx="40" cy="58" r="5" fill="#333"/>
    <circle cx="60" cy="58" r="5" fill="#333"/>
    {/* Eye shine */}
    <circle cx="42" cy="56" r="2" fill="white"/>
    <circle cx="62" cy="56" r="2" fill="white"/>
    {/* Big round nose */}
    <ellipse cx="50" cy="68" rx="5" ry="6" fill="#D4A574"/>
    {/* Nose highlight */}
    <ellipse cx="48" cy="66" rx="2" ry="2.5" fill="#E8D5B7" opacity="0.5"/>
    {/* Smile */}
    <path d="M 38 78 Q 50 86 62 78" fill="none" stroke="#8B6914" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// RuneScape Decorations Component - gold coins everywhere!
const RuneScapeDecorations = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <>
      {/* Floating gold coins and medieval elements everywhere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top row coins */}
        <div className="absolute top-20 left-4 text-3xl animate-bounce" style={{ animationDuration: '3s' }}>
          🪙
        </div>
        <div className="absolute top-16 left-[12%] text-2xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }}>
          🪙
        </div>
        <div className="absolute top-24 left-[28%] text-xl animate-pulse" style={{ animationDuration: '2.8s', animationDelay: '0.8s' }}>
          🪙
        </div>
        <div className="absolute top-32 right-8 text-2xl animate-pulse" style={{ animationDuration: '2s' }}>
          🪙
        </div>
        <div className="absolute top-20 right-[18%] text-3xl animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '0.5s' }}>
          🪙
        </div>

        {/* Medieval elements */}
        <div className="absolute top-1/3 left-6 text-2xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
          ⚔️
        </div>
        <div className="absolute top-[45%] right-[3%] text-2xl animate-pulse" style={{ animationDuration: '2.9s', animationDelay: '0.2s' }}>
          🏰
        </div>
        <div className="absolute bottom-[15%] left-[3%] text-2xl animate-bounce" style={{ animationDuration: '4.2s', animationDelay: '1.7s' }}>
          🐉
        </div>

        {/* Middle scattered coins */}
        <div className="absolute top-1/3 right-6 text-xl animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1.5s' }}>
          🪙
        </div>
        <div className="absolute top-1/2 left-[8%] text-2xl animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.7s' }}>
          🪙
        </div>
        <div className="absolute top-1/2 right-[10%] text-xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1.2s' }}>
          🪙
        </div>
        <div className="absolute top-[15%] left-[40%] text-xl animate-bounce" style={{ animationDuration: '3.3s', animationDelay: '1.1s' }}>
          🪙
        </div>
        <div className="absolute top-[60%] left-[5%] text-2xl animate-pulse" style={{ animationDuration: '2.7s', animationDelay: '0.6s' }}>
          🪙
        </div>
        <div className="absolute top-[70%] right-[8%] text-xl animate-bounce" style={{ animationDuration: '3.1s', animationDelay: '1.4s' }}>
          🪙
        </div>

        {/* Bottom row coins */}
        <div className="absolute bottom-40 left-10 text-3xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
          🪙
        </div>
        <div className="absolute bottom-32 left-[25%] text-xl animate-pulse" style={{ animationDuration: '2.2s', animationDelay: '0.4s' }}>
          🪙
        </div>
        <div className="absolute bottom-28 right-12 text-3xl animate-pulse" style={{ animationDuration: '2.5s' }}>
          🪙
        </div>
        <div className="absolute bottom-20 right-[30%] text-2xl animate-bounce" style={{ animationDuration: '3.8s', animationDelay: '0.9s' }}>
          🪙
        </div>
        <div className="absolute bottom-12 left-[50%] text-xl animate-pulse" style={{ animationDuration: '3.4s', animationDelay: '1.3s' }}>
          🪙
        </div>
      </div>

      {/* RuneScape gold coin watermark in corner */}
      <div className="fixed bottom-4 left-4 pointer-events-none z-0 opacity-20">
        <RuneScapeGoldCoin size={80} />
      </div>

      {/* RuneScape Gnome Child watermark in opposite corner */}
      <div className="fixed bottom-4 right-4 pointer-events-none z-0 opacity-15">
        <RuneScapeGnomeChild size={70} />
      </div>

      {/* RuneScape theme custom CSS */}
      <style>{`
        /* RuneScape theme custom styles */
        .runescape-active {
          --rs-gold: #FFD700;
          --rs-dark-gold: #B8860B;
          --rs-brown: #3E3529;
          --rs-dark-brown: #1a1108;
          --rs-amber: #FF981F;
        }

        /* Stone/parchment texture overlay */
        .runescape-active::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            radial-gradient(circle, rgba(255, 215, 0, 0.04) 1px, transparent 1px),
            radial-gradient(circle, rgba(184, 134, 11, 0.03) 1px, transparent 1px);
          background-size: 30px 30px, 20px 20px;
          background-position: 0 0, 10px 10px;
          pointer-events: none;
          z-index: 0;
        }

        /* Gold text for headers - OSRS style */
        .runescape-active h1,
        .runescape-active h2,
        .runescape-active h3,
        .runescape-active h4,
        .runescape-active h5 {
          color: #FFD700 !important;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8), 0 0 8px rgba(255, 215, 0, 0.3);
        }

        /* Warm wheat tone for white text */
        .runescape-active .text-white {
          color: #F5DEB3 !important;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }

        .runescape-active .text-gray-300 {
          color: #D4A574 !important;
        }

        .runescape-active .text-gray-400 {
          color: #C4956A !important;
        }

        .runescape-active .text-xs.text-gray-400 {
          color: #B8945A !important;
        }

        /* Keep colored text visible with warm tones */
        .runescape-active .text-blue-400 {
          color: #6CB4EE !important;
        }

        .runescape-active .text-green-400 {
          color: #50C878 !important;
        }

        .runescape-active .text-cyan-400 {
          color: #7EC8E3 !important;
        }

        .runescape-active .text-purple-400 {
          color: #B57EDC !important;
        }

        .runescape-active .text-pink-400 {
          color: #FFB6C1 !important;
        }

        .runescape-active .text-yellow-400 {
          color: #FFD700 !important;
        }

        .runescape-active .text-red-400 {
          color: #FF6347 !important;
        }

        /* Cards with dark leather/parchment feel */
        .runescape-active .bg-white\\/10,
        .runescape-active .bg-white\\/30,
        .runescape-active .bg-white\\/5 {
          background-color: rgba(62, 53, 41, 0.6) !important;
          border-color: rgba(255, 215, 0, 0.25) !important;
        }

        .runescape-active .bg-slate-800 {
          background-color: rgba(62, 53, 41, 0.8) !important;
        }

        .runescape-active .border-white\\/20 {
          border-color: rgba(255, 215, 0, 0.25) !important;
        }

        .runescape-active .border-slate-700 {
          border-color: rgba(184, 134, 11, 0.4) !important;
        }

        /* Slightly sharper corners for medieval feel */
        .runescape-active .rounded-xl {
          border-radius: 0.5rem;
        }

        /* Golden glow on accent buttons */
        .runescape-active button[class*="from-yellow"],
        .runescape-active button[class*="from-amber"] {
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
        }

        /* Chart labels */
        .runescape-active .recharts-cartesian-axis-tick-value {
          fill: #D4A574 !important;
        }

        .runescape-active .recharts-legend-item-text {
          color: #D4A574 !important;
        }

        /* Custom scrollbar */
        .runescape-active ::-webkit-scrollbar {
          width: 8px;
        }

        .runescape-active ::-webkit-scrollbar-track {
          background: #1a1108;
        }

        .runescape-active ::-webkit-scrollbar-thumb {
          background: #B8860B;
          border-radius: 4px;
        }

        .runescape-active ::-webkit-scrollbar-thumb:hover {
          background: #DAA520;
        }

        /* Gold border glow on inputs */
        .runescape-active input:focus,
        .runescape-active select:focus,
        .runescape-active textarea:focus {
          border-color: #FFD700 !important;
          box-shadow: 0 0 8px rgba(255, 215, 0, 0.3) !important;
        }

        /* Tab active state golden glow */
        .runescape-active button[class*="bg-gradient-to-r"][class*="from-yellow"] {
          box-shadow: 0 0 12px rgba(255, 215, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </>
  );
};

// RuneScape Icon emoji mappings - replaces regular icons with OSRS alternatives
const runescapeIconEmojis = {
  target: "⚔️",       // Goals/targets → crossed swords
  trending: "📈",     // Trends/growth
  dollar: "🪙",       // Revenue/money → gold coins!
  trophy: "👑",       // Awards → crown
  bell: "🔔",         // Notifications
  fire: "🔥",         // Hot/fire rune
  star: "⭐",         // Star
  check: "✅",        // Success
  alert: "☠️",        // Warning → skull (PK danger!)
  mail: "📜",         // Email → scroll
  referral: "🗡️",     // Referrals → dagger
  headphones: "🛡️",   // Support → shield
};

// Icon types that should use Gnome Child face in RuneScape theme
const runescapeFaceTypes = ['shield', 'users', 'user', 'chart'];

// =============================================================================
// HALO SVG ICON LIBRARY
// Simple, iconic, currentColor-based silhouettes (so they inherit `color` /
// style={{color}}). Used by HaloDecorations (scaled up) and by the themed icon
// swaps in HelloKittyIcon / HelloKittyLogo and the dashboard when a halo theme
// is active. Inline only — no external image files.
// =============================================================================
const HaloSpartanHelmet = ({ size = 24, className = "", style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M12 3.5c4 0 6.5 2.6 6.5 6.2v3.2c0 2.4-1.7 4.1-4 4.6l-1 .4h-3l-1-.4c-2.3-.5-4-2.2-4-4.6V9.7C5.5 6.1 8 3.5 12 3.5Z" />
    <path d="M8 10.5 16 10.5 14.3 14 9.7 14Z" fill="currentColor" stroke="none" />
    <path d="M9.5 17.7 9 20M14.5 17.7 15 20" strokeLinecap="round" />
  </svg>
);

const HaloEnergySword = ({ size = 24, className = "", style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <path d="M9.5 3.2 10.2 12M14.5 3.2 13.8 12" />
    <path d="M8.8 12.6 15.2 12.6 13.8 14.6 10.2 14.6Z" fill="currentColor" stroke="none" />
    <rect x="11" y="14.6" width="2" height="6" rx="0.6" fill="currentColor" stroke="none" />
  </svg>
);

const HaloCrossedSwords = ({ size = 24, className = "", style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    <path d="M4 4 14 14M20 4 10 14" />
    <path d="M3 17 7 21M21 17 17 21" />
    <path d="M11 15 8 18M13 15 16 18" />
  </svg>
);

const HaloWaypointIcon = ({ size = 24, className = "", style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style}>
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
    <path d="M12 5 L18 16 L12 13 L6 16 Z" fill="currentColor" />
  </svg>
);

const HaloReticle = ({ size = 24, className = "", style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.3">
    <circle cx="12" cy="12" r="7" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

const HaloVisrScan = ({ size = 24, className = "", style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    <path d="M4 6V4h2M18 4h2v2M20 18v2h-2M6 20H4v-2" />
    <path d="M6 9h12M6 12h12M6 15h7" opacity="0.85" />
  </svg>
);

const HaloShieldIcon = ({ size = 24, className = "", style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
    <path d="M12 3 19 6v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6Z" />
    <path d="M8.5 11.5 11 14 15.5 8.5" strokeLinecap="round" />
  </svg>
);

const HaloMedalIcon = ({ size = 24, className = "", style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
    <path d="M12 3 18 6.5v7L12 17 6 13.5v-7Z" />
    <path d="M9 9.5 11 12 15 7.5" strokeLinecap="round" />
    <path d="M9 17 8 21l4-2 4 2-1-4" />
  </svg>
);

const HaloDatapad = ({ size = 24, className = "", style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M7 7h10M7 11h10M7 15h6" opacity="0.85" />
  </svg>
);

const HaloCommHelmet = ({ size = 24, className = "", style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    <path d="M7 11c0-2.8 2.2-5 5-5s5 2.2 5 5v3.5c0 1.6-1.2 2.8-2.8 3l-.7.3h-3l-.7-.3C8.2 17.3 7 16.1 7 14.5Z" />
    <path d="M9 12 15 12 13.8 14.6 10.2 14.6Z" fill="currentColor" stroke="none" />
    <path d="M4.5 8.5C3.7 9.6 3.7 11 4.5 12M19.5 8.5c.8 1.1.8 2.5 0 3.5" opacity="0.8" />
  </svg>
);

const HaloCortanaChip = ({ size = 24, className = "", style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    <rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" fillOpacity="0.18" />
    <path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3" />
  </svg>
);

const HaloFireteam = ({ size = 24, className = "", style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M7 9c0-1.8 1.3-3 3-3s3 1.2 3 3v2c0 1.4-1 2.4-2.3 2.6L10 14H9l-.7-.4C7 13.4 7 12.4 7 11Z" transform="translate(-3 0)" />
    <path d="M7 9c0-1.8 1.3-3 3-3s3 1.2 3 3v2c0 1.4-1 2.4-2.3 2.6L10 14H9l-.7-.4C7 13.4 7 12.4 7 11Z" transform="translate(7 0)" />
    <path d="M10 12h4" strokeLinecap="round" opacity="0.8" />
  </svg>
);

const HaloFists = ({ size = 24, className = "", style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
    <rect x="3" y="9" width="7" height="6" rx="1.5" />
    <rect x="14" y="9" width="7" height="6" rx="1.5" />
    <path d="M10 12h4" strokeLinecap="round" />
  </svg>
);

const HaloCredit = ({ size = 24, className = "", style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style}>
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
    <text x="12" y="15.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="currentColor" fontFamily="'Share Tech Mono', monospace">cR</text>
  </svg>
);

const HaloUNSCEagle = ({ size = 24, className = "", style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.2">
    <circle cx="12" cy="12" r="6" opacity="0.6" />
    <path d="M12 6c-1.4 1.5-3.5 2.2-6 2 1 2.4 3 3.7 6 4 3-0.3 5-1.6 6-4-2.5.2-4.6-.5-6-2Z" fill="currentColor" stroke="none" />
    <path d="M12 12v5M9.5 16h5" strokeLinecap="round" />
  </svg>
);

// Large background decoration SVGs (low-opacity silhouettes)
const HaloRingArc = ({ className = "", style }) => (
  <svg viewBox="0 0 200 200" className={className} style={style}>
    <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="10" opacity="0.5" />
    <circle cx="100" cy="100" r="74" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" strokeDasharray="6 10" />
    <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
  </svg>
);

const HaloWarthog = ({ className = "", style }) => (
  <svg viewBox="0 0 64 32" className={className} style={style} fill="currentColor">
    <path d="M2 20h6l3-6h16l4 4h25l5 3v5H58a5 5 0 0 0-10 0H20a5 5 0 0 0-10 0H2Z" opacity="0.9" />
    <circle cx="15" cy="26" r="4" /><circle cx="53" cy="26" r="4" />
    <rect x="44" y="8" width="14" height="3" rx="1" />
  </svg>
);

const HaloBattleRifle = ({ className = "", style }) => (
  <svg viewBox="0 0 64 24" className={className} style={style} fill="currentColor">
    <path d="M2 9h40v4H30l-2 6h-4l1-6H10l-2 5H4l1-5H2Z" opacity="0.9" />
    <rect x="42" y="8" width="18" height="3" rx="1" />
    <rect x="20" y="4" width="8" height="3" rx="1" />
  </svg>
);

// =============================================================================
// HALO ("VISR OS") DECORATIONS — overlay + scoped .halo-active CSS.
// Mirrors the HelloKitty / RuneScape decoration pattern: only mounts when a
// halo theme is active, and carries all halo-specific styling in a <style>
// block so nothing leaks to the other 8 themes. The accent color is driven by
// the --halo-accent CSS var, which the page wrapper sets per variant
// (cyan = UNSC, amber = Forerunner, red = Banished).
// =============================================================================
const HaloDecorations = ({ isActive }) => {
  if (!isActive) return null;
  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="halo-grid" />
        <div className="halo-scanlines" />
        {/* Master Chief helmet ghosted behind the header */}
        <HaloSpartanHelmet size={240} className="halo-deco halo-helmet-hdr" style={{ color: "var(--halo-accent)" }} />
        {/* Large slowly-rotating Halo ring in the upper-right */}
        <HaloRingArc className="halo-deco halo-ring-ur" style={{ color: "var(--halo-accent)" }} />
        {/* Big slow ring ghosted behind the content / lead log */}
        <HaloRingArc className="halo-deco halo-ring-bg" style={{ color: "var(--halo-accent)" }} />
        {/* Crossed Energy Swords, mid-right */}
        <HaloCrossedSwords size={130} className="halo-deco halo-swords" style={{ color: "var(--halo-accent)" }} />
        {/* Battle Rifle, mid-left */}
        <HaloBattleRifle className="halo-deco halo-rifle" style={{ color: "var(--halo-accent)" }} />
        {/* Warthog, bottom-left */}
        <HaloWarthog className="halo-deco halo-warthog" style={{ color: "var(--halo-accent)" }} />
        {/* UNSC eagle, bottom-right */}
        <HaloUNSCEagle size={120} className="halo-deco halo-eagle" style={{ color: "var(--halo-accent)" }} />
        {/* Drifting plasma orbs */}
        <span className="halo-plasma halo-plasma-1" />
        <span className="halo-plasma halo-plasma-2" />
        {/* Viewport corner HUD brackets */}
        <div className="halo-bracket halo-bracket-tl" />
        <div className="halo-bracket halo-bracket-tr" />
        <div className="halo-bracket halo-bracket-bl" />
        <div className="halo-bracket halo-bracket-br" />
      </div>
      <style>{`
        .halo-active {
          --halo-accent: #21CFE8;
          --halo-accent-dim: #0E7A8C;
          --halo-accent-glow: #6EEAF6;
        }
        .halo-active.haloForerunner {
          --halo-accent: #FF8A12;
          --halo-accent-dim: #9a5208;
          --halo-accent-glow: #FFB155;
        }
        .halo-active.haloBanished {
          --halo-accent: #B22222;
          --halo-accent-dim: #6e1414;
          --halo-accent-glow: #FF2E2E;
        }

        /* Typography — condensed industrial sans + geometric headers */
        .halo-active,
        .halo-active .dash-root {
          font-family: "Saira", "Barlow", system-ui, sans-serif;
        }
        .halo-active h1,
        .halo-active h2,
        .halo-active h3,
        .halo-active h4,
        .halo-active h5 {
          font-family: "Oxanium", "Aldrich", sans-serif !important;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .halo-active button {
          letter-spacing: 0.04em;
        }
        .halo-active .dash-mono {
          font-family: "Share Tech Mono", "JetBrains Mono", monospace !important;
        }

        /* Background grid + scanline wash */
        .halo-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--halo-accent) 1px, transparent 1px),
            linear-gradient(90deg, var(--halo-accent) 1px, transparent 1px);
          background-size: 46px 46px;
          opacity: 0.035;
        }
        .halo-scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent 0,
            transparent 2px,
            rgba(255, 255, 255, 0.025) 3px
          );
          opacity: 0.6;
        }

        /* Viewport corner HUD brackets */
        .halo-bracket {
          position: absolute;
          width: 40px;
          height: 40px;
          border: 2px solid var(--halo-accent);
          opacity: 0.45;
        }
        .halo-bracket-tl { top: 86px; left: 10px; border-right: none; border-bottom: none; }
        .halo-bracket-tr { top: 86px; right: 10px; border-left: none; border-bottom: none; }
        .halo-bracket-bl { bottom: 14px; left: 10px; border-right: none; border-top: none; }
        .halo-bracket-br { bottom: 14px; right: 10px; border-left: none; border-top: none; }

        /* VISR card chrome: accent border + inset glow + 4 HUD corner brackets.
           Brackets are painted on a ::after overlay (not the card background) so
           the card's hover background-change can't wipe them. */
        .halo-active .dash-card,
        .halo-active .dash-stat {
          position: relative;
          border-color: var(--halo-accent-dim) !important;
          box-shadow: inset 0 0 14px -7px var(--halo-accent);
        }
        .halo-active .dash-card::after,
        .halo-active .dash-stat::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(var(--halo-accent), var(--halo-accent)),
            linear-gradient(var(--halo-accent), var(--halo-accent)),
            linear-gradient(var(--halo-accent), var(--halo-accent)),
            linear-gradient(var(--halo-accent), var(--halo-accent)),
            linear-gradient(var(--halo-accent), var(--halo-accent)),
            linear-gradient(var(--halo-accent), var(--halo-accent)),
            linear-gradient(var(--halo-accent), var(--halo-accent)),
            linear-gradient(var(--halo-accent), var(--halo-accent));
          background-repeat: no-repeat;
          background-size:
            13px 2px, 2px 13px,
            13px 2px, 2px 13px,
            13px 2px, 2px 13px,
            13px 2px, 2px 13px;
          background-position:
            left 5px top 5px, left 5px top 5px,
            right 5px top 5px, right 5px top 5px,
            left 5px bottom 5px, left 5px bottom 5px,
            right 5px bottom 5px, right 5px bottom 5px;
          opacity: 0.85;
        }

        /* Monthly-progress bar reads as an energy shield with Forerunner light traces */
        .halo-active .dash-progress-fill {
          position: relative;
          overflow: hidden;
          background: linear-gradient(90deg, var(--halo-accent-dim), var(--halo-accent-glow)) !important;
          box-shadow: 0 0 10px var(--halo-accent);
        }
        .halo-active .dash-progress-fill::after {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(90deg, transparent 0, transparent 18px, rgba(255,177,85,0.55) 19px, transparent 20px);
          animation: halo-trace 2.6s linear infinite;
        }

        /* Energy-sword ignition glow on hover */
        .halo-active button,
        .halo-active .dash-lead-row {
          transition: box-shadow 0.2s ease, background 0.16s ease, transform 0.16s ease;
        }
        .halo-active button:hover {
          box-shadow: 0 0 14px -2px var(--halo-accent);
        }
        .halo-active .dash-lead-row:hover {
          box-shadow: inset 0 0 0 1px var(--halo-accent), 0 0 16px -6px var(--halo-accent);
        }

        /* Streak badge: sweeping energy-shield shimmer */
        .halo-active .halo-streak { position: relative; overflow: hidden; }
        .halo-active .halo-streak::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: translateX(-100%);
          animation: halo-recharge 2.4s linear infinite;
        }

        /* Inputs glow with the active accent on focus */
        .halo-active input:focus,
        .halo-active select:focus,
        .halo-active textarea:focus {
          border-color: var(--halo-accent) !important;
          box-shadow: 0 0 0 1px var(--halo-accent);
        }

        /* Themed scrollbar */
        .halo-active .lead-log-scroll::-webkit-scrollbar-thumb {
          background: var(--halo-accent-dim);
        }

        /* Background decoration SVGs */
        .halo-deco { position: absolute; color: var(--halo-accent); }
        .halo-helmet-hdr { top: -36px; left: 50%; margin-left: -120px; opacity: 0.05; }
        .halo-ring-ur { top: -130px; right: -130px; width: 380px; height: 380px; opacity: 0.05; animation: halo-spin 120s linear infinite; }
        .halo-ring-bg { bottom: -180px; left: 50%; margin-left: -270px; width: 540px; height: 540px; opacity: 0.04; animation: halo-spin 200s linear infinite reverse; }
        .halo-swords { top: 38%; right: 22px; width: 130px; height: 130px; opacity: 0.08; }
        .halo-rifle { top: 56%; left: 14px; width: 210px; opacity: 0.06; }
        .halo-warthog { bottom: 28px; left: 26px; width: 210px; opacity: 0.06; }
        .halo-eagle { bottom: 38px; right: 38px; width: 120px; height: 120px; opacity: 0.07; }

        /* Drifting plasma orbs */
        .halo-plasma {
          position: absolute;
          width: 10px; height: 10px; border-radius: 50%;
          background: #4FB6FF;
          box-shadow: 0 0 14px 4px rgba(79,182,255,0.6);
          opacity: 0.4;
          animation: halo-plasma-pulse 3s ease-in-out infinite;
        }
        .halo-plasma-1 { top: 28%; left: 17%; }
        .halo-plasma-2 { top: 72%; right: 20%; animation-delay: 1.3s; }

        @keyframes halo-recharge {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes halo-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes halo-trace {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
        @keyframes halo-plasma-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.4); opacity: 0.65; }
        }
        @keyframes halo-ping {
          0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0.85; }
          100% { transform: translate(-50%, -50%) scale(2.6); opacity: 0; }
        }
      `}</style>
    </>
  );
};

// Map a theme key to its halo variant accent label (for HUD overlay tinting).
const isHaloTheme = (key = "") => key === "halo" || key.startsWith("halo");

// Global state for supervisor help requests and goals
let globalSupervisorRequests = [];
let globalAgentGoals = {};
let globalTeamAssignments = {};
let globalTeamGoals = { salesGoal: 50, conversionGoal: 25 };
let globalCallReviewForms = [];

// Utility function to get real agent stats from global leads data
const getRealAgentStats = (agentEmail, dateFilter = null) => {
  const agentLeads = globalLeadsData.filter(
    (lead) => lead.agentEmail === agentEmail
  );
  let filteredLeads = agentLeads;

  if (dateFilter) {
    const filterDate = new Date(dateFilter);
    filterDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(filterDate);
    nextDay.setDate(nextDay.getDate() + 1);

    filteredLeads = agentLeads.filter((lead) => {
      const leadDate = new Date(lead.timestamp);
      return leadDate >= filterDate && leadDate < nextDay;
    });
  }

  const sales = filteredLeads.filter((lead) => lead.sale);
  const nonDashSales = filteredLeads.filter(
    (lead) => !lead.leadType?.startsWith("Dash Sale")
  );
  const referrals = filteredLeads.filter(
    (lead) => lead.leadType?.startsWith("Referral Sale")
  );
  const dashSales = filteredLeads.filter(
    (lead) => lead.leadType?.startsWith("Dash Sale")
  );

  return {
    leads: nonDashSales.length,
    sales: sales.length,
    referrals: referrals.length,
    dashSales: dashSales.length,
    conversionRate:
      nonDashSales.length > 0
        ? ((sales.length / nonDashSales.length) * 100).toFixed(1)
        : 0,
    revenue: sales.reduce(
      (sum, lead) =>
        sum + (lead.commission || 115) + (lead.hra ? lead.hraValue || 15 : 0),
      0
    ),
    leadsList: filteredLeads,
  };
};

// Utility function to get team stats from real data
const getRealTeamStats = (teamName, dateFilter = null) => {
  const teamMembers = mockAgents.filter((agent) => agent.team === teamName);
  let totalStats = { leads: 0, sales: 0, referrals: 0, revenue: 0 };

  teamMembers.forEach((member) => {
    const memberStats = getRealAgentStats(member.email, dateFilter);
    totalStats.leads += parseInt(memberStats.leads);
    totalStats.sales += parseInt(memberStats.sales);
    totalStats.referrals += parseInt(memberStats.referrals);
    totalStats.revenue += memberStats.revenue;
  });

  const avgConversion =
    teamMembers.length > 0
      ? (
          teamMembers.reduce(
            (sum, member) =>
              sum +
              parseFloat(
                getRealAgentStats(member.email, dateFilter).conversionRate
              ),
            0
          ) / teamMembers.length
        ).toFixed(1)
      : 0;

  const referralRate =
    totalStats.leads > 0
      ? ((totalStats.referrals / totalStats.leads) * 100).toFixed(1)
      : 0;

  return {
    totalLeads: totalStats.leads,
    totalSales: totalStats.sales,
    totalReferrals: totalStats.referrals,
    totalRevenue: totalStats.revenue,
    avgConversion,
    referralRate,
    members: teamMembers.length,
  };
};

// Utility function to get top non-sale lead types for a team
const getTopNonSaleLeadTypes = (teamName, dateFilter = null, limit = 3) => {
  const teamMembers = mockAgents.filter((agent) => agent.team === teamName);
  const teamLeads = globalLeadsData.filter((lead) =>
    teamMembers.some((member) => member.email === lead.agentEmail)
  );

  let filteredLeads = teamLeads;
  if (dateFilter) {
    const filterDate = new Date(dateFilter);
    filterDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(filterDate);
    nextDay.setDate(nextDay.getDate() + 1);

    filteredLeads = teamLeads.filter((lead) => {
      const leadDate = new Date(lead.timestamp);
      return leadDate >= filterDate && leadDate < nextDay;
    });
  }

  const nonSaleLeadTypes = {};
  const saleTypes = ["Sale", "Dash Sale", "Referral Sale"];
  filteredLeads.forEach((lead) => {
    if (
      !lead.sale &&
      !saleTypes.some(type => lead.leadType?.startsWith(type))
    ) {
      if (!nonSaleLeadTypes[lead.leadType]) {
        nonSaleLeadTypes[lead.leadType] = { count: 0, agents: new Set() };
      }
      nonSaleLeadTypes[lead.leadType].count++;
      nonSaleLeadTypes[lead.leadType].agents.add(lead.agentEmail);
    }
  });

  return Object.entries(nonSaleLeadTypes)
    .map(([type, data]) => ({
      type,
      count: data.count,
      agentCount: data.agents.size,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

// Utility Components
const PieChart = ({ data, colors }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  const segments = data.map((item, index) => {
    const angle = (item.value / total) * 360;
    const percentage = ((item.value / total) * 100).toFixed(1);
    const largeArcFlag = angle > 180 ? 1 : 0;
    const startAngle = (currentAngle * Math.PI) / 180;
    const endAngle = ((currentAngle + angle) * Math.PI) / 180;
    const x1 = 50 + 40 * Math.cos(startAngle);
    const y1 = 50 + 40 * Math.sin(startAngle);
    const x2 = 50 + 40 * Math.cos(endAngle);
    const y2 = 50 + 40 * Math.sin(endAngle);
    currentAngle += angle;
    const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    return {
      path,
      color: colors[index % colors.length],
      label: item.label,
      percentage,
    };
  });

  return (
    <div className="flex items-center gap-6">
      <svg
        width="200"
        height="200"
        viewBox="0 0 100 100"
        className="transform -rotate-90"
      >
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill={segment.color}
            stroke="white"
            strokeWidth="0.5"
          />
        ))}
      </svg>
      <div className="space-y-2">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-sm font-medium text-white">
              {segment.label}
            </span>
            <span className="text-sm text-gray-300">{segment.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mini Pie Chart Component - Compact pie chart for inline display with struggled leads
const MiniPieChart = ({ data, size = 80, showLegend = true }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-xs" style={{ minWidth: size }}>
        No data
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-xs" style={{ minWidth: size }}>
        No struggles
      </div>
    );
  }

  let currentAngle = 0;
  const radius = (size / 2) - 5;
  const centerX = size / 2;
  const centerY = size / 2;

  const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

  const segments = data.map((item, index) => {
    const angle = (item.value / total) * 360;
    const percentage = ((item.value / total) * 100).toFixed(0);
    const largeArcFlag = angle > 180 ? 1 : 0;
    const startAngle = (currentAngle * Math.PI) / 180;
    const endAngle = ((currentAngle + angle) * Math.PI) / 180;
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    currentAngle += angle;
    const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    return {
      path,
      color: colors[index % colors.length],
      label: item.label,
      value: item.value,
      percentage,
    };
  });

  return (
    <div className="flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 flex-shrink-0"
      >
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill={segment.color}
            stroke="#1e293b"
            strokeWidth="1"
          />
        ))}
      </svg>
      {showLegend && (
        <div className="space-y-0.5 text-xs max-w-[120px]">
          {segments.slice(0, 4).map((segment, index) => (
            <div key={index} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-gray-300 truncate" title={segment.label}>
                {segment.label.length > 12 ? segment.label.substring(0, 12) + '...' : segment.label}
              </span>
              <span className="text-gray-400 flex-shrink-0">({segment.percentage}%)</span>
            </div>
          ))}
          {segments.length > 4 && (
            <div className="text-gray-500 text-[10px]">+{segments.length - 4} more</div>
          )}
        </div>
      )}
    </div>
  );
};

// Benchmark Chart Component - Shows hourly sales performance with trend line
const BenchmarkChart = React.memo(({ leads, title = "Sales Benchmark", agentFilter = null }) => {
  // Use state for current time to control updates (update every minute instead of every render)
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const currentHour = currentTime.getHours();
  const currentTimeStr = currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  // Memoize the chart data calculations
  const { benchmarkData, totalSalesToday, avgPerHour, maxValue } = useMemo(() => {
    // Filter leads for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLeads = leads.filter(lead => {
      const leadDate = lead.timestamp instanceof Date ? lead.timestamp : new Date(lead.timestamp);
      const matchesDate = leadDate >= today && leadDate < tomorrow;
      const matchesAgent = !agentFilter || lead.agentEmail === agentFilter || lead.agent === agentFilter;
      return matchesDate && matchesAgent;
    });

    // Group sales by hour (cumulative)
    const hourlyData = [];
    const workHours = [9, 10, 11, 12, 13, 14, 15, 16, 17]; // 9 AM to 5 PM

    workHours.forEach(hour => {
      const hourSales = todayLeads.filter(lead => {
        if (!lead.sale) return false;
        const leadDate = lead.timestamp instanceof Date ? lead.timestamp : new Date(lead.timestamp);
        return leadDate.getHours() <= hour;
      }).length;

      const hourLabel = hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
      const isPast = hour <= currentHour;

      hourlyData.push({
        hour: hourLabel,
        hourNum: hour,
        sales: isPast ? hourSales : null,
        isPast,
      });
    });

    // Calculate historical average (simulated based on current data patterns)
    const totalSales = todayLeads.filter(l => l.sale).length;
    const avgHourly = totalSales > 0 ? totalSales / Math.max(1, currentHour - 8) : 3;

    // Generate benchmark line (expected cumulative sales per hour)
    const chartData = hourlyData.map((d, idx) => {
      const expectedCumulative = Math.round(avgHourly * (idx + 1));
      return {
        ...d,
        benchmark: expectedCumulative,
        avgLine: Math.round(avgHourly * (idx + 1) * 0.9),
      };
    });

    // Find max value for Y axis
    const maxVal = Math.max(
      ...chartData.map(d => Math.max(d.sales || 0, d.benchmark || 0)),
      10
    );

    return { benchmarkData: chartData, totalSalesToday: totalSales, avgPerHour: avgHourly, maxValue: maxVal };
  }, [leads, agentFilter, currentHour]);

  // Memoize static tooltip formatter
  const tooltipFormatter = useCallback((value, name) => {
    if (name === 'sales') return [value, 'Actual Sales'];
    if (name === 'benchmark') return [value, 'Benchmark'];
    return [value, name];
  }, []);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          {title}
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-400">Actual Sales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span className="text-gray-400">Benchmark</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={benchmarkData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="hour"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              domain={[0, Math.ceil(maxValue * 1.2)]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={tooltipFormatter}
            />
            {/* Benchmark trend line */}
            <Line
              type="monotone"
              dataKey="benchmark"
              stroke="#f87171"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
            />
            {/* Actual sales line */}
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Current stats footer */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700">
        <div className="bg-blue-500/20 px-4 py-2 rounded-lg">
          <p className="text-blue-300 text-xs">Current Time</p>
          <p className="text-white font-bold">{currentTimeStr}</p>
        </div>
        <div className="bg-green-500/20 px-4 py-2 rounded-lg">
          <p className="text-green-300 text-xs">Current Sales</p>
          <p className="text-white font-bold">{totalSalesToday}</p>
        </div>
        <div className="bg-purple-500/20 px-4 py-2 rounded-lg">
          <p className="text-purple-300 text-xs">Avg Per Hour</p>
          <p className="text-white font-bold">{avgPerHour.toFixed(1)}</p>
        </div>
        <div className={`px-4 py-2 rounded-lg ${totalSalesToday >= (avgPerHour * (currentHour - 8)) ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
          <p className={`text-xs ${totalSalesToday >= (avgPerHour * (currentHour - 8)) ? 'text-green-300' : 'text-yellow-300'}`}>Status</p>
          <p className="text-white font-bold">
            {totalSalesToday >= (avgPerHour * (currentHour - 8)) ? 'On Track' : 'Behind'}
          </p>
        </div>
      </div>
    </div>
  );
});

// Toast Notification Component
const Toast = ({ message, type = "success", isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500/90 border-green-400/50 text-white";
      case "error":
        return "bg-red-500/90 border-red-400/50 text-white";
      case "info":
        return "bg-blue-500/90 border-blue-400/50 text-white";
      default:
        return "bg-green-500/90 border-green-400/50 text-white";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <AlertTriangle className="w-5 h-5" />;
      case "info":
        return <Bell className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`${getToastStyles()} backdrop-blur-sm rounded-lg border p-4 shadow-lg max-w-sm transform transition-all duration-300`}
      >
        <div className="flex items-center gap-3">
          {getIcon()}
          <span className="font-medium">{message}</span>
          <button
            onClick={onClose}
            className="ml-auto text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Theme Selector Component
const ThemeSelector = ({
  currentTheme,
  onThemeChange,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState(null);

  const handleToggle = (e) => {
    if (!isOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      setButtonRect(rect);
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const DropdownContent = () => (
    <div
      className="fixed bg-slate-900 rounded-xl p-4 shadow-2xl border border-white/20 min-w-[200px]"
      style={{
        top: buttonRect ? buttonRect.bottom + 8 : "60px",
        left: buttonRect ? buttonRect.left : "24px",
        zIndex: 9999,
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm">Dark Mode</span>
          <button
            onClick={() => onToggleDarkMode()}
            className={`w-10 h-6 rounded-full p-1 transition-colors ${
              isDarkMode ? "bg-blue-600" : "bg-gray-400"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                isDarkMode ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        <div className="space-y-2">
          <span className="text-white text-sm">Color Themes</span>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => {
                  onThemeChange(key);
                  setIsOpen(false);
                }}
                className={`h-8 rounded bg-gradient-to-r ${
                  theme.primary
                } border-2 ${
                  currentTheme === key ? "border-white" : "border-transparent"
                } transition-colors hover:scale-105 transform`}
                title={key.charAt(0).toUpperCase() + key.slice(1)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative">
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
        >
          <Palette className="w-4 h-4" />
          <span className="text-sm">Theme</span>
        </button>
      </div>
      {isOpen && (
        <>
          {createPortal(
            <div
              className="fixed inset-0 bg-transparent"
              style={{ zIndex: 9998 }}
              onClick={() => setIsOpen(false)}
            />,
            document.body
          )}
          {createPortal(<DropdownContent />, document.body)}
        </>
      )}
    </>
  );
};

// AI Cat Assistant Component
const AICatAssistant = ({ leads, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePerformance = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const userLeads = leads.filter((lead) => lead.agent === user.uid);
      const totalLeads = userLeads.length;
      const totalSales = userLeads.filter((lead) => lead.sale).length;
      const conversionRate =
        totalLeads > 0 ? ((totalSales / totalLeads) * 100).toFixed(1) : 0;
      const leadTypeBreakdown = {};
      userLeads.forEach((lead) => {
        if (!leadTypeBreakdown[lead.leadType])
          leadTypeBreakdown[lead.leadType] = { total: 0, sales: 0 };
        leadTypeBreakdown[lead.leadType].total++;
        if (lead.sale) leadTypeBreakdown[lead.leadType].sales++;
      });
      const strugglingTypes = Object.entries(leadTypeBreakdown)
        .filter(([, data]) => data.total >= 3 && data.sales / data.total < 0.2)
        .map(([type]) => type);
      setAnalysis({
        totalLeads,
        totalSales,
        conversionRate,
        strugglingTypes,
        recommendation:
          conversionRate < 20
            ? "Focus on qualifying leads better and improving your closing techniques."
            : conversionRate < 30
            ? "Good progress! Work on objection handling to boost your conversion rate."
            : "Excellent work! Keep maintaining your high performance standards.",
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-4 rounded-full shadow-lg transition-all transform hover:scale-110 z-40"
      >
        <Cat className="w-6 h-6 text-white" />
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Cat className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">
                  AI Performance Assistant
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {!analysis && (
              <div className="text-center">
                <p className="text-slate-300 mb-4">
                  Hi! I'm your AI assistant. I can analyze your performance and
                  give you personalized advice.
                </p>
                <button
                  onClick={analyzePerformance}
                  disabled={isAnalyzing}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white disabled:opacity-50"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze My Performance"}
                </button>
              </div>
            )}
            {analysis && (
              <div className="space-y-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Your Stats</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-400">Total Leads:</span>
                      <span className="text-white ml-2">
                        {analysis.totalLeads}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Total Sales:</span>
                      <span className="text-white ml-2">
                        {analysis.totalSales}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400">Conversion Rate:</span>
                      <span className="text-white ml-2">
                        {analysis.conversionRate}%
                      </span>
                    </div>
                  </div>
                </div>
                {analysis.strugglingTypes.length > 0 && (
                  <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
                    <h4 className="text-red-400 font-medium mb-2">
                      Areas to Focus On
                    </h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      {analysis.strugglingTypes.map((type) => (
                        <li key={type}>• {type} leads need attention</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">
                    Recommendation
                  </h4>
                  <p className="text-sm text-slate-300">
                    {analysis.recommendation}
                  </p>
                </div>
                <button
                  onClick={() => setAnalysis(null)}
                  className="w-full bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white"
                >
                  Analyze Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Manager AI Cat Assistant Component
const ManagerAICatAssistant = ({ leads, agents, mode = "team" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMode, setAnalysisMode] = useState(mode);
  const [dateFilterType, setDateFilterType] = useState("thisWeek");

  // Get date range based on filter type
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateFilterType) {
      case "today": {
        const endOfDay = new Date(today.getTime() + 86400000);
        return { startDate: today, endDate: endOfDay, label: "Today" };
      }
      case "thisWeek": {
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today.getTime() - dayOfWeek * 86400000);
        const endOfWeek = new Date(startOfWeek.getTime() + 7 * 86400000);
        return { startDate: startOfWeek, endDate: endOfWeek, label: "This Week" };
      }
      case "thisMonth": {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return { startDate: startOfMonth, endDate: endOfMonth, label: "This Month" };
      }
      case "allTime":
      default:
        return { startDate: new Date(0), endDate: new Date(Date.now() + 86400000), label: "All Time" };
    }
  };

  // Filter leads by date range
  const getFilteredLeads = () => {
    const { startDate, endDate } = getDateRange();
    return (leads || []).filter(lead => {
      const leadDate = lead.timestamp instanceof Date ? lead.timestamp : new Date(lead.timestamp);
      return leadDate >= startDate && leadDate < endDate;
    });
  };

  const analyzeTeamPerformance = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const allLeads = getFilteredLeads();
      const totalLeads = allLeads.length;
      const totalSales = allLeads.filter((lead) => lead.sale).length;
      const conversionRate =
        totalLeads > 0 ? ((totalSales / totalLeads) * 100).toFixed(1) : 0;

      // Analyze lead type distribution
      const leadTypeBreakdown = {};
      allLeads.forEach((lead) => {
        const type = lead.leadType?.split(" - ")[0] || lead.leadType || "Unknown";
        if (!leadTypeBreakdown[type]) leadTypeBreakdown[type] = { total: 0, sales: 0 };
        leadTypeBreakdown[type].total++;
        if (lead.sale) leadTypeBreakdown[type].sales++;
      });

      // Count total non-sale lead types for percentage calculation
      const totalNonSaleLeads = Object.entries(leadTypeBreakdown)
        .filter(([type]) => !type.includes("Sale"))
        .reduce((sum, [, data]) => sum + data.total, 0);

      // Find top struggling lead types (high volume, low conversion)
      // Show % of total leads instead of conversion %
      const strugglingTypes = Object.entries(leadTypeBreakdown)
        .filter(([type, data]) => {
          const isSaleType = type.includes("Sale");
          return !isSaleType && data.total >= 3 && (data.sales / data.total) < 0.25;
        })
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5)
        .map(([type, data]) => ({
          type,
          count: data.total,
          nonSales: data.total - data.sales,
          // Show what % of total leads this type makes up
          percentOfTotal: totalNonSaleLeads > 0 ? ((data.total / totalNonSaleLeads) * 100).toFixed(1) : "0.0"
        }));

      // Analyze agent performance
      const agentPerformance = {};
      allLeads.forEach((lead) => {
        const agentId = lead.agentEmail || lead.agent;
        if (!agentPerformance[agentId]) agentPerformance[agentId] = { leads: 0, sales: 0 };
        agentPerformance[agentId].leads++;
        if (lead.sale) agentPerformance[agentId].sales++;
      });

      const agentCount = Object.keys(agentPerformance).length;
      const avgLeadsPerAgent = agentCount > 0 ? Math.round(totalLeads / agentCount) : 0;

      // Find struggling agents (below average conversion)
      const strugglingAgents = Object.entries(agentPerformance)
        .filter(([, data]) => {
          const conv = data.leads > 0 ? (data.sales / data.leads) * 100 : 0;
          return data.leads >= 5 && conv < parseFloat(conversionRate) * 0.7;
        })
        .length;

      const { label: dateLabel } = getDateRange();
      setAnalysis({
        totalLeads,
        totalSales,
        conversionRate,
        agentCount,
        avgLeadsPerAgent,
        strugglingTypes,
        strugglingAgents,
        dateLabel,
        recommendation:
          parseFloat(conversionRate) < 20
            ? "Team conversion is low. Consider additional training sessions focused on objection handling and closing techniques."
            : parseFloat(conversionRate) < 30
            ? "Team is performing reasonably well. Focus on coaching agents who are below the team average."
            : "Excellent team performance! Identify top performers and have them share best practices with the team.",
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-4 rounded-full shadow-lg transition-all transform hover:scale-110 z-40"
      >
        <Cat className="w-6 h-6 text-white" />
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Cat className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">
                  AI Performance Assistant
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {!analysis && (
              <div className="text-center">
                <p className="text-slate-300 mb-4">
                  Hi! I'm your AI assistant. I can analyze your team's performance
                  and provide insights on areas that need attention.
                </p>
                <div className="flex gap-2 justify-center mb-4">
                  <button
                    onClick={() => setAnalysisMode("team")}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      analysisMode === "team"
                        ? "bg-purple-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    My Team
                  </button>
                  <button
                    onClick={() => setAnalysisMode("all")}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      analysisMode === "all"
                        ? "bg-purple-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    All Agents
                  </button>
                </div>
                <div className="mb-4">
                  <label className="text-slate-400 text-sm block mb-2">Date Range</label>
                  <select
                    value={dateFilterType}
                    onChange={(e) => setDateFilterType(e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    <option value="today">Today</option>
                    <option value="thisWeek">This Week</option>
                    <option value="thisMonth">This Month</option>
                    <option value="allTime">All Time</option>
                  </select>
                </div>
                <button
                  onClick={analyzeTeamPerformance}
                  disabled={isAnalyzing}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white disabled:opacity-50"
                >
                  {isAnalyzing ? "Analyzing..." : `Analyze ${analysisMode === "team" ? "Team" : "All Agents"}`}
                </button>
              </div>
            )}
            {analysis && (
              <div className="space-y-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-white font-medium">Overview Stats</h4>
                    <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded">{analysis.dateLabel}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-400">Total Leads:</span>
                      <span className="text-white ml-2">{analysis.totalLeads}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Total Sales:</span>
                      <span className="text-white ml-2">{analysis.totalSales}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Conversion Rate:</span>
                      <span className="text-white ml-2">{analysis.conversionRate}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Active Agents:</span>
                      <span className="text-white ml-2">{analysis.agentCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Avg Leads/Agent:</span>
                      <span className="text-white ml-2">{analysis.avgLeadsPerAgent}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Struggling Agents:</span>
                      <span className="text-red-400 ml-2">{analysis.strugglingAgents}</span>
                    </div>
                  </div>
                </div>

                {analysis.strugglingTypes.length > 0 && (
                  <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
                    <h4 className="text-red-400 font-medium mb-2">
                      Top Lead Types Needing Attention
                    </h4>
                    <p className="text-slate-400 text-xs mb-2">Showing what % of total leads each type represents</p>
                    <div className="space-y-2 text-sm">
                      {analysis.strugglingTypes.map((item) => (
                        <div key={item.type} className="flex justify-between items-center">
                          <span className="text-slate-300">{item.type}</span>
                          <div className="flex gap-4">
                            <span className="text-slate-400">{item.count} leads</span>
                            <span className="text-yellow-400">{item.percentOfTotal}% of total</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">Recommendation</h4>
                  <p className="text-sm text-slate-300">{analysis.recommendation}</p>
                </div>

                <button
                  onClick={() => setAnalysis(null)}
                  className="w-full bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white"
                >
                  Analyze Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Enhanced PvP Challenge System
const PvPChallenges = ({ user }) => {
  const [challenges, setChallenges] = useState([]);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    opponent: "",
    type: "sales",
    goal: 10,
    wager: 50,
    duration: "1day",
  });

  const createChallenge = () => {
    const challenge = {
      id: Date.now(),
      challenger: user.name,
      opponent: newChallenge.opponent,
      type: newChallenge.type,
      goal: newChallenge.goal,
      wager: newChallenge.wager,
      duration: newChallenge.duration,
      status: "pending",
      createdAt: new Date(),
    };
    setChallenges([challenge, ...challenges]);
    setNewChallenge({
      opponent: "",
      type: "sales",
      goal: 10,
      wager: 50,
      duration: "1day",
    });
    setShowCreateChallenge(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl">
              <Sword className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                PvP Challenges
              </h3>
              <p className="text-gray-300">Compete with other agents</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateChallenge(!showCreateChallenge)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-4 py-2 rounded-lg text-white font-medium transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Challenge
          </button>
        </div>
        {showCreateChallenge && (
          <div className="bg-black/30 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newChallenge.opponent}
                onChange={(e) =>
                  setNewChallenge((prev) => ({
                    ...prev,
                    opponent: e.target.value,
                  }))
                }
                className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
              >
                <option value="" className="bg-slate-800">
                  Select Opponent
                </option>
                {mockAgents
                  .filter((agent) => agent.email !== user.email)
                  .map((agent) => (
                    <option
                      key={agent.id}
                      value={agent.name}
                      className="bg-slate-800"
                    >
                      {agent.name}
                    </option>
                  ))}
              </select>
              <select
                value={newChallenge.type}
                onChange={(e) =>
                  setNewChallenge((prev) => ({ ...prev, type: e.target.value }))
                }
                className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
              >
                <option value="sales">Most Sales</option>
                <option value="conversion">Best Conversion Rate</option>
                <option value="referrals">Most Referrals</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={createChallenge}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
              >
                Send Challenge
              </button>
              <button
                onClick={() => setShowCreateChallenge(false)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="grid gap-4">
        {challenges.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
            <Sword className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">
              No challenges yet. Create one to compete with other agents!
            </p>
          </div>
        ) : (
          challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-white">
                    {challenge.challenger === user.name
                      ? "You"
                      : challenge.challenger}{" "}
                    vs {challenge.opponent}
                  </p>
                  <p className="text-sm text-gray-300">
                    {challenge.type} challenge - Goal: {challenge.goal} - Wager:
                    ${challenge.wager}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    challenge.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : challenge.status === "active"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {challenge.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Enhanced Leaderboards
const Leaderboards = ({ leads = [] }) => {
  const boards = [
    {
      key: "sales",
      label: "Sales Leaders",
      icon: Trophy,
      color: "from-yellow-500 to-orange-500",
    },
    {
      key: "conversion",
      label: "Conversion Masters",
      icon: Target,
      color: "from-green-500 to-emerald-500",
    },
    {
      key: "referrals",
      label: "Referral Champions",
      icon: UserPlus,
      color: "from-purple-500 to-pink-500",
    },
  ];

  // Derive agents and their stats from Firebase leads
  const getAgentsFromLeads = () => {
    const agentMap = new Map();

    leads.forEach((lead) => {
      const agentId = lead.agent;
      const agentEmail = lead.agentEmail || lead.agent;
      const agentName = lead.agentName || (agentEmail.includes('@') ? agentEmail.split('@')[0] : agentEmail);

      if (!agentMap.has(agentId)) {
        agentMap.set(agentId, {
          id: agentId,
          email: agentEmail,
          name: agentName,
          center: lead.center || 'unknown',
          leads: 0,
          sales: 0,
          referrals: 0,
          revenue: 0,
        });
      }

      const agent = agentMap.get(agentId);
      // Count non-Dash Sale leads
      if (!lead.leadType?.startsWith("Dash Sale")) {
        agent.leads++;
      }
      if (lead.sale) {
        agent.sales++;
        agent.revenue += (lead.commission || 115) + (lead.hra ? lead.hraValue || 15 : 0);
      }
      if (lead.leadType?.startsWith("Referral Sale")) {
        agent.referrals++;
      }
    });

    // Calculate conversion rates
    return Array.from(agentMap.values()).map(agent => ({
      ...agent,
      conversionRate: agent.leads > 0 ? ((agent.sales / agent.leads) * 100).toFixed(1) : "0.0",
    }));
  };

  const allAgents = getAgentsFromLeads();

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-xl">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Sales Leaders</h3>
            <p className="text-gray-300">Top performing agents</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {boards.map((board) => {
          const boardAgents = (() => {
            let agents = [...allAgents];
            switch (board.key) {
              case "sales":
                return agents.sort((a, b) => b.sales - a.sales);
              case "conversion":
                return agents.sort(
                  (a, b) =>
                    parseFloat(b.conversionRate) - parseFloat(a.conversionRate)
                );
              case "referrals":
                return agents.sort((a, b) => b.referrals - a.referrals);
              default:
                return agents;
            }
          })();
          return (
            <div
              key={board.key}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <board.icon className="w-5 h-5 text-white" />
                <h4 className="text-lg font-semibold text-white">
                  {board.label}
                </h4>
              </div>
              <div className="space-y-3">
                {boardAgents.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No data yet</p>
                ) : boardAgents.slice(0, 5).map((agent, index) => {
                  const profileColors = [
                    "bg-red-500",
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-purple-500",
                    "bg-pink-500",
                  ];
                  const medalColors = [
                    "bg-gradient-to-r from-yellow-400 to-yellow-600",
                    "bg-gradient-to-r from-gray-300 to-gray-500",
                    "bg-gradient-to-r from-orange-400 to-orange-600",
                    "bg-slate-600",
                    "bg-slate-600",
                  ];
                  return (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${medalColors[index]}`}
                        >
                          {index + 1}
                        </div>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${profileColors[index]}`}
                        >
                          {agent.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <span className="font-medium text-white">
                            {agent.name}
                          </span>
                          <div className="text-xs text-gray-400 uppercase">
                            {agent.center}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {board.key === "sales" && (
                          <span className="text-white font-bold">
                            {agent.sales}
                          </span>
                        )}
                        {board.key === "conversion" && (
                          <span className="text-white font-bold">
                            {agent.conversionRate}%
                          </span>
                        )}
                        {board.key === "referrals" && (
                          <span className="text-white font-bold">
                            {agent.referrals}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Enhanced Five9 Dashboard
const Five9Dashboard = ({ user }) => {
  const userData = mockFive9Data[user.email] || {
    acw: 0,
    pers: 0,
    ie: 0,
    ob: 0,
    forced: 0,
    absences: 0,
    nrt: 0,
    calls: 0,
    sma: 0,
    talkTime: 0,
  };
  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-xl">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">
              Five9 Analytics
            </h3>
            <p className="text-gray-300">Real-time adherence and call data</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-gray-300 text-sm">Current Status</p>
            <p className="text-lg font-bold text-green-400">Available</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-gray-300 text-sm">NRT</p>
            <p className="text-lg font-bold text-blue-400">{userData.nrt}%</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-gray-300 text-sm">Total Calls</p>
            <p className="text-lg font-bold text-purple-400">
              {userData.calls}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-gray-300 text-sm">SMA</p>
            <p className="text-lg font-bold text-yellow-400">{userData.sma}</p>
          </div>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h4 className="text-lg font-semibold text-white mb-4">
          Time Distribution
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-500/20 rounded-lg p-4 text-center border border-red-500/30">
            <p className="text-red-300 text-sm">ACW</p>
            <p className="text-xl font-bold text-red-400">{userData.acw}%</p>
          </div>
          <div className="bg-yellow-500/20 rounded-lg p-4 text-center border border-yellow-500/30">
            <p className="text-yellow-300 text-sm">Personal</p>
            <p className="text-xl font-bold text-yellow-400">
              {userData.pers}%
            </p>
          </div>
          <div className="bg-blue-500/20 rounded-lg p-4 text-center border border-blue-500/30">
            <p className="text-blue-300 text-sm">Inbound</p>
            <p className="text-xl font-bold text-blue-400">{userData.ie}%</p>
          </div>
          <div className="bg-purple-500/20 rounded-lg p-4 text-center border border-purple-500/30">
            <p className="text-purple-300 text-sm">Outbound</p>
            <p className="text-xl font-bold text-purple-400">{userData.ob}%</p>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">Ready Time</span>
            <span className="text-white font-bold">{userData.nrt}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${userData.nrt}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Supervisor Help Component
const SupervisorHelp = ({ user }) => {
  const [activeForm, setActiveForm] = useState(null);
  const [requests, setRequests] = useState([]);
  const [callReviewForm, setCallReviewForm] = useState({
    crmLink: "",
    reason: "",
    reviewDate: "",
  });
  const [phoneAssistForm, setPhoneAssistForm] = useState({
    supervisor: "",
    requestDate: "",
    duration: "30",
    reason: "",
  });
  const supervisors = [];

  const submitCallReview = () => {
    const request = {
      id: Date.now(),
      type: "call_review",
      agent: user.name,
      agentEmail: user.email,
      ...callReviewForm,
      status: "pending",
      createdAt: new Date(),
    };
    setRequests([request, ...requests]);
    globalSupervisorRequests = [
      ...globalSupervisorRequests.filter((r) => r.id !== request.id),
      request,
    ];
    setCallReviewForm({ crmLink: "", reason: "", reviewDate: "" });
    setActiveForm(null);
  };

  const submitPhoneAssist = () => {
    const request = {
      id: Date.now(),
      type: "phone_assist",
      agent: user.name,
      agentEmail: user.email,
      ...phoneAssistForm,
      status: "pending",
      createdAt: new Date(),
    };
    setRequests([request, ...requests]);
    globalSupervisorRequests = [
      ...globalSupervisorRequests.filter((r) => r.id !== request.id),
      request,
    ];
    setPhoneAssistForm({
      supervisor: "",
      requestDate: "",
      duration: "30",
      reason: "",
    });
    setActiveForm(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">
              Supervisor Help
            </h3>
            <p className="text-gray-300">Request assistance and call reviews</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setActiveForm("call_review")}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 py-3 rounded-lg text-white font-medium transition-all flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Call Review
          </button>
          <button
            onClick={() => setActiveForm("phone_assist")}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-4 py-3 rounded-lg text-white font-medium transition-all flex items-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Phone Assistance
          </button>
        </div>
      </div>
      {activeForm === "call_review" && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h4 className="text-white font-medium mb-4">Request Call Review</h4>
          <div className="space-y-4">
            <input
              type="url"
              placeholder="CRM Link"
              value={callReviewForm.crmLink}
              onChange={(e) =>
                setCallReviewForm((prev) => ({
                  ...prev,
                  crmLink: e.target.value,
                }))
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
            />
            <textarea
              placeholder="Reason for review"
              value={callReviewForm.reason}
              onChange={(e) =>
                setCallReviewForm((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 h-20 resize-none"
            />
            <input
              type="date"
              value={callReviewForm.reviewDate}
              onChange={(e) =>
                setCallReviewForm((prev) => ({
                  ...prev,
                  reviewDate: e.target.value,
                }))
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={submitCallReview}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white"
              >
                Submit Request
              </button>
              <button
                onClick={() => setActiveForm(null)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {activeForm === "phone_assist" && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h4 className="text-white font-medium mb-4">
            Request Phone Assistance
          </h4>
          <div className="space-y-4">
            <select
              value={phoneAssistForm.supervisor}
              onChange={(e) =>
                setPhoneAssistForm((prev) => ({
                  ...prev,
                  supervisor: e.target.value,
                }))
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Choose Supervisor</option>
              {supervisors.map((sup) => (
                <option key={sup} value={sup}>
                  {sup}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={phoneAssistForm.requestDate}
              onChange={(e) =>
                setPhoneAssistForm((prev) => ({
                  ...prev,
                  requestDate: e.target.value,
                }))
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            />
            <select
              value={phoneAssistForm.duration}
              onChange={(e) =>
                setPhoneAssistForm((prev) => ({
                  ...prev,
                  duration: e.target.value,
                }))
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="240">Half day</option>
            </select>
            <textarea
              placeholder="Reason for assistance"
              value={phoneAssistForm.reason}
              onChange={(e) =>
                setPhoneAssistForm((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 h-20 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={submitPhoneAssist}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white"
              >
                Submit Request
              </button>
              <button
                onClick={() => setActiveForm(null)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h4 className="font-medium text-white mb-4">Recent Requests</h4>
        {requests.length === 0 ? (
          <p className="text-gray-300 text-sm">No requests submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 3).map((request) => (
              <div key={request.id} className="bg-white/5 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white">
                    {request.type === "call_review"
                      ? "Call Review"
                      : "Phone Assistance"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      request.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : request.status === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-1">
                  {request.type === "call_review"
                    ? request.reason
                    : `${request.duration} min with ${request.supervisor}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Analytics Dashboard with proper filtering and individual client entries
const AnalyticsDashboard = ({ leads, user, theme }) => {
  const [dateFilter, setDateFilter] = useState("today");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [leadTypeFilter, setLeadTypeFilter] = useState("all");

  const getFilteredLeads = () => {
    const userLeads = leads.filter((lead) => lead.agent === user.uid);
    const now = new Date();
    let filteredByDate = userLeads;

    switch (dateFilter) {
      case "today":
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        filteredByDate = userLeads.filter((lead) => {
          const leadDate = new Date(lead.timestamp);
          return leadDate >= todayStart && leadDate <= todayEnd;
        });
        break;
      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(now);
        weekEnd.setHours(23, 59, 59, 999);
        filteredByDate = userLeads.filter((lead) => {
          const leadDate = new Date(lead.timestamp);
          return leadDate >= weekStart && leadDate <= weekEnd;
        });
        break;
      case "month":
        const monthStart = new Date(now);
        monthStart.setMonth(now.getMonth() - 1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(now);
        monthEnd.setHours(23, 59, 59, 999);
        filteredByDate = userLeads.filter((lead) => {
          const leadDate = new Date(lead.timestamp);
          return leadDate >= monthStart && leadDate <= monthEnd;
        });
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          filteredByDate = userLeads.filter((lead) => {
            const leadDate = new Date(lead.timestamp);
            return leadDate >= start && leadDate <= end;
          });
        }
        break;
      default:
        filteredByDate = userLeads;
    }
    return filteredByDate;
  };

  const filteredLeads = getFilteredLeads();
  const sales = filteredLeads.filter((lead) => lead.sale);
  const referrals = filteredLeads.filter(
    (lead) => lead.leadType?.startsWith("Referral Sale")
  );

  const metrics = {
    totalLeads: filteredLeads.length,
    totalSales: sales.length,
    totalReferrals: referrals.length,
    conversionRate:
      filteredLeads.length > 0
        ? ((sales.length / filteredLeads.length) * 100).toFixed(1)
        : 0,
    referralRate:
      filteredLeads.length > 0
        ? ((referrals.length / filteredLeads.length) * 100).toFixed(1)
        : 0,
    totalRevenue: sales.reduce(
      (sum, lead) =>
        sum + (lead.commission || 115) + (lead.hra ? lead.hraValue || 15 : 0),
      0
    ),
  };

  const leadTypeBreakdown = filteredLeads.reduce((acc, lead) => {
    const type = lead.leadType;
    if (!acc[type]) acc[type] = { total: 0, sales: 0, rate: 0, leads: [] };
    acc[type].total++;
    acc[type].leads.push(lead);
    if (lead.sale) acc[type].sales++;
    return acc;
  }, {});

  Object.values(leadTypeBreakdown).forEach((data) => {
    data.rate =
      data.total > 0 ? ((data.sales / data.total) * 100).toFixed(1) : 0;
  });

  const pieChartData = Object.entries(leadTypeBreakdown)
    .filter(([, data]) => data.total > 0)
    .map(([type, data]) => ({ label: type, value: data.total }));
  const pieChartColors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];
  const uniqueLeadTypes = [
    ...new Set(filteredLeads.map((lead) => lead.leadType)),
  ];

  const getIndividualEntries = () => {
    let entries = filteredLeads;
    if (leadTypeFilter !== "all")
      entries = entries.filter((lead) => lead.leadType === leadTypeFilter);
    return entries.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  };

  const individualEntries = getIndividualEntries();
  const allUserLeads = leads.filter((lead) => lead.agent === user.uid);

  const getProjectedSales = () => {
    const now = new Date();
    const periods = {
      day: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      week: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay()
      ),
      month: new Date(now.getFullYear(), now.getMonth(), 1),
      year: new Date(now.getFullYear(), 0, 1),
    };
    const salesCounts = Object.keys(periods).reduce((acc, period) => {
      acc[period] = allUserLeads.filter(
        (lead) => lead.sale && new Date(lead.timestamp) >= periods[period]
      ).length;
      return acc;
    }, {});
    const progressCalculations = {
      day: now.getHours() / 24,
      week: (now.getDay() + now.getHours() / 24) / 7,
      month:
        now.getDate() /
        new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
      year:
        Math.floor((now - periods.year) / (24 * 60 * 60 * 1000)) /
        (new Date(now.getFullYear(), 11, 31).getDate() === 31 ? 365 : 366),
    };
    return Object.keys(periods).reduce((acc, period) => {
      const current = salesCounts[period];
      const progress = progressCalculations[period];
      const projected = progress > 0 ? Math.round(current / progress) : current;
      acc[period] = { current, projected, revenue: projected * 115 };
      return acc;
    }, {});
  };

  const projectedSales = getProjectedSales();

  return (
    <div className="space-y-6">
      <div
        className={`${themes[theme].card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
      >
        <h3 className="text-xl font-semibold mb-4 text-white">
          Analytics Dashboard
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time Period
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="today" className="bg-slate-800">
                Today
              </option>
              <option value="week" className="bg-slate-800">
                Last 7 Days
              </option>
              <option value="month" className="bg-slate-800">
                Last 30 Days
              </option>
              <option value="custom" className="bg-slate-800">
                Custom Range
              </option>
            </select>
            {dateFilter === "custom" && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                />
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: "Total Leads",
            value: metrics.totalLeads,
            color: "text-cyan-400",
          },
          {
            label: "Total Sales",
            value: metrics.totalSales,
            color: "text-green-400",
          },
          {
            label: "Conversion Rate",
            value: `${metrics.conversionRate}%`,
            color: "text-blue-400",
          },
          {
            label: "Revenue",
            value: `$${metrics.totalRevenue}`,
            color: "text-yellow-400",
          },
          {
            label: "Referral Rate",
            value: `${metrics.referralRate}%`,
            color: "text-purple-400",
          },
          {
            label: "Referrals",
            value: metrics.totalReferrals,
            color: "text-pink-400",
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className={`${themes[theme].card} backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center`}
          >
            <p className="text-gray-300 text-sm">{metric.label}</p>
            <p className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className={`${themes[theme].card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">
              Sales Projections
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">
                Today ({projectedSales.day.current} so far):
              </span>
              <div className="text-right">
                <span className="text-green-400 font-bold">
                  {projectedSales.day.projected} sales
                </span>
                <p className="text-xs text-gray-400">
                  ${projectedSales.day.revenue.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">
                This Week ({projectedSales.week.current} so far):
              </span>
              <div className="text-right">
                <span className="text-green-400 font-bold">
                  {projectedSales.week.projected} sales
                </span>
                <p className="text-xs text-gray-400">
                  ${projectedSales.week.revenue.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">
                This Month ({projectedSales.month.current} so far):
              </span>
              <div className="text-right">
                <span className="text-green-400 font-bold">
                  {projectedSales.month.projected} sales
                </span>
                <p className="text-xs text-gray-400">
                  ${projectedSales.month.revenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`${themes[theme].card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
        >
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">
              Annual Projection
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">
                This Year ({projectedSales.year.current} so far):
              </span>
              <div className="text-right">
                <span className="text-yellow-400 font-bold">
                  {projectedSales.year.projected} sales
                </span>
                <p className="text-xs text-gray-400">
                  ${projectedSales.year.revenue.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="bg-yellow-500/10 rounded-lg p-3">
              <p className="text-yellow-400 text-sm font-medium">
                Annual Revenue Projection
              </p>
              <p className="text-white text-xl font-bold">
                ${projectedSales.year.revenue.toLocaleString()}
              </p>
              <p className="text-gray-300 text-xs">
                Based on current performance
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={`${themes[theme].card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Top 3 Lead Types
          </h3>
          <div className="space-y-4">
            {Object.entries(leadTypeBreakdown)
              .filter(([type]) => !["Sale", "Dash Sale", "Referral Sale"].some(saleType => type?.startsWith(saleType)))
              .sort(([, a], [, b]) => b.total - a.total)
              .slice(0, 3)
              .map(([type, data], index) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : "bg-orange-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{type}</p>
                      <p className="text-sm text-gray-300">
                        {data.total} leads
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{data.rate}%</p>
                    <p className="text-sm text-gray-300">{data.sales} sales</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div
          className={`${themes[theme].card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Lead Type Distribution
          </h3>
          {pieChartData.length > 0 ? (
            <div className="flex justify-center">
              <PieChart data={pieChartData} colors={pieChartColors} />
            </div>
          ) : (
            <p className="text-center text-gray-300 py-8">
              No data available for selected period
            </p>
          )}
        </div>
      </div>
      <div
        className={`${themes[theme].card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">
            Individual Lead Entries
          </h3>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={leadTypeFilter}
              onChange={(e) => setLeadTypeFilter(e.target.value)}
              className="bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">All Lead Types</option>
              {uniqueLeadTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-gray-300">Date</th>
                <th className="text-left py-3 px-4 text-gray-300">Lead Type</th>
                <th className="text-left py-3 px-4 text-gray-300">Client</th>
                <th className="text-left py-3 px-4 text-gray-300">Carrier</th>
                <th className="text-left py-3 px-4 text-gray-300">Sale</th>
                <th className="text-left py-3 px-4 text-gray-300">Revenue</th>
                <th className="text-left py-3 px-4 text-gray-300">CRM</th>
                <th className="text-left py-3 px-4 text-gray-300">Notes</th>
              </tr>
            </thead>
            <tbody>
              {individualEntries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-300">
                    No entries found for the selected criteria
                  </td>
                </tr>
              ) : (
                individualEntries.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="py-3 px-4 text-white">
                      {new Date(lead.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {lead.leadType}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {lead.clientName || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {lead.carrier || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          lead.sale
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {lead.sale ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white">
                      {lead.sale
                        ? `$${
                            (lead.commission || 115) +
                            (lead.hra ? lead.hraValue || 15 : 0)
                          }`
                        : "$0"}
                    </td>
                    <td className="py-3 px-4">
                      {lead.crmLink ? (
                        <a
                          href={lead.crmLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                          title="Open CRM Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td
                      className="py-3 px-4 text-white max-w-xs truncate"
                      title={lead.notes}
                    >
                      {lead.notes || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div
        className={`${themes[theme].card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
      >
        <h3 className="text-xl font-semibold mb-4 text-white">
          Detailed Lead Analysis
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-gray-300">Lead Type</th>
                <th className="text-left py-3 px-4 text-gray-300">Total</th>
                <th className="text-left py-3 px-4 text-gray-300">Sales</th>
                <th className="text-left py-3 px-4 text-gray-300">
                  Conversion Rate
                </th>
                <th className="text-left py-3 px-4 text-gray-300">CRMs</th>
                <th className="text-left py-3 px-4 text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(leadTypeBreakdown)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([type, data]) => (
                  <tr
                    key={type}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="py-3 px-4 font-medium text-white">{type}</td>
                    <td className="py-3 px-4 text-white">{data.total}</td>
                    <td className="py-3 px-4 text-white">{data.sales}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          parseFloat(data.rate) >= 30
                            ? "text-green-400"
                            : parseFloat(data.rate) >= 20
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {data.rate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white">
                      <div className="flex gap-1">
                        {data.leads.slice(0, 3).map((lead, idx) => (
                          <a
                            key={idx}
                            href={lead.crmLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                            title={`CRM Link ${idx + 1}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ))}
                        {data.leads.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{data.leads.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {parseFloat(data.rate) >= 30 ? (
                        <span className="text-green-400">Great</span>
                      ) : parseFloat(data.rate) >= 20 ? (
                        <span className="text-yellow-400">Good</span>
                      ) : data.total >= 3 ? (
                        <span className="text-red-400">Focus Area</span>
                      ) : (
                        <span className="text-gray-400">More Data Needed</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Agent Dashboard View Component for Manager
const AgentDashboardView = ({ agent, onBack, user, leads = [] }) => {
  const [dateFilterType, setDateFilterType] = useState("today");
  const [customStartDate, setCustomStartDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [editingGoal, setEditingGoal] = useState(false);
  const [monthlyGoal, setMonthlyGoal] = useState(120);

  // Filter leads for this specific agent
  const agentLeads = leads.filter(
    (lead) => lead.agentEmail === agent.email || lead.agent === agent.id
  );

  // Get date range based on filter type
  const getDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilterType) {
      case "today": {
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
        return { startDate: today, endDate };
      }
      case "this_week": {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        return { startDate: startOfWeek, endDate: endOfWeek };
      }
      case "this_month": {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return { startDate: startOfMonth, endDate: endOfMonth };
      }
      case "custom": {
        const [startYear, startMonth, startDay] = customStartDate.split("-").map(Number);
        const [endYear, endMonth, endDay] = customEndDate.split("-").map(Number);
        const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
        const endDate = new Date(endYear, endMonth - 1, endDay + 1, 0, 0, 0, 0);
        return { startDate, endDate };
      }
      default:
        return { startDate: today, endDate: new Date(today.getTime() + 86400000) };
    }
  };

  // Calculate agent stats from the leads based on date range
  const getAgentStats = () => {
    const { startDate, endDate } = getDateRange();

    const filteredLeads = agentLeads.filter(lead => {
      const leadDate = lead.timestamp instanceof Date ? lead.timestamp : new Date(lead.timestamp);
      return leadDate >= startDate && leadDate < endDate;
    });

    const sales = filteredLeads.filter(lead => lead.sale);
    const referrals = filteredLeads.filter(lead => lead.leadType?.startsWith("Referral Sale"));
    const dashSales = filteredLeads.filter(lead => lead.leadType?.startsWith("Dash Sale"));

    return {
      leads: filteredLeads.length,
      sales: sales.length,
      conversionRate: filteredLeads.length > 0 ? ((sales.length / filteredLeads.length) * 100).toFixed(1) : "0.0",
      referrals: referrals.length,
      dashSales: dashSales.length,
      revenue: sales.reduce((sum, lead) => sum + (lead.commission || 115) + (lead.hra ? (lead.hraValue || 15) : 0), 0),
    };
  };

  const agentStats = getAgentStats();
  const { startDate, endDate } = getDateRange();
  const selectedDateLeads = agentLeads.filter((lead) => {
    const leadDate = lead.timestamp instanceof Date ? lead.timestamp : new Date(lead.timestamp);
    return leadDate >= startDate && leadDate < endDate;
  });

  const getThermostatProgress = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlySales = agentLeads.filter((lead) => {
      if (!lead.sale) return false;
      const leadDate = new Date(lead.timestamp);
      return (
        leadDate.getMonth() === currentMonth &&
        leadDate.getFullYear() === currentYear
      );
    }).length;
    const monthlyRevenue = agentLeads.reduce((sum, lead) => {
      if (!lead.sale) return sum;
      const leadDate = new Date(lead.timestamp);
      if (
        leadDate.getMonth() === currentMonth &&
        leadDate.getFullYear() === currentYear
      ) {
        return (
          sum + (lead.commission || 115) + (lead.hra ? lead.hraValue || 15 : 0)
        );
      }
      return sum;
    }, 0);
    const progress = Math.min((monthlySales / monthlyGoal) * 100, 100);
    return { monthlySales, monthlyRevenue, progress };
  };

  const thermostat = getThermostatProgress();
  const goals = globalAgentGoals[agent.email] || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-2xl font-bold">{agent.name}'s Dashboard</h1>
                <p className="text-gray-300">
                  {agent.team} • {agent.center?.toUpperCase() || "N/A"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-300">Goals Set By: {user.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Date Filter Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-300">Filter by:</span>
              <select
                value={dateFilterType}
                onChange={(e) => setDateFilterType(e.target.value)}
                className="bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
              {dateFilterType === "custom" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-slate-800 border border-white/20 rounded-lg px-2 py-2 text-white text-sm"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-slate-800 border border-white/20 rounded-lg px-2 py-2 text-white text-sm"
                  />
                </div>
              )}
            </div>
            <div className="text-gray-300 text-sm">
              Showing data for:{" "}
              <span className="text-white font-medium">
                {dateFilterType === "today" && "Today"}
                {dateFilterType === "this_week" && "This Week"}
                {dateFilterType === "this_month" && "This Month"}
                {dateFilterType === "custom" && `${customStartDate} to ${customEndDate}`}
              </span>
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
          <h3 className="text-xl font-semibold mb-4">Performance Goals</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-300 text-sm">Daily Sales Goal</p>
              <p className="text-2xl font-bold text-white">
                {goals.dailySales || 10}
              </p>
              <p className="text-xs text-gray-400">
                Current: {agentStats.sales}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm">Weekly Sales Goal</p>
              <p className="text-2xl font-bold text-white">
                {goals.weeklySales || 50}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm">Conversion Goal</p>
              <p className="text-2xl font-bold text-white">
                {goals.conversionRate || 25}%
              </p>
              <p className="text-xs text-gray-400">
                Current: {agentStats.conversionRate}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm">Referral Goal</p>
              <p className="text-2xl font-bold text-white">
                {goals.referralRate || 15}%
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Progress Bar */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              <h3 className="text-xl font-semibold text-white">
                Monthly Progress
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  ${thermostat.monthlyRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-300">Revenue This Month</div>
              </div>
              {editingGoal ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={monthlyGoal}
                    onChange={(e) => setMonthlyGoal(parseInt(e.target.value))}
                    className="w-20 bg-slate-800 border border-white/20 rounded px-2 py-1 text-white"
                  />
                  <button
                    onClick={() => {
                      globalAgentGoals[agent.email] = {
                        ...globalAgentGoals[agent.email],
                        monthlyGoal: monthlyGoal,
                      };
                      setEditingGoal(false);
                    }}
                    className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-white text-sm"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingGoal(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm"
                >
                  Edit Goal
                </button>
              )}
            </div>
          </div>
          <div className="relative h-8 bg-slate-700 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000 relative"
              style={{ width: `${thermostat.progress}%` }}
            >
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-sm font-bold">
                {thermostat.monthlySales}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-between px-1">
              {[0, 30, 60, 90, monthlyGoal].map((mark) => (
                <div
                  key={mark}
                  className="w-0.5 h-full bg-white/50"
                  style={{
                    position: "absolute",
                    left: `${(mark / monthlyGoal) * 100}%`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mb-4">
            <span>0</span>
            <span>30</span>
            <span>60</span>
            <span>90</span>
            <span>{monthlyGoal} Sales</span>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              {thermostat.monthlySales} Sales This Month
            </div>
            <div className="text-sm text-gray-300">
              {thermostat.progress.toFixed(1)}% to {monthlyGoal} sales goal
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-gray-300 text-sm">Leads</p>
            <p className="text-2xl font-bold text-cyan-400">
              {agentStats.leads}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-gray-300 text-sm">Sales</p>
            <p className="text-2xl font-bold text-green-400">
              {agentStats.sales}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-gray-300 text-sm">Conversion Rate</p>
            <p className="text-2xl font-bold text-blue-400">
              {agentStats.conversionRate}%
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-gray-300 text-sm">Revenue</p>
            <p className="text-2xl font-bold text-yellow-400">
              ${agentStats.revenue}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-gray-300 text-sm">Referrals</p>
            <p className="text-2xl font-bold text-pink-400">
              {agentStats.referrals}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-gray-300 text-sm">Dash Sales</p>
            <p className="text-2xl font-bold text-purple-400">
              {agentStats.dashSales}
            </p>
          </div>
        </div>

        {/* Individual Lead Entries */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Lead Entries ({selectedDateLeads.length} total)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-gray-300">Time</th>
                  <th className="text-left py-3 px-4 text-gray-300">
                    Lead Type
                  </th>
                  <th className="text-left py-3 px-4 text-gray-300">Client</th>
                  <th className="text-left py-3 px-4 text-gray-300">Carrier</th>
                  <th className="text-left py-3 px-4 text-gray-300">Sale</th>
                  <th className="text-left py-3 px-4 text-gray-300">Revenue</th>
                  <th className="text-left py-3 px-4 text-gray-300">CRM</th>
                  <th className="text-left py-3 px-4 text-gray-300">Notes</th>
                </tr>
              </thead>
              <tbody>
                {selectedDateLeads.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-300">
                      No leads for this date range
                    </td>
                  </tr>
                ) : (
                  selectedDateLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-white/10 hover:bg-white/5"
                    >
                      <td className="py-3 px-4 text-white">
                        {new Date(lead.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        {lead.leadType}
                      </td>
                      <td className="py-3 px-4 text-white">
                        {lead.clientName || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-white">
                        {lead.carrier || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            lead.sale
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {lead.sale ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white">
                        {lead.sale
                          ? `$${
                              (lead.commission || 115) +
                              (lead.hra ? lead.hraValue || 15 : 0)
                            }`
                          : "$0"}
                      </td>
                      <td className="py-3 px-4">
                        {lead.crmLink ? (
                          <a
                            href={lead.crmLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td
                        className="py-3 px-4 text-white max-w-xs truncate"
                        title={lead.notes}
                      >
                        {lead.notes || "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead Type Distribution Chart */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Lead Type Distribution
          </h3>
          {(() => {
            // Calculate lead type breakdown for this agent
            const leadTypeBreakdown = selectedDateLeads.reduce((acc, lead) => {
              const type = lead.leadType?.split(" - ")[0] || lead.leadType || "Unknown";
              if (!acc[type]) acc[type] = 0;
              acc[type]++;
              return acc;
            }, {});

            const pieData = Object.entries(leadTypeBreakdown)
              .filter(([, count]) => count > 0)
              .map(([type, count]) => ({ label: type, value: count }));

            const pieColors = [
              "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
              "#8B5CF6", "#06B6D4", "#EC4899", "#84CC16"
            ];

            if (pieData.length === 0) {
              return (
                <p className="text-center text-gray-300 py-8">
                  No lead data available for this date range
                </p>
              );
            }

            return (
              <div className="flex justify-center">
                <PieChart data={pieData} colors={pieColors} />
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

// Manager Supervisor Help Component
const ManagerSupervisorHelp = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [completionForm, setCompletionForm] = useState({
    findings: "",
    improvements: "",
    agentSignedOff: false,
    managerSignedOff: false,
  });
  const [helpSessions, setHelpSessions] = useState([]);
  const [viewingForm, setViewingForm] = useState(null);

  useEffect(() => {
    // Load requests from global state
    const managerRequests = globalSupervisorRequests.filter((req) =>
      mockAgents.some(
        (agent) =>
          agent.supervisor === user.name && agent.email === req.agentEmail
      )
    );
    setRequests(managerRequests);

    // Load completed forms
    const managerForms = globalCallReviewForms.filter(
      (form) => form.supervisor === user.name
    );
    setHelpSessions(managerForms);
  }, [user.name]);

  const handleCompleteRequest = () => {
    if (!completionForm.findings || !completionForm.improvements) {
      alert("Please fill out all findings and improvement areas");
      return;
    }

    if (!completionForm.agentSignedOff || !completionForm.managerSignedOff) {
      alert("Both agent and manager must sign off");
      return;
    }

    const completedSession = {
      id: Date.now(),
      requestId: selectedRequest.id,
      agent: selectedRequest.agent,
      agentEmail: selectedRequest.agentEmail,
      type: selectedRequest.type,
      supervisor: user.name,
      completedDate: new Date(),
      findings: completionForm.findings,
      improvements: completionForm.improvements,
      agentSignedOff: completionForm.agentSignedOff,
      managerSignedOff: completionForm.managerSignedOff,
      originalRequest: selectedRequest,
      duration: selectedRequest.duration || "N/A",
    };

    // Save to global forms
    globalCallReviewForms.push(completedSession);
    setHelpSessions([completedSession, ...helpSessions]);

    // Update request status in global state
    globalSupervisorRequests = globalSupervisorRequests.map((req) =>
      req.id === selectedRequest.id
        ? {
            ...req,
            status: "completed",
            completedBy: user.name,
            completionDate: new Date(),
            formId: completedSession.id,
          }
        : req
    );

    setRequests(
      requests.map((req) =>
        req.id === selectedRequest.id ? { ...req, status: "completed" } : req
      )
    );

    setSelectedRequest(null);
    setCompletionForm({
      findings: "",
      improvements: "",
      agentSignedOff: false,
      managerSignedOff: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-xl">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">
              Agent Help Requests
            </h3>
            <p className="text-gray-300">Manage requests from your team</p>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h4 className="text-lg font-semibold text-white mb-4">
          Pending Requests
        </h4>
        {requests.filter((req) => req.status === "pending").length === 0 ? (
          <p className="text-gray-300">No pending requests</p>
        ) : (
          <div className="space-y-3">
            {requests
              .filter((req) => req.status === "pending")
              .map((request) => (
                <div key={request.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">{request.agent}</p>
                      <p className="text-sm text-gray-300">
                        {request.type === "call_review"
                          ? "Call Review Request"
                          : "Phone Assistance Request"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                      {request.type === "call_review" && (
                        <p className="text-sm text-blue-400 mt-1">
                          Reason: {request.reason}
                        </p>
                      )}
                      {request.type === "phone_assist" && (
                        <p className="text-sm text-green-400 mt-1">
                          Duration: {request.duration} minutes
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Help Session History */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h4 className="text-lg font-semibold text-white mb-4">
          Completed Help Sessions
        </h4>
        {helpSessions.length === 0 ? (
          <p className="text-gray-300">No completed sessions yet</p>
        ) : (
          <div className="space-y-3">
            {helpSessions.map((session) => (
              <div
                key={session.id}
                className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-white">{session.agent}</p>
                    <p className="text-sm text-gray-300">
                      {session.type === "call_review"
                        ? "Call Review"
                        : "Phone Assistance"}{" "}
                      - {session.duration}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(session.completedDate).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span
                        className={`${
                          session.agentSignedOff
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        Agent Signed: {session.agentSignedOff ? "✓" : "✗"}
                      </span>
                      <span
                        className={`${
                          session.managerSignedOff
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        Manager Signed: {session.managerSignedOff ? "✓" : "✗"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingForm(session)}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm"
                  >
                    View Form
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                Complete Help Session
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-white">
                  <strong>Agent:</strong> {selectedRequest.agent}
                </p>
                <p className="text-gray-300">
                  <strong>Type:</strong>{" "}
                  {selectedRequest.type === "call_review"
                    ? "Call Review"
                    : "Phone Assistance"}
                </p>
                {selectedRequest.reason && (
                  <p className="text-gray-300">
                    <strong>Reason:</strong> {selectedRequest.reason}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Findings - Why is the agent struggling?
                </label>
                <textarea
                  value={completionForm.findings}
                  onChange={(e) =>
                    setCompletionForm((prev) => ({
                      ...prev,
                      findings: e.target.value,
                    }))
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 h-32 resize-none"
                  placeholder="Describe specific areas where the agent is struggling..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Areas for Improvement
                </label>
                <textarea
                  value={completionForm.improvements}
                  onChange={(e) =>
                    setCompletionForm((prev) => ({
                      ...prev,
                      improvements: e.target.value,
                    }))
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 h-32 resize-none"
                  placeholder="List specific actions and techniques the agent should work on..."
                />
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={completionForm.agentSignedOff}
                    onChange={(e) =>
                      setCompletionForm((prev) => ({
                        ...prev,
                        agentSignedOff: e.target.checked,
                      }))
                    }
                    className="w-5 h-5"
                  />
                  <span className="text-white">
                    Agent has reviewed and signed off on this form
                  </span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={completionForm.managerSignedOff}
                    onChange={(e) =>
                      setCompletionForm((prev) => ({
                        ...prev,
                        managerSignedOff: e.target.checked,
                      }))
                    }
                    className="w-5 h-5"
                  />
                  <span className="text-white">
                    Manager has reviewed and signed off on this form
                  </span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCompleteRequest}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white"
                >
                  Complete Session
                </button>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Form Modal */}
      {viewingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                Help Session Form
              </h3>
              <button
                onClick={() => setViewingForm(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-white">
                  <strong>Agent:</strong> {viewingForm.agent}
                </p>
                <p className="text-gray-300">
                  <strong>Date:</strong>{" "}
                  {new Date(viewingForm.completedDate).toLocaleDateString()}
                </p>
                <p className="text-gray-300">
                  <strong>Type:</strong>{" "}
                  {viewingForm.type === "call_review"
                    ? "Call Review"
                    : "Phone Assistance"}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Findings</h4>
                <p className="text-gray-300 whitespace-pre-wrap">
                  {viewingForm.findings}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">
                  Areas for Improvement
                </h4>
                <p className="text-gray-300 whitespace-pre-wrap">
                  {viewingForm.improvements}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span
                  className={`${
                    viewingForm.agentSignedOff
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  Agent Signed: {viewingForm.agentSignedOff ? "✓" : "✗"}
                </span>
                <span
                  className={`${
                    viewingForm.managerSignedOff
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  Manager Signed: {viewingForm.managerSignedOff ? "✓" : "✗"}
                </span>
              </div>
              <button
                onClick={() => setViewingForm(null)}
                className="w-full bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Agent Profile modal - standalone component to avoid React reconciliation issues
// Must be defined outside of parent dashboard components so React doesn't recreate it on every render
const EnhancedAgentProfile = ({ agent, onClose, onViewDashboard }) => {
  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {(agent.name || "?")
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{agent.name || "Unknown"}</h2>
              <p className="text-gray-300">
                {agent.team} • {agent.center?.toUpperCase() || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (onViewDashboard) onViewDashboard(agent);
              }}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              View Full Dashboard
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Current Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-blue-500/20 rounded-lg p-4 text-center">
            <p className="text-blue-300 text-sm">Leads</p>
            <p className="text-2xl font-bold text-white">{agent.leads || 0}</p>
          </div>
          <div className="bg-green-500/20 rounded-lg p-4 text-center">
            <p className="text-green-300 text-sm">Sales</p>
            <p className="text-2xl font-bold text-white">{agent.sales || 0}</p>
          </div>
          <div className="bg-purple-500/20 rounded-lg p-4 text-center">
            <p className="text-purple-300 text-sm">Conv %</p>
            <p className="text-2xl font-bold text-white">
              {agent.conversionRate || 0}%
            </p>
          </div>
          <div className="bg-pink-500/20 rounded-lg p-4 text-center">
            <p className="text-pink-300 text-sm">Referrals</p>
            <p className="text-2xl font-bold text-white">{agent.referrals || 0}</p>
          </div>
          <div className="bg-cyan-500/20 rounded-lg p-4 text-center">
            <p className="text-cyan-300 text-sm">Dash Sales</p>
            <p className="text-2xl font-bold text-white">{agent.dashSales || 0}</p>
          </div>
          <div className="bg-yellow-500/20 rounded-lg p-4 text-center">
            <p className="text-yellow-300 text-sm">Revenue</p>
            <p className="text-2xl font-bold text-white">${agent.revenue || 0}</p>
          </div>
          <div className="bg-orange-500/20 rounded-lg p-4 text-center">
            <p className="text-orange-300 text-sm">Ref %</p>
            <p className="text-2xl font-bold text-white">
              {agent.leads > 0 ? (((agent.referrals || 0) / agent.leads) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {/* Lead Types and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">
              Lead Breakdown
            </h3>
            <div className="space-y-2">
              {Object.entries(
                agent.leadsList?.reduce((acc, lead) => {
                  if (!acc[lead.leadType]) acc[lead.leadType] = 0;
                  acc[lead.leadType]++;
                  return acc;
                }, {}) || {}
              ).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-gray-300">{type}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Individual Lead Entries */}
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">
            Lead Entries ({agent.leadsList?.length || 0} total)
          </h3>
          <div className="max-h-64 overflow-y-auto">
            {agent.leadsList && agent.leadsList.length > 0 ? (
              <div className="space-y-2">
                {agent.leadsList.map((lead, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-white/5 rounded"
                  >
                    <div>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          lead.sale
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {lead.leadType}
                      </span>
                      {lead.clientName && (
                        <span className="ml-2 text-white text-sm">
                          {lead.clientName}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400">
                        {new Date(lead.timestamp).toLocaleTimeString()}
                      </span>
                      {lead.sale && (
                        <p className="text-yellow-400 text-xs">
                          $
                          {(lead.commission || 115) +
                            (lead.hra ? lead.hraValue || 15 : 0)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">
                No leads entered today
              </p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Enhanced Manager Dashboard with real data integration
const ManagerDashboard = ({ user, onSignOut }) => {
  console.log("=== DATE DEBUG ===");
  const testDate = (() => {
    const today = new Date();
    console.log("Current Date object:", today);
    console.log("getFullYear():", today.getFullYear());
    console.log("getMonth():", today.getMonth()); // 0-indexed
    console.log("getDate():", today.getDate());

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const result = `${year}-${month}-${day}`;
    console.log("Final formatted date:", result);
    return result;
  })();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [benchmarkAgent, setBenchmarkAgent] = useState(null);
  const [viewingAgentDashboard, setViewingAgentDashboard] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedCenter, setSelectedCenter] = useState("all");
  const [dateFilter, setDateFilter] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [myTeamDateFilterType, setMyTeamDateFilterType] = useState("today");
  const [myTeamCustomStartDate, setMyTeamCustomStartDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });
  const [myTeamCustomEndDate, setMyTeamCustomEndDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });

  // All Agents tab date filter state
  const [allAgentsDateFilterType, setAllAgentsDateFilterType] = useState("today");
  const [allAgentsCustomStartDate, setAllAgentsCustomStartDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });
  const [allAgentsCustomEndDate, setAllAgentsCustomEndDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });

  // Performance tab date filter state
  const [perfDateFilterType, setPerfDateFilterType] = useState("today");
  const [perfCustomStartDate, setPerfCustomStartDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });
  const [perfCustomEndDate, setPerfCustomEndDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });

  // Performance tab lead type filter state
  const [perfLeadTypeFilter, setPerfLeadTypeFilter] = useState("all");

  // Lead types for Performance tab filter
  const perfLeadTypes = [
    "Immediate Dc - The client or dialer hangs up right away",
    "Has an Activity - Another agent from our company has a valid activity on the lead",
    "Tier 1 - A lead you are not allowed to sell (Employer, Tricare, Champ Va, Hospice)",
    "Not Appointed - Area you are not appointed to sell in",
    "Spanish - Spanish lead and you don't speak spanish",
    "Intro/Soa - Lost the client on Step 0-1",
    "RWB Card - Lost the client on step 8",
    "No SEP - Did not have a SEP to enroll the client",
    "No Value - Could not find any value to sell the client on (Supervisor Approval)",
    "Dr Change - Lost the client because they wouldn't change their DR",
    "Carrier Change - Lost the client because they wouldn't change their carrier",
    "Third Party - Someone else came into the call and ruined the deal (Son, Daughter, Etc)",
    "Pitch - Lost the client on step 15",
    "Meds - Lost the client on step 17",
    "Pre Inbound - Lost the client on step 19 or Ghosted",
    "Inbound - Lost the client on enrollment call",
    "Med Supp - Could not sell someone off a Med Supp",
    "Sale - Sold the client",
    "Referral Sale - 2nd part of Twofer or Referral from existing client",
    "Dash Sale - Sale from your dash",
  ];

  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem(`theme_${user?.email}`);
    return savedTheme || "forest";
  });
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Persist theme to localStorage when it changes
  useEffect(() => {
    if (user?.email && currentTheme) {
      localStorage.setItem(`theme_${user.email}`, currentTheme);
    }
  }, [currentTheme, user?.email]);
  const [userAvatar, setUserAvatar] = useState(null);
  const [teamName, setTeamName] = useState("Sales Team Alpha");
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [myTeamAgents, setMyTeamAgents] = useState([]);

  // State to force re-renders when agent goals change
  const [agentGoalsVersion, setAgentGoalsVersion] = useState(0);

  // Debounce timer for goal saving to prevent too many Firebase writes
  const goalSaveTimerRef = useRef({});

  // State for team goals - controlled inputs
  const [teamSalesGoal, setTeamSalesGoal] = useState(50);
  const [teamConversionGoal, setTeamConversionGoal] = useState(25);
  // Local input state for responsive typing (updates immediately, no re-render lag)
  const [teamSalesGoalInput, setTeamSalesGoalInput] = useState('50');
  const [teamConversionGoalInput, setTeamConversionGoalInput] = useState('25');
  const teamGoalsDebounceRef = useRef(null);
  const teamGoalsInitialized = useRef(false);

  // Use Firebase for teams and agents data
  const { teams, agents: firebaseAgents, leads: firebaseLeads, createTeam, assignAgentToTeam, addToMyTeam, removeFromMyTeam, myTeamMemberIds, myTeamGoals, myTeamMemberGoals, updateMyTeamGoals, updateAgentGoals, fetchAgentGoals, hideAgent, unhideAgent, hiddenAgentIds, refreshData, lastRefresh, loading: dataLoading } = useFirestore(user.email);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter out hidden agents for UI display (keeps lead data intact)
  const visibleAgents = firebaseAgents.filter(agent => !hiddenAgentIds.includes(agent.id));

  // Sync Firebase leads to global data for legacy functions
  useEffect(() => {
    if (firebaseLeads && firebaseLeads.length > 0) {
      globalLeadsData = firebaseLeads;
    }
  }, [firebaseLeads]);

  // Handle manual data refresh
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  // Create Team Modal state
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamSupervisor, setNewTeamSupervisor] = useState("");
  const [selectedAgentsForTeam, setSelectedAgentsForTeam] = useState([]);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // Edit Team Modal state
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamSupervisor, setEditTeamSupervisor] = useState("");
  const [editSelectedAgents, setEditSelectedAgents] = useState([]);
  const [editTeamSalesGoal, setEditTeamSalesGoal] = useState(3);
  const [editTeamConversionGoal, setEditTeamConversionGoal] = useState(30);

  const [notifications] = useState([]);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper function to get date range based on filter type for My Team
  const getMyTeamDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (myTeamDateFilterType) {
      case "today": {
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
        return { startDate: today, endDate };
      }
      case "this_week": {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        return { startDate: startOfWeek, endDate: endOfWeek };
      }
      case "this_month": {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return { startDate: startOfMonth, endDate: endOfMonth };
      }
      case "custom": {
        const [startYear, startMonth, startDay] = myTeamCustomStartDate.split("-").map(Number);
        const [endYear, endMonth, endDay] = myTeamCustomEndDate.split("-").map(Number);
        const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
        const endDate = new Date(endYear, endMonth - 1, endDay + 1, 0, 0, 0, 0);
        return { startDate, endDate };
      }
      default:
        return { startDate: today, endDate: new Date(today.getTime() + 86400000) };
    }
  };

  // Get agent stats for a date range (for My Team)
  const getAgentStatsForDateRange = (agentIdOrEmail) => {
    const { startDate, endDate } = getMyTeamDateRange();

    const agentLeads = firebaseLeads.filter(lead => {
      if (lead.agent !== agentIdOrEmail && lead.agentEmail !== agentIdOrEmail) return false;
      const leadDate = lead.timestamp instanceof Date ? lead.timestamp : new Date(lead.timestamp);
      return leadDate >= startDate && leadDate < endDate;
    });

    const sales = agentLeads.filter(lead => lead.sale);
    const referrals = agentLeads.filter(lead => lead.leadType?.startsWith("Referral Sale"));
    const dashSales = agentLeads.filter(lead => lead.leadType?.startsWith("Dash Sale"));

    const revenue = sales.reduce(
      (sum, lead) => sum + (lead.commission || 115) + (lead.hra ? (lead.hraValue || 15) : 0),
      0
    );

    return {
      leads: agentLeads.length,
      sales: sales.length,
      conversionRate: agentLeads.length > 0 ? ((sales.length / agentLeads.length) * 100).toFixed(1) : "0.0",
      referrals: referrals.length,
      dashSales: dashSales.length,
      revenue,
      leadsList: agentLeads,
    };
  };

  // Get struggled lead types for an agent (leads that didn't convert, grouped by type)
  const getAgentStruggledLeads = (agentIdOrEmail) => {
    const { startDate, endDate } = getMyTeamDateRange();

    const agentLeads = firebaseLeads.filter(lead => {
      if (lead.agent !== agentIdOrEmail && lead.agentEmail !== agentIdOrEmail) return false;
      const leadDate = lead.timestamp instanceof Date ? lead.timestamp : new Date(lead.timestamp);
      return leadDate >= startDate && leadDate < endDate;
    });

    // Group leads by type and track non-sales (struggled leads)
    const leadTypeBreakdown = {};
    agentLeads.forEach(lead => {
      const type = lead.leadType?.split(" - ")[0] || lead.leadType || "Unknown";
      // Skip sale types as they are successes, not struggles
      const isSaleType = type.includes("Sale");
      if (isSaleType) return;

      if (!leadTypeBreakdown[type]) {
        leadTypeBreakdown[type] = { total: 0, nonSales: 0 };
      }
      leadTypeBreakdown[type].total++;
      if (!lead.sale) {
        leadTypeBreakdown[type].nonSales++;
      }
    });

    // Convert to array format for pie chart - only include types with non-sales
    const struggledLeads = Object.entries(leadTypeBreakdown)
      .filter(([, data]) => data.nonSales > 0)
      .map(([type, data]) => ({
        label: type,
        value: data.nonSales,
        total: data.total,
        conversionRate: data.total > 0 ? ((data.total - data.nonSales) / data.total * 100).toFixed(1) : "0.0"
      }))
      .sort((a, b) => b.value - a.value);

    return struggledLeads;
  };

  // Get struggled leads for the entire team (aggregated)
  const getTeamStruggledLeads = () => {
    const { startDate, endDate } = getMyTeamDateRange();

    // Get all team member IDs
    const teamMemberIds = myTeamAgents.map(member => member.id || member.email);

    // Filter leads for all team members in date range
    const teamLeads = firebaseLeads.filter(lead => {
      const matchesTeam = teamMemberIds.some(id =>
        lead.agent === id || lead.agentEmail === id
      );
      if (!matchesTeam) return false;
      const leadDate = lead.timestamp instanceof Date ? lead.timestamp : new Date(lead.timestamp);
      return leadDate >= startDate && leadDate < endDate;
    });

    // Group leads by type and track non-sales
    const leadTypeBreakdown = {};
    teamLeads.forEach(lead => {
      const type = lead.leadType?.split(" - ")[0] || lead.leadType || "Unknown";
      // Skip sale types
      const isSaleType = type.includes("Sale");
      if (isSaleType) return;

      if (!leadTypeBreakdown[type]) {
        leadTypeBreakdown[type] = { total: 0, nonSales: 0 };
      }
      leadTypeBreakdown[type].total++;
      if (!lead.sale) {
        leadTypeBreakdown[type].nonSales++;
      }
    });

    // Convert to array format for pie chart
    const struggledLeads = Object.entries(leadTypeBreakdown)
      .filter(([, data]) => data.nonSales > 0)
      .map(([type, data]) => ({
        label: type,
        value: data.nonSales,
        total: data.total,
        conversionRate: data.total > 0 ? ((data.total - data.nonSales) / data.total * 100).toFixed(1) : "0.0"
      }))
      .sort((a, b) => b.value - a.value);

    return struggledLeads;
  };

  // Helper function to get date range based on filter type for All Agents tab
  const getAllAgentsDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (allAgentsDateFilterType) {
      case "today": {
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
        return { startDate: today, endDate };
      }
      case "this_week": {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        return { startDate: startOfWeek, endDate: endOfWeek };
      }
      case "this_month": {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return { startDate: startOfMonth, endDate: endOfMonth };
      }
      case "custom": {
        const [startYear, startMonth, startDay] = allAgentsCustomStartDate.split("-").map(Number);
        const [endYear, endMonth, endDay] = allAgentsCustomEndDate.split("-").map(Number);
        const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
        const endDate = new Date(endYear, endMonth - 1, endDay + 1, 0, 0, 0, 0);
        return { startDate, endDate };
      }
      default:
        return { startDate: today, endDate: new Date(today.getTime() + 86400000) };
    }
  };

  // Get agent stats for All Agents date range
  const getAgentStatsForAllAgentsDateRange = (agentIdOrEmail) => {
    const { startDate, endDate } = getAllAgentsDateRange();

    const agentLeads = firebaseLeads.filter(lead => {
      if (lead.agent !== agentIdOrEmail && lead.agentEmail !== agentIdOrEmail) return false;
      const leadDate = lead.timestamp instanceof Date ? lead.timestamp : new Date(lead.timestamp);
      return leadDate >= startDate && leadDate < endDate;
    });

    const sales = agentLeads.filter(lead => lead.sale);
    const referrals = agentLeads.filter(lead => lead.leadType?.startsWith("Referral Sale"));
    const dashSales = agentLeads.filter(lead => lead.leadType?.startsWith("Dash Sale"));

    const revenue = sales.reduce(
      (sum, lead) => sum + (lead.commission || 115) + (lead.hra ? (lead.hraValue || 15) : 0),
      0
    );

    return {
      leads: agentLeads.length,
      sales: sales.length,
      conversionRate: agentLeads.length > 0 ? ((sales.length / agentLeads.length) * 100).toFixed(1) : "0.0",
      referrals: referrals.length,
      dashSales: dashSales.length,
      revenue,
      leadsList: agentLeads,
    };
  };

  // Helper function to get the team name an agent belongs to
  const getAgentTeamName = (agentId) => {
    if (!teams || teams.length === 0) return "No Team";

    for (const team of teams) {
      // Check if agent is in memberIds
      if (team.memberIds && team.memberIds.includes(agentId)) {
        return team.name || "Unnamed Team";
      }
      // Check if agent is in members array
      if (team.members && team.members.some(m => m.id === agentId)) {
        return team.name || "Unnamed Team";
      }
    }
    return "No Team";
  };

  // Helper function to get date range for Performance tab
  const getPerfDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (perfDateFilterType) {
      case "today": {
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
        return { startDate: today, endDate, periodLabel: "Today" };
      }
      case "this_week": {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        return { startDate: startOfWeek, endDate: endOfWeek, periodLabel: "This Week" };
      }
      case "this_month": {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return { startDate: startOfMonth, endDate: endOfMonth, periodLabel: "This Month" };
      }
      case "custom": {
        const [startYear, startMonth, startDay] = perfCustomStartDate.split("-").map(Number);
        const [endYear, endMonth, endDay] = perfCustomEndDate.split("-").map(Number);
        const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
        const endDate = new Date(endYear, endMonth - 1, endDay + 1, 0, 0, 0, 0);
        return { startDate, endDate, periodLabel: `${perfCustomStartDate} to ${perfCustomEndDate}` };
      }
      default:
        return { startDate: today, endDate: new Date(today.getTime() + 86400000), periodLabel: "Today" };
    }
  };

  // Get previous period date range for comparison
  const getPreviousPerfDateRange = () => {
    const { startDate, endDate } = getPerfDateRange();
    const duration = endDate.getTime() - startDate.getTime();
    const prevEndDate = new Date(startDate.getTime());
    const prevStartDate = new Date(startDate.getTime() - duration);
    return { startDate: prevStartDate, endDate: prevEndDate };
  };

  // Get stats for a specific date range
  const getStatsForDateRange = (startDate, endDate) => {
    const leadsInRange = firebaseLeads.filter(lead => {
      const leadDate = lead.timestamp instanceof Date ? lead.timestamp : new Date(lead.timestamp);
      return leadDate >= startDate && leadDate < endDate;
    });

    const sales = leadsInRange.filter(lead => lead.sale);
    const referrals = leadsInRange.filter(lead => lead.leadType?.startsWith("Referral Sale"));
    const revenue = sales.reduce(
      (sum, lead) => sum + (lead.commission || 115) + (lead.hra ? (lead.hraValue || 15) : 0),
      0
    );

    return {
      leads: leadsInRange.length,
      sales: sales.length,
      referrals: referrals.length,
      revenue,
      conversionRate: leadsInRange.length > 0 ? ((sales.length / leadsInRange.length) * 100).toFixed(1) : "0.0",
    };
  };

  // Get comprehensive performance stats for the Performance tab - MEMOIZED for performance
  const performanceStats = useMemo(() => {
    const { startDate, endDate, periodLabel } = getPerfDateRange();
    const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousPerfDateRange();

    // Current period stats
    const currentStats = getStatsForDateRange(startDate, endDate);
    // Previous period stats
    const prevStats = getStatsForDateRange(prevStartDate, prevEndDate);

    // Calculate growth
    const salesGrowth = prevStats.sales > 0
      ? (((currentStats.sales - prevStats.sales) / prevStats.sales) * 100).toFixed(1)
      : currentStats.sales > 0 ? "100.0" : "0.0";

    // Get agent stats for current period
    const agentStats = firebaseAgents.map(agent => {
      const agentLeads = firebaseLeads.filter(lead => {
        if (lead.agent !== agent.id && lead.agentEmail !== agent.id) return false;
        const leadDate = lead.timestamp instanceof Date ? lead.timestamp : new Date(lead.timestamp);
        return leadDate >= startDate && leadDate < endDate;
      });
      const agentSales = agentLeads.filter(lead => lead.sale);
      return {
        ...agent,
        leads: agentLeads.length,
        sales: agentSales.length,
        conversionRate: agentLeads.length > 0 ? ((agentSales.length / agentLeads.length) * 100).toFixed(1) : "0.0",
      };
    });

    // Filter agents with at least 1 lead for best/worst calculations
    const agentsWithLeads = agentStats.filter(a => a.leads > 0);

    // Find best and worst agents
    let bestAgent = { name: "N/A", conversionRate: "0.0" };
    let worstAgent = { name: "N/A", conversionRate: "0.0" };

    if (agentsWithLeads.length > 0) {
      const sortedByConversion = [...agentsWithLeads].sort(
        (a, b) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate)
      );
      bestAgent = sortedByConversion[0];
      worstAgent = sortedByConversion[sortedByConversion.length - 1];
    }

    // Team health counts
    const highPerformers = agentStats.filter(a => parseFloat(a.conversionRate) >= 30).length;
    const needSupport = agentStats.filter(a => parseFloat(a.conversionRate) >= 15 && parseFloat(a.conversionRate) < 25).length;
    const critical = agentStats.filter(a => a.leads > 0 && parseFloat(a.conversionRate) < 15).length;

    // Calculate real struggling lead types from actual data
    const periodLeads = firebaseLeads.filter(lead => {
      const leadDate = lead.timestamp instanceof Date ? lead.timestamp : new Date(lead.timestamp);
      return leadDate >= startDate && leadDate < endDate;
    });

    const leadTypeBreakdown = {};
    periodLeads.forEach(lead => {
      const type = lead.leadType?.split(" - ")[0] || lead.leadType || "Unknown";
      // Skip sale types as they are successes
      const isSaleType = type.includes("Sale");
      if (isSaleType) return;

      if (!leadTypeBreakdown[type]) {
        leadTypeBreakdown[type] = { total: 0, sales: 0 };
      }
      leadTypeBreakdown[type].total++;
      if (lead.sale) {
        leadTypeBreakdown[type].sales++;
      }
    });

    // Find top struggling lead types (high volume, low conversion)
    const strugglingLeadTypes = Object.entries(leadTypeBreakdown)
      .filter(([, data]) => data.total >= 3) // Need at least 3 leads
      .map(([type, data]) => ({
        type,
        total: data.total,
        sales: data.sales,
        nonSales: data.total - data.sales,
        conversionRate: data.total > 0 ? ((data.sales / data.total) * 100).toFixed(1) : "0.0",
        percentOfTotal: periodLeads.length > 0 ? ((data.total / periodLeads.length) * 100).toFixed(1) : "0.0"
      }))
      .sort((a, b) => b.nonSales - a.nonSales) // Sort by most lost leads
      .slice(0, 5);

    // Find agents struggling with specific lead types
    const agentLeadTypePerformance = {};
    agentsWithLeads.forEach(agent => {
      const agentLeads = periodLeads.filter(lead =>
        lead.agent === agent.id || lead.agentEmail === agent.email
      );
      agentLeads.forEach(lead => {
        const type = lead.leadType?.split(" - ")[0] || lead.leadType || "Unknown";
        if (!agentLeadTypePerformance[type]) {
          agentLeadTypePerformance[type] = [];
        }
        agentLeadTypePerformance[type].push({
          agentName: agent.name,
          sale: lead.sale
        });
      });
    });

    // Calculate improvement potential per lead type
    const improvementAreas = strugglingLeadTypes.map(leadType => {
      const avgConversionForType = parseFloat(leadType.conversionRate);
      const potentialGain = leadType.nonSales; // Each non-sale is potential gain
      return {
        ...leadType,
        potentialGain,
        recommendation: avgConversionForType < 10
          ? `Focus training on ${leadType.type} handling - very low conversion`
          : avgConversionForType < 20
          ? `Improve ${leadType.type} approach - below average conversion`
          : `Fine-tune ${leadType.type} techniques - room for improvement`
      };
    });

    return {
      periodLabel,
      currentSales: currentStats.sales,
      previousSales: prevStats.sales,
      salesGrowth,
      totalLeads: currentStats.leads,
      totalRevenue: currentStats.revenue,
      avgConversion: currentStats.conversionRate,
      referralRate: currentStats.leads > 0 ? ((currentStats.referrals / currentStats.leads) * 100).toFixed(1) : "0.0",
      bestAgent,
      worstAgent,
      highPerformers,
      needSupport,
      critical,
      totalAgents: visibleAgents.length,
      strugglingLeadTypes,
      improvementAreas,
    };
  }, [firebaseLeads, firebaseAgents, perfDateFilterType, perfCustomStartDate, perfCustomEndDate, visibleAgents.length]);

  // Wrapper function for backward compatibility
  const getPerformanceStats = () => performanceStats;

  // Update myTeamAgents when Firebase data changes
  // Also clean up stale member IDs (agents deleted from Firebase)
  useEffect(() => {
    // Get valid agent IDs that exist in Firebase
    const validAgentIds = new Set(firebaseAgents.map(agent => agent.id));

    // Filter agents based on persisted myTeamMemberIds from Firebase
    const teamAgents = firebaseAgents.filter((agent) =>
      myTeamMemberIds.includes(agent.id)
    );
    setMyTeamAgents(teamAgents);

    // Clean up stale member IDs (agents that were deleted from Firebase)
    const staleIds = myTeamMemberIds.filter(id => !validAgentIds.has(id));
    if (staleIds.length > 0 && firebaseAgents.length > 0) {
      console.log("Cleaning up stale member IDs:", staleIds);
      // Remove stale IDs from the manager's team in Firebase
      const validMemberIds = myTeamMemberIds.filter(id => validAgentIds.has(id));
      // Only update if we have a real change and firebaseAgents is loaded
      if (validMemberIds.length !== myTeamMemberIds.length) {
        // Call removeFromMyTeam for each stale ID to update Firebase
        staleIds.forEach(async (staleId) => {
          try {
            await removeFromMyTeam(staleId);
          } catch (err) {
            console.error("Error removing stale agent:", err);
          }
        });
      }
    }
  }, [firebaseAgents, myTeamMemberIds, removeFromMyTeam]);

  // Load goals for all team members from manager's stored goals
  // FIX: Use myTeamMemberGoals directly instead of fetching each one
  useEffect(() => {
    if (!myTeamMemberGoals || Object.keys(myTeamMemberGoals).length === 0) {
      console.log("ManagerDashboard: No member goals stored yet");
      return;
    }

    console.log("ManagerDashboard: Loading goals from myTeamMemberGoals for", Object.keys(myTeamMemberGoals).length, "members");

    // Copy manager's stored goals to globalAgentGoals for use in UI
    for (const [agentEmail, goals] of Object.entries(myTeamMemberGoals)) {
      globalAgentGoals[agentEmail] = goals;
      console.log("Loaded goals for:", agentEmail, goals);
    }

    // Force re-render after loading goals
    setAgentGoalsVersion(prev => prev + 1);
  }, [myTeamMemberGoals]);

  // Initialize team goals from Firebase only once
  useEffect(() => {
    if (!teamGoalsInitialized.current && myTeamGoals) {
      const salesVal = myTeamGoals.salesGoal ?? 50;
      const convVal = myTeamGoals.conversionGoal ?? 25;
      setTeamSalesGoal(salesVal);
      setTeamConversionGoal(convVal);
      setTeamSalesGoalInput(String(salesVal));
      setTeamConversionGoalInput(String(convVal));
      globalTeamGoals.salesGoal = salesVal;
      globalTeamGoals.conversionGoal = convVal;
      teamGoalsInitialized.current = true;
    }
  }, [myTeamGoals]);

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUserAvatar(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTeamNameEdit = () => setIsEditingTeamName(false);

  const addAgentToTeam = async (agentId) => {
    // Check if already in team
    if (myTeamMemberIds.includes(agentId)) return;

    try {
      await addToMyTeam(agentId);
      showToast("Agent added to team!", "success");
    } catch (error) {
      console.error("Error adding agent to team:", error);
      showToast("Error adding agent to team: " + error.message, "error");
    }
  };

  const removeAgentFromTeam = async (agentId) => {
    try {
      await removeFromMyTeam(agentId);
      showToast("Agent removed from team", "success");
    } catch (error) {
      console.error("Error removing agent from team:", error);
      showToast("Error removing agent from team: " + error.message, "error");
    }
  };

  const setAgentGoal = (agentEmail, goalType, value) => {
    if (!agentEmail) {
      console.error("setAgentGoal: No email provided");
      showToast("Error: Agent email not found", "error");
      return;
    }

    // Handle NaN or invalid values - default to 0
    const numericValue = isNaN(value) || value === null || value === undefined ? 0 : Number(value);

    console.log("setAgentGoal called:", { agentEmail, goalType, value, numericValue });

    // Initialize goals object if it doesn't exist
    if (!globalAgentGoals[agentEmail]) {
      globalAgentGoals[agentEmail] = {
        dailySales: 10,
        weeklySales: 50,
        monthlyGoal: 120,
        conversionRate: 25,
        referralRate: 15,
      };
    }

    // Update the specific goal value locally
    globalAgentGoals[agentEmail][goalType] = numericValue;

    // Force re-render to update input values immediately
    setAgentGoalsVersion(v => v + 1);

    // Debounce Firebase save - wait 500ms after user stops typing
    // This prevents excessive writes and rate limit issues
    const timerKey = `${agentEmail}_${goalType}`;
    if (goalSaveTimerRef.current[timerKey]) {
      clearTimeout(goalSaveTimerRef.current[timerKey]);
    }

    goalSaveTimerRef.current[timerKey] = setTimeout(async () => {
      try {
        console.log("Saving goals to Firebase:", agentEmail, globalAgentGoals[agentEmail]);
        await updateAgentGoals(agentEmail, globalAgentGoals[agentEmail]);
        console.log("Goals saved successfully for:", agentEmail);
      } catch (err) {
        console.error("FAILED to save goals to Firebase:", err);
        // Show more detailed error message
        const errorMsg = err.code || err.message || "Unknown error";
        showToast(`Failed to save goal: ${errorMsg}`, "error");
      }
    }, 500);
  };

  // Handle Create Team
  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    setIsCreatingTeam(true);
    try {
      // Get selected agent details to store with team
      const selectedAgentDetails = firebaseAgents
        .filter(agent => selectedAgentsForTeam.includes(agent.id))
        .map(agent => ({
          id: agent.id,
          name: agent.name,
          email: agent.email,
        }));

      const teamId = await createTeam({
        name: newTeamName.trim(),
        supervisor: newTeamSupervisor.trim() || user.name,
        members: selectedAgentDetails,
        memberIds: selectedAgentsForTeam,
      });

      console.log("Team created successfully:", teamId);

      // Also add selected agents to manager's personal "My Team"
      // This syncs the created team with the My Team section
      for (const agentId of selectedAgentsForTeam) {
        if (!myTeamMemberIds.includes(agentId)) {
          await addToMyTeam(agentId);
        }
      }

      // Reset form
      setNewTeamName("");
      setNewTeamSupervisor("");
      setSelectedAgentsForTeam([]);
      setShowCreateTeamModal(false);
      showToast("Team created successfully!", "success");
    } catch (error) {
      console.error("Error creating team:", error);
      showToast("Error creating team: " + error.message, "error");
    } finally {
      setIsCreatingTeam(false);
    }
  };

  // Toggle agent selection for new team
  const toggleAgentForTeam = (agentId) => {
    setSelectedAgentsForTeam(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  // Open edit team modal
  const openEditTeamModal = (team) => {
    setEditingTeam(team);
    setEditTeamName(team.name || "");
    setEditTeamSupervisor(team.supervisor || "");
    // Filter to only include agents that still exist in Firebase
    const storedMemberIds = team.memberIds || team.members?.map(m => m.id) || [];
    const validAgentIds = new Set(firebaseAgents.map(a => a.id));
    const validMemberIds = storedMemberIds.filter(id => validAgentIds.has(id));
    setEditSelectedAgents(validMemberIds);
    setEditTeamSalesGoal(team.salesGoal || 3);
    setEditTeamConversionGoal(team.conversionGoal || 30);
    setShowEditTeamModal(true);
  };

  // Toggle agent selection for editing team
  const toggleAgentForEdit = (agentId) => {
    setEditSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  // Handle Update Team
  const handleUpdateTeam = async () => {
    if (!editingTeam || !editTeamName.trim()) return;

    try {
      // Get selected agent details to store with team
      const selectedAgentDetails = firebaseAgents
        .filter(agent => editSelectedAgents.includes(agent.id))
        .map(agent => ({
          id: agent.id,
          name: agent.name,
          email: agent.email,
        }));

      const teamDocRef = doc(db, "teams", editingTeam.id);
      await updateDoc(teamDocRef, {
        name: editTeamName.trim(),
        supervisor: editTeamSupervisor.trim() || user.name,
        members: selectedAgentDetails,
        memberIds: editSelectedAgents,
        salesGoal: parseInt(editTeamSalesGoal) || 3,
        conversionGoal: parseInt(editTeamConversionGoal) || 30,
        updatedAt: new Date(),
      });

      console.log("Team updated successfully:", editingTeam.id);

      // Refresh teams data
      await refreshData();

      // Reset form and close modal
      setEditingTeam(null);
      setEditTeamName("");
      setEditTeamSupervisor("");
      setEditSelectedAgents([]);
      setShowEditTeamModal(false);
      showToast("Team updated successfully!", "success");
    } catch (error) {
      console.error("Error updating team:", error);
      showToast("Error updating team: " + error.message, "error");
    }
  };

  // Calculate agent stats from Firebase leads
  const getAgentStatsFromFirebase = (agentIdOrEmail, dateFilterValue = null) => {
    // Filter by agent ID or email (leads use 'agent' field which is the userId)
    let agentLeads = firebaseLeads.filter(lead =>
      lead.agent === agentIdOrEmail || lead.agentEmail === agentIdOrEmail
    );

    if (dateFilterValue) {
      const [year, month, day] = dateFilterValue.split("-").map(Number);
      const filterDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      const nextDay = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

      agentLeads = agentLeads.filter(lead => {
        const leadDate = lead.timestamp instanceof Date ? lead.timestamp : new Date(lead.timestamp);
        return leadDate >= filterDate && leadDate < nextDay;
      });
    }

    const sales = agentLeads.filter(lead => lead.sale);
    const referrals = agentLeads.filter(lead => lead.leadType?.startsWith("Referral Sale") || lead.leadType === "Referral");
    const dashSales = agentLeads.filter(lead => lead.leadType?.startsWith("Dash Sale"));
    const newSales = agentLeads.filter(lead => lead.sale && !lead.leadType?.startsWith("Referral Sale"));
    const unassigned = agentLeads.filter(lead => !lead.sale && lead.leadType === "Unassigned");
    const openActivities = agentLeads.filter(lead => !lead.sale && lead.status === "open");
    const pd15Plus = agentLeads.filter(lead => lead.pdDays && lead.pdDays >= 15);
    const hraEligible = agentLeads.filter(lead => lead.hraEligible);
    const hraSubmitted = agentLeads.filter(lead => lead.hra);

    const leads = agentLeads.length;
    const conversionRate = leads > 0 ? ((sales.length / leads) * 100).toFixed(1) : "0.0";
    const referralRate = leads > 0 ? ((referrals.length / leads) * 100).toFixed(2) : "0.00";
    const spd = sales.length > 0 ? (sales.length / 1).toFixed(1) : "0.0"; // Sales per day
    const newSalePercent = leads > 0 ? ((newSales.length / leads) * 100).toFixed(1) : "0.0";
    const effectiveness = leads > 0 ? ((sales.length / Math.max(leads, 1)) * 100).toFixed(1) : "0.0";
    const unassignedPercent = leads > 0 ? ((unassigned.length / leads) * 100).toFixed(2) : "0.00";
    const pdPercent = leads > 0 ? ((pd15Plus.length / leads) * 100).toFixed(2) : "0.00";
    const hraPercent = hraEligible.length > 0 ? ((hraSubmitted.length / hraEligible.length) * 100).toFixed(2) : "0.00";

    const revenue = sales.reduce(
      (sum, lead) => sum + (lead.commission || 115) + (lead.hra ? (lead.hraValue || 15) : 0),
      0
    );

    return {
      leads,
      sales: sales.length,
      conversionRate,
      referrals: referrals.length,
      referralRate,
      dashSales: dashSales.length,
      spd: parseFloat(spd),
      newSalePercent: parseFloat(newSalePercent),
      effectiveness: parseFloat(effectiveness),
      unassigned: unassigned.length,
      unassignedPercent: parseFloat(unassignedPercent),
      openActivities: openActivities.length,
      pd15Plus: pd15Plus.length,
      pdPercent: parseFloat(pdPercent),
      hraEligible: hraEligible.length,
      hraSubmitted: hraSubmitted.length,
      hraPercent: parseFloat(hraPercent),
      revenue,
      tpvNt: 0, // Placeholder for TPV NT
      tpv: 100, // Placeholder for TPV %
      nrt: 0, // Placeholder for NRT
      acw: 0, // Placeholder for ACW
    };
  };

  // Get team members from Firebase
  const getTeamMembers = (teamId) => {
    return firebaseAgents.filter(agent => agent.teamId === teamId);
  };

  // Get real team stats using Firebase data
  const getEnhancedTeamStats = (team) => {
    // Get team members - first check if team has stored members, then fall back to teamId matching
    // IMPORTANT: Only include agents that exist in firebaseAgents (from users collection)
    // This ensures deleted users don't appear in team rosters
    let teamMembers = [];

    if (team.members && team.members.length > 0) {
      // Use members stored directly in team document
      // Filter to only include members that still exist in the users collection
      teamMembers = team.members
        .map(member => {
          // Find full agent data from firebaseAgents - only include if found
          const fullAgent = firebaseAgents.find(a => a.id === member.id);
          return fullAgent ? { ...member, ...fullAgent } : null;
        })
        .filter(member => member !== null); // Remove deleted users
    } else if (team.memberIds && team.memberIds.length > 0) {
      // Use memberIds to find agents - automatically filters to existing users
      teamMembers = firebaseAgents.filter(agent => team.memberIds.includes(agent.id));
    } else {
      // Fall back to matching by teamId on agent
      teamMembers = firebaseAgents.filter(agent => agent.teamId === team.id);
    }

    // Calculate stats for each member
    const teamMemberStats = teamMembers.map(member => ({
      ...member,
      ...getAgentStatsFromFirebase(member.id || member.email, dateFilter),
    }));

    // Calculate team totals
    const totals = teamMemberStats.reduce((acc, member) => ({
      leads: acc.leads + member.leads,
      sales: acc.sales + member.sales,
      referrals: acc.referrals + member.referrals,
      dashSales: acc.dashSales + member.dashSales,
      unassigned: acc.unassigned + member.unassigned,
      openActivities: acc.openActivities + member.openActivities,
      pd15Plus: acc.pd15Plus + member.pd15Plus,
      hraEligible: acc.hraEligible + member.hraEligible,
      hraSubmitted: acc.hraSubmitted + member.hraSubmitted,
      revenue: acc.revenue + member.revenue,
    }), {
      leads: 0,
      sales: 0,
      referrals: 0,
      dashSales: 0,
      unassigned: 0,
      openActivities: 0,
      pd15Plus: 0,
      hraEligible: 0,
      hraSubmitted: 0,
      revenue: 0,
    });

    // Calculate aggregate percentages (using totals, not averages)
    const teamConversion = totals.leads > 0
      ? ((totals.sales / totals.leads) * 100).toFixed(1)
      : "0.0";

    const avgRefRate = totals.leads > 0
      ? ((totals.referrals / totals.leads) * 100).toFixed(2)
      : "0.00";

    const avgSpd = teamMemberStats.length > 0
      ? (teamMemberStats.reduce((sum, m) => sum + m.spd, 0) / teamMemberStats.length).toFixed(1)
      : "0.0";

    const avgEffectiveness = totals.leads > 0
      ? ((totals.sales / totals.leads) * 100).toFixed(1)
      : "0.0";

    const avgUnassignedPercent = totals.leads > 0
      ? ((totals.unassigned / totals.leads) * 100).toFixed(2)
      : "0.00";

    const avgPdPercent = totals.leads > 0
      ? ((totals.pd15Plus / totals.leads) * 100).toFixed(2)
      : "0.00";

    const avgHraPercent = totals.hraEligible > 0
      ? ((totals.hraSubmitted / totals.hraEligible) * 100).toFixed(2)
      : "0.00";

    // Sort members from worst to best by conversion rate
    const sortedMembers = [...teamMemberStats].sort((a, b) =>
      parseFloat(a.conversionRate) - parseFloat(b.conversionRate)
    );

    return {
      totalLeads: totals.leads,
      totalSales: totals.sales,
      totalReferrals: totals.referrals,
      totalDashSales: totals.dashSales,
      totalRevenue: totals.revenue,
      avgConversion: teamConversion,
      avgRefRate,
      avgSpd,
      avgEffectiveness,
      avgUnassignedPercent,
      totalOpenActivities: totals.openActivities,
      totalPd15Plus: totals.pd15Plus,
      avgPdPercent,
      totalHraEligible: totals.hraEligible,
      totalHraSubmitted: totals.hraSubmitted,
      avgHraPercent,
      members: sortedMembers,
      memberCount: teamMembers.length,
    };
  };

  const getAllTeamsData = () => {
    return teams
      .map((team) => ({
        ...team,
        ...getEnhancedTeamStats(team),
      }))
      .sort((a, b) => b.totalSales - a.totalSales);
  };

  // Get all agents with stats for All Agents tab (using date filter)
  // Uses visibleAgents to exclude hidden agents from the list
  const getStrugglingAgents = () => {
    let agents = visibleAgents.map((agent) => ({
      ...agent,
      ...getAgentStatsForAllAgentsDateRange(agent.id || agent.email),
      teamName: getAgentTeamName(agent.id),
    }));

    // Sort by performance (lowest first to prioritize agents who need help)
    return agents
      .sort((a, b) => {
        // Sort by multiple criteria: sales, conversion rate
        const scoreA =
          a.sales * 0.4 +
          parseFloat(a.conversionRate) * 0.3;
        const scoreB =
          b.sales * 0.4 +
          parseFloat(b.conversionRate) * 0.3;
        return scoreA - scoreB;
      });
  };

  // Get worst Five9 adherence agents (placeholder - Five9 data would come from integration)
  const getWorstAdherenceAgents = () => {
    // Five9 data would need to be integrated from Five9 API
    // For now, return agents sorted by lowest performance (excludes hidden agents)
    let agents = visibleAgents.map((agent) => ({
      ...agent,
      ...getAgentStatsFromFirebase(agent.id || agent.email, dateFilter),
    }));

    if (selectedCenter !== "all") {
      agents = agents.filter((agent) => agent.center === selectedCenter);
    }

    return agents
      .sort((a, b) => parseFloat(a.conversionRate) - parseFloat(b.conversionRate))
      .slice(0, 10);
  };

  // Memoize expensive computed values for performance
  const strugglingAgents = useMemo(() => getStrugglingAgents(), [visibleAgents, firebaseLeads, allAgentsDateFilterType, allAgentsCustomStartDate, allAgentsCustomEndDate]);
  const worstAdherenceAgents = useMemo(() => getWorstAdherenceAgents(), [visibleAgents, selectedCenter, dateFilter, firebaseLeads]);
  const rankedTeams = useMemo(() => getAllTeamsData(), [teams, firebaseLeads, firebaseAgents]);
  const currentThemeStyles = themes[currentTheme];

  // Get overall company stats (uses visibleAgents to exclude hidden agents)
  const getCompanyStats = () => {
    let agents = visibleAgents;
    if (selectedCenter !== "all") {
      agents = agents.filter((agent) => agent.center === selectedCenter);
    }

    const allAgentStats = agents.map((agent) =>
      getAgentStatsFromFirebase(agent.id || agent.email, dateFilter)
    );

    const totalLeads = allAgentStats.reduce((sum, stats) => sum + parseInt(stats.leads || 0), 0);
    const totalReferrals = allAgentStats.reduce((sum, stats) => sum + parseInt(stats.referrals || 0), 0);
    const totalSales = allAgentStats.reduce(
      (sum, stats) => sum + parseInt(stats.sales || 0),
      0
    );

    return {
      totalAgents: agents.length,
      totalSales,
      totalLeads,
      totalReferrals,
      // True conversion rate: total sales / total leads (not average of individual rates)
      avgConversion: totalLeads > 0 ? ((totalSales / totalLeads) * 100).toFixed(1) : "0.0",
      referralRate: totalLeads > 0
        ? ((totalReferrals / totalLeads) * 100).toFixed(1)
        : "0.0",
      totalRevenue: allAgentStats.reduce(
        (sum, stats) => sum + (stats.revenue || 0),
        0
      ),
    };
  };

  const companyStats = useMemo(() => getCompanyStats(), [visibleAgents, selectedCenter, dateFilter, firebaseLeads]);
  const centers = ["denver"];

  if (viewingAgentDashboard) {
    return (
      <AgentDashboardView
        agent={viewingAgentDashboard}
        onBack={() => setViewingAgentDashboard(null)}
        user={user}
        leads={firebaseLeads}
      />
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${currentThemeStyles.primary} ${currentTheme === 'helloKitty' ? 'hello-kitty-active text-gray-800' : currentTheme === 'runescape' ? 'runescape-active text-white' : currentTheme.startsWith('halo') ? `halo-active ${currentTheme} text-white` : 'text-white'}`}
    >
      {/* Hello Kitty Decorations */}
      <HelloKittyDecorations isActive={currentTheme === 'helloKitty'} />
      <RuneScapeDecorations isActive={currentTheme === 'runescape'} />
      <HaloDecorations isActive={isHaloTheme(currentTheme)} />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-pulse">
          <div className={`px-6 py-4 rounded-lg shadow-2xl backdrop-blur-sm border ${
            toast.type === "success"
              ? "bg-green-600/90 border-green-400/50"
              : "bg-red-600/90 border-red-400/50"
          }`}>
            <div className="flex items-center gap-3">
              {toast.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-white" />
              )}
              <span className="text-white font-medium">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div
                className={`bg-gradient-to-r ${currentThemeStyles.accent} p-2 rounded-lg`}
              >
                <HelloKittyLogo isHelloKitty={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} isHalo={isHaloTheme(currentTheme)} className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {isEditingTeamName ? (
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      onBlur={handleTeamNameEdit}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleTeamNameEdit()
                      }
                      className="text-2xl font-bold bg-transparent border-b border-white/50 text-white focus:outline-none focus:border-white"
                      autoFocus
                    />
                  ) : (
                    <h1
                      className="text-2xl font-bold cursor-pointer hover:text-gray-300"
                      onClick={() => setIsEditingTeamName(true)}
                    >
                      {teamName}
                      <HelloKittyBow isActive={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} />
                    </h1>
                  )}
                  <Edit
                    className="w-4 h-4 cursor-pointer hover:text-gray-300"
                    onClick={() => setIsEditingTeamName(!isEditingTeamName)}
                  />
                </div>
                <p className={currentTheme === 'helloKitty' ? 'text-pink-700' : currentTheme === 'runescape' ? 'text-amber-400' : 'text-gray-300'}>Welcome, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSelector
                currentTheme={currentTheme}
                onThemeChange={setCurrentTheme}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              />
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${currentTheme === 'helloKitty' ? 'bg-pink-200' : currentTheme === 'runescape' ? 'bg-amber-900' : 'bg-slate-600'}`}>
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : currentTheme === 'helloKitty' ? (
                    <HelloKittyFace size={28} />
                  ) : currentTheme === 'runescape' ? (
                    <RuneScapeGnomeChild size={28} />
                  ) : (
                    <User className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <label className={`absolute -bottom-1 -right-1 rounded-full p-1 cursor-pointer ${currentTheme === 'helloKitty' ? 'bg-pink-500 hover:bg-pink-600' : currentTheme === 'runescape' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  <Camera className="w-3 h-3 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <button
                onClick={onSignOut}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${currentTheme === 'helloKitty' ? 'bg-pink-600 hover:bg-pink-700' : currentTheme === 'runescape' ? 'bg-amber-700 hover:bg-amber-800' : 'bg-red-600 hover:bg-red-700'}`}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-6">
        <div className="flex bg-white/10 rounded-lg p-1 mb-6 border border-white/20 overflow-x-auto">
          {[
            { key: "overview", label: "Overview", icon: BarChart3, iconType: "chart" },
            { key: "teams", label: "Teams", icon: Users2, iconType: "users" },
            { key: "myteam", label: "My Team", icon: Users, iconType: "users" },
            { key: "agents", label: "All Agents", icon: Users, iconType: "users" },
            { key: "performance", label: "Performance", icon: TrendingUp, iconType: "trending" },
            { key: "supervisor", label: "Supervisor Help", icon: Headphones, iconType: "headphones" },
            { key: "notifications", label: "Notifications", icon: Bell, iconType: "bell" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? `bg-gradient-to-r ${currentThemeStyles.accent} text-white`
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <HelloKittyIcon icon={tab.icon} iconType={tab.iconType} isHelloKitty={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} isHalo={isHaloTheme(currentTheme)} className="w-4 h-4 inline mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Date and Location Filters */}
            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
            >
              <div className="flex items-center gap-4 flex-wrap">
                <Calendar className="w-5 h-5 text-blue-400" />
                <label className="text-sm font-medium text-gray-300">
                  Date Filter:
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-slate-800 border border-white/20 rounded px-3 py-2 text-white"
                />
                <MapPin className="w-5 h-5 text-purple-400 ml-4" />
                <label className="text-sm font-medium text-gray-300">
                  Location:
                </label>
                <select
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  className="bg-slate-800 border border-white/20 rounded px-3 py-2 text-white"
                >
                  {centers.map((center) => (
                    <option
                      key={center}
                      value={center}
                      className="bg-slate-800"
                    >
                      {center === "all"
                        ? "All Centers"
                        : center.charAt(0).toUpperCase() + center.slice(1)}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-300 ml-4">
                  Showing data for {dateFilter ? (() => { const [y, m, d] = dateFilter.split('-'); return new Date(y, m - 1, d).toLocaleDateString(); })() : 'today'}
                </span>
                <button
                  onClick={handleRefreshData}
                  disabled={isRefreshing || dataLoading}
                  className={`ml-auto bg-gradient-to-r ${currentThemeStyles.accent} hover:shadow-lg px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50`}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>
              {lastRefresh && (
                <p className="text-xs text-gray-400 mt-2">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Main metrics */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center`}
              >
                <HelloKittyIcon icon={Users} iconType="users" isHelloKitty={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-gray-300 text-sm">Total Agents</p>
                <p className="text-xl font-bold text-white">
                  {companyStats.totalAgents}
                </p>
                <p className="text-xs text-gray-400">
                  Active: {companyStats.totalAgents}
                </p>
              </div>
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center`}
              >
                <HelloKittyIcon icon={Target} iconType="target" isHelloKitty={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-gray-300 text-sm">Total Sales</p>
                <p className="text-xl font-bold text-white">
                  {companyStats.totalSales}
                </p>
                <p className="text-xs text-green-400">
                  For {new Date(dateFilter).toLocaleDateString()}
                </p>
              </div>
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center`}
              >
                <HelloKittyIcon icon={Users} iconType="users" isHelloKitty={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <p className="text-gray-300 text-sm">Total Leads</p>
                <p className="text-xl font-bold text-white">
                  {companyStats.totalLeads}
                </p>
                <p className="text-xs text-cyan-400">
                  For {new Date(dateFilter).toLocaleDateString()}
                </p>
              </div>
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center`}
              >
                <HelloKittyIcon icon={TrendingUp} iconType="trending" isHelloKitty={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-gray-300 text-sm">Conversion Rate</p>
                <p className="text-xl font-bold text-white">
                  {companyStats.avgConversion}%
                </p>
                <p className="text-xs text-purple-400">Target: 30%</p>
              </div>
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center`}
              >
                <HelloKittyIcon icon={UserPlus} iconType="referral" isHelloKitty={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <p className="text-gray-300 text-sm">Total Referrals</p>
                <p className="text-xl font-bold text-white">
                  {companyStats.totalReferrals}
                </p>
                <p className="text-xs text-pink-400">
                  Rate: {companyStats.referralRate}%
                </p>
              </div>
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center`}
              >
                <HelloKittyIcon icon={DollarSign} iconType="dollar" isHelloKitty={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-gray-300 text-sm">Total Revenue</p>
                <p className="text-xl font-bold text-white">
                  ${companyStats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-yellow-400">
                  For {new Date(dateFilter).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Benchmark Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overall Team Benchmark */}
              <BenchmarkChart
                leads={firebaseLeads}
                title="Overall Sales Benchmark (All Agents)"
              />

              {/* Individual Agent Benchmark Selector */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <HelloKittyIcon icon={User} iconType="user" isHelloKitty={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} className="w-5 h-5 text-blue-400" />
                    Individual Agent Benchmark
                  </h3>
                  <select
                    value={benchmarkAgent?.email || ""}
                    onChange={(e) => {
                      const agent = visibleAgents.find(a => a.email === e.target.value);
                      setBenchmarkAgent(agent || null);
                    }}
                    className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="">Select an agent...</option>
                    {visibleAgents.map(agent => (
                      <option key={agent.id} value={agent.email}>
                        {agent.name || agent.email?.split('@')[0]}
                      </option>
                    ))}
                  </select>
                </div>
                {benchmarkAgent ? (
                  <BenchmarkChart
                    leads={firebaseLeads}
                    title={`${benchmarkAgent.name || benchmarkAgent.email?.split('@')[0]}'s Benchmark`}
                    agentFilter={benchmarkAgent.email || benchmarkAgent.id}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <HelloKittyIcon icon={User} iconType="user" isHelloKitty={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Select an agent to view their benchmark</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Team Performance Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
              >
                <h3 className="text-xl font-semibold mb-4">
                  Team Performance Ranking
                </h3>
                <div className="space-y-3">
                  {rankedTeams.slice(0, 9).map((team, index) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index < 3
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                              : "bg-slate-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{team.name}</p>
                          <p className="text-xs text-gray-400">
                            {team.supervisor}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">
                          {team.totalSales} sales
                        </p>
                        <p className="text-xs text-blue-400">
                          {team.avgConversion}% conv
                        </p>
                      </div>
                    </div>
                  ))}
                  {rankedTeams.length === 0 && (
                    <p className="text-gray-300 text-center py-8">
                      No teams configured yet
                    </p>
                  )}
                </div>
              </div>

              {/* Top 10 Struggling Agents */}
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
              >
                <h3 className="text-xl font-semibold mb-4">
                  Most Struggling Agents
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {strugglingAgents.length === 0 ? (
                    <p className="text-gray-300 text-center py-8">
                      No agent data available yet
                    </p>
                  ) : (
                    strugglingAgents.map((agent, index) => (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {agent.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {agent.team} • {agent.center?.toUpperCase() || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-400">
                            {agent.sales} sales
                          </p>
                          <p className="text-xs text-blue-400">
                            {agent.leads} leads
                          </p>
                          <p className="text-xs text-yellow-400">
                            {agent.conversionRate}% conv
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === "teams" && (
          <div className="space-y-6">
            {/* Create Team Modal */}
            {showCreateTeamModal && createPortal(
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg border border-white/20 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white">Create New Team</h3>
                    <button
                      onClick={() => setShowCreateTeamModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Team Name</label>
                      <input
                        type="text"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Enter team name..."
                        className="w-full bg-slate-700 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Supervisor Name</label>
                      <input
                        type="text"
                        value={newTeamSupervisor}
                        onChange={(e) => setNewTeamSupervisor(e.target.value)}
                        placeholder="Enter supervisor name..."
                        className="w-full bg-slate-700 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">
                        Select Agents ({selectedAgentsForTeam.length} selected)
                      </label>
                      <div className="bg-slate-700 rounded-lg p-3 max-h-48 overflow-y-auto">
                        {firebaseAgents.length === 0 ? (
                          <p className="text-gray-400 text-sm">No agents available</p>
                        ) : (
                          firebaseAgents.map((agent) => (
                            <label
                              key={agent.id}
                              className="flex items-center gap-3 p-2 hover:bg-slate-600 rounded-lg cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedAgentsForTeam.includes(agent.id)}
                                onChange={() => toggleAgentForTeam(agent.id)}
                                className="w-4 h-4 rounded border-gray-400"
                              />
                              <span className="text-white">{agent.name || agent.email}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setShowCreateTeamModal(false)}
                        className="flex-1 bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded-lg text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateTeam}
                        disabled={!newTeamName.trim() || isCreatingTeam}
                        className={`flex-1 bg-gradient-to-r ${currentThemeStyles.accent} hover:shadow-lg px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2 disabled:opacity-50`}
                      >
                        {isCreatingTeam ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Create Team
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}

            {/* Edit Team Modal */}
            {showEditTeamModal && createPortal(
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg border border-white/20 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white">Edit Team</h3>
                    <button
                      onClick={() => setShowEditTeamModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Team Name</label>
                      <input
                        type="text"
                        value={editTeamName}
                        onChange={(e) => setEditTeamName(e.target.value)}
                        placeholder="Enter team name..."
                        className="w-full bg-slate-700 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Supervisor Name</label>
                      <input
                        type="text"
                        value={editTeamSupervisor}
                        onChange={(e) => setEditTeamSupervisor(e.target.value)}
                        placeholder="Enter supervisor name..."
                        className="w-full bg-slate-700 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">
                        Select Agents ({editSelectedAgents.length} selected)
                      </label>
                      <div className="bg-slate-700 rounded-lg p-3 max-h-48 overflow-y-auto">
                        {firebaseAgents.length === 0 ? (
                          <p className="text-gray-400 text-sm">No agents available</p>
                        ) : (
                          firebaseAgents.map((agent) => (
                            <label
                              key={agent.id}
                              className="flex items-center gap-3 p-2 hover:bg-slate-600 rounded-lg cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={editSelectedAgents.includes(agent.id)}
                                onChange={() => toggleAgentForEdit(agent.id)}
                                className="w-4 h-4 rounded border-gray-400"
                              />
                              <span className="text-white">{agent.name || agent.email}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Team Goals Section */}
                    <div className="border-t border-white/10 pt-4 mt-4">
                      <h4 className="text-sm font-semibold text-white mb-3">Team Performance Goals</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">Daily Sales Goal</label>
                          <input
                            type="number"
                            min="1"
                            value={editTeamSalesGoal}
                            onChange={(e) => setEditTeamSalesGoal(e.target.value)}
                            className="w-full bg-slate-700 border border-white/20 rounded-lg px-4 py-2 text-white"
                          />
                          <p className="text-xs text-gray-400 mt-1">Red &lt; 70% | Yellow 70-99% | Green ≥ goal</p>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">Conversion Goal %</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={editTeamConversionGoal}
                            onChange={(e) => setEditTeamConversionGoal(e.target.value)}
                            className="w-full bg-slate-700 border border-white/20 rounded-lg px-4 py-2 text-white"
                          />
                          <p className="text-xs text-gray-400 mt-1">Red &lt; 80% | Yellow 80-99% | Green ≥ goal</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setShowEditTeamModal(false)}
                        className="flex-1 bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded-lg text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateTeam}
                        disabled={!editTeamName.trim()}
                        className={`flex-1 bg-gradient-to-r ${currentThemeStyles.accent} hover:shadow-lg px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2 disabled:opacity-50`}
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}

            {/* Filter Bar */}
            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-4 border border-white/20`}
            >
              <div className="flex gap-4 items-center flex-wrap">
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="all" className="bg-slate-800">
                    All Teams
                  </option>
                  {teams.map((team) => (
                    <option
                      key={team.id}
                      value={team.id}
                      className="bg-slate-800"
                    >
                      {team.name}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
                <span className="text-sm text-gray-300">
                  Showing data for {dateFilter ? (() => { const [y, m, d] = dateFilter.split('-'); return new Date(y, m - 1, d).toLocaleDateString(); })() : 'today'}
                </span>
              </div>
            </div>

            {/* Team Management Header */}
            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  Enhanced Team Management
                </h3>
                <button
                  onClick={() => setShowCreateTeamModal(true)}
                  className={`bg-gradient-to-r ${currentThemeStyles.accent} hover:shadow-lg px-4 py-2 rounded-lg flex items-center gap-2`}
                >
                  <Plus className="w-4 h-4" />
                  Create Team
                </button>
              </div>

              {/* Teams List with Metrics */}
              <div className="space-y-6">
                {teams.length === 0 ? (
                  <p className="text-gray-300 text-center py-8">
                    No teams configured yet. Create your first team to get
                    started.
                  </p>
                ) : (
                  teams
                    .filter(
                      (team) =>
                        selectedTeam === "all" || team.id === selectedTeam
                    )
                    .map((team) => {
                      const enhancedStats = getEnhancedTeamStats(team);
                      const salesGoal = team.salesGoal || 3;
                      const conversionGoal = team.conversionGoal || 30;

                      // Helper function for color-coding metrics (text colors only)
                      const getSalesColor = (sales) => {
                        const val = parseInt(sales);
                        if (val >= salesGoal) return "text-green-400";
                        if (val >= salesGoal * 0.7) return "text-yellow-400";
                        return "text-red-400";
                      };

                      const getConversionColor = (rate) => {
                        const val = parseFloat(rate);
                        if (val >= conversionGoal) return "text-green-400";
                        if (val >= conversionGoal * 0.8) return "text-yellow-400";
                        return "text-red-400";
                      };

                      return (
                        <div
                          key={team.id}
                          className="bg-white/5 rounded-lg overflow-hidden"
                        >
                          {/* Team Header */}
                          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-semibold text-white">
                                {team.name}
                              </h4>
                              <span className="bg-white/20 px-2 py-0.5 rounded text-xs text-white">
                                {enhancedStats.memberCount} agents
                              </span>
                              <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-white/70">
                                Goals: {salesGoal} sales | {conversionGoal}% conv
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-white/80 text-sm">{team.supervisor}</span>
                              <button
                                onClick={() => openEditTeamModal(team)}
                                className="text-white/60 hover:text-white"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Metrics Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-700/50">
                                  <th className="text-left px-3 py-2 text-gray-300 font-medium sticky left-0 bg-slate-700/50">Agent</th>
                                  <th className="text-center px-3 py-2 text-gray-300 font-medium">Leads</th>
                                  <th className="text-center px-3 py-2 text-gray-300 font-medium">Sales</th>
                                  <th className="text-center px-3 py-2 text-gray-300 font-medium">Conv %</th>
                                  <th className="text-center px-3 py-2 text-gray-300 font-medium">Ref %</th>
                                  <th className="text-center px-3 py-2 text-gray-300 font-medium">Ref Sales</th>
                                  <th className="text-center px-3 py-2 text-gray-300 font-medium">Dash Sales</th>
                                  <th className="text-center px-3 py-2 text-gray-300 font-medium">Revenue</th>
                                </tr>
                              </thead>
                              <tbody>
                                {enhancedStats.members.length === 0 ? (
                                  <tr>
                                    <td colSpan="8" className="text-center py-4 text-gray-400">
                                      No agents assigned to this team yet
                                    </td>
                                  </tr>
                                ) : (
                                  <>
                                    {enhancedStats.members.map((member) => (
                                      <tr key={member.id} className="border-t border-slate-600/30 hover:bg-slate-700/30">
                                        <td className="px-3 py-2 text-white font-medium sticky left-0 bg-slate-800/80">
                                          {member.name || member.email?.split('@')[0] || 'Unknown'}
                                        </td>
                                        <td className="text-center px-3 py-2 text-white">{member.leads}</td>
                                        <td className={`text-center px-3 py-2 font-semibold ${getSalesColor(member.sales)}`}>{member.sales}</td>
                                        <td className={`text-center px-3 py-2 font-semibold ${getConversionColor(member.conversionRate)}`}>
                                          {member.conversionRate}%
                                        </td>
                                        <td className="text-center px-3 py-2 text-white">
                                          {member.referralRate}%
                                        </td>
                                        <td className="text-center px-3 py-2 text-white">{member.referrals}</td>
                                        <td className="text-center px-3 py-2 text-white">{member.dashSales}</td>
                                        <td className="text-center px-3 py-2 text-green-400 font-semibold">${member.revenue}</td>
                                      </tr>
                                    ))}
                                    {/* Team Totals Row */}
                                    <tr className="bg-blue-600/30 border-t-2 border-blue-400 font-semibold">
                                      <td className="px-3 py-2 text-white sticky left-0 bg-blue-600/50">
                                        Team {team.name} Totals
                                      </td>
                                      <td className="text-center px-3 py-2 text-white">{enhancedStats.totalLeads}</td>
                                      <td className={`text-center px-3 py-2 ${getSalesColor(enhancedStats.totalSales)}`}>{enhancedStats.totalSales}</td>
                                      <td className={`text-center px-3 py-2 ${getConversionColor(enhancedStats.avgConversion)}`}>
                                        {enhancedStats.avgConversion}%
                                      </td>
                                      <td className="text-center px-3 py-2 text-white">
                                        {enhancedStats.avgRefRate}%
                                      </td>
                                      <td className="text-center px-3 py-2 text-white">{enhancedStats.totalReferrals}</td>
                                      <td className="text-center px-3 py-2 text-white">{enhancedStats.totalDashSales}</td>
                                      <td className="text-center px-3 py-2 text-green-400 font-semibold">${enhancedStats.totalRevenue}</td>
                                    </tr>
                                  </>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "myteam" && (
          <div className="space-y-6">
            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`bg-gradient-to-r ${currentThemeStyles.accent} p-3 rounded-xl`}
                  >
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      My Team Management
                    </h3>
                    <p className="text-gray-300">
                      Manage your direct reports and set goals
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={myTeamDateFilterType}
                    onChange={(e) => setMyTeamDateFilterType(e.target.value)}
                    className="bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="today">Today</option>
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  {myTeamDateFilterType === "custom" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={myTeamCustomStartDate}
                        onChange={(e) => setMyTeamCustomStartDate(e.target.value)}
                        className="bg-slate-800 border border-white/20 rounded-lg px-2 py-2 text-white text-sm"
                      />
                      <span className="text-gray-400">to</span>
                      <input
                        type="date"
                        value={myTeamCustomEndDate}
                        onChange={(e) => setMyTeamCustomEndDate(e.target.value)}
                        className="bg-slate-800 border border-white/20 rounded-lg px-2 py-2 text-white text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Date Range Indicator */}
              <div className="mb-4 text-center">
                <span className="text-gray-300 text-sm">
                  Showing data for:{" "}
                  <span className="text-white font-medium">
                    {myTeamDateFilterType === "today" && "Today"}
                    {myTeamDateFilterType === "this_week" && "This Week"}
                    {myTeamDateFilterType === "this_month" && "This Month"}
                    {myTeamDateFilterType === "custom" && `${myTeamCustomStartDate} to ${myTeamCustomEndDate}`}
                  </span>
                </span>
              </div>

              {/* My Team Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className={`rounded-lg p-4 text-center ${currentTheme === 'helloKitty' ? 'bg-pink-200/50' : currentTheme === 'runescape' ? 'bg-amber-500/20' : 'bg-blue-500/20'}`}>
                  <HelloKittyIcon icon={Users} iconType="users" isHelloKitty={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                  <p className="text-blue-300 text-sm">Team Members</p>
                  <p className="text-2xl font-bold text-white">
                    {myTeamAgents.length}
                  </p>
                </div>
                <div className={`rounded-lg p-4 text-center ${currentTheme === 'helloKitty' ? 'bg-pink-200/50' : currentTheme === 'runescape' ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
                  <HelloKittyIcon icon={Target} iconType="target" isHelloKitty={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <p className="text-green-300 text-sm">Total Sales</p>
                  <p className="text-2xl font-bold text-white">
                    {myTeamAgents.reduce(
                      (sum, member) =>
                        sum + getAgentStatsForDateRange(member.id || member.email).sales,
                      0
                    )}
                  </p>
                </div>
                <div className={`rounded-lg p-4 text-center ${currentTheme === 'helloKitty' ? 'bg-pink-200/50' : currentTheme === 'runescape' ? 'bg-amber-600/20' : 'bg-purple-500/20'}`}>
                  <HelloKittyIcon icon={TrendingUp} iconType="trending" isHelloKitty={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                  <p className="text-purple-300 text-sm">Conversion</p>
                  <p className="text-2xl font-bold text-white">
                    {(() => {
                      const totalLeads = myTeamAgents.reduce(
                        (sum, member) =>
                          sum + getAgentStatsForDateRange(member.id || member.email).leads,
                        0
                      );
                      const totalSales = myTeamAgents.reduce(
                        (sum, member) =>
                          sum + getAgentStatsForDateRange(member.id || member.email).sales,
                        0
                      );
                      return totalLeads > 0
                        ? ((totalSales / totalLeads) * 100).toFixed(1)
                        : 0;
                    })()}%
                  </p>
                </div>
                <div className={`rounded-lg p-4 text-center ${currentTheme === 'helloKitty' ? 'bg-pink-200/50' : currentTheme === 'runescape' ? 'bg-yellow-600/20' : 'bg-yellow-500/20'}`}>
                  <HelloKittyIcon icon={DollarSign} iconType="dollar" isHelloKitty={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                  <p className="text-yellow-300 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    $
                    {myTeamAgents
                      .reduce(
                        (sum, member) =>
                          sum + getAgentStatsForDateRange(member.id || member.email).revenue,
                        0
                      )
                      .toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Team Performance Breakdown - Like Teams Tab */}
              {myTeamAgents.length > 0 && (
                <div className="bg-white/5 rounded-lg overflow-hidden mb-6">
                  {/* Team Header */}
                  <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-semibold text-white">
                        My Team Performance Breakdown
                      </h4>
                      <span className="bg-white/20 px-2 py-0.5 rounded text-xs text-white">
                        {myTeamAgents.length} agents
                      </span>
                      <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-white/70">
                        Goals: {teamSalesGoal || 10} sales | {teamConversionGoal || 25}% conv
                      </span>
                    </div>
                  </div>

                  {/* Team Overview Pie Chart - What the entire team struggled with */}
                  {(() => {
                    const teamStruggles = getTeamStruggledLeads();
                    if (teamStruggles.length > 0) {
                      return (
                        <div className="bg-red-900/20 border-b border-red-500/30 px-4 py-4">
                          <div className="flex items-start gap-6">
                            <div className="flex-1">
                              <h5 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Team Struggles Overview - Lead Types That Need Attention
                              </h5>
                              <p className="text-gray-400 text-sm mb-3">
                                These are the lead types your team struggled to convert during this period
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <MiniPieChart data={teamStruggles} size={100} showLegend={true} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                            {teamStruggles.slice(0, 8).map((item, index) => (
                              <div key={index} className="bg-red-900/30 rounded px-2 py-1 text-xs">
                                <span className="text-white font-medium">{item.label}</span>
                                <span className="text-red-300 ml-2">{item.value} lost</span>
                                <span className="text-gray-400 ml-1">({item.conversionRate}% conv)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Metrics Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-700/50">
                          <th className="text-left px-3 py-2 text-gray-300 font-medium sticky left-0 bg-slate-700/50">Agent</th>
                          <th className="text-center px-3 py-2 text-gray-300 font-medium">Leads</th>
                          <th className="text-center px-3 py-2 text-gray-300 font-medium">Sales</th>
                          <th className="text-center px-3 py-2 text-gray-300 font-medium">Conv %</th>
                          <th className="text-center px-3 py-2 text-gray-300 font-medium">Ref Sales</th>
                          <th className="text-center px-3 py-2 text-gray-300 font-medium">Dash Sales</th>
                          <th className="text-center px-3 py-2 text-gray-300 font-medium">Revenue</th>
                          <th className="text-left px-3 py-2 text-gray-300 font-medium min-w-[220px]">Struggled Leads</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myTeamAgents.map((member) => {
                          const stats = getAgentStatsForDateRange(member.id || member.email);
                          const struggledLeads = getAgentStruggledLeads(member.id || member.email);
                          const salesGoal = teamSalesGoal || 10;
                          const conversionGoal = teamConversionGoal || 25;

                          const getSalesColor = (sales) => {
                            if (sales >= salesGoal) return "text-green-400";
                            if (sales >= salesGoal * 0.7) return "text-yellow-400";
                            return "text-red-400";
                          };

                          const getConversionColor = (rate) => {
                            const val = parseFloat(rate);
                            if (val >= conversionGoal) return "text-green-400";
                            if (val >= conversionGoal * 0.8) return "text-yellow-400";
                            return "text-red-400";
                          };

                          return (
                            <tr key={member.id} className="border-t border-slate-600/30 hover:bg-slate-700/30">
                              <td className="px-3 py-2 text-white font-medium sticky left-0 bg-slate-800/80">
                                {member.name || member.email?.split('@')[0] || 'Unknown'}
                              </td>
                              <td className="text-center px-3 py-2 text-white">{stats.leads}</td>
                              <td className={`text-center px-3 py-2 font-semibold ${getSalesColor(stats.sales)}`}>{stats.sales}</td>
                              <td className={`text-center px-3 py-2 font-semibold ${getConversionColor(stats.conversionRate)}`}>
                                {stats.conversionRate}%
                              </td>
                              <td className="text-center px-3 py-2 text-white">{stats.referrals}</td>
                              <td className="text-center px-3 py-2 text-white">{stats.dashSales}</td>
                              <td className="text-center px-3 py-2 text-green-400 font-semibold">${stats.revenue}</td>
                              <td className="px-3 py-2">
                                <MiniPieChart data={struggledLeads} size={60} showLegend={true} />
                              </td>
                            </tr>
                          );
                        })}
                        {/* Team Totals Row */}
                        {(() => {
                          const totals = myTeamAgents.reduce((acc, member) => {
                            const stats = getAgentStatsForDateRange(member.id || member.email);
                            return {
                              leads: acc.leads + stats.leads,
                              sales: acc.sales + stats.sales,
                              referrals: acc.referrals + stats.referrals,
                              dashSales: acc.dashSales + stats.dashSales,
                              revenue: acc.revenue + stats.revenue,
                            };
                          }, { leads: 0, sales: 0, referrals: 0, dashSales: 0, revenue: 0 });

                          const totalConversion = totals.leads > 0
                            ? ((totals.sales / totals.leads) * 100).toFixed(1)
                            : "0.0";

                          const salesGoal = teamSalesGoal || 10;
                          const conversionGoal = teamConversionGoal || 25;

                          const getSalesColor = (sales) => {
                            if (sales >= salesGoal * myTeamAgents.length) return "text-green-400";
                            if (sales >= salesGoal * myTeamAgents.length * 0.7) return "text-yellow-400";
                            return "text-red-400";
                          };

                          const getConversionColor = (rate) => {
                            const val = parseFloat(rate);
                            if (val >= conversionGoal) return "text-green-400";
                            if (val >= conversionGoal * 0.8) return "text-yellow-400";
                            return "text-red-400";
                          };

                          return (
                            <tr className="bg-green-600/30 border-t-2 border-green-400 font-semibold">
                              <td className="px-3 py-2 text-white sticky left-0 bg-green-600/50">
                                Team Totals
                              </td>
                              <td className="text-center px-3 py-2 text-white">{totals.leads}</td>
                              <td className={`text-center px-3 py-2 ${getSalesColor(totals.sales)}`}>{totals.sales}</td>
                              <td className={`text-center px-3 py-2 ${getConversionColor(totalConversion)}`}>
                                {totalConversion}%
                              </td>
                              <td className="text-center px-3 py-2 text-white">{totals.referrals}</td>
                              <td className="text-center px-3 py-2 text-white">{totals.dashSales}</td>
                              <td className="text-center px-3 py-2 text-green-400">${totals.revenue}</td>
                              <td className="px-3 py-2 text-gray-400 text-xs">See overview above</td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Add/Remove Agents */}
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Add Agents to Your Team
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {visibleAgents
                    .filter(
                      (agent) => !myTeamAgents.some((ta) => ta.id === agent.id)
                    )
                    .map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between bg-white/5 rounded-lg p-2"
                      >
                        <span className="text-white text-sm">{agent.name || agent.email}</span>
                        <button
                          onClick={() => addAgentToTeam(agent.id)}
                          className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-white text-xs"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  {visibleAgents.filter(
                    (agent) => !myTeamAgents.some((ta) => ta.id === agent.id)
                  ).length === 0 && (
                    <p className="text-gray-300 text-sm col-span-3">
                      {visibleAgents.length === 0 ? "No agents registered yet" : "All available agents are already on your team"}
                    </p>
                  )}
                </div>
              </div>

              {/* Team Members with Goals */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">
                  Team Members & Goals
                </h4>
                {myTeamAgents.length === 0 ? (
                  <p className="text-gray-300 text-center py-8">
                    No agents in your team yet. Add agents above to get started.
                  </p>
                ) : (
                  myTeamAgents.map((member) => {
                    const memberStats = getAgentStatsForDateRange(member.id || member.email);
                    const memberGoals = globalAgentGoals[member.email] || {
                      dailySales: teamSalesGoal || 10,
                      weeklySales: 50,
                      monthlyGoal: 120,
                      conversionRate: teamConversionGoal || 25,
                      referralRate: 15,
                    };
                    return (
                      <div
                        key={member.id}
                        className="bg-white/5 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <HelloKittyAvatar name={member.name} isHelloKitty={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} className="w-12 h-12" />
                            <div>
                              <h5 className="font-semibold text-white">
                                {member.name}
                              </h5>
                              <p className="text-sm text-gray-300">
                                {member.center?.toUpperCase() || "No Center"}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setSelectedAgent({
                                  ...member,
                                  ...memberStats,
                                  leadsList: memberStats.leadsList,
                                })
                              }
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => setViewingAgentDashboard(member)}
                              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm"
                            >
                              View Dashboard
                            </button>
                            <button
                              onClick={() => removeAgentFromTeam(member.id)}
                              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-gray-300 text-sm">Sales Today</p>
                            <p
                              className={`text-xl font-bold ${
                                memberStats.sales >= memberGoals.dailySales
                                  ? "text-green-400"
                                  : "text-yellow-400"
                              }`}
                            >
                              {memberStats.sales}
                            </p>
                            <p className="text-xs text-gray-400">
                              Goal: {memberGoals.dailySales}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-300 text-sm">
                              Conversion Rate
                            </p>
                            <p
                              className={`text-xl font-bold ${
                                parseFloat(memberStats.conversionRate) >=
                                memberGoals.conversionRate
                                  ? "text-green-400"
                                  : "text-yellow-400"
                              }`}
                            >
                              {memberStats.conversionRate}%
                            </p>
                            <p className="text-xs text-gray-400">
                              Goal: {memberGoals.conversionRate}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-300 text-sm">Leads Today</p>
                            <p className="text-xl font-bold text-white">
                              {memberStats.leads}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-300 text-sm">Revenue</p>
                            <p className="text-xl font-bold text-yellow-400">
                              ${memberStats.revenue}
                            </p>
                          </div>
                        </div>

                        {/* Goal Setting */}
                        <div className="grid grid-cols-5 gap-2">
                          <div>
                            <label className="block text-xs text-gray-300 mb-1">
                              Daily Sales
                            </label>
                            <input
                              type="number"
                              value={memberGoals.dailySales}
                              onChange={(e) =>
                                setAgentGoal(
                                  member.email,
                                  "dailySales",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full bg-slate-800 border border-white/20 rounded px-2 py-1 text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-300 mb-1">
                              Weekly Sales
                            </label>
                            <input
                              type="number"
                              value={memberGoals.weeklySales}
                              onChange={(e) =>
                                setAgentGoal(
                                  member.email,
                                  "weeklySales",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full bg-slate-800 border border-white/20 rounded px-2 py-1 text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-300 mb-1">
                              Monthly Sales
                            </label>
                            <input
                              type="number"
                              value={memberGoals.monthlyGoal}
                              onChange={(e) =>
                                setAgentGoal(
                                  member.email,
                                  "monthlyGoal",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full bg-slate-800 border border-white/20 rounded px-2 py-1 text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-300 mb-1">
                              Conv Goal %
                            </label>
                            <input
                              type="number"
                              value={memberGoals.conversionRate}
                              onChange={(e) =>
                                setAgentGoal(
                                  member.email,
                                  "conversionRate",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full bg-slate-800 border border-white/20 rounded px-2 py-1 text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-300 mb-1">
                              Ref Goal %
                            </label>
                            <input
                              type="number"
                              value={memberGoals.referralRate}
                              onChange={(e) =>
                                setAgentGoal(
                                  member.email,
                                  "referralRate",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full bg-slate-800 border border-white/20 rounded px-2 py-1 text-white text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Team Goals - Using controlled inputs */}
              <div className="mt-6 bg-white/10 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Team Goals
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Team Sales Goal (Daily)
                    </label>
                    <input
                      type="number"
                      value={teamSalesGoalInput}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // Update local input state immediately for responsive typing
                        setTeamSalesGoalInput(inputValue);

                        // Debounce the expensive state update
                        if (teamGoalsDebounceRef.current) {
                          clearTimeout(teamGoalsDebounceRef.current);
                        }
                        teamGoalsDebounceRef.current = setTimeout(() => {
                          if (inputValue === '') {
                            setTeamSalesGoal(0);
                            globalTeamGoals.salesGoal = 0;
                          } else {
                            const val = parseInt(inputValue, 10);
                            if (!isNaN(val)) {
                              setTeamSalesGoal(val);
                              globalTeamGoals.salesGoal = val;
                            }
                          }
                        }, 300);
                      }}
                      onBlur={(e) => {
                        // On blur, ensure we have a valid number (default to 0)
                        if (teamGoalsDebounceRef.current) {
                          clearTimeout(teamGoalsDebounceRef.current);
                        }
                        const inputValue = e.target.value;
                        if (inputValue === '' || isNaN(parseInt(inputValue, 10))) {
                          setTeamSalesGoalInput('0');
                          setTeamSalesGoal(0);
                          globalTeamGoals.salesGoal = 0;
                        } else {
                          const val = parseInt(inputValue, 10);
                          setTeamSalesGoal(val);
                          globalTeamGoals.salesGoal = val;
                        }
                      }}
                      className="w-full bg-slate-800 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Team Conversion Goal (%)
                    </label>
                    <input
                      type="number"
                      value={teamConversionGoalInput}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // Update local input state immediately for responsive typing
                        setTeamConversionGoalInput(inputValue);

                        // Debounce the expensive state update
                        if (teamGoalsDebounceRef.current) {
                          clearTimeout(teamGoalsDebounceRef.current);
                        }
                        teamGoalsDebounceRef.current = setTimeout(() => {
                          if (inputValue === '') {
                            setTeamConversionGoal(0);
                            globalTeamGoals.conversionGoal = 0;
                          } else {
                            const val = parseInt(inputValue, 10);
                            if (!isNaN(val)) {
                              setTeamConversionGoal(val);
                              globalTeamGoals.conversionGoal = val;
                            }
                          }
                        }, 300);
                      }}
                      onBlur={(e) => {
                        // On blur, ensure we have a valid number (default to 0)
                        if (teamGoalsDebounceRef.current) {
                          clearTimeout(teamGoalsDebounceRef.current);
                        }
                        const inputValue = e.target.value;
                        if (inputValue === '' || isNaN(parseInt(inputValue, 10))) {
                          setTeamConversionGoalInput('0');
                          setTeamConversionGoal(0);
                          globalTeamGoals.conversionGoal = 0;
                        } else {
                          const val = parseInt(inputValue, 10);
                          setTeamConversionGoal(val);
                          globalTeamGoals.conversionGoal = val;
                        }
                      }}
                      className="w-full bg-slate-800 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <button
                  onClick={async () => {
                    // Clear any pending debounce
                    if (teamGoalsDebounceRef.current) {
                      clearTimeout(teamGoalsDebounceRef.current);
                    }
                    // Parse the latest input values directly
                    const salesVal = parseInt(teamSalesGoalInput, 10) || 0;
                    const convVal = parseInt(teamConversionGoalInput, 10) || 0;
                    // Sync state
                    setTeamSalesGoal(salesVal);
                    setTeamConversionGoal(convVal);
                    globalTeamGoals.salesGoal = salesVal;
                    globalTeamGoals.conversionGoal = convVal;
                    const goals = {
                      salesGoal: salesVal,
                      conversionGoal: convVal,
                    };
                    try {
                      await updateMyTeamGoals(goals);
                      showToast("Team goals updated successfully!", "success");
                    } catch (error) {
                      showToast("Error updating team goals: " + error.message, "error");
                    }
                  }}
                  className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
                >
                  Update Team Goals
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "agents" && (
          <div className="space-y-6">
            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-4 border border-white/20`}
            >
              <div className="flex gap-4 items-center flex-wrap">
                <Calendar className="w-5 h-5 text-blue-400" />
                <label className="text-sm font-medium text-gray-300">
                  Date Filter:
                </label>
                <select
                  value={allAgentsDateFilterType}
                  onChange={(e) => setAllAgentsDateFilterType(e.target.value)}
                  className="bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="today">Today</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
                {allAgentsDateFilterType === "custom" && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={allAgentsCustomStartDate}
                      onChange={(e) => setAllAgentsCustomStartDate(e.target.value)}
                      className="bg-slate-800 border border-white/20 rounded px-2 py-1 text-white text-sm"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="date"
                      value={allAgentsCustomEndDate}
                      onChange={(e) => setAllAgentsCustomEndDate(e.target.value)}
                      className="bg-slate-800 border border-white/20 rounded px-2 py-1 text-white text-sm"
                    />
                  </div>
                )}
                <span className="text-sm text-gray-400 ml-2">
                  Showing: {allAgentsDateFilterType === "today" && "Today"}
                  {allAgentsDateFilterType === "this_week" && "This Week"}
                  {allAgentsDateFilterType === "this_month" && "This Month"}
                  {allAgentsDateFilterType === "custom" && `${allAgentsCustomStartDate} to ${allAgentsCustomEndDate}`}
                </span>
              </div>
            </div>
            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
            >
              <h3 className="text-xl font-semibold mb-6">
                All Agents Performance
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 text-gray-300">
                        #
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300">
                        Agent
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300">
                        Team
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300">
                        Leads
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300">
                        Sales
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300">
                        Conversion
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300">
                        Revenue
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {strugglingAgents.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="text-center py-8 text-gray-300"
                        >
                          No agent data available yet
                        </td>
                      </tr>
                    ) : (
                      strugglingAgents.map((agent, index) => {
                        return (
                          <tr
                            key={agent.id}
                            className="border-b border-white/10 hover:bg-white/5"
                          >
                            <td className="py-3 px-4 text-gray-400">
                              {index + 1}
                            </td>
                            <td className="py-3 px-4 font-medium text-white">
                              {agent.name}
                            </td>
                            <td className="py-3 px-4 text-gray-300">
                              {agent.teamName || "No Team"}
                            </td>
                            <td className="py-3 px-4 text-gray-300">
                              {agent.leads}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`font-bold ${
                                  agent.sales >= 5
                                    ? "text-green-400"
                                    : agent.sales >= 2
                                    ? "text-yellow-400"
                                    : "text-red-400"
                                }`}
                              >
                                {agent.sales}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`font-bold ${
                                  parseFloat(agent.conversionRate) >= 25
                                    ? "text-green-400"
                                    : parseFloat(agent.conversionRate) >= 15
                                    ? "text-yellow-400"
                                    : "text-red-400"
                                }`}
                              >
                                {agent.conversionRate}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-green-400 font-medium">
                              ${agent.revenue}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    setSelectedAgent({
                                      ...agent,
                                      leadsList: agent.leadsList,
                                    })
                                  }
                                  className="text-blue-400 hover:text-blue-300 text-sm"
                                >
                                  View Profile
                                </button>
                                <button
                                  onClick={async () => {
                                    if (window.confirm(`Remove ${agent.name} from the lead tracker? Their data will be preserved.`)) {
                                      await hideAgent(agent.id);
                                      showToast(`${agent.name} has been removed from the tracker`, "success");
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {/* Show hidden agents section for restoration */}
              {hiddenAgentIds.length > 0 && (
                <div className="mt-6 border-t border-white/10 pt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">
                    Hidden Agents ({hiddenAgentIds.length}) - Click to restore
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {firebaseAgents
                      .filter(agent => hiddenAgentIds.includes(agent.id))
                      .map(agent => (
                        <button
                          key={agent.id}
                          onClick={async () => {
                            await unhideAgent(agent.id);
                            showToast(`${agent.name} has been restored`, "success");
                          }}
                          className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-sm text-gray-300 hover:text-white flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          {agent.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "performance" && (() => {
          const perfStats = getPerformanceStats();
          return (
          <div className="space-y-6">
            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-4 border border-white/20`}
            >
              <div className="flex items-center gap-4 flex-wrap">
                <Calendar className="w-5 h-5 text-blue-400" />
                <label className="text-sm font-medium text-gray-300">
                  Date Filter:
                </label>
                <select
                  value={perfDateFilterType}
                  onChange={(e) => setPerfDateFilterType(e.target.value)}
                  className="bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="today">Today</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
                {perfDateFilterType === "custom" && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={perfCustomStartDate}
                      onChange={(e) => setPerfCustomStartDate(e.target.value)}
                      className="bg-slate-800 border border-white/20 rounded px-2 py-1 text-white text-sm"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="date"
                      value={perfCustomEndDate}
                      onChange={(e) => setPerfCustomEndDate(e.target.value)}
                      className="bg-slate-800 border border-white/20 rounded px-2 py-1 text-white text-sm"
                    />
                  </div>
                )}
                <span className="text-sm text-gray-400 ml-2">
                  Showing: {perfStats.periodLabel}
                </span>

                <div className="border-l border-white/20 h-6 mx-2" />

                <Filter className="w-5 h-5 text-purple-400" />
                <label className="text-sm font-medium text-gray-300">
                  Lead Type:
                </label>
                <select
                  value={perfLeadTypeFilter}
                  onChange={(e) => setPerfLeadTypeFilter(e.target.value)}
                  className="bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white max-w-xs"
                >
                  <option value="all">All Lead Types</option>
                  {perfLeadTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.split(" - ")[0]}
                    </option>
                  ))}
                </select>
                {perfLeadTypeFilter !== "all" && (
                  <button
                    onClick={() => setPerfLeadTypeFilter("all")}
                    className="text-gray-400 hover:text-white text-sm underline"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {/* Filtered Leads Display - Shows when a lead type is selected */}
            {perfLeadTypeFilter !== "all" && (() => {
              const { startDate, endDate } = getPerfDateRange();

              // Get all leads in date range for total count
              const allLeadsInRange = firebaseLeads.filter(lead => {
                const leadDate = lead.timestamp instanceof Date ? lead.timestamp : new Date(lead.timestamp);
                return leadDate >= startDate && leadDate < endDate;
              });
              const totalLeadsInRange = allLeadsInRange.length;

              const filteredLeads = allLeadsInRange.filter(lead => {
                const matchesType = lead.leadType === perfLeadTypeFilter ||
                  lead.leadType?.startsWith(perfLeadTypeFilter.split(" - ")[0]);
                return matchesType;
              });

              // Get agent info for each lead
              const leadsWithAgentInfo = filteredLeads.map(lead => {
                const agent = firebaseAgents.find(a => a.id === lead.agent || a.email === lead.agentEmail);
                return {
                  ...lead,
                  agentName: agent?.name || lead.agentEmail || "Unknown Agent",
                  agentEmail: agent?.email || lead.agentEmail || ""
                };
              }).sort((a, b) => {
                const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
                const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
                return dateB - dateA;
              });

              // CSV Export function
              const exportToCSV = () => {
                const headers = ['Agent Name', 'Agent Email', 'Client Name', 'Carrier', 'Lead Type', 'Notes', 'CRM Link', 'Date', 'Time', 'Sale', 'Commission', 'HRA', 'HRA Value'];
                const csvRows = [headers.join(',')];

                leadsWithAgentInfo.forEach(lead => {
                  const leadDate = lead.timestamp instanceof Date ? lead.timestamp : new Date(lead.timestamp);
                  const row = [
                    `"${(lead.agentName || '').replace(/"/g, '""')}"`,
                    `"${(lead.agentEmail || '').replace(/"/g, '""')}"`,
                    `"${(lead.clientName || '').replace(/"/g, '""')}"`,
                    `"${(lead.carrier || '').replace(/"/g, '""')}"`,
                    `"${(lead.leadType || '').replace(/"/g, '""')}"`,
                    `"${(lead.notes || '').replace(/"/g, '""')}"`,
                    `"${(lead.crmLink || '').replace(/"/g, '""')}"`,
                    `"${leadDate.toLocaleDateString()}"`,
                    `"${leadDate.toLocaleTimeString()}"`,
                    lead.sale ? 'Yes' : 'No',
                    lead.sale ? (lead.commission || 0) : 0,
                    lead.hra ? 'Yes' : 'No',
                    lead.hra ? (lead.hraValue || 0) : 0
                  ];
                  csvRows.push(row.join(','));
                });

                const csvContent = csvRows.join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                const fileName = `leads_${perfLeadTypeFilter.split(" - ")[0].replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              };

              return (
                <div className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Filter className="w-5 h-5 text-purple-400" />
                      Filtered Leads: {perfLeadTypeFilter.split(" - ")[0]}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 text-sm">
                        {leadsWithAgentInfo.length} lead{leadsWithAgentInfo.length !== 1 ? 's' : ''} found out of {totalLeadsInRange} total leads
                      </span>
                      {leadsWithAgentInfo.length > 0 && (
                        <button
                          onClick={exportToCSV}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Export CSV
                        </button>
                      )}
                    </div>
                  </div>

                  {leadsWithAgentInfo.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No leads found for this type in the selected date range.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Agent</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Client</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Carrier</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Notes</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">CRM Link</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Sale</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Commission</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leadsWithAgentInfo.map((lead, index) => {
                            const leadDate = lead.timestamp instanceof Date ? lead.timestamp : new Date(lead.timestamp);
                            return (
                              <tr key={lead.id || index} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-3 px-4">
                                  <div>
                                    <p className="text-white font-medium">{lead.agentName}</p>
                                    <p className="text-gray-500 text-xs">{lead.agentEmail}</p>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-white">
                                  {lead.clientName || "-"}
                                </td>
                                <td className="py-3 px-4 text-gray-300">
                                  {lead.carrier || "-"}
                                </td>
                                <td className="py-3 px-4">
                                  <p className="text-gray-300 max-w-xs truncate" title={lead.notes}>
                                    {lead.notes || "-"}
                                  </p>
                                </td>
                                <td className="py-3 px-4">
                                  {lead.crmLink ? (
                                    <a
                                      href={lead.crmLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                      View
                                    </a>
                                  ) : (
                                    <span className="text-gray-500">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-gray-300 text-sm">
                                  {leadDate.toLocaleDateString()} {leadDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="py-3 px-4">
                                  {lead.sale ? (
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Yes</span>
                                  ) : (
                                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">No</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-white">
                                  {lead.sale ? `$${lead.commission || 0}` : "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Sales Performance
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">{perfStats.periodLabel} Sales:</span>
                    <span className="text-white font-bold">
                      {perfStats.currentSales}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Previous Period:</span>
                    <span className="text-gray-400">{perfStats.previousSales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Growth:</span>
                    <span className={`font-bold ${parseFloat(perfStats.salesGrowth) >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {parseFloat(perfStats.salesGrowth) >= 0 ? "+" : ""}{perfStats.salesGrowth}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Leads:</span>
                    <span className="text-blue-400 font-bold">
                      {perfStats.totalLeads}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Conversion Rates
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Team Average:</span>
                    <span className="text-white font-bold">
                      {perfStats.avgConversion}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Target:</span>
                    <span className="text-gray-400">30%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Best Agent:</span>
                    <div className="text-right">
                      <span className="text-green-400 font-bold">
                        {perfStats.bestAgent.name}
                      </span>
                      <span className="text-green-400 text-sm ml-2">
                        ({perfStats.bestAgent.conversionRate}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Worst Agent:</span>
                    <div className="text-right">
                      <span className="text-red-400 font-bold">
                        {perfStats.worstAgent.name}
                      </span>
                      <span className="text-red-400 text-sm ml-2">
                        ({perfStats.worstAgent.conversionRate}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Team Health
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">High Performers (≥30%):</span>
                    <span className="text-green-400 font-bold">
                      {perfStats.highPerformers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Need Support (15-25%):</span>
                    <span className="text-yellow-400 font-bold">
                      {perfStats.needSupport}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Critical (&lt;15%):</span>
                    <span className="text-red-400 font-bold">
                      {perfStats.critical}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Agents:</span>
                    <span className="text-white font-bold">
                      {perfStats.totalAgents}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Data-Backed Improvement Areas
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Top Struggling Lead Types
                  </h4>
                  <div className="space-y-2">
                    {perfStats.strugglingLeadTypes && perfStats.strugglingLeadTypes.length > 0 ? (
                      perfStats.strugglingLeadTypes.map((item, index) => (
                        <div key={index} className="p-3 bg-red-500/20 border border-red-500/30 rounded">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-red-400 font-medium">{item.type}</p>
                            <span className="text-red-300 text-sm">{item.conversionRate}% conv</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">{item.total} leads total</span>
                            <span className="text-red-300">{item.nonSales} lost</span>
                          </div>
                          <div className="mt-1 w-full bg-slate-700 rounded-full h-1.5">
                            <div
                              className="bg-red-500 h-1.5 rounded-full"
                              style={{ width: `${Math.min(100 - parseFloat(item.conversionRate), 100)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">No struggling lead types identified - great job!</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Recommended Actions
                  </h4>
                  <div className="space-y-2">
                    {perfStats.improvementAreas && perfStats.improvementAreas.length > 0 ? (
                      perfStats.improvementAreas.slice(0, 3).map((item, index) => (
                        <div key={index} className={`p-3 rounded border ${
                          index === 0 ? 'bg-red-500/20 border-red-500/30' :
                          index === 1 ? 'bg-yellow-500/20 border-yellow-500/30' :
                          'bg-blue-500/20 border-blue-500/30'
                        }`}>
                          <p className={`font-medium ${
                            index === 0 ? 'text-red-400' :
                            index === 1 ? 'text-yellow-400' :
                            'text-blue-400'
                          }`}>
                            #{index + 1}: {item.type}
                          </p>
                          <p className="text-white text-sm mt-1">
                            {item.recommendation}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Potential: {item.potentialGain} additional sales
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-green-500/20 border border-green-500/30 rounded">
                        <p className="text-green-400 font-medium">Excellent Performance</p>
                        <p className="text-white text-sm">No major improvement areas identified</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Performance Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-green-500/20 border border-green-500/30 rounded text-center">
                  <p className="text-green-400 font-medium">Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    ${perfStats.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-xs">{perfStats.periodLabel}</p>
                </div>
                <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded text-center">
                  <p className="text-blue-400 font-medium">Total Leads</p>
                  <p className="text-2xl font-bold text-white">{perfStats.totalLeads}</p>
                  <p className="text-gray-400 text-xs">{perfStats.referralRate}% referral rate</p>
                </div>
                <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded text-center">
                  <p className="text-purple-400 font-medium">Active Teams</p>
                  <p className="text-2xl font-bold text-white">{rankedTeams.length}</p>
                  <p className="text-gray-400 text-xs">with performance data</p>
                </div>
                <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded text-center">
                  <p className="text-yellow-400 font-medium">Growth</p>
                  <p className={`text-2xl font-bold ${parseFloat(perfStats.salesGrowth) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {parseFloat(perfStats.salesGrowth) >= 0 ? '+' : ''}{perfStats.salesGrowth}%
                  </p>
                  <p className="text-gray-400 text-xs">vs previous period</p>
                </div>
              </div>
            </div>

          </div>
        );
        })()}

        {activeTab === "supervisor" && <ManagerSupervisorHelp user={user} />}

        {activeTab === "notifications" && (
          <div
            className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
          >
            <h3 className="text-xl font-semibold mb-6">
              Management Notifications
            </h3>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <p className="text-gray-300 text-center py-8">
                  No notifications yet
                </p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.type === "achievement"
                        ? "bg-green-500/10 border-green-500/20"
                        : notification.type === "warning"
                        ? "bg-yellow-500/10 border-yellow-500/20"
                        : "bg-blue-500/10 border-blue-500/20"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-white">{notification.message}</p>
                      <span className="text-xs text-gray-400">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {selectedAgent && (
        <EnhancedAgentProfile
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onViewDashboard={(agent) => {
            setSelectedAgent(null);
            setViewingAgentDashboard(agent);
          }}
        />
      )}
      <ManagerAICatAssistant leads={firebaseLeads} agents={firebaseAgents} />
    </div>
  );
};

// Agent Dashboard with corrected calculations and global data sync
// OPTIMIZED: No longer uses useFirestore for all leads - lazy-loads leaderboard data
const AgentDashboard = ({ user, onSignOut }) => {
  const {
    leads,
    loading: leadsLoading,
    addLead,
    deleteLead,
    updateLead,
    calculateMetrics,
  } = useLeads(user.uid);
  // OPTIMIZATION: Use standalone function instead of full useFirestore hook
  // This eliminates duplicate polling and reduces Firebase reads significantly
  const [goalsLoaded, setGoalsLoaded] = useState(false);
  const [goalsVersion, setGoalsVersion] = useState(0); // Force re-render when goals change
  // OPTIMIZATION: Lazy-load leaderboard data only when tab is selected
  const [leaderboardLeads, setLeaderboardLeads] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const leaderboardLoadedRef = useRef(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [streak, setStreak] = useState(3);
  const [formErrors, setFormErrors] = useState({});
  const [userAvatar, setUserAvatar] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  // New-dash-call input draft (dash calls persist as an array field on the lead)
  const [newDashCall, setNewDashCall] = useState({
    result: "connected",
    notes: "",
  });
  const [isLoggingDashCall, setIsLoggingDashCall] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  // Add these helper functions
  const showToast = (message, type = "success") => {
    setToast({
      isVisible: true,
      message,
      type,
    });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  // Fetch agent goals from Firebase on mount and when tab becomes visible
  // This ensures manager's goal changes are reflected on agent's dashboard
  useEffect(() => {
    const loadGoals = async () => {
      if (user.email) {
        try {
          const firebaseGoals = await fetchAgentGoalsStandalone(user.email);
          if (firebaseGoals) {
            globalAgentGoals[user.email] = firebaseGoals;
            // Force re-render to show updated goals
            setGoalsVersion(v => v + 1);
          }
        } catch (err) {
          console.log("Could not load goals from Firebase:", err.message);
        }
        setGoalsLoaded(true);
      }
    };

    // Load goals on mount
    loadGoals();

    // Refresh goals when tab becomes visible (to pick up manager changes)
    const handleVisibilityChange = () => {
      if (!document.hidden && user.email) {
        console.log("AgentDashboard: Tab visible, refreshing goals...");
        loadGoals();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user.email]);

  // OPTIMIZATION: Lazy-load leaderboard data only when tab is selected
  // This eliminates the need to fetch ALL leads just for leaderboards
  useEffect(() => {
    const loadLeaderboardData = async () => {
      if (activeTab === "leaderboards" && !leaderboardLoadedRef.current && !leaderboardLoading) {
        setLeaderboardLoading(true);
        try {
          // Use dynamic import to get getDocs and collection
          const { collection, getDocs } = await import("firebase/firestore");
          const { db } = await import("../firebase");
          const leadsCollection = collection(db, "leads");
          const snapshot = await getDocs(leadsCollection);
          const leadsData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              timestamp: data.timestamp?.toDate?.() || data.timestamp || new Date(data.createdAt || Date.now()),
            };
          });
          setLeaderboardLeads(leadsData);
          leaderboardLoadedRef.current = true;
          console.log("AgentDashboard: Lazy-loaded", leadsData.length, "leads for leaderboard");
        } catch (err) {
          console.error("Error loading leaderboard data:", err);
        }
        setLeaderboardLoading(false);
      }
    };
    loadLeaderboardData();
  }, [activeTab, leaderboardLoading]);

  const metrics = calculateMetrics(selectedDate);
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem(`theme_${user?.email}`);
    return savedTheme || "default";
  });
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Persist theme to localStorage when it changes
  useEffect(() => {
    if (user?.email && currentTheme) {
      localStorage.setItem(`theme_${user.email}`, currentTheme);
    }
  }, [currentTheme, user?.email]);
  const [newLead, setNewLead] = useState({
    leadType: "",
    carrier: "",
    notes: "",
    crmLink: "",
    sale: false,
    hra: false,
    commission: 0,
    hraValue: 0,
    clientName: "",
  });
  const [isAddingLead, setIsAddingLead] = useState(false);

  const leadTypes = [
    "Immediate Dc - The client or dialer hangs up right away",
    "Has an Activity - Another agent from our company has a valid activity on the lead",
    "Tier 1 - A lead you are not allowed to sell (Employer, Tricare, Champ Va, Hospice)",
    "Not Appointed - Area you are not appointed to sell in",
    "Spanish - Spanish lead and you don't speak spanish",
    "Intro/Soa - Lost the client on Step 0-1",
    "RWB Card - Lost the client on step 8",
    "No SEP - Did not have a SEP to enroll the client",
    "No Value - Could not find any value to sell the client on (Supervisor Approval)",
    "Dr Change - Lost the client because they wouldn't change their DR",
    "Carrier Change - Lost the client because they wouldn't change their carrier",
    "Third Party - Someone else came into the call and ruined the deal (Son, Daughter, Etc)",
    "Pitch - Lost the client on step 15",
    "Meds - Lost the client on step 17",
    "Pre Inbound - Lost the client on step 19 or Ghosted",
    "Inbound - Lost the client on enrollment call",
    "Med Supp - Could not sell someone off a Med Supp",
    "Sale - Sold the client",
    "Referral Sale - 2nd part of Twofer or Referral from existing client",
    "Dash Sale - Sale from your dash",
  ];
  const carriers = [
    "Zing",
    "ClearSpring",
    "Aetna",
    "Wellcare",
    "Molina",
    "Florida Blue",
    "Oscar",
    "KelseyCare",
    "Clover",
    "Anthem",
    "Humana",
    "Cigna",
    "UHC",
    "Rewrite",
  ];

  // Load existing leads from global state
  const saleTypesList = ["Sale", "Dash Sale", "Referral Sale"];
  useEffect(() => {
    if (saleTypesList.some(type => newLead.leadType?.startsWith(type))) {
      setNewLead((prev) => ({
        ...prev,
        sale: true,
        commission: newLead.carrier === "Rewrite" ? 50 : 115,
      }));
    } else {
      setNewLead((prev) => ({ ...prev, sale: false, commission: 0 }));
    }
  }, [newLead.leadType, newLead.carrier]);

  const validateForm = () => {
    const errors = {};
    if (!newLead.leadType) errors.leadType = "Lead Type is required";
    if (!newLead.crmLink) errors.crmLink = "CRM Link is required";
    if (!newLead.notes.trim()) errors.notes = "Notes are required";
    if (newLead.sale && !newLead.carrier)
      errors.carrier = "Carrier is required for sales";
    if (newLead.sale && !newLead.clientName.trim())
      errors.clientName = "Client name is required for sales";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddLead = async () => {
    // Prevent multiple submissions
    if (isAddingLead) return;
    if (!validateForm()) return;

    setIsAddingLead(true);

    try {
      const leadTimestamp = new Date();
      // Set the date components using local time
      const [year, month, day] = selectedDate.split("-").map(Number);
      leadTimestamp.setFullYear(year);
      leadTimestamp.setMonth(month - 1); // Month is 0-indexed
      leadTimestamp.setDate(day);

      const leadData = {
        leadType: newLead.leadType,
        carrier: newLead.carrier,
        notes: newLead.notes,
        crmLink: newLead.crmLink,
        sale: newLead.sale,
        hra: newLead.hra,
        commission: newLead.commission,
        hraValue: newLead.hraValue,
        clientName: newLead.clientName,
        agentEmail: user.email,
        date: selectedDate,
        timestamp: leadTimestamp,
      };

      const result = await addLead(leadData);

      if (result.success) {
        setNewLead({
          carrier: "",
          leadType: "",
          notes: "",
          crmLink: "",
          sale: false,
          hra: false,
          commission: 0,
          hraValue: 0,
          clientName: "",
        });
        setFormErrors({});
        showToast("Lead added successfully! 🎉", "success");
      } else {
        showToast(`Error adding lead: ${result.error}`, "error");
      }
    } finally {
      setIsAddingLead(false);
    }
  };

  const getThermostatProgress = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const userLeads = leads.filter((lead) => lead.agent === user.uid);
    const monthlySales = userLeads.filter((lead) => {
      if (!lead.sale) return false;
      const leadDate = new Date(lead.timestamp);
      return (
        leadDate.getMonth() === currentMonth &&
        leadDate.getFullYear() === currentYear
      );
    }).length;
    const monthlyRevenue = userLeads.reduce((sum, lead) => {
      if (!lead.sale) return sum;
      const leadDate = new Date(lead.timestamp);
      if (
        leadDate.getMonth() === currentMonth &&
        leadDate.getFullYear() === currentYear
      ) {
        return (
          sum + (lead.commission || 115) + (lead.hra ? lead.hraValue || 15 : 0)
        );
      }
      return sum;
    }, 0);
    const monthlyGoal = globalAgentGoals[user.email]?.monthlyGoal || 120;
    const progress = Math.min((monthlySales / monthlyGoal) * 100, 100);
    return { monthlySales, monthlyRevenue, progress, monthlyGoal };
  };

  const getSelectedDateLeads = () => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    const selectedDateObj = new Date(year, month - 1, day, 0, 0, 0, 0);
    const nextDay = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
    return leads.filter((lead) => {
      if (lead.agent !== user.uid) return false;
      const leadDate = new Date(lead.timestamp);
      return leadDate >= selectedDateObj && leadDate < nextDay;
    });
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUserAvatar(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const getAllTimeBests = () => {
    const userLeads = leads.filter((lead) => lead.agent === user.uid);
    const dailyStats = {},
      weeklyStats = {},
      monthlyStats = {};

    // Sale types that should NOT count as leads for conversion rate
    const saleTypes = ["Sale", "Dash Sale", "Referral Sale"];

    userLeads.forEach((lead) => {
      const date = new Date(lead.timestamp);
      const dayKey = date.toDateString();
      const year = date.getFullYear();
      const month = date.getMonth();
      const weekNumber = Math.ceil(date.getDate() / 7);
      const weekKey = `${year}-${month}-W${weekNumber}`;
      const monthKey = `${year}-${month}`;

      // Check if this is an actual lead (not a direct sale type)
      const leadType = lead.leadType || "";
      const isActualLead = !saleTypes.some(type => leadType.startsWith(type));

      // Initialize stats objects
      if (!dailyStats[dayKey]) dailyStats[dayKey] = { leads: 0, sales: 0 };
      if (!weeklyStats[weekKey]) weeklyStats[weekKey] = { leads: 0, sales: 0 };
      if (!monthlyStats[monthKey]) monthlyStats[monthKey] = { leads: 0, sales: 0 };

      // Only count actual leads (not Dash Sale, Referral Sale, Sale types)
      if (isActualLead) {
        dailyStats[dayKey].leads++;
        weeklyStats[weekKey].leads++;
        monthlyStats[monthKey].leads++;
      }

      // Count all sales (including Dash Sale and Referral Sale)
      if (lead.sale) {
        dailyStats[dayKey].sales++;
        weeklyStats[weekKey].sales++;
        monthlyStats[monthKey].sales++;
      }
    });

    // Get best conversion rate period (requires at least 1 lead to have meaningful rate)
    const getBestConversionPeriod = (stats) => {
      return Object.values(stats).reduce(
        (best, period) => {
          // Only consider periods with at least 1 lead for conversion rate
          if (period.leads === 0) return best;
          const rate = (period.sales / period.leads) * 100;
          return rate > best.rate ? { rate, sales: period.sales, leads: period.leads } : best;
        },
        { rate: 0, sales: 0, leads: 0 }
      );
    };

    // Get best sales period (highest number of sales)
    const getBestSalesPeriod = (stats) => {
      return Object.values(stats).reduce(
        (best, period) => {
          return period.sales > best.sales
            ? { rate: period.leads > 0 ? (period.sales / period.leads) * 100 : 0, sales: period.sales, leads: period.leads }
            : best;
        },
        { rate: 0, sales: 0, leads: 0 }
      );
    };

    return {
      // For conversion rates, use best conversion rate
      bestDay: getBestConversionPeriod(dailyStats),
      bestWeek: getBestConversionPeriod(weeklyStats),
      bestMonth: getBestConversionPeriod(monthlyStats),
      // For sales performance, use highest sales count
      bestDaySales: getBestSalesPeriod(dailyStats),
      bestWeekSales: getBestSalesPeriod(weeklyStats),
      bestMonthSales: getBestSalesPeriod(monthlyStats),
    };
  };

  const thermostat = getThermostatProgress();
  const selectedDateLeads = getSelectedDateLeads();
  const allTimeBests = getAllTimeBests();
  const currentThemeStyles = themes[currentTheme];
  // Halo theme: in-fiction vocabulary for the agent chrome.
  const isHalo = isHaloTheme(currentTheme);
  const haloSpree = (n) => {
    const ladder = [
      [40, "DEMON"],
      [35, "GRIM REAPER"],
      [30, "BOOGEYMAN"],
      [25, "NIGHTMARE"],
      [20, "RAMPAGE"],
      [15, "RUNNING RIOT"],
      [10, "KILLING FRENZY"],
      [5, "KILLING SPREE"],
    ];
    for (const [threshold, name] of ladder) if (n >= threshold) return name;
    return "SPREE";
  };
  const goals = globalAgentGoals[user.email] || {
    dailySales: 10,
    weeklySales: 50,
    monthlyGoal: 120,
    conversionRate: 25,
    referralRate: 15,
  };

  // ---- New Lead Log derived data -------------------------------------------
  // Dashboard surface tokens for the active theme (bento dark). The CSS custom
  // properties cascade to all descendants, so any tab wrapped with dashVars can
  // use the .dash-* classes and var(--card) etc.
  const dashTokens = { ...DEFAULT_DASH_TOKENS, ...(currentThemeStyles.dash || {}) };
  const dashVars = {
    "--bg": dashTokens.bg,
    "--card": dashTokens.card,
    "--card-hover": dashTokens.cardHover,
    "--border": dashTokens.border,
    "--text": dashTokens.text || DEFAULT_DASH_TOKENS.text,
    "--text-sub": dashTokens.textSub || DEFAULT_DASH_TOKENS.textSub,
    "--text-dim": dashTokens.textDim || DEFAULT_DASH_TOKENS.textDim,
  };
  const dashRootStyle = {
    ...dashVars,
    // Fill the viewport below the header + tab bar so the Lead Log can dominate.
    // minHeight (not a fixed height) lets the page grow/scroll only on very short
    // viewports where the 50vh log floor can't otherwise fit.
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minHeight: "calc(100vh - 200px)",
    padding: "14px",
  };
  // Shared root style for the training reference tabs (Rebuttals/Pitches/SEPs/Lines).
  const tabRootStyle = {
    ...dashVars,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    minHeight: "calc(100vh - 200px)",
    padding: "16px",
  };

  // Leads for the selected date, oldest-first, numbered 1..n for the log.
  const logLeads = [...selectedDateLeads].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
  // Dash calls live as an array field on their parent lead document (in the
  // already-writable "leads" collection), so they load automatically with the
  // lead and persist via the same updateLead path used everywhere else.
  const dashCallsForLead = (lead) =>
    [...((lead && lead.dashCalls) || [])].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

  // The most recent lead is what new dash calls attach to.
  const lastLead = logLeads[logLeads.length - 1] || null;
  const lastLeadDashCalls = lastLead ? dashCallsForLead(lastLead) : [];

  // Auto-cycling input mode: lead -> dash1 -> dash2 -> lead ...
  let inputMode;
  if (!lastLead || lastLeadDashCalls.length >= 2) inputMode = "lead";
  else if (lastLeadDashCalls.length === 0) inputMode = "dash1";
  else inputMode = "dash2";

  const handleAddDashCall = async () => {
    if (isLoggingDashCall) return;
    if (!lastLead) {
      showToast("Log a lead first before logging a dash call", "error");
      return;
    }
    if (!newDashCall.notes.trim()) {
      setFormErrors({ dashNotes: "Notes are required" });
      return;
    }
    setIsLoggingDashCall(true);
    try {
      const existing = dashCallsForLead(lastLead);
      const newCall = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        result: newDashCall.result,
        notes: newDashCall.notes,
        timestamp: new Date().toISOString(),
        agentEmail: user.email,
        linkedLeadId: lastLead.id,
        dashNumber: existing.length + 1,
      };
      const result = await updateLead(lastLead.id, {
        dashCalls: [...existing, newCall],
      });
      if (result.success) {
        setNewDashCall({ result: "connected", notes: "" });
        setFormErrors({});
        showToast("Dash call logged! 📞", "success");
      } else {
        showToast(`Error logging call: ${result.error}`, "error");
      }
    } finally {
      setIsLoggingDashCall(false);
    }
  };

  const handleUpdateDashCallResult = async (lead, dashCallId, newResult) => {
    const updated = dashCallsForLead(lead).map((dc) =>
      dc.id === dashCallId ? { ...dc, result: newResult } : dc
    );
    const result = await updateLead(lead.id, { dashCalls: updated });
    if (!result.success) showToast(`Error updating call: ${result.error}`, "error");
  };

  const handleDeleteDashCall = async (lead, dashCallId) => {
    const updated = dashCallsForLead(lead).filter((dc) => dc.id !== dashCallId);
    const result = await updateLead(lead.id, { dashCalls: updated });
    if (result.success) showToast("Dash call deleted", "success");
    else showToast(`Error deleting call: ${result.error}`, "error");
  };

  const formatLogTime = (ts) =>
    new Date(ts).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${currentThemeStyles.primary} ${currentTheme === 'helloKitty' ? 'hello-kitty-active text-gray-800' : currentTheme === 'runescape' ? 'runescape-active text-white' : currentTheme.startsWith('halo') ? `halo-active ${currentTheme} text-white` : 'text-white'}`}
    >
      {/* Hello Kitty Decorations */}
      <HelloKittyDecorations isActive={currentTheme === 'helloKitty'} />
      <RuneScapeDecorations isActive={currentTheme === 'runescape'} />
      <HaloDecorations isActive={isHaloTheme(currentTheme)} />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      <AICatAssistant leads={leads} user={user} />
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`bg-gradient-to-r ${currentThemeStyles.accent} p-2 rounded-lg`}
              >
                <HelloKittyLogo isHelloKitty={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} isHalo={isHaloTheme(currentTheme)} className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {isHalo ? "Spartan Service Record" : "Sales Agent Dashboard"}
                  <HelloKittyBow isActive={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} />
                </h1>
                <p className={currentTheme === 'helloKitty' ? 'text-pink-700' : currentTheme === 'runescape' ? 'text-amber-400' : 'text-gray-300'}>{isHalo ? `Spartan ${user.name} · Deployed` : `Welcome back, ${user.name}`}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSelector
                currentTheme={currentTheme}
                onThemeChange={setCurrentTheme}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              />
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${currentTheme === 'helloKitty' ? 'bg-pink-200' : currentTheme === 'runescape' ? 'bg-amber-900' : 'bg-slate-600'}`}>
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : currentTheme === 'helloKitty' ? (
                    <HelloKittyFace size={28} />
                  ) : currentTheme === 'runescape' ? (
                    <RuneScapeGnomeChild size={28} />
                  ) : (
                    <User className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <label className={`absolute -bottom-1 -right-1 rounded-full p-1 cursor-pointer ${currentTheme === 'helloKitty' ? 'bg-pink-500 hover:bg-pink-600' : currentTheme === 'runescape' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  <Camera className="w-3 h-3 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isHalo ? 'halo-streak' : ''} ${currentTheme === 'helloKitty' ? 'bg-gradient-to-r from-pink-400 to-rose-400' : currentTheme === 'runescape' ? 'bg-gradient-to-r from-yellow-600 to-amber-700' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
                {currentTheme === 'helloKitty' ? <span>💕</span> : currentTheme === 'runescape' ? <span>🪙</span> : <Flame className="w-5 h-5 text-white" />}
                <span className="text-white font-bold">
                  {isHalo ? `${streak}-Day ${haloSpree(streak)}` : `${streak} day streak!`}
                </span>
              </div>
              <button
                onClick={onSignOut}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-white ${currentTheme === 'helloKitty' ? 'bg-pink-600 hover:bg-pink-700' : currentTheme === 'runescape' ? 'bg-amber-700 hover:bg-amber-800' : 'bg-red-600 hover:bg-red-700'}`}
              >
                <LogOut className="w-4 h-4" />
                {isHalo ? "Stand Down" : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-6">
        <div className="flex bg-white/10 rounded-lg p-1 mb-6 border border-white/20 overflow-x-auto">
          {[
            { key: "dashboard", label: "Dashboard", icon: Target, iconType: "target" },
            { key: "analytics", label: "Analytics", icon: BarChart3, iconType: "chart" },
            // Training reference tabs (replaced Leaderboard / Notifications / Supervisor Help / PvP)
            { key: "rebuttals", label: "Rebuttals", icon: Shield, iconType: "rebuttals" },
            { key: "planselection", label: "Plan Selection", icon: FileText, iconType: "planselection" },
            { key: "pitches", label: "Pitches", icon: MessageSquare, iconType: "pitches" },
            { key: "seps", label: "SEPs", icon: Calendar, iconType: "seps" },
            // --- OLD TABS (commented out, restore if needed) ---
            // { key: "leaderboards", label: "Leaderboard", icon: Crown, iconType: "trophy" },
            // { key: "notifications", label: "Notifications", icon: Bell, iconType: "bell" },
            // { key: "supervisor", label: "Supervisor Help", icon: Headphones, iconType: "headphones" },
            // { key: "pvp", label: "PvP", icon: Sword, iconType: "star" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? `bg-gradient-to-r ${currentThemeStyles.accent} text-white`
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <HelloKittyIcon icon={tab.icon} iconType={tab.iconType} isHelloKitty={currentTheme === 'helloKitty'} isRuneScape={currentTheme === 'runescape'} isHalo={isHaloTheme(currentTheme)} className="w-4 h-4 inline mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === "dashboard" && (() => {
          const selectedDateLabel = (() => {
            const [y, m, d] = selectedDate.split("-").map(Number);
            return new Date(y, m - 1, d).toLocaleDateString();
          })();
          const leadFormValid =
            !!newLead.leadType &&
            !!newLead.crmLink &&
            !!newLead.notes.trim() &&
            (!newLead.sale ||
              (!!newLead.carrier && !!newLead.clientName.trim()));
          const progressMarks = [
            0,
            Math.floor(thermostat.monthlyGoal * 0.25),
            Math.floor(thermostat.monthlyGoal * 0.5),
            Math.floor(thermostat.monthlyGoal * 0.75),
            thermostat.monthlyGoal,
          ];
          const statCards = [
            { label: "Leads Today", icon: Users, halo: HaloWaypointIcon, color: "var(--dash-sale)", value: metrics.totalLeads },
            { label: "Sales Today", icon: Target, halo: HaloEnergySword, color: "var(--sale)", value: metrics.totalSales },
            { label: "Conversion Rate", icon: TrendingUp, halo: HaloVisrScan, color: "#60a5fa", value: parseFloat(metrics.conversionRate) || 0, decimals: 1, suffix: "%" },
            { label: "Revenue Today", icon: DollarSign, halo: HaloCredit, color: "var(--warning)", value: metrics.totalRevenue, prefix: "$" },
            { label: "Referral Rate", icon: UserPlus, halo: HaloFireteam, color: "var(--referral)", value: parseFloat(metrics.referralRate) || 0, decimals: 1, suffix: "%" },
            { label: "Referrals", icon: Award, halo: HaloFists, color: "var(--pink)", value: metrics.totalReferrals },
          ];
          const dashNum = inputMode === "dash1" ? 1 : 2;
          return (
          <div className="dash-root" style={dashRootStyle}>
            {/* 1. Date Filter */}
            <div
              className="dash-card dash-card-hover dash-animate"
              style={{ padding: "8px 16px", flexShrink: 0, animationDelay: "0.05s" }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                {isHalo ? <HaloDatapad size={16} style={{ color: "var(--dash-sale)" }} /> : <Calendar className="w-4 h-4" style={{ color: "var(--dash-sale)" }} />}
                <label className="dash-sub" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                  Date Filter
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="dash-input dash-mono"
                  style={{ padding: "5px 10px", fontSize: "0.75rem" }}
                />
                <span className="dash-sub" style={{ fontSize: "0.75rem" }}>
                  Viewing data for {selectedDateLabel}
                </span>
              </div>
            </div>

            {/* 2. Goals */}
            {goals && (
              <div
                className="dash-card dash-card-hover dash-animate"
                style={{ padding: "12px", flexShrink: 0, animationDelay: "0.1s" }}
              >
                <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-2">
                  <h3 style={{ color: "var(--text)", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                    {isHalo && <HaloReticle size={15} style={{ color: "var(--halo-accent)" }} />}
                    Your Goals <span className="dash-sub" style={{ fontWeight: 500, fontSize: "0.72rem" }}>(Set by Manager)</span>
                  </h3>
                  <div className="flex items-center gap-5 flex-wrap">
                    <div className="text-center">
                      <p className="dash-sub" style={{ fontSize: "12px", marginBottom: "2px" }}>Daily Sales</p>
                      <p className="dash-mono" style={{ fontSize: "16px", fontWeight: 700, color: metrics.totalSales >= goals.dailySales ? "var(--sale)" : "var(--warning)" }}>
                        {metrics.totalSales} / {goals.dailySales}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="dash-sub" style={{ fontSize: "12px", marginBottom: "2px" }}>Weekly Sales</p>
                      <p className="dash-mono" style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>
                        {goals.weeklySales}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="dash-sub" style={{ fontSize: "12px", marginBottom: "2px" }}>Monthly Sales</p>
                      <p className="dash-mono" style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>
                        {thermostat.monthlyGoal}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="dash-sub" style={{ fontSize: "12px", marginBottom: "2px" }}>Conversion Goal</p>
                      <p className="dash-mono" style={{ fontSize: "16px", fontWeight: 700, color: parseFloat(metrics.conversionRate) >= goals.conversionRate ? "var(--sale)" : "var(--warning)" }}>
                        {metrics.conversionRate}% / {goals.conversionRate}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="dash-sub" style={{ fontSize: "12px", marginBottom: "2px" }}>Referral Goal</p>
                      <p className="dash-mono" style={{ fontSize: "16px", fontWeight: 700, color: parseFloat(metrics.referralRate) >= goals.referralRate ? "var(--sale)" : "var(--warning)" }}>
                        {metrics.referralRate}% / {goals.referralRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Monthly Progress */}
            <div
              className="dash-card dash-animate"
              style={{ padding: "12px", flexShrink: 0, animationDelay: "0.15s" }}
            >
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4" style={{ color: "var(--warning)" }} />
                  <h3 style={{ color: "var(--text)", fontSize: "14px", fontWeight: 700 }}>
                    Monthly Progress
                  </h3>
                  <span className="dash-sub" style={{ fontSize: "12px" }}>
                    · {thermostat.monthlySales} sales · {thermostat.progress.toFixed(1)}% to {thermostat.monthlyGoal}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="dash-mono" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--sale)" }}>
                    ${thermostat.monthlyRevenue.toLocaleString()}
                  </div>
                  <div className="dash-sub" style={{ fontSize: "12px" }}>this month</div>
                </div>
              </div>
              <div className="dash-progress-track" style={{ height: "12px", marginBottom: "6px" }}>
                <div className="dash-progress-fill" style={{ width: `${thermostat.progress}%` }} />
                {progressMarks.map((mark) => (
                  <div
                    key={mark}
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: `${(mark / thermostat.monthlyGoal) * 100}%`,
                      width: "1px",
                      background: "rgba(255,255,255,0.18)",
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between dash-mono dash-dim" style={{ fontSize: "12px" }}>
                <span>0</span>
                <span>{Math.floor(thermostat.monthlyGoal * 0.25)}</span>
                <span>{Math.floor(thermostat.monthlyGoal * 0.5)}</span>
                <span>{Math.floor(thermostat.monthlyGoal * 0.75)}</span>
                <span>{thermostat.monthlyGoal} Sales</span>
              </div>
            </div>

            {/* 4. Stat bento grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2" style={{ flexShrink: 0 }}>
              {statCards.map((metric, i) => (
                <div
                  key={metric.label}
                  className="dash-stat dash-animate"
                  style={{ padding: "10px 14px", animationDelay: `${0.2 + i * 0.04}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="dash-sub" style={{ fontSize: "11px", marginBottom: "2px" }}>
                        {metric.label}
                      </p>
                      <AnimatedNumber
                        value={metric.value}
                        decimals={metric.decimals || 0}
                        prefix={metric.prefix || ""}
                        suffix={metric.suffix || ""}
                        className="dash-mono"
                        style={{ fontSize: "20px", fontWeight: 700, color: metric.color }}
                      />
                    </div>
                    {isHalo && metric.halo ? (
                      <metric.halo size={16} style={{ color: metric.color, opacity: 0.9 }} />
                    ) : (
                      <metric.icon className="w-4 h-4" style={{ color: metric.color, opacity: 0.85 }} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 5. Best Conversion + Best Sales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2" style={{ flexShrink: 0 }}>
              <div className="dash-card dash-card-hover dash-animate" style={{ padding: "12px", animationDelay: "0.45s" }}>
                <div className="flex items-center gap-2 mb-2">
                  {isHalo ? <HaloMedalIcon size={16} style={{ color: "var(--sale)" }} /> : <Trophy className="w-4 h-4" style={{ color: "var(--sale)" }} />}
                  <h3 style={{ color: "var(--text)", fontSize: "12px", fontWeight: 700 }}>Best Conversion Rates</h3>
                </div>
                <div>
                  {[
                    { label: "Best Day", v: allTimeBests.bestDay.rate },
                    { label: "Best Week", v: allTimeBests.bestWeek.rate },
                    { label: "Best Month", v: allTimeBests.bestMonth.rate },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center" style={{ padding: "4px 0" }}>
                      <span className="dash-sub" style={{ fontSize: "12px" }}>{row.label}:</span>
                      <span className="dash-mono" style={{ color: "var(--sale)", fontWeight: 700, fontSize: "12px" }}>
                        {row.v.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="dash-card dash-card-hover dash-animate" style={{ padding: "12px", animationDelay: "0.5s" }}>
                <div className="flex items-center gap-2 mb-2">
                  {isHalo ? <HaloMedalIcon size={16} style={{ color: "var(--warning)" }} /> : <Zap className="w-4 h-4" style={{ color: "var(--warning)" }} />}
                  <h3 style={{ color: "var(--text)", fontSize: "12px", fontWeight: 700 }}>Best Sales Performance</h3>
                </div>
                <div>
                  {[
                    { label: "Best Day", v: allTimeBests.bestDaySales.sales },
                    { label: "Best Week", v: allTimeBests.bestWeekSales.sales },
                    { label: "Best Month", v: allTimeBests.bestMonthSales.sales },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center" style={{ padding: "4px 0" }}>
                      <span className="dash-sub" style={{ fontSize: "12px" }}>{row.label}:</span>
                      <span className="dash-mono" style={{ color: "var(--warning)", fontWeight: 700, fontSize: "12px" }}>
                        {row.v} sales
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. Lead Log — fills all remaining vertical space */}
            <div
              className="dash-card dash-animate"
              style={{
                padding: "16px",
                animationDelay: "0.55s",
                flex: "1 1 auto",
                minHeight: "50vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2" style={{ flexShrink: 0 }}>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" style={{ color: "var(--referral)" }} />
                  <h3 style={{ color: "var(--text)", fontSize: "1.05rem", fontWeight: 700 }}>Lead Log</h3>
                  <span className="flex items-center gap-1" style={{ marginLeft: "4px" }}>
                    {isHalo ? (
                      <HaloCortanaChip size={14} className="dash-live-dot" style={{ color: "var(--halo-accent)" }} />
                    ) : (
                      <span className="dash-live-dot" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--sale)", display: "inline-block" }} />
                    )}
                    <span className="dash-mono" style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", color: isHalo ? "var(--halo-accent)" : "var(--sale)" }}>LIVE</span>
                  </span>
                </div>
                <span className="dash-sub" style={{ fontSize: "0.78rem" }}>
                  {logLeads.length} {logLeads.length === 1 ? "lead" : "leads"} · {selectedDateLabel}
                </span>
              </div>

              {/* Scrollable log — grows to fill the card; only this scrolls */}
              <div className="lead-log-scroll" style={{ flex: "1 1 auto", minHeight: 0, paddingRight: "4px" }}>
                {logLeads.length === 0 ? (
                  <div className="dash-sub text-center" style={{ padding: "40px 0", fontSize: "0.9rem" }}>
                    {isHalo ? (
                      <>
                        <HaloSpartanHelmet size={88} style={{ color: "var(--halo-accent)", opacity: 0.35, margin: "0 auto 10px" }} />
                        <div>No contacts on radar.</div>
                      </>
                    ) : (
                      <>No leads for {selectedDateLabel}. Log your first lead below!</>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logLeads.map((lead, idx) => {
                      const color = getLeadTypeColor(lead.leadType);
                      const sale = isSaleLeadType(lead.leadType);
                      const calls = dashCallsForLead(lead);
                      return (
                        <div key={lead.id}>
                          {/* Lead row */}
                          <div
                            className="dash-lead-row"
                            style={{
                              padding: "9px 11px",
                              display: "flex",
                              alignItems: "center",
                              gap: "9px",
                              background: sale ? hexToRgba(color, 0.08) : "var(--card)",
                            }}
                          >
                            <div
                              className="dash-mono"
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "6px",
                                background: hexToRgba(color, 0.2),
                                color,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {idx + 1}
                            </div>
                            <select
                              value={lead.leadType}
                              onChange={async (e) => {
                                const newType = e.target.value;
                                const isSale = isSaleLeadType(newType);
                                const res = await updateLead(lead.id, {
                                  leadType: newType,
                                  sale: isSale,
                                  commission: isSale ? (lead.carrier === "Rewrite" ? 50 : 115) : 0,
                                });
                                if (!res.success) showToast(`Error updating lead: ${res.error}`, "error");
                              }}
                              className="dash-select dash-mono"
                              style={{
                                background: hexToRgba(color, 0.14),
                                color,
                                border: `1px solid ${hexToRgba(color, 0.3)}`,
                                borderRadius: "var(--radius-xs)",
                                padding: "4px 8px",
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                maxWidth: "170px",
                                flexShrink: 0,
                              }}
                            >
                              {leadTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type.split(" - ")[0]}
                                </option>
                              ))}
                            </select>
                            <span
                              className="dash-sub"
                              style={{ fontSize: "0.8rem", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            >
                              {lead.notes}
                            </span>
                            {lead.clientName && (
                              <span style={{ fontSize: "0.78rem", color: "var(--text)", flexShrink: 0 }}>
                                {lead.clientName}
                              </span>
                            )}
                            {sale && (
                              <span className="dash-mono" style={{ color: "var(--sale)", fontSize: "0.82rem", fontWeight: 700, flexShrink: 0 }}>
                                ${lead.commission + (lead.hra ? lead.hraValue : 0)}
                              </span>
                            )}
                            {lead.crmLink && (
                              <a
                                href={lead.crmLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: "0.68rem",
                                  padding: "3px 8px",
                                  borderRadius: "var(--radius-xs)",
                                  background: "var(--card-hover)",
                                  color: "var(--dash-sale)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  textDecoration: "none",
                                  flexShrink: 0,
                                }}
                              >
                                <ExternalLink className="w-3 h-3" /> CRM
                              </a>
                            )}
                            <span className="dash-mono dash-dim" style={{ fontSize: "0.7rem", flexShrink: 0 }}>
                              {formatLogTime(lead.timestamp)}
                            </span>
                            <button
                              onClick={() => setEditingLead(lead)}
                              title="Edit lead"
                              style={{ color: "var(--text-sub)", flexShrink: 0, display: "flex" }}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to delete this lead?\n\nType: ${lead.leadType}\n${lead.clientName ? `Client: ${lead.clientName}` : ""}`)) {
                                  const result = await deleteLead(lead.id);
                                  if (result.success) showToast("Lead deleted successfully", "success");
                                  else showToast(`Error deleting lead: ${result.error}`, "error");
                                }
                              }}
                              title="Delete lead"
                              style={{ color: "var(--negative)", flexShrink: 0, display: "flex" }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Dash call rows */}
                          {calls.map((dc, ci) => {
                            const meta = DASH_RESULT_META[dc.result] || DASH_RESULT_META.no_answer;
                            return (
                              <div
                                key={dc.id}
                                className="dash-call-row"
                                style={{
                                  marginLeft: "24px",
                                  marginTop: "4px",
                                  padding: "6px 10px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  borderLeft: "2px solid var(--border)",
                                }}
                              >
                                {isHalo ? (
                                  <HaloCommHelmet size={14} style={{ color: "var(--halo-accent)", flexShrink: 0 }} />
                                ) : (
                                  <span style={{ fontSize: "0.8rem", flexShrink: 0 }}>📞</span>
                                )}
                                <span className="dash-mono dash-dim" style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em", flexShrink: 0 }}>
                                  DASH {dc.dashNumber || ci + 1}
                                </span>
                                <select
                                  value={dc.result}
                                  onChange={(e) => handleUpdateDashCallResult(lead, dc.id, e.target.value)}
                                  className="dash-select dash-mono"
                                  style={{
                                    background: hexToRgba(meta.color, 0.15),
                                    color: meta.color,
                                    border: `1px solid ${hexToRgba(meta.color, 0.3)}`,
                                    borderRadius: "999px",
                                    padding: "2px 8px",
                                    fontSize: "0.66rem",
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}
                                >
                                  <option value="connected">Connected</option>
                                  <option value="no_answer">No Answer</option>
                                  <option value="voicemail">Voicemail</option>
                                  <option value="busy">Busy</option>
                                </select>
                                <span className="dash-sub" style={{ fontSize: "0.75rem", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {dc.notes}
                                </span>
                                <span className="dash-mono dash-dim" style={{ fontSize: "0.68rem", flexShrink: 0 }}>
                                  {formatLogTime(dc.timestamp)}
                                </span>
                                <button
                                  onClick={() => handleDeleteDashCall(lead, dc.id)}
                                  title="Delete dash call"
                                  style={{ color: "var(--text-dim)", flexShrink: 0, display: "flex" }}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Auto-cycling input row — pinned below the scroll area */}
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
                {inputMode === "lead" ? (
                  <div>
                    <div className="flex items-center gap-2" style={{ marginBottom: "10px" }}>
                      <Plus className="w-4 h-4" style={{ color: "var(--referral)" }} />
                      <span className="dash-mono" style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--referral)" }}>
                        NEW LEAD
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="md:col-span-2">
                        <select
                          value={newLead.leadType}
                          onChange={(e) => setNewLead((prev) => ({ ...prev, leadType: e.target.value }))}
                          className="dash-select"
                          style={{ width: "100%", padding: "8px 10px", fontSize: "0.85rem", borderColor: formErrors.leadType ? "var(--negative)" : undefined }}
                        >
                          <option value="">Select Lead Type</option>
                          {leadTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        {formErrors.leadType && (
                          <p style={{ color: "var(--negative)", fontSize: "0.72rem", marginTop: "4px" }}>{formErrors.leadType}</p>
                        )}
                      </div>
                      {newLead.sale && (
                        <>
                          <div>
                            <input
                              type="text"
                              value={newLead.clientName}
                              onChange={(e) => setNewLead((prev) => ({ ...prev, clientName: e.target.value }))}
                              className="dash-input"
                              style={{ width: "100%", padding: "8px 10px", fontSize: "0.85rem", borderColor: formErrors.clientName ? "var(--negative)" : undefined }}
                              placeholder="Client name"
                            />
                            {formErrors.clientName && (
                              <p style={{ color: "var(--negative)", fontSize: "0.72rem", marginTop: "4px" }}>{formErrors.clientName}</p>
                            )}
                          </div>
                          <div>
                            <select
                              value={newLead.carrier}
                              onChange={(e) => setNewLead((prev) => ({ ...prev, carrier: e.target.value }))}
                              className="dash-select"
                              style={{ width: "100%", padding: "8px 10px", fontSize: "0.85rem", borderColor: formErrors.carrier ? "var(--negative)" : undefined }}
                            >
                              <option value="">Select Carrier</option>
                              {carriers.map((carrier) => (
                                <option key={carrier} value={carrier}>{carrier}</option>
                              ))}
                            </select>
                            {formErrors.carrier && (
                              <p style={{ color: "var(--negative)", fontSize: "0.72rem", marginTop: "4px" }}>{formErrors.carrier}</p>
                            )}
                          </div>
                          <div>
                            <select
                              value={newLead.hra ? "yes" : "no"}
                              onChange={(e) => setNewLead((prev) => ({ ...prev, hra: e.target.value === "yes", hraValue: e.target.value === "yes" ? 15 : 0 }))}
                              className="dash-select"
                              style={{ width: "100%", padding: "8px 10px", fontSize: "0.85rem" }}
                            >
                              <option value="no">HRA ($15): No</option>
                              <option value="yes">HRA ($15): Yes</option>
                            </select>
                          </div>
                        </>
                      )}
                      <div>
                        <input
                          type="url"
                          value={newLead.crmLink}
                          onChange={(e) => setNewLead((prev) => ({ ...prev, crmLink: e.target.value }))}
                          className="dash-input"
                          style={{ width: "100%", padding: "8px 10px", fontSize: "0.85rem", borderColor: formErrors.crmLink ? "var(--negative)" : undefined }}
                          placeholder="CRM Link *"
                        />
                        {formErrors.crmLink && (
                          <p style={{ color: "var(--negative)", fontSize: "0.72rem", marginTop: "4px" }}>{formErrors.crmLink}</p>
                        )}
                      </div>
                      <div className={newLead.sale ? "" : "md:col-span-1"}>
                        <input
                          type="text"
                          value={newLead.notes}
                          onChange={(e) => setNewLead((prev) => ({ ...prev, notes: e.target.value }))}
                          className="dash-input"
                          style={{ width: "100%", padding: "8px 10px", fontSize: "0.85rem", borderColor: formErrors.notes ? "var(--negative)" : undefined }}
                          placeholder="Notes *"
                        />
                        {formErrors.notes && (
                          <p style={{ color: "var(--negative)", fontSize: "0.72rem", marginTop: "4px" }}>{formErrors.notes}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleAddLead}
                      disabled={isAddingLead || !leadFormValid}
                      style={{
                        width: "100%",
                        marginTop: "10px",
                        padding: "10px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: leadFormValid && !isAddingLead ? "#0a0a0a" : "var(--text-dim)",
                        background: leadFormValid && !isAddingLead ? "linear-gradient(90deg, #65a30d, #84cc16)" : "var(--card-hover)",
                        cursor: leadFormValid && !isAddingLead ? "pointer" : "not-allowed",
                        transition: "filter 0.15s ease",
                      }}
                    >
                      {isAddingLead ? "Logging..." : "Log Lead"}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: "10px" }}>
                      {isHalo ? (
                        <HaloCommHelmet size={15} style={{ color: "var(--dash-sale)" }} />
                      ) : (
                        <span style={{ fontSize: "0.85rem" }}>📞</span>
                      )}
                      <span className="dash-mono" style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--dash-sale)" }}>
                        DASH CALL {dashNum}
                      </span>
                      {lastLead && (
                        <span className="dash-sub" style={{ fontSize: "0.72rem" }}>
                          for Lead #{logLeads.length} — {(lastLead.leadType || "").split(" - ")[0]}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <select
                        value={newDashCall.result}
                        onChange={(e) => setNewDashCall((prev) => ({ ...prev, result: e.target.value }))}
                        className="dash-select"
                        style={{ width: "100%", padding: "8px 10px", fontSize: "0.85rem" }}
                      >
                        <option value="connected">Connected</option>
                        <option value="no_answer">No Answer</option>
                        <option value="voicemail">Voicemail</option>
                        <option value="busy">Busy</option>
                      </select>
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={newDashCall.notes}
                          onChange={(e) => setNewDashCall((prev) => ({ ...prev, notes: e.target.value }))}
                          className="dash-input"
                          style={{ width: "100%", padding: "8px 10px", fontSize: "0.85rem", borderColor: formErrors.dashNotes ? "var(--negative)" : undefined }}
                          placeholder="Notes *"
                        />
                        {formErrors.dashNotes && (
                          <p style={{ color: "var(--negative)", fontSize: "0.72rem", marginTop: "4px" }}>{formErrors.dashNotes}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleAddDashCall}
                      disabled={isLoggingDashCall}
                      style={{
                        width: "100%",
                        marginTop: "10px",
                        padding: "10px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "#0a0a0a",
                        background: "var(--dash-sale)",
                        cursor: isLoggingDashCall ? "not-allowed" : "pointer",
                        opacity: isLoggingDashCall ? 0.6 : 1,
                      }}
                    >
                      {isLoggingDashCall ? "Logging..." : "Log Call"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          );
        })()}
        {activeTab === "analytics" && (
          <AnalyticsDashboard leads={leads} user={user} theme={currentTheme} />
        )}

        {/* Training reference tabs */}
        {activeTab === "rebuttals" && (
          <FlashcardReference
            data={REBUTTALS_DATA}
            searchPlaceholder="Search rebuttals…"
            rootStyle={tabRootStyle}
          />
        )}
        {activeTab === "pitches" && (
          <FlashcardReference
            data={PITCHES_DATA}
            searchPlaceholder="Search pitches…"
            rootStyle={tabRootStyle}
          />
        )}
        {activeTab === "seps" && (
          <FlashcardReference
            data={SEP_DATA}
            searchPlaceholder="Search SEPs by code or name…"
            rootStyle={tabRootStyle}
          />
        )}
        {activeTab === "planselection" && (
          <div
            className="dash-root"
            style={{
              ...tabRootStyle,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="dash-card dash-animate"
              style={{ padding: "40px", textAlign: "center", maxWidth: "480px", animationDelay: "0.05s" }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📋</div>
              <h3 style={{ color: "var(--text)", fontSize: "1.1rem", fontWeight: 700, marginBottom: "6px" }}>
                Plan Selection — Coming Soon
              </h3>
              <p className="dash-sub" style={{ fontSize: "0.9rem" }}>
                This tab is a placeholder. Plan Selection tools will appear here.
              </p>
            </div>
          </div>
        )}

        {/*
          OLD AGENT TABS — Leaderboard / Notifications / Supervisor Help / PvP.
          Their tab-bar buttons are commented out above, so `activeTab` can never
          equal these keys and none of these branches render. The render code is
          intentionally KEPT (not deleted) so the tabs can be restored later by
          simply re-adding their buttons to the tab bar. (Leaving it live rather
          than block-commenting avoids unused-variable build failures for the
          Leaderboards / SupervisorHelp / PvPChallenges components.)
        */}
        {activeTab === "leaderboards" && (
          leaderboardLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-400">Loading leaderboard data...</span>
            </div>
          ) : (
            <Leaderboards leads={leaderboardLeads} />
          )
        )}
        {activeTab === "notifications" && (
          <div
            className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Notifications
            </h3>
            <p className="text-gray-300">
              Policy status alerts and performance notifications will appear
              here.
            </p>
          </div>
        )}
        {activeTab === "supervisor" && <SupervisorHelp user={user} />}
        {activeTab === "pvp" && <PvPChallenges user={user} />}
      </div>

      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Edit Lead</h3>
              <button
                onClick={() => setEditingLead(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Lead Type</label>
                <select
                  value={editingLead.leadType}
                  onChange={(e) => setEditingLead({ ...editingLead, leadType: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                  {leadTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.split(" - ")[0]}
                    </option>
                  ))}
                </select>
              </div>
              {/* Show carrier and client name if the selected lead type is a sale type */}
              {["Sale", "Dash Sale", "Referral Sale"].some(type => editingLead.leadType?.startsWith(type)) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Client Name *</label>
                    <input
                      type="text"
                      value={editingLead.clientName || ""}
                      onChange={(e) => setEditingLead({ ...editingLead, clientName: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Carrier *</label>
                    <select
                      value={editingLead.carrier || ""}
                      onChange={(e) => setEditingLead({ ...editingLead, carrier: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="">Select Carrier</option>
                      {carriers.map((carrier) => (
                        <option key={carrier} value={carrier}>{carrier}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes/Description</label>
                <textarea
                  value={editingLead.notes || ""}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Update notes..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">CRM Link</label>
                <input
                  type="url"
                  value={editingLead.crmLink || ""}
                  onChange={(e) => setEditingLead({ ...editingLead, crmLink: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  placeholder="https://crm.example.com/lead/..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingLead(null)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    // Determine if the edited lead type is a sale
                    const saleTypesList = ["Sale", "Dash Sale", "Referral Sale"];
                    const isSale = saleTypesList.some(type => editingLead.leadType?.startsWith(type));

                    const result = await updateLead(editingLead.id, {
                      leadType: editingLead.leadType,
                      notes: editingLead.notes,
                      crmLink: editingLead.crmLink,
                      clientName: editingLead.clientName,
                      carrier: editingLead.carrier,
                      // IMPORTANT: Update sale status based on lead type
                      sale: isSale,
                      // Set commission based on sale status and carrier
                      commission: isSale ? (editingLead.carrier === "Rewrite" ? 50 : 115) : 0,
                    });
                    if (result.success) {
                      showToast("Lead updated successfully!", "success");
                      setEditingLead(null);
                    } else {
                      showToast("Failed to update lead", "error");
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = ({ user, onSignOut }) => {
  const { leads: firebaseLeads, agents: firebaseAgents, hiddenAgentIds, loading: dataLoading } = useFirestore(user.email);
  // Filter out hidden agents for UI display
  const visibleAgents = firebaseAgents.filter(agent => !hiddenAgentIds?.includes(agent.id));
  const [dateFilter, setDateFilter] = useState("this_month");
  const [customStartDate, setCustomStartDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [benchmarkAgent, setBenchmarkAgent] = useState(null);
  const [viewingAgentDashboard, setViewingAgentDashboard] = useState(null);

  // Get date range based on filter
  const getDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case "today": {
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
        return { startDate: today, endDate };
      }
      case "this_week": {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        return { startDate: startOfWeek, endDate: endOfWeek };
      }
      case "this_month": {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return { startDate: startOfMonth, endDate: endOfMonth };
      }
      case "custom": {
        const [startYear, startMonth, startDay] = customStartDate.split("-").map(Number);
        const [endYear, endMonth, endDay] = customEndDate.split("-").map(Number);
        const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
        const endDate = new Date(endYear, endMonth - 1, endDay + 1, 0, 0, 0, 0);
        return { startDate, endDate };
      }
      default:
        return { startDate: today, endDate: new Date(today.getTime() + 86400000) };
    }
  };

  // Get all leads filtered by date range (company-wide)
  const getFilteredLeads = () => {
    const { startDate, endDate } = getDateRange();
    return firebaseLeads.filter(lead => {
      const leadDate = lead.timestamp instanceof Date ? lead.timestamp : new Date(lead.timestamp);
      return leadDate >= startDate && leadDate < endDate;
    });
  };

  // Calculate company-wide performance stats
  const getCompanyPerformance = () => {
    const leads = getFilteredLeads();
    const totalLeads = leads.length;
    const sales = leads.filter(l => l.sale);
    const totalSales = sales.length;
    const referrals = leads.filter(l => l.leadType?.startsWith("Referral Sale")).length;
    const dashSales = leads.filter(l => l.leadType?.startsWith("Dash Sale")).length;
    const revenue = sales.reduce(
      (sum, lead) => sum + (lead.commission || 115) + (lead.hra ? (lead.hraValue || 15) : 0),
      0
    );
    const conversionRate = totalLeads > 0 ? ((totalSales / totalLeads) * 100).toFixed(1) : "0.0";
    const refRate = totalLeads > 0 ? ((referrals / totalLeads) * 100).toFixed(1) : "0.0";

    return { totalLeads, totalSales, conversionRate, revenue, refRate, referrals, dashSales };
  };

  // Get lead type breakdown with % of total
  const getLeadTypeBreakdown = () => {
    const leads = getFilteredLeads();
    const totalLeads = leads.length;
    const leadTypeBreakdown = {};

    leads.forEach(lead => {
      const type = lead.leadType?.split(" - ")[0] || lead.leadType || "Unknown";
      const isSaleType = type.includes("Sale");
      if (!isSaleType) {
        if (!leadTypeBreakdown[type]) leadTypeBreakdown[type] = { total: 0, sales: 0 };
        leadTypeBreakdown[type].total++;
        if (lead.sale) leadTypeBreakdown[type].sales++;
      }
    });

    const nonSaleLeads = Object.values(leadTypeBreakdown).reduce((sum, d) => sum + d.total, 0);

    return Object.entries(leadTypeBreakdown)
      .map(([type, data]) => ({
        type,
        count: data.total,
        percentage: nonSaleLeads > 0 ? ((data.total / nonSaleLeads) * 100).toFixed(1) : "0.0",
        conversion: data.total > 0 ? ((data.sales / data.total) * 100).toFixed(1) : "0.0"
      }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))
      .slice(0, 10);
  };

  // Get daily conversion data for chart
  const getDailyData = () => {
    const leads = getFilteredLeads();
    const dailyData = {};

    leads.forEach(lead => {
      const date = new Date(lead.timestamp);
      const dateKey = `${date.getMonth() + 1}/${date.getDate()}`;
      if (!dailyData[dateKey]) dailyData[dateKey] = { leads: 0, sales: 0, date: date };
      dailyData[dateKey].leads++;
      if (lead.sale) dailyData[dateKey].sales++;
    });

    return Object.entries(dailyData)
      .sort((a, b) => a[1].date - b[1].date)
      .map(([date, data]) => ({
        date,
        leads: data.leads,
        sales: data.sales,
        conversion: data.leads > 0 ? ((data.sales / data.leads) * 100).toFixed(1) : "0"
      }))
      .slice(-14);
  };

  // Get agent performance (uses visibleAgents to exclude hidden agents)
  const getAgentPerformance = () => {
    const leads = getFilteredLeads();

    return visibleAgents.map(agent => {
      const agentLeads = leads.filter(l => l.agentEmail === agent.email || l.agent === agent.id);
      const sales = agentLeads.filter(l => l.sale).length;
      const leadCount = agentLeads.length;
      const revenue = agentLeads.filter(l => l.sale).reduce(
        (sum, lead) => sum + (lead.commission || 115) + (lead.hra ? (lead.hraValue || 15) : 0),
        0
      );
      return {
        ...agent,
        leads: leadCount,
        sales,
        revenue,
        conversionRate: leadCount > 0 ? ((sales / leadCount) * 100).toFixed(1) : "0.0"
      };
    })
    .filter(a => a.leads > 0)
    .sort((a, b) => parseFloat(a.conversionRate) - parseFloat(b.conversionRate));
  };

  // Get team breakdown with stats and lead type distribution
  const getTeamBreakdown = () => {
    const leads = getFilteredLeads();
    const teamGroups = {};

    // Group agents by team
    firebaseAgents.forEach(agent => {
      const teamName = agent.team || "Unassigned";
      if (!teamGroups[teamName]) {
        teamGroups[teamName] = {
          name: teamName,
          agents: [],
          leads: [],
          leadTypes: {}
        };
      }
      teamGroups[teamName].agents.push(agent);
    });

    // Assign leads to teams
    leads.forEach(lead => {
      const agent = firebaseAgents.find(a => a.email === lead.agentEmail || a.id === lead.agent);
      const teamName = agent?.team || "Unassigned";
      if (teamGroups[teamName]) {
        teamGroups[teamName].leads.push(lead);
        // Track lead types for pie chart
        const leadType = lead.leadType?.split(" - ")[0] || lead.leadType || "Unknown";
        if (!leadType.includes("Sale")) {
          teamGroups[teamName].leadTypes[leadType] = (teamGroups[teamName].leadTypes[leadType] || 0) + 1;
        }
      }
    });

    // Calculate stats for each team
    return Object.values(teamGroups)
      .filter(team => team.leads.length > 0)
      .map(team => {
        const totalLeads = team.leads.length;
        const sales = team.leads.filter(l => l.sale).length;
        const revenue = team.leads.filter(l => l.sale).reduce(
          (sum, lead) => sum + (lead.commission || 115) + (lead.hra ? (lead.hraValue || 15) : 0), 0
        );
        const conversionRate = totalLeads > 0 ? ((sales / totalLeads) * 100).toFixed(1) : "0.0";

        // Get top lead types for pie chart
        const totalNonSaleLeads = Object.values(team.leadTypes).reduce((sum, count) => sum + count, 0);
        const leadTypeDistribution = Object.entries(team.leadTypes)
          .map(([type, count]) => ({
            type,
            count,
            percentage: totalNonSaleLeads > 0 ? ((count / totalNonSaleLeads) * 100).toFixed(1) : "0.0"
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        return {
          name: team.name,
          agentCount: team.agents.length,
          totalLeads,
          sales,
          revenue,
          conversionRate,
          leadTypeDistribution
        };
      })
      .sort((a, b) => b.sales - a.sales);
  };

  const companyStats = getCompanyPerformance();
  const leadTypeData = getLeadTypeBreakdown();
  const dailyData = getDailyData();
  const agentPerformance = getAgentPerformance();
  const filteredLeads = getFilteredLeads();
  const teamBreakdown = getTeamBreakdown();

  // Pie chart colors
  const pieColors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1"];

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show agent dashboard view when selected
  if (viewingAgentDashboard) {
    return (
      <AgentDashboardView
        agent={viewingAgentDashboard}
        onBack={() => setViewingAgentDashboard(null)}
        user={user}
        leads={firebaseLeads}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-slate-400 text-sm">Company Overview</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm"
              >
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="custom">Custom</option>
              </select>
              {dateFilter === "custom" && (
                <>
                  <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded px-2 py-2 text-sm" />
                  <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded px-2 py-2 text-sm" />
                </>
              )}
              <span className="text-slate-400 text-sm">{user.name}</span>
              <button onClick={onSignOut} className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm flex items-center gap-1">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wide">Leads</p>
            <p className="text-2xl font-bold text-blue-400">{companyStats.totalLeads}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wide">Sales</p>
            <p className="text-2xl font-bold text-green-400">{companyStats.totalSales}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wide">Conv %</p>
            <p className={`text-2xl font-bold ${parseFloat(companyStats.conversionRate) >= 25 ? "text-green-400" : parseFloat(companyStats.conversionRate) >= 15 ? "text-yellow-400" : "text-red-400"}`}>
              {companyStats.conversionRate}%
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wide">Revenue</p>
            <p className="text-2xl font-bold text-yellow-400">${companyStats.revenue.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wide">Referrals</p>
            <p className="text-2xl font-bold text-pink-400">{companyStats.referrals}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wide">Dash Sales</p>
            <p className="text-2xl font-bold text-purple-400">{companyStats.dashSales}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wide">Agents</p>
            <p className="text-2xl font-bold text-cyan-400">{agentPerformance.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lead Type Breakdown by % */}
          <div className="bg-slate-800 rounded-lg border border-slate-700">
            <div className="px-4 py-3 border-b border-slate-700">
              <h2 className="font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Lead Type Distribution
              </h2>
            </div>
            <div className="p-4">
              {leadTypeData.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No lead data available</p>
              ) : (
                <div className="space-y-2">
                  {leadTypeData.map((item, index) => (
                    <div key={item.type} className="py-2 border-b border-slate-700 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.type}</span>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-slate-400">{item.count}</span>
                          <span className="text-blue-400 font-bold w-14 text-right">{item.percentage}%</span>
                          <span className={`w-14 text-right font-medium ${
                            parseFloat(item.conversion) < 10 ? "text-red-400" :
                            parseFloat(item.conversion) < 25 ? "text-yellow-400" : "text-green-400"
                          }`}>
                            {item.conversion}% conv
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(parseFloat(item.percentage), 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Daily Performance Line Chart */}
          <div className="bg-slate-800 rounded-lg border border-slate-700">
            <div className="px-4 py-3 border-b border-slate-700">
              <h2 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Daily Performance (Leads vs Sales)
              </h2>
            </div>
            <div className="p-4">
              {dailyData.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No data for this period</p>
              ) : (
                <>
                  <div className="relative h-48">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-slate-500">
                      <span>{Math.max(...dailyData.map(d => d.leads))}</span>
                      <span>{Math.round(Math.max(...dailyData.map(d => d.leads)) / 2)}</span>
                      <span>0</span>
                    </div>
                    {/* Chart area */}
                    <div className="ml-10 h-40 relative">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between">
                        <div className="border-b border-slate-700/50" />
                        <div className="border-b border-slate-700/50" />
                        <div className="border-b border-slate-700/50" />
                      </div>
                      {/* Line chart using SVG */}
                      <svg className="w-full h-full" preserveAspectRatio="none">
                        {/* Leads line (blue) */}
                        <polyline
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          points={dailyData.map((day, i) => {
                            const x = (i / (dailyData.length - 1)) * 100;
                            const maxLeads = Math.max(...dailyData.map(d => d.leads), 1);
                            const y = 100 - (day.leads / maxLeads) * 100;
                            return `${x}%,${y}%`;
                          }).join(' ')}
                        />
                        {/* Sales line (green) */}
                        <polyline
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="2"
                          points={dailyData.map((day, i) => {
                            const x = (i / (dailyData.length - 1)) * 100;
                            const maxLeads = Math.max(...dailyData.map(d => d.leads), 1);
                            const y = 100 - (day.sales / maxLeads) * 100;
                            return `${x}%,${y}%`;
                          }).join(' ')}
                        />
                        {/* Data points for leads */}
                        {dailyData.map((day, i) => {
                          const x = (i / (dailyData.length - 1)) * 100;
                          const maxLeads = Math.max(...dailyData.map(d => d.leads), 1);
                          const y = 100 - (day.leads / maxLeads) * 100;
                          return (
                            <circle key={`lead-${i}`} cx={`${x}%`} cy={`${y}%`} r="4" fill="#3b82f6">
                              <title>{day.date}: {day.leads} leads</title>
                            </circle>
                          );
                        })}
                        {/* Data points for sales */}
                        {dailyData.map((day, i) => {
                          const x = (i / (dailyData.length - 1)) * 100;
                          const maxLeads = Math.max(...dailyData.map(d => d.leads), 1);
                          const y = 100 - (day.sales / maxLeads) * 100;
                          return (
                            <circle key={`sale-${i}`} cx={`${x}%`} cy={`${y}%`} r="4" fill="#22c55e">
                              <title>{day.date}: {day.sales} sales</title>
                            </circle>
                          );
                        })}
                      </svg>
                    </div>
                    {/* X-axis labels */}
                    <div className="ml-10 flex justify-between text-xs text-slate-500 mt-1">
                      {dailyData.filter((_, i) => i === 0 || i === dailyData.length - 1 || i === Math.floor(dailyData.length / 2)).map((day, i) => (
                        <span key={i}>{day.date}</span>
                      ))}
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="text-sm text-slate-400">Leads</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm text-slate-400">Sales</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Benchmark Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Company Benchmark */}
          <BenchmarkChart
            leads={firebaseLeads}
            title="Company-Wide Sales Benchmark"
          />

          {/* Individual Agent Benchmark */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Individual Agent Benchmark
              </h3>
              <select
                value={benchmarkAgent?.email || ""}
                onChange={(e) => {
                  const agent = visibleAgents.find(a => a.email === e.target.value);
                  setBenchmarkAgent(agent || null);
                }}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="">Select an agent...</option>
                {visibleAgents.map(agent => (
                  <option key={agent.id} value={agent.email}>
                    {agent.name || agent.email?.split('@')[0]}
                  </option>
                ))}
              </select>
            </div>
            {benchmarkAgent ? (
              <BenchmarkChart
                leads={firebaseLeads}
                title={`${benchmarkAgent.name || benchmarkAgent.email?.split('@')[0]}'s Benchmark`}
                agentFilter={benchmarkAgent.email || benchmarkAgent.id}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Select an agent to view their benchmark</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Agent Performance Table */}
        <div className="bg-slate-800 rounded-lg border border-slate-700">
          <div className="px-4 py-3 border-b border-slate-700">
            <h2 className="font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Agent Performance (Ranked by Conversion)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-slate-400">#</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-slate-400">Agent</th>
                  <th className="text-center py-3 px-4 text-xs uppercase tracking-wide text-slate-400">Leads</th>
                  <th className="text-center py-3 px-4 text-xs uppercase tracking-wide text-slate-400">Sales</th>
                  <th className="text-center py-3 px-4 text-xs uppercase tracking-wide text-slate-400">Conv %</th>
                  <th className="text-center py-3 px-4 text-xs uppercase tracking-wide text-slate-400">Revenue</th>
                  <th className="text-center py-3 px-4 text-xs uppercase tracking-wide text-slate-400">Status</th>
                  <th className="text-center py-3 px-4 text-xs uppercase tracking-wide text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agentPerformance.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-slate-500">No agent activity for this period</td>
                  </tr>
                ) : (
                  agentPerformance.map((agent, index) => (
                    <tr key={agent.id || agent.email} className="border-t border-slate-700 hover:bg-slate-700/30">
                      <td className="py-3 px-4">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          index < 3 ? "bg-red-500 text-white" : index < 6 ? "bg-yellow-500 text-white" : "bg-green-500 text-white"
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{agent.name}</td>
                      <td className="py-3 px-4 text-center text-slate-300">{agent.leads}</td>
                      <td className="py-3 px-4 text-center text-green-400 font-medium">{agent.sales}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-bold ${
                          parseFloat(agent.conversionRate) >= 25 ? "text-green-400" :
                          parseFloat(agent.conversionRate) >= 15 ? "text-yellow-400" : "text-red-400"
                        }`}>
                          {agent.conversionRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-yellow-400">${agent.revenue}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          index < 3 ? "bg-red-500/20 text-red-400" :
                          index < 6 ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"
                        }`}>
                          {index < 3 ? "Needs Help" : index < 6 ? "Average" : "Good"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setSelectedAgent({
                              ...agent,
                              leadsList: filteredLeads.filter(l => l.agentEmail === agent.email || l.agent === agent.id)
                            })}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => setViewingAgentDashboard(agent)}
                            className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-white text-xs"
                          >
                            Dashboard
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Breakdown Section */}
        <div className="bg-slate-800 rounded-lg border border-slate-700">
          <div className="px-4 py-3 border-b border-slate-700">
            <h2 className="font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Team Breakdown
            </h2>
          </div>
          <div className="p-4">
            {teamBreakdown.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No team data available for this period</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {teamBreakdown.map((team, teamIndex) => (
                  <div key={team.name} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-white">{team.name}</h3>
                        <p className="text-slate-400 text-sm">{team.agentCount} agents</p>
                      </div>
                      <div className={`px-3 py-1 rounded text-sm font-medium ${
                        parseFloat(team.conversionRate) >= 25 ? "bg-green-500/20 text-green-400" :
                        parseFloat(team.conversionRate) >= 15 ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {team.conversionRate}% Conv
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 bg-slate-800 rounded">
                        <p className="text-slate-400 text-xs">Leads</p>
                        <p className="text-blue-400 font-bold text-lg">{team.totalLeads}</p>
                      </div>
                      <div className="text-center p-2 bg-slate-800 rounded">
                        <p className="text-slate-400 text-xs">Sales</p>
                        <p className="text-green-400 font-bold text-lg">{team.sales}</p>
                      </div>
                      <div className="text-center p-2 bg-slate-800 rounded">
                        <p className="text-slate-400 text-xs">Revenue</p>
                        <p className="text-yellow-400 font-bold text-lg">${team.revenue}</p>
                      </div>
                    </div>

                    {/* Pie Chart */}
                    {team.leadTypeDistribution.length > 0 && (
                      <div className="flex items-center gap-4">
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <svg viewBox="0 0 32 32" className="w-full h-full -rotate-90">
                            {(() => {
                              let cumulativePercent = 0;
                              return team.leadTypeDistribution.map((item, index) => {
                                const percent = parseFloat(item.percentage);
                                const startPercent = cumulativePercent;
                                cumulativePercent += percent;
                                const largeArcFlag = percent > 50 ? 1 : 0;
                                const startX = 16 + 14 * Math.cos(2 * Math.PI * startPercent / 100);
                                const startY = 16 + 14 * Math.sin(2 * Math.PI * startPercent / 100);
                                const endX = 16 + 14 * Math.cos(2 * Math.PI * cumulativePercent / 100);
                                const endY = 16 + 14 * Math.sin(2 * Math.PI * cumulativePercent / 100);
                                return (
                                  <path
                                    key={item.type}
                                    d={`M 16 16 L ${startX} ${startY} A 14 14 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                                    fill={pieColors[index % pieColors.length]}
                                  >
                                    <title>{item.type}: {item.percentage}%</title>
                                  </path>
                                );
                              });
                            })()}
                          </svg>
                        </div>
                        <div className="flex-1 space-y-1">
                          {team.leadTypeDistribution.map((item, index) => (
                            <div key={item.type} className="flex items-center gap-2 text-xs">
                              <div
                                className="w-3 h-3 rounded-sm flex-shrink-0"
                                style={{ backgroundColor: pieColors[index % pieColors.length] }}
                              />
                              <span className="text-slate-300 truncate flex-1">{item.type}</span>
                              <span className="text-slate-400 font-medium">{item.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedAgent && (
        <EnhancedAgentProfile
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onViewDashboard={(agent) => {
            setSelectedAgent(null);
            setViewingAgentDashboard(agent);
          }}
        />
      )}
      <ManagerAICatAssistant leads={filteredLeads} agents={firebaseAgents} mode="all" />
    </div>
  );
};

// Auth Component
const AuthComponent = () => {
  const { login, signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState("agent");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    company: "",
    location: "denver",
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    setErrors({});
    setLoading(true);

    if (!formData.email || !formData.password) {
      setErrors({ general: "Please fill in all fields" });
      setLoading(false);
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      setLoading(false);
      return;
    }

    if (!isLogin && (!formData.name || !formData.company)) {
      setErrors({ general: "Please fill in all fields" });
      setLoading(false);
      return;
    }

    try {
      let result;

      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await signup(formData.email, formData.password, {
          name: formData.name,
          role: userType,
          company: formData.company,
          location: formData.location,
        });
      }

      if (!result.success) {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred" });
    }

    setLoading(false);
  };

  const agentGradient = "from-blue-500 via-purple-500 to-indigo-600";
  const managerGradient = "from-emerald-500 via-teal-500 to-cyan-600";
  const adminGradient = "from-amber-500 via-orange-500 to-red-600";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-lg w-full mx-4">
        <div className="mb-8">
          <div className="flex bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setUserType("agent")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                userType === "agent"
                  ? `bg-gradient-to-r ${agentGradient} text-white shadow-lg`
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-5 h-5 inline mr-1" />
              Agent
            </button>
            <button
              onClick={() => setUserType("manager")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                userType === "manager"
                  ? `bg-gradient-to-r ${managerGradient} text-white shadow-lg`
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Shield className="w-5 h-5 inline mr-1" />
              Manager
            </button>
            <button
              onClick={() => setUserType("admin")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                userType === "admin"
                  ? `bg-gradient-to-r ${adminGradient} text-white shadow-lg`
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Building className="w-5 h-5 inline mr-1" />
              Admin
            </button>
          </div>
        </div>
        <div
          className={`bg-gradient-to-br ${
            userType === "agent" ? agentGradient : userType === "manager" ? managerGradient : adminGradient
          } p-1 rounded-2xl shadow-2xl`}
        >
          <div className="bg-slate-900 rounded-xl p-8">
            <div className="text-center mb-8">
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${
                  userType === "agent" ? agentGradient : userType === "manager" ? managerGradient : adminGradient
                } mb-4`}
              >
                {userType === "agent" ? (
                  <Target className="w-8 h-8 text-white" />
                ) : userType === "manager" ? (
                  <Shield className="w-8 h-8 text-white" />
                ) : (
                  <Building className="w-8 h-8 text-white" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {userType === "agent" ? "Agent" : userType === "manager" ? "Manager" : "Admin"}{" "}
                {isLogin ? "Login" : "Sign Up"}
              </h2>
              <p className="text-slate-400">
                {userType === "agent"
                  ? "Access your sales dashboard and track your performance"
                  : userType === "manager"
                  ? "Manage your team and monitor sales performance"
                  : "View call center overview and company-wide metrics"}
              </p>
            </div>
            <div className="space-y-6">
              {errors.general && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                  {errors.general}
                </div>
              )}
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Building className="w-4 h-4 inline mr-2" />
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          company: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Enter your company name"
                    />
                  </div>
                  {userType === "agent" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Location
                      </label>
                      <select
                        value={formData.location}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      >
                        <option value="denver">Denver</option>
                      </select>
                    </div>
                  )}
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className={`w-full bg-slate-800 border rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:ring-2 transition-all ${
                      errors.confirmPassword
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}
              <button
                onClick={handleSubmit}
                className={`w-full bg-gradient-to-r ${
                  userType === "agent" ? agentGradient : userType === "manager" ? managerGradient : adminGradient
                } hover:shadow-lg text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105`}
              >
                {isLogin ? "Sign In" : "Create Account"} as{" "}
                {userType === "agent" ? "Agent" : userType === "manager" ? "Manager" : "Admin"}
              </button>
            </div>
            <div className="text-center mt-6">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <span
                  className={`font-semibold bg-gradient-to-r ${
                    userType === "agent" ? agentGradient : managerGradient
                  } bg-clip-text text-transparent`}
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
export default function LeadTracker() {
  const { user, loading, logout } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
            <Loader className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading...</h2>
          <p className="text-slate-400">Setting up your dashboard</p>
        </div>
      </div>
    );
  }

  // Show auth component if no user is logged in
  if (!user) {
    return <AuthComponent />;
  }

  // Show appropriate dashboard based on user role
  if (user.role === "admin") {
    return <AdminDashboard user={user} onSignOut={logout} />;
  }

  if (user.role === "manager") {
    return <ManagerDashboard user={user} onSignOut={logout} />;
  }

  return <AgentDashboard user={user} onSignOut={logout} />;
}

