import React, { useState, useCallback } from "react";

// Completely isolated component using native form handling
const TeamGoals = ({ initialGoals, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Read values directly from form elements
    const form = e.target;
    const salesGoal = parseInt(form.salesGoal.value) || 0;
    const conversionGoal = parseInt(form.conversionGoal.value) || 0;

    setIsSaving(true);
    try {
      await onSave({ salesGoal, conversionGoal });
      alert("Team goals updated successfully!");
    } catch (error) {
      alert("Error updating team goals: " + error.message);
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  return (
    <div className="mt-6 bg-white/10 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-white mb-4">Team Goals</h4>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="salesGoal" className="block text-sm text-gray-300 mb-2">
              Team Sales Goal (Daily)
            </label>
            <input
              id="salesGoal"
              name="salesGoal"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              defaultValue={initialGoals?.salesGoal ?? 50}
              className="w-full bg-slate-800 border border-white/20 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label htmlFor="conversionGoal" className="block text-sm text-gray-300 mb-2">
              Team Conversion Goal (%)
            </label>
            <input
              id="conversionGoal"
              name="conversionGoal"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              defaultValue={initialGoals?.conversionGoal ?? 25}
              className="w-full bg-slate-800 border border-white/20 rounded px-3 py-2 text-white"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="mt-4 bg-green-600 hover:bg-green-700 disabled:bg-green-800 px-4 py-2 rounded text-white"
        >
          {isSaving ? "Saving..." : "Update Team Goals"}
        </button>
      </form>
    </div>
  );
};

export default React.memo(TeamGoals);
