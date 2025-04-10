import React, { useState } from "react";
import "./Shop.css"; // Import the CSS file

const Shop = () => {
  const [shopData, setShopData] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(5);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
const [visible,setVisible]=useState(false)
  const search = () => {
    setLoading(true);
    fetch(`http://localhost:5001/shop?query=${input}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
       

        setShopData(data);
        setVisibleProducts(5); // Reset visible products on new search
        setLoading(false);
        setVisible(true)
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);  
      });
  };

  const loadMore = () => {
    setVisibleProducts((prev) => prev + 5);
  };

  return (
    <div className="shop-container">
      <h2>Shop Our Collection</h2>
      {/* <form onSubmit={search}>  */}
      <input
        type="text"
        onChange={(e) => {setInput(e.target.value);; setVisible(false)}}
        placeholder="Enter the clothes you wanna search"
        className="shop-search-input"
      />
      <button onClick={()=>{search()}} className="shop-search-button" type="submit">
        Search
      </button>
      {/* </form> */}
      {visible ? (
<h2>Amazon Search results for {input}</h2>
      ) : (
        <h2>Search for products</h2>
      )
    }

      {loading ? (
        <p className="shop-message">Loading...</p>
      ) : shopData.length === 0 ? (
        <p className="shop-message">No products found. Try searching something!</p>
      ) : (
        <div className="shop-products-grid">
          {shopData.slice(0, visibleProducts).map((item, index) => (
            <div key={index} className="shop-product-card">
              <img
                src={item.image_url}
                alt={item.name}
                className="shop-product-image"
              />
              <h3 className="shop-product-name">{item.name}</h3>
              <p className="shop-product-name">{item.price}</p>
              <a
                href={item.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shop-buy-button"
              >
                Buy Now
              </a>
            </div>
          ))}
        </div>
      )}

      {visibleProducts < shopData.length && (
        <button onClick={loadMore} className="shop-load-more-button">
          Load More
        </button>
      )}
    </div>
  );
};

export default Shop;
