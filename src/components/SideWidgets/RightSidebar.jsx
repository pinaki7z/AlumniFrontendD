import React, { useEffect, useRef, useState } from 'react';
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
// import socket from '../../socket';
import { useSocket } from "../../contexts/SocketContext";


const RightSidebar = () => {  
   const socket = useSocket();
    const socketRef = useRef(socket);

      const [onlineCount, setOnlineCount] = useState(0);
    
        useEffect(() => {
    socketRef.current.connect();

    socketRef.current.on("connect", () => {
      console.log("Connected to socket:", socketRef.current.id);
    });
    
    socket.on("online-users", list => setOnlineCount(list?.length));

    return () => {
      socketRef.current?.off("online-users");
      socketRef.current?.disconnect();
    };
  }, []);
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

        {/* Online Users */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-900">Online Now</span>
          </div>
          <div className="bg-[#71be95] text-white text-xs font-bold px-2 py-1 rounded-full">
            {onlineCount || 1}
          </div>
        </div>
      </div>
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

    
    </div>
  );
};

export default RightSidebar;
