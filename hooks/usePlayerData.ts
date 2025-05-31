
import React, { useState, useEffect, useCallback } from 'react';
import { PlayerData, Achievement, AchievementId, NotificationMessage, GameMode, ThaiUIText, UnlockedItemType, IntervalInfo, ChordInfo, InstrumentSoundId, ShopItem, PetId, ActivePet, PetDefinition, PetAbilityType, PetCustomization, PetSpecialRequest, FurnitureId, MissionDefinition, MissionId, ActiveMission, MissionType, MissionRewardType, MonsterId, MementoId, MonsterDefinition, AppView, AvatarStyle, ActiveQuest, QuestId, QuestDefinition, QuestObjective, QuestStatus, ActiveQuestObjective, QuestObjectiveType, QuestReward } from '../types';
import {
    INITIAL_PLAYER_DATA, INITIAL_ACHIEVEMENTS, LEVEL_THRESHOLDS, UI_TEXT_TH, DAILY_LOGIN_REWARD,
    ALL_INTERVALS, ALL_CHORDS, SHOP_ITEMS, ALL_INSTRUMENT_SOUNDS, PET_DEFINITIONS, PET_CUSTOMIZATION_ITEMS,
    MAX_PET_HUNGER, PET_HUNGER_DECAY_PER_HOUR, PET_FOOD_HUNGER_VALUE, PET_FOOD_ID, getPetName,
    PET_XP_PER_CORRECT_ANSWER, PET_XP_PER_FEEDING, PET_XP_PER_DAILY_LOGIN, PET_LEVEL_THRESHOLDS,
    MAX_PET_HAPPINESS, HAPPINESS_PER_FEEDING, HAPPINESS_PER_PLAY, PET_PLAY_COOLDOWN_HOURS, 
    PET_INTERACTION_ACHIEVEMENT_MILESTONE, MAX_PET_LEVEL, PET_BOREDOM_THRESHOLD_HOURS, HAPPINESS_DECAY_ON_BOREDOM,
    PET_SPECIAL_REQUEST_CHANCE, PET_SPECIAL_REQUEST_REWARD_XP, PET_SPECIAL_REQUEST_REWARD_HAPPINESS,
    HOUSE_UPGRADE_COSTS, MAX_HOUSE_LEVEL, HOUSE_BENEFITS_PER_LEVEL, ALL_FURNITURE_ITEMS,
    PRACTICE_NOOK_COOLDOWN_HOURS, PRACTICE_NOOK_PLAYER_XP_REWARD, PRACTICE_NOOK_PET_XP_REWARD, PRACTICE_NOOK_PET_HAPPINESS_REWARD,
    MISSION_DEFINITIONS, DAILY_MISSIONS_TO_PICK, WEEKLY_MISSIONS_TO_PICK, shuffleArray, getMissionDefinition,
    ALL_MONSTERS, getMonsterDefinition, ALL_MEMENTOS, QUEST_DEFINITIONS, getQuestDefinition, getQuestTitle, FurnitureId as FurnitureIdEnum
} from '../constants';
import { usePetSystem, PetSystemReturn, getCurrentPetAbilityMultiplier } from './usePetSystem'; // Import new hook

const PLAYER_DATA_KEY = 'playerEarTrainingDataV14'; 

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));


export interface PracticeNookResult {
  success: boolean;
  cooldownRemaining?: number;
  rewards?: {
    playerXp: number;
    petXp?: number;
    petHappiness?: number;
  };
}

interface UsePlayerDataReturn {
  playerData: PlayerData;
  addXpAndCoins: (xp: number, coins: number, context: { gameMode: GameMode; currentStreak: number; questionsAnsweredThisMode: number; itemId: string; }) => void;
  getAchievementDetails: (achievementId: AchievementId) => Achievement | undefined;
  notifications: NotificationMessage[];
  dismissNotification: (id: string) => void;
  updateHighestStreak: (currentStreak: number, gameMode: GameMode) => void;
  achievements: Achievement[];
  unlockMusicalItem: (itemId: string, itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD, cost: number) => boolean;
  isMusicalItemUnlocked: (itemId: string, itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD) => boolean;
  checkForDailyLoginReward: () => { baseReward: number; houseBonus: number; totalReward: number; };
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  purchaseShopItem: (shopItem: ShopItem) => { success: boolean; messageKey?: keyof ThaiUIText; itemName?: string; };
  isShopItemPurchased: (itemId: string, itemType: UnlockedItemType) => boolean;
  selectInstrumentSound: (soundId: InstrumentSoundId) => void;
  
  // Pet System functions exposed via usePlayerData
  adoptPet: PetSystemReturn['adoptPet'];
  feedPet: PetSystemReturn['feedPet'];
  playWithPet: PetSystemReturn['playWithPet'];
  setActivePet: PetSystemReturn['setActivePet'];
  applyPetCustomization: PetSystemReturn['applyPetCustomization'];
  getActivePetAbilityMultiplier: (playerDataState: PlayerData, abilityType: PetAbilityType) => number; // Will now consider pet system's data
  updatePetStateOnLoad: () => void; // Will delegate to petSystem.updatePetStatePeriodic

  setPlayerName: (name: string) => void;
  saveGameExplicitly: () => void;
  resetGame: () => void;
  upgradeHouse: () => { success: boolean; messageKey?: keyof ThaiUIText; newLevel?: number; };
  activatePracticeNook: () => PracticeNookResult;
  refreshMissions: () => void;
  claimMissionReward: (missionId: MissionId) => boolean;
  recordMonsterDefeat: (monsterId: MonsterId) => void;
  updateMissionProgress: (missionType: MissionType, valueIncrement?: number, targetDetails?: { itemId?: string; gameMode?: GameMode; gcoinsEarnedInThisEvent?: number; view?: AppView; petId?: PetId; stat?: 'HAPPINESS' | 'LEVEL'; statValue?: number; monsterId?: MonsterId; mementoId?: MementoId; notesPlayed?: number; }) => void;
  toggleHighlightPianoOnPlay: () => void;
  setAvatarStyle: (style: AvatarStyle) => void;
  startQuest: (questId: QuestId) => boolean;
  progressQuest: (questId: QuestId, objectiveIndexToComplete?: number) => boolean;
  completeQuest: (questId: QuestId) => boolean; 
  getQuestStatus: (questId: QuestId) => QuestStatus;
}


