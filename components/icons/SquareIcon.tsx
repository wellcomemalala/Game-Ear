
import React from 'react';

interface IconProps {
  className?: string;
}

export const SquareIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
  >
    <path fillRule="evenodd" d="M4 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H4zm0-1.5A2.5 2.5 0 001.5 4v12A2.5 2.5 0 004 18.5h12A2.5 2.5 0 0018.5 16V4A2.5 2.5 0 0016 1.5H4z" clipRule="evenodd" />
  </svg>
);

export default SquareIcon;
