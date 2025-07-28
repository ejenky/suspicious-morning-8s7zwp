import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export const useLeads = (userId) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      console.log("No userId provided to useLeads");
      setLoading(false);
      return;
    }

    console.log("Setting up leads listener for user:", userId);

    // Create query for user's leads
    const leadsQuery = query(
      collection(db, "leads"),
      where("agent", "==", userId),
      orderBy("timestamp", "desc")
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      leadsQuery,
      (snapshot) => {
        console.log("Firestore leads snapshot received. Size:", snapshot.size);

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

        console.log("Processed leads data:", leadsData.length, "leads");
        setLeads(leadsData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Firestore leads error:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => {
      console.log("Cleaning up leads listener");
      unsubscribe();
    };
  }, [userId]);

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

  return { leads, loading, error, addLead, calculateMetrics };
};
