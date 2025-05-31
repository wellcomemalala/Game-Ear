
import React from 'react';

interface IconProps {
  className?: string;
}

export const ChatBubbleLeftRightIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.68-3.091a5.56 5.56 0 00-1.02.072c-1.136 0-2.1-.847-2.193-1.98a6.685 6.685 0 00-.072-1.02l-3.091 3.68H7.5a2.5 2.5 0 01-2.5-2.5V8.511c.884-.284 1.5-1.128 1.5-2.097V4.286c0-1.136.847-2.1 1.98-2.193.34-.027.68-.052 1.02-.072V.091l3.68 3.091c.34.027.68.052 1.02.072 1.136 0 2.1.847 2.193 1.98.027.34.052.68.072 1.02l3.091-3.68H16.5a2.5 2.5 0 002.5 2.5v4.015zM6.75 10.875a.75.75 0 100-1.5.75.75 0 000 1.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
  </svg>
);

export default ChatBubbleLeftRightIcon;
