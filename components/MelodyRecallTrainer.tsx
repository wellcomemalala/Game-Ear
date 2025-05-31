
import React, { useState, useEffect, useCallback } from 'react';
import {
  UI_TEXT_TH,
  XP_PER_CORRECT_ANSWER,
  GCOINS_PER_CORRECT_ANSWER,
  getDifficultyText,
  PIANO_LOWEST_MIDI_NOTE,
  PIANO_HIGHEST_MIDI_NOTE,
  midiNoteToName,
  midiNoteToFrequency, // Import for playing clicked notes
} from '../constants';
import { NoteInfo, Question, Difficulty, GameMode, PlayerData, InstrumentSoundId } from '../types';
import { AudioService } from '../services/AudioService';
import GameContainer from './GameContainer';
import { TrashIcon } from './icons/TrashIcon';
import { CheckIcon } from './icons/CheckIcon';


interface MelodyRecallTrainerProps {
  audioService: AudioService;
  onBackToMenu: () => void;
  difficulty: Difficulty;
  playerData: PlayerData;
  addXpAndCoins: (xp: number, coins: number, context: { gameMode: GameMode, currentStreak: number, questionsAnsweredThisMode: number, itemId: string }) => void;
  updateHighestStreak: (streak: number, gameMode: GameMode) => void;
  selectedInstrumentSoundId: InstrumentSoundId;
  highlightPianoOnPlay: boolean; // New
}

const NOTE_DURATION = 0.5; // seconds
const INTER_NOTE_DELAY = 0.15; // seconds

