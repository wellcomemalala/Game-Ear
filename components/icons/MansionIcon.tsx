
import React from 'react';

interface IconProps {
  className?: string;
}

export const MansionIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path d="M12 2.434L1.5 10.5V22h21V10.5L12 2.434zM7.5 20.5v-6h3v6h-3zm6 0v-9h3v9h-3zm-9-7.5h15v-1.414L12 4.82l-7.5 6.767v1.413z" />
    <path fillRule="evenodd" d="M12 1.5L.75 10.333V22.5h5.25v-6.75h3v6.75h6v-9.75h3V22.5h5.25V10.333L12 1.5zm-4.5 18v-5.25h1.5v5.25h-1.5zm9-9v8.25h-1.5v-8.25h1.5zM3 11.31L12 4l9 7.31V12H3v-.69z" clipRule="evenodd" opacity="0.6"/>
     <rect x="8.25" y="15.25" width="1.5" height="2.25" opacity="0.5" />
     <rect x="14.25" y="12.25" width="1.5" height="2.25" opacity="0.5" />
  </svg>
);
