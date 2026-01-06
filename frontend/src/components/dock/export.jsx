import React, { useMemo } from "react";
import Dock from "./main";
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from "react-icons/vsc"; // ✅ Added
import { FaHome, FaUser, FaTshirt, FaStore, FaLightbulb, FaUpload, FaHeart, FaMagic, FaImage, FaPinterest, FaRobot } from 'react-icons/fa';
import { GiHumanTarget } from 'react-icons/gi';
import { useLocation } from "react-router-dom";

const Export = ({ onAINavClick }) => {
  const location = useLocation(); 
  
  if(location.pathname === '/' || location.pathname === '/auth'){
    return null;
  }

  // Define nav items with AI Nav handler
  const navItems = useMemo(() => [
    { path: '/', icon: <FaHome />, label: 'Home' },
    { path: '/wardrobe', icon: <FaTshirt />, label: 'Wardrobe' },
    { path: '/recommendations', icon: <FaLightbulb />, label: 'Outfits' },
    {path:'/profile/upload',icon:<FaUpload/>,label:'Upload'},
    { path: '/view-avatar', icon: <GiHumanTarget />, label: 'My Avatar' },
    { path: '/profile', icon: <FaUser />, label: 'Profile' },
    {path:'/profile/favorites',icon:<FaHeart/>,label:'Favorites'},
    {path :'/menu',icon:<FaImage/>,label:'Your Looks'},
    { path: '/shop', icon: <FaStore />, label: 'Shop' },
    {path:'/pinterest',icon:<FaPinterest/>,label:'Pinterest'},
    { path: '/social', icon: <FaMagic />, label: 'Social' },
    { 
      path: '/nav', 
      icon: <FaRobot />, 
      label: 'AI Nav', 
      className: 'ai-nav-dock-item',
      onClick: onAINavClick ? () => {
        onAINavClick();
      } : undefined
    }
  ], [onAINavClick]);

  return (
    <Dock
      items={navItems}
      panelHeight={68}
      baseItemSize={50}
      magnification={70}
    />
  );
};

export default Export;
