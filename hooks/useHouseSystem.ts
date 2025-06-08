
import { useCallback } from 'react';
import {
  PlayerData,
  ThaiUIText,
  NotificationMessage,
  AchievementId,
  PracticeNookResult,
  MissionType,
  PetId,
  NPCId,
  ActivePet,
  GameMode, // Assuming GameMode might be relevant for MissionTargetDetails
  FurnitureId
} from '../types';
import {
  MAX_HOUSE_LEVEL, HOUSE_UPGRADE_COSTS, PRACTICE_NOOK_COOLDOWN_HOURS,
  PRACTICE_NOOK_PLAYER_XP_REWARD, PRACTICE_NOOK_PET_XP_REWARD, PRACTICE_NOOK_PET_HAPPINESS_REWARD,
  getHouseLevelName, UI_TEXT_TH, formatTime, SPOUSAL_BONUS_PRACTICE_NOOK_COOLDOWN_REDUCTION_MELODIE,
  MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD, HOUSE_BENEFITS_PER_LEVEL, getPetName
} from '../constants';

export interface UseHouseSystemReturn {
  upgradeHouse: () => { success: boolean; messageKey?: keyof ThaiUIText; newLevel?: number };
  activatePracticeNook: () => PracticeNookResult;
}

type MissionTargetDetails = {
  itemId?: string;
  gameMode?: GameMode;
  gcoinsEarnedInThisEvent?: number;
  petId?: PetId;
  stat?: 'HAPPINESS' | 'LEVEL';
  statValue?: number;
  monsterId?: string;
  mementoId?: string;
  notesPlayed?: number;
};

