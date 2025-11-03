import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaTrash, FaDownload, FaImage, FaStar } from 'react-icons/fa';
import Toast from '../Toast/Toast';
import './ViewUploads.css';

const ViewUploads = ({ onClose }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageLoadStates, setImageLoadStates] = useState({});
    const [defaultImage, setDefaultImage] = useState(null);
    const apiUrl = import.meta.env.VITE_BACKEND_URL;

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await fetch(`${apiUrl}/getselfimages`, {
                method: 'GET',
                credentials: 'include',
            });

            const data = await response.json();
            console.log('Fetched images:', data);
            if (response.ok) {
                setImages(data.images || []);
                setDefaultImage(data.defaultImage || null);
                console.log('Images set:', data.images);
                console.log('Default image:', data.defaultImage);
            } else {
                console.error('Failed to fetch:', data);
                showToast(data.msg || 'Failed to fetch images', 'error');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showToast('Failed to load images', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (imageUrl, index) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `upload-${index + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            showToast('Image downloaded successfully!', 'success');
        } catch (error) {
            console.error('Download error:', error);
            showToast('Failed to download image', 'error');
        }
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const setdefault = async (image, index) => {
        try {
            const response = await fetch(`${apiUrl}/defaultimage`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image }),
            });

            const data = await response.json();
            if (response.ok) {
                setDefaultImage(image);
                showToast('Image set as default!', 'success');
            } else {
                showToast(data.msg || 'Failed to set default image', 'error');
            }
        } catch (error) {
            console.error('Set default error:', error);
            showToast('Failed to set default image', 'error');
        }
    }

    return (
        <div className="view-uploads-overlay" onClick={onClose}>
            <div className="view-uploads-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="view-uploads-header">
                    <h2>Your Uploaded Photos</h2>
                    <button className="close-btn" onClick={onClose}>
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="view-uploads-content">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading your images...</p>
                        </div>
                    ) : images.length === 0 ? (
                        <div className="empty-state">
                            <FaImage className="empty-icon" />
                            <h3>No uploads yet</h3>
                            <p>You haven't uploaded any photos yet. Upload your first photo to get started!</p>
                        </div>
                    ) : (
                        <div className="images-grid">
                            {images.map((image, index) => (
                                <div key={index} className={`image-card ${image === defaultImage ? 'is-default' : ''}`}>
                                    <div className="image-wrapper" onClick={() => handleImageClick(image)}>
                                        {image === defaultImage && (
                                            <div className="default-badge">
                                                <FaStar /> Default
                                            </div>
                                        )}
                                        {!imageLoadStates[index] && (
                                            <div className="image-loading">
                                                <div className="spinner"></div>
                                            </div>
                                        )}
                                        <img 
                                            src={image} 
                                            alt={`Upload ${index + 1}`}
                                            loading="lazy"
                                            onLoad={() => setImageLoadStates(prev => ({...prev, [index]: true}))}
                                            onError={(e) => {
                                                console.error('Image failed to load:', image);
                                                e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                                                setImageLoadStates(prev => ({...prev, [index]: true}));
                                            }}
                                            style={{ display: imageLoadStates[index] ? 'block' : 'none' }}
                                        />
                                        <div className="image-overlay">
                                            <span>Click to view</span>
                                        </div>
                                    </div>
                                    <div className="image-actions">
                                        <button
                                            className="action-btn download-btn"
                                            onClick={() => handleDownload(image, index)}
                                            title="Download"
                                        >
                                            <FaDownload /> Download
                                        </button> 
                                        <button
                                            className="action-btn default-btn"
                                            onClick={() => setdefault(image,index)}
                                            title="Set as default image"
                                        >
                                            <FaStar /> Set Default
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="view-uploads-footer">
                    <p className="images-count">
                        {images.length} {images.length === 1 ? 'image' : 'images'} uploaded
                    </p>
                </div>
            </div>

            {selectedImage && (
                <div className="image-modal" onClick={closeModal}>
                    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal}>
                            <IoClose size={32} />
                        </button>
                        <img src={selectedImage} alt="Full size" />
                    </div>
                </div>
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

export default ViewUploads;
