
import React from 'react';

interface IconProps {
  className?: string;
}

// Icon representing interaction or playing
export const HandSparklesIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
  >
    <path fillRule="evenodd" d="M6.205 3.482C5.491 2.958 4.562 3.356 4.562 4.208v5.584c0 .852.93 1.25 1.643.726l5.584-4.188c.713-.525.315-1.644-.537-1.644H6.205zm6.59 0H7.795a.75.75 0 00-.539 1.284l2.557 2.557A1.25 1.25 0 019.33 8.87l-.259.13a.75.75 0 00-.338 1.014l.26 1.04a.75.75 0 001.013.338l6.312-3.156a.75.75 0 000-1.342l-6.312-3.156a.75.75 0 00-.663 0zM8.902 12.438C9.616 12.962 10.545 12.564 10.545 11.712V6.128c0-.852-.93-1.25-1.643-.726L3.318 9.59c-.713.525-.315 1.644.537 1.644h5.047z" clipRule="evenodd" />
    <path d="M14.5 6.5a1 1 0 00-1.415-1.414l-.292.292a1 1 0 001.414 1.414l.293-.292zM16 9a1 1 0 011-1h.5a1 1 0 110 2H17a1 1 0 01-1-1zm-3.146 3.146a1 1 0 00-1.415 1.414l.292.293a1 1 0 001.414-1.415l-.292-.292zM12.5 15a1 1 0 011-1h.5a1 1 0 110 2H13.5a1 1 0 01-1-1z" />
  </svg>
);
