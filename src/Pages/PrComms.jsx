import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageTransition from '../Components/PageTransition';
import gossip from "../assets/blogs/gossip.jpg"
import wahala from "../assets/blogs/wahala.jpg"
import kraks from "../assets/blogs/kraks.png"
import yabaleft from "../assets/blogs/yabaleft.png"
import pulse from "../assets/blogs/pulse.png"



const PrComms = () => {
  const navigate = useNavigate();

  // Sample media data — replace with real images and song names
  const campaigns = [
    { image: gossip, song: 'GossipMill' },
    { image: wahala, song: 'Wahala Room' },
    { image: kraks, song: 'Kraks Media' },
    { image: yabaleft, song: 'Yabaleft Online' },
    { image: pulse, song: 'Pulse' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0a0a0a] text-[#B6B09F] px-6 md:px-20 py-20 space-y-14 animate-fadeUp">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#B6B09F] hover:text-[#EAE4D5] border border-[#B6B09F] hover:border-[#EAE4D5] px-4 py-2 rounded-md transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Main Content */}
        <div>
          <h2 className="text-4xl font-bold text-[#EAE4D5] mb-4">PR, Comms & Strategies</h2>
          <p className="text-lg leading-relaxed"> 
          In Nigeria's every expanding, endlessly competitive entertainment scene, visibility is currency — and we know how to spend it.

From breaking new artists to shaping major comebacks, we create PR strategies that cut through the noise and get results. 
Whether it’s placing your music on the right blogs,
 securing interviews on top platforms — we’ve got the network and the know-how.<br></br>

We speak the language of the streets and the industry.<br></br> Our relationships with key media houses, influencers, OAPs, 
and culture drivers mean your story lands where it matters most.<br></br>

This is PR built for the Nigerian market — bold, fast, and effective.
          </p>
          
        </div>

        {/* Campaign Media Grid */}
        <div>
          <h3 className="text-3xl font-bold text-[#EAE4D5] mb-10"> Partner Blogs</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {campaigns.map((item, index) => (
              <div 
                key={index}
                className="relative group overflow-hidden rounded-lg shadow-md"
              >
                <img 
                  src={item.image}
                  alt={item.song}
                  className="w-full h-48 object-contain transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <span className="text-[#EAE4D5] font-semibold text-center px-2 text-sm sm:text-base">{item.song}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default PrComms;
