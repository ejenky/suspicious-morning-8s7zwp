import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// Hook to fetch ALL leads from Firebase for leaderboard
export const useAllLeads = () => {
  const [allLeads, setAllLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Setting up ALL leads listener for leaderboard");

    // Query for ALL leads (no agent filter)
    const leadsQuery = query(
      collection(db, "leads"),
      orderBy("timestamp", "desc")
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      leadsQuery,
      (snapshot) => {
        console.log("Firestore ALL leads snapshot received. Size:", snapshot.size);

        const leadsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp:
              data.timestamp instanceof Timestamp
                ? data.timestamp.toDate()
                : data.timestamp?.toDate?.() ||
                  new Date(data.timestamp || data.createdAt),
          };
        });

        console.log("Processed ALL leads data:", leadsData.length, "leads");
        setAllLeads(leadsData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Firestore ALL leads error:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => {
      console.log("Cleaning up ALL leads listener");
      unsubscribe();
    };
  }, []);

  // Get leads filtered by date range
  const getLeadsByDateRange = (startDate, endDate) => {
    return allLeads.filter((lead) => {
      const leadDate = new Date(lead.timestamp);
      return leadDate >= startDate && leadDate <= endDate;
    });
  };

  // Get unique agents with their stats for a date range
  const getAgentStats = (startDate, endDate) => {
    const filteredLeads = getLeadsByDateRange(startDate, endDate);

    // Group leads by agent
    const agentMap = {};

    filteredLeads.forEach((lead) => {
      const agentId = lead.agent;
      const agentEmail = lead.agentEmail || "unknown";

      if (!agentMap[agentId]) {
        agentMap[agentId] = {
          id: agentId,
          email: agentEmail,
          name: agentEmail.split("@")[0],
          leads: [],
          totalLeads: 0,
          sales: 0,
          referrals: 0,
          revenue: 0,
        };
      }

      agentMap[agentId].leads.push(lead);
      agentMap[agentId].totalLeads++;

      if (lead.sale) {
        agentMap[agentId].sales++;
        agentMap[agentId].revenue += (lead.commission || 115) + (lead.hra ? lead.hraValue || 15 : 0);
      }

      if (lead.leadType === "Referral Sale") {
        agentMap[agentId].referrals++;
      }
    });

    // Calculate conversion rate for each agent
    return Object.values(agentMap).map((agent) => ({
      ...agent,
      conversionRate: agent.totalLeads > 0
        ? ((agent.sales / agent.totalLeads) * 100).toFixed(1)
        : "0",
      referralRate: agent.totalLeads > 0
        ? ((agent.referrals / agent.totalLeads) * 100).toFixed(1)
        : "0",
    }));
  };

  return { allLeads, loading, error, getLeadsByDateRange, getAgentStats };
};
