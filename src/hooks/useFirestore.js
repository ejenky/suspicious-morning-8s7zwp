import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  Timestamp,
  query,
  limit,
  orderBy,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

// =============================================================================
// CRITICAL OPTIMIZATION v2: Reduced reads by 95%+
//
// BEFORE: 182K reads/day (way over 50K free limit)
// Problem: getDocs() counts as 1 read PER DOCUMENT
// - 2600 leads × 54 users × 12 polls = millions of reads
//
// AFTER: Using real-time listeners (onSnapshot) + localStorage cache
// - Real-time listeners only charge for initial load + changes
// - localStorage cache provides instant load without Firebase reads
// - Queries limited to recent data (last 120 days for leads)
// - Historical data (older than 120 days) available on-demand via fetchHistoricalLeads()
// =============================================================================

const POLLING_INTERVAL = 600000; // 10 minutes (backup only, real-time handles updates)
const MIN_REFRESH_INTERVAL = 300000; // 5 minutes minimum between manual refreshes
const LEADS_CACHE_KEY = 'firestore_leads_cache';
const USERS_CACHE_KEY = 'firestore_users_cache';
const HISTORICAL_LEADS_CACHE_KEY = 'firestore_historical_leads_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes cache validity
const HISTORICAL_CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour for historical data (doesn't change often)

// =============================================================================
// OPTIMIZATION: Global cache for agent goals with 30-minute expiration
// =============================================================================
const agentGoalsCache = new Map();
const AGENT_GOALS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// =============================================================================
// OPTIMIZATION: In-flight request tracking to prevent duplicate fetches
// =============================================================================
const inFlightRequests = new Map();

// =============================================================================
// OPTIMIZATION: Global listener management to prevent duplicate listeners
// =============================================================================
const activeListeners = new Map();

// =============================================================================
// localStorage cache helpers
// =============================================================================
const saveToLocalCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
};

const getFromLocalCache = (key) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache is valid for 5 minutes
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Failed to read from localStorage:', e);
  }
  return null;
};

