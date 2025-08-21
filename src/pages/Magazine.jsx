import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Download,
  Minimize,
  Maximize2,
  Home,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  RefreshCw,
  Keyboard
} from "lucide-react";
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { getMagazineById, isValidMagazineId, DEFAULT_MAGAZINE_ID } from "../data/magazineData";

// Set up PDF.js worker - using local worker file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const Magazine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stars, setStars] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(id || DEFAULT_MAGAZINE_ID);
  const [viewMode, setViewMode] = useState('desktop');
  const [pdfError, setPdfError] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
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

  // Detect device type and calculate optimal scale
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setViewMode('mobile');
        // Don't set a fixed scale for mobile - let it be calculated based on page dimensions
      } else if (width < 1024) {
        setViewMode('tablet');
        // Don't set a fixed scale for tablet - let it be calculated based on page dimensions
      } else {
        setViewMode('desktop');
        // Don't set a fixed scale for desktop - let it be calculated based on page dimensions
      }
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  // Recalculate scale when view mode changes
  useEffect(() => {
    // Set initial scale, will be refined by onPageLoadSuccess
    const baseScale = viewMode === 'mobile' ? 1.0 : viewMode === 'tablet' ? 0.9 : 0.8;
    setScale(baseScale);
  }, [viewMode]);

  // Generate subtle stars for background
  useEffect(() => {
    const generateStars = () => {
      return Array.from({ length: 30 }, (_, index) => ({
        id: index,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.2 + 0.1,
        animationDelay: `${Math.random() * 8}s`,
      }));
    };
    setStars(generateStars());
  }, []);

  useEffect(() => {
    if (id && isValidMagazineId(id)) {
      setSelectedIssue(id);
      setIsLoading(true);
      setPdfError(false);
      setPageNumber(1);
    }
  }, [id]);

  // PDF event handlers
  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log('✅ PDF loaded successfully with', numPages, 'pages');
    console.log('PDF Worker Source:', pdfjs.GlobalWorkerOptions.workerSrc);
    setNumPages(numPages);
    setIsLoading(false);
    setPdfError(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('❌ PDF loading error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    console.error('PDF Worker Source:', pdfjs.GlobalWorkerOptions.workerSrc);
    console.error('PDF File URL being loaded:', getPDFFileUrl());
    setIsLoading(false);
    setPdfError(true);
  };

  const onPageLoadSuccess = useCallback((page) => {
    console.log('Page loaded successfully');
    
    // Calculate optimal scale based on page dimensions and available space
    const calculateOptimalScale = () => {
      if (!containerRef.current || !page) return 1.0;
      
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      // Available space (accounting for header, padding, etc.)
      const availableWidth = containerRect.width - 32; // 16px padding on each side
      const availableHeight = containerRect.height - 120; // Account for header and controls
      
      // Get page dimensions
      const pageWidth = page.view[2] - page.view[0]; // PDF page width
      const pageHeight = page.view[3] - page.view[1]; // PDF page height
      
      let optimalScale;
      
      if (viewMode === 'desktop') {
        // Desktop: default to 80% zoom for both single and dual page
        optimalScale = 1;
      } else if (viewMode === 'tablet') {
        // Tablet: fit to screen
        const scaleForWidth = (availableWidth * 0.9) / pageWidth; // 90% to leave some margin
        const scaleForHeight = (availableHeight * 0.9) / pageHeight;
        optimalScale = Math.min(scaleForWidth, scaleForHeight, 1.2); // Cap at 120%
      } else {
        // Mobile: fit to screen
        const scaleForWidth = (availableWidth * 0.95) / pageWidth; // 95% to leave some margin
        const scaleForHeight = (availableHeight * 0.95) / pageHeight;
        optimalScale = Math.min(scaleForWidth, scaleForHeight, 1.5); // Cap at 150%
      }
      
      // Ensure minimum readable scale
      return Math.max(optimalScale, 0.3);
    };
    
    // Calculate and set optimal scale
    const newScale = calculateOptimalScale();
    setScale(newScale);
  }, [viewMode, pageNumber]);

  const onPageLoadError = (error) => {
    console.error('Page loading error:', error);
  };

  // Navigation controls with dual-page spread logic
  const changePage = useCallback((offset) => {
    setPageNumber(prevPageNumber => {
      let newPage = prevPageNumber;
      
      if (viewMode === 'desktop') {
        if (prevPageNumber === 1) {
          // From page 1, jump to page 2 (which will show 2-3 spread)
          newPage = offset > 0 ? 2 : 1;
        } else {
          // In dual-page mode, jump by 2 pages
          newPage = prevPageNumber + (offset * 2);
        }
      } else {
        // Mobile/tablet: normal single page navigation
        newPage = prevPageNumber + offset;
      }
      
      return Math.min(Math.max(1, newPage), numPages || 1);
    });
  }, [viewMode, numPages]);

  const previousPage = useCallback(() => changePage(-1), [changePage]);
  const nextPage = useCallback(() => changePage(1), [changePage]);

  // Zoom controls
  const zoomIn = useCallback(() => setScale(prev => Math.min(prev + 0.1, 3.0)), []);
  const zoomOut = useCallback(() => setScale(prev => Math.max(prev - 0.1, 0.3)), []);
  const resetZoom = useCallback(() => {
    // Reset to optimal scale based on page dimensions
    // This will be recalculated when onPageLoadSuccess is called
    const baseScale = viewMode === 'mobile' ? 1.0 : viewMode === 'tablet' ? 0.9 : 1.0;
    setScale(baseScale);
  }, [viewMode]);

  // Rotation control
  const rotate = useCallback(() => setRotation(prev => (prev + 90) % 360), []);

  // Keyboard shortcuts modal toggle
  const toggleKeyboardShortcuts = useCallback(() => {
    setShowKeyboardShortcuts(prev => !prev);
  }, []);

  // Fullscreen control
  const toggleFullscreen = useCallback(async () => {
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
  }, []);

  // File actions
  const downloadPDF = useCallback(() => {
    const magazine = getMagazineById(selectedIssue);
    if (magazine) {
      const link = document.createElement('a');
      link.href = magazine.file;
      link.download = `${magazine.title}.pdf`;
      link.click();
    }
  }, [selectedIssue]);

  // Get PDF file URL with proper error handling
  const getPDFFileUrl = useCallback(() => {
    const magazine = getMagazineById(selectedIssue);
    if (!magazine || !magazine.file) {
      console.error('No magazine or file found for issue:', selectedIssue);
      return null;
    }
    
    const fileUrl = magazine.file;
    console.log('Raw file URL from magazine data:', fileUrl);
    
    // For react-pdf, we need to handle both relative and absolute URLs
    let finalUrl;
    if (fileUrl.startsWith('/')) {
      finalUrl = fileUrl; // react-pdf can handle relative URLs
    } else if (fileUrl.startsWith('http')) {
      finalUrl = fileUrl;
    } else {
      finalUrl = `/${fileUrl}`;
    }
    
    console.log('Final PDF URL for react-pdf:', finalUrl);
    return finalUrl;
  }, [selectedIssue]);

  // Test PDF accessibility
  const testPDFAccess = useCallback(async () => {
    const pdfUrl = getPDFFileUrl();
    if (!pdfUrl) return;
    
    try {
      console.log('Testing PDF access at:', pdfUrl);
      const response = await fetch(pdfUrl, { method: 'HEAD' });
      console.log('PDF accessibility test result:', response.status, response.statusText);
    } catch (error) {
      console.error('PDF accessibility test failed:', error);
    }
  }, [getPDFFileUrl]);

  // Test PDF access when component mounts
  useEffect(() => {
    if (currentMagazine) {
      console.log('🔍 Testing PDF access for magazine:', currentMagazine.title);
      console.log('📁 Magazine file path:', currentMagazine.file);
      testPDFAccess();
    }
  }, [selectedIssue, currentMagazine, testPDFAccess]);

  // Memoize PDF options to prevent unnecessary reloads
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  }), []);

  const SpaceBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Subtle gradient background matching Apple style */}
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
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/30" />
    </div>
  );

  // Keyboard navigation - placed after all functions are defined
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Prevent default behavior for navigation keys
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.code)) {
        event.preventDefault();
      }

      switch (event.code) {
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          previousPage();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case 'Space':
        case 'PageDown':
          nextPage();
          break;
        case 'Home':
          setPageNumber(1);
          break;
        case 'End':
          if (numPages) setPageNumber(numPages);
          break;
        case 'KeyF':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            toggleFullscreen();
          }
          break;
        case 'Escape':
          if (showKeyboardShortcuts) {
            setShowKeyboardShortcuts(false);
          } else if (isFullscreen) {
            toggleFullscreen();
          }
          break;
        case 'Equal':
        case 'NumpadAdd':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            zoomIn();
          }
          break;
        case 'Minus':
        case 'NumpadSubtract':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            zoomOut();
          }
          break;
        case 'Digit0':
        case 'Numpad0':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            resetZoom();
          }
          break;
        case 'KeyR':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            rotate();
          }
          break;
        default:
          break;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pageNumber, numPages, isFullscreen, showKeyboardShortcuts, previousPage, nextPage, toggleFullscreen, zoomIn, zoomOut, resetZoom, rotate]);

  return (
    <div className="min-h-screen relative bg-black" ref={containerRef}>
      <SpaceBackground />
      
      <div className="relative z-10 flex flex-col h-screen">
        {/* Apple-style Header */}
        <div className="bg-gray-900/20 backdrop-blur-xl border-b border-gray-800/30 flex-shrink-0">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left section with title */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full p-2 transition-all duration-300"
                  title="Back to Home"
                >
                  <Home className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-light text-white">
                    {currentMagazine?.title || 'Magazine'}
                  </h1>
                  {currentMagazine?.subtitle && (
                    <p className="hidden md:block text-sm font-light text-gray-400">
                      {currentMagazine.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Center section with page controls */}
              {numPages && (
                <div className="hidden md:flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={previousPage}
                    disabled={pageNumber <= 1}
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full p-2 disabled:opacity-30 disabled:hover:text-gray-400 transition-all duration-300"
                    title="Previous Page (← or ↑ or Page Up)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-700/50">
                    <span className="text-sm font-light text-white">
                      {viewMode === 'desktop' && pageNumber > 1 && pageNumber + 1 <= numPages
                        ? `${pageNumber}-${pageNumber + 1} of ${numPages}`
                        : `${pageNumber} of ${numPages}`
                      }
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextPage}
                    disabled={
                      viewMode === 'desktop' && pageNumber > 1 
                        ? pageNumber + 1 >= numPages 
                        : pageNumber >= numPages
                    }
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full p-2 disabled:opacity-30 disabled:hover:text-gray-400 transition-all duration-300"
                    title="Next Page (→ or ↓ or Space or Page Down)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Right section with controls */}
              <div className="flex items-center gap-2">
                {/* Zoom controls */}
                <div className="hidden md:flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomOut}
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full p-2 transition-all duration-300"
                    title="Zoom Out (Ctrl + -)"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetZoom}
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full px-3 py-2 transition-all duration-300"
                    title="Reset Zoom (Ctrl + 0)"
                  >
                    <span className="text-xs font-medium">{Math.round(scale * 100)}%</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomIn}
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full p-2 transition-all duration-300"
                    title="Zoom In (Ctrl + +)"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={rotate}
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full p-2 transition-all duration-300"
                    title="Rotate (Ctrl + R)"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadPDF}
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full p-2 transition-all duration-300"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  {/* Keyboard shortcuts button - hidden on mobile */}
                  {viewMode !== 'mobile' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleKeyboardShortcuts}
                      className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full p-2 transition-all duration-300"
                      title="Show Keyboard Shortcuts"
                    >
                      <Keyboard className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full p-2 transition-all duration-300"
                    title="Toggle fullscreen (Ctrl+F or Esc)"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Viewer - Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full relative">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-light text-white">Loading {currentMagazine?.title || 'Magazine'}...</p>
                    <p className="text-sm font-light text-gray-400">
                      Enhanced PDF Reader
                    </p>
                  </div>
                </div>
              </div>
            )}

            {pdfError ? (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center p-8 bg-gray-900/30 backdrop-blur-xl rounded-3xl border border-gray-800 max-w-md mx-auto">
                  <div className="text-gray-400 mb-6">
                    <FileText className="w-16 h-16 mx-auto opacity-50" />
                  </div>
                  <h3 className="text-2xl font-light text-white mb-4">Unable to Load PDF</h3>
                  <p className="text-gray-400 font-light mb-8 leading-relaxed">
                    The PDF viewer encountered an issue loading this document. Please try the options below.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => window.location.reload()}
                      className="w-full bg-white text-black hover:bg-gray-200 font-medium rounded-full py-3 transition-all duration-300"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reload Page
                    </Button>
                    <Button
                      onClick={downloadPDF}
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white font-medium rounded-full py-3 transition-all duration-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full">
                {/* Enhanced React-PDF Viewer */}
                <div className="h-full flex items-center justify-center overflow-auto bg-gray-950/30 backdrop-blur-sm">
                  <div className="p-4">
                    <Document
                      file={getPDFFileUrl()}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      options={pdfOptions}
                      loading={
                        <div className="flex items-center justify-center py-20">
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                      }
                      error={
                        <div className="text-center p-8 bg-gray-900/30 backdrop-blur-xl rounded-3xl border border-gray-800 max-w-md mx-auto">
                          <div className="text-gray-400 mb-6">
                            <FileText className="w-16 h-16 mx-auto opacity-50" />
                          </div>
                          <h3 className="text-xl font-light text-white mb-4">Enhanced PDF Viewer Error</h3>
                          <p className="text-gray-400 font-light mb-6">
                            The enhanced PDF viewer could not load this file. Please try refreshing or downloading.
                          </p>
                          <div className="space-y-3">
                            <Button
                              onClick={() => window.location.reload()}
                              className="w-full bg-white text-black hover:bg-gray-200 font-medium rounded-full py-2 px-4 transition-all duration-300"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Refresh Page
                            </Button>
                            <Button
                              onClick={downloadPDF}
                              variant="outline"
                              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white font-medium rounded-full py-2 px-4 transition-all duration-300"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                          </div>
                        </div>
                      }
                      className={`shadow-2xl overflow-hidden ${
                        viewMode === 'desktop' && pageNumber > 1 
                          ? '' // No rounding for dual-page mode
                          : 'rounded-lg'
                      }`}
                    >
                      {/* Render pages based on mode */}
                      {viewMode === 'desktop' && pageNumber > 1 ? (
                        // Dual-page spread for desktop (except page 1)
                        <div 
                          className="flex" 
                          style={{ 
                            gap: '0px', 
                            margin: '0px', 
                            padding: '0px',
                            alignItems: 'flex-start'
                          }}
                        >
                          <Page
                            pageNumber={pageNumber}
                            scale={scale * 0.8} // Consistent scale with single page
                            rotate={rotation}
                            onLoadSuccess={onPageLoadSuccess}
                            onLoadError={onPageLoadError}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            loading={
                              <div className="flex items-center justify-center py-20 bg-white">
                                <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
                              </div>
                            }
                            className="shadow-lg"
                            style={{ 
                              margin: '0px', 
                              padding: '0px', 
                              border: 'none',
                              borderTopLeftRadius: '8px',
                              borderBottomLeftRadius: '8px',
                              borderTopRightRadius: '0px !important',
                              borderBottomRightRadius: '0px !important',
                              borderRadius: '8px 0px 0px 8px',
                              overflow: 'hidden'
                            }}
                          />
                          {/* Right page (only if exists) */}
                          {pageNumber + 1 <= numPages && (
                            <Page
                              pageNumber={pageNumber + 1}
                              scale={scale * 0.8}
                              rotate={rotation}
                              onLoadSuccess={onPageLoadSuccess}
                              onLoadError={onPageLoadError}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                              loading={
                                <div className="flex items-center justify-center py-20 bg-white">
                                  <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
                                </div>
                              }
                              className="shadow-lg"
                              style={{ 
                                margin: '0px', 
                                padding: '0px', 
                                border: 'none',
                                borderTopLeftRadius: '0px !important',
                                borderBottomLeftRadius: '0px !important',
                                borderTopRightRadius: '8px',
                                borderBottomRightRadius: '8px',
                                borderRadius: '0px 8px 8px 0px',
                                overflow: 'hidden'
                              }}
                            />
                          )}
                        </div>
                      ) : (
                        // Single page mode (page 1 on desktop, or mobile/tablet) - use same scale as dual-page for consistency
                        <Page
                          pageNumber={pageNumber}
                          scale={viewMode === 'desktop' ? scale * 0.8 : scale}
                          rotate={rotation}
                          onLoadSuccess={onPageLoadSuccess}
                          onLoadError={onPageLoadError}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          loading={
                            <div className="flex items-center justify-center py-20 bg-white">
                              <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
                            </div>
                          }
                          className="shadow-lg"
                        />
                      )}
                    </Document>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Controls Footer */}
        {viewMode === 'mobile' && (
          <div className="bg-gray-900/20 backdrop-blur-xl border-t border-gray-800/30 flex-shrink-0">
            <div className="px-6 py-4">
              {numPages ? (
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={previousPage}
                    disabled={pageNumber <= 1}
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full p-3 disabled:opacity-30 transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  
                  <div className="text-center">
                    <div className="text-sm font-light text-white">
                      {viewMode === 'desktop' && pageNumber > 1 && pageNumber + 1 <= numPages
                        ? `Pages ${pageNumber}-${pageNumber + 1} of ${numPages}`
                        : `Page ${pageNumber} of ${numPages}`
                      }
                    </div>
                    <div className="text-xs font-light text-gray-400">
                      {currentMagazine?.subtitle}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextPage}
                    disabled={
                      viewMode === 'desktop' && pageNumber > 1 
                        ? pageNumber + 1 >= numPages 
                        : pageNumber >= numPages
                    }
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full p-3 disabled:opacity-30 transition-all duration-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-sm font-light text-white">
                    {currentMagazine?.title}
                  </div>
                  <div className="text-xs font-light text-gray-400">
                    {currentMagazine?.pages || 'Magazine'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <DialogContent className="bg-gray-900/95 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-light text-center mb-4">
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Navigation</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Previous page</span>
                  <span className="text-gray-400 font-mono">← ↑ PgUp</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Next page</span>
                  <span className="text-gray-400 font-mono">→ ↓ Space PgDn</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">First page</span>
                  <span className="text-gray-400 font-mono">Home</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Last page</span>
                  <span className="text-gray-400 font-mono">End</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">View Controls</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Zoom in</span>
                  <span className="text-gray-400 font-mono">Ctrl +</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Zoom out</span>
                  <span className="text-gray-400 font-mono">Ctrl -</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Reset zoom</span>
                  <span className="text-gray-400 font-mono">Ctrl 0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Rotate page</span>
                  <span className="text-gray-400 font-mono">Ctrl R</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Fullscreen</span>
                  <span className="text-gray-400 font-mono">Ctrl F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Exit fullscreen</span>
                  <span className="text-gray-400 font-mono">Esc</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Magazine;
