import React, { useState, useEffect, useCallback, useRef } from "react";
import { useGesture } from "@use-gesture/react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  List,
  ZoomIn,
  ZoomOut,
  X,
  Home,
  Star,
  Circle,
  Moon,
  Sun,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const MagazineViewer = () => {
  // State management with space theme defaults
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [stars, setStars] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  const viewerRef = useRef(null);
  const totalPages = 41;

  const pages = Array.from(
    { length: totalPages },
    (_, i) => `/Brahmand-APOGEE/${i + 1}.png`
  );

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Enhanced zoom handling with smooth transitions
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  }, []);

  // Modified getCurrentPages to handle mobile view
  const getCurrentPages = useCallback(() => {
    if (isMobile) {
      return [currentSpread + 1];
    }
    if (currentSpread === 0) return [1];
    const leftPage = currentSpread * 2;
    const rightPage = leftPage + 1;
    return [leftPage, rightPage];
  }, [currentSpread, isMobile]);

  const currentPages = getCurrentPages();
  const isLastSpread = isMobile
    ? currentPages[0] >= totalPages
    : currentPages[currentPages.length - 1] >= totalPages;
  const progress = ((currentPages[0] - 1) / totalPages) * 100;

  // Enhanced navigation with animations
  const goToSpread = useCallback(
    (pageNumber) => {
      if (isMobile) {
        setCurrentSpread(pageNumber - 1);
      } else {
        if (pageNumber === 1) {
          setCurrentSpread(0);
        } else {
          setCurrentSpread(Math.floor((pageNumber - 1) / 2));
        }
      }
    },
    [isMobile]
  );

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Enhanced gesture handling
  const bind = useGesture(
    {
      onDrag: ({ direction: [dx], distance, cancel }) => {
        try {
          if (distance > 50) {
            if (dx > 0 && currentSpread > 0) {
              setCurrentSpread((prev) => prev - 1);
            } else if (dx < 0 && !isLastSpread) {
              setCurrentSpread((prev) => prev + 1);
            }
          }
        } catch (error) {
          console.error("Gesture error:", error);
          cancel();
        }
      },
      onPinch: ({ offset: [d], cancel }) => {
        try {
          const newZoom = Math.max(0.5, Math.min(2, 1 + d / 200));
          setZoom(newZoom);
        } catch (error) {
          console.error("Pinch error:", error);
          cancel();
        }
      },
    },
    {
      drag: { threshold: 10, filterTaps: true },
      pinch: { threshold: 10 },
    }
  );

  // Generate initial stars on component mount
  useEffect(() => {
    const generateStars = () => {
      return Array.from({ length: 50 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        animationDelay: `${Math.random() * 3}s`,
      }));
    };
    setStars(generateStars());
  }, []);

  // Image preloading optimization
  useEffect(() => {
    const pagesToPreload = [];
    const range = 2;

    for (let i = -range; i <= range; i++) {
      const spreadToLoad = currentSpread + i;
      if (spreadToLoad >= 0 && spreadToLoad * 2 <= totalPages) {
        if (isMobile) {
          pagesToPreload.push(spreadToLoad + 1);
        } else {
          pagesToPreload.push(spreadToLoad * 2, spreadToLoad * 2 + 1);
        }
      }
    }

    pagesToPreload.forEach((pageNum) => {
      if (pageNum <= totalPages && !loadedImages.has(pageNum)) {
        const img = new Image();
        img.src = pages[pageNum - 1];
        img.onload = () => {
          setLoadedImages((prev) => new Set([...prev, pageNum]));
        };
      }
    });
  }, [currentSpread, totalPages, pages, isMobile]);

  // Keyboard navigation enhancement
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowRight" && !isLastSpread) {
        setCurrentSpread((prev) => prev + 1);
      } else if (e.key === "ArrowLeft" && currentSpread > 0) {
        setCurrentSpread((prev) => prev - 1);
      } else if (e.key === "Escape") {
        setShowThumbnails(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentSpread, isLastSpread]);

  // background - space theme
  const SpaceBackground = () => {
    // Stars configuration
    const [stars, setStars] = useState([]);
    const [shootingStars, setShootingStars] = useState([]);

    useEffect(() => {
      // Generate random stars
      const generateStars = () => {
        return Array.from({ length: 100 }, () => ({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.7 + 0.3,
          animationDelay: `${Math.random() * 5}s`,
          twinkleSpeed: `${Math.random() * 3 + 2}s`,
        }));
      };

      // Generate shooting stars
      const generateShootingStars = () => {
        return Array.from({ length: 5 }, () => ({
          x: Math.random() * 100,
          y: Math.random() * 50,
          duration: Math.random() * 2 + 1,
          delay: Math.random() * 10,
        }));
      };

      setStars(generateStars());
      setShootingStars(generateShootingStars());

      // Regenerate shooting stars periodically
      const interval = setInterval(() => {
        setShootingStars(generateShootingStars());
      }, 10000);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-blue-950/20 to-purple-950/30" />

        {/* Animated stars */}
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute animate-twinkle"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDuration: star.twinkleSpeed,
              animationDelay: star.animationDelay,
            }}>
            <Star
              className="text-white transform-gpu"
              size={star.size}
              fill="white"
              style={{ opacity: star.opacity }}
            />
          </div>
        ))}

        {/* Shooting stars */}
        {shootingStars.map((star, i) => (
          <div
            key={i}
            className="absolute h-px w-12 bg-gradient-to-r from-transparent via-white to-transparent animate-shooting-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}

        {/* Nebula effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 animate-nebula" />

        {/* Cosmic objects */}
        <div className="absolute right-10 top-20 animate-float">
          <Sun className="text-gray-400/20" size={80} />
        </div>
        <div className="absolute left-20 bottom-20 animate-float-slow">
          <Moon className="text-gray-400/20" size={60} />
        </div>
      </div>
    );
  };

  // Space-themed mini-map
  const MiniMap = () => (
    <div className="absolute bottom-20 right-4 w-32 h-48 rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-indigo-900/30 to-purple-900/20 backdrop-blur-lg" />

      {stars.slice(0, 20).map((star, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            opacity: star.opacity,
            animationDelay: star.animationDelay,
          }}>
          <Star className="text-white" size={star.size} fill="white" />
        </div>
      ))}

      <div className="relative w-full h-full border border-blue-500/20">
        <div
          className="absolute w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 shadow-lg shadow-blue-500/50 transition-all duration-300"
          style={{ top: `${(currentPages[0] / totalPages) * 100}%` }}
        />

        {Array.from({ length: Math.ceil(totalPages / 2) }).map((_, i) => (
          <div
            key={i}
            className="w-full h-2 border-b border-blue-500/10 relative group cursor-pointer hover:bg-blue-500/10 transition-colors"
            onClick={() => goToSpread(i * 2 + 1)}>
            <Circle
              className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-400/30 group-hover:text-blue-400 transition-colors"
              size={4}
            />
          </div>
        ))}

        <div className="absolute -right-2 bottom-2 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/20" />
      </div>
    </div>
  );

  // Error handling with space theme
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-950 transition-colors duration-500 relative">
      <SpaceBackground />
      {/* Animated stars background */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            opacity: star.opacity,
            animationDelay: star.animationDelay,
            zIndex: 0,
          }}>
          <Star className="text-white" size={star.size} fill="white" />
        </div>
      ))}
      {/* Enhanced Navigation Bar with space theme */}
      <div className="flex flex-col md:flex-row justify-between items-stretch px-3 md:px-6 py-2 md:py-3 border-b border-blue-500/20 bg-gray-900/90 backdrop-blur-xl transition-all duration-300 relative z-10">
        {/* Top row for mobile - Logo and basic controls */}
        <div className="flex justify-between items-center mb-2 md:mb-0">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/logo.png"
                alt="Club Logo"
                className="w-8 h-8 rounded-full transition-transform group-hover:scale-110 ring-2 ring-blue-500/30"
              />
              <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-md group-hover:bg-blue-500/30 transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Apogee
              </span>
              <span className="text-[10px] text-blue-300/70">
                Space Club NIT Jalandhar
              </span>
            </div>
          </div>

          {/* Mobile-only controls */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1">
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowThumbnails(!showThumbnails)}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1">
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Bottom row for mobile - Navigation controls */}
        <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4">
          {/* Left side controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToSpread(1)}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
              <Home className="w-4 h-4" />
            </Button>

            <Progress
              value={progress}
              className="w-16 md:w-32 bg-blue-950 border border-blue-500/20 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 animate-pulse" />
            </Progress>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={currentSpread === 0}
              onClick={() => setCurrentSpread((prev) => prev - 1)}
              className="h-8 w-8 transition-all hover:scale-105 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="px-2 font-medium text-blue-300 text-sm min-w-[80px] text-center">
              {currentPages.length === 1
                ? `${currentPages[0]}`
                : `${currentPages[0]}-${currentPages[1]}`}{" "}
              / {totalPages}
            </span>

            <Button
              variant="ghost"
              size="icon"
              disabled={isLastSpread}
              onClick={() => setCurrentSpread((prev) => prev + 1)}
              className="h-8 w-8 transition-all hover:scale-105 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Zoom controls - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
              <ZoomOut className="w-4 h-4" />
            </Button>

            <span className="w-12 text-center text-blue-300 text-sm">
              {Math.round(zoom * 100)}%
            </span>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 2}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area with Space Theme */}
      <div
        className="flex-1 flex overflow-hidden relative"
        {...bind()}
        ref={viewerRef}>
        {/* Enhanced Thumbnails Sidebar with Space Theme */}
        {showThumbnails && (
          <>
            <div
              className={cn(
                "absolute inset-y-0 left-0 w-full md:w-64 z-50 overflow-hidden",
                "transform transition-transform duration-300 ease-in-out",
                "bg-gray-900/95 border-r border-blue-500/20",
                "backdrop-blur-xl"
              )}>
              <div className="p-4 border-b border-blue-500/20 flex justify-between items-center">
                <h3 className="font-medium text-blue-400">Page Navigation</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowThumbnails(false)}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 p-4 h-[calc(100%-4rem)] space-y-4 overflow-y-scroll custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  {pages.map((page, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        goToSpread(index + 1);
                        setShowThumbnails(false);
                      }}
                      className={cn(
                        "relative aspect-[210/297] rounded-lg overflow-hidden",
                        "transition-all duration-300 hover:scale-105 focus:outline-none",
                        "group border border-blue-500/20",
                        currentPages.includes(index + 1)
                          ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20"
                          : "hover:ring-2 hover:ring-blue-400/50"
                      )}>
                      {!loadedImages.has(index + 1) && (
                        <div className="absolute inset-0 animate-pulse bg-gray-800" />
                      )}
                      <img
                        src={page}
                        alt={`Page ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div
                        className={cn(
                          "absolute inset-0 flex items-center justify-center",
                          "bg-gray-900/80 transition-opacity duration-300",
                          "opacity-0 group-hover:opacity-100",
                          currentPages.includes(index + 1)
                            ? "!opacity-100 bg-blue-900/60"
                            : ""
                        )}>
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-blue-300 text-sm font-medium">
                            Page {index + 1}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
              onClick={() => setShowThumbnails(false)}
            />
          </>
        )}

        {/* Magazine Display with enhanced space theme */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="min-h-full flex justify-center items-center p-4 md:p-8">
            <div
              className="flex transform-gpu transition-all duration-300"
              style={{ transform: `scale(${zoom})` }}>
              {currentPages.map((pageNum) => (
                <div key={pageNum} className="relative group">
                  {!loadedImages.has(pageNum) && (
                    <div className="absolute inset-0 animate-pulse bg-gray-800" />
                  )}
                  <img
                    src={pages[pageNum - 1]}
                    alt={`Page ${pageNum}`}
                    className="h-[50vh] md:h-[80vh] w-auto object-contain rounded-lg border border-blue-500/20 shadow-xl shadow-blue-500/5 group-hover:shadow-2xl group-hover:shadow-blue-500/10 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced MiniMap */}
        {showMiniMap && <MiniMap />}

        {/* Enhanced Footer */}
        <div className="absolute bottom-0 left-0 right-0 py-2 md:py-4 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center">
          <span className="font-medium text-white text-sm md:text-base mb-1 md:mb-0">
            Team APOGEE 🚀
          </span>
          <div className="flex flex-col md:flex-row md:gap-8 items-center text-sm md:text-base">
            <span className="text-white hover:text-blue-300 transition-colors cursor-pointer">
              Crafted By Janvi and Chahat
            </span>
            <span className="text-white/80 hidden md:inline">●</span>
            <span className="text-white hover:text-blue-300 transition-colors cursor-pointer">
              Editor - Samridhi
            </span>
          </div>
        </div>
      </div>

      {/* Error Toast with Space Theme */}
      {errorMessage && (
        <div
          className={cn(
            "fixed bottom-4 right-4 p-4 rounded-lg",
            "bg-red-500/90 text-white backdrop-blur-xl",
            "border border-red-400/30",
            "shadow-lg shadow-red-500/20",
            "animate-in slide-in-from-bottom-5"
          )}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default MagazineViewer;
