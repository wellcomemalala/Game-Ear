import React from 'react';
import SpeakerIcon from './icons/SpeakerIcon';
import ReplayIcon from './icons/ReplayIcon';

interface PlayButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isReplay?: boolean;
  text?: string;
}

const PlayButton: React.FC<PlayButtonProps> = ({ onClick, disabled, isReplay = false, text }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-lg font-semibold text-white shadow-lg
        transition-all duration-200 ease-in-out
        flex items-center justify-center space-x-2.5
        bg-gradient-to-br from-primary hover:from-primary-dark to-secondary hover:to-secondary-dark
        disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:from-primary disabled:hover:to-secondary
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary-light
        transform hover:scale-105 active:scale-95
      `}
      aria-label={text || (isReplay ? "Replay sound" : "Play sound")}
    >
      {isReplay ? <ReplayIcon className="w-6 h-6" /> : <SpeakerIcon className="w-7 h-7" />}
      {text && <span className="text-lg">{text}</span>}
    </button>
  );
};

export default PlayButton;