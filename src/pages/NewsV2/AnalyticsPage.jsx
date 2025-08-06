// AnalyticsPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, TrendingUp, Eye, Heart, MessageCircle, Share2,
  Users, Calendar, Award, FileText, Download, Filter,
  BarChart3, PieChart, Activity, Target, RefreshCw,
  Clock, Globe, Smartphone, Monitor, ChevronUp, ChevronDown
} from 'lucide-react';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30days');
  const [isLoading, setIsLoading] = useState(false);

  // Mock analytics data
  const overallStats = {
    totalViews: 45672,
    totalLikes: 3421,
    totalComments: 892,
    totalShares: 567,
    totalArticles: 24,
    avgReadTime: '4.2 min'
  };

  const topPerformingArticles = [
    {
      id: 1,
      title: 'Alumni Startup Raises $5M in Series A Funding',
      views: 8420,
      likes: 342,
      comments: 89,
      shares: 156,
      category: 'achievements',
      publishedAt: '2025-01-15T10:30:00Z',
      readTime: '3 min',
      bounceRate: '32%',
      engagement: 89
    },
    {
      id: 2,
      title: 'Tech Industry Career Fair 2025',
      views: 6890,
      likes: 287,
      comments: 65,
      shares: 123,
      category: 'events',
      publishedAt: '2025-01-12T14:20:00Z',
      readTime: '2 min',
      bounceRate: '28%',
      engagement: 85
    },
    {
      id: 3,
      title: 'Alumni Success Stories: Rising in Silicon Valley',
      views: 5630,
      likes: 231,
      comments: 47,
      shares: 89,
      category: 'achievements',
      publishedAt: '2025-01-08T09:15:00Z',
      readTime: '5 min',
      bounceRate: '25%',
      engagement: 92
    },
    {
      id: 4,
      title: 'New Research Center Opens with Alumni Support',
      views: 4250,
      likes: 198,
      comments: 34,
      shares: 67,
      category: 'academics',
      publishedAt: '2025-01-05T16:30:00Z',
      readTime: '4 min',
      bounceRate: '30%',
      engagement: 78
    }
  ];

  const categoryPerformance = [
    { category: 'Achievements', articles: 8, views: 18450, engagement: 92, avgTime: '4.2 min', growth: '+15%' },
    { category: 'Events', articles: 6, views: 14230, engagement: 87, avgTime: '3.1 min', growth: '+8%' },
    { category: 'Careers', articles: 5, views: 8970, engagement: 74, avgTime: '5.6 min', growth: '-2%' },
    { category: 'Academics', articles: 3, views: 2840, engagement: 68, avgTime: '6.2 min', growth: '+12%' },
    { category: 'Community', articles: 2, views: 1182, engagement: 55, avgTime: '2.8 min', growth: '+5%' }
  ];

  const recentActivity = [
    { action: 'New article published', details: 'Alumni Success Stories: Rising Stars', time: '2 hours ago', type: 'publish' },
    { action: 'High engagement detected', details: 'Career Fair 2025 article', time: '4 hours ago', type: 'engagement' },
    { action: 'Comment milestone reached', details: '100 comments on funding article', time: '1 day ago', type: 'milestone' },
    { action: 'New subscriber', details: '15 new newsletter subscribers', time: '2 days ago', type: 'subscriber' },
    { action: 'Traffic spike detected', details: 'Alumni startup article', time: '3 days ago', type: 'traffic' }
  ];

  const audienceData = {
    devices: [
      { name: 'Desktop', value: 45, icon: Monitor, change: '+3%' },
      { name: 'Mobile', value: 38, icon: Smartphone, change: '+12%' },
      { name: 'Tablet', value: 17, icon: Globe, change: '-5%' }
    ],
    topCountries: [
      { country: 'India', views: 28450, percentage: 62, flag: '🇮🇳' },
      { country: 'United States', views: 8230, percentage: 18, flag: '🇺🇸' },
      { country: 'United Kingdom', views: 3670, percentage: 8, flag: '🇬🇧' },
      { country: 'Canada', views: 2890, percentage: 6, flag: '🇨🇦' },
      { country: 'Australia', views: 2432, percentage: 5, flag: '🇦🇺' }
    ]
  };

  const trafficSources = [
    { source: 'Direct', visits: 18500, percentage: 41, change: '+5%' },
    { source: 'Search', visits: 12300, percentage: 27, change: '+12%' },
    { source: 'Social Media', visits: 8900, percentage: 20, change: '+8%' },
    { source: 'Email', visits: 3400, percentage: 8, change: '+15%' },
    { source: 'Referral', visits: 1900, percentage: 4, change: '-3%' }
  ];

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const handleExport = () => {
    // Simulate export functionality
    const data = {
      timeRange,
      stats: overallStats,
      articles: topPerformingArticles,
      categories: categoryPerformance,
      audience: audienceData,
      traffic: trafficSources,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `news-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">News Analytics</h1>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="1year">Last year</option>
              </select>

              <button 
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200"
            >
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="Total Views"
            value={overallStats.totalViews.toLocaleString()}
            icon={Eye}
            color="text-blue-600"
            bgColor="bg-blue-100"
            trend="+12.5%"
            trendUp={true}
          />
          <StatCard
            title="Total Likes"
            value={overallStats.totalLikes.toLocaleString()}
            icon={Heart}
            color="text-red-600"
            bgColor="bg-red-100"
            trend="+8.3%"
            trendUp={true}
          />
          <StatCard
            title="Comments"
            value={overallStats.totalComments.toLocaleString()}
            icon={MessageCircle}
            color="text-green-600"
            bgColor="bg-green-100"
            trend="+15.7%"
            trendUp={true}
          />
          <StatCard
            title="Shares"
            value={overallStats.totalShares.toLocaleString()}
            icon={Share2}
            color="text-purple-600"
            bgColor="bg-purple-100"
            trend="+6.2%"
            trendUp={true}
          />
          <StatCard
            title="Articles"
            value={overallStats.totalArticles.toString()}
            icon={FileText}
            color="text-orange-600"
            bgColor="bg-orange-100"
            trend="+4"
            trendUp={true}
          />
          <StatCard
            title="Avg. Read Time"
            value={overallStats.avgReadTime}
            icon={Clock}
            color="text-indigo-600"
            bgColor="bg-indigo-100"
            trend="+0.3 min"
            trendUp={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Performing Articles */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={20} className="text-[#0A3A4C]" />
                  Top Performing Articles
                </h3>
                <button
                  onClick={() => navigate('/home/news')}
                  className="text-sm text-[#0A3A4C] hover:underline"
                >
                  View All Articles
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Rank</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Article</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Views</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Engagement</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerformingArticles.map((article, index) => (
                      <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                        </td>
                        <td className="py-4">
                          <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">{article.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                              {article.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(article.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="font-medium text-gray-900">{article.views.toLocaleString()}</span>
                          <div className="text-xs text-gray-500">{article.readTime}</div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3 text-sm mb-1">
                            <span className="flex items-center gap-1 text-red-600">
                              <Heart size={12} />
                              {article.likes}
                            </span>
                            <span className="flex items-center gap-1 text-blue-600">
                              <MessageCircle size={12} />
                              {article.comments}
                            </span>
                            <span className="flex items-center gap-1 text-green-600">
                              <Share2 size={12} />
                              {article.shares}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {article.bounceRate} bounce rate
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] h-2 rounded-full"
                                style={{ width: `${article.engagement}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{article.engagement}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Performance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-[#0A3A4C]" />
                Category Performance Analysis
              </h3>
              
              <div className="space-y-4">
                {categoryPerformance.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-900">{category.category}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          category.growth.startsWith('+') 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.growth}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {category.articles} articles • Avg. read time: {category.avgTime}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{category.views.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">total views</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${category.engagement}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 min-w-[3rem]">{category.engagement}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe size={20} className="text-[#0A3A4C]" />
                Traffic Sources
              </h3>
              
              <div className="space-y-3">
                {trafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{source.source}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        source.change.startsWith('+') 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {source.change}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-medium text-gray-900">{source.visits.toLocaleString()}</span>
                        <div className="text-xs text-gray-500">{source.percentage}% of total</div>
                      </div>
                      
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] h-2 rounded-full"
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-[#0A3A4C]" />
                Recent Activity
              </h3>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'publish' ? 'bg-green-100' :
                      activity.type === 'engagement' ? 'bg-blue-100' :
                      activity.type === 'milestone' ? 'bg-yellow-100' : 
                      activity.type === 'traffic' ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      {activity.type === 'publish' && <FileText size={14} className="text-green-600" />}
                      {activity.type === 'engagement' && <TrendingUp size={14} className="text-blue-600" />}
                      {activity.type === 'milestone' && <Award size={14} className="text-yellow-600" />}
                      {activity.type === 'subscriber' && <Users size={14} className="text-gray-600" />}
                      {activity.type === 'traffic' && <Eye size={14} className="text-purple-600" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{activity.details}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audience Demographics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={20} className="text-[#0A3A4C]" />
                Audience Demographics
              </h3>
              
              {/* Device Breakdown */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Device Usage</h4>
                <div className="space-y-3">
                  {audienceData.devices.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <device.icon size={16} className="text-gray-600" />
                        <span className="text-sm text-gray-700">{device.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          device.change.startsWith('+') 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {device.change}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] h-2 rounded-full"
                            style={{ width: `${device.value}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 min-w-[2.5rem]">{device.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Countries */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Top Countries</h4>
                <div className="space-y-3">
                  {audienceData.topCountries.map((country, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{country.flag}</span>
                        <span className="text-sm text-gray-700">{country.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">{country.views.toLocaleString()}</span>
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] h-2 rounded-full"
                            style={{ width: `${country.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 min-w-[2rem]">{country.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/home/news/create')}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200"
                >
                  <FileText size={16} />
                  Create New Article
                </button>
                
                <button
                  onClick={() => navigate('/home/news/drafts')}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Calendar size={16} />
                  View Drafts
                </button>

                <button
                  onClick={() => navigate('/home/news')}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Eye size={16} />
                  View All News
                </button>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg shadow-sm p-6 text-white">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target size={18} />
                Performance Summary
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>Overall Engagement:</span>
                  <span className="font-medium">84%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Growth Rate:</span>
                  <span className="font-medium text-green-300">+12.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active Readers:</span>
                  <span className="font-medium">2,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg. Session:</span>
                  <span className="font-medium">6.3 min</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs opacity-90">
                  Your content performance is above average. Keep creating engaging articles to maintain this growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, bgColor, trend, trendUp }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div className="flex items-center justify-between mb-2">
      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon size={20} className={color} />
      </div>
      <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
        trendUp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {trendUp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {trend}
      </div>
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm font-medium text-gray-600">{title}</p>
    </div>
  </div>
);

export default AnalyticsPage;
