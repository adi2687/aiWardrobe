import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaUser, FaTshirt, FaStore, FaLightbulb, FaUpload, FaHeart, FaMagic } from 'react-icons/fa';
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

  // Define main navigation items for better organization and maintenance
  const navItems = [
    { path: '/', icon: <FaHome />, label: 'Home' },
    { path: '/wardrobe', icon: <FaTshirt />, label: 'Wardrobe' },
    { path: '/recommendations', icon: <FaLightbulb />, label: 'Outfits' },
    { path: '/profile', icon: <FaUser />, label: 'Profile' },
    { path: '/shop', icon: <FaStore />, label: 'Shop' }
  ];
  
  // Add conditional items based on user state
  if (isLoggedIn) {
    // Only show these items to logged-in users
    navItems.splice(3, 0, { path: '/profile/upload', icon: <FaUpload />, label: 'Upload' });
    navItems.splice(4, 0, { path: '/profile/favorites', icon: <FaHeart />, label: 'Favorites' });
  }
  
  return (
    <div className="floating-navbar">
      {navItems.map((item, index) => (
        <div 
          key={`nav-${index}`}
          className={`nav-item ${isActive(item.path) ? 'active' : ''}`} 
          onClick={() => handleNavigation(item.path)}
          title={item.label}
        >
          {React.cloneElement(item.icon, { style: { color: 'white' } })}
          <span>{item.label}</span>
        </div>
      ))}
      
    </div>
  );
};

export default FloatingNavbar;
