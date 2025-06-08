
// interface-types.ts

// Import enums that are used by the interfaces in this file
import {
  AchievementId,
  AppView,
  AvatarStyle,
  ChildEvent,
  ChildGrowthStage,
  ChildNeedType,
  ClothingId,
  ClothingLayer,
  Difficulty,
  FaceId,
  FamilyActivityId,
  FurnitureId,
  GameMode,
  GiftPreferenceLevel,
  HairColorId,
  HairId,
  InstrumentSoundId,
  MementoId,
  MissionId,
  MissionRewardType,
  MissionType,
  MonsterId,
  NPCId,
  PetAbilityType,
  PetCustomizationItemId,
  PetId,
  QuestId,
  QuestItemId,
  QuestObjectiveType,
  QuestStatusEnum,
  RelationshipStatus,
  ShopItemId,
  SkinColorId,
  SongId,
  UnlockedItemType
} from './enum-types'; // Assuming enum-types.ts exports these

// Define ThaiUIText minimally to satisfy Achievement interface's nameKey and descriptionKey
// A more complete definition would list all possible keys from ui-text.ts
export interface ThaiUIText {
  [key: string]: string;
}

export interface Achievement {
  id: AchievementId;
  nameKey: keyof ThaiUIText;
  descriptionKey: keyof ThaiUIText;
  unlocked: boolean;
  icon?: string;
  milestone?: number;
  itemId?: string;
  itemType?: GameMode; // Corrected to allow any GameMode
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

export interface NoteInfo {
    midiNote: number;
    duration: number;
    name?: string;
}

export interface Question<T> {
  item: T;
  rootFrequency: number;
  options: T[];
  correctAnswerId: string;
  melody?: NoteInfo[];
}

export interface InstrumentSoundInfo {
  id: InstrumentSoundId;
  nameKey: keyof ThaiUIText;
  cost: number;
  isDefault?: boolean;
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
  evolvesTo?: PetId;
  evolutionLevel?: number;
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
  specialRequestGeneratedTimestamp: number | null;
  lastBoredomDecayTimestamp: number | null;
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

export interface MissionReward {
  type: MissionRewardType;
  amount: number;
}

export interface MissionDefinition {
  id: MissionId;
  type: MissionType;
  descriptionKey: keyof ThaiUIText;
  targetValue: number;
  targetItemType?: GameMode.INTERVALS | GameMode.CHORDS;
  targetItemId?: string;
  gameModeScope?: GameMode;
  targetMonsterId?: MonsterId;
  targetPetStat?: 'HAPPINESS' | 'LEVEL';
  petId?: PetId;
  frequency: 'daily' | 'weekly';
  icon?: string;
  rewards: MissionReward[];
}

export interface ActiveMission {
  definitionId: MissionId;
  progress: number;
  completed: boolean;
  claimed: boolean;
  lastGcoinCheckValue?: number;
  currentPetStatValue?: number;
}

export interface MonsterStage {
  type: GameMode.INTERVALS | GameMode.CHORDS | GameMode.MELODY_RECALL;
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
  questItemDrop?: { itemId: string | QuestItemId, chance: number };
}

export interface MementoDefinition {
  id: MementoId;
  nameKey: keyof ThaiUIText;
  descriptionKey: keyof ThaiUIText;
  iconComponent: string;
  monsterId: MonsterId;
}

export interface PlayerAppearance {
  faceId: FaceId;
  hairId: HairId;
  hairColor: HairColorId;
  skinColor: SkinColorId;
  equippedShirt?: ClothingId;
}

export interface ClothingItem {
  id: ClothingId;
  nameKey: keyof ThaiUIText;
  descriptionKey: keyof ThaiUIText;
  layer: ClothingLayer;
  cost: number;
  type: UnlockedItemType.CLOTHING;
  iconComponent?: string;
  color: string;
}

export interface QuestObjective {
  descriptionKey: keyof ThaiUIText;
  type: QuestObjectiveType;
  targetId?: string | NPCId | MonsterId | QuestItemId | SongId;
  targetCount?: number;
}

export interface QuestReward {
  type: 'gcoins' | 'xp' | 'item' | 'song' | 'pet_food' | 'pet_xp';
  amount?: number;
  itemId?: string | QuestItemId;
  songId?: SongId;
}

export interface NPCDefinition {
  id: NPCId;
  nameKey: keyof ThaiUIText;
  portraitUrl?: string;
  personalitySnippetKey: keyof ThaiUIText;
  likesSnippetKey: keyof ThaiUIText;
  goalSnippetKey: keyof ThaiUIText;
  giftPreferences?: { [itemId in ShopItemId | MementoId]?: GiftPreferenceLevel };
  birthday?: { month: number; day: number };
}

export interface QuestDefinition {
  id: QuestId;
  titleKey: keyof ThaiUIText;
  descriptionKey: keyof ThaiUIText;
  npcId: NPCId;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  prerequisiteQuestId?: QuestId;
  minPlayerLevel?: number;
}

export interface ActiveQuestObjective {
  completed: boolean;
  currentProgress?: number;
}

export interface ActiveQuest {
  questId: QuestId;
  status: QuestStatusEnum;
  currentObjectiveIndex: number;
  objectiveProgress: ActiveQuestObjective[];
}

export interface RelationshipData {
  npcId: NPCId;
  rp: number;
  lastPositiveInteractionDate: number; // Timestamp
  status: RelationshipStatus;
  eventFlags: { [eventId: string]: boolean };
  viewedEventFlags: { [eventId: string]: boolean };
}

export interface PlayerData {
  playerName: string;
  xp: number;
  level: number;
  gCoins: number;
  unlockedAchievementIds: AchievementId[];
  intervalQuestionsAnswered: number;
  chordQuestionsAnswered: number;
  melodyRecallQuestionsAnswered: number;
  highestStreak: number;
  melodyRecallHighestStreak: number;
  intervalCorrectCounts: { [intervalId: string]: number };
  chordCorrectCounts: { [chordId: string]: number };
  melodyRecallCorrectCounts: { [melodySignature: string]: number };
  lastLoginDate: string | null;
  unlockedMusicalItemIds: { type: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD, id: string }[];
  unlockedSongIds: SongId[];
  unlockedClothingIds: ClothingId[];
  selectedInstrumentSoundId: InstrumentSoundId;
  purchasedShopItemIds: { type: UnlockedItemType.INSTRUMENT_SOUND | UnlockedItemType.AVATAR_ITEM | UnlockedItemType.PET_FOOD | UnlockedItemType.PET_CUSTOMIZATION | UnlockedItemType.FURNITURE | UnlockedItemType.CLOTHING | UnlockedItemType.KEY_ITEM | UnlockedItemType.CHILD_CARE | UnlockedItemType.GENERAL_GIFT, id: string }[];
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
  highlightPianoOnPlay: boolean;
  avatarStyle: AvatarStyle;
  appearance: PlayerAppearance;
  activeQuests: ActiveQuest[];
  inventory: { itemId: string | QuestItemId, quantity: number, type: UnlockedItemType.QUEST_ITEM }[];
  relationships: RelationshipData[];
  heartNoteLocketOwned: boolean;
  weddingRingOwned: boolean;
  isMarried: boolean;
  spouseId: NPCId | null;
  marriageHappiness: number;
  lastSpouseInteractionDate: number;
  babyCribOwned: boolean;
  childData: ChildData | null;
  lastChildCareInteractionTimestamp: number;
  milkPowderCount: number;
  babyFoodCount: number;
  diapersCount: number;
  childCareKitCount: number;
  sideJobCooldowns: { [jobId: string]: number };
  familyActivityCooldowns: { [activityId: string]: number };
  lastFamilyActivityDate?: number | null;
  isGoldenEarGod: boolean; // Changed from optional to required
}

export interface NotificationMessage {
  id: string;
  type: 'levelUp' | 'achievement' | 'info' | 'dailyReward' | 'pet' | 'petLevelUp' | 'petSpecialRequest' | 'gameEvent' | 'practiceNook' | 'missionCompleted' | 'missionRewardClaimed' | 'monsterDefeated' | 'petEvolution' | 'quest' | 'clothing' | 'relationship' | 'family' | 'sideJob' | 'familyActivity' | 'event';
  titleKey: keyof ThaiUIText;
  messageKey?: keyof ThaiUIText;
  itemName?: string;
  amount?: number;
  petName?: string;
  evolvedPetName?: string;
  newLevel?: number; // For player level up
  level?: number; // For pet level up, distinct from newLevel
  baseAmount?: number;
  houseBonusAmount?: number;
  playerXpReward?: number;
  petXpReward?: number;
  petHappinessReward?: number;
  missionName?: string;
  monsterName?: string;
  mementoName?: string;
  questName?: string;
  npcName?: string;
  spouseName?: string;
  giftName?: string;
  childName?: string;
  childGrowthStage?: ChildGrowthStage;
  tuitionAmount?: number;
  academicPerformance?: string;
  gcoinsEarned?: number; // For side jobs etc.
  gcoinsSpent?: number;
  eventName?: string;
  birthdayPersonName?: string;
  targetName?: string; // For pet special request item name
  gcoins?: number; // For monster defeat Gcoin rewards if placeholder is {gcoins}
  achievementId?: AchievementId; // Added for better tracking
}

export interface ShopItem {
  id: string;
  nameKey: keyof ThaiUIText;
  descriptionKey: keyof ThaiUIText;
  cost: number;
  type: UnlockedItemType.INSTRUMENT_SOUND | UnlockedItemType.AVATAR_ITEM | UnlockedItemType.PET_FOOD | UnlockedItemType.PET_CUSTOMIZATION | UnlockedItemType.FURNITURE | UnlockedItemType.CLOTHING | UnlockedItemType.KEY_ITEM | UnlockedItemType.CHILD_CARE | UnlockedItemType.GENERAL_GIFT;
  icon?: string;
  data?: any;
}

export interface FaceOption { id: FaceId; nameKey: keyof ThaiUIText; iconPreview?: string; }
export interface HairOption { id: HairId; nameKey: keyof ThaiUIText; iconPreview?: string; }
export interface HairColorOption { id: HairColorId; nameKey: keyof ThaiUIText; hexColor: string; }
export interface SkinColorOption { id: SkinColorId; nameKey: keyof ThaiUIText; hexColor: string; }
export interface ClothingOption { id: ClothingId; nameKey: keyof ThaiUIText; iconPreview?: string; color: string; }

export interface PracticeNookResult {
  success: boolean;
  cooldownRemaining?: number;
  rewards?: {
    playerXp: number;
    petXp?: number;
    petHappiness?: number;
  };
}

export interface GiftResult {
  success: boolean;
  messageKey?: keyof ThaiUIText;
  rpChange?: number;
  marriageHappinessChange?: number;
}

export interface ChildData {
  name: string;
  growthStage: ChildGrowthStage;
  ageInDays: number;
  lastCheckedTimestamp: number;
  happiness: number;
  hunger: number;
  cleanliness: number;
  affection: number;
  sleepiness: number;
  lastSleptTimestamp: number;
  pendingNeeds: ChildNeedType[];
  lastFedTimestamp: number;
  lastCleanedTimestamp: number;
  lastPlayedTimestamp: number;
  eventFlags: { [key in ChildEvent]?: boolean };
  isSick: boolean;
  sickDaysCounter: number;
  academicPerformance: string;
  tuitionDueDate: number | null;
  homeworkAvailable: boolean;
  birthday?: { month: number; day: number };
}

// Forward declaration for usePlayerData to avoid circular dependencies in hook files
// This is a simplified version of what usePlayerData might return, focusing on what other hooks might need.
// The full UsePlayerDataReturn should be defined where usePlayerData is, or in a central types file.
export interface BasicPlayerDataReturn {
  playerData: PlayerData | null;
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  unlockAchievementInternal: (achievementId: AchievementId, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> };
  checkAndApplyLevelUp: (currentXp: number, currentLevel: number, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> };
}

// For RelationshipSystemReturn itself
import type { RelationshipSystemReturn as ActualRelationshipSystemReturn } from '../hooks/useRelationshipSystem';
export type RelationshipSystemReturn = ActualRelationshipSystemReturn;

import type { TrainingSystemReturn as ActualTrainingSystemReturn } from '../hooks/useTrainingSystem';
export type TrainingSystemReturn = ActualTrainingSystemReturn;

import type { MonsterSystemReturn as ActualMonsterSystemReturn } from '../hooks/useMonsterSystem';
export type MonsterSystemReturn = ActualMonsterSystemReturn;

import type { MissionSystemReturn as ActualMissionSystemReturn } from '../hooks/useMissionSystem';
export type MissionSystemReturn = ActualMissionSystemReturn;

import type { QuestSystemReturn as ActualQuestSystemReturn } from '../hooks/useQuestSystem';
export type QuestSystemReturn = ActualQuestSystemReturn;

import type { PetSystemReturn as ActualPetSystemReturn } from '../hooks/usePetSystem';
export type PetSystemReturn = ActualPetSystemReturn;

import type { UseHouseSystemReturn as ActualUseHouseSystemReturn } from '../hooks/useHouseSystem';
export type UseHouseSystemReturn = ActualUseHouseSystemReturn;

import type { FamilySystemReturn as ActualFamilySystemReturn } from '../hooks/useFamilySystem';
export type FamilySystemReturn = ActualFamilySystemReturn;

import type { SideJobSystemReturn as ActualSideJobSystemReturn } from '../hooks/useSideJobSystem';
export type SideJobSystemReturn = ActualSideJobSystemReturn;

import type { FamilyActivitySystemReturn as ActualFamilyActivitySystemReturn } from '../hooks/useFamilyActivitySystem';
export type FamilyActivitySystemReturn = ActualFamilyActivitySystemReturn;


export interface UsePlayerDataReturn {
  playerData: PlayerData | null;
  notifications: NotificationMessage[];
  dismissNotification: (id: string) => void;
  achievements: Achievement[];
  getAchievementDetails: (id: AchievementId) => Achievement | undefined;
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  setPlayerName: (name: string) => void;
  saveGameExplicitly: () => void;
  resetGame: () => void;
  selectInstrumentSound: (soundId: InstrumentSoundId) => void;
  toggleHighlightPianoOnPlay: () => void;
  setAvatarStyle: (style: AvatarStyle) => void;
  setPlayerAppearance: (newAppearance: Partial<PlayerAppearance>) => void;
  equipClothingItem: (clothingId: ClothingId | undefined, layer: ClothingLayer) => void;
  purchaseShopItem: (item: ShopItem) => { success: boolean, messageKey?: keyof ThaiUIText, itemName?: string };
  isShopItemPurchased: (itemId: string, itemType: UnlockedItemType) => boolean;
  unlockMusicalItem: (itemId: string, itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD, cost: number) => boolean;
  isMusicalItemUnlocked: (itemId: string, itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD) => boolean;
  checkForDailyLoginReward: () => void;
  setGoldenEarGodStatusAndReward: () => void; // Added
  activateUnlockMode: () => void; // Added for cheat mode
  relationshipSystem: RelationshipSystemReturn;
  trainingSystem: TrainingSystemReturn;
  monsterSystem: MonsterSystemReturn;
  missionSystem: MissionSystemReturn;
  questSystem: QuestSystemReturn;
  petSystem: PetSystemReturn;
  houseSystem: UseHouseSystemReturn;
  familySystem: FamilySystemReturn;
  sideJobSystem: SideJobSystemReturn;
  familyActivitySystem: FamilyActivitySystemReturn;
  interactWithNpc: (npcId: NPCId) => void;
  giveGiftToNpc: (npcId: NPCId, itemId: string, itemType: UnlockedItemType) => GiftResult;
  confessToNpc: (npcId: NPCId) => { success: boolean, messageKey?: keyof ThaiUIText };
  proposeToNpc: (npcId: NPCId) => { success: boolean, messageKey?: keyof ThaiUIText };
  markEventAsViewed: (npcId: NPCId, eventId: string) => void;
  goOnDate: (npcId: NPCId) => { success: boolean, messageKey?: keyof ThaiUIText };
  addXpAndCoinsFromTraining: (baseXp: number, baseCoins: number, context: { gameMode: GameMode, currentStreak: number, questionsAnsweredThisMode: number, itemId: string }) => { finalXp: number, finalCoins: number }; // Corrected return type
  updateHighestStreak: (streak: number, gameMode: GameMode) => void;
  recordMonsterDefeat: (monsterId: MonsterId) => void;
  claimMissionReward: (missionId: MissionId) => boolean;
  refreshMissions: () => void;
  updateMissionProgress: (missionType: MissionType, valueIncrement?: number, targetDetails?: any, currentPlayerData?: PlayerData) => PlayerData;
  startQuest: (questId: QuestId) => boolean;
  progressQuest: (questId: QuestId, objectiveIndexToComplete?: number, details?: { puzzleId?: string; itemId?: string | QuestItemId }) => boolean;
  completeQuest: (questId: QuestId) => boolean;
  getQuestStatus: (questId: QuestId) => QuestStatusEnum;
  collectQuestItem: (itemId: string | QuestItemId, quantity?: number) => void;
  adoptPet: (petDef: PetDefinition) => { success: boolean; messageKey?: keyof ThaiUIText; };
  feedPet: () => boolean;
  playWithPet: () => boolean;
  setActivePet: (petId: PetId | null) => void;
  applyPetCustomization: (petId: PetId, customization: PetCustomization) => boolean;
  getActivePetAbilityMultiplier: (abilityType: PetAbilityType) => number;
  upgradeHouse: () => { success: boolean; messageKey?: keyof ThaiUIText; newLevel?: number };
  activatePracticeNook: () => PracticeNookResult;
  initiateChildEvent: () => boolean;
  setChildName: (name: string) => void;
  feedChild: (itemId: ShopItemId.MILK_POWDER | ShopItemId.BABY_FOOD) => void;
  playWithChild: () => void;
  changeChildDiaper: () => void;
  handleChildDailyUpdate: () => void;
  sootheChildToSleep: () => void;
  useChildCareKit: () => void;
  payTuition: () => void;
  helpWithHomework: () => void;
  performBusking: () => { success: boolean; messageKey?: keyof ThaiUIText; gcoinsEarned?: number };
  getBuskingCooldownTime: () => string | null;
  performFamilyActivity: (activityId: FamilyActivityId) => { success: boolean; messageKey?: keyof ThaiUIText; gcoinsSpent?: number };
  getFamilyActivityCooldownTime: (activityId: FamilyActivityId) => string | null;
  celebrateBirthday: (target: 'child' | 'spouse') => { success: boolean; messageKey?: keyof ThaiUIText };
}