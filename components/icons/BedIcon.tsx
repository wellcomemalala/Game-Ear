
import React from 'react';

interface IconProps {
  className?: string;
}

export const BedIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
    aria-label="Bed Icon"
  >
    {/* Bed Frame */}
    <path d="M2 7C2 6.44772 2.44772 6 3 6H17C17.5523 6 18 6.44772 18 7V13H2V7Z" />
    {/* Mattress/Blanket */}
    <path fillRule="evenodd" d="M2 10H18V13H2V10ZM3 11H17V12H3V11Z" clipRule="evenodd" opacity="0.7" />
    {/* Pillow */}
    <rect x="4" y="7.5" width="5" height="2" rx="1" opacity="0.8"/>
    {/* Legs */}
    <rect x="2.5" y="13" width="1" height="2.5" />
    <rect x="16.5" y="13" width="1" height="2.5" />
  </svg>
);

export default BedIcon;
