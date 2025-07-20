import React, { useState, useEffect, useRef } from 'react';
import CreatePost1 from '../CreatePost1';
import Post from '../Post';
import axios from 'axios';
import './feed.scss';
import { toast } from "react-toastify";
import CommentSection from '../CommentSection';
import JobIntDisplay from '../JobsInt/JobIntDispay';
import { useSelector } from 'react-redux';
import { DisplayNews } from '../DisplayNews';
import { dotPulse } from 'ldrs';
import EventDisplay from './EventDisplay';
import PollDisplay from './PollDisplay';
import { useParams } from 'react-router-dom';
import { RefreshCw, TrendingUp, Users, Plus } from 'lucide-react';
import baseUrl from '../../config';

dotPulse.register();

function Feed({
  profilePage = false,
  photoUrl,
  username,
  showCreatePost,
  entityId,
  entityType,
  showDeleteButton,
  admin,
  userId,
  groupID,
  showCreateButton
}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const profile = useSelector((state) => state.profile);
  const scrollContainerRef = useRef(null);
  const activePageRef = useRef(1);
  const { _id } = useParams();
  const LIMIT = 45500;

  // Track which comment sections are expanded
  const [visibleComments, setVisibleComments] = useState({});
  const toggleComments = (postId) => {
    setVisibleComments(v => ({ ...v, [postId]: !v[postId] }));
  };

  // Core fetch + dedupe logic
  const getPosts = async (pageToLoad) => {
    setLoading(true);
    try {
      let url;
      if (userId) {
        url = `${process.env.REACT_APP_API_URL}/${entityType}/userPosts/${userId}?page=${pageToLoad}&size=${LIMIT}`;
      } else if (groupID) {
        url = `${process.env.REACT_APP_API_URL}/groups/groups/${groupID}?page=${pageToLoad}&size=${LIMIT}`;
      } else {
        url = `${process.env.REACT_APP_API_URL}/${entityType}?page=${pageToLoad}&size=${LIMIT}`;
      }

      const { data } = await axios.get(url);
      const postsData = data.records;
      setTotalPosts(data.total);

      setPosts(prev => {
        const existing = new Set(prev.map(p => p._id));
        const newOnes = postsData.filter(p => !existing.has(p._id));
        return data.records;
      });
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
      setLoadingPost(false);
    }
  };

  // Infinite scroll handler
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = container;
      if (
        scrollTop + clientHeight >= scrollHeight - 10 &&
        !loading &&
        posts.length < totalPosts
      ) {
        activePageRef.current += 1;
        getPosts(activePageRef.current);
      }
    };
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [loading, posts.length, totalPosts]);

  // Initial load
  useEffect(() => {
    getPosts(activePageRef.current);
  }, []);

  // When a post is deleted we just re-fetch the current page
  const handleDeletePost = () => {
    toast.success('Deleted successfully!');
    getPosts(activePageRef.current);
  };

  // Like / comment refresh handlers
  const handleLikes = async (entityId) => {
    try {
      const { data: updatedPost } = await axios.get(`${process.env.REACT_APP_API_URL}/${entityType}/${entityId}`);
      setPosts(prev =>
        prev.map(p => (p._id === entityId ? updatedPost : p))
      );
    } catch (err) {
      console.error('Error fetching likes:', err);
    }
  };

  const refreshComments = async (postId) => {
    try {
      const { data: updatedPost } = await axios.get(`${process.env.REACT_APP_API_URL}/${entityType}/${postId}`);
      setPosts(prev =>
        prev.map(p => (p._id === postId ? updatedPost : p))
      );
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  // NEW: Prepend the brand-new post by resetting and reloading page 1
  const handleNewPost = () => {
    toast.success('Posted successfully!');
    setPosts([]);
    activePageRef.current = 1;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    getPosts(1);
  };

  const handleRefresh = () => {
    setPosts([]);
    activePageRef.current = 1;
    getPosts(1);
  };

  return (
    <div className="feed space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Mobile Stats Bar */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          {/* Mobile stats - stacked */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 text-gray-600">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#71be95]" />
              <span className="text-xs sm:text-sm font-medium">{totalPosts} Posts</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#71be95]" />
              <span className="text-xs sm:text-sm font-medium">Active</span>
            </div>
          </div>
          {/* Mobile refresh button */}
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-md sm:rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Mobile Create Post Section */}
      {([0, 1].includes(profile.profileLevel) && entityType != "news" && profilePage == false) && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#71be95]/10 to-[#5fa080]/10 p-3 sm:p-4 border-b border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Share Your Thoughts</h3>
            <p className="text-xs sm:text-sm text-gray-600">Connect with your community</p>
          </div>
          <div className="p-3 sm:p-4">
            <CreatePost1
              photoUrl={photoUrl}
              username={username}
              onNewPost={handleNewPost}
              entityType={entityType}
              setLoadingPost={setLoadingPost}
              loadingPost={loadingPost}
            />
          </div>
        </div>
      )}

      {/* Mobile Create Button */}
      {showCreateButton && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 text-center">
          <button className="w-full bg-gradient-to-r from-[#71be95] to-[#5fa080] text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Create New Post</span>
          </button>
        </div>
      )}

      {/* Mobile Posts Container */}
      <div
        ref={scrollContainerRef}
        className="space-y-3 sm:space-y-4 lg:space-y-6 max-h-screen overflow-y-auto"
      >
        {posts.length === 0 && !loading ? (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 lg:p-12 text-center">
            <div className="text-gray-400 text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">📱</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Posts Yet</h3>
            <p className="text-sm sm:text-base text-gray-500">Be the first to share something with the community!</p>
          </div>
        ) : (
          posts.map(post => {
            if (post.type === 'Post' && (!_id || post.groupID === _id)) {
              return (
                <div key={post._id} className="transform transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]">
                  <Post
                    userId={post.userId._id}
                    postId={post._id}
                    post={post}
                    username={`${post.userId.firstName} ${post.userId.lastName}`}
                    text={post.description}
                    image={post.picturePath}
                    profilePicture={post.userId.profilePicture}
                    video={post.videoPath}
                    timestamp={post.createdAt}
                    likes={post.likes}
                    entityType={entityType}
                    admin={admin}
                    showDeleteButton={showDeleteButton}
                    handleLikes={handleLikes}
                    onCommentIconClick={() => toggleComments(post._id)}
                    onDeletePost={() => handleDeletePost(post._id)}
                    groupID={post.groupID}
                  />

                  {visibleComments[post._id] && (
                    <CommentSection
                      entityId={post._id}
                      entityType="posts"
                      comments={post.comments.filter(c => !c.reported)}
                      onCommentSubmit={refreshComments}
                      onDeleteComment={refreshComments}
                      onClose={() => toggleComments(post._id)}
                    />
                  )}
                </div>
              );
            }

            // Mobile-first other post types
            if (post.type === 'poll') {
              return (
                <div key={post._id} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-2 sm:p-3 border-b border-gray-100">
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Poll</span>
                  </div>
                  <div className="p-3 sm:p-4">
                    <PollDisplay poll={post} userId={post.userId._id} userData={post.userId} />
                  </div>
                </div>
              );
            }

            if (post.type === 'event') {
              return (
                <div key={post._id} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-2 sm:p-3 border-b border-gray-100">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Event</span>
                  </div>
                  <div className="p-3 sm:p-4">
                    <EventDisplay event={post} userId={post.userId._id} userData={post.userId} />
                  </div>
                </div>
              );
            }

            if (post.type === 'news') {
              return (
                <div key={post._id} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-2 sm:p-3 border-b border-gray-100">
                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">News</span>
                  </div>
                  <div className="p-3 sm:p-4">
                    <DisplayNews
                      userId={post.userId}
                      postId={post._id}
                      description={post.description}
                      createdAt={post.createdAt}
                      picturePath={post.picturePath}
                      videoPath={post.videoPath}
                      department={post.department}
                      title={post.title}
                      author={post.author}
                      picture={post.picture}
                      onDeletePost={() => handleDeletePost(post._id)}
                    />
                  </div>
                </div>
              );
            }

            return null;
          })
        )}

        {/* Mobile Loading Indicator */}
        {loading && (
          <div className="flex justify-center py-6 sm:py-8">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <l-dot-pulse size="30" speed="1.0" color="#71be95" />
            </div>
          </div>
        )}

        {/* Mobile End of Posts Message */}
        {totalPosts !== 0 && posts.length >= totalPosts && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
            <div className="text-gray-400 text-3xl sm:text-4xl mb-2 sm:mb-3">🎉</div>
            <p className="text-sm sm:text-base text-gray-600 font-medium">You've seen all the {entityType}!</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Check back later for new updates</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Feed;
