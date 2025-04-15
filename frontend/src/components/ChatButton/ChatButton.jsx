import React, { useEffect, useState } from "react";
import "./Chatbutton.css";
import { useNavigate, useLocation } from "react-router-dom";

const ChatButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [onChatPage, setOnChatPage] = useState(false);

  useEffect(() => {
    // Update state when the route changes
    setOnChatPage(location.pathname === "/chatbot");
  }, [location]);

  const handleNavigate = () => {
    navigate("/chatbot");
  };

  return (
    <div className="chat-button-wrapper">
      <button className="floating-button" onClick={handleNavigate}>
        {onChatPage ? "👋" : "🤖"}
        <span className="tooltip">Chat with AI</span>
      </button>
    </div>
  );
};

export default ChatButton;
