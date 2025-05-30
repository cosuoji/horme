import { Link, Outlet } from 'react-router-dom';

// Import your background images
import clubBg from '../assets/club-bg.jpg';
import influencerBg from '../assets/influencer-bg.jpg';
import prBg from '../assets/pr-bg.jpg';
import radioBg from '../assets/radio-bg.jpg';
import labelBg from "../assets/image4.jpg"

const Services = () => {
  const serviceCards = [
    {
      title: 'Club Campaigns',
      path: '/services/clubs',
      bgImage: clubBg,
      description: 'Nightlife promotion & events'
    },
    {
      title: 'Influencer Marketing',
      path: '/services/influencer-marketing',
      bgImage: influencerBg,
      description: 'Strategic brand partnerships'
    },
    {
      title: 'PR & Comms',
      path: '/services/pr-comms',
      bgImage: prBg,
      description: 'Media relations & strategy'
    },
    {
      title: 'Radio Campaigns',
      path: '/services/radio',
      bgImage: radioBg,
      description: 'Airplay & promotions'
    },
    {
      title: 'Label Services',
      path: '/services/label-services',
      bgImage: labelBg,
      description: 'Record Label Services'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#B6B09F]">
      {/* Header Section */}
      <div className="px-6 md:px-20 py-20">
        <h1 className="text-[#B6B09F] hover:text-[#EAE4D5] text-5xl md:text-6xl lg:text-7xl font-bold mb-6 transition duration-300 text-left">
          Our Services
        </h1>
      </div>

      {/* 5 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0">
        {serviceCards.map((service, index) => (
          <Link 
            to={service.path} 
            key={index}
            className="group relative h-[50vh] overflow-hidden hover:opacity-90 transition duration-500"
          >
            {/* Background Image */}
            <div 
              className="absolute opacity-25 inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${service.bgImage})` }}
            />
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition duration-500" />
            
            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-8">
              <h2 className="text-[#EAE4D5] text-3xl md:text-4xl font-bold mb-2 group-hover:text-white transition duration-300">
                {service.title}
              </h2>
              <p className="text-[#B6B09F] group-hover:text-[#EAE4D5] transition duration-300">
                {service.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
};

export default Services;