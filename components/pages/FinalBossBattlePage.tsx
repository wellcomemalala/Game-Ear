import React, { useState, useEffect, useCallback } from 'react';
import { PlayerData, Question, IntervalInfo, ChordInfo, NoteInfo, GameMode, Difficulty, InstrumentSoundId, NotificationMessage, UnlockedItemType, ThaiUIText } from '../../types';
import {
    UI_TEXT_TH, ALL_INTERVALS, ALL_CHORDS, getRandomRootFrequency, shuffleArray, getDifficultyText,
    frequencyToMidiNote, midiNoteToName, midiNoteToFrequency, getAvailableTrainingItems,
    ACTUAL_PIANO_LOWEST_MIDI_NOTE, ACTUAL_PIANO_HIGHEST_MIDI_NOTE,
    FINAL_BOSS_INTERVAL_QUESTIONS, FINAL_BOSS_INTERVAL_MISTAKES_ALLOWED,
    FINAL_BOSS_CHORD_QUESTIONS, FINAL_BOSS_CHORD_MISTAKES_ALLOWED,
    FINAL_BOSS_MELODY_QUESTIONS, FINAL_BOSS_MELODY_MISTAKES_ALLOWED
} from '../../constants';
import { AudioService } from '../../services/AudioService';
import GameContainer from '../GameContainer';
import OptionButton from '../OptionButton';
import PianoKeyboard from '../PianoKeyboard';
import PlayButton from '../PlayButton';
import FeedbackMessage from '../FeedbackMessage';
import { MonsterIconPlaceholder } from '../icons/MonsterIconPlaceholder';
import { TrashIcon } from '../icons/TrashIcon';
import { CheckIcon } from '../icons/CheckIcon';

interface FinalBossBattlePageProps {
  audioService: AudioService;
  playerData: PlayerData;
  onBattleEnd: (victory: boolean) => void;
  selectedInstrumentSoundId: InstrumentSoundId;
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  isMusicalItemUnlocked: (itemId: string, itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD) => boolean;
  highlightPianoOnPlay: boolean;
}