const MelodyRecallTrainer: React.FC<MelodyRecallTrainerProps> = ({
  audioService,
  onBackToMenu,
  difficulty,
  playerData,
  addXpAndCoins,
  updateHighestStreak,
  selectedInstrumentSoundId,
  highlightPianoOnPlay, // New
}) => {
  const [currentMelody, setCurrentMelody] = useState<NoteInfo[] | null>(null);
  const [playerInputNotes, setPlayerInputNotes] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSoundPlayed, setIsSoundPlayed] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [melodyRecallHighScore, setMelodyRecallHighScore] = useState(0);
  const [highlightedNotesOnPiano, setHighlightedNotesOnPiano] = useState<number[]>([]);

  const getHighScoreKey = useCallback(() => `highScore_${GameMode.MELODY_RECALL}_${difficulty}`, [difficulty]);

  useEffect(() => {
    const storedHighScore = localStorage.getItem(getHighScoreKey());
    setMelodyRecallHighScore(storedHighScore ? parseInt(storedHighScore, 10) : 0);
  }, [difficulty, getHighScoreKey]);

  const getNumberOfNotes = useCallback(() => {
    switch (difficulty) {
      case Difficulty.EASY: return 3;
      case Difficulty.MEDIUM: return 4;
      case Difficulty.HARD: return 5;
      default: return 3;
    }
  }, [difficulty]);

  const generateMelody = useCallback(() => {
    const numNotes = getNumberOfNotes();
    const newMelody: NoteInfo[] = [];
    
    const MIN_ROOT_FOR_MELODY = PIANO_LOWEST_MIDI_NOTE + 4; 
    const MAX_ROOT_FOR_MELODY = PIANO_HIGHEST_MIDI_NOTE - 4; 

    let lastMidiNote = MIN_ROOT_FOR_MELODY + Math.floor(Math.random() * (MAX_ROOT_FOR_MELODY - MIN_ROOT_FOR_MELODY + 1));
    newMelody.push({ midiNote: lastMidiNote, duration: NOTE_DURATION, name: midiNoteToName(lastMidiNote) });

    const maxIntervalStep = difficulty === Difficulty.HARD ? 7 : (difficulty === Difficulty.MEDIUM ? 5 : 4);

    for (let i = 1; i < numNotes; i++) {
      let nextMidiNote;
      let attempts = 0;
      do {
        const intervalDirection = Math.random() < 0.5 ? -1 : 1;
        const intervalSize = 1 + Math.floor(Math.random() * maxIntervalStep); 
        nextMidiNote = lastMidiNote + (intervalDirection * intervalSize);
        attempts++;
      } while ((nextMidiNote < PIANO_LOWEST_MIDI_NOTE || nextMidiNote > PIANO_HIGHEST_MIDI_NOTE) && attempts < 10);

      if (nextMidiNote < PIANO_LOWEST_MIDI_NOTE || nextMidiNote > PIANO_HIGHEST_MIDI_NOTE) {
        if (lastMidiNote + 1 <= PIANO_HIGHEST_MIDI_NOTE) nextMidiNote = lastMidiNote + 1;
        else if (lastMidiNote - 1 >= PIANO_LOWEST_MIDI_NOTE) nextMidiNote = lastMidiNote - 1;
        else nextMidiNote = lastMidiNote; 
      }
      
      newMelody.push({ midiNote: nextMidiNote, duration: NOTE_DURATION, name: midiNoteToName(nextMidiNote) });
      lastMidiNote = nextMidiNote;
    }
    
    setCurrentMelody(newMelody);
    setPlayerInputNotes([]);
    setIsCorrect(null);
    setShowFeedback(false);
    setIsSoundPlayed(false);
    setHighlightedNotesOnPiano([]);
  }, [difficulty, getNumberOfNotes]);

  useEffect(() => {
    generateMelody();
  }, [generateMelody]);

  const playChallengeMelody = useCallback(() => {
    if (currentMelody && audioService) {
      setIsSoundPlaying(true);
      setIsSoundPlayed(true);
      audioService.playMelodySequentially(currentMelody, selectedInstrumentSoundId, INTER_NOTE_DELAY);
      
      if (highlightPianoOnPlay) {
        let accumulatedDelay = 0;
        currentMelody.forEach((note) => {
          setTimeout(() => {
            setHighlightedNotesOnPiano([note.midiNote]);
          }, accumulatedDelay * 1000);
          accumulatedDelay += note.duration + INTER_NOTE_DELAY;
        });
        
        setTimeout(() => {
          setIsSoundPlaying(false);
          setHighlightedNotesOnPiano([]); 
        }, accumulatedDelay * 1000 + 100);
      } else {
        setHighlightedNotesOnPiano([]); // Ensure no highlights if setting is off
        const totalDuration = currentMelody.reduce((sum, note) => sum + note.duration + INTER_NOTE_DELAY, 0);
        setTimeout(() => {
            setIsSoundPlaying(false);
        }, totalDuration * 1000 + 100);
      }
    }
  }, [currentMelody, audioService, selectedInstrumentSoundId, highlightPianoOnPlay]);

  const handlePianoNoteClick = (midiNote: number) => {
    if (showFeedback || isSoundPlaying || !isSoundPlayed) return;
    const maxNotes = getNumberOfNotes();
    if (playerInputNotes.length < maxNotes) {
      setPlayerInputNotes(prev => [...prev, midiNote]);
      audioService.playNote(midiNoteToFrequency(midiNote), 0.3, 0, selectedInstrumentSoundId);
    }
  };
  
  const handleClearInput = () => {
    if (showFeedback) return;
    setPlayerInputNotes([]);
  };

  const handleSubmitAnswer = () => {
    if (!currentMelody || showFeedback || playerInputNotes.length === 0) return;

    const correctMelodyMidi = currentMelody.map(n => n.midiNote);
    const correct = playerInputNotes.length === correctMelodyMidi.length &&
                    playerInputNotes.every((note, index) => note === correctMelodyMidi[index]);
    
    setIsCorrect(correct);
    setShowFeedback(true);
    setTotalQuestions(prev => prev + 1);

    const melodySignature = currentMelody.map(n => n.midiNote).join('-');

    if (correct) {
      const newScore = score + 1;
      setScore(newScore);
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      updateHighestStreak(newStreak, GameMode.MELODY_RECALL);
      
      addXpAndCoins(XP_PER_CORRECT_ANSWER, GCOINS_PER_CORRECT_ANSWER, {
        gameMode: GameMode.MELODY_RECALL,
        currentStreak: newStreak,
        questionsAnsweredThisMode: (playerData.melodyRecallQuestionsAnswered || 0) + 1,
        itemId: melodySignature, 
      });
      
      if (newScore > melodyRecallHighScore) {
        setMelodyRecallHighScore(newScore);
        localStorage.setItem(getHighScoreKey(), newScore.toString());
      }
    } else {
      setCurrentStreak(0);
       if (highlightPianoOnPlay) { // Show correct notes on piano if incorrect and highlight is on
        setHighlightedNotesOnPiano(correctMelodyMidi);
      }
    }
  };

  const handleNextQuestion = () => {
    generateMelody();
    if (highlightPianoOnPlay && !isCorrect) { // Clear highlights from previous incorrect answer
        setHighlightedNotesOnPiano([]);
    }
  };

  if (!currentMelody || !playerData) {
    return <div className="text-center p-4 text-lg text-slate-100">{UI_TEXT_TH.loading}...</div>;
  }
  
  const correctAnswerText = showFeedback && !isCorrect ? currentMelody.map(n => n.name).join(', ') : undefined;

  const customControls = (
    <>
      <button onClick={handleClearInput} className="btn-neutral px-5 py-2.5" disabled={showFeedback || playerInputNotes.length === 0}>
        <TrashIcon className="w-5 h-5 mr-1.5" /> {UI_TEXT_TH.clearInput}
      </button>
      <button onClick={handleSubmitAnswer} className="btn-primary px-5 py-2.5" disabled={showFeedback || playerInputNotes.length === 0 || playerInputNotes.length !== getNumberOfNotes()}>
         <CheckIcon className="w-5 h-5 mr-1.5" /> {UI_TEXT_TH.submitAnswer}
      </button>
    </>
  );
  
  const playerInputDisplay = playerInputNotes.length > 0 
    ? playerInputNotes.map(midi => midiNoteToName(midi)).join(', ')
    : "กดโน้ตบนเปียโน...";

  return (
    <GameContainer
      title={UI_TEXT_TH.melodyRecallTraining}
      difficultyText={getDifficultyText(difficulty, GameMode.MELODY_RECALL)}
      score={score}
      totalQuestions={totalQuestions}
      currentStreak={currentStreak}
      highScore={melodyRecallHighScore}
      onBackToMenu={onBackToMenu}
      onPlaySound={playChallengeMelody}
      isSoundPlayed={isSoundPlayed}
      showFeedback={showFeedback}
      isCorrect={isCorrect ?? undefined}
      correctAnswerText={correctAnswerText}
      onNextQuestion={handleNextQuestion}
      isQuestionAnswered={showFeedback}
      isSoundPlaying={isSoundPlaying}
      highlightedNotes={highlightedNotesOnPiano} // This already respects highlightPianoOnPlay
      onPianoNoteClick={handlePianoNoteClick}
      isPianoDisabled={isSoundPlaying || showFeedback || !isSoundPlayed}
      customControlsArea={customControls}
      questionPromptTextKey={'notesPlayedPrompt'}
    >
      <div className="text-center p-2 bg-slate-700/50 rounded-md shadow min-h-[48px] flex items-center justify-center">
        <p className="text-sm text-slate-100 text-outline-black">
          {UI_TEXT_TH.notesYouPlayed} <span className="font-semibold text-white">{playerInputDisplay}</span>
        </p>
      </div>
    </GameContainer>
  );
};

export default MelodyRecallTrainer;
