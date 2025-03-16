import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Wardrobe.css';

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

    useEffect(() => {
        fetch("http://localhost:5000/user/images", {
            method: "GET",
            credentials: "include",
        })
        .then(response => response.json())
        .then(data => {
            setWardrobeImages(data.wardrobeImg || []);
            setClothes(data.wardrobeClothes || []);
            setAllCloth(data.allclothes || []);
        })
        .catch(error => console.error("Error fetching images:", error));
    }, []);

    useEffect(() => {
        fetch("http://localhost:5000/user/profile", {
            method: "GET",
            credentials: "include",
        })
        .then(response => response.json())
        .then(data => setUser(data.user))
        .catch(error => console.error("Error fetching profile:", error));
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
        setZoomScale((prevScale) => Math.min(Math.max(prevScale + e.deltaY * -0.01, 1), 3));
    };

    return (
        <div className="wardrobe-container">
            
            {/* Toggle Buttons */}
            <button className="toggle-button" onClick={() => setShowWardrobe(!showWardrobe)}>
                {showWardrobe ? "Hide Wardrobe" : "Show Wardrobe"}
            </button>

            <button className="toggle-button" onClick={() => setShowClothes(!showClothes)}>
                {showClothes ? "Hide Clothes" : "Show Clothes"}
            </button>

            {/* Wardrobe Images Section */}
            {showWardrobe && (
                <div className="wardrobe-gallery">
                    {wardrobeImages.length > 0 ? (
                        wardrobeImages.map((img, index) => (
                            <img
                                key={index}
                                src={`http://localhost:5000${img}`}
                                alt={`Wardrobe ${index}`}
                                className="wardrobe-image"
                                onClick={() => handleImageClick(`http://localhost:5000${img}`)}
                            />
                        ))
                    ) : (
                        <p className="no-images">No wardrobe images uploaded.</p>
                    )}
                </div>
            )}

            {/* Clothes Section */}
            {showClothes && (
                <div className="clothes-container">
                    <h3 className="clothes-title">Your Wardrobe Items</h3>
                    {clothes.length > 0 ? (
                        <div className="clothes-list">
                            {clothes.map((item, index) => (
                                <span key={index} className="clothes-item">{item}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="no-images">No clothes data available.</p>
                    )}
                </div>
            )}
            <div><h2>All clothes</h2>{allCloth}</div>
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

export default Wardrobe;
