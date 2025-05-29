
import React from 'react';

interface IconProps {
  className?: string;
}

export const FoodBowlIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
  >
    <path d="M5.5 12.5c3.422 0 6.211 1.854 7.563 4.495A8.003 8.003 0 0010 2C5.863 2 2.446 4.859 1.534 8.77c1.25-.738 2.705-1.27 4.276-1.27H5.5zm-.25 1.5a.75.75 0 000 1.5h9.5a.75.75 0 000-1.5h-9.5z" />
    <path fillRule="evenodd" d="M1.609 10.03a.75.75 0 01.934-.53l.16.054c1.495.503 3.135.746 4.797.746H12.5A6.003 6.003 0 017.03 16.5H5.5a6.002 6.002 0 01-4.825-2.46.75.75 0 01.934-.91z" clipRule="evenodd" />
  </svg>
);
