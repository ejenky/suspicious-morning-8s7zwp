import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// Polling interval in milliseconds (60 seconds = controlled, predictable reads)
const POLLING_INTERVAL = 60000;

export const useLeads = (userId) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);
  const isVisibleRef = useRef(true);

  // One-time fetch function (much more efficient than real-time listener)
  const fetchLeads = useCallback(async (showLoading = false) => {
    if (!userId) {
      console.log("No userId provided to useLeads");
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    console.log("useLeads: Fetching leads for user:", userId);

    try {
      // Query for user's leads (no orderBy to avoid index requirement)
      const leadsQuery = query(
        collection(db, "leads"),
        where("agent", "==", userId)
      );

      const snapshot = await getDocs(leadsQuery);
      console.log("useLeads: Received", snapshot.size, "leads");

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

      // Sort client-side by timestamp descending
      leadsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log("useLeads: Processed leads data:", leadsData.length, "leads");
      setLeads(leadsData);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("useLeads: Firestore error:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch on mount
  useEffect(() => {
    fetchLeads(true);
  }, [fetchLeads]);

  // Smart polling - auto-refresh every 60 seconds when tab is visible
  useEffect(() => {
    if (!userId) return;

    // Start polling
    const startPolling = () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => {
        if (isVisibleRef.current) {
          console.log("useLeads: Auto-refresh polling...");
          fetchLeads(false); // Don't show loading spinner for background refresh
        }
      }, POLLING_INTERVAL);
    };

    // Handle visibility change - refresh when tab becomes visible
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        console.log("useLeads: Tab visible, refreshing data...");
        fetchLeads(false);
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId, fetchLeads]);

  const addLead = async (leadData) => {
    try {
      console.log("Adding lead for user:", userId, "Lead data:", leadData);

      const lead = {
        ...leadData,
        agent: userId,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "leads"), lead);
      console.log("Lead added successfully with ID:", docRef.id);

      // Immediately refresh leads so agent sees their new entry
      await fetchLeads(false);

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding lead:", error);
      return { success: false, error: error.message };
    }
  };

  const calculateMetrics = (selectedDate) => {
    if (!selectedDate) {
      selectedDate = new Date().toISOString().split("T")[0];
    }

    console.log(
      "Calculating metrics for date:",
      selectedDate,
      "Total leads:",
      leads.length
    );

    const [year, month, day] = selectedDate.split("-").map(Number);
    const selectedDateObj = new Date(year, month - 1, day, 0, 0, 0, 0);
    const nextDay = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

    const dayLeads = leads.filter((lead) => {
      const leadDate = new Date(lead.timestamp);
      return leadDate >= selectedDateObj && leadDate < nextDay;
    });

    const sales = dayLeads.filter((lead) => lead.sale);
    const referrals = dayLeads.filter(
      (lead) => lead.leadType === "Referral Sale"
    );

    const metrics = {
      totalLeads: dayLeads.length,
      totalSales: sales.length,
      totalReferrals: referrals.length,
      conversionRate:
        dayLeads.length > 0
          ? ((sales.length / dayLeads.length) * 100).toFixed(1)
          : "0",
      referralRate:
        dayLeads.length > 0
          ? ((referrals.length / dayLeads.length) * 100).toFixed(1)
          : "0",
      totalRevenue: sales.reduce(
        (sum, lead) =>
          sum + (lead.commission || 115) + (lead.hra ? lead.hraValue || 15 : 0),
        0
      ),
    };

    console.log("Calculated metrics:", metrics);
    return metrics;
  };

  // Manual refresh function (in case agent wants to force refresh)
  const refreshLeads = useCallback(() => fetchLeads(false), [fetchLeads]);

  return { leads, loading, error, addLead, calculateMetrics, refreshLeads };
};
