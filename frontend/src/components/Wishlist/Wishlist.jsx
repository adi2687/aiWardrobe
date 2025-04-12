import React, { useEffect, useState } from "react";
import "./Wishlist.css";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  // console.log('url is ',apiUrl); 
  
  const loadWishlist = () => {
    fetch(`${apiUrl}/user/getwishlist`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setWishlist(data || []);
      })
      .catch((error) => {
        console.error("Failed to load wishlist:", error);
      });
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  return (
    <div className="wishlist-container">
      <div>
        <h2>Your wishlist</h2>
      </div>
      
      <div>
        {wishlist.length > 0 ? (
          wishlist.map((item) => {
            const { _id, wishlistitem } = item;
            return (
              <div className="wishlist-card" key={_id}>
                <img
                  src={wishlistitem.image_url}
                  alt={wishlistitem.name}
                  className="wishlist-image"
                />
                <div className="wishlist-info">
                <h3 className="wishlist-name">
  {wishlistitem.name === "N/A" || !wishlistitem.name ? "Amazon product" : wishlistitem.name}
</h3>

<p className="wishlist-price">
  {wishlistitem.price === "N/A" || !wishlistitem.price ? "Price not available" : wishlistitem.price}
</p>

                  <a
                    href={wishlistitem.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wishlist-link"
                  >
                    View Product
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <p className="wishlist-empty">No items in wishlist.</p>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
