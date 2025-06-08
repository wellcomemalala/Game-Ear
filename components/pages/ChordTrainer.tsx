
import React, { useState, useEffect, useCallback } from 'react';
import { ALL_CHORDS, EASY_CHORDS, getRandomRootFrequency, UI_TEXT_TH, shuffleArray, getDifficultyText, frequencyToMidiNote, XP_PER_CORRECT_ANSWER, GCOINS_PER_CORRECT_ANSWER, getAvailableTrainingItems } from '../../constants';
import { ChordInfo, Question, Difficulty, GameMode, PlayerData, AchievementId, UnlockedItemType, InstrumentSoundId } from '../../types';
import { AudioService } from '../../services/AudioService';
import OptionButton from '../OptionButton';
import GameContainer from '../GameContainer';

interface ChordTrainerProps {
  audioService: AudioService;
  onBackToMenu: () => void;
  difficulty: Difficulty;
  playerData: PlayerData;
  addXpAndCoins: (xp: number, coins: number, context: { gameMode: GameMode, currentStreak: number, questionsAnsweredThisMode: number, itemId: string }) => { finalXp: number, finalCoins: number };
  updateHighestStreak: (streak: number, gameMode: GameMode) => void;
  isMusicalItemUnlocked: (itemId: string, itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD) => boolean;
  selectedInstrumentSoundId: InstrumentSoundId;
  highlightPianoOnPlay: boolean;
}

const ChordTrainer: React.FC<ChordTrainerProps> = ({
    audioService,
    onBackToMenu,
    difficulty,
    playerData,
    addXpAndCoins,
    updateHighestStreak,
    isMusicalItemUnlocked,
    selectedInstrumentSoundId,
    highlightPianoOnPlay,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question<ChordInfo> | null>(null);
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
  const [lastReward, setLastReward] = useState<{xp: number, coins: number} | null>(null);

  const getHighScoreKey = useCallback(() => `highScore_${GameMode.CHORDS}_${difficulty}`, [difficulty]);

  useEffect(() => {
    const storedHighScore = localStorage.getItem(getHighScoreKey());
    if (storedHighScore) setHighScore(parseInt(storedHighScore, 10));
    else setHighScore(0);
  }, [difficulty, getHighScoreKey]);

  const generateQuestion = useCallback(() => {
    const availableChords = getAvailableTrainingItems(ALL_CHORDS, playerData, UnlockedItemType.CHORD);
    const questionBank = difficulty === Difficulty.EASY
        ? EASY_CHORDS.filter(item => availableChords.some(avail => avail.id === item.id))
        : availableChords;

    const numOptions = difficulty === Difficulty.EASY ? 3 : 4;

    if (questionBank.length === 0) {
        console.error("Chord question bank is empty for difficulty:", difficulty, " (considering unlocked items)");
        onBackToMenu();
        return;
    }

    const randomItemIndex = Math.floor(Math.random() * questionBank.length);
    const randomItem = questionBank[randomItemIndex];

    if (!randomItem) {
        console.error("Could not select a random chord. Index:", randomItemIndex, "Bank:", questionBank);
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
    setLastReward(null);
  }, [difficulty, playerData, isMusicalItemUnlocked, onBackToMenu]);

  useEffect(() => {
    generateQuestion();
  }, [difficulty]); // Removed generateQuestion

  const playCurrentChord = useCallback(() => {
    if (currentQuestion && audioService) {
      setIsSoundPlaying(true);
      setIsSoundPlayed(true);
      if (highlightPianoOnPlay) {
        const rootMidiNote = frequencyToMidiNote(currentQuestion.rootFrequency);
        const chordMidiNotes = currentQuestion.item.semitones.map(offset => rootMidiNote + offset);
        setHighlightedNotes(chordMidiNotes);
      } else {
        setHighlightedNotes([]);
      }
      audioService.playChord(currentQuestion.rootFrequency, currentQuestion.item.semitones, 1.5, selectedInstrumentSoundId);
      const soundDuration = 1600;
      setTimeout(() => {
        setIsSoundPlaying(false);
        if (highlightPianoOnPlay) setHighlightedNotes([]);
      }, soundDuration);
    }
  }, [currentQuestion, audioService, selectedInstrumentSoundId, highlightPianoOnPlay]);

  const handleAnswer = (chordId: string) => {
    if (!currentQuestion || showFeedback) return;
    setSelectedAnswerId(chordId);
    const correct = chordId === currentQuestion.correctAnswerId;
    setIsCorrect(correct);
    setShowFeedback(true);
    setTotalQuestions(prev => prev + 1);

    if (correct) {
      const newScore = score + 1;
      setScore(newScore);
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      updateHighestStreak(newStreak, GameMode.CHORDS);

      const reward = addXpAndCoins(XP_PER_CORRECT_ANSWER, GCOINS_PER_CORRECT_ANSWER, {
        gameMode: GameMode.CHORDS,
        currentStreak: newStreak,
        questionsAnsweredThisMode: (playerData.chordQuestionsAnswered || 0) + 1,
        itemId: currentQuestion.item.id,
      });
      setLastReward({ xp: reward.finalXp, coins: reward.finalCoins });

      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem(getHighScoreKey(), newScore.toString());
      }
    } else {
      setCurrentStreak(0);
      setLastReward(null);
    }
  };

  const handleNextQuestion = () => generateQuestion();

  if (!currentQuestion || !playerData) {
    return <div className="text-center p-4 text-lg text-slate-100">{UI_TEXT_TH.loading}...</div>;
  }

  const correctAnswerText = currentQuestion.options.find(opt => opt.id === currentQuestion.correctAnswerId)?.name;

  return (
    <GameContainer
      title={UI_TEXT_TH.chordTraining}
      difficultyText={getDifficultyText(difficulty)}
      score={score}
      totalQuestions={totalQuestions}
      currentStreak={currentStreak}
      highScore={highScore}
      onBackToMenu={onBackToMenu}
      onPlaySound={playCurrentChord}
      isSoundPlayed={isSoundPlayed}
      showFeedback={showFeedback}
      isCorrect={isCorrect ?? undefined}
      correctAnswerText={correctAnswerText}
      onNextQuestion={handleNextQuestion}
      isQuestionAnswered={showFeedback}
      isSoundPlaying={isSoundPlaying}
      highlightedNotes={highlightedNotes}
      optionsCount={currentQuestion.options.length}
      lastReward={lastReward}
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

export default ChordTrainer;
