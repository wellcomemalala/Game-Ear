
export enum GameMode {
  INTERVALS = 'INTERVALS',
  CHORDS = 'CHORDS',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum AppView {
  AUDIO_PROMPT = 'AUDIO_PROMPT',
  PLAYER_NAME_INPUT = 'PLAYER_NAME_INPUT',
  MENU = 'MENU',
  DIFFICULTY_SELECTION = 'DIFFICULTY_SELECTION',
  INTERVAL_TRAINER = 'INTERVAL_TRAINER',
  CHORD_TRAINER = 'CHORD_TRAINER',
  SUMMARY_PAGE = 'SUMMARY_PAGE',
  UNLOCKABLES_STORE = 'UNLOCKABLES_STORE',
  SHOP = 'SHOP',
  SETTINGS = 'SETTINGS',
  PET_ADOPTION_PAGE = 'PET_ADOPTION_PAGE',
  PET_MANAGEMENT_PAGE = 'PET_MANAGEMENT_PAGE',
  MY_HOME = 'MY_HOME',
  MISSIONS_PAGE = 'MISSIONS_PAGE',
  MONSTER_LAIR = 'MONSTER_LAIR', 
  MONSTER_BATTLE = 'MONSTER_BATTLE', 
  MONSTERPEDIA = 'MONSTERPEDIA', 
  FREESTYLE_JAM_ROOM = 'FREESTYLE_JAM_ROOM',
  GAME_GUIDE_PAGE = 'GAME_GUIDE_PAGE', // New View
}

export interface IntervalInfo {
  id: string;
  name: string;
  thaiName: string;
  semitones: number;
  isAdvanced?: boolean;
  cost?: number;
}

export interface ChordInfo {
  id: string;
  name: string;
  thaiName: string;
  semitones: number[];
  isAdvanced?: boolean;
  cost?: number;
}

export interface Question<T> {
  item: T;
  rootFrequency: number;
  options: T[];
  correctAnswerId: string;
}

export enum InstrumentSoundId {
  SINE = 'SINE',
  SQUARE = 'SQUARE',
  TRIANGLE = 'TRIANGLE',
}

export interface InstrumentSoundInfo {
  id: InstrumentSoundId;
  nameKey: keyof ThaiUIText;
  cost: number;
  isDefault?: boolean;
}

export enum PetId {
  KAKI = 'KAKI',
  PLANIN = 'PLANIN',
  MOOTOD = 'MOOTOD',
}

export enum PetAbilityType {
  GCOIN_DISCOUNT_UNLOCKABLES = 'GCOIN_DISCOUNT_UNLOCKABLES',
  XP_BOOST_TRAINING = 'XP_BOOST_TRAINING',
  PET_XP_BOOST = 'PET_XP_BOOST',
}

export interface PetAbility {
  type: PetAbilityType;
  value: number;
  descriptionKey: keyof ThaiUIText;
  condition?: (pet: ActivePet) => boolean;
}

export interface PetDefinition {
  id: PetId;
  nameKey: keyof ThaiUIText;
  iconComponent?: string;
  cost: number;
  ability?: PetAbility;
  descriptionKey: keyof ThaiUIText;
}

export interface PetCustomization {
  collarColor?: string;
}

export interface PetSpecialRequest {
  type: 'listen_interval' | 'listen_chord';
  targetId: string;
  targetName: string;
  descriptionKey: keyof ThaiUIText;
  fulfilled: boolean;
  rewardPetXp: number;
  rewardHappiness: number;
}

export interface ActivePet {
  id: PetId;
  name: string;
  hunger: number;
  lastFedTimestamp: number;
  lastLoginTimestampForHunger: number;
  xp: number;
  level: number;
  happiness: number;
  lastPlayedTimestamp: number;
  lastInteractionTimestamp: number;
  customization: PetCustomization;
  specialRequest: PetSpecialRequest | null;
}

export enum AchievementId {
  FIRST_CORRECT_INTERVAL = 'FIRST_CORRECT_INTERVAL',
  FIRST_CORRECT_CHORD = 'FIRST_CORRECT_CHORD',
  REACH_LEVEL_5 = 'REACH_LEVEL_5',
  REACH_LEVEL_10 = 'REACH_LEVEL_10',
  REACH_LEVEL_15 = 'REACH_LEVEL_15',
  STREAK_5 = 'STREAK_5',
  STREAK_10 = 'STREAK_10',
  STREAK_15 = 'STREAK_15',
  COLLECT_100_GCOINS = 'COLLECT_100_GCOINS',
  COLLECT_500_GCOINS = 'COLLECT_500_GCOINS',
  COLLECT_1000_GCOINS = 'COLLECT_1000_GCOINS',
  UNLOCK_FIRST_ADVANCED_ITEM = 'UNLOCK_FIRST_ADVANCED_ITEM',
  PURCHASE_FIRST_SHOP_ITEM = 'PURCHASE_FIRST_SHOP_ITEM',
  ADOPT_FIRST_PET = 'ADOPT_FIRST_PET',
  FEED_PET_FIRST_TIME = 'FEED_PET_FIRST_TIME',

  PET_REACH_LEVEL_5 = 'PET_REACH_LEVEL_5',
  PET_MAX_HAPPINESS = 'PET_MAX_HAPPINESS',
  PET_PLAY_10_TIMES = 'PET_PLAY_10_TIMES',

  PET_COLLECTOR = 'PET_COLLECTOR',
  PET_MAX_LEVEL_FIRST = 'PET_MAX_LEVEL_FIRST',
  PET_CUSTOMIZED_FIRST = 'PET_CUSTOMIZED_FIRST',
  PET_FULFILL_REQUEST_FIRST = 'PET_FULFILL_REQUEST_FIRST',

  M3_NOVICE = 'M3_NOVICE',
  M3_ADEPT = 'M3_ADEPT',
  MAJ_TRIAD_NOVICE = 'MAJ_TRIAD_NOVICE',
  MAJ_TRIAD_ADEPT = 'MAJ_TRIAD_ADEPT',
  MAJ9_INT_NOVICE = 'MAJ9_INT_NOVICE',
  MAJ9_CHORD_NOVICE = 'MAJ9_CHORD_NOVICE',

  ACHIEVE_FIRST_HOUSE = 'ACHIEVE_FIRST_HOUSE',
  ACHIEVE_UPGRADED_HOUSE_LV2 = 'ACHIEVE_UPGRADED_HOUSE_LV2',
  ACHIEVE_UPGRADED_HOUSE_LV3 = 'ACHIEVE_UPGRADED_HOUSE_LV3',
  PURCHASE_FIRST_FURNITURE = 'PURCHASE_FIRST_FURNITURE',

  COMPLETE_FIRST_MISSION = 'COMPLETE_FIRST_MISSION',
  COMPLETE_5_DAILY_MISSIONS = 'COMPLETE_5_DAILY_MISSIONS',
  COMPLETE_FIRST_WEEKLY_MISSION = 'COMPLETE_FIRST_WEEKLY_MISSION',

  DEFEAT_FIRST_MONSTER = 'DEFEAT_FIRST_MONSTER', 
  DEFEAT_MONO_NOTE_SLIME = 'DEFEAT_MONO_NOTE_SLIME', 
  DEFEAT_CHORD_CRACKER = 'DEFEAT_CHORD_CRACKER', 
  DEFEAT_INTERVAL_IMP = 'DEFEAT_INTERVAL_IMP', 
  DEFEAT_RHYTHM_LORD = 'DEFEAT_RHYTHM_LORD',
  DEFEAT_HARMONY_SIREN = 'DEFEAT_HARMONY_SIREN',
  COLLECT_ALL_MEMENTOS = 'COLLECT_ALL_MEMENTOS', 
}

export interface Achievement {
  id: AchievementId;
  nameKey: keyof ThaiUIText;
  descriptionKey: keyof ThaiUIText;
  unlocked: boolean;
  icon?: string;
  milestone?: number;
  itemId?: string;
  itemType?: GameMode;
}

export enum UnlockedItemType {
  INTERVAL = 'INTERVAL',
  CHORD = 'CHORD',
  INSTRUMENT_SOUND = 'INSTRUMENT_SOUND',
  AVATAR_ITEM = 'AVATAR_ITEM',
  PET_FOOD = 'PET_FOOD',
  PET_CUSTOMIZATION = 'PET_CUSTOMIZATION',
  FURNITURE = 'FURNITURE',
}

export enum FurnitureId {
  GRAND_PIANO = 'GP_001',
  MUSIC_THEORY_SHELF = 'MTS_001',
  COMFY_PET_BED = 'CPB_001',
}

export interface FurnitureItem {
  id: FurnitureId;
  nameKey: keyof ThaiUIText;
  descriptionKey: keyof ThaiUIText;
  effectDescriptionKey: keyof ThaiUIText;
  cost: number;
  type: UnlockedItemType.FURNITURE;
  iconComponent: string;
}

export enum MissionId {
  DAILY_TRAIN_M3_5_TIMES = 'DAILY_TRAIN_M3_5_TIMES',
  DAILY_STREAK_3_CHORDS = 'DAILY_STREAK_3_CHORDS',
  DAILY_FEED_PET_1_TIME = 'DAILY_FEED_PET_1_TIME',
  DAILY_USE_PRACTICE_NOOK_1_TIME = 'DAILY_USE_PRACTICE_NOOK_1_TIME',
  DAILY_EARN_50_GCOINS_TRAINING = 'DAILY_EARN_50_GCOINS_TRAINING',
  WEEKLY_COMPLETE_3_DAILY_MISSIONS = 'WEEKLY_COMPLETE_3_DAILY_MISSIONS',
  WEEKLY_ANSWER_20_INTERVALS_CORRECT = 'WEEKLY_ANSWER_20_INTERVALS_CORRECT',
  WEEKLY_EARN_250_GCOINS_TOTAL = 'WEEKLY_EARN_250_GCOINS_TOTAL',

