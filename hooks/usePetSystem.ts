
import { useState, useCallback, useEffect } from 'react';
import {
  PetId, ActivePet, PetDefinition, PetCustomization, PetSpecialRequest, PlayerData,
  NotificationMessage, AchievementId, UnlockedItemType, GameMode, ThaiUIText, MissionType
} from '../types';
import {
  PET_DEFINITIONS, MAX_PET_HUNGER, PET_HUNGER_DECAY_PER_HOUR, PET_FOOD_HUNGER_VALUE,
  PET_XP_PER_CORRECT_ANSWER, PET_XP_PER_FEEDING, PET_XP_PER_DAILY_LOGIN,
  PET_LEVEL_THRESHOLDS, MAX_PET_HAPPINESS, HAPPINESS_PER_FEEDING, HAPPINESS_PER_PLAY,
  HAPPINESS_DECAY_ON_HUNGER_DROP, PET_PLAY_COOLDOWN_HOURS, MAX_PET_LEVEL,
  PET_BOREDOM_THRESHOLD_HOURS, HAPPINESS_DECAY_ON_BOREDOM, PET_SPECIAL_REQUEST_CHANCE,
  PET_SPECIAL_REQUEST_REWARD_XP, PET_SPECIAL_REQUEST_REWARD_HAPPINESS,
  PET_SPECIAL_REQUEST_REWARD_XP_EVOLVED, PET_SPECIAL_REQUEST_REWARD_HAPPINESS_EVOLVED,
  UI_TEXT_TH, getPetName, ALL_INTERVALS, ALL_CHORDS, FurnitureId,
  PET_INTERACTION_ACHIEVEMENT_MILESTONE, PET_CUSTOMIZATION_ITEMS
} from '../constants';
import { PetAbilityType } from '../types';

interface PetSystemProps {
  initialPetsState: {
    ownedPetIds: PetId[];
    activePetId: PetId | null;
    pets: { [petId: string]: ActivePet };
    petFoodCount: number;
    petInteractionCount: number;
  };
  gCoins: number;
  setPlayerDataOptimistic: (updater: (prevData: PlayerData) => PlayerData) => void; // For GCoins and achievements
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  unlockAchievement: (achievementId: AchievementId, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> };
  playerUnlockedMusicalItems: PlayerData['unlockedMusicalItemIds'];
  playerLevel: number; // For pet ability conditions, if any
  getActivePlayerAbilityMultiplier: (abilityType: PetAbilityType) => number; // For cross-system boosts if needed (e.g. player boosts pet XP)
  getHouseBenefits: () => { dailyLoginBonusGCoins: number; trainingXpMultiplier: number; trainingGCoinMultiplier: number; furnitureBonuses: { comfyPetBedHappinessBoost: number} };
  updateMissionProgress: (missionType: MissionType, valueIncrement?: number, targetDetails?: any) => void;
}

export interface PetSystemReturn {
  // Pet Data
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
  
  // Logic to be called by usePlayerData
  handlePetXPForCorrectAnswer: (currentActivePetId: PetId | null, currentPets: { [petId: string]: ActivePet }) => { updatedPets?: { [petId: string]: ActivePet }, notifications: Omit<NotificationMessage, 'id'>[], updatedPlayerDataForAch?: PlayerData };
  handlePetDailyLogin: (currentActivePetId: PetId | null, currentPets: { [petId: string]: ActivePet }) => { updatedPets?: { [petId: string]: ActivePet }, notifications: Omit<NotificationMessage, 'id'>[], updatedPlayerDataForAch?: PlayerData };
  updatePetStatePeriodic: () => void; // Handles hunger, boredom, special requests
  handlePetSpecialRequestFulfillment: (gameMode: GameMode, itemId: string, currentActivePetId: PetId | null, currentPets: { [petId: string]: ActivePet }) => { updatedPets?: { [petId: string]: ActivePet }, notifications: Omit<NotificationMessage, 'id'>[], updatedPlayerDataForAch?: PlayerData };
  increasePetFoodCount: (amount: number) => void;
  getActivePetAbilityMultiplier: (petId: PetId | null, petsData: { [petId: string]: ActivePet }, abilityType: PetAbilityType) => number;
}


