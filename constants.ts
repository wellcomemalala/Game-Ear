
import { IntervalInfo, ChordInfo, ThaiUIText, Difficulty, Achievement, AchievementId, PlayerData, GameMode, UnlockedItemType, InstrumentSoundId, InstrumentSoundInfo, ShopItem, PetId, PetDefinition, PetAbilityType, ActivePet, FurnitureItem, FurnitureId, MissionDefinition, MissionId, MissionType, MissionRewardType, MonsterDefinition, MonsterId, MementoDefinition, MementoId, MonsterStage, AppView, NoteInfo, AvatarStyle, NPCId, QuestId, ActiveQuest, QuestDefinition, QuestObjectiveType, QuestReward, QuestObjective, ActiveQuestObjective, QuestStatus } from './types'; 

export const A4_FREQUENCY = 440;
export const A4_MIDI_NOTE = 69;

export const PIANO_LOWEST_MIDI_NOTE = 60; // C4
export const PIANO_HIGHEST_MIDI_NOTE = 84; // C6


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
  const MIN_ROOT_MIDI = PIANO_LOWEST_MIDI_NOTE; 
  const MAX_INTERVAL_CHORD_SPAN = 17; 
  const MAX_ROOT_MIDI_CALCULATED = PIANO_HIGHEST_MIDI_NOTE - MAX_INTERVAL_CHORD_SPAN; 
  
  const MAX_ROOT_MIDI = Math.max(MIN_ROOT_MIDI, MAX_ROOT_MIDI_CALCULATED); 


  const numPossibleRootNotes = MAX_ROOT_MIDI - MIN_ROOT_MIDI + 1; 
  const randomMidiNote = MIN_ROOT_MIDI + Math.floor(Math.random() * numPossibleRootNotes); 
  
  const semitonesFromA4 = randomMidiNote - A4_MIDI_NOTE; 
  return getFrequency(semitonesFromA4);
};

export const ALL_INTERVALS: IntervalInfo[] = [
  { id: 'P1', name: 'Perfect Unison', thaiName: 'เพอร์เฟคยูนิซัน', semitones: 0 },
  { id: 'm2', name: 'Minor Second', thaiName: 'ไมเนอร์เซคเคินด์', semitones: 1 },
  { id: 'M2', name: 'Major Second', thaiName: 'เมเจอร์เซคเคินด์', semitones: 2 },
  { id: 'm3', name: 'Minor Third', thaiName: 'ไมเนอร์เทิร์ด', semitones: 3 },
  { id: 'M3', name: 'Major Third', thaiName: 'เมเจอร์เทิร์ด', semitones: 4 },
  { id: 'P4', name: 'Perfect Fourth', thaiName: 'เพอร์เฟคโฟร์ท', semitones: 5 },
  { id: 'TT', name: 'Tritone', thaiName: 'ไทรโทน', semitones: 6 },
  { id: 'P5', name: 'Perfect Fifth', thaiName: 'เพอร์เฟคฟิฟท์', semitones: 7 },
  { id: 'm6', name: 'Minor Sixth', thaiName: 'ไมเนอร์ซิกซ์ท', semitones: 8 },
  { id: 'M6', name: 'Major Sixth', thaiName: 'เมเจอร์ซิกซ์ท', semitones: 9 },
  { id: 'm7', name: 'Minor Seventh', thaiName: 'ไมเนอร์เซเวนท์', semitones: 10 },
  { id: 'M7', name: 'Major Seventh', thaiName: 'เมเจอร์เซเวนท์', semitones: 11 },
  { id: 'P8', name: 'Perfect Octave', thaiName: 'เพอร์เฟคออกเทฟ', semitones: 12 },
  { id: 'm9', name: 'Minor Ninth', thaiName: 'ไมเนอร์ไนน์ท', semitones: 13, isAdvanced: true, cost: 150 },
  { id: 'M9', name: 'Major Ninth', thaiName: 'เมเจอร์ไนน์ท', semitones: 14, isAdvanced: true, cost: 200 },
  { id: 'P11', name: 'Perfect Eleventh', thaiName: 'เพอร์เฟคอีเลฟเวนท์', semitones: 17, isAdvanced: true, cost: 250 },
];

export const EASY_INTERVALS: IntervalInfo[] = ALL_INTERVALS.filter(i => ['P1', 'M3', 'P5', 'P8', 'M2', 'm3'].includes(i.id) && !i.isAdvanced);
export const MEDIUM_INTERVALS: IntervalInfo[] = ALL_INTERVALS.filter(i => ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'].includes(i.id) && !i.isAdvanced);


export const ALL_CHORDS: ChordInfo[] = [
  { id: 'maj', name: 'Major Triad', thaiName: 'เมเจอร์', semitones: [0, 4, 7] },
  { id: 'min', name: 'Minor Triad', thaiName: 'ไมเนอร์', semitones: [0, 3, 7] },
  { id: 'dim', name: 'Diminished Triad', thaiName: 'ดิมินิชท์', semitones: [0, 3, 6] },
  { id: 'aug', name: 'Augmented Triad', thaiName: 'อ็อกเมนเต็ด', semitones: [0, 4, 8] },
  { id: 'dom7', name: 'Dominant 7th', thaiName: 'โดมิแนนท์เซเว่น', semitones: [0, 4, 7, 10] },
  { id: 'maj7', name: 'Major 7th', thaiName: 'เมเจอร์เซเว่น', semitones: [0, 4, 7, 11] },
  { id: 'min7', name: 'Minor 7th', thaiName: 'ไมเนอร์เซเว่น', semitones: [0, 3, 7, 10] },
  { id: 'maj9', name: 'Major 9th Chord', thaiName: 'เมเจอร์ไนน์ทคอร์ด', semitones: [0, 4, 7, 11, 14], isAdvanced: true, cost: 300 },
  { id: 'min9', name: 'Minor 9th Chord', thaiName: 'ไมเนอร์ไนน์ทคอร์ด', semitones: [0, 3, 7, 10, 14], isAdvanced: true, cost: 300 },
  { id: 'dom9', name: 'Dominant 9th Chord', thaiName: 'โดมิแนนท์ไนน์ทคอร์ด', semitones: [0, 4, 7, 10, 14], isAdvanced: true, cost: 350 },
];

export const EASY_CHORDS: ChordInfo[] = ALL_CHORDS.filter(c => ['maj', 'min', 'dom7'].includes(c.id) && !c.isAdvanced);
export const MEDIUM_CHORDS: ChordInfo[] = ALL_CHORDS.filter(c => ['maj', 'min', 'dim', 'aug', 'dom7', 'maj7', 'min7'].includes(c.id) && !c.isAdvanced);

export const ALL_INSTRUMENT_SOUNDS: InstrumentSoundInfo[] = [
  { id: InstrumentSoundId.SINE, nameKey: 'instrumentSoundSine', cost: 0, isDefault: true },
  { id: InstrumentSoundId.SQUARE, nameKey: 'instrumentSoundSquare', cost: 250 },
  { id: InstrumentSoundId.TRIANGLE, nameKey: 'instrumentSoundTriangle', cost: 250 },
];

export const mapInstrumentSoundIdToOscillatorType = (soundId: InstrumentSoundId): OscillatorType => {
  switch (soundId) {
    case InstrumentSoundId.SINE: return 'sine';
    case InstrumentSoundId.SQUARE: return 'square';
    case InstrumentSoundId.TRIANGLE: return 'triangle';
    default:
      const _exhaustiveCheck: never = soundId;
      throw new Error(`Unhandled InstrumentSoundId: ${_exhaustiveCheck}`);
  }
};

const instrumentSoundShopItems: ShopItem[] = ALL_INSTRUMENT_SOUNDS
  .filter(sound => !sound.isDefault)
  .map(sound => ({
    id: sound.id,
    nameKey: sound.nameKey,
    descriptionKey: sound.nameKey,
    cost: sound.cost,
    type: UnlockedItemType.INSTRUMENT_SOUND,
    icon: 'SpeakerWaveIcon',
    data: mapInstrumentSoundIdToOscillatorType(sound.id),
  }));

export const MAX_PET_LEVEL = 10;
const PET_EVOLUTION_LEVEL_DEFAULT = 5;

export const PET_DEFINITIONS: PetDefinition[] = [
  {
    id: PetId.KAKI,
    nameKey: 'petKakiName',
    iconComponent: 'PetIcon',
    cost: 500,
    descriptionKey: 'petKakiDescription',
    ability: {
      type: PetAbilityType.PET_XP_BOOST,
      value: 1.1,
      descriptionKey: 'petAbilityDesc_PET_XP_BOOST',
      condition: (pet: ActivePet) => pet.level >= 3,
    },
    evolvesTo: PetId.KAKI_EVO1,
    evolutionLevel: PET_EVOLUTION_LEVEL_DEFAULT,
  },
  {
    id: PetId.PLANIN,
    nameKey: 'petPlaninName',
    iconComponent: 'PetIcon',
    cost: 750,
    descriptionKey: 'petPlaninDescription',
    ability: {
      type: PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES,
      value: 0.05,
      descriptionKey: 'petAbilityDesc_GCOIN_DISCOUNT_UNLOCKABLES',
      condition: (pet: ActivePet) => pet.level >= 5,
    },
    evolvesTo: PetId.PLANIN_EVO1,
    evolutionLevel: PET_EVOLUTION_LEVEL_DEFAULT,
  },
  {
    id: PetId.MOOTOD,
    nameKey: 'petMootodName',
    iconComponent: 'PetIcon',
    cost: 750,
    descriptionKey: 'petMootodDescription',
    ability: {
      type: PetAbilityType.XP_BOOST_TRAINING,
      value: 1.05,
      descriptionKey: 'petAbilityDesc_XP_BOOST_TRAINING',
      condition: (pet: ActivePet) => pet.level >= 5,
    },
    evolvesTo: PetId.MOOTOD_EVO1,
    evolutionLevel: PET_EVOLUTION_LEVEL_DEFAULT,
  },
  {
    id: PetId.KAKI_EVO1,
    nameKey: 'petKakiEvo1Name',
    iconComponent: 'KakiEvo1Icon', 
    cost: 0, 
    descriptionKey: 'petKakiEvo1Description',
    ability: {
      type: PetAbilityType.PET_XP_BOOST,
      value: 1.2, 
      descriptionKey: 'petAbilityDesc_PET_XP_BOOST',
      condition: (pet: ActivePet) => pet.level >= 3, 
    },
  },
  {
    id: PetId.PLANIN_EVO1,
    nameKey: 'petPlaninEvo1Name',
    iconComponent: 'PlaninEvo1Icon', 
    cost: 0,
    descriptionKey: 'petPlaninEvo1Description',
    ability: {
      type: PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES,
      value: 0.08, 
      descriptionKey: 'petAbilityDesc_GCOIN_DISCOUNT_UNLOCKABLES',
      condition: (pet: ActivePet) => pet.level >= 5,
    },
  },
  {
    id: PetId.MOOTOD_EVO1,
    nameKey: 'petMootodEvo1Name',
    iconComponent: 'MootodEvo1Icon', 
    cost: 0,
    descriptionKey: 'petMootodEvo1Description',
    ability: {
      type: PetAbilityType.XP_BOOST_TRAINING,
      value: 1.08, 
      descriptionKey: 'petAbilityDesc_XP_BOOST_TRAINING',
      condition: (pet: ActivePet) => pet.level >= 5,
    },
  },
];

export const PET_ADOPTION_COST = 500; 
export const MAX_PET_HUNGER = 100;
export const PET_HUNGER_DECAY_PER_HOUR = 5;
export const PET_FOOD_HUNGER_VALUE = 40;
export const PET_FOOD_COST = 30;
export const PET_FOOD_ID = 'BUDDY_BITES_FOOD';
export const PET_XP_PER_CORRECT_ANSWER = 2;
export const PET_XP_PER_FEEDING = 10;
export const PET_XP_PER_DAILY_LOGIN = 15;
export const PET_LEVEL_THRESHOLDS = [0, 50, 120, 200, 300, 450, 600, 800, 1000, 1250, 1500]; 
export const MAX_PET_HAPPINESS = 100;
export const HAPPINESS_PER_FEEDING = 20;
export const HAPPINESS_PER_PLAY = 25;
export const HAPPINESS_DECAY_ON_HUNGER_DROP = 5;
export const PET_PLAY_COOLDOWN_HOURS = 2;
export const PET_INTERACTION_ACHIEVEMENT_MILESTONE = 10;
export const PET_BOREDOM_THRESHOLD_HOURS = 6;
export const HAPPINESS_DECAY_ON_BOREDOM = 2;
export const PET_SPECIAL_REQUEST_CHANCE = 0.1;
export const PET_SPECIAL_REQUEST_REWARD_XP = 25;
export const PET_SPECIAL_REQUEST_REWARD_HAPPINESS = 30;
export const PET_SPECIAL_REQUEST_REWARD_XP_EVOLVED = Math.round(PET_SPECIAL_REQUEST_REWARD_XP * 1.5); 
export const PET_SPECIAL_REQUEST_REWARD_HAPPINESS_EVOLVED = Math.round(PET_SPECIAL_REQUEST_REWARD_HAPPINESS * 1.2);


export const PET_FOOD_ITEM: ShopItem = {
  id: PET_FOOD_ID,
  nameKey: 'petFoodName',
  descriptionKey: 'petFoodDescription',
  cost: PET_FOOD_COST,
  type: UnlockedItemType.PET_FOOD,
  icon: 'FoodBowlIcon',
  data: { hungerValue: PET_FOOD_HUNGER_VALUE },
};

export const PET_CUSTOMIZATION_ITEMS: ShopItem[] = [
  { id: 'COLLAR_RED', nameKey: 'petCustomizationColorRed', descriptionKey: 'petCustomizationColorRed', cost: 100, type: UnlockedItemType.PET_CUSTOMIZATION, icon: 'ShirtIcon', data: { color: '#EF4444' } },
  { id: 'COLLAR_BLUE', nameKey: 'petCustomizationColorBlue', descriptionKey: 'petCustomizationColorBlue', cost: 100, type: UnlockedItemType.PET_CUSTOMIZATION, icon: 'ShirtIcon', data: { color: '#3B82F6' } },
  { id: 'COLLAR_GREEN', nameKey: 'petCustomizationColorGreen', descriptionKey: 'petCustomizationColorGreen', cost: 100, type: UnlockedItemType.PET_CUSTOMIZATION, icon: 'ShirtIcon', data: { color: '#10B981' } },
];

export const ALL_FURNITURE_ITEMS: FurnitureItem[] = [
  { id: FurnitureId.GRAND_PIANO, nameKey: 'furniture_GP_001_name', descriptionKey: 'furniture_GP_001_desc', effectDescriptionKey: 'furniture_GP_001_effectDesc', cost: 2000, type: UnlockedItemType.FURNITURE, iconComponent: 'PianoIcon' },
  { id: FurnitureId.MUSIC_THEORY_SHELF, nameKey: 'furniture_MTS_001_name', descriptionKey: 'furniture_MTS_001_desc', effectDescriptionKey: 'furniture_MTS_001_effectDesc', cost: 1500, type: UnlockedItemType.FURNITURE, iconComponent: 'BookshelfIcon' },
  { id: FurnitureId.COMFY_PET_BED, nameKey: 'furniture_CPB_001_name', descriptionKey: 'furniture_CPB_001_desc', effectDescriptionKey: 'furniture_CPB_001_effectDesc', cost: 800, type: UnlockedItemType.FURNITURE, iconComponent: 'PetBedIcon' },
];

const furnitureShopItems: ShopItem[] = ALL_FURNITURE_ITEMS.map(fItem => ({
    id: fItem.id, nameKey: fItem.nameKey, descriptionKey: fItem.descriptionKey, cost: fItem.cost, type: UnlockedItemType.FURNITURE, icon: 'FurnitureIcon',
}));

export const SHOP_ITEMS: ShopItem[] = [ ...instrumentSoundShopItems, PET_FOOD_ITEM, ...PET_CUSTOMIZATION_ITEMS, ...furnitureShopItems ];
export const XP_PER_CORRECT_ANSWER = 10;
export const GCOINS_PER_CORRECT_ANSWER = 5;
export const DAILY_LOGIN_REWARD = 25;
export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5000, 6500, 8000, 10000, 12500, 15000];
export const MAX_HOUSE_LEVEL = 3;
export const HOUSE_UPGRADE_COSTS: { [level: number]: number } = { 1: 1000, 2: 5000, 3: 15000 };
export const HOUSE_BENEFITS_PER_LEVEL: { level: number; dailyLoginBonusGCoins: number; trainingXpMultiplier: number; trainingGCoinMultiplier: number; }[] = [
  { level: 0, dailyLoginBonusGCoins: 0, trainingXpMultiplier: 1.00, trainingGCoinMultiplier: 1.00 },
  { level: 1, dailyLoginBonusGCoins: 5, trainingXpMultiplier: 1.01, trainingGCoinMultiplier: 1.00 },
  { level: 2, dailyLoginBonusGCoins: 10, trainingXpMultiplier: 1.02, trainingGCoinMultiplier: 1.01 },
  { level: 3, dailyLoginBonusGCoins: 20, trainingXpMultiplier: 1.03, trainingGCoinMultiplier: 1.02 },
];
export const PRACTICE_NOOK_COOLDOWN_HOURS = 4;
export const PRACTICE_NOOK_PLAYER_XP_REWARD = 5;
export const PRACTICE_NOOK_PET_XP_REWARD = 3;
export const PRACTICE_NOOK_PET_HAPPINESS_REWARD = 2;
export const DAILY_MISSIONS_TO_PICK = 3;
export const WEEKLY_MISSIONS_TO_PICK = 2;

