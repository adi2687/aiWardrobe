    import React from 'react';
    import { useState, useEffect } from 'react';
    import axios from 'axios';
    import { getAuthHeaders } from '../../utils/auth';
    import './pinterest.css';
    import Masonry from './masonry/masonry';
    import { useNavigate } from 'react-router-dom';
    const Pinterest = () => {
        const [url, setUrl] = useState('');
        const [imageurl, setImageurl] = useState('');
        const [images, setImages] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');
        const [fetchingImages, setFetchingImages] = useState(true);
        const [selectedImage, setSelectedImage] = useState(null);
        const [savingDefault, setSavingDefault] = useState(false);
        const [showGenerateDialog, setShowGenerateDialog] = useState(false);
        const [generating, setGenerating] = useState(false);
        const [generateInput, setGenerateInput] = useState('');
        const [shareId, setShareId] = useState('');
        const [generatedImage, setGeneratedImage] = useState(null);
        const [uploadedImage, setUploadedImage] = useState(null);
        const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
        const apiUrl = import.meta.env.VITE_BACKEND_URL;

        const navigate = useNavigate()
        // Format images array for Masonry component
        const formatImages = (imageArray) => {
            if (!imageArray || !Array.isArray(imageArray) || imageArray.length === 0) {
                return [];
            }

            return imageArray.map((image, index) => {
                // Generate a random height for visual variety (300-600px)
                const height = 300 + Math.random() * 300;
                return {
                    id: image || `image-${index}`,
                    img: image,
                    url: image,
                    height: height,
                };
            });
        };

        // Handle image file upload
        const handleImageUpload = (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                setUploadedImage(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setUploadedImagePreview(reader.result);
                    // Set as imageurl so it can be used for generation
                    setImageurl(reader.result);
                    setError('');
                };
                reader.readAsDataURL(file);
            } else {
                setError('Please select a valid image file');
            }
        };

        // Clear uploaded image
        const clearUploadedImage = () => {
            setUploadedImage(null);
            setUploadedImagePreview(null);
            setImageurl('');
        };

        // Handle Pinterest URL submission
        const handleSubmit = async () => {
            if (!url.trim()) {
                setError('Please enter a Pinterest URL');
                return;
            }

            setLoading(true);
            setError('');

            try {
                const response = await axios.post(`${apiUrl}/pinterest`, { url });
                if (response.data && response.data.image) {
                    setImageurl(response.data.image);
                    // Clear uploaded image if Pinterest URL is used
                    setUploadedImage(null);
                    setUploadedImagePreview(null);
                } else {
                    setError('No image found in response');
                }
            } catch (error) {
                console.error('Error fetching Pinterest image:', error);
                setError(error.response?.data?.error || 'Failed to fetch image. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        // Fetch user images from API
        const fetchUserImages = async () => {
            setFetchingImages(true);
            setError('');

            // Try to get from localStorage first for instant display
            const cachedImages = localStorage.getItem('userimages');
            if (cachedImages) {
                try {
                    const parsedImages = JSON.parse(cachedImages);
                    if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                        setImages(parsedImages);
                        setFetchingImages(false);
                        // Continue to fetch fresh data in background
                    }
                } catch (parseError) {
                    // Invalid cache, clear it
                    localStorage.removeItem('userimages');
                }
            }

            try {
                // Fetch from API
                const response = await fetch(`${apiUrl}/getselfimages`, {
                    method: 'GET',
                    headers: getAuthHeaders(),
                    credentials: 'include',
                });

                if (!response.ok) {
                    // If we have cached images, don't show error, just use cache
                    if (cachedImages) {
                        console.warn('API fetch failed, using cached images');
                        setFetchingImages(false);
                        return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                // console.log('API response:', data); // Debug log

                // Handle the response - images is an array from the API
                let imageArray = [];
                if (Array.isArray(data.images)) {
                    imageArray = data.images.filter(img => img && img.trim()); // Filter out empty strings
                } else if (typeof data.images === 'string' && data.images.trim()) {
                    // Handle comma-separated string format if needed
                    imageArray = data.images.split(',').filter(img => img.trim());
                }

                // Update state and cache
                if (imageArray.length > 0) {
                    setImages(imageArray);
                    localStorage.setItem('userimages', JSON.stringify(imageArray));
                } else {
                    // Only clear if we don't have cached images
                    if (!cachedImages) {
                        setImages([]);
                    }
                }
            } catch (error) {
                console.error('Error fetching user images:', error);

                // If we have cached images, use them instead of showing error
                if (cachedImages) {
                    try {
                        const parsedImages = JSON.parse(cachedImages);
                        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                            setImages(parsedImages);
                            setFetchingImages(false);
                            return; // Don't show error if we have cache
                        }
                    } catch (e) {
                        // Cache is invalid, show error
                    }
                }

                // Only show error if we have no cached images
                setError('Failed to load images. Please refresh the page.');
                if (!cachedImages && (!images || images.length === 0)) {
                    setImages([]);
                }
            } finally {
                setFetchingImages(false);
            }
        };

        useEffect(() => {
            fetchUserImages();
        }, []);

        const formattedImages = formatImages(images);

        // Handle image selection
        const handleImageSelect = (imageId, imageUrl) => {
            if (selectedImage === imageId) {
                setSelectedImage(null); // Deselect if already selected
            } else {
                setSelectedImage(imageId);
            }
        };

        // Open generate dialog
        const openGenerateDialog = () => {
            if (!imageurl || !selectedImage) {
                setError('Please select both a clothing image (Pinterest URL or upload) and a user image');
                return;
            }
            setShowGenerateDialog(true);
            setError('');
        };

        // Generate image using AI
        const handleGenerateImage = async () => {
            if (!imageurl || !selectedImage) {
                setError('Both images are required');
                return;
            }
            console.log(imageurl, selectedImage);
            setGenerating(true);
            setError('');

            try {
                // Get selected image URL
                const selectedImg = formattedImages.find(img => img.id === selectedImage);
                if (!selectedImg) {
                    throw new Error('Selected image not found');
                }

                // Swap: Selected user image = person, Pinterest/Uploaded image = clothes to try on
                // Handle both data URLs (uploaded images) and regular URLs
                let formData;
                
                // Helper to extract base64 from data URL or fetch from URL
                const getBase64FromImage = async (imageSrc) => {
                    // If it's already a data URL, extract base64 directly
                    if (imageSrc.startsWith('data:')) {
                        return imageSrc.split(',')[1];
                    }
                    
                    // Otherwise, try to fetch and convert
                    try {
                        const imageResponse = await fetch(imageSrc);
                        const imageBlob = await imageResponse.blob();
                        
                        return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                const base64 = reader.result.split(',')[1];
                                resolve(base64);
                            };
                            reader.onerror = reject;
                            reader.readAsDataURL(imageBlob);
                        });
                    } catch (error) {
                        // If fetch fails (CORS), return URL and let backend handle it
                        throw error;
                    }
                };

                try {
                    if (!selectedImg.img){
                        throw new Error('Selected image not found');
                    }
                    
                    // Try to get base64 for user image
                    const userImageBase64 = await getBase64FromImage(selectedImg.img);
                    
                    formData = new FormData();
                    formData.append('imageurl', imageurl); // Pinterest/Uploaded image = clothes to identify
                    formData.append('userimage', userImageBase64); // User image = person (base64)
                } catch (corsError) {
                    // CORS blocked - send URLs and let backend fetch them
                    console.warn('CORS blocked image fetch, using URL method:', corsError);
                    formData = new FormData();
                    formData.append('imageurl', imageurl); // Pinterest/Uploaded image = clothes to identify
                    formData.append('userimage', selectedImg.img); // User image = person (URL)
                }
                console.log("form data", formData);
                const response = await fetch(`${apiUrl}/pinterestgenerate/identify`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                const data = await response.json();
                console.log('Full response data:', data); // Debug log
                const clothingDescription = data.response;
                // Handle multiple response formats:
                // 1. { msg: { msg: "...", image: "..." } } - nested from generate function
                // 2. { msg: "Image already exists", image: "..." } - existing image
                // 3. { image: "..." } - direct format
                let generatedImageUrl = null;

                // Check for direct image property first (handles case 2 and 3)
                if (data.response) {
                    generatedImageUrl = data.response;
                }

                if (generatedImageUrl) {
                    setError('');
                    setGeneratedImage(generatedImageUrl);
                    setShowGenerateDialog(false);
                    setGenerateInput('');
                    console.log('Generated image URL:', generatedImageUrl);
                    // Scroll to generated image
                    setTimeout(() => {
                        const generatedSection = document.getElementById('generated-image-section');
                        if (generatedSection) {
                            generatedSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 100);
                } else {
                    console.error('Could not extract image URL from response:', data);
                    throw new Error(data.msg?.msg || data.msg || 'Failed to get generated image URL');
                }
            } catch (error) {
                console.error('Error generating image:', error);
                setError(error.error || 'Failed to generate image. Please try again.');
            } finally {
                setGenerating(false);
            }
        };

        // Set selected image as default
        const setAsDefaultImage = async () => {
            if (!selectedImage) return;

            const selectedImg = formattedImages.find(img => img.id === selectedImage);
            if (!selectedImg) return;

            setSavingDefault(true);
            setError('');

            try {
                const response = await fetch(`${apiUrl}/defaultimage`, {
                    method: 'POST',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ image: selectedImg.img }),
                });

                if (!response.ok) {
                    throw new Error('Failed to set default image');
                }

                const data = await response.json();
                if (data.msg && data.msg.includes('successfully')) {
                    setError('');
                    alert('Default image updated successfully!');
                    setSelectedImage(null);
                } else {
                    throw new Error(data.msg || 'Failed to update');
                }
            } catch (error) {
                console.error('Error setting default image:', error);
                setError('Failed to set default image. Please try again.');
            } finally {
                setSavingDefault(false);
            }
        };

        // Debug: Log images state
        // useEffect(() => {
        //     console.log('Images state:', images);
        //     console.log('Formatted images:', formattedImages);
        // }, [images, formattedImages]);

        return (
            <div className="pinterest-container">
                <div className="pinterest-header">
                    <h1>Pinterest</h1>
                    <button
                        className="refresh-button"
                        onClick={fetchUserImages}
                        disabled={fetchingImages}
                        title="Refresh images"
                    >
                        {fetchingImages ? '⟳' : '↻'}
                    </button>
                </div>

                <div className="pinterest-input-section">
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Enter Pinterest URL"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                        <button onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Loading...' : 'Get Image'}
                        </button>
                    </div>
                    <div className="upload-divider">
                        <span>OR</span>
                    </div>
                    <div className="upload-section">
                        <label htmlFor="image-upload" className="upload-button">
                            <span>📁 Upload Image</span>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                        </label>
                        {uploadedImagePreview && (
                            <button 
                                className="clear-upload-button"
                                onClick={clearUploadedImage}
                                title="Clear uploaded image"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                        <button
                            className="retry-button"
                            onClick={fetchUserImages}
                            style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {imageurl && (
                    <div className="featured-image">
                        <h3>{uploadedImagePreview ? 'Uploaded Image' : 'Pinterest Image'}</h3>
                        <img src={imageurl} alt={uploadedImagePreview ? 'Uploaded Image' : 'Pinterest Image'} />
                        {uploadedImagePreview && (
                            <button 
                                className="clear-image-button"
                                onClick={clearUploadedImage}
                                title="Remove image"
                            >
                                Remove Image
                            </button>
                        )}
                    </div>
                )}

                {generatedImage && (
                    <div id="generated-image-section" className="generated-image-section">
                        <div className="generated-image-header">
                            <h2>✨ Generated Outfit</h2>
                            <button
                                className="close-generated-button"
                                onClick={() => setGeneratedImage(null)}
                                title="Close"
                            >
                                ×
                            </button>
                        </div>
                        <div className="generated-image-container">
                            <img src={generatedImage} alt="Generated Outfit" />
                            <div className="generated-image-actions">
                                <button
                                    className="download-button"
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = generatedImage;
                                        link.download = 'generated-outfit.jpg';
                                        link.target = '_blank';
                                        link.click();
                                    }}
                                >
                                    Download
                                </button>

                                <button
                                    className="share-button"
                                    onClick={() => {
                                        // if (navigator.share) {
                                        //     navigator.share({
                                        //         title: 'Generated Outfit',
                                        //         text: 'Check out my AI-generated outfit!',
                                        //         url: generatedImage
                                        //     });
                                        // } else {
                                        //     navigator.clipboard.writeText(generatedImage);
                                        //     alert('Image URL copied to clipboard!');
                                        // }
                                        navigate('/shareimage?url='+generatedImage+"&user="+"pinterest")
                                    }}
                                >
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {fetchingImages ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading your images...</p>
                    </div>
                ) : formattedImages.length > 0 ? (
                    <>
                        <div className="images-count">
                            <p>Showing {formattedImages.length} image{formattedImages.length !== 1 ? 's' : ''}</p>
                            {selectedImage && (
                                <div className="selection-info">
                                    <span>1 image selected</span>
                                    {imageurl && (
                                        <button
                                            className="generate-button"
                                            onClick={openGenerateDialog}
                                        >
                                            Generate Outfit
                                        </button>
                                    )}
                                    <button
                                        className="set-default-button"
                                        onClick={setAsDefaultImage}
                                        disabled={savingDefault}
                                    >
                                        {savingDefault ? 'Saving...' : 'Set as Default'}
                                    </button>
                                    <button
                                        className="clear-selection-button"
                                        onClick={() => setSelectedImage(null)}
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>
                        <Masonry
                            items={formattedImages}
                            selectedImage={selectedImage}
                            onImageSelect={handleImageSelect}
                            ease="power3.out"
                            duration={0.6}
                            stagger={0.05}
                            animateFrom="bottom"
                            scaleOnHover={true}
                            hoverScale={0.95}
                            blurToFocus={true}
                            colorShiftOnHover={false}
                        />
                    </>
                ) : (
                    <div className="no-images">
                        <p>No images found. Upload some images from your profile!</p>
                        <button
                            className="refresh-button-large"
                            onClick={fetchUserImages}
                            disabled={fetchingImages}
                        >
                            Refresh
                        </button>
                    </div>
                )}

                {/* Generate Image Dialog */}
                {showGenerateDialog && (
                    <div className="dialog-overlay" onClick={() => !generating && setShowGenerateDialog(false)}>
                        <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
                            <div className="dialog-header">
                                <h2>Generate Outfit</h2>
                                <button
                                    className="dialog-close"
                                    onClick={() => setShowGenerateDialog(false)}
                                    disabled={generating}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="dialog-images">
                                <div className="dialog-image-item">
                                    <h3>Your Photo</h3>
                                    <img
                                        src={formattedImages.find(img => img.id === selectedImage)?.img}
                                        alt="Your Photo"
                                    />
                                </div>
                                <div className="dialog-arrow">→</div>
                                <div className="dialog-image-item">
                                    <h3>Clothes to Try On</h3>
                                    <img src={imageurl} alt="Clothing Image" />
                                </div>
                            </div>

                            <div className="dialog-form">
                                <label htmlFor="shareid">Share ID (optional):</label>
                                <input
                                    id="shareid"
                                    type="text"
                                    value={shareId}
                                    onChange={(e) => setShareId(e.target.value)}
                                    placeholder="Leave empty for default"
                                    disabled={generating}
                                />

                                <label htmlFor="generate-input">Description/Prompt (optional):</label>
                                <textarea
                                    id="generate-input"
                                    value={generateInput}
                                    onChange={(e) => setGenerateInput(e.target.value)}
                                    placeholder="Describe how you want the outfit to look (e.g., 'casual summer outfit', 'formal evening wear') - Leave empty for default styling"
                                    rows="4"
                                    disabled={generating}
                                />

                                {error && (
                                    <div className="dialog-error">{error}</div>
                                )}

                                <div className="dialog-actions">
                                    <button
                                        className="dialog-cancel"
                                        onClick={() => setShowGenerateDialog(false)}
                                        disabled={generating}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="dialog-submit"
                                        onClick={handleGenerateImage}
                                        disabled={generating}
                                    >
                                        {generating ? 'Generating...' : 'Generate Outfit'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default Pinterest;