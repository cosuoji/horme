import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageTransition from '../Components/PageTransition';
import tenBottles from "../assets/clubcampaigns/10bottles.png"
import bustDown from "../assets/clubcampaigns/bustdown.png"
import goHard from "../assets/clubcampaigns/gohard.png"
import bigthings from "../assets/clubcampaigns/bigthings.png"
import emekaDance from "../assets/clubcampaigns/emekadance.png"
import manuever from "../assets/clubcampaigns/maneuver.png"
import jigga from "../assets/clubcampaigns/jigga.png"
import cheche from "../assets/cheche.png"

const Clubs = () => {
  const navigate = useNavigate();

  // Sample media data — replace with real images and song names
  const campaigns = [
    {image: cheche, song: "Young Jonn - Che Che"},
    { image: tenBottles, song: 'Zlatan - 10 Bottles' },
    { image: bustDown, song: 'Zlatan ft. Asaka - Bust Down' },
    { image: goHard, song: 'Young Jonn - Go Hard' },
    { image: bigthings, song: 'Young Jonn - Big Big Things' },
    { image: emekaDance, song: 'Blaqbonez -  Emeka Dance' },
    { image: manuever, song: 'Gnewzy x Odumodublvck - Maneuver' },
    { image: jigga, song: 'Tariq x Khaid - Jigga' },
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
          <h2 className="text-4xl font-bold text-[#EAE4D5] mb-4">Club Campaigns</h2>
          <p className="text-lg leading-relaxed"> 
            From high-energy club nights to exclusive VIP events, our team knows gives your music priority placement in the nightlife scene. <br></br>
            We partner with the hottest venues, DJs, and influencers to deliver your songs with epic nightlife experiences that elevate both artists and brands.  
            Whether it’s a single release, a brand activation, or a full-blown club tour, we know how to put your name in lights — and keep it there.  
          </p>

          <div>
          <h2 className="text-[#EAE4D5] text-2xl font-semibold mt-10">Popular Clubs we work with</h2>
          <ul className='text-2xl px-5 py-6'>
            <li>Quilox</li>
            <li>Chanderlier</li>
            <li>Boho</li>
            <li>Back Door</li>
            <li>Vaniti</li>
          </ul>

          </div>  
          
        </div>

        {/* Campaign Media Grid */}
        <div>
          <h3 className="text-3xl font-bold text-[#EAE4D5] mb-10">Recent Club Campaigns</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {campaigns.map((item, index) => (
              <div 
                key={index}
                className="relative group overflow-hidden rounded-lg shadow-md"
              >
                <img 
                  src={item.image}
                  alt={item.song}
                  className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
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

export default Clubs;
