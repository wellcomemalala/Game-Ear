
import React from 'react';

interface IconProps {
  className?: string;
}

export const UsersIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-3.741-.479m0 0a3 3 0 00-4.682-2.72m4.682 2.72M3 18.72a9.094 9.094 0 013.741-.479A3 3 0 016 15.473c0-1.007.517-1.903 1.332-2.472M3 18.72C4.21 17.013 6.09 16 8.25 16A4.5 4.5 0 0112.75 20.5M3 18.72V18a6 6 0 012.401-4.91M15 12a3 3 0 11-6 0 3 3 0 016 0zm0 0v1.5a2.5 2.5 0 005 0V12a3 3 0 00-3-3H6a3 3 0 00-3 3v1.5a2.5 2.5 0 005 0V12a3 3 0 00-3-3H6a3 3 0 00-3 3v1.5a2.5 2.5 0 005 0V12z" />
  </svg>
);

export default UsersIcon;
