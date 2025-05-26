import React, { useState, useEffect } from "react";
import "./Shop.css";
import { FaHeart, FaSearch, FaShoppingBag, FaTshirt, FaSpinner, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Shop = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [amazonData, setAmazonData] = useState([]);
  const [myntraData, setMyntraData] = useState([]);
  const [amazonLoading, setAmazonLoading] = useState(false);
  const [myntraLoading, setMyntraLoading] = useState(false);
  const [visibleAmazonProducts, setVisibleAmazonProducts] = useState(5);
  const [visibleMyntraProducts, setVisibleMyntraProducts] = useState(5);
  const [userDetails, setUserDetails] = useState({});
  const [adding, setAdding] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const mlUrl = import.meta.env.VITE_ML_URL;

  // Check authentication status
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      setAuthChecking(true);
      const response = await fetch(`${backendUrl}/user/getuserdetails`, {
        method: "GET",
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          return;
        }
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setUserDetails(data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error checking authentication:", error);
      // Only set isAuthenticated to false for 401 responses
    } finally {
      setAuthChecking(false);
    }
  };

  // Show notification
  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Amazon search
  const amazonSearch = async () => {
    if (!searchInput.trim()) {
      showNotification("Please enter a search term", "error");
      return;
    }

    try {
      setAmazonLoading(true);
      const query = searchInput || `Styles for ${userDetails.gender || "male and female"}`;
      
      // Try with the backend proxy first
      try {
        const response = await fetch(
          `${backendUrl}/shop/proxy/amazon?query=${encodeURIComponent(query)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        if (Array.isArray(data)) {
          setAmazonData(data);
          return;
        } else if (data.error) {
          console.error("Error from API:", data.error);
          throw new Error(data.error);
        } else {
          // If it's an object but not an error, try to use it
          const products = Object.values(data).filter(item => 
            typeof item === 'object' && item.name && item.image_url
          );
          
          if (products.length > 0) {
            setAmazonData(products);
            return;
          } else {
            console.error("Unexpected data format:", data);
            throw new Error("Received unexpected data format");
          }
        }
      } catch (proxyError) {
        console.warn("Backend proxy failed, trying direct ML service:", proxyError);
        
        // If backend proxy fails (likely due to CORS), try direct ML service as fallback
        // This will only work in development or if ML service has proper CORS headers
        const mlResponse = await fetch(
          `${mlUrl}/shop?query=${encodeURIComponent(query)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!mlResponse.ok) {
          throw new Error(`ML service responded with status: ${mlResponse.status}`);
        }

        const mlData = await mlResponse.json();
        
        if (Array.isArray(mlData)) {
          setAmazonData(mlData);
        } else {
          throw new Error("Unexpected data format from ML service");
        }
      }
    } catch (error) {
      console.error("Error fetching Amazon data:", error);
      setAmazonData([]);
      showNotification(`Unable to fetch Amazon products: ${error.message}`, "error");
    } finally {
      setAmazonLoading(false);
    }
  };

  // Myntra search
  const myntraSearch = async () => {
    if (!searchInput.trim()) {
      showNotification("Please enter a search term", "error");
      return;
    }

    try {
      setMyntraLoading(true);
      const query = searchInput || `Styles for ${userDetails.gender || "male and female"}`;
      
      // Try with the backend proxy first
      try {
        const response = await fetch(
          `${backendUrl}/shop/proxy/myntra?query=${encodeURIComponent(query)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        if (Array.isArray(data)) {
          setMyntraData(data);
          return;
        } else if (data.error) {
          console.error("Error from API:", data.error);
          throw new Error(data.error);
        } else {
          // If it's an object but not an error, try to use it
          const products = Object.values(data).filter(item => 
            typeof item === 'object' && item.name && item.image_url
          );
          
          if (products.length > 0) {
            setMyntraData(products);
            return;
          } else {
            console.error("Unexpected data format:", data);
            throw new Error("Received unexpected data format");
          }
        }
      } catch (proxyError) {
        console.warn("Backend proxy failed, trying direct ML service:", proxyError);
        
        // If backend proxy fails (likely due to CORS), try direct ML service as fallback
        // This will only work in development or if ML service has proper CORS headers
        const mlResponse = await fetch(
          `${mlUrl}/myntra?query=${encodeURIComponent(query)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!mlResponse.ok) {
          throw new Error(`ML service responded with status: ${mlResponse.status}`);
        }

        const mlData = await mlResponse.json();
        
        if (Array.isArray(mlData)) {
          setMyntraData(mlData);
        } else {
          throw new Error("Unexpected data format from ML service");
        }
      }
    } catch (error) {
      console.error("Error fetching Myntra data:", error);
      setMyntraData([]);
      showNotification(`Unable to fetch Myntra products: ${error.message}`, "error");
    } finally {
      setMyntraLoading(false);
    }
  };

  // Add to wishlist
  const addToWishlist = async (item) => {
    if (!isAuthenticated) {
      showNotification("Please log in to add items to your wishlist", "error");
      return;
    }

    try {
      setAdding(true);
      const response = await fetch(`${backendUrl}/shop/addtowishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status) {
        showNotification("Item added to wishlist", "success");
      } else {
        showNotification("Failed to add item to wishlist", "error");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      showNotification("Error adding to wishlist", "error");
    } finally {
      setAdding(false);
    }
  };

  // Get AI recommendations
  const getAIRecommendations = async () => {
    try {
      showNotification("Getting AI recommendations...", "info");
      // Implement AI recommendations logic here
      // This would typically call an endpoint that returns personalized recommendations
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      showNotification("Error getting AI recommendations", "error");
    }
  };

  return (
    <div className="shop-container">
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Authentication Check */}
      {authChecking ? (
        <div className="loading">
          <FaSpinner className="spinner" />
          <p className="loading-message">Checking authentication status...</p>
        </div>
      ) : !isAuthenticated ? (
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to access the shopping features and get personalized recommendations.</p>
          <div className="auth-buttons">
            <button className="login-button" onClick={() => navigate("/login")}>
              <FaSignInAlt /> Log In
            </button>
            <button className="signup-button" onClick={() => navigate("/signup")}>
              <FaUserPlus /> Sign Up
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Shop Content */}
          <div className="shop-header">
            <h1>Shop</h1>
            <p className="shop-subtitle">Discover the perfect product or let AI inspire your next outfit choice!</p>
            
            <div className="info-message">
              <p>We're now using a backend proxy to communicate with the ML service.</p>
            </div>
          </div>

          {/* Search Section */}
          <div className="search-section">
            <div className="search-input-container">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter the clothes you want to search for..."
                className="search-input"
              />
            </div>
            
            <div className="search-buttons">
              <button
                className="search-button"
                onClick={() => {
                  amazonSearch();
                  myntraSearch();
                }}
              >
                <FaSearch /> Search on Amazon and Myntra
              </button>
              
              <button
                className="ai-recommendation-button"
                onClick={getAIRecommendations}
              >
                <FaTshirt /> Get AI Recommendations
              </button>
            </div>
            
            <button
              className="wishlist-button"
              onClick={() => navigate("/wishlist")}
            >
              <FaHeart /> View Your Wishlist
            </button>
          </div>

          {/* Results Section */}
          <div className="results-container">
            {/* Amazon Results */}
            {amazonLoading ? (
              <div className="loading">
                <FaSpinner className="spinner" />
                <p className="loading-message">Searching Amazon products...</p>
              </div>
            ) : amazonData.length > 0 ? (
              <div className="amazon-results">
                <h2 className="results-header">
                  Amazon Results for "{searchInput || "Recommended Items"}"
                </h2>
                
                <div className="products-grid">
                  {amazonData.slice(0, visibleAmazonProducts).map((item, index) => (
                    <div key={`amazon-${index}`} className="shop-product-card">
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
                          <FaShoppingBag /> Buy Now
                        </a>
                        
                        <button
                          className={`add-to-wishlist ${adding ? 'loading' : ''}`}
                          onClick={() => addToWishlist(item)}
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
                    onClick={() => setVisibleAmazonProducts(visibleAmazonProducts + 5)}
                  >
                    Load More
                  </button>
                )}
              </div>
            ) : null}

            {/* Myntra Results */}
            {myntraLoading ? (
              <div className="loading">
                <FaSpinner className="spinner" />
                <p className="loading-message">Searching Myntra products...</p>
              </div>
            ) : myntraData.length > 0 ? (
              <div className="myntra-results">
                <h2 className="results-header">
                  Myntra Results for "{searchInput || "Recommended Items"}"
                </h2>
                
                <div className="products-grid">
                  {myntraData.slice(0, visibleMyntraProducts).map((item, index) => (
                    <div key={`myntra-${index}`} className="shop-product-card">
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
                          <FaShoppingBag /> Buy Now
                        </a>
                        
                        <button
                          className={`add-to-wishlist ${adding ? 'loading' : ''}`}
                          onClick={() => addToWishlist(item)}
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
                    onClick={() => setVisibleMyntraProducts(visibleMyntraProducts + 5)}
                  >
                    Load More
                  </button>
                )}
              </div>
            ) : null}

            {/* Empty State */}
            {!amazonLoading && !myntraLoading && amazonData.length === 0 && myntraData.length === 0 && (
              <div className="empty-results">
                <p>Search for clothes to see results from Amazon and Myntra</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Shop;
