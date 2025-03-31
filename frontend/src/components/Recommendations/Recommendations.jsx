import React, { useState, useEffect } from "react";
import "./Recommendations.css";

const Recommendations = () => {
  const [clothes, setClothes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch clothes on mount
  useEffect(() => {
    fetch("http://localhost:5000/user/images", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setClothes(data.allclothes))
      .catch((error) => console.error("Error fetching clothes:", error));
  }, []);

  // Fetch outfit suggestion
  const getSuggestion = async (input) => {
    try {
      setIsLoading(true);

      const response = await fetch("http://localhost:5000/chat/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input, clothes }),
      });

      const data = await response.json();
      const cleanedResponse = data.response
        .replace(/\*/g, "")
        .replace(/<.*?>/g, "")
        .replace(/(^\s+|\s+$)/g, "");

      setIsLoading(false);
      return cleanedResponse || "No suggestions available.";
    } catch (error) {
      console.error("Error fetching suggestion:", error);
      setIsLoading(false);
      return "Error fetching suggestion.";
    }
  };

  // Handle form submission
  const handle = async (e) => {
    e.preventDefault();

    if (!userInput.trim()) {
      alert("Please enter a question.");
      return;
    }

    const newMessages = [...messages, { sender: "user", text: userInput }];
    setMessages(newMessages);
    setUserInput("");

    const reply = await getSuggestion(userInput);
    setMessages([...newMessages, { sender: "bot", text: reply }]);
  };

  return (
    <div className="recommendations-container">
      <div className="recommendations-card">
        <h1>AI Outfit Recommender</h1 >
        <b>The ai knows your clothes which you have uploaded so just ask the questions for  outfit</b>
        <form onSubmit={handle}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Describe the event (e.g., Wedding, Casual Meetup)"
          />
          <button type="submit" className="recommendations-btn" disabled={isLoading}>
            {isLoading ? "Loading..." : "Get Outfit"}
          </button>
        </form>
        {messages.length > 0 && (
          <div className="messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
