import React, { useState, useEffect } from "react";
import "./Shop.css"; // Import the CSS file
import { FaHeart, FaSalesforce, FaCheck, FaSearch, FaShoppingBag, FaAmazon, FaTshirt, FaShoppingCart, FaStore } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const Shop = () => {
  const navigate = useNavigate();
  const [shopData, setShopData] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(0);

  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
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
  const [amazon, setamazon] = useState(false);
  const [myntra, setmyntra] = useState(false);
  const [amazonData, setAmazonData] = useState([]);
  const [myntraData, setMyntraData] = useState([]);
  const [amazonLoading, setAmazonLoading] = useState(false);
  const [myntraLoading, setMyntraLoading] = useState(false);
  const [visibleAmazonProducts, setVisibleAmazonProducts] = useState(5);
  const [visibleMyntraProducts, setVisibleMyntraProducts] = useState(5);
  const [loaded, setloaded] = useState(false);

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
    
    // Use backend proxy instead of direct ML service call
    fetch(
      `${backendurl}/shop/proxy/amazon?query=${encodeURIComponent(searchQuery)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      }
    )
      .then((response) => {
        // Check if the response is valid before parsing
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Amazon data received:", data);
        
        // Handle both array and object responses
        if (Array.isArray(data)) {
          setAmazonData(data);
          // setVisibleAmazonProducts(7);
        } else if (data.error) {
          console.error("Error from API:", data.error);
          setAmazonData([]);
          alert(`Error from Amazon search: ${data.error}`);
        } else {
          // If it's an object but not an error, try to use it
          const products = Object.values(data).filter(item => 
            typeof item === 'object' && item.name && item.image_url
          );
          
          if (products.length > 0) {
            setAmazonData(products);
            // setVisibleAmazonProducts(7);
          } else {
            console.error("Unexpected data format:", data);
            setAmazonData([]);
          }
        }
        setAmazonLoading(false);
        setloaded(false);
      })
      .catch((error) => {
        console.error("Error fetching Amazon data:", error);
        setAmazonData([]);
        setAmazonLoading(false);
        setloaded(false);
        alert("Unable to connect to Amazon search service. Please try again later.");
      });
  };

  const myntraSearch = (customInput) => {

    setloaded(true);
    const searchQuery =
      customInput ||
      input ||
      `Styles for ${userdetails.gender || "male and female"}`;

      console.log(`${mlurl}/shop_myntra?query=${encodeURIComponent(searchQuery)}`)
    setMyntraLoading(true);
    // Use backend proxy instead of direct ML service call
    fetch(
      `${backendurl}/shop/proxy/myntra?query=${encodeURIComponent(
        searchQuery
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      }
    )
      .then((response) => {
        // Check if the response is valid before parsing
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Myntra data received:", data);
        
        // Handle both array and object responses
        if (Array.isArray(data)) {
          setMyntraData(data);
          setVisibleMyntraProducts(5);
        } else if (data.error) {
          console.error("Error from API:", data.error);
          setMyntraData([]);
          alert(`Error from Myntra search: ${data.error}`);
        } else {
          // If it's an object but not an error, try to use it
          const products = Object.values(data).filter(item => 
            typeof item === 'object' && item.name && item.image_url
          );
          
          if (products.length > 0) {
            setMyntraData(products);
            setVisibleMyntraProducts(5);
          } else {
            console.error("Unexpected data format:", data);
            setMyntraData([]);
          }
        }
        setMyntraLoading(false);
        setloaded(false);
      })
      .catch((error) => {
        console.error("Error fetching Myntra data:", error);
        setMyntraData([]);
        setMyntraLoading(false);
        setloaded(false);
        alert("Unable to connect to Myntra search service. Please try again later.");
      });
  };
const [adding,setadding]=useState(false);
  const addtowishlist = (item) => {
    console.log("Wishlist item:", item);

    setadding(true);
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
          setadding(false);
        } else if (data.msg === "Already in wishlist") {
          alert("This item is already in your wishlist.");
          setadding(false);
        } else {
          alert("Failed to add item. Try again.");
          setadding(false);
        }
      })
      .catch((error) => {
        console.error("Error adding to wishlist:", error);
        alert("Server error. Please try again later.");
        setadding(false);
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

  return (
    <div className="shop-container">
      <h2 className="shop-title">Personalized Shopping based on your clothes, age and preferences</h2>

      <div className="search-section">
        <div className="search-input-container">
          <input
            type="text"
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter the clothes you want to search for..."
            className="shop-search-input"
          />
        </div>
        
        <div className="button-container">
          {/* <button
            onClick={() => {
              amazonSearch(input);
            }}
            className="shop-search-button"
          >
            <FaAmazon style={{ marginRight: '8px' }} /> Search Amazon
          </button>

          <button
            onClick={() => myntraSearch(input)}
            className="shop-search-button"
          >
            <FaStore style={{ marginRight: '8px' }} /> Search Myntra
          </button> */}
          
          <button
            className="searchonboth"
            onClick={() => {
              amazonSearch(input);
              myntraSearch(input);
            }}
          >
            <FaShoppingBag style={{ marginRight: '8px' }} /> Search on Amazon and Myntra
          </button>
          
          <button
            className="getairecommendations"
            onClick={() => {
              fetchuserdetails();
              shoppingsuggestions();
              userclothes();
            }}
          >
            <FaTshirt style={{ marginRight: '8px' }} /> Get AI Recommendations
          </button>
        </div>
        <button 
          className="view-wishlist-button"
          onClick={()=>navigate("/wishlist")}
        >
          <FaHeart style={{ marginRight: '8px' }} /> View Your Wishlist
        </button>
      </div>

      <div className="loading">
        {loaded ? (
          <div className="loader-wrapper">
            <div className="loader"></div>
          </div>
        ) : (
          <div>
            <h3 className="loading-message">
              Discover the perfect product or let AI inspire your next outfit choice!
            </h3>
            {(!amazonData.length && !myntraData.length) && (
              <div className="connection-status">
                <p>We're now using a backend proxy to communicate with the ML service.</p>
                
              </div>
            )}
          </div>
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
            <div className="suggestion-pill-container">
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
      <div className="search-results-container">
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
                    .slice(0, visibleAmazonProducts)
                    .map((item, index) => (
                      <div key={index} className="shop-product-card">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="shop-product-image"
                        />
                        <h3 className="shop-product-name">
                          {item.name === "/" ? "Amazon Product" : item.name}
                        </h3>
                        <p className="shop-product-price">{item.price}</p>
                        <div className="product-actions">
                          <a
                            href={item.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shop-buy-button"
                          >
                            <FaShoppingBag style={{ marginRight: '5px' }} /> Buy Now
                          </a>
                          <button
                            className={`addtowishlist ${adding ? 'loading' : ''}`}
                            onClick={() => addtowishlist(item)}
                            aria-label="Add to wishlist"
                            disabled={adding}
                          >
                            <FaHeart /> {adding ? "Adding..." : "Add to wishlist"}
                          </button>
                        </div>
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
                        <div className="product-actions">
                          <a
                            href={item.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shop-buy-button"
                          >
                            <FaShoppingBag style={{ marginRight: '5px' }} /> Buy Now
                          </a>
                          <button
                            className={`addtowishlist ${adding ? 'loading' : ''}`}
                            onClick={() => addtowishlist(item)}
                            aria-label="Add to wishlist"
                            disabled={adding}
                          >
                            <FaHeart /> {adding ? "Adding..." : "Add to wishlist"}
                          </button>
                        </div>
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