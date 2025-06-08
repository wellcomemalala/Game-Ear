
import React from 'react';

interface IconProps {
  className?: string;
}

// Placeholder Sick Icon (e.g., a thermometer or a sad face with a bandage)
// This is a simplified representation of a thermometer.
export const SickIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
    aria-label="Sick Child Icon"
  >
    {/* Thermometer body */}
    <path d="M10 2C10.5523 2 11 2.44772 11 3V12.5858L12.7071 10.8787C13.0976 10.4882 13.7308 10.4882 14.1213 10.8787C14.5118 11.2692 14.5118 11.9024 14.1213 12.2929L10.6213 15.7929C10.2308 16.1834 9.59762 16.1834 9.20711 15.7929L5.70711 12.2929C5.31658 11.9024 5.31658 11.2692 5.70711 10.8787C6.09762 10.4882 6.73082 10.4882 7.12132 10.8787L8.82843 12.5858L9 12.4142V3C9 2.44772 9.44772 2 10 2Z" />
    {/* Bulb */}
    <circle cx="10" cy="16" r="2" fill="#EF4444" /> 
  </svg>
);

export default SickIcon;
