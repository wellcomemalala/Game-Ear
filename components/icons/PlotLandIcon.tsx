
import React from 'react';

interface IconProps {
  className?: string;
}

export const PlotLandIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path d="M2.25 8.25h19.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H2.25a.75.75 0 01-.75-.75V9a.75.75 0 01.75-.75zM15 6.75A.75.75 0 0015.75 6h1.5a.75.75 0 000-1.5h-1.5A.75.75 0 0015 6.75zM9.75 6.75a.75.75 0 01-.75-.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM5.25 6A.75.75 0 006 5.25H4.5a.75.75 0 000 1.5H6A.75.75 0 005.25 6z" />
    <path fillRule="evenodd" d="M1.5 9a.75.75 0 01.75-.75h19.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H2.25a.75.75 0 01-.75-.75V9zm1.5 1.5v7.5h16.5v-7.5H3z" clipRule="evenodd" />
     <path d="M7.5 12h1.5v1.5H7.5V12zm3.75 0h1.5v1.5h-1.5V12zm3.75 0h1.5v1.5h-1.5V12z" opacity="0.5" />
  </svg>
);
