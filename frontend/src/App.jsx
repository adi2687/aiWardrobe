import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import Home from "./components/Home/Home";
import Navbar from "./components/Navbar/Navbar";
import Profile from "./components/Profile/Profile"
import NotFound from './components/NotFound/NotFound'
import Auth from './components/Auth/Auth'
import Wardrobe from "./components/Wardrobe/Wardrobe";
import Homepage from './components/Homepage/Homepage'
import Shop from './components/Shop/Shop'
import AR from './components/AR/AR_try'
import Footer from "./components/Footer/Footer";
import Recommendations from "./components/Recommendations/Recommendations";
import Chatbot from './components/Chatbot/Chatbot'
import ChatButton from "./components/ChatButton/ChatButton";
import CelebrityNews from "./components/Profile/News/CelebrityNews";
import SellCloth from './components/Sellcloth/Sellcloth'
import Message from './components/message/message'
import Planner from './components/Planner/Planner'
import Image from './components/Image/Image'
import ShareClothes from './components/ShareCloths/ShareCloths'
import DiscoverTrends from "./components/DiscoverTrends/DiscoverTrends";
import DevelopersPage from './components/Developers/Developers'
import Features from './components/Developers/Features'
import About from './components/Developers/Aboutus'
import Wishlist from './components/Wishlist/Wishlist'
const App = () => {
  return (
    <>    
      <Navbar /> {/* Always visible */}
      <ChatButton />  
      <Routes> 
        <Route path="/" element={<Homepage />} />
        <Route path='/profile' element={<Profile />} />
        <Route path="/auth" element={<Auth />} />
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
        <Route path="/features" element={<Features />} />
        <Route path="/aboutus" element={<About />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
