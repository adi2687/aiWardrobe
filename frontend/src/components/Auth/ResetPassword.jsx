import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Auth.css";
import { FaLock, FaEye, FaEyeSlash, FaTshirt } from "react-icons/fa";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [formValid, setFormValid] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;

  // Form validation
  useEffect(() => {
    setFormValid(
      password.trim() !== "" && 
      confirmPassword.trim() !== "" && 
      password === confirmPassword &&
      password.length >= 6
    );
  }, [password, confirmPassword]);

  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsResetting(true);

    try {
      const response = await fetch(`${apiUrl}/password/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Password has been reset successfully");
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      } else {
        setError(data.message || "Failed to reset password");
        if (data.message === "Invalid or expired reset token") {
          setIsTokenValid(false);
        }
      }
    } catch (err) {
      console.error("Error during password reset:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
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
          <h2>Reset Your Password</h2>
          <p className="auth-subtitle">
            Create a new password for your account
          </p>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          {!isTokenValid ? (
            <div className="token-expired">
              <p>This password reset link is invalid or has expired.</p>
              <button 
                className="auth-btn valid" 
                onClick={() => navigate("/auth")}
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <div className="password-input-container">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => togglePasswordVisibility("password")}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <p className="password-hint">Password must be at least 6 characters long</p>
              </div>

              <div className="form-group">
                <div className="password-input-container">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => togglePasswordVisibility("confirm")}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={`auth-btn ${formValid ? 'valid' : 'disabled'}`}
                disabled={!formValid || isResetting}
              >
                {isResetting ? <span className="loading-spinner-small"></span> : "Reset Password"}
              </button>
            </form>
          )}
          
          <p className="toggle-text">
            Remember your password?
            <button className="toggle-btn" onClick={() => navigate("/auth")}>
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
