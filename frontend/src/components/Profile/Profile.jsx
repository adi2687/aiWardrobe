import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [wardrobeImages, setWardrobeImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imageName, setImageName] = useState("No file chosen"); // New state for filename
  const [zoomedImage, setZoomedImage] = useState(null); // New state for zoomed image
  const [clothes, setClothes] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const navigate = useNavigate();
  // function getClothes(){
  const clothesUser = useEffect(() => {
    fetch("http://localhost:5000/user/images", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setWardrobeImages(data.wardrobeImg || []);
        // console.log(data)
        setClothes(data.wardrobeClothes);
        // console.log(data)
        // console.log(JSON.stringify(data.clot))
      })
      .catch((error) => console.error("Error fetching images:", error));
  }, []);
  // }
  useEffect(() => {
    fetch("http://localhost:5000/user/profile", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setUser(data.user))
      .catch((error) => console.error("Error fetching profile:", error));
  }, []);

  const LogOut = () => {
    fetch("http://localhost:5000/user/logout", {
      method: "POST",
      credentials: "include",
    })
      .then(() => (window.location.href = "/"))
      .catch((error) => console.log("Couldn't logout", error));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageName(file.name);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) return;

    const formData = new FormData();
    formData.append("wardrobeImage", imageFile);

    try {
      const response = await fetch("http://localhost:5000/user/upload-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setWardrobeImages([...wardrobeImages, data.imageUrl]);
        setImageFile(null);
        setImageName("No file chosen");
        document.getElementById("image-upload-input").value = "";
      } else {
        console.error("Upload failed:", data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }

    formData.append("images", imageFile); // Ensure correct key for Flask backend

    try {
      const response = await fetch("http://localhost:5001/classify", {
        method: "POST",
        body: formData, // ❌ Remove credentials (no need for authentication)
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Image classification result:", data);
      console.log("clothes", data.results[0].raw_response);

      // thsi is the clothesuploading route
      const clothes = data.results[0].raw_response;
      // setClothes(clothes)
      const clothesData = clothes;
      console.log("Sending clothes data:", clothesData);

      console.log("colthes data ", clothesData);
      const clothesres = await fetch(
        "http://localhost:5000/user/clothesUpload",
        {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ clothes: clothesData }),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (!clothesres.ok) {
        throw new Error(`Http error! status:${clothesres.status}`);
        // console.log
      }
      const clothesdata = await clothesres.json();
      console.log("clothes save data : ", clothesdata);
      // this is rhe dnd
    } catch (error) {
      console.error("Error classifying image:", error);
    }
  };

  const handleImageClick = (imgSrc) => {
    setZoomedImage(imgSrc);
  };

  const closeZoom = () => {
    setZoomedImage(null);
  };

  return (
    <div className="profile-container">
      {user ? (
        <div className="profile-card">
          <button className="logout-btn" onClick={LogOut}>
            Logout
          </button>

          {/* Profile Image */}
          <img
            src={
              user.profilePicture ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                user.username
              )}`
            }
            alt="Profile"
            className="profile-image"
          />

          <h2 className="profile-name">{user.username}</h2>
          <p className="profile-email">{user.email}</p>

          {/* Wardrobe Upload Section */}
          <div className="upload-section">
            <label htmlFor="image-upload-input" className="file-label">
              Choose Image
            </label>
            <input
              type="file"
              id="image-upload-input"
              onChange={handleImageChange}
              className="file-input"
            />
            <span className="file-name">{imageName}</span>
            <button onClick={handleImageUpload} className="upload-btn">
              Upload
            </button>
          </div>

          {/* Wardrobe Gallery */}
          <div className="wardrobe-gallery">
            {wardrobeImages.length > 0 ? (
              wardrobeImages.map((img, index) => (
                <img
                  key={index}
                  src={`http://localhost:5000${img}`}
                  alt={`Wardrobe ${index}`}
                  className="wardrobe-image"
                  onClick={() =>
                    handleImageClick(`http://localhost:5000${img}`)
                  }
                />
              ))
            ) : (
              <p className="no-images">No wardrobe images uploaded.</p>
            )}
          </div>

          {/* Clothes Display */}
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
              <p className="no-images">No clothes data available.</p>
            )}
          </div>
          {isScanning && (
            <div className="scanning-message">
              Scanning wardrobe image... Please wait.
              <div className="spinner"></div>
            </div>
          )}
        </div>
      ) : (
        <p className="loading-text">Loading profile...</p>
      )}

      {/* Zoomed Image Overlay */}
      {zoomedImage && (
        <div className="zoom-overlay" onClick={closeZoom}>
          <img src={zoomedImage} alt="Zoomed" className="zoomed-image" />
        </div>
      )}
    </div>
  );
};

export default Profile;
