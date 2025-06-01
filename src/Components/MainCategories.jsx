import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import blogCategories from "../utils/blogCategories"

const MainCategories = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();



  // Set active category based on route
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromRoute = params.get('category') || 'all';
    const authorFromRoute = params.get('author') || '';

  // If author filter is active, keep it in the URL when changing categories
  if (authorFromRoute) {
    setActiveCategory(`${categoryFromRoute}|author:${authorFromRoute}`);
  } else {
    setActiveCategory(categoryFromRoute);
  }

  }, [location.search]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blog?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchExpanded(false);
    }
  };

  return (
    <nav className="bg-[#0a0a0a] border-b border-[#B6B09F]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <div className="flex md:hidden py-4 justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-[#EAE4D5] hover:text-white focus:outline-none"
              aria-label="Toggle categories"
            >
              <span className="block w-6 h-0.5 bg-[#EAE4D5] mb-1.5"></span>
              <span className="block w-6 h-0.5 bg-[#EAE4D5] mb-1.5"></span>
              <span className="block w-6 h-0.5 bg-[#EAE4D5]"></span>
            </button>
            <span className="ml-3 text-[#EAE4D5]">
              {blogCategories.find(cat => cat.slug === activeCategory)?.name}
            </span>
          </div>
          
          {/* Mobile search button */}
          <button 
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className="text-[#EAE4D5] hover:text-white p-6 animate-pulse"
            aria-label="Search"
          >
            <FaSearch />
          </button>
        </div>

        {/* Expanded mobile search */}
        {isSearchExpanded && (
          <div className="md:hidden mb-4">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blog posts..."
                className="flex-grow bg-[#1a1a1a] border border-[#B6B09F]/30 text-[#EAE4D5] px-4 py-2 rounded-l focus:outline-none focus:border-[#EAE4D5]"
              />
              <button 
                type="submit"
                className="bg-[#EAE4D5] text-[#0a0a0a] px-4 py-2 rounded-r hover:bg-opacity-90 transition"
              >
                <FaSearch />
              </button>
            </form>
          </div>
        )}

        {/* Desktop menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:flex md:items-center md:justify-between`}>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 py-4">
            {blogCategories.map((category) => (
              <Link
                key={category.slug}
                to={`/blog?category=${category.slug}`}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeCategory === category.slug
                    ? 'bg-[#EAE4D5] text-[#0a0a0a]'
                    : 'text-[#B6B09F] hover:text-[#EAE4D5] hover:bg-[#ffffff10]'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center px-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="bg-[#1a1a1a] border border-[#B6B09F]/30 text-[#EAE4D5] px-4 py-2 rounded-l focus:outline-none focus:border-[#EAE4D5] w-48 lg:w-64 transition-all duration-300"
            />
            <button 
              type="submit"
              className="bg-[#EAE4D5] text-[#0a0a0a] px-4 py-2 rounded-r hover:bg-opacity-90 transition flex items-center"
            >
              <FaSearch className="inline mr-1" />
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}

export default MainCategories;