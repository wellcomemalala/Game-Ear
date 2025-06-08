
import { useCallback } from 'react';
import {
  PlayerData, MonsterId, MementoId, ThaiUIText, NotificationMessage, AchievementId, QuestItemId, UnlockedItemType, NPCId, MissionType, GameMode, PetId
} from '../types';
import {
  UI_TEXT_TH, ALL_MEMENTOS, getMementoDefinition, getMonsterDefinition,
  MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD, SPOUSAL_BONUS_MEMENTO_DROP_RATE_INCREASE_HARMONIE
} from '../constants';


type MissionTargetDetails = {
  itemId?: string;
  gameMode?: GameMode;
  gcoinsEarnedInThisEvent?: number;
  petId?: PetId;
  stat?: 'HAPPINESS' | 'LEVEL';
  statValue?: number;
  monsterId?: MonsterId; 
  mementoId?: MementoId; 
  notesPlayed?: number;
};

interface UseMonsterSystemProps {
  setPlayerDataOptimistic: (updater: (prevData: PlayerData) => PlayerData) => void;
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  checkAndApplyLevelUp: (currentXp: number, currentLevel: number, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> };
  unlockAchievementInternal: (achievementId: AchievementId, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> };
  collectQuestItemInternal: (itemId: string | QuestItemId, quantity: number | undefined, currentPlayerData: PlayerData) => PlayerData; 
  updateMissionProgressInternal: (missionType: MissionType, currentPlayerData: PlayerData, valueIncrement?: number, targetDetails?: MissionTargetDetails) => PlayerData;
}

export interface MonsterSystemReturn {
  recordMonsterDefeat: (monsterId: MonsterId) => void;
}

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useMonsterSystem = ({
  setPlayerDataOptimistic,
  addNotification,
  checkAndApplyLevelUp,
  unlockAchievementInternal,
  collectQuestItemInternal,
  updateMissionProgressInternal,
}: UseMonsterSystemProps): MonsterSystemReturn => {

  const recordMonsterDefeat = useCallback((monsterId: MonsterId) => {
    setPlayerDataOptimistic(prev => {
      if (!prev) return prev;
      const monsterDef = getMonsterDefinition(monsterId);
      if (!monsterDef) return prev;

      let updatedData = deepClone(prev);
      const localNotifications: Omit<NotificationMessage, 'id'>[] = [];
      let currentAchievements = updatedData.unlockedAchievementIds;

      if (!updatedData.defeatedMonsterIds.includes(monsterId)) {
        updatedData.defeatedMonsterIds = [...updatedData.defeatedMonsterIds, monsterId];
      }

      updatedData.xp = (updatedData.xp || 0) + (monsterDef.rewardPlayerXp || 0);
      updatedData.gCoins = (updatedData.gCoins || 0) + (monsterDef.rewardGcoins || 0);

      const levelUpResult = checkAndApplyLevelUp(updatedData.xp, updatedData.level, updatedData);
      updatedData = levelUpResult.updatedPlayerData;
      if (levelUpResult.notification) localNotifications.push(levelUpResult.notification);
      currentAchievements = updatedData.unlockedAchievementIds; 

      let mementoDropChance = monsterDef.rewardMementoId ? 0.5 : 0; // Base chance for memento drop
      if (prev.isMarried && prev.spouseId === NPCId.HARMONIE && prev.marriageHappiness > MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD) {
        mementoDropChance += SPOUSAL_BONUS_MEMENTO_DROP_RATE_INCREASE_HARMONIE;
      }
      mementoDropChance = Math.min(1, mementoDropChance); // Cap at 100%

      let mementoDroppedName: string | undefined = undefined;
      if (monsterDef.rewardMementoId && Math.random() < mementoDropChance) {
        if (!updatedData.collectedMementos.includes(monsterDef.rewardMementoId)) {
          updatedData.collectedMementos = [...updatedData.collectedMementos, monsterDef.rewardMementoId];
        }
        const mementoInfo = getMementoDefinition(monsterDef.rewardMementoId);
        mementoDroppedName = mementoInfo ? UI_TEXT_TH[mementoInfo.nameKey] : monsterDef.rewardMementoId;
        
        if (updatedData.collectedMementos.length === ALL_MEMENTOS.length && !currentAchievements.includes(AchievementId.COLLECT_ALL_MEMENTOS)) {
            const achResult = unlockAchievementInternal(AchievementId.COLLECT_ALL_MEMENTOS, updatedData);
            updatedData = achResult.updatedPlayerData; currentAchievements = updatedData.unlockedAchievementIds;
            if(achResult.notification) localNotifications.push(achResult.notification);
        }
      }
      
      if (monsterDef.questItemDrop && Math.random() < monsterDef.questItemDrop.chance) {
        updatedData = collectQuestItemInternal(monsterDef.questItemDrop.itemId, 1, updatedData);
      }

      localNotifications.push({
        type: 'monsterDefeated',
        titleKey: 'appName', 
        monsterName: UI_TEXT_TH[monsterDef.nameKey],
        mementoName: mementoDroppedName,
        gcoins: monsterDef.rewardGcoins // Use gcoins property
      });

      let monsterAchId: AchievementId | null = null;
      switch(monsterId) {
          case MonsterId.MONO_NOTE_SLIME: monsterAchId = AchievementId.DEFEAT_MONO_NOTE_SLIME; break;
          case MonsterId.CHORD_CRACKER: monsterAchId = AchievementId.DEFEAT_CHORD_CRACKER; break;
          case MonsterId.INTERVAL_IMP: monsterAchId = AchievementId.DEFEAT_INTERVAL_IMP; break;
          case MonsterId.RHYTHM_LORD: monsterAchId = AchievementId.DEFEAT_RHYTHM_LORD; break;
          case MonsterId.HARMONY_SIREN: monsterAchId = AchievementId.DEFEAT_HARMONY_SIREN; break;
      }
      if (monsterAchId && !currentAchievements.includes(monsterAchId)) {
        const achResult = unlockAchievementInternal(monsterAchId, updatedData);
        updatedData = achResult.updatedPlayerData; currentAchievements = updatedData.unlockedAchievementIds;
        if(achResult.notification) localNotifications.push(achResult.notification);
      }
      if (!currentAchievements.includes(AchievementId.DEFEAT_FIRST_MONSTER)) {
         const achResult = unlockAchievementInternal(AchievementId.DEFEAT_FIRST_MONSTER, updatedData);
         updatedData = achResult.updatedPlayerData; currentAchievements = updatedData.unlockedAchievementIds;
         if(achResult.notification) localNotifications.push(achResult.notification);
      }
      
      updatedData = updateMissionProgressInternal(MissionType.DEFEAT_MONSTER_COUNT, updatedData, 1, { monsterId: monsterId });
      updatedData = updateMissionProgressInternal(MissionType.START_MONSTER_BATTLE, updatedData, 1, { monsterId: monsterId }); // Assuming START_MONSTER_BATTLE means a completed battle
      updatedData = updateMissionProgressInternal(MissionType.EARN_GCOINS_TOTAL, updatedData, monsterDef.rewardGcoins, {gcoinsEarnedInThisEvent: monsterDef.rewardGcoins});


      localNotifications.forEach(addNotification);
      return { ...updatedData, unlockedAchievementIds: currentAchievements };
    });
  }, [setPlayerDataOptimistic, addNotification, checkAndApplyLevelUp, unlockAchievementInternal, collectQuestItemInternal, updateMissionProgressInternal, UI_TEXT_TH]);
  
  return {
    recordMonsterDefeat,
  };
};
