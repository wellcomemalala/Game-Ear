
import React from 'react';

interface IconProps {
  className?: string;
}

export const FurnitureIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
  >
    <path d="M3.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0v-3.5h13v3.5a.75.75 0 001.5 0V2.75a.75.75 0 00-1.5 0V6H3.5V2.75zM3.5 8.5h13V12h-13V8.5z" />
    <path fillRule="evenodd" d="M2 7.25V16h16V7.25A1.75 1.75 0 0016.25 5.5H3.75A1.75 1.75 0 002 7.25zM3.5 8.5v3.5h13V8.5H3.5z" clipRule="evenodd" opacity="0.7" />
  </svg>
);
