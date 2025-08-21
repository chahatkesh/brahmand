import React from 'react'
import { useParams, Link } from "react-router-dom";
import { getMagazineById } from "@/data/magazineData";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft, Users, Calendar, FileText } from "lucide-react";

const MagazineDetail = () => {
  const { id } = useParams();
  const magazine = getMagazineById(id);

  if (!magazine) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl text-red-500">
        Magazine not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-blue-950/20 to-purple-950/30 py-16 px-4">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link to="/">
          <Button variant="outline" className="bg-transparent border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Magazine Details */}
      <div className="max-w-6xl mx-auto bg-gray-900/80 backdrop-blur-xl rounded-xl border border-blue-500/20 p-8 mb-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Cover Image */}
          <div className="flex-shrink-0 w-64 h-80 bg-gray-800 rounded-lg overflow-hidden shadow-xl">
            <img 
              src={magazine.cover} 
              alt={magazine.title} 
              className="object-cover w-full h-full"
            />
          </div>
          
          {/* Magazine Info */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {magazine.title}
              </h1>
              <p className="text-gray-300 text-xl leading-relaxed">
                {magazine.description}
              </p>
            </div>
            
            {/* Metadata */}
            <div className="flex flex-wrap gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="text-lg">{magazine.pages}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-lg">{magazine.releaseDate}</span>
              </div>
              {magazine.featured && (
                <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                  FEATURED
                </div>
              )}
            </div>
            
            {/* Read Magazine Button */}
            <div className="pt-4">
              <Link to={`/read/${magazine.id}`}>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-3"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Read Magazine
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-6xl mx-auto bg-gray-900/70 backdrop-blur-xl rounded-xl border border-blue-500/20 p-8">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-8 h-8 text-blue-400" />
          <h2 className="text-4xl font-bold text-blue-300">Meet the Team</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {magazine.team && magazine.team.map((member) => (
            <div 
              key={member.id} 
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <div 
                  className={`w-16 h-16 bg-${member.color}-800 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg`}
                >
                  {member.avatar}
                </div>
                <div>
                  <div className="font-semibold text-lg text-white mb-1">
                    {member.name}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {member.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MagazineDetail;
