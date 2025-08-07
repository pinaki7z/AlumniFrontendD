import { useState } from "react";
import { Mail, Phone, Calendar, X, MessageCircle, Send } from 'lucide-react';

export default function Contact() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white" id="contactUs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contact Info */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#71be95]/10 text-[#71be95] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <MessageCircle className="w-4 h-4" />
                Ready to Get Started?
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Contact Us For A 
                <span className="block bg-gradient-to-r from-[#71be95] to-[#5fa080] bg-clip-text text-transparent">
                  Free Demo
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Discover how Alumnify can transform your institution's alumni network and boost engagement like never before.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-12 h-12 bg-[#71be95]/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#71be95]" />
                  </div>
                  <span>Schedule a personalized demo session</span>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-12 h-12 bg-[#71be95]/10 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-[#71be95]" />
                  </div>
                  <span>Get expert consultation on your needs</span>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-12 h-12 bg-[#71be95]/10 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-[#71be95]" />
                  </div>
                  <span>Discuss implementation strategies</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={togglePopup}
                  className="group bg-gradient-to-r from-[#71be95] to-[#5fa080] hover:from-[#5fa080] hover:to-[#71be95] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Your Free Demo Now
                </button>
                
                <a
                  href="mailto:mail@insideoutconsult.com"
                  className="group bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-[#71be95] px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5 group-hover:text-[#71be95]" />
                  Mail Us
                </a>
              </div>
            </div>

            {/* Visual Element */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#71be95] to-[#5fa080] rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#71be95] to-[#5fa080] rounded-2xl flex items-center justify-center mx-auto">
                    <Send className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Ready to Transform Your Alumni Network?</h3>
                  <p className="text-gray-600">Join hundreds of institutions already using Alumnify to build stronger alumni communities.</p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-[#71be95]">500+</div>
                      <div className="text-sm text-gray-600">Institutions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#71be95]">10K+</div>
                      <div className="text-sm text-gray-600">Alumni</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Popup */}
      {isPopupVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="dynamic-site-bg text-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Schedule Your Free Demo</h3>
                <button
                  onClick={togglePopup}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <iframe
              aria-label="Alumnify Contact Form"
              className="w-full h-[500px] border-none"
              src="https://forms.zohopublic.in/desiaddacraftworksllp/form/AlumnifyLPForm/formperma/JGDf1WBWXBejpFdyXrTA5BBkeTwIf_XGUvc1dYVkymM"
            />
          </div>
        </div>
      )}
    </>
  );
}
