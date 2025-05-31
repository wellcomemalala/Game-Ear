
import React from 'react';
import { PIANO_LOWEST_MIDI_NOTE, PIANO_HIGHEST_MIDI_NOTE, midiNoteToName } from '../constants';

interface PianoKeyboardProps {
  highlightedNotes: number[]; 
  onNoteClick?: (midiNote: number) => void;
  disabled?: boolean;
}

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ highlightedNotes, onNoteClick, disabled = false }) => {
  const keys = [];
  
  const isBlackKey = (midiNote: number): boolean => {
    const noteInOctave = midiNote % 12;
    return [1, 3, 6, 8, 10].includes(noteInOctave);
  };

  let whiteKeyIndex = 0;
  const totalWhiteKeys = Array.from({ length: PIANO_HIGHEST_MIDI_NOTE - PIANO_LOWEST_MIDI_NOTE + 1 }, (_, i) => !isBlackKey(PIANO_LOWEST_MIDI_NOTE + i)).filter(Boolean).length;
  const whiteKeyWidthPercent = 100 / totalWhiteKeys;


  for (let midiNote = PIANO_LOWEST_MIDI_NOTE; midiNote <= PIANO_HIGHEST_MIDI_NOTE; midiNote++) {
    const isHighlighted = highlightedNotes.includes(midiNote);
    const noteName = midiNoteToName(midiNote);
    const KeyComponent = onNoteClick ? 'button' : 'div';

    let keyElement;

    if (isBlackKey(midiNote)) {
      const highlightClass = isHighlighted ? '!bg-sky-600 !border-sky-400 shadow-sky-500/50' : 'shadow-slate-900/50';
      keyElement = (
        <KeyComponent
          key={midiNote}
          onClick={onNoteClick ? () => onNoteClick(midiNote) : undefined}
          disabled={disabled}
          className={`
            bg-slate-800 border border-slate-600 text-slate-100 
            h-2/3 z-10 w-[${whiteKeyWidthPercent * 0.6}%] min-w-[18px] max-w-[22px] rounded-b-sm shadow-md
            absolute top-0 transform 
            transition-all duration-100 ease-in-out
            ${onNoteClick ? 'hover:bg-slate-700 active:bg-slate-600' : ''}
            ${disabled && onNoteClick ? 'opacity-70 cursor-not-allowed hover:bg-slate-800 active:bg-slate-800' : ''}
            ${highlightClass}
          `}
          style={{
            left: `calc(${(whiteKeyIndex -1) * whiteKeyWidthPercent}% + ${whiteKeyWidthPercent * 0.7}%)`, 
          }}
          title={noteName}
          aria-label={onNoteClick ? `Play note ${noteName}` : noteName}
        ></KeyComponent>
      );
    } else {
      const highlightClass = isHighlighted ? '!bg-sky-400 !border-sky-600 shadow-sky-300/50' : 'shadow-slate-400/30';
      keyElement = (
        <KeyComponent
          key={midiNote}
          onClick={onNoteClick ? () => onNoteClick(midiNote) : undefined}
          disabled={disabled}
          className={`
            bg-white border border-slate-300 text-slate-700 
            h-full rounded-sm shadow-sm
            flex flex-col justify-end items-center p-1 
            transition-all duration-100 ease-in-out
            ${onNoteClick ? 'hover:bg-slate-100 active:bg-slate-200' : ''}
            ${disabled && onNoteClick ? 'opacity-70 cursor-not-allowed hover:bg-white active:bg-white' : ''}
            ${highlightClass}
          `}
          style={{ width: `${whiteKeyWidthPercent}%`}}
          title={noteName}
          aria-label={onNoteClick ? `Play note ${noteName}` : noteName}
        >
        </KeyComponent>
      );
      whiteKeyIndex++;
    }
    keys.push(keyElement);
  }

  return (
    <div className="w-full h-32 md:h-40 flex justify-start items-stretch bg-slate-700 p-2 rounded-lg shadow-inner select-none my-4 relative overflow-x-auto min-w-[500px] sm:min-w-[600px]">
      {keys.filter(key => !isBlackKey(parseInt(key.key as string)))} 
      {keys.filter(key => isBlackKey(parseInt(key.key as string)))} 
    </div>
  );
};

export default PianoKeyboard;
