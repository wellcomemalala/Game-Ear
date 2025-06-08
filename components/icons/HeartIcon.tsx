
import React from 'react';

interface IconProps {
  className?: string;
}

export const HeartIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path 
      fillRule="evenodd" 
      d="M12.75 2.955c1.827-1.09 4.019-.741 5.572.749 1.553 1.49.993 4.135-1.086 6.213L12 15.75l-5.236-5.833c-2.079-2.078-2.639-4.723-1.086-6.213C7.229 2.214 9.421 1.865 11.248 2.955L12 3.513l.752-.558Z" 
      clipRule="evenodd" 
    />
  </svg>
);

export default HeartIcon;
