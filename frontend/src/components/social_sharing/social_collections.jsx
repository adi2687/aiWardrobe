import React, { useState, useEffect } from 'react';
import './social_collection.css';
import { FaUser, FaTshirt, FaHeart, FaShare, FaSpinner, FaExclamationTriangle, FaTimes, FaExpand, FaThumbsUp } from 'react-icons/fa';

const SocialCollections = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [link, setlink] = useState("");
    const [copyNotification, setCopyNotification] = useState(false);
    const [likedCollections, setLikedCollections] = useState([]);
    const [alreadyLikedCollections, setAlreadyLikedCollections] = useState([]);
    const apiUrl = import.meta.env.VITE_BACKEND_URL;
    
    // Open image viewer with the selected image
    const openImageViewer = (imageUrl) => {
        setSelectedImage(imageUrl);
        setViewerOpen(true);
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
    };

    // Close image viewer
    const closeImageViewer = () => {
        setViewerOpen(false);
        setSelectedImage(null);
        // Re-enable scrolling
        document.body.style.overflow = 'auto';
    };

    // Function to fetch collections - extracted for reuse
    const fetchCollections = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/sharetosocial/social`);
            const data = await response.json();
            
            console.log('Response data:', data);
            
            if (data.share && Array.isArray(data.share)) {
                setCollections(data.share);
            } else {
                console.warn('Data is not in expected format:', data);
                setCollections([]);
            }
            setError(null);
        } catch (error) {
            console.error('Error fetching collections:', error);
            setError('Failed to load collections. Please try again later.');
            setCollections([]);
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch collections on component mount
    useEffect(() => {
        fetchCollections();
    }, []);

    // Handle liking a collection
    const handleLike = (collectionId) => {
        // Check if collection is already liked
        if (likedCollections.includes(collectionId)) {
            // Unlike the collection
            setLikedCollections(likedCollections.filter(id => id !== collectionId));
        } else {
            // Like the collection
            setLikedCollections([...likedCollections, collectionId]);
        }
    };

    useEffect(() => {
        const savedLikes = localStorage.getItem('likedCollections');
        if (savedLikes) {
            setLikedCollections(JSON.parse(savedLikes));
        }
    }, []);

    // Save liked collections to localStorage when they change
    useEffect(() => {
        localStorage.setItem('likedCollections', JSON.stringify(likedCollections));
    }, [likedCollections]);

    // Handle escape key press to close the image viewer
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && viewerOpen) {
                closeImageViewer();
            }
        };

        window.addEventListener('keydown', handleEscKey);
        return () => {
            window.removeEventListener('keydown', handleEscKey);
        };
    }, [viewerOpen]);




    const likecollection = (collectionId) => {
        console.log('Liking collection with ID:', collectionId);
        
        // Check if already liked
        if (alreadyLikedCollections.includes(collectionId)) {
            console.log('Already liked this collection');
            return; // Don't do anything if already liked
        }
        
        fetch(`${apiUrl}/sharetosocial/likecollection`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials:"include",
            body: JSON.stringify({ id: collectionId })
        })
        .then(response => {
            if (response.status === 400) {
                // Already liked (this shouldn't happen if our UI is in sync, but just in case)
                return response.json().then(data => {
                    console.log('Already liked:', data);
                    // Add to already liked collections
                    setAlreadyLikedCollections(prev => [...prev, collectionId]);
                    return { alreadyLiked: true, likeCount: data.likeCount };
                });
            } else if (!response.ok) {
                console.error('Server responded with status:', response.status);
                throw new Error('Failed to like collection');
            }
            return response.json();
        })
        .then(data => {
            console.log('Like response:', data);
            
            // If successfully liked or already liked
            if (data.success || data.alreadyLiked) {
                // Add to already liked collections
                setAlreadyLikedCollections(prev => [...prev, collectionId]);
                // Refresh collections to update like count
                fetchCollections();
            }
        })
        .catch(error => {
            console.error('Error liking collection:', error);
            setError('Failed to like collection. Please try again.');
        });
    }
    return (
        <div className="social-collections-container">
            {/* Image Viewer Modal */}
            {viewerOpen && selectedImage && (
                <div className="image-viewer-modal" onClick={closeImageViewer}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={closeImageViewer}>
                            <FaTimes />
                        </button>
                        <img src={selectedImage} alt="Expanded view" className="modal-image" />
                    </div>
                </div>
            )}
            
            <div className="social-header">
                <h1>Community Collections</h1>
                <p>Discover outfit collections shared by the community</p>
            </div>
            
            {loading ? (
                <div className="loading-container">
                    <FaSpinner className="spinner-icon" />
                    <p>Loading amazing collections...</p>
                </div>
            ) : error ? (
                <div className="error-container">
                    <FaExclamationTriangle className="error-icon" />
                    <p>{error}</p>
                </div>
            ) : collections.length > 0 ? (
                <div className="collections-grid">
                    {collections.map((collection, index) => (
                        <div key={collection._id || index} className="collection-card">
                            {collection.image ? (
                                <div className="collection-image" onClick={() => openImageViewer(collection.image)}>
                                    <img src={collection.image} alt="Outfit Collection" />
                                    <div className="image-overlay">
                                        <FaExpand className="expand-icon" />
                                    </div>
                                </div>
                            ) : (
                                <div className="collection-image placeholder">
                                    <FaTshirt className="placeholder-icon" />
                                </div>
                            )}
                            
                            <div className="collection-info">
                                <div className="collection-header">
                                    <div className="user-info">
                                        <FaUser className="user-icon" />
                                        <h3>{collection.username || 'Unknown User'}</h3>
                                        {/* <p>{collection.shareid}</p> */}
                                    </div>
                                    <div className="collection-actions">
                                        <button 
                                            className={`action-button thumbs-up ${alreadyLikedCollections.includes(collection.shareid) ? 'already-liked' : ''}`}
                                            onClick={() => likecollection(collection.shareid)}
                                            disabled={alreadyLikedCollections.includes(collection.shareid)}
                                            title={alreadyLikedCollections.includes(collection.shareid) ? 'You already liked this' : 'Like this collection'}
                                        >
                                            <FaThumbsUp/>
                                            <span className="like-count">{collection.like || 0}</span>
                                        </button>
                                        <button 
                                            className={`action-button like ${likedCollections.includes(collection._id || collection.shareid) ? 'liked' : ''}`}
                                            onClick={() => handleLike(collection._id || collection.shareid)}
                                            title={likedCollections.includes(collection._id || collection.shareid) ? 'Unlike' : 'Like'}
                                        >
                                            <FaHeart />
                                        </button>
                                        <button 
                                            className="action-button share" 
                                            onClick={() => setlink(collection.shareid)}
                                            title="Share"
                                        >
                                            <FaShare />
                                        </button>
                                    </div>
                                </div>
                                <div className="collection-content">
                                    <p className="collection-description">
                                        {collection.sharecloths || 'No description available'}
                                    </p>
                                    {link === collection.shareid && (
                                        <div className="share-link-container">
                                            <p className="share-link">{`${apiUrl}/share/${link}`}</p>
                                            <button 
                                                className="copy-link-button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${apiUrl}/share/${link}`);
                                                    setCopyNotification(true);
                                                    setTimeout(() => setCopyNotification(false), 2000);
                                                }}
                                            >
                                                {copyNotification && link === collection.shareid ? 'Copied!' : 'Copy'}
                                            </button>
                                            {copyNotification && link === collection.shareid && (
                                                <div className="copy-notification">
                                                    <span>Link copied to clipboard!</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <FaTshirt className="empty-icon" />
                    <h2>No collections yet</h2>
                    <p>Be the first to share your outfit collection with the community!</p>
                </div>
            )}
        </div>
    );
}
export default SocialCollections