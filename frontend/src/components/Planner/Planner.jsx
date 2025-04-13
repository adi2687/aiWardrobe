import React, { useEffect, useState } from "react";
import "./Planner.css";

const DailyWeather = () => {
  const [weatherSummaries, setWeatherSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clothes, setClothes] = useState([]);
  const [suggestionMain, setSuggestion] = useState("");
  const [isOn, setIsOn] = useState(false);
  const [weather, setWeather] = useState("Off");
  const [input, setInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null); // Add this at top

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

  const fetchWeather = () => {
    setLoading(true);
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
      }
    });
  };
  const apiUrl = import.meta.env.VITE_BACKEND_URL
  const fetchClothes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/user/images`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      // console.log(data)
      setClothes(data.allclothes);
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
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(0); // Only one block to copy, use 0 or any identifier
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };
  const copytoprofile = () => {
    console.log("clicked");
    fetch(`${apiUrl}/user/copytoprofileweekcloths`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clothesforweek: suggestionMain }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((err) => console.error("Error saving to profile:", err));
  };
  
  return (
    <div className="planner-container">
      <div className="toggleContainer">
        <p>Weather and location based recommendation: {isOn ? "On" : "Off"}</p>
        <label className="toggle">
          <input type="checkbox" checked={isOn} onChange={handleChange} />
          <span className="slider"></span>
        </label>
        <h3>Get outfit suggestion from clothes you uploaded for a week.</h3>
        <textarea
          type="text"
          placeholder="Enter events you might attend this week"
          onChange={(e) => setInput(e.target.value)}
        />
        <br />
        <button onClick={getSuggestionForWeek} disabled={loading}>
          {loading ? "Generating..." : "Get recommendation"}
        </button>
        <br />
      </div>

      <div className="recommendation">
        {loading ? (
          <p>Loading data...</p>
        ) : suggestionMain ? (
          <p>{suggestionMain}</p>
        ) : (
          <p>
            Enter the week task and click get recommendation button to get
            outfits.
          </p>
        )}

        <br />
        <br />
        <br />

        <div className="buttonsdiv">
          <button disabled={!suggestionMain} onClick={copytoprofile}>
            {/* Like these outfits <br /> */}
            Copy to profile?
          </button>

          <button
            onClick={() => copyToClipboard(suggestionMain)}
            disabled={!suggestionMain}
          >
            {copiedIndex === 0 ? "Copied!" : "Copy outfits"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyWeather;
