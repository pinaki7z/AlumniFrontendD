// DraftsPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash2, Eye, Calendar, Clock, Tag,
  Search, Filter, MoreVertical, FileText, AlertCircle,
  CheckCircle, Plus, Upload
} from 'lucide-react';

const DraftsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDrafts, setSelectedDrafts] = useState(new Set());

  // Mock draft data
  const drafts = [
    {
      id: 1,
      title: 'Alumni Success Stories: Rising Stars in Tech',
      category: 'achievements',
      lastModified: '2025-01-20T14:30:00Z',
      created: '2025-01-18T10:15:00Z',
      status: 'draft',
      wordCount: 450,
      completionStatus: 85,
      tags: ['Technology', 'Success', 'Alumni'],
      excerpt: 'Highlighting the remarkable achievements of our recent graduates who are making waves in the technology sector...'
    },
    {
      id: 2,
      title: 'Upcoming Alumni Meet 2025: Registration Details',
      category: 'events',
      lastModified: '2025-01-19T16:45:00Z',
      created: '2025-01-17T09:20:00Z',
      status: 'pending_review',
      wordCount: 320,
      completionStatus: 70,
      tags: ['Events', 'Alumni Meet', 'Registration'],
      excerpt: 'Complete details about the upcoming alumni meet including venue, schedule, and registration process...'
    },
    {
      id: 3,
      title: 'Career Opportunities in Emerging Markets',
      category: 'careers',
      lastModified: '2025-01-21T11:20:00Z',
      created: '2025-01-20T08:30:00Z',
      status: 'draft',
      wordCount: 680,
      completionStatus: 95,
      tags: ['Careers', 'Market Trends', 'Opportunities'],
      excerpt: 'Exploring new career opportunities in emerging markets and how alumni can capitalize on these trends...'
    },
    {
      id: 4,
      title: 'Innovation Hub Launch Ceremony',
      category: 'announcements',
      lastModified: '2025-01-18T09:15:00Z',
      created: '2025-01-16T14:45:00Z',
      status: 'rejected',
      wordCount: 290,
      completionStatus: 60,
      tags: ['Innovation', 'Launch', 'University'],
      excerpt: 'Join us for the grand opening of our new innovation hub designed to foster entrepreneurship...'
    },
    {
      id: 5,
      title: 'Research Collaboration with Industry Leaders',
      category: 'academics',
      lastModified: '2025-01-22T13:30:00Z',
      created: '2025-01-21T11:00:00Z',
      status: 'draft',
      wordCount: 520,
      completionStatus: 80,
      tags: ['Research', 'Collaboration', 'Industry'],
      excerpt: 'Exciting new partnerships with leading companies to advance research in artificial intelligence...'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'pending_review': return 'Pending Review';
      case 'rejected': return 'Rejected';
      default: return 'Draft';
    }
  };

  const handleSelectDraft = (draftId) => {
    const newSelected = new Set(selectedDrafts);
    if (newSelected.has(draftId)) {
      newSelected.delete(draftId);
    } else {
      newSelected.add(draftId);
    }
    setSelectedDrafts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedDrafts.size === filteredDrafts.length && filteredDrafts.length > 0) {
      setSelectedDrafts(new Set());
    } else {
      setSelectedDrafts(new Set(filteredDrafts.map(d => d.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedDrafts.size > 0) {
      const confirmed = window.confirm(`Are you sure you want to delete ${selectedDrafts.size} draft(s)?`);
      if (confirmed) {
        // Handle bulk delete logic here
        console.log('Deleting drafts:', Array.from(selectedDrafts));
        setSelectedDrafts(new Set());
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    }
  };

  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         draft.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || draft.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/home/news')}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0A3A4C] transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to News</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Draft Articles</h1>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search drafts..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 w-full sm:w-64"
                />
              </div>

              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending_review">Pending Review</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex gap-3">
              {selectedDrafts.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <Trash2 size={16} />
                  Delete ({selectedDrafts.size})
                </button>
              )}
              
              <button
                onClick={() => navigate('/home/news/create')}
                className="flex items-center gap-2 px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200"
              >
                <Plus size={16} />
                New Draft
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Drafts"
            value={drafts.length}
            subtitle="All drafts"
            color="bg-blue-100 text-blue-800"
          />
          <StatCard
            title="Draft"
            value={drafts.filter(d => d.status === 'draft').length}
            subtitle="Work in progress"
            color="bg-gray-100 text-gray-800"
          />
          <StatCard
            title="Pending Review"
            value={drafts.filter(d => d.status === 'pending_review').length}
            subtitle="Awaiting approval"
            color="bg-yellow-100 text-yellow-800"
          />
          <StatCard
            title="Rejected"
            value={drafts.filter(d => d.status === 'rejected').length}
            subtitle="Need revision"
            color="bg-red-100 text-red-800"
          />
        </div>

        {/* Drafts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDrafts.size === filteredDrafts.length && filteredDrafts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-[#0A3A4C] focus:ring-[#0A3A4C]"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Progress</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Last Modified</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDrafts.map((draft) => (
                  <DraftRow
                    key={draft.id}
                    draft={draft}
                    isSelected={selectedDrafts.has(draft.id)}
                    onSelect={() => handleSelectDraft(draft.id)}
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                    getStatusLabel={getStatusLabel}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredDrafts.length === 0 && (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Start writing your first article'}
              </p>
              <button
                onClick={() => navigate('/home/news/create')}
                className="dynamic-site-bg text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity duration-200"
              >
                Create Article
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, color }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <div className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        {value}
      </div>
    </div>
  </div>
);

// Draft Row Component
const DraftRow = ({ draft, isSelected, onSelect, formatDate, getStatusColor, getStatusLabel }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleEdit = () => {
    navigate(`/home/news/edit/${draft.id}`);
  };

  const handlePreview = () => {
    navigate(`/home/news/preview/${draft.id}`);
  };

  const handleDelete = () => {
    const confirmed = window.confirm('Are you sure you want to delete this draft?');
    if (confirmed) {
      // Handle delete logic here
      console.log('Deleting draft:', draft.id);
    }
  };

  const handleDuplicate = () => {
    console.log('Duplicating draft:', draft.id);
    // Handle duplicate logic here
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-200">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded border-gray-300 text-[#0A3A4C] focus:ring-[#0A3A4C]"
        />
      </td>
      
      <td className="px-4 py-4">
        <div>
          <h3 
            className="font-medium text-gray-900 hover:text-[#0A3A4C] cursor-pointer transition-colors duration-200"
            onClick={handleEdit}
          >
            {draft.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{draft.excerpt}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {draft.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                {tag}
              </span>
            ))}
            {draft.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{draft.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </td>
      
      <td className="px-4 py-4">
        <span className="capitalize text-sm text-gray-700">{draft.category}</span>
      </td>
      
      <td className="px-4 py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(draft.status)}`}>
          {getStatusLabel(draft.status)}
        </span>
      </td>
      
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="dynamic-site-bg h-2 rounded-full transition-all duration-300"
              style={{ width: `${draft.completionStatus}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-600">{draft.completionStatus}%</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{draft.wordCount} words</p>
      </td>
      
      <td className="px-4 py-4">
        <div className="text-sm text-gray-700">
          {formatDate(draft.lastModified)}
        </div>
        <div className="text-xs text-gray-500">
          Created {formatDate(draft.created)}
        </div>
      </td>
      
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="p-1 text-gray-600 hover:text-[#0A3A4C] hover:bg-gray-100 rounded transition-colors duration-200"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={handlePreview}
            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
            title="Preview"
          >
            <Eye size={16} />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors duration-200"
            >
              <MoreVertical size={16} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={handleDuplicate}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Duplicate
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <Trash2 size={14} className="inline mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default DraftsPage;
