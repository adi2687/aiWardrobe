import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { FaGoogle } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [toggle, setToggle] = useState(false); // Toggle between Login & Signup
  const navigate = useNavigate();
  const [logging, setlogging] = useState(false);
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setlogging(true);
    if (!email || !password) {
      setlogging(false);

      setError("Please enter both email and password.");
      return;
    }

    try {
      setlogging(true)
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        // Display backend error message
        setError(data.msg || "Invalid email or password.");
        setlogging(false);
        return;
      }

      console.log("Login successful:", data);
      setlogging(false);
      window.location.href = "/profile";
    } catch (err) {
      console.error("Error during login:", err);
      setError("Something went wrong. Please try again.");
    }
  };
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Signup successful:", data);
        setToggle(false); // Switch to Login after successful signup
      } else {
        setError(data.message || "Signup failed.");
      }
    } catch (err) {
      console.error("Error during signup:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  // Google Login
  const LoginWithGoogle = async (e) => {
    e.preventDefault();
    window.location.href = `${apiUrl}/google/login`;
  };

  const facebooklogin = () => {
    console.log("cliekced");
  };
  return (
    <div className="auth-container">
      {!toggle ? (
        // Login Form
        <div className="auth-card">
          <h2>Login</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-btn">
              {logging ? <p>Loading</p> : <p>Login</p>}
            </button>
          </form>
          <p className="toggle-text">
            Don't have an account?{" "}
            <button className="toggle-btn" onClick={() => setToggle(!toggle)}>
              Sign up
            </button>
          </p>
          <div className="loginwithauth">
            <button className="google-btn" onClick={LoginWithGoogle}>
              <FaGoogle />
            </button>
            <button className="facebook-btn" onClick={facebooklogin}>
              <FaFacebook />
            </button>
          </div>
        </div>
      ) : (
        // Signup Form
        <div className="auth-card">
          <h2>Sign Up</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-btn">
              Sign Up
            </button>
          </form>
          <p className="toggle-text">
            Already have an account?{" "}
            <button className="toggle-btn" onClick={() => setToggle(!toggle)}>
              Login
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default Auth;
