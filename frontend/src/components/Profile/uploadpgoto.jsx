import React, { useState, useRef, useEffect, useCallback } from 'react'; 
import { IoClose } from 'react-icons/io5';
import { FaUpload, FaImage, FaCrop, FaCheck, FaTimes } from 'react-icons/fa';
import { getAuthHeaders } from '../../utils/auth';
import Toast from '../Toast/Toast';
import './uploadphoto.css';

const UploadPhoto = ({ onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [toast, setToast] = useState(null);
    const [isCropping, setIsCropping] = useState(false);
    const [cropStart, setCropStart] = useState(null);
    const [cropEnd, setCropEnd] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const imageRef = useRef(null);
    const containerRef = useRef(null);
    const apiUrl = import.meta.env.VITE_BACKEND_URL;

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                // Reset cropping state when new image is selected
                setIsCropping(false);
                setCropStart(null);
                setCropEnd(null);
            };
            reader.readAsDataURL(file);
        }
    };

    // Get coordinates relative to image
    const getImageCoordinates = (e) => {
        if (!imageRef.current || !containerRef.current) return null;
        const rect = imageRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    // Handle mouse down for crop selection
    const handleMouseDown = (e) => {
        if (!isCropping) return;
        const coords = getImageCoordinates(e);
        if (coords) {
            setCropStart(coords);
            setCropEnd(coords);
            setIsDragging(true);
        }
    };

    // Handle mouse move for crop selection
    const handleMouseMove = (e) => {
        if (!isCropping || !isDragging || !cropStart) return;
        const coords = getImageCoordinates(e);
        if (coords) {
            setCropEnd(coords);
        }
    };

    // Handle mouse up
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Handle crop
    const handleCrop = () => {
        if (!cropStart || !cropEnd || !preview) {
            showToast('Please select an area to crop', 'error');
            return;
        }

        const img = new Image();
        img.onload = () => {
            const scaleX = img.width / imageRef.current.offsetWidth;
            const scaleY = img.height / imageRef.current.offsetHeight;

            const x = Math.min(cropStart.x, cropEnd.x) * scaleX;
            const y = Math.min(cropStart.y, cropEnd.y) * scaleY;
            const width = Math.abs(cropEnd.x - cropStart.x) * scaleX;
            const height = Math.abs(cropEnd.y - cropStart.y) * scaleY;

            // Create canvas for cropping
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            // Draw cropped portion
            ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

            // Convert to blob and update
            canvas.toBlob((blob) => {
                const newFile = new File([blob], selectedFile.name, { type: selectedFile.type });
                setSelectedFile(newFile);
                const newPreview = URL.createObjectURL(blob);
                setPreview(newPreview);
                setIsCropping(false);
                setCropStart(null);
                setCropEnd(null);
                showToast('Image cropped successfully!', 'success');
            }, selectedFile.type || 'image/png');
        };
        img.src = preview;
    };

    // Cancel crop
    const handleCancelCrop = () => {
        setIsCropping(false);
        setCropStart(null);
        setCropEnd(null);
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            showToast('Please select an image', 'error');
            return;
        }
        // alert('Uploading image...');
        setUploading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch(`${apiUrl}/uploadselfimages`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            const data = await response.json(); 
            console.log(data);
            if (response.ok) {
                showToast('Image uploaded successfully!', 'success');
            
                let datafromlocal;
            
                try {
                    datafromlocal = JSON.parse(localStorage.getItem('userimages'));
                    if (!Array.isArray(datafromlocal)) datafromlocal = []; 
                } catch {
                    // If JSON is invalid → reset to empty array
                    datafromlocal = [];
                }
            
                datafromlocal.push(data.image);
            
                localStorage.setItem('userimages', JSON.stringify(datafromlocal));
            
                setUploading(false);
                setTimeout(() => {
                    onClose();
                }, 1000);
            }
             
            else {
                showToast(data.msg || 'Upload failed', 'error');
                setUploading(false);
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Failed to upload image', 'error');
            setUploading(false);
        }
    };

    return (
        <div className="upload-photo-overlay" onClick={onClose}>
            <div className="upload-photo-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="upload-photo-header">
                    <h2>Upload Your Photo</h2>
                    <button className="close-btn" onClick={onClose}>
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="upload-photo-content">
                    <div className="upload-area">
                        {preview ? (
                            <div className="preview-container">
                                <div 
                                    ref={containerRef}
                                    className={`crop-container ${isCropping ? 'cropping' : ''}`}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                >
                                    <img 
                                        src={preview} 
                                        alt="Preview" 
                                        className="preview-image" 
                                        ref={imageRef}
                                        draggable={false}
                                    />
                                    {isCropping && cropStart && cropEnd && (
                                        <>
                                            <div 
                                                className="crop-overlay"
                                                style={{
                                                    left: `${Math.min(cropStart.x, cropEnd.x)}px`,
                                                    top: `${Math.min(cropStart.y, cropEnd.y)}px`,
                                                    width: `${Math.abs(cropEnd.x - cropStart.x)}px`,
                                                    height: `${Math.abs(cropEnd.y - cropStart.y)}px`,
                                                }}
                                            />
                                            {/* Corner handles */}
                                            {[0, 1, 2, 3].map((i) => {
                                                const isTop = i < 2;
                                                const isLeft = i % 2 === 0;
                                                return (
                                                    <div
                                                        key={i}
                                                        className="crop-handle"
                                                        style={{
                                                            left: isLeft ? `${Math.min(cropStart.x, cropEnd.x) - 8}px` : `${Math.max(cropStart.x, cropEnd.x) - 8}px`,
                                                            top: isTop ? `${Math.min(cropStart.y, cropEnd.y) - 8}px` : `${Math.max(cropStart.y, cropEnd.y) - 8}px`,
                                                        }}
                                                    />
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                                <div className="preview-actions">
                                    <button 
                                        className="change-image-btn"
                                        onClick={() => document.getElementById('file-input').click()}
                                    >
                                        Change Image
                                    </button>
                                    {!isCropping ? (
                                        <button 
                                            className="crop-image-btn"
                                            onClick={() => setIsCropping(true)}
                                            title="Crop your image"
                                        >
                                            <FaCrop /> Crop Image
                                        </button>
                                    ) : (
                                        <div className="crop-actions">
                                            <button 
                                                className="crop-action-btn cancel"
                                                onClick={handleCancelCrop}
                                            >
                                                <FaTimes /> Cancel
                                            </button>
                                            <button 
                                                className="crop-action-btn apply"
                                                onClick={handleCrop}
                                            >
                                                <FaCheck /> Apply Crop
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <label htmlFor="file-input" className="upload-label">
                                <FaImage size={48} className="upload-icon" />
                                <p>Click to select an image</p>
                                <span className="upload-hint">PNG, JPG up to 10MB</span>
                            </label>
                        )}
                        <input
                            id="file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* <div className="prompt-area">
                        <label htmlFor="prompt-input">Enter your prompt:</label>
                        <textarea
                            id="prompt-input"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe what you want to generate with this image..."
                            rows={4}
                        />
                    </div> */}
                </div>

                <div className="upload-photo-footer">
                    <button className="cancel-btn" onClick={onClose} disabled={uploading}>
                        Cancel
                    </button>
                    <button 
                        className="upload-btn" 
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                    >
                        {uploading ? (
                            <>
                                <span className="spinner"></span>
                                Generating...
                            </>
                        ) : (
                            <>
                                <FaUpload /> Upload
                            </>
                        )}
                    </button>
                </div>
            </div>
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

export default UploadPhoto;
