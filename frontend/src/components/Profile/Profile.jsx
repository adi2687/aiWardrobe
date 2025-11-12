import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "./Profile.css";
import { FaUser, FaShoppingCart, FaHeart, FaSignOutAlt, FaCog, FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaShareAlt, FaCopy, FaCheck, FaTimes, FaCamera, FaUpload, FaPalette, FaTshirt, FaRedo, FaMagic, FaSave, FaCloudUploadAlt, FaSyncAlt, FaExclamationCircle, FaQuestionCircle, FaInfoCircle, FaSpinner, FaCalendarAlt, FaCalendarCheck, FaCalendarPlus, FaCalendarTimes, FaCalendarWeek, FaListAlt, FaThList,FaLightbulb,FaWarehouse, FaWhatsapp, FaFacebook, FaInstagram, FaClipboard, FaShare   } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { IoMdColorPalette } from "react-icons/io";
import { GiClothes } from "react-icons/gi";
import { MdDeleteForever, MdEditSquare } from "react-icons/md";
import { FaExternalLinkAlt } from "react-icons/fa";
import { getAuthHeaders } from '../../utils/auth'; 
import UploadPhoto from './uploadpgoto';
import ViewUploads from './ViewUploads';
// No modal import needed

const Profile = () => {
  const [user, setUser] = useState(null);
  const [wardrobeImages, setWardrobeImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageNames, setImageNames] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
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
  const [shareMessage, setShareMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Track authentication status
  const [uploading, setUploading] = useState(false);
  const [viewingUploads, setViewingUploads] = useState(false);
  // Profile setup state removed


  const [skinColor, setSkinColor] = useState("")
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
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      console.log("logging data",data)
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
  const getuserdetails = async () => {
    try {
      const response = await fetch(`${apiUrl}/user/getuserdetails`, {
        method: "GET",
        credentials: "include", // important for sending cookies (JWT/session)
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        // if status not 200–299, handle accordingly
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      setuserdetails(data);
      console.log("User details:", data);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };
  
  useEffect(() => {
    getuserdetails()
  }, [])
  const LogOut = async () => {
    try {
      const response = await fetch(`${apiUrl}/user/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (response.ok) {
        console.log("Logout successful");
        // Clear any local storage items if needed
        localStorage.removeItem("user"); 
        localStorage.removeItem("tokenlogin");
        // Redirect to home page 
        navigate("/");
      } else {
        console.log("Logout failed");
      }
    } catch (error) {
      console.log("Couldn't logout", error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(files);
      setImageNames(files.map(file => file.name));

      // Create image previews
      const previews = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(previews).then(results => {
        setImagePreviews(results);
      });
    } else {
      setImagePreviews([]);
    }
  };

  const handleNav = () => {
    navigate("/sellcloth");
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      showNotification("Please upload at least one image!");
      return;
    }

    setIsScanning(true);

    try {
      // Upload each image
      for (const file of imageFiles) {
        // Upload to wardrobe
        const uploadForm = new FormData();
        uploadForm.append("wardrobeImage", file);

        const uploadRes = await fetch(`${apiUrl}/user/upload-image`, {
          method: "POST",
          credentials: "include",
          body: uploadForm,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          console.error("Upload failed:", uploadData.error || "Unknown error");
          continue;
        }

        // Set image in wardrobe state
        setWardrobeImages((prev) => [...prev, uploadData.imageUrl]);

        // Send to classify
        const classifyForm = new FormData();
        classifyForm.append("images", file);

        const classifyRes = await fetch(`${apiUrl}/clothid/classify`, {
          method: "POST",
          credentials: "include",
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
          headers: getAuthHeaders(),
          body: JSON.stringify({ clothes }),
        });

        if (!saveRes.ok) {
          throw new Error(`Http error! status: ${saveRes.status}`);
        }
      }

      showNotification("Clothing items successfully added to your wardrobe!");
      setImageFiles([]);
      setImageNames([]);
      setImagePreviews([]);

      // Wait before redirect
      setTimeout(() => {
        setIsScanning(false);
        navigate("/wardrobe");
      }, 3000);
    } catch (error) {
      console.error("Error processing images:", error);
      setIsScanning(false);
      showNotification("Error processing images. Please try again.");
    }
  };

  const fetchClothesForWeek = (shouldShow = false) => {
    fetch(`${apiUrl}/user/clothsforweek`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
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

  const toggleClothesForWeek = () => {
    if (!isVisible) {
      setIsLoadingClothes(true);
      fetchClothesForWeek(true);
    } else {
      setIsVisible(false);
    }
  };

  const toggleFavorites = () => {
    setfavouritevivile(!favoritevisible);
  };

  const deleteFavorite = (clothsuggestion) => {
    fetch(`${apiUrl}/user/cloth/deletefavourite`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders(),
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
    // console.log(clothesToShare)
    try {
      const res = await fetch(`${apiUrl}/share`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ clothes: clothesToShare }),
        credentials: "include",
      });
      const data = await res.json();
      const shareLink = `${frontedUrl}/share/${data.id}`;
      console.log(shareLink)
      setshare(shareLink);
    } catch (error) {
      console.error("Error sharing outfit:", error);
      showNotification("Error sharing outfit");
    }
  };

  const copyToClipboard = () => {
    if (sharecloths) {
      navigator.clipboard.writeText(sharecloths);
      setLinkCopied(true);
      // setShareMessage("Link copied to clipboard!");  
      setTimeout(() => {
        setLinkCopied(false);
        setShareMessage("");
      }, 2000);
    }
  };

  const shareToSocial = (platform) => {
    if (!sharecloths) return;

    const shareUrls = {
      whatsapp: `https://wa.me/?text=Hey check this outfit I got from outfit-AI${encodeURIComponent(sharecloths)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharecloths)}`,
      instagram: `https://www.instagram.com/?url=${encodeURIComponent(sharecloths)}`
    };

    window.open(shareUrls[platform], '_blank');
  };

  const resetLink = () => {
    setshare("");
  };

  const previewOutfit = async (clothesToShare) => {
    try {
      const res = await fetch(`${apiUrl}/share`, {
        method: "POST",
        headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
      body: JSON.stringify({ age, preferences, gender, skinColor }),
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
            <FaSignOutAlt />
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
                      user.profileImageURL ||
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

                      <div className="shortcutlinks">
                        <div>
                          <div className="wishlist-link" onClick={() => navigate('/wishlist')}>
                            <FaShoppingCart className="wishlist-icon" /> View Your Wishlist
                          </div>
                          <div className="ar-link" onClick={() => navigate('/profile/upload')}>
                            <FaTshirt className="wishlist-icon" /> Upload clothes images
                          </div>
                           <div className="wishlist-link" onClick={() => setUploading(true)}>
                            <FaCalendarWeek className="wishlist-icon" /> Upload your photo
                          </div>
                        </div>
                        <div>
                          <div className="wishlist-link" onClick={() => navigate('/recommendations')}>
                            <FaLightbulb className="wishlist-icon" /> Recommendations
                          </div>
                          <div className="wishlist-link" onClick={() => navigate('/profile/favorites')}>
                            <FaHeart className="wishlist-icon" /> Favourites
                          </div> 
                           <div className="wishlist-link" onClick={() => setViewingUploads(true)}>
                            <FaShoppingCart className="wishlist-icon" /> View Your Uploads
                          </div>
                        </div> 
                        
                      </div>
                    </div>
                  )}
                  {uploading && <UploadPhoto onClose={() => setUploading(false)} />}
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
                        <span className="upload-text">Select Clothing Items</span>
                        <input
                          type="file"
                          className="file-input"
                          accept="image/*"
                          onChange={handleImageChange}
                          id="clothing-upload"
                          multiple
                        />
                      </label>

                      {imageNames.length > 0 && (
                        <div className="file-names">
                          {imageNames.map((name, index) => (
                            <div key={index} className="file-name">Selected: {name}</div>
                          ))}
                        </div>
                      )}
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
                      disabled={isScanning || imageFiles.length === 0}
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
                    {imagePreviews.length > 0 && (
                      <div className="image-previews">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="image-preview-item">
                            <img src={preview} alt={`Preview ${index + 1}`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </form>

              {isScanning && (
                <div className="scanning-indicator">
                  <div className="scanning-spinner"></div>
                  <p>Analyzing your clothing items...</p>
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
                  <div className="share-header">
                    <h3>Share Your Outfit</h3>
                    <button
                      className="close-share-button"
                      onClick={resetLink}
                      title="Close"
                    >
                      ×
                    </button>
                  </div>
                  <div className="share-content">
                    <div className="share-link-box">
                      <input
                        type="text"
                        value={sharecloths}
                        readOnly
                        className="share-link-input"
                        placeholder="Share link will appear here"
                      />
                      <button
                        className="copy-link-button"
                        onClick={copyToClipboard}
                        title="Copy to clipboard"
                      >
                        {linkCopied ? (
                          <>
                            <FaClipboard /> Copied!
                          </>
                        ) : (
                          <>
                            <FaLink /> Copy Link
                          </>
                        )}
                      </button>
                    </div>
                    <div className="share-actions">
                      <button
                        className="preview-button"
                        onClick={() => previewOutfit(sharecloths)}
                      >
                        <FaEye /> Preview Outfit
                      </button>
                    </div>
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

              {sharecloths ? (
                <div className="sharedweekly">
                  {/* <h4 className="sharedweekly-title">Your Sharable Outfit</h4> */}
                  <div className="share-content" >
                    <a href={sharecloths} target="_blank" rel="noopener noreferrer" className="share-link-anchor">
                      <div className="share-link-info">
                        {/* <span className="share-display-name">{'share/'+sharecloths.split('/').pop()}</span> */}
                        <span className="share-full-url">
                          <FiExternalLink className="external-link-icon-inline" /> 
                          {sharecloths}
                        </span>
                      </div>
                    </a>
                    <div className="share-actions">
                      <div className="icons">
                        <FaWhatsapp 
                          style={{color: "green"}} 
                          onClick={() => shareToSocial('whatsapp')}
                          title="Share on WhatsApp"
                        />
                        <FaFacebook 
                          style={{color: "blue"}} 
                          onClick={() => shareToSocial('facebook')}
                          title="Share on Facebook"
                        />
                        <FaInstagram 
                          style={{color: "#E1306C"}} 
                          onClick={() => shareToSocial('instagram')}
                          title="Share on Instagram"
                        />
                      </div>
                      <div className="copy-section">
                        <FaClipboard 
                          onClick={copyToClipboard}
                          className={linkCopied ? "copied" : ""}
                          title="Copy to clipboard"
                        />
                        {shareMessage && <span className="copy-message" >{shareMessage}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div></div>
              )}


              {isVisible && (
                <div className="weekly-outfits-container">
                  {isLoadingClothes ? (
                    <div className="loading-indicator">
                      <div className="loading-spinner"></div>
                      <p>Loading your weekly outfits...</p>
                    </div>
                  ) : clothsForWeek ? (
                    <div className="weekly-outfit-grid">
                      {(() => {
                        // Parse the clothsForWeek string into a structured format
                        const parseWeeklyOutfits = (text) => {
                          const outfits = [];
                          const lines = text.split('\n');

                          lines.forEach(line => {
                            const trimmedLine = line.trim();
                            if (!trimmedLine) return;

                            // Match date patterns like "2025-06-05" or "2025-06-06 - 2025-06-11"
                            const dateMatch = trimmedLine.match(/^(\d{4}-\d{2}-\d{2})(?:\s*-\s*(\d{4}-\d{2}-\d{2}))?:\s*(.+)/);

                            if (dateMatch) {
                              const [_, startDate, endDate, outfitDetails] = dateMatch;
                              outfits.push({
                                startDate: new Date(startDate),
                                endDate: endDate ? new Date(endDate) : new Date(startDate),
                                details: outfitDetails.trim()
                              });
                            }
                          });

                          return outfits;
                        };

                        const weeklyOutfits = parseWeeklyOutfits(clothsForWeek);

                        return weeklyOutfits.map((outfit, index) => {
                          const formatDate = (date) => {
                            return date.toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric'
                            });
                          };

                          const dateRange = outfit.startDate.getTime() === outfit.endDate.getTime()
                            ? formatDate(outfit.startDate)
                            : `${formatDate(outfit.startDate)} - ${formatDate(outfit.endDate)}`;

                          return (
                            <div className="day-outfit-card" key={index}>

                              <div className="day-header">{dateRange}</div>
                              <div className="outfit-details">
                                <div className="outfit-items">
                                  {outfit.details.split(',').map((item, idx) => (
                                    <p key={idx} className="outfit-item">
                                      {item.trim()}
                                      {/* {item.trim()} */}
                                    </p>

                                  ))}
                                  {/* {outfit.details} */}
                                  <div className="weeklybuttons">
                                    <button onClick={() => previewOutfit(outfit.details)} className="previewbuttonweekly">Preview</button>
                                    <button onClick={() => SharetoFriends(outfit.details)} className="previewbuttonweekly">Share</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        });
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
      {viewingUploads && <ViewUploads onClose={() => setViewingUploads(false)} />}
    </div>
  );
};

export default Profile;