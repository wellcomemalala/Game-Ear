
import { PlayerData, Achievement, AchievementId, UnlockedItemType, InstrumentSoundId, AvatarStyle, NPCId, QuestId, QuestDefinition, QuestObjectiveType, QuestReward, SongId, FaceId, HairId, HairColorId, SkinColorId, PlayerAppearance, QuestItemId, FaceOption, HairOption, HairColorOption, SkinColorOption, MissionDefinition, MissionId, MissionType, MissionRewardType, MonsterDefinition, MonsterId, MementoId, GameMode, Difficulty, ClothingId, ShopItemId, RelationshipStatus, GiftPreferenceLevel, ChildEvent, ChildGrowthStage, ShopItem, ThaiUIText, RelationshipData, PetCustomizationItemId } from './types';
import { ALL_MEMENTOS, ALL_INTERVALS, ALL_CHORDS, HEART_NOTE_LOCKET_SHOP_ITEM_DEF, WEDDING_RING_SHOP_ITEM_DEF, BABY_CRIB_SHOP_ITEM_DEF, MILK_POWDER_SHOP_ITEM_DEF, BABY_FOOD_SHOP_ITEM_DEF, DIAPERS_SHOP_ITEM_DEF, CHILD_CARE_KIT_SHOP_ITEM_DEF, BASE_SHOP_ITEMS, BIRTHDAY_CAKE_SHOP_ITEM_DEF, BIRTHDAY_CAKE_COST as BIRTHDAY_CAKE_COST_FROM_ITEMS } from './item-definitions'; // Import BIRTHDAY_CAKE_COST_FROM_ITEMS
import { PET_DEFINITIONS } from './pet-constants';

export const INITIAL_PLAYER_DATA: PlayerData = {
  playerName: '',
  xp: 0,
  level: 1,
  gCoins: 1000,
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
  unlockedSongIds: [],
  unlockedClothingIds: [],
  selectedInstrumentSoundId: InstrumentSoundId.SINE,
  purchasedShopItemIds: [],
  ownedPetIds: [],
  activePetId: null,
  pets: {},
  petFoodCount: 5,
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
  appearance: {
    faceId: FaceId.FACE_1,
    hairId: HairId.HAIR_1,
    hairColor: HairColorId.BROWN,
    skinColor: SkinColorId.MEDIUM,
  },
  activeQuests: [],
  inventory: [],
  relationships: [
    { npcId: NPCId.MELODIE, rp: 0, lastPositiveInteractionDate: 0, status: RelationshipStatus.NEUTRAL, eventFlags: {}, viewedEventFlags: {} },
    { npcId: NPCId.RHYTHM, rp: 0, lastPositiveInteractionDate: 0, status: RelationshipStatus.NEUTRAL, eventFlags: {}, viewedEventFlags: {} },
    { npcId: NPCId.HARMONIE, rp: 0, lastPositiveInteractionDate: 0, status: RelationshipStatus.NEUTRAL, eventFlags: {}, viewedEventFlags: {} },
  ],
  heartNoteLocketOwned: false,
  weddingRingOwned: false,
  isMarried: false,
  spouseId: null,
  marriageHappiness: 0,
  lastSpouseInteractionDate: 0,
  babyCribOwned: false,
  childData: null,
  lastChildCareInteractionTimestamp: 0,
  milkPowderCount: 0,
  babyFoodCount: 0,
  diapersCount: 0,
  childCareKitCount: 0,
  sideJobCooldowns: {},
  familyActivityCooldowns: {},
  lastFamilyActivityDate: null,
  isGoldenEarGod: false, // New
};


export const SHOP_ITEMS: ShopItem[] = [
    ...BASE_SHOP_ITEMS,
    // BIRTHDAY_CAKE_SHOP_ITEM_DEF is already in BASE_SHOP_ITEMS via GENERAL_GIFT_ITEMS
];

export const XP_PER_CORRECT_ANSWER = 10;
export const GCOINS_PER_CORRECT_ANSWER = 5;
export const DAILY_LOGIN_REWARD = 25;
export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5000, 6500, 8000, 10000, 12500, 15000]; // Level 1 to 15
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

export const RP_GAIN_PER_INTERACTION = 5;
export const MEMENTO_GIFT_RP_GAIN_MELODIE = 15;
export const MEMENTO_GIFT_RP_GAIN_RHYTHM = 15;
export const MEMENTO_GIFT_RP_GAIN_HARMONIE = 20;

export const RP_GAIN_GIFT_LOVED = 20;
export const RP_GAIN_GIFT_LIKED = 10;
export const RP_GAIN_GIFT_NEUTRAL = 2;
export const RP_CHANGE_GIFT_DISLIKED = -1;

export const RP_DECAY_DAYS_THRESHOLD = 3;
export const RP_DECAY_AMOUNT = 1;
export const MAX_FRIEND_RP = 100;
export const MAX_DATING_RP = 200;
export const INITIAL_MARRIAGE_HAPPINESS = 75;
export const MAX_MARRIAGE_HAPPINESS = 100;

