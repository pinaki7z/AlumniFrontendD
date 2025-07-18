import './displayDonSpon.css';
import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { lineSpinner } from 'ldrs';
import picture from '../../images/pexels-lisa-fotios-1957478.jpg';
import baseUrl from "../../config";
import { 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  User, 
  Building, 
  ArrowRight, 
  Eye, 
  Heart, 
  Share2, 
  ExternalLink, 
  Loader2,
  Plus,
  Filter,
  Search,
  Grid,
  List,
  ChevronDown,
  Clock,
  Tag,
  Target,
  TrendingUp,
  IndianRupee
} from 'lucide-react';

lineSpinner.register();

const DisplayDonSpon = ({ 
  donations, 
  name, 
  updateDonations, 
  totalDonations, 
  page, 
  limit, 
  loading, 
  isLoading 
}) => {
  const location = useLocation();
  const profile = useSelector((state) => state.profile);
  const [edit, setEdit] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [deleting, setDeleting] = useState(null);
  const navigateTo = useNavigate();

  useEffect(() => {
    const editPaths = [
      '/home/donations/my-donation-requests',
      '/home/sponsorships/my-sponsorship-requests'
    ];
    setEdit(editPaths.includes(location.pathname));
  }, [location.pathname]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();

    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };

    return `${day}${getOrdinal(day)} ${month}, ${year}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleDelete = async (_id) => {
    const itemName = name === 'donations' ? 'donation' : 'sponsorship';
    
    if (!window.confirm(`Are you sure you want to delete this ${itemName}? This action cannot be undone.`)) {
      return;
    }

    setDeleting(_id);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/${name}/${_id}`);
      toast.success(`Successfully deleted ${itemName}`);
      
      // Refresh the list without full page reload
      if (updateDonations) {
        updateDonations();
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete ${itemName}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleLoadMore = () => {
    updateDonations();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {name === 'donations' ? (
          <Heart size={32} className="text-gray-400" />
        ) : (
          <Target size={32} className="text-gray-400" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No {name} found
      </h3>
      <p className="text-gray-600 text-center mb-6">
        {edit 
          ? `You haven't created any ${name} yet. Create your first ${name === 'donations' ? 'donation' : 'sponsorship'} request to get started.`
          : `No ${name} are currently available. Check back later for new opportunities.`
        }
      </p>
      {edit && (
        <Link
          to={`/home/${name}/create`}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200"
        >
          <Plus size={16} />
          <span>Create {name === 'donations' ? 'Donation' : 'Sponsorship'}</span>
        </Link>
      )}
    </div>
  );

  const LoadingCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );

  const DonationCard = ({ donation }) => (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden">
      <Link to={`/home/${name}/${donation._id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={donation.picturePath || donation.backgroundImage || picture}
            alt={donation.businessName || donation.nameOfEvent || "Event"}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = picture;
            }}
          />
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
              {donation.status || 'Active'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-[#0A3A4C] transition-colors duration-200">
              {donation.businessName || donation.nameOfEvent || "Title"}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <User size={14} />
              <span>{donation.name || donation.nameOfOrganiser}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={14} />
              <span>{formatDate(donation.createdAt)}</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {truncateText(donation.eventDescription)}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-lg font-bold text-[#0A3A4C]">
              <IndianRupee size={18} />
              <span>{formatCurrency(donation.amount || donation.sponsorshipAmount || 0)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Eye size={14} />
              <span>{donation.views || 0}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Actions */}
      {edit && (
        <div className="px-4 pb-4">
          <div className="flex gap-2">
            <Link 
              to={`/home/${name}/edit/${donation._id}`} 
              className="flex-1"
            >
              <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200 font-medium">
                <Edit size={16} />
                <span>Edit</span>
              </button>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleDelete(donation._id);
              }}
              disabled={deleting === donation._id}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium disabled:opacity-50"
            >
              {deleting === donation._id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              <span>{deleting === donation._id ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const ListItem = ({ donation }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <Link to={`/home/${name}/${donation._id}`} className="block">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-shrink-0">
            <img
              src={donation.picturePath || donation.backgroundImage || picture}
              alt={donation.businessName || donation.nameOfEvent || "Event"}
              className="w-full sm:w-24 h-24 object-cover rounded-lg"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">
                {donation.businessName || donation.nameOfEvent || "Title"}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                {donation.status || 'Active'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <User size={14} />
                <span>{donation.name || donation.nameOfOrganiser}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{formatDate(donation.createdAt)}</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {truncateText(donation.eventDescription)}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-lg font-bold text-[#0A3A4C]">
                <IndianRupee size={18} />
                <span>{formatCurrency(donation.amount || donation.sponsorshipAmount || 0)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Eye size={14} />
                <span>{donation.views || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
      
      {edit && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
          <Link 
            to={`/home/${name}/edit/${donation._id}`} 
            className="flex-1"
          >
            <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200 font-medium">
              <Edit size={16} />
              <span>Edit</span>
            </button>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleDelete(donation._id);
            }}
            disabled={deleting === donation._id}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium disabled:opacity-50"
          >
            {deleting === donation._id ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            <span>{deleting === donation._id ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2 py-4">
        {Array.from({ length: 6 }, (_, index) => (
          <LoadingCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="px-2 py-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {totalDonations} {name} found
          </span>
          {totalDonations > 0 && (
            <span className="text-sm text-gray-400">
              • Showing {donations?.length || 0}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {donations && donations.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {donations.map((donation) => (
                <DonationCard key={donation._id} donation={donation} />
              ))}
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {donations.map((donation) => (
                <ListItem key={donation._id} donation={donation} />
              ))}
            </div>
          )}
          
          {/* Load More */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 size={20} className="animate-spin" />
                <span>Loading more...</span>
              </div>
            </div>
          )}
          
          {page < totalDonations / limit && !isLoading && (
            <div className="flex justify-center">
              <button
                onClick={handleLoadMore}
                className="flex items-center gap-2 px-6 py-3 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200 font-medium"
              >
                <Plus size={16} />
                <span>Load More</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

export default DisplayDonSpon;