export const usePlayerData = (): UsePlayerDataReturn => {
  const [playerData, setPlayerDataState] = useState<PlayerData>(() => {
    try {
        const savedData = localStorage.getItem(PLAYER_DATA_KEY);
        let dataToLoad = deepClone(INITIAL_PLAYER_DATA);
        if (savedData) {
            // Simplified loading logic, assuming migration for pets is handled if old data existed
            let parsedData = JSON.parse(savedData);
            dataToLoad = { ...dataToLoad, ...parsedData };

            // Ensure all keys from INITIAL_PLAYER_DATA are present
            Object.keys(INITIAL_PLAYER_DATA).forEach(key => {
                const k = key as keyof PlayerData;
                if (parsedData[k] === undefined) {
                    parsedData[k] = INITIAL_PLAYER_DATA[k];
                }
            });
             // Ensure nested objects/arrays are also initialized if missing
            dataToLoad.unlockedAchievementIds = Array.isArray(parsedData.unlockedAchievementIds) ? parsedData.unlockedAchievementIds : INITIAL_PLAYER_DATA.unlockedAchievementIds;
            dataToLoad.intervalCorrectCounts = typeof parsedData.intervalCorrectCounts === 'object' && parsedData.intervalCorrectCounts !== null ? parsedData.intervalCorrectCounts : INITIAL_PLAYER_DATA.intervalCorrectCounts;
            dataToLoad.chordCorrectCounts = typeof parsedData.chordCorrectCounts === 'object' && parsedData.chordCorrectCounts !== null ? parsedData.chordCorrectCounts : INITIAL_PLAYER_DATA.chordCorrectCounts;
            dataToLoad.melodyRecallCorrectCounts = typeof parsedData.melodyRecallCorrectCounts === 'object' && parsedData.melodyRecallCorrectCounts !== null ? parsedData.melodyRecallCorrectCounts : INITIAL_PLAYER_DATA.melodyRecallCorrectCounts;
            dataToLoad.unlockedMusicalItemIds = Array.isArray(parsedData.unlockedMusicalItemIds) ? parsedData.unlockedMusicalItemIds : INITIAL_PLAYER_DATA.unlockedMusicalItemIds;
            dataToLoad.purchasedShopItemIds = Array.isArray(parsedData.purchasedShopItemIds) ? parsedData.purchasedShopItemIds : INITIAL_PLAYER_DATA.purchasedShopItemIds;
            dataToLoad.ownedFurnitureIds = Array.isArray(parsedData.ownedFurnitureIds) ? parsedData.ownedFurnitureIds : INITIAL_PLAYER_DATA.ownedFurnitureIds;
            dataToLoad.activeMissions = Array.isArray(parsedData.activeMissions) ? parsedData.activeMissions : INITIAL_PLAYER_DATA.activeMissions;
            dataToLoad.defeatedMonsterIds = Array.isArray(parsedData.defeatedMonsterIds) ? parsedData.defeatedMonsterIds : INITIAL_PLAYER_DATA.defeatedMonsterIds;
            dataToLoad.collectedMementos = Array.isArray(parsedData.collectedMementos) ? parsedData.collectedMementos : INITIAL_PLAYER_DATA.collectedMementos;
            dataToLoad.activeQuests = Array.isArray(parsedData.activeQuests) ? parsedData.activeQuests.map((q: any) => ({
                ...q,
                objectiveProgress: Array.isArray(q.objectiveProgress) ? q.objectiveProgress : (getQuestDefinition(q.questId)?.objectives.map(() => ({completed: false})) || [])
            })) : INITIAL_PLAYER_DATA.activeQuests;
            dataToLoad.inventory = Array.isArray(parsedData.inventory) ? parsedData.inventory : INITIAL_PLAYER_DATA.inventory;

            // Pet related fields, will be managed by usePetSystem, but load them here for initial pass-through
            dataToLoad.ownedPetIds = Array.isArray(parsedData.ownedPetIds) ? parsedData.ownedPetIds : INITIAL_PLAYER_DATA.ownedPetIds;
            dataToLoad.activePetId = parsedData.activePetId || INITIAL_PLAYER_DATA.activePetId;
            dataToLoad.pets = typeof parsedData.pets === 'object' && parsedData.pets !== null ? parsedData.pets : INITIAL_PLAYER_DATA.pets;
            dataToLoad.petFoodCount = typeof parsedData.petFoodCount === 'number' ? parsedData.petFoodCount : INITIAL_PLAYER_DATA.petFoodCount;
            dataToLoad.petInteractionCount = typeof parsedData.petInteractionCount === 'number' ? parsedData.petInteractionCount : INITIAL_PLAYER_DATA.petInteractionCount;
        }
        return dataToLoad;
    } catch (error) {
        console.error("CRITICAL: Failed to initialize player data, resetting. Error:", error);
        try { localStorage.removeItem(PLAYER_DATA_KEY); } catch (e) { console.error("Failed to remove corrupted data:", e); }
        return deepClone(INITIAL_PLAYER_DATA);
    }
  });

  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  const setPlayerDataOptimistic = useCallback((updater: (prevData: PlayerData) => PlayerData) => {
    setPlayerDataState(prev => {
        const newState = updater(prev);
        // Consider if saveData should be called here or batched in a main useEffect
        return newState;
    });
  }, []);


  const addNotification = useCallback((notification: Omit<NotificationMessage, 'id'>) => {
    const newNotification = { ...notification, id: Date.now().toString() + Math.random().toString() };
    setNotifications(prev => [newNotification, ...prev.slice(0,2)]); // Keep max 3 notifications
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);
  
  const petSystem = usePetSystem({
    initialPetsState: {
        ownedPetIds: playerData.ownedPetIds,
        activePetId: playerData.activePetId,
        pets: playerData.pets,
        petFoodCount: playerData.petFoodCount,
        petInteractionCount: playerData.petInteractionCount,
    },
    gCoins: playerData.gCoins,
    setPlayerDataOptimistic,
    addNotification,
    unlockAchievement: (achievementId, currentPlayerData) => { // Pass a simplified unlocker or the full one
        // This function needs to be robust. For now, a placeholder that calls the main unlockAchievementInternal
        // but ideally, usePlayerData.unlockAchievementInternal is passed directly or this is refined.
        return unlockAchievementInternal(achievementId, currentPlayerData);
    },
    playerUnlockedMusicalItems: playerData.unlockedMusicalItemIds,
    playerLevel: playerData.level,
    getActivePlayerAbilityMultiplier: (abilityType: PetAbilityType) => 1, // Placeholder, player might have abilities affecting pets
    getHouseBenefits: () => { // Provide house benefits to pet system
        const benefits = HOUSE_BENEFITS_PER_LEVEL[playerData.houseLevel] || HOUSE_BENEFITS_PER_LEVEL[0];
        return {
            ...benefits,
            furnitureBonuses: {
                comfyPetBedHappinessBoost: playerData.ownedFurnitureIds.includes(FurnitureIdEnum.COMFY_PET_BED) ? 5 : 0,
            }
        };
    },
    updateMissionProgress: (missionType, valueIncrement, targetDetails) => {
        // This is tricky. Pet system needs to update missions, but main hook owns missions.
        // Option 1: Pet system returns mission update requests, main hook processes.
        // Option 2: Pass a restricted updateMissionProgress from main hook.
        // For now, let's assume pet system calls this prop, and usePlayerData handles it.
        // This requires updateMissionProgress to be defined before petSystem initialization if called synchronously.
        // Let's make updateMissionProgress in petSystem queue updates, and main hook processes queue.
        // OR, more directly, allow petSystem to call the main updateMissionProgress.
         updateMissionProgressInternal(missionType, valueIncrement, targetDetails);
    }
  });

  // Sync pet system state back to main playerData state
  useEffect(() => {
    setPlayerDataState(prev => ({
        ...prev,
        ownedPetIds: petSystem.ownedPetIds,
        activePetId: petSystem.activePetId,
        pets: petSystem.pets,
        petFoodCount: petSystem.petFoodCount,
        petInteractionCount: petSystem.petInteractionCount,
    }));
  }, [
    petSystem.ownedPetIds, 
    petSystem.activePetId, 
    petSystem.pets, 
    petSystem.petFoodCount, 
    petSystem.petInteractionCount
  ]);


  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const saveData = useCallback((dataToSave: PlayerData) => {
    try {
        localStorage.setItem(PLAYER_DATA_KEY, JSON.stringify(dataToSave));
    } catch (error) {
        console.error("Error saving player data to localStorage:", error);
    }
  }, []);

  useEffect(() => {
    saveData(playerData);
  }, [playerData, saveData]);

  useEffect(() => {
    const currentUnlockedIds = playerData.unlockedAchievementIds || [];
    setAchievements(prevAchievements =>
      prevAchievements.map(ach => ({
        ...ach,
        unlocked: currentUnlockedIds.includes(ach.id),
      }))
    );
  }, [playerData.unlockedAchievementIds]);

  const getAchievementDetails = useCallback((achievementId: AchievementId): Achievement | undefined => {
    return achievements.find(ach => ach.id === achievementId);
  }, [achievements]);

  const unlockAchievementInternal = useCallback((achievementId: AchievementId, currentPlayerData: PlayerData): { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> } => {
    let notification: Omit<NotificationMessage, 'id'> | undefined = undefined;
    if (!currentPlayerData.unlockedAchievementIds.includes(achievementId)) {
      const newUnlockedIds = [...currentPlayerData.unlockedAchievementIds, achievementId];
      const achievement = INITIAL_ACHIEVEMENTS.find(ach => ach.id === achievementId); // Use INITIAL_ACHIEVEMENTS for details
      if (achievement) {
        notification = {
            type: 'achievement',
            titleKey: 'achievementUnlocked',
            itemName: UI_TEXT_TH[achievement.nameKey]
        };
      }
      return { updatedPlayerData: { ...currentPlayerData, unlockedAchievementIds: newUnlockedIds }, notification };
    }
    return { updatedPlayerData: currentPlayerData };
  }, [UI_TEXT_TH]);


  const checkAndApplyLevelUp = useCallback((currentXp: number, currentLevel: number): { newLevel: number, leveledUp: boolean, notification?: Omit<NotificationMessage, 'id'> } => {
    let newLevel = currentLevel;
    let leveledUp = false;
    let notification: Omit<NotificationMessage, 'id'> | undefined = undefined;
    while (newLevel < LEVEL_THRESHOLDS.length && currentXp >= LEVEL_THRESHOLDS[newLevel]) {
      newLevel++;
      leveledUp = true;
    }
    if (leveledUp) {
      notification = { type: 'levelUp', titleKey: 'levelUp', itemName: `${UI_TEXT_TH.playerLevel} ${newLevel}` };
    }
    return { newLevel, leveledUp, notification };
  }, [UI_TEXT_TH]);

  const _getUpdatedMissionsAndNotifications = useCallback((
    currentActiveMissions: ActiveMission[],
    playerDataSnapshot: PlayerData, // Full snapshot for context
    missionType: MissionType,
    valueIncrement: number = 1,
    targetDetails?: { itemId?: string, gameMode?: GameMode, gcoinsEarnedInThisEvent?: number, view?: AppView, petId?: PetId, stat?: 'HAPPINESS' | 'LEVEL', statValue?: number, monsterId?: MonsterId, mementoId?: MementoId, notesPlayed?: number }
  ): { updatedMissions: ActiveMission[], notificationsToQueue: Omit<NotificationMessage, 'id'>[] } => {
    const newMissions = deepClone(currentActiveMissions);
    const notificationsToQueue: Omit<NotificationMessage, 'id'>[] = [];

    newMissions.forEach(activeMission => {
      if (activeMission.completed && missionType !== MissionType.COMPLETE_DAILY_MISSION_COUNT) return;

      const definition = getMissionDefinition(activeMission.definitionId);
      if (!definition || definition.type !== missionType) return;

      let progressMade = false;

      switch (missionType) {
        case MissionType.TRAIN_ITEM_CORRECT_COUNT:
          if (definition.targetItemType === targetDetails?.gameMode &&
              (!definition.targetItemId || definition.targetItemId === targetDetails?.itemId)) {
            activeMission.progress += valueIncrement;
            progressMade = true;
          }
          break;
        case MissionType.TRAINING_STREAK:
          if (definition.gameModeScope === targetDetails?.gameMode) {
            if (valueIncrement >= definition.targetValue) {
              activeMission.progress = definition.targetValue;
            } else {
              activeMission.progress = Math.max(activeMission.progress, valueIncrement);
            }
            if (activeMission.progress > 0) progressMade = true;
          }
          break;
        case MissionType.FEED_PET_COUNT:
        case MissionType.USE_PRACTICE_NOOK_COUNT:
        case MissionType.DEFEAT_MONSTER_COUNT:
          activeMission.progress += valueIncrement;
          progressMade = true;
          break;
        case MissionType.EARN_GCOINS_FROM_TRAINING:
          if (targetDetails?.gcoinsEarnedInThisEvent) {
            activeMission.progress += targetDetails.gcoinsEarnedInThisEvent;
            progressMade = true;
          }
          break;
        case MissionType.EARN_GCOINS_TOTAL:
          const gcoinsBeforeThisEvent = playerDataSnapshot.gCoins - (targetDetails?.gcoinsEarnedInThisEvent || 0);
          if (activeMission.lastGcoinCheckValue === undefined) {
             activeMission.lastGcoinCheckValue = gcoinsBeforeThisEvent;
          }
          const gcoinsSinceLastCheck = playerDataSnapshot.gCoins - activeMission.lastGcoinCheckValue;
          if (gcoinsSinceLastCheck > 0) {
            activeMission.progress += gcoinsSinceLastCheck;
            progressMade = true;
          }
          activeMission.lastGcoinCheckValue = playerDataSnapshot.gCoins;
          break;
        case MissionType.COMPLETE_DAILY_MISSION_COUNT:
             if (valueIncrement > activeMission.progress) {
                activeMission.progress = valueIncrement;
                progressMade = true;
             }
            break;
        case MissionType.START_MONSTER_BATTLE:
          if (definition.targetMonsterId === targetDetails?.monsterId) {
            activeMission.progress += valueIncrement;
            progressMade = true;
          }
          break;
        case MissionType.PET_REACH_STAT:
          if (playerDataSnapshot.activePetId && targetDetails?.petId === playerDataSnapshot.activePetId && definition.targetPetStat === targetDetails?.stat) {
            activeMission.currentPetStatValue = targetDetails?.statValue;
            if (targetDetails.statValue !== undefined && targetDetails.statValue >= definition.targetValue) {
              activeMission.progress = definition.targetValue;
            } else {
              activeMission.progress = targetDetails.statValue || 0;
            }
            progressMade = true;
          }
          break;
        case MissionType.PLAY_NOTES_FREESTYLE_COUNT:
          if (targetDetails?.notesPlayed !== undefined) {
            activeMission.progress = Math.min(targetDetails.notesPlayed, definition.targetValue) ;
            if(activeMission.progress > 0) progressMade = true;
          }
          break;
        case MissionType.TRAIN_ADVANCED_ITEM_CORRECT_COUNT:
          const item = targetDetails?.itemId ? (
            targetDetails.gameMode === GameMode.INTERVALS ? ALL_INTERVALS.find(i => i.id === targetDetails.itemId) : ALL_CHORDS.find(c => c.id === targetDetails.itemId)
          ) : undefined;
          if (item?.isAdvanced && definition.targetItemType === targetDetails?.gameMode) {
            activeMission.progress += valueIncrement;
            progressMade = true;
          }
          break;
      }

      if (progressMade && activeMission.progress >= definition.targetValue && !activeMission.completed) {
        activeMission.completed = true;
        notificationsToQueue.push({
          type: 'missionCompleted',
          titleKey: 'missionCompletedNotificationTitle',
          missionName: UI_TEXT_TH[definition.descriptionKey]
        });
      }
    });
    return { updatedMissions: newMissions, notificationsToQueue };
  }, [UI_TEXT_TH]);

  const updateMissionProgressInternal = useCallback((
    missionType: MissionType, 
    valueIncrement: number = 1, 
    targetDetails?: { itemId?: string, gameMode?: GameMode, gcoinsEarnedInThisEvent?: number, view?: AppView, petId?: PetId, stat?: 'HAPPINESS' | 'LEVEL', statValue?: number, monsterId?: MonsterId, mementoId?: MementoId, notesPlayed?: number }
    ) => {
      setPlayerDataState(prevData => {
        const { updatedMissions, notificationsToQueue } = _getUpdatedMissionsAndNotifications(
            prevData.activeMissions,
            prevData, 
            missionType,
            valueIncrement,
            targetDetails
        );
        notificationsToQueue.forEach(addNotification);
        if (updatedMissions !== prevData.activeMissions) { // Check for actual change
            return { ...prevData, activeMissions: updatedMissions };
        }
        return prevData; 
      });
  }, [_getUpdatedMissionsAndNotifications, addNotification]);


  const _handlePlayerLevelUp = useCallback((currentXp: number, currentLevel: number, notificationsToQueue: Omit<NotificationMessage, 'id'>[]): { newLevel: number, leveledUp: boolean } => {
      const levelResult = checkAndApplyLevelUp(currentXp, currentLevel);
      if (levelResult.notification) notificationsToQueue.push(levelResult.notification);
      return { newLevel: levelResult.newLevel, leveledUp: levelResult.leveledUp };
  }, [checkAndApplyLevelUp]);
  
  const _updateGeneralAchievements = useCallback((
    currentPlayerData: PlayerData,
    notificationsToQueue: Omit<NotificationMessage, 'id'>[]
  ): PlayerData => {
      let modifiablePlayerData = { ...currentPlayerData };
      const achievementChecks: AchievementId[] = [
          ...(modifiablePlayerData.level >= 5 ? [AchievementId.REACH_LEVEL_5] : []),
          ...(modifiablePlayerData.level >= 10 ? [AchievementId.REACH_LEVEL_10] : []),
          ...(modifiablePlayerData.level >= 15 ? [AchievementId.REACH_LEVEL_15] : []),
          ...(modifiablePlayerData.gCoins >= 100 ? [AchievementId.COLLECT_100_GCOINS] : []),
          ...(modifiablePlayerData.gCoins >= 500 ? [AchievementId.COLLECT_500_GCOINS] : []),
          ...(modifiablePlayerData.gCoins >= 1000 ? [AchievementId.COLLECT_1000_GCOINS] : []),
      ];
      
      const firstAdvancedUnlocked = modifiablePlayerData.unlockedMusicalItemIds.some(item => {
          const musicalItem = item.type === UnlockedItemType.INTERVAL ? ALL_INTERVALS.find(i => i.id === item.id) : ALL_CHORDS.find(c => c.id === item.id);
          return musicalItem?.isAdvanced;
      });
      if (firstAdvancedUnlocked) achievementChecks.push(AchievementId.UNLOCK_FIRST_ADVANCED_ITEM);
      
      const actualShopPurchases = modifiablePlayerData.purchasedShopItemIds.filter(p => !(p.type === UnlockedItemType.INSTRUMENT_SOUND && p.id === InstrumentSoundId.SINE) && p.type !== UnlockedItemType.PET_FOOD && p.type !== UnlockedItemType.PET_CUSTOMIZATION && p.type !== UnlockedItemType.FURNITURE).length;
      if (actualShopPurchases >= 1) achievementChecks.push(AchievementId.PURCHASE_FIRST_SHOP_ITEM);

      const customizedPetsCount = modifiablePlayerData.purchasedShopItemIds.filter(p => p.type === UnlockedItemType.PET_CUSTOMIZATION).length;
      if (customizedPetsCount > 0) achievementChecks.push(AchievementId.PET_CUSTOMIZED_FIRST);

      achievementChecks.forEach(achId => {
          if (!modifiablePlayerData.unlockedAchievementIds.includes(achId)) {
            const achRes = unlockAchievementInternal(achId, modifiablePlayerData);
            modifiablePlayerData = achRes.updatedPlayerData;
            if (achRes.notification) notificationsToQueue.push(achRes.notification);
          }
      });
      return modifiablePlayerData;
  }, [unlockAchievementInternal]);

  const _updateItemModeAchievements = useCallback((
    currentPlayerData: PlayerData,
    context: { gameMode: GameMode, itemId: string, questionsAnsweredThisMode: number },
    currentItemCorrectCount: number,
    notificationsToQueue: Omit<NotificationMessage, 'id'>[]
  ): PlayerData => {
      let modifiablePlayerData = { ...currentPlayerData };
      let firstCorrectAchievementId: AchievementId | null = null;
      if (context.gameMode === GameMode.INTERVALS) {
          if (context.questionsAnsweredThisMode >= 1) firstCorrectAchievementId = AchievementId.FIRST_CORRECT_INTERVAL;
      } else if (context.gameMode === GameMode.CHORDS) {
          if (context.questionsAnsweredThisMode >= 1) firstCorrectAchievementId = AchievementId.FIRST_CORRECT_CHORD;
      } else if (context.gameMode === GameMode.MELODY_RECALL) {
          if (context.questionsAnsweredThisMode >= 1) firstCorrectAchievementId = AchievementId.FIRST_CORRECT_MELODY;
      }

      if (firstCorrectAchievementId && !modifiablePlayerData.unlockedAchievementIds.includes(firstCorrectAchievementId)) {
          const achRes = unlockAchievementInternal(firstCorrectAchievementId, modifiablePlayerData);
          modifiablePlayerData = achRes.updatedPlayerData;
          if (achRes.notification) notificationsToQueue.push(achRes.notification);
      }

      INITIAL_ACHIEVEMENTS.forEach(achDef => {
        if (achDef.itemId === context.itemId && achDef.itemType === context.gameMode && achDef.milestone && currentItemCorrectCount >= achDef.milestone) {
           if (!modifiablePlayerData.unlockedAchievementIds.includes(achDef.id)) {
               const achRes = unlockAchievementInternal(achDef.id, modifiablePlayerData);
               modifiablePlayerData = achRes.updatedPlayerData;
               if (achRes.notification) notificationsToQueue.push(achRes.notification);
           }
        }
      });
      return modifiablePlayerData;
  }, [unlockAchievementInternal]);


  const addXpAndCoins = useCallback((xp: number, coins: number, context: { gameMode: GameMode, currentStreak: number, questionsAnsweredThisMode: number, itemId: string }) => {
    setPlayerDataState(prevData => {
      let updatedData = deepClone(prevData);
      let notificationsToQueueHere: Omit<NotificationMessage, 'id'>[] = [];

      const playerXpBoostFromPet = getCurrentPetAbilityMultiplier(updatedData.activePetId, updatedData.pets, PetAbilityType.XP_BOOST_TRAINING);
      const houseBenefits = HOUSE_BENEFITS_PER_LEVEL[prevData.houseLevel] || HOUSE_BENEFITS_PER_LEVEL[0];
      let xpMultiplierFromFurniture = 1.0;
      if (prevData.ownedFurnitureIds.includes(FurnitureIdEnum.GRAND_PIANO)) xpMultiplierFromFurniture = 1.02;

      const finalXp = Math.round(xp * playerXpBoostFromPet * houseBenefits.trainingXpMultiplier * xpMultiplierFromFurniture);
      const finalCoins = Math.round(coins * houseBenefits.trainingGCoinMultiplier);

      updatedData.xp += finalXp;
      updatedData.gCoins += finalCoins;
      
      const playerLevelUpResult = _handlePlayerLevelUp(updatedData.xp, updatedData.level, notificationsToQueueHere);
      updatedData.level = playerLevelUpResult.newLevel;

      // Delegate pet XP and special request handling to petSystem
      const petXpResult = petSystem.handlePetXPForCorrectAnswer(updatedData.activePetId, updatedData.pets);
      if(petXpResult.updatedPets) updatedData.pets = petXpResult.updatedPets;
      notificationsToQueueHere.push(...petXpResult.notifications);
      if(petXpResult.updatedPlayerDataForAch?.unlockedAchievementIds) { // Simplified achievement update from petSystem
         updatedData.unlockedAchievementIds = Array.from(new Set([...updatedData.unlockedAchievementIds, ...petXpResult.updatedPlayerDataForAch.unlockedAchievementIds]));
      }

      const petSpecialRequestResult = petSystem.handlePetSpecialRequestFulfillment(context.gameMode, context.itemId, updatedData.activePetId, updatedData.pets);
      if(petSpecialRequestResult.updatedPets) updatedData.pets = petSpecialRequestResult.updatedPets;
      notificationsToQueueHere.push(...petSpecialRequestResult.notifications);
      if(petSpecialRequestResult.updatedPlayerDataForAch?.unlockedAchievementIds) {
         updatedData.unlockedAchievementIds = Array.from(new Set([...updatedData.unlockedAchievementIds, ...petSpecialRequestResult.updatedPlayerDataForAch.unlockedAchievementIds]));
      }
      
      let currentItemCorrectCount = 0;
      if (context.gameMode === GameMode.INTERVALS) {
        updatedData.intervalQuestionsAnswered = (updatedData.intervalQuestionsAnswered || 0) + 1;
        updatedData.intervalCorrectCounts[context.itemId] = (updatedData.intervalCorrectCounts[context.itemId] || 0) + 1;
        currentItemCorrectCount = updatedData.intervalCorrectCounts[context.itemId];
      } else if (context.gameMode === GameMode.CHORDS) {
        updatedData.chordQuestionsAnswered = (updatedData.chordQuestionsAnswered || 0) + 1;
        updatedData.chordCorrectCounts[context.itemId] = (updatedData.chordCorrectCounts[context.itemId] || 0) + 1;
        currentItemCorrectCount = updatedData.chordCorrectCounts[context.itemId];
      } else if (context.gameMode === GameMode.MELODY_RECALL) {
        updatedData.melodyRecallQuestionsAnswered = (updatedData.melodyRecallQuestionsAnswered || 0) + 1;
        updatedData.melodyRecallCorrectCounts[context.itemId] = (updatedData.melodyRecallCorrectCounts[context.itemId] || 0) + 1;
        currentItemCorrectCount = updatedData.melodyRecallCorrectCounts[context.itemId];
      }

      updatedData = _updateGeneralAchievements(updatedData, notificationsToQueueHere);
      updatedData = _updateItemModeAchievements(updatedData, context, currentItemCorrectCount, notificationsToQueueHere);
      
      const missionContext = { gameMode: context.gameMode, itemId: context.itemId, gcoinsEarnedInThisEvent: finalCoins };
      let missionUpdateResult = _getUpdatedMissionsAndNotifications(updatedData.activeMissions, updatedData, MissionType.TRAIN_ITEM_CORRECT_COUNT, 1, missionContext);
      updatedData.activeMissions = missionUpdateResult.updatedMissions; notificationsToQueueHere.push(...missionUpdateResult.notificationsToQueue);

      missionUpdateResult = _getUpdatedMissionsAndNotifications(updatedData.activeMissions, updatedData, MissionType.TRAIN_ADVANCED_ITEM_CORRECT_COUNT, 1, missionContext);
      updatedData.activeMissions = missionUpdateResult.updatedMissions; notificationsToQueueHere.push(...missionUpdateResult.notificationsToQueue);
      
      missionUpdateResult = _getUpdatedMissionsAndNotifications(updatedData.activeMissions, updatedData, MissionType.TRAINING_STREAK, context.currentStreak, missionContext);
      updatedData.activeMissions = missionUpdateResult.updatedMissions; notificationsToQueueHere.push(...missionUpdateResult.notificationsToQueue);

      if (finalCoins > 0) {
          missionUpdateResult = _getUpdatedMissionsAndNotifications(updatedData.activeMissions, updatedData, MissionType.EARN_GCOINS_FROM_TRAINING, 0, missionContext);
          updatedData.activeMissions = missionUpdateResult.updatedMissions; notificationsToQueueHere.push(...missionUpdateResult.notificationsToQueue);
          
          missionUpdateResult = _getUpdatedMissionsAndNotifications(updatedData.activeMissions, updatedData, MissionType.EARN_GCOINS_TOTAL, 0, missionContext);
          updatedData.activeMissions = missionUpdateResult.updatedMissions; notificationsToQueueHere.push(...missionUpdateResult.notificationsToQueue);
      }
      
      notificationsToQueueHere.forEach(addNotification);
      return updatedData;
    });
  }, [_handlePlayerLevelUp, _updateGeneralAchievements, _updateItemModeAchievements, _getUpdatedMissionsAndNotifications, addNotification, petSystem]);

  const updateHighestStreak = useCallback((currentStreakValue: number, gameModeForStreak: GameMode) => {
    setPlayerDataState(prevData => {
      let updatedData = { ...prevData };
      let notificationsToQueueHere: Omit<NotificationMessage, 'id'>[] = [];
      let newHighest = false;

      if (gameModeForStreak === GameMode.MELODY_RECALL) {
        if (currentStreakValue > (updatedData.melodyRecallHighestStreak || 0)) {
          updatedData.melodyRecallHighestStreak = currentStreakValue;
          newHighest = true;
        }
        if (currentStreakValue >= 3 && !updatedData.unlockedAchievementIds.includes(AchievementId.MELODY_RECALL_STREAK_3)) {
            const achRes = unlockAchievementInternal(AchievementId.MELODY_RECALL_STREAK_3, updatedData);
            updatedData = achRes.updatedPlayerData; if(achRes.notification) notificationsToQueueHere.push(achRes.notification);
        }
        if (currentStreakValue >= 7 && !updatedData.unlockedAchievementIds.includes(AchievementId.MELODY_RECALL_STREAK_7)) {
            const achRes = unlockAchievementInternal(AchievementId.MELODY_RECALL_STREAK_7, updatedData);
            updatedData = achRes.updatedPlayerData; if(achRes.notification) notificationsToQueueHere.push(achRes.notification);
        }
      } else { 
        if (currentStreakValue > (updatedData.highestStreak || 0)) {
          updatedData.highestStreak = currentStreakValue;
          newHighest = true;
        }
        if (currentStreakValue >= 5 && !updatedData.unlockedAchievementIds.includes(AchievementId.STREAK_5)) {
           const achRes = unlockAchievementInternal(AchievementId.STREAK_5, updatedData);
           updatedData = achRes.updatedPlayerData; if(achRes.notification) notificationsToQueueHere.push(achRes.notification);
        }
        if (currentStreakValue >= 10 && !updatedData.unlockedAchievementIds.includes(AchievementId.STREAK_10)) {
            const achRes = unlockAchievementInternal(AchievementId.STREAK_10, updatedData);
            updatedData = achRes.updatedPlayerData; if(achRes.notification) notificationsToQueueHere.push(achRes.notification);
        }
        if (currentStreakValue >= 15 && !updatedData.unlockedAchievementIds.includes(AchievementId.STREAK_15)) {
            const achRes = unlockAchievementInternal(AchievementId.STREAK_15, updatedData);
            updatedData = achRes.updatedPlayerData; if(achRes.notification) notificationsToQueueHere.push(achRes.notification);
        }
      }
      
      const missionContext = { gameMode: gameModeForStreak };
      const missionUpdateResult = _getUpdatedMissionsAndNotifications(updatedData.activeMissions, updatedData, MissionType.TRAINING_STREAK, currentStreakValue, missionContext);
      updatedData.activeMissions = missionUpdateResult.updatedMissions; 
      notificationsToQueueHere.push(...missionUpdateResult.notificationsToQueue);

      notificationsToQueueHere.forEach(addNotification);
      return newHighest || notificationsToQueueHere.length > 0 ? updatedData : prevData;
    });
  }, [unlockAchievementInternal, _getUpdatedMissionsAndNotifications, addNotification]);


  const checkForDailyLoginReward = useCallback((): { baseReward: number, houseBonus: number, totalReward: number } => {
    const today = new Date().toISOString().split('T')[0];
    let baseReward = 0;
    let houseBonus = 0;
    setPlayerDataState(prevData => {
      if (prevData.lastLoginDate !== today) {
        baseReward = DAILY_LOGIN_REWARD;
        const currentHouseBenefits = HOUSE_BENEFITS_PER_LEVEL[prevData.houseLevel] || HOUSE_BENEFITS_PER_LEVEL[0];
        houseBonus = currentHouseBenefits.dailyLoginBonusGCoins;
        let updatedData = { ...prevData, lastLoginDate: today, gCoins: prevData.gCoins + baseReward + houseBonus };
        let notificationsToQueueHere: Omit<NotificationMessage, 'id'>[] = [];

        const petLoginResult = petSystem.handlePetDailyLogin(updatedData.activePetId, updatedData.pets);
        if(petLoginResult.updatedPets) updatedData.pets = petLoginResult.updatedPets;
        notificationsToQueueHere.push(...petLoginResult.notifications);
        if(petLoginResult.updatedPlayerDataForAch?.unlockedAchievementIds) {
            updatedData.unlockedAchievementIds = Array.from(new Set([...updatedData.unlockedAchievementIds, ...petLoginResult.updatedPlayerDataForAch.unlockedAchievementIds]));
        }

        if (baseReward + houseBonus > 0) {
            const missionRes = _getUpdatedMissionsAndNotifications(updatedData.activeMissions, updatedData, MissionType.EARN_GCOINS_TOTAL, 0, {gcoinsEarnedInThisEvent: baseReward + houseBonus});
            updatedData.activeMissions = missionRes.updatedMissions;
            notificationsToQueueHere.push(...missionRes.notificationsToQueue);
        }
        notificationsToQueueHere.forEach(addNotification);
        return updatedData;
      }
      return prevData;
    });
    return { baseReward, houseBonus, totalReward: baseReward + houseBonus };
  }, [addNotification, petSystem, _getUpdatedMissionsAndNotifications]);

  const unlockMusicalItem = useCallback((itemId: string, itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD, cost: number): boolean => {
    let success = false;
    setPlayerDataState(prevData => {
      let finalCost = cost;
      const petDiscountMultiplier = getCurrentPetAbilityMultiplier(prevData.activePetId, prevData.pets, PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES);
      finalCost = Math.max(0, Math.round(finalCost * (1 - petDiscountMultiplier)));
      if (prevData.ownedFurnitureIds.includes(FurnitureIdEnum.MUSIC_THEORY_SHELF)) finalCost = Math.max(0, Math.round(finalCost * (1 - 0.03)));
      
      if (prevData.gCoins >= finalCost && !prevData.unlockedMusicalItemIds.some(item => item.id === itemId && item.type === itemType)) {
        success = true;
        let updatedData = { ...prevData, gCoins: prevData.gCoins - finalCost, unlockedMusicalItemIds: [...prevData.unlockedMusicalItemIds, { id: itemId, type: itemType }] };
        let notificationsToQueueHere: Omit<NotificationMessage, 'id'>[] = [];

        const musicalItemDetails = itemType === UnlockedItemType.INTERVAL ? ALL_INTERVALS.find(i => i.id === itemId) : ALL_CHORDS.find(c => c.id === itemId);
        if (musicalItemDetails?.isAdvanced) {
            const anyOtherAdvancedUnlocked = prevData.unlockedMusicalItemIds.some(unlockedItem => {
                 const details = unlockedItem.type === UnlockedItemType.INTERVAL ? ALL_INTERVALS.find(i => i.id === unlockedItem.id) : ALL_CHORDS.find(c => c.id === unlockedItem.id);
                 return details?.isAdvanced;
            });
            if (!anyOtherAdvancedUnlocked && !updatedData.unlockedAchievementIds.includes(AchievementId.UNLOCK_FIRST_ADVANCED_ITEM)) {
                const achRes = unlockAchievementInternal(AchievementId.UNLOCK_FIRST_ADVANCED_ITEM, updatedData);
                updatedData = achRes.updatedPlayerData;
                if(achRes.notification) notificationsToQueueHere.push(achRes.notification);
            }
        }
        const missionRes = _getUpdatedMissionsAndNotifications(updatedData.activeMissions, updatedData, MissionType.EARN_GCOINS_TOTAL, 0, {gcoinsEarnedInThisEvent: -finalCost});
        updatedData.activeMissions = missionRes.updatedMissions;
        notificationsToQueueHere.push(...missionRes.notificationsToQueue);
        notificationsToQueueHere.forEach(addNotification);
        return updatedData;
      }
      return prevData;
    });
    return success;
  }, [unlockAchievementInternal, _getUpdatedMissionsAndNotifications, addNotification]);

 const purchaseShopItem = useCallback((shopItem: ShopItem): { success: boolean, messageKey?: keyof ThaiUIText, itemName?: string } => {
    let outcome: { success: boolean, messageKey?: keyof ThaiUIText, itemName?: string } = { success: false, messageKey: undefined, itemName: undefined };
    setPlayerDataState(prevData => {
      const itemNameLocalized = UI_TEXT_TH[shopItem.nameKey] || shopItem.id;
      outcome.itemName = itemNameLocalized;
      if (prevData.gCoins < shopItem.cost) {
        outcome = { ...outcome, success: false, messageKey: 'notEnoughGCoins' };
        return prevData;
      }
      if (shopItem.type !== UnlockedItemType.PET_FOOD && prevData.purchasedShopItemIds.some(item => item.id === shopItem.id && item.type === shopItem.type)) {
          outcome = { ...outcome, success: true, messageKey: 'purchased' }; // Already purchased (except food)
          return prevData;
      }
      
      let updatedData = { ...prevData };
      let notificationsToQueueHere: Omit<NotificationMessage, 'id'>[] = [];
      updatedData.gCoins -= shopItem.cost;

      if (shopItem.type === UnlockedItemType.PET_FOOD) {
        petSystem.increasePetFoodCount(1); // Delegate to petSystem
        outcome = { ...outcome, success: true, messageKey: 'itemPurchasedSuccess' };
      } else if (shopItem.type === UnlockedItemType.INSTRUMENT_SOUND || shopItem.type === UnlockedItemType.PET_CUSTOMIZATION || shopItem.type === UnlockedItemType.FURNITURE) {
        updatedData.purchasedShopItemIds = [ ...updatedData.purchasedShopItemIds, { id: shopItem.id, type: shopItem.type }];
        if (shopItem.type === UnlockedItemType.FURNITURE) updatedData.ownedFurnitureIds = [...(updatedData.ownedFurnitureIds || []), shopItem.id as FurnitureId];
        outcome = { ...outcome, success: true, messageKey: 'itemPurchasedSuccess' };
        
        let achRes;
        if (shopItem.type === UnlockedItemType.INSTRUMENT_SOUND) {
            const actualShopPurchases = updatedData.purchasedShopItemIds.filter(p => !(p.type === UnlockedItemType.INSTRUMENT_SOUND && p.id === InstrumentSoundId.SINE) && p.type !== UnlockedItemType.PET_FOOD && p.type !== UnlockedItemType.PET_CUSTOMIZATION && p.type !== UnlockedItemType.FURNITURE).length;
            if (actualShopPurchases >= 1 && !updatedData.unlockedAchievementIds.includes(AchievementId.PURCHASE_FIRST_SHOP_ITEM)) {
                achRes = unlockAchievementInternal(AchievementId.PURCHASE_FIRST_SHOP_ITEM, updatedData);
                updatedData = achRes.updatedPlayerData; if(achRes.notification) notificationsToQueueHere.push(achRes.notification);
            }
        } else if (shopItem.type === UnlockedItemType.PET_CUSTOMIZATION) {
            // Pet customization achievement is handled by applyPetCustomization in petSystem
        } else if (shopItem.type === UnlockedItemType.FURNITURE) {
            if (!updatedData.unlockedAchievementIds.includes(AchievementId.PURCHASE_FIRST_FURNITURE)) {
                 achRes = unlockAchievementInternal(AchievementId.PURCHASE_FIRST_FURNITURE, updatedData);
                 updatedData = achRes.updatedPlayerData; if(achRes.notification) notificationsToQueueHere.push(achRes.notification);
            }
        }
      } else {
        outcome = { ...outcome, success: false };
        return prevData;
      }
      const missionRes = _getUpdatedMissionsAndNotifications(updatedData.activeMissions, updatedData, MissionType.EARN_GCOINS_TOTAL, 0, {gcoinsEarnedInThisEvent: -shopItem.cost});
      updatedData.activeMissions = missionRes.updatedMissions;
      notificationsToQueueHere.push(...missionRes.notificationsToQueue);
      notificationsToQueueHere.forEach(addNotification);
      return updatedData;
    });
    return outcome;
  }, [unlockAchievementInternal, UI_TEXT_TH, _getUpdatedMissionsAndNotifications, addNotification, petSystem]);

  const selectInstrumentSound = useCallback((soundId: InstrumentSoundId) => {
    setPlayerDataState(prevData => ({ ...prevData, selectedInstrumentSoundId: soundId }));
  }, []);
  
  const setPlayerName = useCallback((name: string) => {
    setPlayerDataState(prev => ({...prev, playerName: name }));
  }, []);

  const saveGameExplicitly = useCallback(() => {
    saveData(playerData); 
    addNotification({ type: 'info', titleKey: 'saveGameSuccessMessage' });
  }, [playerData, saveData, addNotification]);

  const resetGame = useCallback(() => {
    localStorage.removeItem(PLAYER_DATA_KEY);
    setPlayerDataState(deepClone(INITIAL_PLAYER_DATA)); // Resets main player data
    // Pet system state is part of PlayerData, so it gets reset too.
    // Re-initialize achievements
    setAchievements(INITIAL_ACHIEVEMENTS);
    addNotification({ type: 'info', titleKey: 'gameResetSuccessMessage' });
  }, [addNotification]);

  const upgradeHouse = useCallback((): { success: boolean, messageKey?: keyof ThaiUIText, newLevel?: number } => {
    let outcome: { success: boolean, messageKey?: keyof ThaiUIText, newLevel?: number } = { success: false };
    setPlayerDataState(prevData => {
        if (prevData.houseLevel >= MAX_HOUSE_LEVEL) {
            outcome = { success: false, messageKey: 'maxHouseLevelReached' };
            return prevData;
        }
        const nextLevel = prevData.houseLevel + 1;
        const cost = HOUSE_UPGRADE_COSTS[nextLevel];
        if (prevData.gCoins < cost) {
            outcome = { success: false, messageKey: 'notEnoughGCoinsForUpgrade' };
            return prevData;
        }
        let updatedData = { ...prevData, gCoins: prevData.gCoins - cost, houseLevel: nextLevel };
        let notificationsToQueueHere: Omit<NotificationMessage, 'id'>[] = [];
        
        let achResult;
        if (nextLevel === 1 && !updatedData.unlockedAchievementIds.includes(AchievementId.ACHIEVE_FIRST_HOUSE)) {
            achResult = unlockAchievementInternal(AchievementId.ACHIEVE_FIRST_HOUSE, updatedData);
        } else if (nextLevel === 2 && !updatedData.unlockedAchievementIds.includes(AchievementId.ACHIEVE_UPGRADED_HOUSE_LV2)) {
            achResult = unlockAchievementInternal(AchievementId.ACHIEVE_UPGRADED_HOUSE_LV2, updatedData);
        } else if (nextLevel === 3 && !updatedData.unlockedAchievementIds.includes(AchievementId.ACHIEVE_UPGRADED_HOUSE_LV3)) {
            achResult = unlockAchievementInternal(AchievementId.ACHIEVE_UPGRADED_HOUSE_LV3, updatedData);
        }
        if(achResult) {
            updatedData = achResult.updatedPlayerData;
            if(achResult.notification) notificationsToQueueHere.push(achResult.notification);
        }
        
        const missionRes = _getUpdatedMissionsAndNotifications(updatedData.activeMissions, updatedData, MissionType.EARN_GCOINS_TOTAL, 0, {gcoinsEarnedInThisEvent: -cost});
        updatedData.activeMissions = missionRes.updatedMissions;
        notificationsToQueueHere.push(...missionRes.notificationsToQueue);

        outcome = { success: true, messageKey: 'houseUpgradeSuccess', newLevel: nextLevel };
        notificationsToQueueHere.forEach(addNotification);
        return updatedData;
    });
    return outcome;
  }, [unlockAchievementInternal, _getUpdatedMissionsAndNotifications, addNotification]);

  const activatePracticeNook = useCallback((): PracticeNookResult => {
    let result: PracticeNookResult = { success: false };
    setPlayerDataState(prevData => {
        const now = Date.now();
        const cooldownMillis = PRACTICE_NOOK_COOLDOWN_HOURS * 60 * 60 * 1000;
        if (prevData.lastPracticeNookTimestamp && (now - prevData.lastPracticeNookTimestamp) < cooldownMillis) {
            result = { success: false, cooldownRemaining: cooldownMillis - (now - prevData.lastPracticeNookTimestamp) };
            return prevData;
        }
        
        let updatedData = deepClone(prevData);
        let notificationsToQueueHere: Omit<NotificationMessage, 'id'>[] = [];
        
        updatedData.xp += PRACTICE_NOOK_PLAYER_XP_REWARD;
        const levelRes = checkAndApplyLevelUp(updatedData.xp, updatedData.level);
        updatedData.level = levelRes.newLevel;
        if(levelRes.notification) notificationsToQueueHere.push(levelRes.notification);

        let petXpGained: number | undefined = undefined;
        let petHappinessGained: number | undefined = undefined;

        if (updatedData.activePetId && updatedData.pets[updatedData.activePetId]) {
            // This part needs to be delegated to petSystem or petSystem needs to return updated pet data.
            // For now, we'll simulate it, but this is a point for further refactor.
            let activePetInstance = updatedData.pets[updatedData.activePetId]; // This is a copy
            const petXpPlayerBoost = getCurrentPetAbilityMultiplier(updatedData.activePetId, updatedData.pets, PetAbilityType.PET_XP_BOOST);
            petXpGained = Math.round(PRACTICE_NOOK_PET_XP_REWARD * petXpPlayerBoost);
            activePetInstance.xp += petXpGained;
            activePetInstance.happiness = Math.min(MAX_PET_HAPPINESS, activePetInstance.happiness + PRACTICE_NOOK_PET_HAPPINESS_REWARD);
            petHappinessGained = PRACTICE_NOOK_PET_HAPPINESS_REWARD;
            activePetInstance.lastInteractionTimestamp = now;
            // How to update petSystem's internal state for this pet?
            // This indicates a need for petSystem to expose a function like `addPetXpAndHappiness`.
            // For this step, we'll update the local copy in playerData, which will sync back to petSystem's initial state on next load if not handled better.
            updatedData.pets[updatedData.activePetId] = activePetInstance;

            // Re-trigger level up check if petSystem doesn't do it internally for this case
            const petLevelUpResult = petSystem.handlePetXPForCorrectAnswer(updatedData.activePetId, updatedData.pets); // Re-use existing logic for simplicity here
            if(petLevelUpResult.updatedPets) updatedData.pets = petLevelUpResult.updatedPets;
            notificationsToQueueHere.push(...petLevelUpResult.notifications);
        }
        
        updatedData.lastPracticeNookTimestamp = now;
        result = { success: true, rewards: { playerXp: PRACTICE_NOOK_PLAYER_XP_REWARD, petXp: petXpGained, petHappiness: petHappinessGained } };
        
        const nookMissionRes = _getUpdatedMissionsAndNotifications(updatedData.activeMissions, updatedData, MissionType.USE_PRACTICE_NOOK_COUNT, 1);
        updatedData.activeMissions = nookMissionRes.updatedMissions; notificationsToQueueHere.push(...nookMissionRes.notificationsToQueue);
        
        notificationsToQueueHere.forEach(addNotification);
        return updatedData;
    });
    return result;
  }, [checkAndApplyLevelUp, _getUpdatedMissionsAndNotifications, addNotification, petSystem]);

  const recordMonsterDefeat = useCallback((monsterId: MonsterId) => {
    setPlayerDataState(prevData => {
        if (prevData.defeatedMonsterIds.includes(monsterId)) return prevData; 

        let updatedData = deepClone(prevData);
        let notificationsToQueueHere: Omit<NotificationMessage, 'id'>[] = [];
        updatedData.defeatedMonsterIds = [...prevData.defeatedMonsterIds, monsterId];

        const monsterDef = getMonsterDefinition(monsterId);
        if (monsterDef) {
            if (monsterDef.rewardGcoins) updatedData.gCoins += monsterDef.rewardGcoins;
            if (monsterDef.rewardPlayerXp) {
                updatedData.xp += monsterDef.rewardPlayerXp;
                const levelRes = checkAndApplyLevelUp(updatedData.xp, updatedData.level);
                updatedData.level = levelRes.newLevel;
                if (levelRes.notification) notificationsToQueueHere.push(levelRes.notification);
            }
            if (!updatedData.collectedMementos.includes(monsterDef.rewardMementoId)) {
                updatedData.collectedMementos = [...updatedData.collectedMementos, monsterDef.rewardMementoId];
            }
             notificationsToQueueHere.push({
                type: 'monsterDefeated',
                titleKey: 'monsterBattleVictoryMessage', 
                monsterName: UI_TEXT_TH[monsterDef.nameKey],
                mementoName: UI_TEXT_TH[ALL_MEMENTOS.find(m => m.id === monsterDef.rewardMementoId)?.nameKey || 'memento' as keyof ThaiUIText],
                amount: monsterDef.rewardGcoins || 0
            });
        }
        
        let achResult;
        if (!updatedData.unlockedAchievementIds.includes(AchievementId.DEFEAT_FIRST_MONSTER)) {
            achResult = unlockAchievementInternal(AchievementId.DEFEAT_FIRST_MONSTER, updatedData);
            updatedData = achResult.updatedPlayerData; if(achResult.notification) notificationsToQueueHere.push(achResult.notification);
        }
        const specificMonsterAchId = `DEFEAT_${monsterId}` as AchievementId;
        if (Object.values(AchievementId).includes(specificMonsterAchId) && !updatedData.unlockedAchievementIds.includes(specificMonsterAchId)) {
            achResult = unlockAchievementInternal(specificMonsterAchId, updatedData);
            updatedData = achResult.updatedPlayerData; if(achResult.notification) notificationsToQueueHere.push(achResult.notification);
        }
        if (updatedData.collectedMementos.length === ALL_MEMENTOS.length && !updatedData.unlockedAchievementIds.includes(AchievementId.COLLECT_ALL_MEMENTOS)) {
             achResult = unlockAchievementInternal(AchievementId.COLLECT_ALL_MEMENTOS, updatedData);
             updatedData = achResult.updatedPlayerData; if(achResult.notification) notificationsToQueueHere.push(achResult.notification);
        }
        
        const defeatMissionRes = _getUpdatedMissionsAndNotifications(updatedData.activeMissions, updatedData, MissionType.DEFEAT_MONSTER_COUNT, 1, {monsterId});
        updatedData.activeMissions = defeatMissionRes.updatedMissions; notificationsToQueueHere.push(...defeatMissionRes.notificationsToQueue);

        if (monsterDef?.rewardGcoins && monsterDef.rewardGcoins > 0) {
           const earnCoinsTotalRes = _getUpdatedMissionsAndNotifications(updatedData.activeMissions, updatedData, MissionType.EARN_GCOINS_TOTAL, 0, {gcoinsEarnedInThisEvent: monsterDef.rewardGcoins});
           updatedData.activeMissions = earnCoinsTotalRes.updatedMissions; notificationsToQueueHere.push(...earnCoinsTotalRes.notificationsToQueue);
        }
        notificationsToQueueHere.forEach(addNotification);
        return updatedData;
    });
  }, [checkAndApplyLevelUp, unlockAchievementInternal, UI_TEXT_TH, _getUpdatedMissionsAndNotifications, addNotification]);
  
  const toggleHighlightPianoOnPlay = useCallback(() => {
    setPlayerDataState(prev => ({...prev, highlightPianoOnPlay: !prev.highlightPianoOnPlay}));
  }, []);
  
  const setAvatarStyle = useCallback((style: AvatarStyle) => {
    setPlayerDataState(prev => ({...prev, avatarStyle: style}));
  }, []);

  const _getQuestStatusWithSpecificData = useCallback((questId: QuestId, currentPlayerData: PlayerData): QuestStatus => {
    const definition = getQuestDefinition(questId);
    if (!definition) return 'unavailable';

    const activeQuest = currentPlayerData.activeQuests.find(aq => aq.questId === questId);
    if (activeQuest) return activeQuest.status;

    if (definition.minPlayerLevel && currentPlayerData.level < definition.minPlayerLevel) return 'unavailable';
    if (definition.prerequisiteQuestId) {
        const prereqActiveQuest = currentPlayerData.activeQuests.find(aq => aq.questId === definition.prerequisiteQuestId);
        if (!prereqActiveQuest || prereqActiveQuest.status !== 'claimed') return 'unavailable';
    }
    return 'available';
  }, []);

  const startQuest = useCallback((questId: QuestId): boolean => {
    let success = false;
    setPlayerDataState(prevData => {
        const definition = getQuestDefinition(questId);
        if (!definition) return prevData;
        if (_getQuestStatusWithSpecificData(questId, prevData) !== 'available') return prevData;

        const newActiveQuest: ActiveQuest = {
            questId,
            status: 'active',
            currentObjectiveIndex: 0,
            objectiveProgress: definition.objectives.map(() => ({ completed: false, currentProgress: 0 })),
        };
        let updatedData = { ...prevData, activeQuests: [...prevData.activeQuests, newActiveQuest] };
        let notificationsToQueueHere: Omit<NotificationMessage, 'id'>[] = [];
        notificationsToQueueHere.push({type: 'quest', titleKey: 'questStartedNotificationTitle', questName: getQuestTitle(questId, UI_TEXT_TH)});
        
        if (!updatedData.unlockedAchievementIds.includes(AchievementId.QUEST_ACCEPTED_FIRST)) {
            const achRes = unlockAchievementInternal(AchievementId.QUEST_ACCEPTED_FIRST, updatedData);
            updatedData = achRes.updatedPlayerData;
            if(achRes.notification) notificationsToQueueHere.push(achRes.notification);
        }
        success = true;
        notificationsToQueueHere.forEach(addNotification);
        return updatedData;
    });
    return success;
  }, [_getQuestStatusWithSpecificData, UI_TEXT_TH, unlockAchievementInternal, addNotification]);

  const progressQuest = useCallback((questId: QuestId, objectiveIndexToComplete?: number): boolean => {
    let success = false;
    setPlayerDataState(prevData => {
        const questIndex = prevData.activeQuests.findIndex(q => q.questId === questId);
        if (questIndex === -1) return prevData;

        let updatedData = deepClone(prevData);
        let activeQuest = updatedData.activeQuests[questIndex];
        const definition = getQuestDefinition(questId);
        if (!definition || activeQuest.status !== 'active') return prevData;
        
        let notificationsToQueueHere: Omit<NotificationMessage, 'id'>[] = [];
        const objectiveIdx = objectiveIndexToComplete !== undefined ? objectiveIndexToComplete : activeQuest.currentObjectiveIndex;
        
        if (objectiveIdx < definition.objectives.length && !activeQuest.objectiveProgress[objectiveIdx].completed) {
            const objectiveDef = definition.objectives[objectiveIdx];
            activeQuest.objectiveProgress[objectiveIdx].completed = true;
            activeQuest.objectiveProgress[objectiveIdx].currentProgress = objectiveDef.targetCount || 1;
            success = true;
             notificationsToQueueHere.push({ type: 'quest', titleKey: 'questObjectiveCompletedNotificationTitle', questName: getQuestTitle(questId, UI_TEXT_TH), itemName: UI_TEXT_TH[objectiveDef.descriptionKey] });

            const allObjectivesCompleted = activeQuest.objectiveProgress.every(op => op.completed);
            if (allObjectivesCompleted) {
                activeQuest.status = 'completed'; 
                 notificationsToQueueHere.push({ type: 'quest', titleKey: 'questCompletedNotificationTitle', questName: getQuestTitle(questId, UI_TEXT_TH) });
            } else {
                if (activeQuest.currentObjectiveIndex === objectiveIdx && objectiveIdx < definition.objectives.length - 1) {
                     activeQuest.currentObjectiveIndex++;
                }
            }
        }
        notificationsToQueueHere.forEach(addNotification);
        return updatedData;
    });
    return success;
  }, [UI_TEXT_TH, addNotification]);

  const completeQuest = useCallback((questId: QuestId): boolean => { 
    let success = false;
    setPlayerDataState(prevData => {
        const questIndex = prevData.activeQuests.findIndex(q => q.questId === questId);
        if (questIndex === -1) return prevData;
        
        let updatedData = deepClone(prevData);
        let activeQuest = updatedData.activeQuests[questIndex];
        const definition = getQuestDefinition(questId);

        if (!definition || activeQuest.status !== 'completed') return prevData;

        let notificationsToQueueHere: Omit<NotificationMessage, 'id'>[] = [];
        
        definition.rewards.forEach(reward => {
            if (reward.type === 'gcoins' && reward.amount) updatedData.gCoins += reward.amount;
            if (reward.type === 'xp' && reward.amount) {
                 updatedData.xp += reward.amount;
                 const levelRes = checkAndApplyLevelUp(updatedData.xp, updatedData.level);
                 updatedData.level = levelRes.newLevel;
                 if(levelRes.notification) notificationsToQueueHere.push(levelRes.notification);
            }
            if (reward.type === 'pet_xp' && reward.amount && updatedData.activePetId && updatedData.pets[updatedData.activePetId]) {
                // Delegate to petSystem for pet XP
                const petXpResult = petSystem.handlePetXPForCorrectAnswer(updatedData.activePetId, updatedData.pets); // Re-use for simplicity
                if(petXpResult.updatedPets) updatedData.pets = petXpResult.updatedPets;
                notificationsToQueueHere.push(...petXpResult.notifications);
            }
             if (reward.type === 'item' && reward.itemId) {
                const existingItemIndex = updatedData.inventory.findIndex(invItem => invItem.itemId === reward.itemId && invItem.type === UnlockedItemType.QUEST_ITEM);
                if (existingItemIndex > -1) {
                    updatedData.inventory[existingItemIndex].quantity += (reward.amount || 1);
                } else {
                    updatedData.inventory.push({ itemId: reward.itemId, quantity: (reward.amount || 1), type: UnlockedItemType.QUEST_ITEM });
                }
            }
        });

        activeQuest.status = 'claimed';
        success = true;
        notificationsToQueueHere.push({type: 'quest', titleKey: 'questRewardClaimedNotificationTitle', questName: getQuestTitle(questId, UI_TEXT_TH)});

        if (!updatedData.unlockedAchievementIds.includes(AchievementId.QUEST_COMPLETED_FIRST)) {
            const achRes = unlockAchievementInternal(AchievementId.QUEST_COMPLETED_FIRST, updatedData);
            updatedData = achRes.updatedPlayerData;
            if(achRes.notification) notificationsToQueueHere.push(achRes.notification);
        }
        notificationsToQueueHere.forEach(addNotification);
        return updatedData;
    });
    return success;
  }, [checkAndApplyLevelUp, UI_TEXT_TH, unlockAchievementInternal, addNotification, petSystem]);

  const getQuestStatus = useCallback((questId: QuestId): QuestStatus => {
    return _getQuestStatusWithSpecificData(questId, playerData);
  }, [playerData, _getQuestStatusWithSpecificData]);

  const isSameDay = (timestamp1: number, timestamp2: number): boolean => {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const getStartOfWeek = (timestamp: number): number => {
    const date = new Date(timestamp);
    const day = date.getDay(); 
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(date.setDate(diff)).setHours(0, 0, 0, 0);
  };

  const isSameWeek = (timestamp1: number, timestamp2: number): boolean => {
    return getStartOfWeek(timestamp1) === getStartOfWeek(timestamp2);
  };

  const refreshMissions = useCallback(() => {
    setPlayerDataState(prevData => {
        let updatedData = deepClone(prevData);
        const now = Date.now();
        let missionsRefreshed = false;

        if (!prevData.lastDailyMissionRefresh || !isSameDay(prevData.lastDailyMissionRefresh, now)) {
            updatedData.activeMissions = updatedData.activeMissions.filter(am => {
                const def = getMissionDefinition(am.definitionId);
                return !def || def.frequency !== 'daily' || (am.completed && am.claimed); 
            });
            
            const availableDailyDefs = shuffleArray(MISSION_DEFINITIONS.filter(def => def.frequency === 'daily' && !updatedData.activeMissions.some(am => am.definitionId === def.id)));
            const newDailyMissions = availableDailyDefs.slice(0, DAILY_MISSIONS_TO_PICK).map(def => ({
                definitionId: def.id, progress: 0, completed: false, claimed: false,
                ...(def.type === MissionType.EARN_GCOINS_TOTAL && { lastGcoinCheckValue: prevData.gCoins })
            }));
            updatedData.activeMissions.push(...newDailyMissions);
            updatedData.lastDailyMissionRefresh = now;
            missionsRefreshed = true;
        }

        if (!prevData.lastWeeklyMissionRefresh || !isSameWeek(prevData.lastWeeklyMissionRefresh, now)) {
            updatedData.activeMissions = updatedData.activeMissions.filter(am => {
                const def = getMissionDefinition(am.definitionId);
                return !def || def.frequency !== 'weekly' || (am.completed && am.claimed);
            });
            updatedData.completedDailyMissionCountForWeekly = 0;

            const availableWeeklyDefs = shuffleArray(MISSION_DEFINITIONS.filter(def => def.frequency === 'weekly' && !updatedData.activeMissions.some(am => am.definitionId === def.id)));
            const newWeeklyMissions = availableWeeklyDefs.slice(0, WEEKLY_MISSIONS_TO_PICK).map(def => ({
                definitionId: def.id, progress: 0, completed: false, claimed: false,
                ...(def.type === MissionType.EARN_GCOINS_TOTAL && { lastGcoinCheckValue: prevData.gCoins })
            }));
            updatedData.activeMissions.push(...newWeeklyMissions);
            updatedData.lastWeeklyMissionRefresh = now;
            missionsRefreshed = true;
        }
        
        return missionsRefreshed ? updatedData : prevData;
    });
  }, []);

  const claimMissionReward = useCallback((missionId: MissionId): boolean => {
    let success = false;
    setPlayerDataState(prevData => {
        const missionIndex = prevData.activeMissions.findIndex(am => am.definitionId === missionId);
        if (missionIndex === -1) return prevData;

        let updatedData = deepClone(prevData);
        let activeMission = updatedData.activeMissions[missionIndex];
        const definition = getMissionDefinition(activeMission.definitionId);

        if (!definition || !activeMission.completed || activeMission.claimed) return prevData;

        let notificationsToQueueHere: Omit<NotificationMessage, 'id'>[] = [];
        activeMission.claimed = true;
        success = true;

        let totalGcoinsFromMission = 0;

        definition.rewards.forEach(reward => {
            if (reward.type === MissionRewardType.GCOINS) {
                updatedData.gCoins += reward.amount;
                totalGcoinsFromMission += reward.amount;
            } else if (reward.type === MissionRewardType.PLAYER_XP) {
                updatedData.xp += reward.amount;
                const levelRes = checkAndApplyLevelUp(updatedData.xp, updatedData.level);
                updatedData.level = levelRes.newLevel;
                if (levelRes.notification) notificationsToQueueHere.push(levelRes.notification);
            } else if (reward.type === MissionRewardType.PET_XP && updatedData.activePetId && updatedData.pets[updatedData.activePetId]) {
                const petXpResult = petSystem.handlePetXPForCorrectAnswer(updatedData.activePetId, updatedData.pets); // Re-use for simplicity
                if(petXpResult.updatedPets) updatedData.pets = petXpResult.updatedPets;
                notificationsToQueueHere.push(...petXpResult.notifications);
            }
        });
        
        notificationsToQueueHere.push({ type: 'missionRewardClaimed', titleKey: 'missionRewardClaimedNotificationTitle', missionName: UI_TEXT_TH[definition.descriptionKey]});

        if (totalGcoinsFromMission > 0) {
            const earnCoinsTotalRes = _getUpdatedMissionsAndNotifications(updatedData.activeMissions, updatedData, MissionType.EARN_GCOINS_TOTAL, 0, {gcoinsEarnedInThisEvent: totalGcoinsFromMission});
            updatedData.activeMissions = earnCoinsTotalRes.updatedMissions; notificationsToQueueHere.push(...earnCoinsTotalRes.notificationsToQueue);
        }

        if (definition.frequency === 'daily') {
            updatedData.completedDailyMissionCountForWeekly = (updatedData.completedDailyMissionCountForWeekly || 0) + 1;
            const dailyCompletionMissionRes = _getUpdatedMissionsAndNotifications(updatedData.activeMissions, updatedData, MissionType.COMPLETE_DAILY_MISSION_COUNT, updatedData.completedDailyMissionCountForWeekly);
            updatedData.activeMissions = dailyCompletionMissionRes.updatedMissions; notificationsToQueueHere.push(...dailyCompletionMissionRes.notificationsToQueue);
            
            if (!updatedData.unlockedAchievementIds.includes(AchievementId.COMPLETE_FIRST_MISSION)) {
                 const achRes = unlockAchievementInternal(AchievementId.COMPLETE_FIRST_MISSION, updatedData);
                 updatedData = achRes.updatedPlayerData; if(achRes.notification) notificationsToQueueHere.push(achRes.notification);
            }
            if (updatedData.completedDailyMissionCountForWeekly >= 5 && !updatedData.unlockedAchievementIds.includes(AchievementId.COMPLETE_5_DAILY_MISSIONS)) {
                 const achRes = unlockAchievementInternal(AchievementId.COMPLETE_5_DAILY_MISSIONS, updatedData);
                 updatedData = achRes.updatedPlayerData; if(achRes.notification) notificationsToQueueHere.push(achRes.notification);
            }
        } else if (definition.frequency === 'weekly') {
             if (!updatedData.unlockedAchievementIds.includes(AchievementId.COMPLETE_FIRST_WEEKLY_MISSION)) {
                 const achRes = unlockAchievementInternal(AchievementId.COMPLETE_FIRST_WEEKLY_MISSION, updatedData);
                 updatedData = achRes.updatedPlayerData; if(achRes.notification) notificationsToQueueHere.push(achRes.notification);
            }
        }
        
        notificationsToQueueHere.forEach(addNotification);
        return updatedData;
    });
    return success;
  }, [checkAndApplyLevelUp, UI_TEXT_TH, _getUpdatedMissionsAndNotifications, unlockAchievementInternal, addNotification, petSystem]);


  return {
    playerData,
    addXpAndCoins,
    getAchievementDetails,
    notifications,
    dismissNotification,
    updateHighestStreak,
    achievements,
    unlockMusicalItem,
    isMusicalItemUnlocked: useCallback((itemId: string, itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD) => {
        return playerData.unlockedMusicalItemIds.some(item => item.id === itemId && item.type === itemType);
    }, [playerData.unlockedMusicalItemIds]),
    checkForDailyLoginReward,
    addNotification,
    purchaseShopItem,
    isShopItemPurchased: useCallback((itemId: string, itemType: UnlockedItemType) => {
        return playerData.purchasedShopItemIds.some(item => item.id === itemId && item.type === itemType);
    }, [playerData.purchasedShopItemIds]),
    selectInstrumentSound,
    
    // Pet System functions
    adoptPet: petSystem.adoptPet,
    feedPet: petSystem.feedPet,
    playWithPet: petSystem.playWithPet,
    setActivePet: petSystem.setActivePet,
    applyPetCustomization: petSystem.applyPetCustomization,
    getActivePetAbilityMultiplier: (currentPlayerData, abilityType) => getCurrentPetAbilityMultiplier(currentPlayerData.activePetId, currentPlayerData.pets, abilityType),
    updatePetStateOnLoad: petSystem.updatePetStatePeriodic, // Renamed for clarity and intent

    setPlayerName,
    saveGameExplicitly,
    resetGame,
    upgradeHouse,
    activatePracticeNook,
    refreshMissions,
    claimMissionReward,
    recordMonsterDefeat,
    updateMissionProgress: updateMissionProgressInternal, // Expose the internal version
    toggleHighlightPianoOnPlay,
    setAvatarStyle,
    startQuest,
    progressQuest,
    completeQuest,
    getQuestStatus,
  };
};

