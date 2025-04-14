import React, { useState } from "react";
import "./Shop.css"; // Import the CSS file
import { useEffect } from "react";
import { FaHeart, FaSalesforce } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
<FaHeart />;

const Shop = () => {
  const [userdetails, setuserdetails] = useState({});
  const backendurl = import.meta.env.VITE_BACKEND_URL;
  const mlurl = import.meta.env.VITE_ML_URL;
  const fetchuserdetails = () => {
    fetch(`${backendurl}/user/getuserdetails`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setuserdetails(data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  };
  const [input, setInput] = useState("");
  const [loaded, setloaded] = useState(false);

  // fetchuserdetails()
  useEffect(() => {
    fetchuserdetails();
  }, []);

  const [usercloths, setuserclothes] = useState("");
  const userclothes = () => {
    fetch(`${backendurl}/user/images`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.Wardrobe.allclothes[0]);
        setuserclothes(data.Wardrobe.allclothes[0]);
      })
      .catch((error) => {
        console.error("Error fetching user clothes:", error);
      });
  };

  const [shoppingsuggestionsmain, setshoppingsuggestions] = useState([]);

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
        console.log("clothssuggestion array", cloths);
        setshoppingsuggestions(cloths);
      })
      .catch((error) => {
        console.error("Error fetching shopping suggestions:", error);
      });
  };

  const [amazonandmyntra, setamazonandmyntra] = useState("");
  return (
    <div className="shop-container">
      <h2>Personalised Shopping based on your clothes , age and preferences</h2>
      <br />
      <button
        className="getairecommendations"
        onClick={() => {
          fetchuserdetails();
          shoppingsuggestions();
          userclothes();
        }}
      >
        Get AI Recommendations
      </button>
      <button
        className="searchonboth"
        onClick={() => {
          amazonSearch(input);
          myntraSearch(input);
        }}
      >
        Search on amazon and myntra
      </button>

      <div className="loading">
        {loaded ? (
          <div className="loader-wrapper">
            <div className="loader"></div>
          </div>
        ) : (
          <h2 className="loading-message">
            Discover the perfect product or let AI inspire your next outfit
            choice!
          </h2>
        )}
      </div>

      <div className="suggestion-container">
        {shoppingsuggestionsmain.length > 0 ? (
          <div className="pill-wrapper">
            <div>
              <h2>
                AI suggestions for your clothes based on your wardrobe, age, and
                preferences.
              </h2>
              <h4>
                Click on any button to get search results from Amazon and
                Myntra.
              </h4>
            </div>
            <div>
              <br />
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
              {amazonandmyntra ? (
                <div>
                  <button
                    onClick={() => {
                      window.open(
                        `https://www.amazon.in/s?k=${amazonandmyntra}`,
                        "_blank"
                      );
                    }}
                  >
                    Go to Amazon for {amazonandmyntra}
                  </button>
                  <button
                    onClick={() => {
                      window.open(
                        `https://www.myntra.com/${amazonandmyntra}`,
                        "_blank"
                      );
                    }}
                  >
                    Go to Myntra for {amazonandmyntra}
                  </button>
                </div>
              ) : (
                <div className="amazonandmyntra">
                  Click on any button and go to Amazon and Myntra to complete
                  your outfit
                </div>
              )}
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>

      {/* Amazon Results Section */}
    </div>
  );
};

export default Shop;
