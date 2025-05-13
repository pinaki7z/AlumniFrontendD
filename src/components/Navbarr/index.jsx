
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link } from "react-router-dom";
import './Navbar.css';
import io from "../../images/logo-io.png";
import { IoLogoFacebook } from "react-icons/io5";
import { FiInstagram } from "react-icons/fi";
import { FaLinkedin } from "react-icons/fa6";
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
// import Container from 'react-bootstrap/Container';
// import Nav from 'react-bootstrap/Nav';

export default function Navbarr() {
const [cookies] = useCookies(['token']);
const token = cookies.token;
// console.log("tokeeeeeeeeeeeeeeeeeeeeen", token)
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (token) {
      window.location.href = "/home";
    }
  }, []);
  return (
    <nav className="bg-white fixed top-0 w-full shadow-md">
    <div className="container mx-auto flex items-center justify-between py-4 px-6">
      {/* Logo on the left */}
      <Link to="#home" className="flex items-center">
        <img src={io} alt="InsideOut Logo" width="120" height="62" />
      </Link>
      
      {/* Navbar links in the center */}
      <div className="hidden lg:flex lg:items-center lg:space-x-6 text-gray-700 font-medium mx-auto">
        <a href="#whyChoose" className="py-2 lg:py-0">Why Choose</a>
        <a href="#whatMakes" className="py-2 lg:py-0">What Makes</a>
        <a href="#coreFeatures" className="py-2 lg:py-0">Core Features</a>
        <a href="#contactUs" className="py-2 lg:py-0">Contact Us</a>
      </div>
      
      {/* Login button on the right */}
      <Link to="/login" className="hidden lg:block">
        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
          Login to Alumnify
        </button>
      </Link>
      
      {/* Mobile menu toggle button */}
      <button
        className="lg:hidden focus:outline-none"
        onClick={() => setExpanded(!expanded)}
      >
        ☰
      </button>
      
      {/* Mobile menu */}
      {expanded && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-center space-y-4 py-4">
          <a href="#whyChoose" className="py-2">Why Choose</a>
          <a href="#whatMakes" className="py-2">What Makes</a>
          <a href="#coreFeatures" className="py-2">Core Features</a>
          <a href="#contactUs" className="py-2">Contact Us</a>
          <Link to="/login">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Login to Alumnify
            </button>
          </Link>
        </div>
      )}
    </div>
  </nav>
  );
}
