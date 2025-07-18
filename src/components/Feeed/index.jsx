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
import baseUrl from '../../config';

dotPulse.register();

function Feed({
  profilePage=false,
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
        // build a set of existing IDs
        const existing = new Set(prev.map(p => p._id));
        // filter out any duplicates
        const newOnes = postsData.filter(p => !existing.has(p._id));
        // return [...prev, ...newOnes];
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
    // you can remove window.reload if it's no longer needed
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

  // ★ NEW: Prepend the brand-new post by resetting and reloading page 1
  const handleNewPost = () => {
    toast.success('Posted successfully!');
    // clear out old posts so page 1 (with new item at the top) shows up
    setPosts([]);
    activePageRef.current = 1;
    // scroll back to top
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    getPosts(1);
  };

  return (
    <div className="feed">
      {([0,1].includes(profile.profileLevel) && entityType!="news" && profilePage==false) && (
        <CreatePost1
          photoUrl={photoUrl}
          username={username}
          onNewPost={handleNewPost}
          entityType={entityType}
          setLoadingPost={setLoadingPost}
          loadingPost={loadingPost}
        />
      )}

      {showCreateButton && (
        <div className="w-full">
          <button className="font-inter font-medium text-lg bg-gray-100 p-5 rounded-lg border-none mt-5 hover:bg-gray-200">
            Create
          </button>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className="infiniteScroll flex flex-col items-center w-full md:overflow-y-auto md:h-[100vh]"
      >
        {posts.map(post => {
          // only render Post items belonging to this group
          if (post.type === 'Post' && post.groupID === _id) {
            return (
              <div
                key={post._id}
                className="mb-4 rounded-xl w-full md:w-full xl:w-[650px]"
              >
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

          // Job, Poll, Event, News renderers...
          // if (post.type === 'Job' && post.groupID === _id) {
          //   return (
          //     <div
          //       key={post._id}
          //       className="border border-gray-200 p-4 shadow-sm bg-white mb-4 rounded-xl w-full md:w-full xl:w-[650px]"
          //     >
          //       <JobIntDisplay
          //         jobId={post._id}
          //         picture={post.coverImage}
          //         jobTitle={post.jobTitle}
          //         location={post.location}
          //         salaryMin={post.salaryMin}
          //         salaryMax={post.salaryMax}
          //         currency={post.currency}
          //         jobType={post.jobType}
          //         category={post.category}
          //         description={post.description}
          //       />
          //     </div>
          //   );
          // }

          if (post.type === 'poll') {
            return (
              <div
                key={post._id}
                className="border border-gray-200 p-3 shadow-sm bg-white mb-4 rounded-xl w-full md:w-full xl:w-[650px]"
              >
                <PollDisplay poll={post} userId={post.userId._id} userData={post.userId}/>
              </div>
            );
          }

          if (post.type === 'event') {
            return (
              <div
                key={post._id}
                className="border border-gray-200 p-3 shadow-sm bg-white mb-4 rounded-xl w-full md:w-full xl:w-[650px]"
              >
                <EventDisplay event={post} userId={post.userId._id} userData={post.userId}/>
              </div>
            );
          }

          if (post.type === 'news') {
            return (
              <div
                key={post._id}
                className="p-4 rounded-xl w-full md:w-full xl:min-w-[650px]"
              >
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
            );
          }

          return null;
        })}

        {loading && (
          <div>
            <l-dot-pulse size="35" speed="1.0" color="#b3b4b5" />
          </div>
        )}

        {totalPosts !== 0 && posts.length >= totalPosts && (
          <p>You have seen all the {entityType}</p>
        )}
      </div>
    </div>
  );
}

export default Feed;
