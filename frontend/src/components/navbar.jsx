import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-screen-xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-gray-800">
          Wardrobe AI
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <Link to="/wardrobe" className="hover:text-blue-600">Wardrobe</Link>
          <Link to="/recommendations" className="hover:text-blue-600">Recommendations</Link>
          <Link to="/ar-preview" className="hover:text-blue-600">AR Preview</Link>
          <Link to="/shop" className="hover:text-blue-600">Shop</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden focus:outline-none"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md py-2">
          <Link to="/" className="block px-6 py-2 hover:bg-gray-100">Home</Link>
          <Link to="/wardrobe" className="block px-6 py-2 hover:bg-gray-100">Wardrobe</Link>
          <Link to="/recommendations" className="block px-6 py-2 hover:bg-gray-100">Recommendations</Link>
          <Link to="/ar-preview" className="block px-6 py-2 hover:bg-gray-100">AR Preview</Link>
          <Link to="/shop" className="block px-6 py-2 hover:bg-gray-100">Shop</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
