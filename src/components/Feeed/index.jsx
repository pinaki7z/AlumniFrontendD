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
import { useParams } from 'react-router-dom';
import PollDisplay from './PollDisplay';
import baseUrl from '../../config';
dotPulse.register();

function Feed({ photoUrl, username, showCreatePost, entityId, entityType, showDeleteButton, admin, userId, groupID, showCreateButton }) {
  const [posts, setPosts] = useState([]);
  const profile = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const scrollContainerRef = useRef(null);
  const [totalPosts, setTotalPosts] = useState(0);
  const activePageRef = useRef(1);
  const { _id } = useParams();
  // NEW: Track visible comments for each post using post id as key.
  const [visibleComments, setVisibleComments] = useState({});

  const toggleComments = (postId) => {
    setVisibleComments(prevState => ({
      ...prevState,
      [postId]: !prevState[postId]
    }));
  };

  const LIMIT = 4;

  useEffect(() => {
    const container = scrollContainerRef.current;

    const handleScroll = () => {
      if (container) {
        const { scrollTop, clientHeight, scrollHeight } = container;
        // Trigger fetching if scrolled near bottom, not already loading,
        // and there are still more posts to load.
        if (scrollTop + clientHeight >= scrollHeight - 10 && !loading && posts.length < totalPosts) {
          activePageRef.current++;
          getPosts(activePageRef.current);
        }
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [loading, posts.length, totalPosts]);

  useEffect(() => {
    // Initial fetch
    getPosts(activePageRef.current);
  }, []);

  const handleDeletePost = () => {
    getPosts(activePageRef.current);
    toast.success('Deleted successfully!');
    window.location.reload();
  };

  const handleLikes = async (entityId) => {
    try {
      const response = await axios.get(`${baseUrl}/${entityType}/${entityId}`);
      const updatedPost = response.data;

      setPosts((prevPosts) => {
        return prevPosts.map((post) => {
          if (post._id === entityId) {
            return updatedPost;
          }
          return post;
        });
      });
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const handleNewPost = () => {
    toast.success('Posted successfully!');
    window.location.reload();
  };

  const refreshComments = async (postId) => {
    try {
      const response = await axios.get(`${baseUrl}/${entityType}/${postId}`);
      const updatedPost = response.data;
      setPosts((prevPosts) => {
        return prevPosts.map((post) => {
          if (post._id === postId) {
            return updatedPost;
          }
          return post;
        });
      });
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const getPosts = async (page) => {
    setLoading(true);
    try {
      if (userId) {
        const response = await axios.get(
          `${baseUrl}/${entityType}/userPosts/${userId}?page=${page}&size=${LIMIT}`
        );
        const postsData = response.data.records;
        setPosts((prevItems) => [...prevItems, ...postsData]);
        setTotalPosts(response.data.total);
        setLoadingPost(false);
      } else if (groupID) {
        const response = await axios.get(
          `${baseUrl}/groups/groups/${groupID}?page=${page}&size=${LIMIT}`
        );
        const postsData = response.data.records;
        setPosts((prevItems) => [...prevItems, ...postsData]);
        setTotalPosts(response.data.total);
        setLoadingPost(false);
      }
      else {
        const response = await axios.get(
          `${baseUrl}/${entityType}?page=${page}&size=${LIMIT}`
        );
        const postsData = response.data.records;
        setPosts((prevItems) => [...prevItems, ...postsData]);
        setTotalPosts(response.data.total);
        setLoadingPost(false);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoadingPost(false);
    }
    setLoading(false);
  };

  return (
    <div className='feed'>
      {showCreatePost && (
        <CreatePost1
          photoUrl={photoUrl}
          username={username}
          onNewPost={handleNewPost}
          entityType={entityType}
          setLoadingPost={setLoadingPost}
          loadingPost={loadingPost}
          getPosts={getPosts}
        />
      )}
      {showCreateButton && (
        <div style={{ width: '100%' }}>
          <button
            style={{
              fontFamily: 'Inter',
              fontWeight: '500',
              fontSize: '18px',
              backgroundColor: '#efeff0',
              padding: '20px',
              borderRadius: '8px',
              border: 'none',
              height: '0vh',
              width: '10%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '20px'
            }}
          >
            Create
          </button>
        </div>
      )}
      <div
        ref={scrollContainerRef}
        className='infiniteScroll flex flex-col items-center w-full overflow-y-auto h-[80%]'
      >
        {posts.map((post) => {
          if (post.type === 'Post' && (post.groupID === _id)) {
            return (
              <div key={post._id} className="mb-4 rounded-xl w-full md:w-full xl:w-[650px]">
                <Post
                  userId={post.userId}
                  postId={post._id}
                  username={`${post.firstName} ${post.lastName}`}
                  text={post.description}
                  image={post.picturePath}
                  profilePicture={post.profilePicture}
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
                {((entityType === 'posts' || entityType === 'forums') && visibleComments[post._id]) && (
                  <CommentSection
                    entityId={post._id}
                    entityType="posts"
                    onCommentSubmit={refreshComments}
                    postUserId={post.userId}
                    onDeleteComment={refreshComments}
                    comments={post ? post.comments.filter(comment => !comment.reported) : null}
                    onClose={() => toggleComments(post._id)}
                  />
                )}
              </div>
            );
          } else if (post.type === 'Job' && (post.groupID === _id)) {
            return (
              <div key={post._id} className="border border-gray-200 p-4 shadow-sm bg-white mb-4 rounded-xl w-full md:w-full xl:w-[650px]">
                <JobIntDisplay
                  jobId={post._id}
                  picture={post.coverImage}
                  jobTitle={post.jobTitle}
                  location={post.location}
                  salaryMin={post.salaryMin}
                  salaryMax={post.salaryMax}
                  currency={post.currency}
                  jobType={post.jobType}
                  category={post.category}
                  description={post.description}
                />
              </div>
            );
          } else if (post.type === 'poll') {
            return (
              <div key={post._id} className="border border-gray-200 p-4 shadow-sm bg-white mb-4 rounded-xl w-full md:w-full xl:w-[650px]">
                <PollDisplay poll={post} />
              </div>
            );
          } else if (post.type === 'event') {
            return (
              <div key={post._id} className="border border-gray-200 p-4 shadow-sm bg-white mb-4 rounded-xl w-full md:w-full xl:w-[650px]">
                <EventDisplay event={post} />
              </div>
            );
          } else if (post.type === 'news') {
            return (
              <div key={post._id} className="p-4 rounded-xl w-full md:w-full xl:min-w-[650px]">
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
                  onDeletePost={() => handleDeletePost(post._id)}
                />
              </div>
            );
          }
          return null;
        })}
        {loading && (
          <div>
            <l-dot-pulse size="35" speed="1.0" color="#b3b4b5"></l-dot-pulse>
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
