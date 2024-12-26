import React, { useState, useEffect, useCallback, useRef } from "react";
import { useGesture } from "@use-gesture/react";
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
  Search,
  Moon,
  Sun,
  BookmarkPlus,
  Menu,
  Bookmark,
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
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const MagazineViewer = () => {
  // State management
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const viewerRef = useRef(null);
  const totalPages = 39;

  const pages = Array.from(
    { length: totalPages },
    (_, i) => `/Brahmand-APOGEE/${i + 1}.png`
  );

  // Zoom handling functions
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  }, []);

  // Core functionality
  const getCurrentPages = () => {
    if (currentSpread === 0) return [1];
    const leftPage = currentSpread * 2;
    const rightPage = leftPage + 1;
    return [leftPage, rightPage];
  };

  const currentPages = getCurrentPages();
  const isLastSpread = currentPages[currentPages.length - 1] >= totalPages;
  const progress = ((currentPages[0] - 1) / totalPages) * 100;

  // Navigation functions
  const goToSpread = useCallback((pageNumber) => {
    if (pageNumber === 1) {
      setCurrentSpread(0);
    } else {
      setCurrentSpread(Math.floor((pageNumber - 1) / 2));
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Bookmark handling
  const addBookmark = useCallback((pageNumber) => {
    setBookmarks((prev) => {
      if (prev.includes(pageNumber)) return prev;
      return [...prev, pageNumber].sort((a, b) => a - b);
    });
  }, []);

  const removeBookmark = useCallback((pageNumber) => {
    setBookmarks((prev) => prev.filter((p) => p !== pageNumber));
  }, []);

  // Touch gesture handling
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
      drag: {
        threshold: 10,
        filterTaps: true,
      },
      pinch: {
        threshold: 10,
      },
    }
  );

  // Image preloading
  useEffect(() => {
    const pagesToPreload = [];
    const range = 2;

    for (let i = -range; i <= range; i++) {
      const spreadToLoad = currentSpread + i;
      if (spreadToLoad >= 0 && spreadToLoad * 2 <= totalPages) {
        pagesToPreload.push(spreadToLoad * 2, spreadToLoad * 2 + 1);
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
  }, [currentSpread, totalPages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowRight" && !isLastSpread) {
        setCurrentSpread((prev) => prev + 1);
      } else if (e.key === "ArrowLeft" && currentSpread > 0) {
        setCurrentSpread((prev) => prev - 1);
      } else if (e.key === "Escape") {
        setShowThumbnails(false);
        setIsSearchOpen(false);
        setShowBookmarks(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentSpread, isLastSpread]);

  // Theme handling
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // Mini-map component
  const MiniMap = () => (
    <div
      className={cn(
        "absolute bottom-20 right-4 w-32 h-48",
        "bg-white dark:bg-gray-800 rounded-lg shadow-lg",
        "border border-gray-200 dark:border-gray-700",
        "overflow-hidden"
      )}>
      <div className="relative w-full h-full">
        <div
          className="absolute w-full h-1 bg-blue-500"
          style={{
            top: `${(currentPages[0] / totalPages) * 100}%`,
          }}
        />
        {Array.from({ length: Math.ceil(totalPages / 2) }).map((_, i) => (
          <div
            key={i}
            className="w-full h-2 border-b border-gray-200 dark:border-gray-700"
            onClick={() => goToSpread(i * 2 + 1)}
          />
        ))}
      </div>
    </div>
  );

  // Search modal
  const SearchDialog = () => (
    <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Search Pages</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter page number..."
            type="number"
            min="1"
            max={totalPages}
          />
          <Button
            onClick={() => {
              const page = parseInt(searchQuery);
              if (page >= 1 && page <= totalPages) {
                goToSpread(page);
                setIsSearchOpen(false);
              }
            }}>
            Go to Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Bookmarks dialog
  const BookmarksDialog = () => (
    <Dialog open={showBookmarks} onOpenChange={setShowBookmarks}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bookmarks</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {bookmarks.length === 0 ? (
            <p className="text-gray-500">No bookmarks yet</p>
          ) : (
            bookmarks.map((pageNum) => (
              <div
                key={pageNum}
                className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <span>Page {pageNum}</span>
                <div className="space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      goToSpread(pageNum);
                      setShowBookmarks(false);
                    }}>
                    Go to page
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBookmark(pageNum)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  // Error handling toast
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <div
      className={cn(
        "h-screen w-screen flex flex-col",
        isDarkMode ? "bg-gray-950" : "bg-gray-50"
      )}>
      {/* Navigation Bar */}
      <div
        className={cn(
          "flex justify-between items-center px-6 py-3 border-b shadow-lg backdrop-blur-lg",
          isDarkMode
            ? "bg-gray-900/90 border-gray-800"
            : "bg-white/90 border-gray-200"
        )}>
        {/* Left section */}
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
              <span
                className={cn(
                  "text-xs",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}>
                Space Club NIT Jalandhar
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(true)}
                    className="gap-2">
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Search Pages</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBookmarks(true)}
                    className="gap-2">
                    <Bookmark className="w-4 h-4" />
                    <span>Bookmarks</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Bookmarks</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowThumbnails(!showThumbnails)}
                    className="gap-2">
                    <List className="w-4 h-4" />
                    <span>{showThumbnails ? "Hide Pages" : "Show Pages"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Thumbnail View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <Progress value={progress} className="w-32" />

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentSpread === 0}
                    onClick={() => setCurrentSpread((prev) => prev - 1)}
                    className="transition-all hover:scale-105">
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous Page</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <span
              className={cn(
                "px-4 font-medium",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
              {currentPages.length === 1
                ? `Page ${currentPages[0]}`
                : `Pages ${currentPages[0]}-${currentPages[1]}`}{" "}
              / {totalPages}
            </span>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isLastSpread}
                    onClick={() => setCurrentSpread((prev) => prev + 1)}
                    className="transition-all hover:scale-105">
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next Page</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}>
                    <ZoomOut className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom Out</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <span className="w-16 text-center">{Math.round(zoom * 100)}%</span>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomIn}
                    disabled={zoom >= 2}>
                    <ZoomIn className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom In</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Theme</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className="flex-1 flex overflow-hidden relative"
        {...bind()}
        ref={viewerRef}>
        {/* Enhanced Thumbnails Sidebar */}
        {showThumbnails && (
          <>
            <div
              className={cn(
                "absolute inset-y-0 left-0 w-64 border-r z-50 overflow-hidden",
                "transform transition-transform duration-300 ease-in-out",
                isDarkMode
                  ? "bg-gray-900/95 border-gray-800"
                  : "bg-white/95 border-gray-200"
              )}>
              <div className="p-4 border-b flex justify-between items-center">
                <h3
                  className={cn(
                    "font-medium",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>
                  Page Navigation
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowThumbnails(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 p-4 h-[100%] space-y-4 overflow-y-scroll">
                <div className="grid grid-cols-2 gap-4">
                  {pages.map((page, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        goToSpread(index + 1);
                        setShowThumbnails(false);
                      }}
                      className={cn(
                        "relative aspect-[210/297] rounded-lg overflow-hidden ",
                        "transition-all duration-200 hover:scale-105 focus:outline-none",
                        "group",
                        currentPages.includes(index + 1)
                          ? "ring-2 ring-blue-500 shadow-lg"
                          : "hover:ring-2 hover:ring-blue-400/50"
                      )}>
                      {!loadedImages.has(index + 1) && (
                        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-800 " />
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
                          "bg-black/60 transition-opacity duration-200",
                          "opacity-0 group-hover:opacity-100",
                          currentPages.includes(index + 1)
                            ? "!opacity-100 bg-blue-500/60"
                            : ""
                        )}>
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-white text-sm font-medium">
                            Page {index + 1}
                          </span>
                          {bookmarks.includes(index + 1) && (
                            <Badge variant="secondary">
                              <Bookmark className="w-3 h-3 mr-1" />
                              Bookmarked
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setShowThumbnails(false)}
            />
          </>
        )}

        {/* Magazine Display */}
        <div className="flex-1 overflow-auto">
          <div className="min-h-full flex justify-center items-center p-8">
            <div
              className="flex transform-gpu transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}>
              {currentPages.map((pageNum) => (
                <div key={pageNum} className="relative group">
                  {!loadedImages.has(pageNum) && (
                    <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-800" />
                  )}
                  <img
                    src={pages[pageNum - 1]}
                    alt={`Page ${pageNum}`}
                    className={cn(
                      "h-[80vh] w-auto object-contain",
                      "transition-all duration-300",
                      " group-hover:shadow-2xl",
                      isDarkMode
                        ? "group-hover:shadow-blue-400/20"
                        : "group-hover:shadow-blue-600/20"
                    )}
                  />
                  <button
                    onClick={() => {
                      if (bookmarks.includes(pageNum)) {
                        removeBookmark(pageNum);
                      } else {
                        addBookmark(pageNum);
                      }
                    }}
                    className={cn(
                      "absolute top-4 right-4 p-2 rounded-full",
                      "opacity-0 group-hover:opacity-100",
                      "transition-opacity duration-200",
                      bookmarks.includes(pageNum)
                        ? "bg-blue-500 text-white"
                        : "bg-white/90 dark:bg-gray-800/90"
                    )}>
                    <BookmarkPlus className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mini-map Navigation */}
        {showMiniMap && <MiniMap />}

        {/* Enhanced Footer */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0",
            "py-4 px-8 flex justify-between items-center",
            isDarkMode
              ? "bg-gradient-to-t from-gray-950 via-gray-950/90 to-transparent"
              : "bg-gradient-to-t from-white via-white/90 to-transparent"
          )}>
          <span className="font-medium text-blue-500">By Team APOGEE</span>
          <div className="flex gap-8">
            <span className="hover:text-blue-500 transition-colors cursor-pointer">
              Crafted by Janvi and Chahat
            </span>
            <span className="text-blue-500/50">●</span>
            <span className="hover:text-blue-500 transition-colors cursor-pointer">
              Editor - Samridhi
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SearchDialog />
      <BookmarksDialog />

      {/* Error Toast */}
      {errorMessage && (
        <div
          className={cn(
            "fixed bottom-4 right-4 p-4 rounded-lg shadow-lg",
            "bg-red-500 text-white",
            "animate-in slide-in-from-bottom-5"
          )}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default MagazineViewer;
