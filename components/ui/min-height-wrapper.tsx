'use client';

import { useEffect, useState } from 'react';

interface MinHeightWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function MinHeightWrapper({ children, className = '' }: MinHeightWrapperProps) {
  const [minHeight, setMinHeight] = useState('auto');

  useEffect(() => {
    // Set minimum height to prevent layout shifts during navigation
    const updateMinHeight = () => {
      const viewportHeight = window.innerHeight;
      const headerHeight = 64; // Approximate header height
      const footerHeight = 120; // Approximate footer height
      const contentMinHeight = viewportHeight - headerHeight - footerHeight;
      setMinHeight(`${Math.max(contentMinHeight, 400)}px`);
    };

    updateMinHeight();
    window.addEventListener('resize', updateMinHeight);
    
    return () => window.removeEventListener('resize', updateMinHeight);
  }, []);

  return (
    <div 
      className={`w-full ${className}`}
      style={{ minHeight }}
    >
      {children}
    </div>
  );
}