export const MARRIAGE_HAPPINESS_DECAY_THRESHOLD_DAYS = 3;
export const MARRIAGE_HAPPINESS_DECAY_AMOUNT = 2;
export const MARRIAGE_HAPPINESS_GAIN_INTERACTION = 5;
export const MARRIAGE_HAPPINESS_GAIN_GIFT = 10;
export const MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD = 20;

export const SPOUSAL_BONUS_PRACTICE_NOOK_COOLDOWN_REDUCTION_MELODIE = 0.2;
export const SPOUSAL_BONUS_GCOIN_CHANCE_RHYTHM = 0.1;
export const SPOUSAL_BONUS_GCOIN_AMOUNT_RHYTHM = 50;
export const SPOUSAL_BONUS_MEMENTO_DROP_RATE_INCREASE_HARMONIE = 0.05;

export const BABY_CRIB_COST = BABY_CRIB_SHOP_ITEM_DEF.cost;
export const MILK_POWDER_COST = MILK_POWDER_SHOP_ITEM_DEF.cost;
export const BABY_FOOD_COST = BABY_FOOD_SHOP_ITEM_DEF.cost;
export const DIAPERS_COST = DIAPERS_SHOP_ITEM_DEF.cost;

export const CHILD_INITIAL_HAPPINESS = 70;
export const CHILD_HAPPINESS_DECAY_RATE = 2; 

export const CHILD_INITIAL_HUNGER = 80;
export const CHILD_HUNGER_DECAY_RATE = 4; 

export const CHILD_INITIAL_CLEANLINESS = 90;
export const CHILD_CLEANLINESS_DECAY_RATE = 3; 

export const CHILD_INITIAL_AFFECTION = 60;
export const CHILD_AFFECTION_NEED_RATE = 2; 

export const CHILD_INITIAL_SLEEPINESS = 20;
export const MAX_CHILD_SLEEPINESS = 100;
export const CHILD_SLEEPINESS_INCREASE_PER_HOUR = 5;
export const CHILD_SLEEPINESS_DECAY_WHEN_SLEEPING = 25; 
export const CHILD_HAPPINESS_PENALTY_FOR_HIGH_SLEEPINESS = 10; 

export const CHILD_SICKNESS_THRESHOLD_LOW_HAPPINESS = 20;
export const CHILD_SICKNESS_THRESHOLD_LOW_NEEDS = 15; 
export const CHILD_SICKNESS_DURATION_DAYS = 2;
export const CHILD_SICKNESS_HAPPINESS_MULTIPLIER = 2; 

export const CHILD_GROWTH_DAYS_INFANT_TO_CRAWLER = 3;
export const CHILD_GROWTH_DAYS_CRAWLER_TO_TODDLER = 4;
export const CHILD_GROWTH_DAYS_TODDLER_TO_SCHOOL_AGE = 5;

export const INITIAL_ACADEMIC_PERFORMANCE = 'C';
export const TUITION_COST = 100;
export const SCHOOL_TERM_DAYS = 7;
export const HOMEWORK_HAPPINESS_REWARD = 5;

export const ACADEMIC_PERFORMANCE_IMPROVEMENT_HOMEWORK: Record<string, string> = { 'F': 'D', 'D': 'C', 'C': 'B', 'B': 'A', 'A': 'A' };
export const ACADEMIC_PERFORMANCE_IMPROVEMENT_TUITION: Record<string, string> = { 'F': 'D', 'D': 'C', 'C': 'C', 'B': 'B', 'A': 'A' }; 
export const ACADEMIC_PERFORMANCE_PENALTY_NEGLECT: Record<string, string> = { 'A': 'B', 'B': 'C', 'C': 'D', 'D': 'F', 'F': 'F' };
export const CHILD_MIN_HAPPINESS_FOR_GOOD_GRADES = 50;
export const CHILD_ACADEMIC_PERFORMANCE_NOTIFICATION_THRESHOLD = 'D';
export const HOMEWORK_NEGLECT_DAYS_THRESHOLD = 2;
export const ACADEMIC_PERFORMANCE_CHANGE_LOW_HAPPINESS_DAYS = 3;

export const SIDE_JOB_BUSKING_GCOINS_MIN = 20;
export const SIDE_JOB_BUSKING_GCOINS_MAX = 60;
export const SIDE_JOB_BUSKING_COOLDOWN_HOURS = 2;
export const SIDE_JOB_BUSKING_LEVEL_GCOIN_MULTIPLIER = 2;
export const SIDE_JOB_MIN_FAMILY_HAPPINESS_THRESHOLD = 30;

export const FAMILY_ACTIVITY_PARK_TRIP_COST = 150;
export const FAMILY_ACTIVITY_PARK_TRIP_CHILD_HAPPINESS_GAIN = 15;
export const FAMILY_ACTIVITY_PARK_TRIP_MARRIAGE_HAPPINESS_GAIN = 10;
export const FAMILY_ACTIVITY_PARK_TRIP_COOLDOWN_HOURS = 24;

