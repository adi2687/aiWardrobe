import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [wardrobeImages, setWardrobeImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/user/images", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        // setUser(data.user);
        console.log(data)
        setWardrobeImages(data|| []); 
        // console.log(data)
      })
      .catch((error) => console.error("Error fetching profile:", error));
  }, []);

  function LogOut() {
    fetch("http://localhost:5000/user/logout", {
      method: "POST",
      credentials: "include",
    })
      .then(() => {
        window.location.href = "/";
      })
      .catch((error) => console.log("Couldn't logout", error));
  }

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
        console.log('Image:', data);

        if (response.ok) {
            setWardrobeImages([...wardrobeImages, data.imageUrl]);

            // Reset image input field
            setImageFile(null);
            document.getElementById("image-upload-input").value = ""; 
        } else {
            console.error("Upload failed:", data.error || "Unknown error");
        }
    } catch (error) {
        console.error("Error uploading image:", error);
    }
};

useEffect(() => {
  fetch("http://localhost:5000/user/profile", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      setUser(data.user);
      console.log('profile dat',data)
      // setWardrobeImages(data.user.wardrobe || []); 
    })
    .catch((error) => console.error("Error fetching profile:", error));
}, []);

  return (
    <div className="profile-container">
      {user ? (
        <div className="profile-card">
          <div className="profile-actions">
            <button className="logout-btn" onClick={LogOut}>
              Logout
            </button>
          </div>
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
          <input
  type="file"
  id="image-upload-input"  // Added an ID
  onChange={(e) => setImageFile(e.target.files[0])}
/>

            <button onClick={handleImageUpload}>Upload Wardrobe Image</button>
          </div>

          {/* Wardrobe Gallery */}
          <div className="wardrobe-gallery">
  {wardrobeImages.length > 0 ? (
    wardrobeImages.map((img, index) => (
      <img
        key={index}
        src={`http://localhost:5000${img}`} // Ensure correct path
        alt={`Wardrobe ${index}`}
        className="wardrobe-image"
      />
    ))
  ) : (
    <p>No wardrobe images uploaded.</p>
  )}
</div>

        </div>
      ) : (
        <p className="loading-text">Loading profile...</p>
      )}
    </div>
  );
};

export default Profile;