export const MISSION_DEFINITIONS: MissionDefinition[] = [
  { id: MissionId.DAILY_TRAIN_M3_5_TIMES, type: MissionType.TRAIN_ITEM_CORRECT_COUNT, descriptionKey: 'mission_DAILY_TRAIN_M3_5_TIMES_desc', targetValue: 5, targetItemType: GameMode.INTERVALS, targetItemId: 'M3', rewards: [{ type: MissionRewardType.PLAYER_XP, amount: 20 }, { type: MissionRewardType.GCOINS, amount: 10 }], frequency: 'daily' },
  { id: MissionId.DAILY_STREAK_3_CHORDS, type: MissionType.TRAINING_STREAK, descriptionKey: 'mission_DAILY_STREAK_3_CHORDS_desc', targetValue: 3, gameModeScope: GameMode.CHORDS, rewards: [{ type: MissionRewardType.PLAYER_XP, amount: 25 }, { type: MissionRewardType.GCOINS, amount: 15 }], frequency: 'daily' },
  { id: MissionId.DAILY_FEED_PET_1_TIME, type: MissionType.FEED_PET_COUNT, descriptionKey: 'mission_DAILY_FEED_PET_1_TIME_desc', targetValue: 1, rewards: [{ type: MissionRewardType.PET_XP, amount: 10 }, { type: MissionRewardType.GCOINS, amount: 5 }], frequency: 'daily' },
  { id: MissionId.DAILY_USE_PRACTICE_NOOK_1_TIME, type: MissionType.USE_PRACTICE_NOOK_COUNT, descriptionKey: 'mission_DAILY_USE_PRACTICE_NOOK_1_TIME_desc', targetValue: 1, rewards: [{ type: MissionRewardType.PLAYER_XP, amount: 10 }], frequency: 'daily' },
  { id: MissionId.DAILY_EARN_50_GCOINS_TRAINING, type: MissionType.EARN_GCOINS_FROM_TRAINING, descriptionKey: 'mission_DAILY_EARN_50_GCOINS_TRAINING_desc', targetValue: 50, rewards: [{ type: MissionRewardType.PLAYER_XP, amount: 15 }, { type: MissionRewardType.GCOINS, amount: 20 }], frequency: 'daily' },
  { id: MissionId.WEEKLY_COMPLETE_3_DAILY_MISSIONS, type: MissionType.COMPLETE_DAILY_MISSION_COUNT, descriptionKey: 'mission_WEEKLY_COMPLETE_3_DAILY_MISSIONS_desc', targetValue: 3, rewards: [{ type: MissionRewardType.PLAYER_XP, amount: 75 }, { type: MissionRewardType.GCOINS, amount: 50 }], frequency: 'weekly' },
  { id: MissionId.WEEKLY_ANSWER_20_INTERVALS_CORRECT, type: MissionType.TRAIN_ITEM_CORRECT_COUNT, descriptionKey: 'mission_WEEKLY_ANSWER_20_INTERVALS_CORRECT_desc', targetValue: 20, targetItemType: GameMode.INTERVALS, rewards: [{ type: MissionRewardType.PLAYER_XP, amount: 100 }, { type: MissionRewardType.GCOINS, amount: 70 }], frequency: 'weekly' },
  { id: MissionId.WEEKLY_EARN_250_GCOINS_TOTAL, type: MissionType.EARN_GCOINS_TOTAL, descriptionKey: 'mission_WEEKLY_EARN_250_GCOINS_TOTAL_desc', targetValue: 250, rewards: [{ type: MissionRewardType.PLAYER_XP, amount: 120 }, { type: MissionRewardType.GCOINS, amount: 80 }], frequency: 'weekly' },
  
  { id: MissionId.DAILY_CHALLENGE_SLIME, type: MissionType.START_MONSTER_BATTLE, descriptionKey: 'mission_DAILY_CHALLENGE_SLIME_desc', targetValue: 1, targetMonsterId: MonsterId.MONO_NOTE_SLIME, rewards: [{ type: MissionRewardType.PLAYER_XP, amount: 25 }, { type: MissionRewardType.GCOINS, amount: 10 }], frequency: 'daily' },
  { id: MissionId.DAILY_PET_MAX_HAPPINESS, type: MissionType.PET_REACH_STAT, descriptionKey: 'mission_DAILY_PET_MAX_HAPPINESS_desc', targetValue: MAX_PET_HAPPINESS, targetPetStat: 'HAPPINESS', rewards: [{ type: MissionRewardType.PET_XP, amount: 20 }, { type: MissionRewardType.GCOINS, amount: 10 }], frequency: 'daily' },
  { id: MissionId.DAILY_PLAY_NOTES_FREESTYLE_10, type: MissionType.PLAY_NOTES_FREESTYLE_COUNT, descriptionKey: 'mission_DAILY_PLAY_NOTES_FREESTYLE_10_desc', targetValue: 10, rewards: [{ type: MissionRewardType.PLAYER_XP, amount: 15 }, { type: MissionRewardType.GCOINS, amount: 5 }], frequency: 'daily' },
  { id: MissionId.DAILY_TRAIN_MAJ7_CHORD_3_TIMES, type: MissionType.TRAIN_ITEM_CORRECT_COUNT, descriptionKey: 'mission_DAILY_TRAIN_MAJ7_CHORD_3_TIMES_desc', targetValue: 3, targetItemType: GameMode.CHORDS, targetItemId: 'maj7', rewards: [{ type: MissionRewardType.PLAYER_XP, amount: 30 }, { type: MissionRewardType.GCOINS, amount: 15 }], frequency: 'daily' },
  { id: MissionId.WEEKLY_DEFEAT_ANY_2_MONSTERS, type: MissionType.DEFEAT_MONSTER_COUNT, descriptionKey: 'mission_WEEKLY_DEFEAT_ANY_2_MONSTERS_desc', targetValue: 2, rewards: [{ type: MissionRewardType.PLAYER_XP, amount: 100 }, { type: MissionRewardType.GCOINS, amount: 70 }], frequency: 'weekly' },
  { id: MissionId.WEEKLY_TRAIN_ADVANCED_INTERVAL_5_TIMES, type: MissionType.TRAIN_ADVANCED_ITEM_CORRECT_COUNT, descriptionKey: 'mission_WEEKLY_TRAIN_ADVANCED_INTERVAL_5_TIMES_desc', targetValue: 5, targetItemType: GameMode.INTERVALS, rewards: [{ type: MissionRewardType.PLAYER_XP, amount: 70 }, { type: MissionRewardType.GCOINS, amount: 50 }], frequency: 'weekly' },
];

