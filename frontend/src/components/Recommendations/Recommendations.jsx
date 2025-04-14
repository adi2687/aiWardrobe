import React, { useState, useEffect } from "react";
import "./Recommendations.css";
import { div } from "three/tsl";

const Recommendations = () => {
  const [clothes, setClothes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [enabled, setEnabled] = useState(false);
const apiUrl=import.meta.env.VITE_BACKEND_URL
  useEffect(() => {
    fetch(`${apiUrl}/user/images`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setClothes(data.Wardrobe.allclothes))
      .catch((error) => console.error("Error fetching clothes:", error));
  }, []);

  // Fetch Weather Data (Whole Day)
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
          console.log(data);
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
          console.log("Weather Forecast:", weatherInfo);
        })
        .catch((error) => console.error("Error fetching forecast:", error));
    });
  };

  // Toggle Weather Mode
  const weather = () => {
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
        weather = weatherData; // Send weather data only if enabled
      }

      const response = await fetch(`${apiUrl}/chat/chatbot`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input, clothes, weather }), // Send only if enabled
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
      return "Error fetching sug  gestion. Check your internet connection and try again";
    }
  };

  // Handle Chat Input
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
  const [copiedIndex, setCopiedIndex] = useState(null);
  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index); // Change button text after copying
      setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
    });
  };

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  const loadchatmain = async () => {
    try {
      const response = await fetch(`${apiUrl}/chat/chathistory`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // important if using cookies for auth
      });

      const data = await response.json();
      console.log(data);
      setHistory(data.chatHistory);
      setShowHistory(true);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };
  // useEffect(()=>{loadchatmain},[])

  const lovesuggestion = (clothsuggestion) => {
    console.log("this is cliekd ");
    console.log(clothsuggestion);
    fetch(`${apiUrl}/user/cloth/lovesuggestion/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ clothsuggestion }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));
  };
  return (
    <div className="recommendations-container">
      <div className="recommendations-card">
        <h1>AI Outfit Recommender</h1>
        <b>
          The AI knows your uploaded clothes, so just ask for outfit
          suggestions!
        </b>

        <div className="toggle-container">
          <div
            onClick={weather}
            className={`toggle ${enabled ? "enabled" : ""}`}
          >
            <div className="toggle-circle" />
          </div>
        </div>
        <br />
        {enabled
          ? "Weather and location-based recommendation ON"
          : "Weather and location-based recommendation OFF"}

        <form onSubmit={handle}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Describe the event (e.g., Wedding, Casual Meetup)"
          />
          <br />
          <button
            type="submit"
            className="recommendations-btn"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Get Outfit"}
          </button>
        </form>

        {messages.length > 0 && (
          <div className="messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <span className="message-text">{msg.text}</span>

                <button
                  className={`copy-btn ${msg.sender}`}
                  onClick={() => copyToClipboard(msg.text, index)}
                >
                  {copiedIndex === index ? "Copied!" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        )}
        <div>
          {/* <div>{JSON.stringify(history)}</div> */}

          <button
            className="recommendations-btn"
            style={{ marginTop: "1rem" }}
            onClick={() => {
              if (!showHistory) {
                loadchatmain(); // fetch chat only the first time
              } else {
                setShowHistory(false); // just hide if already loaded
              }
            }}
          >
            {showHistory
              ? "Hide Previous Conversations"
              : "Like a suggested outfit ? "}
          </button>
 
          {showHistory && history.length > 0 && (
            <div style={{ marginTop: "2rem" }} className="history">
              <h2>Previous Conversations</h2>
              {history.map((msg, i) => (
                <div key={i}>
                
                <strong>Message:</strong> {msg.message} <br />
                <strong>Response:</strong> {msg.response} <br />
                <small>{new Date(msg.createdAt).toLocaleString()}</small>
                <br />
                <div style={{ display: "flex", gap: "10px", marginTop: "8px",border:"none" }}>
                  <button
                    onClick={() => lovesuggestion(msg.response)}
                    className="love-button"
                  >
                    ♥
                  </button>
                  <button onClick={() => copyToClipboard(msg.response, i)}>
                    {copiedIndex === i ? "Copied!" : "Copy AI Response"}
                  </button>
                </div>
              </div>
              
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
