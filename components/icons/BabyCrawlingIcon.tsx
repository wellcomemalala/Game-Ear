
import React from 'react';

interface IconProps {
  className?: string;
}

// Placeholder for a crawling baby icon.
// This is a very simplified representation.
export const BabyCrawlingIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
    aria-label="Crawling Baby Icon"
  >
    {/* Head */}
    <circle cx="10" cy="6" r="2.5" />
    {/* Body - simple elongated shape */}
    <path d="M7 8 C6.5 9, 6.5 11, 7 12 L13 12 C13.5 11, 13.5 9, 13 8 Z" />
    {/* Limbs - very abstract */}
    <rect x="5" y="11" width="2" height="3" rx="0.5" transform="rotate(-30 6 12.5)" /> 
    <rect x="13" y="11" width="2" height="3" rx="0.5" transform="rotate(30 14 12.5)" />
    <rect x="6" y="7.5" width="2" height="2.5" rx="0.5" transform="rotate(45 7 8.75)" />
    <rect x="12" y="7.5" width="2" height="2.5" rx="0.5" transform="rotate(-45 13 8.75)" />
  </svg>
);

export default BabyCrawlingIcon;
