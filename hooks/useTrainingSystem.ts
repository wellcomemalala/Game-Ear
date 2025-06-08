

import { useCallback } from 'react';
import {
  PlayerData, GameMode, AchievementId, NotificationMessage, UnlockedItemType, ThaiUIText, NPCId, MissionType, PetId, MonsterId, MementoId, ActivePet
} from '../types';
import {
  XP_PER_CORRECT_ANSWER, GCOINS_PER_CORRECT_ANSWER, UI_TEXT_TH,
  SPOUSAL_BONUS_GCOIN_CHANCE_RHYTHM, SPOUSAL_BONUS_GCOIN_AMOUNT_RHYTHM,
  MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD, HOUSE_BENEFITS_PER_LEVEL, ALL_INTERVALS, ALL_CHORDS
} from '../constants';
import { MissionTargetDetails } from './useMissionSystem'; // Import if centrally defined or from primary source


interface UseTrainingSystemProps {
  setPlayerDataOptimistic: (updater: (prevData: PlayerData) => PlayerData) => void;
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  checkAndApplyLevelUp: (currentXp: number, currentLevel: number, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> };
  unlockAchievementInternal: (achievementId: AchievementId, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> };
  updateHighestStreakInternal: (streak: number, gameMode: GameMode, currentPlayerData: PlayerData) => PlayerData;
  handlePetXPForCorrectAnswerInternal: (currentActivePetId: PlayerData['activePetId'], currentPets: PlayerData['pets'], currentPlayerData: PlayerData) => { updatedPets?: PlayerData['pets'], notifications: Omit<NotificationMessage, 'id'>[], updatedPlayerDataForAch?: Partial<PlayerData> };
  updateMissionProgressInternal: (missionType: MissionType, currentPlayerData: PlayerData, valueIncrement?: number, targetDetails?: MissionTargetDetails) => PlayerData;
}

