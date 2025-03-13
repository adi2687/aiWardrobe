import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home/Home";
import Navbar from "./components/Navbar/Navbar";
import Profile from "./components/Profile/Profile"
import NotFound from './components/NotFound/NotFound'
import Auth from './components/Auth/Auth'
const App = () => {
  return (
    <>
      <Navbar /> {/* Always visible */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/profile' element={<Profile />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </>
  );
};

export default App;
