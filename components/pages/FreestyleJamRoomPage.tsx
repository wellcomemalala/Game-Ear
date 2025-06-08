
import React, { useState, useEffect, useCallback } from 'react';
import { PlayerData, InstrumentSoundId, UnlockedItemType, ThaiUIText, MissionType } from '../../types'; // Added MissionType
import { UI_TEXT_TH, ALL_INSTRUMENT_SOUNDS, getInstrumentSoundName, ACTUAL_PIANO_LOWEST_MIDI_NOTE, ACTUAL_PIANO_HIGHEST_MIDI_NOTE, getFrequency } from '../../constants';
import { AudioService } from '../../services/AudioService';
import PianoKeyboard from '../PianoKeyboard';
import { MusicNotesIcon } from '../icons/MusicNotesIcon';
// MetronomeIcon and StopIcon are no longer needed
// import { MetronomeIcon } from '../icons/MetronomeIcon';
// import PlayIcon from '../icons/PlayIcon'; // PlayIcon might still be used if other play functions are added
// import { StopIcon } from '../icons/StopIcon';

interface FreestyleJamRoomPageProps {
  audioService: AudioService;
  playerData: PlayerData;
  onBackToMenu: () => void;
  updateMissionProgress: (missionType: MissionType, valueIncrement?: number, targetDetails?: { itemId?: string, gameMode?: any, gcoinsEarned?: number, view?: any, petId?: string, stat?: string, statValue?: number, monsterId?: string, mementoId?: string, notesPlayed?: number }) => void; // Added updateMissionProgress
}

const FreestyleJamRoomPage: React.FC<FreestyleJamRoomPageProps> = ({
  audioService,
  playerData,
  onBackToMenu,
  updateMissionProgress, // Added
}) => {
  const [selectedSound, setSelectedSound] = useState<InstrumentSoundId>(playerData.selectedInstrumentSoundId);
  const [highlightedNotes, setHighlightedNotes] = useState<number[]>([]);
  const [notesPlayedCount, setNotesPlayedCount] = useState(0); // New state for mission

  const purchasedSounds = ALL_INSTRUMENT_SOUNDS.filter(sound =>
    sound.isDefault || playerData.purchasedShopItemIds.some(
      item => item.id === sound.id && item.type === UnlockedItemType.INSTRUMENT_SOUND
    )
  );

  const handleNotePlay = (midiNote: number) => {
    const semitonesFromA4 = midiNote - 69; // A4 is MIDI note 69
    const frequency = getFrequency(semitonesFromA4);
    audioService.playNote(frequency, 0.8, 0, selectedSound);
    setHighlightedNotes([midiNote]);
    setTimeout(() => setHighlightedNotes([]), 300); // Briefly highlight

    // Update notes played count for mission
    const newCount = notesPlayedCount + 1;
    setNotesPlayedCount(newCount);
    updateMissionProgress(MissionType.PLAY_NOTES_FREESTYLE_COUNT, 1, { notesPlayed: newCount });
  };


  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl text-slate-100 flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
        <button onClick={onBackToMenu} className="btn-back">&larr; {UI_TEXT_TH.backToMenu}</button>
        <h1 className="text-2xl md:text-3xl font-bold text-sky-300 flex items-center text-outline-black">
          <MusicNotesIcon className="w-8 h-8 mr-3" />
          {UI_TEXT_TH.freestyleJamRoomTitle}
        </h1>
        <div className="w-20"> {/* Spacer */} </div>
      </div>

      <p className="text-center text-slate-100 text-outline-black mb-6">{UI_TEXT_TH.freestyleJamRoomDescription}</p>

      <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
        <label htmlFor="instrument-select" className="block text-sm font-medium text-sky-300 mb-1 text-outline-black">
          {UI_TEXT_TH.selectSoundLabel}
        </label>
        <select
          id="instrument-select"
          value={selectedSound}
          onChange={(e) => setSelectedSound(e.target.value as InstrumentSoundId)}
          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        >
          {purchasedSounds.map(sound => (
            <option key={sound.id} value={sound.id}>
              {getInstrumentSoundName(sound.id, UI_TEXT_TH)}
            </option>
          ))}
        </select>
      </div>

      {/* Metronome Controls Removed */}

      <div className="w-full overflow-x-auto pb-4">
         <PianoKeyboard
            highlightedNotes={highlightedNotes}
            onNoteClick={handleNotePlay}
            disabled={false} // Piano is always enabled in freestyle
          />
      </div>

    </div>
  );
};

export default FreestyleJamRoomPage;