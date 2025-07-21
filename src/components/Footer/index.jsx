import { Link } from "react-router-dom";
import { FaLinkedin, FaFacebookF, FaInstagram } from "react-icons/fa";
import { Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  const socialLinks = [
    {
      href: "https://www.facebook.com/insideoutconsult/",
      icon: FaFacebookF,
      label: "Facebook"
    },
    {
      href: "https://www.instagram.com/insideoutconsultants/",
      icon: FaInstagram,
      label: "Instagram"
    },
    {
      href: "https://www.linkedin.com/company/inside-out-value-consultancy/",
      icon: FaLinkedin,
      label: "LinkedIn"
    }
  ];

  return (
    <footer className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <img src="/v2/logo2.png" alt="Alumnify Logo" className="h-12 w-auto" />
            <p className="text-white/80 leading-relaxed">
              Revolutionizing alumni engagement for institutions worldwide. Connect, engage, and empower your alumni community.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-[#71be95] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              {[
                { href: '#whyChoose', label: 'Why Choose Us' },
                { href: '#whatMakes', label: 'What Makes Us Different' },
                { href: '#coreFeatures', label: 'Core Features' },
                { href: '#contactUs', label: 'Contact Us' }
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-white/80 hover:text-[#71be95] transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Get In Touch</h3>
            <div className="space-y-3">
              <a
                href="mailto:mail@insideoutconsult.com"
                className="flex items-center gap-3 text-white/80 hover:text-[#71be95] transition-colors duration-200"
              >
                <Mail className="w-5 h-5" />
                mail@insideoutconsult.com
              </a>
              <div className="flex items-center gap-3 text-white/80">
                <MapPin className="w-5 h-5" />
                Building stronger alumni networks
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm text-center lg:text-left">
              Copyright © 2025 Alumnify by InsideOut. All rights reserved
            </p>
            
            <button
              onClick={() => window.open('https://www.insideoutconsult.com', '_blank')}
              className="flex items-center gap-2 text-white/80 hover:text-[#71be95] transition-colors duration-200 cursor-pointer"
            >
              <span className="text-sm">Made with</span>
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-sm">by</span>
              <span className="text-[#71be95] font-semibold">InsideOut</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