export const usePetSystem = ({
  initialPetsState,
  gCoins,
  setPlayerDataOptimistic,
  addNotification,
  unlockAchievement,
  playerUnlockedMusicalItems,
  playerLevel,
  getActivePlayerAbilityMultiplier: getPlayerAbilityMultiplier, // Renamed for clarity
  getHouseBenefits,
  updateMissionProgress,
}: PetSystemProps): PetSystemReturn => {
  const [ownedPetIds, setOwnedPetIds] = useState<PetId[]>(initialPetsState.ownedPetIds);
  const [activePetId, setActivePetState] = useState<PetId | null>(initialPetsState.activePetId);
  const [pets, setPets] = useState<{ [petId: string]: ActivePet }>(initialPetsState.pets);
  const [petFoodCount, setPetFoodCount] = useState<number>(initialPetsState.petFoodCount);
  const [petInteractionCount, setPetInteractionCount] = useState<number>(initialPetsState.petInteractionCount);

  const activePetInstance = activePetId ? pets[activePetId] : null;

  const _internalUnlockAchievement = useCallback((achievementId: AchievementId, currentGCoins: number, currentUnlockedAchievements: AchievementId[]): { newUnlockedAchievements: AchievementId[], notification?: Omit<NotificationMessage, 'id'>} => {
    // This is a simplified version. The main usePlayerData might have a more complex one.
    // For now, we'll assume it can work with just these.
    // It would be better if usePlayerData passed its full unlockAchievementInternal function.
    // Or this hook focuses only on pet achievements and calls a generic unlock from props.
    if (!currentUnlockedAchievements.includes(achievementId)) {
        const achievementDetails = PET_DEFINITIONS.find(p => p.id === achievementId as any); // This is not right. Need proper achievement defs.
                                                                                             // Placeholder - actual achievement unlocking should be outside or via prop.
        return {
            newUnlockedAchievements: [...currentUnlockedAchievements, achievementId],
            notification: {type: 'achievement', titleKey: 'achievementUnlocked', itemName: achievementId }
        };
    }
    return { newUnlockedAchievements: currentUnlockedAchievements };
  }, []);


  const _checkAndApplyPetLevelUp = useCallback((
    petToCheck: ActivePet,
    currentOwnedPetIds: PetId[],
    currentActivePetId: PetId | null,
    currentAllPets: { [petId: string]: ActivePet },
    currentUnlockedAchievements: AchievementId[],
    currentGCoins: number
    ): { 
        updatedPet: ActivePet, 
        newOwnedPetIds: PetId[],
        newActivePetId: PetId | null,
        newAllPets: { [petId: string]: ActivePet },
        newUnlockedAchievements: AchievementId[],
        notifications: Omit<NotificationMessage, 'id'>[] 
    } => {
        let updatedPetData = { ...petToCheck };
        let newAllPetsTemp = { ...currentAllPets };
        let newOwnedPetIdsTemp = [...currentOwnedPetIds];
        let newActivePetIdTemp = currentActivePetId;
        let newUnlockedAchievementsTemp = [...currentUnlockedAchievements];

        let initialLevel = updatedPetData.level;
        const petNotifications: Omit<NotificationMessage, 'id'>[] = [];

        while (updatedPetData.level < MAX_PET_LEVEL && updatedPetData.level < PET_LEVEL_THRESHOLDS.length && updatedPetData.xp >= PET_LEVEL_THRESHOLDS[updatedPetData.level]) {
            updatedPetData.level++;
        }
        const leveledUp = updatedPetData.level > initialLevel;

        if (leveledUp) {
            petNotifications.push({
                type: 'petLevelUp', titleKey: 'petLevelUpNotificationTitle', messageKey: 'petLevelUpNotificationMessage',
                petName: updatedPetData.name, amount: updatedPetData.level
            });
            if (updatedPetData.level >= 5 && !newUnlockedAchievementsTemp.includes(AchievementId.PET_REACH_LEVEL_5)) {
                const achResult = _internalUnlockAchievement(AchievementId.PET_REACH_LEVEL_5, currentGCoins, newUnlockedAchievementsTemp);
                newUnlockedAchievementsTemp = achResult.newUnlockedAchievements;
                if (achResult.notification) petNotifications.push(achResult.notification);
            }
            if (updatedPetData.level >= MAX_PET_LEVEL && !newUnlockedAchievementsTemp.includes(AchievementId.PET_MAX_LEVEL_FIRST)) {
                const achResult = _internalUnlockAchievement(AchievementId.PET_MAX_LEVEL_FIRST, currentGCoins, newUnlockedAchievementsTemp);
                newUnlockedAchievementsTemp = achResult.newUnlockedAchievements;
                if (achResult.notification) petNotifications.push(achResult.notification);
            }

            const currentPetDef = PET_DEFINITIONS.find(def => def.id === petToCheck.id);
            if (currentPetDef?.evolvesTo && currentPetDef.evolutionLevel && updatedPetData.level >= currentPetDef.evolutionLevel && updatedPetData.id !== currentPetDef.evolvesTo) {
                const oldPetName = updatedPetData.name;
                const evolvedPetId = currentPetDef.evolvesTo;
                const evolvedPetDef = PET_DEFINITIONS.find(def => def.id === evolvedPetId);

                if (evolvedPetDef) {
                    const originalEvolvingPetId = updatedPetData.id;
                    updatedPetData.id = evolvedPetId;
                    updatedPetData.name = UI_TEXT_TH[evolvedPetDef.nameKey] || evolvedPetDef.id.toString();
                    
                    delete newAllPetsTemp[originalEvolvingPetId];
                    newAllPetsTemp[evolvedPetId] = { ...updatedPetData };

                    if (newActivePetIdTemp === originalEvolvingPetId) {
                        newActivePetIdTemp = evolvedPetId;
                    }
                    const ownedIndex = newOwnedPetIdsTemp.indexOf(originalEvolvingPetId);
                    if (ownedIndex > -1) {
                        newOwnedPetIdsTemp.splice(ownedIndex, 1, evolvedPetId);
                    }
                    
                    petNotifications.push({
                        type: 'petEvolution', titleKey: 'petEvolutionTitle', messageKey: 'petEvolutionMessage',
                        petName: oldPetName, evolvedPetName: updatedPetData.name,
                    });

                    if (!newUnlockedAchievementsTemp.includes(AchievementId.FIRST_PET_EVOLUTION)) {
                        const achResult = _internalUnlockAchievement(AchievementId.FIRST_PET_EVOLUTION, currentGCoins, newUnlockedAchievementsTemp);
                        newUnlockedAchievementsTemp = achResult.newUnlockedAchievements;
                        if (achResult.notification) petNotifications.push(achResult.notification);
                    }
                }
            }
        }
        
        updateMissionProgress(MissionType.PET_REACH_STAT, undefined, {petId: updatedPetData.id, stat: 'LEVEL', statValue: updatedPetData.level});

        return { 
            updatedPet: updatedPetData, 
            newOwnedPetIds: newOwnedPetIdsTemp,
            newActivePetId: newActivePetIdTemp,
            newAllPets: newAllPetsTemp,
            newUnlockedAchievements: newUnlockedAchievementsTemp,
            notifications: petNotifications 
        };
  }, [_internalUnlockAchievement, UI_TEXT_TH, updateMissionProgress]);

  const getActivePetAbilityMultiplier = useCallback((currentPetId: PetId | null, currentPets: { [petId: string]: ActivePet }, abilityType: PetAbilityType): number => {
    if (currentPetId && currentPets[currentPetId]) {
      const petInstance = currentPets[currentPetId];
      const petDef = PET_DEFINITIONS.find(def => def.id === petInstance.id);
      if (petDef?.ability?.type === abilityType) {
        if (!petDef.ability.condition || petDef.ability.condition(petInstance)) {
          return petDef.ability.value;
        }
      }
    }
    if (abilityType === PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES) return 0; // discount is 0 if no pet or no ability
    return 1; // multiplier is 1 if no pet or no ability
  }, []);

  const adoptPet = useCallback((petDef: PetDefinition): { success: boolean, messageKey?: keyof ThaiUIText } => {
    if (ownedPetIds.includes(petDef.id)) {
        return { success: false, messageKey: 'petAlreadyOwned' };
    }
    if (gCoins < petDef.cost) {
        return { success: false, messageKey: 'notEnoughGCoins' };
    }

    const newPetInstance: ActivePet = {
        id: petDef.id, name: UI_TEXT_TH[petDef.nameKey] || petDef.id.toString(), hunger: MAX_PET_HUNGER,
        lastFedTimestamp: Date.now(), lastLoginTimestampForHunger: Date.now(), xp: 0, level: 1,
        happiness: MAX_PET_HAPPINESS / 2, lastPlayedTimestamp: 0, lastInteractionTimestamp: Date.now(),
        customization: {}, specialRequest: null,
    };

    const newOwned = [...ownedPetIds, petDef.id];
    const newPetsData = { ...pets, [petDef.id]: newPetInstance };
    
    setOwnedPetIds(newOwned);
    setPets(newPetsData);
    if (!activePetId) setActivePetState(petDef.id);

    setPlayerDataOptimistic(prev => {
        let updatedData = {...prev, gCoins: prev.gCoins - petDef.cost };
        const achResult = unlockAchievement(AchievementId.ADOPT_FIRST_PET, updatedData);
        updatedData = achResult.updatedPlayerData;
        if (achResult.notification) addNotification(achResult.notification);

        const adoptablePetsCount = PET_DEFINITIONS.filter(p => p.cost > 0 && !p.evolvesTo).length;
        if (newOwned.filter(id => PET_DEFINITIONS.find(p => p.id === id && p.cost > 0 && !p.evolvesTo)).length >= adoptablePetsCount &&
            !updatedData.unlockedAchievementIds.includes(AchievementId.PET_COLLECTOR)) {
            const achCollectorResult = unlockAchievement(AchievementId.PET_COLLECTOR, updatedData);
            updatedData = achCollectorResult.updatedPlayerData;
            if (achCollectorResult.notification) addNotification(achCollectorResult.notification);
        }
        updateMissionProgress(MissionType.EARN_GCOINS_TOTAL, undefined, {gcoinsEarnedInThisEvent: -petDef.cost});
        return updatedData;
    });
    
    addNotification({type: 'pet', titleKey: 'petAdoptedSuccess', petName: newPetInstance.name});
    return { success: true, messageKey: 'petAdoptedSuccess' };
  }, [ownedPetIds, gCoins, pets, activePetId, setPlayerDataOptimistic, addNotification, unlockAchievement, updateMissionProgress, UI_TEXT_TH]);

  const feedPet = useCallback((): boolean => {
    if (!activePetId || !pets[activePetId] || petFoodCount <= 0) {
      if (petFoodCount <= 0) addNotification({type: 'info', titleKey: 'notEnoughPetFood'});
      return false;
    }
    
    let petToUpdate = { ...pets[activePetId] };
    const now = Date.now();
    petToUpdate.hunger = Math.min(MAX_PET_HUNGER, petToUpdate.hunger + PET_FOOD_HUNGER_VALUE);
    petToUpdate.lastFedTimestamp = now;
    petToUpdate.lastInteractionTimestamp = now;

    const petXpPlayerBoost = getPlayerAbilityMultiplier(PetAbilityType.PET_XP_BOOST); // If player has global pet xp boost
    petToUpdate.xp += Math.round(PET_XP_PER_FEEDING * petXpPlayerBoost);
    
    const houseBenefits = getHouseBenefits();
    petToUpdate.happiness = Math.min(MAX_PET_HAPPINESS, petToUpdate.happiness + HAPPINESS_PER_FEEDING + houseBenefits.furnitureBonuses.comfyPetBedHappinessBoost);

    const levelUpResult = _checkAndApplyPetLevelUp(petToUpdate, ownedPetIds, activePetId, pets, [], gCoins); // Pass empty achievements, main hook handles it
    
    setPets(prevPets => ({ ...prevPets, [activePetId]: levelUpResult.updatedPet }));
    setOwnedPetIds(levelUpResult.newOwnedPetIds); // In case of evolution
    setActivePetState(levelUpResult.newActivePetId); // In case of evolution of active pet
    if (levelUpResult.updatedPet.id !== activePetId && levelUpResult.newAllPets[levelUpResult.updatedPet.id]) { // if evolved
       setPets(levelUpResult.newAllPets);
    }

    setPetFoodCount(prev => prev - 1);
    levelUpResult.notifications.forEach(addNotification);
    
    setPlayerDataOptimistic(prev => {
        let updatedData = {...prev};
        if (!updatedData.unlockedAchievementIds.includes(AchievementId.FEED_PET_FIRST_TIME)) {
            const achResult = unlockAchievement(AchievementId.FEED_PET_FIRST_TIME, updatedData);
            updatedData = achResult.updatedPlayerData;
            if (achResult.notification) addNotification(achResult.notification);
        }
        if (levelUpResult.updatedPet.happiness >= MAX_PET_HAPPINESS && !updatedData.unlockedAchievementIds.includes(AchievementId.PET_MAX_HAPPINESS)) {
            const achResult = unlockAchievement(AchievementId.PET_MAX_HAPPINESS, updatedData);
            updatedData = achResult.updatedPlayerData;
            if (achResult.notification) addNotification(achResult.notification);
            addNotification({ type: 'pet', titleKey: 'petMaxHappinessMessage', petName: levelUpResult.updatedPet.name });
        }
        return updatedData;
    });

    addNotification({type: 'pet', titleKey: 'petFedSuccess', petName: levelUpResult.updatedPet.name});
    updateMissionProgress(MissionType.FEED_PET_COUNT, 1);
    updateMissionProgress(MissionType.PET_REACH_STAT, undefined, {petId: activePetId, stat: 'HAPPINESS', statValue: levelUpResult.updatedPet.happiness});
    return true;
  }, [activePetId, pets, petFoodCount, addNotification, _checkAndApplyPetLevelUp, setPlayerDataOptimistic, unlockAchievement, getPlayerAbilityMultiplier, getHouseBenefits, updateMissionProgress, ownedPetIds, gCoins]);

  const playWithPet = useCallback((): boolean => {
    if (!activePetId || !pets[activePetId]) return false;
    
    let petToUpdate = { ...pets[activePetId] };
    const now = Date.now();
    const cooldownMillis = PET_PLAY_COOLDOWN_HOURS * 60 * 60 * 1000;

    if (now - (petToUpdate.lastPlayedTimestamp || 0) < cooldownMillis) {
      addNotification({type: 'info', titleKey: 'petPlayCooldownMessage'});
      return false;
    }
    
    const houseBenefits = getHouseBenefits();
    petToUpdate.happiness = Math.min(MAX_PET_HAPPINESS, petToUpdate.happiness + HAPPINESS_PER_PLAY + houseBenefits.furnitureBonuses.comfyPetBedHappinessBoost);
    petToUpdate.lastPlayedTimestamp = now;
    petToUpdate.lastInteractionTimestamp = now;
    
    const newInteractionCount = petInteractionCount + 1;
    setPetInteractionCount(newInteractionCount);
    
    const levelUpResult = _checkAndApplyPetLevelUp(petToUpdate, ownedPetIds, activePetId, pets, [], gCoins); // Pass empty achievements for now
    setPets(prevPets => ({ ...prevPets, [activePetId]: levelUpResult.updatedPet }));
     if (levelUpResult.updatedPet.id !== activePetId && levelUpResult.newAllPets[levelUpResult.updatedPet.id]) { // if evolved
       setPets(levelUpResult.newAllPets);
       setOwnedPetIds(levelUpResult.newOwnedPetIds);
       setActivePetState(levelUpResult.newActivePetId);
    }
    levelUpResult.notifications.forEach(addNotification);

    setPlayerDataOptimistic(prev => {
        let updatedData = {...prev, petInteractionCount: newInteractionCount};
        if (newInteractionCount >= PET_INTERACTION_ACHIEVEMENT_MILESTONE && !updatedData.unlockedAchievementIds.includes(AchievementId.PET_PLAY_10_TIMES)) {
            const achResult = unlockAchievement(AchievementId.PET_PLAY_10_TIMES, updatedData);
            updatedData = achResult.updatedPlayerData;
            if (achResult.notification) addNotification(achResult.notification);
        }
        if (levelUpResult.updatedPet.happiness >= MAX_PET_HAPPINESS && !updatedData.unlockedAchievementIds.includes(AchievementId.PET_MAX_HAPPINESS)) {
             const achResult = unlockAchievement(AchievementId.PET_MAX_HAPPINESS, updatedData);
             updatedData = achResult.updatedPlayerData;
             if (achResult.notification) addNotification(achResult.notification);
             addNotification({ type: 'pet', titleKey: 'petMaxHappinessMessage', petName: levelUpResult.updatedPet.name });
        }
        return updatedData;
    });
    updateMissionProgress(MissionType.PET_REACH_STAT, undefined, {petId: activePetId, stat: 'HAPPINESS', statValue: levelUpResult.updatedPet.happiness});
    return true;
  }, [activePetId, pets, petInteractionCount, addNotification, _checkAndApplyPetLevelUp, setPlayerDataOptimistic, unlockAchievement, getHouseBenefits, updateMissionProgress, ownedPetIds, gCoins]);


  const updatePetStatePeriodic = useCallback(() => {
    if (!activePetId || !pets[activePetId]) return;

    let petToUpdate = { ...pets[activePetId] };
    const now = Date.now();
    let notificationsToQueue: Omit<NotificationMessage, 'id'>[] = [];
    let changed = false;

    // Hunger decay
    const hoursSinceLastLoginForHunger = (now - petToUpdate.lastLoginTimestampForHunger) / (1000 * 60 * 60);
    if (hoursSinceLastLoginForHunger > 0.1) { // Check more frequently than full hour for smoother decay if game is open
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

    // Boredom decay
    const hoursSinceLastInteraction = (now - petToUpdate.lastInteractionTimestamp) / (1000 * 60 * 60);
    if (hoursSinceLastInteraction > PET_BOREDOM_THRESHOLD_HOURS) {
      const boredomDecayPeriods = Math.floor(hoursSinceLastInteraction / PET_BOREDOM_THRESHOLD_HOURS);
      const happinessLostToBoredom = boredomDecayPeriods * HAPPINESS_DECAY_ON_BOREDOM;
      if (happinessLostToBoredom > 0) {
          petToUpdate.happiness = Math.max(0, petToUpdate.happiness - happinessLostToBoredom);
          // Reset last interaction to now to avoid continuous decay in one tick if very long time passed
          petToUpdate.lastInteractionTimestamp = now - ( (hoursSinceLastInteraction % PET_BOREDOM_THRESHOLD_HOURS) * 60*60*1000 );
          changed = true;
      }
    }
    
    // Special Request Generation
    if (!petToUpdate.specialRequest && Math.random() < PET_SPECIAL_REQUEST_CHANCE / 20) { // Reduced chance per tick
        const requestType = Math.random() < 0.5 ? 'listen_interval' : 'listen_chord';
        const items = requestType === 'listen_interval' ? ALL_INTERVALS : ALL_CHORDS;
        const availableItems = items.filter(item => 
            !item.isAdvanced || 
            playerUnlockedMusicalItems.some(unlocked => 
                unlocked.id === item.id && 
                unlocked.type === (requestType === 'listen_interval' ? UnlockedItemType.INTERVAL : UnlockedItemType.CHORD)
            )
        );
        if (availableItems.length > 0) {
            const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
            const petDef = PET_DEFINITIONS.find(p => p.id === petToUpdate.id);
            const isEvolved = petDef && petDef.cost === 0 && !petDef.evolvesTo;

            petToUpdate.specialRequest = {
                type: requestType, targetId: randomItem.id, targetName: randomItem.name,
                descriptionKey: 'petSpecialRequestListenTo', fulfilled: false,
                rewardPetXp: isEvolved ? PET_SPECIAL_REQUEST_REWARD_XP_EVOLVED : PET_SPECIAL_REQUEST_REWARD_XP,
                rewardHappiness: isEvolved ? PET_SPECIAL_REQUEST_REWARD_HAPPINESS_EVOLVED : PET_SPECIAL_REQUEST_REWARD_HAPPINESS,
            };
            notificationsToQueue.push({ type: 'petSpecialRequest', titleKey: 'petSpecialRequestTitle', messageKey: 'petSpecialRequestListenTo', petName: petToUpdate.name, itemName: randomItem.name });
            changed = true;
        }
    }

    if (changed) {
        setPets(prevPets => ({ ...prevPets, [activePetId]: petToUpdate }));
        notificationsToQueue.forEach(addNotification);
        updateMissionProgress(MissionType.PET_REACH_STAT, undefined, {petId: activePetId, stat: 'HAPPINESS', statValue: petToUpdate.happiness});
    }
  }, [activePetId, pets, addNotification, playerUnlockedMusicalItems, updateMissionProgress]);

  const handlePetXPForCorrectAnswer = useCallback((currentActivePetId: PetId | null, currentPets: { [petId: string]: ActivePet }): { updatedPets?: { [petId: string]: ActivePet }, notifications: Omit<NotificationMessage, 'id'>[], updatedPlayerDataForAch?: PlayerData } => {
    if (!currentActivePetId || !currentPets[currentActivePetId]) return { notifications: [] };

    let petToUpdate = { ...currentPets[currentActivePetId] };
    const petXpPlayerBoost = getPlayerAbilityMultiplier(PetAbilityType.PET_XP_BOOST);
    petToUpdate.xp += Math.round(PET_XP_PER_CORRECT_ANSWER * petXpPlayerBoost);
    
    // Temporarily manage achievements within this scope for the call to _checkAndApplyPetLevelUp
    // This is non-ideal; achievement state should be owned by usePlayerData.
    // This part needs careful refactoring when usePlayerData's achievement logic is centralized.
    let tempUnlockedAchievements: AchievementId[] = []; // Placeholder for now
    setPlayerDataOptimistic(prev => { tempUnlockedAchievements = prev.unlockedAchievementIds; return prev; });


    const levelUpResult = _checkAndApplyPetLevelUp(petToUpdate, ownedPetIds, currentActivePetId, currentPets, tempUnlockedAchievements, gCoins);
    
    const finalPets = { ...currentPets, [levelUpResult.updatedPet.id]: levelUpResult.updatedPet };
     if (levelUpResult.updatedPet.id !== currentActivePetId && levelUpResult.newAllPets[levelUpResult.updatedPet.id]) { // if evolved
       setPets(levelUpResult.newAllPets);
       setOwnedPetIds(levelUpResult.newOwnedPetIds);
       setActivePetState(levelUpResult.newActivePetId);
    } else {
       setPets(finalPets);
    }

    return { updatedPets: finalPets, notifications: levelUpResult.notifications, updatedPlayerDataForAch: { unlockedAchievementIds: levelUpResult.newUnlockedAchievements } as PlayerData };
  }, [_checkAndApplyPetLevelUp, getPlayerAbilityMultiplier, ownedPetIds, gCoins, setPlayerDataOptimistic]);

  const handlePetDailyLogin = useCallback((currentActivePetId: PetId | null, currentPets: { [petId: string]: ActivePet }): { updatedPets?: { [petId: string]: ActivePet }, notifications: Omit<NotificationMessage, 'id'>[], updatedPlayerDataForAch?: PlayerData } => {
    if (!currentActivePetId || !currentPets[currentActivePetId]) return { notifications: [] };

    let petToUpdate = { ...currentPets[currentActivePetId] };
    const petXpPlayerBoost = getPlayerAbilityMultiplier(PetAbilityType.PET_XP_BOOST);
    petToUpdate.xp += Math.round(PET_XP_PER_DAILY_LOGIN * petXpPlayerBoost);

    let tempUnlockedAchievements: AchievementId[] = [];
    setPlayerDataOptimistic(prev => { tempUnlockedAchievements = prev.unlockedAchievementIds; return prev; });


    const levelUpResult = _checkAndApplyPetLevelUp(petToUpdate, ownedPetIds, currentActivePetId, currentPets, tempUnlockedAchievements, gCoins);
    
    const finalPets = { ...currentPets, [levelUpResult.updatedPet.id]: levelUpResult.updatedPet };
    if (levelUpResult.updatedPet.id !== currentActivePetId && levelUpResult.newAllPets[levelUpResult.updatedPet.id]) { 
       setPets(levelUpResult.newAllPets);
       setOwnedPetIds(levelUpResult.newOwnedPetIds);
       setActivePetState(levelUpResult.newActivePetId);
    } else {
       setPets(finalPets);
    }
    return { updatedPets: finalPets, notifications: levelUpResult.notifications, updatedPlayerDataForAch: { unlockedAchievementIds: levelUpResult.newUnlockedAchievements } as PlayerData };
  }, [_checkAndApplyPetLevelUp, getPlayerAbilityMultiplier, ownedPetIds, gCoins, setPlayerDataOptimistic]);


  const handlePetSpecialRequestFulfillment = useCallback((
    gameMode: GameMode,
    itemId: string,
    currentActivePetId: PetId | null,
    currentPets: { [petId: string]: ActivePet }
  ): { updatedPets?: { [petId: string]: ActivePet }, notifications: Omit<NotificationMessage, 'id'>[], updatedPlayerDataForAch?: PlayerData } => {
    if (!currentActivePetId || !currentPets[currentActivePetId]) return { notifications: [] };
    
    let petToUpdate = { ...currentPets[currentActivePetId] };
    const notifications: Omit<NotificationMessage, 'id'>[] = [];
    let tempUnlockedAchievements: AchievementId[] = [];
    setPlayerDataOptimistic(prev => { tempUnlockedAchievements = prev.unlockedAchievementIds; return prev; });


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
            notifications.push({ type: 'pet', titleKey: 'petSpecialRequestFulfilled', petName: petToUpdate.name });
            
            const achResult = _internalUnlockAchievement(AchievementId.PET_FULFILL_REQUEST_FIRST, gCoins, tempUnlockedAchievements);
            tempUnlockedAchievements = achResult.newUnlockedAchievements;
            if (achResult.notification) notifications.push(achResult.notification);
            
            // Auto-clear fulfilled request after a bit
            setTimeout(() => {
                setPets(current => {
                    if(current[currentActivePetId]?.specialRequest?.fulfilled) {
                        return {...current, [currentActivePetId]: {...current[currentActivePetId], specialRequest: null}};
                    }
                    return current;
                });
            }, 3000);
        }
    }
    
    const levelUpResult = _checkAndApplyPetLevelUp(petToUpdate, ownedPetIds, currentActivePetId, currentPets, tempUnlockedAchievements, gCoins);
    
    const finalPets = { ...currentPets, [levelUpResult.updatedPet.id]: levelUpResult.updatedPet };
     if (levelUpResult.updatedPet.id !== currentActivePetId && levelUpResult.newAllPets[levelUpResult.updatedPet.id]) { 
       setPets(levelUpResult.newAllPets);
       setOwnedPetIds(levelUpResult.newOwnedPetIds);
       setActivePetState(levelUpResult.newActivePetId);
    } else {
       setPets(finalPets);
    }

    notifications.push(...levelUpResult.notifications);
    return { updatedPets: finalPets, notifications, updatedPlayerDataForAch: { unlockedAchievementIds: levelUpResult.newUnlockedAchievements } as PlayerData };
  }, [_checkAndApplyPetLevelUp, gCoins, _internalUnlockAchievement, ownedPetIds, setPlayerDataOptimistic]);


  const setActivePet = useCallback((newActivePetId: PetId | null) => {
    if (newActivePetId && !ownedPetIds.includes(newActivePetId)) return;
    setActivePetState(newActivePetId);
  }, [ownedPetIds]);

  const applyPetCustomization = useCallback((petIdToCustomize: PetId, customization: PetCustomization): boolean => {
    if (!pets[petIdToCustomize]) return false;
    
    const updatedPetInstance = { ...pets[petIdToCustomize], customization: { ...pets[petIdToCustomize].customization, ...customization }};
    setPets(prev => ({ ...prev, [petIdToCustomize]: updatedPetInstance }));

    setPlayerDataOptimistic(prev => {
        let updatedData = {...prev};
        if (!updatedData.unlockedAchievementIds.includes(AchievementId.PET_CUSTOMIZED_FIRST) && Object.keys(customization).length > 0) {
            const achResult = unlockAchievement(AchievementId.PET_CUSTOMIZED_FIRST, updatedData);
            updatedData = achResult.updatedPlayerData;
            if (achResult.notification) addNotification(achResult.notification);
        }
        return updatedData;
    });
    
    const collarItem = PET_CUSTOMIZATION_ITEMS.find(item => item.data?.color === customization.collarColor);
    if (collarItem) {
         addNotification({
            type: 'pet', titleKey: 'petCustomizationApplied', petName: updatedPetInstance.name,
            itemName: UI_TEXT_TH[collarItem.nameKey]
        });
    } else if (customization.collarColor === undefined) { // Collar removed
         addNotification({
            type: 'pet', titleKey: 'petCustomizationApplied', petName: updatedPetInstance.name,
            itemName: "ปลอกคอถูกถอดออก"
        });
    }
    return true;
  }, [pets, setPlayerDataOptimistic, unlockAchievement, addNotification, UI_TEXT_TH]);

  const increasePetFoodCount = useCallback((amount: number) => {
    setPetFoodCount(prev => prev + amount);
  }, []);


  // Effect for periodic updates (hunger, boredom, special request)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (activePetId && pets[activePetId]) { // Only run if there's an active pet
        updatePetStatePeriodic();
      }
    }, 60000); // Run every minute
    return () => clearInterval(intervalId);
  }, [activePetId, pets, updatePetStatePeriodic]);


  return {
    ownedPetIds,
    activePetId,
    pets,
    petFoodCount,
    petInteractionCount,
    activePetInstance,
    adoptPet,
    feedPet,
    playWithPet,
    setActivePet,
    applyPetCustomization,
    handlePetXPForCorrectAnswer,
    handlePetDailyLogin,
    updatePetStatePeriodic,
    handlePetSpecialRequestFulfillment,
    increasePetFoodCount,
    getActivePetAbilityMultiplier,
  };
};

// Helper to get current pet ability multiplier, ensuring it uses the most up-to-date pet data
export const getCurrentPetAbilityMultiplier = (
    petId: PetId | null, 
    petsData: { [petId: string]: ActivePet }, 
    abilityType: PetAbilityType
): number => {
    if (petId && petsData[petId]) {
      const petInstance = petsData[petId];
      const petDef = PET_DEFINITIONS.find(def => def.id === petInstance.id);
      if (petDef?.ability?.type === abilityType) {
        if (!petDef.ability.condition || petDef.ability.condition(petInstance)) {
          return petDef.ability.value;
        }
      }
    }
    if (abilityType === PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES) return 0;
    return 1;
};
