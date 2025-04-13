import React, { useState } from "react";
import "./Shop.css"; // Import the CSS file
import { useEffect } from "react";
import { FaHeart, FaSalesforce } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
<FaHeart />;

const Shop = () => {
  const [shopData, setShopData] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(5);

  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [userdetails, setuserdetails] = useState({});
const backendurl=import.meta.env.VITE_BACKEND_URL 
const mlurl=import.meta.env.VITE_ML_URL
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
  const [amazon, setamazon] = useState(false);
  const [myntra, setmyntra] = useState(false);
  const [amazonData, setAmazonData] = useState([]);
  const [myntraData, setMyntraData] = useState([]);
  const [amazonLoading, setAmazonLoading] = useState(false);
  const [myntraLoading, setMyntraLoading] = useState(false);
  const [visibleAmazonProducts, setVisibleAmazonProducts] = useState(5);
  const [visibleMyntraProducts, setVisibleMyntraProducts] = useState(5);
  const [loaded, setloaded] = useState(false);

  // fetchuserdetails()
  useEffect(() => {
    fetchuserdetails();
  }, []);
  const amazonSearch = (customInput) => {
    setloaded(true);
    console.log(userdetails);
    const searchQuery =
      customInput ||
      input ||
      `Styles for ${
        userdetails.gender || "male and female which are trending"
      }`;
    console.log("search query is ", searchQuery);
    setAmazonLoading(true);
    fetch(
      `${mlurl}/shop?query=${encodeURIComponent(searchQuery)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setAmazonData(data);
        setVisibleAmazonProducts(7);
        setAmazonLoading(false);
        setloaded(false);
      })
      .catch((error) => {
        console.error("Error fetching Amazon data:", error);
        setAmazonLoading(false);
      });
  };

  const myntraSearch = (customInput) => {
    setloaded(true);
    const searchQuery =
      customInput ||
      input ||
      `Styles for ${userdetails.gender || "male and female"}`;
    setMyntraLoading(true);
    fetch(
      `${mlurl}/shop_myntra?query=${encodeURIComponent(
        searchQuery
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setMyntraData(data);
        setVisibleMyntraProducts(5);
        setMyntraLoading(false);
        setloaded(FaSalesforce);
        setloaded(false)
      })
      .catch((error) => {
        console.error("Error fetching Myntra data:", error);
        setMyntraLoading(false);
      });
  };

  const addtowishlist = (item) => {
    console.log("Wishlist item:", item);

    fetch(`${backendurl}/shop/addtowishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
      credentials: "include", // Make sure your backend supports cookies
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Server response:", data);

        if (data.status) {
          alert("Item added to wishlist!");
        } else if (data.msg === "Already in wishlist") {
          alert("This item is already in your wishlist.");
        } else {
          alert("Failed to add item. Try again.");
        }
      })
      .catch((error) => {
        console.error("Error adding to wishlist:", error);
        alert("Server error. Please try again later.");
      });
  };

  const [usercloths, setuserclothes] = useState("");
  const userclothes = () => {
    fetch(`${backendurl}/user/images`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.allclothes[0]);
        setuserclothes(data.allclothes[0]);
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

  return (
    <div className="shop-container">
      <h2>Personalised Shopping based on your clothes , age and preferences</h2>

      <input
        type="text"
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter the clothes you wanna search"
        className="shop-search-input"
      />
      <br />
      <button
        onClick={() => {
          amazonSearch(input);
        }}
        className="shop-search-button"
      >
        Search Amazon
      </button>

      <button
        onClick={() => myntraSearch(input)}
        className="shop-search-button"
      >
        Search Myntra
      </button>
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
      Discover the perfect product or let AI inspire your next outfit choice!
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
                    amazonSearch(ele);
                    myntraSearch(ele);
                  }}
                >
                  {ele}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>

      {/* Amazon Results Section */}
      <div className="search">
        {/* Amazon Results Section */}
        {amazonData.length > 0 && (
          <div className="amazon-results">
            {input ? (
              <h2>Amazon Search Results for "{input}"</h2>
            ) : (
              <h2>
                Amazon Search Results for styles for{" "}
                <b>{userdetails.gender} </b>
              </h2>
            )}
            {amazonLoading ? (
              <p>Loading Amazon products...</p>
            ) : (
              <>
                <div className="shop-products-grid">
                  {amazonData
                    .slice(2, visibleAmazonProducts)
                    .map((item, index) => (
                      <div key={index} className="shop-product-card">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="shop-product-image"
                        />
                        <h3 className="shop-product-name">
                          {item.name === "/" ? item.name : <p>Amazon search</p>}
                        </h3>
                        <p className="shop-product-price">{item.price}</p>
                        <a
                          href={item.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shop-buy-button"
                        >
                          Buy Now
                        </a>
                        <br />
                        <br />
                        <button
                          className="addtowishlist"
                          onClick={() => addtowishlist(item)}
                          aria-label="Add to wishlist"
                        >
                          Add to wishlist
                        </button>
                      </div>
                    ))}
                </div>
                {visibleAmazonProducts < amazonData.length && (
                  <button
                    className="load-more"
                    onClick={() =>
                      setVisibleAmazonProducts(visibleAmazonProducts + 10)
                    }
                  >
                    Load More
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Myntra Results Section */}
        {myntraData.length > 0 && (
          <div className="myntra-results">
            {input ? (
              <h2 className="myntra-results-header">
                Myntra Results for "{input}"
              </h2>
            ) : userdetails.gender ? (
              <h2 className="myntra-results-header">
                Myntra Results for {userdetails.gender}'s styles
              </h2>
            ) : (
              <h2 className="myntra-results-header">Myntra Results</h2>
            )}

            {myntraLoading ? (
              <p>Loading Myntra products...</p>
            ) : (
              <>
                <div className="shop-products-grid">
                  {myntraData
                    .slice(0, visibleMyntraProducts)
                    .map((item, index) => (
                      <div key={index} className="shop-product-card">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="shop-product-image"
                        />
                        <h3 className="shop-product-name">{item.name}</h3>
                        <p className="shop-product-price">{item.price}</p>
                        <a
                          href={item.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shop-buy-button"
                        >
                          Buy Now
                        </a>
                        <br />
                        <br />
                        <button
                          className="addtowishlist"
                          onClick={() => addtowishlist(item)}
                          aria-label="Add to wishlist"
                        >
                          Add to wishlist
                        </button>
                      </div>
                    ))}
                </div>
                {visibleMyntraProducts < myntraData.length && (
                  <button
                    className="load-more"
                    onClick={() =>
                      setVisibleMyntraProducts(visibleMyntraProducts + 10)
                    }
                  >
                    Load More
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


export default Shop