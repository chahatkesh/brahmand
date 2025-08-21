const SpaceLoader = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative">
        {/* Simple pulsing star */}
        <div className="w-6 h-6 bg-white rounded-full animate-pulse"></div>
        
        {/* Loading Text */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <p className="text-white text-sm font-light tracking-wider animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpaceLoader;
