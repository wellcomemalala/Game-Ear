
import React from 'react';

interface IconProps {
  className?: string;
}

// Placeholder Diaper Icon
export const DiaperIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
  >
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v2.28a1.5 1.5 0 000 2.84V16a2 2 0 01-2 2H6a2 2 0 01-2-2V9.12a1.5 1.5 0 000-2.84V4zm2 1.5V5h8v.5a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5zm0 3.62a.5.5 0 01.5-.5h7a.5.5 0 01.5.5v5.76a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5V9.12zM8.5 11a.5.5 0 00-1 0v2a.5.5 0 001 0v-2zm3 0a.5.5 0 00-1 0v2a.5.5 0 001 0v-2z" clipRule="evenodd" />
    <path d="M5.5 4.5a.5.5 0 000 1h9a.5.5 0 000-1h-9z" opacity="0.5" />
  </svg>
);

export default DiaperIcon;