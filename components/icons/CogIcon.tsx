
import React from 'react';

interface IconProps {
  className?: string;
}

export const CogIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m1.5 0H21m-1.5 0H18m2.25-4.5a3 3 0 100-6 3 3 0 000 6zM19.5 12a3 3 0 11-6 0 3 3 0 016 0zM6.75 16.5a3 3 0 100-6 3 3 0 000 6z" />
  </svg>
);
