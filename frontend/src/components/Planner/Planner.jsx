import React, { useEffect, useState } from "react";
import "./Planner.css";
import { FiSun, FiCloud, FiCloudRain, FiCloudSnow, FiWind, FiCopy, FiSave, FiRefreshCw } from "react-icons/fi";

const DailyWeather = () => {
  const [weatherSummaries, setWeatherSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clothes, setClothes] = useState([]);
  const [suggestionMain, setSuggestion] = useState("");
  const [isOn, setIsOn] = useState(false);
  const [weather, setWeather] = useState("Off");
  const [input, setInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const getWeatherDescription = (code) => {
    const descriptions = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Light rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Light snow",
      73: "Moderate snow",
      75: "Heavy snow",
      95: "Thunderstorm",
    };
    return descriptions[code] || "Unknown";
  };

  const getWeatherIcon = (description) => {
    if (description.includes("clear") || description.includes("Clear")) {
      return <FiSun className="weather-icon" />;
    } else if (description.includes("cloud") || description.includes("Cloud") || description.includes("Overcast")) {
      return <FiCloud className="weather-icon" />;
    } else if (description.includes("rain") || description.includes("Rain") || description.includes("drizzle")) {
      return <FiCloudRain className="weather-icon" />;
    } else if (description.includes("snow") || description.includes("Snow")) {
      return <FiCloudSnow className="weather-icon" />;
    } else if (description.includes("fog") || description.includes("Fog")) {
      return <FiWind className="weather-icon" />;
    } else {
      return <FiCloud className="weather-icon" />;
    }
  };

  const fetchWeather = () => {
    setLoading(true);
    setRefreshing(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,cloudcover,windspeed_10m,weathercode&timezone=auto`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        const hourly = data.hourly;

        const dailyMap = {};
        hourly.time.forEach((t, i) => {
          const date = t.split("T")[0];
          if (!dailyMap[date]) {
            dailyMap[date] = [];
          }
          dailyMap[date].push(i);
        });

        const avg = (arr) =>
          (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);

        const summaries = Object.keys(dailyMap)
          .slice(0, 7)
          .map((date) => {
            const indices = dailyMap[date];
            return {
              date,
              temp: avg(indices.map((i) => hourly.temperature_2m[i])),
              temp_min: Math.min(
                ...indices.map((i) => hourly.temperature_2m[i])
              ).toFixed(1),
              temp_max: Math.max(
                ...indices.map((i) => hourly.temperature_2m[i])
              ).toFixed(1),
              feels_like: avg(
                indices.map((i) => hourly.apparent_temperature[i])
              ),
              weather: getWeatherDescription(
                hourly.weathercode[indices[12] || indices[0]]
              ),
              wind: avg(indices.map((i) => hourly.windspeed_10m[i])),
              humidity: avg(indices.map((i) => hourly.relative_humidity_2m[i])),
              rain_probability: avg(
                indices.map((i) => hourly.precipitation_probability[i])
              ),
              cloud_cover: avg(indices.map((i) => hourly.cloudcover[i])),
            };
          });

        setWeatherSummaries(summaries);
      } catch (err) {
        console.error("Error fetching weather:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    });
  };
  const apiUrl = import.meta.env.VITE_BACKEND_URL
  const fetchClothes = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await fetch(`${apiUrl}/user/images`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      // console.log(data)
      setClothes(data.Wardrobe.allclothes[0]);
    } catch (error) {
      console.error("Clothes could not be fetched", error);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestionForWeek = async () => {
    if (!clothes.length || !weatherSummaries.length) {
      alert("Weather and clothes must be fetched first.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/chat/suggestionforweek`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ weather: weatherSummaries, input, clothes }),
        }
      );

      const data = await response.json();
      const cleanedResponse = data.response
        .replace(/\*/g, "")
        .replace(/<.*?>/g, "")
        .replace(/(?=[A-Z][a-z]+day:)/g, "\n") // Line break before each weekday
        .trim();

      setSuggestion(cleanedResponse);
    } catch (error) {
      console.error("Failed to get weekly suggestion", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = () => {
    setIsOn(!isOn);
    setWeather(isOn ? "Off" : "On");
  };

  useEffect(() => {
    fetchWeather();
    fetchClothes();
  }, []);
  const copyToClipboard = (text) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(0);
      setTimeout(() => setCopiedIndex(null), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };
  const copytoprofile = () => {
    if (!suggestionMain) return;
    
    setLoading(true);
    fetch(`${apiUrl}/user/copytoprofileweekcloths`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clothesforweek: suggestionMain }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Outfits saved to your profile successfully!");
      })
      .catch((err) => {
        console.error("Error saving to profile:", err);
        alert("Failed to save outfits to profile. Please try again.");
      })
      .finally(() => setLoading(false));
  };
  
  return (
    <div className="planner-container">
      <div className="planner-header">
        <h2>Weekly Outfit Planner</h2>
        <div className="refresh-btn" onClick={() => {
          fetchWeather();
          fetchClothes();
        }} title="Refresh data">
          <FiRefreshCw className={refreshing ? "refreshing" : ""} />
        </div>
      </div>

      <div className="planner-content">
        <div className="toggleContainer">
          <div className="toggle-section">
            <p>Weather-based recommendations</p>
            <label className="toggle">
              <input type="checkbox" checked={isOn} onChange={handleChange} />
              <span className="slider"></span>
            </label>
            <span className="toggle-status">{isOn ? "On" : "Off"}</span>
          </div>
          
          {weatherSummaries && weatherSummaries.length > 0 && (
            <div className="weather-preview">
              <h3>This Week's Weather</h3>
              <div className="weather-cards">
                {weatherSummaries.slice(0, 5).map((day, index) => (
                  <div key={index} className="weather-day-card">
                    <div className="weather-day">{new Date(day.date).toLocaleDateString('en-US', {weekday: 'short'})}</div>
                    <div className="weather-icon-container">
                      {getWeatherIcon(day.weather)}
                    </div>
                    <div className="weather-temp">{day.temp}°C</div>
                    <div className="weather-desc">{day.weather}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="input-section">
            <h3>Plan Your Week</h3>
            <textarea
              value={input}
              placeholder="Enter events you might attend this week (e.g., office meetings, dinner date, casual outing)"
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              className="generate-btn" 
              onClick={getSuggestionForWeek} 
              disabled={loading || !clothes || !clothes.length}
            >
              {loading ? "Generating..." : "Get Outfit Recommendations"}
            </button>
          </div>
        </div>

        <div className="recommendation">
          <h3>Your Weekly Outfit Plan</h3>
          <div className="recommendation-content">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Creating your personalized outfit plan...</p>
              </div>
            ) : suggestionMain ? (
              <div className="suggestion-result">
                <p>{suggestionMain}</p>
              </div>
            ) : (
              <div className="empty-state">
                <p>
                  Enter your weekly events and click the button to get personalized outfit recommendations
                  based on your wardrobe and the weather forecast.
                </p>
              </div>
            )}
          </div>

          {suggestionMain && (
            <div className="action-buttons">
              <button 
                className="save-btn" 
                disabled={!suggestionMain || loading} 
                onClick={copytoprofile}
              >
                <FiSave /> Save to Profile
              </button>

              <button
                className="copy-btn"
                onClick={() => copyToClipboard(suggestionMain)}
                disabled={!suggestionMain || loading}
              >
                <FiCopy /> {copiedIndex === 0 ? "Copied!" : "Copy to Clipboard"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyWeather;
