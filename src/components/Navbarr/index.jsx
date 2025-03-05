
// import { Link } from "react-router-dom";
// import './Navbar.css';
// import io from "../../images/logo-io.png";
// import { IoLogoFacebook } from "react-icons/io5";
// import { FiInstagram } from "react-icons/fi";
// import { FaLinkedin } from "react-icons/fa6";

// export default function Navbar() {
//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top">
//       <div className="container">
//         <Link to="/" className="navbar-brand">
//           <img
//             src={io}
//             alt="InsideOut Logo"
//             width="120px"
//             height="62px"
//             priority
//           />
//         </Link>
//         <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
//           <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className="collapse navbar-collapse" id="navbarNav">
//           <ul className="navbar-nav me-auto mb-2 mb-lg-0">
//             <li className="nav-item">
//               <Link to="#why-choose" className="nav-link text-gray-800 hover:text-green-500">
//                 Why Choose
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link to="#what-makes" className="nav-link text-gray-800 hover:text-green-500">
//                 What Makes
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link to="#core-features" className="nav-link text-gray-800 hover:text-green-500">
//                 Core Features
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link to="#contact-us" className="nav-link text-gray-800 hover:text-green-500">
//                 Contact Us
//               </Link>
//             </li>
//           </ul>
//           <div className="d-flex">
//             <Link to="https://www.facebook.com/insideoutconsult/" className="text-green-500 me-2">
//               <div className="w-6 h-6 bg-green-500" >
//                 <IoLogoFacebook color="#38A750" style={{ width: "30px", height: "30px" }} />
//               </div>
//             </Link>
//             <Link to="https://www.instagram.com/insideoutconsultants/" className="text-green-500 me-2">
//               <div className="w-6 h-6 bg-green-500" >
//                 <FiInstagram color="#38A750" style={{ width: "30px", height: "30px" }} />
//               </div>
//             </Link>
//             <Link to="https://www.linkedin.com/company/inside-out-value-consultancy/" className="text-green-500">
//               <div className="w-6 h-6 bg-green-500">
//                 <FaLinkedin color="#38A750" style={{ width: "30px", height: "30px" }} />
//               </div>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }

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
