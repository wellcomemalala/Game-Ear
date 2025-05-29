
import React from 'react';

interface IconProps {
  className?: string;
}

export const MementoIconPlaceholder: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className || "w-5 h-5"}
  >
    <path
      fillRule="evenodd"
      d="M5 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V5a3 3 0 00-3-3H5zm0 1.5a1.5 1.5 0 00-1.5 1.5v10a1.5 1.5 0 001.5 1.5h10a1.5 1.5 0 001.5-1.5V5a1.5 1.5 0 00-1.5-1.5H5z"
      clipRule="evenodd"
      opacity="0.4"
    />
    {/* Inner shape - could be a gem, a fragment, etc. */}
    <path d="M10 6.31L7.823 9.177a.75.75 0 000 1.06L10 13.101l2.177-2.864a.75.75 0 000-1.06L10 6.31zM10 4.5l4.586 3.586a2.25 2.25 0 010 3.182L10 15.5l-4.586-4.232a2.25 2.25 0 010-3.182L10 4.5z" />
  </svg>
);
