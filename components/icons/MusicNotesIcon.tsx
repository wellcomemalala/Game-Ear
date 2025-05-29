
import React from 'react';

interface IconProps {
  className?: string;
}

export const MusicNotesIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
  >
    <path d="M7 4a1 1 0 011-1h3a1 1 0 110 2H9.5A1.5 1.5 0 008 6.5V13.5A1.5 1.5 0 009.5 15H11a1 1 0 110 2H9.5A3.5 3.5 0 016 13.5V6.5A3.5 3.5 0 019.5 3H11a1 1 0 110-2H8a1 1 0 01-1-1z" />
    <path d="M14.5 4.75a.75.75 0 00-1.5 0V13a.75.75 0 001.5 0V4.75z" />
    <circle cx="14" cy="14.5" r="1.5" />
  </svg>
);
