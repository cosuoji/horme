import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageTransition from '../Components/PageTransition';
import rayonna from "../assets/artists/rayona.png"
import youngJonn from "../assets/artists/youngjonn.png"
import { Helmet } from 'react-helmet';


const Label = () => {
  const navigate = useNavigate();

  // Sample media data — replace with real images and song names
  const artists = [
    { id:"rayona", image: rayonna, name: 'Rayona' },
  ];

  const management = [
   // { id:"youngjonn", image: youngJonn, name: 'Young Jonn' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0a0a0a] text-[#B6B09F] px-6 md:px-20 py-20 space-y-14 animate-fadeUp">
      <Helmet>
        <title>Label | Horme Music Worldwide</title>
      </Helmet>
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
          <h2 className="text-4xl font-bold text-[#EAE4D5] mb-4">Horme Music Label Services</h2>
          <p className="text-lg leading-relaxed"> 
            From high-energy club nights to exclusive VIP events, our team knows gives your music priority placement in the nightlife scene. <br></br>
            We partner with the hottest venues, DJs, and influencers to deliver your songs with epic nightlife experiences that elevate both artists and brands.  
            Whether it’s a single release, a brand activation, or a full-blown club tour, we know how to put your name in lights — and keep it there.  
          </p>

          <div>
          <h2 className="text-[#EAE4D5] text-2xl font-semibold mt-10">Specific Label Strategy</h2>
          <ul className='text-2xl py-6'>
            <li className='font-light text-lg py-1'><span className='font-bold'>🔥 Strategic Rollouts:</span> Viral release campaigns timed for maximum impact</li>
            <li className='font-light text-lg py-1'><span className='font-bold'>📀 Distribution:</span> DSP placements, specific Playlisting</li>
            <li className='font-light text-lg py-1'><span className='font-bold'>📻 Airwaves:</span> Radio/TV campaigns</li>
            <li className='font-light text-lg py-1'><span className='font-bold'>💰 Monetization Engine:</span> Sync licensing, publishing & brand deals</li>
          </ul>

          </div>  
          
        </div>

        {/* Artists Media Grid */}
        <div>
          <h3 className="text-3xl font-bold text-[#EAE4D5] mb-10">Artists</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {artists.map((item, index) => (
              <Link to={`/artists/${item.id}`}>
              <div 
                key={index}
                className="relative group overflow-hidden rounded-lg shadow-md"
              >
                <img 
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <span className="text-[#EAE4D5] font-semibold text-center px-2 text-sm sm:text-base">{item.name}</span>
                </div>
              </div>
              </Link>
            ))}
          </div>
        </div>

        
        {/* Management Media Grid */}
        <div>
          <h3 className="text-3xl font-bold text-[#EAE4D5] mb-10">Management</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {management.map((item, index) => (
              <Link to={`/artists/${item.id}`}>
              <div 
                key={index}
                className="relative group overflow-hidden rounded-lg shadow-md"
              >
                <img 
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <span className="text-[#EAE4D5] font-semibold text-center px-2 text-sm sm:text-base">{item.name}</span>
                </div>
              </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default Label;
