import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Book,
  Home,
  List,
  ZoomIn,
  ZoomOut,
  X,
  Loader2,
  Search,
} from "lucide-react";

const MagazineViewer = () => {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState(null);
  const totalPages = 39;

  const pages = Array.from(
    { length: totalPages },
    (_, i) => `/Brahmand-APOGEE/${i + 1}.png`
  );

  // Page turn animation handling
  const handlePageTurn = useCallback(
    (newSpread, newDirection) => {
      if (isAnimating) return;

      setDirection(newDirection);
      setIsAnimating(true);

      // Start the animation
      setTimeout(() => {
        setCurrentSpread(newSpread);
        // Reset animation state after completion
        setTimeout(() => {
          setIsAnimating(false);
          setDirection(null);
        }, 500); // Match this with CSS animation duration
      }, 250); // Half of the animation duration for smooth transition
    },
    [isAnimating]
  );

  // Navigation functions with animation
  const goToNextSpread = () => {
    if (!isLastSpread && !isAnimating) {
      handlePageTurn(currentSpread + 1, "forward");
    }
  };

  const goToPreviousSpread = () => {
    if (currentSpread > 0 && !isAnimating) {
      handlePageTurn(currentSpread - 1, "backward");
    }
  };

  // Create thumbnail groups for better organization
  const thumbnailGroups = Array.from(
    { length: Math.ceil(totalPages / 6) },
    (_, i) => pages.slice(i * 6, (i + 1) * 6)
  );

  const getCurrentPages = () => {
    if (currentSpread === 0) return [1];
    const leftPage = currentSpread * 2;
    const rightPage = leftPage + 1;
    return [leftPage, rightPage];
  };

  const currentPages = getCurrentPages();
  const isLastSpread = currentPages[currentPages.length - 1] >= totalPages;

  // Enhanced image preloading with error handling
  const preloadImage = useCallback(
    (pageNum) => {
      if (pageNum <= totalPages && !loadedImages.has(pageNum)) {
        const img = new Image();
        img.src = pages[pageNum - 1];
        img.onload = () => {
          setLoadedImages((prev) => new Set([...prev, pageNum]));
        };
        img.onerror = () => {
          console.error(`Failed to load page ${pageNum}`);
        };
      }
    },
    [totalPages, pages, loadedImages]
  );

  // Improved preloading logic
  useEffect(() => {
    const pagesToPreload = [];
    if (currentSpread > 0) {
      pagesToPreload.push((currentSpread - 1) * 2, (currentSpread - 1) * 2 + 1);
    }
    if (!isLastSpread) {
      pagesToPreload.push((currentSpread + 1) * 2, (currentSpread + 1) * 2 + 1);
    }
    pagesToPreload.forEach(preloadImage);
  }, [currentSpread, isLastSpread, preloadImage]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowRight" && !isLastSpread) {
        setCurrentSpread((prev) => prev + 1);
      } else if (e.key === "ArrowLeft" && currentSpread > 0) {
        setCurrentSpread((prev) => prev - 1);
      } else if (e.key === "Escape") {
        if (showThumbnails) setShowThumbnails(false);
        setSelectedThumbnail(null);
      } else if (e.key === " ") {
        e.preventDefault();
        setShowThumbnails((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentSpread, isLastSpread, showThumbnails]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));

  const goToSpread = (pageNumber) => {
    if (pageNumber === 1) setCurrentSpread(0);
    else setCurrentSpread(Math.floor((pageNumber - 1) / 2));
  };

  // Filter thumbnails based on search
  const filteredPages = pages.filter((_, index) =>
    (index + 1).toString().includes(searchQuery)
  );

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center px-6 py-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-b border-gray-700 shadow-lg backdrop-blur-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Club Logo"
              className="w-10 h-10 rounded-full transition-transform group-hover:scale-110"
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Apogee
              </span>
              <span className="text-xs text-gray-400">
                Space Club NIT Jalandhar
              </span>
            </div>
          </div>
          <div className="h-6 w-px bg-gray-700" />
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousSpread}
              disabled={currentSpread === 0 || isAnimating}
              className="p-2 hover:bg-gray-700/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 group">
              <ChevronLeft className="w-5 h-5 group-hover:text-blue-400" />
            </button>
            <button
              onClick={goToNextSpread}
              disabled={isLastSpread || isAnimating}
              className="p-2 hover:bg-gray-700/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 group">
              <ChevronRight className="w-5 h-5 group-hover:text-blue-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-800/50 rounded-lg p-1 backdrop-blur-sm">
            <button
              onClick={() => setCurrentSpread((prev) => prev - 1)}
              disabled={currentSpread === 0}
              className="p-2 hover:bg-gray-700/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 group">
              <ChevronLeft className="w-5 h-5 group-hover:text-blue-400" />
            </button>
            <span className="px-4 font-medium">
              {currentPages.length === 1
                ? `Page ${currentPages[0]}`
                : `Pages ${currentPages[0]}-${currentPages[1]}`}{" "}
              / {totalPages}
            </span>
            <button
              onClick={() => setCurrentSpread((prev) => prev + 1)}
              disabled={isLastSpread}
              className="p-2 hover:bg-gray-700/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 group">
              <ChevronRight className="w-5 h-5 group-hover:text-blue-400" />
            </button>
          </div>
          <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1 backdrop-blur-sm">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-all hover:scale-105 group">
              <ZoomOut className="w-5 h-5 group-hover:text-blue-400" />
            </button>
            <span className="w-12 text-center font-medium">
              {(zoom * 100).toFixed(0)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-all hover:scale-105 group">
              <ZoomIn className="w-5 h-5 group-hover:text-blue-400" />
            </button>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-all hover:scale-105 group">
            {isFullscreen ? (
              <Minimize className="w-5 h-5 group-hover:text-blue-400" />
            ) : (
              <Maximize className="w-5 h-5 group-hover:text-blue-400" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Enhanced Thumbnails Sidebar */}
        {showThumbnails && (
          <div
            className="absolute inset-y-0 left-0 w-80 bg-gray-800/95 backdrop-blur-md border-r border-gray-700 z-50 overflow-hidden flex flex-col shadow-xl transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-700 flex flex-col gap-4 bg-gray-900/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Book className="w-4 h-4 text-blue-400" />
                  <h3 className="text-white font-medium">Pages</h3>
                </div>
                <button
                  onClick={() => setShowThumbnails(false)}
                  className="p-1.5 hover:bg-gray-700/50 rounded-full transition-all hover:scale-105 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
              {searchQuery ? (
                // Search results view
                <div className="grid grid-cols-2 gap-4 px-4">
                  {filteredPages.map((page, index) => (
                    <ThumbnailItem
                      key={index}
                      page={page}
                      pageNumber={pages.indexOf(page) + 1}
                      currentPages={currentPages}
                      isSelected={selectedThumbnail === pages.indexOf(page) + 1}
                      onSelect={(pageNum) => {
                        setSelectedThumbnail(pageNum);
                        goToSpread(pageNum);
                        setShowThumbnails(false);
                      }}
                    />
                  ))}
                </div>
              ) : (
                // Grouped view
                <div className="space-y-6">
                  {thumbnailGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="px-4">
                      <div className="text-xs text-gray-400 mb-2">
                        Pages {groupIndex * 6 + 1}-
                        {Math.min((groupIndex + 1) * 6, totalPages)}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {group.map((page, index) => (
                          <ThumbnailItem
                            key={index}
                            page={page}
                            pageNumber={groupIndex * 6 + index + 1}
                            currentPages={currentPages}
                            isSelected={
                              selectedThumbnail === groupIndex * 6 + index + 1
                            }
                            onSelect={(pageNum) => {
                              setSelectedThumbnail(pageNum);
                              goToSpread(pageNum);
                              setShowThumbnails(false);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overlay to close thumbnails */}
        {showThumbnails && (
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => {
              setShowThumbnails(false);
              setSelectedThumbnail(null);
            }}
          />
        )}

        {/* Magazine Display */}
        <div className="flex-1 overflow-hidden">
          <div className="min-h-full flex justify-center items-center p-8">
            <div
              className="flex transform-gpu transition-transform duration-200 relative"
              style={{ transform: `scale(${zoom})` }}>
              {currentPages.map((pageNum, index) => (
                <div
                  key={pageNum}
                  className={`relative transition-all duration-500 ${
                    isAnimating
                      ? direction === "forward"
                        ? "animate-page-turn-forward"
                        : "animate-page-turn-backward"
                      : ""
                  }`}
                  style={{
                    transformOrigin: direction === "forward" ? "left" : "right",
                    perspective: "1000px",
                  }}>
                  {!loadedImages.has(pageNum) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    </div>
                  )}
                  <img
                    src={pages[pageNum - 1]}
                    alt={`Page ${pageNum}`}
                    className={`h-[80vh] w-auto object-contain transition-all duration-500 ${
                      isAnimating ? "shadow-2xl" : ""
                    }`}
                    onLoad={() => {
                      setLoadedImages((prev) => new Set([...prev, pageNum]));
                    }}
                    style={{
                      backfaceVisibility: "hidden",
                    }}
                  />
                  {isAnimating && (
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"
                      style={{
                        opacity: direction === "forward" ? 1 : 0,
                        transition: "opacity 500ms",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Credits Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-950 via-gray-950/90 to-transparent py-3 px-8 text-white/90 text-sm flex justify-between items-center backdrop-blur-sm">
          <span className="font-medium text-blue-400/90">By Team APOGEE</span>
          <div className="flex gap-8">
            <span className="hover:text-blue-400 transition-colors cursor-pointer">
              Crafted by Janvi and Chahat
            </span>
            <span className="text-blue-400/50">●</span>
            <span className="hover:text-blue-400 transition-colors cursor-pointer">
              Editor - Samridhi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// New ThumbnailItem component for better organization
const ThumbnailItem = ({
  page,
  pageNumber,
  currentPages,
  isSelected,
  onSelect,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <button
      onClick={() => onSelect(pageNumber)}
      className={`relative aspect-[210/297] overflow-hidden rounded-lg transition-all hover:scale-105 focus:outline-none group ${
        isSelected || currentPages.includes(pageNumber)
          ? "ring-2 ring-blue-400 shadow-lg shadow-blue-400/20"
          : "hover:ring-2 hover:ring-blue-400/50"
      }`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
        </div>
      )}
      <img
        src={page}
        alt={`Page ${pageNumber}`}
        className="w-full h-full object-cover"
        loading="lazy"
        onLoad={() => setIsLoading(false)}
      />
      <div
        className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200
          ${
            isSelected || currentPages.includes(pageNumber)
              ? "!opacity-100 bg-blue-500/40"
              : ""
          }`}>
        <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium text-white">
          Page {pageNumber}
        </span>
      </div>
    </button>
  );
};

// Add these animations to your global CSS or Tailwind config
const style = document.createElement("style");
style.textContent = `
  @keyframes pageTurnForward {
    0% {
      transform: rotateY(0);
    }
    100% {
      transform: rotateY(-180deg);
    }
  }

  @keyframes pageTurnBackward {
    0% {
      transform: rotateY(0);
    }
    100% {
      transform: rotateY(180deg);
    }
  }

  .animate-page-turn-forward {
    animation: pageTurnForward 500ms ease-in-out;
  }

  .animate-page-turn-backward {
    animation: pageTurnBackward 500ms ease-in-out;
  }
`;
document.head.appendChild(style);

export default MagazineViewer;