  // New Diverse Missions
  DAILY_CHALLENGE_SLIME = 'DAILY_CHALLENGE_SLIME',
  DAILY_PET_MAX_HAPPINESS = 'DAILY_PET_MAX_HAPPINESS',
  DAILY_PLAY_NOTES_FREESTYLE_10 = 'DAILY_PLAY_NOTES_FREESTYLE_10',
  DAILY_TRAIN_MAJ7_CHORD_3_TIMES = 'DAILY_TRAIN_MAJ7_CHORD_3_TIMES',
  WEEKLY_DEFEAT_ANY_2_MONSTERS = 'WEEKLY_DEFEAT_ANY_2_MONSTERS',
  WEEKLY_TRAIN_ADVANCED_INTERVAL_5_TIMES = 'WEEKLY_TRAIN_ADVANCED_INTERVAL_5_TIMES',
}

export enum MissionType {
  TRAIN_ITEM_CORRECT_COUNT = 'TRAIN_ITEM_CORRECT_COUNT',
  TRAINING_STREAK = 'TRAINING_STREAK',
  FEED_PET_COUNT = 'FEED_PET_COUNT',
  USE_PRACTICE_NOOK_COUNT = 'USE_PRACTICE_NOOK_COUNT',
  EARN_GCOINS_FROM_TRAINING = 'EARN_GCOINS_FROM_TRAINING',
  EARN_GCOINS_TOTAL = 'EARN_GCOINS_TOTAL',
  COMPLETE_DAILY_MISSION_COUNT = 'COMPLETE_DAILY_MISSION_COUNT',
  