export interface TrainingSystemReturn {
  addXpAndCoinsFromTraining: (
    baseXp: number,
    baseCoins: number,
    context: { gameMode: GameMode, currentStreak: number, questionsAnsweredThisMode: number, itemId: string }
  ) => { finalXp: number, finalCoins: number }; // Updated return type
  updateHighestStreak: (streak: number, gameMode: GameMode) => void;
}

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useTrainingSystem = ({
  setPlayerDataOptimistic,
  addNotification,
  checkAndApplyLevelUp,
  unlockAchievementInternal,
  updateHighestStreakInternal,
  handlePetXPForCorrectAnswerInternal,
  updateMissionProgressInternal,
}: UseTrainingSystemProps): TrainingSystemReturn => {

  const addXpAndCoinsFromTraining = useCallback((
    baseXp: number,
    baseCoins: number,
    context: { gameMode: GameMode, currentStreak: number, questionsAnsweredThisMode: number, itemId: string }
  ): { finalXp: number, finalCoins: number } => { 
    let awardedXp = 0;
    let awardedCoins = 0;

    setPlayerDataOptimistic(prev => {
      if (!prev) return prev;

      let updatedData = deepClone(prev);
      let localNotifications: Omit<NotificationMessage, 'id'>[] = [];
      
      const houseBenefits = HOUSE_BENEFITS_PER_LEVEL[updatedData.houseLevel] || HOUSE_BENEFITS_PER_LEVEL[0];
      const finalXp = Math.round(baseXp * houseBenefits.trainingXpMultiplier);
      let finalCoins = Math.round(baseCoins * houseBenefits.trainingGCoinMultiplier);
      
      awardedXp = finalXp; 
      awardedCoins = finalCoins; 

      if (updatedData.isMarried && updatedData.spouseId === NPCId.RHYTHM && updatedData.marriageHappiness > MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD) {
        if (Math.random() < SPOUSAL_BONUS_GCOIN_CHANCE_RHYTHM) {
          const bonusRhythmCoins = SPOUSAL_BONUS_GCOIN_AMOUNT_RHYTHM;
          finalCoins += bonusRhythmCoins;
          awardedCoins = finalCoins;
          localNotifications.push({ type: 'info', titleKey: 'appName', itemName: UI_TEXT_TH.spousalBonusRhythmDesc?.replace('{value}', bonusRhythmCoins.toString()) || `โบนัสจากริทึ่ม! ได้รับ ${bonusRhythmCoins} G-Coins เพิ่ม!` });
        }
      }
      
      updatedData.xp += finalXp;
      updatedData.gCoins += finalCoins;

      const levelUpResult = checkAndApplyLevelUp(updatedData.xp, updatedData.level, updatedData);
      updatedData = levelUpResult.updatedPlayerData;
      if (levelUpResult.notification) localNotifications.push(levelUpResult.notification);

      updatedData = {
        ...updatedData,
        intervalQuestionsAnswered: context.gameMode === GameMode.INTERVALS ? (updatedData.intervalQuestionsAnswered || 0) + 1 : (updatedData.intervalQuestionsAnswered || 0),
        chordQuestionsAnswered: context.gameMode === GameMode.CHORDS ? (updatedData.chordQuestionsAnswered || 0) + 1 : (updatedData.chordQuestionsAnswered || 0),
        melodyRecallQuestionsAnswered: context.gameMode === GameMode.MELODY_RECALL ? (updatedData.melodyRecallQuestionsAnswered || 0) + 1 : (updatedData.melodyRecallQuestionsAnswered || 0),
        intervalCorrectCounts: context.gameMode === GameMode.INTERVALS ? { ...updatedData.intervalCorrectCounts, [context.itemId]: (updatedData.intervalCorrectCounts[context.itemId] || 0) + 1 } : updatedData.intervalCorrectCounts,
        chordCorrectCounts: context.gameMode === GameMode.CHORDS ? { ...updatedData.chordCorrectCounts, [context.itemId]: (updatedData.chordCorrectCounts[context.itemId] || 0) + 1 } : updatedData.chordCorrectCounts,
        melodyRecallCorrectCounts: context.gameMode === GameMode.MELODY_RECALL ? { ...updatedData.melodyRecallCorrectCounts, [context.itemId]: (updatedData.melodyRecallCorrectCounts[context.itemId] || 0) + 1 } : updatedData.melodyRecallCorrectCounts,
      };

      // Specific Achievement checks using 'prev' for the condition
      if (context.gameMode === GameMode.INTERVALS && !prev.unlockedAchievementIds.includes(AchievementId.FIRST_CORRECT_INTERVAL)) {
        const achResult = unlockAchievementInternal(AchievementId.FIRST_CORRECT_INTERVAL, updatedData);
        updatedData = achResult.updatedPlayerData;
        if (achResult.notification) localNotifications.push(achResult.notification);
      } else if (context.gameMode === GameMode.CHORDS && !prev.unlockedAchievementIds.includes(AchievementId.FIRST_CORRECT_CHORD)) {
        const achResult = unlockAchievementInternal(AchievementId.FIRST_CORRECT_CHORD, updatedData);
        updatedData = achResult.updatedPlayerData;
        if (achResult.notification) localNotifications.push(achResult.notification);
      } else if (context.gameMode === GameMode.MELODY_RECALL && !prev.unlockedAchievementIds.includes(AchievementId.FIRST_CORRECT_MELODY)) {
        const achResult = unlockAchievementInternal(AchievementId.FIRST_CORRECT_MELODY, updatedData);
        updatedData = achResult.updatedPlayerData;
        if (achResult.notification) localNotifications.push(achResult.notification);
      }
      
      // Subsequent achievement checks should use the potentially updated `updatedData.unlockedAchievementIds`
      if (context.itemId === 'M3' && context.gameMode === GameMode.INTERVALS) {
        const count = updatedData.intervalCorrectCounts['M3'] || 0;
        if (count >= 10 && !updatedData.unlockedAchievementIds.includes(AchievementId.M3_NOVICE)) {
            const achResult = unlockAchievementInternal(AchievementId.M3_NOVICE, updatedData);
            updatedData = achResult.updatedPlayerData;
            if (achResult.notification) localNotifications.push(achResult.notification);
        }
        if (count >= 50 && !updatedData.unlockedAchievementIds.includes(AchievementId.M3_ADEPT)) {
            const achResult = unlockAchievementInternal(AchievementId.M3_ADEPT, updatedData);
            updatedData = achResult.updatedPlayerData;
            if (achResult.notification) localNotifications.push(achResult.notification);
        }
      }
      // Add more item-specific achievement checks here if needed, using updatedData.unlockedAchievementIds

      if (updatedData.activePetId && updatedData.pets[updatedData.activePetId]) {
        const petXpResult = handlePetXPForCorrectAnswerInternal(updatedData.activePetId, updatedData.pets, updatedData);
        if (petXpResult.updatedPets) updatedData.pets = petXpResult.updatedPets; // This should update the pets within updatedData
        // Ensure updatedData reflects changes from pet XP handling before further processing
        if(petXpResult.updatedPlayerDataForAch) {
           updatedData = {
             ...updatedData,
             ...petXpResult.updatedPlayerDataForAch,
             unlockedAchievementIds: Array.from(new Set([...updatedData.unlockedAchievementIds, ...(petXpResult.updatedPlayerDataForAch.unlockedAchievementIds || [])]))
           };
        }
        localNotifications.push(...petXpResult.notifications);
      }

      updatedData = updateMissionProgressInternal(MissionType.EARN_GCOINS_FROM_TRAINING, updatedData, finalCoins, {gcoinsEarnedInThisEvent: finalCoins});
      updatedData = updateMissionProgressInternal(MissionType.EARN_GCOINS_TOTAL, updatedData, finalCoins, {gcoinsEarnedInThisEvent: finalCoins});

      if(context.gameMode === GameMode.INTERVALS || context.gameMode === GameMode.CHORDS){
          const trainItemDetails: MissionTargetDetails = {
            targetItemType: context.gameMode,
            targetItemId: context.itemId,
            gameMode: context.gameMode, 
            itemId: context.itemId 
          };
          updatedData = updateMissionProgressInternal(MissionType.TRAIN_ITEM_CORRECT_COUNT, updatedData, 1, trainItemDetails);

          const itemDef = context.gameMode === GameMode.INTERVALS
              ? ALL_INTERVALS.find(i => i.id === context.itemId)
              : ALL_CHORDS.find(c => c.id === context.itemId);

          if(itemDef?.isAdvanced){
              const advancedTrainItemDetails: MissionTargetDetails = {
                targetItemType: context.gameMode, 
                gameMode: context.gameMode 
              };
              updatedData = updateMissionProgressInternal(MissionType.TRAIN_ADVANCED_ITEM_CORRECT_COUNT, updatedData, 1, advancedTrainItemDetails);
          }
      }

      localNotifications.forEach(addNotification);
      return updatedData;
    });
    return { finalXp: awardedXp, finalCoins: awardedCoins };
  }, [setPlayerDataOptimistic, addNotification, checkAndApplyLevelUp, unlockAchievementInternal, handlePetXPForCorrectAnswerInternal, updateMissionProgressInternal, UI_TEXT_TH]);

  const updateHighestStreak = useCallback((streak: number, gameMode: GameMode) => {
    setPlayerDataOptimistic(prev => {
        if (!prev) return prev;
        let updatedData = updateHighestStreakInternal(streak, gameMode, prev);
        const localNotifications: Omit<NotificationMessage, 'id'>[] = [];
        
        // Use updatedData for checks as it contains the latest streak info
        let currentAchievements = updatedData.unlockedAchievementIds;

        let streak5Ach = (gameMode === GameMode.MELODY_RECALL) ? AchievementId.MELODY_RECALL_STREAK_3 : AchievementId.STREAK_5;
        let streak10Ach = (gameMode === GameMode.MELODY_RECALL) ? AchievementId.MELODY_RECALL_STREAK_7 : AchievementId.STREAK_10;
        const streakThreshold5 = gameMode === GameMode.MELODY_RECALL ? 3 : 5;
        const streakThreshold10 = gameMode === GameMode.MELODY_RECALL ? 7 : 10;

        if(streak >= streakThreshold5 && !currentAchievements.includes(streak5Ach)) {
            const achResult = unlockAchievementInternal(streak5Ach, updatedData);
            updatedData = achResult.updatedPlayerData; currentAchievements = updatedData.unlockedAchievementIds;
            if (achResult.notification) localNotifications.push(achResult.notification);
        }
         if(streak >= streakThreshold10 && !currentAchievements.includes(streak10Ach)) {
            const achResult = unlockAchievementInternal(streak10Ach, updatedData);
            updatedData = achResult.updatedPlayerData; currentAchievements = updatedData.unlockedAchievementIds;
            if (achResult.notification) localNotifications.push(achResult.notification);
        }
         if(gameMode !== GameMode.MELODY_RECALL && streak >= 15 && !currentAchievements.includes(AchievementId.STREAK_15)) {
            const achResult = unlockAchievementInternal(AchievementId.STREAK_15, updatedData);
            updatedData = achResult.updatedPlayerData; currentAchievements = updatedData.unlockedAchievementIds;
            if (achResult.notification) localNotifications.push(achResult.notification);
        }
        
        const streakMissionDetails: MissionTargetDetails = { gameMode: gameMode };
        updatedData = updateMissionProgressInternal(MissionType.TRAINING_STREAK, updatedData, streak, streakMissionDetails);
        localNotifications.forEach(addNotification);
        return updatedData;
    });
  }, [setPlayerDataOptimistic, unlockAchievementInternal, addNotification, updateHighestStreakInternal, updateMissionProgressInternal]);

  return {
    addXpAndCoinsFromTraining,
    updateHighestStreak,
  };
};