const FinalBossBattlePage: React.FC<FinalBossBattlePageProps> = ({
  audioService,
  playerData,
  onBattleEnd,
  selectedInstrumentSoundId,
  addNotification,
  isMusicalItemUnlocked,
  highlightPianoOnPlay,
}) => {
  const [currentPhase, setCurrentPhase] = useState<GameMode>(GameMode.INTERVALS);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [mistakesMade, setMistakesMade] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question<IntervalInfo | ChordInfo> | NoteInfo[] | null>(null);
  const [playerInputNotes, setPlayerInputNotes] = useState<number[]>([]); // For Melody Recall

  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null); // For Interval/Chord
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSoundPlayed, setIsSoundPlayed] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [highlightedNotes, setHighlightedNotes] = useState<number[]>([]);
  const [lastReward, setLastReward] = useState<{xp: number, coins: number} | null>(null);


  const maxQuestions = currentPhase === GameMode.INTERVALS ? FINAL_BOSS_INTERVAL_QUESTIONS :
                       currentPhase === GameMode.CHORDS ? FINAL_BOSS_CHORD_QUESTIONS : FINAL_BOSS_MELODY_QUESTIONS;
  const maxMistakes = currentPhase === GameMode.INTERVALS ? FINAL_BOSS_INTERVAL_MISTAKES_ALLOWED :
                      currentPhase === GameMode.CHORDS ? FINAL_BOSS_CHORD_MISTAKES_ALLOWED : FINAL_BOSS_MELODY_MISTAKES_ALLOWED;

  const generateQuestionForPhase = useCallback(() => {
    setSelectedAnswerId(null);
    setPlayerInputNotes([]);
    setIsCorrect(null);
    setShowFeedback(false);
    setIsSoundPlayed(false);
    setHighlightedNotes([]);
    setLastReward(null);

    let items: (IntervalInfo[] | ChordInfo[]);
    let specificItemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD;

    switch (currentPhase) {
      case GameMode.INTERVALS:
        items = ALL_INTERVALS.filter(i => !i.isAdvanced || isMusicalItemUnlocked(i.id, UnlockedItemType.INTERVAL));
        specificItemType = UnlockedItemType.INTERVAL;
        if (items.length === 0) items = ALL_INTERVALS; // Fallback
        const interval = items[Math.floor(Math.random() * items.length)] as IntervalInfo;
        setCurrentQuestion({
          item: interval,
          rootFrequency: getRandomRootFrequency(),
          options: shuffleArray(items.filter(i => i.id !== interval.id).slice(0, 3).concat(interval)) as IntervalInfo[],
          correctAnswerId: interval.id,
        });
        break;
      case GameMode.CHORDS:
        items = ALL_CHORDS.filter(c => !c.isAdvanced || isMusicalItemUnlocked(c.id, UnlockedItemType.CHORD));
        specificItemType = UnlockedItemType.CHORD;
        if (items.length === 0) items = ALL_CHORDS; // Fallback
        const chord = items[Math.floor(Math.random() * items.length)] as ChordInfo;
        setCurrentQuestion({
          item: chord,
          rootFrequency: getRandomRootFrequency(),
          options: shuffleArray(items.filter(c => c.id !== chord.id).slice(0, 3).concat(chord)) as ChordInfo[],
          correctAnswerId: chord.id,
        });
        break;
      case GameMode.MELODY_RECALL:
        const numNotes = 5; // Fixed number of notes for boss melody
        const newMelody: NoteInfo[] = [];
        let lastMidiNote = ACTUAL_PIANO_LOWEST_MIDI_NOTE + 12 + Math.floor(Math.random() * 12); // C5 to B5 range for start
        for (let i = 0; i < numNotes; i++) {
            newMelody.push({ midiNote: lastMidiNote, duration: 0.4, name: midiNoteToName(lastMidiNote) });
            let nextMidiNote;
            do {
                const intervalDirection = Math.random() < 0.5 ? -1 : 1;
                const intervalSize = 1 + Math.floor(Math.random() * 7); // Up to P5
                nextMidiNote = lastMidiNote + (intervalDirection * intervalSize);
            } while (nextMidiNote < ACTUAL_PIANO_LOWEST_MIDI_NOTE || nextMidiNote > ACTUAL_PIANO_HIGHEST_MIDI_NOTE);
            lastMidiNote = nextMidiNote;
        }
        setCurrentQuestion(newMelody);
        break;
    }
  }, [currentPhase, isMusicalItemUnlocked]);

  useEffect(() => {
    generateQuestionForPhase();
  }, [generateQuestionForPhase]);

  const playCurrentSound = useCallback(() => {
    if (!currentQuestion || isSoundPlaying) return;
    setIsSoundPlaying(true);
    setIsSoundPlayed(true);

    if (Array.isArray(currentQuestion)) { // Melody Recall
        audioService.playMelodySequentially(currentQuestion, selectedInstrumentSoundId, 0.15);
        if(highlightPianoOnPlay) {
            let accumulatedDelay = 0;
            currentQuestion.forEach(note => {
                setTimeout(() => setHighlightedNotes([note.midiNote]), accumulatedDelay * 1000);
                accumulatedDelay += note.duration + 0.15;
            });
            setTimeout(() => { setIsSoundPlaying(false); setHighlightedNotes([]); }, accumulatedDelay * 1000 + 100);
        } else {
            const totalDuration = currentQuestion.reduce((sum, note) => sum + note.duration + 0.15, 0);
            setTimeout(() => setIsSoundPlaying(false), totalDuration * 1000 + 100);
        }
    } else { // Interval or Chord
        const questionDetail = currentQuestion as Question<IntervalInfo | ChordInfo>;
        const rootMidi = frequencyToMidiNote(questionDetail.rootFrequency);
        if ((questionDetail.item as IntervalInfo).semitones !== undefined && !Array.isArray((questionDetail.item as IntervalInfo).semitones) ) { // Interval
            const item = questionDetail.item as IntervalInfo;
            if(highlightPianoOnPlay) setHighlightedNotes([rootMidi, rootMidi + item.semitones]);
            audioService.playInterval(questionDetail.rootFrequency, item.semitones, true, 0.6, selectedInstrumentSoundId);
            setTimeout(() => { setIsSoundPlaying(false); if(highlightPianoOnPlay) setHighlightedNotes([]); }, 1400);
        } else { // Chord
            const item = questionDetail.item as ChordInfo;
            if(highlightPianoOnPlay) setHighlightedNotes(item.semitones.map(s => rootMidi + s));
            audioService.playChord(questionDetail.rootFrequency, item.semitones, 1.5, selectedInstrumentSoundId);
            setTimeout(() => { setIsSoundPlaying(false); if(highlightPianoOnPlay) setHighlightedNotes([]); }, 1600);
        }
    }
  }, [currentQuestion, audioService, selectedInstrumentSoundId, highlightPianoOnPlay]);

  const handleAnswer = (answerIdOrMidiNote: string | number) => {
    if (showFeedback || isSoundPlaying || !isSoundPlayed) return;

    let correct = false;
    if (currentPhase === GameMode.MELODY_RECALL) {
        // Melody recall answer submission is handled by handleSubmitMelodyAnswer
        audioService.playNote(midiNoteToFrequency(answerIdOrMidiNote as number), 0.3, 0, selectedInstrumentSoundId);
        setPlayerInputNotes(prev => [...prev, answerIdOrMidiNote as number]);
        return; // Don't set feedback yet
    } else {
        setSelectedAnswerId(answerIdOrMidiNote as string);
        correct = (currentQuestion as Question<IntervalInfo | ChordInfo>).correctAnswerId === answerIdOrMidiNote;
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    if (!correct) {
      setMistakesMade(prev => prev + 1);
      if (mistakesMade + 1 >= maxMistakes) {
        onBattleEnd(false);
      }
    }
  };

  const handleSubmitMelodyAnswer = () => {
    if (!Array.isArray(currentQuestion) || playerInputNotes.length !== currentQuestion.length) return;
    const correct = playerInputNotes.every((note, index) => note === (currentQuestion as NoteInfo[])[index].midiNote);
    setIsCorrect(correct);
    setShowFeedback(true);
    if (!correct) {
      setMistakesMade(prev => prev + 1);
      if (mistakesMade + 1 >= maxMistakes) {
        onBattleEnd(false);
      }
       if (highlightPianoOnPlay && Array.isArray(currentQuestion)) {
         setHighlightedNotes(currentQuestion.map(n => n.midiNote));
       }
    }
  };

  const handleNextQuestion = () => {
    if (mistakesMade >= maxMistakes) {
      onBattleEnd(false);
      return;
    }
    setQuestionsAnswered(prev => prev + 1);
    if (questionsAnswered + 1 >= maxQuestions) {
      // Move to next phase or victory
      if (currentPhase === GameMode.INTERVALS) setCurrentPhase(GameMode.CHORDS);
      else if (currentPhase === GameMode.CHORDS) setCurrentPhase(GameMode.MELODY_RECALL);
      else { // Victory
        onBattleEnd(true);
        return;
      }
      setQuestionsAnswered(0);
      setMistakesMade(0);
    }
    generateQuestionForPhase();
  };

  if (!currentQuestion) {
    return <div className="text-center p-4">{UI_TEXT_TH.loading}...</div>;
  }
  
  const phaseTitle = currentPhase === GameMode.INTERVALS ? UI_TEXT_TH.finalBoss_Stage1_Title :
                     currentPhase === GameMode.CHORDS ? UI_TEXT_TH.finalBoss_Stage2_Title :
                     UI_TEXT_TH.finalBoss_Stage3_Title;

  const customControlsMelody = currentPhase === GameMode.MELODY_RECALL ? (
    <>
      <button onClick={() => setPlayerInputNotes([])} className="btn-neutral px-5 py-2.5" disabled={showFeedback || playerInputNotes.length === 0}>
        <TrashIcon className="w-5 h-5 mr-1.5" /> {UI_TEXT_TH.clearInput}
      </button>
      <button onClick={handleSubmitMelodyAnswer} className="btn-primary px-5 py-2.5" disabled={showFeedback || playerInputNotes.length === 0 || playerInputNotes.length !== (Array.isArray(currentQuestion) ? currentQuestion.length : 0) }>
         <CheckIcon className="w-5 h-5 mr-1.5" /> {UI_TEXT_TH.submitAnswer}
      </button>
    </>
  ) : null;

  const playerInputDisplayMelody = currentPhase === GameMode.MELODY_RECALL ? (
      <div className="text-center p-2 bg-slate-700/50 rounded-md shadow min-h-[48px] flex items-center justify-center">
        <p className="text-sm text-slate-100 text-outline-black">
          {UI_TEXT_TH.notesYouPlayed} <span className="font-semibold text-white">{playerInputNotes.map(midi => midiNoteToName(midi)).join(', ')}</span>
        </p>
      </div>
  ) : null;


  return (
    <GameContainer
      title={`${UI_TEXT_TH.finalBoss_Title} - ${phaseTitle}`}
      difficultyText={`${UI_TEXT_TH.finalBoss_StagePrefix} ${currentPhase === GameMode.INTERVALS ? 1 : currentPhase === GameMode.CHORDS ? 2 : 3}/3`}
      score={questionsAnswered}
      totalQuestions={maxQuestions}
      currentStreak={0} // Streak not relevant for boss
      highScore={0} // High score not relevant for boss
      onBackToMenu={() => onBattleEnd(false)} // Exiting boss means defeat for now
      onPlaySound={playCurrentSound}
      isSoundPlayed={isSoundPlayed}
      showFeedback={showFeedback}
      isCorrect={isCorrect ?? undefined}
      correctAnswerText={!isCorrect && !Array.isArray(currentQuestion) ? (currentQuestion as Question<IntervalInfo|ChordInfo>).options.find(o => o.id === (currentQuestion as Question<IntervalInfo|ChordInfo>).correctAnswerId)?.name : 
                           !isCorrect && Array.isArray(currentQuestion) ? currentQuestion.map(n=>n.name).join(', ') : undefined }
      onNextQuestion={handleNextQuestion}
      isQuestionAnswered={showFeedback}
      isSoundPlaying={isSoundPlaying}
      highlightedNotes={highlightedNotes}
      onPianoNoteClick={currentPhase === GameMode.MELODY_RECALL ? (midiNote) => handleAnswer(midiNote) : undefined}
      isPianoDisabled={isSoundPlaying || showFeedback || !isSoundPlayed}
      customControlsArea={customControlsMelody}
      optionsCount={Array.isArray(currentQuestion) ? 0 : (currentQuestion as Question<IntervalInfo|ChordInfo>).options.length}
      lastReward={null}
    >
        <div className="text-center text-sm text-red-400 font-semibold mb-2">
            {UI_TEXT_TH.finalBoss_LivesRemaining.replace('{count}', (maxMistakes - mistakesMade).toString())}
        </div>
        {currentPhase !== GameMode.MELODY_RECALL && !Array.isArray(currentQuestion) && (currentQuestion as Question<IntervalInfo|ChordInfo>).options.map(option => (
            <OptionButton
            key={option.id}
            text={option.name}
            onClick={() => handleAnswer(option.id)}
            disabled={showFeedback || isSoundPlaying || !isSoundPlayed}
            isSelected={selectedAnswerId === option.id}
            isCorrect={option.id === (currentQuestion as Question<IntervalInfo|ChordInfo>).correctAnswerId}
            showResult={showFeedback}
            />
        ))}
        {currentPhase === GameMode.MELODY_RECALL && playerInputDisplayMelody}
    </GameContainer>
  );
};
export default FinalBossBattlePage;
