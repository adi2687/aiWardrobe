import React, { useEffect, useState } from "react";
import "./Sellcloth.css";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaCheckCircle, FaTimesCircle, FaShoppingBag, FaTag, FaMoneyBillWave, FaCommentAlt, FaUser } from "react-icons/fa";

const Sellcloth = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");
  const [cloth, setCloth] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clothall, setClothall] = useState([]);
  const [clothuser, setClothuser] = useState([]);
  const [price, setPrice] = useState("");
  const [uploading, setuploading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Track authentication status
  const [user, setUser] = useState(null);
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

  // Fetch user profile and check authentication
  useEffect(() => {
    fetch(`${apiUrl}/user/profile`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Success") {
          setUser(data.user);
          console.log('a', data.user);
          setIsAuthenticated(true);
          fetchClothes(); // Only fetch clothes if authenticated
        } else {
          setIsAuthenticated(false);
          console.log("User not authenticated");
        }
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setIsAuthenticated(false);
      });
  }, [apiUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
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
        setImagePreview(null);
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

  // If authentication status is still loading
  if (isAuthenticated === null) {
    return (
      <div className="sellclothcontainer">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading marketplace...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="sellclothcontainer">
        <div className="auth-required">
          <FaUser className="auth-icon" />
          <h2>Authentication Required</h2>
          <p>You need to be logged in to buy or sell clothes in the marketplace.</p>
          <div className="auth-buttons">
            <button className="primary-button" onClick={() => navigate('/auth')}>
              Log In
            </button>
            <button className="secondary-button" onClick={() => {
              navigate('/auth');
              // This will trigger the signup form in the Auth component
              localStorage.setItem('showSignup', 'true');
            }}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sellclothcontainer">
      <div className="sell-header">
        <h1><FaShoppingBag className="header-icon" /> Sell Your Clothes</h1>
        <p className="sell-subtitle">List your unused clothes and earn money</p>
      </div>
      
      <div className="upload-section">
        <form onSubmit={handleSubmit}>
          <div className="file-upload-container">
            {!imagePreview ? (
              <label htmlFor="image-input" className="file-upload-label">
                <FaUpload className="upload-icon" />
                <span>Upload Image</span>
                <span className="upload-hint">Click to select a photo of your item</span>
              </label>
            ) : (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button 
                  type="button" 
                  className="remove-image-btn"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  <FaTimesCircle />
                </button>
              </div>
            )}
            <input
              type="file"
              id="image-input"
              onChange={handleImageChange}
              accept="image/*"
              className="file-input"
            />
          </div>
          
          <div className="input-group">
            <FaTag className="input-icon" />
            <input
              type="text"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Describe your item (brand, condition, size, etc.)"
              className="text-input"
            />
          </div>
          
          <div className="input-group">
            <FaMoneyBillWave className="input-icon" />
            <input
              type="number"
              value={price}
              onChange={handlepricechange}
              placeholder="Enter price (₹)"
              className="text-input"
            />
          </div>
          
          <button type="submit" className="upload-btn" disabled={uploading}>
            {uploading ? (
              <div className="uploading-container">
                <div className="upload-spinner"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              <>
                <FaUpload className="btn-icon" />
                <span>List for Sale</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="section-divider"></div>
      
      <div className="your-clothes-section">
        <h2><span className="section-icon">👕</span> Your Listed Items</h2>
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your items...</p>
          </div>
        ) : clothuser.length ? (
          <div className="sellclothlist">
            <ul>
              {clothuser.map((item, index) => (
                <li key={index} className="item-card your-item">
                  <div className="item-image-container">
                    <img src={`${item.clothImage}`} alt="Clothing item" />
                  </div>
                  <div className="item-details">
                    <div className="item-description">
                      <h3>Description</h3>
                      <p>{item.description}</p>
                    </div>
                    <div className="item-seller">
                      <h3>Seller</h3>
                      <p>{item.username}</p>
                    </div>
                    <div className="item-price">
                      <h3>Price</h3>
                      <p>₹ {item.price}</p>
                    </div>
                    <button
                      className="sold-button"
                      onClick={() => sold(item._id)}
                    >
                      <FaCheckCircle className="button-icon" /> Mark as Sold
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>You haven't listed any clothes for sale yet</p>
            <p className="empty-subtitle">Upload your first item using the form above</p>
          </div>
        )}
      </div>
      
      <div className="section-divider"></div>
      
      <div className="marketplace-section">
        <h2><span className="section-icon">🛍️</span> Marketplace</h2>
        <p className="section-subtitle">Browse items from other sellers</p>
        
        <div className="allcloths">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading marketplace items...</p>
            </div>
          ) : (
            <ul className="marketplace-grid">
              {clothall.length > 0 ? (
                clothall.map((item, index) => (
                  <li key={index} className="item-card marketplace-item">
                    <div className="item-image-container">
                      <img src={`${item.clothImage}`} alt="Clothing item" />
                    </div>
                    <div className="item-details">
                      <div className="item-description">
                        <h3>Description</h3>
                        <p>{item.description}</p>
                      </div>
                      <div className="item-seller">
                        <h3>Seller</h3>
                        <p>{item.username}</p>
                      </div>
                      <div className="item-price marketplace-price">
                        <h3>Price</h3>
                        <p>₹ {item.price}</p>
                      </div>
                      <button 
                        className="message-button"
                        onClick={() => messageuser(item.username, item._id)}
                      >
                        <FaCommentAlt className="button-icon" /> Message Seller
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🏪</div>
                  <p>No items available in the marketplace</p>
                  <p className="empty-subtitle">Be the first to list your items for sale!</p>
                </div>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sellcloth;
