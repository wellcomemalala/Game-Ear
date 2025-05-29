
import React from 'react';

interface IconProps {
  className?: string;
}

export const PianoIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
  >
    <path d="M2 5.25A2.25 2.25 0 014.25 3h11.5A2.25 2.25 0 0118 5.25v8.5A2.25 2.25 0 0115.75 16H4.25A2.25 2.25 0 012 13.75v-8.5zM4.25 4.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h11.5a.75.75 0 00.75-.75v-8.5a.75.75 0 00-.75-.75H4.25z" />
    <path d="M5.5 10.75v2.5h1V10h-1v.75zm2 0v2.5h1V10h-1v.75zm2 0v2.5h1V10h-1v.75zm2 0v2.5h1V10h-1v.75zm2 0v2.5h1V10h-1v.75z" opacity="0.7" />
    <rect x="5" y="7" width="10" height="2.5" rx="0.5" opacity="0.9" />
  </svg>
);
