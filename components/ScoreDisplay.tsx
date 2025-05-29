
import React from 'react';
import { UI_TEXT_TH } from '../constants';

interface ScoreDisplayProps {
  score: number;
  totalQuestions: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, totalQuestions }) => {
  return (
    <div className="text-xl font-semibold text-amber-400">
      {UI_TEXT_TH.score} {score} / {totalQuestions}
    </div>
  );
};

export default ScoreDisplay;
