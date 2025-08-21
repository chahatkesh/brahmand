import { useState, useEffect } from 'react';
import SpaceLoader from './SpaceLoader';

const LoadingWrapper = ({ children, delay = 1000 }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <>
      <SpaceLoader isLoading={isLoading} />
      <div className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}>
        {children}
      </div>
    </>
  );
};

export default LoadingWrapper;
