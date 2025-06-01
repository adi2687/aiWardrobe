import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./sharecloths.css"; // Import the CSS file
import { FaWhatsapp, FaTwitter, FaEnvelope, FaShareAlt, FaInstagram, FaFacebook } from "react-icons/fa";
import { FiCopy, FiCheck, FiLink } from "react-icons/fi";
import { motion } from "framer-motion";

const ShareClothes = () => {
  const { id } = useParams();

  const [sharecloth, setSharedCloth] = useState([]);
  const [username, setUsername] = useState("User's");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  
  const [skinColor,setskinColor]=useState("")
  const [age,setAge]=useState(0)
  const [gender,setGender]=useState("")
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
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include" // This will send cookies with the request
        });

        if (!response.ok) {
          throw new Error("Failed to fetch shared clothes");
        }

        const data = await response.json();
        console.log(data)
        if (data && data.share && data.share.length > 0) {
          setSharedCloth(data.share[0].sharecloths);
          setUsername(data.share[0].username + "");
          setAge(data.age)
          setGender(data.gender)
        } else {
          setError("No shared clothes found");
        }
      } catch (error) {
        console.error("Error fetching shared clothes:", error);
        setError("Failed to load shared clothes. Please try again later.");
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
    let userDetailsPrompt = '';
    if (userDetails.length > 0) {
      userDetailsPrompt = `Create an outfit appropriate for a person with the following characteristics: ${userDetails.join(', ')}. `;
    }
    const prompt = `
    Generate an image of a mannequin wearing all of the following outfits:

    ${sharecloth}
    
    ${userDetailsPrompt}Each outfit should be clearly visible on the mannequin, and the mannequin should be standing in a neutral pose to showcase the different styles.
    `;

    try {
      const response = await fetch(
        `${apiUrl}/imagegenerate/generate-image`,
        {
          method: "POST",   
          headers: {    
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ shareid: id, prompt: prompt }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();

      if (data.image) {
        setImageUrl(data.image);
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
        setTimeout(() => {
          setCopyUrl(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        setError("Failed to copy link. Please try again.");
      });
  };

  // Toggle share options dropdown
  const toggleShareOptions = () => {
    setShowOptions(prev => !prev);
  };

  // Share to different platforms
  const shareToSocial = (platform) => {
    let shareLink = '';
    const message = `Check out these amazing outfits shared by ${username}!`;
    
    switch(platform) {
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(`${message} ${shareUrl}`)}`;        
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${message} ${shareUrl}`)}`;        
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(message)}`;        
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL
        // Show a message to the user with instructions
        alert('To share on Instagram: \n1. Copy the link (use the Copy Link button)\n2. Open Instagram\n3. Create a new story or post\n4. Paste the link in your caption or story');
        copyToClipboard();
        return;
      case 'email':
        shareLink = `mailto:?subject=Check out these amazing outfits&body=${encodeURIComponent(`${message}\n\n${shareUrl}`)}`;        
        break;
      default:
        shareLink = shareUrl;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank');
    }
  };  
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const shareToSocialcollection = async () => {
    setIsSharing(true);
    setShareSuccess(false);
    
    try {
      const response = await fetch(`${apiUrl}/sharetosocial/sharecollection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ shareurl: id }),
      });
      
      const data = await response.json();
      console.log(data);
      
      // Show success state
      setShareSuccess(true);
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setShareSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error("Error sharing collection:", error);
    } finally {
      setIsSharing(false);
    }
  }


  
  return (
    <div className="share-cloths-container">
      {/* Header with username and decorative elements */}
      <div className="share-header">
        <div className="header-decoration left"></div>
        <h2>{username}'s <span className="accent-text">Wardrobe</span> Collection</h2>
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
                <p className="no-clothes-message">No outfits found in this collection</p>
              )}
            </div>
          </div>
          
          {/* Image preview with improved styling */}
          <div className="content-card">
            <div className="card-header">
              <h3>Outfit Preview</h3>
            </div>
            <div className="image-wrapper">
              {imageLoading ? (
                <div className="loading-container">
                  <div className="loader"></div>
                  <p>Generating outfit preview...</p>
                </div>
              ) : imageUrl ? (
                <motion.img
                  src={imageUrl}
                  alt="Generated Outfit Preview"
                  loading="lazy"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              ) : (
                <div className="no-preview">
                  <p>No preview available</p>
                </div>
              )}
            </div>
          </div>
          

          <div className="content-card share-to-social">
            <div className="card-header">
              <h3>Share to Community Collection</h3>
            </div>
            <div className="share-to-social-content">
              <p>Add this outfit to the community collections for others to see and like.</p>
              <button 
                className={`share-to-social-button ${isSharing ? 'sharing' : ''} ${shareSuccess ? 'success' : ''}`}
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
                    <FiCheck className="icon" style={{ color: 'white' }} /> 
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <FiLink className="icon" style={{ color: 'white' }} /> 
                    <span>Copy Link</span>
                  </>
                )}
              </motion.button>
              
              {/* Social share buttons */}
              <div className="social-buttons">
                <motion.button 
                  className="share-btn whatsapp"
                  onClick={() => shareToSocial('whatsapp')}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaWhatsapp className="icon" style={{ color: 'white' }} />
                </motion.button>
                
                <motion.button 
                  className="share-btn twitter"
                  onClick={() => shareToSocial('twitter')}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaTwitter className="icon" style={{ color: 'white' }} />
                </motion.button>
                
                <motion.button 
                  className="share-btn facebook"
                  onClick={() => shareToSocial('facebook')}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaFacebook className="icon" style={{ color: 'white' }} />
                </motion.button>
                
                <motion.button 
                  className="share-btn instagram"
                  onClick={() => shareToSocial('instagram')}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaInstagram className="icon" style={{ color: 'white' }} />
                </motion.button>
                
                <motion.button 
                  className="share-btn email"
                  onClick={() => shareToSocial('email')}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaEnvelope className="icon" style={{ color: 'white' }} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ShareClothes;
