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
  Calendar,
  Briefcase,
  MapPin,
  DollarSign
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSocket } from "../../contexts/SocketContext";

const RightSidebar = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const socketRef = useRef(socket);

  const [onlineCount, setOnlineCount] = useState(0);
  const [jobsInternships, setJobsInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socketRef.current.connect();

    socketRef.current.on("connect", () => {
      console.log("Connected to socket:", socketRef.current.id);
    });

    socket.on("online-users", list => setOnlineCount(list?.length));

    // Fetch jobs and internships
    fetchJobsInternships();

    return () => {
      socketRef.current?.off("online-users");
      socketRef.current?.disconnect();
    };
  }, []);

  const fetchJobsInternships = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/internships`);
      const data = await response.json();

      // Get only the latest 4 items and filter approved ones
      const latestItems = data
        .filter(item => item.approved === true)
        .slice(0, 4);

      setJobsInternships(latestItems);
    } catch (error) {
      console.error('Error fetching jobs/internships:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format salary display
  const formatSalary = (min, max, currency = 'USD') => {
    if (!min && !max) return 'Salary not disclosed';
    if (min && max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }
    return min ? `${currency} ${min.toLocaleString()}+` : `Up to ${currency} ${max.toLocaleString()}`;
  };

  // Calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 48) return '1d';
    return `${Math.floor(diffInHours / 24)}d`;
  };

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

  const handleJobClick = (job) => {
    navigate(`/home/jobs/${job._id}/jobs`);
  };

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

      {/* Jobs/Internships Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 ">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Latest Opportunities</h3>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        <div className="p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#71be95]"></div>
            </div>
          ) : jobsInternships.length > 0 ? (
            jobsInternships.slice(0, 3).map((item) => (
              <div key={item._id} onClick={() => handleJobClick(item)} className="group cursor-pointer">
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 overflow-hidden">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-medium text-gray-600">
                      {item.company?.charAt(0) || 'J'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.company}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 font-medium ${item.type === 'Job'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                        }`}>
                        {item.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      {item.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{item.location}</span>
                        </div>
                      )}

                    

                      
                    </div>

                    {item.employmentType && (
                      <div className="mt-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                          {item.employmentType}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No opportunities available</p>
            </div>
          )}

          {!loading && jobsInternships.length > 0 && (
            <Link
              to="/home/jobs"
              className="block w-full text-center py-2 text-sm text-[#71be95] hover:text-[#5fa080] font-medium transition-colors"
            >
              View All Opportunities
            </Link>
          )}
        </div>
      </div>



    </div>
  );
};

export default RightSidebar;
