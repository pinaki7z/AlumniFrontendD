import React, { useEffect, useState, useRef } from 'react';
import profilepic from "../../images/profilepic.jpg";
import './sideWidgets.css';
import { 
  Users, 
  UserPlus, 
  Eye, 
  Heart, 
  MessageCircle, 
  RefreshCw,
  TrendingUp,
  Activity,
  Send,
  ExternalLink,
  UserCheck,
  Loader2
} from 'lucide-react';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../store/profileSlice';
import { toast } from "react-toastify";
import { lineSpinner } from 'ldrs';

lineSpinner.register();

const SideWidgets = () => {
  const [cookie, setCookie] = useCookies(["access_token"]);
  const profile = useSelector((state) => state.profile);
  const [notifications, setNotifications] = useState([]);
  const members = useSelector((state) => state.member);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isloading, setIsLoading] = useState({});
  const [load, setLoad] = useState(false);
  const itemsPerPage = 3;
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');

  const fetchNotifications = async () => {
    setLoad(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/notifications`);
      const sortedNotifications = response.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setNotifications(sortedNotifications);
    } catch (error) {
      console.log('error', error);
    }
    setLoad(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [isloading]);



  const handleInvite = async () => {
    if (!email) return toast.error("Please enter an email address.");

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/invite`, { email });
      toast.success("Invitation sent successfully!");
      setEmail('');
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error("Failed to send invitation.");
    }
  };

  const followingIds = profile?.following?.map((follow) => follow.userId);
  const peopleYouMayKnow = members?.filter(member => 
    !followingIds?.includes(member._id) && member._id !== profile._id
  ).slice(0, 5); // Limit to 5 suggestions

  const handleFollowToggle = async (memberId, firstName, lastName) => {
    setIsLoading(prevLoading => ({ ...prevLoading, [memberId]: true }));
    try {
      const response = await axios.patch(`${process.env.REACT_APP_API_URL}/alumni/${memberId}/follow`, {
        userId: profile._id,
        requestedUserName: `${profile.firstName} ${profile.lastName}`,
        followedUserName: `${firstName} ${lastName}`
      });

      if (response.status === 200) {
        const responseData = await response.data;
        const { alumni } = responseData;
        dispatch(updateProfile(alumni));
        toast.success('Followed successfully!');
        setLoading(!loading);
      }
      setIsLoading(prevLoading => ({ ...prevLoading, [memberId]: false }));
    } catch (error) {
      console.error("Error toggling follow status:", error);
      toast.error("Failed to follow user");
      setIsLoading(prevLoading => ({ ...prevLoading, [memberId]: false }));
    }
  };

  const timeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) {
        return `${count}${interval.label.charAt(0)}`;
      }
    }

    return 'now';
  };

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Background */}
        <div className="h-16 bg-gradient-to-r from-[#0A3A4C] to-[#174873]"></div>
        
        {/* Profile Content */}
        <div className="relative px-4 pb-4">
          {/* Profile Image */}
          <div className="flex justify-center -mt-8 mb-3">
            <div className="relative">
              <img 
                src={profile.profilePicture || profilepic} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="text-center">
            <Link to='/home/profile' className="no-underline">
              <h3 className="font-semibold text-gray-900 hover:text-[#71be95] transition-colors">
                {profile.firstName} {profile.lastName}
              </h3>
            </Link>
            <p className="text-sm text-gray-600 mb-3">
              {profile.department || 'Member'}
            </p>
            
            {/* Stats */}
            <div className="flex justify-center gap-6 pt-3 border-t border-gray-100">
              <Link to="/home/profile" className="text-center no-underline text-gray-700 hover:text-[#71be95] transition-colors">
                <div className="font-semibold text-[#0A3A4C]">5</div>
                <div className="text-xs text-gray-600">Posts</div>
              </Link>
              <Link to="/home/profile" className="text-center no-underline text-gray-700 hover:text-[#71be95] transition-colors">
                <div className="font-semibold text-[#0A3A4C]">{profile.following?.length || 0}</div>
                <div className="text-xs text-gray-600">Following</div>
              </Link>
              <Link to="/home/profile" className="text-center no-underline text-gray-700 hover:text-[#71be95] transition-colors">
                <div className="font-semibold text-[#0A3A4C]">{profile.followers?.length || 0}</div>
                <div className="text-xs text-gray-600">Followers</div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* People You May Know */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#71be95]" />
            <h3 className="font-semibold text-gray-900">Suggestions</h3>
          </div>
          <button
            onClick={() => setLoading(!loading)}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
          {peopleYouMayKnow?.length > 0 ? (
            peopleYouMayKnow.map((member) => (
              <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Link
                  to={`/home/members/${member._id}`}
                  className="flex items-center gap-3 flex-1 no-underline"
                >
                  <div className="relative">
                    <img
                      src={member.profilePicture || profilepic}
                      alt={member.firstName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {member.firstName} {member.lastName}
                    </h4>
                    <p className="text-xs text-gray-600 truncate">
                      {member.department || 'Alumni'}
                    </p>
                  </div>
                </Link>
                
                <button
                  onClick={() => handleFollowToggle(member._id, member.firstName, member.lastName)}
                  disabled={isloading[member._id]}
                  className="px-3 py-1.5 bg-[#71be95] hover:bg-[#5fa080] text-white text-xs font-medium rounded-full transition-colors disabled:opacity-50"
                >
                  {isloading[member._id] ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    'Follow'
                  )}
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No suggestions available</p>
            </div>
          )}
        </div>
      </div>

    

    </div>
  );
};

export default SideWidgets;
