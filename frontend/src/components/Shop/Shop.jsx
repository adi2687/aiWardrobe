import React, { useState, useEffect } from "react";
import "./Shop.css"; // Import the CSS file

const Shop = () => {
  const [userdetails, setuserdetails] = useState({});
  const [shoppingsuggestionsmain, setshoppingsuggestions] = useState([]);
  const [input, setInput] = useState("");
  const [loaded, setloaded] = useState(false);
  const [amazonandmyntra, setamazonandmyntra] = useState("");
  const [error, setError] = useState(null);

  const backendurl = import.meta.env.VITE_BACKEND_URL;

  // Fetch user details
  const fetchuserdetails = () => {
    fetch(`${backendurl}/user/getuserdetails`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }
        return response.json();
      })
      .then((data) => {
        setuserdetails(data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please try again.");
      });
  };

  useEffect(() => {
    fetchuserdetails();
  }, []);

  // Fetch shopping suggestions
  const shoppingsuggestions = () => {
    setloaded(true);
    setError(null);
    fetch(`${backendurl}/chat/getshoppingsuggestions`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch shopping suggestions");
        }
        return response.json();
      })
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
        setloaded(false);
        setError("Failed to load shopping suggestions. Please try again.");
      });
  };

  // Open URLs for shopping platforms
  const openSearch = (platform, query) => {
    const gender = userdetails?.gender || '';
    let url = "";

    switch(platform) {
      case "amazon":
        url = `https://www.amazon.in/s?k=${query} for ${gender}`;
        break;
      case "myntra":
        url = `https://www.myntra.com/${query}?rawQuery=${query} for ${gender}`;
        break;
      case "flipkart":
        url = `https://www.flipkart.com/search?q=${query} for ${gender}`;
        break;
      default:
        url = `https://www.google.com/search?q=${query} for ${gender}`;
    }

    window.open(url, "_blank");
  };

  return (
    <div className="shop-container">
      <h2>Personalized Shopping Based on Your Wardrobe</h2>
      <h4>Get AI-powered clothing recommendations tailored to your style, age, and preferences</h4>

      <button
        className="getairecommendations"
        onClick={() => {
          fetchuserdetails();
          shoppingsuggestions();
        }}
        disabled={loaded}
      >
        {loaded ? 'Generating Recommendations...' : 'Get AI Recommendations'}
      </button>

      {error && <div className="error-message">{error}</div>}

      <div className="loading">
        {loaded ? (
          <div className="loader-wrapper">
            <div className="loader"></div>
            <p>Analyzing your wardrobe and preferences...</p>
          </div>
        ) : (
          !shoppingsuggestionsmain.length && !error && (
            <h2 className="loading-message">
              Discover the perfect items for your wardrobe or let AI inspire your next fashion choice!
            </h2>
          )
        )}
      </div>
 
      <div className="suggestion-container">
        {shoppingsuggestionsmain.length > 0 && (
          <div className="pill-wrapper">
            <h2>Your Personalized Fashion Recommendations</h2>
            <h4>Click on any item below to explore shopping options from popular retailers</h4>

            <div className="pill-buttons">
              {shoppingsuggestionsmain.map((ele, i) => (
                <button
                  key={i}
                  className={`suggestion-pill ${amazonandmyntra === ele ? 'active' : ''}`}
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
              <>
                <div className="amazonandmyntra">
                  <p>You selected: <strong>{amazonandmyntra}</strong></p>
                  <p>Choose a retailer to shop for this item:</p>
                </div>
                
                <div className="buttons">
                  <button
                    onClick={() => {
                      const query = encodeURIComponent(amazonandmyntra);
                      openSearch("amazon", query);
                    }}
                    aria-label={`Search for ${amazonandmyntra} on Amazon`}
                  >
                    <span>Amazon</span>
                  </button>
                
                  <button
                    onClick={() => {
                      const query = encodeURIComponent(amazonandmyntra);
                      openSearch("myntra", query);
                    }}
                    aria-label={`Search for ${amazonandmyntra} on Myntra`}
                  >
                    <span>Myntra</span>
                  </button>
                
                  <button
                    onClick={() => {
                      const query = encodeURIComponent(amazonandmyntra);
                      openSearch("flipkart", query);
                    }}
                    aria-label={`Search for ${amazonandmyntra} on Flipkart`}
                  >
                    <span>Flipkart</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        
        {!shoppingsuggestionsmain.length && !loaded && error === null && (
          <div className="empty-state">
            <p>Click the button above to get personalized clothing recommendations</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
