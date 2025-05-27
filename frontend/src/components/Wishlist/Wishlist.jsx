import React, { useEffect, useState } from "react";
import "./Wishlist.css";
import { FaHeart, FaTrash, FaExternalLinkAlt, FaShoppingBag, FaSpinner, FaFilter, FaSort, FaSearch, FaShareAlt, FaTags } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [filteredWishlist, setFilteredWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("dateAdded"); // dateAdded, priceLow, priceHigh, name
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  
  const loadWishlist = () => {
    setLoading(true);
    fetch(`${apiUrl}/user/getwishlist`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            setIsLoggedIn(false);
            throw new Error("Authentication required");
          }
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setWishlist(data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load wishlist:", error);
        setLoading(false);
      });
  };

  const removeFromWishlist = (id) => {
    fetch(`${apiUrl}/shop/removefromwishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ wishlistId: id }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status) {
          // Remove the item from the local state
          setWishlist(wishlist.filter(item => item._id !== id));
          showNotification("Item removed from wishlist", "success");
        } else {
          showNotification("Failed to remove item", "error");
        }
      })
      .catch((error) => {
        console.error("Error removing item from wishlist:", error);
        showNotification("An error occurred", "error");
      });
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Filter and sort wishlist items
  useEffect(() => {
    if (wishlist.length > 0) {
      let filtered = [...wishlist];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(item => {
          const name = item.wishlistitem.name || "";
          return name.toLowerCase().includes(searchTerm.toLowerCase());
        });
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortOption) {
          case "dateAdded":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "priceLow":
            const priceA = parseFloat(a.wishlistitem.price?.replace(/[^0-9.]/g, "")) || 0;
            const priceB = parseFloat(b.wishlistitem.price?.replace(/[^0-9.]/g, "")) || 0;
            return priceA - priceB;
          case "priceHigh":
            const priceAHigh = parseFloat(a.wishlistitem.price?.replace(/[^0-9.]/g, "")) || 0;
            const priceBHigh = parseFloat(b.wishlistitem.price?.replace(/[^0-9.]/g, "")) || 0;
            return priceBHigh - priceAHigh;
          case "name":
            const nameA = a.wishlistitem.name || "";
            const nameB = b.wishlistitem.name || "";
            return nameA.localeCompare(nameB);
          default:
            return 0;
        }
      });
      
      setFilteredWishlist(filtered);
    } else {
      setFilteredWishlist([]);
    }
  }, [wishlist, searchTerm, sortOption]);

  useEffect(() => {
    loadWishlist();
  }, []);

  // Authentication required screen
  if (!isLoggedIn) {
    return (
      <div className="auth-required-container">
        <div className="auth-required-content">
          <FaHeart className="auth-icon" />
          <h2>Authentication Required</h2>
          <p>Please log in to view your wishlist</p>
          <div className="auth-buttons">
            <a href="/auth" className="auth-button login">Log In</a>
            <a href="/auth" className="auth-button signup">Sign Up</a>
          </div>
        </div>
      </div>
    );
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Toggle filter panel
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Toggle view mode (grid/list)
  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  return (
    <div className="wishlist-container">
      <AnimatePresence>
        {notification.show && (
          <motion.div 
            className={`notification ${notification.type}`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="wishlist-header">
        <h2><FaHeart className="wishlist-icon" /> Your Wishlist</h2>
        <p className="wishlist-subtitle">
          {filteredWishlist.length} of {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>
      
      <div className="wishlist-controls">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search your wishlist..." 
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="control-buttons">
          <button 
            className={`control-button ${showFilters ? 'active' : ''}`} 
            onClick={toggleFilters}
            aria-label="Toggle filters"
          >
            <FaFilter /> Filter
          </button>
          
          <div className="sort-dropdown">
            <button className="control-button">
              <FaSort /> Sort
            </button>
            <div className="sort-options">
              <button 
                className={sortOption === "dateAdded" ? "active" : ""}
                onClick={() => setSortOption("dateAdded")}
              >
                Date Added (Newest)
              </button>
              <button 
                className={sortOption === "priceLow" ? "active" : ""}
                onClick={() => setSortOption("priceLow")}
              >
                Price (Low to High)
              </button>
              <button 
                className={sortOption === "priceHigh" ? "active" : ""}
                onClick={() => setSortOption("priceHigh")}
              >
                Price (High to Low)
              </button>
              <button 
                className={sortOption === "name" ? "active" : ""}
                onClick={() => setSortOption("name")}
              >
                Name (A-Z)
              </button>
            </div>
          </div>
          
          <button 
            className="control-button view-toggle" 
            onClick={toggleViewMode}
            aria-label="Toggle view mode"
          >
            {viewMode === "grid" ? "List View" : "Grid View"}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="filter-options">
              <div className="filter-group">
                <h3><FaTags /> Price Range</h3>
                <div className="price-range">
                  <button className={`filter-tag ${searchTerm.includes("under $50") ? "active" : ""}`} onClick={() => setSearchTerm("under $50")}>Under $50</button>
                  <button className={`filter-tag ${searchTerm.includes("$50-$100") ? "active" : ""}`} onClick={() => setSearchTerm("$50-$100")}>$50-$100</button>
                  <button className={`filter-tag ${searchTerm.includes("$100-$200") ? "active" : ""}`} onClick={() => setSearchTerm("$100-$200")}>$100-$200</button>
                  <button className={`filter-tag ${searchTerm.includes("over $200") ? "active" : ""}`} onClick={() => setSearchTerm("over $200")}>Over $200</button>
                </div>
              </div>
              
              <button className="clear-filters" onClick={() => setSearchTerm("")}>Clear All Filters</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {loading ? (
        <div className="loading-container">
          <FaSpinner className="loading-spinner" />
          <p>Loading your wishlist...</p>
        </div>
      ) : (
        <div className={`wishlist-${viewMode}`}>
          {filteredWishlist.length > 0 ? (
            filteredWishlist.map((item) => {
              const { _id, wishlistitem, createdAt } = item;
              const dateAdded = new Date(createdAt).toLocaleDateString();
              
              return (
                <motion.div 
                  className={`wishlist-item ${viewMode === "list" ? "list-view" : ""}`} 
                  key={_id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="wishlist-card-header">
                    <span className="date-added">Added on {dateAdded}</span>
                    <div className="card-actions">
                      <button 
                        className="action-button share-button" 
                        aria-label="Share item"
                      >
                        <FaShareAlt />
                      </button>
                      <button 
                        className="action-button remove-button" 
                        onClick={() => removeFromWishlist(_id)}
                        aria-label="Remove from wishlist"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="wishlist-content">
                    <div className="wishlist-image-container">
                      <img
                        src={wishlistitem.image_url}
                        alt={wishlistitem.name}
                        className="wishlist-image"
                        loading="lazy"
                      />
                      {wishlistitem.price && wishlistitem.price !== "N/A" && (
                        <div className="price-tag">{wishlistitem.price}</div>
                      )}
                    </div>
                    
                    <div className="wishlist-info">
                      <h3 className="wishlist-name">
                        {wishlistitem.name === "N/A" || !wishlistitem.name ? "Amazon product" : wishlistitem.name}
                      </h3>
                      
                      <p className="wishlist-price">
                        {wishlistitem.price === "N/A" || !wishlistitem.price ? "Price not available" : wishlistitem.price}
                      </p>
                      
                      <div className="wishlist-meta">
                        <span className="wishlist-source">{new URL(wishlistitem.product_url).hostname.replace('www.', '')}</span>
                      </div>
                      
                      <div className="wishlist-actions">
                        <a
                          href={wishlistitem.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="wishlist-link view"
                        >
                          <FaExternalLinkAlt /> View Details
                        </a>
                        <a
                          href={wishlistitem.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="wishlist-link buy"
                        >
                          <FaShoppingBag /> Buy Now
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : searchTerm ? (
            <div className="empty-search-results">
              <div className="empty-search-illustration">
                <FaSearch className="empty-search-icon" />
              </div>
              <h3>No items match your search</h3>
              <p>Try adjusting your search or filters to find what you're looking for</p>
              <button className="clear-search-button" onClick={() => setSearchTerm("")}>Clear Search</button>
            </div>
          ) : (
            <div className="empty-wishlist">
              <div className="empty-wishlist-illustration">
                <FaHeart className="empty-heart" />
              </div>
              <h3>Your wishlist is empty</h3>
              <p>Items you save to your wishlist will appear here</p>
              <a href="/shop" className="shop-now-button">
                Shop Now
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
