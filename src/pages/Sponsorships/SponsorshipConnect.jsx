// components/SponsorshipConnect.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Building,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  MapPin,
  Users,
  Eye,
  Star,
  Clock,
  TrendingUp,
  Award,
  Zap,
  Target,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

const SponsorshipConnect = () => {
  const navigate = useNavigate();
  const profile = useSelector((state) => state.profile);
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0,
    totalAmount: 0
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Event', label: 'Event Sponsorship' },
    { value: 'Product', label: 'Product Sponsorship' },
    { value: 'Service', label: 'Service Sponsorship' },
    { value: 'Content', label: 'Content Sponsorship' },
    { value: 'Community', label: 'Community Sponsorship' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Fetch sponsorships
  const fetchSponsorships = async () => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_API_URL}/api/sponsorship/all`;
      let params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      params.append('limit', '12');

      const response = await fetch(`${url}?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setSponsorships(result.sponsorships);
      } else {
        toast.error(result.message || 'Failed to fetch sponsorships');
        setSponsorships([]);
      }
    } catch (error) {
      console.error('Error fetching sponsorships:', error);
      toast.error('Failed to fetch sponsorships');
      setSponsorships([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sponsorship/stats/overview`);
      const result = await response.json();
      
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchSponsorships();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSponsorships();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedStatus]);

  const SponsorshipCard = ({ sponsorship }) => (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="relative h-32 sm:h-40 overflow-hidden">
        {sponsorship.images && sponsorship.images[0] ? (
          <img
            src={sponsorship.images[0]}
            alt={sponsorship.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0A3A4C] via-[#174873] to-[#2A5F7A] flex items-center justify-center relative overflow-hidden">
            <Award size={32} className="text-white/90 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            sponsorship.status === 'active' ? 'bg-green-100 text-green-800' :
            sponsorship.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            sponsorship.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
          </span>
        </div>
        
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full text-xs font-medium">
            {sponsorship.category}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {sponsorship.title}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Eye size={14} />
            <span>{sponsorship.views || 0}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {sponsorship.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign size={14} />
            <span className="font-semibold">₹{sponsorship.amount.toLocaleString()}</span>
            {sponsorship.duration && <span>for {sponsorship.duration}</span>}
          </div>
          
          {sponsorship.eventDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={14} />
              <span>{new Date(sponsorship.eventDate).toLocaleDateString()}</span>
            </div>
          )}
          
          {sponsorship.eventLocation && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={14} />
              <span>{sponsorship.eventLocation}</span>
            </div>
          )}
          
          {sponsorship.expectedAudience && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={14} />
              <span>{sponsorship.expectedAudience.toLocaleString()} expected audience</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              <Building size={12} className="text-gray-500" />
            </div>
            <span className="text-sm text-gray-600">{sponsorship.sponsorName}</span>
          </div>
          
          <button 
            onClick={() => navigate(`/home/sponsorship-connect/${sponsorship._id}`)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium"
          >
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center">
              <Award size={16} className="sm:size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Sponsorship Connect
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Discover and create sponsorship opportunities
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link
              to="/home/sponsorship-connect/create"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium"
            >
              <Plus size={16} />
              <span>Create Sponsorship</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Award size={16} className="text-gray-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Active</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock size={16} className="text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target size={16} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-lg sm:text-2xl font-bold text-gradient-to-r from-[#0A3A4C] to-[#174873]">₹{(stats.totalAmount / 100000).toFixed(1)}L</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search sponsorships..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-[#0A3A4C]" />
          </div>
        )}

        {/* Sponsorships Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sponsorships.map((sponsorship) => (
              <SponsorshipCard key={sponsorship._id} sponsorship={sponsorship} />
            ))}
          </div>
        )}

        {!loading && sponsorships.length === 0 && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No sponsorships found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'No sponsorships match your search criteria.' : 'No sponsorships available at the moment.'}
            </p>
            <Link
              to="/home/sponsorship-connect/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium"
            >
              <Plus size={16} />
              Create First Sponsorship
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorshipConnect;