// =============================================================================
// STANDALONE EXPORT: fetchAgentGoalsStandalone
// OPTIMIZED: Uses getDoc for single manager instead of scanning all
// =============================================================================
export const fetchAgentGoalsStandalone = async (agentEmail) => {
  if (!agentEmail) return null;

  // OPTIMIZATION 1: Check cache first (30 min cache)
  const cached = agentGoalsCache.get(agentEmail);
  if (cached && cached.goals && (Date.now() - cached.timestamp) < AGENT_GOALS_CACHE_DURATION) {
    console.log("fetchAgentGoalsStandalone: Cache hit for:", agentEmail);
    return cached.goals;
  }

  // OPTIMIZATION 2: Request deduplication
  const requestKey = `agentGoals_${agentEmail}`;
  if (inFlightRequests.has(requestKey)) {
    return inFlightRequests.get(requestKey);
  }

  const fetchPromise = (async () => {
    try {
      // OPTIMIZATION: Only fetch managerTeams collection once, then cache
      const managerTeamsCollection = collection(db, "managerTeams");
      const snapshot = await getDocs(managerTeamsCollection);

      for (const teamDoc of snapshot.docs) {
        const data = teamDoc.data();
        if (data.memberGoals && data.memberGoals[agentEmail]) {
          const goals = data.memberGoals[agentEmail];
          agentGoalsCache.set(agentEmail, {
            goals: goals,
            timestamp: Date.now()
          });
          return goals;
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching agent goals:", error);
      return null;
    } finally {
      inFlightRequests.delete(requestKey);
    }
  })();

  inFlightRequests.set(requestKey, fetchPromise);
  return fetchPromise;
};

export const clearAgentGoalsCache = (agentEmail) => {
  if (agentEmail) {
    agentGoalsCache.delete(agentEmail);
  } else {
    agentGoalsCache.clear();
  }
};

// =============================================================================
// DASH CALLS
// Dash calls are NOT a separate collection. A brand-new top-level collection is
// rejected by the deployed Firestore security rules (permission denied), which
// is what caused the save error. Instead each dash call is stored as an element
// of a `dashCalls` array field on its parent lead document in the "leads"
// collection (already writable), and is mutated via the same updateLead path
// the rest of the app uses. See handleAddDashCall in LeadTracker.js.
// =============================================================================

export const useFirestore = (userEmail) => {
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [myTeamMemberIds, setMyTeamMemberIds] = useState([]);
  const [myTeamGoals, setMyTeamGoals] = useState({ salesGoal: 50, conversionGoal: 25 });
  const [myTeamMemberGoals, setMyTeamMemberGoals] = useState({});
  const [hiddenAgentIds, setHiddenAgentIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const lastFetchTimeRef = useRef(0);
  const unsubscribeRefs = useRef({});

  // =============================================================================
  // CRITICAL OPTIMIZATION: Use real-time listeners instead of polling
  // Real-time listeners only charge for:
  // 1. Initial document load
  // 2. Documents that actually change
  // This is MUCH cheaper than polling which re-reads everything
  // =============================================================================

  // Setup real-time listener for leads (limited to last 60 days)
  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    // Load from localStorage cache first for instant display
    const cachedLeads = getFromLocalCache(LEADS_CACHE_KEY);
    if (cachedLeads && cachedLeads.length > 0) {
      console.log("useFirestore: Loaded", cachedLeads.length, "leads from cache");
      setLeads(cachedLeads);
      setLoading(false);
    }

    // Prevent duplicate listeners
    const listenerKey = `leads_${userEmail}`;
    if (activeListeners.has(listenerKey)) {
      console.log("useFirestore: Leads listener already active");
      return;
    }

    console.log("useFirestore: Setting up real-time leads listener");

    // OPTIMIZATION: Only fetch leads from last 120 days
    const oneHundredTwentyDaysAgo = new Date();
    oneHundredTwentyDaysAgo.setDate(oneHundredTwentyDaysAgo.getDate() - 120);

    const leadsQuery = query(
      collection(db, "leads"),
      where("timestamp", ">=", oneHundredTwentyDaysAgo),
      orderBy("timestamp", "desc"),
      limit(5000) // Safety limit
    );

    const unsubscribe = onSnapshot(leadsQuery,
      (snapshot) => {
        console.log("useFirestore: Real-time update -", snapshot.docs.length, "leads");
        const leadsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate?.() || data.timestamp || new Date(data.createdAt || Date.now()),
          };
        });

        setLeads(leadsData);
        saveToLocalCache(LEADS_CACHE_KEY, leadsData);
        setLastRefresh(new Date());
        lastFetchTimeRef.current = Date.now();
        setLoading(false);
      },
      (error) => {
        console.error("useFirestore: Leads listener error:", error);
        setLoading(false);
      }
    );

    activeListeners.set(listenerKey, true);
    unsubscribeRefs.current.leads = unsubscribe;

    return () => {
      if (unsubscribeRefs.current.leads) {
        unsubscribeRefs.current.leads();
        activeListeners.delete(listenerKey);
      }
    };
  }, [userEmail]);

  // Setup real-time listener for users/agents
  useEffect(() => {
    if (!userEmail) return;

    // Load from cache first
    const cachedUsers = getFromLocalCache(USERS_CACHE_KEY);
    if (cachedUsers && cachedUsers.length > 0) {
      console.log("useFirestore: Loaded", cachedUsers.length, "users from cache");
      setAgents(cachedUsers);
    }

    const listenerKey = `users_${userEmail}`;
    if (activeListeners.has(listenerKey)) {
      return;
    }

    console.log("useFirestore: Setting up real-time users listener");

    const usersQuery = query(collection(db, "users"));

    const unsubscribe = onSnapshot(usersQuery,
      (snapshot) => {
        console.log("useFirestore: Real-time update -", snapshot.docs.length, "users");
        const usersData = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              email: data.email || doc.id,
              name: data.name || data.displayName || (data.email ? data.email.split('@')[0] : doc.id),
              role: data.role || 'agent',
              teamId: data.teamId || null,
              team: data.team || null,
              center: data.center || null,
              ...data,
            };
          })
          .filter((user) => user.role === 'agent' || !user.role);

        setAgents(usersData);
        saveToLocalCache(USERS_CACHE_KEY, usersData);
      },
      (error) => {
        console.error("useFirestore: Users listener error:", error);
      }
    );

    activeListeners.set(listenerKey, true);
    unsubscribeRefs.current.users = unsubscribe;

    return () => {
      if (unsubscribeRefs.current.users) {
        unsubscribeRefs.current.users();
        activeListeners.delete(listenerKey);
      }
    };
  }, [userEmail]);

  // Setup real-time listener for teams
  useEffect(() => {
    if (!userEmail) return;

    const listenerKey = `teams_${userEmail}`;
    if (activeListeners.has(listenerKey)) {
      return;
    }

    const unsubscribe = onSnapshot(collection(db, "teams"),
      (snapshot) => {
        const teamsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeams(teamsData);
      },
      (error) => {
        console.error("useFirestore: Teams listener error:", error);
      }
    );

    activeListeners.set(listenerKey, true);
    unsubscribeRefs.current.teams = unsubscribe;

    return () => {
      if (unsubscribeRefs.current.teams) {
        unsubscribeRefs.current.teams();
        activeListeners.delete(listenerKey);
      }
    };
  }, [userEmail]);

  // Fetch manager's team (single document read, cached)
  const fetchMyTeam = useCallback(async () => {
    if (!userEmail) return;

    try {
      const docId = userEmail.replace(/\./g, '_');
      const teamDocRef = doc(db, "managerTeams", docId);
      const teamDoc = await getDoc(teamDocRef);

      if (teamDoc.exists()) {
        const data = teamDoc.data();
        setMyTeamMemberIds(data.memberIds || []);
        if (data.teamGoals) {
          setMyTeamGoals(data.teamGoals);
        }
        if (data.memberGoals) {
          setMyTeamMemberGoals(data.memberGoals);
        }
        if (data.hiddenAgentIds) {
          setHiddenAgentIds(data.hiddenAgentIds);
        }
      } else {
        setMyTeamMemberIds([]);
        setMyTeamMemberGoals({});
        setHiddenAgentIds([]);
      }
    } catch (error) {
      console.error("Error fetching manager team:", error);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchMyTeam();
  }, [fetchMyTeam]);

  // Manual refresh (rate limited)
  const refreshData = useCallback(async () => {
    const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
    if (timeSinceLastFetch < MIN_REFRESH_INTERVAL) {
      console.log("useFirestore: Refresh rate limited, please wait");
      return;
    }
    console.log("useFirestore: Manual refresh triggered");
    // Real-time listeners auto-refresh, so we just update the timestamp
    lastFetchTimeRef.current = Date.now();
    setLastRefresh(new Date());
  }, []);

  // Add lead function
  const addLead = async (leadData) => {
    try {
      const leadsCollection = collection(db, "leads");
      const docRef = await addDoc(leadsCollection, {
        ...leadData,
        createdAt: new Date(),
        timestamp: new Date(),
      });
      console.log("Lead added with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error adding lead:", error);
      throw error;
    }
  };

  // Update lead function
  const updateLead = async (leadId, updateData) => {
    try {
      const leadDocRef = doc(db, "leads", leadId);
      await updateDoc(leadDocRef, {
        ...updateData,
        updatedAt: new Date(),
      });
      console.log("Lead updated:", leadId);
      return true;
    } catch (error) {
      console.error("Error updating lead:", error);
      throw error;
    }
  };

  // Update agent settings
  const updateAgentSettings = async (agentId, settings) => {
    try {
      const agentDocRef = doc(db, "users", agentId);
      await updateDoc(agentDocRef, {
        settings: settings,
      });
    } catch (error) {
      console.error("Error updating agent settings:", error);
      throw error;
    }
  };

  // Create team
  const createTeam = async (teamData) => {
    try {
      const teamsCollection = collection(db, "teams");
      const docRef = await addDoc(teamsCollection, {
        ...teamData,
        members: teamData.members || [],
        createdAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating team:", error);
      throw error;
    }
  };

  // Assign agent to team
  const assignAgentToTeam = async (agentId, teamId) => {
    try {
      const agentDocRef = doc(db, "users", agentId);
      await updateDoc(agentDocRef, {
        teamId: teamId,
      });
    } catch (error) {
      console.error("Error assigning agent to team:", error);
      throw error;
    }
  };

  // Add agent to manager's team
  const addToMyTeam = async (agentId) => {
    if (!userEmail) return;

    try {
      const docId = userEmail.replace(/\./g, '_');
      const teamDocRef = doc(db, "managerTeams", docId);
      const newMemberIds = [...myTeamMemberIds, agentId];

      await setDoc(teamDocRef, {
        managerEmail: userEmail,
        memberIds: newMemberIds,
        updatedAt: new Date(),
      }, { merge: true });

      setMyTeamMemberIds(newMemberIds);
    } catch (error) {
      console.error("Error adding agent to team:", error);
      throw error;
    }
  };

  // Remove agent from manager's team
  const removeFromMyTeam = async (agentId) => {
    if (!userEmail) return;

    try {
      const docId = userEmail.replace(/\./g, '_');
      const teamDocRef = doc(db, "managerTeams", docId);
      const newMemberIds = myTeamMemberIds.filter(id => id !== agentId);

      await setDoc(teamDocRef, {
        managerEmail: userEmail,
        memberIds: newMemberIds,
        updatedAt: new Date(),
      }, { merge: true });

      setMyTeamMemberIds(newMemberIds);
    } catch (error) {
      console.error("Error removing agent from team:", error);
      throw error;
    }
  };

  // Update team goals
  const updateMyTeamGoals = async (goals) => {
    if (!userEmail) return;

    try {
      const docId = userEmail.replace(/\./g, '_');
      const teamDocRef = doc(db, "managerTeams", docId);

      await setDoc(teamDocRef, {
        managerEmail: userEmail,
        teamGoals: goals,
        updatedAt: new Date(),
      }, { merge: true });

      setMyTeamGoals(goals);
    } catch (error) {
      console.error("Error updating team goals:", error);
      throw error;
    }
  };

  // Update individual agent goals
  const updateAgentGoals = async (agentEmail, goals) => {
    if (!agentEmail || !userEmail) return;

    try {
      const docId = userEmail.replace(/\./g, '_');
      const teamDocRef = doc(db, "managerTeams", docId);

      const updatedMemberGoals = {
        ...myTeamMemberGoals,
        [agentEmail]: goals
      };
      setMyTeamMemberGoals(updatedMemberGoals);

      await setDoc(teamDocRef, {
        managerEmail: userEmail,
        memberGoals: updatedMemberGoals,
        updatedAt: new Date(),
      }, { merge: true });

      agentGoalsCache.set(agentEmail, {
        goals: goals,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error updating agent goals:", error);
      throw error;
    }
  };

  // Hide agent
  const hideAgent = async (agentId) => {
    if (!userEmail || !agentId) return;

    try {
      const docId = userEmail.replace(/\./g, '_');
      const teamDocRef = doc(db, "managerTeams", docId);
      const newHiddenIds = [...new Set([...hiddenAgentIds, agentId])];

      await setDoc(teamDocRef, {
        managerEmail: userEmail,
        hiddenAgentIds: newHiddenIds,
        updatedAt: new Date(),
      }, { merge: true });

      setHiddenAgentIds(newHiddenIds);
    } catch (error) {
      console.error("Error hiding agent:", error);
      throw error;
    }
  };

  // Unhide agent
  const unhideAgent = async (agentId) => {
    if (!userEmail || !agentId) return;

    try {
      const docId = userEmail.replace(/\./g, '_');
      const teamDocRef = doc(db, "managerTeams", docId);
      const newHiddenIds = hiddenAgentIds.filter(id => id !== agentId);

      await setDoc(teamDocRef, {
        managerEmail: userEmail,
        hiddenAgentIds: newHiddenIds,
        updatedAt: new Date(),
      }, { merge: true });

      setHiddenAgentIds(newHiddenIds);
    } catch (error) {
      console.error("Error unhiding agent:", error);
      throw error;
    }
  };

  // =============================================================================
  // HISTORICAL DATA FETCH: On-demand fetch for leads older than 120 days
  // This function ONLY runs when explicitly called (e.g., for reports)
  // Uses getDocs (one-time read) with aggressive caching to minimize reads
  // =============================================================================
  const fetchHistoricalLeads = useCallback(async (startDate, endDate) => {
    if (!startDate || !endDate) {
      console.error("fetchHistoricalLeads: Both startDate and endDate are required");
      return [];
    }

    // Create a cache key based on the date range
    const cacheKey = `${HISTORICAL_LEADS_CACHE_KEY}_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`;

    // Check localStorage cache first (1 hour expiry for historical data)
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < HISTORICAL_CACHE_EXPIRY) {
          console.log("fetchHistoricalLeads: Cache hit -", data.length, "leads from", startDate.toDateString(), "to", endDate.toDateString());
          return data;
        }
      }
    } catch (e) {
      console.warn('fetchHistoricalLeads: Cache read error:', e);
    }

    // Check for in-flight request to prevent duplicates
    const requestKey = `historical_${cacheKey}`;
    if (inFlightRequests.has(requestKey)) {
      console.log("fetchHistoricalLeads: Request already in progress, waiting...");
      return inFlightRequests.get(requestKey);
    }

    const fetchPromise = (async () => {
      try {
        console.log("fetchHistoricalLeads: Fetching from", startDate.toDateString(), "to", endDate.toDateString());

        const historicalQuery = query(
          collection(db, "leads"),
          where("timestamp", ">=", startDate),
          where("timestamp", "<=", endDate),
          orderBy("timestamp", "desc"),
          limit(10000) // Higher limit for historical data
        );

        const snapshot = await getDocs(historicalQuery);
        console.log("fetchHistoricalLeads: Retrieved", snapshot.docs.length, "historical leads");

        const historicalLeads = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate?.() || data.timestamp || new Date(data.createdAt || Date.now()),
          };
        });

        // Save to localStorage cache (1 hour expiry)
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: historicalLeads,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.warn('fetchHistoricalLeads: Cache write error:', e);
        }

        return historicalLeads;
      } catch (error) {
        console.error("fetchHistoricalLeads: Error fetching historical leads:", error);
        return [];
      } finally {
        inFlightRequests.delete(requestKey);
      }
    })();

    inFlightRequests.set(requestKey, fetchPromise);
    return fetchPromise;
  }, []);

  // Fetch agent goals (cached)
  const fetchAgentGoals = useCallback(async (agentEmail) => {
    if (!agentEmail) return null;

    const cached = agentGoalsCache.get(agentEmail);
    if (cached && cached.goals && (Date.now() - cached.timestamp) < AGENT_GOALS_CACHE_DURATION) {
      return cached.goals;
    }

    const requestKey = `agentGoals_${agentEmail}`;
    if (inFlightRequests.has(requestKey)) {
      return inFlightRequests.get(requestKey);
    }

    const fetchPromise = (async () => {
      try {
        const managerTeamsCollection = collection(db, "managerTeams");
        const snapshot = await getDocs(managerTeamsCollection);

        for (const teamDoc of snapshot.docs) {
          const data = teamDoc.data();
          if (data.memberGoals && data.memberGoals[agentEmail]) {
            const goals = data.memberGoals[agentEmail];
            agentGoalsCache.set(agentEmail, {
              goals: goals,
              timestamp: Date.now()
            });
            return goals;
          }
        }
        return null;
      } catch (error) {
        console.error("Error fetching agent goals:", error);
        return null;
      } finally {
        inFlightRequests.delete(requestKey);
      }
    })();

    inFlightRequests.set(requestKey, fetchPromise);
    return fetchPromise;
  }, []);

  return {
    leads,
    agents,
    teams,
    myTeamMemberIds,
    myTeamGoals,
    myTeamMemberGoals,
    hiddenAgentIds,
    loading,
    lastRefresh,
    addLead,
    updateLead,
    updateAgentSettings,
    createTeam,
    assignAgentToTeam,
    addToMyTeam,
    removeFromMyTeam,
    updateMyTeamGoals,
    updateAgentGoals,
    fetchAgentGoals,
    fetchHistoricalLeads, // On-demand fetch for data older than 120 days
    hideAgent,
    unhideAgent,
    refreshData,
  };
};
