


import React, { useState, useEffect, useCallback } from 'react';
import {
    PlayerData, Achievement, AchievementId, NotificationMessage, GameMode, ThaiUIText, UnlockedItemType,
    InstrumentSoundId, ShopItem, PetId, AvatarStyle, QuestId, QuestStatusEnum, QuestItemId, ClothingId,
    ClothingLayer, ClothingItem, MonsterId, MissionType, FurnitureId, ActiveQuest, PlayerAppearance,
    MissionId, MissionRewardType, NPCId, RelationshipData, PracticeNookResult, ActivePet, MementoId, GiftResult, PetDefinition, RelationshipStatus, ShopItemId, UsePlayerDataReturn, PetAbilityType, ChildData, FamilyActivityId
} from '../types';
import {
    INITIAL_PLAYER_DATA as BASE_INITIAL_PLAYER_DATA, INITIAL_ACHIEVEMENTS, UI_TEXT_TH, DAILY_LOGIN_REWARD,
    HOUSE_BENEFITS_PER_LEVEL, LEVEL_THRESHOLDS, SHOP_ITEMS, PET_DEFINITIONS, MAX_PET_HUNGER, ALL_CLOTHING_ITEMS, ALL_MEMENTOS, ALL_INTERVALS, ALL_CHORDS, FINAL_BOSS_REWARD_GCOINS, FINAL_BOSS_REWARD_XP
} from '../constants';

// Specialized Hooks
import { useRelationshipSystem, RelationshipSystemReturn } from './useRelationshipSystem';
import { useHouseSystem, UseHouseSystemReturn } from './useHouseSystem';
import { useTrainingSystem, TrainingSystemReturn } from './useTrainingSystem';
import { useMonsterSystem, MonsterSystemReturn } from './useMonsterSystem';
import { useMissionSystem, MissionSystemReturn, MissionTargetDetails as MissionSystemTargetDetails } from './useMissionSystem';
import { useQuestSystem, QuestSystemReturn } from './useQuestSystem';
import { usePetSystem, PetSystemReturn, getCurrentPetAbilityMultiplier } from './usePetSystem';
import { useFamilySystem, FamilySystemReturn } from './useFamilySystem';
import { useSideJobSystem, SideJobSystemReturn } from './useSideJobSystem';
import { useFamilyActivitySystem, FamilyActivitySystemReturn } from './useFamilyActivitySystem'; 

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

const getInitialPlayerData = (): PlayerData => deepClone({
    ...BASE_INITIAL_PLAYER_DATA,
    isGoldenEarGod: false,
});


