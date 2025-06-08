

import { useState, useCallback, useEffect } from 'react';
import {
  PlayerData,
  ActiveQuest,
  QuestId,
  QuestDefinition,
  QuestStatusEnum, // Changed from QuestStatus
  QuestObjectiveType,
  NotificationMessage,
  UnlockedItemType,
  MonsterId,
  NPCId,
  AchievementId,
  ThaiUIText,
  QuestItemId,
  SongId
} from '../types';
import { QUEST_DEFINITIONS, getQuestDefinition, UI_TEXT_TH, getQuestTitle } from '../constants';

interface UseQuestSystemProps {
  initialActiveQuests: ActiveQuest[];
  initialInventory: PlayerData['inventory'];
  playerLevel: number;
  playerDefeatedMonsterIds: MonsterId[];
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  unlockAchievementInternal: (achievementId: AchievementId, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> };
  updatePlayerDataOptimistic: (updater: (prevData: PlayerData) => PlayerData) => void; 
}

export interface QuestSystemReturn {
  activeQuests: ActiveQuest[];
  inventory: PlayerData['inventory'];
  getQuestStatus: (questId: QuestId) => QuestStatusEnum; // Changed from QuestStatus
  startQuest: (questId: QuestId) => boolean;
  progressQuest: (questId: QuestId, objectiveIndexToComplete?: number, details?: { puzzleId?: string; itemId?: string | QuestItemId }) => boolean;
  completeQuest: (questId: QuestId) => boolean;
  collectQuestItem: (itemId: string | QuestItemId, quantity?: number) => void;
  getQuestSystemPlayerDataSnapshot: () => { activeQuests: ActiveQuest[], inventory: PlayerData['inventory'] };
}

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useQuestSystem = ({
  initialActiveQuests,
  initialInventory,
  playerLevel,
  playerDefeatedMonsterIds,
  addNotification,
  unlockAchievementInternal,
  updatePlayerDataOptimistic,
}: UseQuestSystemProps): QuestSystemReturn => {
  const [activeQuests, setActiveQuestsState] = useState<ActiveQuest[]>(initialActiveQuests);
  const [inventory, setInventoryState] = useState<PlayerData['inventory']>(initialInventory);

  const getQuestStatus = useCallback((questId: QuestId): QuestStatusEnum => { // Changed from QuestStatus
    const activeQuest = activeQuests.find(aq => aq.questId === questId);
    if (activeQuest) {
      return activeQuest.status;
    }
    const questDef = getQuestDefinition(questId);
    if (!questDef) return QuestStatusEnum.UNAVAILABLE; // Changed to QuestStatusEnum

    if (questDef.minPlayerLevel && playerLevel < questDef.minPlayerLevel) return QuestStatusEnum.UNAVAILABLE; // Changed to QuestStatusEnum
    if (questDef.prerequisiteQuestId) {
      const prereqQuest = activeQuests.find(aq => aq.questId === questDef.prerequisiteQuestId);
      if (!prereqQuest || prereqQuest.status !== QuestStatusEnum.CLAIMED) return QuestStatusEnum.UNAVAILABLE; // Changed to QuestStatusEnum
    }
    return QuestStatusEnum.AVAILABLE; // Changed to QuestStatusEnum
  }, [activeQuests, playerLevel]);

  const startQuest = useCallback((questId: QuestId): boolean => {
    let success = false;
    const status = getQuestStatus(questId);
    if (status !== QuestStatusEnum.AVAILABLE) return false; // Changed to QuestStatusEnum

    const questDef = getQuestDefinition(questId);
    if (!questDef) return false;

    success = true;
    const newActiveQuest: ActiveQuest = {
      questId,
      status: QuestStatusEnum.ACTIVE, // Changed to QuestStatusEnum
      currentObjectiveIndex: 0,
      objectiveProgress: questDef.objectives.map(() => ({ completed: false, currentProgress: 0 })),
    };
    
    setActiveQuestsState(prev => [...prev, newActiveQuest]);
    
    updatePlayerDataOptimistic(prevPlayerData => {
        let updatedData = {...prevPlayerData, activeQuests: [...prevPlayerData.activeQuests, newActiveQuest]};
        const achResult = unlockAchievementInternal(AchievementId.QUEST_ACCEPTED_FIRST, updatedData);
        updatedData = achResult.updatedPlayerData;
        if (achResult.notification) addNotification(achResult.notification);
        addNotification({ type: 'quest', titleKey: 'questStartedNotificationTitle', questName: getQuestTitle(questId, UI_TEXT_TH) });
        return updatedData;
    });
    
    return success;
  }, [getQuestStatus, updatePlayerDataOptimistic, unlockAchievementInternal, addNotification, UI_TEXT_TH]);

  const progressQuest = useCallback((questId: QuestId, objectiveIndexToComplete?: number, details?: { puzzleId?: string; itemId?: string | QuestItemId }): boolean => {
    let success = false;
    setActiveQuestsState(prevActiveQuests => {
      const activeQuestIndex = prevActiveQuests.findIndex(aq => aq.questId === questId && aq.status === QuestStatusEnum.ACTIVE); // Changed to QuestStatusEnum
      if (activeQuestIndex === -1) return prevActiveQuests;

      const updatedActiveQuests = deepClone(prevActiveQuests);
      const activeQuest = updatedActiveQuests[activeQuestIndex];
      const questDef = getQuestDefinition(questId);
      if (!questDef) return prevActiveQuests;

      const objIndexToProgress = objectiveIndexToComplete !== undefined ? objectiveIndexToComplete : activeQuest.currentObjectiveIndex;
      const objectiveDef = questDef.objectives[objIndexToProgress];

      if (!objectiveDef || activeQuest.objectiveProgress[objIndexToProgress].completed) return prevActiveQuests;

      let objectiveFulfilled = false;
      switch (objectiveDef.type) {
        case QuestObjectiveType.TALK_TO_NPC:
          if (details?.puzzleId === objectiveDef.targetId) objectiveFulfilled = true; 
          break;
        case QuestObjectiveType.COLLECT_ITEM:
          const itemInInventory = inventory.find(item => item.itemId === objectiveDef.targetId);
          if (itemInInventory && itemInInventory.quantity >= (objectiveDef.targetCount || 1)) {
            objectiveFulfilled = true;
          }
          break;
        case QuestObjectiveType.DEFEAT_MONSTER:
          if (playerDefeatedMonsterIds.includes(objectiveDef.targetId as MonsterId)) {
            objectiveFulfilled = true;
          }
          break;
        case QuestObjectiveType.FEED_PET_ITEM:
             if (details?.itemId === objectiveDef.targetId) { 
                objectiveFulfilled = true;
             }
            break;
        case QuestObjectiveType.SOLVE_PUZZLE:
          if (details?.puzzleId === objectiveDef.targetId) objectiveFulfilled = true;
          break;
      }

      if (objectiveFulfilled) {
        activeQuest.objectiveProgress[objIndexToProgress].completed = true;
        success = true;
        addNotification({ type: 'quest', titleKey: 'questObjectiveCompletedNotificationTitle', questName: getQuestTitle(questId, UI_TEXT_TH) });

        const allObjectivesComplete = activeQuest.objectiveProgress.every(obj => obj.completed);
        if (allObjectivesComplete) {
          activeQuest.status = QuestStatusEnum.COMPLETED; // Changed to QuestStatusEnum
          addNotification({ type: 'quest', titleKey: 'questCompletedNotificationTitle', questName: getQuestTitle(questId, UI_TEXT_TH) });
        } else {
          activeQuest.currentObjectiveIndex = activeQuest.objectiveProgress.findIndex(obj => !obj.completed);
          if (activeQuest.currentObjectiveIndex === -1) activeQuest.currentObjectiveIndex = questDef.objectives.length -1; 
        }
        
        updatePlayerDataOptimistic(prevPlayerData => ({...prevPlayerData, activeQuests: updatedActiveQuests}));
        return updatedActiveQuests;
      }
      return prevActiveQuests;
    });
    return success;
  }, [inventory, playerDefeatedMonsterIds, addNotification, updatePlayerDataOptimistic, UI_TEXT_TH]);


  const completeQuest = useCallback((questId: QuestId): boolean => {
    let success = false;
     setActiveQuestsState(prevActiveQuests => {
        const activeQuestIndex = prevActiveQuests.findIndex(aq => aq.questId === questId && aq.status === QuestStatusEnum.COMPLETED); // Changed to QuestStatusEnum
        if (activeQuestIndex === -1) return prevActiveQuests;

        const updatedActiveQuests = deepClone(prevActiveQuests);
        const activeQuest = updatedActiveQuests[activeQuestIndex];
        const questDef = getQuestDefinition(questId);
        if (!questDef) return prevActiveQuests;

        success = true;
        activeQuest.status = QuestStatusEnum.CLAIMED; // Changed to QuestStatusEnum
        
        updatePlayerDataOptimistic(prevPlayerData => {
            let updatedData = {...prevPlayerData, activeQuests: updatedActiveQuests};
            
            questDef.rewards.forEach(reward => {
                if (reward.type === 'gcoins') updatedData.gCoins = (updatedData.gCoins || 0) + (reward.amount || 0);
                if (reward.type === 'xp') updatedData.xp = (updatedData.xp || 0) + (reward.amount || 0); 
                if (reward.type === 'item' && reward.itemId) {
                    const itemKey = `item_${(reward.itemId as string).replace('_ITEM_ID', '').replace('_ITEM', '')}_NAME` as keyof ThaiUIText;
                    addNotification({ type: 'info', titleKey: 'appName', itemName: `ได้รับไอเทม: ${UI_TEXT_TH[itemKey] || reward.itemId}` });
                }
                if (reward.type === 'song' && reward.songId && !updatedData.unlockedSongIds.includes(reward.songId)) {
                    updatedData.unlockedSongIds = [...updatedData.unlockedSongIds, reward.songId];
                     const songKey = `song_${reward.songId.replace('_SONG', '')}_NAME` as keyof ThaiUIText;
                    addNotification({ type: 'info', titleKey: 'appName', itemName: `เรียนรู้เพลงใหม่: ${UI_TEXT_TH[songKey] || reward.songId}` });
                }
                 if (reward.type === 'pet_food' && reward.amount) { 
                    updatedData.petFoodCount = (updatedData.petFoodCount || 0) + reward.amount;
                 }
                 if (reward.type === 'pet_xp' && reward.amount && updatedData.activePetId && updatedData.pets[updatedData.activePetId]) {
                     updatedData.pets[updatedData.activePetId].xp += reward.amount; 
                 }
            });
            
            addNotification({ type: 'quest', titleKey: 'questRewardClaimedNotificationTitle', questName: getQuestTitle(questId, UI_TEXT_TH) });
            const achResult = unlockAchievementInternal(AchievementId.QUEST_COMPLETED_FIRST, updatedData);
            updatedData = achResult.updatedPlayerData;
            if (achResult.notification) addNotification(achResult.notification);
            return updatedData;
        });
        return updatedActiveQuests;
    });
    return success;
  }, [updatePlayerDataOptimistic, addNotification, unlockAchievementInternal, UI_TEXT_TH]);

  const collectQuestItem = useCallback((itemId: string | QuestItemId, quantity: number = 1) => {
    setInventoryState(prevInventory => {
      const updatedInventory = deepClone(prevInventory);
      const existingItemIndex = updatedInventory.findIndex(invItem => invItem.itemId === itemId);
      if (existingItemIndex > -1) {
        updatedInventory[existingItemIndex].quantity += quantity;
      } else {
        updatedInventory.push({ itemId, quantity, type: UnlockedItemType.QUEST_ITEM });
      }
      
      activeQuests.forEach(activeQuest => {
          if(activeQuest.status === QuestStatusEnum.ACTIVE) { // Changed to QuestStatusEnum
              const questDef = getQuestDefinition(activeQuest.questId);
              if(questDef){
                  const currentObjectiveDef = questDef.objectives[activeQuest.currentObjectiveIndex];
                  if(currentObjectiveDef?.type === QuestObjectiveType.COLLECT_ITEM && currentObjectiveDef.targetId === itemId){
                       const itemInNewInventory = updatedInventory.find(inv => inv.itemId === itemId);
                       const currentCollected = itemInNewInventory ? itemInNewInventory.quantity : 0;
                       if(currentCollected >= (currentObjectiveDef.targetCount || 1) && !activeQuest.objectiveProgress[activeQuest.currentObjectiveIndex].completed){
                            progressQuest(activeQuest.questId, activeQuest.currentObjectiveIndex, {itemId});
                       }
                  }
              }
          }
      });
      
      updatePlayerDataOptimistic(prevPlayerData => ({...prevPlayerData, inventory: updatedInventory}));
      
      let itemNameForNotif = itemId as string;
      const itemKey = `item_${(itemId as string).replace('_ITEM_ID', '').replace('_ITEM', '')}_NAME` as keyof ThaiUIText;
      if(UI_TEXT_TH[itemKey]) itemNameForNotif = UI_TEXT_TH[itemKey];
      addNotification({ type: 'info', titleKey: 'appName', messageKey: undefined, itemName: `ได้รับ: ${itemNameForNotif} x${quantity}`});

      return updatedInventory;
    });
  }, [addNotification, updatePlayerDataOptimistic, UI_TEXT_TH, activeQuests, progressQuest]);


  useEffect(() => {
    setActiveQuestsState(initialActiveQuests);
  }, [initialActiveQuests]);

  useEffect(() => {
    setInventoryState(initialInventory);
  }, [initialInventory]);

  const getQuestSystemPlayerDataSnapshot = useCallback(() => {
    return {
        activeQuests: activeQuests,
        inventory: inventory,
    }
  }, [activeQuests, inventory]);


  return {
    activeQuests,
    inventory,
    getQuestStatus,
    startQuest,
    progressQuest,
    completeQuest,
    collectQuestItem,
    getQuestSystemPlayerDataSnapshot
  };
};