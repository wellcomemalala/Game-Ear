
import React, { useState, useEffect, useCallback } from 'react';
import { ALL_INTERVALS, EASY_INTERVALS, getRandomRootFrequency, UI_TEXT_TH, shuffleArray, getDifficultyText, frequencyToMidiNote, XP_PER_CORRECT_ANSWER, GCOINS_PER_CORRECT_ANSWER, getAvailableTrainingItems } from '../constants';
import { IntervalInfo, Question, Difficulty, GameMode, PlayerData, AchievementId, UnlockedItemType, InstrumentSoundId } from '../types';
import { AudioService } from '../services/AudioService';
import OptionButton from './OptionButton';
import GameContainer from './GameContainer';

interface IntervalTrainerProps {
  audioService: AudioService;
  onBackToMenu: () => void;
  difficulty: Difficulty;
  playerData: PlayerData;
  addXpAndCoins: (xp: number, coins: number, context: { gameMode: GameMode, currentStreak: number, questionsAnsweredThisMode: number, itemId: string }) => void;
  updateHighestStreak: (streak: number, gameMode: GameMode) => void;
  isMusicalItemUnlocked: (itemId: string, itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD) => boolean;
  selectedInstrumentSoundId: InstrumentSoundId;
  highlightPianoOnPlay: boolean; // New
}

