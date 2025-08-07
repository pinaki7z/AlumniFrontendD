import { Check, Shield, Smartphone, Palette, TrendingUp } from 'lucide-react';

export default function Features() {
  const features = [
    {
      title: "Customizable Design",
      description: "Take the platform to represent your institution's unique culture and brand",
      icon: Palette
    },
    {
      title: "Scalable Solution", 
      description: "Whether you're a small liberal arts college or have a large university network, Alumnify scales with your needs",
      icon: TrendingUp
    },
    {
      title: "Flexibility Across Devices",
      description: "Access Alumnify effortlessly via both a web app and a mobile app, ensuring convenience and accessibility anytime, anywhere",
      icon: Smartphone
    },
    {
      title: "Secure and Reliable",
      description: "Protect sensitive data with robust security measures and privacy controls",
      icon: Shield
    }
  ];

  return (
    <section className="py-20 bg-gray-50" id="whatMakes">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            What Makes Alumnify The 
            <span className="block dynamic-site-bg bg-clip-text text-transparent">
              Ideal Choice
            </span>
            For Your Institution?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the powerful features that set us apart from the competition
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#71be95] to-[#5fa080] rounded-3xl blur-2xl opacity-20"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
              <div className="grid grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`aspect-square rounded-2xl ${
                    i === 1 ? 'bg-gradient-to-br from-[#71be95] to-[#5fa080]' :
                    i === 2 ? 'bg-gradient-to-br from-[#0A3A4C] to-[#174873]' :
                    i === 3 ? 'bg-gradient-to-br from-blue-500 to-purple-600' :
                    'bg-gradient-to-br from-orange-500 to-red-500'
                  } flex items-center justify-center`}>
                    <div className="text-white text-2xl font-bold">{i}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features Side */}
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#71be95] to-[#5fa080] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#71be95] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
