import { useState } from "react";
import { 
  Handshake, 
  DollarSign, 
  GraduationCap, 
  Building2,
  X,
  Calendar,
  ArrowRight,
  Star,
  CheckCircle,
  TrendingUp
} from "lucide-react";

export default function Benefits() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  const benefits = [
    {
      icon: Handshake,
      title: "Enhance Engagement",
      description: "Foster stronger alumni relationships with interactive features and meaningful connections",
      gradient: "from-blue-500 to-indigo-600",
      stats: "85% increase"
    },
    {
      icon: DollarSign,
      title: "Boost Contributions",
      description: "Tap into sponsorships and donations with streamlined processes and transparent tracking",
      gradient: "from-[#71be95] to-[#5fa080]",
      stats: "3x more funding"
    },
    {
      icon: GraduationCap,
      title: "Empower Students",
      description: "Connect them to alumni for guidance, mentoring, and career opportunities that matter",
      gradient: "from-purple-500 to-pink-600",
      stats: "90% satisfaction"
    },
    {
      icon: Building2,
      title: "Elevate Institutional Reputation",
      description: "Build a vibrant, connected, and engaged alumni community that champions your brand",
      gradient: "from-[#0A3A4C] to-[#174873]",
      stats: "Top ranked"
    },
  ];

  return (
    <>
      <section className="py-20 bg-gradient-to-b from-white to-gray-50" id="whyChoose">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#71be95]/10 text-[#71be95] px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Why Choose Alumnify?
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Transform Your Institution With 
              <span className="block bg-gradient-to-r from-[#71be95] to-[#5fa080] bg-clip-text text-transparent">
                Powerful Alumni Engagement
              </span>
            </h2>
            
            <div className="max-w-4xl mx-auto space-y-4">
              <p className="text-xl text-gray-600 leading-relaxed">
                Build Your Legacy to bridge the gap between Alumni and your Institution. Alumnify enables institutions to
                build a thriving alumni ecosystem, fostering collaboration, mentorship, and support among alumni, students,
                and faculty.
              </p>
              
              <div className="bg-gradient-to-r from-[#0A3A4C]/5 to-[#174873]/5 rounded-2xl p-6 border border-[#71be95]/20">
                <p className="text-lg text-gray-700">
                  Your alumni are your greatest advocates and a vital part of your legacy. With{" "}
                  <span className="font-semibold bg-gradient-to-r from-[#71be95] to-[#5fa080] bg-clip-text text-transparent">
                    Alumnify
                  </span>, you can elevate your brand, boost alumni contributions, and create a lasting impact.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-[#71be95]/30"
              >
                {/* Background Gradient Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 text-center">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${benefit.gradient} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <benefit.icon className="w-10 h-10 text-white" />
                  </div>
                  
                  {/* Stats Badge */}
                  <div className="inline-flex items-center gap-1 bg-[#71be95]/10 text-[#71be95] px-3 py-1 rounded-full text-xs font-medium mb-4">
                    <TrendingUp className="w-3 h-3" />
                    {benefit.stats}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-[#71be95] transition-colors">
                    {benefit.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                  
                  {/* Hover Effect Arrow */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-5 h-5 text-[#71be95] mx-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
              {/* Background Effects */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-2xl"></div>
                <div className="absolute bottom-4 left-4 w-24 h-24 bg-[#71be95] rounded-full blur-xl"></div>
              </div>
              
              <div className="relative z-10 max-w-3xl mx-auto">
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                  Ready to Transform Your Alumni Network?
                </h3>
                <p className="text-xl text-white/90 mb-8">
                  Join hundreds of institutions already using Alumnify to build stronger alumni communities.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={togglePopup}
                    className="group bg-gradient-to-r from-[#71be95] to-[#5fa080] hover:from-[#5fa080] hover:to-[#71be95] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Schedule Your Free Demo Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <div className="flex items-center gap-4 text-white/80">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-[#71be95]" />
                      <span className="text-sm">No setup fees</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-[#71be95]" />
                      <span className="text-sm">30-day trial</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm mb-6">Trusted by institutions worldwide</p>
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#71be95]">500+</div>
                <div className="text-sm text-gray-500">Institutions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#71be95]">10K+</div>
                <div className="text-sm text-gray-500">Alumni</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#71be95]">95%</div>
                <div className="text-sm text-gray-500">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Popup */}
      {isPopupVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6" />
                  <h3 className="text-xl font-semibold">Schedule Your Free Demo</h3>
                </div>
                <button
                  onClick={togglePopup}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/80 mt-2">See how Alumnify can transform your alumni engagement</p>
            </div>
            
            {/* Form */}
            <iframe
              aria-label="Alumnify Contact Form"
              className="w-full h-[500px] border-none"
              src="https://forms.zohopublic.in/desiaddacraftworksllp/form/AlumnifyLPForm/formperma/JGDf1WBWXBejpFdyXrTA5BBkeTwIf_XGUvc1dYVkymM"
            />
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slide-in-from-bottom-4 {
          from {
            transform: translateY(1rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .slide-in-from-bottom-4 {
          animation-name: slide-in-from-bottom-4;
        }
        
        .duration-300 {
          animation-duration: 300ms;
        }
      `}</style>
    </>
  );
}
