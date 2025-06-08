
import { useCallback, useState, useEffect } from 'react';
import {
  PlayerData, MissionId, MissionDefinition, ActiveMission, ThaiUIText, NotificationMessage,
  MissionType, MissionRewardType, GameMode, PetId, MonsterId, MementoId, AchievementId, ActivePet
} from '../types';
import { UI_TEXT_TH, MISSION_DEFINITIONS, DAILY_MISSIONS_TO_PICK, WEEKLY_MISSIONS_TO_PICK, getMissionDefinition } from '../constants';

export type MissionTargetDetails = {
  itemId?: string;
  gameMode?: GameMode;
  gcoinsEarnedInThisEvent?: number;
  petId?: PetId;
  stat?: 'HAPPINESS' | 'LEVEL';
  statValue?: number;
  monsterId?: MonsterId;
  mementoId?: MementoId;
  notesPlayed?: number;
  targetItemType?: GameMode.INTERVALS | GameMode.CHORDS;
  targetItemId?: string;
};

interface UseMissionSystemProps {
  setPlayerDataOptimistic: (updater: (prevData: PlayerData) => PlayerData) => void;
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  unlockAchievementInternal: (achievementId: AchievementId, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> };
  checkAndApplyLevelUp: (currentXp: number, currentLevel: number, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> }; // Added
  increasePetFoodCountDelegate: (amount: number) => void;
  addPetXPDelegate: (petId: PetId, xpAmount: number) => { updatedPet: ActivePet, notifications: Omit<NotificationMessage, 'id'>[], newUnlockedAchievements: AchievementId[] };
}

