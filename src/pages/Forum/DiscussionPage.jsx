

import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import Replies from "./components/Replies"
import MainPost from "./components/MainPost"
import AddReplies from "./components/AddReplies"
const DiscussionPage = () => {
  const navigate = useNavigate()
  const { categoryId, topicId, postId } = useParams()



  const navigateBack = () => {
    navigate(`/home/forums/category/${categoryId}/topic/${topicId}`)
  }


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

      <div className=" max-w-7xl mx-auto p-6 ">
        {/* Header */}
        <div className=" border-b sticky top-0 z-10">
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
              Back 
            </button>
          </div>
        </div>

        {/* Main Post */}
        <MainPost/>
        {/* Replies */}
       <Replies/>

        {/* Reply Form */}
        <AddReplies/>
      </div>
    </div>
  )
}

export default DiscussionPage
