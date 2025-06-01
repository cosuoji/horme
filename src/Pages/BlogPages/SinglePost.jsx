import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaTwitter, FaFacebookF, FaCalendarAlt, FaUser } from 'react-icons/fa';
import blogPosts from '../../utils/blogposts';

const SinglePost = () => {
    const navigate = useNavigate();
    const params = useParams();
   
    
    // Extract ID whether from '/blog/2' or '/blog/2-slug'
    const postId = Number(params.id.split("-")[0]);
    const singleBlog = blogPosts.find(post => post.id === postId);

  // Redirect to canonical URL (ID+slug) if needed
  useEffect(() => {
    if (singleBlog) {
      const expectedPath = `/blog/${singleBlog.id}-${singleBlog.slug}`;
      if (window.location.pathname !== expectedPath) {
        navigate(expectedPath, { replace: true });
      }
    }
  }, [singleBlog, navigate]);

  // Handle missing posts
  if (!singleBlog) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#B6B09F] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#EAE4D5] mb-4">Post Not Found</h1>
          <button 
            onClick={() => navigate('/blog')}
            className="text-[#EAE4D5] hover:text-white underline"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const handleCategoryClick = (category) => {
    navigate(`/blog?category=${category}`);
  };

  const handleAuthorClick = (authorName) => {
    navigate(`/blog?author=${encodeURIComponent(authorName)}`);
  };


  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${window.location.href}&text=${encodeURIComponent(singleBlog.title)}`;
    window.open(url, '_blank');
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#B6B09F]">
      {/* Back Button */}
      <div className="px-6 md:px-20 pt-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-[#EAE4D5] hover:text-white mb-8 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" />
          Back to Blog
        </button>
      </div>
      
      {/* Cover Image */}
      <div className="w-full h-64 md:h-96 relative">
        <img 
          src={singleBlog.coverImage} 
          alt={singleBlog.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </div>
      
      {/* Post Header */}
      <div className="px-6 md:px-20 -mt-16 relative z-10">
        <div className="max-w-4xl mx-auto bg-[#0a0a0a] p-8 rounded-t-lg">
          <h1 className="text-3xl md:text-5xl font-bold text-[#EAE4D5] mb-6 leading-tight">
            {singleBlog.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-[#B6B09F]">
            {/* Author */}
            <div className="flex items-center">
              <FaUser className="mr-2 text-[#EAE4D5]" />
              <button 
                onClick={() => handleAuthorClick(singleBlog.author)}
                className="hover:text-[#EAE4D5] hover:underline transition-colors duration-200"
              >
                {singleBlog.author}
              </button>
            </div>
            
            {/* Category */}
            <button 
              onClick={() => handleCategoryClick(singleBlog.categorySlug)}
              className="flex items-center hover:text-[#EAE4D5] transition-colors duration-200"
            >
              <span className="bg-[#EAE4D5]/10 hover:bg-[#EAE4D5]/20 px-3 py-1 rounded-full text-sm transition-colors duration-200">
                {singleBlog.category}
              </span>
            </button>
            
            {/* Date */}
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2 text-[#EAE4D5]" />
              <span>{singleBlog.date}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Post Content */}
      <div className="px-6 md:px-20 pb-20">
        <div className="max-w-4xl mx-auto bg-[#0a0a0a] p-8 rounded-b-lg">
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: singleBlog.content }}
          />
        </div>
      </div>
      
      {/* Share Buttons */}
      <div className="px-6 md:px-20 pb-12">
        <div className="max-w-4xl mx-auto border-t border-[#B6B09F]/20 pt-8">
          <h3 className="text-lg font-medium text-[#EAE4D5] mb-4">Share this post</h3>
          <div className="flex space-x-4">
            <button 
              onClick={shareOnTwitter}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1DA1F2] text-white hover:bg-[#1a8cd8] transition-colors duration-200"
              aria-label="Share on Twitter"
            >
              <FaTwitter />
            </button>
            <button 
              onClick={shareOnFacebook}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#4267B2] text-white hover:bg-[#3b5998] transition-colors duration-200"
              aria-label="Share on Facebook"
            >
              <FaFacebookF />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePost;