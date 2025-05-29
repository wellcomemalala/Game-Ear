
import React from 'react';

interface IconProps {
  className?: string;
}

export const MonsterIconPlaceholder: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "w-6 h-6"}
  >
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 1.5a8.25 8.25 0 100 16.5 8.25 8.25 0 000-16.5z"
      clipRule="evenodd"
      opacity="0.3"
    />
    {/* Eyes */}
    <circle cx="9.5" cy="10.5" r="1.25" />
    <circle cx="14.5" cy="10.5" r="1.25" />
    {/* Mouth (simple curve) */}
    <path d="M9 14.5c.5 1 2 1.5 3 1.5s2.5-.5 3-1.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
    {/* Horns / Antennae */}
    <path d="M7.5 6.5S8 4.5 9 4.5s1.5 2 1.5 2" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
    <path d="M16.5 6.5S16 4.5 15 4.5s-1.5 2-1.5 2" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
  </svg>
);
