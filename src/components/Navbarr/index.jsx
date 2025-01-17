
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
import { useState } from 'react';
// import Container from 'react-bootstrap/Container';
// import Nav from 'react-bootstrap/Nav';

export default function Navbarr() {

  const [expanded, setExpanded] = useState(false);
  return (
    <Navbar collapseOnSelect expand="lg" className="navbar-light bg-white fixed-top "  expanded={expanded}>
      <Container>
        {/* <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand> */}
        <Link to="#home" className="navbar-brand">
          <img
            src={io}
            alt="InsideOut Logo"
            width="120px"
            height="62px"
            priority
          />
        </Link>
        <Navbar.Toggle aria-controls="responsive-navbar-nav"  onClick={() => setExpanded((prev) => !prev)} />
        <Navbar.Collapse id="responsive-navbar-nav" className={expanded ? "custom-collapse expanded" : "custom-collapse"}>
          <Nav className="me-auto" style={{ marginLeft: 'auto' }}>
            <Nav.Link href="#whyChoose">Why Choose</Nav.Link>
            <Nav.Link href="#whatMakes">What Makes</Nav.Link>
            {/* <NavDropdown title="Dropdown" id="collapsible-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown> */}
            <Nav.Link href="#coreFeatures">Core Features</Nav.Link>
            <Nav.Link href="#contactUs">Contact Us</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link href="https://www.facebook.com/insideoutconsult/"><div className="w-6 h-6 bg-green-500" >
              <IoLogoFacebook color="#38A750" style={{ width: "30px", height: "30px" }} />
            </div></Nav.Link>
            <Nav.Link href="https://www.instagram.com/insideoutconsultants/"><div className="w-6 h-6 bg-green-500" >
              <FiInstagram color="#38A750" style={{ width: "30px", height: "30px" }} />
            </div></Nav.Link>
            <Nav.Link href="https://www.linkedin.com/company/inside-out-value-consultancy/"><div className="w-6 h-6 bg-green-500">
              <FaLinkedin color="#38A750" style={{ width: "30px", height: "30px" }} />
            </div></Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
