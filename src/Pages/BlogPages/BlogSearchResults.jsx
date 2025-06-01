import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import blogPosts from "../../utils/blogposts";

const BlogSearchResults = () => {
  console.log(blogPosts)
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Enhanced search function with more logging
  const searchPosts = (query) => {
    console.log('[searchPosts] Function called with query:', query);
    if (!query || !query.trim()) {
      console.log('[searchPosts] Empty query, returning empty array');
      return [];
    }
    
    const searchTerm = query.toLowerCase().trim();
    console.log(`[searchPosts] Searching for: "${searchTerm}"`);
    
    const filtered = blogPosts.filter(post => {
      const titleMatch = post.title.toLowerCase().includes(searchTerm);
      const contentMatch = post.content?.toLowerCase().includes(searchTerm);
      const excerptMatch = post.excerpt.toLowerCase().includes(searchTerm);
      
      console.log(`[searchPosts] Checking post "${post.title}":`, {
        titleMatch,
        contentMatch,
        excerptMatch
      });
      
      return titleMatch || contentMatch || excerptMatch;
    });

    console.log('[searchPosts] Found results:', filtered);
    return filtered;
  };

  useEffect(() => {
    console.log('[useEffect] Location changed:', location);
    const params = new URLSearchParams(location.search);
    const query = params.get('search') || '';
    console.log('[useEffect] Extracted search query:', query);
    
    setSearchQuery(query);

    if (query) {
      console.log('[useEffect] Starting search...');
      setLoading(true);
      
      // Immediate search without timeout for debugging
      const searchResults = searchPosts(query);
      console.log('[useEffect] Search completed:', searchResults);
      
      setResults(searchResults);
      setLoading(false);
    } else {
      console.log('[useEffect] No search query, clearing results');
      setResults([]);
    }
  }, [location.search]); // Important: dependency on location.search

  // Debug view
  console.log('[Render] Current state:', {
    searchQuery,
    loading,
    results,
    location: location.search
  });

  return (
    <div className="search-results">
      {/* Debug panel - remove in production */}
      <div className="debug-panel bg-[#1a1a1a] p-4 mb-6 rounded-lg">
        <h4 className="text-[#EAE4D5] font-bold mb-2">Debug Information</h4>
        <p className="text-sm text-[#B6B09F]">Current URL: {location.pathname}{location.search}</p>
        <p className="text-sm text-[#B6B09F]">Search Query: "{searchQuery}"</p>
        <p className="text-sm text-[#B6B09F]">Results Found: {results.length}</p>
      </div>

      {/* Rest of your JSX remains the same */}
      {loading ? (
        <p className="text-[#EAE4D5]">Loading search results...</p>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map(post => (
            <div key={post.id} className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.02]">
              {/* Your post rendering code */}
              <div key={post.id} className="group bg-[#1a1a1a] p-4 rounded-lg shadow-md">
  <img src={post.coverImage} alt={post.title} className="rounded mb-3 w-full h-48 object-cover" />
  <h3 className="text-[#EAE4D5] text-lg font-semibold mb-1">{post.title}</h3>
  <p className="text-[#B6B09F] text-sm mb-2">{post.excerpt}</p>
  <p className="text-[#8f8f8f] text-xs">{post.date}</p>
</div>

            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#EAE4D5]">
          {searchQuery 
            ? `No results found for "${searchQuery}"` 
            : "Enter a search term to find posts"}
        </p>
      )}
    </div>
  );
};

export default BlogSearchResults;