export interface MissionSystemReturn {
  refreshMissions: () => void;
  updateMissionProgress: (
    missionType: MissionType,
    valueIncrement?: number,
    targetDetails?: MissionTargetDetails,
    currentPlayerData?: PlayerData
  ) => PlayerData;
  claimMissionReward: (missionId: MissionId) => boolean;
  getActiveMissions: () => ActiveMission[];
}

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useMissionSystem = ({
  setPlayerDataOptimistic,
  addNotification,
  unlockAchievementInternal,
  checkAndApplyLevelUp, // Destructured
  increasePetFoodCountDelegate,
  addPetXPDelegate,
}: UseMissionSystemProps): MissionSystemReturn => {

  const refreshMissions = useCallback(() => {
    setPlayerDataOptimistic(prev => {
      if (!prev) return prev;
      const now = Date.now();
      let updatedData = deepClone(prev);
      let newMissionsGenerated = false;

      const todayStart = new Date(now).setHours(0, 0, 0, 0);
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());

      if (!updatedData.lastDailyMissionRefresh || updatedData.lastDailyMissionRefresh < todayStart) {
        const dailyPool = MISSION_DEFINITIONS.filter(m => m.frequency === 'daily');
        const shuffledDaily = dailyPool.sort(() => 0.5 - Math.random());
        const newDailyMissions = shuffledDaily.slice(0, DAILY_MISSIONS_TO_PICK).map(def => ({
          definitionId: def.id, progress: 0, completed: false, claimed: false,
        }));
        updatedData.activeMissions = updatedData.activeMissions.filter(am => getMissionDefinition(am.definitionId)?.frequency !== 'daily');
        updatedData.activeMissions.push(...newDailyMissions);
        updatedData.lastDailyMissionRefresh = now;
        newMissionsGenerated = true;
      }

      if (!updatedData.lastWeeklyMissionRefresh || updatedData.lastWeeklyMissionRefresh < weekStart.getTime()) {
        const weeklyPool = MISSION_DEFINITIONS.filter(m => m.frequency === 'weekly');
        const shuffledWeekly = weeklyPool.sort(() => 0.5 - Math.random());
        const newWeeklyMissions = shuffledWeekly.slice(0, WEEKLY_MISSIONS_TO_PICK).map(def => ({
          definitionId: def.id, progress: 0, completed: false, claimed: false,
        }));
        updatedData.activeMissions = updatedData.activeMissions.filter(am => getMissionDefinition(am.definitionId)?.frequency !== 'weekly');
        updatedData.activeMissions.push(...newWeeklyMissions);
        updatedData.lastWeeklyMissionRefresh = now;
        updatedData.completedDailyMissionCountForWeekly = 0;
        newMissionsGenerated = true;
      }

      if (newMissionsGenerated) {
        addNotification({type: 'info', titleKey: 'appName', messageKey: undefined, itemName: 'ภารกิจใหม่พร้อมให้คุณท้าทายแล้ว!'});
      }
      return updatedData;
    });
  }, [setPlayerDataOptimistic, addNotification]);

  const updateMissionProgress = useCallback((
    missionType: MissionType,
    valueIncrement: number = 1,
    targetDetails?: MissionTargetDetails,
    directPlayerData?: PlayerData
  ): PlayerData => {
    let modifiedPlayerData: PlayerData | null = null;

    setPlayerDataOptimistic(prev => {
      const currentData = directPlayerData || prev;
      if (!currentData) return prev;

      let updatedData = deepClone(currentData);
      let missionsUpdated = false;

      updatedData.activeMissions = updatedData.activeMissions.map(mission => {
        if (mission.completed) return mission;
        const def = getMissionDefinition(mission.definitionId);
        if (!def || def.type !== missionType) return mission;

        let shouldProgress = true;
        if (def.targetItemType && def.targetItemType !== targetDetails?.targetItemType && def.targetItemType !== targetDetails?.gameMode) shouldProgress = false;
        if (def.targetItemId && def.targetItemId !== targetDetails?.targetItemId && def.targetItemId !== targetDetails?.itemId) shouldProgress = false;
        if (def.gameModeScope && def.gameModeScope !== targetDetails?.gameMode) shouldProgress = false;
        if (def.targetMonsterId && def.targetMonsterId !== targetDetails?.monsterId) shouldProgress = false;
        if (def.targetPetStat && def.petId && def.petId !== targetDetails?.petId) shouldProgress = false;
        if (def.targetPetStat && def.targetPetStat !== targetDetails?.stat) shouldProgress = false;


        if (shouldProgress) {
          let newProgress = mission.progress;
           if (missionType === MissionType.EARN_GCOINS_FROM_TRAINING || missionType === MissionType.EARN_GCOINS_TOTAL) {
             if(targetDetails?.gcoinsEarnedInThisEvent !== undefined && targetDetails.gcoinsEarnedInThisEvent > 0) {
                 newProgress = (mission.lastGcoinCheckValue || 0) + targetDetails.gcoinsEarnedInThisEvent;
                 mission.lastGcoinCheckValue = newProgress;
             } else if (targetDetails?.gcoinsEarnedInThisEvent !== undefined && targetDetails.gcoinsEarnedInThisEvent < 0) { // For spending
                newProgress = (mission.lastGcoinCheckValue || 0) + targetDetails.gcoinsEarnedInThisEvent; // Should be a decrease
                mission.lastGcoinCheckValue = newProgress;
             }
          } else if (missionType === MissionType.PET_REACH_STAT && targetDetails?.statValue !== undefined) {
            newProgress = Math.max(mission.progress, targetDetails.statValue);
          } else if (missionType === MissionType.PLAY_NOTES_FREESTYLE_COUNT && targetDetails?.notesPlayed !== undefined){
            newProgress = targetDetails.notesPlayed;
          } else {
            newProgress += valueIncrement;
          }

          newProgress = Math.min(newProgress, def.targetValue);

          if (newProgress > mission.progress) {
            mission.progress = newProgress;
            missionsUpdated = true;
          }

          if (mission.progress >= def.targetValue && !mission.completed) {
            mission.completed = true;
            missionsUpdated = true;
            addNotification({ type: 'missionCompleted', titleKey: 'missionCompletedNotificationTitle', missionName: UI_TEXT_TH[def.descriptionKey] });
          }
        }
        return mission;
      });

      modifiedPlayerData = missionsUpdated ? { ...updatedData } : currentData;
      return modifiedPlayerData;
    });
    return modifiedPlayerData || (directPlayerData || {} as PlayerData);
  }, [setPlayerDataOptimistic, addNotification, UI_TEXT_TH]);


  const claimMissionReward = useCallback((missionId: MissionId): boolean => {
    let success = false;
    setPlayerDataOptimistic(prev => {
      if (!prev) return prev;
      let updatedData = deepClone(prev);
      const localNotifications: Omit<NotificationMessage, 'id'>[] = [];
      const missionIndex = updatedData.activeMissions.findIndex(m => m.definitionId === missionId && m.completed && !m.claimed);

      if (missionIndex === -1) return prev;

      const missionDef = getMissionDefinition(missionId);
      if (!missionDef) return prev;

      updatedData.activeMissions[missionIndex].claimed = true;
      success = true;

      missionDef.rewards.forEach(reward => {
        if (reward.type === MissionRewardType.GCOINS) {
          updatedData.gCoins = (updatedData.gCoins || 0) + reward.amount;
          updatedData = updateMissionProgress(MissionType.EARN_GCOINS_TOTAL, undefined, { gcoinsEarnedInThisEvent: reward.amount }, updatedData);
        } else if (reward.type === MissionRewardType.PLAYER_XP) {
          updatedData.xp = (updatedData.xp || 0) + reward.amount;
        } else if (reward.type === MissionRewardType.PET_XP && reward.amount && updatedData.activePetId) {
            const petXPOutcome = addPetXPDelegate(updatedData.activePetId, reward.amount);
            if (petXPOutcome.notifications) petXPOutcome.notifications.forEach(n => localNotifications.push(n));
            if (petXPOutcome.newUnlockedAchievements) {
                 petXPOutcome.newUnlockedAchievements.forEach(achId => {
                    const achInternalResult = unlockAchievementInternal(achId, updatedData);
                    updatedData = achInternalResult.updatedPlayerData;
                    if(achInternalResult.notification) localNotifications.push(achInternalResult.notification);
                });
            }
        }
      });

      const levelUpResult = checkAndApplyLevelUp(updatedData.xp, updatedData.level, updatedData);
      updatedData = levelUpResult.updatedPlayerData;
      if (levelUpResult.notification) localNotifications.push(levelUpResult.notification);

      if (missionDef.frequency === 'daily') {
        updatedData.completedDailyMissionCountForWeekly = (updatedData.completedDailyMissionCountForWeekly || 0) + 1;
        updatedData = updateMissionProgress(MissionType.COMPLETE_DAILY_MISSION_COUNT, 1, undefined, updatedData);
      }

      localNotifications.push({ type: 'missionRewardClaimed', titleKey: 'missionRewardClaimedNotificationTitle', missionName: UI_TEXT_TH[missionDef.descriptionKey] });

      if (!updatedData.unlockedAchievementIds.includes(AchievementId.COMPLETE_FIRST_MISSION)) {
          const achResult = unlockAchievementInternal(AchievementId.COMPLETE_FIRST_MISSION, updatedData);
          updatedData = achResult.updatedPlayerData;
          if (achResult.notification) localNotifications.push(achResult.notification);
      }
      if (missionDef.frequency === 'daily' && updatedData.completedDailyMissionCountForWeekly >= 5 && !updatedData.unlockedAchievementIds.includes(AchievementId.COMPLETE_5_DAILY_MISSIONS)) {
          const achResult = unlockAchievementInternal(AchievementId.COMPLETE_5_DAILY_MISSIONS, updatedData);
          updatedData = achResult.updatedPlayerData;
          if (achResult.notification) localNotifications.push(achResult.notification);
      }
      if (missionDef.frequency === 'weekly' && !updatedData.unlockedAchievementIds.includes(AchievementId.COMPLETE_FIRST_WEEKLY_MISSION)) {
          const achResult = unlockAchievementInternal(AchievementId.COMPLETE_FIRST_WEEKLY_MISSION, updatedData);
          updatedData = achResult.updatedPlayerData;
          if (achResult.notification) localNotifications.push(achResult.notification);
      }

      localNotifications.forEach(addNotification);
      return updatedData;
    });
    return success;
  }, [setPlayerDataOptimistic, addNotification, unlockAchievementInternal, updateMissionProgress, addPetXPDelegate, checkAndApplyLevelUp, UI_TEXT_TH]);


  useEffect(() => {
    refreshMissions();
  }, [refreshMissions]);

  const getActiveMissions = useCallback((): ActiveMission[] => {
    let missions: ActiveMission[] = [];
    setPlayerDataOptimistic(prev => {
        if(prev) missions = prev.activeMissions;
        return prev;
    });
    return missions;
  }, [setPlayerDataOptimistic]);

  return {
    refreshMissions,
    updateMissionProgress,
    claimMissionReward,
    getActiveMissions,
  };
};
