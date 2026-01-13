import React, { useState, useEffect } from "react";

// Separate component to avoid re-renders from parent
const TeamGoals = ({ initialGoals, onSave }) => {
  const [salesGoal, setSalesGoal] = useState("");
  const [conversionGoal, setConversionGoal] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize values from props only once
  useEffect(() => {
    if (initialGoals) {
      setSalesGoal(String(initialGoals.salesGoal ?? 50));
      setConversionGoal(String(initialGoals.conversionGoal ?? 25));
    }
  }, []); // Empty dependency - only run once on mount

  // Update if initialGoals changes and we haven't edited yet
  useEffect(() => {
    if (initialGoals && salesGoal === "" && conversionGoal === "") {
      setSalesGoal(String(initialGoals.salesGoal ?? 50));
      setConversionGoal(String(initialGoals.conversionGoal ?? 25));
    }
  }, [initialGoals]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const goals = {
        salesGoal: parseInt(salesGoal) || 0,
        conversionGoal: parseInt(conversionGoal) || 0,
      };
      await onSave(goals);
      alert("Team goals updated successfully!");
    } catch (error) {
      alert("Error updating team goals: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-6 bg-white/10 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-white mb-4">Team Goals</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Team Sales Goal (Daily)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={salesGoal}
            onChange={(e) => setSalesGoal(e.target.value)}
            className="w-full bg-slate-800 border border-white/20 rounded px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Team Conversion Goal (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={conversionGoal}
            onChange={(e) => setConversionGoal(e.target.value)}
            className="w-full bg-slate-800 border border-white/20 rounded px-3 py-2 text-white"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-4 bg-green-600 hover:bg-green-700 disabled:bg-green-800 px-4 py-2 rounded text-white"
      >
        {isSaving ? "Saving..." : "Update Team Goals"}
      </button>
    </div>
  );
};

export default React.memo(TeamGoals);
