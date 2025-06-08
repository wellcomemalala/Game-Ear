
import React, { useState, useEffect, useCallback } from 'react';
import {
  MonsterId, PlayerData, MonsterDefinition, MonsterStage, Question, IntervalInfo, ChordInfo,
  Difficulty, GameMode, InstrumentSoundId, NotificationMessage, UnlockedItemType, ThaiUIText, QuestItemId
} from '../../types';
import {
  UI_TEXT_TH, ALL_INTERVALS, ALL_CHORDS, getRandomRootFrequency, shuffleArray, getDifficultyText,
  frequencyToMidiNote, getMonsterDefinition, getAvailableTrainingItems, EASY_INTERVALS, EASY_CHORDS, MEDIUM_INTERVALS, MEDIUM_CHORDS, ALL_MEMENTOS
} from '../../constants';
import { AudioService } from '../../services/AudioService';
import OptionButton from '../OptionButton';
import PlayButton from '../PlayButton';
import FeedbackMessage from '../FeedbackMessage';
import PianoKeyboard from '../PianoKeyboard';
import { MonsterIconPlaceholder } from '../icons/MonsterIconPlaceholder';


interface MonsterBattlePageProps {
  audioService: AudioService;
  monsterId: MonsterId;
  playerData: PlayerData;
  recordMonsterDefeat: (monsterId: MonsterId) => void; 
  onBattleEnd: () => void;
  selectedInstrumentSoundId: InstrumentSoundId;
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  isMusicalItemUnlocked: (itemId: string, itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD) => boolean;
  collectQuestItem: (itemId: string | QuestItemId, quantity?: number) => void;
}