// BIRTHDAY_CAKE_COST is imported as BIRTHDAY_CAKE_COST_FROM_ITEMS and used below
// export { BIRTHDAY_CAKE_COST_FROM_ITEMS as BIRTHDAY_CAKE_COST }; // This line caused the duplicate export
export const BIRTHDAY_CELEBRATION_HAPPINESS_GAIN = 25;
export const FAMILY_ACTIVITY_NEGLECT_THRESHOLD_DAYS = 7;
export const FAMILY_HAPPINESS_DECAY_ON_NEGLECT = 2;

// Final Boss Battle Constants
export const FINAL_BOSS_REWARD_GCOINS = 1000;
export const FINAL_BOSS_REWARD_XP = 500;
export const FINAL_BOSS_INTERVAL_QUESTIONS = 15;
export const FINAL_BOSS_INTERVAL_MISTAKES_ALLOWED = 2;
export const FINAL_BOSS_CHORD_QUESTIONS = 15;
export const FINAL_BOSS_CHORD_MISTAKES_ALLOWED = 2;
export const FINAL_BOSS_MELODY_QUESTIONS = 10;
export const FINAL_BOSS_MELODY_MISTAKES_ALLOWED = 1;


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
    { id: AchievementId.PET_PLAY_10_TIMES, nameKey: 'ach_PET_PLAY_10_TIMES_name', descriptionKey: 'ach_PET_PLAY_10_TIMES_desc', unlocked: false },
    { id: AchievementId.PET_COLLECTOR, nameKey: 'ach_PET_COLLECTOR_name', descriptionKey: 'ach_PET_COLLECTOR_desc', unlocked: false },
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
    { id: AchievementId.COMPLETE_5_DAILY_MISSIONS, nameKey: 'ach_COMPLETE_5_DAILY_MISSIONS_name', descriptionKey: 'ach_COMPLETE_5_DAILY_MISSIONS_desc', unlocked: false },
    { id: AchievementId.COMPLETE_FIRST_WEEKLY_MISSION, nameKey: 'ach_COMPLETE_FIRST_WEEKLY_MISSION_name', descriptionKey: 'ach_COMPLETE_FIRST_WEEKLY_MISSION_desc', unlocked: false },
    { id: AchievementId.DEFEAT_FIRST_MONSTER, nameKey: 'ach_DEFEAT_FIRST_MONSTER_name', descriptionKey: 'ach_DEFEAT_FIRST_MONSTER_desc', unlocked: false },
    { id: AchievementId.DEFEAT_MONO_NOTE_SLIME, nameKey: 'ach_DEFEAT_MONO_NOTE_SLIME_name', descriptionKey: 'ach_DEFEAT_MONO_NOTE_SLIME_desc', unlocked: false },
    { id: AchievementId.DEFEAT_CHORD_CRACKER, nameKey: 'ach_DEFEAT_CHORD_CRACKER_name', descriptionKey: 'ach_DEFEAT_CHORD_CRACKER_desc', unlocked: false },
    { id: AchievementId.DEFEAT_INTERVAL_IMP, nameKey: 'ach_DEFEAT_INTERVAL_IMP_name', descriptionKey: 'ach_DEFEAT_INTERVAL_IMP_desc', unlocked: false },
    { id: AchievementId.DEFEAT_RHYTHM_LORD, nameKey: 'ach_DEFEAT_RHYTHM_LORD_name', descriptionKey: 'ach_DEFEAT_RHYTHM_LORD_desc', unlocked: false },
    { id: AchievementId.DEFEAT_HARMONY_SIREN, nameKey: 'ach_DEFEAT_HARMONY_SIREN_name', descriptionKey: 'ach_DEFEAT_HARMONY_SIREN_desc', unlocked: false },
    { id: AchievementId.COLLECT_ALL_MEMENTOS, nameKey: 'ach_COLLECT_ALL_MEMENTOS_name', descriptionKey: 'ach_COLLECT_ALL_MEMENTOS_desc', unlocked: false },
    { id: AchievementId.QUEST_ACCEPTED_FIRST, nameKey: 'ach_QUEST_ACCEPTED_FIRST_name', descriptionKey: 'ach_QUEST_ACCEPTED_FIRST_desc', unlocked: false },
    { id: AchievementId.QUEST_COMPLETED_FIRST, nameKey: 'ach_QUEST_COMPLETED_FIRST_name', descriptionKey: 'ach_QUEST_COMPLETED_FIRST_desc', unlocked: false },
    { id: AchievementId.AVATAR_FIRST_CUSTOMIZATION, nameKey: 'ach_AVATAR_FIRST_CUSTOMIZATION_name', descriptionKey: 'ach_AVATAR_FIRST_CUSTOMIZATION_desc', unlocked: false },
    { id: AchievementId.CLOTHING_PURCHASED_FIRST, nameKey: 'ach_CLOTHING_PURCHASED_FIRST_name', descriptionKey: 'ach_CLOTHING_PURCHASED_FIRST_desc', unlocked: false },
    { id: AchievementId.CLOTHING_EQUIPPED_FIRST, nameKey: 'ach_CLOTHING_EQUIPPED_FIRST_name', descriptionKey: 'ach_CLOTHING_EQUIPPED_FIRST_desc', unlocked: false },
    { id: AchievementId.FIRST_INTERACTION_MELODIE, nameKey: 'ach_FIRST_INTERACTION_MELODIE_name', descriptionKey: 'ach_FIRST_INTERACTION_MELODIE_desc', unlocked: false },
    { id: AchievementId.FIRST_GIFT_MELODIE, nameKey: 'ach_FIRST_GIFT_MELODIE_name', descriptionKey: 'ach_FIRST_GIFT_MELODIE_desc', unlocked: false },
    { id: AchievementId.MELODIE_EVENT_1, nameKey: 'ach_MELODIE_EVENT_1_name', descriptionKey: 'ach_MELODIE_EVENT_1_desc', unlocked: false },
    { id: AchievementId.MELODIE_EVENT_2, nameKey: 'ach_MELODIE_EVENT_2_name', descriptionKey: 'ach_MELODIE_EVENT_2_desc', unlocked: false },
    { id: AchievementId.MELODIE_EVENT_3, nameKey: 'ach_MELODIE_EVENT_3_name', descriptionKey: 'ach_MELODIE_EVENT_3_desc', unlocked: false },
    { id: AchievementId.BECOME_LOVERS_MELODIE, nameKey: 'ach_BECOME_LOVERS_MELODIE_name', descriptionKey: 'ach_BECOME_LOVERS_MELODIE_desc', unlocked: false },
    { id: AchievementId.MARRIED_MELODIE, nameKey: 'ach_MARRIED_MELODIE_name', descriptionKey: 'ach_MARRIED_MELODIE_desc', unlocked: false },
    { id: AchievementId.FIRST_INTERACTION_RHYTHM, nameKey: 'ach_FIRST_INTERACTION_RHYTHM_name', descriptionKey: 'ach_FIRST_INTERACTION_RHYTHM_desc', unlocked: false },
    { id: AchievementId.FIRST_GIFT_RHYTHM, nameKey: 'ach_FIRST_GIFT_RHYTHM_name', descriptionKey: 'ach_FIRST_GIFT_RHYTHM_desc', unlocked: false },
    { id: AchievementId.RHYTHM_EVENT_1, nameKey: 'ach_RHYTHM_EVENT_1_name', descriptionKey: 'ach_RHYTHM_EVENT_1_desc', unlocked: false },
    { id: AchievementId.RHYTHM_EVENT_2, nameKey: 'ach_RHYTHM_EVENT_2_name', descriptionKey: 'ach_RHYTHM_EVENT_2_desc', unlocked: false },
    { id: AchievementId.RHYTHM_EVENT_3, nameKey: 'ach_RHYTHM_EVENT_3_name', descriptionKey: 'ach_RHYTHM_EVENT_3_desc', unlocked: false },
    { id: AchievementId.BECOME_LOVERS_RHYTHM, nameKey: 'ach_BECOME_LOVERS_RHYTHM_name', descriptionKey: 'ach_BECOME_LOVERS_RHYTHM_desc', unlocked: false },
    { id: AchievementId.MARRIED_RHYTHM, nameKey: 'ach_MARRIED_RHYTHM_name', descriptionKey: 'ach_MARRIED_RHYTHM_desc', unlocked: false },
    { id: AchievementId.FIRST_INTERACTION_HARMONIE, nameKey: 'ach_FIRST_INTERACTION_HARMONIE_name', descriptionKey: 'ach_FIRST_INTERACTION_HARMONIE_desc', unlocked: false },
    { id: AchievementId.FIRST_GIFT_HARMONIE, nameKey: 'ach_FIRST_GIFT_HARMONIE_name', descriptionKey: 'ach_FIRST_GIFT_HARMONIE_desc', unlocked: false },
    { id: AchievementId.HARMONIE_EVENT_1, nameKey: 'ach_HARMONIE_EVENT_1_name', descriptionKey: 'ach_HARMONIE_EVENT_1_desc', unlocked: false },
    { id: AchievementId.HARMONIE_EVENT_2, nameKey: 'ach_HARMONIE_EVENT_2_name', descriptionKey: 'ach_HARMONIE_EVENT_2_desc', unlocked: false },
    { id: AchievementId.HARMONIE_EVENT_3, nameKey: 'ach_HARMONIE_EVENT_3_name', descriptionKey: 'ach_HARMONIE_EVENT_3_desc', unlocked: false },
    { id: AchievementId.BECOME_LOVERS_HARMONIE, nameKey: 'ach_BECOME_LOVERS_HARMONIE_name', descriptionKey: 'ach_BECOME_LOVERS_HARMONIE_desc', unlocked: false },
    { id: AchievementId.MARRIED_HARMONIE, nameKey: 'ach_MARRIED_HARMONIE_name', descriptionKey: 'ach_MARRIED_HARMONIE_desc', unlocked: false },
    { id: AchievementId.HAVE_FIRST_CHILD, nameKey: 'ach_HAVE_FIRST_CHILD_name', descriptionKey: 'ach_HAVE_FIRST_CHILD_desc', unlocked: false },
    { id: AchievementId.CHILD_FIRST_WORDS, nameKey: 'ach_CHILD_FIRST_WORDS_name', descriptionKey: 'ach_CHILD_FIRST_WORDS_desc', unlocked: false },
    { id: AchievementId.CHILD_FIRST_STEPS, nameKey: 'ach_CHILD_FIRST_STEPS_name', descriptionKey: 'ach_CHILD_FIRST_STEPS_desc', unlocked: false },
    { id: AchievementId.DEFEAT_FINAL_BOSS, nameKey: 'ach_DEFEAT_FINAL_BOSS_name', descriptionKey: 'ach_DEFEAT_FINAL_BOSS_desc', unlocked: false }, // New
];

