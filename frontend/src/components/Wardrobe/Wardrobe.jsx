import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Wardrobe.css";

const Wardrobe = () => {
  const [user, setUser] = useState(null);
  const [wardrobeImages, setWardrobeImages] = useState([]);
  const [clothes, setClothes] = useState([]);
  const [allCloth, setAllCloth] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imageName, setImageName] = useState("No file chosen");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [isScanning, setIsScanning] = useState(false);

  // Toggle states
  const [showWardrobe, setShowWardrobe] = useState(true);
  const [showClothes, setShowClothes] = useState(true);

  const navigate = useNavigate();
const backendUrl=import.meta.env.VITE_BACKEND_URL
  useEffect(() => {
    fetch(`${backendUrl}/user/images`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        setWardrobeImages(data.Wardrobe.wardrobeImg || []);
        setClothes(data.Wardrobe.wardrobeClothes || []);
        setAllCloth(data.Wardrobe.allclothes[0] || []);
      })
      .catch((error) => console.error("Error fetching images:", error));
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/user/profile`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setUser(data.user))
      .catch((error) => console.error("Error fetching profile:", error));
  }, []);

  const handleImageClick = (imgSrc) => {
    setZoomedImage(imgSrc);
    setZoomScale(1);
  };
 
  const closeZoom = () => {
    setZoomedImage(null);
  };

  const handleWheelZoom = (e) => {
    e.preventDefault();
    setZoomScale((prevScale) =>
      Math.min(Math.max(prevScale + e.deltaY * -0.01, 1), 3)
    );
  };

  const [newcloth, setaddcloth] = useState("");

  const addcloth = async () => {
    if (!newcloth.trim()) {return};

    try {
      const response = await fetch(`${backendUrl}/user/addnewcloths`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clothname: newcloth,
        }),
      });

      const data = await response.json();
      console.log("Cloth added:", data);

      setaddcloth("");

      //   navigate("/wardrobe");
      window.location.href = "../wardrobe";
      // let newclothes=data.Wardrobe.allclothes[0]
      // newclothes.append(newcloth)
      // setAllCloth(newclothes);
    } catch (error) {
      console.error("Error adding cloth:", error);
    }
  };

  // useEffect(() => {
  //   addcloth();
  // }, []);







  return (
    <div className="wardrobe-container">
      {/* Toggle Buttons */}
      <button
        className="toggle-button"
        onClick={() => setShowWardrobe(!showWardrobe)}
      >
        {showWardrobe ? "Hide Wardrobe" : "Show Wardrobe"}
      </button>

      <button
        className="toggle-button"
        onClick={() => setShowClothes(!showClothes)}
      >
        {showClothes ? "Hide Clothes" : "Show Clothes"}
      </button>
      {/* {JSON.stringify(wardrobeImages)} */}
 
      {/* Wardrobe Images Section */}
      {showWardrobe && (
        <div className="wardrobe-gallery">
          {wardrobeImages.length > 0 ? (
            wardrobeImages.map((img, index) => (
              // console.log(`${backendUrl}${img}`);
              <img 
                key={index}
                src={`${img}`}
                alt={`Wardrobe ${img}`}
                className="wardrobe-image"
                onClick={() => handleImageClick(`${img}`)}
              />
              
            ))
          ) : (
            <p className="no-images">No wardrobe images uploaded.</p>
          )}
          
        </div>
      )}
      <div className="addcloths">
        <input
          type="text"
          value={newcloth}
          onChange={(e) => setaddcloth(e.target.value)}
          placeholder="Enter new clothes you purchased"
        />
        <div className="addcloths-actions">
          <button onClick={addcloth}>Add Clothes</button>
          <div>or</div>
          <button onClick={() => navigate("/profile")}>Upload Photo</button>
        </div>
      </div>

      {/* Clothes Section */}
      {showClothes && (
        <div className="clothes-container">
          <h3 className="clothes-title">Your Wardrobe Items</h3>
          {clothes.length > 0 ? (
            <div className="clothes-list">
              {clothes.map((item, index) => (
                <span key={index} className="clothes-item">
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="no-images">No clothes data available.</p>
          )}
        </div>
      )}
      <div className="clothes" style={{color:"white",fontWeight:"500px"}}>
        <h2>All clothes</h2>
        {allCloth}
      </div>
      {/* Scanning Message */}
      {isScanning && (
        <div className="scanning-message">
          Scanning wardrobe image... Please wait.
          <div className="spinner"></div>
        </div>
      )}

      {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div className="zoomed-modal" onClick={closeZoom}>
          <img
            src={zoomedImage}
            alt="Zoomed Wardrobe"
            className="zoomed-image"
            style={{ transform: `scale(${zoomScale})` }}
            onWheel={handleWheelZoom}
          />
        </div>
      )}
    </div>
  );
};
export default Wardrobe