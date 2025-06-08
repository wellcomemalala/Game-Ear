
import React from 'react';

interface IconProps {
  className?: string;
}

export const CakeIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className || "w-5 h-5"}
    aria-label="Cake Icon"
  >
    <path d="M10 3.75a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zM4.192 4.51A.75.75 0 003.5 5.245V6h13V5.245a.75.75 0 00-.692-.736 4.504 4.504 0 00-2.596-1.317 2.75 2.75 0 00-5.424 0 4.503 4.503 0 00-2.596 1.317z" />
    <path
      fillRule="evenodd"
      d="M2 8.25A.75.75 0 012.75 7.5h14.5a.75.75 0 01.75.75v5.5a2.25 2.25 0 01-2.25 2.25H4.25A2.25 2.25 0 012 13.75v-5.5zm1.5 0v5.5a.75.75 0 00.75.75H15.5a.75.75 0 00.75-.75v-5.5H3.5z"
      clipRule="evenodd"
    />
  </svg>
);

export default CakeIcon;
