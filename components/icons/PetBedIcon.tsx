
import React from 'react';

interface IconProps {
  className?: string;
}

export const PetBedIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
  >
    <path d="M2.5 10A1.5 1.5 0 001 11.5v2A1.5 1.5 0 002.5 15h15a1.5 1.5 0 001.5-1.5v-2A1.5 1.5 0 0017.5 10h-15z" />
    <path fillRule="evenodd" d="M3.055 7.445A4.002 4.002 0 016.5 4h7a4.002 4.002 0 013.445 3.445A1.992 1.992 0 0018.5 7h-17c.293 0 .57.06.822.166A3.986 3.986 0 013.055 7.445zM6.5 5.5a2.5 2.5 0 00-2.45 2.033A3.486 3.486 0 002.5 7H1.5a2.986 2.986 0 013.001-3H6c-.276 0-.5.224-.5.5zm7 0c0-.276.224-.5.5-.5h1.999A2.986 2.986 0 0118.5 7H17.5a3.486 3.486 0 00-1.55-1.533A2.5 2.5 0 0013.5 5.5z" clipRule="evenodd" opacity="0.7"/>
  </svg>
);
