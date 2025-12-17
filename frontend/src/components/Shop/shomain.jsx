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
  FaLock,
  FaExclamationTriangle,
  FaTimes
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from '../../utils/auth';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <FaCheck />,
    error: <FaExclamationTriangle />,
    info: <FaInfoCircle />
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{icons[type]}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>
        <FaTimes />
      </button>
    </div>
  );
};

const Shop = () => {
  const navigate = useNavigate();
  const [shopData, setShopData] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [userdetails, setuserdetails] = useState({});
  const backendurl = import.meta.env.VITE_BACKEND_URL;
  
  // Toast state
  const [toasts, setToasts] = useState([]);

  // Toast helper function
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const fetchuserdetails = () => {
    fetch(`${backendurl}/user/getuserdetails`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setuserdetails(data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        showToast("Error loading user details", "error");
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
    
    const url = `${backendurl}/amazon?clothes=${encodeURIComponent(searchQuery)}`;
    fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Amazon data received:", data);
        
        if (data.error) {
          console.error("Error from API:", data.error);
          setAmazonData([]);
          showToast(`Error from Amazon search: ${data.error}`, "error");
        } else if (data.products && Array.isArray(data.products)) {
          const mappedProducts = data.products.map(product => ({
            name: product.title || "Product",
            image_url: product.image || null,
            product_url: product.url || `https://www.amazon.in/dp/${product.asin || ''}`,
            price: product.price ? `₹${product.price}` : "Price not available",
            rating: product.rating || null,
            reviews: product.reviews || null,
            asin: product.asin || null,
            original: product
          }));
          setAmazonData(mappedProducts);
          showToast(`Found ${mappedProducts.length} products on Amazon`, "success");
        } else if (Array.isArray(data)) {
          const mappedProducts = data.map(product => ({
            name: product.title || product.name || "Product",
            image_url: product.image || product.image_url || null,
            product_url: product.url || product.product_url || `https://www.amazon.in/dp/${product.asin || ''}`,
            price: product.price ? `₹${product.price}` : "Price not available",
            rating: product.rating || null,
            reviews: product.reviews || null,
            asin: product.asin || null,
            original: product
          }));
          setAmazonData(mappedProducts);
          showToast(`Found ${mappedProducts.length} products on Amazon`, "success");
        } else {
          console.error("Unexpected data format:", data);
          setAmazonData([]);
          showToast("No products found on Amazon", "info");
        }
        setAmazonLoading(false);
        setloaded(false);
      })
      .catch((error) => {
        console.error("Error fetching Amazon data:", error);
        setAmazonData([]);
        setAmazonLoading(false);
        setloaded(false);
        showToast("Unable to connect to Amazon search service", "error");
      });
  };

  const myntraSearch = (customInput) => {
    setloaded(true);
    const searchQuery =
      customInput ||
      input ||
      `Styles for ${userdetails.gender || "male and female"}`;
    
    setMyntraLoading(true);
    const url = `${backendurl}/myntra?clothes=${encodeURIComponent(searchQuery)}`;
    fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include"
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Myntra data received:", data);
        
        // Handle empty products with error message (graceful degradation)
        if (data.success && data.products && Array.isArray(data.products)) {
          if (data.products.length === 0 && data.message) {
            setMyntraData([]);
            showToast(data.message, "info");
            setMyntraLoading(false);
            setloaded(false);
            return;
          }
        }
        
        if (data.error && !data.success) {
          console.error("Error from API:", data.error);
          setMyntraData([]);
          showToast(`Error from Myntra search: ${data.error}`, "error");
        } else if (data.products && Array.isArray(data.products)) {
          const mappedProducts = data.products.map(product => {
            let priceDisplay = `₹${product.price}`;
            if (product.mrp && product.mrp > product.price) {
              priceDisplay += ` ₹${product.mrp}`;
            }
            if (product.discount) {
              priceDisplay += ` ${product.discount}`;
            }
            
            return {
              name: product.title || "Product",
              image_url: product.image || null,
              product_url: product.url || null,
              price: priceDisplay,
              currentPrice: product.price,
              rating: product.rating ? `${product.rating.toFixed(1)} ⭐` : null,
              brand: product.brand || null,
              mrp: product.mrp || null,
              discount: product.discount || null,
              id: product.id || null,
              original: product
            };
          });
          setMyntraData(mappedProducts);
          if (mappedProducts.length > 0) {
            showToast(`Found ${mappedProducts.length} products on Myntra`, "success");
          } else {
            showToast("No products found on Myntra", "info");
          }
        } else if (Array.isArray(data)) {
          const mappedProducts = data.map(product => {
            const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
            const mrp = typeof product.mrp === 'number' ? product.mrp : parseFloat(product.mrp) || null;
            
            let priceDisplay = `₹${price}`;
            if (mrp && mrp > price) {
              priceDisplay += ` ₹${mrp}`;
            }
            if (product.discount) {
              priceDisplay += ` ${product.discount}`;
            }
            
            return {
              name: product.title || product.name || "Product",
              image_url: product.image || product.image_url || null,
              product_url: product.url || product.product_url || null,
              price: priceDisplay,
              currentPrice: price,
              rating: product.rating ? `${typeof product.rating === 'number' ? product.rating.toFixed(1) : product.rating} ⭐` : null,
              brand: product.brand || null,
              mrp: mrp,
              discount: product.discount || null,
              id: product.id || null,
              original: product
            };
          });
          setMyntraData(mappedProducts);
          if (mappedProducts.length > 0) {
            showToast(`Found ${mappedProducts.length} products on Myntra`, "success");
          } else {
            showToast("No products found on Myntra", "info");
          }
        } else {
          console.error("Unexpected data format:", data);
          setMyntraData([]);
          showToast("No products found on Myntra", "info");
        }
        setMyntraLoading(false);
        setloaded(false);
      })
      .catch((error) => {
        console.error("Error fetching Myntra data:", error);
        setMyntraData([]);
        setMyntraLoading(false);
        setloaded(false);
        showToast("Unable to connect to Myntra search service", "error");
      });
  };

  const [adding, setadding] = useState(false);
  const addtowishlist = (item) => {
    console.log("Wishlist item:", item);
    setadding(true);
    
    fetch(`${backendurl}/shop/addtowishlist`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Server response:", data);

        if (data.status) {
          showToast("Item added to wishlist!", "success");
          setadding(false);
        } else if (data.msg === "Already in wishlist") {
          showToast("This item is already in your wishlist", "info");
          setadding(false);
        } else {
          showToast("Failed to add item. Try again.", "error");
          setadding(false);
        }
      })
      .catch((error) => {
        console.error("Error adding to wishlist:", error);
        showToast("Server error. Please try again later.", "error");
        setadding(false);
      });
  };

  const [usercloths, setuserclothes] = useState("");
  const userclothes = () => {
    fetch(`${backendurl}/user/images`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.Wardrobe.allclothes[0]);
        setuserclothes(data.Wardrobe.allclothes[0]);
      })
      .catch((error) => {
        console.error("Error fetching user clothes:", error);
        showToast("Error loading wardrobe", "error");
      });
  };

  const [shoppingsuggestionsmain, setshoppingsuggestions] = useState([]);

  const shoppingsuggestions = () => {
    setloaded(true);
    fetch(`${backendurl}/chat/getshoppingsuggestions`, {
      method: "POST",
      headers: getAuthHeaders(),
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

          if (suggestion.indexOf('*') === -1) {
            cloths.push(suggestion.trim());
          } else {
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
            if (item.trim()) {
              cloths.push(item.trim());
            }
          }
          
          console.log("AI suggestion array:", cloths);
          setshoppingsuggestions(cloths);
          showToast("AI recommendations generated!", "success");
        } else {
          console.error("Invalid response format:", data);
          showToast("Could not get AI recommendations", "error");
        }
        setloaded(false);
      })
      .catch((error) => {
        console.error("Error fetching shopping suggestions:", error);
        showToast("Error getting AI recommendations", "error");
        setloaded(false);
        setshoppingsuggestions([]);
      });
  };

  return (
    <div className="shop-container">
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

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
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="shop-product-image"
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="no-image-placeholder">
                              <FaTshirt className="placeholder-icon" />
                              <p>No Image</p>
                            </div>
                          )}
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
                          {(item.rating || item.reviews) && (
                            <div className="product-rating-info">
                              {item.rating && (
                                <span className="product-rating">
                                  {item.rating.includes("out of") 
                                    ? item.rating.split("out of")[0].trim() 
                                    : item.rating} ⭐
                                </span>
                              )}
                              {item.reviews && (
                                <span className="product-reviews">
                                  {item.reviews}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="product-actions">
                            {item.product_url ? (
                              <a
                                href={item.product_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shop-buy-button"
                              >
                                <FaExternalLinkAlt className="button-icon" /> View Product
                              </a>
                            ) : (
                              <button
                                className="shop-buy-button"
                                disabled
                                title="Product URL not available"
                              >
                                <FaExternalLinkAlt className="button-icon" /> URL Unavailable
                              </button>
                            )}
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
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="shop-product-image"
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="no-image-placeholder">
                              <FaTshirt className="placeholder-icon" />
                              <p>No Image</p>
                            </div>
                          )}
                          <div className="product-source myntra-source">
                            <FaStore /> Myntra
                          </div>
                        </div>
                        <div className="product-details">
                          {item.brand && (
                            <p className="product-brand">{item.brand}</p>
                          )}
                          <h3 className="shop-product-name">{item.name}</h3>
                          <p className="shop-product-price">
                            <FaTag className="price-icon" /> <span className="price-amount">{item.price}</span>
                          </p>
                          {item.rating && (
                            <div className="product-rating-info">
                              <span className="product-rating">
                                {item.rating}
                              </span>
                            </div>
                          )}
                          <div className="product-actions">
                            {item.product_url ? (
                              <a
                                href={item.product_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shop-buy-button myntra-buy"
                              >
                                <FaExternalLinkAlt className="button-icon" /> View Product
                              </a>
                            ) : (
                              <button
                                className="shop-buy-button myntra-buy"
                                disabled
                                title="Product URL not available"
                              >
                                <FaExternalLinkAlt className="button-icon" /> URL Unavailable
                              </button>
                            )}
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

export default Shop;