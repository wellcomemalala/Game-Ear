
import React from 'react';

interface IconProps {
  className?: string;
  title?: string; // Added optional title prop
}

export const SparklesIcon: React.FC<IconProps> = ({ className, title }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
    aria-labelledby={title ? "sparkles-title" : undefined}
  >
    {title && <title id="sparkles-title">{title}</title>}
    <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.586l-2.707 2.707a1 1 0 000 1.414L4 11.414V13a1 1 0 001 1h1.586l2.707 2.707a1 1 0 001.414 0L13 14.586V16a1 1 0 001-1v-1.586l2.707-2.707a1 1 0 000-1.414L14.586 7.593V6a1 1 0 00-1-1h-1.586L9.293 2.293a1 1 0 00-1.414 0L5.172 5H4a1 1 0 00-1 1v1.707L.293 10.414a1 1 0 000 1.414l2.414 2.414V16a1 1 0 001 1h1.707l2.707 2.707a1 1 0 001.414 0l2.707-2.707H16a1 1 0 001-1v-1.707l2.707-2.707a1 1 0 000-1.414L17.293 7.593V6a1 1 0 00-1-1h-1.707L11.879 2.293A2.99 2.99 0 0010 2a2.99 2.99 0 00-1.879.293L5.414 5H4a1 1 0 00-1 1V5a1 1 0 001-1zM10 4.5c.205 0 .402.056.578.158L13 6.277V7.5h1.222l1.623 2.377-.94.94L13.5 9.223V8H12V6.5A2.5 2.5 0 009.5 4H8V2.5A2.5 2.5 0 005.5 0 2.5 2.5 0 003 2.5V4h1.5A2.5 2.5 0 007 6.5V8H5.5a2.5 2.5 0 00-2.5 2.5c0 .205.056.402.158.578L4.777 13H6V11.5h1.5A2.5 2.5 0 0010 9V7h1.5a2.5 2.5 0 002.5-2.5c0-.205-.056-.402-.158-.578L11.223 7H10V4.5z" clipRule="evenodd" />
    <path d="M10 12a1 1 0 100-2 1 1 0 000 2zM4 6a1 1 0 100-2 1 1 0 000 2zM16 6a1 1 0 100-2 1 1 0 000 2zM5 15a1 1 0 11-2 0 1 1 0 012 0zM15 15a1 1 0 11-2 0 1 1 0 012 0z" />
  </svg>
);