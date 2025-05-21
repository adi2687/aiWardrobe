import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaUser, FaTshirt, FaStore, FaLightbulb, FaUpload, FaHeart } from 'react-icons/fa';
import './FloatingNavbar.css';

const FloatingNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Navigation handler
  const handleNavigation = (path) => {
      navigate(path);
  };

  // Check if we're on the home page
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname.includes('/auth');

  // Don't show the floating navbar on the home page or auth pages
  if (isHomePage || isAuthPage) {
    return null;
  }

  return (
    <div className="floating-navbar">
      <div 
        className={`nav-item ${isActive('/') ? 'active' : ''}`} 
        onClick={() => handleNavigation('/')}
      >
        <FaHome style={{ color: 'white' }} />
        <span>Home</span>
      </div>
      
      <div 
        className={`nav-item ${isActive('/wardrobe') ? 'active' : ''}`} 
        onClick={() => handleNavigation('/wardrobe')}
      >
        <FaTshirt style={{ color: 'white' }} />
        <span>Wardrobe</span>
      </div>
      
      <div 
        className={`nav-item ${isActive('/profile') ? 'active' : ''}`} 
        onClick={() => handleNavigation('/profile')}
      >
        <FaUser style={{ color: 'white' }} />
        <span>Profile</span>
      </div>
      
      <div 
        className={`nav-item ${isActive('/shop') ? 'active' : ''}`} 
        onClick={() => handleNavigation('/shop')}
      >
        <FaStore style={{ color: 'white' }} />
        <span>Shop</span>
      </div>
      <div 
        className={`nav-item ${isActive('/recommendations') ? 'active' : ''}`} 
        onClick={() => handleNavigation('/recommendations')}
      >
        <FaLightbulb style={{ color: 'white' }} />
        <span>Recommendations</span>
      </div>
      <div 
        className={`nav-item ${isActive('/upload') ? 'active' : ''}`} 
        onClick={() => handleNavigation('/profile/upload')}
      >
        <FaUpload style={{ color: 'white' }} />
        <span>Upload</span>
      </div>
      <div 
        className={`nav-item ${isActive('/profile/favorites') ? 'active' : ''}`} 
        onClick={() => handleNavigation('/profile/favorites')}
      >
        <FaHeart style={{ color: 'white' }} />
        <span>Favorites</span>
      </div>
    </div>
  );
};

export default FloatingNavbar;
