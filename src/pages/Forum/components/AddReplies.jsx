import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"
import axios from "axios"

const AddReplies = () => {
  const [editorHtml, setEditorHtml] = useState("")
  const [loadingEditorUpload, setLoadingEditorUpload] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)

  // Remove in-editor image upload; use separate file input

  const handleFileChange = async e => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploadingImages(true)
    const formData = new FormData()
    files.forEach(file => formData.append("images", file))
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/uploadImage/image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      setUploadedImages(prev => [...prev, ...res.data])
    } catch (err) {
      console.error(err)
      alert("Image upload failed")
    } finally {
      setUploadingImages(false)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    // now you have:
    //   html: editorHtml
    //   images: uploadedImages
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/forumv2/replies`, // adjust endpoint as needed
        {
          content: {
            html: editorHtml,
            images: uploadedImages
          }
        }
      )
      setEditorHtml("")
      setUploadedImages([])
    } catch (err) {
      console.error(err)
      alert("Failed to post comment")
    }
  }

  return (
     <div className="max-w-6xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Add Your Comment</h2>
          <p className="text-gray-600 mt-1">Share your thoughts and engage with the community</p>
        </div>

        {/* Editor Section */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800 uppercase tracking-wide">
            Write Your Comment
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200">
            <CKEditor
              editor={ClassicEditor}
              data={editorHtml}
              config={{
                toolbar: [
                  "heading",
                  "|",
                  "bold",
                  "italic",
                  "underline",
                  "link",
                  "bulletedList",
                  "numberedList",
                  "|",
                  "blockQuote",
                  "insertTable",
                  "undo",
                  "redo",
                ],
              }}
              onChange={(event, editor) => setEditorHtml(editor.getData())}
            />
          </div>
        </div>

        {/* File Upload Section */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-800 uppercase tracking-wide">Attach Images</label>

          {/* Custom File Input */}
          <div className="relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="file-upload"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
              <div className="space-y-2">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span>
                  <span> or drag and drop</span>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
              </div>
            </div>
          </div>

          {/* Upload Status */}
          {uploadingImages && (
            <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-sm font-medium">Uploading images...</span>
            </div>
          )}

          {/* Image Preview */}
          {uploadedImages.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Uploaded Images ({uploadedImages.length})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {uploadedImages.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all duration-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={!editorHtml.trim()}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              ></path>
            </svg>
            Post Comment
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddReplies
