
import { InstrumentSoundId } from './types'; // Assuming types.ts is in the same directory

export const A4_FREQUENCY = 440;
export const A4_MIDI_NOTE = 69;

// PIANO_LOWEST_MIDI_NOTE and PIANO_HIGHEST_MIDI_NOTE are imported from types.ts if they are only used by types,
// or defined here if they are fundamental constants. Based on current usage, they seem fundamental.
// Let's define them here for clarity as they are used in calculations below.
// However, the original constants.ts uses them from './types' implicitly via PIANO_LOWEST_MIDI_NOTE and PIANO_HIGHEST_MIDI_NOTE in its own definitions.
// Re-evaluating: Original constants.ts defines PIANO_LOWEST_MIDI_NOTE = 60, PIANO_HIGHEST_MIDI_NOTE = 84 directly.
// The types.ts does not export these. So, they should be defined here.

// Re-defining based on original constants.ts
export const ACTUAL_PIANO_LOWEST_MIDI_NOTE = 60; // C4
export const ACTUAL_PIANO_HIGHEST_MIDI_NOTE = 84; // C6


export const getFrequency = (semitonesFromA4: number): number => {
  return A4_FREQUENCY * Math.pow(2, semitonesFromA4 / 12);
};

export const frequencyToMidiNote = (frequency: number): number => {
  return Math.round(12 * Math.log2(frequency / A4_FREQUENCY) + A4_MIDI_NOTE);
};

export const midiNoteToFrequency = (midiNote: number): number => {
    return A4_FREQUENCY * Math.pow(2, (midiNote - A4_MIDI_NOTE) / 12);
};

export const midiNoteToName = (midiNote: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    return `${noteNames[midiNote % 12]}${octave}`;
};

export const getRandomRootFrequency = (): number => {
  const MIN_ROOT_MIDI = ACTUAL_PIANO_LOWEST_MIDI_NOTE;
  const MAX_INTERVAL_CHORD_SPAN = 17; // Max semitones for P11, largest interval/chord span
  const MAX_ROOT_MIDI_CALCULATED = ACTUAL_PIANO_HIGHEST_MIDI_NOTE - MAX_INTERVAL_CHORD_SPAN;

  // Ensure MAX_ROOT_MIDI is not less than MIN_ROOT_MIDI, could happen if piano range is too small for the span
  const MAX_ROOT_MIDI = Math.max(MIN_ROOT_MIDI, MAX_ROOT_MIDI_CALCULATED);

  // If MAX_ROOT_MIDI became equal to MIN_ROOT_MIDI due to small range, we might only have one possible root.
  // Or if MAX_ROOT_MIDI_CALCULATED was less, then only one valid root note is possible or it's impossible.
  // This calculation ensures at least one note is selectable if MIN_ROOT_MIDI <= MAX_ROOT_MIDI.
  const numPossibleRootNotes = MAX_ROOT_MIDI - MIN_ROOT_MIDI + 1;
  const randomMidiNoteOffset = numPossibleRootNotes > 0 ? Math.floor(Math.random() * numPossibleRootNotes) : 0;
  const randomMidiNote = MIN_ROOT_MIDI + randomMidiNoteOffset; // Corrected typo here

  const semitonesFromA4 = randomMidiNote - A4_MIDI_NOTE;
  return getFrequency(semitonesFromA4);
};

export const mapInstrumentSoundIdToOscillatorType = (instrumentSoundId: InstrumentSoundId): OscillatorType => {
  switch (instrumentSoundId) {
    case InstrumentSoundId.SQUARE:
      return 'square';
    case InstrumentSoundId.TRIANGLE:
      return 'triangle';
    case InstrumentSoundId.SINE:
    default:
      return 'sine';
  }
};
