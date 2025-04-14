import React, { useEffect, useState } from "react";
import "./Sellcloth.css";
import { useNavigate } from "react-router-dom";

const Sellcloth = () => {
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState("");
  const [cloth, setCloth] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clothall, setClothall] = useState([]);
  const [clothuser, setClothuser] = useState([]);
  const [price, setPrice] = useState("");
  const [uploading, setuploading] = useState(false);
  const navigate = useNavigate();

  const handlepricechange = (e) => {
    setPrice(e.target.value);
  };
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const fetchClothes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/user/allClothesSell`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch clothes data");

      const data = await response.json();
      console.log("Clothes Data:", data);
      setCloth(data);
      setClothall(data.cloths);
      setClothuser(data.usercloth);
      console.log("clothall", data.cloths);
    } catch (error) {
      console.error("Error fetching clothes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClothes();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
    } else {
      alert("Please select a valid image file");
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setuploading(true);
    if (!imageFile || !description || !price) {
      alert("Please fill all the fields");
      setuploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("description", description);
    formData.append("price", price);

    setuploading(true);
    try {
      const response = await fetch(`${apiUrl}/user/sellcloth`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      console.log("Response Data:", data);

      if (response.ok) {
        // alert("Cloth listed for sale successfully");
        setImageFile(null);
        setDescription("");
        setPrice("");
        setuploading(false);
        fetchClothes(); // Refresh list after submission
      } else {
        setuploading(false);
        alert(data.error || "Error listing clothes for sale");
      }
    } catch (error) {
      console.error("Error uploading the file:", error);
      alert("Error uploading the file");
    }
  };

  const messageuser = (username, id) => {
    navigate(`/message/${username}/${id}`);
  };
  const sold = (clothid) => {
    fetch(`${apiUrl}/user/soldcloth/delete/${clothid}`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ clothid: clothid }),
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data)
        if (data.message === "cloth deleted successfully") {
          fetchClothes();
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className="sellclothcontainer">
      <h1>Sell Your Clothes</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          id="image-input"
          onChange={handleImageChange}
          accept="image/*"
        />
        <input
          type="text"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Describe your cloth"
        />
        <input
          type="number"
          value={price}
          onChange={handlepricechange}
          placeholder="Enter price"
        />
        <button type="submit" className="upload-btn">
          {uploading ? (
            <div style={{ display: "flex", alignItems: "center",color:"white" }}>
              <h3 style={{ marginRight: "8px" }}>Uploading</h3>
              <div className="dots">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          ) : (
            <h3 style={{color:"white"}}>Upload</h3>
          )}
        </button>
      </form>
      <h2>Your Clothes</h2>
      {loading ? (
        <p>Loading...</p>
      ) : clothuser.length ? (
        <div className="sellclothlist">
          <ul> 
            {clothuser.map((item, index) => (
              <li key={index}>
                <img src={`${item.clothImage}`} alt="Cloth" width="100" />
                <p>
                  <h3>Prodcut description</h3>{item.description}</p>
                <p>
                  <h3>Product seller</h3>{item.username}</p>
                <p className="price">
                  <h4 style={{fontSize:"18px"}}>Product price</h4>{item.price}</p>
                  {/* <br /> */}
                <button
                  className="soldbutton"
                  onClick={() => sold(item._id)}
                >
                  Sold?
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p
          style={{
            fontSize: "26px",
            display: "flex",
            justifyContent: "center",
            margin: "20px",
          }}
        >
          No clothes uploaded yet
        </p>
      )}
      <h2>Available Clothes</h2>
      <div className="allcloths">
        {loading ? (
          <p>Loading clothes...</p>
        ) : (
          <ul>
            {clothall.length > 0 ? (
              clothall.map((item, index) => (
                <li key={index}>
                  <img
                    src={`${item.clothImage}`}
                    alt="Cloth"
                    width="100"
                  />
                  <p>
                    <h4>Product description:</h4>
                    {item.description}
                  </p>
                  <p>
                    <h4>Product seller</h4>
                    {item.username}
                  </p>
                  <p className="pricecloth">
                    <h4>Product price</h4>₹ {item.price}
                  </p>
                  <button onClick={() => messageuser(item.username, item._id)}>
                    Message {item.username}
                  </button>
                </li>
              ))
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "20px",
                  width: "100%",
                }}
              >
                <p style={{ fontSize: "26px" }}>
                  No clothes available for sale
                </p>
              </div>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sellcloth;
