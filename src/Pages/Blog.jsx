import React, { useState, useEffect } from 'react';
import PageTransition from '../Components/PageTransition';
import MainCategories from '../Components/MainCategories';
import blogPosts from '../utils/blogposts';
import { Link, useLocation, useNavigate} from 'react-router-dom';
import blogCategories from '../utils/blogCategories';
import useBlogStore from '../store/useBlogStore';


const Blog = () => {
 
  const location = useLocation();
  const [results, setResults] = useState("")
  const [filteredPosts, setFilteredPosts] = useState(blogPosts);
  const navigate = useNavigate();
  //const { posts, loading, error, fetchPosts } = useBlogStore();


  // useEffect(() => {
  //   if (posts.length === 0) {
  //     fetchPosts();
  //   }
  // }, [fetchPosts, posts.length]);
    // Get active category from URL
    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const activeCategory = params.get('category') || 'all';
      const searchQuery = params.get('search')?.toLowerCase().trim() || '';
    
      let posts = [...blogPosts];
    
      // Filter by category
      if (activeCategory !== 'all') {
        posts = posts.filter(post => post.categorySlug === activeCategory);      }
    
      // Filter by search term
      if (searchQuery) {
        posts = posts.filter(post =>
          post.title.toLowerCase().includes(searchQuery) ||
          post.content.toLowerCase().includes(searchQuery) ||
          post.excerpt.toLowerCase().includes(searchQuery)
        );
      }
      
      setFilteredPosts(posts);
    }, [location.search]);
    

    return (
      <PageTransition>
        <div className="min-h-screen bg-[#0a0a0a] text-[#B6B09F] px-6 md:px-20 py-20 space-y-14 animate-fadeUp">
          {/* Main Content */}
          <div>
            <h2 className="text-4xl font-bold text-[#EAE4D5] mb-4">Blog</h2>
            <p className="text-lg leading-relaxed"> 
              Catch up with all things Horme Music x Industry
            </p>    
          </div>
          
          <MainCategories />
          {location.search.includes('author=') && (
  <div className="text-[#EAE4D5] mb-6">
    Showing posts by: {new URLSearchParams(location.search).get('author')}
    <button 
      onClick={() => navigate('/blog')}
      className="ml-4 text-sm text-[#B6B09F] hover:text-[#EAE4D5]"
    >
      (Clear filter)
    </button>
  </div>
)}
          
          {/* Blog Posts Grid - Now shows filtered posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                 <Link 
        to={`/blog/${post.id}-${post.titleSlug}`} // This creates the link to the single post page
        key={post.id}
        className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.02] block" // Added 'block' class
      >
                  {/* Cover Image */}
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={post.coverImage} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Content */}
                  
                  <div className="p-4 bg-[#121212] group-hover:bg-[#1a1a1a] transition-colors duration-300">
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#EAE4D5] bg-[#2a2a2a] px-2 py-1 rounded">
                        {blogCategories.find(cat => cat.categoryslug === post.categorySlug)?.name || post.category}
                      </span>
                      <span className="text-sm text-[#B6B09F]/80">
                        {post.date}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-[#EAE4D5] mb-2 group-hover:text-[#f0ece1] transition-colors duration-300">
                      {post.title}
                    </h3>
                    
                    <p className="text-[#B6B09F]/80 line-clamp-2">
                      {post.excerpt}
                    </p>
                    
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="text-[#EAE4D5] text-sm font-medium hover:underline">
                        Read More →
                      </button>
                    </div>
                   
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-[#EAE4D5] text-lg">
  {location.search.includes('search=')
    ? 'No posts matched your search.'
    : 'No posts found in this category.'}
</p>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    )
}

export default Blog;