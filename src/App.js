import React from "react";
import { AuthProvider } from "./hooks/useAuth";
import LeadTracker from "./components/LeadTracker";

function App() {
  return (
    <AuthProvider>
      <LeadTracker />
    </AuthProvider>
  );
}

export default App;
