import { useState, useEffect } from "react";
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
} from "firebase/firestore";
import { db } from "../firebase";

export const useFirestore = (userEmail) => {
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch ALL leads for manager view
  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    console.log("useFirestore: Setting up leads listener for manager view");
    const leadsCollection = collection(db, "leads");

    // Fetch ALL leads without orderBy (avoids index requirements)
    const unsubscribe = onSnapshot(
      leadsCollection,
      (snapshot) => {
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
        setLoading(false);
      },
      (error) => {
        console.error("useFirestore: Error fetching leads:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userEmail]);

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

  // Fetch teams
  useEffect(() => {
    if (!userEmail) return;

    const teamsCollection = collection(db, "teams");

    const unsubscribe = onSnapshot(
      teamsCollection,
      (snapshot) => {
        const teamsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeams(teamsData);
      },
      (error) => {
        console.error("Error fetching teams:", error);
      }
    );

    return () => unsubscribe();
  }, [userEmail]);

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
    addLead,
    updateAgentSettings,
    createTeam,
    assignAgentToTeam,
  };
};
