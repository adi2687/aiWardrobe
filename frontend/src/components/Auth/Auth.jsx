import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { FaGoogle, FaFacebook, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaTshirt } from "react-icons/fa";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [toggle, setToggle] = useState(false); // Toggle between Login & Signup
  const [showPassword, setShowPassword] = useState(false);
  const [signingup, setSigning] = useState(false);
  const [logging, setLogging] = useState(false);
  const [formValid, setFormValid] = useState(false);
  
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;

  // Form validation
  useEffect(() => {
    if (!toggle) {
      // Login validation
      setFormValid(email.trim() !== "" && password.trim() !== "");
    } else {
      // Signup validation
      setFormValid(
        email.trim() !== "" && 
        password.trim() !== "" && 
        username.trim() !== "" &&
        password.length >= 6
      );
    }
  }, [email, password, username, toggle]);

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLogging(true);

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
      setLogging(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!username || !email || !password) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setSigning(true);

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
        setError("");
        // Show success message
        const successMessage = document.createElement("div");
        successMessage.className = "success-message";
        successMessage.textContent = "Account created successfully! Please log in.";
        document.querySelector(".auth-card").prepend(successMessage);
        
        // Clear form
        setEmail("");
        setPassword("");
      } else {
        setError(data.message || "Signup failed.");
      }
    } catch (err) {
      console.error("Error during signup:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSigning(false);
    }
  };

  // Google Login
  const loginWithGoogle = async (e) => {
    e.preventDefault();
    window.location.href = `${apiUrl}/google/login`;
  };

  const loginWithFacebook = () => {
    console.log("Facebook login clicked");
    // Implement Facebook login functionality
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-brand">
          <div className="brand-logo">
            <FaTshirt className="logo-icon" />
            <h1>outfit-AI</h1>
          </div>
          <p className="brand-tagline">Your AI-powered wardrobe assistant</p>
        </div>

        <div className="auth-card">
          <h2>{!toggle ? "Welcome Back" : "Create Account"}</h2>
          <p className="auth-subtitle">
            {!toggle ? "Sign in to access your AI wardrobe" : "Join outfit-AI today"}
          </p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={!toggle ? handleLogin : handleSignup}>
            {toggle && (
              <div className="form-group">
                    
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{width:"92%"}}
                  required
                />
              </div>
            )}

            <div className="form-group">
              
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{width:"92%"}}
                required
              />
            </div>

            <div className="form-group">
             
              <div className="password-input-container">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {toggle && (
                <p className="password-hint">Password must be at least 6 characters long</p>
              )}
            </div>

            {!toggle && (
              <div className="forgot-password">
                <a href="#" onClick={(e) => e.preventDefault()}>Forgot password?</a>
              </div>
            )}

            <button
              type="submit"
              className={`auth-btn ${formValid ? 'valid' : 'disabled'}`}
              disabled={!formValid || logging || signingup}
            >
              {!toggle ? (
                logging ? <span className="loading-spinner-small"></span> : "Sign In"
              ) : (
                signingup ? <span className="loading-spinner-small"></span> : "Create Account"
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="social-login">
            <button className="google-btn" onClick={loginWithGoogle}>
              <FaGoogle />
              <span>Google</span>
            </button>
            <button className="facebook-btn" onClick={loginWithFacebook}>
              <FaFacebook />
              <span>Facebook</span>
            </button>
          </div>

          <p className="toggle-text">
            {!toggle ? "Don't have an account?" : "Already have an account?"}
            <button className="toggle-btn" onClick={() => setToggle(!toggle)}>
              {!toggle ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