export const ALL_MONSTERS: MonsterDefinition[] = [
  { id: MonsterId.MONO_NOTE_SLIME, nameKey: 'monster_MONO_NOTE_SLIME_name', descriptionKey: 'monster_MONO_NOTE_SLIME_desc', iconComponent: 'MonsterIconPlaceholder', stages: [{type: GameMode.INTERVALS, difficulty: Difficulty.EASY}, {type: GameMode.INTERVALS, difficulty: Difficulty.EASY}], rewardMementoId: MementoId.SLIME_ESSENCE, rewardGcoins: 20, rewardPlayerXp: 10, questItemDrop: {itemId: QuestItemId.SLIME_ESSENCE_ITEM_ID, chance: 0.3} },
  { id: MonsterId.CHORD_CRACKER, nameKey: 'monster_CHORD_CRACKER_name', descriptionKey: 'monster_CHORD_CRACKER_desc', iconComponent: 'MonsterIconPlaceholder', stages: [{type: GameMode.CHORDS, difficulty: Difficulty.EASY}, {type: GameMode.CHORDS, difficulty: Difficulty.MEDIUM}], rewardMementoId: MementoId.CRACKER_TOOTH, rewardGcoins: 40, rewardPlayerXp: 20 },
  { id: MonsterId.INTERVAL_IMP, nameKey: 'monster_INTERVAL_IMP_name', descriptionKey: 'monster_INTERVAL_IMP_desc', iconComponent: 'MonsterIconPlaceholder', stages: [{type: GameMode.INTERVALS, difficulty: Difficulty.MEDIUM}, {type: GameMode.INTERVALS, difficulty: Difficulty.MEDIUM, itemId: "m7"}], rewardMementoId: MementoId.IMP_HORN, rewardGcoins: 60, rewardPlayerXp: 30 },
  { id: MonsterId.RHYTHM_LORD, nameKey: 'monster_RHYTHM_LORD_name', descriptionKey: 'monster_RHYTHM_LORD_desc', iconComponent: 'MonsterIconPlaceholder', stages: [{type: GameMode.MELODY_RECALL, difficulty: Difficulty.EASY}, {type: GameMode.MELODY_RECALL, difficulty: Difficulty.MEDIUM}], rewardMementoId: MementoId.RHYTHM_CORE, rewardGcoins: 100, rewardPlayerXp: 50 },
  { id: MonsterId.HARMONY_SIREN, nameKey: 'monster_HARMONY_SIREN_name', descriptionKey: 'monster_HARMONY_SIREN_desc', iconComponent: 'MonsterIconPlaceholder', stages: [{type: GameMode.CHORDS, difficulty: Difficulty.HARD, itemId: "maj7"}, {type: GameMode.MELODY_RECALL, difficulty: Difficulty.HARD}], rewardMementoId: MementoId.SIREN_SCALE, rewardGcoins: 150, rewardPlayerXp: 75 },
  { id: MonsterId.ECHOING_PHANTOM, nameKey: 'monster_ECHOING_PHANTOM_name', descriptionKey: 'monster_ECHOING_PHANTOM_desc', iconComponent: 'MonsterIconPlaceholder', stages: [{type: GameMode.INTERVALS, difficulty: Difficulty.HARD, itemId: "m7"}, {type: GameMode.CHORDS, difficulty: Difficulty.HARD, itemId: "min7"}, {type: GameMode.INTERVALS, difficulty: Difficulty.HARD, itemId: "M7"}], rewardMementoId: MementoId.PHANTOM_ECHO_STONE, rewardGcoins: 200, rewardPlayerXp: 100 },
  { id: MonsterId.CHROMATIC_ABERRATION, nameKey: 'monster_CHROMATIC_ABERRATION_name', descriptionKey: 'monster_CHROMATIC_ABERRATION_desc', iconComponent: 'MonsterIconPlaceholder', stages: [{type: GameMode.CHORDS, difficulty: Difficulty.HARD, itemId: "dim"}, {type: GameMode.INTERVALS, difficulty: Difficulty.HARD, itemId: "m9"}, {type: GameMode.CHORDS, difficulty: Difficulty.HARD, itemId: "aug"}, {type: GameMode.INTERVALS, difficulty: Difficulty.HARD, itemId: "TT"}], rewardMementoId: MementoId.CHROMATIC_CRYSTAL, rewardGcoins: 250, rewardPlayerXp: 120 },
  { id: MonsterId.CHORDAL_TITAN, nameKey: 'monster_CHORDAL_TITAN_name', descriptionKey: 'monster_CHORDAL_TITAN_desc', iconComponent: 'MonsterIconPlaceholder', stages: [{type: GameMode.CHORDS, difficulty: Difficulty.HARD, itemId: "maj7"}, {type: GameMode.INTERVALS, difficulty: Difficulty.HARD, itemId: "P11"}, {type: GameMode.CHORDS, difficulty: Difficulty.HARD, itemId: "min9"}, {type: GameMode.INTERVALS, difficulty: Difficulty.HARD, itemId: "M9"}], rewardMementoId: MementoId.TITAN_CHORD_FRAGMENT, rewardGcoins: 300, rewardPlayerXp: 150 },
  { id: MonsterId.POLYPHONIC_BEHEMOTH, nameKey: 'monster_POLYPHONIC_BEHEMOTH_name', descriptionKey: 'monster_POLYPHONIC_BEHEMOTH_desc', iconComponent: 'MonsterIconPlaceholder', stages: [{type: GameMode.CHORDS, difficulty: Difficulty.HARD, itemId: "dom9"}, {type: GameMode.INTERVALS, difficulty: Difficulty.HARD, itemId: "m9"}, {type: GameMode.CHORDS, difficulty: Difficulty.HARD, itemId: "maj9"}, {type: GameMode.INTERVALS, difficulty: Difficulty.HARD, itemId: "P11"}, {type: GameMode.CHORDS, difficulty: Difficulty.HARD, itemId: "min7"}], rewardMementoId: MementoId.BEHEMOTH_VOICEBOX, rewardGcoins: 400, rewardPlayerXp: 200 },
  { id: MonsterId.AURAL_ASCENDANT, nameKey: 'monster_AURAL_ASCENDANT_name', descriptionKey: 'monster_AURAL_ASCENDANT_desc', iconComponent: 'MonsterIconPlaceholder', stages: [{type: GameMode.INTERVALS, difficulty: Difficulty.HARD, itemId: "M7"}, {type: GameMode.CHORDS, difficulty: Difficulty.HARD, itemId: "maj9"}, {type: GameMode.INTERVALS, difficulty: Difficulty.HARD, itemId: "P11"}, {type: GameMode.CHORDS, difficulty: Difficulty.HARD, itemId: "dom9"}, {type: GameMode.INTERVALS, difficulty: Difficulty.HARD, itemId: "m9"}, {type: GameMode.CHORDS, difficulty: Difficulty.HARD, itemId: "aug"}], rewardMementoId: MementoId.ASCENDANT_AURA_SHARD, rewardGcoins: 500, rewardPlayerXp: 250 },
];

