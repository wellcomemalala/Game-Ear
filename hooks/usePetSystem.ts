

import { useState, useCallback, useEffect } from 'react';
import {
  PetId, ActivePet, PetDefinition, PetCustomization, PetSpecialRequest, PlayerData,
  NotificationMessage, AchievementId, UnlockedItemType, GameMode, ThaiUIText, MissionType, FurnitureId
} from '../types';
import {
  PET_DEFINITIONS, MAX_PET_HUNGER, PET_HUNGER_DECAY_PER_HOUR, PET_FOOD_HUNGER_VALUE,
  PET_XP_PER_CORRECT_ANSWER, PET_XP_PER_FEEDING, PET_XP_PER_DAILY_LOGIN,
  PET_LEVEL_THRESHOLDS, MAX_PET_HAPPINESS, HAPPINESS_PER_FEEDING, HAPPINESS_PER_PLAY,
  HAPPINESS_DECAY_ON_HUNGER_DROP, PET_PLAY_COOLDOWN_HOURS, MAX_PET_LEVEL,
  PET_BOREDOM_THRESHOLD_HOURS, HAPPINESS_DECAY_ON_BOREDOM, PET_SPECIAL_REQUEST_CHANCE,
  PET_SPECIAL_REQUEST_REWARD_XP, PET_SPECIAL_REQUEST_REWARD_HAPPINESS,
  PET_SPECIAL_REQUEST_REWARD_XP_EVOLVED, PET_SPECIAL_REQUEST_REWARD_HAPPINESS_EVOLVED,
  UI_TEXT_TH, getPetName, ALL_INTERVALS, ALL_CHORDS,
  PET_INTERACTION_ACHIEVEMENT_MILESTONE, PET_CUSTOMIZATION_ITEMS, INITIAL_ACHIEVEMENTS,
  PET_SPECIAL_REQUEST_TIMEOUT_HOURS, PET_HAPPINESS_PENALTY_REQUEST_TIMEOUT, // Added
  PET_MIN_HAPPINESS_FOR_ABILITY, PET_MIN_HAPPINESS_FOR_REQUEST // Added
} from '../constants';
import { PetAbilityType } from '../types';

interface PetSystemProps {
  initialPetsState: PlayerData; // Changed: This prop IS the full PlayerData
  gCoins: number; // Still useful for quick checks, though PlayerData also has it
  setPlayerDataOptimistic: (updater: (prevData: PlayerData) => PlayerData) => void; 
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  unlockAchievement: (achievementId: AchievementId, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> };
  playerUnlockedMusicalItems: PlayerData['unlockedMusicalItemIds'];
  playerLevel: number; 
  getActivePlayerAbilityMultiplier: (abilityType: PetAbilityType) => number; 
  getHouseBenefits: () => { dailyLoginBonusGCoins: number; trainingXpMultiplier: number; trainingGCoinMultiplier: number; furnitureBonuses: { comfyPetBedHappinessBoost: number} };
  updateMissionProgress: (missionType: MissionType, valueIncrement?: number, targetDetails?: any, currentPlayerData?: PlayerData) => PlayerData; // Added currentPlayerData
}

export interface PetSystemReturn {
  // Pet Data (derived from initialPetsState prop)
  ownedPetIds: PetId[];
  activePetId: PetId | null;
  pets: { [petId: string]: ActivePet };
  petFoodCount: number;
  petInteractionCount: number;
  activePetInstance: ActivePet | null;

  // Pet Actions
  adoptPet: (petDef: PetDefinition) => { success: boolean; messageKey?: keyof ThaiUIText; };
  feedPet: () => boolean;
  playWithPet: () => boolean;
  setActivePet: (petId: PetId | null) => void;
  applyPetCustomization: (petId: PetId, customization: PetCustomization) => boolean;
  addPetXP: (petId: PetId, xpAmount: number) => { updatedPet: ActivePet, notifications: Omit<NotificationMessage, 'id'>[], newUnlockedAchievements: AchievementId[] };


  // Logic to be called by usePlayerData
  handlePetXPForCorrectAnswer: (currentActivePetId: PetId | null, currentPets: { [petId: string]: ActivePet }, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notifications: Omit<NotificationMessage, 'id'>[] }; // Return full PlayerData
  handlePetDailyLogin: (currentActivePetId: PetId | null, currentPets: { [petId: string]: ActivePet }, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notifications: Omit<NotificationMessage, 'id'>[] }; // Return full PlayerData
  updatePetStatePeriodic: () => void; 
  handlePetSpecialRequestFulfillment: (gameMode: GameMode, itemId: string, currentActivePetId: PetId | null, currentPets: { [petId: string]: ActivePet }, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notifications: Omit<NotificationMessage, 'id'>[] }; // Return full PlayerData
  increasePetFoodCount: (amount: number) => void;
  getActivePetAbilityMultiplier: (petId: PetId | null, petsData: { [petId: string]: ActivePet }, abilityType: PetAbilityType) => number;
}

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));


