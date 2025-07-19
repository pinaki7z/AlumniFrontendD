import './donSpon.css';
import { 
  TrendingUp, 
  Users, 
  Handshake, 
  Target, 
  ArrowRight, 
  Sparkles,
  Building,
  Heart,
  DollarSign,
  Globe
} from 'lucide-react';

const DonSpon = ({ 
  title, 
  icon, 
  description, 
  variant = 'default', // default, gradient, minimal, card
  showStats = false,
  stats = [],
  actionButton,
  actionLink,
  className = '',
  children
}) => {
  // Default descriptions based on title
  const getDefaultDescription = (title) => {
    const descriptions = {
      'Donations': 'Support innovative startups and entrepreneurial ventures from our alumni community. Help fund the next generation of business leaders and make a meaningful impact on their journey.',
      'Sponsorships': 'Partner with promising alumni businesses and events. Gain visibility, build relationships, and contribute to the success of our thriving entrepreneurial ecosystem.',
      'Business Connect': 'Discover opportunities, network with fellow alumni entrepreneurs, and explore collaboration possibilities in our dynamic Business Connect hub within the alumni portal.',
      'Investment': 'Explore investment opportunities in alumni-led startups and established businesses. Connect with entrepreneurs seeking funding and strategic partnerships.',
      'Mentorship': 'Share your expertise or find guidance from experienced alumni. Build meaningful connections that drive professional growth and business success.',
    };
    return descriptions[title] || 'Discover opportunities, network with fellow alumni entrepreneurs, and explore collaboration possibilities in our dynamic Business Connect hub within the alumni portal.';
  };

  // Get appropriate icon based on title if none provided
  const getDefaultIcon = (title) => {
    const icons = {
      'Donations': <Heart size={28} className="text-[#0A3A4C]" />,
      'Sponsorships': <Handshake size={28} className="text-[#0A3A4C]" />,
      'Business Connect': <Building size={28} className="text-[#0A3A4C]" />,
      'Investment': <DollarSign size={28} className="text-[#0A3A4C]" />,
      'Mentorship': <Users size={28} className="text-[#0A3A4C]" />,
    };
    return icons[title] || <Globe size={28} className="text-[#0A3A4C]" />;
  };

  const finalDescription = description || getDefaultDescription(title);
  const finalIcon = getDefaultIcon(title);

  const getVariantStyles = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-r from-[#CEF3DF] to-[#A8E6CF] border border-[#0A3A4C]/20';
      case 'minimal':
        return 'bg-white border-l-4 border-[#0A3A4C] shadow-md';
      case 'card':
        return 'bg-white shadow-lg border border-gray-200';
      default:
        return 'bg-[#CEF3DF]';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`${getVariantStyles()} rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 shadow-lg`}>
        {/* Main Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            {/* Icon */}
            <div className="">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm">
                {finalIcon}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#136175] mb-2 sm:mb-3">
                    {title}
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-[#136175]/80 leading-relaxed">
                    {finalDescription}
                  </p>

                  {/* Additional Content */}
                  {children && (
                    <div className="mt-4">
                      {children}
                    </div>
                  )}

                  {/* Action Button */}
                  {actionButton && actionLink && (
                    <div className="mt-4 sm:mt-6">
                      <a
                        href={actionLink}
                        className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-all duration-200 font-medium text-sm sm:text-base shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <span>{actionButton}</span>
                        <ArrowRight size={16} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Stats Section */}
                {showStats && stats.length > 0 && (
                  <div className="flex-shrink-0">
                    <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 min-w-[200px]">
                      <div className="space-y-2 sm:space-y-3">
                        {stats.map((stat, index) => (
                          <div key={index} className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-[#0A3A4C]">
                              {stat.value}
                            </div>
                            <div className="text-xs sm:text-sm text-[#136175]/70">
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>


        </div>

 
      </div>
    </div>
  );
};

export default DonSpon;
