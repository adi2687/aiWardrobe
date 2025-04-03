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
import ChatButton from "./components/Chatbotbutton/ChatButton";
import CelebrityNews from "./components/Profile/News/CelebrityNews";
import SellCloth from './components/Sellcloth/Sellcloth'
import Message from './components/message/message'
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
      </Routes>
      <Footer />
    </>
  );
};

export default App;
