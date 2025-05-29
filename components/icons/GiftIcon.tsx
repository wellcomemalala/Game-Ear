
import React from 'react';

interface IconProps {
  className?: string;
}

export const GiftIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
  >
    <path fillRule="evenodd" d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1h-2.5a.5.5 0 00-.5.5V6H9v-.5a.5.5 0 00-.5-.5H6V4H5zm10 2H5a2 2 0 00-2 2v1a2 2 0 002 2h.093c.032.523.199 1.024.457 1.467l.01.017a3.076 3.076 0 002.906 2.016 3.075 3.075 0 002.907-2.016l.01-.017c.258-.443.425-.944.457-1.467H15a2 2 0 002-2V8a2 2 0 00-2-2zm-8 6.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM13.5 11a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
    <path d="M3 6a2 2 0 012-2h10a2 2 0 012 2v2.586A3.5 3.5 0 0014.5 8H14V7H6v1H5.5a3.5 3.5 0 00-2.414.914L3 8.586V6z" />
  </svg>
);
