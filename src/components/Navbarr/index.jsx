import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Navbarr() {
  const [cookies] = useCookies(['token']);
  const token = cookies.token;
  const [expanded, setExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (token) {
      window.location.href = "/home";
    }
  }, [token]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#whyChoose', label: 'Why Choose' },
    { href: '#whatMakes', label: 'What Makes' },
    { href: '#coreFeatures', label: 'Core Features' },
    { href: '#contactUs', label: 'Contact Us' }
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
        : 'bg-white shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img 
              src="/v2/logo2.png" 
              alt="Alumnify Logo" 
              className="h-12 w-auto transition-transform duration-300 group-hover:scale-105" 
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-[#71be95] px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 relative group"
                onClick={() => setExpanded(false)}
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#71be95] to-[#5fa080] transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>
          
          {/* Login Button */}
          <Link to="/login" className="hidden lg:block">
            <button className="bg-gradient-to-r from-[#71be95] to-[#5fa080] hover:from-[#5fa080] hover:to-[#71be95] text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              Login to Alumnify
            </button>
          </Link>
          
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>
        
        {/* Mobile menu */}
        {expanded && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-gray-700 hover:text-[#71be95] py-3 px-4 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  onClick={() => setExpanded(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link to="/login" className="block mt-4">
                <button className="w-full bg-gradient-to-r from-[#71be95] to-[#5fa080] text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300">
                  Login to Alumnify
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
