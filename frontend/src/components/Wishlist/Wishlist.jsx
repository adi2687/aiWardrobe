import React, { useEffect, useState } from "react";
import "./Wishlist.css";
import { FaHeart, FaTrash, FaExternalLinkAlt, FaShoppingBag, FaSpinner } from "react-icons/fa";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
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

  return (
    <div className="wishlist-container">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="wishlist-header">
        <h2><FaHeart className="wishlist-icon" /> Your Wishlist</h2>
        <p className="wishlist-subtitle">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <FaSpinner className="loading-spinner" />
          <p>Loading your wishlist...</p>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.length > 0 ? (
            wishlist.map((item) => {
              const { _id, wishlistitem, createdAt } = item;
              const dateAdded = new Date(createdAt).toLocaleDateString();
              
              return (
                <div className="wishlist-card" key={_id}>
                  <div className="wishlist-card-header">
                    <span className="date-added">Added on {dateAdded}</span>
                    <button 
                      className="remove-button" 
                      onClick={() => removeFromWishlist(_id)}
                      aria-label="Remove from wishlist"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  <div className="wishlist-image-container">
                    <img
                      src={wishlistitem.image_url}
                      alt={wishlistitem.name}
                      className="wishlist-image"
                    />
                  </div>
                  
                  <div className="wishlist-info">
                    <h3 className="wishlist-name">
                      {wishlistitem.name === "N/A" || !wishlistitem.name ? "Amazon product" : wishlistitem.name}
                    </h3>
                    
                    <p className="wishlist-price">
                      {wishlistitem.price === "N/A" || !wishlistitem.price ? "Price not available" : wishlistitem.price}
                    </p>
                    
                    <div className="wishlist-actions">
                      <a
                        href={wishlistitem.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wishlist-link view"
                      >
                        <FaExternalLinkAlt /> View
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
              );
            })
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
