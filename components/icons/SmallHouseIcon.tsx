
import React from 'react';

interface IconProps {
  className?: string;
}

export const SmallHouseIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path d="M12 3L2 12h3v8h14v-8h3L12 3zm5 15h-3v-4H10v4H7v-6.17l5-4.99 5 4.99V18z"/>
    <path d="M10 10.5h4a.5.5 0 00.5-.5V8H14v1.5h-4V8H9.5v2a.5.5 0 00.5.5z" opacity="0.7"/>
     <path d="M14.5 15.5h-5v-2.5h5v2.5zM10.5 16h3v1.5h-3V16z" opacity="0.5"/>
  </svg>
);
