import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getMagazineById } from "../data/magazineData";
import { Button } from "../components/ui/button";
import { ArrowLeft, Clock, Download, Calendar, FileText, Star, Mail, ChevronDown, ChevronUp } from "lucide-react";

const MagazineDetail = () => {
  const { id } = useParams();
  const magazine = getMagazineById(id);
  const [showAllContents, setShowAllContents] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stars, setStars] = useState([]);

  // Generate subtle stars for background
  useEffect(() => {
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

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // SpaceBackground component
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

  if (!magazine) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-white mb-4">Magazine not found</h1>
          <Link to="/">
            <Button className="bg-white text-black hover:bg-gray-100 rounded-full px-6 py-3">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <SpaceBackground />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="relative z-20 p-6">
          <div className="max-w-7xl mx-auto">
            <Link to="/">
              <Button 
                variant="ghost" 
                className="text-gray-400 hover:text-white hover:bg-gray-900 rounded-full px-4 py-2 font-light"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </nav>

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Magazine Cover */}
            <div className="order-2 lg:order-1">
              <div className="relative max-w-md mx-auto lg:mx-0">
                <img 
                  src={magazine.cover}
                  alt={magazine.title}
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                {magazine.featured && (
                  <div className="absolute -top-3 -right-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full text-xs font-light tracking-wide shadow-lg hover:bg-white/20 transition-all duration-300">
                    <Star className="w-3 h-3 inline mr-1.5 fill-current" />
                    Featured
                  </div>
                )}
              </div>
            </div>

            {/* Magazine Info */}
            <div className="order-1 lg:order-2 space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-light text-white leading-tight">
                  {magazine.title}
                </h1>
                <h2 className="text-2xl md:text-3xl font-light text-gray-400">
                  {magazine.subtitle}
                </h2>
                <p className="text-lg font-light text-gray-300 leading-relaxed max-w-lg">
                  {magazine.description}
                </p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-500">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Pages</span>
                  </div>
                  <p className="text-white font-medium">{magazine.pages}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Released</span>
                  </div>
                  <p className="text-white font-medium">{magazine.releaseDate}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Read Time</span>
                  </div>
                  <p className="text-white font-medium">{magazine.readTime}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Size</span>
                  </div>
                  <p className="text-white font-medium">{magazine.downloadSize}</p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Link to={`/read/${magazine.id}`}>
                  <Button 
                    size="lg"
                    className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-4 rounded-full font-medium transition-all duration-300 hover:scale-105"
                  >
                    Read Magazine
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-12 px-6 bg-gray-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-3">
              Contents
            </h2>
            <p className="text-gray-400 text-base font-light">
              What&apos;s inside this issue
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="bg-gray-900/30 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
              <div className="grid md:grid-cols-3 gap-4">
                {magazine.tableOfContents
                  .slice(0, showAllContents || !isMobile ? magazine.tableOfContents.length : 6)
                  .map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors duration-300"
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-xs font-medium flex-shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <p className="text-gray-300 font-light text-sm">{item}</p>
                  </div>
                ))}
              </div>
              
              {/* Show All/Show Less button for mobile */}
              {isMobile && magazine.tableOfContents.length > 6 && (
                <div className="mt-6 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAllContents(!showAllContents)}
                    className="text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-full px-6 py-3 font-light transition-all duration-300"
                  >
                    <span className="flex items-center gap-2">
                      {showAllContents ? (
                        <>
                          Show Less
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Show All ({magazine.tableOfContents.length - 6} more)
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Key Articles */}
      {magazine.keyArticles && (
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
                Featured Articles
              </h2>
              <p className="text-gray-400 text-lg font-light">
                Highlights from this issue
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {magazine.keyArticles.map((article, index) => (
                <div 
                  key={index}
                  className="bg-gray-900/30 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 hover:border-gray-700 transition-all duration-500"
                >
                  <h3 className="text-xl font-medium text-white mb-4">
                    {article.title}
                  </h3>
                  <p className="text-gray-400 font-light leading-relaxed">
                    {article.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Visionaries Section - Only for Issue 2 */}
      {magazine.featuredVisionaries && (
        <section className="py-16 px-6 bg-gray-950/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
                Visionaries
              </h2>
              <p className="text-gray-400 text-lg font-light">
                Minds behind the missions
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {magazine.featuredVisionaries.map((visionary, index) => (
                <div 
                  key={index}
                  className="text-center space-y-6 group"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    <img 
                      src={visionary.avatar} 
                      alt={visionary.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-light text-white">
                      {visionary.name}
                    </h3>
                    <p className="text-gray-400 font-medium">
                      {visionary.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Section - Apple-inspired Design */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-32">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-8 tracking-tight leading-none">
              The team who made it possible.
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed">
              Passionate creators united by a shared vision to bring you extraordinary stories from the cosmos.
            </p>
          </div>
          
          {/* Leadership Team */}
          {magazine.team && magazine.team.filter(member => member.islead).length > 0 && (
            <div className="mb-32">
              <div className="grid md:grid-cols-2 gap-20 max-w-5xl mx-auto">
                {magazine.team
                  .filter(member => member.islead)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((member) => {
                    // Use actual images for leads only
                    const leadImages = {
                      'Samridhi Saini': '/team/team_samridhi.png',
                      'Janvi Khurana': '/team/team_janvi.png'
                    };
                    
                    return (
                      <div 
                        key={member.id}
                        className="text-center group"
                      >
                        {/* Profile Image for Leaders */}
                        <div className="relative mb-8 mx-auto w-32 h-32">
                          {leadImages[member.name] ? (
                            <div className="relative">
                              <img 
                                src={leadImages[member.name]} 
                                alt={member.name}
                                className="w-full h-full object-cover rounded-full ring-1 ring-white/10 group-hover:ring-blue-400/30 transition-all duration-500 shadow-2xl"
                              />
                              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent group-hover:from-blue-500/10 transition-all duration-500"></div>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-full flex items-center justify-center ring-1 ring-white/10 group-hover:ring-blue-400/30 transition-all duration-500 shadow-2xl">
                              <span className="text-white font-light text-3xl">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          )}
                          
                          {/* Leadership indicator */}
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg">
                              <Star className="w-4 h-4 text-black fill-current" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Member Info */}
                        <div className="space-y-4">
                          <h4 className="text-3xl font-light text-white group-hover:text-blue-300 transition-colors duration-300">
                            {member.name}
                          </h4>
                          <p className="text-blue-400 text-lg font-medium tracking-wide">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Team Members */}
          {magazine.team && magazine.team.filter(member => !member.islead).length > 0 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {magazine.team
                  .filter(member => !member.islead)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((member) => {
                    return (
                      <div 
                        key={member.id}
                        className="group"
                      >
                        {/* Card Container */}
                        <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8 border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.04] transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5 hover:transform hover:scale-[1.02]">
                          {/* Profile Avatar */}
                          <div className="relative mb-6 mx-auto w-20 h-20">
                            <div className="w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center ring-1 ring-white/10 group-hover:ring-purple-400/30 transition-all duration-300">
                              <span className="text-white font-light text-lg">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          
                          {/* Member Info */}
                          <div className="text-center">
                            <h4 className="text-lg font-medium text-white group-hover:text-purple-300 transition-colors duration-300 mb-2">
                              {member.name}
                            </h4>
                            <p className="text-gray-400 text-sm font-medium">
                              {member.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
          
          {/* Team Values Section */}
          <div className="mt-32 bg-gradient-to-br from-white/[0.02] to-white/[0.01] backdrop-blur-xl rounded-[2rem] border border-white/[0.05] p-16 text-center">
            <h3 className="text-3xl md:text-4xl font-light text-white mb-8 tracking-tight">
              Crafted with precision and passion
            </h3>
            <p className="text-gray-300 text-lg md:text-xl font-light max-w-4xl mx-auto leading-relaxed mb-12">
              Every element of this magazine reflects our commitment to excellence and our deep appreciation 
              for the wonders of space exploration. Together, we create more than content — we inspire curiosity.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
              <div className="group">
                <div className="text-4xl md:text-5xl font-ultralight text-blue-400 mb-3 group-hover:text-blue-300 transition-colors duration-300">
                  {magazine.team ? magazine.team.length : 0}
                </div>
                <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                  Creative Minds
                </div>
              </div>
              <div className="group">
                <div className="text-4xl md:text-5xl font-ultralight text-purple-400 mb-3 group-hover:text-purple-300 transition-colors duration-300">
                  {magazine.pages}
                </div>
                <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                  Thoughtfully Designed
                </div>
              </div>
              <div className="group">
                <div className="text-4xl md:text-5xl font-ultralight text-green-400 mb-3 group-hover:text-green-300 transition-colors duration-300">
                  {magazine.readTime}
                </div>
                <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                  Immersive Experience
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-gray-400" />
              <h3 className="text-2xl font-light text-white">
                Connect With Us
              </h3>
            </div>
            
            <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto">
              Let your imagination take flight — because your cosmos deserves to be heard!
            </p>
            
            <div className="pt-4">
              <a 
                href="mailto:editorbramhand@gmail.com" 
                className="inline-flex items-center gap-2 bg-white text-black hover:bg-gray-100 px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105"
              >
                <Mail className="w-4 h-4" />
                editorbramhand@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default MagazineDetail;
