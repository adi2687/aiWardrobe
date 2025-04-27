import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Recommendations.css";
import { FaCloudSun, FaHistory, FaHeart, FaCopy, FaPaperPlane, FaTimes, FaUser } from "react-icons/fa";

const Recommendations = () => {
  const [clothes, setClothes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Track authentication status
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch user profile and check authentication
  useEffect(() => {
    fetch(`${apiUrl}/user/profile`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Success") {
          setUser(data.user);
          console.log('a', data.user);
          setIsAuthenticated(true);
          fetchUserClothes(); // Only fetch clothes if authenticated
        } else {
          setIsAuthenticated(false);
          console.log("User not authenticated");
        }
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setIsAuthenticated(false);
      });
  }, [apiUrl]);

  const fetchUserClothes = async () => {
    try {
      const response = await fetch(`${apiUrl}/user/images`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setClothes(data.Wardrobe.allclothes);
    } catch (error) {
      console.error("Error fetching clothes:", error);
    }
  };

  // Fetch Weather Data
  const fetchWeather = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const apiKey = "fc3b1eb09d67c9ebd2d39e4fc7d2bb41";
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (!data.list || data.list.length === 0) {
            console.error("No forecast data available.");
            return;
          }

          const now = new Date();
          const today = now.toISOString().split("T")[0];
          const closestForecast = data.list.find(
            (entry) => entry.dt_txt >= today
          );

          if (!closestForecast) {
            console.error(
              "No weather data available for today or the next available day."
            );
            return;
          }

          const weatherInfo = {
            date: closestForecast.dt_txt.split(" ")[0],
            temp: closestForecast.main.temp,
            temp_min: closestForecast.main.temp_min,
            temp_max: closestForecast.main.temp_max,
            feels_like: closestForecast.main.feels_like,
            weather: closestForecast.weather[0].description,
            wind: closestForecast.wind.speed,
            humidity: closestForecast.main.humidity,
            rain_probability: closestForecast.pop,
            cloud_cover: closestForecast.clouds.all,
          };

          setWeatherData(weatherInfo);
        })
        .catch((error) => console.error("Error fetching forecast:", error));
    });
  };

  // Toggle Weather Mode
  const toggleWeather = () => {
    setEnabled(!enabled);
    if (!enabled) {
      fetchWeather();
    }
  };

  // Get AI Outfit Recommendation
  const getSuggestion = async (input) => {
    try {
      setIsLoading(true);

      let weather = null;
      if (enabled && weatherData) {
        weather = weatherData;
      }

      const response = await fetch(`${apiUrl}/chat/chatbot`, {
        method: "POST",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input, clothes, weather }),
      });

      const data = await response.json();
      const cleanedResponse = data.response
        .replace(/\*/g, "")
        .replace(/<.*?>/g, "")
        .trim();

      setIsLoading(false);
      return cleanedResponse || "No suggestions available.";
    } catch (error) {
      console.error("Error fetching suggestion:", error);
      setIsLoading(false);
      return "Error fetching suggestion. Check your internet connection and try again.";
    }
  };

  // Handle Chat Input
  const handleSubmit = async (e) => {
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

  // Copy text to clipboard
  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  // Load chat history
  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${apiUrl}/chat/chathistory`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      setHistory(data.chatHistory);
      setShowHistory(true);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  // Save favorite suggestion
  const saveFavoriteSuggestion = (suggestion) => {
    fetch(`${apiUrl}/user/cloth/lovesuggestion/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ clothsuggestion: suggestion }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Show feedback that suggestion was saved
        alert("Suggestion saved to favorites!");
      })
      .catch((error) => console.error("Error:", error));
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // If authentication status is still loading
  if (isAuthenticated === null) {
    return (
      <div className="recommendations-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading recommendations...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="recommendations-container">
        <div className="auth-required">
          <FaUser className="auth-icon" />
          <h2>Authentication Required</h2>
          <p>You need to be logged in to get personalized outfit recommendations.</p>
          <div className="auth-buttons">
            <button className="primary-button" onClick={() => navigate('/auth')}>
              Log In
            </button>
            <button className="secondary-button" onClick={() => {
              navigate('/auth');
              // This will trigger the signup form in the Auth component
              localStorage.setItem('showSignup', 'true');
            }}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-card">
        <div className="recommendations-header">
          <h1>AI Outfit Recommender</h1>
          <p className="recommendations-subtitle">
            Get personalized outfit suggestions based on your wardrobe
          </p>
        </div>

        <div className="weather-toggle-section">
          <div className="weather-toggle-label">
            <FaCloudSun className="weather-icon" />
            <span>Weather-based recommendations</span>
          </div>
          <div 
            onClick={toggleWeather}
            className={`toggle ${enabled ? "enabled" : ""}`}
          >
            <div className="toggle-circle" />
          </div>
          <div className="weather-status">
            {enabled ? (
              weatherData ? (
                <div className="weather-info">
                  <span>{weatherData.temp}°C, {weatherData.weather}</span>
                </div>
              ) : "Fetching weather data..."
            ) : ""}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="recommendations-form">
          <div className="input-container">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Describe the event (e.g., Wedding, Casual Meetup)"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="send-button"
              disabled={isLoading || !userInput.trim()}
            >
              {isLoading ? "..." : <FaPaperPlane />}
            </button>
          </div>
        </form>

        {messages.length > 0 && (
          <div className="messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <div className="message-content">
                  <span className="message-text">{msg.text}</span>
                  <div className="message-actions">
                    {msg.sender === "bot" && (
                      <button
                        className="action-button like-button"
                        onClick={() => saveFavoriteSuggestion(msg.text)}
                        title="Save to favorites"
                      >
                        <FaHeart />
                      </button>
                    )}
                    <button
                      className="action-button copy-button"
                      onClick={() => copyToClipboard(msg.text, index)}
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? "Copied!" : <FaCopy />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="history-section">
          <button
            className="history-toggle-button"
            onClick={() => {
              if (!showHistory) {
                loadChatHistory();
              } else {
                setShowHistory(false);
              }
            }}
          >
            <FaHistory /> {showHistory ? "Hide History" : "Show History"}
          </button>

          {showHistory && (
            <div className="history-container">
              <div className="history-header">
                <h2>Previous Conversations</h2>
                <button 
                  className="close-history-button"
                  onClick={() => setShowHistory(false)}
                >
                  <FaTimes />
                </button>
              </div>
              
              {history.length > 0 ? (
                <div className="history-items">
                  {history.map((msg, i) => (
                    <div key={i} className="history-item">
                      <div className="history-item-header">
                        <span className="history-date">{formatDate(msg.createdAt)}</span>
                      </div>
                      <div className="history-message">
                        <strong>You asked:</strong> {msg.message}
                      </div>
                      <div className="history-response">
                        <strong>AI suggested:</strong> {msg.response}
                      </div>
                      <div className="history-actions">
                        <button
                          onClick={() => saveFavoriteSuggestion(msg.response)}
                          className="action-button like-button"
                          title="Save to favorites"
                        >
                          <FaHeart />
                        </button>
                        <button 
                          onClick={() => copyToClipboard(msg.response, `history-${i}`)}
                          className="action-button copy-button"
                          title="Copy to clipboard"
                        >
                          {copiedIndex === `history-${i}` ? "Copied!" : <FaCopy />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-history">No previous conversations found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
