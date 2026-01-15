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
} from "firebase/firestore";
import { db } from "../firebase";

// =============================================================================
// OPTIMIZATION: Increased polling interval to reduce reads (5 minutes)
// Previous: 60 seconds = ~1440 reads/day per user just from polling
// New: 5 minutes = ~288 reads/day per user (80% reduction)
// =============================================================================
const POLLING_INTERVAL = 300000; // 5 minutes

// =============================================================================
// OPTIMIZATION: Minimum time before refresh on visibility change (2 minutes)
// Prevents excessive reads when switching tabs frequently
// =============================================================================
const MIN_REFRESH_INTERVAL = 120000; // 2 minutes

// =============================================================================
// OPTIMIZATION: Global cache for agent goals with 5-minute expiration
// Reduced from 24 hours to 5 minutes so manager changes show up faster
// =============================================================================
const agentGoalsCache = new Map();
const AGENT_GOALS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (was 24 hours)

// =============================================================================
// OPTIMIZATION: In-flight request tracking to prevent duplicate fetches
// If a fetch is in progress, subsequent requests wait for it instead of
// making new Firebase calls
// =============================================================================
const inFlightRequests = new Map();

// =============================================================================
// STANDALONE EXPORT: fetchAgentGoalsStandalone
// Use this to fetch agent goals WITHOUT instantiating the full useFirestore hook
// This is perfect for AgentDashboard which only needs goals, not all leads
//
// FIX: Don't cache null results - only cache actual goals data
// =============================================================================
export const fetchAgentGoalsStandalone = async (agentEmail) => {
  if (!agentEmail) return null;

  // OPTIMIZATION 1: Check cache first (24-hour TTL)
  // IMPORTANT: Only use cache if we have actual goals data (not null)
  const cached = agentGoalsCache.get(agentEmail);
  if (cached && cached.goals && (Date.now() - cached.timestamp) < AGENT_GOALS_CACHE_DURATION) {
    console.log("fetchAgentGoalsStandalone: Cache hit for:", agentEmail);
    return cached.goals;
  }

  // OPTIMIZATION 2: Request deduplication - wait for in-flight request
  const requestKey = `agentGoals_${agentEmail}`;
  if (inFlightRequests.has(requestKey)) {
    console.log("fetchAgentGoalsStandalone: Waiting for in-flight request:", agentEmail);
    return inFlightRequests.get(requestKey);
  }

  console.log("fetchAgentGoalsStandalone: Fetching from Firebase for:", agentEmail);

  const fetchPromise = (async () => {
    try {
      const docId = agentEmail.replace(/\./g, '_');
      const agentGoalsRef = doc(db, "agentGoals", docId);
      const goalsDoc = await getDoc(agentGoalsRef);

      if (goalsDoc.exists()) {
        const data = goalsDoc.data();
        // Store in cache only if we have actual goals
        if (data.goals) {
          agentGoalsCache.set(agentEmail, {
            goals: data.goals,
            timestamp: Date.now()
          });
          console.log("fetchAgentGoalsStandalone: Cached goals for:", agentEmail, data.goals);
        }
        return data.goals;
      }
      // DON'T cache null results - allow future lookups to check Firebase
      console.log("fetchAgentGoalsStandalone: No goals document found for:", agentEmail);
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

// =============================================================================
// UTILITY: Clear agent goals cache (useful after goals are updated)
// =============================================================================
export const clearAgentGoalsCache = (agentEmail) => {
  if (agentEmail) {
    agentGoalsCache.delete(agentEmail);
  } else {
    agentGoalsCache.clear();
  }
};

export const useFirestore = (userEmail) => {
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [myTeamMemberIds, setMyTeamMemberIds] = useState([]);
  const [myTeamGoals, setMyTeamGoals] = useState({ salesGoal: 50, conversionGoal: 25 });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const pollingRef = useRef(null);
  const isVisibleRef = useRef(true);
  const lastFetchTimeRef = useRef(0); // Track last fetch timestamp for smart refresh

  // One-time fetch for leads with request deduplication
  const fetchLeads = useCallback(async (forceRefresh = false) => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    // OPTIMIZATION: Check if we already have a fetch in progress
    const requestKey = `leads_${userEmail}`;
    if (inFlightRequests.has(requestKey)) {
      console.log("useFirestore: Fetch already in progress, waiting...");
      return inFlightRequests.get(requestKey);
    }

    // OPTIMIZATION: Skip if data is still fresh (unless forced)
    const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
    if (!forceRefresh && timeSinceLastFetch < MIN_REFRESH_INTERVAL && leads.length > 0) {
      console.log("useFirestore: Data is fresh, skipping fetch");
      return;
    }

    setLoading(true);
    console.log("useFirestore: Fetching leads (optimized)");

    const fetchPromise = (async () => {
      try {
        const leadsCollection = collection(db, "leads");
        const snapshot = await getDocs(leadsCollection);

        console.log("useFirestore: Received", snapshot.docs.length, "leads from Firebase");

        const leadsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Normalize timestamp
            timestamp: data.timestamp?.toDate?.() || data.timestamp || new Date(data.createdAt || Date.now()),
          };
        });

        // Sort by timestamp client-side
        leadsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        console.log("useFirestore: Processed leads:", leadsData.length);

        setLeads(leadsData);
        setLastRefresh(new Date());
        lastFetchTimeRef.current = Date.now();
        setLoading(false);
      } catch (error) {
        console.error("useFirestore: Error fetching leads:", error);
        setLoading(false);
      } finally {
        inFlightRequests.delete(requestKey);
      }
    })();

    inFlightRequests.set(requestKey, fetchPromise);
    return fetchPromise;
  }, [userEmail, leads.length]);

  // Initial fetch on mount
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // One-time fetch for teams
  const fetchTeams = useCallback(async () => {
    if (!userEmail) return;

    try {
      const teamsCollection = collection(db, "teams");
      const snapshot = await getDocs(teamsCollection);
      const teamsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeams(teamsData);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  }, [userEmail]);

  // Initial fetch for teams
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Fallback function to derive agents from leads (in case users collection is unavailable)
  const deriveAgentsFromLeads = useCallback(() => {
    if (leads.length === 0) {
      setAgents([]);
      return;
    }

    console.log("useFirestore: Deriving agents from", leads.length, "leads (fallback)");

    const agentMap = new Map();

    leads.forEach((lead) => {
      const agentId = lead.agent;
      const agentEmail = lead.agentEmail || lead.agent;

      if (agentId && !agentMap.has(agentId)) {
        agentMap.set(agentId, {
          id: agentId,
          email: agentEmail,
          name: lead.agentName || (agentEmail.includes('@') ? agentEmail.split('@')[0] : agentEmail) || 'Unknown Agent',
          teamId: lead.teamId || null,
          team: lead.team || null,
          center: lead.center || null,
        });
      }
    });

    const agentsData = Array.from(agentMap.values());
    console.log("useFirestore: Found", agentsData.length, "unique agents from leads");
    setAgents(agentsData);
  }, [leads]);

  // =============================================================================
  // FIX: Fetch agents from users collection instead of deriving from leads
  // This ensures:
  // 1. All active users appear (even if they haven't submitted leads yet)
  // 2. Deleted users don't appear (they're removed from users collection)
  // =============================================================================
  const fetchUsers = useCallback(async () => {
    if (!userEmail) return;

    // OPTIMIZATION: Check if we already have a fetch in progress
    const requestKey = `users_${userEmail}`;
    if (inFlightRequests.has(requestKey)) {
      console.log("useFirestore: Users fetch already in progress, waiting...");
      return inFlightRequests.get(requestKey);
    }

    console.log("useFirestore: Fetching users from users collection");

    const fetchPromise = (async () => {
      try {
        const usersCollection = collection(db, "users");
        const snapshot = await getDocs(usersCollection);

        console.log("useFirestore: Received", snapshot.docs.length, "users from Firebase");

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
          // Filter to only include agents (exclude managers/admins from agent list)
          .filter((user) => user.role === 'agent' || !user.role);

        console.log("useFirestore: Found", usersData.length, "agents in users collection");
        setAgents(usersData);
      } catch (error) {
        console.error("useFirestore: Error fetching users:", error);
        // Fallback: derive agents from leads if users collection fails
        console.log("useFirestore: Falling back to deriving agents from leads");
        deriveAgentsFromLeads();
      } finally {
        inFlightRequests.delete(requestKey);
      }
    })();

    inFlightRequests.set(requestKey, fetchPromise);
    return fetchPromise;
  }, [userEmail, deriveAgentsFromLeads]);

  // Initial fetch for users (agents)
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // OPTIMIZED: Smart polling with 5-minute intervals
  useEffect(() => {
    if (!userEmail) return;

    // Start polling
    const startPolling = () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => {
        if (isVisibleRef.current) {
          console.log("useFirestore: Auto-refresh polling (5-min interval)...");
          fetchLeads();
          fetchTeams();
          fetchUsers(); // Also refresh users list
        }
      }, POLLING_INTERVAL);
    };

    // OPTIMIZATION: Smart visibility change - only refresh if data is stale
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
        // Only refresh if more than 2 minutes have passed
        if (timeSinceLastFetch > MIN_REFRESH_INTERVAL) {
          console.log("useFirestore: Tab visible, data stale, refreshing...");
          fetchLeads();
          fetchTeams();
          fetchUsers(); // Also refresh users list
        } else {
          console.log("useFirestore: Tab visible, data fresh, skipping refresh");
        }
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userEmail, fetchLeads, fetchTeams, fetchUsers]);

  // Refresh all data function (force refresh to bypass cache)
  const refreshData = useCallback(async () => {
    console.log("useFirestore: Manual refresh - forcing data update...");
    await Promise.all([fetchLeads(true), fetchTeams(), fetchUsers()]);
  }, [fetchLeads, fetchTeams, fetchUsers]);

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
      // Refresh leads after update
      await fetchLeads();
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
      console.log("Agent settings updated");
    } catch (error) {
      console.error("Error updating agent settings:", error);
      throw error;
    }
  };

  // Create team
  const createTeam = async (teamData) => {
    try {
      console.log("Creating team with data:", teamData);
      const teamsCollection = collection(db, "teams");
      const docRef = await addDoc(teamsCollection, {
        ...teamData,
        members: teamData.members || [],
        createdAt: new Date(),
      });
      console.log("Team created with ID:", docRef.id);
      // Refresh teams list after creating
      await fetchTeams();
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
      console.log("Agent assigned to team");
    } catch (error) {
      console.error("Error assigning agent to team:", error);
      throw error;
    }
  };

  // Fetch manager's team from Firebase
  const fetchMyTeam = useCallback(async () => {
    if (!userEmail) return;

    try {
      // Use email as document ID (replace dots with underscores for valid ID)
      const docId = userEmail.replace(/\./g, '_');
      const teamDocRef = doc(db, "managerTeams", docId);
      const teamDoc = await getDoc(teamDocRef);

      if (teamDoc.exists()) {
        const data = teamDoc.data();
        console.log("Fetched manager team:", data.memberIds?.length || 0, "members");
        setMyTeamMemberIds(data.memberIds || []);
        // Load team goals if they exist
        if (data.teamGoals) {
          setMyTeamGoals(data.teamGoals);
        }
      } else {
        console.log("No manager team found, starting fresh");
        setMyTeamMemberIds([]);
      }
    } catch (error) {
      console.error("Error fetching manager team:", error);
    }
  }, [userEmail]);

  // Initial fetch for manager's team
  useEffect(() => {
    fetchMyTeam();
  }, [fetchMyTeam]);

  // Add agent to manager's team (persisted to Firebase)
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
      console.log("Agent added to manager team:", agentId);
    } catch (error) {
      console.error("Error adding agent to team:", error);
      throw error;
    }
  };

  // Remove agent from manager's team (persisted to Firebase)
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
      console.log("Agent removed from manager team:", agentId);
    } catch (error) {
      console.error("Error removing agent from team:", error);
      throw error;
    }
  };

  // Update team goals (persisted to Firebase)
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
      console.log("Team goals updated:", goals);
    } catch (error) {
      console.error("Error updating team goals:", error);
      throw error;
    }
  };

  // Update individual agent goals (persisted to Firebase)
  const updateAgentGoals = async (agentEmail, goals) => {
    if (!agentEmail) return;

    try {
      const docId = agentEmail.replace(/\./g, '_');
      const agentGoalsRef = doc(db, "agentGoals", docId);

      await setDoc(agentGoalsRef, {
        agentEmail: agentEmail,
        goals: goals,
        updatedAt: new Date(),
        setBy: userEmail,
      }, { merge: true });

      // OPTIMIZATION: Update cache immediately when goals change
      agentGoalsCache.set(agentEmail, {
        goals: goals,
        timestamp: Date.now()
      });

      console.log("Agent goals updated for:", agentEmail, goals);
    } catch (error) {
      console.error("Error updating agent goals:", error);
      throw error;
    }
  };

  // =============================================================================
  // CRITICAL OPTIMIZATION: fetchAgentGoals is now memoized with useCallback
  // and uses a 24-hour cache + request deduplication
  //
  // Previous behavior: Created new function reference on every render,
  // causing useEffect dependencies to trigger unnecessary re-fetches
  //
  // New behavior: Stable function reference + caching = massive read reduction
  //
  // FIX: Don't cache null results - only cache actual goals data
  // This ensures that if goals are set later, they can be fetched
  // =============================================================================
  const fetchAgentGoals = useCallback(async (agentEmail) => {
    if (!agentEmail) return null;

    // OPTIMIZATION 1: Check cache first (24-hour TTL)
    // IMPORTANT: Only use cache if we have actual goals data (not null)
    const cached = agentGoalsCache.get(agentEmail);
    if (cached && cached.goals && (Date.now() - cached.timestamp) < AGENT_GOALS_CACHE_DURATION) {
      console.log("fetchAgentGoals: Cache hit for:", agentEmail);
      return cached.goals;
    }

    // OPTIMIZATION 2: Request deduplication - wait for in-flight request
    const requestKey = `agentGoals_${agentEmail}`;
    if (inFlightRequests.has(requestKey)) {
      console.log("fetchAgentGoals: Waiting for in-flight request:", agentEmail);
      return inFlightRequests.get(requestKey);
    }

    console.log("fetchAgentGoals: Fetching from Firebase for:", agentEmail);

    const fetchPromise = (async () => {
      try {
        const docId = agentEmail.replace(/\./g, '_');
        const agentGoalsRef = doc(db, "agentGoals", docId);
        const goalsDoc = await getDoc(agentGoalsRef);

        if (goalsDoc.exists()) {
          const data = goalsDoc.data();
          // Store in cache only if we have actual goals
          if (data.goals) {
            agentGoalsCache.set(agentEmail, {
              goals: data.goals,
              timestamp: Date.now()
            });
            console.log("fetchAgentGoals: Cached goals for:", agentEmail, data.goals);
          }
          return data.goals;
        }
        // DON'T cache null results - allow future lookups to check Firebase
        console.log("fetchAgentGoals: No goals document found for:", agentEmail);
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
  }, []); // Empty deps = stable reference

  return {
    leads,
    agents,
    teams,
    myTeamMemberIds,
    myTeamGoals,
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
    refreshData,
  };
};
