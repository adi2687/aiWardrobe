import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [wardrobeImages, setWardrobeImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imageName, setImageName] = useState("No file chosen"); 
  const [zoomedImage, setZoomedImage] = useState(null); 
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();
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

  // const SellCloth=()=>{
    // const navigate=useNavigate()
    const handleNav=()=>{navigate("/sellcloth")}
  // }
  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) alert("Upload an image !");

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
        setIsScanning(true); // Start scanning

    setTimeout(() => {
        setIsScanning(false); // Stop scanning
        navigate('/wardrobe'); // Navigate only after 5s
    }, 5000);
      } else {
        console.error("Upload failed:", data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }

    formData.append("images", imageFile); 

    try {
      const response = await fetch("http://localhost:5001/classify", {
        method: "POST",
        body: formData,
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

      const clothes = data.results[0].raw_response;
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
      }
      const clothesdata = await clothesres.json();
      console.log("clothes save data : ", clothesdata);
    } catch (error) {
      console.error("Error classifying image:", error);
    }
  };


  

  return (
    <div className="profile-container">
  {user ? (
    <div className="profile-card">
<button className="logout" onClick={LogOut}>Logout</button>
      <div className="profile-header">
        <img
          src={
            user.profilePicture ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username)}`
          }
          alt="Profile"
          className="profile-image"
        />
        
        <div className="user-info">
          <h2 className="profile-name">{user.username}</h2>
          <p className="profile-email">{user.email}</p>
          <div className="sellClothes">
            <button onClick={handleNav}>Sell old Clothes</button>
          </div>
        </div>
        
      </div>

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
        {imageName && <span className="file-name">{imageName}</span>}
        <button onClick={handleImageUpload} className="upload-btn" disabled={!imageName}>
          {isScanning ? "Uploading..." : "Upload"}
        </button>
      </div>

      {isScanning && (
        <div className="loading-screen">
          <p>Uploading & Scanning...</p>
        </div>
      )}
    </div>
  ) : (
    <p className="loading-text">Loading profile... <br />Try logging or Signing Up</p>
  )}

  {zoomedImage && (
    <div className="zoom-overlay" onClick={closeZoom}>
      <img src={zoomedImage} alt="Zoomed" className="zoomed-image" />
    </div>
  )}
</div>


  );
};

export default Profile;
