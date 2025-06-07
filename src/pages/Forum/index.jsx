
import { useState } from "react"
import { useNavigate } from "react-router-dom"

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
  const [currentView, setCurrentView] = useState("categories")
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [newReply, setNewReply] = useState("")

  const navigateToCategory = (category) => {
    navigate(`/home/forums/category/${category.id}`)
    // setSelectedCategory(category)
    setCurrentView("topics")
  }

  const navigateToTopic = (topic) => {
    setSelectedTopic(topic)
    setCurrentView("posts")
  }

  const navigateBack = () => {
    if (currentView === "posts") {
      setCurrentView("topics")
      setSelectedTopic(null)
    } else if (currentView === "topics") {
      setCurrentView("categories")
      setSelectedCategory(null)
    }
  }

  const handleReplySubmit = (e) => {
    e.preventDefault()
    if (newReply.trim()) {
      // In a real app, this would send to backend
      console.log("New reply:", newReply)
      setNewReply("")
    }
  }

  // Categories View
  if (currentView === "categories") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
              <p className="text-gray-600 mt-2">Welcome to our discussion community</p>
            </div>

            <div className="divide-y">
              {forumData.categories.map((category) => (
                <div
                  key={category.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigateToCategory(category)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-blue-600 hover:text-blue-800">{category.name}</h3>
                      <p className="text-gray-600 mt-1">{category.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>{category.topicCount} topics</span>
                        <span>{category.postCount} posts</span>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium text-gray-900">{category.lastPost.title}</div>
                      <div className="text-gray-500">
                        by {category.lastPost.author} • {category.lastPost.time}
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

  // Topics View
  if (currentView === "topics") {
    const topics = forumData.topics[selectedCategory.id] || []

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <button onClick={navigateBack} className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2">
                ← Back to Categories
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{selectedCategory.name}</h1>
              <p className="text-gray-600 mt-2">{selectedCategory.description}</p>
            </div>

            <div className="divide-y">
              {topics.map((topic) => (
                <div
                  key={topic.id}
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
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>by {topic.author}</span>
                        <span>{topic.replies} replies</span>
                        <span>{topic.views} views</span>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-500">Last reply by {topic.lastReply.author}</div>
                      <div className="text-gray-400">{topic.lastReply.time}</div>
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

  // Posts View
  if (currentView === "posts") {
    const posts = forumData.posts[selectedTopic.id] || []

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <button onClick={navigateBack} className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2">
                ← Back to {selectedCategory.name}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{selectedTopic.title}</h1>
            </div>

            <div className="divide-y">
              {posts.map((post) => (
                <div key={post.id} className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {post.avatar}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{post.author}</span>
                        {post.isOriginalPost && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Original Post
                          </span>
                        )}
                        <span className="text-gray-500 text-sm">{post.timestamp}</span>
                      </div>
                      <div className="text-gray-700 leading-relaxed">{post.content}</div>
                    </div>
                  </div>

                  {/* Replies */}
                  {post.replies && post.replies.length > 0 && (
                    <div className="ml-16 mt-6 space-y-4">
                      {post.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {reply.avatar}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900">{reply.author}</span>
                              <span className="text-gray-500 text-sm">{reply.timestamp}</span>
                            </div>
                            <div className="text-gray-700">{reply.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Reply Form */}
            <div className="p-6 border-t bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Post a Reply</h3>
              <form onSubmit={handleReplySubmit}>
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Write your reply here..."
                  className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Post Reply
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