export const usePlayerData = (): UsePlayerDataReturn => {
  const [playerDataState, setPlayerDataState] = useState<PlayerData | null>(null);
  const [currentViewForNavigation, setCurrentViewForNavigation] = useState<any>(null);

  const navigateTo = (view: any): void => {
    setCurrentViewForNavigation(view);
  };


  const dismissNotification = useCallback((id: string) => {
    setNotificationsState(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<NotificationMessage, 'id'>): void => {
    const newNotificationWithRandomId = { ...notification, id: Date.now().toString() + Math.random().toString() };

    setNotificationsState(prevNotifications => {
      if (notification.type === 'achievement' && notification.achievementId) {
        // Check if a notification for this specific achievementId already exists in the current queue
        if (prevNotifications.some(n => n.type === 'achievement' && n.achievementId === notification.achievementId)) {
          return prevNotifications; // Don't add duplicate
        }
      }
      return [newNotificationWithRandomId, ...prevNotifications.slice(0, 4)];
    });

    setTimeout(() => dismissNotification(newNotificationWithRandomId.id), 10000);
  }, [dismissNotification]);

  const unlockAchievementInternal = useCallback((achievementId: AchievementId, currentPlayerData: PlayerData): { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> } => {
    if (!currentPlayerData.unlockedAchievementIds.includes(achievementId)) {
        const achInfo = INITIAL_ACHIEVEMENTS.find(a => a.id === achievementId);
        const notificationPayload: Omit<NotificationMessage, 'id'> | undefined = achInfo ? {
            type: 'achievement',
            titleKey: 'achievementUnlocked',
            itemName: UI_TEXT_TH[achInfo.nameKey] || achievementId.toString(),
            achievementId: achievementId 
        } : undefined;
        return {
            updatedPlayerData: {
                ...currentPlayerData,
                unlockedAchievementIds: [...currentPlayerData.unlockedAchievementIds, achievementId]
            },
            notification: notificationPayload
        };
    }
    return { updatedPlayerData: currentPlayerData };
  }, [UI_TEXT_TH]); 

  const checkAndApplyLevelUp = useCallback((currentXp: number, currentLevel: number, currentPlayerData: PlayerData): { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> } => {
    let newLevel = currentLevel;
    let leveledUp = false;
    let notification: Omit<NotificationMessage, 'id'> | undefined = undefined;
    let updatedAchievements = [...currentPlayerData.unlockedAchievementIds];

    while (newLevel < LEVEL_THRESHOLDS.length && currentXp >= LEVEL_THRESHOLDS[newLevel]) {
        newLevel++;
        leveledUp = true;
    }
    if (leveledUp) {
        notification = { type: 'levelUp', titleKey: 'levelUp', amount: newLevel };
        const tempPlayerDataForAch = {...currentPlayerData, level: newLevel, unlockedAchievementIds: updatedAchievements};

        if (newLevel >= 5 && !updatedAchievements.includes(AchievementId.REACH_LEVEL_5)) {
             const achResult = unlockAchievementInternal(AchievementId.REACH_LEVEL_5, tempPlayerDataForAch);
             updatedAchievements = achResult.updatedPlayerData.unlockedAchievementIds;
             if(achResult.notification) addNotification(achResult.notification);
        }
        if (newLevel >= 10 && !updatedAchievements.includes(AchievementId.REACH_LEVEL_10)) {
             const achResult = unlockAchievementInternal(AchievementId.REACH_LEVEL_10, tempPlayerDataForAch);
             updatedAchievements = achResult.updatedPlayerData.unlockedAchievementIds;
             if(achResult.notification) addNotification(achResult.notification);
        }
         if (newLevel >= 15 && !updatedAchievements.includes(AchievementId.REACH_LEVEL_15)) {
             const achResult = unlockAchievementInternal(AchievementId.REACH_LEVEL_15, tempPlayerDataForAch);
             updatedAchievements = achResult.updatedPlayerData.unlockedAchievementIds;
             if(achResult.notification) addNotification(achResult.notification);
        }
    }
    return { updatedPlayerData: {...currentPlayerData, level: newLevel, unlockedAchievementIds: updatedAchievements}, notification };
  }, [unlockAchievementInternal, addNotification]);

  const updateHighestStreakInternal = useCallback((streak: number, gameMode: GameMode, currentPlayerData: PlayerData): PlayerData => {
    let updatedData = { ...currentPlayerData };
    if (gameMode === GameMode.MELODY_RECALL) {
        if (streak > (updatedData.melodyRecallHighestStreak || 0)) {
            updatedData.melodyRecallHighestStreak = streak;
        }
    } else {
        if (streak > (updatedData.highestStreak || 0)) {
            updatedData.highestStreak = streak;
        }
    }
    return updatedData;
  }, []);

  const updatePlayerGCoins = useCallback((amountChange: number) => {
    setPlayerDataState(prev => {
      if (!prev) return null;
      return { ...prev, gCoins: prev.gCoins + amountChange };
    });
  }, [setPlayerDataState]);

  const missionSystem = useMissionSystem({
    setPlayerDataOptimistic: setPlayerDataState,
    addNotification,
    unlockAchievementInternal,
    checkAndApplyLevelUp,
    increasePetFoodCountDelegate: (amount: number) => {
        if (petSystem) petSystem.increasePetFoodCount(amount);
    },
    addPetXPDelegate: (petId: PetId, xpAmount: number) => {
        if (petSystem) return petSystem.addPetXP(petId, xpAmount);
        return { updatedPet: {} as ActivePet, notifications: [], newUnlockedAchievements: [] };
    }
  });

  // Adapter function for mission progress updates
  const adaptMissionProgressUpdater = useCallback((
    missionType: MissionType,
    currentPlayerData: PlayerData, 
    valueIncrement?: number,
    targetDetails?: MissionSystemTargetDetails
  ): PlayerData => {
    // missionSystem.updateMissionProgress expects currentPlayerData as the last argument
    return missionSystem.updateMissionProgress(
        missionType,
        valueIncrement,
        targetDetails,
        currentPlayerData 
    );
  }, [missionSystem]);


  const questSystem = useQuestSystem({
    initialActiveQuests: playerDataState?.activeQuests || [],
    initialInventory: playerDataState?.inventory || [],
    playerLevel: playerDataState?.level || 1,
    playerDefeatedMonsterIds: playerDataState?.defeatedMonsterIds || [],
    addNotification,
    unlockAchievementInternal,
    updatePlayerDataOptimistic: setPlayerDataState,
  });

  const petSystem = usePetSystem({
      initialPetsState: playerDataState || getInitialPlayerData(),
      gCoins: playerDataState?.gCoins ?? 0,
      setPlayerDataOptimistic: setPlayerDataState,
      addNotification,
      unlockAchievement: unlockAchievementInternal,
      playerUnlockedMusicalItems: playerDataState?.unlockedMusicalItemIds || [],
      playerLevel: playerDataState?.level || 1,
      getActivePlayerAbilityMultiplier: (abilityType) => 1, 
      getHouseBenefits: () => {
          const benefits = playerDataState ? HOUSE_BENEFITS_PER_LEVEL[playerDataState.houseLevel] || HOUSE_BENEFITS_PER_LEVEL[0] : HOUSE_BENEFITS_PER_LEVEL[0];
          const comfyBedBonus = playerDataState?.ownedFurnitureIds.includes(FurnitureId.COMFY_PET_BED) ? 5 : 0;
          return { ...benefits, furnitureBonuses: { comfyPetBedHappinessBoost: comfyBedBonus } };
      },
      updateMissionProgress: (missionType, valueIncrement, targetDetails, currentPlayerData) => {
        if (currentPlayerData) {
             return adaptMissionProgressUpdater(missionType, currentPlayerData, valueIncrement, targetDetails);
        }
        let dataToPass: PlayerData | undefined;
        setPlayerDataState(prev => { dataToPass = prev || undefined; return prev;});
        if (dataToPass) {
             return adaptMissionProgressUpdater(missionType, dataToPass, valueIncrement, targetDetails);
        }
        return {} as PlayerData;
      }
  });

  const relationshipSystem = useRelationshipSystem({
    initialPlayerData: playerDataState || getInitialPlayerData(),
    setPlayerDataOptimistic: setPlayerDataState,
    addNotification,
    unlockAchievementInternal,
    uiText: UI_TEXT_TH,
    updateMissionProgressForGifting: (missionType, currentPlayerData, valueIncrement, targetDetails) => {
        return missionSystem.updateMissionProgress(missionType, valueIncrement, targetDetails, currentPlayerData);
    },
  });

  const trainingSystem = useTrainingSystem({
    setPlayerDataOptimistic: setPlayerDataState,
    addNotification,
    checkAndApplyLevelUp,
    unlockAchievementInternal,
    updateHighestStreakInternal,
    handlePetXPForCorrectAnswerInternal: (currentActivePetId, currentPets, currentPlayerData) => {
       return petSystem.handlePetXPForCorrectAnswer(currentActivePetId, currentPets, currentPlayerData);
    },
    updateMissionProgressInternal: adaptMissionProgressUpdater
  });

  const monsterSystem = useMonsterSystem({
    setPlayerDataOptimistic: setPlayerDataState,
    addNotification,
    checkAndApplyLevelUp,
    unlockAchievementInternal,
    collectQuestItemInternal: (itemId, quantity, currentPlayerData) => {
        questSystem.collectQuestItem(itemId, quantity); 
        return currentPlayerData; 
    },
    updateMissionProgressInternal: adaptMissionProgressUpdater
  });

  const houseSystem = useHouseSystem({
    playerData: playerDataState || getInitialPlayerData(),
    setPlayerDataOptimistic: setPlayerDataState,
    addNotification,
    checkAndApplyLevelUp,
    addPetXPForPracticeNook: (petId, xpAmount, currentPlayerData) => {
        const result = petSystem.addPetXP(petId, xpAmount);
        return { ...result, updatedPlayerData: { ...currentPlayerData, pets: result.updatedPet ? { ...currentPlayerData.pets, [petId]: result.updatedPet } : currentPlayerData.pets } };
    },
    unlockAchievementInternal,
    updateMissionProgressInternal: adaptMissionProgressUpdater,
  });

  const familySystem = useFamilySystem({
    playerData: playerDataState || getInitialPlayerData(),
    setPlayerDataOptimistic: setPlayerDataState,
    addNotification,
    unlockAchievementInternal,
    navigateToChildNaming: () => navigateTo('CHILD_NAMING_PAGE' as any),
  });

  const sideJobSystem = useSideJobSystem({
    playerData: playerDataState || getInitialPlayerData(),
    setPlayerDataOptimistic: setPlayerDataState,
    addNotification,
    updateMissionProgress: (missionType, valueIncrement, targetDetails, currentPlayerData) => {
        return missionSystem.updateMissionProgress(missionType, valueIncrement, targetDetails, currentPlayerData);
    }
  });

  const familyActivitySystem = useFamilyActivitySystem({ 
    playerData: playerDataState || getInitialPlayerData(),
    setPlayerDataOptimistic: setPlayerDataState,
    addNotification,
    updatePlayerGCoins,
  });


   useEffect(() => {
    const savedData = localStorage.getItem('playerData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData) as PlayerData;
        const baseInitial = getInitialPlayerData(); // Get a fresh base
        const mergedData: PlayerData = {
          ...baseInitial, // Start with a fresh structure
          ...parsedData, // Override with saved data
          // Deep merge specific potentially problematic nested objects
          appearance: { ...baseInitial.appearance, ...(parsedData.appearance || {}) },
          relationships: baseInitial.relationships.map(initialRel => {
            const savedRel = parsedData.relationships?.find(r => r.npcId === initialRel.npcId);
            return {
              ...initialRel,
              ...(savedRel || {}),
              eventFlags: { ...(initialRel.eventFlags || {}), ...(savedRel?.eventFlags || {}) },
              viewedEventFlags: { ...(initialRel.viewedEventFlags || {}), ...(savedRel?.viewedEventFlags || {}) }
            };
          }),
          pets: { ...baseInitial.pets, ...(parsedData.pets || {})},
          activeQuests: parsedData.activeQuests || baseInitial.activeQuests,
          inventory: parsedData.inventory || baseInitial.inventory,
          activeMissions: parsedData.activeMissions || baseInitial.activeMissions,
          // Ensure all boolean/nullable fields from INITIAL_PLAYER_DATA are present even if not in savedData
          heartNoteLocketOwned: parsedData.heartNoteLocketOwned || false,
          weddingRingOwned: parsedData.weddingRingOwned || false,
          isMarried: parsedData.isMarried || false,
          spouseId: parsedData.spouseId || null,
          marriageHappiness: parsedData.marriageHappiness || 0,
          lastSpouseInteractionDate: parsedData.lastSpouseInteractionDate || 0,
          babyCribOwned: parsedData.babyCribOwned || false,
          childData: parsedData.childData || null,
          lastChildCareInteractionTimestamp: parsedData.lastChildCareInteractionTimestamp || 0,
          milkPowderCount: parsedData.milkPowderCount || 0,
          babyFoodCount: parsedData.babyFoodCount || 0,
          diapersCount: parsedData.diapersCount || 0,
          childCareKitCount: parsedData.childCareKitCount || 0,
          sideJobCooldowns: { ...baseInitial.sideJobCooldowns, ...(parsedData.sideJobCooldowns || {}) },
          familyActivityCooldowns: { ...baseInitial.familyActivityCooldowns, ...(parsedData.familyActivityCooldowns || {}) },
          lastFamilyActivityDate: parsedData.lastFamilyActivityDate || null,
          isGoldenEarGod: parsedData.isGoldenEarGod || false,
        };
        setPlayerDataState(mergedData);
      } catch (error) {
        console.error("Failed to parse player data from localStorage:", error);
        setPlayerDataState(getInitialPlayerData());
      }
    } else {
      setPlayerDataState(getInitialPlayerData());
    }
  }, []);

  useEffect(() => {
    if (playerDataState) {
      localStorage.setItem('playerData', JSON.stringify(playerDataState));
    }
  }, [playerDataState]);

  const getAchievementDetails = useCallback((id: AchievementId) => INITIAL_ACHIEVEMENTS.find(ach => ach.id === id), []);

  const checkForDailyLoginReward = useCallback(() => {
    let isNewDayForProcessing = false;
    setPlayerDataState(prev => {
      if (!prev) return null;
      const today = new Date().toDateString();
      if (prev.lastLoginDate !== today) {
        isNewDayForProcessing = true;
        const houseBenefits = HOUSE_BENEFITS_PER_LEVEL[prev.houseLevel] || HOUSE_BENEFITS_PER_LEVEL[0];
        const baseReward = DAILY_LOGIN_REWARD;
        const houseBonus = houseBenefits.dailyLoginBonusGCoins;
        const totalReward = baseReward + houseBonus;

        addNotification({
          type: 'dailyReward',
          titleKey: 'dailyRewardTitle',
          messageKey: houseBonus > 0 ? 'dailyRewardHouseBonusMessage' : 'dailyRewardMessage',
          amount: baseReward, 
          baseAmount: baseReward,
          houseBonusAmount: houseBonus
        });

        const petLoginResult = petSystem.handlePetDailyLogin(prev.activePetId, prev.pets, prev);
        
        return { ...petLoginResult.updatedPlayerData, gCoins: petLoginResult.updatedPlayerData.gCoins + totalReward, lastLoginDate: today };
      }
      return prev;
    });
    relationshipSystem.handleDailyRelationshipUpdates(isNewDayForProcessing);
  }, [addNotification, relationshipSystem, petSystem, familySystem]);


  const purchaseShopItem = useCallback((item: ShopItem) => {
    let result : { success: boolean, messageKey?: keyof ThaiUIText, itemName?: string } = { success: false, messageKey: 'genericError' };
    setPlayerDataState(prev => {
        if (!prev) return prev;
        if (prev.gCoins < item.cost) {
          result = { success: false, messageKey: 'notEnoughGCoins' };
          return prev;
        }

        let updatedData = { ...prev, gCoins: prev.gCoins - item.cost };
        let itemSuccessfullyProcessed = false;

        if (item.type === UnlockedItemType.KEY_ITEM) {
            if (item.id === ShopItemId.HEART_NOTE_LOCKET) updatedData.heartNoteLocketOwned = true;
            else if (item.id === ShopItemId.WEDDING_RING) updatedData.weddingRingOwned = true;
            else if (item.id === ShopItemId.BABY_CRIB) updatedData.babyCribOwned = true;
            else if (item.id === ShopItemId.BIRTHDAY_CAKE) { /* No specific flag, it's consumed on use */ }
            itemSuccessfullyProcessed = true;
        } else if (item.type === UnlockedItemType.CHILD_CARE) {
            if (item.id === ShopItemId.MILK_POWDER) updatedData.milkPowderCount = (updatedData.milkPowderCount || 0) + 1;
            else if (item.id === ShopItemId.BABY_FOOD) updatedData.babyFoodCount = (updatedData.babyFoodCount || 0) + 1;
            else if (item.id === ShopItemId.DIAPERS) updatedData.diapersCount = (updatedData.diapersCount || 0) + 1;
            else if (item.id === ShopItemId.CHILD_CARE_KIT) updatedData.childCareKitCount = (updatedData.childCareKitCount || 0) + 1;
            itemSuccessfullyProcessed = true;
        } else if (item.type === UnlockedItemType.INSTRUMENT_SOUND || item.type === UnlockedItemType.PET_CUSTOMIZATION || item.type === UnlockedItemType.CLOTHING) {
          if (!updatedData.purchasedShopItemIds.some(psi => psi.id === item.id && psi.type === item.type)) {
              updatedData.purchasedShopItemIds = [...updatedData.purchasedShopItemIds, { type: item.type as UnlockedItemType.INSTRUMENT_SOUND | UnlockedItemType.AVATAR_ITEM | UnlockedItemType.PET_FOOD | UnlockedItemType.PET_CUSTOMIZATION | UnlockedItemType.FURNITURE | UnlockedItemType.CLOTHING | UnlockedItemType.KEY_ITEM | UnlockedItemType.CHILD_CARE | UnlockedItemType.GENERAL_GIFT, id: item.id }];
          }
          if (item.type === UnlockedItemType.CLOTHING && !updatedData.unlockedAchievementIds.includes(AchievementId.CLOTHING_PURCHASED_FIRST)) {
              const achResult = unlockAchievementInternal(AchievementId.CLOTHING_PURCHASED_FIRST, updatedData);
              updatedData = achResult.updatedPlayerData;
              if (achResult.notification) addNotification(achResult.notification);
          }
          itemSuccessfullyProcessed = true;
        } else if (item.type === UnlockedItemType.PET_FOOD) {
          updatedData.petFoodCount = (updatedData.petFoodCount || 0) + (item.data?.quantity || 1);
          itemSuccessfullyProcessed = true;
        } else if (item.type === UnlockedItemType.FURNITURE && !updatedData.ownedFurnitureIds.includes(item.id as FurnitureId)) {
          updatedData.ownedFurnitureIds = [...updatedData.ownedFurnitureIds, item.id as FurnitureId];
          if (!updatedData.unlockedAchievementIds.includes(AchievementId.PURCHASE_FIRST_FURNITURE)) {
            const achResult = unlockAchievementInternal(AchievementId.PURCHASE_FIRST_FURNITURE, updatedData);
            updatedData = achResult.updatedPlayerData;
            if (achResult.notification) addNotification(achResult.notification);
          }
          itemSuccessfullyProcessed = true;
        } else if (item.type === UnlockedItemType.GENERAL_GIFT) {
            itemSuccessfullyProcessed = true;
        }

        if (itemSuccessfullyProcessed) {
          result = { success: true, messageKey: 'itemPurchasedSuccess', itemName: UI_TEXT_TH[item.nameKey] || item.id };
          if (!updatedData.unlockedAchievementIds.includes(AchievementId.PURCHASE_FIRST_SHOP_ITEM) &&
              item.type !== UnlockedItemType.PET_FOOD && item.type !== UnlockedItemType.CHILD_CARE && item.type !== UnlockedItemType.GENERAL_GIFT) { 
            const achResult = unlockAchievementInternal(AchievementId.PURCHASE_FIRST_SHOP_ITEM, updatedData);
            updatedData = achResult.updatedPlayerData;
            if (achResult.notification) addNotification(achResult.notification);
          }
          if (item.type !== UnlockedItemType.GENERAL_GIFT) {
             updatedData = missionSystem.updateMissionProgress(MissionType.EARN_GCOINS_TOTAL, undefined, { gcoinsEarnedInThisEvent: -item.cost }, updatedData);
          }
        }
        return updatedData;
    });
    return result;
  }, [setPlayerDataState, addNotification, unlockAchievementInternal, missionSystem, UI_TEXT_TH]);

  const isShopItemPurchased = useCallback((itemId: string, itemType: UnlockedItemType): boolean => {
    if (!playerDataState) return false;
    if (itemType === UnlockedItemType.KEY_ITEM) {
        if (itemId === ShopItemId.HEART_NOTE_LOCKET) return playerDataState.heartNoteLocketOwned;
        if (itemId === ShopItemId.WEDDING_RING) return playerDataState.weddingRingOwned;
        if (itemId === ShopItemId.BABY_CRIB) return playerDataState.babyCribOwned;
    }
    if (itemType === UnlockedItemType.FURNITURE) {
        return playerDataState.ownedFurnitureIds.includes(itemId as FurnitureId);
    }
    if (itemType === UnlockedItemType.GENERAL_GIFT || itemType === UnlockedItemType.CHILD_CARE || itemType === UnlockedItemType.PET_FOOD) {
        return false;
    }
    return playerDataState.purchasedShopItemIds.some(psi => psi.id === itemId && psi.type === itemType);
  }, [playerDataState]);

  const isMusicalItemUnlocked = useCallback((itemId: string, itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD): boolean => {
    if (!playerDataState) return false;
    return playerDataState.unlockedMusicalItemIds.some(item => item.id === itemId && item.type === itemType);
  }, [playerDataState]);

  const unlockMusicalItem = useCallback((itemId: string, itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD, cost: number): boolean => {
    if (!playerDataState) return false;
    if (playerDataState.gCoins < cost) {
      addNotification({type: 'info', titleKey: 'notEnoughGCoins'});
      return false;
    }
    if (isMusicalItemUnlocked(itemId, itemType)) return true; 

    setPlayerDataState(prev => {
      if (!prev) return prev;
      let updatedData = {
        ...prev,
        gCoins: prev.gCoins - cost,
        unlockedMusicalItemIds: [...prev.unlockedMusicalItemIds, { type: itemType, id: itemId }]
      };
      if (!updatedData.unlockedAchievementIds.includes(AchievementId.UNLOCK_FIRST_ADVANCED_ITEM)) {
        const achResult = unlockAchievementInternal(AchievementId.UNLOCK_FIRST_ADVANCED_ITEM, updatedData);
        updatedData = achResult.updatedPlayerData;
        if(achResult.notification) addNotification(achResult.notification);
      }
      updatedData = missionSystem.updateMissionProgress(MissionType.EARN_GCOINS_TOTAL, undefined, { gcoinsEarnedInThisEvent: -cost }, updatedData);
      return updatedData;
    });
    return true;
  }, [playerDataState, addNotification, unlockAchievementInternal, missionSystem, isMusicalItemUnlocked]); 

  const setPlayerName = useCallback((name: string) => {
    setPlayerDataState(prev => prev ? { ...prev, playerName: name } : null);
  }, []);

  const saveGameExplicitly = useCallback(() => {
    if (playerDataState) {
      localStorage.setItem('playerData', JSON.stringify(playerDataState));
      addNotification({ type: 'info', titleKey: 'saveGameSuccessMessage' });
    }
  }, [playerDataState, addNotification]);

  const resetGame = useCallback(() => {
    localStorage.removeItem('playerData');
    setPlayerDataState(getInitialPlayerData());
    addNotification({ type: 'info', titleKey: 'gameResetSuccessMessage' });
  }, [addNotification]);

  const selectInstrumentSound = useCallback((soundId: InstrumentSoundId) => {
    setPlayerDataState(prev => prev ? { ...prev, selectedInstrumentSoundId: soundId } : null);
  }, []);

  const toggleHighlightPianoOnPlay = useCallback(() => {
    setPlayerDataState(prev => prev ? { ...prev, highlightPianoOnPlay: !prev.highlightPianoOnPlay } : null);
  }, []);

  const setAvatarStyle = useCallback((style: AvatarStyle) => {
    setPlayerDataState(prev => prev ? { ...prev, avatarStyle: style } : null);
  }, []);

  const setPlayerAppearance = useCallback((newAppearance: Partial<PlayerAppearance>) => {
    setPlayerDataState(prev => {
        if (!prev) return null;
        let updatedData = {
            ...prev,
            appearance: { ...prev.appearance, ...newAppearance }
        };
        if(!updatedData.unlockedAchievementIds.includes(AchievementId.AVATAR_FIRST_CUSTOMIZATION)){
            const achResult = unlockAchievementInternal(AchievementId.AVATAR_FIRST_CUSTOMIZATION, updatedData);
            updatedData = achResult.updatedPlayerData;
            if(achResult.notification) addNotification(achResult.notification);
        }
        return updatedData;
    });
  }, [unlockAchievementInternal, addNotification]);

  const equipClothingItem = useCallback((clothingId: ClothingId | undefined, layer: ClothingLayer) => {
    setPlayerDataState(prev => {
        if (!prev) return null;
        let updatedAppearance = { ...prev.appearance };
        if (layer === ClothingLayer.SHIRT) {
            updatedAppearance.equippedShirt = clothingId;
        }

        let updatedData = { ...prev, appearance: updatedAppearance };
        if (clothingId && !updatedData.unlockedAchievementIds.includes(AchievementId.CLOTHING_EQUIPPED_FIRST)) {
            const achResult = unlockAchievementInternal(AchievementId.CLOTHING_EQUIPPED_FIRST, updatedData);
            updatedData = achResult.updatedPlayerData;
            if (achResult.notification) addNotification(achResult.notification);
        }
        const clothingItem = clothingId ? ALL_CLOTHING_ITEMS.find(c => c.id === clothingId) : undefined;
        if(clothingItem){
            addNotification({ type: 'clothing', titleKey: 'clothingEquippedMessage', itemName: UI_TEXT_TH[clothingItem.nameKey]});
        } else if (!clothingId && layer === ClothingLayer.SHIRT && prev.appearance.equippedShirt){
             const prevClothingItem = ALL_CLOTHING_ITEMS.find(c => c.id === prev.appearance.equippedShirt);
             if(prevClothingItem) addNotification({ type: 'clothing', titleKey: 'clothingUnequippedMessage', itemName: UI_TEXT_TH[prevClothingItem.nameKey]});
        }
        return updatedData;
    });
  }, [unlockAchievementInternal, addNotification, UI_TEXT_TH]);

  const setGoldenEarGodStatusAndReward = useCallback(() => {
    setPlayerDataState(prev => {
      if (!prev || prev.isGoldenEarGod) return prev;
      let updatedData = { ...prev, 
        isGoldenEarGod: true,
        gCoins: prev.gCoins + FINAL_BOSS_REWARD_GCOINS,
        xp: prev.xp + FINAL_BOSS_REWARD_XP,
      };
      const localNotifications: Omit<NotificationMessage, 'id'>[] = [];
      
      localNotifications.push({type: 'info', titleKey: 'finalBoss_VictoryTitle', messageKey: 'finalBoss_VictoryMessage' });
      localNotifications.push({type: 'info', titleKey: 'appName', itemName: `ได้รับ ${FINAL_BOSS_REWARD_GCOINS} G-Coins!`});
      localNotifications.push({type: 'info', titleKey: 'appName', itemName: `ได้รับ ${FINAL_BOSS_REWARD_XP} XP!`});

      const levelUpResult = checkAndApplyLevelUp(updatedData.xp, updatedData.level, updatedData);
      updatedData = levelUpResult.updatedPlayerData;
      if (levelUpResult.notification) localNotifications.push(levelUpResult.notification);

      const achResult = unlockAchievementInternal(AchievementId.DEFEAT_FINAL_BOSS, updatedData);
      updatedData = achResult.updatedPlayerData;
      if (achResult.notification) localNotifications.push(achResult.notification);

      localNotifications.forEach(addNotification);
      return updatedData;
    });
  }, [setPlayerDataState, addNotification, unlockAchievementInternal, checkAndApplyLevelUp]);

  const [notificationsState, setNotificationsState] = useState<NotificationMessage[]>([]); // Moved from outside

  return {
    playerData: playerDataState,
    notifications: notificationsState,
    dismissNotification,
    achievements: playerDataState?.unlockedAchievementIds.map(id => INITIAL_ACHIEVEMENTS.find(ach => ach.id === id)).filter(Boolean) as Achievement[] || [],
    getAchievementDetails,
    addNotification,
    setPlayerName,
    saveGameExplicitly,
    resetGame,
    selectInstrumentSound,
    toggleHighlightPianoOnPlay,
    setAvatarStyle,
    setPlayerAppearance,
    equipClothingItem,
    purchaseShopItem,
    isShopItemPurchased,
    unlockMusicalItem,
    isMusicalItemUnlocked,
    checkForDailyLoginReward,
    setGoldenEarGodStatusAndReward,

    relationshipSystem,
    trainingSystem,
    monsterSystem,
    missionSystem,
    questSystem,
    petSystem,
    houseSystem,
    familySystem,
    sideJobSystem,
    familyActivitySystem, 

    interactWithNpc: relationshipSystem.interactWithNpc,
    giveGiftToNpc: relationshipSystem.giveGiftToNpc,
    confessToNpc: relationshipSystem.confessToNpc,
    proposeToNpc: relationshipSystem.proposeToNpc,
    markEventAsViewed: relationshipSystem.markEventAsViewed,
    goOnDate: relationshipSystem.goOnDate,

    addXpAndCoinsFromTraining: trainingSystem.addXpAndCoinsFromTraining,
    updateHighestStreak: trainingSystem.updateHighestStreak,

    recordMonsterDefeat: monsterSystem.recordMonsterDefeat,

    claimMissionReward: missionSystem.claimMissionReward,
    refreshMissions: missionSystem.refreshMissions,
    updateMissionProgress: missionSystem.updateMissionProgress,

    startQuest: questSystem.startQuest,
    progressQuest: questSystem.progressQuest,
    completeQuest: questSystem.completeQuest,
    getQuestStatus: questSystem.getQuestStatus,
    collectQuestItem: questSystem.collectQuestItem,

    adoptPet: petSystem.adoptPet,
    feedPet: petSystem.feedPet,
    playWithPet: petSystem.playWithPet,
    setActivePet: petSystem.setActivePet,
    applyPetCustomization: petSystem.applyPetCustomization,
    getActivePetAbilityMultiplier: (abilityType) => petSystem.getActivePetAbilityMultiplier(playerDataState?.activePetId || null, playerDataState?.pets || {}, abilityType),

    upgradeHouse: houseSystem.upgradeHouse,
    activatePracticeNook: houseSystem.activatePracticeNook,

    initiateChildEvent: familySystem.initiateChildEvent,
    setChildName: familySystem.setChildName,
    feedChild: familySystem.feedChild,
    playWithChild: familySystem.playWithChild,
    changeChildDiaper: familySystem.changeChildDiaper,
    handleChildDailyUpdate: familySystem.handleChildDailyUpdate,
    sootheChildToSleep: familySystem.sootheChildToSleep,
    useChildCareKit: familySystem.useChildCareKit,
    payTuition: familySystem.payTuition,
    helpWithHomework: familySystem.helpWithHomework,
    celebrateBirthday: familySystem.celebrateBirthday, 

    performBusking: sideJobSystem.performBusking,
    getBuskingCooldownTime: sideJobSystem.getBuskingCooldownTime,
    performFamilyActivity: familyActivitySystem.performFamilyActivity,
    getFamilyActivityCooldownTime: familyActivitySystem.getFamilyActivityCooldownTime,
  };
};
