import React from 'react'
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Star, 
  Download,
  Minimize,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Home
} from "lucide-react";
import { Button } from "../components/ui/button";
import { getMagazineById, isValidMagazineId, DEFAULT_MAGAZINE_ID } from "../data/magazineData";

const Magazine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stars, setStars] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(id || DEFAULT_MAGAZINE_ID);
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop' | 'mobile' | 'tablet'
  const [pdfError, setPdfError] = useState(false);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  // Get current magazine data
  const currentMagazine = getMagazineById(selectedIssue);

  // Redirect to default issue if no issue is specified or invalid
  useEffect(() => {
    if (!id) {
      navigate(`/read/${DEFAULT_MAGAZINE_ID}`, { replace: true });
      return;
    }
    if (!isValidMagazineId(id)) {
      navigate(`/read/${DEFAULT_MAGAZINE_ID}`, { replace: true });
      return;
    }
  }, [id, navigate]);

  // Detect device type
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setViewMode('mobile');
      } else if (width < 1024) {
        setViewMode('tablet');
      } else {
        setViewMode('desktop');
      }
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  useEffect(() => {
    const generateStars = () => {
      return Array.from({ length: 80 }, (_, index) => ({
        id: index,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.7 + 0.3,
        animationDelay: `${Math.random() * 5}s`,
      }));
    };
    setStars(generateStars());
  }, []);

  useEffect(() => {
    if (id && isValidMagazineId(id)) {
      setSelectedIssue(id);
      setIsLoading(true);
      setPdfError(false);
    }
  }, [id]);

  useEffect(() => {
    // Reset loading state when issue changes
    setIsLoading(true);
    setPdfError(false);
    
    const timer = setTimeout(() => {
      setIsLoading(false); // Always set to false after timeout
    }, 3000); // Fallback timeout

    return () => clearTimeout(timer);
  }, [selectedIssue]); // Only depend on selectedIssue

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log('Fullscreen not supported:', error.message);
    }
  };

  const downloadPDF = () => {
    const magazine = getMagazineById(selectedIssue);
    if (magazine) {
      const link = document.createElement('a');
      link.href = magazine.file;
      link.download = `${magazine.title}.pdf`;
      link.click();
    }
  };

  const openInNewTab = () => {
    const magazine = getMagazineById(selectedIssue);
    if (magazine) {
      window.open(magazine.file, '_blank', 'noopener,noreferrer');
    }
  };

  const reloadPDF = () => {
    setIsLoading(true);
    setPdfError(false);
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        iframeRef.current.src = currentSrc;
      }, 100);
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setPdfError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setPdfError(true);
  };

  // Enhanced PDF URL with proper parameters for different devices
  const getPDFUrl = () => {
    const magazine = getMagazineById(selectedIssue);
    if (!magazine) return '';
    
    const baseUrl = magazine.file;
    const params = new URLSearchParams();
    
    // Add parameters based on device type
    if (viewMode === 'mobile') {
      params.set('view', 'FitV'); // Fit vertically for mobile
      params.set('toolbar', '1');
      params.set('navpanes', '0'); // Hide navigation panes on mobile
      params.set('scrollbar', '1');
    } else if (viewMode === 'tablet') {
      params.set('view', 'FitH'); // Fit horizontally for tablet
      params.set('toolbar', '1');
      params.set('navpanes', '1');
      params.set('scrollbar', '1');
    } else {
      params.set('view', 'Fit'); // Best fit for desktop
      params.set('toolbar', '1');
      params.set('navpanes', '1');
      params.set('scrollbar', '1');
      params.set('statusbar', '1');
    }
    
    return `${baseUrl}#${params.toString()}`;
  };

  const SpaceBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-blue-950/20 to-purple-950/30" />
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            opacity: star.opacity,
            animationDelay: star.animationDelay,
          }}
        >
          <Star className="text-white" size={star.size} fill="white" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen relative" ref={containerRef}>
      <SpaceBackground />
      
      <div className="relative z-10 flex flex-col h-screen">
        {/* Compact Simple Header */}
        <div className="bg-gray-900/95 backdrop-blur-xl border-b border-blue-500/20 p-2 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {currentMagazine?.title || 'Magazine'}
                </h1>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 w-8 p-0"
                  title="Go to Home"
                >
                  <Home className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reloadPDF}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 w-8 p-0"
                  title="Reload PDF"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openInNewTab}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 w-8 p-0"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadPDF}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 w-8 p-0"
                  title="Download PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 w-8 p-0"
                  title="Toggle fullscreen"
                >
                  {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Viewer - Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full bg-gray-800/20 backdrop-blur-sm">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
                <div className="text-blue-300 text-center">
                  <div className="animate-spin w-12 h-12 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-lg font-medium">Loading {currentMagazine?.title || 'Magazine'}...</p>
                  <p className="text-sm text-gray-400 mt-2">Optimizing for {viewMode} experience</p>
                </div>
              </div>
            )}

            {pdfError ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-8 bg-gray-800/50 backdrop-blur-xl rounded-lg border border-red-500/20 max-w-md mx-4">
                  <div className="text-red-400 mb-4">
                    <ExternalLink className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">PDF Loading Error</h3>
                  <p className="text-gray-300 mb-6">
                    Unable to display the PDF in the embedded viewer. This might be due to browser restrictions.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={reloadPDF}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <Button
                      onClick={openInNewTab}
                      variant="outline"
                      className="w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </Button>
                    <Button
                      onClick={downloadPDF}
                      variant="outline"
                      className="w-full border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={getPDFUrl()}
                className="w-full h-full border-0"
                title={currentMagazine?.title || 'Magazine'}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                allow="fullscreen"
                loading="eager"
                style={{
                  background: 'transparent',
                }}
              />
            )}
          </div>
        </div>

        {/* Mobile Footer with quick actions */}
        {viewMode === 'mobile' && (
          <div className="bg-gray-900/95 backdrop-blur-xl border-t border-blue-500/20 p-2 flex-shrink-0">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <div className="text-xs text-blue-300 text-center">
                <p>{currentMagazine?.title || 'Magazine'}</p>
                <p className="text-gray-400">{currentMagazine?.pages || ''}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Magazine;
