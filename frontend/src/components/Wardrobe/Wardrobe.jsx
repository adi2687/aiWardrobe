import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Wardrobe.css";
import { FaUser } from "react-icons/fa";

const Wardrobe = () => {
  const [user, setUser] = useState(null);
  const [wardrobeImages, setWardrobeImages] = useState([]);
  const [clothes, setClothes] = useState([]);
  const [allCloth, setAllCloth] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Track authentication status

  // Toggle states
  const [showWardrobe, setShowWardrobe] = useState(true);
  const [showClothes, setShowClothes] = useState(true);
  const [showAllClothes, setShowAllClothes] = useState(true);
  const [newcloth, setNewCloth] = useState("");

  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch wardrobe data
  useEffect(() => {
    if (isAuthenticated) {
      fetch(`${backendUrl}/user/images`, {
        method: "GET",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          setWardrobeImages(data.Wardrobe.wardrobeImg || []);
          setClothes(data.Wardrobe.wardrobeClothes || []);
          setAllCloth(data.Wardrobe.allclothes[0] || []);
        })
        .catch((error) => console.error("Error fetching images:", error));
    }
  }, [backendUrl, isAuthenticated]);

  // Fetch user profile and check authentication
  useEffect(() => {
    fetch(`${backendUrl}/user/profile`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if ( data.message === "Success") {
          setUser(data.user);
          console.log('a',data.user)
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          console.log("User not authenticated");
        }
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setIsAuthenticated(false);
      });
  }, [backendUrl]);

  // Handle image zoom functionality
  const handleImageClick = (imgSrc) => {
    setZoomedImage(imgSrc);
    setZoomScale(1);
  };
 
  const closeZoom = () => {
    setZoomedImage(null);
  };

  const handleWheelZoom = (e) => {
    e.preventDefault();
    setZoomScale((prevScale) =>
      Math.min(Math.max(prevScale + e.deltaY * -0.01, 1), 3)
    );
  };

  // Add new clothing item
  const addCloth = async () => {
    if (!newcloth.trim()) return;

    try {
      const response = await fetch(`${backendUrl}/user/addnewcloths`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clothname: newcloth,
        }),
      });

      await response.json();
      setNewCloth("");
      window.location.href = "../wardrobe";
    } catch (error) {
      console.error("Error adding cloth:", error);
    }
  };

  // If authentication status is still loading
  if (isAuthenticated === null) {
    return (
      <div className="wardrobe-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading wardrobe...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="wardrobe-container">
        <div className="auth-required">
          <FaUser className="auth-icon" />
          <h2>Authentication Required</h2>
          <p>You need to be logged in to view and manage your wardrobe.</p>
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
    <div className="wardrobe-container">
      <h1>My Wardrobe</h1>
      
      {/* Control Panel */}
      <div className="wardrobe-controls">
        <button
          className="toggle-button"
          onClick={() => setShowWardrobe(!showWardrobe)}
        >
          {showWardrobe ? "Hide Wardrobe" : "Show Wardrobe"}
        </button>

        <button
          className="toggle-button"
          onClick={() => setShowClothes(!showClothes)}
        >
          {showClothes ? "Hide Clothes List" : "Show Clothes List"}
        </button>
        
        <button
          className="toggle-button"
          onClick={() => setShowAllClothes(!showAllClothes)}
        >
          {showAllClothes ? "Hide All Clothes" : "Show All Clothes"}
        </button>
      </div>
 
      {/* Add New Clothes Section */}
      <div className="addcloths">
        <h3>Add New Clothing Item</h3>
        <input
          type="text"
          value={newcloth}
          onChange={(e) => setNewCloth(e.target.value)}
          placeholder="Enter new clothes you purchased"
        />
        <div className="addcloths-actions">
          <button onClick={addCloth}>Add Clothes</button>
          <div>or</div>
          <button onClick={() => navigate("/profile")}>Upload Photo</button>
        </div>
      </div>

      {/* Wardrobe Images Section */}
      {showWardrobe && (
        <div className="section-container">
          <h2>My Wardrobe Photos</h2>
          <div className="wardrobe-gallery">
            {wardrobeImages.length > 0 ? (
              wardrobeImages.map((img, index) => (
                <img 
                  key={index}
                  src={img}
                  alt={`Wardrobe item ${index + 1}`}
                  className="wardrobe-image"
                  onClick={() => handleImageClick(img)}
                  loading="lazy"
                />
              ))
            ) : (
              <p className="no-images">No wardrobe images uploaded yet. Add some from your profile!</p>
            )}
          </div>
        </div>
      )}

      {/* Clothes Items Section */}
      {showClothes && (
        <div className="clothes-container">
          <h3 className="clothes-title">Your Wardrobe Items</h3>
          {clothes.length > 0 ? (
            <div className="clothes-list">
              {clothes.map((item, index) => (
                <span key={index} className="clothes-item">
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="no-images">No clothes data available. Add some items to get started!</p>
          )}
        </div>
      )}
      
      {/* All Clothes Section */}
      {showAllClothes && (
        <div className="clothes">
          <h2>All Clothes</h2>
          <div className="all-clothes-content">
            {allCloth ? allCloth : "No clothes added yet"}
          </div>
        </div>
      )}
      
      {/* Scanning Message */}
      {isScanning && (
        <div className="scanning-message">
          <p>Scanning wardrobe image... Please wait.</p>
          <div className="spinner"></div>
        </div>
      )}

      {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div className="zoomed-modal" onClick={closeZoom}>
          <img
            src={zoomedImage}
            alt="Zoomed Wardrobe Item"
            className="zoomed-image"
            style={{ transform: `scale(${zoomScale})` }}
            onWheel={handleWheelZoom}
          />
        </div>
      )}
    </div>
  );
};

export default Wardrobe;