

import { useState, useEffect, useCallback } from 'react';
import { PlayerData, Achievement, AchievementId, NotificationMessage, GameMode, ThaiUIText, UnlockedItemType, IntervalInfo, ChordInfo, InstrumentSoundId, ShopItem, PetId, ActivePet, PetDefinition, PetAbilityType, PetCustomization, PetSpecialRequest, FurnitureId, MissionDefinition, MissionId, ActiveMission, MissionType, MissionRewardType, MonsterId, MementoId, MonsterDefinition, AppView } from '../types'; 
import {
    INITIAL_PLAYER_DATA, INITIAL_ACHIEVEMENTS, LEVEL_THRESHOLDS, UI_TEXT_TH, DAILY_LOGIN_REWARD,
    ALL_INTERVALS, ALL_CHORDS, SHOP_ITEMS, ALL_INSTRUMENT_SOUNDS, PET_DEFINITIONS, PET_CUSTOMIZATION_ITEMS,
    MAX_PET_HUNGER, PET_HUNGER_DECAY_PER_HOUR, PET_FOOD_HUNGER_VALUE, PET_FOOD_ID, getPetName,
    PET_XP_PER_CORRECT_ANSWER, PET_XP_PER_FEEDING, PET_XP_PER_DAILY_LOGIN, PET_LEVEL_THRESHOLDS,
    MAX_PET_HAPPINESS, HAPPINESS_PER_FEEDING, HAPPINESS_PER_PLAY, HAPPINESS_DECAY_ON_HUNGER_DROP,
    PET_PLAY_COOLDOWN_HOURS, PET_INTERACTION_ACHIEVEMENT_MILESTONE, MAX_PET_LEVEL,
    PET_BOREDOM_THRESHOLD_HOURS, HAPPINESS_DECAY_ON_BOREDOM,
    PET_SPECIAL_REQUEST_CHANCE, PET_SPECIAL_REQUEST_REWARD_XP, PET_SPECIAL_REQUEST_REWARD_HAPPINESS,
    HOUSE_UPGRADE_COSTS, MAX_HOUSE_LEVEL, HOUSE_BENEFITS_PER_LEVEL, ALL_FURNITURE_ITEMS,
    PRACTICE_NOOK_COOLDOWN_HOURS, PRACTICE_NOOK_PLAYER_XP_REWARD, PRACTICE_NOOK_PET_XP_REWARD, PRACTICE_NOOK_PET_HAPPINESS_REWARD,
    MISSION_DEFINITIONS, DAILY_MISSIONS_TO_PICK, WEEKLY_MISSIONS_TO_PICK, shuffleArray, getMissionDefinition,
    ALL_MONSTERS, getMonsterDefinition, ALL_MEMENTOS 
} from '../constants';

const PLAYER_DATA_KEY = 'playerEarTrainingDataV13'; // Incremented version for new mission structure

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

const OLD_PET_IDS = {
  HOODEE: 'HOODEE',
  RHYTHMO: 'RHYTHMO',
  MELODIA: 'MELODIA',
};

const PET_ID_MAP: Record<string, PetId> = {
  [OLD_PET_IDS.HOODEE]: PetId.KAKI,
  [OLD_PET_IDS.RHYTHMO]: PetId.PLANIN,
  [OLD_PET_IDS.MELODIA]: PetId.MOOTOD,
};

export interface PracticeNookResult {
  success: boolean;
  cooldownRemaining?: number; 
  rewards?: {
    playerXp: number;
    petXp?: number;
    petHappiness?: number;
  };
}


