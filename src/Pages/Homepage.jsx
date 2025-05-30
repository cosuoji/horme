import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaPlay, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';
import youngjonnfeatured from "../assets/artists/youngjonnfeatured.png"
import rayonafeatured from "../assets/artists/rayonnafeatured.png"
import heroVideo from "../assets/label-showreel.mp4"



// Sample data - replace with your actual content
const featuredArtists = [
  {
    id: "youngjonn",
    name: "Young Jonn",
    image: youngjonnfeatured,
    genre: "Afrobeats",
    latestTrack: "Only Fans"
  },
  {
    id: "rayona",
    name: "Rayona",
    image: rayonafeatured,
    genre: "Afropop",
    latestTrack: "Craze"
  }
];


export default function Homepage() {
  // const [blogPosts, setBlogPosts] = useState([]);
  // const [loadingBlogs, setLoadingBlogs] = useState(true);

  // useEffect(() => {
  //   // Fetch blog posts from your backend
  //   const fetchBlogPosts = async () => {
  //     try {
  //       const response = await fetch('/api/blog-posts?limit=3');
  //       const data = await response.json();
  //       setBlogPosts(data);
  //     } catch (error) {
  //       console.error("Error fetching blog posts:", error);
  //     } finally {
  //       setLoadingBlogs(false);
  //     }
  //   };

  //   fetchBlogPosts();
  // }, []);
  

  return (
    <div className="bg-[#0a0a0a] text-[#B6B09F]">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <video 
          autoPlay 
          muted 
          loop 
          className="absolute inset-0 w-full h-full object-cover opacity-55"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        
        <div className="relative z-20 text-center px-6">
          <h1 className="text-5xl md:text-7xl sm:text-7xl lg:text-8xl font-bold text-[#EAE4D5] mb-6">
            HORME MUSIC WORLDWIDE
          </h1>
          <p className="text-xl sm:text-3xl md:text-3xl max-w-3xl mx-auto mb-8">
            Elevating African talent to global prominence through innovative music solutions
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/services" 
              className="border border-[#EAE4D5] text-[#EAE4D5] px-8 py-3 font-medium hover:bg-[#ffffff10] transition text-4xl"
            >
              Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-20 px-6 md:px-20">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#EAE4D5]">Featured Artists</h2>
          <Link to="/services/label-services" className="text-[#B6B09F] hover:text-[#EAE4D5] transition">
            View All →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredArtists.map(artist => (
            <Link 
              to={`/artists/${artist.id}`} 
              key={artist.id}
              className="group relative h-[500px] overflow-hidden"
            >
              <div 
                className="absolute inset-5 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${artist.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-8">
                <h3 className="text-4xl font-bold text-[#EAE4D5] mb-2">{artist.name}</h3>
                <p className="text-[#B6B09F] mb-4">{artist.genre} • Latest: {artist.latestTrack}</p>
                <div className="flex gap-4">
                  <FaInstagram className="text-xl hover:text-[#EAE4D5] transition" />
                  <FaTwitter className="text-xl hover:text-[#EAE4D5] transition" />
                  <FaTiktok className="text-xl hover:text-[#EAE4D5] transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

       {/* Blog Section */}
       {/* <section className="py-20 px-6 md:px-20 border-t border-[#B6B09F]/20">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#EAE4D5]">Latest News</h2>
          <Link to="/blog" className="text-[#B6B09F] hover:text-[#EAE4D5] transition flex items-center">
            View All <FaArrowRight className="ml-2" />
          </Link>
        </div>

        {loadingBlogs ? (
          <div className="flex justify-center py-10">
            <div className="animate-pulse text-[#EAE4D5]">Loading articles...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map(post => (
              <div key={post.id} className="group border border-[#B6B09F]/30 hover:border-[#EAE4D5]/50 transition duration-500">
                <Link to={`/blog/${post.slug}`}>
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-[#EAE4D5]/80 text-sm">{new Date(post.date).toLocaleDateString()}</span>
                    <h3 className="text-xl md:text-2xl font-bold text-[#EAE4D5] mt-2 mb-3 group-hover:text-white transition">
                      {post.title}
                    </h3>
                    <p className="text-[#B6B09F] line-clamp-2">{post.excerpt}</p>
                    <div className="mt-4 flex items-center text-[#EAE4D5] group-hover:text-white transition">
                      Read more <FaArrowRight className="ml-2" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section> */}



      {/* Newsletter */}
      <section className="py-20 bg-[#0a0a0a] border-t border-[#B6B09F]/20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#EAE4D5] mb-6">Stay Connected</h2>
          <p className="text-[#B6B09F] mb-8 max-w-2xl mx-auto">
            Join our mailing list for exclusive updates, releases, and industry insights
          </p>
          <div className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-grow px-4 py-3 bg-transparent border border-[#B6B09F] text-[#EAE4D5] placeholder-[#B6B09F] focus:border-[#EAE4D5] outline-none transition"
            />
            <button className="bg-[#EAE4D5] text-[#0a0a0a] px-6 py-3 font-medium hover:bg-opacity-90 transition cursor-not-allowed">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}