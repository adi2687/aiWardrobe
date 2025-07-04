import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "/logo_main.png";
import "./Navbar.css";
import "./NavDropdown.css";
 
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [check, setCheck] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const location = useLocation();
  const apiUrl = import.meta.env.VITE_BACKEND_URL
  // console.log(apiUrl)
  useEffect(() => {
    fetch(`${apiUrl}/user/profile`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
    // console.log(`${apiUrl}/user/profile`)
      .then((response) => response.json())
      .then((data) => {
        setCheck(data);
        if (data?.message === "Success") {
          setIsLoggedIn(true);
          console.log("User logged in");
        } else {
          setIsLoggedIn(false);
          console.log("User is not logged in");
        }
      })
      .catch((error) => console.error("Error fetching profile:", error));
  }, []);

  // Only show navbar on the landing page
  if (location.pathname !== '/') {
    return null;
  }
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img src={Logo} alt="Outfit AI" className="logo-image" />
          </Link>
        </div>

        <div className={`navbar-menu ${isOpen ? "active" : ""}`}>
          <Link to="/wardrobe" className="nav-link" onClick={() => setIsOpen(false)}>Wardrobe</Link>
          <Link to="/recommendations" className="nav-link" onClick={() => setIsOpen(false)}>Recommendations</Link>
          <Link to="/virtual-try-on" className="nav-link" onClick={() => setIsOpen(false)}>Virtual Try-On</Link>
          <Link to="/sellcloth" className="nav-link" onClick={() => setIsOpen(false)}>Sell Clothes</Link>
          <Link to="/shop" className="nav-link" onClick={() => setIsOpen(false)}>Shop</Link>
          <Link to='/Download' className="nav-link" onClick={()=>setIsOpen(false)}>App</Link>
          <Link to='/Developers' className="nav-link" onClick={()=>setIsOpen(false)}>Developers</Link>
        </div>
 
        <div className="navbar-icons">
          {isLoggedIn ? (
            <Link to="/profile" className="icon">Profile</Link>
          ) : (
            <Link to="/auth" className="icon">Login / SignUp</Link>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="navbar-toggle">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar-mobile-menu ${isOpen ? "open" : ""}`}>
        <Link to="/wardrobe" className="mobile-link" onClick={() => setIsOpen(false)}>Wardrobe</Link>
        <Link to="/recommendations" className="mobile-link" onClick={() => setIsOpen(false)}>Recommendations</Link>
        <Link to="/virtual-try-on" className="mobile-link" onClick={() => setIsOpen(false)}>Virtual Try-On</Link>
        <Link to="/sellcloth" className="mobile-link" onClick={() => setIsOpen(false)}>Sell Clothes</Link>
        <Link to="/shop" className="mobile-link" onClick={() => setIsOpen(false)}>Shop</Link>
        <Link to='/Download' className="mobile-link" onClick={()=>setIsOpen(false)}>App</Link>
        <Link to='/Developers' className="mobile-link" onClick={()=>setIsOpen(false)}>Developers</Link>
        
        
      </div>
    </nav>
  );
};

export default Navbar;
