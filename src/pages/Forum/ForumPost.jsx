import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useSelector } from "react-redux";

const ForumPost = () => {
  const { categoryId, topicId } = useParams();
  const navigate = useNavigate();
  const profile = useSelector(state => state.profile);

  const [selectedTopic, setSelectedTopic] = useState({});
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // --- Modal & CKEditor state ---
  const [showPostModal, setShowPostModal] = useState(false);
  const [editorHtml, setEditorHtml] = useState("");
  const [postTitle, setPostTitle] = useState("");

  // --- Image Upload state ---
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const fetchTopic = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/forumv2/topics/${topicId}/`
      );
      setSelectedTopic(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/forumv2/posts/topic/${topicId}/`
      );
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchTopic();
    fetchPosts();
  }, [topicId]);

  const navigateBack = () => {
    navigate(`/home/forums/category/${categoryId}`);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImages(true);
    const formData = new FormData();
    files.forEach(file => formData.append("images", file));
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/uploadImage/image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      // server returns array of URLs
      setUploadedImages(prev => [...prev, ...res.data]);
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!editorHtml.trim()) return;

    setShowPostModal(false);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/forumv2/posts`, {
        userId: profile._id,
        topicId,
        title: postTitle,
        content: {
          html: editorHtml,
          images: uploadedImages,
        },
      });
      // reset state
      setEditorHtml("");
      setPostTitle("");
      setUploadedImages([]);
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Failed to create post");
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg">
          <div className="p-6 border-b flex items-start justify-between">
            <div>
              <button
                onClick={navigateBack}
                className="text-[#0A3A4C] hover:text-blue-800 mb-4 flex items-center gap-2"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedTopic.title}
              </h1>
              <p className="text-gray-600 mt-2">
                {selectedTopic.description}
              </p>
            </div>
            <button
              onClick={() => setShowPostModal(true)}
              className="bg-[#0A3A4C] text-white px-4 py-2 font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              + Create Post
            </button>
          </div>

          {/* --- CKEditor Modal --- */}
          {showPostModal && (
            <div
              className="fixed inset-0 z-50 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center"
              onClick={() => setShowPostModal(false)}
            >
              <div
                className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 mx-2"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-4">New Post</h2>
                <form onSubmit={handleCreatePost} className="space-y-4 max-h-[600px] overflow-y-auto">
                  <input
                    type="text"
                    placeholder="Post Title"
                    value={postTitle}
                    onChange={e => setPostTitle(e.target.value)}
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <label className="block font-medium">Content</label>
                  <div>
                    <CKEditor
                      editor={ClassicEditor}
                      data={editorHtml}
                      config={{ toolbar: [
                        "heading", "|", "bold", "italic", "underline", "link",
                        "bulletedList", "numberedList", "|", "blockQuote", "insertTable",
                        "undo", "redo"
                      ] }}
                      onChange={(_, editor) => setEditorHtml(editor.getData())}
                    />
                  </div>

                  <label className="block font-medium">Upload Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full"
                  />
                  {uploadingImages && <p className="text-sm text-gray-500">Uploading images…</p>}
                  {uploadedImages.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto mt-2">
                      {uploadedImages.map((url, idx) => (
                        <img key={idx} src={url} alt={`Upload ${idx+1}`} className="h-24 object-cover rounded" />
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowPostModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!editorHtml.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Post
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* --- Posts List --- */}
          {loadingPosts ? (
            <div className="p-6 text-center text-gray-500">Loading posts…</div>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map(post => {
                const { html, images } = post.content;
                const firstImage = images[0];

                return (
                  <div
                    key={post._id}
                    className="flex h-[250px] shadow-md rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer py-2"
                    onClick={() =>
                      navigate(
                        `/home/forums/category/${categoryId}/topic/${topicId}/post/${post._id}`
                      )
                    }
                  >
                    <div className="flex-1 p-4 overflow-hidden">
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: html.replace(/<img[^>]*>/g, "") }}
                      />
                    </div>

                    <div className="w-[250px] flex-shrink-0 flex items-center justify-center bg-gray-100">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt="Post attachment"
                          className="h-full object-cover rounded"
                        />
                      ) : (
                        <div className="text-gray-400">No image</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumPost;