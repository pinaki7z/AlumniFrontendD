import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useSelector } from "react-redux";

const ForumPost = () => {
  const { categoryId, topicId } = useParams();
  const navigate = useNavigate();
   const profile = useSelector(state => state.profile)

  const [selectedTopic, setSelectedTopic] = useState({});
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // --- Modal & CKEditor state ---
  const [showPostModal, setShowPostModal] = useState(false);
  const [editorHtml, setEditorHtml] = useState("");
  const [uploading, setUploading] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const [postTitle, setPostTitle] = useState("");

  // --- CKEditor UploadAdapter ---
  class UploadAdapter {
    constructor(loader) {
      this.loader = loader;
    }
    upload() {
      return this.loader.file.then((file) => {
        const formData = new FormData();
        formData.append("images", file);

        setUploading(true);
        return axios
          .post(`${process.env.REACT_APP_API_URL}/uploadImage/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then((res) => {
            setUploading(false);
            const url = res.data[0];
            return { default: url };
          });
      });
    }
    abort() { }
  }

  function CustomUploadAdapterPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) =>
      new UploadAdapter(loader);
  }

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

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!editorHtml.trim()) return;

    // pull out all <img> src URLs
    const doc = new DOMParser().parseFromString(editorHtml, "text/html");
    const images = Array.from(doc.querySelectorAll("img")).map((img) => img.src);

    setCreatingPost(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/forumv2/posts`, {
        userId:profile._id,
        topicId,
        title: postTitle, // if you don’t need a separate title, you can leave empty
        content: {
          html: editorHtml,
          images,
        },
      });
      setShowPostModal(false);
      setEditorHtml("");
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Failed to create post");
    } finally {
      setCreatingPost(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex items-start justify-between">
            <div>
              <button
                onClick={navigateBack}
                className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
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
              className="bg-blue-600 text-white px-4 py-2 font-semibold rounded-lg hover:bg-blue-700 transition"
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
                <form onSubmit={handleCreatePost} className="space-y-4 max-h-[400px] overflow-y-scroll">
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
                    config={{
                      extraPlugins: [CustomUploadAdapterPlugin],
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
                        "imageUpload",
                      ],
                    }}
                    onChange={(_, editor) => {
                      setEditorHtml(editor.getData());
                    }}
                  />
                  </div>
                  {uploading && (
                    <p className="text-sm text-gray-500">Uploading…</p>
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
                      disabled={creatingPost || !editorHtml.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {creatingPost ? "Posting..." : "Post"}
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
            <div className="divide-y">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() =>
                    navigate(
                      `/home/forums/category/${categoryId}/topic/${topicId}/post/${post._id}`
                    )
                  }
                >
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content.html }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumPost;
