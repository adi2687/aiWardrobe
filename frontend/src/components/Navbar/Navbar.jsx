import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import Logo from "../../assets/Logo.png";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src={Logo} alt="Outfit AI" className="logo-image" />
          {/* <span className="navbar-brand">Outfit AI</span> */}
        </Link>

        {/* Desktop Menu */}
        <div className={`navbar-menu ${isOpen ? "active" : ""}`}>
          <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/wardrobe" className="nav-link" onClick={() => setIsOpen(false)}>Wardrobe</Link>
          <Link to="/recommendations" className="nav-link" onClick={() => setIsOpen(false)}>Recommendations</Link>
          <Link to="/ar-preview" className="nav-link" onClick={() => setIsOpen(false)}>AR Preview</Link>
          <Link to="/shop" className="nav-link" onClick={() => setIsOpen(false)}>Shop</Link>
        </div>

        {/* Icons & Mobile Toggle */}
        <div className="navbar-icons">
          <Link to="/cart" className="icon">
            <ShoppingBag size={24} />
          </Link>
          <Link to="/profile" className="icon">
            <User size={24} />
          </Link>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="navbar-toggle">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar-mobile-menu ${isOpen ? "open" : ""}`}>
        <Link to="/" className="mobile-link" onClick={() => setIsOpen(false)}>Home</Link>
        <Link to="/wardrobe" className="mobile-link" onClick={() => setIsOpen(false)}>Wardrobe</Link>
        <Link to="/recommendations" className="mobile-link" onClick={() => setIsOpen(false)}>Recommendations</Link>
        <Link to="/ar-preview" className="mobile-link" onClick={() => setIsOpen(false)}>AR Preview</Link>
        <Link to="/shop" className="mobile-link" onClick={() => setIsOpen(false)}>Shop</Link>
      </div>
    </nav>
  );
};

export default Navbar;