export const ALL_MONSTERS: MonsterDefinition[] = [
  {
    id: MonsterId.MONO_NOTE_SLIME,
    nameKey: 'monster_MONO_NOTE_SLIME_name',
    descriptionKey: 'monster_MONO_NOTE_SLIME_desc',
    iconComponent: 'MonsterIconPlaceholder',
    stages: [
      { type: GameMode.INTERVALS, itemId: 'M3', difficulty: Difficulty.EASY },
      { type: GameMode.INTERVALS, itemId: 'P5', difficulty: Difficulty.EASY },
    ],
    rewardMementoId: MementoId.SLIME_ESSENCE,
    rewardGcoins: 50,
    rewardPlayerXp: 30,
  },
  {
    id: MonsterId.CHORD_CRACKER,
    nameKey: 'monster_CHORD_CRACKER_name',
    descriptionKey: 'monster_CHORD_CRACKER_desc',
    iconComponent: 'MonsterIconPlaceholder',
    stages: [
      { type: GameMode.CHORDS, itemId: 'maj', difficulty: Difficulty.EASY },
      { type: GameMode.CHORDS, itemId: 'min', difficulty: Difficulty.EASY },
      { type: GameMode.INTERVALS, itemId: 'M2', difficulty: Difficulty.EASY },
    ],
    rewardMementoId: MementoId.CRACKER_TOOTH,
    rewardGcoins: 75,
    rewardPlayerXp: 50,
  },
  {
    id: MonsterId.INTERVAL_IMP,
    nameKey: 'monster_INTERVAL_IMP_name',
    descriptionKey: 'monster_INTERVAL_IMP_desc',
    iconComponent: 'MonsterIconPlaceholder',
    stages: [
      { type: GameMode.INTERVALS, itemId: 'm3', difficulty: Difficulty.MEDIUM },
      { type: GameMode.INTERVALS, itemId: 'P4', difficulty: Difficulty.MEDIUM },
      { type: GameMode.INTERVALS, itemId: 'M6', difficulty: Difficulty.MEDIUM },
      { type: GameMode.INTERVALS, itemId: 'm7', difficulty: Difficulty.MEDIUM },
    ],
    rewardMementoId: MementoId.IMP_HORN,
    rewardGcoins: 120,
    rewardPlayerXp: 80,
  },
  { 
    id: MonsterId.RHYTHM_LORD,
    nameKey: 'monster_RHYTHM_LORD_name',
    descriptionKey: 'monster_RHYTHM_LORD_desc',
    iconComponent: 'MonsterIconPlaceholder', 
    stages: [
      { type: GameMode.INTERVALS, itemId: 'm6', difficulty: Difficulty.MEDIUM },
      { type: GameMode.CHORDS,    itemId: 'min7', difficulty: Difficulty.MEDIUM },
      { type: GameMode.INTERVALS, itemId: 'M7', difficulty: Difficulty.MEDIUM },
      { type: GameMode.CHORDS,    itemId: 'aug', difficulty: Difficulty.MEDIUM },
      { type: GameMode.INTERVALS, itemId: 'TT', difficulty: Difficulty.HARD },
    ],
    rewardMementoId: MementoId.RHYTHM_CORE,
    rewardGcoins: 150,
    rewardPlayerXp: 100,
  },
  { 
    id: MonsterId.HARMONY_SIREN,
    nameKey: 'monster_HARMONY_SIREN_name',
    descriptionKey: 'monster_HARMONY_SIREN_desc',
    iconComponent: 'MonsterIconPlaceholder', 
    stages: [
      { type: GameMode.INTERVALS, itemId: 'M7', difficulty: Difficulty.MEDIUM }, 
      { type: GameMode.CHORDS,    itemId: 'maj7', difficulty: Difficulty.MEDIUM },
      { type: GameMode.INTERVALS, itemId: 'P4', difficulty: Difficulty.MEDIUM }, 
      { type: GameMode.CHORDS,    itemId: 'dim', difficulty: Difficulty.MEDIUM },
      { type: GameMode.INTERVALS, itemId: 'M9', difficulty: Difficulty.HARD }, 
    ],
    rewardMementoId: MementoId.SIREN_SCALE,
    rewardGcoins: 200,
    rewardPlayerXp: 120,
  },
];

export const ALL_MEMENTOS: MementoDefinition[] = [
  { id: MementoId.SLIME_ESSENCE, nameKey: 'memento_SLIME_ESSENCE_name', descriptionKey: 'memento_SLIME_ESSENCE_desc', iconComponent: 'MementoIconPlaceholder', monsterId: MonsterId.MONO_NOTE_SLIME },
  { id: MementoId.CRACKER_TOOTH, nameKey: 'memento_CRACKER_TOOTH_name', descriptionKey: 'memento_CRACKER_TOOTH_desc', iconComponent: 'MementoIconPlaceholder', monsterId: MonsterId.CHORD_CRACKER },
  { id: MementoId.IMP_HORN, nameKey: 'memento_IMP_HORN_name', descriptionKey: 'memento_IMP_HORN_desc', iconComponent: 'MementoIconPlaceholder', monsterId: MonsterId.INTERVAL_IMP },
  { id: MementoId.RHYTHM_CORE, nameKey: 'memento_RHYTHM_CORE_name', descriptionKey: 'memento_RHYTHM_CORE_desc', iconComponent: 'MementoIconPlaceholder', monsterId: MonsterId.RHYTHM_LORD }, 
  { id: MementoId.SIREN_SCALE, nameKey: 'memento_SIREN_SCALE_name', descriptionKey: 'memento_SIREN_SCALE_desc', iconComponent: 'MementoIconPlaceholder', monsterId: MonsterId.HARMONY_SIREN }, 
];