const IntervalTrainer: React.FC<IntervalTrainerProps> = ({ 
    audioService, 
    onBackToMenu, 
    difficulty, 
    playerData, 
    addXpAndCoins, 
    updateHighestStreak, 
    isMusicalItemUnlocked,
    selectedInstrumentSoundId,
    highlightPianoOnPlay, // New
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question<IntervalInfo> | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSoundPlayed, setIsSoundPlayed] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [highlightedNotes, setHighlightedNotes] = useState<number[]>([]);
  
  const getHighScoreKey = useCallback(() => `highScore_${GameMode.INTERVALS}_${difficulty}`, [difficulty]);

  useEffect(() => {
    const storedHighScore = localStorage.getItem(getHighScoreKey());
    if (storedHighScore) setHighScore(parseInt(storedHighScore, 10));
    else setHighScore(0);
  }, [difficulty, getHighScoreKey]);

  const generateQuestion = useCallback(() => {
    const availableIntervals = getAvailableTrainingItems(ALL_INTERVALS, playerData, UnlockedItemType.INTERVAL);
    const questionBank = difficulty === Difficulty.EASY 
        ? EASY_INTERVALS.filter(item => availableIntervals.some(avail => avail.id === item.id)) 
        : availableIntervals;

    const numOptions = difficulty === Difficulty.EASY ? 3 : 4;

    if (questionBank.length === 0) {
        console.error("Interval question bank is empty for difficulty:", difficulty, " (considering unlocked items)");
        onBackToMenu(); 
        return;
    }
    
    const randomItemIndex = Math.floor(Math.random() * questionBank.length);
    const randomItem = questionBank[randomItemIndex];
    
    if (!randomItem) {
        console.error("Could not select a random interval. Index:", randomItemIndex, "Bank:", questionBank);
        return;
    }

    const rootFrequency = getRandomRootFrequency();
    let options = [randomItem];
    const availableOptionsForQuestion = questionBank.filter(opt => opt.id !== randomItem.id); 
    
    while (options.length < Math.min(numOptions, questionBank.length)) {
        if (availableOptionsForQuestion.length === 0) break; 
        const randomOptionIndex = Math.floor(Math.random() * availableOptionsForQuestion.length);
        const randomOption = availableOptionsForQuestion.splice(randomOptionIndex, 1)[0]; 
        if (randomOption && !options.find(opt => opt.id === randomOption.id)) {
            options.push(randomOption);
        }
    }
    options = shuffleArray(options);

    setCurrentQuestion({
      item: randomItem,
      rootFrequency,
      options,
      correctAnswerId: randomItem.id,
    });
    setSelectedAnswerId(null);
    setIsCorrect(null);
    setShowFeedback(false);
    setIsSoundPlayed(false);
    setHighlightedNotes([]);
  }, [difficulty, playerData, isMusicalItemUnlocked, onBackToMenu]);

  useEffect(() => {
    generateQuestion();
  }, [difficulty, generateQuestion]);

  const playCurrentInterval = useCallback(() => {
    if (currentQuestion && audioService) {
      setIsSoundPlaying(true);
      setIsSoundPlayed(true);
      if (highlightPianoOnPlay) {
        const rootMidiNote = frequencyToMidiNote(currentQuestion.rootFrequency);
        const secondMidiNote = rootMidiNote + currentQuestion.item.semitones;
        setHighlightedNotes([rootMidiNote, secondMidiNote]);
      } else {
        setHighlightedNotes([]);
      }
      audioService.playInterval(currentQuestion.rootFrequency, currentQuestion.item.semitones, true, 0.6, selectedInstrumentSoundId);
      const soundDuration = 1400; 
      setTimeout(() => {
        setIsSoundPlaying(false);
        if (highlightPianoOnPlay) setHighlightedNotes([]); // Clear after sound if it was on
      }, soundDuration); 
    }
  }, [currentQuestion, audioService, selectedInstrumentSoundId, highlightPianoOnPlay]);
  
  const handleAnswer = (intervalId: string) => {
    if (!currentQuestion || showFeedback) return;
    setSelectedAnswerId(intervalId);
    const correct = intervalId === currentQuestion.correctAnswerId;
    setIsCorrect(correct);
    setShowFeedback(true);
    setTotalQuestions(prev => prev + 1);
    
    if (correct) {
      const newScore = score + 1;
      setScore(newScore);
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      updateHighestStreak(newStreak, GameMode.INTERVALS);
      
      addXpAndCoins(XP_PER_CORRECT_ANSWER, GCOINS_PER_CORRECT_ANSWER, {
        gameMode: GameMode.INTERVALS,
        currentStreak: newStreak,
        questionsAnsweredThisMode: (playerData.intervalQuestionsAnswered || 0) + 1,
        itemId: currentQuestion.item.id,
      });
      
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem(getHighScoreKey(), newScore.toString());
      }
    } else {
      setCurrentStreak(0);
    }
  };

  const handleNextQuestion = () => generateQuestion();

  if (!currentQuestion || !playerData) {
    return <div className="text-center p-4 text-lg text-slate-100">{UI_TEXT_TH.loading}...</div>;
  }
  
  const correctAnswerText = currentQuestion.options.find(opt => opt.id === currentQuestion.correctAnswerId)?.name;

  return (
    <GameContainer
      title={UI_TEXT_TH.intervalTraining}
      difficultyText={getDifficultyText(difficulty)}
      score={score}
      totalQuestions={totalQuestions}
      currentStreak={currentStreak}
      highScore={highScore}
      onBackToMenu={onBackToMenu}
      onPlaySound={playCurrentInterval}
      isSoundPlayed={isSoundPlayed}
      showFeedback={showFeedback}
      isCorrect={isCorrect ?? undefined}
      correctAnswerText={correctAnswerText}
      onNextQuestion={handleNextQuestion}
      isQuestionAnswered={showFeedback}
      isSoundPlaying={isSoundPlaying}
      highlightedNotes={highlightedNotes} // Already respects highlightPianoOnPlay
    >
      {currentQuestion.options.map(option => (
        <OptionButton
          key={option.id}
          text={option.name} 
          onClick={() => handleAnswer(option.id)}
          disabled={showFeedback || isSoundPlaying || !isSoundPlayed}
          isSelected={selectedAnswerId === option.id}
          isCorrect={option.id === currentQuestion.correctAnswerId}
          showResult={showFeedback}
        />
      ))}
    </GameContainer>
  );
};

export default IntervalTrainer;
