
import React from 'react';

interface IconProps {
  className?: string;
}

// Placeholder Baby Icon
export const BabyIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
  >
    {/* Simple head */}
    <circle cx="10" cy="7" r="3" />
    {/* Simple body */}
    <path d="M6.5 10.5C6.5 9.67157 7.17157 9 8 9H12C12.8284 9 13.5 9.67157 13.5 10.5V14.5C13.5 15.3284 12.8284 16 12 16H8C7.17157 16 6.5 15.3284 6.5 14.5V10.5Z" />
    {/* Small hands/feet placeholders */}
    <circle cx="5.5" cy="12" r="1" />
    <circle cx="14.5" cy="12" r="1" />
  </svg>
);

export default BabyIcon;