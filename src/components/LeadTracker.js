import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLeads } from "../hooks/useLeads";

// Mountain Time utilities (Enhancement 1: Fix date display to Mountain Time)
const getMountainTime = () => {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/Denver",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });
};

const getMountainDateString = () => {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Denver" });
};

const formatMountainTime = (date) => {
  return new Date(date).toLocaleString("en-US", {
    timeZone: "America/Denver",
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true
  });
};

// Global state for leads data
let globalLeadsData = [];

// Agent and team data will be populated from real data
const mockAgents = [];

const mockFive9Data = {};

// Enhanced theme system (Enhancement 2: Remove dark mode, add 10 color themes)
const themes = {
  blue: {
    name: "Ocean Blue",
    gradient: "from-blue-600 via-blue-500 to-cyan-500",
    primary: "blue-600",
    secondary: "blue-500",
    accent: "cyan-500",
    text: "blue-900",
    bg: "blue-50"
  },
  green: {
    name: "Forest Green",
    gradient: "from-green-600 via-emerald-500 to-teal-500",
    primary: "green-600",
    secondary: "emerald-500",
    accent: "teal-500",
    text: "green-900",
    bg: "green-50"
  },
  pink: {
    name: "Cherry Blossom",
    gradient: "from-pink-600 via-rose-500 to-pink-400",
    primary: "pink-600",
    secondary: "rose-500",
    accent: "pink-400",
    text: "pink-900",
    bg: "pink-50"
  },
  sunset: {
    name: "Sunset Orange",
    gradient: "from-orange-600 via-red-500 to-yellow-500",
    primary: "orange-600",
    secondary: "red-500",
    accent: "yellow-500",
    text: "orange-900",
    bg: "orange-50"
  },
  teal: {
    name: "Teal Cyan",
    gradient: "from-teal-600 via-cyan-500 to-blue-400",
    primary: "teal-600",
    secondary: "cyan-500",
    accent: "blue-400",
    text: "teal-900",
    bg: "teal-50"
  },
  rose: {
    name: "Rose Burgundy",
    gradient: "from-rose-600 via-red-600 to-pink-500",
    primary: "rose-600",
    secondary: "red-600",
    accent: "pink-500",
    text: "rose-900",
    bg: "rose-50"
  },
  emerald: {
    name: "Emerald Jade",
    gradient: "from-emerald-600 via-green-500 to-teal-400",
    primary: "emerald-600",
    secondary: "green-500",
    accent: "teal-400",
    text: "emerald-900",
    bg: "emerald-50"
  },
  purple: {
    name: "Royal Purple",
    gradient: "from-purple-600 via-violet-500 to-indigo-500",
    primary: "purple-600",
    secondary: "violet-500",
    accent: "indigo-500",
    text: "purple-900",
    bg: "purple-50"
  },
  amber: {
    name: "Golden Amber",
    gradient: "from-amber-600 via-yellow-500 to-orange-400",
    primary: "amber-600",
    secondary: "yellow-500",
    accent: "orange-400",
    text: "amber-900",
    bg: "amber-50"
  },
  slate: {
    name: "Modern Slate",
    gradient: "from-slate-600 via-gray-500 to-zinc-500",
    primary: "slate-600",
    secondary: "gray-500",
    accent: "zinc-500",
    text: "slate-900",
    bg: "slate-50"
  }
};

// Enhancement 3: Updated lead types and commission system
const leadTypes = [
  "Appointment", "Call Back", "DNC", "FU Sale", "Interested", 
  "No Interest", "Not Home", "Rewrite", "Sale", "Wrong Number"
];

const getCommission = (leadType) => {
  const commissions = { "Sale": 100, "FU Sale": 75, "Rewrite": 50, "Appointment": 25, "Call Back": 15, "Interested": 10 };
  return commissions[leadType] || 0;
};

// Enhancement 4: Alphabetized carriers (removed Rewrite)
const carriers = ["Aetna", "Ambetter", "Anthem", "Blue Cross Blue Shield", "Cigna", "Humana", "Kaiser Permanente", "Molina", "UnitedHealthcare"];

// Enhanced supervisor names
const supervisorNames = ["Manager Alpha", "Manager Beta", "Manager Gamma", "Supervisor Johnson", "Supervisor Williams", "Supervisor Brown", "Team Lead Davis", "Team Lead Miller", "Team Lead Wilson", "Senior Manager Thompson"];

// Enhancement 5: Data persistence utilities
const saveToStorage = (key, data) => {
  try { localStorage.setItem(`leadTracker_${key}`, JSON.stringify(data)); } catch (e) { console.error(e); }
};

const loadFromStorage = (key, defaultValue = null) => {
  try { return JSON.parse(localStorage.getItem(`leadTracker_${key}`)) || defaultValue; } catch (e) { return defaultValue; }
};

// Global state with persistence
let globalTeams = loadFromStorage('teams', [
  { id: 1, name: "Team Alpha", agents: ["john@company.com", "mike@company.com"], supervisor: "Manager Alpha", created: new Date() },
  { id: 2, name: "Team Beta", agents: ["sarah@company.com", "david@company.com"], supervisor: "Manager Beta", created: new Date() }
]);
let globalCurrentTheme = loadFromStorage('currentTheme', 'blue');
let globalContests = loadFromStorage('contests', []);

