import React, { useEffect, useState } from 'react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { FaTshirt, FaArrowRight, FaSpinner } from "react-icons/fa";
import './AR.css';

const SavedAvatar = () => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [localAvatarPath, setLocalAvatarPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchUserAvatar = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backendUrl}/ar/avatar`, {
          method: "GET",
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.avatarUrl) {
            setAvatarUrl(data.avatarUrl);
            // If local path exists, use it instead of the URL
            if (data.avatarLocalPath) {
              setLocalAvatarPath(`${backendUrl}${data.avatarLocalPath}`);
            }
          } else {
            setError("No avatar found. Please create one first.");
          }
        } else {
          setError("Failed to load avatar. Please try again later.");
        }
      } catch (err) {
        console.error("Error fetching user avatar:", err);
        setError("Network error. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAvatar();
  }, [backendUrl]);

  return (
    <div className="ar-container">
      <div className="ar-header">
        <h1 className="ar-title">Your 3D Avatar</h1>
        <p className="ar-subtitle">
          View your saved 3D avatar and use it for virtual try-on experiences.
        </p>
      </div>
      
      <div className="ar-content">
        {loading ? (
          <div className="loading-container">
            <FaSpinner className="spinner" />
            <p>Loading your avatar...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="create-avatar-btn"
              onClick={() => window.location.href = "/ar-try"}
            >
              Create an Avatar
            </button>
          </div>
        ) : (
          <div className="avatar-viewer">
            <div className="viewer-header">
              <h2>Your 3D Avatar</h2>
              <p>Your avatar is ready for virtual try-on</p>
            </div>
            
            <div className="model-container">
              <Canvas camera={{ position: [0, 1, 2.5], fov: 50 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[2, 4, 2]} intensity={1} />
                <AvatarModel url={localAvatarPath || avatarUrl} />
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
              <button 
                className="try-on-btn"
                onClick={() => window.location.href = "/shop"}
              >
                <FaTshirt /> Try On Clothes <FaArrowRight />
              </button>
              
              <button 
                className="new-avatar-btn"
                onClick={() => window.location.href = "/ar-try"}
              >
                Create New Avatar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AvatarModel = ({ url }) => {
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

export default SavedAvatar;

