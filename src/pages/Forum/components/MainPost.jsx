
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import axios from "axios"
import { useEffect } from "react"
import moment from "moment"
// import Replies from "./components/Replies"
const MainPost = () => {

  const { postId , topicId} = useParams()
  const [mainPost, setMainPost] = useState({
    content: {
      images: [],
      html: ""
    }
  })
  const [votes, setVotes] = useState({})
  const [userVotes, setUserVotes] = useState({})
  const [selectedTopic, setSelectedTopic] = useState({})

  // const selectedTopic = {
  //   id: 1,
  //   title: "Just finished building my first React app - here's what I learned!",
  //   author: "codingjourney2024",
  //   subreddit: "r/reactjs",
  //   replies: 47,
  //   views: 1234,
  //   upvotes: 892,
  //   awards: 3,
  //   timestamp: "8 hours ago",
  //   flair: "Project Showcase",
  // }

  //   const mainPost = {
  //     id: 1,
  //     author: "codingjourney2024",
  //     content: {
  //       html: `<h1>My First React Journey 🚀</h1>

  // <p>After 6 months of learning, I finally built something I'm proud of! Here's my experience and what I learned along the way.</p>

  // <h2>The Project</h2>
  // <p>I built a task management app with the following features:</p>
  // <ul>
  //   <li><strong>Real-time updates</strong> using WebSockets</li>
  //   <li><strong>Dark/Light theme</strong> toggle</li>
  //   <li><strong>Drag and drop</strong> functionality</li>
  //   <li><strong>Local storage</strong> persistence</li>
  // </ul>

  // <h2>Key Learnings</h2>

  // <h3>1. State Management is Everything</h3>
  // <p>Initially, I was passing props down 5-6 levels deep. Then I discovered Context API and everything clicked! Here's a before/after comparison:</p>

  // <p><strong>Before:</strong> Prop drilling nightmare<br>
  // <strong>After:</strong> Clean, manageable state with Context</p>

  // <h3>2. Custom Hooks are Game Changers</h3>
  // <p>I created a <code>useLocalStorage</code> hook that I now use in every project. It's amazing how reusable code can be!</p>

  // <h3>3. Performance Matters</h3>
  // <p>Learning about <code>useMemo</code> and <code>useCallback</code> saved my app from unnecessary re-renders.</p>

  // <h2>Screenshots</h2>
  // <p>Here's what the final product looks like:</p>`,
  //       images: ["https://generalbuckethai.s3.ap-south-1.amazonaws.com/2025/may/1747898798107-0_HsqZxKUdKNu70Hm0.png", "https://generalbuckethai.s3.ap-south-1.amazonaws.com/2025/may/1746686774959-Celebrate%20Ocean.png"],
  //     },
  //     timestamp: "8 hours ago",
  //     avatar: "CJ",
  //     upvotes: 892,
  //     downvotes: 23,
  //     isOriginalPost: true,
  //   }

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
          <div className="mt-6 space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.images.map((image, index) => (
              <div key={index} className="rounded-lg overflow-hidden  ">
                <img src={image || "/placeholder.svg"} alt={`Post image ${index + 1}`} className=" object-contain rounded-xl mx-auto max-h-[200px] md:max-h-[300px]" />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const VoteButtons = ({ postId, initialUpvotes }) => {
    const currentVotes = votes[postId] || 0
    const totalVotes = initialUpvotes + currentVotes
    const userVote = userVotes[postId]

    return (
      <div className="flex flex-col items-center space-y-1">
        <button
          onClick={() => handleVote(postId, "up")}
          className={`p-1 h-8 w-8 rounded-md ${userVote === "up" ? "text-orange-500 bg-orange-50" : "text-gray-400 hover:text-orange-500 hover:bg-gray-100"
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
          className={`text-sm font-medium ${userVote === "up" ? "text-orange-500" : userVote === "down" ? "text-blue-500" : "text-gray-600"
            }`}
        >
          {totalVotes}
        </span>
        <button
          onClick={() => handleVote(postId, "down")}
          className={`p-1 h-8 w-8 rounded-md ${userVote === "down" ? "text-blue-500 bg-blue-50" : "text-gray-400 hover:text-blue-500 hover:bg-gray-100"
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
  const fetchTopic= async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/forumv2/topics/${topicId}/`);
      setSelectedTopic(data);
    } catch (e) {
      console.error(e);
    }
  }

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/forumv2/posts/${postId}/`);
      console.log(response.data);
      setMainPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  }

  useEffect(() => {
    fetchPost();
    fetchTopic();
  }, [postId]);

  return (

    <>
      <div className="bg-white rounded-lg shadow-sm border mb-4">
        <div className="flex">
          {/* Vote Section */}
          <div className="bg-gray-50 p-4 md:flex flex-col items-center border-r hidden ">
            <VoteButtons postId={mainPost._id} initialUpvotes={122} />
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
                    {/* <span className="text-sm text-gray-600">{selectedTopic.subreddit}</span> */}
                    {/* <span className="text-gray-400">•</span> */}
                    {/* <span className="text-sm text-gray-500">Posted by u/{mainPost.author}</span> */}
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{moment(mainPost?.created_at).fromNow()}</span>
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
            <h1 className="text-xl font-bold text-gray-900 mb-4">{selectedTopic?.title}</h1>

            {/* Post Content */}
            {mainPost && renderHTMLContent(mainPost?.content)}

            {/* Post Actions */}
            <PostActions replies={selectedTopic?.replies} />
          </div>
        </div>
      </div>
    </>
  )
}

export default MainPost