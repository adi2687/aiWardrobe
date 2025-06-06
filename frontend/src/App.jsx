import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import Home from "./components/Home/Home";
import Navbar from "./components/Navbar/Navbar";
import Profile from "./components/Profile/Profile"
import NotFound from './components/NotFound/NotFound'
import Auth from './components/Auth/Auth'
import ResetPassword from './components/Auth/ResetPassword'
import Wardrobe from "./components/Wardrobe/Wardrobe";
import Homepage from './components/Homepage/Homepage'
import Shop from './components/Shop/shomain'
import AR from './components/AR/main'
import SavedAvatar from './components/AR/SavedAvatar'
import Footer from "./components/Footer/Footer";
import Recommendations from "./components/Recommendations/Recommendations";
import Chatbot from './components/Chatbot/Chatbot'
import ChatButton from "./components/ChatButton/ChatButton";
import CelebrityNews from "./components/Profile/News/CelebrityNews";
import SellCloth from './components/Sellcloth/Sellcloth'
import Message from './components/message/message'
import Planner from './components/Planner/Planner'
import Image from './components/Image/Image'
import ShareClothes from './components/ShareClothes/ShareClothes'
import DiscoverTrends from "./components/DiscoverTrends/DiscoverTrends";
import DevelopersPage from './components/Developers/Developers'
import Features from './components/Developers/Features'
import About from './components/Developers/Aboutus'
import Wishlist from './components/Wishlist/Wishlist'
import Download from './components/Download/Download'
import FloatingNavbar from './components/FloatingNavbar/FloatingNavbar'
import Intro from './components/Intro/Intro'
import SocialCollections from './components/social_sharing/social_collections'
import VirtualTryOn from './components/VirtualTryOn/ClothingMapper'
import Test from './components/test/test'
// Policy pages
import PrivacyPolicy from './components/Policies/PrivacyPolicy'
import TermsOfService from './components/Policies/TermsOfService'
import DataDeletion from './components/Policies/DataDeletion'
import PoliciesHub from './components/Policies/PoliciesHub'
// import News from './components/profile/News/CelebrityNews'
const App = () => {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // Check if the user is logged in and should see the intro
    const token = localStorage.getItem('tokenlogin') || document.cookie.includes('tokenlogin');
    const introComplete = localStorage.getItem('introComplete');
    
    // Check URL parameters for Google/Facebook login redirect
    const urlParams = new URLSearchParams(window.location.search);
    const showIntroParam = urlParams.get('showIntro');
    const isNewUser = urlParams.get('isNewUser');
    
    // Check for OAuth login flag
    const checkForNewUser = localStorage.getItem('checkForNewUser');
    
    // Show intro if:
    // 1. User is logged in AND hasn't completed intro yet, OR
    // 2. URL has showIntro=true parameter (from Google/Facebook redirect)
    if ((token && introComplete !== 'true') || showIntroParam === 'true') {
      console.log('Showing intro animation');
      setShowIntro(true);
      
      // Clear the URL parameters after processing
      if (showIntroParam) {
        // Remove query parameters without page reload
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // Clear the OAuth flag if it exists
      if (checkForNewUser === 'true') {
        localStorage.removeItem('checkForNewUser');
      }
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    localStorage.setItem('introComplete', 'true');
  };
  return (
    <>    
      {showIntro && <Intro onComplete={handleIntroComplete} />}
      <Navbar /> {/* Always visible */}
      <ChatButton />  
      <Routes> 
        <Route path="/" element={<Homepage />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/profile/favorites' element={<Profile />} />
        <Route path='/profile/planner' element={<Profile />} />
        <Route path='/profile/upload' element={<Profile />} />
        <Route path='/profile/settings' element={<Profile />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/wardrobe" element={<Wardrobe />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/ar-preview" element={<AR />} />
        <Route path='/recommendations' element={<Recommendations />} />
        <Route path='/chatbot' element={<Chatbot />} />
        <Route path='/celebrity-news' element={<CelebrityNews />} />
        <Route path='/sellcloth' element={<SellCloth />} />
        <Route path='/message/:username/:id' element={<Message />} />
        <Route path='/planner' element={<Planner />} />
        <Route path='/Image' element={<Image />} />
        <Route path="/share/:id" element={<ShareClothes />} />
        <Route path="/discover-trends" element={<DiscoverTrends />} />
        <Route path="/developers" element={<DevelopersPage />} />
        <Route path="/social" element={<SocialCollections />} />
        <Route path="/ar-try" element={<AR />} />
        <Route path="/view-avatar" element={<SavedAvatar />} />
        <Route path="/test" element={<Test />} />
        {/* <Route path="/intro" element={<Intro />} /> */}
        {/* Policy Routes */}
        <Route path="/policies" element={<PoliciesHub />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/data-deletion" element={<DataDeletion />} />
        <Route path="/features" element={<Features />} />
        <Route path="/aboutus" element={<About />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/download" element={<Download />} />
        <Route path="/virtual-try-on" element={<VirtualTryOn />} />
      </Routes>
      <FloatingNavbar />
      <Footer />
    </>
  );
};

export default App;
