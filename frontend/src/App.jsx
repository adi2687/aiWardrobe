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
const App = () => {
  return (
    <>
      <Navbar /> {/* Always visible */}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path='/profile' element={<Profile />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/wardrobe" element={<Wardrobe />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/shop" element={<Shop />} />
      </Routes>
      
    </>
  );
};

export default App;
