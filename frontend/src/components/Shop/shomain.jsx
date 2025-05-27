import React, { useState, useEffect } from "react";
import "./Shop.css"; // Import the CSS file
import { 
  FaHeart, 
  FaCheck, 
  FaSearch, 
  FaShoppingBag, 
  FaAmazon, 
  FaTshirt, 
  FaShoppingCart, 
  FaStore, 
  FaSpinner, 
  FaArrowRight,
  FaTag,
  FaExternalLinkAlt,
  FaMagic,
  FaTimesCircle,
  FaInfoCircle,
  FaLock
} from "react-icons/fa";
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
    
    // Go back to using the backend proxy
    console.log(`Making request through backend proxy: ${backendurl}/shop/proxy/amazon?query=${encodeURIComponent(searchQuery)}`);
    
    fetch(
      `${backendurl}/shop/proxy/amazon?query=${encodeURIComponent(searchQuery)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        // Use include for credentials to ensure cookies are sent
        credentials: "include",
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

    // Go back to using the backend proxy
    console.log(`Making request through backend proxy: ${backendurl}/shop/proxy/myntra?query=${encodeURIComponent(searchQuery)}`);
    
    setMyntraLoading(true);
    fetch(
      `${backendurl}/shop/proxy/myntra?query=${encodeURIComponent(searchQuery)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        // Use include for credentials to ensure cookies are sent
        credentials: "include",
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
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("AI recommendations data:", data);
        if (data && data.suggestion) {
          const suggestion = data.suggestion;
          const cloths = [];
          let item = "";

          // Add the last item if there's no trailing asterisk
          if (suggestion.indexOf('*') === -1) {
            cloths.push(suggestion.trim());
          } else {
            // Parse the asterisk-separated list
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
            // Add the last item if it wasn't followed by an asterisk
            if (item.trim()) {
              cloths.push(item.trim());
            }
          }
          
          console.log("AI suggestion array:", cloths);
          setshoppingsuggestions(cloths);
        } else {
          console.error("Invalid response format:", data);
          alert("Could not get AI recommendations. Please try again.");
        }
        setloaded(false);
      })
      .catch((error) => {
        console.error("Error fetching shopping suggestions:", error);
        alert("Error getting AI recommendations: " + error.message);
        setloaded(false);
        setshoppingsuggestions([]);
      });
  };

  return (
    <div className="shop-container">

      {/* heyyy {JSON.stringify(username)} */}
      {JSON.stringify(userdetails)}
      <header className="shop-header">
        <h1 className="shop-title">Smart Shopping</h1>
        <p className="shop-subtitle">Discover perfect additions to your wardrobe with AI-powered recommendations</p>
      </header>

      <div className="search-section">
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            onChange={(e) => setInput(e.target.value)}
            placeholder="What are you looking for today? (e.g., 'white sneakers', 'black dress')"
            className="shop-search-input"
            value={input}
          />
          {input && (
            <button 
              className="clear-input" 
              onClick={() => setInput("")}
              aria-label="Clear search"
            >
              <FaTimesCircle />
            </button>
          )}
        </div>
        
        <div className="button-container">
          <button
            className="search-button primary-button"
            onClick={() => {
              amazonSearch(input);
              myntraSearch(input);
            }}
            disabled={amazonLoading || myntraLoading}
          >
            <FaShoppingBag className="button-icon" /> 
            {(amazonLoading || myntraLoading) ? (
              <><FaSpinner className="spinner" /> Searching...</>
            ) : (
              "Search Products"
            )}
          </button>
          
          <button
            className="ai-button secondary-button"
            onClick={() => {
              fetchuserdetails();
              shoppingsuggestions();
              userclothes();
            }}
            disabled={loaded}
          >
            <FaMagic className="button-icon" /> 
            {loaded ? (
              <><FaSpinner className="spinner" /> Getting Recommendations...</>
            ) : (
              "AI Style Recommendations"
            )}
          </button>
          
          <button 
            className="wishlist-button"
            onClick={() => navigate("/wishlist")}
          >
            <FaHeart className="button-icon" /> My Wishlist
          </button>
        </div>
      </div>

      {loaded ? (
        <div className="message-container">
          <div className="loading-spinner"></div>
          <p className="loading-message">Finding the perfect items for you...</p>
          <p className="suggestion-text">This may take a moment as we search multiple platforms</p>
        </div>
      ) : (
        <div className="welcome-container">
          {(!amazonData.length && !myntraData.length && !shoppingsuggestionsmain.length) && (
            <div className="welcome-message">
              <h2 className="welcome-title">Discover Your Perfect Style</h2>
              <p className="welcome-subtitle">Explore thousands of products from top retailers or get AI-powered recommendations</p>
              
              <div className="feature-cards">
                <div className="feature-card">
                  <FaSearch className="feature-icon" />
                  <h3 className="feature-title">Smart Search</h3>
                  <p className="feature-description">Find items across Amazon and Myntra with a single search query</p>
                </div>
                <div className="feature-card">
                  <FaMagic className="feature-icon" />
                  <h3 className="feature-title">AI Stylist</h3>
                  <p className="feature-description">Get personalized recommendations based on your wardrobe and preferences</p>
                </div>
                <div className="feature-card">
                  <FaHeart className="feature-icon" />
                  <h3 className="feature-title">Wishlist</h3>
                  <p className="feature-description">Save your favorite items to revisit and purchase later</p>
                </div>
              </div>
              
              <div className="info-banner">
                <FaInfoCircle className="info-icon" />
                <p>Start by searching for an item or clicking "AI Style Recommendations" to get personalized suggestions</p>
              </div>
            </div>
          )}
        </div>
      )}

      {shoppingsuggestionsmain.length > 0 && (
        <div className="suggestion-container">
          <div className="suggestion-header">
            <div className="suggestion-title">
              <FaMagic className="suggestion-icon" />
              <h2>AI Style Recommendations</h2>
            </div>
            <p className="suggestion-subtitle">
              Personalized for you based on your wardrobe, preferences, and current fashion trends
            </p>
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
                <span className="pill-text">{ele}</span>
                <FaArrowRight className="pill-icon" />
              </button>
            ))}
          </div>
          
          <div className="suggestion-info">
            <FaInfoCircle className="info-icon" />
            <p>Click on any suggestion to search for those items across platforms</p>
          </div>
        </div>
      )}

      <div className="search-results-container">
        {/* Amazon Results Section */}
        {amazonData.length > 0 && (
          <div className="results-section amazon-results">
            <div className="results-header">
              <div className="results-title">
                <FaAmazon className="results-icon amazon-icon" />
                {input ? (
                  <h2>Amazon Results for "{input}"</h2>
                ) : (
                  <h2>
                    Amazon Results for {userdetails.gender || "you"}
                  </h2>
                )}
              </div>
              <div className="results-count">{amazonData.length} items found</div>
            </div>
            
            {amazonLoading ? (
              <div className="results-loading">
                <FaSpinner className="spinner" />
                <p>Searching Amazon for the best products...</p>
              </div>
            ) : (
              <>
                <div className="shop-products-grid">
                  {amazonData
                    .slice(0, visibleAmazonProducts)
                    .map((item, index) => (
                      <div key={index} className="shop-product-card">
                        <div className="product-image-container">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="shop-product-image"
                            loading="lazy"
                          />
                          <div className="product-source">
                            <FaAmazon /> Amazon
                          </div>
                        </div>
                        <div className="product-details">
                          <h3 className="shop-product-name">
                            {item.name === "/" ? "Amazon Product" : item.name}
                          </h3>
                          <p className="shop-product-price">
                            <FaTag className="price-icon" /> <span className="price-amount">{item.price}</span>
                          </p>
                          <div className="product-actions">
                            <a
                              href={item.product_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shop-buy-button"
                            >
                              <FaExternalLinkAlt className="button-icon" /> View Product
                            </a>
                            <button
                              className={`addtowishlist ${adding ? 'loading' : ''}`}
                              onClick={() => addtowishlist(item)}
                              aria-label="Add to wishlist"
                              disabled={adding}
                            >
                              <FaHeart className="button-icon" /> 
                              {adding ? <FaSpinner className="spinner" /> : "Save"}
                            </button>
                          </div>
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
                    Load More Products <FaArrowRight className="button-icon-right" />
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Myntra Results Section */}
        {myntraData.length > 0 && (
          <div className="results-section myntra-results">
            <div className="results-header">
              <div className="results-title">
                <FaStore className="results-icon myntra-icon" />
                {input ? (
                  <h2>Myntra Results for "{input}"</h2>
                ) : userdetails.gender ? (
                  <h2>Myntra Results for {userdetails.gender}</h2>
                ) : (
                  <h2>Myntra Results</h2>
                )}
              </div>
              <div className="results-count">{myntraData.length} items found</div>
            </div>

            {myntraLoading ? (
              <div className="results-loading">
                <FaSpinner className="spinner" />
                <p>Searching Myntra for the best products...</p>
              </div>
            ) : (
              <>
                <div className="shop-products-grid">
                  {myntraData
                    .slice(0, visibleMyntraProducts)
                    .map((item, index) => (
                      <div key={index} className="shop-product-card">
                        <div className="product-image-container">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="shop-product-image"
                            loading="lazy"
                          />
                          <div className="product-source myntra-source">
                            <FaStore /> Myntra
                          </div>
                        </div>
                        <div className="product-details">
                          <h3 className="shop-product-name">{item.name}</h3>
                          <p className="shop-product-price">
                            <FaTag className="price-icon" /> <span className="price-amount">{item.price}</span>
                          </p>
                          <div className="product-actions">
                            <a
                              href={item.product_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shop-buy-button myntra-buy"
                            >
                              <FaExternalLinkAlt className="button-icon" /> View Product
                            </a>
                            <button
                              className={`addtowishlist ${adding ? 'loading' : ''}`}
                              onClick={() => addtowishlist(item)}
                              aria-label="Add to wishlist"
                              disabled={adding}
                            >
                              <FaHeart className="button-icon" /> 
                              {adding ? <FaSpinner className="spinner" /> : "Save"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                {visibleMyntraProducts < myntraData.length && (
                  <button
                    className="load-more myntra-more"
                    onClick={() =>
                      setVisibleMyntraProducts(visibleMyntraProducts + 10)
                    }
                  >
                    Load More Products <FaArrowRight className="button-icon-right" />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
      
      {/* No results message */}
      {!loaded && input && amazonData.length === 0 && myntraData.length === 0 && !amazonLoading && !myntraLoading && (
        <div className="no-results">
          <div className="no-results-icon">
            <FaSearch />
          </div>
          <h3>No products found</h3>
          <p>We couldn't find any products matching "{input}". Try a different search term or check out our AI recommendations.</p>
          <button 
            className="try-ai-button"
            onClick={() => {
              fetchuserdetails();
              shoppingsuggestions();
            }}
          >
            <FaMagic className="button-icon" /> Get AI Recommendations
          </button>
        </div>
      )}
      
      {/* Authentication required message */}
      {(!userdetails) && (
        <div className="auth-required">
          <div className="auth-icon">
            <FaLock />
          </div>
          <h3 className="auth-title">Sign in for personalized recommendations</h3>
          <p className="auth-message">Create an account or sign in to get AI-powered recommendations based on your style profile and wardrobe items.</p>
          <div className="auth-buttons">
            <button 
              className="primary-button"
              onClick={() => navigate("/auth")}
            >
              Sign In / Create Account
            </button>
          </div>
        </div>
      )}
      
      <footer className="shop-footer">
        <p>Powered by AI Wardrobe - Your personal fashion assistant</p>
      </footer>
    </div>
  );
};


export default Shop