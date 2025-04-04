import React, { useState } from "react";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getOutfitSuggestion = async (input) => {
    try {
      setIsLoading(true);

      const response = await fetch("http://localhost:5000/chat/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });

      const data = await response.json();
      setIsLoading(false);
      // console.log(data);
      const cleanedResponse = data.response
  .replace(/\*/g, "") // Remove all stars
  .replace(/\s{2,}/g, " ") // Remove extra spaces
  .replace(/\n\s*\n/g, "\n");
      return cleanedResponse || "No suggestion available.";
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      return "Error fetching suggestion.";
    }
  };

  const handleSend = async (e) => {
    e.preventDefault(); // Prevent form submission

    if (!userInput.trim()) {
      alert("Please enter a question.");
      return;
    }

    const newMessages = [...messages, { sender: "user", text: userInput }];
    setMessages(newMessages);
    setUserInput("");

    const reply = await getOutfitSuggestion(userInput);
    setMessages([...newMessages, { sender: "bot", text: reply }]);
  };

  return (
    <div className="chatbot-container">
      <h2>Outfit Recommender</h2>
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))} 
        {isLoading && <div className="message bot">Loading...</div>}
      </div>
      <form onSubmit={handleSend} className="input-container">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Describe the event..."
          name="prompt"
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
