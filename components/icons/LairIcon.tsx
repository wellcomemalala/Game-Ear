
import React from 'react';

interface IconProps {
  className?: string;
}

export const LairIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "w-6 h-6"}
  >
    {/* Cave opening shape */}
    <path
      fillRule="evenodd"
      d="M12 2.25C6.477 2.25 2 6.727 2 12.25v.5C2 18.321 6.477 22.75 12 22.75s10-4.429 10-9.95v-.55C22 6.727 17.523 2.25 12 2.25zM4.066 12.499c.01.167.02.334.034.501h15.8c.013-.167.024-.334.034-.501C19.888 7.797 16.26 4.25 12 4.25S4.112 7.797 4.066 12.499z"
      clipRule="evenodd"
      opacity="0.7"
    />
    {/* Inner "dark" part of cave */}
    <path d="M12 6C8.686 6 6 8.686 6 12v.5c0 .138.006.275.016.411A6.016 6.016 0 0012 18.5a6.016 6.016 0 005.984-5.589A6.526 6.526 0 0018 12.5V12c0-3.314-2.686-6-6-6z" />
    {/* Some jagged edges for effect */}
    <path d="M10 19s-1-1.5-1-3 1-3 1-3h4s1 1.5 1 3-1 3-1 3h-4z" opacity="0.5" />
    <path d="M7 5l1-1 1 1-1 1zM15 5l1-1 1 1-1 1z" opacity="0.5" />
  </svg>
);