export const usePlayerData = () => {
  const [playerData, setPlayerData] = useState<PlayerData>(() => {
    const savedData = localStorage.getItem(PLAYER_DATA_KEY);
    let dataToLoad = deepClone(INITIAL_PLAYER_DATA);

    if (savedData) {
      try {
        let parsedData = JSON.parse(savedData);

        const migratePetId = (oldId: string | null): PetId | null => {
          if (oldId && PET_ID_MAP[oldId]) {
            return PET_ID_MAP[oldId];
          }
          return oldId as PetId | null;
        };

        parsedData.activePetId = migratePetId(parsedData.activePetId);
        if (Array.isArray(parsedData.ownedPetIds)) {
          parsedData.ownedPetIds = parsedData.ownedPetIds.map(migratePetId).filter(id => id !== null) as PetId[];
        } else {
          parsedData.ownedPetIds = [];
        }

        if (parsedData.pets && typeof parsedData.pets === 'object') {
          const newPetsObject: { [petId: string]: ActivePet } = {};
          Object.keys(parsedData.pets).forEach(oldPetKey => {
            const newPetId = migratePetId(oldPetKey);
            if (newPetId) {
              const petData = parsedData.pets[oldPetKey];
              petData.id = newPetId;
              const petDef = PET_DEFINITIONS.find(def => def.id === newPetId);
              if (petDef) {
                petData.name = UI_TEXT_TH[petDef.nameKey] || newPetId;
              }
              newPetsObject[newPetId] = petData;
            }
          });
          parsedData.pets = newPetsObject;
        } else {
          parsedData.pets = {};
        }

        dataToLoad = {
            ...deepClone(INITIAL_PLAYER_DATA),
            ...parsedData,
            unlockedAchievementIds: Array.isArray(parsedData.unlockedAchievementIds) ? parsedData.unlockedAchievementIds : [],
            intervalCorrectCounts: parsedData.intervalCorrectCounts || {},
            chordCorrectCounts: parsedData.chordCorrectCounts || {},
            unlockedMusicalItemIds: Array.isArray(parsedData.unlockedMusicalItemIds) ? parsedData.unlockedMusicalItemIds : [],
            purchasedShopItemIds: Array.isArray(parsedData.purchasedShopItemIds) ? parsedData.purchasedShopItemIds : [],
            pets: parsedData.pets || {},
            ownedPetIds: Array.isArray(parsedData.ownedPetIds) ? parsedData.ownedPetIds : [],
            houseLevel: typeof parsedData.houseLevel === 'number' ? parsedData.houseLevel : 0,
            ownedFurnitureIds: Array.isArray(parsedData.ownedFurnitureIds) ? parsedData.ownedFurnitureIds : [],
            lastPracticeNookTimestamp: typeof parsedData.lastPracticeNookTimestamp === 'number' ? parsedData.lastPracticeNookTimestamp : null,
            activeMissions: Array.isArray(parsedData.activeMissions) ? parsedData.activeMissions : [],
            lastDailyMissionRefresh: typeof parsedData.lastDailyMissionRefresh === 'number' ? parsedData.lastDailyMissionRefresh : null,
            lastWeeklyMissionRefresh: typeof parsedData.lastWeeklyMissionRefresh === 'number' ? parsedData.lastWeeklyMissionRefresh : null,
            completedDailyMissionCountForWeekly: typeof parsedData.completedDailyMissionCountForWeekly === 'number' ? parsedData.completedDailyMissionCountForWeekly : 0,
            defeatedMonsterIds: Array.isArray(parsedData.defeatedMonsterIds) ? parsedData.defeatedMonsterIds : [], 
            collectedMementos: Array.isArray(parsedData.collectedMementos) ? parsedData.collectedMementos : [], 
        };
        dataToLoad.playerName = typeof dataToLoad.playerName === 'string' ? dataToLoad.playerName : "";

      } catch (error) {
        console.error("Failed to parse player data from localStorage, resetting to initial data:", error);
      }
    }

    Object.keys(dataToLoad.pets).forEach(petIdStr => {
        const petId = petIdStr as PetId;
        if (dataToLoad.pets[petId]) {
          const defaultPetValues: Partial<ActivePet> = {
              xp: 0, level: 1, happiness: MAX_PET_HAPPINESS / 2,
              lastPlayedTimestamp: 0, lastLoginTimestampForHunger: Date.now(),
              hunger: MAX_PET_HUNGER, lastFedTimestamp: Date.now(),
              lastInteractionTimestamp: Date.now(), customization: {}, specialRequest: null,
          };
          dataToLoad.pets[petId].xp = dataToLoad.pets[petId].xp ?? defaultPetValues.xp;
          dataToLoad.pets[petId].level = dataToLoad.pets[petId].level ?? defaultPetValues.level;
          dataToLoad.pets[petId].happiness = (dataToLoad.pets[petId].happiness === undefined || dataToLoad.pets[petId].happiness === 0) ? defaultPetValues.happiness : dataToLoad.pets[petId].happiness;
          dataToLoad.pets[petId].lastPlayedTimestamp = dataToLoad.pets[petId].lastPlayedTimestamp ?? defaultPetValues.lastPlayedTimestamp;
          dataToLoad.pets[petId].lastLoginTimestampForHunger = dataToLoad.pets[petId].lastLoginTimestampForHunger ?? defaultPetValues.lastLoginTimestampForHunger;
          dataToLoad.pets[petId].hunger = dataToLoad.pets[petId].hunger ?? defaultPetValues.hunger;
          dataToLoad.pets[petId].lastFedTimestamp = dataToLoad.pets[petId].lastFedTimestamp ?? defaultPetValues.lastFedTimestamp;
          dataToLoad.pets[petId].lastInteractionTimestamp = dataToLoad.pets[petId].lastInteractionTimestamp ?? defaultPetValues.lastInteractionTimestamp;
          dataToLoad.pets[petId].customization = dataToLoad.pets[petId].customization || defaultPetValues.customization;
          dataToLoad.pets[petId].specialRequest = dataToLoad.pets[petId].specialRequest || defaultPetValues.specialRequest;
        }
      });

    return dataToLoad;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
     const currentUnlockedIds = playerData.unlockedAchievementIds || [];
     return INITIAL_ACHIEVEMENTS.map(ach => ({
        ...ach,
        unlocked: currentUnlockedIds.includes(ach.id),
    }));
  });

  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<NotificationMessage, 'id'>) => {
    const newNotification = { ...notification, id: Date.now().toString() + Math.random().toString() };
    setNotifications(prev => [newNotification, ...prev.slice(0,2)]);
    setTimeout(() => {
      dismissNotification(newNotification.id);
    }, 5000);
  }, [dismissNotification]);

  const saveData = useCallback((data: PlayerData) => {
    try {
        localStorage.setItem(PLAYER_DATA_KEY, JSON.stringify(data));
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

  const unlockAchievementInternal = useCallback((achievementId: AchievementId, currentPlayerData: PlayerData): PlayerData => {
    if (!currentPlayerData.unlockedAchievementIds.includes(achievementId)) {
      const newUnlockedIds = [...currentPlayerData.unlockedAchievementIds, achievementId];
      const achievement = INITIAL_ACHIEVEMENTS.find(ach => ach.id === achievementId);
      if (achievement) {
        addNotification({
            type: 'achievement',
            titleKey: 'achievementUnlocked',
            itemName: UI_TEXT_TH[achievement.nameKey]
        });
      }
      return { ...currentPlayerData, unlockedAchievementIds: newUnlockedIds };
    }
    return currentPlayerData;
  }, [addNotification]);

  const unlockAchievement = useCallback((achievementId: AchievementId) => {
    setPlayerData(prevData => unlockAchievementInternal(achievementId, prevData));
  }, [unlockAchievementInternal]);


  const checkAndApplyLevelUp = useCallback((currentXp: number, currentLevel: number): { newLevel: number, leveledUp: boolean } => {
    let newLevel = currentLevel;
    let leveledUp = false;
    while (newLevel < LEVEL_THRESHOLDS.length && currentXp >= LEVEL_THRESHOLDS[newLevel]) {
      newLevel++;
      leveledUp = true;
    }
    if (leveledUp) {
      addNotification({ type: 'levelUp', titleKey: 'levelUp', itemName: `${UI_TEXT_TH.playerLevel} ${newLevel}` });
    }
    return { newLevel, leveledUp };
  }, [addNotification]);

  const checkAndApplyPetLevelUp = useCallback((pet: ActivePet, currentPlayerData: PlayerData): { updatedPet: ActivePet, updatedPlayerData: PlayerData, leveledUp: boolean } => {
    let updatedPet = { ...pet };
    let updatedPlayerData = { ...currentPlayerData };
    let leveledUp = false;

    while (updatedPet.level < MAX_PET_LEVEL && updatedPet.level < PET_LEVEL_THRESHOLDS.length && updatedPet.xp >= PET_LEVEL_THRESHOLDS[updatedPet.level]) {
      updatedPet.level++;
      leveledUp = true;
    }
    if (leveledUp) {
      addNotification({
        type: 'petLevelUp',
        titleKey: 'petLevelUpNotificationTitle',
        messageKey: 'petLevelUpNotificationMessage',
        petName: updatedPet.name,
        amount: updatedPet.level
      });
      if (updatedPet.level >= 5 && !updatedPlayerData.unlockedAchievementIds.includes(AchievementId.PET_REACH_LEVEL_5)) {
        updatedPlayerData = unlockAchievementInternal(AchievementId.PET_REACH_LEVEL_5, updatedPlayerData);
      }
      if (updatedPet.level >= MAX_PET_LEVEL && !updatedPlayerData.unlockedAchievementIds.includes(AchievementId.PET_MAX_LEVEL_FIRST)) {
        updatedPlayerData = unlockAchievementInternal(AchievementId.PET_MAX_LEVEL_FIRST, updatedPlayerData);
      }
    }
    return { updatedPet, updatedPlayerData, leveledUp };
  }, [addNotification, unlockAchievementInternal]);

  const getActivePetAbilityMultiplier = useCallback((playerDataState: PlayerData, abilityType: PetAbilityType): number => {
    if (playerDataState.activePetId && playerDataState.pets[playerDataState.activePetId]) {
      const activePetInstance = playerDataState.pets[playerDataState.activePetId];
      const petDef = PET_DEFINITIONS.find(def => def.id === activePetInstance.id);
      if (petDef?.ability?.type === abilityType) {
        if (!petDef.ability.condition || petDef.ability.condition(activePetInstance)) {
          return petDef.ability.value;
        }
      }
    }
    return abilityType === PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES ? 0 : 1;
  }, []);

  const updateMissionProgress = useCallback((missionType: MissionType, valueIncrement: number = 1, targetDetails?: { itemId?: string, gameMode?: GameMode, gcoinsEarned?: number, view?: AppView, petId?: PetId, stat?: 'HAPPINESS' | 'LEVEL', statValue?: number, monsterId?: MonsterId, mementoId?: MementoId, notesPlayed?: number }) => {
    setPlayerData(prevData => {
        let updatedData = { ...prevData, activeMissions: deepClone(prevData.activeMissions) };

        updatedData.activeMissions.forEach(activeMission => {
            if (activeMission.completed) return;

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
                    if (definition.gameModeScope === targetDetails?.gameMode && valueIncrement >= definition.targetValue) {
                       activeMission.progress = definition.targetValue; // Max out progress if target met
                       progressMade = true;
                    } else if (definition.gameModeScope === targetDetails?.gameMode) { // Track highest streak if not yet met
                        activeMission.progress = Math.max(activeMission.progress, valueIncrement);
                    }
                    break;
                case MissionType.FEED_PET_COUNT:
                case MissionType.USE_PRACTICE_NOOK_COUNT:
                case MissionType.DEFEAT_MONSTER_COUNT: // New
                    activeMission.progress += valueIncrement;
                    progressMade = true;
                    break;
                case MissionType.EARN_GCOINS_FROM_TRAINING:
                    if (targetDetails?.gcoinsEarned) {
                        activeMission.progress += targetDetails.gcoinsEarned;
                        progressMade = true;
                    }
                    break;
                case MissionType.EARN_GCOINS_TOTAL:
                    if (activeMission.lastGcoinCheckValue === undefined) activeMission.lastGcoinCheckValue = prevData.gCoins;
                    const gcoinsSinceLastCheck = prevData.gCoins + (targetDetails?.gcoinsEarned || 0) - activeMission.lastGcoinCheckValue;
                    if (gcoinsSinceLastCheck > 0) {
                         activeMission.progress += gcoinsSinceLastCheck;
                         progressMade = true;
                    }
                    activeMission.lastGcoinCheckValue = prevData.gCoins + (targetDetails?.gcoinsEarned || 0);
                    break;
                 case MissionType.COMPLETE_DAILY_MISSION_COUNT:
                    // This is updated when a daily mission is claimed.
                    break;
                case MissionType.START_MONSTER_BATTLE: // New
                    if (definition.targetMonsterId === targetDetails?.monsterId) {
                        activeMission.progress += valueIncrement;
                        progressMade = true;
                    }
                    break;
                case MissionType.PET_REACH_STAT: // New
                    if (prevData.activePetId && targetDetails?.petId === prevData.activePetId && definition.targetPetStat === targetDetails?.stat) {
                       activeMission.currentPetStatValue = targetDetails?.statValue;
                       if(targetDetails.statValue !== undefined && targetDetails.statValue >= definition.targetValue){
                            activeMission.progress = definition.targetValue; // Mark as met
                       } else {
                            activeMission.progress = targetDetails.statValue || 0; // Update current progress
                       }
                       progressMade = true;
                    }
                    break;
                case MissionType.PLAY_NOTES_FREESTYLE_COUNT: // New
                    if(targetDetails?.notesPlayed !== undefined) {
                        activeMission.progress = targetDetails.notesPlayed; // Sets current notes played, completes if >= target
                        progressMade = true;
                    }
                    break;
                case MissionType.TRAIN_ADVANCED_ITEM_CORRECT_COUNT: // New
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
                addNotification({
                    type: 'missionCompleted',
                    titleKey: 'missionCompletedNotificationTitle',
                    missionName: UI_TEXT_TH[definition.descriptionKey]
                });
            }
        });
        return updatedData;
    });
  }, [addNotification, UI_TEXT_TH]);

  const refreshMissions = useCallback(() => {
    setPlayerData(prevData => {
        const now = Date.now();
        const today = new Date(now).setHours(0, 0, 0, 0);
        const currentWeekStart = new Date(now).setDate(new Date(now).getDate() - new Date(now).getDay() + (new Date(now).getDay() === 0 ? -6 : 1));
        const weekStartTimestamp = new Date(currentWeekStart).setHours(0,0,0,0);

        let newDailyMissionsGenerated = false;
        let newWeeklyMissionsGenerated = false;
        let updatedMissions = [...prevData.activeMissions];
        let updatedCompletedDailyCount = prevData.completedDailyMissionCountForWeekly;

        if (!prevData.lastDailyMissionRefresh || prevData.lastDailyMissionRefresh < today) {
            newDailyMissionsGenerated = true;
            updatedCompletedDailyCount = 0; // Reset weekly progress counter for daily missions
            const dailyDefinitions = MISSION_DEFINITIONS.filter(m => m.frequency === 'daily');
            const existingUnclaimedCompletedDailies = updatedMissions.filter(am => {
                const def = getMissionDefinition(am.definitionId);
                return def?.frequency === 'daily' && am.completed && !am.claimed;
            });
            updatedMissions = updatedMissions.filter(am => {
                 const def = getMissionDefinition(am.definitionId);
                 return def?.frequency !== 'daily' || (am.completed && !am.claimed);
            });
            const numNewDailiesToPick = DAILY_MISSIONS_TO_PICK - existingUnclaimedCompletedDailies.length;
            if (numNewDailiesToPick > 0) {
                const availableDailyDefs = shuffleArray(dailyDefinitions.filter(
                    dd => !existingUnclaimedCompletedDailies.some(ecdm => ecdm.definitionId === dd.id) &&
                          !updatedMissions.some(um => um.definitionId === dd.id) // Avoid picking already active (possibly unclaimed)
                ));
                const newDailies = availableDailyDefs.slice(0, numNewDailiesToPick).map(def => ({
                    definitionId: def.id, progress: 0, completed: false, claimed: false,
                    lastGcoinCheckValue: def.type === MissionType.EARN_GCOINS_TOTAL ? prevData.gCoins : undefined,
                    currentPetStatValue: def.type === MissionType.PET_REACH_STAT && prevData.activePetId && prevData.pets[prevData.activePetId] ? prevData.pets[prevData.activePetId].happiness : undefined, // Example for happiness
                }));
                updatedMissions.push(...newDailies);
            }
        }

        if (!prevData.lastWeeklyMissionRefresh || prevData.lastWeeklyMissionRefresh < weekStartTimestamp) {
            newWeeklyMissionsGenerated = true;
            const weeklyDefinitions = MISSION_DEFINITIONS.filter(m => m.frequency === 'weekly');
            const existingUnclaimedCompletedWeeklies = updatedMissions.filter(am => {
                const def = getMissionDefinition(am.definitionId);
                return def?.frequency === 'weekly' && am.completed && !am.claimed;
            });
            updatedMissions = updatedMissions.filter(am => {
                 const def = getMissionDefinition(am.definitionId);
                 return def?.frequency !== 'weekly' || (am.completed && !am.claimed);
            });
            const numNewWeekliesToPick = WEEKLY_MISSIONS_TO_PICK - existingUnclaimedCompletedWeeklies.length;
             if (numNewWeekliesToPick > 0) {
                const availableWeeklyDefs = shuffleArray(weeklyDefinitions.filter(
                    wd => !existingUnclaimedCompletedWeeklies.some(ecwm => ecwm.definitionId === wd.id) &&
                          !updatedMissions.some(um => um.definitionId === wd.id)
                ));
                const newWeeklies = availableWeeklyDefs.slice(0, numNewWeekliesToPick).map(def => ({
                    definitionId: def.id, progress: 0, completed: false, claimed: false,
                    lastGcoinCheckValue: def.type === MissionType.EARN_GCOINS_TOTAL ? prevData.gCoins : undefined,
                    currentPetStatValue: def.type === MissionType.PET_REACH_STAT && prevData.activePetId && prevData.pets[prevData.activePetId] ? prevData.pets[prevData.activePetId].happiness : undefined,
                }));
                updatedMissions.push(...newWeeklies);
            }
        }

        if (newDailyMissionsGenerated || newWeeklyMissionsGenerated) {
            return {
                ...prevData,
                activeMissions: updatedMissions,
                lastDailyMissionRefresh: newDailyMissionsGenerated ? today : prevData.lastDailyMissionRefresh,
                lastWeeklyMissionRefresh: newWeeklyMissionsGenerated ? weekStartTimestamp : prevData.lastWeeklyMissionRefresh,
                completedDailyMissionCountForWeekly: newDailyMissionsGenerated ? 0 : updatedCompletedDailyCount,
            };
        }
        return prevData;
    });
  }, []);

  useEffect(() => {
    // Initial mission generation if needed (e.g., first time load)
    // This will also be called if a mission refresh is due based on time.
    refreshMissions();
  }, [refreshMissions]); // refreshMissions is stable, so this runs once on mount

  const claimMissionReward = useCallback((missionId: MissionId): boolean => {
    let success = false;
    setPlayerData(prevData => {
        const missionIndex = prevData.activeMissions.findIndex(m => m.definitionId === missionId);
        if (missionIndex === -1) return prevData;

        const activeMission = prevData.activeMissions[missionIndex];
        const definition = getMissionDefinition(activeMission.definitionId);

        if (!definition || !activeMission.completed || activeMission.claimed) return prevData;

        let updatedData = deepClone(prevData);
        updatedData.activeMissions[missionIndex].claimed = true;
        success = true;

        let totalXpReward = 0;
        let totalPetXpReward = 0;

        definition.rewards.forEach(reward => {
            if (reward.type === MissionRewardType.GCOINS) updatedData.gCoins += reward.amount;
            if (reward.type === MissionRewardType.PLAYER_XP) totalXpReward += reward.amount;
            if (reward.type === MissionRewardType.PET_XP) totalPetXpReward += reward.amount;
        });

        if (totalXpReward > 0) {
            updatedData.xp += totalXpReward;
            const levelRes = checkAndApplyLevelUp(updatedData.xp, updatedData.level);
            updatedData.level = levelRes.newLevel;
        }

        if (totalPetXpReward > 0 && updatedData.activePetId && updatedData.pets[updatedData.activePetId]) {
            let activePetInst = updatedData.pets[updatedData.activePetId];
            const petXpBoostAbility = getActivePetAbilityMultiplier(prevData, PetAbilityType.PET_XP_BOOST);
            activePetInst.xp += Math.round(totalPetXpReward * petXpBoostAbility);
            const petLevelRes = checkAndApplyPetLevelUp(activePetInst, updatedData);
            updatedData.pets[updatedData.activePetId] = petLevelRes.updatedPet;
            updatedData = petLevelRes.updatedPlayerData;
        }
        
        addNotification({
            type: 'missionRewardClaimed',
            titleKey: 'missionRewardClaimedNotificationTitle',
            missionName: UI_TEXT_TH[definition.descriptionKey],
        });

        if (!updatedData.unlockedAchievementIds.includes(AchievementId.COMPLETE_FIRST_MISSION)) {
            updatedData = unlockAchievementInternal(AchievementId.COMPLETE_FIRST_MISSION, updatedData);
        }

        if (definition.frequency === 'daily') {
            updatedData.completedDailyMissionCountForWeekly = (updatedData.completedDailyMissionCountForWeekly || 0) + 1;
            updatedData.activeMissions.forEach(am => {
                const def = getMissionDefinition(am.definitionId);
                if (def?.type === MissionType.COMPLETE_DAILY_MISSION_COUNT && !am.completed) {
                    am.progress = updatedData.completedDailyMissionCountForWeekly;
                    if (am.progress >= def.targetValue) {
                        am.completed = true;
                         addNotification({
                            type: 'missionCompleted',
                            titleKey: 'missionCompletedNotificationTitle',
                            missionName: UI_TEXT_TH[def.descriptionKey]
                        });
                    }
                }
            });
            if (updatedData.completedDailyMissionCountForWeekly >= 5 && !updatedData.unlockedAchievementIds.includes(AchievementId.COMPLETE_5_DAILY_MISSIONS)) {
                updatedData = unlockAchievementInternal(AchievementId.COMPLETE_5_DAILY_MISSIONS, updatedData);
            }
        } else if (definition.frequency === 'weekly') {
             if (!updatedData.unlockedAchievementIds.includes(AchievementId.COMPLETE_FIRST_WEEKLY_MISSION)) {
                updatedData = unlockAchievementInternal(AchievementId.COMPLETE_FIRST_WEEKLY_MISSION, updatedData);
            }
        }
        return updatedData;
    });
    return success;
  }, [addNotification, checkAndApplyLevelUp, checkAndApplyPetLevelUp, getActivePetAbilityMultiplier, unlockAchievementInternal, UI_TEXT_TH]);

  const updateHighestStreak = useCallback((currentStreak: number) => {
    setPlayerData(prevData => {
      if (currentStreak > prevData.highestStreak) {
        const updatedData = { ...prevData, highestStreak: currentStreak };
        // Pass current game mode context if available, otherwise update for both generally
        updateMissionProgress(MissionType.TRAINING_STREAK, currentStreak, { gameMode: GameMode.INTERVALS }); 
        updateMissionProgress(MissionType.TRAINING_STREAK, currentStreak, { gameMode: GameMode.CHORDS });
        return updatedData;
      }
      return prevData;
    });
  }, [updateMissionProgress]);

  const addXpAndCoins = useCallback((xp: number, coins: number, context: { gameMode: GameMode, currentStreak: number, questionsAnsweredThisMode: number, itemId: string }) => {
    setPlayerData(prevData => {
      let updatedData = { ...prevData };
      updatedData.intervalCorrectCounts = { ...prevData.intervalCorrectCounts };
      updatedData.chordCorrectCounts = { ...prevData.chordCorrectCounts };
      updatedData.unlockedAchievementIds = Array.isArray(prevData.unlockedAchievementIds) ? [...prevData.unlockedAchievementIds] : [];
      updatedData.pets = deepClone(prevData.pets);

      const playerXpBoostFromPet = getActivePetAbilityMultiplier(prevData, PetAbilityType.XP_BOOST_TRAINING);
      const houseBenefits = HOUSE_BENEFITS_PER_LEVEL[prevData.houseLevel] || HOUSE_BENEFITS_PER_LEVEL[0];
      let xpMultiplierFromFurniture = 1.0;
      if (prevData.ownedFurnitureIds.includes(FurnitureId.GRAND_PIANO)) xpMultiplierFromFurniture = 1.02;

      const finalXp = Math.round(xp * playerXpBoostFromPet * houseBenefits.trainingXpMultiplier * xpMultiplierFromFurniture);
      const finalCoins = Math.round(coins * houseBenefits.trainingGCoinMultiplier);

      updatedData.xp += finalXp;
      updatedData.gCoins += finalCoins;
      const levelResult = checkAndApplyLevelUp(updatedData.xp, updatedData.level);
      updatedData.level = levelResult.newLevel;

      if (updatedData.activePetId && updatedData.pets[updatedData.activePetId]) {
        let activePetInstance = updatedData.pets[updatedData.activePetId];
        const petXpBoostFromPetAbility = getActivePetAbilityMultiplier(prevData, PetAbilityType.PET_XP_BOOST);
        activePetInstance.xp += Math.round(PET_XP_PER_CORRECT_ANSWER * petXpBoostFromPetAbility);
        if (activePetInstance.specialRequest && !activePetInstance.specialRequest.fulfilled) {
            const request = activePetInstance.specialRequest;
            const itemInfo = request.type === 'listen_interval' ? ALL_INTERVALS.find(i => i.id === request.targetId) : ALL_CHORDS.find(c => c.id === request.targetId);
            if (itemInfo && ((request.type === 'listen_interval' && context.gameMode === GameMode.INTERVALS && context.itemId === request.targetId) ||
                             (request.type === 'listen_chord' && context.gameMode === GameMode.CHORDS && context.itemId === request.targetId))) {
                activePetInstance.xp += request.rewardPetXp;
                activePetInstance.happiness = Math.min(MAX_PET_HAPPINESS, activePetInstance.happiness + request.rewardHappiness);
                activePetInstance.specialRequest = { ...request, fulfilled: true };
                addNotification({ type: 'pet', titleKey: 'petSpecialRequestFulfilled', petName: activePetInstance.name });
                if (!updatedData.unlockedAchievementIds.includes(AchievementId.PET_FULFILL_REQUEST_FIRST)) {
                  updatedData = unlockAchievementInternal(AchievementId.PET_FULFILL_REQUEST_FIRST, updatedData);
                }
                setTimeout(() => {
                    setPlayerData(pd => {
                        if (pd.activePetId && pd.pets[pd.activePetId]?.specialRequest?.fulfilled) {
                            const currentActivePet = pd.pets[pd.activePetId];
                            return {...pd, pets: {...pd.pets, [pd.activePetId]: {...currentActivePet, specialRequest: null}}};
                        }
                        return pd;
                    });
                }, 3000);
            }
        }
        const petLevelResult = checkAndApplyPetLevelUp(activePetInstance, updatedData);
        updatedData.pets[updatedData.activePetId] = petLevelResult.updatedPet;
        updatedData = petLevelResult.updatedPlayerData;
        // For PET_REACH_STAT mission type
        updateMissionProgress(MissionType.PET_REACH_STAT, 0, { petId: updatedData.activePetId, stat: 'HAPPINESS', statValue: petLevelResult.updatedPet.happiness });
        updateMissionProgress(MissionType.PET_REACH_STAT, 0, { petId: updatedData.activePetId, stat: 'LEVEL', statValue: petLevelResult.updatedPet.level });

      }

      let currentItemCorrectCount = 0;
      if (context.gameMode === GameMode.INTERVALS) {
        updatedData.intervalQuestionsAnswered = (updatedData.intervalQuestionsAnswered || 0) + 1;
        updatedData.intervalCorrectCounts[context.itemId] = (updatedData.intervalCorrectCounts[context.itemId] || 0) + 1;
        currentItemCorrectCount = updatedData.intervalCorrectCounts[context.itemId];
         if (updatedData.intervalQuestionsAnswered >= 1 && !updatedData.unlockedAchievementIds.includes(AchievementId.FIRST_CORRECT_INTERVAL)) updatedData = unlockAchievementInternal(AchievementId.FIRST_CORRECT_INTERVAL, updatedData);
         updateMissionProgress(MissionType.TRAIN_ITEM_CORRECT_COUNT, 1, { itemId: context.itemId, gameMode: GameMode.INTERVALS });
         updateMissionProgress(MissionType.TRAIN_ITEM_CORRECT_COUNT, 1, { gameMode: GameMode.INTERVALS }); // For general interval correct count missions
         updateMissionProgress(MissionType.TRAIN_ADVANCED_ITEM_CORRECT_COUNT, 1, { itemId: context.itemId, gameMode: GameMode.INTERVALS });
      } else if (context.gameMode === GameMode.CHORDS) {
        updatedData.chordQuestionsAnswered = (updatedData.chordQuestionsAnswered || 0) + 1;
        updatedData.chordCorrectCounts[context.itemId] = (updatedData.chordCorrectCounts[context.itemId] || 0) + 1;
        currentItemCorrectCount = updatedData.chordCorrectCounts[context.itemId];
        if (updatedData.chordQuestionsAnswered >= 1 && !updatedData.unlockedAchievementIds.includes(AchievementId.FIRST_CORRECT_CHORD)) updatedData = unlockAchievementInternal(AchievementId.FIRST_CORRECT_CHORD, updatedData);
        updateMissionProgress(MissionType.TRAIN_ITEM_CORRECT_COUNT, 1, { itemId: context.itemId, gameMode: GameMode.CHORDS });
        updateMissionProgress(MissionType.TRAIN_ADVANCED_ITEM_CORRECT_COUNT, 1, { itemId: context.itemId, gameMode: GameMode.CHORDS });
      }
      updateMissionProgress(MissionType.TRAINING_STREAK, context.currentStreak, { gameMode: context.gameMode });
      if (finalCoins > 0) {
          updateMissionProgress(MissionType.EARN_GCOINS_FROM_TRAINING, finalCoins);
          updateMissionProgress(MissionType.EARN_GCOINS_TOTAL, 0, {gcoinsEarned: finalCoins});
      }

      if (updatedData.level >= 5 && !updatedData.unlockedAchievementIds.includes(AchievementId.REACH_LEVEL_5)) updatedData = unlockAchievementInternal(AchievementId.REACH_LEVEL_5, updatedData);
      if (updatedData.level >= 10 && !updatedData.unlockedAchievementIds.includes(AchievementId.REACH_LEVEL_10)) updatedData = unlockAchievementInternal(AchievementId.REACH_LEVEL_10, updatedData);
      if (updatedData.level >= 15 && !updatedData.unlockedAchievementIds.includes(AchievementId.REACH_LEVEL_15)) updatedData = unlockAchievementInternal(AchievementId.REACH_LEVEL_15, updatedData);
      if (context.currentStreak >= 5 && !updatedData.unlockedAchievementIds.includes(AchievementId.STREAK_5)) updatedData = unlockAchievementInternal(AchievementId.STREAK_5, updatedData);
      if (context.currentStreak >= 10 && !updatedData.unlockedAchievementIds.includes(AchievementId.STREAK_10)) updatedData = unlockAchievementInternal(AchievementId.STREAK_10, updatedData);
      if (context.currentStreak >= 15 && !updatedData.unlockedAchievementIds.includes(AchievementId.STREAK_15)) updatedData = unlockAchievementInternal(AchievementId.STREAK_15, updatedData);
      if (updatedData.gCoins >= 100 && !updatedData.unlockedAchievementIds.includes(AchievementId.COLLECT_100_GCOINS)) updatedData = unlockAchievementInternal(AchievementId.COLLECT_100_GCOINS, updatedData);
      if (updatedData.gCoins >= 500 && !updatedData.unlockedAchievementIds.includes(AchievementId.COLLECT_500_GCOINS)) updatedData = unlockAchievementInternal(AchievementId.COLLECT_500_GCOINS, updatedData);
      if (updatedData.gCoins >= 1000 && !updatedData.unlockedAchievementIds.includes(AchievementId.COLLECT_1000_GCOINS)) updatedData = unlockAchievementInternal(AchievementId.COLLECT_1000_GCOINS, updatedData);
      const firstAdvancedUnlocked = updatedData.unlockedMusicalItemIds.some(item => {
          const musicalItem = item.type === UnlockedItemType.INTERVAL ? ALL_INTERVALS.find(i => i.id === item.id) : ALL_CHORDS.find(c => c.id === item.id);
          return musicalItem?.isAdvanced;
      });
      if (firstAdvancedUnlocked && !updatedData.unlockedAchievementIds.includes(AchievementId.UNLOCK_FIRST_ADVANCED_ITEM)) updatedData = unlockAchievementInternal(AchievementId.UNLOCK_FIRST_ADVANCED_ITEM, updatedData);
      const actualShopPurchases = updatedData.purchasedShopItemIds.filter(p => !(p.type === UnlockedItemType.INSTRUMENT_SOUND && p.id === InstrumentSoundId.SINE) && p.type !== UnlockedItemType.PET_FOOD && p.type !== UnlockedItemType.PET_CUSTOMIZATION && p.type !== UnlockedItemType.FURNITURE).length;
      if (actualShopPurchases >= 1 && !updatedData.unlockedAchievementIds.includes(AchievementId.PURCHASE_FIRST_SHOP_ITEM)) updatedData = unlockAchievementInternal(AchievementId.PURCHASE_FIRST_SHOP_ITEM, updatedData);
      const customizedPetsCount = updatedData.purchasedShopItemIds.filter(p => p.type === UnlockedItemType.PET_CUSTOMIZATION).length;
      if (customizedPetsCount > 0 && !updatedData.unlockedAchievementIds.includes(AchievementId.PET_CUSTOMIZED_FIRST)) updatedData = unlockAchievementInternal(AchievementId.PET_CUSTOMIZED_FIRST, updatedData);
      INITIAL_ACHIEVEMENTS.forEach(ach => {
        if (ach.itemId === context.itemId && ach.itemType === context.gameMode && ach.milestone && currentItemCorrectCount >= ach.milestone && !updatedData.unlockedAchievementIds.includes(ach.id)) {
           updatedData = unlockAchievementInternal(ach.id, updatedData);
        }
      });
      return updatedData;
    });
  }, [checkAndApplyLevelUp, unlockAchievementInternal, checkAndApplyPetLevelUp, getActivePetAbilityMultiplier, addNotification, updateMissionProgress]);

  const checkForDailyLoginReward = useCallback((): { baseReward: number, houseBonus: number, totalReward: number } => {
    const today = new Date().toISOString().split('T')[0];
    let baseReward = 0;
    let houseBonus = 0;
    setPlayerData(prevData => {
      if (prevData.lastLoginDate !== today) {
        baseReward = DAILY_LOGIN_REWARD;
        const currentHouseBenefits = HOUSE_BENEFITS_PER_LEVEL[prevData.houseLevel] || HOUSE_BENEFITS_PER_LEVEL[0];
        houseBonus = currentHouseBenefits.dailyLoginBonusGCoins;
        let updatedData = { ...prevData, lastLoginDate: today, gCoins: prevData.gCoins + baseReward + houseBonus, pets: deepClone(prevData.pets) };
        if (updatedData.activePetId && updatedData.pets[updatedData.activePetId]) {
            let activePetInstance = updatedData.pets[updatedData.activePetId];
            const petXpBoost = getActivePetAbilityMultiplier(prevData, PetAbilityType.PET_XP_BOOST);
            activePetInstance.xp += Math.round(PET_XP_PER_DAILY_LOGIN * petXpBoost);
            const petLevelResult = checkAndApplyPetLevelUp(activePetInstance, updatedData);
            updatedData.pets[updatedData.activePetId] = petLevelResult.updatedPet;
            updatedData = petLevelResult.updatedPlayerData;
            // For PET_REACH_STAT mission type
            updateMissionProgress(MissionType.PET_REACH_STAT, 0, { petId: updatedData.activePetId, stat: 'HAPPINESS', statValue: petLevelResult.updatedPet.happiness });
            updateMissionProgress(MissionType.PET_REACH_STAT, 0, { petId: updatedData.activePetId, stat: 'LEVEL', statValue: petLevelResult.updatedPet.level });
        }
        if (baseReward + houseBonus > 0) updateMissionProgress(MissionType.EARN_GCOINS_TOTAL, 0, {gcoinsEarned: baseReward + houseBonus});
        return updatedData;
      }
      return prevData;
    });
    return { baseReward, houseBonus, totalReward: baseReward + houseBonus };
  }, [checkAndApplyPetLevelUp, getActivePetAbilityMultiplier, updateMissionProgress]);

  const unlockMusicalItem = useCallback((itemId: string, itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD, cost: number): boolean => {
    let success = false;
    setPlayerData(prevData => {
      let finalCost = cost;
      const petDiscountMultiplier = getActivePetAbilityMultiplier(prevData, PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES);
      finalCost = Math.max(0, Math.round(finalCost * (1 - petDiscountMultiplier)));
      if (prevData.ownedFurnitureIds.includes(FurnitureId.MUSIC_THEORY_SHELF)) finalCost = Math.max(0, Math.round(finalCost * (1 - 0.03)));
      if (prevData.gCoins >= finalCost && !prevData.unlockedMusicalItemIds.some(item => item.id === itemId && item.type === itemType)) {
        success = true;
        let updatedData = { ...prevData, gCoins: prevData.gCoins - finalCost, unlockedMusicalItemIds: [...prevData.unlockedMusicalItemIds, { id: itemId, type: itemType }] };
        const musicalItemDetails = itemType === UnlockedItemType.INTERVAL ? ALL_INTERVALS.find(i => i.id === itemId) : ALL_CHORDS.find(c => c.id === itemId);
        if (musicalItemDetails?.isAdvanced) {
            const anyOtherAdvancedUnlocked = prevData.unlockedMusicalItemIds.some(unlockedItem => {
                 const details = unlockedItem.type === UnlockedItemType.INTERVAL ? ALL_INTERVALS.find(i => i.id === unlockedItem.id) : ALL_CHORDS.find(c => c.id === unlockedItem.id);
                 return details?.isAdvanced;
            });
            if (!anyOtherAdvancedUnlocked && !updatedData.unlockedAchievementIds.includes(AchievementId.UNLOCK_FIRST_ADVANCED_ITEM)) updatedData = unlockAchievementInternal(AchievementId.UNLOCK_FIRST_ADVANCED_ITEM, updatedData);
        }
        updateMissionProgress(MissionType.EARN_GCOINS_TOTAL, 0, {gcoinsEarned: -finalCost});
        return updatedData;
      }
      return prevData;
    });
    return success;
  }, [unlockAchievementInternal, getActivePetAbilityMultiplier, updateMissionProgress]);

 const purchaseShopItem = useCallback((shopItem: ShopItem): { success: boolean, messageKey?: keyof ThaiUIText, itemName?: string } => {
    let outcome: { success: boolean, messageKey?: keyof ThaiUIText, itemName?: string } = { success: false, messageKey: undefined, itemName: undefined };
    setPlayerData(prevData => {
      const itemNameLocalized = UI_TEXT_TH[shopItem.nameKey] || shopItem.id;
      outcome.itemName = itemNameLocalized;
      if (prevData.gCoins < shopItem.cost) {
        outcome = { ...outcome, success: false, messageKey: 'notEnoughGCoins' };
        return prevData;
      }
      if (shopItem.type === UnlockedItemType.INSTRUMENT_SOUND || shopItem.type === UnlockedItemType.PET_CUSTOMIZATION || shopItem.type === UnlockedItemType.FURNITURE) {
        if (prevData.purchasedShopItemIds.some(item => item.id === shopItem.id && item.type === shopItem.type)) {
          outcome = { ...outcome, success: true, messageKey: 'purchased' };
          return prevData;
        }
      }
      let updatedData = { ...prevData };
      updatedData.gCoins -= shopItem.cost;
      if (shopItem.type === UnlockedItemType.PET_FOOD) {
        updatedData.petFoodCount = (updatedData.petFoodCount || 0) + 1;
        outcome = { ...outcome, success: true, messageKey: 'itemPurchasedSuccess' };
      } else if (shopItem.type === UnlockedItemType.INSTRUMENT_SOUND || shopItem.type === UnlockedItemType.PET_CUSTOMIZATION || shopItem.type === UnlockedItemType.FURNITURE) {
        updatedData.purchasedShopItemIds = [ ...updatedData.purchasedShopItemIds, { id: shopItem.id, type: shopItem.type }];
        if (shopItem.type === UnlockedItemType.FURNITURE) updatedData.ownedFurnitureIds = [...(updatedData.ownedFurnitureIds || []), shopItem.id as FurnitureId];
        outcome = { ...outcome, success: true, messageKey: 'itemPurchasedSuccess' };
        if (shopItem.type === UnlockedItemType.INSTRUMENT_SOUND) {
            const actualShopPurchases = updatedData.purchasedShopItemIds.filter(p => !(p.type === UnlockedItemType.INSTRUMENT_SOUND && p.id === InstrumentSoundId.SINE) && p.type !== UnlockedItemType.PET_FOOD && p.type !== UnlockedItemType.PET_CUSTOMIZATION && p.type !== UnlockedItemType.FURNITURE).length;
            if (actualShopPurchases >= 1 && !updatedData.unlockedAchievementIds.includes(AchievementId.PURCHASE_FIRST_SHOP_ITEM)) updatedData = unlockAchievementInternal(AchievementId.PURCHASE_FIRST_SHOP_ITEM, updatedData);
        } else if (shopItem.type === UnlockedItemType.PET_CUSTOMIZATION) {
            if (!updatedData.unlockedAchievementIds.includes(AchievementId.PET_CUSTOMIZED_FIRST)) updatedData = unlockAchievementInternal(AchievementId.PET_CUSTOMIZED_FIRST, updatedData);
        } else if (shopItem.type === UnlockedItemType.FURNITURE) {
            if (!updatedData.unlockedAchievementIds.includes(AchievementId.PURCHASE_FIRST_FURNITURE)) updatedData = unlockAchievementInternal(AchievementId.PURCHASE_FIRST_FURNITURE, updatedData);
        }
      } else {
        outcome = { ...outcome, success: false };
        return prevData;
      }
      updateMissionProgress(MissionType.EARN_GCOINS_TOTAL, 0, {gcoinsEarned: -shopItem.cost});
      return updatedData;
    });
    return outcome;
  }, [unlockAchievementInternal, UI_TEXT_TH, updateMissionProgress]);

  const selectInstrumentSound = useCallback((soundId: InstrumentSoundId) => {
    setPlayerData(prevData => ({ ...prevData, selectedInstrumentSoundId: soundId }));
  }, []);

  const adoptPet = useCallback((petDef: PetDefinition): {success: boolean, messageKey?: keyof ThaiUIText } => {
    let outcome: {success: boolean, messageKey?: keyof ThaiUIText } = { success: false };
    setPlayerData(prevData => {
        if (prevData.ownedPetIds.includes(petDef.id)) {
            outcome = { success: false, messageKey: 'petAlreadyOwned' }; return prevData;
        }
        if (prevData.gCoins < petDef.cost) {
            outcome = { success: false, messageKey: 'notEnoughGCoins' }; return prevData;
        }
        const newPetInstance: ActivePet = {
            id: petDef.id, name: UI_TEXT_TH[petDef.nameKey] || petDef.id, hunger: MAX_PET_HUNGER,
            lastFedTimestamp: Date.now(), lastLoginTimestampForHunger: Date.now(), xp: 0, level: 1,
            happiness: MAX_PET_HAPPINESS / 2, lastPlayedTimestamp: 0, lastInteractionTimestamp: Date.now(),
            customization: {}, specialRequest: null,
        };
        let updatedData = { ...prevData, gCoins: prevData.gCoins - petDef.cost, ownedPetIds: [...prevData.ownedPetIds, petDef.id], pets: { ...prevData.pets, [petDef.id]: newPetInstance }};
        if (!updatedData.activePetId) updatedData.activePetId = petDef.id;
        updatedData = unlockAchievementInternal(AchievementId.ADOPT_FIRST_PET, updatedData);
        if (updatedData.ownedPetIds.length >= PET_DEFINITIONS.length && !updatedData.unlockedAchievementIds.includes(AchievementId.PET_COLLECTOR)) updatedData = unlockAchievementInternal(AchievementId.PET_COLLECTOR, updatedData);
        outcome = { success: true, messageKey: 'petAdoptedSuccess' };
        addNotification({type: 'pet', titleKey: 'petAdoptedSuccess', petName: newPetInstance.name});
        updateMissionProgress(MissionType.EARN_GCOINS_TOTAL, 0, {gcoinsEarned: -petDef.cost});
        return updatedData;
    });
    return outcome;
  }, [addNotification, UI_TEXT_TH, unlockAchievementInternal, updateMissionProgress]);

  const feedPet = useCallback((): boolean => {
    let success = false;
    setPlayerData(prevData => {
        if (!prevData.activePetId || !prevData.pets[prevData.activePetId]) return prevData;
        if (prevData.petFoodCount <= 0) { addNotification({type: 'info', titleKey: 'notEnoughPetFood'}); return prevData; }
        let updatedData = deepClone(prevData);
        let activePetInstance = updatedData.pets[prevData.activePetId!];
        const now = Date.now();
        activePetInstance.hunger = Math.min(MAX_PET_HUNGER, activePetInstance.hunger + PET_FOOD_HUNGER_VALUE);
        activePetInstance.lastFedTimestamp = now; activePetInstance.lastInteractionTimestamp = now;
        const petXpBoost = getActivePetAbilityMultiplier(prevData, PetAbilityType.PET_XP_BOOST);
        activePetInstance.xp += Math.round(PET_XP_PER_FEEDING * petXpBoost);
        let happinessBoostFromFurniture = 0;
        if (prevData.ownedFurnitureIds.includes(FurnitureId.COMFY_PET_BED)) happinessBoostFromFurniture = 5;
        activePetInstance.happiness = Math.min(MAX_PET_HAPPINESS, activePetInstance.happiness + HAPPINESS_PER_FEEDING + happinessBoostFromFurniture);
        const petLevelResult = checkAndApplyPetLevelUp(activePetInstance, updatedData);
        updatedData.pets[prevData.activePetId!] = petLevelResult.updatedPet; updatedData = petLevelResult.updatedPlayerData;
        updatedData.petFoodCount = prevData.petFoodCount - 1;
        if (!updatedData.unlockedAchievementIds.includes(AchievementId.FEED_PET_FIRST_TIME)) updatedData = unlockAchievementInternal(AchievementId.FEED_PET_FIRST_TIME, updatedData);
        if (activePetInstance.happiness >= MAX_PET_HAPPINESS && !updatedData.unlockedAchievementIds.includes(AchievementId.PET_MAX_HAPPINESS)) {
            updatedData = unlockAchievementInternal(AchievementId.PET_MAX_HAPPINESS, updatedData);
            addNotification({ type: 'pet', titleKey: 'petMaxHappinessMessage', petName: activePetInstance.name });
        }
        addNotification({type: 'pet', titleKey: 'petFedSuccess', petName: activePetInstance.name});
        success = true;
        updateMissionProgress(MissionType.FEED_PET_COUNT, 1);
        updateMissionProgress(MissionType.PET_REACH_STAT, 0, { petId: prevData.activePetId, stat: 'HAPPINESS', statValue: petLevelResult.updatedPet.happiness });
        return updatedData;
    });
    return success;
  }, [addNotification, unlockAchievementInternal, checkAndApplyPetLevelUp, getActivePetAbilityMultiplier, updateMissionProgress]);

  const playWithPet = useCallback((): boolean => {
    let played = false;
    setPlayerData(prevData => {
        if (!prevData.activePetId || !prevData.pets[prevData.activePetId]) return prevData;
        let updatedData = deepClone(prevData);
        let activePetInstance = updatedData.pets[prevData.activePetId!];
        const now = Date.now(); const cooldownMillis = PET_PLAY_COOLDOWN_HOURS * 60 * 60 * 1000;
        if (now - (activePetInstance.lastPlayedTimestamp || 0) < cooldownMillis) { addNotification({type: 'info', titleKey: 'petPlayCooldownMessage'}); return prevData; }
        let happinessBoostFromFurniture = 0;
        if (prevData.ownedFurnitureIds.includes(FurnitureId.COMFY_PET_BED)) happinessBoostFromFurniture = 5;
        activePetInstance.happiness = Math.min(MAX_PET_HAPPINESS, (activePetInstance.happiness || 0) + HAPPINESS_PER_PLAY + happinessBoostFromFurniture);
        activePetInstance.lastPlayedTimestamp = now; activePetInstance.lastInteractionTimestamp = now;
        updatedData.petInteractionCount = (updatedData.petInteractionCount || 0) + 1;
        let happinessAchievementJustUnlocked = false;
        if (activePetInstance.happiness >= MAX_PET_HAPPINESS && !updatedData.unlockedAchievementIds.includes(AchievementId.PET_MAX_HAPPINESS)) { updatedData = unlockAchievementInternal(AchievementId.PET_MAX_HAPPINESS, updatedData); happinessAchievementJustUnlocked = true; }
        if (updatedData.petInteractionCount >= PET_INTERACTION_ACHIEVEMENT_MILESTONE && !updatedData.unlockedAchievementIds.includes(AchievementId.PET_PLAY_10_TIMES)) updatedData = unlockAchievementInternal(AchievementId.PET_PLAY_10_TIMES, updatedData);
        if (happinessAchievementJustUnlocked) addNotification({ type: 'pet', titleKey: 'petMaxHappinessMessage', petName: activePetInstance.name });
        else addNotification({type: 'pet', titleKey: 'playWithPetButton', petName: activePetInstance.name});
        played = true;
        updateMissionProgress(MissionType.PET_REACH_STAT, 0, { petId: prevData.activePetId, stat: 'HAPPINESS', statValue: activePetInstance.happiness });
        return updatedData;
    });
    return played;
  }, [addNotification, unlockAchievementInternal, updateMissionProgress]);

  const updatePetStateOnLoad = useCallback(() => {
    setPlayerData(prevData => {
        if (!prevData.activePetId || !prevData.pets[prevData.activePetId]) return prevData;
        let updatedData = deepClone(prevData);
        let activePetInstance = updatedData.pets[prevData.activePetId!];
        const now = Date.now(); const lastLoginForHunger = activePetInstance.lastLoginTimestampForHunger || now;
        const timeDiffHours = (now - lastLoginForHunger) / (1000 * 60 * 60); const hungerDecay = Math.floor(timeDiffHours * PET_HUNGER_DECAY_PER_HOUR);
        let oldHunger = activePetInstance.hunger; let newHunger = activePetInstance.hunger; let newHappiness = activePetInstance.happiness;
        if (hungerDecay > 0) {
            newHunger = Math.max(0, activePetInstance.hunger - hungerDecay);
            if (newHunger < oldHunger * 0.7 && oldHunger > MAX_PET_HUNGER * 0.3) newHappiness = Math.max(0, newHappiness - HAPPINESS_DECAY_ON_HUNGER_DROP);
            activePetInstance.hunger = newHunger; activePetInstance.lastLoginTimestampForHunger = now;
        }
        const lastInteraction = activePetInstance.lastInteractionTimestamp || now;
        const interactionDiffHours = (now - lastInteraction) / (1000 * 60 * 60);
        if (interactionDiffHours > PET_BOREDOM_THRESHOLD_HOURS) {
            const boredomDecay = Math.floor((interactionDiffHours - PET_BOREDOM_THRESHOLD_HOURS) * HAPPINESS_DECAY_ON_BOREDOM);
            if (boredomDecay > 0) newHappiness = Math.max(0, newHappiness - boredomDecay);
        }
        activePetInstance.happiness = newHappiness;
        if (!activePetInstance.specialRequest && Math.random() < PET_SPECIAL_REQUEST_CHANCE * Math.max(1, timeDiffHours / 24)) {
            const isIntervalRequest = Math.random() < 0.5;
            const items = isIntervalRequest ? ALL_INTERVALS.filter(i => !i.isAdvanced) : ALL_CHORDS.filter(c => !c.isAdvanced);
            if (items.length > 0) {
                const randomItem = items[Math.floor(Math.random() * items.length)];
                activePetInstance.specialRequest = { type: isIntervalRequest ? 'listen_interval' : 'listen_chord', targetId: randomItem.id, targetName: randomItem.name, descriptionKey: 'petSpecialRequestListenTo', fulfilled: false, rewardPetXp: PET_SPECIAL_REQUEST_REWARD_XP, rewardHappiness: PET_SPECIAL_REQUEST_REWARD_HAPPINESS };
                addNotification({ type: 'petSpecialRequest', titleKey: 'petSpecialRequestTitle', messageKey: 'petSpecialRequestListenTo', petName: activePetInstance.name, itemName: randomItem.name });
            }
        }
        if (newHunger < MAX_PET_HUNGER * 0.3 && newHunger < oldHunger) addNotification({ type: 'pet', titleKey: 'petHungryNotificationTitle', messageKey: 'petHungryNotificationMessage', petName: activePetInstance.name });
        updatedData.pets[prevData.activePetId!] = activePetInstance;
        // For PET_REACH_STAT mission type after loading
        updateMissionProgress(MissionType.PET_REACH_STAT, 0, { petId: prevData.activePetId, stat: 'HAPPINESS', statValue: activePetInstance.happiness });
        updateMissionProgress(MissionType.PET_REACH_STAT, 0, { petId: prevData.activePetId, stat: 'LEVEL', statValue: activePetInstance.level });
        return updatedData;
    });
  }, [addNotification, updateMissionProgress]);

  const isMusicalItemUnlocked = useCallback((itemId: string, itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD): boolean => {
    return playerData.unlockedMusicalItemIds.some(item => item.id === itemId && item.type === itemType);
  }, [playerData.unlockedMusicalItemIds]);

  const isShopItemPurchased = useCallback((itemId: string, itemType: UnlockedItemType.INSTRUMENT_SOUND | UnlockedItemType.AVATAR_ITEM | UnlockedItemType.PET_FOOD | UnlockedItemType.PET_CUSTOMIZATION | UnlockedItemType.FURNITURE): boolean => {
    if (itemType === UnlockedItemType.PET_FOOD) return true;
    return playerData.purchasedShopItemIds.some(item => item.id === itemId && item.type === itemType);
  }, [playerData.purchasedShopItemIds]);

  const setActivePet = useCallback((petId: PetId | null) => {
    setPlayerData(prevData => {
        const updatedData = prevData.ownedPetIds.includes(petId as PetId) || petId === null ? { ...prevData, activePetId: petId } : prevData;
        if (petId && updatedData.pets[petId]) { // Update mission progress for newly active pet's current state
             updateMissionProgress(MissionType.PET_REACH_STAT, 0, { petId: petId, stat: 'HAPPINESS', statValue: updatedData.pets[petId].happiness });
             updateMissionProgress(MissionType.PET_REACH_STAT, 0, { petId: petId, stat: 'LEVEL', statValue: updatedData.pets[petId].level });
        }
        return updatedData;
    });
  }, [updateMissionProgress]);

  const purchasePetCustomizationItem = useCallback((item: ShopItem): { success: boolean, messageKey?: keyof ThaiUIText, itemName?: string } => purchaseShopItem(item), [purchaseShopItem]);

  const applyPetCustomization = useCallback((petId: PetId, customization: PetCustomization): boolean => {
      let success = false;
      setPlayerData(prevData => {
          if (!prevData.pets[petId]) return prevData;
          const updatedPet = { ...prevData.pets[petId], customization: { ...prevData.pets[petId].customization, ...customization }};
          success = true;
          const collarItem = PET_CUSTOMIZATION_ITEMS.find(item => item.data.color === customization.collarColor);
          const itemName = collarItem ? UI_TEXT_TH[collarItem.nameKey] : "ของตกแต่ง";
          addNotification({type: 'pet', titleKey: 'petCustomizationApplied', petName: updatedPet.name, itemName });
          return { ...prevData, pets: { ...prevData.pets, [petId]: updatedPet }};
      });
      return success;
  }, [addNotification, UI_TEXT_TH]);

  const setPlayerName = useCallback((name: string) => setPlayerData(prevData => ({ ...prevData, playerName: name })), []);
  const saveGameExplicitly = useCallback(() => { saveData(playerData); addNotification({ type: 'gameEvent', titleKey: 'saveGameSuccessMessage' }); }, [playerData, saveData, addNotification]);
  const resetGame = useCallback(() => { if (window.confirm(UI_TEXT_TH.confirmResetMessage)) { localStorage.removeItem(PLAYER_DATA_KEY); window.location.reload(); }}, [UI_TEXT_TH.confirmResetMessage]);

 const upgradeHouse = useCallback((): { success: boolean, messageKey?: keyof ThaiUIText, newLevel?: number } => {
    let outcome: { success: boolean, messageKey?: keyof ThaiUIText, newLevel?: number } = { success: false };
    setPlayerData(prevData => {
      if (prevData.houseLevel >= MAX_HOUSE_LEVEL) { outcome = { success: false, messageKey: 'maxHouseLevelReached' }; return prevData; }
      const nextLevel = prevData.houseLevel + 1; const cost = HOUSE_UPGRADE_COSTS[nextLevel];
      if (prevData.gCoins < cost) { outcome = { success: false, messageKey: 'notEnoughGCoinsForUpgrade' }; return prevData; }
      let updatedData = { ...prevData, gCoins: prevData.gCoins - cost, houseLevel: nextLevel };
      outcome = { success: true, messageKey: 'houseUpgradeSuccess', newLevel: nextLevel };
      if (nextLevel === 1 && !updatedData.unlockedAchievementIds.includes(AchievementId.ACHIEVE_FIRST_HOUSE)) updatedData = unlockAchievementInternal(AchievementId.ACHIEVE_FIRST_HOUSE, updatedData);
      else if (nextLevel === 2 && !updatedData.unlockedAchievementIds.includes(AchievementId.ACHIEVE_UPGRADED_HOUSE_LV2)) updatedData = unlockAchievementInternal(AchievementId.ACHIEVE_UPGRADED_HOUSE_LV2, updatedData);
      else if (nextLevel === 3 && !updatedData.unlockedAchievementIds.includes(AchievementId.ACHIEVE_UPGRADED_HOUSE_LV3)) updatedData = unlockAchievementInternal(AchievementId.ACHIEVE_UPGRADED_HOUSE_LV3, updatedData);
      const currentBenefits = HOUSE_BENEFITS_PER_LEVEL[updatedData.houseLevel]; const prevBenefits = HOUSE_BENEFITS_PER_LEVEL[prevData.houseLevel];
      if (currentBenefits && prevBenefits && (currentBenefits.dailyLoginBonusGCoins > prevBenefits.dailyLoginBonusGCoins || currentBenefits.trainingXpMultiplier > prevBenefits.trainingXpMultiplier || currentBenefits.trainingGCoinMultiplier > prevBenefits.trainingGCoinMultiplier)) {
          addNotification({ type: 'info', titleKey: 'newHouseBenefitsUnlocked', messageKey: 'houseUpgradeSuccess', newLevel: nextLevel });
      }
      updateMissionProgress(MissionType.EARN_GCOINS_TOTAL, 0, {gcoinsEarned: -cost});
      return updatedData;
    });
    return outcome;
  }, [unlockAchievementInternal, addNotification, updateMissionProgress]);

  const activatePracticeNook = useCallback((): PracticeNookResult => {
    const now = Date.now(); const cooldownMillis = PRACTICE_NOOK_COOLDOWN_HOURS * 60 * 60 * 1000;
    if (playerData.lastPracticeNookTimestamp && (now - playerData.lastPracticeNookTimestamp < cooldownMillis)) return { success: false, cooldownRemaining: cooldownMillis - (now - playerData.lastPracticeNookTimestamp) };
    let rewards = { playerXp: PRACTICE_NOOK_PLAYER_XP_REWARD, petXp: 0, petHappiness: 0 };
    setPlayerData(prevData => {
      let updatedData = { ...prevData, lastPracticeNookTimestamp: now };
      updatedData.xp += PRACTICE_NOOK_PLAYER_XP_REWARD;
      const playerLevelResult = checkAndApplyLevelUp(updatedData.xp, updatedData.level);
      updatedData.level = playerLevelResult.newLevel;
      if (updatedData.activePetId && updatedData.pets[updatedData.activePetId]) {
        let activePet = updatedData.pets[updatedData.activePetId];
        const petXpBoost = getActivePetAbilityMultiplier(prevData, PetAbilityType.PET_XP_BOOST);
        const actualPetXpReward = Math.round(PRACTICE_NOOK_PET_XP_REWARD * petXpBoost);
        rewards.petXp = actualPetXpReward; activePet.xp += actualPetXpReward;
        rewards.petHappiness = PRACTICE_NOOK_PET_HAPPINESS_REWARD;
        activePet.happiness = Math.min(MAX_PET_HAPPINESS, activePet.happiness + PRACTICE_NOOK_PET_HAPPINESS_REWARD);
        activePet.lastInteractionTimestamp = now;
        const petLevelResult = checkAndApplyPetLevelUp(activePet, updatedData);
        updatedData.pets[updatedData.activePetId] = petLevelResult.updatedPet;
        updatedData = petLevelResult.updatedPlayerData;
        updateMissionProgress(MissionType.PET_REACH_STAT, 0, { petId: updatedData.activePetId, stat: 'HAPPINESS', statValue: petLevelResult.updatedPet.happiness });
      }
      updateMissionProgress(MissionType.USE_PRACTICE_NOOK_COUNT, 1);
      return updatedData;
    });
    return { success: true, rewards };
  }, [playerData, checkAndApplyLevelUp, checkAndApplyPetLevelUp, getActivePetAbilityMultiplier, updateMissionProgress]);

  
  const recordMonsterDefeat = useCallback((monsterId: MonsterId) => {
    setPlayerData(prevData => {
      if (prevData.defeatedMonsterIds.includes(monsterId)) {
        // Potentially allow re-battle for smaller rewards or no memento, but for now, no change if already defeated.
        return prevData;
      }

      const monsterDef = getMonsterDefinition(monsterId);
      if (!monsterDef) return prevData;

      let updatedData = deepClone(prevData);
      updatedData.defeatedMonsterIds = [...updatedData.defeatedMonsterIds, monsterId];
      
      const memento = ALL_MEMENTOS.find(m => m.id === monsterDef.rewardMementoId);
      if (memento && !updatedData.collectedMementos.includes(memento.id)) {
        updatedData.collectedMementos = [...updatedData.collectedMementos, memento.id];
      }


      const gcoinsReward = monsterDef.rewardGcoins || 0;
      const playerXpReward = monsterDef.rewardPlayerXp || 0;

      updatedData.gCoins += gcoinsReward;
      updatedData.xp += playerXpReward;

      const levelResult = checkAndApplyLevelUp(updatedData.xp, updatedData.level);
      updatedData.level = levelResult.newLevel;
      
      if (gcoinsReward > 0) {
           updateMissionProgress(MissionType.EARN_GCOINS_TOTAL, 0, {gcoinsEarned: gcoinsReward});
      }
      // Update DEFEAT_MONSTER_COUNT mission
      updateMissionProgress(MissionType.DEFEAT_MONSTER_COUNT, 1, {monsterId: monsterId});


      addNotification({
          type: 'monsterDefeated',
          titleKey: 'monsterBattleVictoryMessage',
          monsterName: UI_TEXT_TH[monsterDef.nameKey],
          mementoName: memento ? UI_TEXT_TH[memento.nameKey] : '',
          amount: gcoinsReward 
      });

      if (!updatedData.unlockedAchievementIds.includes(AchievementId.DEFEAT_FIRST_MONSTER)) {
          updatedData = unlockAchievementInternal(AchievementId.DEFEAT_FIRST_MONSTER, updatedData);
      }
      if (monsterId === MonsterId.MONO_NOTE_SLIME && !updatedData.unlockedAchievementIds.includes(AchievementId.DEFEAT_MONO_NOTE_SLIME)) {
          updatedData = unlockAchievementInternal(AchievementId.DEFEAT_MONO_NOTE_SLIME, updatedData);
      }
      if (monsterId === MonsterId.CHORD_CRACKER && !updatedData.unlockedAchievementIds.includes(AchievementId.DEFEAT_CHORD_CRACKER)) {
          updatedData = unlockAchievementInternal(AchievementId.DEFEAT_CHORD_CRACKER, updatedData);
      }
      if (monsterId === MonsterId.INTERVAL_IMP && !updatedData.unlockedAchievementIds.includes(AchievementId.DEFEAT_INTERVAL_IMP)) {
          updatedData = unlockAchievementInternal(AchievementId.DEFEAT_INTERVAL_IMP, updatedData);
      }
      if (monsterId === MonsterId.RHYTHM_LORD && !updatedData.unlockedAchievementIds.includes(AchievementId.DEFEAT_RHYTHM_LORD)) {
        updatedData = unlockAchievementInternal(AchievementId.DEFEAT_RHYTHM_LORD, updatedData);
      }
      if (monsterId === MonsterId.HARMONY_SIREN && !updatedData.unlockedAchievementIds.includes(AchievementId.DEFEAT_HARMONY_SIREN)) {
        updatedData = unlockAchievementInternal(AchievementId.DEFEAT_HARMONY_SIREN, updatedData);
      }

      const allMementosCollected = ALL_MEMENTOS.every(memDef => updatedData.collectedMementos.includes(memDef.id));
      if (allMementosCollected && !updatedData.unlockedAchievementIds.includes(AchievementId.COLLECT_ALL_MEMENTOS)) {
        updatedData = unlockAchievementInternal(AchievementId.COLLECT_ALL_MEMENTOS, updatedData);
      }

      return updatedData;
    });
  }, [addNotification, checkAndApplyLevelUp, unlockAchievementInternal, updateMissionProgress, UI_TEXT_TH]);


  return {
    playerData, addXpAndCoins, getAchievementDetails, notifications, dismissNotification,
    updateHighestStreak, achievements, checkForDailyLoginReward, unlockMusicalItem, isMusicalItemUnlocked,
    purchaseShopItem, isShopItemPurchased, selectInstrumentSound, addNotification, unlockAchievement,
    adoptPet, feedPet, updatePetStateOnLoad, playWithPet, setActivePet, purchasePetCustomizationItem,
    applyPetCustomization, getActivePetAbilityMultiplier, setPlayerName, saveGameExplicitly, resetGame,
    upgradeHouse, activatePracticeNook, refreshMissions, claimMissionReward,
    recordMonsterDefeat, updateMissionProgress, // Expose updateMissionProgress
  };
};