  // New Mission Types
  START_MONSTER_BATTLE = 'START_MONSTER_BATTLE',
  DEFEAT_MONSTER_COUNT = 'DEFEAT_MONSTER_COUNT',
  PET_REACH_STAT = 'PET_REACH_STAT', // e.g. happiness, level
  PLAY_NOTES_FREESTYLE_COUNT = 'PLAY_NOTES_FREESTYLE_COUNT',
  TRAIN_ADVANCED_ITEM_CORRECT_COUNT = 'TRAIN_ADVANCED_ITEM_CORRECT_COUNT',
}

export enum MissionRewardType {
  GCOINS = 'GCOINS',
  PLAYER_XP = 'PLAYER_XP',
  PET_XP = 'PET_XP',
}

export interface MissionReward {
  type: MissionRewardType;
  amount: number;
}

export interface MissionDefinition {
  id: MissionId;
  type: MissionType;
  descriptionKey: keyof ThaiUIText;
  targetValue: number;
  targetItemType?: GameMode.INTERVALS | GameMode.CHORDS; // For TRAIN_ITEM and TRAIN_ADVANCED_ITEM
  targetItemId?: string; // For TRAIN_ITEM
  gameModeScope?: GameMode; // For TRAINING_STREAK
  targetMonsterId?: MonsterId; // For START_MONSTER_BATTLE
  targetPetStat?: 'HAPPINESS' | 'LEVEL'; // For PET_REACH_STAT
  frequency: 'daily' | 'weekly';
  icon?: string;
  rewards: MissionReward[];
}

export interface ActiveMission {
  definitionId: MissionId;
  progress: number;
  completed: boolean;
  claimed: boolean;
  lastGcoinCheckValue?: number; // For EARN_GCOINS_TOTAL
  currentPetStatValue?: number; // For PET_REACH_STAT
}

export enum MonsterId {
  MONO_NOTE_SLIME = 'MONO_NOTE_SLIME',
  CHORD_CRACKER = 'CHORD_CRACKER',
  INTERVAL_IMP = 'INTERVAL_IMP',
  RHYTHM_LORD = 'RHYTHM_LORD', 
  HARMONY_SIREN = 'HARMONY_SIREN', 
}

export enum MementoId {
  SLIME_ESSENCE = 'SLIME_ESSENCE',
  CRACKER_TOOTH = 'CRACKER_TOOTH',
  IMP_HORN = 'IMP_HORN',
  RHYTHM_CORE = 'RHYTHM_CORE', 
  SIREN_SCALE = 'SIREN_SCALE', 
}

export interface MonsterStage {
  type: GameMode.INTERVALS | GameMode.CHORDS;
  itemId?: string; 
  difficulty: Difficulty;
}

export interface MonsterDefinition {
  id: MonsterId;
  nameKey: keyof ThaiUIText;
  descriptionKey: keyof ThaiUIText;
  iconComponent: string; 
  stages: MonsterStage[];
  rewardMementoId: MementoId;
  rewardGcoins?: number;
  rewardPlayerXp?: number;
}

export interface MementoDefinition {
  id: MementoId;
  nameKey: keyof ThaiUIText;
  descriptionKey: keyof ThaiUIText;
  iconComponent: string; 
  monsterId: MonsterId; 
}

export interface PlayerData {
  playerName: string;
  xp: number;
  level: number;
  gCoins: number;
  unlockedAchievementIds: AchievementId[];
  intervalQuestionsAnswered: number;
  chordQuestionsAnswered: number;
  highestStreak: number;
  intervalCorrectCounts: { [intervalId: string]: number };
  chordCorrectCounts: { [chordId: string]: number };
  lastLoginDate: string | null;
  unlockedMusicalItemIds: { type: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD, id: string }[];

  selectedInstrumentSoundId: InstrumentSoundId;
  purchasedShopItemIds: { type: UnlockedItemType.INSTRUMENT_SOUND | UnlockedItemType.AVATAR_ITEM | UnlockedItemType.PET_FOOD | UnlockedItemType.PET_CUSTOMIZATION | UnlockedItemType.FURNITURE, id: string }[];

  ownedPetIds: PetId[];
  activePetId: PetId | null;
  pets: { [petId: string]: ActivePet };

  petFoodCount: number;
  petInteractionCount: number;
  houseLevel: number;
  ownedFurnitureIds: FurnitureId[];
  lastPracticeNookTimestamp: number | null;

  activeMissions: ActiveMission[];
  lastDailyMissionRefresh: number | null;
  lastWeeklyMissionRefresh: number | null;
  completedDailyMissionCountForWeekly: number;

  defeatedMonsterIds: MonsterId[]; 
  collectedMementos: MementoId[]; 
}

export interface NotificationMessage {
  id: string;
  type: 'levelUp' | 'achievement' | 'info' | 'dailyReward' | 'pet' | 'petLevelUp' | 'petSpecialRequest' | 'gameEvent' | 'practiceNook' | 'missionCompleted' | 'missionRewardClaimed' | 'monsterDefeated'; 
  titleKey: keyof ThaiUIText;
  messageKey?: keyof ThaiUIText;
  itemName?: string; 
  amount?: number;
  petName?: string;
  newLevel?: number;
  baseAmount?: number;
  houseBonusAmount?: number;
  playerXpReward?: number;
  petXpReward?: number;
  petHappinessReward?: number;
  missionName?: string;
  monsterName?: string; 
  mementoName?: string; 
}

export interface ShopItem {
  id: string;
  nameKey: keyof ThaiUIText;
  descriptionKey: keyof ThaiUIText;
  cost: number;
  type: UnlockedItemType.INSTRUMENT_SOUND | UnlockedItemType.AVATAR_ITEM | UnlockedItemType.PET_FOOD | UnlockedItemType.PET_CUSTOMIZATION | UnlockedItemType.FURNITURE;
  icon?: string;
  data?: any;
}

export interface ThaiUIText {
  appName: string;
  intervalTraining: string;
  chordTraining: string;
  playPrompt: string;
  selectAnswer: string;
  correct: string;
  incorrect: string;
  nextQuestion: string;
  score: string;
  chooseMode: string;
  backToMenu: string;
  replaySound: string;
  yourAnswer: string;
  correctAnswerIs: string;
  level: string;
  start: string;
  loading: string;
  difficulty: string;
  difficultyPrompt: string;
  easy: string;
  medium: string;
  hard: string;
  audioContextPrompt: string;
  audioNotSupported: string;
  loadingAudio: string;
  currentStreak: string;
  highScore: string;

