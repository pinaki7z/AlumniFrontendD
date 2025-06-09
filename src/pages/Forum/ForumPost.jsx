import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
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
const ForumPost = () => {
       const {categoryId, topicId} = useParams()
        // const params = useParams()
        const navigate = useNavigate();
        // console.log("params", params);
    
          const [selectedCategory, setSelectedCategory] = useState(  {
          id: 1,
          name: "Jobs and internships",
          description: "Talk about anything and everything",
          topicCount: 45,
          postCount: 234,
          lastPost: {
            title: "Welcome to the forum!",
            author: "admin",
            time: "2 hours ago",
          },
        },)
       
          const [posts, setPosts] = useState( [
          {
            id: 1,
            title: "Jobs at InsideOUt",
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
        ])
       
        
          const navigateToTopic = (post) => {
            // setSelectedTopic(topic)
            // setCurrentView("posts")
            navigate(`/home/forums/category/${categoryId}/topic/${topicId}/post/${post.id}`)
          }
        
          const navigateBack = () => {
           navigate(`/home/forums/category/${categoryId}`)
          }
        
    
  return (
         <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <button onClick={navigateBack} className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2">
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{selectedCategory.name}</h1>
              <p className="text-gray-600 mt-2">{selectedCategory.description}</p>
            </div>

            <div className="divide-y">
              {posts.map((topic) => (
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

export default ForumPost