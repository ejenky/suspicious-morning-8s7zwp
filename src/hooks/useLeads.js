import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// =============================================================================
// OPTIMIZATION: Increased polling interval to reduce reads (5 minutes)
// =============================================================================
const POLLING_INTERVAL = 300000; // 5 minutes

// =============================================================================
// OPTIMIZATION: Minimum time before refresh on visibility change (2 minutes)
// =============================================================================
const MIN_REFRESH_INTERVAL = 120000; // 2 minutes

// In-flight request tracking
const inFlightUserRequests = new Map();

export const useLeads = (userId) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);
  const isVisibleRef = useRef(true);
  const lastFetchTimeRef = useRef(0);

  // Optimized fetch function with request deduplication
  const fetchLeads = useCallback(async (showLoading = false, forceRefresh = false) => {
    if (!userId) {
      console.log("No userId provided to useLeads");
      setLoading(false);
      return;
    }

    // OPTIMIZATION: Check if we already have a fetch in progress
    const requestKey = `userLeads_${userId}`;
    if (inFlightUserRequests.has(requestKey)) {
      console.log("useLeads: Fetch already in progress, waiting...");
      return inFlightUserRequests.get(requestKey);
    }

    // OPTIMIZATION: Skip if data is still fresh (unless forced or initial load)
    const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
    if (!forceRefresh && timeSinceLastFetch < MIN_REFRESH_INTERVAL && leads.length > 0) {
      console.log("useLeads: Data is fresh, skipping fetch");
      return;
    }

    if (showLoading) setLoading(true);
    console.log("useLeads: Fetching leads for user:", userId);

    const fetchPromise = (async () => {
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
        lastFetchTimeRef.current = Date.now();
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("useLeads: Firestore error:", err);
        setError(err.message);
        setLoading(false);
      } finally {
        inFlightUserRequests.delete(requestKey);
      }
    })();

    inFlightUserRequests.set(requestKey, fetchPromise);
    return fetchPromise;
  }, [userId, leads.length]);

  // Initial fetch on mount
  useEffect(() => {
    fetchLeads(true);
  }, [fetchLeads]);

  // OPTIMIZED: Smart polling with 5-minute intervals
  useEffect(() => {
    if (!userId) return;

    // Start polling
    const startPolling = () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => {
        if (isVisibleRef.current) {
          console.log("useLeads: Auto-refresh polling (5-min interval)...");
          fetchLeads(false); // Don't show loading spinner for background refresh
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
          console.log("useLeads: Tab visible, data stale, refreshing...");
          fetchLeads(false);
        } else {
          console.log("useLeads: Tab visible, data fresh, skipping refresh");
        }
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

      // Immediately refresh leads so agent sees their new entry (force refresh)
      await fetchLeads(false, true);

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding lead:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteLead = async (leadId) => {
    try {
      console.log("Deleting lead:", leadId);

      const leadRef = doc(db, "leads", leadId);
      await deleteDoc(leadRef);
      console.log("Lead deleted successfully:", leadId);

      // Immediately refresh leads to reflect deletion
      await fetchLeads(false, true);

      return { success: true };
    } catch (error) {
      console.error("Error deleting lead:", error);
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

    // Exclude Dash Sale and Referral Sale from lead count (these are sales, not leads taken)
    const actualLeads = dayLeads.filter((lead) => {
      const leadType = lead.leadType || "";
      return !leadType.startsWith("Dash Sale") && !leadType.startsWith("Referral Sale");
    });

    const sales = dayLeads.filter((lead) => lead.sale);
    const referrals = dayLeads.filter(
      (lead) => lead.leadType?.startsWith("Referral Sale")
    );
    const dashSales = dayLeads.filter(
      (lead) => lead.leadType?.startsWith("Dash Sale")
    );

    const metrics = {
      totalLeads: actualLeads.length,
      totalSales: sales.length,
      totalReferrals: referrals.length,
      totalDashSales: dashSales.length,
      // Conversion rate = total sales / actual leads (matches displayed values)
      conversionRate:
        actualLeads.length > 0
          ? ((sales.length / actualLeads.length) * 100).toFixed(1)
          : "0",
      referralRate:
        actualLeads.length > 0
          ? ((referrals.length / actualLeads.length) * 100).toFixed(1)
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

  // Update existing lead
  const updateLead = async (leadId, updateData) => {
    try {
      console.log("Updating lead:", leadId, "with data:", updateData);
      const leadDocRef = doc(db, "leads", leadId);
      await updateDoc(leadDocRef, {
        ...updateData,
        updatedAt: new Date().toISOString(),
      });
      console.log("Lead updated successfully");
      // Refresh leads to show updated data (force refresh)
      await fetchLeads(false, true);
      return { success: true };
    } catch (error) {
      console.error("Error updating lead:", error);
      return { success: false, error: error.message };
    }
  };

  // Manual refresh function (force refresh to bypass cache)
  const refreshLeads = useCallback(() => fetchLeads(false, true), [fetchLeads]);

  return { leads, loading, error, addLead, deleteLead, updateLead, calculateMetrics, refreshLeads };
};
