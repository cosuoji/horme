import { useParams } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';
import artists from '../utils/artists';
import { useEffect, useState } from 'react';
import Loading from './Loading';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';


const ArtistPage = () => {
    const { id } = useParams();
    const [artist, setArtist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchArtist = () => {
          try {
            setLoading(true);
            
            // Find artist in your array
            const foundArtist = artists.find(artist => artist.id === id);
            
            if (foundArtist) {
              setArtist(foundArtist);
            } else {
              setError('Artist not found');
            }
          } catch (err) {
            setError('Failed to load artist');
          } finally {
            setLoading(false);
          }
        };
    
        fetchArtist();
      }, [id]); // Re-run when ID changes
    
      if (loading) {
        return <Loading />; // Show your logo animation
      }
    
      if (error) {
        return (
          <div className="flex items-center justify-center h-screen text-[#EAE4D5]">
            <p>{error}</p>
          </div>
        );
      }
    
      if (!artist) {
        return (
          <div className="flex items-center justify-center h-screen text-[#EAE4D5]">
            <p>Artist data not available</p>
          </div>
        );
      }
    

  return (
    <div className="bg-[#0a0a0a] text-[#B6B09F]">
      {/* Hero Section (unchanged) */}
      <div 
        className="relative h-screen w-full flex items-end pb-20"
        style={{
          backgroundImage: `url(${artist.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative z-10 px-6 md:px-20 w-full">
          <h1 className="text-[#EAE4D5] text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
            {artist.name}
          </h1>

         
          
          <div className="flex space-x-6">
            <a 
              href={`https://instagram.com/${artist.social.instagram}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#B6B09F] hover:text-[#EAE4D5] transition duration-300"
            >
              <FaInstagram size={28} />
            </a>
            <a 
              href={`https://twitter.com/${artist.social.twitter}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#B6B09F] hover:text-[#EAE4D5] transition duration-300"
            >
              <FaTwitter size={28} />
            </a>
            <a 
              href={`https://tiktok.com/@${artist.social.tiktok}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#B6B09F] hover:text-[#EAE4D5] transition duration-300"
            >
              <FaTiktok size={28} />
            </a>
          </div>
        </div>
      </div>


      {/* Music Section with Links */}
      <div className="px-6 md:px-20 py-10">
        <div className='mb-10'>
        <h2 className="text-[#EAE4D5] text-3xl md:text-4xl font-bold">Bio</h2>
             <div className="text-[#B6B09F] text-lg">
                {artist.bio.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                ))}
            </div>
        </div>
      
        <h2 className="text-[#EAE4D5] text-3xl md:text-4xl font-bold mb-10">Music</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {artist.tracks.map(track => (
            <a 
              key={track.id} 
              href={track.link} 
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div 
                className="aspect-square bg-cover bg-center mb-2 transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${track.cover})` }}
              />
              <h3 className="text-[#EAE4D5] group-hover:text-white transition duration-300">
                {track.title}
              </h3>
            </a>
          )).reverse()}
        </div>
      </div>

      {/* Videos Section with Links */}
      {artist.videos.length > 0 && <div className="px-6 md:px-20 py-10 pb-20">
        <h2 className="text-[#EAE4D5] text-3xl md:text-4xl font-bold mb-10">Videos</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {artist.videos.map(video => (
            <a
              key={video.id}
              href={video.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div 
                className="aspect-square bg-cover bg-center mb-2 relative transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${video.thumbnail})` }}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/50 rounded-full p-3">
                    <svg className="w-8 h-8 text-[#EAE4D5]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.8L16 10 6.3 17.2V2.8z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-[#EAE4D5] group-hover:text-white transition duration-300 font-bold">
                {video.title}
              </h3>
            </a>
          ))}
        </div>
      </div> }

    
    </div>
 
  );
};

export default ArtistPage;