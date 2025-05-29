
import React from 'react';

interface IconProps {
  className?: string;
}

export const LockOpenIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 01-1.5 0V6.75a3.75 3.75 0 10-7.5 0v3a3 3 0 013 3v6.75a3 3 0 01-3 3H8.25a3 3 0 01-3-3v-6.75a3 3 0 013-3v-3A5.25 5.25 0 0112 1.5c1.5 0 2.873.638 3.841 1.658A5.228 5.228 0 0118 1.5z" />
  </svg>
);
