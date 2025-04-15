import React, { useState, useEffect } from "react";
import "./Shop.css"; // Import the CSS file

const Shop = () => {
  const [userdetails, setuserdetails] = useState({});
  const [shoppingsuggestionsmain, setshoppingsuggestions] = useState([]);
  const [input, setInput] = useState("");
  const [loaded, setloaded] = useState(false);
  const [amazonandmyntra, setamazonandmyntra] = useState("");

  const backendurl = import.meta.env.VITE_BACKEND_URL;

  // Fetch user details
  const fetchuserdetails = () => {
    fetch(`${backendurl}/user/getuserdetails`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setuserdetails(data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  };

  useEffect(() => {
    fetchuserdetails();
  }, []);

  // Fetch shopping suggestions
  const shoppingsuggestions = () => {
    setloaded(true);
    fetch(`${backendurl}/chat/getshoppingsuggestions`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        const suggestion = data.suggestion;
        const cloths = [];
        let item = "";

        for (let i = 0; i < suggestion.length; i++) {
          if (suggestion[i] === "*") {
            if (item.trim()) {
              cloths.push(item.trim());
              item = "";
            }
          } else {
            item += suggestion[i];
          }
        }
        setloaded(false);
        setshoppingsuggestions(cloths);
      })
      .catch((error) => {
        console.error("Error fetching shopping suggestions:", error);
      });
  };

  // Open URLs for Amazon and Myntra
  const openSearch = (platform, query) => {
    const gender = userdetails?.gender;
    let url = "";

    if (platform === "amazon") {
      url = `https://www.amazon.in/s?k=${query} for ${gender}`;
    } else if (platform === "myntra") {
      url = `https://www.myntra.com/${query} for ${gender}`;
    }

    window.open(url, "_blank");
  };

  return (
    <div className="shop-container">
      <h2>Personalized Shopping based on your clothes, age, and preferences</h2>

      <button
        className="getairecommendations"
        onClick={() => {
          fetchuserdetails();
          shoppingsuggestions();
        }}
      >
        Get AI Recommendations
      </button>

      <div className="loading">
        {loaded ? (
          <div className="loader-wrapper">
            <div className="loader"></div>
          </div>
        ) : (
          <h2 className="loading-message">
            Discover the perfect product or let AI inspire your next outfit choice!
          </h2>
        )}
      </div>
 
      <div className="suggestion-container">
        {shoppingsuggestionsmain.length > 0 ? (
          <div className="pill-wrapper">
            <h2>AI suggestions for your clothes based on your wardrobe, age, and preferences.</h2>
            <h4>Click on any button to get search results from Amazon and Myntra.</h4>

            <div className="pill-buttons">
              {shoppingsuggestionsmain.map((ele, i) => (
                <button
                  key={i}
                  className="suggestion-pill"
                  onClick={() => {
                    setInput(ele);
                    setamazonandmyntra(ele);
                  }}
                >
                  {ele}
                </button>
              ))}
            </div>

            {amazonandmyntra && (
              <div className="buttons">
                <button
                  onClick={() => openSearch("amazon", amazonandmyntra)}
                >
                  Go to Amazon for {amazonandmyntra}
                </button>
                <button
                  onClick={() => window.location.href=`https://www.myntra.com/shirt?rawQuery=${amazonandmyntra}`}
                >
                  Go to Myntra for {amazonandmyntra}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>No suggestions available</div>
        )}
      </div>
    </div>
  );
};

export default Shop;
