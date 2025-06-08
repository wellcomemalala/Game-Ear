
import React from 'react';
import ScoreDisplay from './ScoreDisplay';
import { UI_TEXT_TH } from '../constants';
import PlayButton from './PlayButton';
import FeedbackMessage from './FeedbackMessage';
import PianoKeyboard from './PianoKeyboard';

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
  correctAnswerText?: string;
  onNextQuestion: () => void;
  isQuestionAnswered: boolean;
  children: React.ReactNode;
  isSoundPlaying: boolean;
  highlightedNotes: number[];
  onPianoNoteClick?: (midiNote: number) => void; 
  isPianoDisabled?: boolean; 
  customControlsArea?: React.ReactNode; 
  questionPromptTextKey?: keyof typeof UI_TEXT_TH; 
  optionsCount?: number; 
  lastReward?: {xp: number, coins: number} | null; // New prop
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
  onPianoNoteClick, 
  isPianoDisabled, 
  customControlsArea, 
  questionPromptTextKey, 
  optionsCount, 
  lastReward, // New prop
}) => {
  const mainPromptText = questionPromptTextKey ? UI_TEXT_TH[questionPromptTextKey] : UI_TEXT_TH.selectAnswer;
  return (
    <div className="bg-card p-4 md:p-6 rounded-xl shadow-2xl w-full flex flex-col space-y-5 min-h-[calc(100vh-10rem)] md:min-h-[calc(100vh-8rem)] justify-between">
      {/* Header */}
      <div className="pb-4 border-b border-borderDefault">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={onBackToMenu}
            className="btn-back"
            aria-label={UI_TEXT_TH.backToMenu}
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
            <PianoKeyboard
                highlightedNotes={highlightedNotes}
                onNoteClick={onPianoNoteClick}
                disabled={isPianoDisabled}
            />
        </div>

        {!showFeedback && (
          <p className="text-center text-slate-200 text-outline-black mb-3 h-6">
            {isSoundPlayed ? mainPromptText : UI_TEXT_TH.playPrompt}
          </p>
        )}
        
        {showFeedback && typeof isCorrect === 'boolean' && (
           <div className="w-full max-w-md h-18 md:h-20 flex items-center justify-center"> {/* Fixed height for feedback */}
            <FeedbackMessage isCorrect={isCorrect} correctAnswerText={correctAnswerText} reward={lastReward} />
           </div>
        )}
        {!showFeedback && <div className="h-18 md:h-20"></div>} {/* Placeholder to prevent layout shift */}


        {/* Option Buttons or Custom Input Area (Melody Recall) */}
        {!customControlsArea && !showFeedback && (
          <div className={`grid grid-cols-1 ${optionsCount && optionsCount > 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'} gap-3 md:gap-4 w-full max-w-md`}>
            {children}
          </div>
        )}
        {customControlsArea && !showFeedback && (
          <div className="w-full max-w-md">
            {children} {/* This will be the player's input display for Melody Recall */}
            <div className="flex justify-around items-center mt-4 space-x-3">
                {customControlsArea}
            </div>
          </div>
        )}

        {showFeedback && (
          <div className="mt-auto pt-4 w-full max-w-md">
            <button
              onClick={onNextQuestion}
              className="btn-secondary w-full py-3 text-lg"
            >
              {UI_TEXT_TH.nextQuestion} &rarr;
            </button>
          </div>
        )}
         {customControlsArea && showFeedback && (
            <div className="w-full max-w-md">
                 {children} 
                <div className="flex justify-around items-center mt-4 space-x-3">
                    {customControlsArea} 
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default GameContainer;
