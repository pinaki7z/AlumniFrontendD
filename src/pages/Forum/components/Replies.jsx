
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"


const Replies = () => {
  const [votes, setVotes] = useState({})
  const [userVotes, setUserVotes] = useState({})
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



<p>Keep building! 💪</p>`,
        images: [],
      },
      timestamp: "3 hours ago",
      avatar: "DM",
      upvotes: 78,
      downvotes: 0,
    },
  ]

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

  return (
    <>
    
      {/* Replies */}
        <div className="space-y-4">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-white rounded-lg shadow-sm border">
              <div className="flex">
                {/* Vote Section */}
                <div className="bg-gray-50 p-4 hidden md:flex flex-col items-center border-r w-16">
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
        </div></>
  )
}

export default Replies