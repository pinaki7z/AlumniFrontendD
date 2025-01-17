// import Image from 'next/image'
import { Link } from "react-router-dom";
import { FaLinkedin } from "react-icons/fa6";
import { FiInstagram } from "react-icons/fi";
import { IoLogoFacebook } from "react-icons/io5";

export default function Footer() {
  return (
    <footer className="bg-dark text-light py-4">
      <div className="container">
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between">
          <div className="mb-3 mb-md-0">
            Copyright © 2025 Alumnify by InsideOut. All rights reserved
          </div>
          <div className="d-flex align-items-center gap-3">
            <Link to="https://www.facebook.com/insideoutconsult/" className="d-flex align-items-center justify-content-center rounded-circle " style={{ width: '32px', height: '32px' }}>
              <div>
                <IoLogoFacebook color="#38A750" style={{ width: "30px", height: "30px" }} />
              </div>
            </Link>
            <Link to="https://www.instagram.com/insideoutconsultants/" className="d-flex align-items-center justify-content-center rounded-circle " style={{ width: '32px', height: '32px' }}>
              <div >
                <FiInstagram color="#38A750" style={{ width: "30px", height: "30px" }} />
              </div>
            </Link>
            <Link to="https://www.linkedin.com/company/inside-out-value-consultancy/" className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '32px', height: '32px' }}>
              <div >
                <FaLinkedin color="#38A750" style={{ width: "30px", height: "30px" }} />
              </div>
            </Link>
          </div>
          <div
            className="d-flex align-items-center gap-1 mt-3 mt-md-0"
            onClick={() => window.open('https://www.insideoutconsult.com', '_blank')}
            style={{ cursor: 'pointer' }}
          >
            <span>Powered by</span>
            <span style={{ color: '#54cd52' }}>InsideOut</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