const MonsterBattlePage: React.FC<MonsterBattlePageProps> = ({
  audioService,
  monsterId,
  playerData,
  recordMonsterDefeat, // This is monsterSystem.recordMonsterDefeat
  onBattleEnd,
  selectedInstrumentSoundId,
  addNotification,
  isMusicalItemUnlocked,
  collectQuestItem,
}) => {
  const [monsterDef, setMonsterDef] = useState<MonsterDefinition | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question<IntervalInfo | ChordInfo> | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSoundPlayed, setIsSoundPlayed] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [battleOutcome, setBattleOutcome] = useState<'victory' | 'defeat' | null>(null);
  const [highlightedNotes, setHighlightedNotes] = useState<number[]>([]);

  useEffect(() => {
    const definition = getMonsterDefinition(monsterId);
    if (definition) {
      setMonsterDef(definition);
    } else {
      console.error("Monster definition not found for ID:", monsterId);
      onBattleEnd(); 
    }
  }, [monsterId, onBattleEnd]);

  const generateStageQuestion = useCallback(() => {
    if (!monsterDef || currentStageIndex >= monsterDef.stages.length) return;

    const stage = monsterDef.stages[currentStageIndex];
    let itemBank: (IntervalInfo | ChordInfo)[];
    let specificItem: IntervalInfo | ChordInfo | undefined;

    if (stage.type === GameMode.INTERVALS) {
      const availableIntervals = getAvailableTrainingItems(ALL_INTERVALS, playerData, UnlockedItemType.INTERVAL);
      itemBank = stage.difficulty === Difficulty.EASY ? EASY_INTERVALS.filter(i => availableIntervals.some(ai => ai.id === i.id))
               : stage.difficulty === Difficulty.MEDIUM ? MEDIUM_INTERVALS.filter(i => availableIntervals.some(ai => ai.id === i.id))
               : availableIntervals;
      if (stage.itemId) specificItem = itemBank.find(i => i.id === stage.itemId);
    } else { 
      const availableChords = getAvailableTrainingItems(ALL_CHORDS, playerData, UnlockedItemType.CHORD);
      itemBank = stage.difficulty === Difficulty.EASY ? EASY_CHORDS.filter(c => availableChords.some(ac => ac.id === c.id))
               : stage.difficulty === Difficulty.MEDIUM ? MEDIUM_CHORDS.filter(c => availableChords.some(ac => ac.id === c.id))
               : availableChords;
      if (stage.itemId) specificItem = itemBank.find(c => c.id === stage.itemId);
    }
    
    if (itemBank.length === 0) { 
        itemBank = stage.type === GameMode.INTERVALS ? EASY_INTERVALS : EASY_CHORDS;
    }


    const questionItem = specificItem || itemBank[Math.floor(Math.random() * itemBank.length)];
    if (!questionItem) {
        console.error("Could not select item for monster stage:", stage);
        onBattleEnd(); return;
    }

    const rootFrequency = getRandomRootFrequency();
    const numOptions = stage.difficulty === Difficulty.EASY ? 3 : 4;
    let options = [questionItem];
    const availableOptionsForQuestion = itemBank.filter(opt => opt.id !== questionItem.id);

    while (options.length < Math.min(numOptions, itemBank.length)) {
      if(availableOptionsForQuestion.length === 0) break;
      const randomOptionIndex = Math.floor(Math.random() * availableOptionsForQuestion.length);
      const randomOption = availableOptionsForQuestion.splice(randomOptionIndex, 1)[0];
      if (randomOption && !options.find(opt => opt.id === randomOption.id)) {
        options.push(randomOption);
      }
    }
    options = shuffleArray(options);

    setCurrentQuestion({
      item: questionItem,
      rootFrequency,
      options: options as (IntervalInfo[] | ChordInfo[]), 
      correctAnswerId: questionItem.id,
    });
    setSelectedAnswerId(null);
    setIsCorrect(null);
    setShowFeedback(false);
    setIsSoundPlayed(false);
    setHighlightedNotes([]);

  }, [monsterDef, currentStageIndex, playerData, isMusicalItemUnlocked, onBattleEnd]);

  useEffect(() => {
    if (monsterDef && !battleOutcome) {
      generateStageQuestion();
    }
  }, [monsterDef, currentStageIndex, battleOutcome, generateStageQuestion]);

  const playCurrentSound = useCallback(() => {
    if (!currentQuestion || !audioService) return;
    setIsSoundPlaying(true);
    setIsSoundPlayed(true);
    const rootMidiNote = frequencyToMidiNote(currentQuestion.rootFrequency);

    if (currentQuestion.item.hasOwnProperty('semitones') && !Array.isArray((currentQuestion.item as IntervalInfo).semitones)) { 
      const intervalItem = currentQuestion.item as IntervalInfo;
      const secondMidiNote = rootMidiNote + intervalItem.semitones;
      setHighlightedNotes([rootMidiNote, secondMidiNote]);
      audioService.playInterval(currentQuestion.rootFrequency, intervalItem.semitones, true, 0.6, selectedInstrumentSoundId);
    } else { 
      const chordItem = currentQuestion.item as ChordInfo;
      const chordMidiNotes = chordItem.semitones.map(offset => rootMidiNote + offset);
      setHighlightedNotes(chordMidiNotes);
      audioService.playChord(currentQuestion.rootFrequency, chordItem.semitones, 1.5, selectedInstrumentSoundId);
    }
    const soundDuration = currentQuestion.item.hasOwnProperty('semitones') && !Array.isArray((currentQuestion.item as IntervalInfo).semitones) ? 1400 : 1600;
    setTimeout(() => setIsSoundPlaying(false), soundDuration);
  }, [currentQuestion, audioService, selectedInstrumentSoundId]);

  const handleAnswer = (answerId: string) => {
    if (!currentQuestion || showFeedback || battleOutcome) return;
    setSelectedAnswerId(answerId);
    const correct = answerId === currentQuestion.correctAnswerId;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (!correct) {
      setBattleOutcome('defeat');
    }
  };

  const handleNextAction = () => {
    if (battleOutcome) { 
      onBattleEnd();
      return;
    }

    if (isCorrect) {
      if (currentStageIndex + 1 < (monsterDef?.stages.length || 0)) {
        setCurrentStageIndex(prev => prev + 1);
      } else {
        setBattleOutcome('victory');
        if (monsterDef) {
            recordMonsterDefeat(monsterDef.id); // This will handle memento, gcoins, xp, and quest item drop
        }
      }
    }
  };

  if (!monsterDef) return <div className="text-center p-4">{UI_TEXT_TH.loading}...</div>;
  if (!currentQuestion && !battleOutcome) return <div className="text-center p-4">{UI_TEXT_TH.loading}... (stage)</div>;
  
  const monsterName = UI_TEXT_TH[monsterDef.nameKey];
  const correctAnswerText = battleOutcome === 'defeat' && currentQuestion ? currentQuestion.options.find(opt => opt.id === currentQuestion.correctAnswerId)?.name : undefined;

  return (
    <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto flex flex-col space-y-6 min-h-[85vh] md:min-h-[75vh]">
      <div className="pb-4 border-b border-slate-700">
        <div className="flex justify-between items-center mb-2">
           <MonsterIconPlaceholder className="w-10 h-10 text-orange-400"/>
          <h2 className="text-2xl md:text-3xl font-bold text-sky-300 text-center text-outline-black">
            {UI_TEXT_TH.monsterBattleTitle}: {monsterName}
          </h2>
          <div className="w-10 h-10"></div> 
        </div>
        {!battleOutcome && (
            <p className="text-center text-slate-100 text-outline-black text-sm">
                {UI_TEXT_TH.monsterBattleStageLabel.replace('{current}', (currentStageIndex + 1).toString()).replace('{total}', monsterDef.stages.length.toString())}
            </p>
        )}
      </div>

    {battleOutcome === 'victory' && (
        <div className="flex-grow flex flex-col items-center justify-center space-y-4 text-center">
            <h3 className="text-3xl font-bold text-green-400 text-outline-black">{UI_TEXT_TH.monsterBattleVictoryMessage}</h3>
            <p className="text-slate-100 text-outline-black">
                {UI_TEXT_TH.monsterBattleRewardMessage
                    .replace('{mementoName}', UI_TEXT_TH[ALL_MEMENTOS.find(m => m.id === monsterDef.rewardMementoId)?.nameKey || '' as keyof ThaiUIText] || "ของที่ระลึก")
                    .replace('{gcoins}', (monsterDef.rewardGcoins || 0).toString())
                }
            </p>
            <button onClick={handleNextAction} className="btn-primary mt-4 px-8 py-3 text-lg">
                {UI_TEXT_TH.backToMenu}
            </button>
        </div>
    )}

    {battleOutcome === 'defeat' && (
        <div className="flex-grow flex flex-col items-center justify-center space-y-4 text-center">
            <h3 className="text-3xl font-bold text-red-400 text-outline-black">{UI_TEXT_TH.monsterBattleDefeatMessage}</h3>
            {correctAnswerText && <p className="text-slate-100 text-outline-black">{UI_TEXT_TH.correctAnswerIs} {correctAnswerText}</p>}
            <button onClick={handleNextAction} className="btn-secondary mt-4 px-8 py-3 text-lg">
                {UI_TEXT_TH.backToMenu}
            </button>
        </div>
    )}

    {!battleOutcome && currentQuestion && (
        <>
          <div className="flex-grow flex flex-col items-center justify-center space-y-4 md:space-y-6 py-4">
            <PlayButton
              onClick={playCurrentSound}
              isReplay={isSoundPlayed}
              text={isSoundPlayed ? UI_TEXT_TH.replaySound : UI_TEXT_TH.playPrompt}
              disabled={isSoundPlaying}
            />
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
                <PianoKeyboard highlightedNotes={highlightedNotes} />
            </div>
            <div className="w-full max-w-md">
              {!isSoundPlayed && <p className="text-center text-slate-200 text-outline-black mb-2 text-sm">{UI_TEXT_TH.playPrompt}</p>}
               <p className="text-center text-slate-100 text-outline-black mb-4">{UI_TEXT_TH.selectAnswer}</p>
              <div className={`grid grid-cols-1 ${currentQuestion.options.length > 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'} gap-3 md:gap-4`}>
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
              </div>
            </div>
          </div>

          <div className="h-28 flex flex-col justify-end items-center space-y-4 pt-4 border-t border-slate-700">
            {showFeedback && typeof isCorrect === 'boolean' && !isCorrect && ( 
              <FeedbackMessage isCorrect={false} correctAnswerText={currentQuestion.options.find(opt => opt.id === currentQuestion.correctAnswerId)?.name} />
            )}
            {showFeedback && isCorrect && (
                 <button
                    onClick={handleNextAction}
                    className="btn-primary px-8 py-3 text-lg"
                >
                    {currentStageIndex + 1 < monsterDef.stages.length ? UI_TEXT_TH.nextQuestion : UI_TEXT_TH.claimRewardButton } &rarr;
                </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MonsterBattlePage;
