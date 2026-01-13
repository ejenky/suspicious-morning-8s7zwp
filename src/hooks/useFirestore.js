import { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export const useFirestore = (userEmail) => {
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

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
      const teamsCollection = collection(db, "teams");
      const docRef = await addDoc(teamsCollection, {
        ...teamData,
        createdAt: new Date(),
      });
      console.log("Team created with ID:", docRef.id);
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

  return {
    leads,
    agents,
    teams,
    loading,
    lastRefresh,
    addLead,
    updateAgentSettings,
    createTeam,
    assignAgentToTeam,
    refreshData,
  };
};