export const QUEST_DEFINITIONS: QuestDefinition[] = [
  {
    id: QuestId.LOST_MUSIC_SHEET_MUSIC_MASTER,
    titleKey: 'quest_LOST_MUSIC_SHEET_MUSIC_MASTER_title',
    descriptionKey: 'quest_LOST_MUSIC_SHEET_MUSIC_MASTER_desc',
    npcId: NPCId.MUSIC_MASTER,
    minPlayerLevel: 3,
    objectives: [
      { descriptionKey: 'quest_LOST_MUSIC_SHEET_MUSIC_MASTER_obj1', type: QuestObjectiveType.TALK_TO_NPC, targetId: NPCId.MUSIC_MASTER },
      { descriptionKey: 'quest_LOST_MUSIC_SHEET_MUSIC_MASTER_obj_defeat_imp', type: QuestObjectiveType.DEFEAT_MONSTER, targetId: MonsterId.INTERVAL_IMP },
      { descriptionKey: 'quest_LOST_MUSIC_SHEET_MUSIC_MASTER_obj_retrieve_sheet', type: QuestObjectiveType.COLLECT_ITEM, targetId: QuestItemId.LOST_MUSIC_SHEET, targetCount: 1 },
      { descriptionKey: 'quest_LOST_MUSIC_SHEET_MUSIC_MASTER_obj1', type: QuestObjectiveType.TALK_TO_NPC, targetId: NPCId.MUSIC_MASTER }, // Return to NPC
    ],
    rewards: [{ type: 'xp', amount: 100 }, { type: 'gcoins', amount: 200 }, {type: 'song', songId: SongId.ANCIENT_MELODY_SONG}],
  },
  {
    id: QuestId.NEW_PET_TRAINING_MUSIC_MASTER,
    titleKey: 'quest_NEW_PET_TRAINING_MUSIC_MASTER_title',
    descriptionKey: 'quest_NEW_PET_TRAINING_MUSIC_MASTER_desc',
    npcId: NPCId.MUSIC_MASTER,
    minPlayerLevel: 1,
    objectives: [
        { descriptionKey: 'quest_NEW_PET_TRAINING_MUSIC_MASTER_obj_talk', type: QuestObjectiveType.TALK_TO_NPC, targetId: NPCId.MUSIC_MASTER },
        { descriptionKey: 'quest_NEW_PET_TRAINING_MUSIC_MASTER_obj_collect_food', type: QuestObjectiveType.COLLECT_ITEM, targetId: QuestItemId.SPECIAL_PET_FOOD, targetCount: 1}, // This item needs to be obtainable
        { descriptionKey: 'quest_NEW_PET_TRAINING_MUSIC_MASTER_obj_feed_pet', type: QuestObjectiveType.FEED_PET_ITEM, targetId: QuestItemId.SPECIAL_PET_FOOD },
    ],
    rewards: [{ type: 'xp', amount: 30 }, { type: 'pet_food', amount: 3 }],
  },
  {
    id: QuestId.INTRO_MELODIE,
    titleKey: 'quest_INTRO_MELODIE_title',
    descriptionKey: 'quest_INTRO_MELODIE_desc',
    npcId: NPCId.MELODIE,
    objectives: [{ descriptionKey: 'quest_INTRO_MELODIE_obj1', type: QuestObjectiveType.TALK_TO_NPC, targetId: NPCId.MELODIE }],
    rewards: [{ type: 'xp', amount: 10 }],
  },
  {
    id: QuestId.INTRO_RHYTHM,
    titleKey: 'quest_INTRO_RHYTHM_title',
    descriptionKey: 'quest_INTRO_RHYTHM_desc',
    npcId: NPCId.RHYTHM,
    objectives: [{ descriptionKey: 'quest_INTRO_RHYTHM_obj1', type: QuestObjectiveType.TALK_TO_NPC, targetId: NPCId.RHYTHM }],
    rewards: [{ type: 'xp', amount: 10 }],
  },
  {
    id: QuestId.INTRO_HARMONIE,
    titleKey: 'quest_INTRO_HARMONIE_title',
    descriptionKey: 'quest_INTRO_HARMONIE_desc',
    npcId: NPCId.HARMONIE,
    objectives: [{ descriptionKey: 'quest_INTRO_HARMONIE_obj1', type: QuestObjectiveType.TALK_TO_NPC, targetId: NPCId.HARMONIE }],
    rewards: [{ type: 'xp', amount: 10 }],
  },
   {
    id: QuestId.MEMENTO_FOR_COLLECTOR,
    titleKey: 'quest_MEMENTO_FOR_COLLECTOR_title',
    descriptionKey: 'quest_MEMENTO_FOR_COLLECTOR_desc',
    npcId: NPCId.MEMENTO_COLLECTOR,
    minPlayerLevel: 2,
    objectives: [
      { descriptionKey: 'quest_MEMENTO_FOR_COLLECTOR_obj1', type: QuestObjectiveType.COLLECT_ITEM, targetId: QuestItemId.SLIME_ESSENCE_ITEM_ID, targetCount: 1}, // Assuming mementos can be quest items by ID
      { descriptionKey: 'quest_MEMENTO_FOR_COLLECTOR_obj2', type: QuestObjectiveType.TALK_TO_NPC, targetId: NPCId.MEMENTO_COLLECTOR }
    ],
    rewards: [{type: 'gcoins', amount: 150}, {type: 'xp', amount: 50}]
  },
  {
    id: QuestId.ZALAY_BEAT_FREESTYLE,
    titleKey: 'quest_ZALAY_BEAT_FREESTYLE_title',
    descriptionKey: 'quest_ZALAY_BEAT_FREESTYLE_desc',
    npcId: NPCId.ZALAY_BEAT,
    minPlayerLevel: 4,
    objectives: [
      { descriptionKey: 'quest_ZALAY_BEAT_FREESTYLE_obj1', type: QuestObjectiveType.PLAY_INSTRUMENT, targetCount: 20 }, // TargetCount is notes
      { descriptionKey: 'quest_ZALAY_BEAT_FREESTYLE_obj2', type: QuestObjectiveType.TALK_TO_NPC, targetId: NPCId.ZALAY_BEAT }
    ],
    rewards: [{type: 'gcoins', amount: 100}, {type: 'xp', amount: 75}]
  }
];