export const QUEST_DEFINITIONS: QuestDefinition[] = [
  {
    id: QuestId.LOST_MUSIC_SHEET_MUSIC_MASTER,
    titleKey: 'quest_LOST_MUSIC_SHEET_MUSIC_MASTER_title',
    descriptionKey: 'quest_LOST_MUSIC_SHEET_MUSIC_MASTER_desc',
    npcId: NPCId.MUSIC_MASTER,
    objectives: [
      { descriptionKey: 'quest_LOST_MUSIC_SHEET_MUSIC_MASTER_obj1', type: QuestObjectiveType.TALK_TO_NPC, targetId: NPCId.MUSIC_MASTER },
      { descriptionKey: 'quest_LOST_MUSIC_SHEET_MUSIC_MASTER_obj2', type: QuestObjectiveType.COLLECT_ITEM, targetId: 'LOST_MUSIC_SHEET_ITEM' }, // Placeholder item ID
      // { descriptionKey: 'quest_LOST_MUSIC_SHEET_MUSIC_MASTER_obj3', type: QuestObjectiveType.DEFEAT_MONSTER, targetId: MonsterId.INTERVAL_IMP }, // Example if a monster guards it
    ],
    rewards: [
      { type: 'gcoins', amount: 100 },
      { type: 'xp', amount: 50 },
      // { type: 'song', songId: 'ANCIENT_MELODY_SONG' } // Placeholder song reward
    ],
    minPlayerLevel: 3,
  },
  // Add more quest definitions here
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: AchievementId.FIRST_CORRECT_INTERVAL, nameKey: 'ach_FIRST_CORRECT_INTERVAL_name', descriptionKey: 'ach_FIRST_CORRECT_INTERVAL_desc', unlocked: false },
  { id: AchievementId.FIRST_CORRECT_CHORD, nameKey: 'ach_FIRST_CORRECT_CHORD_name', descriptionKey: 'ach_FIRST_CORRECT_CHORD_desc', unlocked: false },
  { id: AchievementId.FIRST_CORRECT_MELODY, nameKey: 'ach_FIRST_CORRECT_MELODY_name', descriptionKey: 'ach_FIRST_CORRECT_MELODY_desc', unlocked: false },
  { id: AchievementId.REACH_LEVEL_5, nameKey: 'ach_REACH_LEVEL_5_name', descriptionKey: 'ach_REACH_LEVEL_5_desc', unlocked: false },
  { id: AchievementId.REACH_LEVEL_10, nameKey: 'ach_REACH_LEVEL_10_name', descriptionKey: 'ach_REACH_LEVEL_10_desc', unlocked: false },
  { id: AchievementId.REACH_LEVEL_15, nameKey: 'ach_REACH_LEVEL_15_name', descriptionKey: 'ach_REACH_LEVEL_15_desc', unlocked: false },
  { id: AchievementId.STREAK_5, nameKey: 'ach_STREAK_5_name', descriptionKey: 'ach_STREAK_5_desc', unlocked: false },
  { id: AchievementId.STREAK_10, nameKey: 'ach_STREAK_10_name', descriptionKey: 'ach_STREAK_10_desc', unlocked: false },
  { id: AchievementId.STREAK_15, nameKey: 'ach_STREAK_15_name', descriptionKey: 'ach_STREAK_15_desc', unlocked: false },
  { id: AchievementId.MELODY_RECALL_STREAK_3, nameKey: 'ach_MELODY_RECALL_STREAK_3_name', descriptionKey: 'ach_MELODY_RECALL_STREAK_3_desc', unlocked: false },
  { id: AchievementId.MELODY_RECALL_STREAK_7, nameKey: 'ach_MELODY_RECALL_STREAK_7_name', descriptionKey: 'ach_MELODY_RECALL_STREAK_7_desc', unlocked: false },
  { id: AchievementId.COLLECT_100_GCOINS, nameKey: 'ach_COLLECT_100_GCOINS_name', descriptionKey: 'ach_COLLECT_100_GCOINS_desc', unlocked: false },
  { id: AchievementId.COLLECT_500_GCOINS, nameKey: 'ach_COLLECT_500_GCOINS_name', descriptionKey: 'ach_COLLECT_500_GCOINS_desc', unlocked: false },
  { id: AchievementId.COLLECT_1000_GCOINS, nameKey: 'ach_COLLECT_1000_GCOINS_name', descriptionKey: 'ach_COLLECT_1000_GCOINS_desc', unlocked: false },
  { id: AchievementId.UNLOCK_FIRST_ADVANCED_ITEM, nameKey: 'ach_UNLOCK_FIRST_ADVANCED_ITEM_name', descriptionKey: 'ach_UNLOCK_FIRST_ADVANCED_ITEM_desc', unlocked: false },
  { id: AchievementId.PURCHASE_FIRST_SHOP_ITEM, nameKey: 'ach_PURCHASE_FIRST_SHOP_ITEM_name', descriptionKey: 'ach_PURCHASE_FIRST_SHOP_ITEM_desc', unlocked: false },
  { id: AchievementId.ADOPT_FIRST_PET, nameKey: 'ach_ADOPT_FIRST_PET_name', descriptionKey: 'ach_ADOPT_FIRST_PET_desc', unlocked: false },
  { id: AchievementId.FEED_PET_FIRST_TIME, nameKey: 'ach_FEED_PET_FIRST_TIME_name', descriptionKey: 'ach_FEED_PET_FIRST_TIME_desc', unlocked: false },
  { id: AchievementId.PET_REACH_LEVEL_5, nameKey: 'ach_PET_REACH_LEVEL_5_name', descriptionKey: 'ach_PET_REACH_LEVEL_5_desc', unlocked: false },
  { id: AchievementId.PET_MAX_HAPPINESS, nameKey: 'ach_PET_MAX_HAPPINESS_name', descriptionKey: 'ach_PET_MAX_HAPPINESS_desc', unlocked: false },
  { id: AchievementId.PET_PLAY_10_TIMES, nameKey: 'ach_PET_PLAY_10_TIMES_name', descriptionKey: 'ach_PET_PLAY_10_TIMES_desc', unlocked: false, milestone: PET_INTERACTION_ACHIEVEMENT_MILESTONE },
  { id: AchievementId.PET_COLLECTOR, nameKey: 'ach_PET_COLLECTOR_name', descriptionKey: 'ach_PET_COLLECTOR_desc', unlocked: false, milestone: PET_DEFINITIONS.filter(p => p.cost > 0).length }, 
  { id: AchievementId.PET_MAX_LEVEL_FIRST, nameKey: 'ach_PET_MAX_LEVEL_FIRST_name', descriptionKey: 'ach_PET_MAX_LEVEL_FIRST_desc', unlocked: false },
  { id: AchievementId.PET_CUSTOMIZED_FIRST, nameKey: 'ach_PET_CUSTOMIZED_FIRST_name', descriptionKey: 'ach_PET_CUSTOMIZED_FIRST_desc', unlocked: false },
  { id: AchievementId.PET_FULFILL_REQUEST_FIRST, nameKey: 'ach_PET_FULFILL_REQUEST_FIRST_name', descriptionKey: 'ach_PET_FULFILL_REQUEST_FIRST_desc', unlocked: false },
  { id: AchievementId.FIRST_PET_EVOLUTION, nameKey: 'ach_FIRST_PET_EVOLUTION_name', descriptionKey: 'ach_FIRST_PET_EVOLUTION_desc', unlocked: false },
  { id: AchievementId.M3_NOVICE, nameKey: 'ach_M3_NOVICE_name', descriptionKey: 'ach_M3_NOVICE_desc', unlocked: false, milestone: 10, itemId: 'M3', itemType: GameMode.INTERVALS },
  { id: AchievementId.M3_ADEPT, nameKey: 'ach_M3_ADEPT_name', descriptionKey: 'ach_M3_ADEPT_desc', unlocked: false, milestone: 50, itemId: 'M3', itemType: GameMode.INTERVALS },
  { id: AchievementId.MAJ_TRIAD_NOVICE, nameKey: 'ach_MAJ_TRIAD_NOVICE_name', descriptionKey: 'ach_MAJ_TRIAD_NOVICE_desc', unlocked: false, milestone: 10, itemId: 'maj', itemType: GameMode.CHORDS },
  { id: AchievementId.MAJ_TRIAD_ADEPT, nameKey: 'ach_MAJ_TRIAD_ADEPT_name', descriptionKey: 'ach_MAJ_TRIAD_ADEPT_desc', unlocked: false, milestone: 50, itemId: 'maj', itemType: GameMode.CHORDS },
  { id: AchievementId.MAJ9_INT_NOVICE, nameKey: 'ach_MAJ9_INT_NOVICE_name', descriptionKey: 'ach_MAJ9_INT_NOVICE_desc', unlocked: false, milestone: 10, itemId: 'M9', itemType: GameMode.INTERVALS },
  { id: AchievementId.MAJ9_CHORD_NOVICE, nameKey: 'ach_MAJ9_CHORD_NOVICE_name', descriptionKey: 'ach_MAJ9_CHORD_NOVICE_desc', unlocked: false, milestone: 10, itemId: 'maj9', itemType: GameMode.CHORDS },
  { id: AchievementId.ACHIEVE_FIRST_HOUSE, nameKey: 'ach_ACHIEVE_FIRST_HOUSE_name', descriptionKey: 'ach_ACHIEVE_FIRST_HOUSE_desc', unlocked: false },
  { id: AchievementId.ACHIEVE_UPGRADED_HOUSE_LV2, nameKey: 'ach_ACHIEVE_UPGRADED_HOUSE_LV2_name', descriptionKey: 'ach_ACHIEVE_UPGRADED_HOUSE_LV2_desc', unlocked: false },
  { id: AchievementId.ACHIEVE_UPGRADED_HOUSE_LV3, nameKey: 'ach_ACHIEVE_UPGRADED_HOUSE_LV3_name', descriptionKey: 'ach_ACHIEVE_UPGRADED_HOUSE_LV3_desc', unlocked: false },
  { id: AchievementId.PURCHASE_FIRST_FURNITURE, nameKey: 'ach_PURCHASE_FIRST_FURNITURE_name', descriptionKey: 'ach_PURCHASE_FIRST_FURNITURE_desc', unlocked: false },
  { id: AchievementId.COMPLETE_FIRST_MISSION, nameKey: 'ach_COMPLETE_FIRST_MISSION_name', descriptionKey: 'ach_COMPLETE_FIRST_MISSION_desc', unlocked: false },
  { id: AchievementId.COMPLETE_5_DAILY_MISSIONS, nameKey: 'ach_COMPLETE_5_DAILY_MISSIONS_name', descriptionKey: 'ach_COMPLETE_5_DAILY_MISSIONS_desc', unlocked: false, milestone: 5 },
  { id: AchievementId.COMPLETE_FIRST_WEEKLY_MISSION, nameKey: 'ach_COMPLETE_FIRST_WEEKLY_MISSION_name', descriptionKey: 'ach_COMPLETE_FIRST_WEEKLY_MISSION_desc', unlocked: false },
  
  { id: AchievementId.DEFEAT_FIRST_MONSTER, nameKey: 'ach_DEFEAT_FIRST_MONSTER_name', descriptionKey: 'ach_DEFEAT_FIRST_MONSTER_desc', unlocked: false },
  { id: AchievementId.DEFEAT_MONO_NOTE_SLIME, nameKey: 'ach_DEFEAT_MONO_NOTE_SLIME_name', descriptionKey: 'ach_DEFEAT_MONO_NOTE_SLIME_desc', unlocked: false },
  { id: AchievementId.DEFEAT_CHORD_CRACKER, nameKey: 'ach_DEFEAT_CHORD_CRACKER_name', descriptionKey: 'ach_DEFEAT_CHORD_CRACKER_desc', unlocked: false },
  { id: AchievementId.DEFEAT_INTERVAL_IMP, nameKey: 'ach_DEFEAT_INTERVAL_IMP_name', descriptionKey: 'ach_DEFEAT_INTERVAL_IMP_desc', unlocked: false },
  { id: AchievementId.DEFEAT_RHYTHM_LORD, nameKey: 'ach_DEFEAT_RHYTHM_LORD_name', descriptionKey: 'ach_DEFEAT_RHYTHM_LORD_desc', unlocked: false }, 
  { id: AchievementId.DEFEAT_HARMONY_SIREN, nameKey: 'ach_DEFEAT_HARMONY_SIREN_name', descriptionKey: 'ach_DEFEAT_HARMONY_SIREN_desc', unlocked: false }, 
  { id: AchievementId.COLLECT_ALL_MEMENTOS, nameKey: 'ach_COLLECT_ALL_MEMENTOS_name', descriptionKey: 'ach_COLLECT_ALL_MEMENTOS_desc', unlocked: false, milestone: ALL_MEMENTOS.length },
  { id: AchievementId.QUEST_ACCEPTED_FIRST, nameKey: 'ach_QUEST_ACCEPTED_FIRST_name', descriptionKey: 'ach_QUEST_ACCEPTED_FIRST_desc', unlocked: false },
  { id: AchievementId.QUEST_COMPLETED_FIRST, nameKey: 'ach_QUEST_COMPLETED_FIRST_name', descriptionKey: 'ach_QUEST_COMPLETED_FIRST_desc', unlocked: false },
];

export const INITIAL_PLAYER_DATA: PlayerData = {
  playerName: "",
  xp: 0,
  level: 1,
  gCoins: 0,
  unlockedAchievementIds: [],
  intervalQuestionsAnswered: 0,
  chordQuestionsAnswered: 0,
  melodyRecallQuestionsAnswered: 0, 
  highestStreak: 0,
  melodyRecallHighestStreak: 0, 
  intervalCorrectCounts: {},
  chordCorrectCounts: {},
  melodyRecallCorrectCounts: {}, 
  lastLoginDate: null,
  unlockedMusicalItemIds: [],
  selectedInstrumentSoundId: InstrumentSoundId.SINE,
  purchasedShopItemIds: [{ type: UnlockedItemType.INSTRUMENT_SOUND, id: InstrumentSoundId.SINE }],
  ownedPetIds: [],
  activePetId: null,
  pets: {},
  petFoodCount: 0,
  petInteractionCount: 0,
  houseLevel: 0,
  ownedFurnitureIds: [],
  lastPracticeNookTimestamp: null,
  activeMissions: [],
  lastDailyMissionRefresh: null,
  lastWeeklyMissionRefresh: null,
  completedDailyMissionCountForWeekly: 0,
  defeatedMonsterIds: [], 
  collectedMementos: [], 
  highlightPianoOnPlay: true,
  avatarStyle: AvatarStyle.TYPE_A, 
  activeQuests: [], 
  inventory: [], 
};

