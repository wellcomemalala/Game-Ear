import React from 'react';

interface IconProps {
  className?: string;
}

const FireIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "w-6 h-6"}
  >
    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.05 8.25 8.25 0 01-1.063 7.557 8.25 8.25 0 01-7.48 5.235.75.75 0 00-.686.945A8.25 8.25 0 0012 21.75a8.25 8.25 0 007.901-9.34.75.75 0 00-.686-.945 8.25 8.25 0 01-7.48-5.235 8.25 8.25 0 01-1.063-7.557.75.75 0 001.071-1.05z" clipRule="evenodd" />
  </svg>
);

export default FireIcon;
