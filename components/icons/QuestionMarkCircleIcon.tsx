
import React from 'react';

interface IconProps {
  className?: string;
  title?: string;
}

export const QuestionMarkCircleIcon: React.FC<IconProps> = ({ className, title }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
    aria-labelledby={title ? "question-title" : undefined}
  >
    {title && <title id="question-title">{title}</title>}
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1.011 1.011 0 01-1.44.868A1 1 0 006.32 8.504 4.014 4.014 0 0110 6.5a1.5 1.5 0 011.5 1.5c0 .448-.183.85-.476 1.152A1 1 0 0010 10.5H9a1 1 0 100 2h1a1 1 0 001-1 1.5 1.5 0 011.5-1.5c.251 0 .493.069.702.193A1 1 0 0015.438 10c.3-.406.462-.889.462-1.41A3.5 3.5 0 0012 5.09V5a1 1 0 10-2 0v.09zM9 15.5a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
  </svg>
);

export default QuestionMarkCircleIcon;
