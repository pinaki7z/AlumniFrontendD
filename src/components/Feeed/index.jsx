import React, { useState, useEffect, useRef } from 'react';
import CreatePost1 from '../CreatePost1';
import Post from '../Post';
import axios from 'axios';
import './feed.scss';
import { toast } from "react-toastify";
import CommentSection from '../CommentSection';
import { useSelector } from 'react-redux';
import { dotPulse } from 'ldrs';
import EventDisplay from './EventDisplay';
import PollDisplay from './PollDisplay';
import { useParams } from 'react-router-dom';
import { RefreshCw, Plus } from 'lucide-react';

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const profile = useSelector((state) => state.profile);
  const { _id } = useParams();
  const LIMIT = 5;

  // Ref for the load more trigger element
  const loadMoreRef = useRef(null);

  // Track which comment sections are expanded
  const [visibleComments, setVisibleComments] = useState({});
  const toggleComments = (postId) => {
    setVisibleComments(v => ({ ...v, [postId]: !v[postId] }));
  };

  // Simple fetch function
  const fetchPosts = async (pageNum, isFirstLoad = false) => {
    if (isFirstLoad) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      let url;
      if (userId) {
        url = `${process.env.REACT_APP_API_URL}/${entityType}/userPosts/${userId}?page=${pageNum}&size=${LIMIT}`;
      } else if (groupID) {
        url = `${process.env.REACT_APP_API_URL}/groups/groups/${groupID}?page=${pageNum}&size=${LIMIT}`;
      } else {
        url = `${process.env.REACT_APP_API_URL}/${entityType}?page=${pageNum}&size=${LIMIT}`;
      }

      const response = await axios.get(url);
      const newPosts = response.data.records || [];
      
      if (isFirstLoad) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      // Simple hasMore check
      setHasMore(newPosts.length === LIMIT);

    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load next page
  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, false);
    }
  };

  // Intersection Observer for auto-loading when load more button is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // If the load more element is visible and we have more posts to load
        if (entry.isIntersecting && hasMore && !isLoadingMore && !loading) {
          console.log('Load more button is visible, auto-loading...'); // Debug log
          loadMore();
        }
      },
      {
        // Trigger when element is 50% visible
        threshold: 0.5,
        // Add some margin to trigger a bit before the element is fully visible
        rootMargin: '100px',
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, isLoadingMore, loading, page]); // Include dependencies

  // Initial load
  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
    toast.success('Deleted successfully!');
  };

  const handleLikes = async (entityId) => {
    try {
      const { data: updatedPost } = await axios.get(`${process.env.REACT_APP_API_URL}/${entityType}/${entityId}`);
      setPosts(prev => prev.map(p => (p._id === entityId ? updatedPost : p)));
    } catch (err) {
      console.error('Error fetching likes:', err);
    }
  };

  const refreshComments = async (postId) => {
    try {
      const { data: updatedPost } = await axios.get(`${process.env.REACT_APP_API_URL}/${entityType}/${postId}`);
      setPosts(prev => prev.map(p => (p._id === postId ? updatedPost : p)));
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleNewPost = () => {
    toast.success('Posted successfully!');
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
  };

  const handleRefresh = () => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Create Post Section */}
      {([0, 1].includes(profile.profileLevel) && entityType !== "news" && !profilePage) && (
        <CreatePost1
          photoUrl={photoUrl}
          username={username}
          onNewPost={handleNewPost}
          entityType={entityType}
          setLoadingPost={setLoadingPost}
          loadingPost={loadingPost}
        />
      )}

      {/* Create Button */}
      {showCreateButton && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <button className="w-full bg-gradient-to-r from-[#71be95] to-[#5fa080] text-white py-3 px-4 rounded-lg font-semibold text-sm hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create New Post</span>
          </button>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className=" rounded-lg  p-8">
              <l-dot-pulse size="40" speed="1.0" color="#71be95" />
              {/* <p className="text-center text-gray-500 mt-4">Loading posts...</p> */}
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 text-5xl mb-4">📱</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Posts Yet</h3>
            <p className="text-gray-500">Be the first to share something with the community!</p>
          </div>
        ) : (
          posts.map((post, index) => {
            if (post.type === 'Post' && (!_id || post.groupID === _id)) {
              return (
                <div key={post._id}>
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
                    <div className="w-full -mt-3">
                      <CommentSection
                        entityId={post._id}
                        entityType="posts"
                        comments={post.comments?.filter(c => !c.reported) || []}
                        onCommentSubmit={refreshComments}
                        onDeleteComment={refreshComments}
                        onClose={() => toggleComments(post._id)}
                      />
                    </div>
                  )}
                </div>
              );
            }

            if (post.type === 'poll') {
              return (
                <div key={post._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3 border-b border-gray-100">
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Poll</span>
                  </div>
                  <div className="p-4">
                    <PollDisplay poll={post} userId={post.userId._id} userData={post.userId} />
                  </div>
                </div>
              );
            }

            if (post.type === 'event') {
              return (
                <div key={post._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-3 border-b border-gray-100">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Event</span>
                  </div>
                  <div className="p-4">
                    <EventDisplay event={post} userId={post.userId._id} userData={post.userId} />
                  </div>
                </div>
              );
            }

      

            return null;
          })
        )}

        {/* Auto-trigger element for infinite scroll */}
        {hasMore && !loading && (
          <div 
            ref={loadMoreRef}
            className="flex justify-center py-6"
          >
            {isLoadingMore ? (
              <div className=" rounded-lg    p-6">
                <div className="flex items-center justify-center space-x-3">
                  <l-dot-pulse size="30" speed="1.0" color="#71be95" />
                  {/* <span className="text-gray-500">Loading more posts...</span> */}
                </div>
              </div>
            ) : (
              <div className=" rounded-lg    p-4">
                <button
                  onClick={loadMore}
                  className="px-6 py-2 bg-gradient-to-r from-[#71be95] to-[#5fa080] text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                >
                  {/* Load More Posts */}
                </button>
              </div>
            )}
          </div>
        )}

        {/* End of Posts Message */}
        {!hasMore && posts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-gray-400 text-4xl mb-3">🎉</div>
            <p className="text-gray-600 font-medium">You've seen all the {entityType}!</p>
            <p className="text-sm text-gray-500 mt-1">Check back later for new updates</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Feed;
