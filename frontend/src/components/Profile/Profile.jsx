import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { 
  FaShare, 
  FaUser, 
  FaLock, 
  FaSignOutAlt, 
  FaUpload, 
  FaHeart, 
  FaCalendarWeek, 
  FaTshirt, 
  FaStore, 
  FaLightbulb, 
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaLink,
  FaClipboard,
  FaInfoCircle
} from "react-icons/fa";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [wardrobeImages, setWardrobeImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imageName, setImageName] = useState("No file chosen");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [sharecloths, setshare] = useState("");
  const [userclothes, setuserclothes] = useState({});
  const [clothsForWeek, setClothesForWeek] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoadingClothes, setIsLoadingClothes] = useState(false);
  const [favourites, setFavourites] = useState([]);
  const [favoritevisible, setfavouritevivile] = useState(false);
  const [newPassword, setnewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState(0);
  const [preferences, setPreferences] = useState("");
  const [gender, setGender] = useState("");
  const [passwordshow, setpassword] = useState(false);
  const [personalinfovisible, changepersonalinfo] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [linkCopied, setLinkCopied] = useState(false);
  
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const frontedUrl = import.meta.env.VITE_FRONTEND_URL;

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchClothesForWeek();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${apiUrl}/user/profile`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const LogOut = async () => {
    try {
      await fetch(`${apiUrl}/user/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      navigate("/");
    } catch (error) {
      console.log("Couldn't logout", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageName(file.name);
    }
  };

  const handleNav = () => {
    navigate("/sellcloth");
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      showNotification("Please upload an image first!");
      return;
    }

    setIsScanning(true);

    // Upload to wardrobe
    const uploadForm = new FormData();
    uploadForm.append("wardrobeImage", imageFile);

    try {
      const uploadRes = await fetch(`${apiUrl}/user/upload-image`, {
        method: "POST",
        credentials: "include",
        body: uploadForm,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        console.error("Upload failed:", uploadData.error || "Unknown error");
        setIsScanning(false);
        showNotification("Upload failed. Please try again.");
        return;
      }

      // Set image in wardrobe state
      setWardrobeImages((prev) => [...prev, uploadData.imageUrl]);
      setImageFile(null);
      setImageName("No file chosen");
      document.getElementById("image-upload-input").value = "";

      // Send to classify
      const classifyForm = new FormData();
      classifyForm.append("images", imageFile);

      const classifyRes = await fetch(`${apiUrl}/clothid/classify`, {
        method: "POST",
        body: classifyForm,
      });

      if (!classifyRes.ok) {
        throw new Error(`HTTP error! Status: ${classifyRes.status}`);
      }

      const classifyData = await classifyRes.json();
      setuserclothes(classifyData.clothing_items);
      const clothes = classifyData.clothing_items;

      const saveRes = await fetch(`${apiUrl}/user/clothesUpload`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clothes }),
      });

      if (!saveRes.ok) {
        throw new Error(`Http error! status: ${saveRes.status}`);
      }

      showNotification("Clothing item successfully added to your wardrobe!");
      
      // Wait before redirect
      setTimeout(() => {
        setIsScanning(false);
        navigate("/wardrobe");
      }, 3000);
    } catch (error) {
      console.error("Error processing image:", error);
      setIsScanning(false);
      showNotification("Error processing image. Please try again.");
    }
  };

  const toggleClothesForWeek = () => {
    if (!isVisible) {
      setIsLoadingClothes(true);
      fetchClothesForWeek(true);
    } else {
      setIsVisible(false);
    }
  };

  const fetchClothesForWeek = (shouldShow = false) => {
    fetch(`${apiUrl}/user/clothsforweek`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setFavourites(data.favourites || []);
        setClothesForWeek(data.clothforweek || "");
        if (shouldShow) {
          setIsVisible(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching clothes for week:", error);
      })
      .finally(() => {
        setIsLoadingClothes(false);
      });
  };

  const toggleFavorites = () => {
    setfavouritevivile(!favoritevisible);
  };

  const deleteFavorite = (clothsuggestion) => {
    fetch(`${apiUrl}/user/cloth/deletefavourite`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clothsuggestion }),
    })
      .then((response) => response.json())
      .then((data) => {
        setFavourites(data.favourite || []);
        showNotification("Favorite removed successfully");
      })
      .catch((error) => {
        console.error("Error deleting favourite:", error);
        showNotification("Error removing favorite");
      });
  };

  const SharetoFriends = async (clothesToShare) => {
    try {
      const res = await fetch(`${apiUrl}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clothes: clothesToShare }),
        credentials: "include",
      });
      const data = await res.json();
      const shareLink = `${frontedUrl}/share/${data.id}`;
      setshare(shareLink);
    } catch (error) {
      console.error("Error sharing outfit:", error);
      showNotification("Error sharing outfit");
    }
  };

  const copyShareLink = () => {
    if (sharecloths) {
      navigator.clipboard.writeText(sharecloths);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const resetLink = () => {
    setshare("");
  };

  const previewOutfit = async (clothesToShare) => {
    try {
      const res = await fetch(`${apiUrl}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clothes: clothesToShare }),
        credentials: "include",
      });
      const data = await res.json();
      const shareLink = `../share/${data.id}`;
      navigate(shareLink);
    } catch (error) {
      console.error("Error previewing outfit:", error);
      showNotification("Error previewing outfit");
    }
  };

  const updatePassword = () => {
    if (!newPassword) {
      showNotification("Please enter a new password");
      return;
    }
    
    fetch(`${apiUrl}/user/updatepassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newpassword: newPassword }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === true) {
          showNotification("Password updated successfully");
          setnewPassword("");
          setpassword(false);
        }
      })
      .catch((error) => {
        console.error("Error setting new password:", error);
        showNotification("Error updating password");
      });
  };

  const updatePersonalInfo = () => {
    if (!age || !gender) {
      showNotification("Please fill in all required fields");
      return;
    }
    
    fetch(`${apiUrl}/user/updateinfo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ age, preferences, gender }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === true) {
          showNotification("Personal info updated successfully!");
          changepersonalinfo(false);
        } else {
          showNotification("Something went wrong while updating info.");
        }
      })
      .catch((error) => {
        console.error("Error updating info:", error);
        showNotification("An error occurred. Please try again later.");
      });
  };

  const showNotification = (message) => {
    // Simple alert for now, could be replaced with a nicer notification system
    alert(message);
  };

  // Navigation functions
  const navigateToWardrobe = () => navigate("/wardrobe");
  const navigateToRecommendations = () => navigate("/recommendations");
  const navigateToPlanner = () => navigate("/planner");
  const navigateToWishlist = () => navigate("/wishlist");

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Profile
          </button>
          <button 
            className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <FaUpload /> Upload
          </button>
          <button 
            className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <FaHeart /> Favorites
          </button>
          <button 
            className={`tab-button ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            <FaCalendarWeek /> Weekly
          </button>
          <button 
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaEdit /> Settings
          </button>
        </div>

        <div className="profile-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="profile-header">
                <div className="profile-avatar">
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
                </div>
                <div className="profile-details">
                  <h2 className="profile-name">{user.username}</h2>
                  <p className="profile-email">{user.email}</p>
                  {user.age && (
                    <p className="profile-info">
                      <span>Age:</span> {user.age}
                    </p>
                  )}
                  {user.gender && (
                    <p className="profile-info">
                      <span>Gender:</span> {user.gender}
                    </p>
                  )}
                  {user.preferences && (
                    <p className="profile-info">
                      <span>Style:</span> {user.preferences}
                    </p>
                  )}
                </div>
              </div>

              <div className="profile-actions">
                <button className="action-button" onClick={navigateToWardrobe}>
                  <FaTshirt /> My Wardrobe
                </button>
                <button className="action-button" onClick={navigateToRecommendations}>
                  <FaLightbulb /> Get Recommendations
                </button>
                <button className="action-button" onClick={navigateToPlanner}>
                  <FaCalendarWeek /> Weekly Planner
                </button>
                <button className="action-button" onClick={handleNav}>
                  <FaStore /> Sell Clothes
                </button>
                <button className="action-button" onClick={navigateToWishlist}>
                  <FaHeart /> Wishlist
                </button>
                <button className="action-button logout-button" onClick={LogOut}>
                  <FaSignOutAlt /> Log Out
                </button>
              </div>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="upload-section">
              <h2>Add to Your Wardrobe</h2>
              <p className="upload-info">
                Upload clothing items to expand your digital wardrobe
              </p>

              <form onSubmit={handleImageUpload} className="upload-form">
                <div className="file-input-container">
                  <label htmlFor="image-upload-input" className="file-label">
                    <FaUpload /> Choose File
                  </label>
                  <span className="file-name">{imageName}</span>
                  <input
                    type="file"
                    id="image-upload-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                </div>
                <button
                  type="submit"
                  className="upload-button"
                  disabled={isScanning || !imageFile}
                >
                  {isScanning ? "Processing..." : "Upload & Analyze"}
                </button>
              </form>

              {isScanning && (
                <div className="scanning-indicator">
                  <div className="scanning-spinner"></div>
                  <p>Analyzing your clothing item...</p>
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="favorites-section">
              <h2>Your Favorite Outfits</h2>
              
              {favourites.length > 0 ? (
                <div className="favorites-list">
                  {favourites.map((outfit, index) => (
                    <div key={index} className="favorite-item">
                      <p className="favorite-description">{outfit}</p>
                      <div className="favorite-actions">
                        <button
                          className="favorite-action-button"
                          onClick={() => SharetoFriends(outfit)}
                          title="Share outfit"
                        >
                          <FaShare />
                        </button>
                        <button
                          className="favorite-action-button"
                          onClick={() => previewOutfit(outfit)}
                          title="Preview outfit"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="favorite-action-button delete-button"
                          onClick={() => deleteFavorite(outfit)}
                          title="Remove from favorites"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>You haven't saved any favorite outfits yet.</p>
                  <button 
                    className="action-button" 
                    onClick={navigateToRecommendations}
                  >
                    <FaLightbulb /> Get Outfit Recommendations
                  </button>
                </div>
              )}

              {sharecloths && (
                <div className="share-link-container">
                  <h3>Share this outfit</h3>
                  <div className="share-link-box">
                    <input 
                      type="text" 
                      value={sharecloths} 
                      readOnly 
                      className="share-link-input"
                    />
                    <button 
                      className="copy-link-button" 
                      onClick={copyShareLink}
                      title="Copy to clipboard"
                    >
                      {linkCopied ? <FaClipboard /> : <FaLink />}
                    </button>
                    <button 
                      className="reset-link-button" 
                      onClick={resetLink}
                      title="Close"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Weekly Tab */}
          {activeTab === 'weekly' && (
            <div className="weekly-section">
              <h2>Weekly Outfit Planning</h2>
              
              <div className="weekly-actions">
                <button 
                  className="action-button" 
                  onClick={toggleClothesForWeek}
                >
                  {isVisible ? (
                    <>
                      <FaEyeSlash /> Hide Weekly Outfits
                    </>
                  ) : (
                    <>
                      <FaEye /> Show Weekly Outfits
                    </>
                  )}
                </button>
                <button 
                  className="action-button" 
                  onClick={navigateToPlanner}
                >
                  <FaCalendarWeek /> Open Weekly Planner
                </button>
              </div>

              {isVisible && (
                <div className="weekly-outfits">
                  {isLoadingClothes ? (
                    <div className="loading-indicator">
                      <div className="loading-spinner"></div>
                      <p>Loading your weekly outfits...</p>
                    </div>
                  ) : clothsForWeek ? (
                    <div className="weekly-outfit-content">
                      <h3>Your Weekly Outfit Plan</h3>
                      <p>{clothsForWeek}</p>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>No weekly outfit plan found.</p>
                      <button 
                        className="action-button" 
                        onClick={navigateToPlanner}
                      >
                        <FaCalendarWeek /> Create Weekly Plan
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>Account Settings</h2>
              
              <div className="settings-group">
                <h3><FaLock /> Change Password</h3>
                <div className="password-form">
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setnewPassword(e.target.value)}
                      className="password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="toggle-password-button"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="update-button"
                    onClick={updatePassword}
                  >
                    Update Password
                  </button>
                </div>
              </div>
              
              <div className="settings-group">
                <h3><FaInfoCircle /> Personal Information</h3>
                <div className="personal-info-form">
                  <div className="form-row">
                    <label>Age</label>
                    <input
                      type="number"
                      placeholder="Your age"
                      min={10}
                      max={80}
                      value={age || ""}
                      onChange={(e) => setAge(e.target.value)}
                      className="info-input"
                    />
                  </div>
                  
                  <div className="form-row">
                    <label>Gender</label>
                    <select
                      value={gender || ""}
                      onChange={(e) => setGender(e.target.value)}
                      className="info-input"
                    >
                      <option value="" disabled>Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-row">
                    <label>Style Preferences</label>
                    <input
                      type="text"
                      placeholder="e.g., casual, formal, streetwear"
                      value={preferences || ""}
                      onChange={(e) => setPreferences(e.target.value)}
                      className="info-input"
                    />
                  </div>
                  
                  <button
                    type="button"
                    className="update-button"
                    onClick={updatePersonalInfo}
                  >
                    Update Information
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
