import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Users, 
  MessageSquare, 
  Briefcase, 
  GraduationCap,
  UserCircle,
  Building,
  Calendar,
  Loader2,
  Filter,
  SortAsc,
  Grid,
  List,
  ArrowRight,
  X
} from 'lucide-react';
import Profilecard from '../Profilecard';
import DisplayPost from '../DisplayPost';
import JobPost from '../JobPost';

export const SearchedResults = () => {
  const location = useLocation();
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  
  const searchParams = new URLSearchParams(location.search);
  const searchKeyword = searchParams.get('search');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchKeyword = searchParams.get('search');

    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/search/search?keyword=${searchKeyword}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setSearchResults(null);
      } finally {
        setLoading(false);
      }
    };

    if (searchKeyword) {
      fetchSearchResults();
    }
  }, [location.search]);

  // Calculate total results
  const getTotalResults = () => {
    if (!searchResults) return 0;
    return Object.values(searchResults).reduce((total, category) => {
      return total + (Array.isArray(category) ? category.length : 0);
    }, 0);
  };

  // Filter categories
  const getFilteredCategories = () => {
    if (!searchResults) return [];
    
    const categories = [
      { key: 'alumni', label: 'Members', icon: Users, count: searchResults.alumni?.length || 0 },
      { key: 'forum', label: 'Forums', icon: MessageSquare, count: searchResults.forum?.length || 0 },
      { key: 'group', label: 'Groups', icon: Building, count: searchResults.group?.length || 0 },
      { key: 'job', label: 'Jobs', icon: Briefcase, count: searchResults.job?.length || 0 },
      { key: 'internship', label: 'Internships', icon: GraduationCap, count: searchResults.internship?.length || 0 }
    ];

    return categories.filter(cat => cat.count > 0);
  };

  const filteredCategories = getFilteredCategories();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 dynamic-site-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Searching...</h3>
          <p className="text-gray-600">Finding the best results for "{searchKeyword}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#71be95] to-[#5fa080] rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Search Results
              </h1>
              <p className="text-gray-600 mt-1">
                {getTotalResults()} results found for "{searchKeyword}"
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          {filteredCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeFilter === 'all'
                    ? 'bg-gradient-to-r from-[#71be95] to-[#5fa080] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({getTotalResults()})
              </button>
              {filteredCategories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveFilter(category.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeFilter === category.key
                      ? 'bg-gradient-to-r from-[#71be95] to-[#5fa080] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results Content */}
        {searchResults && filteredCategories.length > 0 ? (
          <div className="space-y-8">
            {/* Members Section */}
            {(activeFilter === 'all' || activeFilter === 'alumni') && searchResults.alumni && searchResults.alumni.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="dynamic-site-bg p-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-white" />
                    <h2 className="text-xl font-semibold text-white">
                      Members ({searchResults.alumni.length})
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {searchResults.alumni.map((item) => (
                      <div key={item._id} className="transform hover:scale-105 transition-transform duration-200">
                        <Profilecard member={item} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

        

            {/* Groups Section */}
            {(activeFilter === 'all' || activeFilter === 'group') && searchResults.group && searchResults.group.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
                  <div className="flex items-center gap-3">
                    <Building className="w-6 h-6 text-white" />
                    <h2 className="text-xl font-semibold text-white">
                      Groups ({searchResults.group.length})
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <DisplayPost groups={searchResults.group} />
                </div>
              </div>
            )}

            {/* Jobs Section */}
            {(activeFilter === 'all' || activeFilter === 'job') && searchResults.job && searchResults.job.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-white" />
                    <h2 className="text-xl font-semibold text-white">
                      Jobs ({searchResults.job.length})
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {searchResults.job.map((item) => (
                      <div key={item._id} className="transform hover:scale-105 transition-transform duration-200">
                        <JobPost
                          userId={item.userId}
                          id={item._id}
                          jobTitle={item.title}
                          company={item.company}
                          description={item.description}
                          salaryMin={item.salaryMin}
                          salaryMax={item.salaryMax}
                          picture={item.picture}
                          duration={item.duration}
                          jobType={item.jobType}
                          questions={item.questions}
                          category={item.category}
                          currency={item.currency}
                          type={item.type}
                          createdAt={item.createdAt}
                          attachments={item.attachments}
                          title='Jobs'
                          titleS='job'
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Internships Section */}
            {(activeFilter === 'all' || activeFilter === 'internship') && searchResults.internship && searchResults.internship.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-white" />
                    <h2 className="text-xl font-semibold text-white">
                      Internships ({searchResults.internship.length})
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {searchResults.internship.map((item) => (
                      <div key={item._id} className="transform hover:scale-105 transition-transform duration-200">
                        <JobPost
                          userId={item.userId}
                          id={item._id}
                          jobTitle={item.title}
                          description={item.description}
                          salaryMin={item.salaryMin}
                          salaryMax={item.salaryMax}
                          picture={item.picture}
                          duration={item.duration}
                          jobType={item.internshipType}
                          questions={item.questions}
                          category={item.category}
                          currency={item.currency}
                          createdAt={item.createdAt}
                          type={item.type}
                          attachments={item.attachments}
                          title='Internships'
                          titleS='internship'
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* No Results State */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any results for "{searchKeyword}". Try adjusting your search terms or browse by category.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-gray-500">Try searching for:</span>
              {['Alumni', 'Jobs', 'Groups', 'Events', 'Forums'].map((suggestion) => (
                <button
                  key={suggestion}
                  className="px-3 py-1 bg-gray-100 hover:bg-[#71be95] hover:text-white rounded-full text-sm transition-colors duration-200"
                  onClick={() => {
                    window.location.href = `/home/?search=${suggestion}`;
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Back to Top Button */}
        {filteredCategories.length > 0 && (
          <div className="fixed bottom-8 right-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-12 h-12 bg-gradient-to-r from-[#71be95] to-[#5fa080] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
            >
              <ArrowRight className="w-5 h-5 rotate-[-90deg]" />
            </button>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #71be95 transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 1px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #71be95, #5fa080);
          border-radius: 1px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #5fa080, #4d8a66);
        }
      `}</style>
    </div>
  );
};
