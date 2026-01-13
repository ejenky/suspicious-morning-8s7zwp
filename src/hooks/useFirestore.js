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
} from "firebase/firestore";
import { db } from "../firebase";

// Polling interval in milliseconds (60 seconds = controlled, predictable reads)
const POLLING_INTERVAL = 60000;

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

  // One-time fetch for leads (much more efficient than real-time listener)
  const fetchLeads = useCallback(async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log("useFirestore: Fetching leads (one-time)");

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
      setLoading(false);
    } catch (error) {
      console.error("useFirestore: Error fetching leads:", error);
      setLoading(false);
    }
  }, [userEmail]);

  // Initial fetch on mount
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Derive agents from leads data - extract unique agents who have submitted leads
  useEffect(() => {
    if (leads.length === 0) {
      setAgents([]);
      return;
    }

    console.log("useFirestore: Deriving agents from", leads.length, "leads");

    // Extract unique agents from leads data
    const agentMap = new Map();

    leads.forEach((lead) => {
      // Use agent (userId) as the primary identifier
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
    console.log("useFirestore: Found", agentsData.length, "unique agents");
    setAgents(agentsData);
  }, [leads]);

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

  // Smart polling - auto-refresh every 60 seconds when tab is visible
  useEffect(() => {
    if (!userEmail) return;

    // Start polling
    const startPolling = () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => {
        if (isVisibleRef.current) {
          console.log("useFirestore: Auto-refresh polling...");
          fetchLeads();
          fetchTeams();
        }
      }, POLLING_INTERVAL);
    };

    // Handle visibility change - refresh when tab becomes visible
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        console.log("useFirestore: Tab visible, refreshing data...");
        fetchLeads();
        fetchTeams();
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userEmail, fetchLeads, fetchTeams]);

  // Refresh all data function
  const refreshData = useCallback(async () => {
    console.log("useFirestore: Refreshing all data...");
    await Promise.all([fetchLeads(), fetchTeams()]);
  }, [fetchLeads, fetchTeams]);

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

      console.log("Agent goals updated for:", agentEmail, goals);
    } catch (error) {
      console.error("Error updating agent goals:", error);
      throw error;
    }
  };

  // Fetch individual agent goals from Firebase
  const fetchAgentGoals = async (agentEmail) => {
    if (!agentEmail) return null;

    try {
      const docId = agentEmail.replace(/\./g, '_');
      const agentGoalsRef = doc(db, "agentGoals", docId);
      const goalsDoc = await getDoc(agentGoalsRef);

      if (goalsDoc.exists()) {
        const data = goalsDoc.data();
        console.log("Fetched agent goals for:", agentEmail, data.goals);
        return data.goals;
      }
      return null;
    } catch (error) {
      console.error("Error fetching agent goals:", error);
      return null;
    }
  };

  return {
    leads,
    agents,
    teams,
    myTeamMemberIds,
    myTeamGoals,
    loading,
    lastRefresh,
    addLead,
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