export const UI_TEXT_TH: ThaiUIText = {
  appName: "เกมฝึกทักษะการฟัง",
  intervalTraining: "ฝึกจำขั้นคู่เสียง",
  chordTraining: "ฝึกจำคอร์ด",
  melodyRecallTraining: "ฝึกทักษะจำทำนอง", 
  melodyRecallTrainingButton: "ห้องฝึกเพลงตามสั่ง", 
  playPrompt: "กดปุ่มรูปลำโพงเพื่อฟังเสียง",
  selectAnswer: "เลือกคำตอบที่ถูกต้อง:", 
  correct: "ถูกต้อง!",
  incorrect: "ผิด!",
  nextQuestion: "คำถามถัดไป",
  score: "คะแนน:",
  chooseMode: "เลือกโหมดการเล่น:",
  backToMenu: "กลับเมนูหลัก",
  replaySound: "ฟังอีกครั้ง",
  yourAnswer: "คำตอบของคุณ:",
  correctAnswerIs: "คำตอบที่ถูกต้องคือ:",
  level: "ระดับ:",
  start: "เริ่มเกม",
  loading: "กำลังโหลด...",
  difficulty: "ระดับความยาก",
  difficultyPrompt: "เลือกระดับความยาก:",
  easy: "ง่าย (3 โน้ต)", 
  medium: "ปานกลาง (4 โน้ต)", 
  hard: "ยาก (5 โน้ต)", 
  audioContextPrompt: "เกมนี้ต้องใช้เสียง โปรดกดปุ่ม \"เริ่มเกม\" เพื่อเปิดใช้งานเสียง",
  audioNotSupported: "เบราว์เซอร์ของคุณไม่รองรับ Web Audio API ที่จำเป็นสำหรับเกมนี้",
  loadingAudio: "กำลังเตรียมระบบเสียง...",
  currentStreak: "สถิติทำถูกติดต่อกัน:",
  highScore: "คะแนนสูงสุด:",
  submitAnswer: "ส่งคำตอบ", 
  clearInput: "ล้าง", 
  notesPlayedPrompt: "กดโน้ตบนเปียโนตามทำนองที่ได้ยิน:", 
  notesYouPlayed: "โน้ตที่คุณเล่น:", 

  playerLevel: "เลเวล",
  xp: "XP",
  gCoins: "G-Coins",
  achievements: "ความสำเร็จ",
  achievementUnlocked: "ปลดล็อกความสำเร็จ!",
  levelUp: "เลเวลอัพ!",

  summaryPageTitle: "สรุปผลและความก้าวหน้า",
  playerStats: "สถิติผู้เล่น",
  unlockedAchievements: "ความสำเร็จที่ปลดล็อกแล้ว",
  masteryProgress: "ความคืบหน้าการฝึกฝน",
  intervalsMastery: "ความเชี่ยวชาญขั้นคู่เสียง",
  chordsMastery: "ความเชี่ยวชาญคอร์ด",
  melodyRecallMastery: "ความเชี่ยวชาญการจำทำนอง", 
  correctAnswersLabel: "ตอบถูก:",
  nextMilestoneLabel: "เป้าหมายถัดไป:",
  forAchievementText: "สำหรับ",
  allMasteryAchievementsUnlocked: "ปลดล็อกความสำเร็จทั้งหมดสำหรับรายการนี้แล้ว",
  viewSummary: "ดูสรุปผล",
  noAchievementsUnlocked: "ยังไม่มีความสำเร็จที่ปลดล็อก",
  totalCorrectAnswers: "จำนวนครั้งที่ตอบถูกทั้งหมด",

  unlockablesStoreTitle: "ปลดล็อกเนื้อหาดนตรี",
  unlockItem: "ปลดล็อก",
  unlocked: "ปลดล็อกแล้ว",
  costLabel: "ราคา:",
  notEnoughGCoins: "G-Coins ไม่เพียงพอ!",
  dailyRewardTitle: "รางวัลล็อกอินรายวัน!",
  dailyRewardMessage: "คุณได้รับ {amount} G-Coins สำหรับการล็อกอินวันนี้!",
  dailyRewardHouseBonusMessage: "คุณได้รับ {amount} G-Coins (รวมโบนัสจากบ้าน {bonusAmount}!) สำหรับการล็อกอินวันนี้!",

  shopTitle: "ร้านค้าไอเทม",
  shopDescription: "ใช้ G-Coins ของคุณเพื่อซื้อไอเทมเสริมต่างๆ!",
  purchaseItem: "ซื้อ",
  purchased: "ซื้อแล้ว",
  settingsTitle: "ตั้งค่าเกม",
  selectInstrumentSound: "เลือกเสียงเครื่องดนตรี:",
  currentSoundLabel: "เสียงปัจจุบัน:",
  instrumentSoundSine: "เสียง Sine Wave (เริ่มต้น)",
  instrumentSoundSquare: "เสียง Square Wave",
  instrumentSoundTriangle: "เสียง Triangle Wave",
  itemPurchasedSuccess: "คุณซื้อ {itemName} สำเร็จ!",
  viewShop: "ร้านค้า",
  viewUnlockables: "ปลดล็อกเนื้อหา",
  viewSettings: "ตั้งค่า",
  settingHighlightPianoOnPlayLabel: "ไฮไลท์เปียโนเมื่อเล่นโจทย์", 
  settingHighlightPianoOnPlayDesc: "เมื่อเปิดใช้งาน ลิ่มเปียโนที่เกี่ยวข้องกับโจทย์จะถูกไฮไลท์ขณะเล่นเสียง", 
  avatarCustomizationTitle: "ปรับแต่งตัวละคร",
  avatarStyleLabel: "เลือกสไตล์อวตาร:",
  avatarStyleTypeA: "เริ่มต้น (วงกลม)",
  avatarStyleTypeB: "ไอคอน (สี่เหลี่ยม)",
  avatarStyleTypeC: "สี่เหลี่ยม",


  petAdoptionCenterTitle: "ศูนย์รับเลี้ยงเพื่อนซี้",
  adoptPetButton: "รับเลี้ยง {petName}",
  petNameLabel: "ชื่อเพื่อนซี้:",
  petHungerLabel: "ความหิว:",
  feedPetButton: "ให้อาหาร",
  petFoodName: "อาหารเพื่อนซี้ (Buddy Bites)",
  petFoodDescription: "อาหารอร่อยสำหรับเพื่อนซี้ของคุณ",
  notEnoughPetFood: "อาหารเพื่อนซี้ไม่เพียงพอ",
  petAdoptedSuccess: "คุณได้รับเลี้ยง {petName} แล้ว!",
  petFedSuccess: "คุณให้ออาหาร {petName} แล้ว!",

  petKakiName: "คากิ",
  petPlaninName: "ปลานิล",
  petMootodName: "หมูทอด",
  petHoodeeName: "น้องหูดี (เก่า)", 
  petRhythmoName: "น้องจังหวะ (เก่า)",
  petMelodiaName: "น้องทำนอง (เก่า)",
  petKakiEvo1Name: "คากิ ร่างสุดยอด",
  petPlaninEvo1Name: "ปลานิล ร่างสุดยอด",
  petMootodEvo1Name: "หมูทอด ร่างสุดยอด",


  viewPetAdoption: "ศูนย์เพื่อนซี้",
  petStatusTitle: "เพื่อนซี้ของฉัน",
  petHungryNotificationTitle: "เพื่อนซี้หิวแล้ว!",
  petHungryNotificationMessage: "{petName} ดูหิวๆ นะ ให้อาหารหน่อยเร็ว!",
  petAlreadyOwned: "คุณมีเพื่อนซี้ตัวนี้แล้ว",

  petLevelLabel: "เลเวลเพื่อนซี้:",
  petXpLabel: "XP เพื่อนซี้:",
  petHappinessLabel: "ความสุข:",
  playWithPetButton: "เล่นด้วย",
  petPlayCooldownMessage: "คุณเพิ่งเล่นกับเพื่อนซี้ไปเมื่อไม่นานนี้ ลองอีกครั้งในภายหลังนะ",
  petLevelUpNotificationTitle: "เพื่อนซี้เลเวลอัพ!",
  petLevelUpNotificationMessage: "{petName} เลเวลอัพเป็น {level} แล้วนะ!",
  petMaxHappinessMessage: "{petName} ดูมีความสุขสุดๆ ไปเลย!",
  petEvolutionTitle: "พัฒนาร่างสำเร็จ!",
  petEvolutionMessage: "{petName} พัฒนาร่างเป็น {evolvedPetName} แล้ว! เท่สุดๆไปเลย!",

  petManagementTitle: "จัดการเพื่อนซี้",
  selectActivePetLabel: "เลือกเพื่อนซี้ตัวโปรด:",
  activePetLabel: "เพื่อนซี้ปัจจุบัน:",
  ownedPetsLabel: "เพื่อนซี้ของคุณ:",
  noOwnedPets: "คุณยังไม่มีเพื่อนซี้เลย ไปรับเลี้ยงได้ที่ศูนย์ฯ",
  customizePetLabel: "แต่งตัวเพื่อนซี้:",
  applyCustomizationButton: "ใช้",
  petCustomizationColorRed: "ปลอกคอสีแดง",
  petCustomizationColorBlue: "ปลอกคอสีฟ้า",
  petCustomizationColorGreen: "ปลอกคอสีเขียว",
  petCustomizationApplied: "แต่งตัวให้ {petName} ด้วย {itemName} แล้ว!",
  petAbilityLabel: "ความสามารถ:",
  petAbilityDesc_GCOIN_DISCOUNT_UNLOCKABLES: "ลดราคาปลดล็อกเนื้อหาดนตรี {value}%",
  petAbilityDesc_XP_BOOST_TRAINING: "เพิ่ม XP จากการฝึกฝน {value}%",
  petAbilityDesc_PET_XP_BOOST: "เพื่อนซี้ได้รับ XP เพิ่มขึ้น {value}%",
  noActivePetAbility: "ไม่มีความสามารถพิเศษ",
  petSpecialRequestTitle: "คำขอจากเพื่อนซี้!",
  petSpecialRequestListenTo: "{petName} อยากฟังเสียง {targetName} จังเลย! ช่วยหน่อยได้ไหม?",
  petSpecialRequestFulfilled: "เย้! {petName} ดีใจมากเลยที่คุณทำตามคำขอ!",

  petKakiDescription: "คากิ ผู้รักการฟังเสียงทุกชนิด ชอบเรียนรู้ไปพร้อมกับคุณ",
  petPlaninDescription: "ปลานิล ชอบดนตรีที่มีชีวิตชีวาและสนุกกับการปลดล็อกสิ่งใหม่ๆ",
  petMootodDescription: "หมูทอด หลงใหลในท่วงทำนองอันไพเราะ และช่วยให้คุณเก่งขึ้น",
  petHoodeeDescription: "น้องหูดี ผู้รักการฟังเสียงทุกชนิด (เก่า)",
  petRhythmoDescription: "น้องจังหวะ ชอบดนตรีที่มีชีวิตชีวา (เก่า)",
  petMelodiaDescription: "น้องทำนอง หลงใหลในท่วงทำนอง (เก่า)",
  petKakiEvo1Description: "คากิในร่างพัฒนา พร้อมพลังแห่งเสียงที่เฉียบคมยิ่งขึ้น!",
  petPlaninEvo1Description: "ปลานิลในร่างพัฒนา คล่องแคล่วและเชี่ยวชาญด้านเศรษฐศาสตร์ดนตรี!",
  petMootodEvo1Description: "หมูทอดในร่างพัฒนา เต็มเปี่ยมด้วยแรงบันดาลใจจากท่วงทำนอง!",

  playerNameInputTitle: "ตั้งชื่อผู้เล่น",
  enterPlayerNamePrompt: "กรุณาตั้งชื่อผู้เล่นของคุณ:",
  submitPlayerNameButton: "ยืนยันชื่อ",
  playerNameDisplayLabel: "ผู้เล่น:",

  saveGameButton: "บันทึกเกม",
  saveGameSuccessMessage: "บันทึกเกมสำเร็จ!",
  resetGameButton: "เริ่มเกมใหม่",
  confirmResetMessage: "คุณแน่ใจหรือไม่ว่าต้องการเริ่มเกมใหม่? ข้อมูลทั้งหมดจะถูกลบ",
  gameResetSuccessMessage: "รีเซ็ตเกมสำเร็จ! กำลังเริ่มเกมใหม่...",

  myHomeScreenTitle: "บ้านของฉัน",
  currentHouseLevelLabel: "ระดับบ้านปัจจุบัน:",
  upgradeHouseButton: "อัปเกรดบ้าน",
  upgradeToLevelLabel: "อัปเกรดเป็น Level {level}",
  notEnoughGCoinsForUpgrade: "G-Coins ของคุณไม่เพียงพอสำหรับการอัปเกรดนี้",
  houseUpgradeSuccess: "อัปเกรดบ้านเป็น Level {level} สำเร็จ!",
  maxHouseLevelReached: "บ้านของคุณถึงระดับสูงสุดแล้ว!",
  houseLevel0Name: "ที่ดินเปล่า",
  houseLevel1Name: "กระท่อมไม้",
  houseLevel2Name: "บ้านไม้สองชั้น",
  houseLevel3Name: "คฤหาสน์หลังเล็ก",
  houseBenefitDescription: "สิทธิประโยชน์ปัจจุบันจากบ้าน:",
  houseBenefitDailyBonus: "+{amount} G-Coins จากรางวัลล็อกอินรายวัน",
  houseBenefitXpBonus: "+{percent}% XP จากการฝึกฝน",
  houseBenefitGCoinBonus: "+{percent}% G-Coins จากการฝึกฝน",
  newHouseBenefitsUnlocked: "ปลดล็อกสิทธิประโยชน์ใหม่จากบ้าน!",

  furnitureShopSectionTitle: "ร้านค้าเฟอร์นิเจอร์",
  myFurnitureAndEffectsTitle: "เฟอร์นิเจอร์และโบนัส",
  noFurnitureOwned: "คุณยังไม่มีเฟอร์นิเจอร์เลย ลองไปซื้อที่ร้านค้าดูสิ!",

  furniture_GP_001_name: "แกรนด์เปียโน",
  furniture_GP_001_desc: "เปียโนหลังงามที่ช่วยให้การฝึกฝนมีประสิทธิภาพยิ่งขึ้น",
  furniture_GP_001_effectDesc: "+2% XP จากการฝึกฝน",

  furniture_MTS_001_name: "ชั้นหนังสือทฤษฎีดนตรี",
  furniture_MTS_001_desc: "ชั้นหนังสือที่เต็มไปด้วยความรู้ทางดนตรี ช่วยให้คุณเข้าใจเนื้อหาลึกซึ้งได้ง่ายขึ้น",
  furniture_MTS_001_effectDesc: "ส่วนลด 3% สำหรับการปลดล็อกเนื้อหาดนตรีขั้นสูง",

  furniture_CPB_001_name: "เตียงนอนนุ่มนิ่มสำหรับเพื่อนซี้",
  furniture_CPB_001_desc: "เตียงนอนแสนสบายที่ทำให้เพื่อนซี้ของคุณผ่อนคลายและมีความสุขมากขึ้น",
  furniture_CPB_001_effectDesc: "+5 ความสุขเพิ่มเติม เมื่อให้อาหารหรือเล่นกับเพื่อนซี้",

  practiceNookTitle: "มุมซ้อมดนตรี",
  practiceNookDescription: "ใช้เวลาซ้อมดนตรีส่วนตัวเพื่อเพิ่ม XP และความสุขให้เพื่อนซี้เล็กน้อย",
  practiceNookButtonText: "เริ่มซ้อมดนตรี",
  practiceNookCooldownMessage: "คุณเพิ่งซ้อมไป กลับมาใหม่ในอีก {time}",
  practiceNookRewardMessage: "ซ้อมสำเร็จ! ได้รับ {playerXp} XP, {petName} ได้รับ {petXp} XP และ +{petHappiness} ความสุข!",
  practiceNookPetNotActiveMessage: "ซ้อมสำเร็จ! ได้รับ {playerXp} XP (เลือกเพื่อนซี้เพื่อรับโบนัสให้เพื่อนซี้ด้วยนะ)",

  missionsPageTitle: "ภารกิจดนตรี",
  dailyMissionsTitle: "ภารกิจรายวัน",
  weeklyMissionsTitle: "ภารกิจรายสัปดาห์",
  claimRewardButton: "รับรางวัล",
  rewardClaimedButton: "รับแล้ว",
  missionProgressLabel: "ความคืบหน้า:",
  missionRewardsLabel: "รางวัล:",
  missionCompletedNotificationTitle: "ภารกิจสำเร็จ!",
  missionRewardClaimedNotificationTitle: "รับรางวัลแล้ว!",
  noActiveMissions: "ไม่มีภารกิจในขณะนี้",

  mission_DAILY_TRAIN_M3_5_TIMES_desc: "ฝึกจำขั้นคู่ Major Third ให้ถูกต้อง 5 ครั้ง",
  mission_DAILY_STREAK_3_CHORDS_desc: "ทำสถิติ Streak 3 ครั้งในการฝึกคอร์ด",
  mission_DAILY_FEED_PET_1_TIME_desc: "ให้อาหารเพื่อนซี้ของคุณ 1 ครั้ง",
  mission_DAILY_USE_PRACTICE_NOOK_1_TIME_desc: "ใช้มุมซ้อมดนตรี 1 ครั้ง",
  mission_DAILY_EARN_50_GCOINS_TRAINING_desc: "รับ 50 G-Coins จากการฝึกฝน",
  mission_WEEKLY_COMPLETE_3_DAILY_MISSIONS_desc: "ทำภารกิจรายวันสำเร็จ 3 ภารกิจ",
  mission_WEEKLY_ANSWER_20_INTERVALS_CORRECT_desc: "ตอบคำถามขั้นคู่เสียงถูก 20 ครั้ง",
  mission_WEEKLY_EARN_250_GCOINS_TOTAL_desc: "รับ G-Coins ทั้งหมดรวม 250 เหรียญ",
  mission_DAILY_CHALLENGE_SLIME_desc: "วันนี้อากาศดี ลองไปท้าประลองกับ 'สไลม์โน้ตเดียว' ดูหน่อยเป็นไร!",
  mission_DAILY_PET_MAX_HAPPINESS_desc: "ดูแลเพื่อนซี้ตัวปัจจุบันของคุณให้มีความสุขเต็ม 100!",
  mission_DAILY_PLAY_NOTES_FREESTYLE_10_desc: "เข้าไปเล่นโน้ตอย่างน้อย 10 ตัวใน 'ห้องซ้อมอิสระ'",
  mission_DAILY_TRAIN_MAJ7_CHORD_3_TIMES_desc: "ฝึกฝนคอร์ด Major 7th ให้ถูกต้อง 3 ครั้ง",
  mission_WEEKLY_DEFEAT_ANY_2_MONSTERS_desc: "ปราบอสูรชนิดใดก็ได้ให้ครบ 2 ตัวภายในสัปดาห์นี้",
  mission_WEEKLY_TRAIN_ADVANCED_INTERVAL_5_TIMES_desc: "ฝึกฝนขั้นคู่เสียงขั้นสูง (เช่น M9, m9, P11) ให้ถูกต้องรวมกัน 5 ครั้ง",


  monsterLairTitle: "แดนอสูร",
  monsterBattleTitle: "ท้าประลองอสูร",
  monsterpediaTitle: "สมุดมอนสเตอร์",
  challengeMonsterButton: "ท้าทาย",
  monsterDefeatedStatus: "พิชิตแล้ว",
  monsterNotDefeatedStatus: "ยังไม่ได้พิชิต",
  monsterBattleStageLabel: "ด่านที่ {current}/{total}",
  monsterBattleGoodLuckMessage: "ตั้งสมาธิให้ดี! ทุกโน้ตมีความหมาย!",
  monsterBattleDefeatMessage: "พลาดแล้ว! อสูรยังคงแข็งแกร่ง เริ่มใหม่นะ",
  monsterBattleVictoryMessage: "ชนะแล้ว! คุณคือผู้เชี่ยวชาญด้านเสียงตัวจริง!",
  monsterBattleRewardMessage: "คุณได้รับ {mementoName} และ {gcoins} G-Coins!",
  viewMonsterpedia: "สมุดมอนสเตอร์",
  noMementosCollected: "คุณยังไม่ได้สะสมของที่ระลึกจากอสูรเลย",

  monster_MONO_NOTE_SLIME_name: "สไลม์โน้ตเดียว",
  monster_MONO_NOTE_SLIME_desc: "สไลม์ตัวน้อยที่ท้าทายด้วยเสียงพื้นฐาน",
  monster_CHORD_CRACKER_name: "คอร์ดแคร็กเกอร์",
  monster_CHORD_CRACKER_desc: "อสูรผู้ชื่นชอบการทดสอบความเข้าใจในคอร์ดเบื้องต้น",
  monster_INTERVAL_IMP_name: "ภูตขั้นคู่",
  monster_INTERVAL_IMP_desc: "ภูตตัวป่วนที่เชี่ยวชาญการหลอกล่อด้วยขั้นคู่เสียงที่ซับซ้อนขึ้น",
  monster_RHYTHM_LORD_name: "เจ้าแห่งจังหวะหูเหล็ก", 
  monster_RHYTHM_LORD_desc: "อสูรผู้ทดสอบความแม่นยำและความเร็วในการจดจำเสียงอันซับซ้อน", 
  monster_HARMONY_SIREN_name: "ไซเรนเสียงประสาน", 
  monster_HARMONY_SIREN_desc: "นางอสูรผู้ใช้เสียงประสานอันไพเราะแต่ซับซ้อนเพื่อล่อลวงผู้ท้าทาย", 
  
  memento_SLIME_ESSENCE_name: "แก่นสไลม์",
  memento_SLIME_ESSENCE_desc: "หยดแก่นแท้จากสไลม์โน้ตเดียว สั่นไหวด้วยพลังเสียงพื้นฐาน",
  memento_CRACKER_TOOTH_name: "เขี้ยวแคร็กเกอร์",
  memento_CRACKER_TOOTH_desc: "เขี้ยวที่แหลมคมของคอร์ดแคร็กเกอร์ สลักลวดลายคอร์ด",
  memento_IMP_HORN_name: "เขาภูตน้อย",
  memento_IMP_HORN_desc: "เขาเล็กๆ ของภูตขั้นคู่ เต็มไปด้วยพลังแห่งเสียงลวงตา",
  memento_RHYTHM_CORE_name: "แก่นเหล็กจังหวะ", 
  memento_RHYTHM_CORE_desc: "แกนกลางที่สั่นสะเทือนด้วยจังหวะอันแม่นยำ", 
  memento_SIREN_SCALE_name: "เกล็ดเสียงไซเรน", 
  memento_SIREN_SCALE_desc: "เกล็ดเงางามที่สะท้อนเสียงประสานอันลึกลับ", 
  
  ach_ACHIEVE_FIRST_HOUSE_name: "บ้านหลังแรก",
  ach_ACHIEVE_FIRST_HOUSE_desc: "สร้างบ้านหลังแรกเป็นของตัวเองสำเร็จ",
  ach_ACHIEVE_UPGRADED_HOUSE_LV2_name: "บ้านใหม่ไฉไลกว่าเดิม",
  ach_ACHIEVE_UPGRADED_HOUSE_LV2_desc: "อัปเกรดบ้านเป็น Level 2 สำเร็จ",
  ach_ACHIEVE_UPGRADED_HOUSE_LV3_name: "คฤหาสน์ของฉัน",
  ach_ACHIEVE_UPGRADED_HOUSE_LV3_desc: "อัปเกรดบ้านเป็น Level 3 สำเร็จ! สุดยอดไปเลย",
  ach_PURCHASE_FIRST_FURNITURE_name: "นักตกแต่งบ้านมือใหม่",
  ach_PURCHASE_FIRST_FURNITURE_desc: "ซื้อเฟอร์นิเจอร์ชิ้นแรกมาตกแต่งบ้าน",

  ach_REACH_LEVEL_10_name: "ถึงเลเวล 10 แล้ว!",
  ach_REACH_LEVEL_10_desc: "สุดยอด! พัฒนามาถึงเลเวล 10",
  ach_REACH_LEVEL_15_name: "ทะยานสู่เลเวล 15!",
  ach_REACH_LEVEL_15_desc: "ความพยายามของคุณน่าทึ่งมาก! ถึงเลเวล 15 แล้ว",
  ach_STREAK_10_name: "เทพ Streak (10 ครั้ง)",
  ach_STREAK_10_desc: "เหนือชั้น! ตอบถูกติดต่อกัน 10 ครั้ง",
  ach_STREAK_15_name: "ราชันย์ Streak (15 ครั้ง)!",
  ach_STREAK_15_desc: "ไม่มีใครหยุดคุณได้! ตอบถูกติดต่อกัน 15 ครั้ง!",
  ach_COLLECT_500_GCOINS_name: "เศรษฐี G-Coin (500)",
  ach_COLLECT_500_GCOINS_desc: "สะสม G-Coins ครบ 500 เหรียญ! มั่งคั่งจริง!",
  ach_COLLECT_1000_GCOINS_name: "มหาเศรษฐี G-Coin (1000)",
  ach_COLLECT_1000_GCOINS_desc: "ยอดเยี่ยม! สะสม G-Coins ครบ 1000 เหรียญ!",
  ach_UNLOCK_FIRST_ADVANCED_ITEM_name: "นักสำรวจเสียงขั้นสูง",
  ach_UNLOCK_FIRST_ADVANCED_ITEM_desc: "ปลดล็อกเนื้อหาดนตรีขั้นสูงชิ้นแรก",
  ach_PURCHASE_FIRST_SHOP_ITEM_name: "นักช็อปมือใหม่",
  ach_PURCHASE_FIRST_SHOP_ITEM_desc: "ซื้อไอเทมชิ้นแรกจากร้านค้า (ไม่รวมอาหารสัตว์, ของแต่งสัตว์เลี้ยง, และเฟอร์นิเจอร์)",
  ach_ADOPT_FIRST_PET_name: "ครอบครัวใหม่",
  ach_ADOPT_FIRST_PET_desc: "รับเลี้ยงเพื่อนซี้ตัวแรกมาดูแล",
  ach_FEED_PET_FIRST_TIME_name: "มื้อแรกแสนอร่อย",
  ach_FEED_PET_FIRST_TIME_desc: "ให้อาหารเพื่อนซี้ของคุณเป็นครั้งแรก",

  ach_PET_REACH_LEVEL_5_name: "เพื่อนซี้เลเวล 5",
  ach_PET_REACH_LEVEL_5_desc: "เพื่อนซี้ของคุณเติบโตถึงเลเวล 5 แล้ว!",
  ach_PET_MAX_HAPPINESS_name: "เพื่อนซี้แฮปปี้สุดๆ",
  ach_PET_MAX_HAPPINESS_desc: "เพื่อนซี้ของคุณมีความสุขเต็มเปี่ยม!",
  ach_PET_PLAY_10_TIMES_name: "นักเล่นกับเพื่อนซี้",
  ach_PET_PLAY_10_TIMES_desc: "คุณเล่นกับเพื่อนซี้ของคุณครบ 10 ครั้งแล้ว",

  ach_PET_COLLECTOR_name: "นักสะสมเพื่อนซี้",
  ach_PET_COLLECTOR_desc: `รับเลี้ยงเพื่อนซี้ครบ ${PET_DEFINITIONS.filter(p => p.cost > 0).length} แบบ`,
  ach_PET_MAX_LEVEL_FIRST_name: "เพื่อนซี้ถึงขีดสุด!",
  ach_PET_MAX_LEVEL_FIRST_desc: `เลี้ยงเพื่อนซี้ตัวใดตัวหนึ่งจนถึงเลเวล ${MAX_PET_LEVEL}`,
  ach_PET_CUSTOMIZED_FIRST_name: "เพื่อนซี้แต่งสวย",
  ach_PET_CUSTOMIZED_FIRST_desc: "แต่งตัวให้เพื่อนซี้เป็นครั้งแรก",
  ach_PET_FULFILL_REQUEST_FIRST_name: "ผู้ฟังใจดี",
  ach_PET_FULFILL_REQUEST_FIRST_desc: "ทำตามคำขอพิเศษของเพื่อนซี้สำเร็จเป็นครั้งแรก",
  ach_FIRST_PET_EVOLUTION_name: "เพื่อนซี้พัฒนาร่าง!",
  ach_FIRST_PET_EVOLUTION_desc: "เพื่อนซี้ของคุณพัฒนาร่างเป็นครั้งแรก!",


  ach_M3_NOVICE_name: "นักฟัง Major Third ระดับต้น",
  ach_M3_ADEPT_name: "ผู้เชี่ยวชาญ Major Third",
  ach_MAJ_TRIAD_NOVICE_name: "นักฟัง Major Triad ระดับต้น",
  ach_MAJ_TRIAD_ADEPT_name: "ผู้เชี่ยวชาญ Major Triad",
  ach_MAJ9_INT_NOVICE_name: "นักฟัง Major Ninth (ขั้นคู่) ระดับต้น",
  ach_MAJ9_CHORD_NOVICE_name: "นักฟัง Major 9th Chord ระดับต้น",

  ach_FIRST_CORRECT_INTERVAL_name: "ผู้เริ่มต้นฝึกขั้นคู่",
  ach_FIRST_CORRECT_CHORD_name: "ผู้เริ่มต้นฝึกคอร์ด",
  ach_FIRST_CORRECT_MELODY_name: "นักแกะเพลงฝึกหัด", 
  ach_REACH_LEVEL_5_name: "ถึงเลเวล 5 แล้ว!",
  ach_STREAK_5_name: "เซียน Streak (5 ครั้ง)",
  ach_MELODY_RECALL_STREAK_3_name: "จำแม่น (3 ครั้ง)", 
  ach_MELODY_RECALL_STREAK_7_name: "หูทองคำ (7 ครั้ง)", 
  ach_COLLECT_100_GCOINS_name: "นักสะสม G-Coin (100)",
  ach_LISTEN_MASTER_LV1_name: "ผู้เชี่ยวชาญการฟัง LV1 (Placeholder)",

  ach_FIRST_CORRECT_INTERVAL_desc: "ตอบคำถามเกี่ยวกับขั้นคู่เสียงถูกเป็นครั้งแรก",
  ach_FIRST_CORRECT_CHORD_desc: "ตอบคำถามเกี่ยวกับคอร์ดถูกเป็นครั้งแรก",
  ach_FIRST_CORRECT_MELODY_desc: "จำทำนองเพลงสั้นๆ ถูกเป็นครั้งแรก", 
  ach_REACH_LEVEL_5_desc: "มีพัฒนาการจนถึงเลเวล 5",
  ach_STREAK_5_desc: "สุดยอด! ตอบถูกติดต่อกัน 5 ครั้ง",
  ach_MELODY_RECALL_STREAK_3_desc: "จำทำนองถูกติดต่อกัน 3 ครั้ง", 
  ach_MELODY_RECALL_STREAK_7_desc: "สุดยอด! จำทำนองถูกติดต่อกัน 7 ครั้ง", 
  ach_COLLECT_100_GCOINS_desc: "สะสม G-Coins ครบ 100 เหรียญแล้ว",
  ach_LISTEN_MASTER_LV1_desc: "บรรลุเป้าหมายการฟังระดับ 1 (Placeholder)",
  ach_M3_NOVICE_desc: "ตอบขั้นคู่ Major Third ถูก 10 ครั้ง",
  ach_M3_ADEPT_desc: "ตอบขั้นคู่ Major Third ถูก 50 ครั้ง",
  ach_MAJ_TRIAD_NOVICE_desc: "ตอบคอร์ด Major Triad ถูก 10 ครั้ง",
  ach_MAJ_TRIAD_ADEPT_desc: "ตอบคอร์ด Major Triad ถูก 50 ครั้ง",
  ach_MAJ9_INT_NOVICE_desc: "ตอบขั้นคู่ Major Ninth ถูก 10 ครั้ง",
  ach_MAJ9_CHORD_NOVICE_desc: "ตอบคอร์ด Major 9th ถูก 10 ครั้ง",

  ach_COMPLETE_FIRST_MISSION_name: "นักสำรวจภารกิจ",
  ach_COMPLETE_FIRST_MISSION_desc: "ทำภารกิจแรกสำเร็จ! หนทางยังอีกยาวไกล",
  ach_COMPLETE_5_DAILY_MISSIONS_name: "กิจวัตรประจำวัน",
  ach_COMPLETE_5_DAILY_MISSIONS_desc: "ทำภารกิจรายวันสำเร็จครบ 5 ภารกิจ",
  ach_COMPLETE_FIRST_WEEKLY_MISSION_name: "เป้าหมายระยะยาว",
  ach_COMPLETE_FIRST_WEEKLY_MISSION_desc: "ทำภารกิจรายสัปดาห์สำเร็จเป็นครั้งแรก",

  ach_DEFEAT_FIRST_MONSTER_name: "นักล่าอสูรฝึกหัด", 
  ach_DEFEAT_FIRST_MONSTER_desc: "ปราบอสูรตัวแรกได้สำเร็จ! ก้าวแรกสู่ความเป็นตำนาน", 
  ach_DEFEAT_MONO_NOTE_SLIME_name: "ผู้พิชิตสไลม์", 
  ach_DEFEAT_MONO_NOTE_SLIME_desc: "เอาชนะสไลม์โน้ตเดียวได้แล้ว", 
  ach_DEFEAT_CHORD_CRACKER_name: "ผู้สยบคอร์ดแคร็กเกอร์", 
  ach_DEFEAT_CHORD_CRACKER_desc: "เอาชนะคอร์ดแคร็กเกอร์ได้สำเร็จ", 
  ach_DEFEAT_INTERVAL_IMP_name: "ผู้ปราบภูตขั้นคู่", 
  ach_DEFEAT_INTERVAL_IMP_desc: "สามารถเอาชนะภูตขั้นคู่จอมป่วนได้", 
  ach_DEFEAT_RHYTHM_LORD_name: "จ้าวแห่งจังหวะ", 
  ach_DEFEAT_RHYTHM_LORD_desc: "เอาชนะเจ้าแห่งจังหวะหูเหล็กได้สำเร็จ", 
  ach_DEFEAT_HARMONY_SIREN_name: "ผู้สยบไซเรน", 
  ach_DEFEAT_HARMONY_SIREN_desc: "เอาชนะไซเรนเสียงประสานผู้ลึกลับได้", 
  ach_COLLECT_ALL_MEMENTOS_name: "นักสะสมของที่ระลึกอสูร",
  ach_COLLECT_ALL_MEMENTOS_desc: "สะสมของที่ระลึกจากอสูรทุกตัวได้ครบ!",
  ach_QUEST_ACCEPTED_FIRST_name: "นักผจญภัยมือใหม่",
  ach_QUEST_ACCEPTED_FIRST_desc: "รับเควสแรกของคุณแล้ว! การเดินทางเริ่มต้นขึ้น",
  ach_QUEST_COMPLETED_FIRST_name: "ผู้ช่วยแห่งเสียงเพลง",
  ach_QUEST_COMPLETED_FIRST_desc: "ทำเควสแรกสำเร็จ! คุณคือความหวังของโลกดนตรี",


  freestyleJamRoomTitle: "ห้องซ้อมอิสระ",
  freestyleJamRoomDescription: "ทดลองเล่นเสียงต่างๆ ได้ตามใจคุณ!",
  selectSoundLabel: "เลือกเสียงเครื่องดนตรี:",
  freestyleJamRoomButton: "ห้องซ้อมอิสระ",

  gameGuideTitle: "คู่มือการเล่น",
  gameGuide_MainGoal_Title: "เป้าหมายหลักของเกม",
  gameGuide_MainGoal_Desc: "เกมนี้จะช่วยให้คุณพัฒนาทักษะการฟังเสียงดนตรี โดยเน้นที่การจดจำขั้นคู่เสียงและคอร์ดต่างๆ เพื่อให้คุณเป็นนักดนตรีที่เก่งขึ้น!",
  gameGuide_Training_Title: "การฝึกฝน",
  gameGuide_Training_Modes_Title: "โหมดการฝึก:",
  gameGuide_Training_Modes_Interval_Desc: "ฝึกจำขั้นคู่เสียง - เรียนรู้การแยกแยะความแตกต่างระหว่างเสียงสองเสียง",
  gameGuide_Training_Modes_Chord_Desc: "ฝึกจำคอร์ด - ทำความคุ้นเคยกับเสียงของคอร์ดหลากหลายประเภท",
  gameGuide_Training_Difficulty_Title: "ระดับความยาก:",
  gameGuide_Training_Difficulty_Desc: "เลือกจาก ง่าย, ปานกลาง, หรือ ยาก เพื่อท้าทายตัวเองตามความสามารถ",
  gameGuide_Training_Rewards_Title: "รางวัลจากการฝึก:",
  gameGuide_Training_Rewards_Desc: "ทุกครั้งที่ตอบถูก คุณจะได้รับ XP (ค่าประสบการณ์) เพื่อเพิ่มเลเวลผู้เล่น และ G-Coins สำหรับใช้จ่ายในเกม",
  gameGuide_MonsterLair_Title: "แดนอสูร",
  gameGuide_MonsterLair_Desc: "ท้าทายอสูรต่างๆ ที่มีความสามารถในการใช้เสียงเฉพาะตัว! คุณต้องตอบคำถามจากอสูรให้ถูกทั้งหมดโดยห้ามพลาดแม้แต่ครั้งเดียวเพื่อเอาชนะ",
  gameGuide_MonsterLair_Rewards_Title: "รางวัลจากอสูร:",
  gameGuide_MonsterLair_Rewards_Desc: "เมื่อชนะอสูร คุณจะได้รับของที่ระลึก (Memento) จากอสูรตัวนั้น, G-Coins และ XP เล็กน้อย",
  gameGuide_Pets_Title: "เพื่อนซี้ (Pets)",
  gameGuide_Pets_Adoption_Title: "การรับเลี้ยง:",
  gameGuide_Pets_Adoption_Desc: "ไปที่ศูนย์เพื่อนซี้เพื่อรับเลี้ยงเพื่อนซี้สุดน่ารักมาเป็นคู่หู",
  gameGuide_Pets_Care_Title: "การดูแล:",
  gameGuide_Pets_Care_Desc: "ให้อาหารและเล่นกับเพื่อนซี้เพื่อเพิ่มความสุขและ XP ให้พวกเขา อย่าลืมดูแลไม่ให้หิวนะ!",
  gameGuide_Pets_Abilities_Title: "ความสามารถพิเศษ:",
  gameGuide_Pets_Abilities_Desc: "เพื่อนซี้แต่ละตัวมีความสามารถพิเศษที่ช่วยให้คุณได้เปรียบในเกม เช่น ลดราคาสินค้า หรือเพิ่ม XP ที่ได้รับ เพื่อนซี้บางตัวสามารถพัฒนาร่างเมื่อถึงเลเวลที่กำหนดเพื่อเพิ่มความสามารถได้ด้วย!",
  gameGuide_MyHome_Title: "บ้านของฉัน",
  gameGuide_MyHome_Upgrade_Title: "อัปเกรดบ้าน:",
  gameGuide_MyHome_Upgrade_Desc: "ใช้ G-Coins อัปเกรดบ้านเพื่อรับโบนัสถาวร เช่น G-Coins เพิ่มจากรางวัลล็อกอินรายวัน หรือ XP เพิ่มจากการฝึกฝน",
  gameGuide_MyHome_Furniture_Title: "เฟอร์นิเจอร์:",
  gameGuide_MyHome_Furniture_Desc: "ซื้อเฟอร์นิเจอร์มาตกแต่งบ้านและรับเอฟเฟกต์เสริมเล็กน้อย",
  gameGuide_MyHome_PracticeNook_Title: "มุมซ้อมดนตรี:",
  gameGuide_MyHome_PracticeNook_Desc: "ใช้มุมซ้อมดนตรีในบ้านเพื่อรับ XP และเพิ่มความสุขให้เพื่อนซี้ได้ (มี Cooldown)",
  gameGuide_Missions_Title: "ภารกิจดนตรี",
  gameGuide_Missions_Desc: "ทำภารกิจรายวันและรายสัปดาห์ให้สำเร็จเพื่อรับรางวัล G-Coins และ XP มากมาย!",
  gameGuide_FreestyleJamRoom_Title: "ห้องซ้อมอิสระ",
  gameGuide_FreestyleJamRoom_Desc: "เข้ามาเล่นเปียโนได้อย่างอิสระ ทดลองเสียงเครื่องดนตรีต่างๆ ที่คุณปลดล็อกมาโดยไม่มีแรงกดดัน",
  gameGuide_GCoins_Shop_Title: "G-Coins และร้านค้า",
  gameGuide_GCoins_Shop_GCoins_Title: "G-Coins:",
  gameGuide_GCoins_Shop_GCoins_Desc: "สกุลเงินหลักในเกม ได้รับจากการฝึกฝน, ทำภารกิจ, รางวัลล็อกอิน และการปราบอสูร",
  gameGuide_GCoins_Shop_Shop_Title: "ร้านค้า:",
  gameGuide_GCoins_Shop_Shop_Desc: "ใช้ G-Coins ซื้อไอเทมต่างๆ เช่น เสียงเครื่องดนตรีใหม่, อาหารเพื่อนซี้, ของตกแต่งเพื่อนซี้, และเฟอร์นิเจอร์",
  gameGuide_GCoins_Shop_Unlockables_Title: "ปลดล็อกเนื้อหา:",
  gameGuide_GCoins_Shop_Unlockables_Desc: "ใช้ G-Coins ปลดล็อกขั้นคู่เสียงและคอร์ดขั้นสูงเพื่อเพิ่มความท้าทายในการฝึกฝน",
  gameGuide_Progression_Title: "ความก้าวหน้าในเกม",
  gameGuide_Progression_PlayerLevel_Title: "เลเวลผู้เล่น:",
  gameGuide_Progression_PlayerLevel_Desc: "สะสม XP เพื่อเพิ่มเลเวล ปลดล็อกความสามารถใหม่ๆ (ถ้ามี) และแสดงความเชี่ยวชาญของคุณ",
  gameGuide_Progression_Achievements_Title: "ความสำเร็จ (Achievements):",
  gameGuide_Progression_Achievements_Desc: "บรรลุเป้าหมายต่างๆ ในเกมเพื่อปลดล็อกความสำเร็จและรับรางวัลพิเศษ",
  gameGuide_Progression_Monsterpedia_Title: "สมุดมอนสเตอร์:",
  gameGuide_Progression_Monsterpedia_Desc: "ดูข้อมูลอสูรทั้งหมดที่คุณเคยเจอและของที่ระลึกที่คุณสะสมได้",
  viewGameGuide: "คู่มือการเล่น",

  npcHubTitle: "ศูนย์รวม NPC",
  questInteractionTitle: "สนทนาเควส",
  npc_MUSIC_MASTER_name: "ปรมาจารย์ดนตรี",
  npc_MEMENTO_COLLECTOR_name: "นักสะสม Memento",
  npc_ZALAY_BEAT_name: "Zalay Beat",
  
  quest_LOST_MUSIC_SHEET_MUSIC_MASTER_title: "โน้ตเพลงที่หายไป",
  quest_LOST_MUSIC_SHEET_MUSIC_MASTER_desc: "ปรมาจารย์ดนตรีทำโน้ตเพลงสำคัญหายไป! ดูเหมือนว่าเขาจะต้องการความช่วยเหลือจากนักดนตรีผู้มีความสามารถเช่นคุณในการตามหา",
  quest_LOST_MUSIC_SHEET_MUSIC_MASTER_obj1: "พูดคุยกับปรมาจารย์ดนตรีเพื่อรับทราบรายละเอียด",
  quest_LOST_MUSIC_SHEET_MUSIC_MASTER_obj2: "ตามหาโน้ตเพลงโบราณที่หายไป",
  // quest_LOST_MUSIC_SHEET_MUSIC_MASTER_obj3: "เอาชนะมอนสเตอร์ที่เฝ้าโน้ตเพลง",


  quest_NEW_PET_TRAINING_NPC_GENERIC_title: "ฝึกสัตว์เลี้ยงตัวใหม่", 
  
  viewNPCHub: "ศูนย์รวม NPC",
  questAcceptButton: "รับเควส",
  questInProgressLabel: "กำลังดำเนินเควส...",
  questCompletedLabel: "เควสสำเร็จ!",
  questClaimRewardButton: "รับรางวัล",
  questRewardsLabel: "รางวัล:",
  questObjectivesLabel: "เป้าหมาย:",
  questStartedNotificationTitle: "เควสเริ่มขึ้นแล้ว!",
  questObjectiveCompletedNotificationTitle: "เป้าหมายสำเร็จ!",
  questCompletedNotificationTitle: "เควสสำเร็จ!",
  questRewardClaimedNotificationTitle: "รับรางวัลเควสแล้ว!",
  npcGenericGreeting: "สวัสดี มีอะไรให้ช่วยหรือ?",
  npcMusicMasterGreeting: "ยินดีต้อนรับนักดนตรีหนุ่มสาว! มีอะไรให้ข้าช่วยหรือไม่?",
  npcMementoCollectorGreeting: "ของเก่าเล่าเรื่องราว... สนใจจะฟังหรือแลกเปลี่ยนอะไรไหม?",
  npcZalayBeatGreeting: "การเชื่อมต่อเสร็จสมบูรณ์... ต้องการความช่วยเหลือด้านเทคโนโลยีหรือดนตรีขั้นสูงหรือ?",
  npcMusicMasterLostSheetDialogue: "โอ้ แย่แล้ว! ข้าทำโน้ตเพลงโบราณชิ้นสำคัญหายไป มันเป็นเพลงที่มีพลังมาก... เจ้าพอจะช่วยข้าตามหาได้หรือไม่?",
  npcMusicMasterLostSheetThanks: "ขอบคุณมาก! เจ้าได้ช่วยรักษาสมบัติทางดนตรีชิ้นสำคัญเอาไว้",
  npcNoQuestsAvailable: "ตอนนี้ข้ายังไม่มีอะไรให้เจ้าช่วยนะ",
};

