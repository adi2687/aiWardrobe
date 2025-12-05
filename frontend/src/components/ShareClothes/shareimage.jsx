import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCopy, FiCheck, FiLink, FiX, FiZoomIn } from 'react-icons/fi';
import { FaWhatsapp, FaTwitter, FaFacebook, FaInstagram, FaEnvelope, FaDownload, FaInfoCircle, FaUser } from 'react-icons/fa';
// import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../Toast/Toast';
import { getAuthHeaders } from '../../utils/auth';
import './shareimage.css';

const ShareImage = () => {
    const { search } = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(search);
    const url = params.get("url");
    const user = params.get("user");
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [imageUrlWithWatermark, setImageUrlWithWatermark] = useState("");
    const [addingWatermark, setAddingWatermark] = useState(false);
    const [showZoom, setShowZoom] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [imageInfo, setImageInfo] = useState(null);
    const [toast, setToast] = useState(null);
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(null); // null = checking, true/false = result

    const apiUrl = import.meta.env.VITE_BACKEND_URL;
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const shareLink = `${frontendUrl}/shareimage?url=${encodeURIComponent(url || '')}`;

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Get watermarked image URL from backend
    const getWatermarkedImage = async (imageUrl, filename = 'shared-image') => {
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
    };

    // Load image and get info
    useEffect(() => {
        if (!url) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setImageError(false);
        setImageUrlWithWatermark(""); // Reset watermark URL

        // First, validate the image URL and get dimensions
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = async () => {
            setImageInfo({
                width: img.naturalWidth,
                height: img.naturalHeight,
                size: 'Unknown'
            });

            // Automatically add watermark
            setAddingWatermark(true);
            try {
                const watermarkedUrl = await getWatermarkedImage(url, 'shared-image');

                // Verify the watermarked image loads before setting it
                const watermarkedImg = new Image();
                watermarkedImg.crossOrigin = "anonymous";

                watermarkedImg.onload = () => {
                    setImageUrlWithWatermark(watermarkedUrl);
                    setLoading(false);
                    setAddingWatermark(false);
                };

                watermarkedImg.onerror = () => {
                    console.error("Watermarked image failed to load");
                    // Fallback to original if watermarked version fails
                    setLoading(false);
                    setAddingWatermark(false);
                };

                watermarkedImg.src = watermarkedUrl;
            } catch (error) {
                console.error("Error adding watermark:", error);
                // If watermark fails, still show the original image
                setLoading(false);
                setAddingWatermark(false);
            }
        };

        img.onerror = () => {
            setImageError(true);
            setLoading(false);
            showToast("Failed to load image", "error");
        };

        img.src = url;
    }, [url, apiUrl]);

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

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`${shareLink}&user=${user.toUpperCase() ? user.split(" ").join("%20").toUpperCase() : "USER"}`)
            .then(() => {
                setCopied(true);
                showToast("Link copied to clipboard!", "success");
                setTimeout(() => setCopied(false), 2000);
            })
            .catch((err) => {
                console.error('Failed to copy:', err);
                showToast("Failed to copy link", "error");
            });
    };

    // Download image with watermark
    const downloadImageWithLogo = async () => {
        try {
            showToast("Preparing download...", "info");

            let watermarkedUrl = imageUrlWithWatermark;

            if (!watermarkedUrl) {
                watermarkedUrl = await getWatermarkedImage(url, 'shared-image');
            }

            const watermarkedResponse = await fetch(watermarkedUrl);
            const blob = await watermarkedResponse.blob();
            const downloadUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${user}-outfit-ai.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);

            showToast("Image downloaded with logo!", "success");
        } catch (error) {
            console.error("Error downloading image with logo:", error);
            showToast(error.message || "Failed to download image", "error");
        }
    };

    const shareToSocial = (platform) => {
        const message = "Check out this amazing outfit!";
        let shareUrl = "";

        switch (platform) {
            case "whatsapp":
                shareUrl = `https://wa.me/?text=${encodeURIComponent(`${message} ${shareLink}&user=${user.toUpperCase() ? user.split(" ").join("%20").toUpperCase() : "USER"}`)}&medium=WhatsApp`;
                break;
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${message} ${shareLink}&user=${user.toUpperCase() ? user.split(" ").join("%20").toUpperCase() : "USER"}`)}&medium=Twitter`;
                break;
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}&quote=${encodeURIComponent(message)}&user=${user.toUpperCase() ? user.split(" ").join("%20").toUpperCase() : "USER"}&medium=Facebook`;
                break;
            case "instagram":
                copyToClipboard();
                alert("To share on Instagram: Copy the link and paste it in your Instagram story or post");
                return;
            case "email":
                shareUrl = `mailto:?subject=Check out this amazing outfit&body=${encodeURIComponent(`${message}\n\n${shareLink}`)}&user=${user.toUpperCase() ? user.split(" ").join("%20").toUpperCase() : "USER"}&medium=Email`;
                break;
            default:
                shareUrl = shareLink;
        }

        if (shareUrl) {
            window.open(shareUrl, "_blank");
        }
    };

    return (
        <div className="share-container">
            <h1 className="share-title">{user.toUpperCase() ? user.toUpperCase() : "USER"} OUTFIT</h1>


            <img
                src={url}
                alt="Shared - Full View"
                className="share-img"
                key={imageUrlWithWatermark}
            />
            {url && !imageError && (
                <div className="share-actions">
                    <div className="action-buttons-row">
                        <button
                            onClick={copyToClipboard}
                            className="copy-link-btn"
                        >
                            {copied ? (
                                <>
                                    <FiCheck className="icon" />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <FiLink className="icon" />
                                    <span>Copy Link</span>
                                </>
                            )}
                        </button>
                        <button className="download-btn-main" 
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: 'Generated Outfit',
                                    text: 'Check out my AI-generated outfit!',
                                    url: `${shareLink}?url=${url}&user=${user ? user  : "us"}`
                                });
                            } else {
                                navigator.clipboard.writeText(generatedImage);
                                alert('Image URL copied to clipboard!');
                            }
                        }}>
                            Share
                        </button>
                        <button
                            onClick={downloadImageWithLogo}
                            className="download-btn-main"
                        >
                            <FaDownload className="icon" />
                            <span>Download</span>
                        </button>
                    </div>

                    <div className="social-share-buttons">
                        <button
                            onClick={() => shareToSocial("whatsapp")}
                            className="social-btn whatsapp"
                            title="Share on WhatsApp"
                        >
                            <FaWhatsapp />
                        </button>
                        <button
                            onClick={() => shareToSocial("twitter")}
                            className="social-btn twitter"
                            title="Share on Twitter"
                        >
                            <FaTwitter />
                        </button>
                        <button
                            onClick={() => shareToSocial("facebook")}
                            className="social-btn facebook"
                            title="Share on Facebook"
                        >
                            <FaFacebook />
                        </button>
                        <button
                            onClick={() => shareToSocial("instagram")}
                            className="social-btn instagram"
                            title="Share on Instagram"
                        >
                            <FaInstagram />
                        </button>
                        <button
                            onClick={() => shareToSocial("email")}
                            className="social-btn email"
                            title="Share via Email"
                        >
                            <FaEnvelope />
                        </button>
                    </div>
                </div>
            )
            }

            {/* {imageUrlWithWatermark} */}

            {/* Login prompt for non-authenticated users */}
            {
                isUserAuthenticated === false && (
                    <div className="share-login-prompt">
                        <div className="share-login-prompt-content">
                            <FaUser className="share-login-prompt-icon" />
                            <h4>Login Required</h4>
                            <p>
                                Sign in to access additional features .
                            </p>
                            <div className="share-login-prompt-buttons">
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="share-login-prompt-btn primary"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => {
                                        navigate('/auth');
                                        localStorage.setItem('showSignup', 'true');
                                    }}
                                    className="share-login-prompt-btn secondary"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )
            }
        </div >
    );
};

export default ShareImage;