export const usePetSystem = ({
  initialPetsState: playerData, // Use playerData prop directly
  gCoins, // Keep for quick checks, or derive from playerData
  setPlayerDataOptimistic,
  addNotification,
  unlockAchievement,
  playerUnlockedMusicalItems, // This should come from playerData.unlockedMusicalItemIds
  playerLevel, // This should come from playerData.level
  getActivePlayerAbilityMultiplier: getPlayerAbilityMultiplier,
  getHouseBenefits,
  updateMissionProgress,
}: PetSystemProps): PetSystemReturn => {
  
  // These local states are potentially problematic if not perfectly synced.
  // It's better to derive these from the `playerData` prop.
  const ownedPetIds = playerData.ownedPetIds;
  const activePetId = playerData.activePetId;
  const pets = playerData.pets;
  const petFoodCount = playerData.petFoodCount;
  const petInteractionCount = playerData.petInteractionCount;
  const activePetInstance = activePetId ? pets[activePetId] : null;

  const _internalUnlockAchievement = useCallback((achievementId: AchievementId, currentGCoinsParam: number, currentUnlockedAchievements: AchievementId[]): { newUnlockedAchievements: AchievementId[], notification?: Omit<NotificationMessage, 'id'>} => {
    if (!currentUnlockedAchievements.includes(achievementId)) {
        const achInfo = INITIAL_ACHIEVEMENTS.find(a => a.id === achievementId);
        return {
            newUnlockedAchievements: [...currentUnlockedAchievements, achievementId],
            notification: {
                type: 'achievement',
                titleKey: 'achievementUnlocked',
                itemName: achInfo ? UI_TEXT_TH[achInfo.nameKey] : achievementId.toString()
            }
        };
    }
    return { newUnlockedAchievements: currentUnlockedAchievements, notification: undefined };
  }, [UI_TEXT_TH]);


  const _checkAndApplyPetLevelUp = useCallback((
    petToCheck: ActivePet,
    currentPlayerData: PlayerData // Pass full PlayerData for context
    ): {
        updatedPet: ActivePet, // The pet that potentially leveled up/evolved
        newOwnedPetIds: PetId[], // Potentially updated if evolution changes ID
        newActivePetId: PetId | null, // Potentially updated if active pet evolved
        newAllPets: { [petId: string]: ActivePet }, // The complete pets object
        newUnlockedAchievements: AchievementId[],
        notifications: Omit<NotificationMessage, 'id'>[]
    } => {
        let updatedPetData = { ...petToCheck };
        let newAllPetsTemp = { ...currentPlayerData.pets };
        let newOwnedPetIdsTemp = [...currentPlayerData.ownedPetIds];
        let newActivePetIdTemp = currentPlayerData.activePetId;
        let newUnlockedAchievementsTemp = [...currentPlayerData.unlockedAchievementIds];

        let initialLevel = updatedPetData.level;
        const petNotifications: Omit<NotificationMessage, 'id'>[] = [];

        while (updatedPetData.level < MAX_PET_LEVEL && updatedPetData.level < PET_LEVEL_THRESHOLDS.length && updatedPetData.xp >= PET_LEVEL_THRESHOLDS[updatedPetData.level]) {
            updatedPetData.level++;
        }
        const leveledUp = updatedPetData.level > initialLevel;

        if (leveledUp) {
            petNotifications.push({
                type: 'petLevelUp', titleKey: 'petLevelUpNotificationTitle', messageKey: 'petLevelUpNotificationMessage',
                petName: updatedPetData.name, level: updatedPetData.level 
            });
            if (updatedPetData.level >= 5 && !newUnlockedAchievementsTemp.includes(AchievementId.PET_REACH_LEVEL_5)) {
                const achResult = _internalUnlockAchievement(AchievementId.PET_REACH_LEVEL_5, currentPlayerData.gCoins, newUnlockedAchievementsTemp);
                newUnlockedAchievementsTemp = achResult.newUnlockedAchievements;
                if (achResult.notification) petNotifications.push(achResult.notification);
            }
            if (updatedPetData.level >= MAX_PET_LEVEL && !newUnlockedAchievementsTemp.includes(AchievementId.PET_MAX_LEVEL_FIRST)) {
                const achResult = _internalUnlockAchievement(AchievementId.PET_MAX_LEVEL_FIRST, currentPlayerData.gCoins, newUnlockedAchievementsTemp);
                newUnlockedAchievementsTemp = achResult.newUnlockedAchievements;
                if (achResult.notification) petNotifications.push(achResult.notification);
            }

            const currentPetDef = PET_DEFINITIONS.find(def => def.id === petToCheck.id);
            if (currentPetDef?.evolvesTo && currentPetDef.evolutionLevel && updatedPetData.level >= currentPetDef.evolutionLevel && updatedPetData.id !== currentPetDef.evolvesTo) {
                const oldPetName = updatedPetData.name;
                const evolvedPetId = currentPetDef.evolvesTo;
                const evolvedPetDef = PET_DEFINITIONS.find(def => def.id === evolvedPetId);

                if (evolvedPetDef) {
                    const originalEvolvingPetId = updatedPetData.id; // Original ID before evolution
                    updatedPetData.id = evolvedPetId; // Update the pet's ID to the evolved form
                    updatedPetData.name = UI_TEXT_TH[evolvedPetDef.nameKey] || evolvedPetDef.id.toString();

                    // Update the pets object: remove old ID, add new ID with evolved data
                    delete newAllPetsTemp[originalEvolvingPetId];
                    newAllPetsTemp[evolvedPetId] = { ...updatedPetData };
                    
                    // Update activePetId if the evolving pet was active
                    if (newActivePetIdTemp === originalEvolvingPetId) {
                        newActivePetIdTemp = evolvedPetId;
                    }
                    // Update ownedPetIds: replace old ID with new ID
                    const ownedIndex = newOwnedPetIdsTemp.indexOf(originalEvolvingPetId);
                    if (ownedIndex > -1) {
                        newOwnedPetIdsTemp.splice(ownedIndex, 1, evolvedPetId);
                    } else { // Should not happen if pet was owned
                        newOwnedPetIdsTemp.push(evolvedPetId);
                    }


                    petNotifications.push({
                        type: 'petEvolution', titleKey: 'petEvolutionTitle', messageKey: 'petEvolutionMessage',
                        petName: oldPetName, evolvedPetName: updatedPetData.name,
                    });

                    if (!newUnlockedAchievementsTemp.includes(AchievementId.FIRST_PET_EVOLUTION)) {
                        const achResult = _internalUnlockAchievement(AchievementId.FIRST_PET_EVOLUTION, currentPlayerData.gCoins, newUnlockedAchievementsTemp);
                        newUnlockedAchievementsTemp = achResult.newUnlockedAchievements;
                        if (achResult.notification) petNotifications.push(achResult.notification);
                    }
                }
            }
        }
        // Ensure the pet being returned is the one with the potentially new ID
        newAllPetsTemp[updatedPetData.id] = updatedPetData;

        updateMissionProgress(MissionType.PET_REACH_STAT, undefined, {petId: updatedPetData.id, stat: 'LEVEL', statValue: updatedPetData.level}, currentPlayerData);


        return {
            updatedPet: updatedPetData,
            newOwnedPetIds: newOwnedPetIdsTemp,
            newActivePetId: newActivePetIdTemp,
            newAllPets: newAllPetsTemp,
            newUnlockedAchievements: newUnlockedAchievementsTemp,
            notifications: petNotifications
        };
  }, [_internalUnlockAchievement, UI_TEXT_TH, updateMissionProgress]);

  const getActivePetAbilityMultiplierLocal = useCallback((currentPetId: PetId | null, currentPets: { [petId: string]: ActivePet }, abilityType: PetAbilityType): number => {
    // This function is now named `getActivePetAbilityMultiplierLocal` to avoid conflict with the prop.
    // It's the same logic as the exported `getCurrentPetAbilityMultiplier` but used internally here.
    if (currentPetId && currentPets[currentPetId]) {
      const petInstance = currentPets[currentPetId];
      const petDef = PET_DEFINITIONS.find(def => def.id === petInstance.id);

      if(petInstance.happiness < PET_MIN_HAPPINESS_FOR_ABILITY) {
        return abilityType === PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES ? 0 : 1;
      }

      if (petDef?.ability?.type === abilityType) {
        if (!petDef.ability.condition || petDef.ability.condition(petInstance)) {
          return petDef.ability.value;
        }
      }
    }
    if (abilityType === PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES) return 0;
    return 1;
  }, []); // No external dependencies if PET_DEFINITIONS and PET_MIN_HAPPINESS_FOR_ABILITY are constant


  const adoptPet = useCallback((petDef: PetDefinition): { success: boolean; messageKey?: keyof ThaiUIText } => {
    // Read current state from playerData prop
    if (playerData.ownedPetIds.includes(petDef.id)) {
        return { success: false, messageKey: 'petAlreadyOwned' };
    }
    if (playerData.gCoins < petDef.cost) {
        return { success: false, messageKey: 'notEnoughGCoins' };
    }

    setPlayerDataOptimistic(prevFullPlayerData => {
        if (!prevFullPlayerData) return prevFullPlayerData;

        const newPetInstance: ActivePet = {
            id: petDef.id, name: UI_TEXT_TH[petDef.nameKey] || petDef.id.toString(), hunger: MAX_PET_HUNGER,
            lastFedTimestamp: Date.now(), lastLoginTimestampForHunger: Date.now(), xp: 0, level: 1,
            happiness: MAX_PET_HAPPINESS / 2, lastPlayedTimestamp: 0, lastInteractionTimestamp: Date.now(),
            customization: {}, specialRequest: null,
            specialRequestGeneratedTimestamp: null, 
            lastBoredomDecayTimestamp: null, 
        };
        
        let updatedData = {
            ...prevFullPlayerData,
            gCoins: prevFullPlayerData.gCoins - petDef.cost,
            ownedPetIds: [...prevFullPlayerData.ownedPetIds, petDef.id],
            pets: { ...prevFullPlayerData.pets, [petDef.id]: newPetInstance },
            activePetId: prevFullPlayerData.activePetId === null ? petDef.id : prevFullPlayerData.activePetId,
        };

        let currentAchievements = updatedData.unlockedAchievementIds;
        const achResult = unlockAchievement(AchievementId.ADOPT_FIRST_PET, updatedData);
        updatedData = achResult.updatedPlayerData;
        currentAchievements = updatedData.unlockedAchievementIds; // Update after unlockAchievement returns potentially modified data
        if (achResult.notification) addNotification(achResult.notification);

        const adoptablePetsCount = PET_DEFINITIONS.filter(p => p.cost > 0 && !p.evolvesTo).length;
        if (updatedData.ownedPetIds.filter(id => PET_DEFINITIONS.find(p => p.id === id && p.cost > 0 && !p.evolvesTo)).length >= adoptablePetsCount &&
            !currentAchievements.includes(AchievementId.PET_COLLECTOR)) {
            const achCollectorResult = unlockAchievement(AchievementId.PET_COLLECTOR, updatedData);
            updatedData = achCollectorResult.updatedPlayerData;
            currentAchievements = updatedData.unlockedAchievementIds;
            if (achCollectorResult.notification) addNotification(achCollectorResult.notification);
        }
        updatedData = updateMissionProgress(MissionType.EARN_GCOINS_TOTAL, undefined, {gcoinsEarnedInThisEvent: -petDef.cost}, updatedData);
        updatedData.unlockedAchievementIds = currentAchievements; // ensure it has the latest
        return updatedData;
    });

    addNotification({type: 'pet', titleKey: 'petAdoptedSuccess', petName: UI_TEXT_TH[petDef.nameKey] || petDef.id.toString()});
    return { success: true, messageKey: 'petAdoptedSuccess' };
  }, [playerData, setPlayerDataOptimistic, addNotification, unlockAchievement, updateMissionProgress, UI_TEXT_TH]);

  const feedPet = useCallback((): boolean => {
    if (!playerData.activePetId || !playerData.pets[playerData.activePetId] || playerData.petFoodCount <= 0) {
      if (playerData.petFoodCount <= 0) addNotification({type: 'info', titleKey: 'notEnoughPetFood'});
      return false;
    }
    
    setPlayerDataOptimistic(prev => {
        if (!prev || !prev.activePetId || !prev.pets[prev.activePetId]) return prev; // Should be caught above but defensive
        let updatedData = deepClone(prev);
        let petToUpdate = { ...updatedData.pets[prev.activePetId] };
        const now = Date.now();

        petToUpdate.hunger = Math.min(MAX_PET_HUNGER, petToUpdate.hunger + PET_FOOD_HUNGER_VALUE);
        petToUpdate.lastFedTimestamp = now;
        petToUpdate.lastInteractionTimestamp = now;

        const petXpPlayerBoost = getPlayerAbilityMultiplier(PetAbilityType.PET_XP_BOOST);
        petToUpdate.xp += Math.round(PET_XP_PER_FEEDING * petXpPlayerBoost);

        const houseBenefits = getHouseBenefits();
        petToUpdate.happiness = Math.min(MAX_PET_HAPPINESS, petToUpdate.happiness + HAPPINESS_PER_FEEDING + houseBenefits.furnitureBonuses.comfyPetBedHappinessBoost);

        updatedData.petFoodCount -= 1;

        const levelUpResult = _checkAndApplyPetLevelUp(petToUpdate, updatedData);
        // Apply changes from level up to updatedData
        updatedData.pets = levelUpResult.newAllPets; // This has the evolved pet if any
        updatedData.ownedPetIds = levelUpResult.newOwnedPetIds;
        updatedData.activePetId = levelUpResult.newActivePetId; // Important if active pet evolved
        updatedData.unlockedAchievementIds = levelUpResult.newUnlockedAchievements;
        levelUpResult.notifications.forEach(addNotification);
        
        // Ensure the correct pet instance (potentially evolved) is used for further checks
        const finalPetInstance = updatedData.pets[updatedData.activePetId!] || levelUpResult.updatedPet;

        if (!updatedData.unlockedAchievementIds.includes(AchievementId.FEED_PET_FIRST_TIME)) {
            const achResult = unlockAchievement(AchievementId.FEED_PET_FIRST_TIME, updatedData);
            updatedData = achResult.updatedPlayerData;
            if (achResult.notification) addNotification(achResult.notification);
        }
        if (finalPetInstance.happiness >= MAX_PET_HAPPINESS && !updatedData.unlockedAchievementIds.includes(AchievementId.PET_MAX_HAPPINESS)) {
            const achResult = unlockAchievement(AchievementId.PET_MAX_HAPPINESS, updatedData);
            updatedData = achResult.updatedPlayerData;
            if (achResult.notification) addNotification(achResult.notification);
            addNotification({ type: 'pet', titleKey: 'petMaxHappinessMessage', petName: finalPetInstance.name });
        }
        
        updatedData = updateMissionProgress(MissionType.FEED_PET_COUNT, 1, undefined, updatedData);
        updatedData = updateMissionProgress(MissionType.PET_REACH_STAT, undefined, {petId: updatedData.activePetId!, stat: 'HAPPINESS', statValue: finalPetInstance.happiness}, updatedData);

        addNotification({type: 'pet', titleKey: 'petFedSuccess', petName: finalPetInstance.name});
        return updatedData;
    });
    return true;
  }, [playerData, addNotification, _checkAndApplyPetLevelUp, setPlayerDataOptimistic, unlockAchievement, getPlayerAbilityMultiplier, getHouseBenefits, updateMissionProgress]);

  const playWithPet = useCallback((): boolean => {
    if (!playerData.activePetId || !playerData.pets[playerData.activePetId]) return false;

    const petToUpdateCheck = playerData.pets[playerData.activePetId];
    const now = Date.now();
    const cooldownMillis = PET_PLAY_COOLDOWN_HOURS * 60 * 60 * 1000;

    if (now - (petToUpdateCheck.lastPlayedTimestamp || 0) < cooldownMillis) {
      addNotification({type: 'info', titleKey: 'petPlayCooldownMessage'});
      return false;
    }
    
    setPlayerDataOptimistic(prev => {
        if (!prev || !prev.activePetId || !prev.pets[prev.activePetId]) return prev;
        let updatedData = deepClone(prev);
        let petToUpdate = { ...updatedData.pets[prev.activePetId] };

        const houseBenefits = getHouseBenefits();
        petToUpdate.happiness = Math.min(MAX_PET_HAPPINESS, petToUpdate.happiness + HAPPINESS_PER_PLAY + houseBenefits.furnitureBonuses.comfyPetBedHappinessBoost);
        petToUpdate.lastPlayedTimestamp = Date.now();
        petToUpdate.lastInteractionTimestamp = Date.now();
        updatedData.petInteractionCount = (updatedData.petInteractionCount || 0) + 1;

        const levelUpResult = _checkAndApplyPetLevelUp(petToUpdate, updatedData);
        updatedData.pets = levelUpResult.newAllPets;
        updatedData.ownedPetIds = levelUpResult.newOwnedPetIds;
        updatedData.activePetId = levelUpResult.newActivePetId;
        updatedData.unlockedAchievementIds = levelUpResult.newUnlockedAchievements;
        levelUpResult.notifications.forEach(addNotification);

        const finalPetInstance = updatedData.pets[updatedData.activePetId!] || levelUpResult.updatedPet;

        if (updatedData.petInteractionCount >= PET_INTERACTION_ACHIEVEMENT_MILESTONE && !updatedData.unlockedAchievementIds.includes(AchievementId.PET_PLAY_10_TIMES)) {
            const achResult = unlockAchievement(AchievementId.PET_PLAY_10_TIMES, updatedData);
            updatedData = achResult.updatedPlayerData;
            if (achResult.notification) addNotification(achResult.notification);
        }
        if (finalPetInstance.happiness >= MAX_PET_HAPPINESS && !updatedData.unlockedAchievementIds.includes(AchievementId.PET_MAX_HAPPINESS)) {
             const achResult = unlockAchievement(AchievementId.PET_MAX_HAPPINESS, updatedData);
             updatedData = achResult.updatedPlayerData;
             if (achResult.notification) addNotification(achResult.notification);
             addNotification({ type: 'pet', titleKey: 'petMaxHappinessMessage', petName: finalPetInstance.name });
        }
        updatedData = updateMissionProgress(MissionType.PET_REACH_STAT, undefined, {petId: updatedData.activePetId!, stat: 'HAPPINESS', statValue: finalPetInstance.happiness}, updatedData);

        return updatedData;
    });
    return true;
  }, [playerData, addNotification, _checkAndApplyPetLevelUp, setPlayerDataOptimistic, unlockAchievement, getHouseBenefits, updateMissionProgress]);

  const addPetXP = useCallback((petIdToAddXp: PetId, xpAmount: number): { updatedPet: ActivePet, notifications: Omit<NotificationMessage, 'id'>[], newUnlockedAchievements: AchievementId[] } => {
    let result: { updatedPet: ActivePet, notifications: Omit<NotificationMessage, 'id'>[], newUnlockedAchievements: AchievementId[] } = {
        updatedPet: {} as ActivePet, notifications: [], newUnlockedAchievements: []
    };
    setPlayerDataOptimistic(prev => {
        if (!prev || !prev.pets[petIdToAddXp]) return prev;
        let updatedData = deepClone(prev);
        let petToUpdate = { ...updatedData.pets[petIdToAddXp] };

        const petXpPlayerBoost = getPlayerAbilityMultiplier(PetAbilityType.PET_XP_BOOST);
        petToUpdate.xp += Math.round(xpAmount * petXpPlayerBoost);

        const levelUpResult = _checkAndApplyPetLevelUp(petToUpdate, updatedData);
        updatedData.pets = levelUpResult.newAllPets;
        updatedData.ownedPetIds = levelUpResult.newOwnedPetIds;
        updatedData.activePetId = levelUpResult.newActivePetId; // Update activePetId in main data
        updatedData.unlockedAchievementIds = levelUpResult.newUnlockedAchievements;
        
        result = {
            updatedPet: levelUpResult.updatedPet, // This is the pet instance that might have evolved
            notifications: levelUpResult.notifications,
            newUnlockedAchievements: levelUpResult.newUnlockedAchievements.filter(ach => !prev.unlockedAchievementIds.includes(ach)) // Only truly new achievements
        };
        return updatedData;
    });
    return result;
  }, [setPlayerDataOptimistic, getPlayerAbilityMultiplier, _checkAndApplyPetLevelUp]);


  const updatePetStatePeriodic = useCallback(() => {
    // Uses playerData prop directly for checks
    if (!playerData.activePetId || !playerData.pets[playerData.activePetId]) return;

    setPlayerDataOptimistic(prev => {
        if(!prev || !prev.activePetId || !prev.pets[prev.activePetId]) return prev;
        let updatedData = deepClone(prev);
        let petToUpdate = { ...updatedData.pets[prev.activePetId] }; // Operate on the copy from updatedData
        const now = Date.now();
        let notificationsToQueue: Omit<NotificationMessage, 'id'>[] = [];
        let changed = false;

        // Hunger decay
        const hoursSinceLastLoginForHunger = (now - (petToUpdate.lastLoginTimestampForHunger || now)) / (1000 * 60 * 60);
        if (hoursSinceLastLoginForHunger > 0.1) {
          const hungerLost = Math.floor(hoursSinceLastLoginForHunger * PET_HUNGER_DECAY_PER_HOUR);
          if (hungerLost > 0) {
              const oldHunger = petToUpdate.hunger;
              petToUpdate.hunger = Math.max(0, petToUpdate.hunger - hungerLost);
              if (oldHunger > 0 && petToUpdate.hunger === 0) {
                notificationsToQueue.push({ type: 'pet', titleKey: 'petHungryNotificationTitle', messageKey: 'petHungryNotificationMessage', petName: petToUpdate.name });
              }
              if (oldHunger > petToUpdate.hunger && petToUpdate.hunger < MAX_PET_HUNGER * 0.3) {
                petToUpdate.happiness = Math.max(0, petToUpdate.happiness - HAPPINESS_DECAY_ON_HUNGER_DROP);
              }
              changed = true;
          }
          petToUpdate.lastLoginTimestampForHunger = now;
        }

        const hoursSinceLastInteraction = (now - (petToUpdate.lastInteractionTimestamp || now)) / (1000 * 60 * 60);
        if (hoursSinceLastInteraction > PET_BOREDOM_THRESHOLD_HOURS) {
            const decayPeriods = Math.floor(hoursSinceLastInteraction / PET_BOREDOM_THRESHOLD_HOURS);
            const happinessLostToBoredom = decayPeriods * HAPPINESS_DECAY_ON_BOREDOM;
            if (happinessLostToBoredom > 0 && (petToUpdate.lastBoredomDecayTimestamp || 0) < (now - (PET_BOREDOM_THRESHOLD_HOURS * 60 * 60 * 1000 * 0.9))) { 
                petToUpdate.happiness = Math.max(0, petToUpdate.happiness - happinessLostToBoredom);
                petToUpdate.lastBoredomDecayTimestamp = now;
                changed = true;
            }
        }

        if (petToUpdate.specialRequest && petToUpdate.specialRequestGeneratedTimestamp) {
            const hoursSinceRequestGenerated = (now - petToUpdate.specialRequestGeneratedTimestamp) / (1000 * 60 * 60);
            if (hoursSinceRequestGenerated > PET_SPECIAL_REQUEST_TIMEOUT_HOURS) {
                petToUpdate.happiness = Math.max(0, petToUpdate.happiness - PET_HAPPINESS_PENALTY_REQUEST_TIMEOUT);
                petToUpdate.specialRequest = null;
                petToUpdate.specialRequestGeneratedTimestamp = null;
                notificationsToQueue.push({ type: 'pet', titleKey: 'appName', messageKey: 'petSpecialRequestExpiredMessage', petName: petToUpdate.name });
                changed = true;
            }
        }

        if (!petToUpdate.specialRequest && petToUpdate.happiness >= PET_MIN_HAPPINESS_FOR_REQUEST && Math.random() < PET_SPECIAL_REQUEST_CHANCE / 20) {
            const requestType = Math.random() < 0.5 ? 'listen_interval' : 'listen_chord';
            const items = requestType === 'listen_interval' ? ALL_INTERVALS : ALL_CHORDS;
            const availableItems = items.filter(item =>
                !item.isAdvanced ||
                prev.unlockedMusicalItemIds.some(unlocked => // Use prev for item unlock check
                    unlocked.id === item.id &&
                    unlocked.type === (requestType === 'listen_interval' ? UnlockedItemType.INTERVAL : UnlockedItemType.CHORD)
                )
            );
            if (availableItems.length > 0) {
                const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
                const petDefCurrent = PET_DEFINITIONS.find(p => p.id === petToUpdate.id); // Ensure this refers to current pet ID
                const isEvolved = petDefCurrent && petDefCurrent.cost === 0 && !petDefCurrent.evolvesTo;

                petToUpdate.specialRequest = {
                    type: requestType, targetId: randomItem.id, targetName: randomItem.name,
                    descriptionKey: 'petSpecialRequestListenTo', fulfilled: false,
                    rewardPetXp: isEvolved ? PET_SPECIAL_REQUEST_REWARD_XP_EVOLVED : PET_SPECIAL_REQUEST_REWARD_XP,
                    rewardHappiness: isEvolved ? PET_SPECIAL_REQUEST_REWARD_HAPPINESS_EVOLVED : PET_SPECIAL_REQUEST_REWARD_HAPPINESS,
                };
                petToUpdate.specialRequestGeneratedTimestamp = now;
                notificationsToQueue.push({ type: 'petSpecialRequest', titleKey: 'petSpecialRequestTitle', messageKey: 'petSpecialRequestListenTo', petName: petToUpdate.name, targetName: randomItem.name });
                changed = true;
            }
        }

        if (changed) {
            updatedData.pets[prev.activePetId!] = petToUpdate;
            notificationsToQueue.forEach(addNotification);
            updatedData = updateMissionProgress(MissionType.PET_REACH_STAT, undefined, {petId: prev.activePetId!, stat: 'HAPPINESS', statValue: petToUpdate.happiness}, updatedData);
        }
        return updatedData;
    });
  }, [playerData, addNotification, updateMissionProgress, setPlayerDataOptimistic]);

  const handlePetXPForCorrectAnswer = useCallback((currentActivePetId: PetId | null, currentPetsParam: { [petId: string]: ActivePet }, currentPlayerDataParam: PlayerData): { updatedPlayerData: PlayerData, notifications: Omit<NotificationMessage, 'id'>[] } => {
    let finalNotifications: Omit<NotificationMessage, 'id'>[] = [];
    let resultingPlayerData = currentPlayerDataParam; // Start with current data

    if (!currentActivePetId || !currentPetsParam[currentActivePetId]) {
        return { updatedPlayerData: currentPlayerDataParam, notifications: [] };
    }

    let petToUpdate = { ...currentPetsParam[currentActivePetId] };
    const petXpPlayerBoost = getPlayerAbilityMultiplier(PetAbilityType.PET_XP_BOOST);
    petToUpdate.xp += Math.round(PET_XP_PER_CORRECT_ANSWER * petXpPlayerBoost);
    petToUpdate.lastInteractionTimestamp = Date.now();

    const levelUpResult = _checkAndApplyPetLevelUp(petToUpdate, currentPlayerDataParam);
    
    // Apply changes from levelUpResult to a temporary PlayerData object
    let tempPlayerData = {
        ...currentPlayerDataParam,
        pets: levelUpResult.newAllPets,
        ownedPetIds: levelUpResult.newOwnedPetIds,
        activePetId: levelUpResult.newActivePetId,
        unlockedAchievementIds: levelUpResult.newUnlockedAchievements,
    };
    finalNotifications.push(...levelUpResult.notifications);
    resultingPlayerData = tempPlayerData;

    return { updatedPlayerData: resultingPlayerData, notifications: finalNotifications };
  }, [_checkAndApplyPetLevelUp, getPlayerAbilityMultiplier]);

  const handlePetDailyLogin = useCallback((currentActivePetId: PetId | null, currentPetsParam: { [petId: string]: ActivePet }, currentPlayerDataParam: PlayerData): { updatedPlayerData: PlayerData, notifications: Omit<NotificationMessage, 'id'>[] } => {
    let finalNotifications: Omit<NotificationMessage, 'id'>[] = [];
    let resultingPlayerData = currentPlayerDataParam;

    if (!currentActivePetId || !currentPetsParam[currentActivePetId]) {
        return { updatedPlayerData: currentPlayerDataParam, notifications: [] };
    }

    let petToUpdate = { ...currentPetsParam[currentActivePetId] };
    const petXpPlayerBoost = getPlayerAbilityMultiplier(PetAbilityType.PET_XP_BOOST);
    petToUpdate.xp += Math.round(PET_XP_PER_DAILY_LOGIN * petXpPlayerBoost);
    petToUpdate.lastInteractionTimestamp = Date.now();

    const levelUpResult = _checkAndApplyPetLevelUp(petToUpdate, currentPlayerDataParam);
    
    let tempPlayerData = {
        ...currentPlayerDataParam,
        pets: levelUpResult.newAllPets,
        ownedPetIds: levelUpResult.newOwnedPetIds,
        activePetId: levelUpResult.newActivePetId,
        unlockedAchievementIds: levelUpResult.newUnlockedAchievements,
    };
    finalNotifications.push(...levelUpResult.notifications);
    resultingPlayerData = tempPlayerData;
    
    return { updatedPlayerData: resultingPlayerData, notifications: finalNotifications };
  }, [_checkAndApplyPetLevelUp, getPlayerAbilityMultiplier]);


  const handlePetSpecialRequestFulfillment = useCallback((
    gameMode: GameMode,
    itemId: string,
    currentActivePetId: PetId | null,
    currentPetsParam: { [petId: string]: ActivePet },
    currentPlayerDataParam: PlayerData
  ): { updatedPlayerData: PlayerData, notifications: Omit<NotificationMessage, 'id'>[] } => {
    let finalNotifications: Omit<NotificationMessage, 'id'>[] = [];
    let resultingPlayerData = currentPlayerDataParam;

    if (!currentActivePetId || !currentPetsParam[currentActivePetId]) {
        return { updatedPlayerData: currentPlayerDataParam, notifications: [] };
    }

    let petToUpdate = { ...currentPetsParam[currentActivePetId] };

    if (petToUpdate.specialRequest && !petToUpdate.specialRequest.fulfilled) {
        const request = petToUpdate.specialRequest;
        const itemInfo = request.type === 'listen_interval' ? ALL_INTERVALS.find(i => i.id === request.targetId) : ALL_CHORDS.find(c => c.id === request.targetId);
        if (itemInfo && ((request.type === 'listen_interval' && gameMode === GameMode.INTERVALS && itemId === request.targetId) ||
                         (request.type === 'listen_chord' && gameMode === GameMode.CHORDS && itemId === request.targetId))) {

            const petDef = PET_DEFINITIONS.find(p => p.id === petToUpdate.id);
            const isEvolved = petDef && petDef.cost === 0 && !petDef.evolvesTo;

            petToUpdate.xp += isEvolved ? PET_SPECIAL_REQUEST_REWARD_XP_EVOLVED : request.rewardPetXp;
            petToUpdate.happiness = Math.min(MAX_PET_HAPPINESS, petToUpdate.happiness + (isEvolved ? PET_SPECIAL_REQUEST_REWARD_HAPPINESS_EVOLVED : request.rewardHappiness));
            petToUpdate.specialRequest = { ...request, fulfilled: true };
            petToUpdate.lastInteractionTimestamp = Date.now();
            finalNotifications.push({ type: 'pet', titleKey: 'petSpecialRequestFulfilled', petName: petToUpdate.name });

            const achResult = _internalUnlockAchievement(AchievementId.PET_FULFILL_REQUEST_FIRST, currentPlayerDataParam.gCoins, currentPlayerDataParam.unlockedAchievementIds);
            resultingPlayerData.unlockedAchievementIds = achResult.newUnlockedAchievements; // Apply achievement change
            if (achResult.notification) finalNotifications.push(achResult.notification);

            setTimeout(() => { // This timeout should ideally be managed by setPlayerDataOptimistic if it clears the request
                setPlayerDataOptimistic(currentInternalData => {
                    if (!currentInternalData || !currentInternalData.activePetId || !currentInternalData.pets[currentInternalData.activePetId]) return currentInternalData;
                    if(currentInternalData.pets[currentInternalData.activePetId].specialRequest?.fulfilled) {
                        const updatedPetStateForClear = {...currentInternalData.pets[currentInternalData.activePetId], specialRequest: null, specialRequestGeneratedTimestamp: null};
                        return {...currentInternalData, pets: {...currentInternalData.pets, [currentInternalData.activePetId]: updatedPetStateForClear}};
                    }
                    return currentInternalData;
                });
            }, 3000);
        }
    }

    const levelUpResult = _checkAndApplyPetLevelUp(petToUpdate, resultingPlayerData); // Pass potentially modified resultingPlayerData
    let tempPlayerData = {
        ...resultingPlayerData,
        pets: levelUpResult.newAllPets,
        ownedPetIds: levelUpResult.newOwnedPetIds,
        activePetId: levelUpResult.newActivePetId,
        unlockedAchievementIds: levelUpResult.newUnlockedAchievements,
    };
    finalNotifications.push(...levelUpResult.notifications);
    resultingPlayerData = tempPlayerData;

    return { updatedPlayerData: resultingPlayerData, notifications: finalNotifications };
  }, [_checkAndApplyPetLevelUp, _internalUnlockAchievement, setPlayerDataOptimistic]); // Removed gCoins from dependency, use playerData


  const setActivePet = useCallback((newActivePetId: PetId | null) => {
    setPlayerDataOptimistic(prev => {
      if (!prev) return prev;
      if (newActivePetId && !prev.ownedPetIds.includes(newActivePetId)) return prev; // Ensure pet is owned
      return { ...prev, activePetId: newActivePetId };
    });
  }, [setPlayerDataOptimistic]);

  const applyPetCustomization = useCallback((petIdToCustomize: PetId, customization: PetCustomization): boolean => {
    let success = false;
    setPlayerDataOptimistic(prev => {
        if (!prev || !prev.pets[petIdToCustomize]) return prev;
        let updatedData = deepClone(prev);
        const updatedPetInstance = { ...updatedData.pets[petIdToCustomize], customization: { ...updatedData.pets[petIdToCustomize].customization, ...customization }};
        updatedData.pets[petIdToCustomize] = updatedPetInstance;
        success = true;

        let currentAchievements = updatedData.unlockedAchievementIds;
        if (!currentAchievements.includes(AchievementId.PET_CUSTOMIZED_FIRST) && Object.keys(customization).length > 0) {
            const achResult = unlockAchievement(AchievementId.PET_CUSTOMIZED_FIRST, updatedData);
            updatedData = achResult.updatedPlayerData;
            currentAchievements = updatedData.unlockedAchievementIds;
            if (achResult.notification) addNotification(achResult.notification);
        }
        updatedData.unlockedAchievementIds = currentAchievements;

        const collarItem = PET_CUSTOMIZATION_ITEMS.find(item => item.data?.color === customization.collarColor);
        if (collarItem) {
            addNotification({
                type: 'pet', titleKey: 'petCustomizationApplied', petName: updatedPetInstance.name,
                itemName: UI_TEXT_TH[collarItem.nameKey]
            });
        } else if (customization.collarColor === undefined) {
            addNotification({
                type: 'pet', titleKey: 'petCustomizationApplied', petName: updatedPetInstance.name,
                itemName: "ปลอกคอถูกถอดออก"
            });
        }
        return updatedData;
    });
    return success;
  }, [setPlayerDataOptimistic, unlockAchievement, addNotification, UI_TEXT_TH]);

  const increasePetFoodCount = useCallback((amount: number) => {
    setPlayerDataOptimistic(prev => {
      if (!prev) return prev;
      return { ...prev, petFoodCount: (prev.petFoodCount || 0) + amount };
    });
  }, [setPlayerDataOptimistic]);


  useEffect(() => {
    const intervalId = setInterval(() => {
        updatePetStatePeriodic();
    }, 60000); // Update every minute
    return () => clearInterval(intervalId);
  }, [updatePetStatePeriodic]);


  return {
    ownedPetIds: playerData.ownedPetIds,
    activePetId: playerData.activePetId,
    pets: playerData.pets,
    petFoodCount: playerData.petFoodCount,
    petInteractionCount: playerData.petInteractionCount,
    activePetInstance: playerData.activePetId ? playerData.pets[playerData.activePetId] : null,
    adoptPet,
    feedPet,
    playWithPet,
    setActivePet,
    applyPetCustomization,
    addPetXP,
    handlePetXPForCorrectAnswer,
    handlePetDailyLogin,
    updatePetStatePeriodic,
    handlePetSpecialRequestFulfillment,
    increasePetFoodCount,
    getActivePetAbilityMultiplier: getActivePetAbilityMultiplierLocal, // Use the local version
  };
};


// Exported helper to be used by PlayerStatusBar or other components if needed directly
export const getCurrentPetAbilityMultiplier = (
    petId: PetId | null,
    petsData: { [petId: string]: ActivePet },
    abilityType: PetAbilityType,
): number => {
    if (petId && petsData[petId]) {
      const petInstance = petsData[petId];
      const petDef = PET_DEFINITIONS.find(def => def.id === petInstance.id);

      if(petInstance.happiness < PET_MIN_HAPPINESS_FOR_ABILITY) {
        return abilityType === PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES ? 0 : 1;
      }

      if (petDef?.ability?.type === abilityType) {
        if (!petDef.ability.condition || petDef.ability.condition(petInstance)) {
          return petDef.ability.value;
        }
      }
    }
    if (abilityType === PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES) return 0;
    return 1;
};
