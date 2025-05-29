
import React from 'react';

interface IconProps {
  className?: string;
}

export const MissionScrollIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className || "w-5 h-5"}
  >
    <path d="M5.5 2A.5.5 0 005 2.5v1A.5.5 0 005.5 4h1.879a.5.5 0 01.353.146l3.5 3.5a.5.5 0 010 .708l-3.5 3.5a.5.5 0 01-.353.146H5.5a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h3.879a2.5 2.5 0 001.768-.732l4.242-4.242a2.5 2.5 0 000-3.536L11.146 2.732A2.5 2.5 0 009.38 2H5.5z" />
    <path fillRule="evenodd" d="M4.5 1A1.5 1.5 0 003 2.5v1A1.5 1.5 0 004.5 5H5V2H4.5zm0 12H5v3H4.5A1.5 1.5 0 013 16.5v-1A1.5 1.5 0 014.5 14zM15 4a1 1 0 011-1h.5a1 1 0 110 2H16a1 1 0 01-1-1zm1 4a1 1 0 100 2h.5a1 1 0 100-2H16zm0 3a1 1 0 100 2h.5a1 1 0 100-2H16z" clipRule="evenodd" />
     <path d="M6 6h2v1H6V6zm0 3h2v1H6V9zm0 3h2v1H6v-1z" opacity="0.7"/>
  </svg>
);
