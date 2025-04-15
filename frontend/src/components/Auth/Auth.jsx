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
  const [signingup, setsigning] = useState(false);

  const [logging, setlogging] = useState(false);
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  // Login Handler
const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  if (!email || !password) {
    setError("Please enter both email and password.");
    return;
  }

  setlogging(true); // Move here

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.msg || "Invalid email or password.");
    } else {
      console.log("Login successful:", data);
      window.location.href = "/profile";
    }
  } catch (err) {
    console.error("Error during login:", err);
    setError("Something went wrong. Please try again.");
  } finally {
    setlogging(false);
  }
};

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setsigning(true);
    if (!username || !email || !password) {
      setsigning(false);
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
        setToggle(false); // Switch to login
      } else {
        setError(data.message || "Signup failed.");
      }
    } catch (err) {
      console.error("Error during signup:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setsigning(false);
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
          <h2>Login to outfit-AI</h2>
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

            <button
              type="submit"
              className="auth-btn"
              style={{ color: "white", padding: "0px" }}
            >
              {logging ? <p>Loading</p> : <p>Login</p>}
            </button>
          </form>
          <p className="toggle-text">
            Don't have an account?{" "}
            <button className="toggle-btn" onClick={() => setToggle(!toggle)}>
              Sign up
            </button>
          </p>
          {/* <div className="loginwithauth"> */}
          {/* <button className="google-btn" onClick={LoginWithGoogle}>
              <img src="/Google.png" height={30}/>
            </button>
            <button className="facebook-btn" onClick={facebooklogin}>
              <FaFacebook />
            </button> */}
          {/* </div> */}
        </div>
      ) : (
        // Signup Form
        <div className="auth-card">
          <h2>Sign Up to outfit-AI</h2>
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
                style={{
                  border: "2px solid white",
                  borderRadius: "20px",
                  padding: "12px",
                  backgroundColor: "transparent",
                }}
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
              {signingup ? <div>Signing you Up</div> : <div>Sign Up</div>}
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
