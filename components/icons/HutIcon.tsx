
import React from 'react';

interface IconProps {
  className?: string;
}

export const HutIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path d="M12 2.75L2.25 9.167V21h4.5V15h10.5v6h4.5V9.167L12 2.75zM15.75 19.5h-7.5V13.5h7.5v6z" />
    <path fillRule="evenodd" d="M12 1.5l-10.5 7v12h21V8.5L12 1.5zm0 2.126l8.06 5.374V19.5h-3V14.25h-10.5V19.5h-3V8.999L12 3.625zM15 15h-6v3h6v-3z" clipRule="evenodd" opacity="0.6"/>
  </svg>
);