export const MISSION_DEFINITIONS: MissionDefinition[] = [
  { id: MissionId.DAILY_TRAIN_M3_5_TIMES, type: MissionType.TRAIN_ITEM_CORRECT_COUNT, descriptionKey: 'mission_DAILY_TRAIN_M3_5_TIMES_desc', targetValue: 5, targetItemId: 'M3', targetItemType: GameMode.INTERVALS, frequency: 'daily', rewards: [{type: MissionRewardType.GCOINS, amount: 20}, {type: MissionRewardType.PLAYER_XP, amount: 10}] },
  { id: MissionId.DAILY_STREAK_3_CHORDS, type: MissionType.TRAINING_STREAK, descriptionKey: 'mission_DAILY_STREAK_3_CHORDS_desc', targetValue: 3, gameModeScope: GameMode.CHORDS, frequency: 'daily', rewards: [{type: MissionRewardType.GCOINS, amount: 25}, {type: MissionRewardType.PLAYER_XP, amount: 15}] },
  { id: MissionId.DAILY_FEED_PET_1_TIME, type: MissionType.FEED_PET_COUNT, descriptionKey: 'mission_DAILY_FEED_PET_1_TIME_desc', targetValue: 1, frequency: 'daily', rewards: [{type: MissionRewardType.PET_XP, amount: 20}] },
  { id: MissionId.DAILY_USE_PRACTICE_NOOK_1_TIME, type: MissionType.USE_PRACTICE_NOOK_COUNT, descriptionKey: 'mission_DAILY_USE_PRACTICE_NOOK_1_TIME_desc', targetValue: 1, frequency: 'daily', rewards: [{type: MissionRewardType.PLAYER_XP, amount: 10}, {type: MissionRewardType.PET_XP, amount: 5}] },
  { id: MissionId.DAILY_EARN_50_GCOINS_TRAINING, type: MissionType.EARN_GCOINS_FROM_TRAINING, descriptionKey: 'mission_DAILY_EARN_50_GCOINS_TRAINING_desc', targetValue: 50, frequency: 'daily', rewards: [{type: MissionRewardType.GCOINS, amount: 30}] },
  { id: MissionId.WEEKLY_COMPLETE_3_DAILY_MISSIONS, type: MissionType.COMPLETE_DAILY_MISSION_COUNT, descriptionKey: 'mission_WEEKLY_COMPLETE_3_DAILY_MISSIONS_desc', targetValue: 3, frequency: 'weekly', rewards: [{type: MissionRewardType.GCOINS, amount: 100}, {type: MissionRewardType.PLAYER_XP, amount: 50}] },
  { id: MissionId.WEEKLY_ANSWER_20_INTERVALS_CORRECT, type: MissionType.TRAIN_ITEM_CORRECT_COUNT, descriptionKey: 'mission_WEEKLY_ANSWER_20_INTERVALS_CORRECT_desc', targetValue: 20, gameModeScope: GameMode.INTERVALS, frequency: 'weekly', rewards: [{type: MissionRewardType.GCOINS, amount: 75}, {type: MissionRewardType.PLAYER_XP, amount: 40}] },
  { id: MissionId.WEEKLY_EARN_250_GCOINS_TOTAL, type: MissionType.EARN_GCOINS_TOTAL, descriptionKey: 'mission_WEEKLY_EARN_250_GCOINS_TOTAL_desc', targetValue: 250, frequency: 'weekly', rewards: [{type: MissionRewardType.GCOINS, amount: 120}, {type: MissionRewardType.PET_XP, amount: 30}] },
  { id: MissionId.DAILY_CHALLENGE_SLIME, type: MissionType.START_MONSTER_BATTLE, descriptionKey: 'mission_DAILY_CHALLENGE_SLIME_desc', targetValue: 1, targetMonsterId: MonsterId.MONO_NOTE_SLIME, frequency: 'daily', rewards: [{type: MissionRewardType.GCOINS, amount: 15}, {type: MissionRewardType.PLAYER_XP, amount: 5}] },
  { id: MissionId.DAILY_PET_MAX_HAPPINESS, type: MissionType.PET_REACH_STAT, descriptionKey: 'mission_DAILY_PET_MAX_HAPPINESS_desc', targetValue: 100, targetPetStat: 'HAPPINESS', frequency: 'daily', rewards: [{type: MissionRewardType.GCOINS, amount: 25}, {type: MissionRewardType.PET_XP, amount: 15}] },
  { id: MissionId.DAILY_PLAY_NOTES_FREESTYLE_10, type: MissionType.PLAY_NOTES_FREESTYLE_COUNT, descriptionKey: 'mission_DAILY_PLAY_NOTES_FREESTYLE_10_desc', targetValue: 10, frequency: 'daily', rewards: [{type: MissionRewardType.GCOINS, amount: 10}, {type: MissionRewardType.PLAYER_XP, amount: 5}] },
  { id: MissionId.DAILY_TRAIN_MAJ7_CHORD_3_TIMES, type: MissionType.TRAIN_ITEM_CORRECT_COUNT, descriptionKey: 'mission_DAILY_TRAIN_MAJ7_CHORD_3_TIMES_desc', targetValue: 3, targetItemId: 'maj7', targetItemType: GameMode.CHORDS, frequency: 'daily', rewards: [{type: MissionRewardType.GCOINS, amount: 25}, {type: MissionRewardType.PLAYER_XP, amount: 10}] },
  { id: MissionId.WEEKLY_DEFEAT_ANY_2_MONSTERS, type: MissionType.DEFEAT_MONSTER_COUNT, descriptionKey: 'mission_WEEKLY_DEFEAT_ANY_2_MONSTERS_desc', targetValue: 2, frequency: 'weekly', rewards: [{type: MissionRewardType.GCOINS, amount: 100}, {type: MissionRewardType.PLAYER_XP, amount: 75}] },
  { id: MissionId.WEEKLY_TRAIN_ADVANCED_INTERVAL_5_TIMES, type: MissionType.TRAIN_ADVANCED_ITEM_CORRECT_COUNT, descriptionKey: 'mission_WEEKLY_TRAIN_ADVANCED_INTERVAL_5_TIMES_desc', targetValue: 5, gameModeScope: GameMode.INTERVALS, frequency: 'weekly', rewards: [{type: MissionRewardType.GCOINS, amount: 80}, {type: MissionRewardType.PLAYER_XP, amount: 50}] },
];

export const MAX_CHILD_HAPPINESS = 100;
export const MAX_CHILD_HUNGER = 100;
export const MAX_CHILD_CLEANLINESS = 100;
export const MAX_CHILD_AFFECTION = 100;
export { BIRTHDAY_CAKE_COST_FROM_ITEMS as BIRTHDAY_CAKE_COST };
