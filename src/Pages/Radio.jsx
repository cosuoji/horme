import { useNavigate } from 'react-router-dom';
import PageTransition from '../Components/PageTransition';
import { ArrowLeft } from 'lucide-react'; // Optional: using an icon
import tenBottles from "../assets/radio/radiocampaigns/10bottles.png"
import bigthings from "../assets/radio/radiocampaigns/bigbigthings.png"
import countmyblessings from "../assets/radio/radiocampaigns/countmyblessing.png"
import craze from "../assets/radio/radiocampaigns/craze.png"
import disconnect from "../assets/radio/radiocampaigns/disconnect.png"
import finishme from "../assets/radio/radiocampaigns/finishme.png"
import goHard from "../assets/radio/radiocampaigns/gohard.png"
import megamoney from "../assets/radio/radiocampaigns/megamoney.png"
import tete from "../assets/radio/radiocampaigns/tete.png"
import wayo from "../assets/radio/radiocampaigns/wayo.png"
import cheche from "../assets/cheche.png"
import earlymomo from "../assets/earlymomo.png"


import beat from "../assets/radio/beatfm.png"
import city from "../assets/radio/city.png"
import cool from "../assets/radio/coolfm.svg"
import max from "../assets/radio/maxfm.png"
import naija from "../assets/radio/naijafm.png"
import soundcity from "../assets/radio/soundcity.webp"
import ufm from "../assets/radio/ufm.png"
import vybz from "../assets/radio/vybz.png"
import wazobia from "../assets/radio/wazobia.webp"







const Radio = () => {
  const navigate = useNavigate();

  // Sample media data — replace with real images and song names
  const campaigns = [
    { image: earlymomo, song: 'Spy Shitta - Early Momo' },
    { image: cheche, song: 'Young Jonn - Che Che' },
    { image: tenBottles, song: 'Zlatan - 10 Bottles' },
    { image: bigthings, song: 'Young Jonn x Seyi Vibez x Kizz Daniel - Big Big Things'},
    { image: countmyblessings, song: 'Johnny Drille - Count My Blessings' },
    { image: craze, song: 'Rayona - Craze' },
    { image: disconnect, song: 'Young Jonn - Disconnect' },
    { image: finishme, song: 'Bayanni - Finish Me (AEIOU)' },
    { image: goHard, song: 'Young Jonn - Go Hard' },
    { image: megamoney, song: 'Tiwa Savage - Mega Money Mega' },
    { image: tete, song: 'Crayon - Tete' },
    { image: wayo, song: 'Tekno - Wayo' },
   
  ];

  const radioStations = [
    { image: beat, radio: 'Beat FM' },
    { image: city, radio: 'City FM'},
    { image: cool, radio: 'Cool FM' },
    { image: max, radio: 'Max FM' },
    { image: naija, radio: 'Naija' },
    { image: soundcity, radio: 'SoundCity' },
    { image: ufm, radio: 'UFM' },
    { image: vybz, radio: 'Vybz' },
    { image: wazobia, radio: 'Wazobia' },
   
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
          <h2 className="text-4xl font-bold text-[#EAE4D5] mb-4">Radio Campaigns</h2>
          <p className="text-lg leading-relaxed"> 
          Your Sound, Everywhere That Matters <br></br>

          We don’t just submit tracks to radio—we engineer campaigns with the right OAP's and Librarians to get your music heard. Our strategic radio placements during peak periods turn rotations into real-world hype.
          </p>

          <div>
          <h2 className="text-[#EAE4D5] text-2xl font-semibold mt-10">Campaign Strategies</h2>
          <ul className='text-2xl py-6'>
          <li className='font-light text-lg'><span className='font-bold'>📻 Power Rotation Placements:</span> Guaranteed spins on Nigeria’s Top 20 stations</li>
          <li className='font-light text-lg'><span className='font-bold'>🎤 DJ/OAPS:</span> Exclusive relationships with key tastemakers who break hits first</li>
          <li className='font-light text-lg'><span className='font-bold'>📊 Charts: </span>Strategic timing to land on official charts (Soundcharts, Radiomonitor)</li>
          </ul>

          </div>  
          
        </div>

        {/* Campaign Media Grid */}
        <div>
          <h3 className="text-3xl font-bold text-[#EAE4D5] mb-10">Recent Radio Campaigns</h3>
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

        
        {/* Radio Media Grid */}
        <div>
          <h3 className="text-3xl font-bold text-[#EAE4D5] mb-10">Partner Radio Stations</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {radioStations.map((item, index) => (
              <div 
                key={index}
                className="relative group overflow-hidden rounded-lg shadow-md"
              >
                <img 
                  src={item.image}
                  alt={item.radio}
                  className="w-full h-48 object-contain transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <span className="text-[#EAE4D5] font-semibold text-center px-2 text-sm sm:text-base">{item.radio}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default Radio;