  playerLevel: string;
  xp: string;
  gCoins: string;
  achievements: string;
  achievementUnlocked: string;
  levelUp: string;

  summaryPageTitle: string;
  playerStats: string;
  unlockedAchievements: string;
  masteryProgress: string;
  intervalsMastery: string;
  chordsMastery: string;
  correctAnswersLabel: string;
  nextMilestoneLabel: string;
  forAchievementText: string;
  allMasteryAchievementsUnlocked: string;
  viewSummary: string;
  noAchievementsUnlocked: string;
  totalCorrectAnswers: string;

  unlockablesStoreTitle: string;
  unlockItem: string;
  unlocked: string;
  costLabel: string;
  notEnoughGCoins: string;
  dailyRewardTitle: string;
  dailyRewardMessage: string;
  dailyRewardHouseBonusMessage: string;

  shopTitle: string;
  shopDescription: string;
  purchaseItem: string;
  purchased: string;
  settingsTitle: string;
  selectInstrumentSound: string;
  currentSoundLabel: string;
  instrumentSoundSine: string;
  instrumentSoundSquare: string;
  instrumentSoundTriangle: string;
  itemPurchasedSuccess: string;
  viewShop: string;
  viewUnlockables: string;
  viewSettings: string;

  petAdoptionCenterTitle: string;
  adoptPetButton: string;
  petNameLabel: string;
  petHungerLabel: string;
  feedPetButton: string;
  petFoodName: string;
  petFoodDescription: string;
  notEnoughPetFood: string;
  petAdoptedSuccess: string;
  petFedSuccess: string;

  petKakiName: string;
  petPlaninName: string;
  petMootodName: string;
  petHoodeeName: string;
  petRhythmoName: string;
  petMelodiaName: string;

  viewPetAdoption: string;
  petStatusTitle: string;
  petHungryNotificationTitle: string;
  petHungryNotificationMessage: string;
  petAlreadyOwned: string;

  petLevelLabel: string;
  petXpLabel: string;
  petHappinessLabel: string;
  playWithPetButton: string;
  petPlayCooldownMessage: string;
  petLevelUpNotificationTitle: string;
  petLevelUpNotificationMessage: string;
  petMaxHappinessMessage: string;

  petManagementTitle: string;
  selectActivePetLabel: string;
  activePetLabel: string;
  ownedPetsLabel: string;
  noOwnedPets: string;
  customizePetLabel: string;
  applyCustomizationButton: string;
  petCustomizationColorRed: string;
  petCustomizationColorBlue: string;
  petCustomizationColorGreen: string;
  petCustomizationApplied: string;
  petAbilityLabel: string;
  petAbilityDesc_GCOIN_DISCOUNT_UNLOCKABLES: string;
  petAbilityDesc_XP_BOOST_TRAINING: string;
  petAbilityDesc_PET_XP_BOOST: string;
  noActivePetAbility: string;
  petSpecialRequestTitle: string;
  petSpecialRequestListenTo: string;
  petSpecialRequestFulfilled: string;

  petKakiDescription: string;
  petPlaninDescription: string;
  petMootodDescription: string;
  petHoodeeDescription: string;
  petRhythmoDescription: string;
  petMelodiaDescription: string;

  playerNameInputTitle: string;
  enterPlayerNamePrompt: string;
  submitPlayerNameButton: string;
  playerNameDisplayLabel: string;

  saveGameButton: string;
  saveGameSuccessMessage: string;
  resetGameButton: string;
  confirmResetMessage: string;
  gameResetSuccessMessage: string;

