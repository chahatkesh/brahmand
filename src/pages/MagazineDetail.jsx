import { useParams, Link } from "react-router-dom";
import { getMagazineById } from "../data/magazineData";
import { Button } from "../components/ui/button";
import { ArrowLeft, Clock, Download, Calendar, FileText, Star, Mail } from "lucide-react";

const MagazineDetail = () => {
  const { id } = useParams();
  const magazine = getMagazineById(id);

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
    <div className="min-h-screen bg-black">
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
                  <div className="absolute -top-4 -right-4 bg-white text-black px-4 py-2 rounded-full text-sm font-medium">
                    <Star className="w-4 h-4 inline mr-1" />
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
                {magazine.tableOfContents.map((item, index) => (
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

      {/* Team Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
              Creative Team
            </h2>
            <p className="text-gray-400 text-lg font-light">
              The creative minds behind this issue
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-16">
            {magazine.team && magazine.team.map((member) => (
              <div 
                key={member.id}
                className="text-center space-y-6 group"
              >
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto shadow-2xl group-hover:scale-105 transition-transform duration-500">
                  <img 
                    src={member.avatar} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-light text-white">
                    {member.name}
                  </h3>
                  <p className="text-gray-400 font-medium">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
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
  );
};

export default MagazineDetail;