export function shuffleArray<T,>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const getDifficultyText = (difficulty: Difficulty | null, mode?: GameMode | null): string => {
    if (!difficulty) return '';
    if (mode === GameMode.MELODY_RECALL) {
        switch(difficulty) {
            case Difficulty.EASY: return UI_TEXT_TH.easy.replace('(3 โน้ต)', '').trim() + ' (3 โน้ต)';
            case Difficulty.MEDIUM: return UI_TEXT_TH.medium.replace('(4 โน้ต)', '').trim() + ' (4 โน้ต)';
            case Difficulty.HARD: return UI_TEXT_TH.hard.replace('(5 โน้ต)', '').trim() + ' (5 โน้ต)';
            default: return '';
        }
    }
    switch(difficulty) {
        case Difficulty.EASY: return UI_TEXT_TH.easy.replace(/\s\(.*?\)/g, '').trim();
        case Difficulty.MEDIUM: return UI_TEXT_TH.medium.replace(/\s\(.*?\)/g, '').trim();
        case Difficulty.HARD: return UI_TEXT_TH.hard.replace(/\s\(.*?\)/g, '').trim();
        default: return '';
    }
}

export function isMusicalItemUnlocked(itemId: string, itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD, playerData: PlayerData): boolean {
  return playerData.unlockedMusicalItemIds.some(item => item.id === itemId && item.type === itemType);
}