  myHomeScreenTitle: string;
  currentHouseLevelLabel: string;
  upgradeHouseButton: string;
  upgradeToLevelLabel: string;
  notEnoughGCoinsForUpgrade: string;
  houseUpgradeSuccess: string;
  maxHouseLevelReached: string;
  houseLevel0Name: string;
  houseLevel1Name: string;
  houseLevel2Name: string;
  houseLevel3Name: string;
  houseBenefitDescription: string;
  houseBenefitDailyBonus: string;
  houseBenefitXpBonus: string;
  houseBenefitGCoinBonus: string;
  newHouseBenefitsUnlocked: string;

  furnitureShopSectionTitle: string;
  myFurnitureAndEffectsTitle: string;
  noFurnitureOwned: string;

  furniture_GP_001_name: string;
  furniture_GP_001_desc: string;
  furniture_GP_001_effectDesc: string;

  furniture_MTS_001_name: string;
  furniture_MTS_001_desc: string;
  furniture_MTS_001_effectDesc: string;

  furniture_CPB_001_name: string;
  furniture_CPB_001_desc: string;
  furniture_CPB_001_effectDesc: string;

  practiceNookTitle: string;
  practiceNookDescription: string;
  practiceNookButtonText: string;
  practiceNookCooldownMessage: string;
  practiceNookRewardMessage: string;
  practiceNookPetNotActiveMessage: string;

  missionsPageTitle: string;
  dailyMissionsTitle: string;
  weeklyMissionsTitle: string;
  claimRewardButton: string;
  rewardClaimedButton: string;
  missionProgressLabel: string;
  missionRewardsLabel: string;
  missionCompletedNotificationTitle: string;
  missionRewardClaimedNotificationTitle: string;
  noActiveMissions: string;

  mission_DAILY_TRAIN_M3_5_TIMES_desc: string;
  mission_DAILY_STREAK_3_CHORDS_desc: string;
  mission_DAILY_FEED_PET_1_TIME_desc: string;
  mission_DAILY_USE_PRACTICE_NOOK_1_TIME_desc: string;
  mission_DAILY_EARN_50_GCOINS_TRAINING_desc: string;
  mission_WEEKLY_COMPLETE_3_DAILY_MISSIONS_desc: string;
  mission_WEEKLY_ANSWER_20_INTERVALS_CORRECT_desc: string;
  mission_WEEKLY_EARN_250_GCOINS_TOTAL_desc: string;
  mission_DAILY_CHALLENGE_SLIME_desc: string;
  mission_DAILY_PET_MAX_HAPPINESS_desc: string;
  mission_DAILY_PLAY_NOTES_FREESTYLE_10_desc: string;
  mission_DAILY_TRAIN_MAJ7_CHORD_3_TIMES_desc: string;
  mission_WEEKLY_DEFEAT_ANY_2_MONSTERS_desc: string;
  mission_WEEKLY_TRAIN_ADVANCED_INTERVAL_5_TIMES_desc: string;

  monsterLairTitle: string;
  monsterBattleTitle: string;
  monsterpediaTitle: string;
  challengeMonsterButton: string;
  monsterDefeatedStatus: string;
  monsterNotDefeatedStatus: string;
  monsterBattleStageLabel: string;
  monsterBattleGoodLuckMessage: string;
  monsterBattleDefeatMessage: string;
  monsterBattleVictoryMessage: string;
  monsterBattleRewardMessage: string;
  viewMonsterpedia: string;
  noMementosCollected: string;
  monster_MONO_NOTE_SLIME_name: string;
  monster_MONO_NOTE_SLIME_desc: string;
  monster_CHORD_CRACKER_name: string;
  monster_CHORD_CRACKER_desc: string;
  monster_INTERVAL_IMP_name: string;
  monster_INTERVAL_IMP_desc: string;
  monster_RHYTHM_LORD_name: string; 
  monster_RHYTHM_LORD_desc: string; 
  monster_HARMONY_SIREN_name: string; 
  monster_HARMONY_SIREN_desc: string; 
  
  memento_SLIME_ESSENCE_name: string;
  memento_SLIME_ESSENCE_desc: string;
  memento_CRACKER_TOOTH_name: string;
  memento_CRACKER_TOOTH_desc: string;
  memento_IMP_HORN_name: string;
  memento_IMP_HORN_desc: string;
  memento_RHYTHM_CORE_name: string; 
  memento_RHYTHM_CORE_desc: string; 
  memento_SIREN_SCALE_name: string; 
  memento_SIREN_SCALE_desc: string; 
  
