import React from 'react';
import { 
  MessageSquare, 
  Newspaper, 
  TrendingUp, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Eye,
  MessageCircle,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

const RightSidebar = () => {
  // Dummy forum data
  const forumTopics = [
    {
      id: 1,
      title: "Career Guidance for Fresh Graduates",
      category: "Career",
      replies: 24,
      lastActivity: "2h",
      isHot: true
    },
    {
      id: 2,
      title: "Alumni Meetup 2025 Planning",
      category: "Events",
      replies: 18,
      lastActivity: "4h",
      isHot: false
    },
    {
      id: 3,
      title: "Tech Industry Trends Discussion",
      category: "Technology",
      replies: 31,
      lastActivity: "6h",
      isHot: true
    },
    {
      id: 4,
      title: "Startup Funding Opportunities",
      category: "Business",
      replies: 12,
      lastActivity: "1d",
      isHot: false
    }
  ];

  // Dummy news data
  const newsItems = [
    {
      id: 1,
      title: "University Announces New Research Center",
      summary: "A state-of-the-art facility focusing on AI and machine learning research...",
      publishedAt: "3h",
      category: "University",
      views: 156
    },
    {
      id: 2,
      title: "Alumni Success Story: Tech Entrepreneur",
      summary: "Meet Sarah Johnson, Class of 2018, who recently launched her third startup...",
      publishedAt: "1d",
      category: "Success Story",
      views: 289
    },
    {
      id: 3,
      title: "Campus Renovation Project Completed",
      summary: "The new student center opens next month with modern facilities...",
      publishedAt: "2d",
      category: "Campus",
      views: 423
    },
    {
      id: 4,
      title: "Industry Partnership Announcement",
      summary: "New collaboration with leading tech companies for internship programs...",
      publishedAt: "3d",
      category: "Partnership",
      views: 201
    }
  ];

  return (
    <div className="space-y-4">
      {/* Forums Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#71be95]" />
            <h3 className="font-semibold text-gray-900">Hot Discussions</h3>
          </div>
          <Link 
            to="/home/forums" 
            className="text-[#71be95] hover:text-[#5fa080] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="p-4 space-y-3">
          {forumTopics.map((topic) => (
            <div key={topic.id} className="group cursor-pointer">
              <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-[#71be95]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-[#71be95]" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-[#71be95] transition-colors">
                      {topic.title}
                    </h4>
                    {topic.isHot && (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                        Hot
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {topic.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MessageCircle className="w-3 h-3" />
                      {topic.replies}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {topic.lastActivity}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <Link
            to="/home/forums"
            className="block w-full text-center py-2 text-sm text-[#71be95] hover:text-[#5fa080] font-medium transition-colors"
          >
            View All Discussions
          </Link>
        </div>
      </div>

      {/* News Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#71be95]" />
            <h3 className="font-semibold text-gray-900">Latest News</h3>
          </div>
          <Link 
            to="/home/news" 
            className="text-[#71be95] hover:text-[#5fa080] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="p-4 space-y-4">
          {newsItems.map((news) => (
            <article key={news.id} className="group cursor-pointer">
              <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Newspaper className="w-4 h-4 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-[#71be95] transition-colors mb-2">
                      {news.title}
                    </h4>
                    
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {news.summary}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {news.category}
                        </span>
                        <span className="text-xs text-gray-500">{news.publishedAt}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Eye className="w-3 h-3" />
                        {news.views}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
          
          <Link
            to="/home/news"
            className="block w-full text-center py-2 text-sm text-[#71be95] hover:text-[#5fa080] font-medium transition-colors"
          >
            Read All News
          </Link>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 p-4 border-b border-gray-100">
          <TrendingUp className="w-5 h-5 text-[#71be95]" />
          <h3 className="font-semibold text-gray-900">Trending</h3>
        </div>
        
        <div className="p-4 space-y-2">
          {[
            { tag: "#AlumniMeetup2025", posts: 45 },
            { tag: "#CareerTips", posts: 32 },
            { tag: "#TechTalks", posts: 28 },
            { tag: "#Entrepreneurship", posts: 19 },
            { tag: "#UniversityNews", posts: 15 }
          ].map((trend, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <span className="text-sm font-medium text-[#71be95]">{trend.tag}</span>
              <span className="text-xs text-gray-500">{trend.posts} posts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 p-4 border-b border-gray-100">
          <ExternalLink className="w-5 h-5 text-[#71be95]" />
          <h3 className="font-semibold text-gray-900">Quick Links</h3>
        </div>
        
        <div className="p-4 space-y-2">
          {[
            { name: "Academic Calendar", href: "/calendar" },
            { name: "Alumni Directory", href: "/directory" },
            { name: "Event Gallery", href: "/gallery" },
            { name: "Career Resources", href: "/careers" },
            { name: "Contact Support", href: "/support" }
          ].map((link, index) => (
            <Link
              key={index}
              to={link.href}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 hover:text-[#71be95] no-underline"
            >
              {link.name}
              <ChevronRight className="w-3 h-3" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
