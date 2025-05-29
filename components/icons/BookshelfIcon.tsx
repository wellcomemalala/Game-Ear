
import React from 'react';

interface IconProps {
  className?: string;
}

export const BookshelfIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
  >
    <path d="M2 3.5A1.5 1.5 0 013.5 2h13A1.5 1.5 0 0118 3.5v13a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 012 16.5v-13zM12 15V5H8v10h4zM16.5 15V5h-2.5v10h2.5zM6 15V5H3.5v10H6z" />
    <rect x="3.5" y="5.5" width="2.5" height="1" opacity="0.7" />
    <rect x="3.5" y="8" width="2.5" height="1" opacity="0.7" />
    <rect x="3.5" y="10.5" width="2.5" height="1" opacity="0.7" />
    <rect x="3.5" y="13" width="2.5" height="1" opacity="0.7" />
    <rect x="7.75" y="5.5" width="4.5" height="1" opacity="0.7" />
    <rect x="7.75" y="8" width="4.5" height="1" opacity="0.7" />
    <rect x="7.75" y="10.5" width="4.5" height="1" opacity="0.7" />
    <rect x="7.75" y="13" width="4.5" height="1" opacity="0.7" />
    <rect x="14" y="5.5" width="2.5" height="1" opacity="0.7" />
    <rect x="14" y="8" width="2.5" height="1" opacity="0.7" />
    <rect x="14" y="10.5" width="2.5" height="1" opacity="0.7" />
    <rect x="14" y="13" width="2.5" height="1" opacity="0.7" />
  </svg>
);
