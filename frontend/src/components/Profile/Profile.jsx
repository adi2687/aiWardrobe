import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
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
  FaInfoCircle,
  FaWarehouse,
  FaShoppingCart,
  FaUserCircle
} from "react-icons/fa";
// No modal import needed

const Profile = () => {
  const [user, setUser] = useState(null);
  const [wardrobeImages, setWardrobeImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imageName, setImageName] = useState("No file chosen");
  const [imagePreview, setImagePreview] = useState(null);
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
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Track authentication status
  // Profile setup state removed


  const [skinColor,setSkinColor]=useState("")
  const location = useLocation();
  const { tab } = useParams(); // Get tab from URL parameters

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const frontedUrl = import.meta.env.VITE_FRONTEND_URL;

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchClothesForWeek();

    // Set active tab based on URL path
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];

    // Check if the last segment is a valid tab
    if (['profile', 'favorites', 'planner', 'upload', 'settings'].includes(lastSegment)) {
      setActiveTab(lastSegment);
    } else if (pathSegments[pathSegments.length - 2] === 'profile' && !lastSegment) {
      // If we're at /profile/ with no tab specified, default to profile tab
      setActiveTab('profile');
    }
  }, [location]);  // Re-run when location changes

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${apiUrl}/user/profile`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.message === "Success") {
        setUser(data.user);
        console.log('a', data.user);
        setIsAuthenticated(true);

        // User profile details check removed
      } else {
        setIsAuthenticated(false);
        console.log("User not authenticated");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setIsAuthenticated(false);
    }
  };

  const [userdetails, setuserdetails] = useState({})
  const getuserdetails = () => {
    fetch(`${apiUrl}/user/getuserdetails`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setuserdetails(data)
        console.log(data)
      })
  }
  useEffect(() => {
    getuserdetails()
  }, [])
  const LogOut = async () => {
    try {
      const response = await fetch(`${apiUrl}/user/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        console.log("Logout successful");
        // Clear any local storage items if needed
        localStorage.removeItem("user");
        // Redirect to home page
        window.location.href = "/";
      } else {
        console.log("Logout failed");
      }
    } catch (error) {
      console.log("Couldn't logout", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageName(file.name);

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
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
      console.log("done ")
      // Set image in wardrobe state
      setWardrobeImages((prev) => [...prev, uploadData.imageUrl]);
      setImageFile(null);
      setImageName("No file chosen");
      // document.getElementById("image-upload-input").value = "";

      // Send to classify
      const classifyForm = new FormData();
      classifyForm.append("images", imageFile);

      const classifyRes = await fetch(`${apiUrl}/clothid/classify`, {
        method: "POST",
        credentials: "include",  // Add this to send cookies with the request
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

  const saveProfileInfo = async (profileData) => {
    try {
      const response = await fetch(`${apiUrl}/user/updateinfo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
        credentials: "include",
      });

      const data = await response.json();

      if (data.status === true) {
        // Update local user state with the new data
        setUser(prev => ({
          ...prev,
          age: profileData.age,
          gender: profileData.gender,
          preferences: profileData.preferences
        }));

        showNotification("Profile information saved successfully!");
        return Promise.resolve();
      } else {
        return Promise.reject("Failed to save profile information");
      }
    } catch (error) {
      console.error("Error saving profile info:", error);
      return Promise.reject(error);
    }
  };

  const updatePersonalInfo = () => {
    if (!age && !gender && !preferences && !skinColor) {
      showNotification("Please fill in all required fields");
      return;
    }

    fetch(`${apiUrl}/user/updateinfo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ age, preferences, gender,skinColor }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === true) {
          showNotification("Personal info updated successfully!");
          changepersonalinfo(false);
          window.location.reload()
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

  // If authentication status is still loading
  if (isAuthenticated === null) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="profile-container">
        <div className="auth-required">
          <FaUser className="auth-icon" />
          <h2>Authentication Required</h2>
          <p>You need to be logged in to view and manage your profile.</p>
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

  // Profile setup section removed

  return (
    <div className="profile-container">
      {/* Inline profile setup section for new users */}


      <div className="profile-card">
        <div className="profile-tabs">
          <div
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('profile');
              navigate('/profile');
            }}
          >
            <FaUser /> Profile
          </div>
          <div
            className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('favorites');
              navigate('/profile/favorites');
            }}
          >
            <FaHeart /> Favorites
          </div>
          <div
            className={`tab ${activeTab === 'planner' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('planner');
              navigate('/profile/planner');
            }}
          >
            <FaCalendarWeek /> Weekly Plan
          </div>
          <div
            className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => {
              navigate('/recommendations');
            }}
          >
            <FaLightbulb /> Recommendations
          </div>
          
          <div
            className={`tab ${activeTab === 'wardrobe' ? 'active' : ''}`}
            onClick={() => {
              navigate('/wardrobe');
            }}
          >
            <FaWarehouse /> Wardrobe
          </div>
          
          <div
            className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('upload');
              navigate('/profile/upload');
            }}
          >
            <FaUpload /> Upload
          </div>
          
          <button
            className="tab-button logout-button"
            onClick={LogOut}
          >
            <FaSignOutAlt /> Logout
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
                  {/* Only show input fields if user info is missing */}
                  {(!user.age || !user.gender) && (
                    <div className="profile-edit-fields">
                      {!userdetails.age && (
                        <input
                          type="number"
                          className="profile-input"
                          placeholder="Age"
                          value={age || ""}
                          onChange={(e) => setAge(e.target.value)}
                          min="13"
                          max="100"
                        />
                      )}
                      {!userdetails.gender && (
                        <select
                          className="profile-input"
                          value={gender || ""}
                          onChange={(e) => setGender(e.target.value)}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-binary">Non-binary</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      )}
                      {!userdetails.preferences && (
                        <select
                          className="profile-input"
                          value={preferences || ""}
                          onChange={(e) => setPreferences(e.target.value)}
                        >
                          <option value="">Select Style Preference</option>
                          <option value="Casual">Casual</option>
                          <option value="Formal">Formal</option>
                          <option value="Streetwear">Streetwear</option>
                          <option value="Vintage">Vintage</option>
                          <option value="Minimalist">Minimalist</option>
                          <option value="Bohemian">Bohemian</option>
                          <option value="Athletic">Athletic</option>
                          <option value="Business Casual">Business Casual</option>
                          <option value="Preppy">Preppy</option>
                          <option value="Eclectic">Eclectic</option>
                        </select>
                      )}
                      {!userdetails.skinColor && (
                        <select
                          className="profile-input"
                          value={skinColor || ""}
                          onChange={(e) => setSkinColor(e.target.value)}
                        >
                          <option value="">Select Skin Tone</option>
                          <option value="Fair">Fair</option>
                          <option value="Light">Light</option>
                          <option value="Medium">Medium</option>
                          <option value="Olive">Olive</option>
                          <option value="Tan">Tan</option>
                          <option value="Deep">Deep</option>
                          <option value="Dark">Dark</option>
                        </select>
                      )}
                      {(!userdetails.age || !userdetails.gender || !userdetails.preferences || !userdetails.skinColor) && <button
                        className="profile-update-btn"
                        onClick={updatePersonalInfo}
                      >
                        Update Profile
                      </button>
                      }

                      <div className="wishlist-link" onClick={()=>navigate('/wishlist')}>
                        <FaShoppingCart className="wishlist-icon"/> View Your Wishlist
                      </div>
                      <div className="ar-link" onClick={()=>navigate('/view-avatar')}>
                        <FaUserCircle className="ar-icon"/> View Your Avatar
                      </div>
                    </div>
                  )}
                  {(userdetails.age || userdetails.gender || userdetails.preferences) && (
                    <div className="profile-details-section">
                      <h3 className="profile-details-title">Personal Information</h3>
                      <div className="profile-info-message">
                        <FaInfoCircle className="info-icon" />
                        <p>This information helps us provide personalized outfit recommendations based on your style preferences and demographics.</p>
                      </div>

                      {userdetails.age && (
                        <p className="profile-info">
                          <span>Age</span> {userdetails.age}
                        </p>
                      )}
                      {userdetails.gender && (
                        <p className="profile-info">
                          <span>Gender</span> {userdetails.gender}
                        </p>
                      )}
                      {userdetails.preferences && (
                        <p className="profile-info">
                          <span>Style</span> {userdetails.preferences}
                        </p>
                      )}
                      {userdetails.skinColor && (
                        <p className="profile-info">
                          <span>Skin Tone</span> {userdetails.skinColor}
                        </p>
                      )}
                    </div>
                  )}
                </div>
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
                <div className="upload-content">
                  <div className="upload-left">
                    <div className="file-input-container">
                      <label className="file-upload-label">
                        <span className="upload-icon">👕</span>
                        <span className="upload-text">Select Clothing Item</span>
                        <input
                          type="file"
                          className="file-input"
                          accept="image/*"
                          onChange={handleImageChange}
                          id="clothing-upload"
                        />
                      </label>

                      {imageName && <div className="file-name">Selected: {imageName}</div>}
                    </div>

                    <div className="upload-instructions">
                      <h4>Tips for best results:</h4>
                      <ul>
                        <li>Use clear, well-lit photos</li>
                        <li>Capture the entire clothing item</li>
                        <li>Use a neutral background if possible</li>
                      </ul>
                    </div>

                    <button
                      type="submit"
                      className="upload-button"
                      disabled={isScanning || !imageFile}
                    >
                      {isScanning ? (
                        <>
                          <span className="processing-spinner"></span>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span className="upload-icon-btn">🔍</span>
                          <span>Upload & Analyze</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="upload-right">
                    {imagePreview ? (
                      <div className="image-preview-container">
                        <h4>Preview</h4>
                        <div className="image-preview">
                          <img src={imagePreview} alt="Preview" />
                        </div>
                      </div>
                    ) : (
                      <div className="no-preview">
                        <div className="no-preview-icon">🖼️</div>
                        <p>Image preview will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
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
          {activeTab === 'planner' && (
            <div className="weekly-section">
              <div className="section-header">
                <h2><FaCalendarWeek className="section-icon" /> Weekly Outfit Planning</h2>
                <div className="weekly-actions">
                  <button
                    className="action-button toggle-button"
                    onClick={toggleClothesForWeek}
                  >
                    {isVisible ? (
                      <>
                        <FaEyeSlash /> Hide
                      </>
                    ) : (
                      <>
                        <FaEye /> Show
                      </>
                    )}
                  </button>
                  <button
                    className="action-button primary-button"
                    onClick={navigateToPlanner}
                  >
                    <FaCalendarWeek /> Plan Your Week
                  </button>
                </div>
              </div>

              {isVisible && (
                <div className="weekly-outfits-container">
                  {isLoadingClothes ? (
                    <div className="loading-indicator">
                      <div className="loading-spinner"></div>
                      <p>Loading your weekly outfits...</p>
                    </div>
                  ) : clothsForWeek ? (
                    <div className="weekly-outfit-grid">
                      {/* Parse the clothsForWeek string and display it in a structured way */}
                      {(() => {
                        // This is a placeholder - in reality, you would parse the clothsForWeek string
                        // into a structured format based on how your data is formatted
                        const days = [
                          "Monday", "Tuesday", "Wednesday", "Thursday",
                          "Friday", "Saturday", "Sunday"
                        ];

                        return days.map((day, index) => (
                          <div className="day-outfit-card" key={day}>
                            <div className="day-header">{day}</div>
                            <div className="outfit-details">
                              {/* This would be replaced with actual outfit data */}
                              <p className="outfit-item">
                                {clothsForWeek.includes(day) ?
                                  clothsForWeek.split(day)[1]?.split(days[index + 1] || ".")[0] || "No outfit planned" :
                                  "No outfit planned"}
                              </p>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon"><FaCalendarWeek /></div>
                      <h3>No Weekly Plan Yet</h3>
                      <p>Create a personalized outfit plan for your entire week.</p>
                      <button
                        className="action-button primary-button"
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