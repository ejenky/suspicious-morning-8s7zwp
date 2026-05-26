import React, { useEffect } from "react";
import { AuthProvider } from "./hooks/useAuth";
import LeadTracker from "./components/LeadTracker";

function App() {
  // Auto-reload when a new deployment is detected so users never run a stale
  // cached JS bundle. Polls index.html and compares the main bundle filename.
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const response = await fetch("/index.html", { cache: "no-store" });
        const text = await response.text();
        const match = text.match(/\/static\/js\/main\.[a-f0-9]+\.js/);
        if (match) {
          const currentScript = document.querySelector(
            'script[src*="/static/js/main."]'
          );
          if (currentScript && !currentScript.src.includes(match[0])) {
            console.log("New version detected, reloading...");
            window.location.reload();
          }
        }
      } catch (e) {
        // silently fail
      }
    };

    const interval = setInterval(checkForUpdates, 5 * 60 * 1000); // every 5 min
    const timeout = setTimeout(checkForUpdates, 10000); // once shortly after mount

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AuthProvider>
      <LeadTracker />
    </AuthProvider>
  );
}

export default App;
