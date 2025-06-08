
import React from 'react';

interface IconProps {
  className?: string;
}

export const PaintBrushIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
  >
    <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h1a1 1 0 011 1v3.5a1.5 1.5 0 01-3 0V9.5a.5.5 0 00-.5-.5h-1a.5.5 0 00-.5.5v.379a1.5 1.5 0 01-2.996.158L5 6.17V14.5a1.5 1.5 0 01-3 0V4.5A1.5 1.5 0 013.5 3H10v.5z" />
    <path d="M4.5 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
  </svg>
);

export default PaintBrushIcon;
