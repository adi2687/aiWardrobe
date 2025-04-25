import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./sharecloths.css"; // Import the CSS file
import { FaWhatsapp, FaTwitter, FaEnvelope, FaLink, FaShareAlt } from "react-icons/fa";
import { FiCopy, FiCheck } from "react-icons/fi";

const ShareClothes = () => {
  const { id } = useParams();

  const [sharecloth, setSharedCloth] = useState([]);
  const [username, setUsername] = useState("User's");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
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
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch shared clothes");
        }

        const data = await response.json();
        if (data && data.share && data.share.length > 0) {
          setSharedCloth(data.share[0].sharecloths);
          setUsername(data.share[0].username + "");
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

    const prompt = `
    Generate an image of a mannequin wearing all of the following outfits:

    ${sharecloth} 
    
    Each outfit should be clearly visible on the mannequin, and the mannequin should be standing in a neutral pose to showcase the different styles.
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
      case 'email':
        shareLink = `mailto:?subject=Check out these amazing outfits&body=${encodeURIComponent(`${message}

${shareUrl}`)}`;
        break;
      default:
        shareLink = shareUrl;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank');
    }
  };

  return (
    <div className="share-cloths-container">
      {/* Header with username */}
      <h3>{username} Wardrobe Collection</h3>
      
      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading shared outfits...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Clothes list */}
          <div className="share-cloths-list">
            {sharecloth && sharecloth.length > 0 ? (
              sharecloth
            ) : (
              <p className="no-clothes-message">No outfits found in this collection</p>
            )}
          </div>
          
          {/* Image preview */}
          <div className="imagecontainer">
            <h3>Outfits Preview</h3>
            {imageLoading ? (
              <div className="loading-container">
                <div className="loader"></div>
                <p>Generating outfit preview...</p>
              </div>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt="Generated Outfit Preview"
                loading="lazy"
              />
            ) : (
              <p>No preview available</p>
            )}
          </div>
          
          {/* Share section */}
          <div className="share-section">
            {/* Copy link button */}
            <button onClick={copyToClipboard} className="copybutton">
              {copyUrl ? (
                <>
                  <FiCheck className="icon" /> 
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FiCopy className="icon" /> 
                  <span>Copy Link</span>
                </>
              )}
            </button>
            
            {/* Share dropdown */}
            <div className="share-wrapper">
              <button
                className="share-button"
                onClick={toggleShareOptions}
              >
                <FaShareAlt className="icon" style={{ fontSize: '1.3rem' }} />
                <span>Share Collection</span>
              </button>

              {showOptions && (
                <div className="share-dropdown">
                  <button 
                    className="share-btn whatsapp"
                    style={{backgroundColor:"#25D366"}}
                    onClick={() => shareToSocial('whatsapp')}
                  >
                    <FaWhatsapp className="icon" />
                    <span>WhatsApp</span>
                  </button>
                
                  <button 
                    className="share-btn twitter"
                    style={{backgroundColor:"#1DA1F2"}}
                    onClick={() => shareToSocial('twitter')}
                  >
                    <FaTwitter className="icon" />
                    <span>Twitter</span>
                  </button>
                
                  <button 
                    className="share-btn email"
                    style={{backgroundColor:"#FF6F61"}}
                    onClick={() => shareToSocial('email')}
                  >
                    <FaEnvelope className="icon" />
                    <span>Email</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareClothes;
