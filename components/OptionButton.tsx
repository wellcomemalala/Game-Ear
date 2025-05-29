import React from 'react';

interface OptionButtonProps {
  text: string; // Will be English for musical terms
  onClick: () => void;
  disabled?: boolean;
  isCorrect?: boolean;
  isSelected?: boolean;
  showResult?: boolean;
}

const OptionButton: React.FC<OptionButtonProps> = ({ text, onClick, disabled, isCorrect, isSelected, showResult }) => {
  let buttonClasses = "w-full px-4 py-3 text-lg rounded-lg font-medium transition-all duration-150 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transform active:scale-95 ";

  if (showResult) {
    if (isCorrect) {
      buttonClasses += "bg-success hover:bg-success-dark text-white ring-success-light ";
    } else if (isSelected && !isCorrect) {
      buttonClasses += "bg-destructive hover:bg-destructive-dark text-white ring-destructive-light ";
    } else {
      buttonClasses += "bg-slate-600 hover:bg-slate-500 text-slate-300 ring-slate-400 opacity-70 ";
    }
    buttonClasses += "cursor-default";
  } else {
    buttonClasses += "bg-slate-700 hover:bg-slate-600 text-slate-100 hover:text-white ring-primary-light ";
    if (isSelected && !disabled) {
        buttonClasses += "!bg-primary text-white ring-2 ring-offset-2 ring-offset-slate-800 ring-primary-dark";
    } else if (disabled) {
        buttonClasses += "opacity-60 hover:bg-slate-700 cursor-not-allowed ";
    }
  }


  return (
    <button
      onClick={onClick}
      disabled={disabled || showResult}
      className={buttonClasses}
      aria-pressed={isSelected}
    >
      {text}
    </button>
  );
};

export default OptionButton;