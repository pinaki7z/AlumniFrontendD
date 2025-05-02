import React, { useState, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from 'axios';

const CKeditor = ({ value, onChange, setNewForum }) => {
  const [editorData, setEditorData] = useState(value || '');
  const editorRef = useRef();

  function UploadAdapter(loader) {
    return {
      upload: () => loader.file.then(file => {
        // Prepare form data
        const formData = new FormData();
        formData.append('image', file);

        // Post to your single-image upload endpoint
        return axios.post(
          `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then(response => {
          const imageUrl = response.data?.imageUrl;
          // Update parent state with the uploaded image URL
          setNewForum(prev => ({ ...prev, picture: imageUrl }));

          // Resolve upload for CKEditor
          return { default: imageUrl };
        })
        .catch(error => {
          console.error('Upload failed:', error);
          return Promise.reject(error);
        });
      })
    };
  }

  function UploadPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = loader => {
      return UploadAdapter(loader);
    };
  }

  const handleReady = editor => {
    console.log('Editor is ready to use!', editor);
    editorRef.current = editor;
  };

  const handleChange = (event, editor) => {
    let data = editor.getData();
    // Optionally style links
    data = data.replace(/<a href=/g, '<a style="text-decoration: underline;" href=');

    setEditorData(data);
    onChange(data);
  };

  return (
    <div className="ck-editor-container">
      <CKEditor
        editor={ClassicEditor}
        config={{ extraPlugins: [UploadPlugin] }}
        data={editorData}
        onReady={handleReady}
        onChange={handleChange}
      />
    </div>
  );
};

export default CKeditor;
