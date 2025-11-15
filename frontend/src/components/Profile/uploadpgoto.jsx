import React, { useState } from 'react'; 
import { IoClose } from 'react-icons/io5';
import { FaUpload, FaImage } from 'react-icons/fa';
import { getAuthHeaders } from '../../utils/auth';
import Toast from '../Toast/Toast';
import './uploadphoto.css';

const UploadPhoto = ({ onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [toast, setToast] = useState(null);
    const apiUrl = import.meta.env.VITE_BACKEND_URL;

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            showToast('Please select an image', 'error');
            return;
        }
        alert('Uploading image...');
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
                                <img src={preview} alt="Preview" className="preview-image" />
                                <button 
                                    className="change-image-btn"
                                    onClick={() => document.getElementById('file-input').click()}
                                >
                                    Change Image
                                </button>
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
