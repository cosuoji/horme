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
import mreazi from "../assets/mreazi.png";
import whogopay from "../assets/influencercampaigns/whogopay.png";

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

const clients = [
  { id: 1, name: "Rayonna", logo: craze },
  { id: 2, name: "Young Jonn", logo: onlyfans },
  { id: 3, name: "Seyi Vibez", logo: shaolin },
  { id: 4, name: "Tiwa Savage", logo: megamoney },
  { id: 5, name: "Mr Eazi", logo: mreazi },
  { id: 6, name: "Falz", logo: whogopay },
];

export default function Homepage() {
  const carouselRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [clonesAdded, setClonesAdded] = useState(false);

  // Clone items for infinite effect
  useEffect(() => {
    if (carouselRef.current && !clonesAdded) {
      const carousel = carouselRef.current;
      const children = Array.from(carousel.children);
      
      // Clone first few items and append to end
      children.slice(0, 3).forEach(child => {
        carousel.appendChild(child.cloneNode(true));
      });
      
      // Clone last few items and prepend to start
      children.slice(-3).reverse().forEach(child => {
        carousel.prepend(child.cloneNode(true));
      });
      
      setClonesAdded(true);
      // Start at the "real" first item
      setTimeout(() => {
        carousel.scrollTo({
          left: carousel.offsetWidth * 3,
          behavior: 'auto'
        });
      }, 50);
    }
  }, [clonesAdded]);

  const handlePrev = () => {
    if (!carouselRef.current) return;
    
    const carousel = carouselRef.current;
    const scrollAmount = carousel.offsetWidth * 0.8;
    
    if (carousel.scrollLeft <= scrollAmount) {
      // If near start, jump to near end for infinite effect
      carousel.scrollTo({
        left: carousel.scrollWidth - (scrollAmount * 2),
        behavior: 'auto'
      });
    }
    
    carousel.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleNext = () => {
    if (!carouselRef.current) return;
    
    const carousel = carouselRef.current;
    const scrollAmount = carousel.offsetWidth * 0.8;
    
    if (carousel.scrollLeft >= carousel.scrollWidth - (scrollAmount * 2)) {
      // If near end, jump to near start for infinite effect
      carousel.scrollTo({
        left: scrollAmount,
        behavior: 'auto'
      });
    }
    
    carousel.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="bg-[#0a0a0a] text-[#B6B09F]">
      {/* ... (keep your existing Hero and Featured Artists sections) ... */}

      {/* Infinite Slider Section */}
      <section className="py-20 px-6 md:px-20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#EAE4D5]">
            Recent Promo from Clients and Partners
          </h2>
        </div>

        <div 
          className="relative group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-hidden scroll-smooth"
          >
            {clients.map((client) => (
              <div 
                key={client.id}
                className="min-w-[320px] md:min-w-[400px] h-[250px] rounded-2xl bg-[#1a1a1a] overflow-hidden shadow-lg flex-shrink-0 border border-[#B6B09F]/20"
              >
                <img 
                  src={client.logo} 
                  alt={client.name} 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#0a0a0a]/80 hover:bg-[#0a0a0a] text-[#EAE4D5] p-3 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-all duration-300"
            aria-label="Previous slide"
          >
            <FaChevronLeft className="text-xl" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#0a0a0a]/80 hover:bg-[#0a0a0a] text-[#EAE4D5] p-3 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-all duration-300"
            aria-label="Next slide"
          >
            <FaChevronRight className="text-xl" />
          </button>
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
            <button className="bg-[#EAE4D5] text-[#0a0a0a] px-6 py-3 font-medium hover:bg-opacity-90 transition cursor-not-allowed">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}