export function getAvailableTrainingItems<T extends IntervalInfo | ChordInfo>(
  allItems: T[],
  playerData: PlayerData,
  itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD
): T[] {
  const items = allItems.filter(item => !item.isAdvanced || isMusicalItemUnlocked(item.id, itemType, playerData));
  if(items.length === 0 && itemType === UnlockedItemType.INTERVAL) return EASY_INTERVALS as T[]; 
  if(items.length === 0 && itemType === UnlockedItemType.CHORD) return EASY_CHORDS as T[]; 
  return items;
}


export function getInstrumentSoundName(soundId: InstrumentSoundId, uiText: ThaiUIText): string {
  const soundInfo = ALL_INSTRUMENT_SOUNDS.find(s => s.id === soundId);
  return soundInfo ? uiText[soundInfo.nameKey] : "Unknown Sound";
}

export function getPetName(petId: PetId | undefined | null, uiText: ThaiUIText): string {
  if (!petId) return "";
  const petInfo = PET_DEFINITIONS.find(p => p.id === petId);
  if (petInfo && petInfo.nameKey && uiText[petInfo.nameKey]) {
    return uiText[petInfo.nameKey];
  } else if (petInfo) {
    return petInfo.id.toString(); // Fallback to PetId string if nameKey is bad
  }
  return "Pet"; // Default fallback if no petInfo or other issues
}

