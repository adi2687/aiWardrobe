import React, { useEffect, useState } from "react";
// import AR from "../AR/AR_try"; // Import AR component

const Shop = () => {
  const [shopData, setShopData] = useState([]); // Initialize with an empty array
  const [visibleProducts, setVisibleProducts] = useState(5); // Show 5 items initially
  const modelURL="/models/main_model.glb"
  useEffect(() => {
    fetch("http://localhost:5001/shop?query=shirts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data: ", data);
        setShopData(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const loadMore = () => {
    setVisibleProducts((prev) => prev + 5); // Load 5 more products
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Shop Our Collection</h2>

      {shopData.length === 0 ? (
        <p>Loading...</p> // Show loading message when data is not available
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            justifyContent: "center",
          }}
        >
          {shopData.slice(0, visibleProducts).map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                borderRadius: "10px",
                textAlign: "center",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <img
                src={item.image_url}
                alt={item.name}
                style={{ width: "100%", height: "auto", borderRadius: "8px" }}
              />
              <h3>{item.name}</h3>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#007600",
                }}
              >
                {item.price}
              </p>
              <a
                href={item.product_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: "none",
                  color: "#fff",
                  background: "#ff9900",
                  padding: "10px 16px",
                  borderRadius: "5px",
                  display: "inline-block",
                  marginTop: "10px",
                }}
              >
                Buy Now
              </a>

              
            </div>
          ))}
        </div>
      )}

      {/* ✅ Fix Load More Button Logic */}
      {visibleProducts < shopData.length && (
        <button
          onClick={loadMore}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default Shop;
