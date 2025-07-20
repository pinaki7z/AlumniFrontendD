
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import moment from "moment"
import { toast } from "react-toastify"
import { useSelector } from "react-redux"
// Mock data for the forum
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



export default function Forum() {

  const navigate = useNavigate()
  const profile = useSelector(state => state.profile)
  const [categories, setCategories] = useState()
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    userId:profile._id,
    name: '',
    description: ''
  });
  const [creating, setCreating] = useState(false);

  const fetchCategories = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/forumv2/categories`).then((res) => {
      setCategories(res.data)
      setLoading(false)
    }).catch((err) => {
      console.log(err)
      setLoading(false)
    })
  }
  useEffect(() => {
    fetchCategories()
  }, [])

  const navigateToCategory = (category) => {
    navigate(`/home/forums/category/${category._id}`)
  }

  const handleCreateCategory = async () => {
    setCreating(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/forumv2/categories`, newCategory);
      fetchCategories();
      setShowModal(false);
      setNewCategory({ name: '', description: '' });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create category");
    }
    setCreating(false);
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
              <p className="text-gray-600 mt-2">Welcome to our discussion community</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Create Category
            </button>
            {showModal && (
              <div
                className="fixed inset-0 z-50 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center"
                onClick={() => setShowModal(false)} // click on backdrop closes modal
              >
                <div
                  className="bg-white rounded-lg shadow-lg max-w-md w-full p-6"
                  onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
                >
                  <h2 className="text-xl font-bold mb-4">Create New Category</h2>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Category Name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateCategory}
                      disabled={creating}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {creating ? "Creating..." : "Create"}
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

          {!loading && (
            <div className="divide-y">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigateToCategory(category)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-blue-600 hover:text-blue-800">{category.name}</h3>
                      <p className="text-gray-600 mt-1">{category.description}</p>
                      {/* <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>{category.totalTopics} topics</span>
                        <span>{category.totalPosts} posts</span>
                      </div> */}
                    </div>
                    {/* <div className="text-right text-sm">
                      <div className="font-medium text-gray-900">{category.lastTopic?.title || "No topics yet"}</div>
                   {category.lastTopic &&   <div className="text-gray-500">
                        by {category?.lastTopic?.author || " Anonymous"} 
                        • {moment(category.lastTopic?.createdAt).fromNow() || " just now"}
                      </div>}
                    </div> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )



}
