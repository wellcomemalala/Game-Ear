import React from 'react';
import { PIANO_LOWEST_MIDI_NOTE, PIANO_HIGHEST_MIDI_NOTE } from '../constants';

interface PianoKeyboardProps {
  highlightedNotes: number[]; // Array of MIDI note numbers to highlight
}

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ highlightedNotes }) => {
  const keys = [];
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const isBlackKey = (midiNote: number): boolean => {
    const noteInOctave = midiNote % 12;
    return [1, 3, 6, 8, 10].includes(noteInOctave);
  };

  let whiteKeyIndex = 0;
  const whiteKeyWidthPercent = 100 / (PIANO_HIGHEST_MIDI_NOTE - PIANO_LOWEST_MIDI_NOTE + 1 - Array.from({ length: PIANO_HIGHEST_MIDI_NOTE - PIANO_LOWEST_MIDI_NOTE + 1 }, (_, i) => isBlackKey(PIANO_LOWEST_MIDI_NOTE + i)).filter(Boolean).length);


  for (let midiNote = PIANO_LOWEST_MIDI_NOTE; midiNote <= PIANO_HIGHEST_MIDI_NOTE; midiNote++) {
    const isHighlighted = highlightedNotes.includes(midiNote);
    
    let keyElement;

    if (isBlackKey(midiNote)) {
      const highlightClass = isHighlighted ? '!bg-sky-600 !border-sky-400 shadow-sky-500/50' : 'shadow-slate-900/50';
      keyElement = (
        <div
          key={midiNote}
          className={`
            bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 text-slate-100 
            h-2/3 z-10 w-[3.5%] min-w-[18px] max-w-[22px] rounded-b-sm shadow-md
            absolute left-0 top-0 transform 
            transition-all duration-100 ease-in-out
            ${highlightClass}
          `}
          style={{
            left: `calc(${whiteKeyIndex * whiteKeyWidthPercent}% - ${whiteKeyWidthPercent * 0.25}%)`, // Position relative to previous white key
          }}
          title={`${noteNames[midiNote % 12]}${Math.floor(midiNote / 12) -1}`}
        ></div>
      );
    } else {
      const highlightClass = isHighlighted ? '!bg-sky-400 !border-sky-600 shadow-sky-300/50' : 'shadow-slate-400/30';
      keyElement = (
        <div
          key={midiNote}
          className={`
            bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-300 text-slate-700 
            h-full rounded-sm shadow-sm
            flex flex-col justify-end items-center p-1 
            transition-all duration-100 ease-in-out
            ${highlightClass}
          `}
          style={{ width: `${whiteKeyWidthPercent}%`}}
          title={`${noteNames[midiNote % 12]}${Math.floor(midiNote / 12) -1}`}
        >
         {/* <span className="text-[8px] select-none pointer-events-none opacity-70">
             {noteNames[midiNote % 12]}
          </span>*/}
        </div>
      );
      whiteKeyIndex++;
    }
    keys.push(keyElement);
  }

  return (
    <div className="w-full h-32 md:h-40 flex justify-start items-stretch bg-slate-700 p-2 rounded-lg shadow-inner select-none my-4 relative overflow-hidden">
      {keys.filter(key => !isBlackKey(parseInt(key.key as string)))} {/* Render white keys first */}
      {keys.filter(key => isBlackKey(parseInt(key.key as string)))} {/* Render black keys on top */}
    </div>
  );
};

export default PianoKeyboard;