import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Calendar, 
  Briefcase, 
  Heart,
  ArrowRight 
} from 'lucide-react';

export default function CoreFeatures() {
  const features = [
    {
      title: "Dynamic Dashboard",
      icon: BarChart3,
      items: [
        "Stay informed and engaged with our intuitive dashboard",
        "Browse feeds and trending posts", 
        "Virtual walls for polls and engage with other effectively"
      ]
    },
    {
      title: "Alumni Directory",
      icon: Users,
      items: [
        "Advanced search options to filter by batch, year, profession, or role",
        "Build a robust network of alumni and current students"
      ]
    },
    {
      title: "Interactive Engagement Tools",
      icon: MessageSquare,
      items: [
        "Keep your alumni engaged and involved",
        "Organize virtual alumni groups and host discussions",
        "Share news, updates, and achievements from the institution"
      ]
    },
    {
      title: "Events Management",
      icon: Calendar,
      items: [
        "Simplify event planning and participation",
        "Plan and manage reunions, webinars, and more",
        "Enable alumni to RSVP and track attendance seamlessly"
      ]
    },
    {
      title: "Business & Career Opportunities",
      icon: Briefcase,
      items: [
        "Bridge the gap between alumni and students",
        "Share job opportunities and entrepreneurial ventures",
        "Offer mentorship opportunities and guidance through alumni"
      ]
    },
    {
      title: "Sponsorship & Support",
      icon: Heart,
      items: [
        "Leverage alumni contributions effectively",
        "Alumni can sponsor events",
        "Strengthen institutional growth through their support"
      ]
    }
  ];

  return (
    <section className="py-20 bg-white" id="coreFeatures">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Core Features That Set 
            <span className="block bg-gradient-to-r from-[#71be95] to-[#5fa080] bg-clip-text text-transparent">
              Alumnify Apart
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful tools designed to strengthen your alumni community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-gray-50 hover:bg-white rounded-2xl p-8 transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-[#71be95]/30 h-full">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#71be95] to-[#5fa080] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-[#71be95] transition-colors">
                      {feature.title}
                    </h3>
                    <ul className="space-y-3">
                      {feature.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <ArrowRight className="w-4 h-4 text-[#71be95] mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
