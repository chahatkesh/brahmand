import React from 'react'
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Instagram, Linkedin, Youtube } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { Button } from "../components/ui/button";
import { getAllMagazines, getFeaturedMagazines } from "../data/magazineData";

const Home = () => {
  const [stars, setStars] = useState([]);

  // Get magazine data from centralized source
  const magazines = getAllMagazines();
  const featuredMagazines = getFeaturedMagazines();

  useEffect(() => {
    // Generate subtle stars for background
    const generateStars = () => {
      return Array.from({ length: 50 }, (_, index) => ({
        id: index,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        animationDelay: `${Math.random() * 8}s`,
      }));
    };

    setStars(generateStars());
  }, []);

  const SpaceBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black" />
      
      {/* Minimal stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: star.animationDelay,
          }}
        />
      ))}
      
      {/* Subtle radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50" />
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <SpaceBackground />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[75vh] flex flex-col justify-center items-center px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Logo */}
            <div className="mb-12">
              <img 
                src="/logo.png" 
                alt="Brahmand" 
                className="w-16 h-16 mx-auto mb-6 opacity-90"
              />
            </div>
            
            {/* Main Heading */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tight text-white mb-8">
              Brahmand
            </h1>
            
            {/* Combined Description */}
            <p className="text-xl md:text-2xl font-light text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
              Published by APOGEE - Space Club of Dr B R Ambedkar National Institute of Technology Jalandhar.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <a
                href="https://www.instagram.com/Apogee_nitj"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
              </a>
              <a
                href="https://x.com/Apogee_Nitj"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-110"
                aria-label="X (formerly Twitter)"
              >
                <FaXTwitter className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
              </a>
              <a
                href="https://www.linkedin.com/company/apogee-space-club"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
              </a>
              <a
                href="https://youtube.com/@apogee_nitj"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
              </a>
            </div>
          </div>
        </section>

        {/* Integrated Featured Magazine Section */}
        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            {featuredMagazines.length > 0 && (
              <div className="max-w-6xl mx-auto">
                <div className="bg-gray-900/30 backdrop-blur-xl rounded-3xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all duration-500">
                  <div className="grid lg:grid-cols-2 gap-0">
                    {/* Magazine Cover */}
                    <div className="relative h-96 lg:h-auto">
                      <img 
                        src={featuredMagazines[0].cover}
                        alt={featuredMagazines[0].title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-6 left-6">
                        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                          <Star className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-medium">Latest Issue</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Magazine Info */}
                    <div className="p-12 flex flex-col justify-center">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-3xl md:text-4xl font-light text-white">
                            {featuredMagazines[0].title}
                          </h3>
                          <p className="text-xl font-light text-gray-400">
                            {featuredMagazines[0].subtitle}
                          </p>
                        </div>
                        
                        <p className="text-gray-400 text-lg leading-relaxed font-light">
                          {featuredMagazines[0].description}
                        </p>
                        
                        {/* Key Highlights */}
                        <div className="space-y-3 hidden md:block">
                          {featuredMagazines[0].highlights?.slice(0, 3).map((highlight, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-2 flex-shrink-0"></div>
                              <p className="text-gray-500 text-sm font-light">{highlight}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-8 text-sm text-gray-500">
                          <span className="hidden md:block">{featuredMagazines[0].readTime}</span>
                          <span>{featuredMagazines[0].pages}</span>
                          <span className="hidden md:block">{featuredMagazines[0].category}</span>
                        </div>
                        
                        <div className="pt-4">
                          <Button 
                            asChild
                            className="bg-transparent border border-gray-600 text-white hover:bg-white hover:text-black text-base px-6 py-3 rounded-full font-medium transition-all duration-300"
                          >
                            <Link to={`/magazine/${featuredMagazines[0].id}`}>
                              Explore Issue
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Available Issues Section */}
        <section className="py-24 px-6 bg-gray-950/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
                All Issues
              </h2>
              <p className="text-gray-400 text-lg font-light">
                Browse our complete collection of space exploration magazines
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {magazines.map((magazine) => (
                <Link 
                  key={magazine.id}
                  to={`/magazine/${magazine.id}`}
                  className="group block"
                >
                  <div className="bg-gray-900/30 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all duration-500 hover:transform hover:scale-[1.02]">
                    {/* Cover Image */}
                    <div className="relative h-64">
                      <img 
                        src={magazine.cover}
                        alt={magazine.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {magazine.featured && (
                        <div className="absolute top-4 right-4">
                          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                            <Star className="w-3 h-3 text-white" />
                            <span className="text-white text-xs">Featured</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-8">
                      <h3 className="text-xl font-medium text-white mb-3 group-hover:text-gray-300 transition-colors">
                        {magazine.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                        {magazine.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{magazine.pages}</span>
                        <span>{magazine.releaseDate}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="py-16 px-6 border-t border-gray-800">
          <div className="max-w-7xl mx-auto text-center space-y-4">
            <p className="text-gray-500 text-sm font-light">
              © 2025 Brahmand. Published by APOGEE - {" "}
              <a 
                href="https://www.nitj.ac.in/clubs/template.html?id=apogee"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300 underline decoration-gray-600 hover:decoration-gray-400 underline-offset-2"
              >
                Space Club
              </a>
              {" "} of Dr B R Ambedkar National Institute of Technology Jalandhar
            </p>
            <p className="text-gray-600 text-xs font-light">
              Exploring the cosmos, one issue at a time.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