// Global state for supervisor help requests and goals
let globalSupervisorRequests = loadFromStorage('supervisorRequests', []);
let globalAgentGoals = loadFromStorage('agentGoals', {});
let globalTeamGoals = loadFromStorage('teamGoals', {});
let globalTeamAssignments = loadFromStorage('teamAssignments', {});
let globalCallReviewForms = loadFromStorage('callReviewForms', []);

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
  const nonFUSales = filteredLeads.filter(
    (lead) => lead.leadType !== "FU Sale"
  );
  const referrals = filteredLeads.filter(
    (lead) => lead.leadType === "Referral Sale"
  );

  return {
    leads: nonFUSales.length,
    sales: sales.length,
    referrals: referrals.length,
    conversionRate:
      nonFUSales.length > 0
        ? ((sales.length / nonFUSales.length) * 100).toFixed(1)
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
  filteredLeads.forEach((lead) => {
    if (
      !lead.sale &&
      !["Sale", "FU Sale", "Referral Sale"].includes(lead.leadType)
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

// Enhanced Theme Selector Component (Enhancement 6: Removed dark mode toggle)
const ThemeSelector = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r ${themes[currentTheme].gradient} text-white hover:opacity-90 transition-opacity`}
      >
        <Palette className="w-4 h-4" />
        <span>{themes[currentTheme].name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 mb-2 px-2">Choose Theme</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => {
                    onThemeChange(key);
                    globalCurrentTheme = key;
                    saveToStorage('currentTheme', key);
                    setIsOpen(false);
                  }}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    currentTheme === key 
                      ? 'border-gray-400 bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-full h-6 rounded bg-gradient-to-r ${theme.gradient} mb-1`}></div>
                  <div className="text-xs font-medium text-gray-700">{theme.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
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
const Leaderboards = () => {
  const [selectedCenter, setSelectedCenter] = useState("all");
  const [selectedBoard, setSelectedBoard] = useState("sales");
  const centers = ["all", "denver", "tampa", "orlando", "daytona"];
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

  const getFilteredAgents = () => {
    let agentsWithStats = mockAgents.map((agent) => {
      const stats = getRealAgentStats(agent.email);
      return { ...agent, ...stats };
    });

    let filtered =
      selectedCenter === "all"
        ? agentsWithStats
        : agentsWithStats.filter((agent) => agent.center === selectedCenter);
    switch (selectedBoard) {
      case "sales":
        return filtered.sort((a, b) => b.sales - a.sales);
      case "conversion":
        return filtered.sort(
          (a, b) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate)
        );
      case "referrals":
        return filtered.sort((a, b) => b.referrals - a.referrals);
      default:
        return filtered;
    }
  };

  const currentBoard = boards.find((b) => b.key === selectedBoard);

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`bg-gradient-to-r ${currentBoard.color} p-3 rounded-xl`}
          >
            <currentBoard.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">
              {currentBoard.label}
            </h3>
            <p className="text-gray-300">Top performing agents</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select
            value={selectedCenter}
            onChange={(e) => setSelectedCenter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          >
            {centers.map((center) => (
              <option key={center} value={center} className="bg-slate-800">
                {center === "all"
                  ? "All Centers"
                  : center.charAt(0).toUpperCase() + center.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={selectedBoard}
            onChange={(e) => setSelectedBoard(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          >
            {boards.map((board) => (
              <option
                key={board.key}
                value={board.key}
                className="bg-slate-800"
              >
                {board.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {boards.map((board) => {
          const boardAgents = (() => {
            let agentsWithStats = mockAgents.map((agent) => {
              const stats = getRealAgentStats(agent.email);
              return { ...agent, ...stats };
            });
            let agents =
              selectedCenter === "all"
                ? agentsWithStats
                : agentsWithStats.filter(
                    (agent) => agent.center === selectedCenter
                  );
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
                {boardAgents.slice(0, 5).map((agent, index) => {
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
    (lead) => lead.leadType === "Referral Sale"
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
const AgentDashboardView = ({ agent, onBack, user }) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  console.log("AgentDashboard selectedDate initialized to:", selectedDate);
  const [editingGoal, setEditingGoal] = useState(false);
  const [monthlyGoal, setMonthlyGoal] = useState(120);

  const agentStats = getRealAgentStats(agent.email, selectedDate);
  const agentLeads = globalLeadsData.filter(
    (lead) => lead.agentEmail === agent.email
  );
  const selectedDateLeads = agentLeads.filter((lead) => {
    const leadDate = new Date(lead.timestamp);
    const selDate = new Date(selectedDate);
    selDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(selDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return leadDate >= selDate && leadDate < nextDay;
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
                  {agent.team} • {agent.center.toUpperCase()}
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
        {/* Goals Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Performance Goals</h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-800 border border-white/20 rounded px-3 py-2 text-white"
            />
          </div>
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
            <p className="text-gray-300 text-sm">Leads Today</p>
            <p className="text-2xl font-bold text-cyan-400">
              {agentStats.leads}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-gray-300 text-sm">Sales Today</p>
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
            <p className="text-gray-300 text-sm">Revenue Today</p>
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
            <p className="text-gray-300 text-sm">Five9 NRT</p>
            <p className="text-2xl font-bold text-purple-400">
              {mockFive9Data[agent.email]?.nrt || 0}%
            </p>
          </div>
        </div>

        {/* Individual Lead Entries */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Lead Entries for {new Date(selectedDate).toLocaleDateString()}
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
                  <th className="text-left py-3 px-4 text-gray-300">Notes</th>
                </tr>
              </thead>
              <tbody>
                {selectedDateLeads.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-300">
                      No leads for this date
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

// Enhancement 7: Team Creation Modal Component
const TeamCreationModal = ({ isOpen, onClose, onCreateTeam, theme }) => {
  const [teamName, setTeamName] = useState('');
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const availableAgents = mockAgents.filter(agent => 
    !globalTeams.some(team => team.agents.includes(agent.email))
  );

  const handleCreateTeam = async () => {
    if (!teamName.trim() || selectedAgents.length === 0 || !selectedSupervisor) {
      alert('Please fill in all fields and select at least one agent.');
      return;
    }

    setIsCreating(true);
    const newTeam = {
      id: Date.now(),
      name: teamName.trim(),
      agents: selectedAgents,
      supervisor: selectedSupervisor,
      created: new Date()
    };

    globalTeams.push(newTeam);
    saveToStorage('teams', globalTeams);
    onCreateTeam(newTeam);
    
    setTeamName(''); setSelectedAgents([]); setSelectedSupervisor(''); setIsCreating(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create New Team</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
            <input
              type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter team name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Supervisor</label>
            <select
              value={selectedSupervisor} onChange={(e) => setSelectedSupervisor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a supervisor</option>
              {supervisorNames.map(supervisor => (
                <option key={supervisor} value={supervisor}>{supervisor}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Agents ({selectedAgents.length} selected)
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md">
              {availableAgents.length === 0 ? (
                <div className="p-3 text-gray-500 text-center">No available agents</div>
              ) : (
                availableAgents.map(agent => (
                  <label key={agent.email} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAgents.includes(agent.email)}
                      onChange={() => setSelectedAgents(prev => 
                        prev.includes(agent.email) 
                          ? prev.filter(email => email !== agent.email)
                          : [...prev, agent.email]
                      )}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{agent.name}</div>
                      <div className="text-sm text-gray-500">{agent.email}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300" disabled={isCreating}>
            Cancel
          </button>
          <button
            onClick={handleCreateTeam}
            disabled={isCreating || !teamName.trim() || selectedAgents.length === 0 || !selectedSupervisor}
            className={`px-4 py-2 text-white rounded-md bg-gradient-to-r ${themes[theme].gradient} hover:opacity-90 disabled:opacity-50 flex items-center`}
          >
            {isCreating && <Loader className="w-4 h-4 mr-2 animate-spin" />}
            {isCreating ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhancement 8: Lead Edit Modal Component
const LeadEditModal = ({ isOpen, onClose, lead, onSave, theme }) => {
  const [editedLead, setEditedLead] = useState(lead || {});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (lead) setEditedLead(lead);
  }, [lead]);

  const handleSave = async () => {
    setIsLoading(true);
    
    const updatedLead = {
      ...editedLead,
      lastModified: getMountainTime(),
      editHistory: [...(editedLead.editHistory || []), {
        timestamp: getMountainTime(),
        changes: 'Lead details updated'
      }]
    };
    
    // Update global leads
    const leadIndex = globalLeadsData.findIndex(l => l.id === updatedLead.id);
    if (leadIndex >= 0) {
      globalLeadsData[leadIndex] = updatedLead;
    } else {
      globalLeadsData.push(updatedLead);
    }
    
    onSave(updatedLead);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Lead</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
            <input
              type="text" value={editedLead.clientName || ''}
              onChange={(e) => setEditedLead({...editedLead, clientName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel" value={editedLead.phone || ''}
              onChange={(e) => setEditedLead({...editedLead, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Type</label>
            <select
              value={editedLead.leadType || ''}
              onChange={(e) => setEditedLead({...editedLead, leadType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select lead type</option>
              {leadTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
            <select
              value={editedLead.carrier || ''}
              onChange={(e) => setEditedLead({...editedLead, carrier: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select carrier</option>
              {carriers.map(carrier => (
                <option key={carrier} value={carrier}>{carrier}</option>
              ))}
            </select>
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Enhanced Height)</label>
            <textarea
              value={editedLead.notes || ''}
              onChange={(e) => setEditedLead({...editedLead, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              placeholder="Enter notes... (Enhancement 3: Taller notes box)"
              rows={6}
            />
          </div>
        </div>
        
        {editedLead.editHistory && editedLead.editHistory.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Edit History</h4>
            <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-2">
              {editedLead.editHistory.map((edit, idx) => (
                <div key={idx} className="text-xs text-gray-600 mb-1">
                  {edit.timestamp}: {edit.changes}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300" disabled={isLoading}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-md bg-gradient-to-r ${themes[theme || 'blue'].gradient} hover:opacity-90 disabled:opacity-50 flex items-center`}
          >
            {isLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhancement 9: Progress Meter Component with color coding
const ProgressMeter = ({ current, goal, label, theme, type = 'number' }) => {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  
  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  const getProgressTextColor = () => {
    if (percentage >= 100) return 'text-green-700';
    if (percentage >= 75) return 'text-blue-700';
    if (percentage >= 50) return 'text-yellow-700';
    if (percentage >= 25) return 'text-orange-700';
    return 'text-red-700';
  };

  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-semibold ${getProgressTextColor()}`}>
          {type === 'percentage' ? `${current}%` : current} / {type === 'percentage' ? `${goal}%` : goal}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`} style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% complete</div>
    </div>
  );
};

// Enhancement 10: Sales Projection Calculator (8AM-5PM Mountain Time)
const calculateSalesProjection = (currentSales, currentTime = new Date()) => {
  const mountainTime = new Date(currentTime.toLocaleString("en-US", { timeZone: "America/Denver" }));
  const currentHour = mountainTime.getHours();
  const currentMinute = mountainTime.getMinutes();
  
  // Work hours: 8AM to 5PM Mountain Time
  const workStartHour = 8;
  const workEndHour = 17;
  const totalWorkHours = workEndHour - workStartHour; // 9 hours
  
  if (currentHour < workStartHour) {
    // Before work hours - project for full day
    return { projection: 0, hoursWorked: 0, hoursRemaining: totalWorkHours };
  } else if (currentHour >= workEndHour) {
    // After work hours - no more projection
    return { projection: currentSales, hoursWorked: totalWorkHours, hoursRemaining: 0 };
  } else {
    // During work hours
    const hoursWorked = (currentHour - workStartHour) + (currentMinute / 60);
    const hoursRemaining = totalWorkHours - hoursWorked;
    const salesRate = hoursWorked > 0 ? currentSales / hoursWorked : 0;
    const projection = Math.round(salesRate * totalWorkHours);
    
    return { projection, hoursWorked: Math.round(hoursWorked * 10) / 10, hoursRemaining: Math.round(hoursRemaining * 10) / 10 };
  }
};

// Goal Setting Modal Component
const GoalSettingModal = ({ isOpen, onClose, agent, team, theme }) => {
  const [goals, setGoals] = useState({
    dailySales: '', weeklySales: '', monthlySales: '',
    dailyConversion: '', weeklyConversion: '', monthlyConversion: '',
    dailyReferrals: '', weeklyReferrals: '', monthlyReferrals: ''
  });

  useEffect(() => {
    if (agent) {
      const agentGoals = globalAgentGoals[agent.email] || {};
      setGoals({ ...goals, ...agentGoals });
    } else if (team) {
      const teamGoals = globalTeamGoals[team.name] || {};
      setGoals({ ...goals, ...teamGoals });
    }
  }, [agent, team]);

  const handleSaveGoals = () => {
    if (agent) {
      globalAgentGoals[agent.email] = goals;
      saveToStorage('agentGoals', globalAgentGoals);
    } else if (team) {
      globalTeamGoals[team.name] = goals;
      saveToStorage('teamGoals', globalTeamGoals);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Set Goals for {agent ? agent.name : team?.name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Sales Goals</h4>
            <div className="grid grid-cols-3 gap-3">
              {['Daily', 'Weekly', 'Monthly'].map((period) => {
                const key = `${period.toLowerCase()}Sales`;
                return (
                  <div key={period}>
                    <label className="block text-sm text-gray-700 mb-1">{period}</label>
                    <input
                      type="number" value={goals[key]}
                      onChange={(e) => setGoals({...goals, [key]: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Conversion Rate Goals (%)</h4>
            <div className="grid grid-cols-3 gap-3">
              {['Daily', 'Weekly', 'Monthly'].map((period) => {
                const key = `${period.toLowerCase()}Conversion`;
                return (
                  <div key={period}>
                    <label className="block text-sm text-gray-700 mb-1">{period}</label>
                    <input
                      type="number" value={goals[key]} max="100"
                      onChange={(e) => setGoals({...goals, [key]: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Referral Goals</h4>
            <div className="grid grid-cols-3 gap-3">
              {['Daily', 'Weekly', 'Monthly'].map((period) => {
                const key = `${period.toLowerCase()}Referrals`;
                return (
                  <div key={period}>
                    <label className="block text-sm text-gray-700 mb-1">{period}</label>
                    <input
                      type="number" value={goals[key]}
                      onChange={(e) => setGoals({...goals, [key]: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button
            onClick={handleSaveGoals}
            className={`px-4 py-2 text-white rounded-md bg-gradient-to-r ${themes[theme || 'blue'].gradient} hover:opacity-90`}
          >
            Save Goals
          </button>
        </div>
      </div>
    </div>
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
  const [currentTheme, setCurrentTheme] = useState(() => loadFromStorage('theme', 'forest'));
  const currentThemeStyles = themes[currentTheme] || themes.forest || {
    primary: 'from-green-600 to-emerald-600',
    accent: 'from-green-500 to-emerald-500',
    card: 'bg-white/10'
  };
  const [userAvatar, setUserAvatar] = useState(null);
  const [teamName, setTeamName] = useState("Sales Team Alpha");
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [myTeamAgents, setMyTeamAgents] = useState([]);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showGoalSettingModal, setShowGoalSettingModal] = useState(false);
  const [showLeadEditModal, setShowLeadEditModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false });

  const [teams, setTeams] = useState(() => loadFromStorage('teams', [
    { id: 1, name: "Team Alpha", agents: ["john@company.com", "mike@company.com"], supervisor: "Manager Alpha", created: new Date() },
    { id: 2, name: "Team Beta", agents: ["sarah@company.com", "david@company.com"], supervisor: "Manager Beta", created: new Date() }
  ]));

  const [notifications] = useState([]);

  useEffect(() => {
    // Initialize team assignments
    if (!globalTeamAssignments[user.email]) {
      // Default to agents with matching supervisor
      const defaultTeamAgents = mockAgents.filter(
        (agent) => agent.supervisor === user.name
      );
      globalTeamAssignments[user.email] = defaultTeamAgents.map((a) => a.id);
    }
    setMyTeamAgents(
      mockAgents.filter((agent) =>
        globalTeamAssignments[user.email]?.includes(agent.id)
      )
    );
  }, [user.email, user.name]);

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUserAvatar(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTeamNameEdit = () => setIsEditingTeamName(false);

  const addAgentToTeam = (agentId) => {
    if (!globalTeamAssignments[user.email]) {
      globalTeamAssignments[user.email] = [];
    }
    if (!globalTeamAssignments[user.email].includes(agentId)) {
      globalTeamAssignments[user.email].push(agentId);
      setMyTeamAgents(
        mockAgents.filter((agent) =>
          globalTeamAssignments[user.email].includes(agent.id)
        )
      );
    }
  };

  const removeAgentFromTeam = (agentId) => {
    if (globalTeamAssignments[user.email]) {
      globalTeamAssignments[user.email] = globalTeamAssignments[
        user.email
      ].filter((id) => id !== agentId);
      setMyTeamAgents(
        mockAgents.filter((agent) =>
          globalTeamAssignments[user.email].includes(agent.id)
        )
      );
    }
  };

  const setAgentGoal = (agentEmail, goalType, value) => {
    if (!globalAgentGoals[agentEmail]) {
      globalAgentGoals[agentEmail] = {};
    }
    globalAgentGoals[agentEmail][goalType] = value;
    saveToStorage('agentGoals', globalAgentGoals);
  };

  const handleCreateTeam = (teamData) => {
    const newTeam = {
      id: Date.now(),
      name: teamData.name,
      agents: teamData.agents,
      supervisor: teamData.supervisor,
      created: new Date()
    };
    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    saveToStorage('teams', updatedTeams);
    setShowCreateTeamModal(false);
    setToast({ message: 'Team created successfully!', type: 'success', isVisible: true });
    setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 3000);
  };

  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
    saveToStorage('theme', newTheme);
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setShowLeadEditModal(true);
  };

  const handleSaveLead = (updatedLead) => {
    // Update global leads data
    const leadIndex = globalLeadsData.findIndex(l => l.id === updatedLead.id);
    if (leadIndex !== -1) {
      globalLeadsData[leadIndex] = {
        ...globalLeadsData[leadIndex],
        ...updatedLead,
        editHistory: [
          ...(globalLeadsData[leadIndex].editHistory || []),
          {
            timestamp: getMountainTime(),
            editedBy: user.email,
            changes: updatedLead
          }
        ]
      };
      saveToStorage('leadsData', globalLeadsData);
      setShowLeadEditModal(false);
      setSelectedLead(null);
      setToast({ message: 'Lead updated successfully!', type: 'success', isVisible: true });
      setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 3000);
    }
  };

  // Get real team stats using global data
  const getEnhancedTeamStats = (teamName) => {
    const teamMembers = mockAgents.filter((agent) => agent.team === teamName);
    const teamMemberStats = teamMembers.map((member) => ({
      ...member,
      ...getRealAgentStats(member.email, dateFilter),
      five9Data: mockFive9Data[member.email],
    }));

    const stats = getRealTeamStats(teamName, dateFilter);
    const topNonSaleTypes = getTopNonSaleLeadTypes(teamName, dateFilter);

    return { ...stats, members: teamMemberStats, topNonSaleTypes };
  };

  const getAllTeamsData = () => {
    return teams
      .map((team) => ({
        ...team,
        ...getEnhancedTeamStats(team.name),
      }))
      .sort((a, b) => b.totalSales - a.totalSales);
  };

  // Get struggling agents based on real data with location and performance filters
  const getStrugglingAgents = () => {
    let agents = mockAgents.map((agent) => ({
      ...agent,
      ...getRealAgentStats(agent.email, dateFilter),
      five9Data: mockFive9Data[agent.email],
    }));

    if (selectedCenter !== "all") {
      agents = agents.filter((agent) => agent.center === selectedCenter);
    }

    return agents
      .sort((a, b) => {
        // Sort by multiple criteria: sales, conversion rate, Five9 adherence
        const scoreA =
          a.sales * 0.4 +
          parseFloat(a.conversionRate) * 0.3 +
          (a.five9Data?.nrt || 0) * 0.3;
        const scoreB =
          b.sales * 0.4 +
          parseFloat(b.conversionRate) * 0.3 +
          (b.five9Data?.nrt || 0) * 0.3;
        return scoreA - scoreB;
      })
      .slice(0, 10);
  };

  // Get worst Five9 adherence agents
  const getWorstAdherenceAgents = () => {
    let agents = mockAgents
      .map((agent) => ({ ...agent, five9Data: mockFive9Data[agent.email] }))
      .filter((agent) => agent.five9Data);

    if (selectedCenter !== "all") {
      agents = agents.filter((agent) => agent.center === selectedCenter);
    }

    return agents
      .sort((a, b) => {
        const scoreA = a.five9Data.talkTime - a.five9Data.nrt;
        const scoreB = b.five9Data.talkTime - b.five9Data.nrt;
        return scoreA - scoreB;
      })
      .slice(0, 10);
  };

  const strugglingAgents = getStrugglingAgents();
  const worstAdherenceAgents = getWorstAdherenceAgents();
  const rankedTeams = getAllTeamsData();

  // Get overall company stats
  const getCompanyStats = () => {
    let agents = mockAgents;
    if (selectedCenter !== "all") {
      agents = agents.filter((agent) => agent.center === selectedCenter);
    }

    const allAgentStats = agents.map((agent) =>
      getRealAgentStats(agent.email, dateFilter)
    );
    return {
      totalAgents: agents.length,
      totalSales: allAgentStats.reduce(
        (sum, stats) => sum + parseInt(stats.sales),
        0
      ),
      totalLeads: allAgentStats.reduce(
        (sum, stats) => sum + parseInt(stats.leads),
        0
      ),
      totalReferrals: allAgentStats.reduce(
        (sum, stats) => sum + parseInt(stats.referrals),
        0
      ),
      avgConversion: (
        allAgentStats.reduce(
          (sum, stats) => sum + parseFloat(stats.conversionRate),
          0
        ) / allAgentStats.length
      ).toFixed(1),
      referralRate:
        allAgentStats.reduce((sum, stats) => sum + parseInt(stats.leads), 0) > 0
          ? (
              (allAgentStats.reduce(
                (sum, stats) => sum + parseInt(stats.referrals),
                0
              ) /
                allAgentStats.reduce(
                  (sum, stats) => sum + parseInt(stats.leads),
                  0
                )) *
              100
            ).toFixed(1)
          : 0,
      totalRevenue: allAgentStats.reduce(
        (sum, stats) => sum + stats.revenue,
        0
      ),
    };
  };

  const companyStats = getCompanyStats();
  const centers = ["all", "denver", "tampa", "orlando", "daytona"];

  const EnhancedAgentProfile = ({ agent, onClose }) => {
    const [editingGoals, setEditingGoals] = useState(false);
    const [goals, setGoals] = useState(
      globalAgentGoals[agent.email] || {
        dailySales: 10,
        weeklySales: 50,
        monthlyGoal: 120,
        conversionRate: 25,
        referralRate: 15,
      }
    );

    const handleSaveGoals = () => {
      globalAgentGoals[agent.email] = goals;
      setEditingGoals(false);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-900 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {agent.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{agent.name}</h2>
                <p className="text-gray-300">
                  {agent.team} • {agent.center.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewingAgentDashboard(agent)}
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

          {/* Goals Section */}
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Performance Goals</h3>
              {editingGoals ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveGoals}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingGoals(false)}
                    className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-white text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingGoals(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm"
                >
                  Edit Goals
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-gray-300 text-sm">Daily Sales</p>
                {editingGoals ? (
                  <input
                    type="number"
                    value={goals.dailySales}
                    onChange={(e) =>
                      setGoals((prev) => ({
                        ...prev,
                        dailySales: parseInt(e.target.value),
                      }))
                    }
                    className="w-full bg-slate-800 border border-white/20 rounded px-2 py-1 text-white"
                  />
                ) : (
                  <p className="text-xl font-bold text-white">
                    {goals.dailySales}
                  </p>
                )}
              </div>
              <div>
                <p className="text-gray-300 text-sm">Weekly Sales</p>
                {editingGoals ? (
                  <input
                    type="number"
                    value={goals.weeklySales}
                    onChange={(e) =>
                      setGoals((prev) => ({
                        ...prev,
                        weeklySales: parseInt(e.target.value),
                      }))
                    }
                    className="w-full bg-slate-800 border border-white/20 rounded px-2 py-1 text-white"
                  />
                ) : (
                  <p className="text-xl font-bold text-white">
                    {goals.weeklySales}
                  </p>
                )}
              </div>
              <div>
                <p className="text-gray-300 text-sm">Monthly Sales</p>
                {editingGoals ? (
                  <input
                    type="number"
                    value={goals.monthlyGoal}
                    onChange={(e) =>
                      setGoals((prev) => ({
                        ...prev,
                        monthlyGoal: parseInt(e.target.value),
                      }))
                    }
                    className="w-full bg-slate-800 border border-white/20 rounded px-2 py-1 text-white"
                  />
                ) : (
                  <p className="text-xl font-bold text-white">
                    {goals.monthlyGoal}
                  </p>
                )}
              </div>
              <div>
                <p className="text-gray-300 text-sm">Conversion Goal %</p>
                {editingGoals ? (
                  <input
                    type="number"
                    value={goals.conversionRate}
                    onChange={(e) =>
                      setGoals((prev) => ({
                        ...prev,
                        conversionRate: parseInt(e.target.value),
                      }))
                    }
                    className="w-full bg-slate-800 border border-white/20 rounded px-2 py-1 text-white"
                  />
                ) : (
                  <p className="text-xl font-bold text-white">
                    {goals.conversionRate}%
                  </p>
                )}
              </div>
              <div>
                <p className="text-gray-300 text-sm">Referral Goal %</p>
                {editingGoals ? (
                  <input
                    type="number"
                    value={goals.referralRate}
                    onChange={(e) =>
                      setGoals((prev) => ({
                        ...prev,
                        referralRate: parseInt(e.target.value),
                      }))
                    }
                    className="w-full bg-slate-800 border border-white/20 rounded px-2 py-1 text-white"
                  />
                ) : (
                  <p className="text-xl font-bold text-white">
                    {goals.referralRate}%
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Current Day Performance */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-500/20 rounded-lg p-4 text-center">
              <p className="text-blue-300 text-sm">Leads Today</p>
              <p className="text-2xl font-bold text-white">{agent.leads}</p>
            </div>
            <div className="bg-green-500/20 rounded-lg p-4 text-center">
              <p className="text-green-300 text-sm">Sales Today</p>
              <p className="text-2xl font-bold text-white">{agent.sales}</p>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-4 text-center">
              <p className="text-purple-300 text-sm">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">
                {agent.conversionRate}%
              </p>
            </div>
            <div className="bg-yellow-500/20 rounded-lg p-4 text-center">
              <p className="text-yellow-300 text-sm">Referrals Today</p>
              <p className="text-2xl font-bold text-white">{agent.referrals}</p>
            </div>
          </div>

          {/* Lead Types and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">
                Today's Lead Breakdown
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

            {agent.five9Data && (
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">Five9 Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-300 text-sm">Ready Time</p>
                    <p
                      className={`font-bold ${
                        agent.five9Data.nrt >= 80
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {agent.five9Data.nrt}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Total Calls</p>
                    <p className="text-white font-bold">
                      {agent.five9Data.calls}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">ACW</p>
                    <p
                      className={`font-bold ${
                        agent.five9Data.acw <= 3
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {agent.five9Data.acw}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">SMA</p>
                    <p className="text-white font-bold">
                      {agent.five9Data.sma}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Individual Lead Entries */}
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">
              Today's Lead Entries
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
      </div>
    );
  };

  if (viewingAgentDashboard) {
    return (
      <AgentDashboardView
        agent={viewingAgentDashboard}
        onBack={() => setViewingAgentDashboard(null)}
        user={user}
      />
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${currentThemeStyles.primary} text-white`}
    >
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div
                className={`bg-gradient-to-r ${currentThemeStyles.accent} p-2 rounded-lg`}
              >
                <Shield className="w-6 h-6" />
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
                    </h1>
                  )}
                  <Edit
                    className="w-4 h-4 cursor-pointer hover:text-gray-300"
                    onClick={() => setIsEditingTeamName(!isEditingTeamName)}
                  />
                </div>
                <p className="text-gray-300">Welcome, {user.name} | {formatMountainTime(new Date())}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Create Team Button - Enhancement 1 Requirement */}
              <button
                onClick={() => setShowCreateTeamModal(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  currentTheme === 'ocean' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                  currentTheme === 'forest' ? 'bg-green-600 hover:bg-green-700 text-white' :
                  currentTheme === 'sunset' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
                  currentTheme === 'rose' ? 'bg-rose-600 hover:bg-rose-700 text-white' :
                  currentTheme === 'teal' ? 'bg-teal-600 hover:bg-teal-700 text-white' :
                  currentTheme === 'purple' ? 'bg-purple-600 hover:bg-purple-700 text-white' :
                  currentTheme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                  currentTheme === 'amber' ? 'bg-amber-600 hover:bg-amber-700 text-white' :
                  currentTheme === 'slate' ? 'bg-slate-600 hover:bg-slate-700 text-white' :
                  'bg-pink-600 hover:bg-pink-700 text-white'
                }`}
                title="Create new team with custom name and agent selection"
              >
                <Users className="w-4 h-4" />
                Create Team
              </button>
              
              {/* Update Goals Button - Enhancement 4 Requirement */}
              <button
                onClick={() => setShowGoalSettingModal(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  currentTheme === 'ocean' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                  currentTheme === 'forest' ? 'bg-green-600 hover:bg-green-700 text-white' :
                  currentTheme === 'sunset' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
                  currentTheme === 'rose' ? 'bg-rose-600 hover:bg-rose-700 text-white' :
                  currentTheme === 'teal' ? 'bg-teal-600 hover:bg-teal-700 text-white' :
                  currentTheme === 'purple' ? 'bg-purple-600 hover:bg-purple-700 text-white' :
                  currentTheme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                  currentTheme === 'amber' ? 'bg-amber-600 hover:bg-amber-700 text-white' :
                  currentTheme === 'slate' ? 'bg-slate-600 hover:bg-slate-700 text-white' :
                  'bg-pink-600 hover:bg-pink-700 text-white'
                }`}
                title="Set individual agent and team goals with progress tracking"
              >
                <Target className="w-4 h-4" />
                Update Goals
              </button>
              
              {/* Team Contest Button - Enhancement 7 Requirement */}
              <button
                onClick={() => setActiveTab('contests')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  currentTheme === 'ocean' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                  currentTheme === 'forest' ? 'bg-green-600 hover:bg-green-700 text-white' :
                  currentTheme === 'sunset' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
                  currentTheme === 'rose' ? 'bg-rose-600 hover:bg-rose-700 text-white' :
                  currentTheme === 'teal' ? 'bg-teal-600 hover:bg-teal-700 text-white' :
                  currentTheme === 'purple' ? 'bg-purple-600 hover:bg-purple-700 text-white' :
                  currentTheme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                  currentTheme === 'amber' ? 'bg-amber-600 hover:bg-amber-700 text-white' :
                  currentTheme === 'slate' ? 'bg-slate-600 hover:bg-slate-700 text-white' :
                  'bg-pink-600 hover:bg-pink-700 text-white'
                }`}
                title="Create and manage team contests and competitions"
              >
                <Trophy className="w-4 h-4" />
                Contests
              </button>
              
              {/* Theme Selector - Enhancement 2: Removed dark mode toggle */}
              <ThemeSelector
                currentTheme={currentTheme}
                onThemeChange={handleThemeChange}
              />
              
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1 cursor-pointer hover:bg-blue-700">
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
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-sm transition-colors"
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
            { key: "overview", label: "Overview", icon: BarChart3 },
            { key: "teams", label: "Teams", icon: Users2 },
            { key: "myteam", label: "My Team", icon: Users },
            { key: "agents", label: "All Agents", icon: Users },
            { key: "performance", label: "Performance", icon: TrendingUp },
            { key: "contests", label: "Team Contests", icon: Trophy },
            { key: "supervisor", label: "Supervisor Help", icon: Headphones },
            { key: "notifications", label: "Notifications", icon: Bell },
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
              <tab.icon className="w-4 h-4 inline mr-2" />
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
                  Showing data for {new Date(dateFilter).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Main metrics */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center`}
              >
                <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
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
                <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
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
                <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
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
                <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-gray-300 text-sm">Avg Conversion</p>
                <p className="text-xl font-bold text-white">
                  {companyStats.avgConversion}%
                </p>
                <p className="text-xs text-purple-400">Target: 30%</p>
              </div>
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center`}
              >
                <UserPlus className="w-6 h-6 text-pink-400 mx-auto mb-2" />
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
                <DollarSign className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-gray-300 text-sm">Total Revenue</p>
                <p className="text-xl font-bold text-white">
                  ${companyStats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-yellow-400">
                  For {new Date(dateFilter).toLocaleDateString()}
                </p>
              </div>
              
              {/* Enhancement 5: Sales Projection with Mountain Time */}
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center`}
              >
                <TrendingUp className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <p className="text-gray-300 text-sm">Sales Projection</p>
                <p className="text-xl font-bold text-white">
                  {calculateSalesProjection(companyStats.totalSales, new Date())}
                </p>
                <p className="text-xs text-cyan-400">
                  End of Day (5PM MT)
                </p>
                <p className="text-xs text-gray-400">
                  Current: {formatMountainTime(new Date())}
                </p>
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
                  {(rankedTeams && rankedTeams.length > 0) ? rankedTeams.slice(0, 9).map((team, index) => (
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
                      <div className="text-right space-y-1">
                        <p className="font-bold text-green-400">
                          {team.totalSales} sales
                        </p>
                        <p className="text-xs text-blue-400">
                          {team.avgConversion}% conv
                        </p>
                        <div className="w-32">
                          <ProgressMeter
                            current={team.totalSales || 0}
                            goal={globalTeamGoals[team.name]?.dailySales || 10}
                            label=""
                            theme={currentTheme}
                            type="number"
                          />
                        </div>
                   </div>
            </div>
{(rankedTeams || []).length === 0 && (
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
                  {(strugglingAgents || []).length === 0 ? (
                    <p className="text-gray-300 text-center py-8">
                      No agent data available yet
                    </p>
                  ) : (
                    (strugglingAgents || []).map((agent, index) => (
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
                              {agent.team} • {agent.center.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-bold text-red-400">
                            {agent.sales} sales
                          </p>
                          <p className="text-xs text-yellow-400">
                            {agent.conversionRate}% conv
                          </p>
                          {/* Enhancement 6: Lead Edit Integration */}
                          <button
                            onClick={() => handleEditLead({
                              id: `agent-${agent.id}-lead`,
                              clientName: agent.name,
                              phone: agent.phone || '555-0000',
                              leadType: 'Follow Up',
                              carrier: 'Aetna',
                              notes: `Agent performance review needed - ${agent.sales} sales, ${agent.conversionRate}% conversion`
                            })}
                            className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                            title="Edit agent lead data"
                          >
                            <Edit className="w-3 h-3" />
                            Edit Lead
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Enhancement 5: Top 3 Lead Types (Non-Sale Only) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
              >
                <h3 className="text-xl font-semibold mb-4">
                  Top 3 Lead Types (Non-Sale)
                </h3>
                <div className="space-y-3">
                  {getTopNonSaleLeadTypes('all', dateFilter, 3).map((leadType, index) => (
                    <div
                      key={leadType.type}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                            index === 1 ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                            'bg-gradient-to-r from-orange-400 to-orange-600'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{leadType.type}</p>
                          <p className="text-xs text-gray-400">
                            {leadType.percentage}% of total leads
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-400">
                          {leadType.count} leads
                        </p>
                        <p className="text-xs text-gray-400">
                          ${(leadType.count * getCommission(leadType.type)).toLocaleString()} value
                        </p>
                      </div>
                    </div>
                  ))}
                  {getTopNonSaleLeadTypes('all', dateFilter, 3).length === 0 && (
                    <p className="text-gray-300 text-center py-8">
                      No lead data available for {new Date(dateFilter).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Five9 Adherence Worst Offenders */}
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
              >
                <h3 className="text-xl font-semibold mb-4">
                  Worst Five9 Adherence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(worstAdherenceAgents || []).length === 0 ? (
                  <p className="text-gray-300 text-center py-8 col-span-2">
                    No Five9 data available yet
                  </p>
                ) : (
                  (worstAdherenceAgents || []).map((agent, index) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{agent.name}</p>
                          <p className="text-xs text-gray-400">
                            {agent.team} • {agent.center.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-400">
                          Talk: {agent.five9Data?.talkTime || 0}h
                        </p>
                        <p className="text-xs text-red-400">
                          NRT: {agent.five9Data?.nrt || 0}%
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
            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-4 border border-white/20`}
            >
              <div className="flex gap-4 items-center">
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
                      value={team.name}
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
                  Showing data for {new Date(dateFilter).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  Enhanced Team Management
                </h3>
                <button
                  className={`bg-gradient-to-r ${currentThemeStyles.accent} hover:shadow-lg px-4 py-2 rounded-lg flex items-center gap-2`}
                >
                  <Plus className="w-4 h-4" />
                  Create Team
                </button>
              </div>
              <div className="grid gap-6">
                {teams.length === 0 ? (
                  <p className="text-gray-300 text-center py-8">
                    No teams configured yet. Create your first team to get
                    started.
                  </p>
                ) : (
                  teams
                    .filter(
                      (team) =>
                        selectedTeam === "all" || team.name === selectedTeam
                    )
                    .map((team) => {
                      const enhancedStats = getEnhancedTeamStats(team.name);
                      return (
                        <div
                          key={team.id}
                          className="bg-white/5 rounded-lg p-6"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-white">
                                {team.name}
                              </h4>
                              <p className="text-gray-300">
                                {enhancedStats.members.length} members •{" "}
                                {team.supervisor}
                              </p>
                            </div>
                            <button className="text-gray-400 hover:text-white">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Team stats display would go here */}
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
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* My Team Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-500/20 rounded-lg p-4 text-center">
                  <p className="text-blue-300 text-sm">Team Members</p>
                  <p className="text-2xl font-bold text-white">
                    {myTeamAgents.length}
                  </p>
                </div>
                <div className="bg-green-500/20 rounded-lg p-4 text-center">
                  <p className="text-green-300 text-sm">Total Sales</p>
                  <p className="text-2xl font-bold text-white">
                    {myTeamAgents.reduce(
                      (sum, member) =>
                        sum + getRealAgentStats(member.email, dateFilter).sales,
                      0
                    )}
                  </p>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-4 text-center">
                  <p className="text-purple-300 text-sm">Avg Conversion</p>
                  <p className="text-2xl font-bold text-white">
                    {myTeamAgents.length > 0
                      ? (
                          myTeamAgents.reduce(
                            (sum, member) =>
                              sum +
                              parseFloat(
                                getRealAgentStats(member.email, dateFilter)
                                  .conversionRate
                              ),
                            0
                          ) / myTeamAgents.length
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
                <div className="bg-yellow-500/20 rounded-lg p-4 text-center">
                  <p className="text-yellow-300 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    $
                    {myTeamAgents
                      .reduce(
                        (sum, member) =>
                          sum +
                          getRealAgentStats(member.email, dateFilter).revenue,
                        0
                      )
                      .toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Add/Remove Agents */}
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Add Agents to Your Team
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {mockAgents
                    .filter(
                      (agent) => !myTeamAgents.some((ta) => ta.id === agent.id)
                    )
                    .map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between bg-white/5 rounded-lg p-2"
                      >
                        <span className="text-white text-sm">{agent.name}</span>
                        <button
                          onClick={() => addAgentToTeam(agent.id)}
                          className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-white text-xs"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  {mockAgents.filter(
                    (agent) => !myTeamAgents.some((ta) => ta.id === agent.id)
                  ).length === 0 && (
                    <p className="text-gray-300 text-sm col-span-3">
                      All available agents are already on your team
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
                    const memberStats = getRealAgentStats(
                      member.email,
                      dateFilter
                    );
                    const memberGoals = globalAgentGoals[member.email] || {
                      dailySales: 10,
                      weeklySales: 50,
                      monthlyGoal: 120,
                      conversionRate: 25,
                      referralRate: 15,
                    };
                    return (
                      <div
                        key={member.id}
                        className="bg-white/5 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
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

              {/* Team Goals */}
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
                      placeholder="50"
                      className="w-full bg-slate-800 border border-white/20 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Team Conversion Goal (%)
                    </label>
                    <input
                      type="number"
                      placeholder="25"
                      className="w-full bg-slate-800 border border-white/20 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <button className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white">
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
                <MapPin className="w-5 h-5 text-purple-400" />
                <label className="text-sm font-medium text-gray-300">
                  Filter by Location:
                </label>
                <select
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  className="bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white"
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
                <span className="text-sm text-gray-300">
                  Prioritizing agents who need the most help
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
                        Priority
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300">
                        Agent
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300">
                        Team
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300">
                        Center
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300">
                        Sales
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300">
                        Conversion
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300">
                        Lead Ratio
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300">
                        Five9 Ready
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300">
                        Status
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
                          colSpan="10"
                          className="text-center py-8 text-gray-300"
                        >
                          No agent data available yet
                        </td>
                      </tr>
                    ) : (
                      strugglingAgents.map((agent, index) => {
                        const agentStats = getRealAgentStats(
                          agent.email,
                          dateFilter
                        );
                        const five9Data = mockFive9Data[agent.email];
                        const leadRatio =
                          agentStats.leads > 0
                            ? (
                                (agentStats.sales / agentStats.leads) *
                                100
                              ).toFixed(1)
                            : 0;
                        return (
                          <tr
                            key={agent.id}
                            className="border-b border-white/10 hover:bg-white/5"
                          >
                            <td className="py-3 px-4">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                  index < 3
                                    ? "bg-red-500"
                                    : index < 6
                                    ? "bg-orange-500"
                                    : "bg-yellow-500"
                                }`}
                              >
                                {index + 1}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium text-white">
                              {agent.name}
                            </td>
                            <td className="py-3 px-4 text-gray-300">
                              {agent.team || "No Team"}
                            </td>
                            <td className="py-3 px-4 text-gray-300 uppercase">
                              {agent.center || "No Center"}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`font-bold ${
                                  agentStats.sales >= 5
                                    ? "text-green-400"
                                    : agentStats.sales >= 2
                                    ? "text-yellow-400"
                                    : "text-red-400"
                                }`}
                              >
                                {agentStats.sales}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`font-bold ${
                                  parseFloat(agentStats.conversionRate) >= 25
                                    ? "text-green-400"
                                    : parseFloat(agentStats.conversionRate) >=
                                      15
                                    ? "text-yellow-400"
                                    : "text-red-400"
                                }`}
                              >
                                {agentStats.conversionRate}%
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`font-bold ${
                                  parseFloat(leadRatio) >= 20
                                    ? "text-green-400"
                                    : parseFloat(leadRatio) >= 10
                                    ? "text-yellow-400"
                                    : "text-red-400"
                                }`}
                              >
                                {leadRatio}%
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`font-bold ${
                                  five9Data?.nrt >= 80
                                    ? "text-green-400"
                                    : five9Data?.nrt >= 70
                                    ? "text-yellow-400"
                                    : "text-red-400"
                                }`}
                              >
                                {five9Data?.nrt || 0}%
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  index < 3
                                    ? "bg-red-500/20 text-red-400"
                                    : index < 6
                                    ? "bg-orange-500/20 text-orange-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                                }`}
                              >
                                {index < 3
                                  ? "Critical"
                                  : index < 6
                                  ? "Needs Help"
                                  : "Monitor"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() =>
                                  setSelectedAgent({
                                    ...agent,
                                    ...agentStats,
                                    five9Data,
                                    leadsList: agentStats.leadsList,
                                  })
                                }
                                className="text-blue-400 hover:text-blue-300 text-sm"
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "performance" && (
          <div className="space-y-6">
            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-4 border border-white/20`}
            >
              <div className="flex items-center gap-4 flex-wrap">
                <Calendar className="w-5 h-5 text-blue-400" />
                <label className="text-sm font-medium text-gray-300">
                  Performance Date Filter:
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Sales Performance
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Selected Date:</span>
                    <span className="text-white font-bold">
                      {companyStats.totalSales}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Previous Day:</span>
                    <span className="text-gray-400">N/A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Growth:</span>
                    <span className="text-green-400 font-bold">N/A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Location Filter:</span>
                    <span className="text-blue-400 font-bold">
                      {selectedCenter === "all"
                        ? "All"
                        : selectedCenter.toUpperCase()}
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
                      {companyStats.avgConversion}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Target:</span>
                    <span className="text-gray-400">30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Best Agent:</span>
                    <span className="text-green-400 font-bold">
                      {mockAgents.length > 0
                        ? Math.max(
                            ...mockAgents
                              .filter(
                                (a) =>
                                  selectedCenter === "all" ||
                                  a.center === selectedCenter
                              )
                              .map((a) =>
                                parseFloat(
                                  getRealAgentStats(a.email, dateFilter)
                                    .conversionRate
                                )
                              )
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Worst Agent:</span>
                    <span className="text-red-400 font-bold">
                      {mockAgents.length > 0
                        ? Math.min(
                            ...mockAgents
                              .filter(
                                (a) =>
                                  selectedCenter === "all" ||
                                  a.center === selectedCenter
                              )
                              .map((a) =>
                                parseFloat(
                                  getRealAgentStats(a.email, dateFilter)
                                    .conversionRate
                                )
                              )
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
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
                    <span className="text-gray-300">High Performers:</span>
                    <span className="text-green-400 font-bold">
                      {
                        mockAgents.filter(
                          (a) =>
                            (selectedCenter === "all" ||
                              a.center === selectedCenter) &&
                            parseFloat(
                              getRealAgentStats(a.email, dateFilter)
                                .conversionRate
                            ) >= 30
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Need Support:</span>
                    <span className="text-yellow-400 font-bold">
                      {
                        mockAgents.filter(
                          (a) =>
                            (selectedCenter === "all" ||
                              a.center === selectedCenter) &&
                            parseFloat(
                              getRealAgentStats(a.email, dateFilter)
                                .conversionRate
                            ) < 25 &&
                            parseFloat(
                              getRealAgentStats(a.email, dateFilter)
                                .conversionRate
                            ) >= 15
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Critical:</span>
                    <span className="text-red-400 font-bold">
                      {
                        mockAgents.filter(
                          (a) =>
                            (selectedCenter === "all" ||
                              a.center === selectedCenter) &&
                            parseFloat(
                              getRealAgentStats(a.email, dateFilter)
                                .conversionRate
                            ) < 15
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Agents:</span>
                    <span className="text-white font-bold">
                      {
                        mockAgents.filter(
                          (a) =>
                            selectedCenter === "all" ||
                            a.center === selectedCenter
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Detailed Performance Analysis
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3">
                    Top Improvement Areas
                  </h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded">
                      <p className="text-blue-400 font-medium">
                        Lead Qualification
                      </p>
                      <p className="text-white text-sm">
                        Average 18% improvement potential across{" "}
                        {selectedCenter === "all"
                          ? "all centers"
                          : selectedCenter}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded">
                      <p className="text-purple-400 font-medium">
                        Objection Handling
                      </p>
                      <p className="text-white text-sm">
                        Key skill for conversion boost in{" "}
                        {companyStats.totalAgents} agents
                      </p>
                    </div>
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded">
                      <p className="text-red-400 font-medium">
                        Five9 Adherence
                      </p>
                      <p className="text-white text-sm">
                        {worstAdherenceAgents.length} agents need immediate
                        attention
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-3">
                    Performance Trends
                  </h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-500/20 border border-green-500/30 rounded">
                      <p className="text-green-400 font-medium">
                        Revenue Growth
                      </p>
                      <p className="text-white text-sm">
                        ${companyStats.totalRevenue.toLocaleString()} generated
                        on {new Date(dateFilter).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded">
                      <p className="text-yellow-400 font-medium">Lead Volume</p>
                      <p className="text-white text-sm">
                        {companyStats.totalLeads} leads processed with{" "}
                        {companyStats.referralRate}% referral rate
                      </p>
                    </div>
                    <div className="p-3 bg-cyan-500/20 border border-cyan-500/30 rounded">
                      <p className="text-cyan-400 font-medium">
                        Team Distribution
                      </p>
                      <p className="text-white text-sm">
                        {rankedTeams.length} teams active with varying
                        performance levels
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance by Center */}
            {selectedCenter === "all" && (
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
              >
                <h3 className="text-xl font-semibold text-white mb-4">
                  Performance by Center
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {centers
                    .filter((c) => c !== "all")
                    .map((center) => {
                      const centerAgents = mockAgents.filter(
                        (a) => a.center === center
                      );
                      const centerStats = centerAgents.map((a) =>
                        getRealAgentStats(a.email, dateFilter)
                      );
                      const centerTotals = {
                        agents: centerAgents.length,
                        sales: centerStats.reduce((sum, s) => sum + s.sales, 0),
                        leads: centerStats.reduce((sum, s) => sum + s.leads, 0),
                        conversion:
                          centerStats.length > 0
                            ? (
                                centerStats.reduce(
                                  (sum, s) =>
                                    sum + parseFloat(s.conversionRate),
                                  0
                                ) / centerStats.length
                              ).toFixed(1)
                            : 0,
                      };
                      return (
                        <div key={center} className="bg-white/5 rounded-lg p-4">
                          <h4 className="font-semibold text-white mb-2">
                            {center.toUpperCase()}
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Agents:</span>
                              <span className="text-white">
                                {centerTotals.agents}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Sales:</span>
                              <span className="text-green-400">
                                {centerTotals.sales}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Leads:</span>
                              <span className="text-blue-400">
                                {centerTotals.leads}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Avg Conv:</span>
                              <span className="text-purple-400">
                                {centerTotals.conversion}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhancement 7: Team Contests and Competition Features */}
        {activeTab === "contests" && (
          <div className="space-y-6">
            {/* Contest Creation Section */}
            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Team Contests & Competitions</h3>
                <button
                  onClick={() => {
                    const contestName = prompt('Enter contest name:');
                    const contestType = prompt('Enter contest type (sales/leads/conversion):');
                    const duration = prompt('Enter duration in days:');
                    if (contestName && contestType && duration) {
                      const newContest = {
                        id: Date.now(),
                        name: contestName,
                        type: contestType,
                        duration: parseInt(duration),
                        startDate: getMountainTime(),
                        endDate: new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString(),
                        participants: teams.map(team => ({ teamId: team.id, teamName: team.name, score: 0 })),
                        status: 'active',
                        prize: '$500 Team Bonus',
                        createdBy: user.name
                      };
                      globalContests.push(newContest);
                      saveToStorage('contests', globalContests);
                      setToast({ message: 'Contest created successfully!', type: 'success', isVisible: true });
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 bg-gradient-to-r ${themes[currentTheme].gradient} hover:opacity-90 text-white`}
                >
                  <Trophy className="w-4 h-4" />
                  Create Contest
                </button>
              </div>
              
              {/* Active Contests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {globalContests.filter(contest => contest.status === 'active').map(contest => (
                  <div key={contest.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-white">{contest.name}</h4>
                        <p className="text-sm text-gray-300">{contest.type.toUpperCase()} Contest</p>
                      </div>
                      <div className="text-right">
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                          {contest.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white">{contest.duration} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Prize:</span>
                        <span className="text-yellow-400">{contest.prize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Participants:</span>
                        <span className="text-blue-400">{contest.participants.length} teams</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Started:</span>
                        <span className="text-white">{formatMountainTime(contest.startDate)}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          const updatedContests = globalContests.map(c => 
                            c.id === contest.id ? { ...c, status: 'completed' } : c
                          );
                          globalContests.splice(0, globalContests.length, ...updatedContests);
                          saveToStorage('contests', globalContests);
                          setToast({ message: 'Contest ended!', type: 'success', isVisible: true });
                        }}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        End Contest
                      </button>
                      <button
                        onClick={() => {
                          alert(`Contest Details:\n\nName: ${contest.name}\nType: ${contest.type}\nCreated by: ${contest.createdBy}\nStart: ${formatMountainTime(contest.startDate)}\nEnd: ${formatMountainTime(contest.endDate)}`);
                        }}
                        className="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
                {globalContests.filter(contest => contest.status === 'active').length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-300">No active contests</p>
                    <p className="text-sm text-gray-400">Create a contest to motivate your teams!</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Contest Leaderboard */}
            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
            >
              <h3 className="text-xl font-semibold mb-4">Contest Leaderboard</h3>
              <div className="space-y-4">
                {globalContests.filter(contest => contest.status === 'active').map(contest => (
                  <div key={contest.id} className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3">{contest.name} - Current Standings</h4>
                    <div className="space-y-2">
                      {contest.participants
                        .sort((a, b) => b.score - a.score)
                        .map((participant, index) => {
                          const team = teams.find(t => t.id === participant.teamId);
                          const teamStats = team ? getEnhancedTeamStats(team.name) : { totalSales: 0, totalLeads: 0, avgConversion: 0 };
                          const score = contest.type === 'sales' ? teamStats.totalSales : 
                                       contest.type === 'leads' ? teamStats.totalLeads : 
                                       teamStats.avgConversion;
                          return (
                            <div key={participant.teamId} className="flex items-center justify-between p-2 bg-white/5 rounded">
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                  index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                  index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                                  index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                                  'bg-slate-600'
                                }`}>
                                  {index + 1}
                                </div>
                                <span className="text-white font-medium">{participant.teamName}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-green-400 font-bold">
                                  {contest.type === 'conversion' ? `${score}%` : score}
                                </span>
                                <p className="text-xs text-gray-400">{contest.type}</p>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                ))}
                {globalContests.filter(contest => contest.status === 'active').length === 0 && (
                  <p className="text-gray-300 text-center py-8">No active contests to display leaderboard</p>
                )}
              </div>
            </div>
            
            {/* Contest History */}
            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
            >
              <h3 className="text-xl font-semibold mb-4">Contest History</h3>
              <div className="space-y-3">
                {globalContests.filter(contest => contest.status === 'completed').map(contest => (
                  <div key={contest.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{contest.name}</p>
                      <p className="text-sm text-gray-400">
                        {contest.type.toUpperCase()} • {formatMountainTime(contest.startDate)} - {formatMountainTime(contest.endDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs">
                        COMPLETED
                      </span>
                      <p className="text-xs text-yellow-400 mt-1">{contest.prize}</p>
                    </div>
                  </div>
                ))}
                {globalContests.filter(contest => contest.status === 'completed').length === 0 && (
                  <p className="text-gray-300 text-center py-8">No completed contests yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "supervisor" && <ManagerSupervisorHelp user={user} />}

        {/* Enhanced PvP System */}
        {activeTab === "pvp" && (
          <div className="space-y-6">
            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-xl">
                  <Sword className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Player vs Player Arena</h3>
                  <p className="text-gray-300">Challenge other agents and compete for glory!</p>
                </div>
              </div>
              
              {/* Active Challenges */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Active Challenges
                </h4>
                {pvpChallenges.length === 0 ? (
                  <p className="text-gray-300">No active challenges. Challenge someone below!</p>
                ) : (
                  <div className="space-y-3">
                    {pvpChallenges.map(challenge => (
                      <div key={challenge.id} className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="text-white font-medium">
                            {challenge.type} Challenge vs {challenge.opponent}
                          </p>
                          <p className="text-sm text-gray-300">
                            Duration: {challenge.duration} • Prize: {challenge.prize}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">{challenge.yourScore} - {challenge.opponentScore}</p>
                          <p className="text-xs text-gray-400">{challenge.timeRemaining} left</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Challenge Other Agents */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Challenge Other Agents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockAgents
                    .filter((agent) => agent.email !== user.email)
                    .map((agent) => {
                      const agentStats = getRealAgentStats(agent.email, selectedDate);
                      return (
                        <div
                          key={agent.id}
                          className="bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 p-4 transition-all duration-300 hover:border-white/20 hover:shadow-lg"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                {agent.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-medium text-white">{agent.name}</p>
                                <p className="text-sm text-gray-300">
                                  {agent.center?.toUpperCase() || "No Center"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-green-400 font-bold">{agentStats.sales} sales</p>
                              <p className="text-xs text-gray-400">{agentStats.conversionRate}% conv</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <button
                              onClick={() => {
                                const challenge = {
                                  id: Date.now(),
                                  type: 'Sales',
                                  opponent: agent.name,
                                  duration: '24 hours',
                                  prize: '$50 bonus',
                                  yourScore: 0,
                                  opponentScore: 0,
                                  timeRemaining: '23h 59m'
                                };
                                setPvpChallenges(prev => [...prev, challenge]);
                              }}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors flex items-center justify-center gap-1"
                            >
                              <Target className="w-3 h-3" />
                              Sales
                            </button>
                            <button
                              onClick={() => {
                                const challenge = {
                                  id: Date.now() + 1,
                                  type: 'Conversion',
                                  opponent: agent.name,
                                  duration: '24 hours',
                                  prize: '$75 bonus',
                                  yourScore: 0,
                                  opponentScore: 0,
                                  timeRemaining: '23h 59m'
                                };
                                setPvpChallenges(prev => [...prev, challenge]);
                              }}
                              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors flex items-center justify-center gap-1"
                            >
                              <TrendingUp className="w-3 h-3" />
                              Conv%
                            </button>
                          </div>
                          
                          <div className="text-center">
                            <button
                              onClick={() => {
                                setSelectedPvpAgent(agent);
                                setShowPvpModal(true);
                              }}
                              className="w-full px-3 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <Sword className="w-4 h-4" />
                              Challenge to Duel
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              
              {/* PvP Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">0</p>
                  <p className="text-sm text-gray-300">Wins</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-400">0</p>
                  <p className="text-sm text-gray-300">Losses</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-400">0</p>
                  <p className="text-sm text-gray-300">Draws</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {selectedAgent && (
        <EnhancedAgentProfile
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}

      {/* Team Creation Modal */}
      <TeamCreationModal
        isOpen={showCreateTeamModal}
        onClose={() => setShowCreateTeamModal(false)}
        onCreateTeam={handleCreateTeam}
        theme={currentTheme}
      />

      {/* Goal Setting Modal */}
      <GoalSettingModal
        isOpen={showGoalSettingModal}
        onClose={() => setShowGoalSettingModal(false)}
        agent={null}
        team={teamName}
        theme={currentTheme}
      />

      {/* Lead Edit Modal */}
      <LeadEditModal
        isOpen={showLeadEditModal}
        onClose={() => setShowLeadEditModal(false)}
        lead={selectedLead}
        onSave={handleSaveLead}
        theme={currentTheme}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

// Agent Dashboard with corrected calculations and global data sync
const AgentDashboard = ({ user, onSignOut }) => {
  const {
    leads,
    loading: leadsLoading,
    addLead,
    calculateMetrics,
  } = useLeads(user.uid);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [streak, setStreak] = useState(3);
  const [formErrors, setFormErrors] = useState({});
  const [userAvatar, setUserAvatar] = useState(null);
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

  const metrics = calculateMetrics(selectedDate);
  const [currentTheme, setCurrentTheme] = useState(() => loadFromStorage('theme', 'forest'));
  const [pvpChallenges, setPvpChallenges] = useState([]);
  const [showPvpModal, setShowPvpModal] = useState(false);
  const [selectedPvpAgent, setSelectedPvpAgent] = useState(null);
  
  // Real-time leaderboard data
  const [leaderboardData, setLeaderboardData] = useState([]);
  
  useEffect(() => {
    // Update leaderboard data every 30 seconds for real-time updates
    const updateLeaderboard = () => {
      const agentStats = mockAgents.map(agent => ({
        ...agent,
        ...getRealAgentStats(agent.email, selectedDate),
        isCurrentUser: agent.email === user.email
      })).sort((a, b) => b.sales - a.sales);
      setLeaderboardData(agentStats);
    };
    
    updateLeaderboard();
    const interval = setInterval(updateLeaderboard, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [selectedDate, user.email]);
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

  const leadTypes = [
    "Immediate DC",
    "Has an Activity",
    "Tier 1",
    "Intro/Soa",
    "RWB",
    "No Value",
    "Dr Change",
    "Carrier Change",
    "Third Party",
    "Pen & Paper",
    "Inbound",
    "Sale",
    "Twofer",
    "2nd Part of Twofer",
    "FU Sale",
    "Referral Sale",
    "Not Appointed",
    "Spanish",
    "No Sep",
    "Rewrite", // Enhancement 3: Added Rewrite lead type
  ];
  const carriers = [
    "Aetna", // Enhancement 3: Alphabetized carriers list
    "Anthem",
    "Cigna",
    "ClearSpring",
    "Clover",
    "Florida Blue",
    "Humana",
    "KelseyCare",
    "Molina",
    "Oscar",
    "UHC",
    "Wellcare",
    "Zing",
    // Enhancement 3: Removed "Rewrite" from carriers as it's now a lead type
  ];

  // Load existing leads from global state
  useEffect(() => {
    if (["Sale", "FU Sale", "Referral Sale"].includes(newLead.leadType)) {
      // Enhancement 3: Handle Rewrite lead type commission logic
      if (newLead.leadType === "Rewrite") {
        setNewLead((prev) => ({
          ...prev,
          commission: 50, // Rewrite commission amount
          sale: true
        }));
      } else {
        setNewLead((prev) => ({
          ...prev,
          sale: true,
          commission: newLead.carrier === "Rewrite" ? 50 : 115,
        }));
      }
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
    try {
      if (!validateForm()) return;

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
        agentEmail: user?.email || '',
        date: selectedDate,
        timestamp: leadTimestamp,
      };

      const result = await addLead(leadData);

      if (result?.success) {
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
        showToast(`Error adding lead: ${result?.error || 'Unknown error'}`, "error");
      }
    } catch (error) {
      console.error('Error in handleAddLead:', error);
      showToast(`Error adding lead: ${error.message || 'Unknown error'}`, "error");
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

    userLeads.forEach((lead) => {
      const date = new Date(lead.timestamp);
      const dayKey = date.toDateString();
      const year = date.getFullYear();
      const month = date.getMonth();
      const weekNumber = Math.ceil(date.getDate() / 7);
      const weekKey = `${year}-${month}-W${weekNumber}`;
      const monthKey = `${year}-${month}`;

      if (!dailyStats[dayKey]) dailyStats[dayKey] = { leads: 0, sales: 0 };
      dailyStats[dayKey].leads++;
      if (lead.sale) dailyStats[dayKey].sales++;

      if (!weeklyStats[weekKey]) weeklyStats[weekKey] = { leads: 0, sales: 0 };
      weeklyStats[weekKey].leads++;
      if (lead.sale) weeklyStats[weekKey].sales++;

      if (!monthlyStats[monthKey])
        monthlyStats[monthKey] = { leads: 0, sales: 0 };
      monthlyStats[monthKey].leads++;
      if (lead.sale) monthlyStats[monthKey].sales++;
    });

    const getBestPeriod = (stats) => {
      return Object.values(stats).reduce(
        (best, period) => {
          const rate =
            period.leads > 0 ? (period.sales / period.leads) * 100 : 0;
          return rate > best.rate ? { rate, sales: period.sales } : best;
        },
        { rate: 0, sales: 0 }
      );
    };

    return {
      bestDay: getBestPeriod(dailyStats),
      bestWeek: getBestPeriod(weeklyStats),
      bestMonth: getBestPeriod(monthlyStats),
    };
  };

  const thermostat = getThermostatProgress();
  const selectedDateLeads = getSelectedDateLeads();
  const allTimeBests = getAllTimeBests();
  const currentThemeStyles = themes[currentTheme] || themes.default || {
    primary: 'from-blue-600 to-purple-600',
    accent: 'from-blue-500 to-purple-500',
    card: 'bg-white/10'
  };
  const goals = globalAgentGoals[user.email] || {
    dailySales: 10,
    weeklySales: 50,
    monthlyGoal: 120,
    conversionRate: 25,
    referralRate: 15,
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${currentThemeStyles.primary} text-white`}
    >
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
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Sales Agent Dashboard
                </h1>
                <p className="text-gray-300">Welcome back, {user.name}</p>
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
                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1 cursor-pointer hover:bg-blue-700">
                  <Camera className="w-3 h-3 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 px-3 py-2 rounded-lg">
                <Flame className="w-5 h-5 text-white" />
                <span className="text-white font-bold">
                  {streak} day streak!
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-sm transition-colors text-white"
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
            { key: "dashboard", label: "Dashboard", icon: Target },
            { key: "analytics", label: "Analytics", icon: BarChart3 },
            { key: "leaderboards", label: "Leaderboard", icon: Crown },
            { key: "notifications", label: "Notifications", icon: Bell },
            { key: "supervisor", label: "Supervisor Help", icon: Headphones },
            { key: "five9", label: "Five9", icon: Clock },
            { key: "pvp", label: "PvP", icon: Sword },
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
              <tab.icon className="w-4 h-4 inline mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === "dashboard" && (
          <>
            {/* Date Filter */}
            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20`}
            >
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-blue-400" />
                <label className="text-sm font-medium text-gray-300">
                  Date Filter:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-800 border border-white/20 rounded px-3 py-2 text-white"
                />
                <span className="text-sm text-gray-300">
                  Viewing data for{" "}
                  {(() => {
                    const [year, month, day] = selectedDate
                      .split("-")
                      .map(Number);
                    return new Date(year, month - 1, day).toLocaleDateString();
                  })()}
                </span>
              </div>
            </div>

            {/* Goals Display */}
            {goals && (
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20`}
              >
                <h3 className="text-lg font-semibold text-white mb-3">
                  Your Goals (Set by Manager)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-gray-300 text-sm">Daily Sales</p>
                    <p
                      className={`text-xl font-bold ${
                        metrics.totalSales >= goals.dailySales
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {metrics.totalSales} / {goals.dailySales}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-300 text-sm">Weekly Sales</p>
                    <p className="text-xl font-bold text-white">
                      {goals.weeklySales}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-300 text-sm">Monthly Sales</p>
                    <p className="text-xl font-bold text-white">
                      {thermostat.monthlyGoal}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-300 text-sm">Conversion Goal</p>
                    <p
                      className={`text-xl font-bold ${
                        parseFloat(metrics.conversionRate) >=
                        goals.conversionRate
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {metrics.conversionRate}% / {goals.conversionRate}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-300 text-sm">Referral Goal</p>
                    <p
                      className={`text-xl font-bold ${
                        parseFloat(metrics.referralRate) >= goals.referralRate
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {metrics.referralRate}% / {goals.referralRate}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div
              className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <h3 className="text-xl font-semibold text-white">
                    Monthly Progress
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    ${thermostat.monthlyRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-300">
                    Revenue This Month
                  </div>
                </div>
              </div>
              <div className="relative h-8 bg-slate-700 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full bg-gradient-to-r ${currentThemeStyles.accent} transition-all duration-1000 relative`}
                  style={{ width: `${thermostat.progress}%` }}
                >
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-sm font-bold">
                    {thermostat.monthlySales}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-between px-1">
                  {[
                    0,
                    Math.floor(thermostat.monthlyGoal * 0.25),
                    Math.floor(thermostat.monthlyGoal * 0.5),
                    Math.floor(thermostat.monthlyGoal * 0.75),
                    thermostat.monthlyGoal,
                  ].map((mark) => (
                    <div
                      key={mark}
                      className="w-0.5 h-full bg-white/50"
                      style={{
                        position: "absolute",
                        left: `${(mark / thermostat.monthlyGoal) * 100}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-4">
                <span>0</span>
                <span>{Math.floor(thermostat.monthlyGoal * 0.25)}</span>
                <span>{Math.floor(thermostat.monthlyGoal * 0.5)}</span>
                <span>{Math.floor(thermostat.monthlyGoal * 0.75)}</span>
                <span>{thermostat.monthlyGoal} Sales</span>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-white">
                  {thermostat.monthlySales} Sales This Month
                </div>
                <div className="text-sm text-gray-300">
                  {thermostat.progress.toFixed(1)}% to {thermostat.monthlyGoal}{" "}
                  sales goal
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {[
                {
                  label: "Leads Today",
                  value: metrics.totalLeads,
                  color: "text-cyan-400",
                  icon: Users,
                },
                {
                  label: "Sales Today",
                  value: metrics.totalSales,
                  color: "text-green-400",
                  icon: Target,
                },
                {
                  label: "Conversion Rate",
                  value: `${metrics.conversionRate}%`,
                  color: "text-blue-400",
                  icon: TrendingUp,
                },
                {
                  label: "Revenue Today",
                  value: `${metrics.totalRevenue}`,
                  color: "text-yellow-400",
                  icon: DollarSign,
                },
                {
                  label: "Referral Rate",
                  value: `${metrics.referralRate}%`,
                  color: "text-purple-400",
                  icon: UserPlus,
                },
                {
                  label: "Referrals",
                  value: metrics.totalReferrals,
                  color: "text-pink-400",
                  icon: Award,
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-4 border border-white/20`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">{metric.label}</p>
                      <p className={`text-2xl font-bold ${metric.color}`}>
                        {metric.value}
                      </p>
                    </div>
                    <metric.icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Best Conversion Rates
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Best Day:</span>
                    <span className="text-green-400 font-bold">
                      {allTimeBests.bestDay.rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Best Week:</span>
                    <span className="text-green-400 font-bold">
                      {allTimeBests.bestWeek.rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Best Month:</span>
                    <span className="text-green-400 font-bold">
                      {allTimeBests.bestMonth.rate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Best Sales Performance
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Best Day:</span>
                    <span className="text-yellow-400 font-bold">
                      {allTimeBests.bestDay.sales} sales
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Best Week:</span>
                    <span className="text-yellow-400 font-bold">
                      {allTimeBests.bestWeek.sales} sales
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Best Month:</span>
                    <span className="text-yellow-400 font-bold">
                      {allTimeBests.bestMonth.sales} sales
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
              >
                <h3 className="text-xl font-semibold mb-4 text-white">
                  Add New Lead
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Lead Type *
                    </label>
                    <select
                      value={newLead.leadType}
                      onChange={(e) =>
                        setNewLead((prev) => ({
                          ...prev,
                          leadType: e.target.value,
                        }))
                      }
                      className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-white ${
                        formErrors.leadType
                          ? "border-red-500"
                          : "border-white/20"
                      }`}
                    >
                      <option value="" className="bg-slate-800">
                        Select Lead Type
                      </option>
                      {leadTypes.map((type) => (
                        <option
                          key={type}
                          value={type}
                          className="bg-slate-800"
                        >
                          {type}
                        </option>
                      ))}
                    </select>
                    {formErrors.leadType && (
                      <p className="text-red-400 text-sm mt-1">
                        {formErrors.leadType}
                      </p>
                    )}
                  </div>
                  {newLead.sale && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Client Name *
                        </label>
                        <input
                          type="text"
                          value={newLead.clientName}
                          onChange={(e) =>
                            setNewLead((prev) => ({
                              ...prev,
                              clientName: e.target.value,
                            }))
                          }
                          className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-white placeholder-gray-400 ${
                            formErrors.clientName
                              ? "border-red-500"
                              : "border-white/20"
                          }`}
                          placeholder="Enter client's full name"
                        />
                        {formErrors.clientName && (
                          <p className="text-red-400 text-sm mt-1">
                            {formErrors.clientName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Carrier *
                        </label>
                        <select
                          value={newLead.carrier}
                          onChange={(e) =>
                            setNewLead((prev) => ({
                              ...prev,
                              carrier: e.target.value,
                            }))
                          }
                          className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-white ${
                            formErrors.carrier
                              ? "border-red-500"
                              : "border-white/20"
                          }`}
                        >
                          <option value="" className="bg-slate-800">
                            Select Carrier
                          </option>
                          {carriers.map((carrier) => (
                            <option
                              key={carrier}
                              value={carrier}
                              className="bg-slate-800"
                            >
                              {carrier}
                            </option>
                          ))}
                        </select>
                        {formErrors.carrier && (
                          <p className="text-red-400 text-sm mt-1">
                            {formErrors.carrier}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CRM Link *
                    </label>
                    <input
                      type="url"
                      value={newLead.crmLink}
                      onChange={(e) =>
                        setNewLead((prev) => ({
                          ...prev,
                          crmLink: e.target.value,
                        }))
                      }
                      className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-white placeholder-gray-400 ${
                        formErrors.crmLink
                          ? "border-red-500"
                          : "border-white/20"
                      }`}
                      placeholder="https://crm.example.com/lead/12345"
                    />
                    {formErrors.crmLink && (
                      <p className="text-red-400 text-sm mt-1">
                        {formErrors.crmLink}
                      </p>
                    )}
                  </div>
                  {newLead.sale && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        HRA ($15)
                      </label>
                      <select
                        value={newLead.hra ? "yes" : "no"}
                        onChange={(e) =>
                          setNewLead((prev) => ({
                            ...prev,
                            hra: e.target.value === "yes",
                            hraValue: e.target.value === "yes" ? 15 : 0,
                          }))
                        }
                        className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="no" className="bg-slate-800">
                          No
                        </option>
                        <option value="yes" className="bg-slate-800">
                          Yes
                        </option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notes *
                    </label>
                    <textarea
                      value={newLead.notes}
                      onChange={(e) =>
                        setNewLead((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      className={`w-full bg-slate-800 border rounded-lg px-3 py-2 h-20 resize-none text-white placeholder-gray-400 ${
                        formErrors.notes ? "border-red-500" : "border-white/20"
                      }`}
                      placeholder="Add detailed notes about this lead..."
                    />
                    {formErrors.notes && (
                      <p className="text-red-400 text-sm mt-1">
                        {formErrors.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleAddLead}
                    className={`w-full bg-gradient-to-r ${currentThemeStyles.accent} hover:shadow-lg py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 text-white`}
                  >
                    Add Lead
                  </button>
                </div>
              </div>
              <div
                className={`${currentThemeStyles.card} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
              >
                <h3 className="text-xl font-semibold mb-4 text-white">
                  Leads for {new Date(selectedDate).toLocaleDateString()}
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedDateLeads.length === 0 ? (
                    <p className="text-gray-300 text-center py-8">
                      No leads for {new Date(selectedDate).toLocaleDateString()}
                      . Add your first lead!
                    </p>
                  ) : (
                    selectedDateLeads.slice(0, 10).map((lead) => (
                      <div key={lead.id} className="bg-white/5 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                lead.sale
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {lead.leadType}
                            </span>
                            {lead.clientName && (
                              <span className="ml-2 text-white text-sm font-medium">
                                {lead.clientName}
                              </span>
                            )}
                            {lead.carrier && (
                              <span className="ml-2 text-gray-300 text-sm">
                                {lead.carrier}
                              </span>
                            )}
                            {lead.sale && (
                              <span className="ml-2 text-yellow-400 text-sm">
                                $
                                {lead.commission +
                                  (lead.hra ? lead.hraValue : 0)}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(lead.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {lead.notes && (
                          <p className="text-gray-300 text-sm mt-2">
                            {lead.notes}
                          </p>
                        )}
                        {lead.crmLink && (
                          <a
                            href={lead.crmLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 text-xs hover:underline mt-1 flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View in CRM
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        {activeTab === "analytics" && (
          <AnalyticsDashboard leads={leads} user={user} theme={currentTheme} />
        )}
        {activeTab === "leaderboards" && <Leaderboards />}
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
        {activeTab === "five9" && <Five9Dashboard user={user} />}
        {activeTab === "pvp" && <PvPChallenges user={user} />}
      </div>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-md w-full mx-4">
        <div className="mb-8">
          <div className="flex bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setUserType("agent")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                userType === "agent"
                  ? `bg-gradient-to-r ${agentGradient} text-white shadow-lg`
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Sales Agent
            </button>
            <button
              onClick={() => setUserType("manager")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                userType === "manager"
                  ? `bg-gradient-to-r ${managerGradient} text-white shadow-lg`
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Shield className="w-5 h-5 inline mr-2" />
              Manager
            </button>
          </div>
        </div>
        <div
          className={`bg-gradient-to-br ${
            userType === "agent" ? agentGradient : managerGradient
          } p-1 rounded-2xl shadow-2xl`}
        >
          <div className="bg-slate-900 rounded-xl p-8">
            <div className="text-center mb-8">
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${
                  userType === "agent" ? agentGradient : managerGradient
                } mb-4`}
              >
                {userType === "agent" ? (
                  <Target className="w-8 h-8 text-white" />
                ) : (
                  <Shield className="w-8 h-8 text-white" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {userType === "agent" ? "Agent" : "Manager"}{" "}
                {isLogin ? "Login" : "Sign Up"}
              </h2>
              <p className="text-slate-400">
                {userType === "agent"
                  ? "Access your sales dashboard and track your performance"
                  : "Manage your team and monitor sales performance"}
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
                        <option value="tampa">Tampa</option>
                        <option value="orlando">Orlando</option>
                        <option value="daytona">Daytona</option>
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
                  userType === "agent" ? agentGradient : managerGradient
                } hover:shadow-lg text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105`}
              >
                {isLogin ? "Sign In" : "Create Account"} as{" "}
                {userType === "agent" ? "Agent" : "Manager"}
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

// Administrator Dashboard Component
const AdministratorDashboard = ({ user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTheme, setCurrentTheme] = useState(globalCurrentTheme);
  const [selectedDate, setSelectedDate] = useState(getMountainDateString());

  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
    globalCurrentTheme = newTheme;
    saveToStorage('currentTheme', newTheme);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'managers', name: 'Managers', icon: Users },
    { id: 'health', name: 'Company Health', icon: Activity },
    { id: 'five9', name: 'Five9 Data', icon: PhoneCall },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">$127,450</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-r ${themes[currentTheme].gradient}`}>
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2">+12.5% from last month</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Agents</p>
                    <p className="text-2xl font-bold text-gray-900">{mockAgents.length}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-r ${themes[currentTheme].gradient}`}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2">Across {globalTeams.length} teams</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{globalLeadsData.length}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-r ${themes[currentTheme].gradient}`}>
                    <Target className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-purple-600 mt-2">Today: {getMountainDateString()}</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">23.4%</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-r ${themes[currentTheme].gradient}`}>
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2">+2.1% improvement</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
                <div className="space-y-4">
                  {globalTeams.map(team => {
                    const teamStats = getRealTeamStats(team.name, selectedDate);
                    return (
                      <div key={team.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{team.name}</p>
                          <p className="text-sm text-gray-600">{team.agents.length} agents</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${teamStats.totalRevenue}</p>
                          <p className="text-sm text-gray-600">{teamStats.totalSales} sales</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New team created</p>
                      <p className="text-xs text-gray-600">{formatMountainTime(new Date())}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Monthly goal achieved</p>
                      <p className="text-xs text-gray-600">{formatMountainTime(new Date())}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">System maintenance scheduled</p>
                      <p className="text-xs text-gray-600">{formatMountainTime(new Date())}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'managers':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manager Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supervisorNames.slice(0, 6).map((supervisor, idx) => (
                  <div key={supervisor} className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${themes[currentTheme].gradient} flex items-center justify-center`}>
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{supervisor}</p>
                        <p className="text-sm text-gray-600">Manager</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Team Size</p>
                        <p className="font-semibold">{Math.floor(Math.random() * 8) + 3}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Performance</p>
                        <p className="font-semibold text-green-600">{85 + Math.floor(Math.random() * 15)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'health':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uptime</span>
                    <span className="font-semibold text-green-600">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-semibold">142ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-semibold">{mockAgents.length + supervisorNames.length}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <ProgressMeter current={87} goal={100} label="Overall Performance" theme={currentTheme} type="percentage" />
                  <ProgressMeter current={23} goal={30} label="Daily Sales Goal" theme={currentTheme} />
                  <ProgressMeter current={156} goal={200} label="Weekly Leads" theme={currentTheme} />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Issues</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Low conversion rate</p>
                      <p className="text-xs text-gray-600">Team Beta needs attention</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">All systems operational</p>
                      <p className="text-xs text-gray-600">No critical issues</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'five9':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Five9 Integration Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-semibold text-green-900">Connected</p>
                  <p className="text-sm text-green-600">API Status</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <PhoneCall className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="font-semibold text-blue-900">1,247</p>
                  <p className="text-sm text-blue-600">Total Calls Today</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Timer className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="font-semibold text-purple-900">4:32</p>
                  <p className="text-sm text-purple-600">Avg Call Time</p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="font-semibold text-orange-900">94.2%</p>
                  <p className="text-sm text-orange-600">Adherence Rate</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Adherence</h3>
              <div className="space-y-3">
                {mockAgents.slice(0, 6).map(agent => (
                  <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${themes[currentTheme].gradient} flex items-center justify-center`}>
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">{agent.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{85 + Math.floor(Math.random() * 15)}% adherence</span>
                      <div className={`w-3 h-3 rounded-full ${Math.random() > 0.3 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme Selection</label>
                  <ThemeSelector currentTheme={currentTheme} onThemeChange={handleThemeChange} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900">Mountain Time (Denver, Colorado)</p>
                    <p className="text-xs text-gray-600">Current time: {getMountainTime()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Management</label>
                  <div className="space-y-3">
                    <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900">Export Data</p>
                          <p className="text-sm text-blue-600">Download all leads and analytics</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-blue-600" />
                      </div>
                    </button>
                    
                    <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-900">Backup Settings</p>
                          <p className="text-sm text-green-600">Configure automatic backups</p>
                        </div>
                        <Save className="w-5 h-5 text-green-600" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Tab content not found</div>;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themes[currentTheme].gradient}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 bg-gradient-to-r ${themes[currentTheme].gradient} rounded-lg flex items-center justify-center`}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Administrator Dashboard</h1>
                <p className="text-sm text-gray-600">{getMountainTime()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeSelector currentTheme={currentTheme} onThemeChange={handleThemeChange} />
              
              <div className="flex items-center space-x-2 text-gray-700">
                <Shield className="w-5 h-5" />
                <span className="font-medium">{user.name}</span>
                <span className="text-sm text-gray-500">(Administrator)</span>
              </div>
              
              <button
                onClick={onSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? `border-${themes[currentTheme].primary} text-${themes[currentTheme].primary}`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
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
  if (user.role === "administrator") {
    return <AdministratorDashboard user={user} onSignOut={logout} />;
  }
  
  if (user.role === "manager") {
    return <ManagerDashboard user={user} onSignOut={logout} />;
  }

  return <AgentDashboard user={user} onSignOut={logout} />;
}
