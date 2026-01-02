'use client';

import { useState, useEffect } from 'react';

interface FullscreenContainerProps {
  children: React.ReactNode;
  headerContent?: React.ReactNode;
}

export function FullscreenContainer({ children, headerContent }: FullscreenContainerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="relative">
      {/* Header bar - always visible, stays at top in fullscreen */}
      {headerContent && (
        <div className={`sticky top-0 z-50 bg-white border-b border-jackbox-purple/30 shadow-sm px-3 py-1.5 flex items-center justify-between ${isFullscreen ? 'shadow-md' : ''}`}>
          <div className="flex-1 flex items-center justify-between pr-3">
            {headerContent}
          </div>
          <button
            onClick={toggleFullscreen}
            className="px-2 py-1 text-sm bg-jackbox-purple text-white rounded-md hover:bg-jackbox-blue transition-colors focus-visible-ring whitespace-nowrap"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? '⤓' : '⤢'}
          </button>
        </div>
      )}
      
      {/* Content area */}
      <div className={isFullscreen ? 'min-h-[calc(100vh-50px)] bg-white' : ''}>
        {children}
      </div>
    </div>
  );
}

