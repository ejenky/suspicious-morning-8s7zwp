import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const Auth = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setError("");
      setLoading(true);

      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }

      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  const containerStyle = {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "2rem",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "2rem",
    color: "#333",
    fontSize: "24px",
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const inputStyle = {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "16px",
  };

  const buttonStyle = {
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  const linkStyle = {
    textAlign: "center",
    marginTop: "1rem",
    color: "#007bff",
    cursor: "pointer",
    textDecoration: "underline",
  };

  const errorStyle = {
    color: "#dc3545",
    textAlign: "center",
    marginBottom: "1rem",
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>
        {isLogin ? "Sign In" : "Sign Up"} to Lead Tracker
      </h1>

      {error && <div style={errorStyle}>{error}</div>}

      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...buttonStyle,
            backgroundColor: loading ? "#6c757d" : "#007bff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
        </button>
      </form>

      <div style={linkStyle} onClick={() => setIsLogin(!isLogin)}>
        {isLogin
          ? "Don't have an account? Sign up"
          : "Already have an account? Sign in"}
      </div>
    </div>
  );
};

export default Auth;
