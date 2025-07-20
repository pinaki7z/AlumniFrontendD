
import axios from "axios"
import { useEffect } from "react"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useSelector } from "react-redux"

const forumData = {
  categories: [
    {
      id: 1,
      name: "General Discussion",
      description: "Talk about anything and everything",
      topicCount: 45,
      postCount: 234,
      lastPost: {
        title: "Welcome to the forum!",
        author: "admin",
        time: "2 hours ago",
      },
    },
    {
      id: 2,
      name: "Technology",
      description: "Discuss the latest in tech and programming",
      topicCount: 28,
      postCount: 156,
      lastPost: {
        title: "React vs Vue in 2024",
        author: "techguru",
        time: "1 day ago",
      },
    },
    {
      id: 3,
      name: "Gaming",
      description: "Share your gaming experiences and reviews",
      topicCount: 67,
      postCount: 389,
      lastPost: {
        title: "Best RPGs of 2024",
        author: "gamer123",
        time: "3 hours ago",
      },
    },
    {
      id: 4,
      name: "Help & Support",
      description: "Get help with technical issues",
      topicCount: 23,
      postCount: 98,
      lastPost: {
        title: "Login issues",
        author: "newuser",
        time: "5 hours ago",
      },
    },
  ],
  topics: {
    1: [
      {
        id: 1,
        title: "Welcome to the forum!",
        author: "admin",
        replies: 12,
        views: 234,
        lastReply: {
          author: "user123",
          time: "2 hours ago",
        },
        isPinned: true,
      },
      {
        id: 2,
        title: "Forum rules and guidelines",
        author: "admin",
        replies: 5,
        views: 156,
        lastReply: {
          author: "moderator",
          time: "1 day ago",
        },
        isPinned: true,
      },
      {
        id: 3,
        title: "Introduce yourself here",
        author: "admin",
        replies: 89,
        views: 567,
        lastReply: {
          author: "newbie2024",
          time: "30 minutes ago",
        },
      },
    ],
    2: [
      {
        id: 4,
        title: "React vs Vue in 2024",
        author: "techguru",
        replies: 23,
        views: 445,
        lastReply: {
          author: "developer",
          time: "1 day ago",
        },
      },
      {
        id: 5,
        title: "Best practices for API design",
        author: "backend_dev",
        replies: 15,
        views: 289,
        lastReply: {
          author: "api_expert",
          time: "2 days ago",
        },
      },
    ],
  },
  posts: {
    1: [
      {
        id: 1,
        author: "admin",
        content:
          "Welcome to our community forum! We're excited to have you here. Please take a moment to read our community guidelines and introduce yourself.",
        timestamp: "3 days ago",
        avatar: "A",
        isOriginalPost: true,
        replies: [
          {
            id: 2,
            author: "user123",
            content: "Thanks for the warm welcome! Looking forward to participating in discussions.",
            timestamp: "2 hours ago",
            avatar: "U",
          },
          {
            id: 3,
            author: "newbie2024",
            content: "Great to be here! This seems like a friendly community.",
            timestamp: "1 hour ago",
            avatar: "N",
          },
        ],
      },
    ],
    3: [
      {
        id: 4,
        author: "admin",
        content:
          "Please use this thread to introduce yourself to the community. Tell us a bit about yourself, your interests, and what brought you here!",
        timestamp: "1 week ago",
        avatar: "A",
        isOriginalPost: true,
        replies: [
          {
            id: 5,
            author: "gamer123",
            content:
              "Hi everyone! I'm a passionate gamer and love discussing the latest releases. Excited to be part of this community!",
            timestamp: "5 days ago",
            avatar: "G",
          },
          {
            id: 6,
            author: "techguru",
            content:
              "Hello! I'm a software developer with 10+ years of experience. Looking forward to sharing knowledge and learning from others.",
            timestamp: "4 days ago",
            avatar: "T",
          },
          {
            id: 7,
            author: "newbie2024",
            content: "Hey there! I'm new to forums but excited to learn and contribute. Thanks for having me!",
            timestamp: "30 minutes ago",
            avatar: "N",
          },
        ],
      },
    ],
  },
}
const TopicPage = () => {
  const { categoryId } = useParams()
  // const params = useParams()
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true)

  // console.log("params", params);

  const [selectedCategory, setSelectedCategory] = useState({
    // id: 1,
    // name: "Career",
    // description: "Talk about anything and everything",
    // topicCount: 45,
    // postCount: 234,
    // lastPost: {
    //   title: "Welcome to the forum!",
    //   author: "admin",
    //   time: "2 hours ago",
    // },
  },)
  const profile = useSelector(state => state.profile)

  const [topics, setTopics] = useState([])
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [newTopic, setNewTopic] = useState({
    userId:profile._id,
     title: '',
     isPinned: false
    });
  const [creatingTopic, setCreatingTopic] = useState(false);

  const navigateToTopic = (topic) => {
    // setSelectedTopic(topic)
    // setCurrentView("posts")
    navigate(`/home/forums/category/${categoryId}/topic/${topic._id}`)
  }

  const navigateBack = () => {
    navigate(`/home/forums/`)
  }

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/forumv2/topics/category/${categoryId}/`);
      setTopics(response.data);
      setLoading(false)

    } catch (error) {
      console.error('Error fetching topics:', error);
      setLoading(false)

    }
  }

  const fetchCategory = async()=>{
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/forumv2/categories/${categoryId}/`);
      setSelectedCategory(response.data);
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  }

  useEffect(() => {
    fetchTopics();
    fetchCategory();
  }, [categoryId]);


  const handleCreateTopic = async () => {
    setCreatingTopic(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/forumv2/topics`, {
        ...newTopic,
        categoryId,
      });
      fetchTopics(); // refresh list
      setShowTopicModal(false);
      setNewTopic({ title: '', isPinned: false });
    } catch (err) {
      console.error(err);
      alert("Failed to create topic");
    }
    setCreatingTopic(false);
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex items-start justify-between">
            <div>
              <button onClick={navigateBack} className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2">
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{selectedCategory?.name}</h1>
              <p className="text-gray-600">{selectedCategory?.description}</p>
            </div>
            <button
              onClick={() => setShowTopicModal(true)}
              className="bg-blue-600 text-white px-4 py-2 font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              + Create Topic
            </button>
            {showTopicModal && (
              <div
                className="fixed inset-0 z-50 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center"
                onClick={() => setShowTopicModal(false)}
              >
                <div
                  className="bg-white rounded-lg shadow-lg max-w-md w-full p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-xl font-bold mb-4">Create New Topic</h2>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Topic Title"
                      value={newTopic.title}
                      onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                      className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newTopic.isPinned}
                        onChange={(e) => setNewTopic({ ...newTopic, isPinned: e.target.checked })}
                      />
                      <span>Pin this topic</span>
                    </label>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowTopicModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateTopic}
                      disabled={creatingTopic}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {creatingTopic ? "Creating..." : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {loading && (
            <div className="p-6">
              <div className="animate-pulse flex items-center justify-center">
                <div className="spinner-border text-blue-600 inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          )}

          <div className="divide-y">
          {[...topics]
  .sort((a, b) => (b.isPinned === a.isPinned ? 0 : a.isPinned ? -1 : 1))
  .map((topic) => (
    <div
      key={topic._id}
      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => navigateToTopic(topic)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {topic.isPinned && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Pinned</span>
            )}
            <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">{topic.title}</h3>
          </div>
        </div>
      </div>
    </div>
))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopicPage