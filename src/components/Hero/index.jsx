import { useState } from "react";
import { Play, Star, Users, Award, ArrowRight, X } from 'lucide-react';
import ss from "../../images/screenshots.png";

export default function Hero() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  const stats = [
    { number: "10K+", label: "Active Alumni" },
    { number: "500+", label: "Institutions" },
    { number: "95%", label: "Satisfaction Rate" }
  ];

  return (
    <>
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#0A3A4C] via-[#174873] to-[#71be95]">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-[#71be95] rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-white rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8 pt-[122px] pb-[50px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left text-white space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                <Star className="w-4 h-4 text-yellow-400" />
                Trusted by 500+ Institutions
              </div>

              {/* Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  Revolutionizing
                  <span className="block bg-gradient-to-r from-[#71be95] to-[#5fa080] bg-clip-text text-transparent">
                    Alumni Engagement
                  </span>
                  For Institutions
                </h1>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <p className="text-xl font-semibold">Alumnify - Connect. Engage. Empower</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-lg text-white/90 leading-relaxed max-w-2xl">
                Unite your alumni under one powerful platform. Alumnify helps institutions foster lifelong connections, promote collaboration, and build a strong alumni network.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={togglePopup}
                  className="group bg-gradient-to-r from-[#71be95] to-[#5fa080] hover:from-[#5fa080] hover:to-[#71be95] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2"
                >
                  Schedule Your Free Demo
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button className="group bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#71be95] to-[#5fa080] rounded-3xl blur-2xl opacity-30 transform rotate-6"></div>
                <img
                  src={ss}
                  alt="Alumnify Mobile App"
                  className="relative z-10 max-w-full h-auto max-h-[600px] object-contain transform hover:scale-105 transition-transform duration-300 drop-shadow-2xl"
                />
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
