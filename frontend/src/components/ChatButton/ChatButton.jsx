import React, { useEffect, useState } from "react";
import "./Chatbutton.css";
import { useNavigate, useLocation } from "react-router-dom";

const ChatButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [onChatPage, setOnChatPage] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setOnChatPage(location.pathname === "/chatbot");
    setVisible(location.pathname !== "/"); // Hide button on the homepage ("/")
  }, [location]);

  const handleNavigate = () => {
    navigate("/chatbot");
  };

  return (
    <div className="chat-button-wrapper" style={{ display: visible ? "block" : "none" }}>
      <button className="floating-button" onClick={handleNavigate}>
        {onChatPage ? "👋" : "🤖"}
        <span className="tooltip">Chat with AI</span>
      </button>
    </div>
  );
};

export default ChatButton;
