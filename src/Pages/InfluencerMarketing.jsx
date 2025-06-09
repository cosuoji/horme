import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageTransition from '../Components/PageTransition';
import onlyfans from "../assets/influencercampaigns/onlyfans.png"
import tentimes from "../assets/influencercampaigns/tentimes.png"
import goHard from "../assets/influencercampaigns/gohard.png"
import faceCard from "../assets/influencercampaigns/faceCard.png"
import emekaDance from "../assets/influencercampaigns/emekadance.png"
import kere from "../assets/influencercampaigns/kere.png"
import whogopay from "../assets/influencercampaigns/whogopay.png"
import busStop from "../assets/influencercampaigns/busstop.png"
import busStopRmx from "../assets/influencercampaigns/busstoprmx.png"
import cheche from "../assets/cheche.png"


const InfluencerMarketing = () => {
  const navigate = useNavigate();

  // Sample media data — replace with real images and song names
  const campaigns = [
    {image: cheche, song: "Young Jonn - Che Che"},
    { image: onlyfans, song: 'Young Jonn - Only Fans' },
    { image: tentimes, song: 'Young Jonn - Ten Times' },
    { image: emekaDance, song: 'Blaqbonez - Louder' },
    { image: goHard, song: 'Young Jonn - Pot of Gold' },
     { image: busStop, song: 'Tariq - Bus Stop' },
     { image: busStopRmx, song: 'Tariq x Young Jonn -  Bus Stop (Remix)' },
    { image: kere, song: 'Major AJ  - Kere' },
    { image: emekaDance, song: 'Blaqbonez - Emeka Dance' },
    { image: faceCard, song: 'Noon Dave - Face Card' }, 
    { image: whogopay, song: 'Falz x Adekunle Gold - Who Go Pay' },
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
          <h2 className="text-4xl font-bold text-[#EAE4D5] mb-4">Influencer Marketing</h2>
          <p className="text-lg leading-relaxed"> 
           We craft high-impact influencer campaigns that stick to our clients carefully curated vision. Our data-driven approach pairs your brand with authentic creators who don’t just rack up likes—they drive conversions.
           It's also in our best interest to pick influencers who fit the aesthetic of the campaign, doesn't matter if it's a single or an album we'll curate a seamless experience. <br></br>
          </p>

          <ul className='text-2xl font-bold mt-10'> Why Our Strategy Works
            <li className='font-light text-lg py-1'><span className='font-bold'>Instagram Aesthetic Precision</span>: Curated content that blends seamlessly into user feeds while performing like performance ads</li>
            <li className='font-light text-lg py-1'><span className='font-bold'>Platform-Specific Talent:</span> Handpicked nano/micro-influencers with real engagement - that fit the campaign brief (not just vanity metrics)</li>
            <li className='font-light text-lg py-1'><span className='font-bold'>Trackable ROI:</span> From UTM tags to promo codes, we prove our campaigns move product</li>
          </ul>
          
        </div>

        {/* Campaign Media Grid */}
        <div>
          <h3 className="text-3xl font-bold text-[#EAE4D5] mb-10">Influencer Marketing Campaigns</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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

export default InfluencerMarketing;
