import React, { useEffect } from "react";

const Shop = () => {
  useEffect(() => {
    fetch("http://localhost:5001/shop?query=shirts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => console.log("fetcheddata ", data))
      .catch((error) => console.error(error));
  }, []);

  return <div>sjop</div>;
};

export default Shop;
