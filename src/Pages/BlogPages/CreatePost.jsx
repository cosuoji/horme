import { useUser } from '@clerk/clerk-react';
import Loading from '../../Components/Loading';
import Login from '../Login';
import { useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const CreatePost = () => {
  const { isLoaded, isSignedIn } = useUser();
  const [value, setValue] = useState('');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('industry-news');
  const [isSubmitting, setIsSubmitting] = useState(false);

    
    // New state for image upload
    const [coverImage, setCoverImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        setCoverImage(file);
        setPreviewImage(URL.createObjectURL(file));
      }
    };
  
    const triggerFileInput = () => {
      fileInputRef.current.click();
    };
  
    const removeImage = () => {
      setCoverImage(null);
      setPreviewImage('');
    };


  if (!isLoaded) {
    return <Loading />;
  }

  // if(isLoaded && !isSignedIn) {
  //   return <Login />
  // }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#B6B09F] px-6 md:px-20 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-[#EAE4D5] mb-8">Create New Post</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cover Image Upload */}
        {/* Cover Image Upload */}
        <div className="flex flex-col">
            <label className="text-[#EAE4D5] mb-2">Cover Image</label>
            
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            
            {/* Upload button */}
            <button
              type="button"
              onClick={triggerFileInput}
              className="w-full md:w-64 px-4 py-3 bg-[#1a1a1a] border border-[#B6B09F]/30 rounded-lg text-[#EAE4D5] hover:bg-[#2a2a2a] transition-colors duration-200 mb-4"
            >
              {coverImage ? 'Change Image' : 'Add A Cover Image'}
            </button>
            
            {/* Image preview */}
            {previewImage && (
              <div className="relative group">
                <img
                  src={previewImage}
                  alt="Cover preview"
                  className="w-full h-64 object-cover rounded-lg border border-[#B6B09F]/30"
                />
                {/* Remove button */}
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-[#0a0a0a]/80 text-[#EAE4D5] p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#0a0a0a]"
                  aria-label="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div className="flex flex-col">
            <input
              type="text"
              placeholder="My Awesome Story"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#1a1a1a] border border-[#B6B09F]/30 text-[#EAE4D5] px-4 py-3 rounded-lg focus:outline-none focus:border-[#EAE4D5]"
              required
            />
          </div>

          {/* Category Select */}
          <div className="flex flex-col">
            <label htmlFor="category" className="text-[#EAE4D5] mb-2">Choose A Category:</label>
            <select
              name="cat"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#1a1a1a] border border-[#B6B09F]/30 text-[#EAE4D5] px-4 py-3 rounded-lg focus:outline-none focus:border-[#EAE4D5]"
            >
              <option value="industry-news">Industry News</option>
              <option value="artist-spotlight">Artist Spotlights</option>
              <option value="new-music">New Music</option>
              <option value="label-updates">Label Updates</option>
            </select>
          </div>

          {/* Excerpt Textarea */}
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

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`px-6 py-3 ${isSubmitting ? 'bg-[#B6B09F]' : 'bg-[#EAE4D5]'} text-[#0a0a0a] font-medium rounded-lg transition-colors duration-200`}
          >
            {isSubmitting ? 'Publishing...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;