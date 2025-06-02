import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import useBlogStore from '../../store/useBlogStore';
import ImageKitUpload from "../../Components/ImageKitUpload";
import toast from 'react-hot-toast';

const CreatePost = () => {
  const [value, setValue] = useState('');
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('industry-news');
  const { createNewPost, loading } = useBlogStore();
  const [coverImage, setCoverImage] = useState("");
  const [img, setImg] = useState(""); 
  const [progress, setProgress] = useState(0);
  





  useEffect(() => {
    img && setValue((prev) => prev + `<p><image src="${img.url}"/></p>`);
  }, [img]);








  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!coverImage) {
      toast.error('Please upload a cover image');
      return;
    }

    const data = {
      title,
      category,
      excerpt,
      content: value,
      coverImage: coverImage.filePath || ""
    };

    try {
      await createNewPost(data);
      toast.success('Post created successfully!');
      navigate('/blog', { state: { refreshed: true } });
    } catch (error) {
      toast.error(error.message || 'Failed to create post');
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    // Clear the file input
    const fileInput = document.getElementById('cover-upload');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#B6B09F] px-6 md:px-20 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-[#EAE4D5] mb-8">Create New Post</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Image Upload */}
          <div className="flex flex-col">
            <label className="text-[#EAE4D5] mb-2">Cover Image</label>

         <ImageKitUpload type="image" setProgress={setProgress} setData={setCoverImage}>
         {!coverImage && <button className="w-max p-2 shadow-md rounded-xl text-sm text-gray-500 bg-white">
             Add a cover image
          </button> }

          {coverImage && (
              <div className="relative group">
                <img
                  src={coverImage.url}
                  alt="Cover preview"
                  className={`w-full h-64 object-cover rounded-lg border 
                    'border-[#B6B09F]/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-[#0a0a0a]/80 text-[#EAE4D5] p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#0a0a0a]"
                  
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

        </ImageKitUpload>


          </div>

          {/* Title */}
          <div className="flex flex-col">
            <input
              type="text"
              placeholder="My Awesome Story"
              value={title}
              name='title'
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#1a1a1a] border border-[#B6B09F]/30 text-[#EAE4D5] px-4 py-3 rounded-lg focus:outline-none focus:border-[#EAE4D5]"
              required
            />
          </div>

          {/* Category */}
          <div className="flex flex-col">
            <label htmlFor="category" className="text-[#EAE4D5] mb-2">Choose A Category:</label>
            <select
              name="category"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#1a1a1a] border border-[#B6B09F]/30 text-[#EAE4D5] px-4 py-3 rounded-lg focus:outline-none focus:border-[#EAE4D5]"
            >
              <option value="Industry News">Industry News</option>
              <option value="Artist Spotlight">Artist Spotlights</option>
              <option value="New Music">New Music</option>
              <option value="Label Updates">Label Updates</option>
            </select>
          </div>

          {/* Excerpt */}
          <div className="flex flex-col">
            <textarea
              name="excerpt"
              placeholder="Excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="bg-[#1a1a1a] border border-[#B6B09F]/30 text-[#EAE4D5] px-4 py-3 rounded-lg focus:outline-none focus:border-[#EAE4D5] min-h-[120px]"
            />
          </div>

          {/* Rich Text Editor */}
          <div className="flex flex-col">
            <ReactQuill
              theme="snow"
              value={value}
              onChange={setValue}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'color': [] }, { 'background': [] }],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link', 'image'],
                  ['clean']
                ]
              }}
              className="bg-[#1a1a1a] text-[#EAE4D5] rounded-lg overflow-hidden"
              style={{ borderColor: '#B6B09F/30' }}
            />
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            className={`px-6 py-3 bg bg-[#1a1a1a] text-[#EAE4D5] font-medium rounded-lg transition-colors duration-200`}
          >
            Create Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;