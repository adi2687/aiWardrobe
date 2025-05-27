import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { FaSave, FaSpinner, FaCheck, FaArrowRight, FaTshirt, FaLink, FaUserAlt } from "react-icons/fa";
import { AvatarCreator } from "@readyplayerme/react-avatar-creator";

const ReadyPlayerMeAvatar = () => {
  const iframeRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
  const [avatarDetails, setAvatarDetails] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'manual'
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Check if user already has an avatar
  useEffect(() => {
    const fetchUserAvatar = async () => {
      try {
        const response = await fetch(`${backendUrl}/ar/avatar`, {
          method: "GET",
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.avatarUrl) {
            setAvatarUrl(data.avatarUrl);
            // If Cloudinary URL exists, use it instead of the original URL
            if (data.avatarCloudinaryUrl) {
              setCloudinaryUrl(data.avatarCloudinaryUrl);
            }
            // Store avatar details if available
            if (data.avatarDetails) {
              setAvatarDetails(data.avatarDetails);
            }
            setSaved(true);
          }
        }
      } catch (err) {
        console.error("Error fetching user avatar:", err);
      }
    };
    
    fetchUserAvatar();
  }, [backendUrl]);

  // State for URL copy functionality
  const [urlCopied, setUrlCopied] = useState(false);
  const [showUrlNotification, setShowUrlNotification] = useState(false);

  // Function to copy avatar URL to clipboard
  const copyAvatarUrl = () => {
    if (avatarUrl) {
      navigator.clipboard.writeText(avatarUrl)
        .then(() => {
          setUrlCopied(true);
          setTimeout(() => setUrlCopied(false), 3000); // Reset after 3 seconds
        })
        .catch(err => {
          console.error('Failed to copy URL: ', err);
          setError('Failed to copy URL to clipboard');
        });
    }
  };

  // Listen for messages from Ready Player Me iframe
  useEffect(() => {
    const handleMessage = (event) => {
      try {
        // Handle both formats of messages from RPM
        if (typeof event.data === 'string') {
          const json = JSON.parse(event.data);
          if (json.eventName === "v1.avatar.exported") {
            const url = json.data.url;
            console.log("Avatar created (string format):", url);
            setAvatarUrl(url);
            setShowUrlNotification(true);
            // Auto-focus to the avatar view
            setActiveTab('manual'); // Switch to manual tab to show the URL
            // Set the manual URL input
            setManualUrl(url);
            setIsUrlValid(true);
          }
        } else if (event.data.type === 'v1.avatar.exported') {
          const url = event.data.data.url;
          console.log("Avatar created (object format):", url);
          setAvatarUrl(url);
          setShowUrlNotification(true);
          // Auto-focus to the avatar view
          setActiveTab('manual'); // Switch to manual tab to show the URL
          // Set the manual URL input
          setManualUrl(url);
          setIsUrlValid(true);
        }
      } catch (e) {
        // Ignore irrelevant messages
        console.log("Non-JSON message or parsing error:", e);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Function to handle direct URL input
  const [manualUrl, setManualUrl] = useState('');
  const [isUrlValid, setIsUrlValid] = useState(false);
  
  const handleManualUrlInput = (e) => {
    const url = e.target.value;
    setManualUrl(url);
    
    // Validate URL as user types
    const isValid = url && (
      (url.includes('readyplayer.me') && url.endsWith('.glb')) ||
      (url.includes('models.readyplayer.me'))
    );
    
    setIsUrlValid(isValid);
  };
  
  // Handle paste event specifically
  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      setManualUrl(pastedText);
      
      // Auto-validate pasted URL
      const isValid = pastedText && (
        (pastedText.includes('readyplayer.me') && pastedText.endsWith('.glb')) ||
        (pastedText.includes('models.readyplayer.me'))
      );
      
      setIsUrlValid(isValid);
      
      // If valid URL is pasted, automatically load it
      if (isValid) {
        setTimeout(() => {
          setAvatarUrl(pastedText);
          setError(null);
        }, 500); // Small delay for better UX
      }
    }
  };
  
  const loadManualUrl = () => {
    if (isUrlValid) {
      setAvatarUrl(manualUrl);
      setError(null);
    } else {
      setError('Please enter a valid Ready Player Me avatar URL (must end with .glb)');
    }
  };
  
  // Function to save avatar URL to user profile
  const saveAvatarToProfile = async () => {
    if (!avatarUrl) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`${backendUrl}/ar/save-avatar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatarUrl }),
        credentials: "include",
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSaved(true);
        // If the backend returns a Cloudinary URL, update it
        if (data.avatarCloudinaryUrl) {
          setCloudinaryUrl(data.avatarCloudinaryUrl);
          console.log("Avatar uploaded to Cloudinary successfully");
        }
        // Store avatar details if available
        if (data.avatarDetails) {
          setAvatarDetails(data.avatarDetails);
        }
        console.log("Avatar saved successfully");
      } else {
        setError(data.message || "Failed to save avatar");
      }
    } catch (err) {
      console.error("Error saving avatar:", err);
      setError("Network error. Please try again.",err);
    } finally {
      setSaving(false);
    }
  };

  // Handle avatar creation completion
  const handleAvatarCreated = (avatarUrl) => {
    console.log('Avatar created:', avatarUrl);
    setAvatarUrl(avatarUrl);
    setError(null);
  };
  
  // Handle avatar creation error
  const handleAvatarCreationError = (error) => {
    console.error('Avatar creation error:', error);
    setError('There was an error creating your avatar. Please try again.');
  };
  
  return (
    <div className="avatar-container">
      {!avatarUrl ? (
        // Avatar Creator
        <div className="avatar-creator">
          <div className="creator-header">
            <h2>Create Your 3D Avatar</h2>
            <p>This will be used for virtual try-on of clothing items</p>
          </div>
          
          <div className="creator-tabs">
            <div className="tab-options">
              <button 
                className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
                onClick={() => setActiveTab('create')}
              >
                <FaUserAlt /> Create Avatar
              </button>
              <button 
                className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
                onClick={() => setActiveTab('manual')}
              >
                <FaLink /> Enter Avatar URL
              </button>
            </div>
            
            {activeTab === 'manual' && (
              <div className="manual-url-input">
                {showUrlNotification && (
                  <div className="url-notification">
                    <div className="notification-content">
                      <FaCheck className="notification-icon" />
                      <span>Avatar URL generated successfully!</span>
                    </div>
                    <button 
                      className={`copy-url-btn ${urlCopied ? 'copied' : ''}`}
                      onClick={copyAvatarUrl}
                    >
                      {urlCopied ? (
                        <>
                          <FaCheck className="button-icon" /> Copied!
                        </>
                      ) : (
                        <>
                          <FaLink className="button-icon" /> Copy URL
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                <p>If you already have a Ready Player Me avatar URL, paste it below:</p>
                <div className="url-input-container">
                  <input 
                    type="text" 
                    value={manualUrl}
                    onChange={handleManualUrlInput}
                    onPaste={handlePaste}
                    placeholder="https://models.readyplayer.me/...avatar.glb"
                    className={`url-input ${isUrlValid ? 'valid-url' : ''}`}
                  />
                  <button 
                    onClick={loadManualUrl}
                    className="load-url-btn"
                    disabled={!isUrlValid}
                  >
                    Load Avatar
                  </button>
                </div>
                <div className="url-instructions">
                  <ol>
                    <li>Create your avatar on Ready Player Me</li>
                    <li>Click "Next" when finished</li>
                    <li>Copy the link from the popup dialog</li>
                    <li>Paste it here to load your avatar</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
          
          {activeTab === 'create' && (
            <div className="sdk-container">
              <AvatarCreator 
                subdomain="demo"
                className="rpm-avatar-creator"
                style={{
                  width: '100%',
                  height: '600px',
                  border: 'none',
                  borderRadius: '16px'
                }}
                onAvatarExported={handleAvatarCreated}
                onError={handleAvatarCreationError}
                quickStart={true}
                bodyType="fullbody"
              />
            </div>
          )}
        </div>
      ) : (
        // Avatar Viewer 
        <div className="avatar-viewer">
          <div className="viewer-header">
            <h2>{saved ? "Your 3D Avatar" : "Preview Your Avatar"}</h2>
            <p>{saved ? "Your avatar is ready for virtual try-on" : "Save your avatar to use it for virtual try-on"}</p>
          </div>
          
          <div className="model-container">
            <Canvas camera={{ position: [0, 1, 2.5], fov: 50 }}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[2, 4, 2]} intensity={1} />
              <AvatarModel url={cloudinaryUrl || avatarUrl} />
              <OrbitControls 
                enablePan={true} 
                enableZoom={true} 
                target={[0, 1, 0]} 
                minDistance={1.5}
                maxDistance={4}
              />
            </Canvas>
          </div>
          
          <div className="avatar-actions">
            {!saved ? (
              <button 
                className="save-avatar-btn" 
                onClick={saveAvatarToProfile}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FaSpinner className="spinner" /> Saving...
                  </>
                ) : (
                  <>
                    <FaSave /> Save Avatar
                  </>
                )}
              </button>
            ) : (
              <div className="saved-message">
                <FaCheck /> Avatar Saved Successfully
              </div>
            )}
            
            <button 
              className="try-on-btn"
              onClick={() => window.location.href = "/shop"}
            >
              <FaTshirt /> Try On Clothes <FaArrowRight />
            </button>
            
            <button 
              className="new-avatar-btn"
              onClick={() => {
                setAvatarUrl(null);
                setSaved(false);
              }}
            >
              Create New Avatar
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>
          }
        </div>
      )}
    </div>
  );
};

const AvatarModel = ({ url }) => {
  // Use the URL to load the model
  const { scene } = useGLTF(url);
  
  // Center the model
  useEffect(() => {
    if (scene) {
      // Position the model to be centered
      scene.position.set(0, 0, 0);
      
      // Optional: Rotate to face camera
      scene.rotation.set(0, Math.PI, 0);
    }
  }, [scene]);
  
  return <primitive object={scene} scale={1.5} position={[0, 0, 0]} />;
};

export default ReadyPlayerMeAvatar;
