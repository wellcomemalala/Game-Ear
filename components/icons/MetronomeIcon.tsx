
import React from 'react';

interface IconProps {
  className?: string;
}

export const MetronomeIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
  >
    <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v14.512A4.505 4.505 0 0110.5 17c-1.32 0-2.517.566-3.352 1.475A.75.75 0 016.39 17.79l-.21.21a.75.75 0 01-1.06-1.06l.21-.21A2.999 2.999 0 017.5 15.5a2.999 2.999 0 012.25-1.004V2.75A.75.75 0 0110 2zM8.466 8.466a.75.75 0 000 1.06l3 3a.75.75 0 001.06-1.06l-3-3a.75.75 0 00-1.06 0z" clipRule="evenodd" />
    <path d="M4.502 15.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.498 15.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
  </svg>
);
