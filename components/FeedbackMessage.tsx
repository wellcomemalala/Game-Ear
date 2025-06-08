
import React from 'react';
import { UI_TEXT_TH } from '../constants';
import CorrectIcon from './icons/CorrectIcon';
import IncorrectIcon from './icons/IncorrectIcon';


interface FeedbackMessageProps {
  isCorrect: boolean;
  correctAnswerText?: string;
  reward?: {xp: number, coins: number} | null; // New prop
}

const FeedbackMessage: React.FC<FeedbackMessageProps> = ({ isCorrect, correctAnswerText, reward }) => {
  const bgColor = isCorrect ? 'bg-success' : 'bg-destructive';
  const Icon = isCorrect ? CorrectIcon : IncorrectIcon;

  return (
    <div className={`p-3 md:p-4 rounded-lg text-white ${bgColor} shadow-lg flex items-center space-x-3 w-full max-w-md`}>
      <Icon className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0" />
      <div>
        <p className="text-lg md:text-xl font-semibold">{isCorrect ? UI_TEXT_TH.correct : UI_TEXT_TH.incorrect}</p>
        {!isCorrect && correctAnswerText && (
          <p className="text-sm md:text-md">{UI_TEXT_TH.correctAnswerIs} {correctAnswerText}</p>
        )}
        {isCorrect && reward && (
          <div className="text-xs md:text-sm mt-1 space-y-0.5">
            {reward.xp > 0 && <p className="font-medium text-sky-200 text-outline-black">+{reward.xp} XP</p>}
            {reward.coins > 0 && <p className="font-medium text-amber-200 text-outline-black">+{reward.coins} G-Coins</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackMessage;
