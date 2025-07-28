import { useState, useEffect, useContext, createContext } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔥 Setting up auth listener...");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔥 Auth state changed:", firebaseUser?.email || "no user");

      if (firebaseUser) {
        try {
          // Try to get user profile from Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          let userData;
          if (userDoc.exists()) {
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userDoc.data(),
            };
            console.log(
              "✅ User profile loaded:",
              userData.email,
              userData.role
            );
          } else {
            // Create new user profile
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: "agent",
              name: firebaseUser.email.split("@")[0],
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, userData);
            console.log("✅ New user profile created:", userData.email);
          }
          setUser(userData);
        } catch (error) {
          console.error("❌ Error with user profile:", error);
          // Fallback - still set user even if Firestore fails
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: "agent",
            name: firebaseUser.email.split("@")[0],
          });
        }
      } else {
        console.log("❌ No user - logged out");
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      console.log("🔥 Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      console.log("🔥 Attempting login:", email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Login successful");
      return { success: true, user: result.user };
    } catch (error) {
      console.error("❌ Login failed:", error.message);
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, profileData) => {
    try {
      console.log("🔥 Attempting signup:", email);
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userProfile = {
        uid: result.user.uid,
        email: result.user.email,
        ...profileData,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", result.user.uid), userProfile);
      console.log("✅ Signup successful");
      return { success: true, user: result.user };
    } catch (error) {
      console.error("❌ Signup failed:", error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      console.log("🔥 Logging out");
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("❌ Logout failed:", error.message);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