  ach_ACHIEVE_FIRST_HOUSE_name: string;
  ach_ACHIEVE_FIRST_HOUSE_desc: string;
  ach_ACHIEVE_UPGRADED_HOUSE_LV2_name: string;
  ach_ACHIEVE_UPGRADED_HOUSE_LV2_desc: string;
  ach_ACHIEVE_UPGRADED_HOUSE_LV3_name: string;
  ach_ACHIEVE_UPGRADED_HOUSE_LV3_desc: string;
  ach_PURCHASE_FIRST_FURNITURE_name: string;
  ach_PURCHASE_FIRST_FURNITURE_desc: string;

  ach_REACH_LEVEL_10_name: string;
  ach_REACH_LEVEL_10_desc: string;
  ach_REACH_LEVEL_15_name: string;
  ach_REACH_LEVEL_15_desc: string;
  ach_STREAK_10_name: string;
  ach_STREAK_10_desc: string;
  ach_STREAK_15_name: string;
  ach_STREAK_15_desc: string;
  ach_COLLECT_500_GCOINS_name: string;
  ach_COLLECT_500_GCOINS_desc: string;
  ach_COLLECT_1000_GCOINS_name: string;
  ach_COLLECT_1000_GCOINS_desc: string;
  ach_UNLOCK_FIRST_ADVANCED_ITEM_name: string;
  ach_UNLOCK_FIRST_ADVANCED_ITEM_desc: string;
  ach_PURCHASE_FIRST_SHOP_ITEM_name: string;
  ach_PURCHASE_FIRST_SHOP_ITEM_desc: string;
  ach_ADOPT_FIRST_PET_name: string;
  ach_ADOPT_FIRST_PET_desc: string;
  ach_FEED_PET_FIRST_TIME_name: string;
  ach_FEED_PET_FIRST_TIME_desc: string;

  ach_PET_REACH_LEVEL_5_name: string;
  ach_PET_REACH_LEVEL_5_desc: string;
  ach_PET_MAX_HAPPINESS_name: string;
  ach_PET_MAX_HAPPINESS_desc: string;
  ach_PET_PLAY_10_TIMES_name: string;
  ach_PET_PLAY_10_TIMES_desc: string;

  ach_PET_COLLECTOR_name: string;
  ach_PET_COLLECTOR_desc: string;
  ach_PET_MAX_LEVEL_FIRST_name: string;
  ach_PET_MAX_LEVEL_FIRST_desc: string;
  ach_PET_CUSTOMIZED_FIRST_name: string;
  ach_PET_CUSTOMIZED_FIRST_desc: string;
  ach_PET_FULFILL_REQUEST_FIRST_name: string;
  ach_PET_FULFILL_REQUEST_FIRST_desc: string;

  ach_M3_NOVICE_name: string;
  ach_M3_ADEPT_name: string;
  ach_MAJ_TRIAD_NOVICE_name: string;
  ach_MAJ_TRIAD_ADEPT_name: string;
  ach_MAJ9_INT_NOVICE_name: string;
  ach_MAJ9_CHORD_NOVICE_name: string;

  ach_FIRST_CORRECT_INTERVAL_name: string;
  ach_FIRST_CORRECT_CHORD_name: string;
  ach_REACH_LEVEL_5_name: string;
  ach_STREAK_5_name: string;
  ach_COLLECT_100_GCOINS_name: string;
  ach_LISTEN_MASTER_LV1_name: string;

  ach_FIRST_CORRECT_INTERVAL_desc: string;
  ach_FIRST_CORRECT_CHORD_desc: string;
  ach_REACH_LEVEL_5_desc: string;
  ach_STREAK_5_desc: string;
  ach_COLLECT_100_GCOINS_desc: string;
  ach_LISTEN_MASTER_LV1_desc: string;
  ach_M3_NOVICE_desc: string;
  ach_M3_ADEPT_desc: string;
  ach_MAJ_TRIAD_NOVICE_desc: string;
  ach_MAJ_TRIAD_ADEPT_desc: string;
  ach_MAJ9_INT_NOVICE_desc: string;
  ach_MAJ9_CHORD_NOVICE_desc: string;

