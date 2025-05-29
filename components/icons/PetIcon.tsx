
import React from 'react';

interface IconProps {
  className?: string;
  style?: React.CSSProperties & { '--pet-collar-color'?: string }; // Allow CSS variable for collar
}

// A simple generic pet icon (e.g., a paw or a happy face)
// The collar is a new rect element that will try to use the CSS variable.
export const PetIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "w-6 h-6"}
    style={style}
  >
    {/* Simple paw print body parts - these remain default currentColor */}
    <path d="M12.5,2C12.5,2,12.2,2.4,11.5,3C10.8,3.6,10.5,4.9,10.5,4.9C10.5,4.9,10.1,5,9.5,5C8.9,5,8.5,4.9,8.5,4.9C8.5,4.9,8.2,3.6,7.5,3C6.8,2.4,6.5,2,6.5,2C6.5,2,5.3,2.9,5.3,4.6C5.3,6.3,6.5,7,6.5,7C6.5,7,6.8,6.6,7.5,6C8.2,5.4,8.5,4.1,8.5,4.1C8.5,4.1,8.9,4,9.5,4C10.1,4,10.5,4.1,10.5,4.1C10.5,4.1,10.8,5.4,11.5,6C12.2,6.6,12.5,7,12.5,7C12.5,7,13.7,6.3,13.7,4.6C13.7,2.9,12.5,2,12.5,2Z" />
    <path d="M6.5,8C6.5,8,6.2,8.4,5.5,9C4.8,9.6,4.5,10.9,4.5,10.9C4.5,10.9,4.1,11,3.5,11C2.9,11,2.5,10.9,2.5,10.9C2.5,10.9,2.2,9.6,1.5,9C0.8,8.4,0.5,8,0.5,8C0.5,8,1.7,8.9,1.7,10.6C1.7,12.3,0.5,13,0.5,13C0.5,13,0.8,12.6,1.5,12C2.2,11.4,2.5,10.1,2.5,10.1C2.5,10.1,2.9,10,3.5,10C4.1,10,4.5,10.1,4.5,10.1C4.5,10.1,4.8,11.4,5.5,12C6.2,12.6,6.5,13,6.5,13C6.5,13,5.3,12.3,5.3,10.6C5.3,8.9,6.5,8,6.5,8Z" transform="translate(3 8)" />
    <path d="M6.5,8C6.5,8,6.2,8.4,5.5,9C4.8,9.6,4.5,10.9,4.5,10.9C4.5,10.9,4.1,11,3.5,11C2.9,11,2.5,10.9,2.5,10.9C2.5,10.9,2.2,9.6,1.5,9C0.8,8.4,0.5,8,0.5,8C0.5,8,1.7,8.9,1.7,10.6C1.7,12.3,0.5,13,0.5,13C0.5,13,0.8,12.6,1.5,12C2.2,11.4,2.5,10.1,2.5,10.1C2.5,10.1,2.9,10,3.5,10C4.1,10,4.5,10.1,4.5,10.1C4.5,10.1,4.8,11.4,5.5,12C6.2,12.6,6.5,13,6.5,13C6.5,13,5.3,12.3,5.3,10.6C5.3,8.9,6.5,8,6.5,8Z" transform="translate(14 8)" />

    {/* Simplified head - remains default currentColor */}
    <path fillRule="evenodd" d="M12 12.5c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z" clipRule="evenodd" transform="translate(0 -4)"/>

    {/* Attempt at a collar: A simple rectangle around the "neck" area.
        Its fill will be determined by the CSS variable '--pet-collar-color' passed via style prop.
        If the variable is not set, it defaults to a transparent or subtle color.
    */}
    <rect
        x="9.5"
        y="12.5" // Positioned around the base of the simplified head
        width="5"
        height="1.5"
        rx="0.5" // Slightly rounded corners
        fill={style?.['--pet-collar-color'] || 'rgba(200,200,200,0.3)'} // Default subtle collar or transparent
        style={{ transition: 'fill 0.3s ease' }}
    />
  </svg>
);
