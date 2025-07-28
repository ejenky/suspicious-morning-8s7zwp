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

  // Fetch leads
  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    const leadsCollection = collection(db, "leads");
    const q = query(leadsCollection, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const leadsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeads(leadsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching leads:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userEmail]);

  // Fetch agents
  useEffect(() => {
    if (!userEmail) return;

    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("role", "==", "agent"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const agentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAgents(agentsData);
      },
      (error) => {
        console.error("Error fetching agents:", error);
      }
    );

    return () => unsubscribe();
  }, [userEmail]);

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
