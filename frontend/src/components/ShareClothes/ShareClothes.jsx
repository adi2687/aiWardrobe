import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./sharecloths.css"; // Import the CSS file
import {
  FaWhatsapp,
  FaTwitter,
  FaEnvelope,
  FaShareAlt,
  FaInstagram,
  FaFacebook,
  FaUser,
  FaDownload,
  FaShare,
  FaEye,
} from "react-icons/fa";
import { FiCopy, FiCheck, FiLink } from "react-icons/fi";
import { motion } from "framer-motion";
import { getAuthHeaders } from "../../utils/auth";
import Toast from '../Toast/Toast';

const ShareClothes = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sharecloth, setSharedCloth] = useState([]);
  const [username, setUsername] = useState("User's");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(null); // null = checking, true/false = result

  const [skinColor, setskinColor] = useState("");
  const [age, setAge] = useState(0);
  const [gender, setGender] = useState("");
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
  const backendurl = import.meta.env.VITE_BACKEND_URL;
  // Fetch the username of the logged-in user
  // useEffect(() => {
  //   fetch(`${apiUrl}/user/profile`, {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     credentials: "include",
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setUsername(data.user.username);
  //     })
  //     .catch((error) => console.error(error));
  // }, []);

  // Fetch shared clothes for the user based on 'id'
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/share/${id}`, {
          method: "GET",
          headers: getAuthHeaders(),
          credentials: "include",
        });

        const data = await response.json();
        console.log("Share data:", data);
        
        if (!response.ok) {
          // Handle specific error messages from backend
          throw new Error(data.msg || data.error || "Failed to fetch shared clothes");
        }
        
        if (data && data.share && data.share.length > 0) {
          setSharedCloth(data.share[0].sharecloths);
          setUsername(data.username || data.share[0].username || "User's");
          // Only set age/gender if they exist (may be null for non-authenticated users)
          if (data.age) setAge(data.age);
          if (data.gender) setGender(data.gender);
        } else if (data.msg) {
          setError(data.msg);
        } else {
          setError("No shared clothes found");
        }
      } catch (error) {
        console.error("Error fetching shared clothes:", error);
        setError(error.message || "Failed to load shared clothes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, apiUrl]);

  // Generate the image using the sharecloth data
  const imageGenerate = async () => {
    if (!sharecloth || sharecloth.length === 0) return;

    setImageLoading(true);
    // Format user details for the prompt
    let userDetails = [];

    if (age) {
      userDetails.push(`age: ${age}`);
    }

    if (gender) {
      userDetails.push(`gender: ${gender}`);
    }
    if (skinColor) {
      userDetails.push(`skinColor: ${skinColor}`);
    }
    let userDetailsPrompt = "";
    if (userDetails.length > 0) {
      userDetailsPrompt = `Create an outfit appropriate for a person with the following characteristics: ${userDetails.join(
        ", "
      )}. `;
    }
    const prompt = `
    Generate an image of a mannequin wearing all of the following outfits:

    ${sharecloth}
    
    ${userDetailsPrompt}Each outfit should be clearly visible on the mannequin, and the mannequin should be standing in a neutral pose to showcase the different styles.
    `;

    try {
      const response = await fetch(`${apiUrl}/imagegenerate/generate-image`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ shareid: id, prompt: prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();

      if (data.image) {
        setImageUrl(data.image);
        
        // Automatically add watermark to the mannequin preview
        setAddingWatermark(true);
        try {
          const watermarkedUrl = await getWatermarkedImage(data.image, 'mannequin-preview');
          setImageUrlWithWatermark(watermarkedUrl);
        } catch (error) {
          console.error("Error adding watermark to preview image:", error);
          // Don't show error toast, just log it
        } finally {
          setAddingWatermark(false);
        }
      } else {
        throw new Error("No image received from server");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      setError("Failed to generate outfit preview. Please try again later.");
    } finally {
      setImageLoading(false);
    }
  };

  // Run image generation when sharecloth data is fetched
  useEffect(() => {
    if (sharecloth && sharecloth.length > 0) {
      imageGenerate();
    }
  }, [sharecloth]); // Trigger image generation when sharecloth is updated

  const [copyUrl, setCopyUrl] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const shareUrl = `${frontendUrl}/share/${id}`;

  // Copy share link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopyUrl(true);
        showToast("Link copied to clipboard!", "success");
        setTimeout(() => {
          setCopyUrl(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        showToast("Failed to copy link", "error");
      });
  };
const copyimageurl = (imageUrl) => {
  navigator.clipboard
    .writeText(`${frontendUrl}/shareimage?url=${imageUrl}&user=${username}`)
    .then(() => {
      showToast("Image URL copied to clipboard!", "success");
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
      showToast("Failed to copy image URL", "error");
    });
}
  // Toggle share options dropdown
  const toggleShareOptions = () => {
    setShowOptions((prev) => !prev);
  };

  // Share to different platforms
  const shareToSocial = (platform) => {
    let shareLink = "";
    const message = `Check out these amazing outfits shared by ${username}!`;

    switch (platform) {
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodeURIComponent(
          `${message} ${shareUrl}`
        )}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          `${message} ${shareUrl}`
        )}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}&quote=${encodeURIComponent(message)}`;
        break;
      case "instagram":
        // Instagram doesn't support direct sharing via URL
        // Show a message to the user with instructions
        showToast(
          "To share on Instagram: Copy the link and paste it in your Instagram story or post",
          "info"
        );
        copyToClipboard();
        return;
      case "email":
        shareLink = `mailto:?subject=Check out these amazing outfits&body=${encodeURIComponent(
          `${message}\n\n${shareUrl}`
        )}`;
        break;
      default:
        shareLink = shareUrl;
    }

    if (shareLink) {
      window.open(shareLink, "_blank");
    }
  };
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const shareToSocialcollection = async () => {
    // Check if user is authenticated
    if (!isUserAuthenticated) {
      showToast("Please log in to share to the community collection", "error");
      navigate('/auth');
      return;
    }

    setIsSharing(true);
    setShareSuccess(false);

    try {
      const response = await fetch(`${apiUrl}/sharetosocial/sharecollection`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ shareurl: id }),
      });

      const data = await response.json();
      console.log(data);

      // Show success state
      setShareSuccess(true);
      showToast("Collection shared to community!", "success");

      // Reset success state after 3 seconds
      setTimeout(() => {
        setShareSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error sharing collection:", error);
      showToast("Failed to share collection", "error");
    } finally {
      setIsSharing(false);
    }
  };
  const [images, setImages] = useState([]);
  const [defaultimage, setdefaultimage] = useState(""); 
  const [selectedimage, setselectedimage] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [generatedImageWithWatermark, setGeneratedImageWithWatermark] = useState("");
  const [imageUrlWithWatermark, setImageUrlWithWatermark] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [addingWatermark, setAddingWatermark] = useState(false);
  const [toast, setToast] = useState(null);
  const [viewImageModal, setViewImageModal] = useState(null);
  const [loadingSelfImages, setLoadingSelfImages] = useState(false);
  const [imageLoadStates, setImageLoadStates] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const openImageModal = (imageUrl) => {
    setViewImageModal(imageUrl);
  };

  const closeImageModal = () => {
    setViewImageModal(null);
  };
  const loaddefaultimage = async () => {
    setLoadingSelfImages(true);
    try {
      const res = await fetch(`${apiUrl}/getselfimages`, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      console.log(data);
      if (res.ok) {
        setImages(data.images || []);
        setdefaultimage(data.defaultImage || "");
      } else {
        showToast(data.msg || "Failed to load images", "error");
      }
    } catch (error) {
      console.error("Error loading images:", error);
      showToast("Failed to load your images", "error");
    } finally {
      setLoadingSelfImages(false);
    }
  };
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${apiUrl}/user/profile`, {
          method: "GET",
          headers: getAuthHeaders(),
          credentials: "include",
        });
        const data = await response.json();
        console.log("Auth check response:", data);
        // Check both response status and message
        if (response.ok && (data.message === "Success" || data.user)) {
          setIsUserAuthenticated(true);
          // Only load images if authenticated
          loaddefaultimage();
        } else {
          setIsUserAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsUserAuthenticated(false);
      }
    };

    checkAuth();
  }, [apiUrl]); 

  const setdefault = async (image) => { 
    try {
      const res = await fetch(`${apiUrl}/defaultimage`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ image: image || selectedimage }),
      });
      const data = await res.json();
      console.log(data);
      if (res.ok) {
        setdefaultimage(image || selectedimage);
        showToast("Image set as default!", "success");
      } else {
        showToast(data.msg || "Failed to set default image", "error");
      }
    } catch (error) {
      console.error("Error setting default:", error);
      showToast("Failed to set default image", "error");
    }
  }  


  const generateimage = async () => {
    if (!selectedimage) {
      showToast("Please select an image first", "error");
      return;
    }
    
    setGeneratingImage(true);
    try {
      const formData = new FormData();
      
      // Fetch the image and convert to blob
      const imageResponse = await fetch(selectedimage);
      const imageBlob = await imageResponse.blob();
       
      formData.append('image', imageBlob, 'selfimage.jpg');
      formData.append('input', sharecloth);
      formData.append("shareid",id)    
      formData.append("usercloth",selectedimage)
      
      const res = await fetch(`${apiUrl}/generate-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      const data = await res.json();
      console.log(data);
      
      if (res.ok && data.msg) {
        const imageUrl = data.msg.image || data.image;
        setGeneratedImage(imageUrl);
        
        // Automatically add watermark to the generated image
        setAddingWatermark(true);
        try {
          const watermarkedUrl = await getWatermarkedImage(imageUrl, 'virtual-tryon-result');
          setGeneratedImageWithWatermark(watermarkedUrl);
        showToast("Image generated successfully!", "success");

        } catch (error) {
          console.error("Error adding watermark to generated image:", error);
          // Don't show error toast, just log it - user can still download with watermark
        } finally {
          setAddingWatermark(false);
        }
      } else {
        showToast(data.msg || "Failed to generate image", "error");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      showToast("Failed to generate image", "error");
    } finally {
      setGeneratingImage(false);
    }
  }

  // Get watermarked image URL from backend
  const getWatermarkedImage = async (imageUrl, filename = 'outfit-image') => {
    try {
      const response = await fetch(`${apiUrl}/watermark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          imageUrl: imageUrl,
          filename: filename,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to add watermark");
      }

      return data.imageUrl;
    } catch (error) {
      console.error("Error getting watermarked image:", error);
      throw error;
    }
  }

  // Download image with logo using backend Sharp processing
  const downloadImageWithLogo = async (imageUrlParam, filename = 'outfit-image') => {
    try {
      showToast("Preparing download...", "info");
      
      // Use existing watermarked URL if available, otherwise fetch it
      let watermarkedUrl = null;
      if (imageUrlParam === generatedImage && generatedImageWithWatermark) {
        watermarkedUrl = generatedImageWithWatermark;
      } else if (imageUrlParam === imageUrl && imageUrlWithWatermark) {
        watermarkedUrl = imageUrlWithWatermark;
      }
      
      if (!watermarkedUrl) {
        watermarkedUrl = await getWatermarkedImage(imageUrlParam, filename);
      }

      // Download the watermarked image
      const watermarkedResponse = await fetch(watermarkedUrl);
      const blob = await watermarkedResponse.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${username}-outfit-ai.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast("Image downloaded with logo!", "success");
    } catch (error) {
      console.error("Error downloading image with logo:", error);
      showToast(error.message || "Failed to download image with logo", "error");
    }
  }
  return (
    <div className="share-cloths-container">
      {/* Header with username and decorative elements */}
      <div className="share-header">
        <div className="header-decoration left"></div>
        <h2>
          {username}'s <span className="accent-text">Wardrobe</span> Collection
        </h2>
        <div className="header-decoration right"></div>
      </div>

      {loading ? (
        <motion.div
          className="loading-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="loader"></div>
          <p>Loading shared outfits...</p>
        </motion.div>
      ) : error ? (
        <motion.div
          className="error-message"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p>{error}</p>
        </motion.div>
      ) : (
        <motion.div
          className="share-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Clothes list with improved styling */}
          <div className="content-card">
            <div className="card-header">
              <h3>Outfit Details</h3>
            </div>
            <div className="share-cloths-list">
              {sharecloth && sharecloth.length > 0 ? (
                <div className="outfit-description">{sharecloth}</div>
              ) : (
                <p className="no-clothes-message">
                  No outfits found in this collection
                </p>
              )}
            </div>
          </div> 

          {/* Virtual Try-On Section - Only show if authenticated */}
          {isUserAuthenticated === true && (
            <div className="content-card virtual-tryon-card">
              <div className="card-header">
                <h3>Try This Outfit On Yourself</h3>
              </div>
              <p className="instruction-text">
                Select one of your uploaded photos to see how this outfit would look on you
              </p>
              {loadingSelfImages ? (
                <div className="loading-container">
                  <div className="loader"></div>
                  <p>Loading your images...</p>
                </div>
              ) : images.length > 0 ? (
              <div className="selfimagescontainer"> 
                {images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`image-selection-wrapper ${selectedimage === image ? 'selected' : ''}`}
                    style={{
                      position: 'relative',
                      border: selectedimage === image ? '3px solid #667eea' : 'none',
                      borderRadius: '12px',
                      padding: selectedimage === image ? '5px' : '0'
                    }}
                  >
                    {imageLoadStates[index] === false ? (
                      <div className="image-loading-placeholder">
                        <div className="loader-small"></div>
                      </div>
                    ) : null}
                    <img 
                      src={image} 
                      alt={`Your photo ${index + 1}`} 
                      className="selfimages" 
                      onClick={() => setselectedimage(image)}
                      title="Click to select"
                      onLoad={() => setImageLoadStates(prev => ({...prev, [index]: true}))}
                      onError={() => setImageLoadStates(prev => ({...prev, [index]: true}))}
                      style={{display: imageLoadStates[index] === false ? 'none' : 'block'}}
                    />
                    {image === defaultimage && (
                      <div className="default-badge-share">
                        ⭐ Default
                      </div>
                    )}
                  </div>
                ))}
              </div>
              ) : (
                <div className="no-images-message">
                  <p>No images uploaded yet. Upload photos in your profile to use the virtual try-on feature.</p>
                  <button
                    onClick={() => navigate('/profile/upload')}
                    className="upload-images-btn"
                  >
                    Upload Images
                  </button>
                </div>
              )}
              {selectedimage && !loadingSelfImages && (
                <div className="action-buttons-container">
                  <button
                    onClick={generateimage}
                    disabled={generatingImage}
                    className="generate-btn"
                  >
                    {generatingImage ? (
                      <>
                        <div className="button-spinner"></div>
                        Generating...
                      </>
                    ) : (
                      '🎨 Generate Virtual Try-On'
                    )}
                  </button>
                  <button
                    onClick={() => setdefault(selectedimage)}
                    className="set-default-btn"
                  >
                    ⭐ Set as Default
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Login prompt for non-authenticated users */}
          {isUserAuthenticated === false && (
            <div className="content-card login-prompt-card">
              <div className="card-header">
                <h3>Try This Outfit On Yourself</h3>
              </div>
              <div className="login-prompt-content">
                <FaUser className="login-prompt-icon" />
                <h4>Login Required</h4>
                <p>
                  Sign in to upload your photos and see how this outfit would look on you with our virtual try-on feature.
                </p>
                <div className="login-prompt-buttons">
                  <button
                    onClick={() => navigate('/auth')}
                    className="login-prompt-btn primary"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      navigate('/auth');
                      localStorage.setItem('showSignup', 'true');
                    }}
                    className="login-prompt-btn secondary"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          )}

          {generatedImage && (
            <div className="content-card generated-result-card">
              <div className="card-header">
                <h3>✨ Your Virtual Try-On Result</h3>
              </div>
              <div className="image-wrapper-share">
                {addingWatermark && !generatedImageWithWatermark ? (
                  <div className="loading-container">
                    <div className="loader"></div>
                    <p>Generating image...</p>
                  </div>
                ) : (
                  <img 
                    src={generatedImageWithWatermark || generatedImage} 
                    alt="Generated outfit on you" 
                  />
                )}
              </div>
              <div className="image-download-container">
                <button
                  onClick={() => downloadImageWithLogo(generatedImage, 'virtual-tryon-result')}
                  className="download-image-btn"
                  title="Download image with logo"
                  disabled={addingWatermark}
                >
                  <FaDownload className="download-icon" />
                  <span>Download</span>
                </button>
                <button className="download-image-btn"
                onClick={()=>{
                  copyimageurl(generatedImageWithWatermark)
                }}>
                  <FaShare className="download-image-icon" />
                  <span>Share</span>
                </button>
                <button className="download-image-btn"
                onClick={()=>{
                  navigate(`/shareimage?url=${generatedImageWithWatermark}&user=${username}`)
                }}>
                  <FaEye className="download-image-icon" />
                  <span>View Image</span>
                </button>
              </div>
            </div>
          )}
          {/* Image preview with improved styling */}
          <div className="content-card">
            <div className="card-header">
              <h3>Mannequin Preview</h3>
            </div>
            <div className="image-wrapper-share">
              {imageLoading ? (
                <div className="loading-container">
                  <div className="loader"></div>
                  <p>Generating outfit preview...</p>
                </div>
              ) : imageUrl ? (
                <>
                  {addingWatermark && !imageUrlWithWatermark ? (
                    <div className="loading-container">
                      <div className="loader"></div>
                      <p>Adding watermark...</p>
                    </div>
                  ) : (
                    <motion.img
                      src={imageUrlWithWatermark || imageUrl}
                      alt="Generated Outfit Preview"
                      loading="lazy"
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  )}
                  <div className="image-download-container">
                    <button
                      onClick={() => downloadImageWithLogo(imageUrl, 'mannequin-preview')}
                      className="download-image-btn"
                      title="Download image with logo"
                      disabled={addingWatermark}
                    >
                      <FaDownload className="download-icon" />
                      <span>Download</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-preview">
                  <p>No preview available</p>
                </div>
              )}
            </div>
          </div>

          {/* Share to Community Collection - Only for authenticated users */}
          {isUserAuthenticated === true && (
            <div className="content-card share-to-social">
              <div className="card-header">
                <h3>Share to Community Collection</h3>
              </div>
              <div className="share-to-social-content">
                <p>
                  Add this outfit to the community collections for others to see
                  and like.
                </p>
                <button
                  className={`share-to-social-button ${
                    isSharing ? "sharing" : ""
                  } ${shareSuccess ? "success" : ""}`}
                  onClick={shareToSocialcollection}
                  disabled={isSharing || shareSuccess}
                >
                  {isSharing ? (
                    <>
                      <div className="button-spinner"></div> Sharing...
                    </>
                  ) : shareSuccess ? (
                    <>
                      <i className="fas fa-check"></i> Shared Successfully!
                    </>
                  ) : (
                    <>
                      <i className="fas fa-users"></i> Share to Community
                    </>
                  )}
                </button>
                {shareSuccess && (
                  <div className="share-success-message">
                    Your outfit has been shared to the community collection!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Share section with improved styling */}
          <div className="content-card share-section">
            <div className="card-header">
              <h3>Share This Collection</h3>
            </div>

            <div className="share-options">
              {/* Copy link button */}
              <motion.button
                onClick={copyToClipboard}
                className="copybutton"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {copyUrl ? (
                  <>
                    <FiCheck className="icon" style={{ color: "white" }} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <FiLink className="icon" style={{ color: "white" }} />
                    <span>Copy Link</span>
                  </>
                )}
              </motion.button>

              {/* Social share buttons */}
              <div className="social-buttons">
                <motion.button
                  className="share-btn whatsapp"
                  onClick={() => shareToSocial("whatsapp")}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaWhatsapp className="icon" style={{ color: "white" }} />
                </motion.button>

                <motion.button
                  className="share-btn twitter"
                  onClick={() => shareToSocial("twitter")}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaTwitter className="icon" style={{ color: "white" }} />
                </motion.button>

                <motion.button
                  className="share-btn facebook"
                  onClick={() => shareToSocial("facebook")}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaFacebook className="icon" style={{ color: "white" }} />
                </motion.button>

                <motion.button
                  className="share-btn instagram"
                  onClick={() => shareToSocial("instagram")}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaInstagram className="icon" style={{ color: "white" }} />
                </motion.button>

                <motion.button
                  className="share-btn email"
                  onClick={() => shareToSocial("email")}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaEnvelope className="icon" style={{ color: "white" }} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ShareClothes;
