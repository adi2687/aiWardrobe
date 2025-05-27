import React, { useState } from "react";
import { AvatarCreator } from "@readyplayerme/react-avatar-creator";

export default function ReadyPlayerMeAvatar({ projectId }) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [showCreator, setShowCreator] = useState(true);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {showCreator ? (
        <AvatarCreator
          subdomain="demo" // Your Ready Player Me subdomain
          config={{
            clearCache: true,
            bodyType: "fullbody",
            quickStart: false,
            language: "en"
          }}
          style={{ width: "100%", height: "100%" }}
          onAvatarExported={(url) => {
            console.log("Avatar URL:", url);
            setAvatarUrl(url);
            setShowCreator(false);
          }}
          onError={(error) => {
            console.error("Avatar creation failed:", error);
            alert("Avatar creation failed: " + error);
          }}
        />
      ) : (
        <div className="avatar-result" style={{ padding: 20, maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ marginBottom: "20px", color: "#fff" }}>Your Avatar is Ready!</h2>
          
          <div style={{ marginBottom: "20px", background: "#1e1e1e", padding: "20px", borderRadius: "10px" }}>
            <img 
              src={avatarUrl} 
              alt="Your 3D Avatar" 
              style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }} 
            />
          </div>
          
          <div style={{ marginBottom: "20px" }}>
            <p style={{ color: "#aaa", marginBottom: "10px" }}>Avatar URL:</p>
            <a 
              href={avatarUrl} 
              target="_blank" 
              rel="noreferrer"
              style={{ color: "#6a11cb", wordBreak: "break-all" }}
            >
              {avatarUrl}
            </a>
          </div>
          
          <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
            <button 
              onClick={() => setShowCreator(true)}
              style={{
                padding: "12px 24px",
                background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "30px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "15px"
              }}
            >
              Create New Avatar
            </button>
            
            <button 
              onClick={() => window.location.href = "/shop"}
              style={{
                padding: "12px 24px",
                background: "#2a2a2a",
                color: "#fff",
                border: "1px solid #6a11cb",
                borderRadius: "30px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "15px"
              }}
            >
              Try On Clothes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