export function getHouseLevelName(level: number, uiText: ThaiUIText): string {
  switch (level) {
    case 0: return uiText.houseLevel0Name;
    case 1: return uiText.houseLevel1Name;
    case 2: return uiText.houseLevel2Name;
    case 3: return uiText.houseLevel3Name;
    default: return `Level ${level}`;
  }
}

export function getFurnitureItemDetails(furnitureId: FurnitureId): FurnitureItem | undefined {
    return ALL_FURNITURE_ITEMS.find(f => f.id === furnitureId);
}

export function formatTime(ms: number): string {
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    let timeString = "";
    if (hours > 0) {
        timeString += `${hours} ชั่วโมง `;
    }
    if (minutes > 0 || hours > 0) {
        timeString += `${minutes} นาที `;
    }
    if (hours === 0 && minutes === 0 ) {
         timeString += `${seconds} วินาที`;
    }
    return timeString.trim();
}

export function getMissionDefinition(missionId: MissionId): MissionDefinition | undefined {
    return MISSION_DEFINITIONS.find(def => def.id === missionId);
}

export function getMonsterDefinition(monsterId: MonsterId): MonsterDefinition | undefined {
    return ALL_MONSTERS.find(def => def.id === monsterId);
}

export function getMementoDefinition(mementoId: MementoId): MementoDefinition | undefined {
    return ALL_MEMENTOS.find(def => def.id === mementoId);
}

export function getNPCName(npcId: NPCId, uiText: ThaiUIText): string {
    switch(npcId) {
        case NPCId.MUSIC_MASTER: return uiText.npc_MUSIC_MASTER_name;
        case NPCId.MEMENTO_COLLECTOR: return uiText.npc_MEMENTO_COLLECTOR_name;
        case NPCId.ZALAY_BEAT: return uiText.npc_ZALAY_BEAT_name;
        default: 
          const _exhaustiveCheck: never = npcId;
          return "NPC";
    }
}

export function getQuestDefinition(questId: QuestId): QuestDefinition | undefined {
    return QUEST_DEFINITIONS.find(def => def.id === questId);
}

export function getQuestTitle(questId: QuestId, uiText: ThaiUIText): string {
    const definition = getQuestDefinition(questId);
    return definition ? uiText[definition.titleKey] : "Quest";
}

export { FurnitureId }; // Re-export FurnitureId
