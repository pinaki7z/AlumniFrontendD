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

  // All your existing functions remain the same...
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

  // ... all other existing functions remain the same ...

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

  useEffect(() => {
    getPosts(activePageRef.current);
  }, []);

  const handleDeletePost = () => {
    toast.success('Deleted successfully!');
    getPosts(activePageRef.current);
  };

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
    <div className="w-full max-w-3xl mx-auto space-y-4">
      

      {/* Create Post Section - Same width as posts */}
      {([0, 1].includes(profile.profileLevel) && entityType != "news" && profilePage == false) && (
        <CreatePost1
          photoUrl={photoUrl}
          username={username}
          onNewPost={handleNewPost}
          entityType={entityType}
          setLoadingPost={setLoadingPost}
          loadingPost={loadingPost}
        />
      )}

      {/* Create Button - Same width as posts */}
      {showCreateButton && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <button className="w-full bg-gradient-to-r from-[#71be95] to-[#5fa080] text-white py-3 px-4 rounded-lg font-semibold text-sm hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create New Post</span>
          </button>
        </div>
      )}

      {/* Posts Container - Same width constraint */}
      <div
        ref={scrollContainerRef}
        className="space-y-4 "
      >
        {posts.length === 0 && !loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 text-5xl mb-4">📱</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Posts Yet</h3>
            <p className="text-gray-500">Be the first to share something with the community!</p>
          </div>
        ) : (
          posts.map(post => {
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

                 {/* Inline Comment Section */}
        {visibleComments[post._id] && (
          <div className="w-full  -mt-3">
            <CommentSection
              entityId={post._id}
              entityType="posts"
              comments={post.comments.filter(c => !c.reported)}
              onCommentSubmit={refreshComments}
              onDeleteComment={refreshComments}
              onClose={() => toggleComments(post._id)}
            />
          </div>
        )}
                </div>
              );
            }

            // Other post types with same width constraint
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

            if (post.type === 'news') {
              return (
                <div key={post._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-3 border-b border-gray-100">
                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">News</span>
                  </div>
                  <div className="p-4">
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

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center py-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <l-dot-pulse size="30" speed="1.0" color="#71be95" />
            </div>
          </div>
        )}

        {/* End of Posts Message */}
        {totalPosts !== 0 && posts.length >= totalPosts && (
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