interface UseHouseSystemProps {
  playerData: Readonly<PlayerData>;
  setPlayerDataOptimistic: (updater: (prevData: PlayerData) => PlayerData) => void;
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  checkAndApplyLevelUp: (currentXp: number, currentLevel: number, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> };
  addPetXPForPracticeNook: (petId: PetId, xpAmount: number, currentPlayerData: PlayerData) => { updatedPet: ActivePet, notifications: Omit<NotificationMessage, 'id'>[], newUnlockedAchievements: AchievementId[], updatedPlayerData: PlayerData };
  unlockAchievementInternal: (achievementId: AchievementId, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> };
  updateMissionProgressInternal: (missionType: MissionType, currentPlayerData: PlayerData, valueIncrement?: number, targetDetails?: MissionTargetDetails) => PlayerData;
}

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useHouseSystem = ({
  playerData, // This is the prop, should always be valid due to usePlayerData's initialization
  setPlayerDataOptimistic,
  addNotification,
  checkAndApplyLevelUp,
  addPetXPForPracticeNook,
  unlockAchievementInternal,
  updateMissionProgressInternal,
}: UseHouseSystemProps): UseHouseSystemReturn => {

  const upgradeHouse = useCallback((): { success: boolean; messageKey?: keyof ThaiUIText; newLevel?: number } => {
    if (playerData.houseLevel >= MAX_HOUSE_LEVEL) {
      return { success: false, messageKey: 'maxHouseLevelReached' };
    }
    const nextLevel = playerData.houseLevel + 1;
    const cost = HOUSE_UPGRADE_COSTS[nextLevel];
    if (playerData.gCoins < cost) {
      return { success: false, messageKey: 'notEnoughGCoinsForUpgrade' };
    }

    setPlayerDataOptimistic(prev => {
      // prev here is the full PlayerData object from usePlayerData's state
      if (!prev) return prev; // Should ideally not happen if playerData prop is always valid

      let updatedData = deepClone(prev);
      updatedData.gCoins -= cost;
      updatedData.houseLevel = nextLevel;

      let achievementToUnlock: AchievementId | null = null;
      if (nextLevel === 1) achievementToUnlock = AchievementId.ACHIEVE_FIRST_HOUSE;
      else if (nextLevel === 2) achievementToUnlock = AchievementId.ACHIEVE_UPGRADED_HOUSE_LV2;
      else if (nextLevel === 3) achievementToUnlock = AchievementId.ACHIEVE_UPGRADED_HOUSE_LV3;

      if (achievementToUnlock) {
        const achResult = unlockAchievementInternal(achievementToUnlock, updatedData);
        updatedData = achResult.updatedPlayerData;
        if (achResult.notification) addNotification(achResult.notification);
      }
      
      updatedData = updateMissionProgressInternal(MissionType.EARN_GCOINS_TOTAL, updatedData, undefined, {gcoinsEarnedInThisEvent: -cost});
      return updatedData;
    });

    return { success: true, messageKey: 'houseUpgradeSuccess', newLevel: nextLevel };
  }, [playerData, setPlayerDataOptimistic, addNotification, unlockAchievementInternal, updateMissionProgressInternal]);


  const activatePracticeNook = useCallback((): PracticeNookResult => {
    const now = Date.now();
    let currentCooldownHours = PRACTICE_NOOK_COOLDOWN_HOURS;

    // Use the playerData prop for checks
    if (playerData.isMarried && playerData.spouseId === NPCId.MELODIE && playerData.marriageHappiness > MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD) {
      currentCooldownHours *= (1 - SPOUSAL_BONUS_PRACTICE_NOOK_COOLDOWN_REDUCTION_MELODIE);
    }
    const cooldownMillis = currentCooldownHours * 60 * 60 * 1000;

    if (playerData.lastPracticeNookTimestamp && (now - playerData.lastPracticeNookTimestamp) < cooldownMillis) {
      return {
        success: false,
        cooldownRemaining: cooldownMillis - (now - playerData.lastPracticeNookTimestamp),
      };
    }

    const practiceRewards = {
      playerXp: PRACTICE_NOOK_PLAYER_XP_REWARD,
      petXp: 0,
      petHappiness: 0,
    };

    setPlayerDataOptimistic(prev => {
      if (!prev) return prev; // Again, defensive check

      let updatedData = deepClone(prev);
      let localNotifications: Omit<NotificationMessage, 'id'>[] = [];

      updatedData.xp += practiceRewards.playerXp;
      const levelUpResult = checkAndApplyLevelUp(updatedData.xp, updatedData.level, updatedData);
      updatedData = levelUpResult.updatedPlayerData;
      if (levelUpResult.notification) localNotifications.push(levelUpResult.notification);

      if (updatedData.activePetId && updatedData.pets[updatedData.activePetId]) {
        practiceRewards.petXp = PRACTICE_NOOK_PET_XP_REWARD;
        practiceRewards.petHappiness = PRACTICE_NOOK_PET_HAPPINESS_REWARD;
        
        const petUpdateResult = addPetXPForPracticeNook(updatedData.activePetId, practiceRewards.petXp, updatedData);
        // addPetXPForPracticeNook is expected to handle pet's XP, happiness, level-up, and related notifications/achievements
        // It returns the *entire* updated PlayerData, so we use that.
        updatedData = petUpdateResult.updatedPlayerData; 
        localNotifications.push(...petUpdateResult.notifications);
         // Ensure achievements from pet leveling are merged
        if (petUpdateResult.newUnlockedAchievements) {
            updatedData.unlockedAchievementIds = Array.from(new Set([...updatedData.unlockedAchievementIds, ...petUpdateResult.newUnlockedAchievements]));
        }
      }
      
      updatedData.lastPracticeNookTimestamp = now;
      updatedData = updateMissionProgressInternal(MissionType.USE_PRACTICE_NOOK_COUNT, updatedData, 1);

      localNotifications.forEach(addNotification);
      return updatedData;
    });

    return { success: true, rewards: practiceRewards };
  }, [playerData, setPlayerDataOptimistic, addNotification, checkAndApplyLevelUp, addPetXPForPracticeNook, updateMissionProgressInternal]);

  return {
    upgradeHouse,
    activatePracticeNook,
  };
};
