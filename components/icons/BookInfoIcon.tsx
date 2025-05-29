
import React from 'react';

interface IconProps {
  className?: string;
}

export const BookInfoIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className || "w-5 h-5"}
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.075 3.31H15.8c.969 0 1.371 1.24.588 1.81l-2.8 2.034 1.076 3.31c.3.921-.755 1.688-1.54 1.195L10 13.411l-2.825 2.034c-.784.563-1.839-.184-1.54-1.195l1.076-3.31-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.726L9.05 2.927z" opacity="0.4" transform="scale(0.4) translate(18 0)" />
    <path
      fillRule="evenodd"
      d="M3 5a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2-1.5A1.5 1.5 0 003.5 5v10A1.5 1.5 0 005 16.5h6A1.5 1.5 0 0012.5 15V5A1.5 1.5 0 0011 3.5H5z"
      clipRule="evenodd"
    />
    <path d="M5.5 6.5A.75.75 0 016.25 7h3.5a.75.75 0 010 1.5h-3.5A.75.75 0 015.5 7.75V6.5zM6.25 10a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" opacity="0.7" />
  </svg>
);
