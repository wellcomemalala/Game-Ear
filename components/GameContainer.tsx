
import React from 'react';
import ScoreDisplay from './ScoreDisplay';
import { UI_TEXT_TH } from '../constants';
import PlayButton from './PlayButton';
import FeedbackMessage from './FeedbackMessage';
import PianoKeyboard from './PianoKeyboard'; // Import PianoKeyboard

interface GameContainerProps {
  title: string;
  difficultyText: string;
  score: number;
  totalQuestions: number;
  currentStreak: number;
  highScore: number;
  onBackToMenu: () => void;
  onPlaySound: () => void;
  isSoundPlayed: boolean;
  showFeedback: boolean;
  isCorrect?: boolean;
  correctAnswerText?: string; // This will be English name
  onNextQuestion: () => void;
  isQuestionAnswered: boolean;
  children: React.ReactNode; // For option buttons
  isSoundPlaying: boolean;
  highlightedNotes: number[]; // MIDI note numbers to highlight
}

const GameContainer: React.FC<GameContainerProps> = ({
  title,
  difficultyText,
  score,
  totalQuestions,
  currentStreak,
  highScore,
  onBackToMenu,
  onPlaySound,
  isSoundPlayed,
  showFeedback,
  isCorrect,
  correctAnswerText,
  onNextQuestion,
  isQuestionAnswered,
  children,
  isSoundPlaying,
  highlightedNotes,
}) => {
  return (
    <div className="bg-card p-4 md:p-6 rounded-xl shadow-2xl w-full flex flex-col space-y-5 min-h-[calc(100vh-10rem)] md:min-h-[calc(100vh-8rem)] justify-between">
      {/* Header */}
      <div className="pb-4 border-b border-borderDefault">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={onBackToMenu}
            className="btn-back"
          >
            &larr; {UI_TEXT_TH.backToMenu}
          </button>
          <h2 className="text-xl md:text-2xl font-bold text-sky-300 text-center px-2 text-outline-black">{title}</h2>
          <ScoreDisplay score={score} totalQuestions={totalQuestions} />
        </div>
        <div className="flex flex-wrap justify-between items-center text-xs sm:text-sm text-sky-200 text-outline-black px-1 gap-x-2 gap-y-1">
          <span>{UI_TEXT_TH.difficulty}: <span className="font-semibold text-white">{difficultyText}</span></span>
          <span>{UI_TEXT_TH.highScore}: <span className="font-semibold text-white">{highScore}</span></span>
          <span>{UI_TEXT_TH.currentStreak}: <span className="font-semibold text-white">{currentStreak}</span></span>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-grow flex flex-col items-center justify-center space-y-4 md:space-y-5 py-3">
        <PlayButton 
            onClick={onPlaySound} 
            isReplay={isSoundPlayed} 
            text={isSoundPlayed ? UI_TEXT_TH.replaySound : UI_TEXT_TH.playPrompt}
            disabled={isSoundPlaying}
        />

        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
            <PianoKeyboard highlightedNotes={highlightedNotes} />
        </div>
        
        <div className="w-full max-w-md">
            {!isSoundPlayed && <p className="text-center text-slate-300 text-outline-black mb-2 text-sm">{UI_TEXT_TH.playPrompt}</p>}
            <p className="text-center text-white font-bold text-outline-black mb-3">{UI_TEXT_TH.selectAnswer}</p>
            <div className={`grid grid-cols-1 ${ children && React.Children.count(children) > 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'} gap-3 md:gap-4`}>
              {children}
            </div>
        </div>
      </div>

      {/* Footer: Feedback and Next Question */}
      <div className="h-24 md:h-28 flex flex-col justify-end items-center space-y-4 pt-4 border-t border-borderDefault">
        {showFeedback && typeof isCorrect === 'boolean' && (
          <FeedbackMessage isCorrect={isCorrect} correctAnswerText={correctAnswerText} />
        )}
        {isQuestionAnswered && (
          <button
            onClick={onNextQuestion}
            className="btn-accent btn-lg"
          >
            {UI_TEXT_TH.nextQuestion} &rarr;
          </button>
        )}
      </div>
    </div>
  );
};

export default GameContainer;
