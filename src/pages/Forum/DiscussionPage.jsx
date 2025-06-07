"use client"

import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

const DiscussionPage = () => {
  const navigate = useNavigate()
  const { categoryId, topicId } = useParams()
  const [newReply, setNewReply] = useState("")
  const [votes, setVotes] = useState({})
  const [userVotes, setUserVotes] = useState({})

  const selectedTopic = {
    id: 1,
    title: "Just finished building my first React app - here's what I learned!",
    author: "codingjourney2024",
    subreddit: "r/reactjs",
    replies: 47,
    views: 1234,
    upvotes: 892,
    awards: 3,
    timestamp: "8 hours ago",
    flair: "Project Showcase",
  }

  const mainPost = {
    id: 1,
    author: "codingjourney2024",
    content: {
      html: `<h1>My First React Journey 🚀</h1>

<p>After 6 months of learning, I finally built something I'm proud of! Here's my experience and what I learned along the way.</p>

<h2>The Project</h2>
<p>I built a task management app with the following features:</p>
<ul>
  <li><strong>Real-time updates</strong> using WebSockets</li>
  <li><strong>Dark/Light theme</strong> toggle</li>
  <li><strong>Drag and drop</strong> functionality</li>
  <li><strong>Local storage</strong> persistence</li>
</ul>

<h2>Key Learnings</h2>

<h3>1. State Management is Everything</h3>
<p>Initially, I was passing props down 5-6 levels deep. Then I discovered Context API and everything clicked! Here's a before/after comparison:</p>

<p><strong>Before:</strong> Prop drilling nightmare<br>
<strong>After:</strong> Clean, manageable state with Context</p>

<h3>2. Custom Hooks are Game Changers</h3>
<p>I created a <code>useLocalStorage</code> hook that I now use in every project. It's amazing how reusable code can be!</p>

<h3>3. Performance Matters</h3>
<p>Learning about <code>useMemo</code> and <code>useCallback</code> saved my app from unnecessary re-renders.</p>

<h2>Screenshots</h2>
<p>Here's what the final product looks like:</p>`,
      images: ["https://generalbuckethai.s3.ap-south-1.amazonaws.com/2025/may/1747898798107-0_HsqZxKUdKNu70Hm0.png", "https://generalbuckethai.s3.ap-south-1.amazonaws.com/2025/may/1746686774959-Celebrate%20Ocean.png"],
    },
    timestamp: "8 hours ago",
    avatar: "CJ",
    upvotes: 892,
    downvotes: 23,
    isOriginalPost: true,
  }

  const replies = [
    {
      id: 2,
      author: "react_veteran",
      content: {
        html: `<p>Congrats on your first app! 🎉</p>

<p>Your learning journey sounds very familiar. A few suggestions for your next project:</p>

<h2>Performance Tips</h2>
<ul>
  <li>Consider using <code>React.memo</code> for components that don't need frequent updates</li>
  <li>Look into code splitting with <code>React.lazy</code></li>
</ul>

<h2>Architecture</h2>
<p>Have you considered using a state management library like <strong>Zustand</strong> or <strong>Redux Toolkit</strong>? For larger apps, they can be lifesavers.</p>

<p>Keep up the great work!</p>`,
        images: ["https://generalbuckethai.s3.ap-south-1.amazonaws.com/2025/may/1746686774959-Celebrate%20Ocean.png"],
      },
      timestamp: "6 hours ago",
      avatar: "RV",
      upvotes: 234,
      downvotes: 5,
      replies: [
        {
          id: 3,
          author: "codingjourney2024",
          content: {
            html: `<p>Thanks for the suggestions! I've heard great things about Zustand. Will definitely check it out for my next project.</p>

<p><strong>Quick question</strong> - when would you recommend switching from Context API to a dedicated state management library?</p>`,
            images: [],
          },
          timestamp: "5 hours ago",
          avatar: "CJ",
          upvotes: 89,
          downvotes: 1,
        },
      ],
    },
    {
      id: 4,
      author: "frontend_ninja",
      content: {
        html: `<p>This looks awesome! The UI is really clean.</p>

<h2>Design Question</h2>
<p>What did you use for styling? The color scheme and typography look really <em>professional</em>.</p>

<p>Also, here's a similar project I built last month:</p>`,
        images: ["/placeholder.svg?height=250&width=400"],
      },
      timestamp: "4 hours ago",
      avatar: "FN",
      upvotes: 156,
      downvotes: 2,
    },
    {
      id: 5,
      author: "debugging_master",
      content: {
        html: `<p>Great work! One thing I noticed in your code structure - you might want to consider implementing <strong>error boundaries</strong>. They're a lifesaver when things go wrong in production.</p>

<p>Here's a simple example:</p>

<pre><code>class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return &lt;h1&gt;Something went wrong.&lt;/h1&gt;;
    }
    return this.props.children;
  }
}</code></pre>

<p>Keep building! 💪</p>`,
        images: [],
      },
      timestamp: "3 hours ago",
      avatar: "DM",
      upvotes: 78,
      downvotes: 0,
    },
  ]

  const handleVote = (postId, voteType) => {
    const currentVote = userVotes[postId]
    let newVote = voteType

    if (currentVote === voteType) {
      newVote = null // Remove vote if clicking same button
    }

    setUserVotes((prev) => ({ ...prev, [postId]: newVote }))

    // Update vote count
    setVotes((prev) => {
      const currentCount = prev[postId] || 0
      let change = 0

      if (currentVote === "up" && newVote !== "up") change -= 1
      if (currentVote === "down" && newVote !== "down") change += 1
      if (newVote === "up" && currentVote !== "up") change += 1
      if (newVote === "down" && currentVote !== "down") change -= 1

      return { ...prev, [postId]: currentCount + change }
    })
  }

  const handleReplySubmit = (e) => {
    e.preventDefault()
    if (newReply.trim()) {
      // In a real app, this would send to backend
      console.log("New reply:", newReply)
      setNewReply("")
    }
  }

  const renderHTMLContent = (content) => {
    return (
      <div className="space-y-4">
        {/* Render HTML content */}
        <div
          className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content.html }}
          style={{
            // Custom styles for HTML elements
            "--tw-prose-headings": "#1f2937",
            "--tw-prose-h1": "#111827",
            "--tw-prose-h2": "#374151",
            "--tw-prose-h3": "#4b5563",
            "--tw-prose-bold": "#1f2937",
            "--tw-prose-code": "#dc2626",
            "--tw-prose-pre-bg": "#f3f4f6",
            "--tw-prose-pre-code": "#374151",
          }}
        />

        {/* Render images if any */}
        {content.images && content.images.length > 0 && (
          <div className="mt-6 space-y-4">
            {content.images.map((image, index) => (
              <div key={index} className="rounded-lg overflow-hidden border">
                <img src={image || "/placeholder.svg"} alt={`Post image ${index + 1}`} className="w-full h-auto" />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const navigateBack = () => {
    navigate(`/home/forums/category/${categoryId}`)
  }

  const VoteButtons = ({ postId, initialUpvotes }) => {
    const currentVotes = votes[postId] || 0
    const totalVotes = initialUpvotes + currentVotes
    const userVote = userVotes[postId]

    return (
      <div className="flex flex-col items-center space-y-1">
        <button
          onClick={() => handleVote(postId, "up")}
          className={`p-1 h-8 w-8 rounded-md ${
            userVote === "up" ? "text-orange-500 bg-orange-50" : "text-gray-400 hover:text-orange-500 hover:bg-gray-100"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
        <span
          className={`text-sm font-medium ${
            userVote === "up" ? "text-orange-500" : userVote === "down" ? "text-blue-500" : "text-gray-600"
          }`}
        >
          {totalVotes}
        </span>
        <button
          onClick={() => handleVote(postId, "down")}
          className={`p-1 h-8 w-8 rounded-md ${
            userVote === "down" ? "text-blue-500 bg-blue-50" : "text-gray-400 hover:text-blue-500 hover:bg-gray-100"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
    )
  }

  const PostActions = ({ replies }) => (
    <div className="flex items-center space-x-4 mt-4">
      <button className="flex items-center text-gray-500 hover:text-gray-700 text-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 mr-1"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {replies} Comments
      </button>
      <button className="flex items-center text-gray-500 hover:text-gray-700 text-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 mr-1"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Share
      </button>
      <button className="flex items-center text-gray-500 hover:text-gray-700 text-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 mr-1"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        Save
      </button>
      <button className="flex items-center text-gray-500 hover:text-gray-700 text-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add custom CSS for HTML content styling */}
      <style jsx>{`
        .prose h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.2;
        }
        .prose h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #374151;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }
        .prose h3 {
          font-size: 1.25rem;
          font-weight: 500;
          color: #4b5563;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        .prose p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        .prose ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        .prose li {
          margin-bottom: 0.5rem;
        }
        .prose strong {
          font-weight: 600;
          color: #1f2937;
        }
        .prose em {
          font-style: italic;
          color: #4b5563;
        }
        .prose code {
          background-color: #f3f4f6;
          color: #dc2626;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: 'Courier New', monospace;
        }
        .prose pre {
          background-color: #f3f4f6;
          color: #374151;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .prose pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="p-4">
            <button onClick={navigateBack} className="flex items-center text-blue-600 hover:text-blue-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 mr-2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to {selectedTopic.subreddit}
            </button>
          </div>
        </div>

        {/* Main Post */}
        <div className="bg-white rounded-lg shadow-sm border mb-4">
          <div className="flex">
            {/* Vote Section */}
            <div className="bg-gray-50 p-4 flex flex-col items-center border-r">
              <VoteButtons postId={mainPost.id.toString()} initialUpvotes={mainPost.upvotes} />
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                    {mainPost.avatar}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{selectedTopic.subreddit}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500">Posted by u/{mainPost.author}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{mainPost.timestamp}</span>
                    </div>
                    {selectedTopic.flair && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                        {selectedTopic.flair}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Post Title */}
              <h1 className="text-xl font-bold text-gray-900 mb-4">{selectedTopic.title}</h1>

              {/* Post Content */}
              {renderHTMLContent(mainPost.content)}

              {/* Post Actions */}
              <PostActions replies={selectedTopic.replies} />
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-white rounded-lg shadow-sm border">
              <div className="flex">
                {/* Vote Section */}
                <div className="bg-gray-50 p-4 flex flex-col items-center border-r w-16">
                  <VoteButtons postId={reply.id.toString()} initialUpvotes={reply.upvotes} />
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="h-6 w-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">
                      {reply.avatar}
                    </div>
                    <span className="font-medium text-sm">u/{reply.author}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{reply.timestamp}</span>
                  </div>

                  {renderHTMLContent(reply.content)}

                  <div className="flex items-center space-x-4 mt-3">
                    <button className="flex items-center text-gray-500 hover:text-gray-700 text-xs">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3 mr-1"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Reply
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-gray-700 text-xs">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3 mr-1"
                      >
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                      Share
                    </button>
                  </div>

                  {/* Nested Replies */}
                  {reply.replies && reply.replies.length > 0 && (
                    <div className="ml-6 mt-4 border-l-2 border-gray-200 pl-4 space-y-3">
                      {reply.replies.map((nestedReply) => (
                        <div key={nestedReply.id} className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="h-5 w-5 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                              {nestedReply.avatar}
                            </div>
                            <span className="font-medium text-xs">u/{nestedReply.author}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{nestedReply.timestamp}</span>
                          </div>
                          {renderHTMLContent(nestedReply.content)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        <div className="bg-white rounded-lg shadow-sm border mt-6 mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Add a comment</h3>
            <form onSubmit={handleReplySubmit}>
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Write your comment using HTML tags like <strong>bold</strong>, <em>italic</em>, <h2>headers</h2>, etc."
                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
              />
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newReply.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Comment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiscussionPage
