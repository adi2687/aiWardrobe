import React, { useEffect, useState, useRef } from "react";
import "./Chatbot.css";

const Chatbot = () => {
  // Initialize with some test messages to demonstrate scrolling
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm your fashion assistant. How can I help you today?" },
    { sender: "user", text: "I need help with an outfit for a wedding" },
    { sender: "bot", text: "Great! I'd be happy to help you find the perfect outfit for a wedding. Could you tell me a bit more about the wedding? Is it formal, semi-formal, or casual? And are you attending as a guest, part of the wedding party, or something else?" },
    { sender: "user", text: "It's a formal evening wedding and I'm a guest" },
    { sender: "bot", text: "Perfect! For a formal evening wedding as a guest, you have several elegant options. Based on your wardrobe, I recommend wearing your navy blue suit with a crisp white shirt and your burgundy tie. Complete the look with your black Oxford shoes and silver cufflinks for a sophisticated appearance. Would you like me to suggest alternative options?" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const [userClothes, setUserClothes] = useState([]);
  const messagesEndRef = useRef(null);

  const userCloths = () => {
    fetch(`${apiUrl}/user/images`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials:"include"
    })
      .then((response) => response.json())
      .then((data) => {
        setUserClothes(data.Wardrobe.allclothes[0]); // Store the clothes list
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  useEffect(() => {
    userCloths();
  }, []);
  
  // Scroll to bottom of messages container when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const getOutfitSuggestion = async (input) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${apiUrl}/chat/chatbot`, {
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
      <h2>Need a fashion recommendation ?</h2>
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && <div className="message bot">Loading...</div>}
        {/* Empty div for scrolling to bottom */}
        <div ref={messagesEndRef} />
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
