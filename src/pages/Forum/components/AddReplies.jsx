import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"
import axios from "axios"
const AddReplies = () => {

    const [editorHtml, setEditorHtml] = useState("")
  const [loading, setLoading] = useState(false)

  // 1) Custom Upload Adapter
  class UploadAdapter {
    constructor(loader) {
      this.loader = loader
    }

    // CKEditor calls this to start upload
    upload() {
      return this.loader.file
        .then(file => {
          const formData = new FormData()
          formData.append("images", file)

          setLoading(true)
          return axios
            .post(
              `${process.env.REACT_APP_API_URL}/uploadImage/image`,
              formData,
              { headers: { "Content-Type": "multipart/form-data" } }
            )
            .then(res => {
              setLoading(false)
              // assume res.data is an array of URLs; take the first
              const url = res.data[0]
              return { default: url }
            })
        })
    }

    abort() {
      // optional: handle abort
    }
  }

  // plugin to wire UploadAdapter into CKEditor
  function CustomUploadAdapterPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = loader => {
      return new UploadAdapter(loader)
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    // extract all <img> src URLs into an array
    const doc = new DOMParser().parseFromString(editorHtml, "text/html")
    const images = Array.from(doc.querySelectorAll("img")).map(img => img.src)

    // now you have:
    //   html: editorHtml
    //   images: [ ... ]
    console.log({ html: editorHtml, images })
    // send to your replies API...
    setEditorHtml("") // reset
  }



  return (
    <>
         <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block font-medium">Add a comment</label>
      <CKEditor
        editor={ClassicEditor}
        data={editorHtml}
        config={{
          extraPlugins: [CustomUploadAdapterPlugin],
          toolbar: [
            "heading", "|",
            "bold","italic","underline","link","bulletedList","numberedList",
            "|","blockQuote","insertTable","undo","redo","imageUpload"
          ]
        }}
        onChange={(event, editor) => {
          setEditorHtml(editor.getData())
        }}
      />
      {loading && <p className="text-sm text-gray-500">Uploading…</p>}
      <button
        type="submit"
        disabled={!editorHtml.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Comment
      </button>
    </form>
    </>
  )
}

export default AddReplies