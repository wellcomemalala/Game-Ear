
import { A4_FREQUENCY, midiNoteToFrequency } from '../constants';
import { InstrumentSoundId, NoteInfo } from '../types'; 

export class AudioService {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeOscillators: OscillatorNode[] = [];

  constructor() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new window.AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime); 
      this.masterGain.connect(this.audioContext.destination);
      
      if (this.audioContext.state === 'suspended') {
        console.log("AudioContext is suspended. User interaction is needed to resume.");
      }
    } else {
      console.error("Web Audio API is not supported in this browser.");
      throw new Error("Web Audio API not supported");
    }
  }

  public isSuspended(): boolean {
    return this.audioContext?.state === 'suspended';
  }

  public async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log("AudioContext resumed successfully.");
      } catch (e) {
        console.error("Error resuming AudioContext:", e);
      }
    }
  }

  private getFrequencyFromSemitones(rootFrequency: number, semitones: number): number {
    return rootFrequency * Math.pow(2, semitones / 12);
  }

  public stopAllSounds(): void {
    this.activeOscillators.forEach(osc => {
        try {
            osc.stop();
        } catch (e) {
            // Oscillator might have already stopped
        }
    });
    this.activeOscillators = [];
  }

  public playNote(
    frequency: number, 
    duration: number = 1, 
    startTimeOffset: number = 0, 
    instrumentSoundId: InstrumentSoundId = InstrumentSoundId.SINE
  ): void {
    if (!this.audioContext || !this.masterGain) return;
    if (this.audioContext.state === 'suspended') {
      console.warn("AudioContext is suspended. Cannot play note.");
      this.resume(); 
      return;
    }

    const oscillator = this.audioContext.createOscillator();
    this.activeOscillators.push(oscillator);
    const gainNode = this.audioContext.createGain();

    let selectedOscillatorType: OscillatorType = 'sine';
    switch (instrumentSoundId) {
        case InstrumentSoundId.SQUARE:
            selectedOscillatorType = 'square';
            break;
        case InstrumentSoundId.TRIANGLE:
            selectedOscillatorType = 'triangle';
            break;
        case InstrumentSoundId.SINE:
        default:
            selectedOscillatorType = 'sine';
            break;
    }
    oscillator.type = selectedOscillatorType;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + startTimeOffset);

    const now = this.audioContext.currentTime + startTimeOffset;
    
    const attackTime = duration < 0.1 ? 0.005 : 0.05;
    const releaseTime = duration < 0.1 ? 0.01 : 0.1;
    const sustainLevel = duration < 0.1 ? 1.0 : 0.8; 

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime); 
    
    if (duration > (attackTime + releaseTime)) { 
        gainNode.gain.setValueAtTime(sustainLevel, now + duration - releaseTime);
    }
    gainNode.gain.linearRampToValueAtTime(0, now + duration); 

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.01); 
    oscillator.onended = () => {
        this.activeOscillators = this.activeOscillators.filter(osc => osc !== oscillator);
        gainNode.disconnect();
    };
  }

  public playInterval(
    rootFrequency: number, 
    intervalSemitones: number, 
    sequential: boolean = false, 
    noteDuration: number = 0.7,
    instrumentSoundId: InstrumentSoundId = InstrumentSoundId.SINE
  ): void {
    if (!this.audioContext) return;
     if (this.audioContext.state === 'suspended') {
      this.resume(); 
      return;
    }
    this.stopAllSounds();

    const secondNoteFrequency = this.getFrequencyFromSemitones(rootFrequency, intervalSemitones);

    this.playNote(rootFrequency, noteDuration, 0, instrumentSoundId);
    if (sequential) {
      this.playNote(secondNoteFrequency, noteDuration, noteDuration + 0.1, instrumentSoundId); 
    } else {
      this.playNote(secondNoteFrequency, noteDuration, 0, instrumentSoundId); 
    }
  }

  public playChord(
    rootFrequency: number, 
    chordSemitones: number[], 
    duration: number = 1.5,
    instrumentSoundId: InstrumentSoundId = InstrumentSoundId.SINE
  ): void {
    if (!this.audioContext) return;
     if (this.audioContext.state === 'suspended') {
      this.resume(); 
      return;
    }
    this.stopAllSounds();

    chordSemitones.forEach(semitones => {
      const noteFrequency = this.getFrequencyFromSemitones(rootFrequency, semitones);
      this.playNote(noteFrequency, duration, 0, instrumentSoundId);
    });
  }

  public playMelodySequentially(
    notes: NoteInfo[], // Array of NoteInfo objects (midiNote, duration)
    instrumentSoundId: InstrumentSoundId = InstrumentSoundId.SINE,
    noteDelay: number = 0.1 // Delay in seconds after each note before starting the next
  ): void {
    if (!this.audioContext || !this.masterGain) return;
    if (this.audioContext.state === 'suspended') {
      this.resume();
      return;
    }
    this.stopAllSounds();

    let accumulatedDelay = 0;

    notes.forEach((noteInfo, index) => {
      const frequency = midiNoteToFrequency(noteInfo.midiNote);
      this.playNote(frequency, noteInfo.duration, accumulatedDelay, instrumentSoundId);
      accumulatedDelay += noteInfo.duration + noteDelay;
    });
  }


  public close(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(err => console.error("Error closing AudioContext:", err));
    }
  }
}