  ach_COMPLETE_FIRST_MISSION_name: string;
  ach_COMPLETE_FIRST_MISSION_desc: string;
  ach_COMPLETE_5_DAILY_MISSIONS_name: string;
  ach_COMPLETE_5_DAILY_MISSIONS_desc: string;
  ach_COMPLETE_FIRST_WEEKLY_MISSION_name: string;
  ach_COMPLETE_FIRST_WEEKLY_MISSION_desc: string;

  ach_DEFEAT_FIRST_MONSTER_name: string; 
  ach_DEFEAT_FIRST_MONSTER_desc: string; 
  ach_DEFEAT_MONO_NOTE_SLIME_name: string; 
  ach_DEFEAT_MONO_NOTE_SLIME_desc: string; 
  ach_DEFEAT_CHORD_CRACKER_name: string; 
  ach_DEFEAT_CHORD_CRACKER_desc: string; 
  ach_DEFEAT_INTERVAL_IMP_name: string; 
  ach_DEFEAT_INTERVAL_IMP_desc: string; 
  ach_DEFEAT_RHYTHM_LORD_name: string; 
  ach_DEFEAT_RHYTHM_LORD_desc: string; 
  ach_DEFEAT_HARMONY_SIREN_name: string; 
  ach_DEFEAT_HARMONY_SIREN_desc: string; 
  ach_COLLECT_ALL_MEMENTOS_name: string; 
  ach_COLLECT_ALL_MEMENTOS_desc: string; 

  freestyleJamRoomTitle: string;
  freestyleJamRoomDescription: string;
  selectSoundLabel: string;
  freestyleJamRoomButton: string;

  // Game Guide Page
  gameGuideTitle: string;
  gameGuide_MainGoal_Title: string;
  gameGuide_MainGoal_Desc: string;
  gameGuide_Training_Title: string;
  gameGuide_Training_Modes_Title: string;
  gameGuide_Training_Modes_Interval_Desc: string;
  gameGuide_Training_Modes_Chord_Desc: string;
  gameGuide_Training_Difficulty_Title: string;
  gameGuide_Training_Difficulty_Desc: string;
  gameGuide_Training_Rewards_Title: string;
  gameGuide_Training_Rewards_Desc: string;
  gameGuide_MonsterLair_Title: string;
  gameGuide_MonsterLair_Desc: string;
  gameGuide_MonsterLair_Rewards_Title: string;
  gameGuide_MonsterLair_Rewards_Desc: string;
  gameGuide_Pets_Title: string;
  gameGuide_Pets_Adoption_Title: string;
  gameGuide_Pets_Adoption_Desc: string;
  gameGuide_Pets_Care_Title: string;
  gameGuide_Pets_Care_Desc: string;
  gameGuide_Pets_Abilities_Title: string;
  gameGuide_Pets_Abilities_Desc: string;
  gameGuide_MyHome_Title: string;
  gameGuide_MyHome_Upgrade_Title: string;
  gameGuide_MyHome_Upgrade_Desc: string;
  gameGuide_MyHome_Furniture_Title: string;
  gameGuide_MyHome_Furniture_Desc: string;
  gameGuide_MyHome_PracticeNook_Title: string;
  gameGuide_MyHome_PracticeNook_Desc: string;
  gameGuide_Missions_Title: string;
  gameGuide_Missions_Desc: string;
  gameGuide_FreestyleJamRoom_Title: string;
  gameGuide_FreestyleJamRoom_Desc: string;
  gameGuide_GCoins_Shop_Title: string;
  gameGuide_GCoins_Shop_GCoins_Title: string;
  gameGuide_GCoins_Shop_GCoins_Desc: string;
  gameGuide_GCoins_Shop_Shop_Title: string;
  gameGuide_GCoins_Shop_Shop_Desc: string;
  gameGuide_GCoins_Shop_Unlockables_Title: string;
  gameGuide_GCoins_Shop_Unlockables_Desc: string;
  gameGuide_Progression_Title: string;
  gameGuide_Progression_PlayerLevel_Title: string;
  gameGuide_Progression_PlayerLevel_Desc: string;
  gameGuide_Progression_Achievements_Title: string;
  gameGuide_Progression_Achievements_Desc: string;
  gameGuide_Progression_Monsterpedia_Title: string;
  gameGuide_Progression_Monsterpedia_Desc: string;
  viewGameGuide: string; // For the button
}
