import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';
import youngjonnfeatured from "../assets/artists/youngjonnfeatured.png";
import rayonafeatured from "../assets/artists/rayonnafeatured.png";
import heroVideo from "../assets/label-showreel.mp4";
import onlyfans from "../assets/influencercampaigns/onlyfans.png";
import craze from "../assets/radio/radiocampaigns/craze.png";
import shaolin from "../assets/shaolin.png";
import megamoney from "../assets/radio/radiocampaigns/megamoney.png";
import earlymomo from "../assets/earlymomo.png";
import whogopay from "../assets/influencercampaigns/whogopay.png";
import cheche from "../assets/cheche.png"
import cashflow from "../assets/cashflow.jpeg"
import { Helmet } from 'react-helmet';
import testimony from "../assets/testimony.png"
import rayofsunshine from "../assets/rayofsunshine.png"

const featuredArtists = [
  {
    id: "youngjonn",
    name: "Young Jonn",
    image: youngjonnfeatured,
    genre: "Afrobeats",
    latestTrack: "Cash Flow ft. Wizkid"
  },
  {
    id: "rayona",
    name: "Rayona",
    image: rayonafeatured,
    genre: "Afropop",
    latestTrack: "Beauty"
  }
];



const clients = [
  {  name: "Young Jonn - Cash Flow", logo: cashflow },
  {  name: "Rayonna - Craze", logo: craze },
  { name: "Young Jonn - Only Fans", logo: onlyfans },
  { name: "Seyi Vibez - Shaolin", logo: shaolin },
  { name: "Tiwa Savage - Mega Money Mega", logo: megamoney },
  { name: "Falz - Who Go Pay", logo: whogopay },
  { name: "Young Jonn - Che Che", logo: cheche },
  { name: "Spy Shitta - Early Momo", logo: earlymomo },
  { name: "Rayona - Testimony", logo: testimony },
  { name: "Rayona - Ray Of Sunshine (EP) ", logo: rayofsunshine }
];

export default function Homepage() {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate carousel
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev === clients.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? clients.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === clients.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-[#0a0a0a] text-[#B6B09F]">
    <Helmet>
      <title>Home Page - Horme Music WorldWide</title>
    </Helmet>
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
                <p className="text-[#B6B09F] mb-4">{artist.genre} • Latest Release: {artist.latestTrack}</p>
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

      {/* Large Carousel Section */}
      <section className="py-20 px-6 md:px-20 bg-[#0a0a0a] border-t border-[#B6B09F]/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#EAE4D5] mb-12 text-center">
            Recent Promo from Clients and Partners
          </h2>
          
          <div 
            className="relative group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Carousel Container */}
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full overflow-hidden rounded-xl">
              {clients.map((client, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                  <div className="absolute inset-0 bg-black/30 z-10"></div>
                  <img
                    src={client.logo}
                    alt={client.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 z-20 p-8 md:p-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#EAE4D5]">
                      {client.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button 
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-[#0a0a0a]/80 hover:bg-[#0a0a0a] text-[#EAE4D5] p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
              aria-label="Previous slide"
            >
              <FaChevronLeft className="text-2xl" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-[#0a0a0a]/80 hover:bg-[#0a0a0a] text-[#EAE4D5] p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
              aria-label="Next slide"
            >
              <FaChevronRight className="text-2xl" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 gap-2">
              {clients.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${currentIndex === index ? 'bg-[#EAE4D5] w-6' : 'bg-[#B6B09F] opacity-50'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

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
            <button className="bg-[#EAE4D5] text-[#0a0a0a] px-6 py-3 font-medium hover:bg-opacity-90 transition cursor-not-allowed disabled">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}