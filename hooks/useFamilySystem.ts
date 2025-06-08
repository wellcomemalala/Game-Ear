
import { useCallback, useState } from 'react'; 
import {
  PlayerData,
  ChildData,
  ChildGrowthStage,
  ChildNeedType,
  ShopItemId,
  NotificationMessage,
  ThaiUIText,
  AchievementId,
  NPCId,
  UnlockedItemType,
  ChildEvent,
  AppView, 
  FamilyActivityId, // Added
} from '../types';
import {
  UI_TEXT_TH,
  CHILD_INITIAL_HAPPINESS, MAX_CHILD_HAPPINESS, CHILD_HAPPINESS_DECAY_RATE,
  CHILD_INITIAL_HUNGER, MAX_CHILD_HUNGER, CHILD_HUNGER_DECAY_RATE,
  CHILD_INITIAL_CLEANLINESS, MAX_CHILD_CLEANLINESS, CHILD_CLEANLINESS_DECAY_RATE,
  CHILD_INITIAL_AFFECTION, MAX_CHILD_AFFECTION, CHILD_AFFECTION_NEED_RATE,
  CHILD_GROWTH_DAYS_INFANT_TO_CRAWLER, CHILD_GROWTH_DAYS_CRAWLER_TO_TODDLER,
  CHILD_GROWTH_DAYS_TODDLER_TO_SCHOOL_AGE, 
  INITIAL_ACADEMIC_PERFORMANCE, TUITION_COST, SCHOOL_TERM_DAYS, HOMEWORK_HAPPINESS_REWARD, 
  getNPCName, SHOP_ITEMS, MARRIAGE_HAPPINESS_DECAY_AMOUNT,
  MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD,
  CHILD_INITIAL_SLEEPINESS, MAX_CHILD_SLEEPINESS, CHILD_SLEEPINESS_INCREASE_PER_HOUR,
  CHILD_SLEEPINESS_DECAY_WHEN_SLEEPING, CHILD_HAPPINESS_PENALTY_FOR_HIGH_SLEEPINESS,
  CHILD_SICKNESS_THRESHOLD_LOW_HAPPINESS, CHILD_SICKNESS_THRESHOLD_LOW_NEEDS,
  CHILD_SICKNESS_DURATION_DAYS, CHILD_SICKNESS_HAPPINESS_MULTIPLIER,
  ACADEMIC_PERFORMANCE_IMPROVEMENT_HOMEWORK, ACADEMIC_PERFORMANCE_IMPROVEMENT_TUITION,
  ACADEMIC_PERFORMANCE_PENALTY_NEGLECT, CHILD_MIN_HAPPINESS_FOR_GOOD_GRADES,
  CHILD_ACADEMIC_PERFORMANCE_NOTIFICATION_THRESHOLD, HOMEWORK_NEGLECT_DAYS_THRESHOLD,
  ACADEMIC_PERFORMANCE_CHANGE_LOW_HAPPINESS_DAYS,
  FAMILY_ACTIVITY_NEGLECT_THRESHOLD_DAYS, FAMILY_HAPPINESS_DECAY_ON_NEGLECT, // Added
  BIRTHDAY_CAKE_COST, BIRTHDAY_CELEBRATION_HAPPINESS_GAIN, // Added
  getNPCDefinition, // Added
  MAX_MARRIAGE_HAPPINESS, // Added
} from '../constants';


// Props for the hook
export interface UseFamilySystemProps {
  playerData: Readonly<PlayerData>; 
  setPlayerDataOptimistic: (updater: (prevData: PlayerData) => PlayerData) => void;
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  unlockAchievementInternal: (achievementId: AchievementId, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> };
  navigateToChildNaming: () => void; 
}

// Return type of the hook
export interface FamilySystemReturn {
  initiateChildEvent: () => boolean;
  setChildName: (name: string) => void;
  feedChild: (itemId: ShopItemId.MILK_POWDER | ShopItemId.BABY_FOOD) => void;
  playWithChild: () => void;
  changeChildDiaper: () => void;
  handleChildDailyUpdate: () => void;
  sootheChildToSleep: () => void;
  useChildCareKit: () => void;
  payTuition: () => void; 
  helpWithHomework: () => void; 
  celebrateBirthday: (target: 'child' | 'spouse') => { success: boolean; messageKey?: keyof ThaiUIText }; // Added
}


const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useFamilySystem = ({
  playerData, 
  setPlayerDataOptimistic,
  addNotification,
  unlockAchievementInternal,
  navigateToChildNaming,
}: UseFamilySystemProps): FamilySystemReturn => {
  const [homeworkAvailableSince, setHomeworkAvailableSince] = useState<number | null>(null);
  const [lowHappinessStreak, setLowHappinessStreak] = useState<number>(0);

  const initiateChildEvent = useCallback((): boolean => {
    if (!playerData.isMarried || !playerData.spouseId) {
      addNotification({ type: 'info', titleKey: 'appName', messageKey: undefined, itemName: "คุณต้องแต่งงานก่อนถึงจะมีลูกได้" });
      return false;
    }
    if (playerData.houseLevel < 3) {
      addNotification({ type: 'info', titleKey: 'appName', messageKey: undefined, itemName: "บ้านของคุณต้องมีระดับ 3 ก่อนถึงจะมีลูกได้" });
      return false;
    }
    if (!playerData.babyCribOwned) {
      addNotification({ type: 'info', titleKey: 'appName', messageKey: undefined, itemName: "คุณต้องมี 'เตียงเด็ก' ก่อนถึงจะมีลูกได้" });
      return false;
    }
    if (playerData.childData) {
      addNotification({ type: 'info', titleKey: 'appName', messageKey: undefined, itemName: "คุณมีลูกแล้ว! (ระบบปัจจุบันรองรับลูกหนึ่งคน)" });
      return false;
    }
    addNotification({
      type: 'family',
      titleKey: 'familyEventInProgressTitle',
      messageKey: 'familyChildNamingPrompt',
      npcName: getNPCName(playerData.spouseId, UI_TEXT_TH)
    });
    navigateToChildNaming(); 
    return true; 
  }, [playerData, addNotification, UI_TEXT_TH, navigateToChildNaming]);

  const setChildName = useCallback((name: string) => {
    setPlayerDataOptimistic(prev => {
      if (!prev.isMarried || prev.childData) return prev;

      const newChildData: ChildData = {
        name: name,
        growthStage: ChildGrowthStage.INFANT,
        ageInDays: 0,
        lastCheckedTimestamp: Date.now(),
        happiness: CHILD_INITIAL_HAPPINESS,
        hunger: CHILD_INITIAL_HUNGER,
        cleanliness: CHILD_INITIAL_CLEANLINESS,
        affection: CHILD_INITIAL_AFFECTION,
        sleepiness: CHILD_INITIAL_SLEEPINESS,
        lastSleptTimestamp: 0,
        pendingNeeds: [],
        lastFedTimestamp: 0,
        lastCleanedTimestamp: 0,
        lastPlayedTimestamp: 0,
        eventFlags: {},
        isSick: false,
        sickDaysCounter: 0,
        academicPerformance: INITIAL_ACADEMIC_PERFORMANCE, 
        tuitionDueDate: null, 
        homeworkAvailable: false,
        birthday: { month: Math.floor(Math.random() * 12) + 1, day: Math.floor(Math.random() * 28) + 1} 
      };

      let updatedData = { ...deepClone(prev), childData: newChildData, lastChildCareInteractionTimestamp: Date.now() };
      let localNotifications: Omit<NotificationMessage, 'id'>[] = [];

      localNotifications.push({
        type: 'family',
        titleKey: 'familyChildBornTitle',
        messageKey: 'familyChildBornMessage',
        childName: name,
        npcName: prev.spouseId ? getNPCName(prev.spouseId, UI_TEXT_TH) : ""
      });

      const achResult = unlockAchievementInternal(AchievementId.HAVE_FIRST_CHILD, updatedData);
      updatedData = achResult.updatedPlayerData;
      if (achResult.notification) localNotifications.push(achResult.notification);

      localNotifications.forEach(addNotification);
      return updatedData;
    });
  }, [setPlayerDataOptimistic, addNotification, unlockAchievementInternal, UI_TEXT_TH]);

  const feedChild = useCallback((itemId: ShopItemId.MILK_POWDER | ShopItemId.BABY_FOOD) => {
    setPlayerDataOptimistic(prev => {
      if (!prev.childData || prev.childData.isSick) return prev;

      const itemDef = SHOP_ITEMS.find(item => item.id === itemId && item.type === UnlockedItemType.CHILD_CARE);
      if (!itemDef) return prev;

      let updatedData = deepClone(prev);
      let child = updatedData.childData!;
      let itemKeyToDecrement: 'milkPowderCount' | 'babyFoodCount' | null = null;
      if (itemId === ShopItemId.MILK_POWDER) itemKeyToDecrement = 'milkPowderCount';
      else if (itemId === ShopItemId.BABY_FOOD) itemKeyToDecrement = 'babyFoodCount';

      if (!itemKeyToDecrement || updatedData[itemKeyToDecrement] <= 0) {
        addNotification({ type: 'info', titleKey: 'notEnoughItemToCareChild', messageKey: undefined, itemName: UI_TEXT_TH[itemDef.nameKey] });
        return prev;
      }
      updatedData[itemKeyToDecrement]--;

      const hungerValue = (itemDef.data?.hungerValue || 50);
      child.hunger = Math.min(MAX_CHILD_HUNGER, child.hunger + hungerValue);
      child.happiness = Math.min(MAX_CHILD_HAPPINESS, child.happiness + 10);
      child.lastFedTimestamp = Date.now();
      child.pendingNeeds = child.pendingNeeds.filter(need => need !== ChildNeedType.HUNGER);
      updatedData.lastChildCareInteractionTimestamp = Date.now();
      addNotification({ type: 'family', titleKey: 'appName', messageKey: undefined, childName: child.name, itemName: `${UI_TEXT_TH.feedChildNotification.replace('{childName}', child.name)} ด้วย ${UI_TEXT_TH[itemDef.nameKey]}` });
      return updatedData;
    });
  }, [setPlayerDataOptimistic, addNotification, UI_TEXT_TH]);

  const playWithChild = useCallback(() => {
    setPlayerDataOptimistic(prev => {
      if (!prev.childData || prev.childData.isSick) return prev;
      let updatedData = deepClone(prev);
      let child = updatedData.childData!;
      child.affection = Math.min(MAX_CHILD_AFFECTION, child.affection + 25);
      child.happiness = Math.min(MAX_CHILD_HAPPINESS, child.happiness + 15);
      child.lastPlayedTimestamp = Date.now();
      child.pendingNeeds = child.pendingNeeds.filter(need => need !== ChildNeedType.AFFECTION);
      updatedData.lastChildCareInteractionTimestamp = Date.now();
      addNotification({ type: 'family', titleKey: 'appName', messageKey: undefined, childName: child.name, itemName: UI_TEXT_TH.playWithChildNotification.replace('{childName}', child.name) });
      return updatedData;
    });
  }, [setPlayerDataOptimistic, addNotification, UI_TEXT_TH]);

  const changeChildDiaper = useCallback(() => {
    setPlayerDataOptimistic(prev => {
      if (!prev.childData || prev.childData.isSick) return prev;
      const itemDef = SHOP_ITEMS.find(item => item.id === ShopItemId.DIAPERS && item.type === UnlockedItemType.CHILD_CARE);
      if (!itemDef) return prev;
      let updatedData = deepClone(prev);
      let child = updatedData.childData!;
      if (updatedData.diapersCount <= 0) {
        addNotification({ type: 'info', titleKey: 'notEnoughItemToCareChild', messageKey: undefined, itemName: UI_TEXT_TH[itemDef.nameKey] });
        return prev;
      }
      updatedData.diapersCount--;
      const cleanlinessValue = (itemDef.data?.cleanlinessValue || 80);
      child.cleanliness = Math.min(MAX_CHILD_CLEANLINESS, child.cleanliness + cleanlinessValue);
      child.happiness = Math.min(MAX_CHILD_HAPPINESS, child.happiness + 5);
      child.lastCleanedTimestamp = Date.now();
      child.pendingNeeds = child.pendingNeeds.filter(need => need !== ChildNeedType.CLEANLINESS);
      updatedData.lastChildCareInteractionTimestamp = Date.now();
      addNotification({ type: 'family', titleKey: 'appName', messageKey: undefined, childName: child.name, itemName: UI_TEXT_TH.changeDiaperNotification.replace('{childName}', child.name) });
      return updatedData;
    });
  }, [setPlayerDataOptimistic, addNotification, UI_TEXT_TH]);

  const sootheChildToSleep = useCallback(() => {
    setPlayerDataOptimistic(prev => {
      if (!prev.childData || prev.childData.sleepiness === 0) return prev;
      let updatedData = deepClone(prev);
      let child = updatedData.childData!;
      child.sleepiness = 0;
      child.happiness = Math.min(MAX_CHILD_HAPPINESS, child.happiness + 10);
      child.lastSleptTimestamp = Date.now();
      child.pendingNeeds = child.pendingNeeds.filter(need => need !== ChildNeedType.SLEEP);
      updatedData.lastChildCareInteractionTimestamp = Date.now();
      addNotification({ type: 'family', titleKey: 'appName', messageKey: undefined, childName: child.name, itemName: UI_TEXT_TH.sootheToSleepNotification.replace('{childName}', child.name) });
      return updatedData;
    });
  }, [setPlayerDataOptimistic, addNotification, UI_TEXT_TH]);

  const useChildCareKit = useCallback(() => {
    setPlayerDataOptimistic(prev => {
      if (!prev.childData || !prev.childData.isSick) return prev;
      const kitDef = SHOP_ITEMS.find(item => item.id === ShopItemId.CHILD_CARE_KIT && item.type === UnlockedItemType.CHILD_CARE);
      if (!kitDef) return prev;
      let updatedData = deepClone(prev);
      let child = updatedData.childData!;
      if ((updatedData.childCareKitCount || 0) <= 0) {
        addNotification({ type: 'info', titleKey: 'notEnoughItemToCareChild', messageKey: undefined, itemName: UI_TEXT_TH[kitDef.nameKey] });
        return prev;
      }
      updatedData.childCareKitCount = (updatedData.childCareKitCount || 0) -1;
      child.isSick = false;
      child.sickDaysCounter = 0;
      child.happiness = Math.min(MAX_CHILD_HAPPINESS, child.happiness + (kitDef.data?.happinessBoost || 20));
      child.pendingNeeds = child.pendingNeeds.filter(need => need !== ChildNeedType.SICKNESS);
      updatedData.lastChildCareInteractionTimestamp = Date.now();
      addNotification({ type: 'family', titleKey: 'appName', messageKey: undefined, childName: child.name, itemName: UI_TEXT_TH.childCareKitUsedNotification.replace('{childName}', child.name) });
      addNotification({ type: 'family', titleKey: 'appName', messageKey: undefined, childName: child.name, itemName: UI_TEXT_TH.childRecoveredNotification.replace('{childName}', child.name) });
      return updatedData;
    });
  }, [setPlayerDataOptimistic, addNotification, UI_TEXT_TH]);

  const payTuition = useCallback(() => {
    setPlayerDataOptimistic(prev => {
        if (!prev.childData || prev.childData.growthStage !== ChildGrowthStage.SCHOOL_AGE) return prev;
        if (prev.gCoins < TUITION_COST) {
            addNotification({ type: 'family', titleKey: 'tuitionPaymentFailedNotEnoughGcoins', childName: prev.childData.name, tuitionAmount: TUITION_COST });
            return prev;
        }

        let updatedData = deepClone(prev);
        let child = updatedData.childData!;
        
        updatedData.gCoins -= TUITION_COST; 

        child.tuitionDueDate = Date.now() + SCHOOL_TERM_DAYS * 24 * 60 * 60 * 1000; 
        const oldGrade = child.academicPerformance;
        child.academicPerformance = ACADEMIC_PERFORMANCE_IMPROVEMENT_TUITION[child.academicPerformance] || child.academicPerformance;
        
        addNotification({ type: 'family', titleKey: 'tuitionPaidSuccess', childName: child.name, tuitionAmount: TUITION_COST });
        
        if (child.academicPerformance !== oldGrade) {
             addNotification({type: 'family', titleKey: 'appName', messageKey: 'academicPerformanceImprovedMessage', childName: child.name, academicPerformance: child.academicPerformance });
        }
        return updatedData; 
    });
  }, [setPlayerDataOptimistic, addNotification]);

  const helpWithHomework = useCallback(() => {
    setPlayerDataOptimistic(prev => {
        if (!prev.childData || !prev.childData.homeworkAvailable || prev.childData.growthStage !== ChildGrowthStage.SCHOOL_AGE) return prev;
        
        let updatedData = deepClone(prev);
        let child = updatedData.childData!;

        child.homeworkAvailable = false;
        setHomeworkAvailableSince(null); 
        child.happiness = Math.min(MAX_CHILD_HAPPINESS, child.happiness + HOMEWORK_HAPPINESS_REWARD);
        const oldGrade = child.academicPerformance;
        child.academicPerformance = ACADEMIC_PERFORMANCE_IMPROVEMENT_HOMEWORK[child.academicPerformance] || child.academicPerformance;

        addNotification({ type: 'family', titleKey: 'homeworkHelpedSuccess', childName: child.name });
        if (child.academicPerformance !== oldGrade) {
             addNotification({type: 'family', titleKey: 'appName', messageKey: 'academicPerformanceImprovedMessage', childName: child.name, academicPerformance: child.academicPerformance });
        }
        return { ...updatedData, childData: child };
    });
  }, [setPlayerDataOptimistic, addNotification, setHomeworkAvailableSince]);

  const handleChildDailyUpdate = useCallback(() => {
    setPlayerDataOptimistic(prev => {
      if (!prev) return prev;
      let updatedData = deepClone(prev);
      const now = Date.now();
      const currentDate = new Date(now);
      const currentMonth = currentDate.getMonth() + 1; // JS months are 0-indexed
      const currentDayOfMonth = currentDate.getDate();
      let localNotifications: Omit<NotificationMessage, 'id'>[] = [];
      let needsUpdateForUI = false; // Flag to ensure state update if only notifications are added
      
      const lastDailyUpdateTimestamp = prev.lastChildCareInteractionTimestamp || 0; // Use a more generic daily update tracker if available
      const isNewDayForDailyFamilyUpdates = new Date(now).setHours(0,0,0,0) > new Date(lastDailyUpdateTimestamp).setHours(0,0,0,0);


      if (prev.childData) {
          let child = updatedData.childData!;
          const lastCheckedDayStart = new Date(child.lastCheckedTimestamp).setHours(0,0,0,0);
          const isNewDayForChild = new Date(now).setHours(0,0,0,0) > lastCheckedDayStart;

          const hoursSinceLastStatCheck = (now - child.lastCheckedTimestamp) / (1000 * 60 * 60);
          if (hoursSinceLastStatCheck >= 1 || isNewDayForChild) {
              needsUpdateForUI = true;
              const decayMultiplier = child.isSick ? CHILD_SICKNESS_HAPPINESS_MULTIPLIER : 1;
              child.hunger = Math.max(0, child.hunger - CHILD_HUNGER_DECAY_RATE * hoursSinceLastStatCheck);
              child.cleanliness = Math.max(0, child.cleanliness - CHILD_CLEANLINESS_DECAY_RATE * hoursSinceLastStatCheck);
              child.affection = Math.max(0, child.affection - CHILD_AFFECTION_NEED_RATE * hoursSinceLastStatCheck);
              child.sleepiness = Math.min(MAX_CHILD_SLEEPINESS, child.sleepiness + (child.sleepiness === 0 ? 0 : CHILD_SLEEPINESS_INCREASE_PER_HOUR * hoursSinceLastStatCheck) );
              
              let happinessChangeDueToNeeds = 0;
              const newPendingNeeds: ChildNeedType[] = [];
              if (child.hunger < 30) { happinessChangeDueToNeeds -= (CHILD_HAPPINESS_DECAY_RATE * hoursSinceLastStatCheck * 1.5 * decayMultiplier); newPendingNeeds.push(ChildNeedType.HUNGER); }
              if (child.cleanliness < 30) { happinessChangeDueToNeeds -= (CHILD_HAPPINESS_DECAY_RATE * hoursSinceLastStatCheck * 1.2 * decayMultiplier); newPendingNeeds.push(ChildNeedType.CLEANLINESS); }
              if (child.affection < 30) { happinessChangeDueToNeeds -= (CHILD_HAPPINESS_DECAY_RATE * hoursSinceLastStatCheck * decayMultiplier); newPendingNeeds.push(ChildNeedType.AFFECTION); }
              if (child.sleepiness >= MAX_CHILD_SLEEPINESS && child.lastSleptTimestamp < now - (1000 * 60 * 10)) { happinessChangeDueToNeeds -= (CHILD_HAPPINESS_DECAY_RATE * hoursSinceLastStatCheck * 1.8 * decayMultiplier); newPendingNeeds.push(ChildNeedType.SLEEP); }

              child.pendingNeeds = [...new Set(newPendingNeeds)];
              child.happiness = Math.max(0, Math.min(MAX_CHILD_HAPPINESS, child.happiness + happinessChangeDueToNeeds));
              
              if (child.happiness < CHILD_MIN_HAPPINESS_FOR_GOOD_GRADES) {
                setLowHappinessStreak(prevStreak => prevStreak + (isNewDayForChild ? 1 : 0));
              } else {
                setLowHappinessStreak(0);
              }
              child.lastCheckedTimestamp = now;
          }
          
          if (isNewDayForChild) {
              child.ageInDays += 1;
              needsUpdateForUI = true;

              // Child Growth
              if (child.growthStage === ChildGrowthStage.TODDLER && child.ageInDays >= (CHILD_GROWTH_DAYS_INFANT_TO_CRAWLER + CHILD_GROWTH_DAYS_CRAWLER_TO_TODDLER + CHILD_GROWTH_DAYS_TODDLER_TO_SCHOOL_AGE) && !child.eventFlags?.[ChildEvent.STARTED_SCHOOL]) {
                  child.growthStage = ChildGrowthStage.SCHOOL_AGE;
                  child.eventFlags = { ...(child.eventFlags || {}), [ChildEvent.STARTED_SCHOOL]: true };
                  child.academicPerformance = INITIAL_ACADEMIC_PERFORMANCE;
                  child.tuitionDueDate = Date.now() + SCHOOL_TERM_DAYS * 24 * 60 * 60 * 1000; 
                  child.homeworkAvailable = false; 
                  localNotifications.push({ type: 'family', titleKey: 'childStartsSchoolNotification', childName: child.name, childGrowthStage: ChildGrowthStage.SCHOOL_AGE });
              } else if (child.growthStage === ChildGrowthStage.INFANT && child.ageInDays >= CHILD_GROWTH_DAYS_INFANT_TO_CRAWLER) {
                  child.growthStage = ChildGrowthStage.CRAWLER;
                  localNotifications.push({ type: 'family', titleKey: 'childGrowsTitle', messageKey: 'childGrowsToCrawlerMessage', childName: child.name, childGrowthStage: ChildGrowthStage.CRAWLER });
              } else if (child.growthStage === ChildGrowthStage.CRAWLER && child.ageInDays >= (CHILD_GROWTH_DAYS_INFANT_TO_CRAWLER + CHILD_GROWTH_DAYS_CRAWLER_TO_TODDLER)) {
                  child.growthStage = ChildGrowthStage.TODDLER;
                  localNotifications.push({ type: 'family', titleKey: 'childGrowsTitle', messageKey: 'childGrowsToToddlerMessage', childName: child.name, childGrowthStage: ChildGrowthStage.TODDLER });
              }

              // School Age Logic
              if (child.growthStage === ChildGrowthStage.SCHOOL_AGE) {
                  const oldGradeBeforeDailyChecks = child.academicPerformance;
                  if (child.tuitionDueDate && now > child.tuitionDueDate) {
                      child.academicPerformance = ACADEMIC_PERFORMANCE_PENALTY_NEGLECT[child.academicPerformance] || child.academicPerformance;
                      localNotifications.push({ type: 'family', titleKey: 'tuitionOverdueNotification', childName: child.name, tuitionAmount: TUITION_COST });
                  }
                  if (child.homeworkAvailable && !homeworkAvailableSince) {
                      setHomeworkAvailableSince(now);
                  } else if (child.homeworkAvailable && homeworkAvailableSince && (now - homeworkAvailableSince) / (1000 * 60 * 60 * 24) > HOMEWORK_NEGLECT_DAYS_THRESHOLD) {
                      child.academicPerformance = ACADEMIC_PERFORMANCE_PENALTY_NEGLECT[child.academicPerformance] || child.academicPerformance;
                      setHomeworkAvailableSince(null); 
                  }
                  if (lowHappinessStreak >= ACADEMIC_PERFORMANCE_CHANGE_LOW_HAPPINESS_DAYS && child.happiness < CHILD_MIN_HAPPINESS_FOR_GOOD_GRADES) {
                       child.academicPerformance = ACADEMIC_PERFORMANCE_PENALTY_NEGLECT[child.academicPerformance] || child.academicPerformance;
                       setLowHappinessStreak(0); 
                  }

                  if (child.academicPerformance !== oldGradeBeforeDailyChecks) {
                     localNotifications.push({type: 'family', titleKey: 'appName', messageKey: child.academicPerformance < oldGradeBeforeDailyChecks ? 'academicPerformanceDeclinedMessage' : 'academicPerformanceImprovedMessage', childName: child.name, academicPerformance: child.academicPerformance });
                     if (child.academicPerformance <= CHILD_ACADEMIC_PERFORMANCE_NOTIFICATION_THRESHOLD) {
                        localNotifications.push({type: 'family', titleKey: 'appName', messageKey: 'teacherMeetingNotification', childName: child.name });
                     }
                  }

                  if (!child.homeworkAvailable && Math.random() < 0.33) { 
                      child.homeworkAvailable = true;
                      setHomeworkAvailableSince(now);
                      localNotifications.push({ type: 'family', titleKey: 'homeworkAvailableNotification', childName: child.name });
                      needsUpdateForUI = true;
                  }
              }

              // Sickness
              if (!child.isSick) {
                if (child.happiness < CHILD_SICKNESS_THRESHOLD_LOW_HAPPINESS || child.hunger < CHILD_SICKNESS_THRESHOLD_LOW_NEEDS || child.cleanliness < CHILD_SICKNESS_THRESHOLD_LOW_NEEDS) {
                    child.isSick = true;
                    child.sickDaysCounter = 0;
                    child.pendingNeeds = [...new Set([...child.pendingNeeds, ChildNeedType.SICKNESS])];
                    localNotifications.push({ type: 'family', titleKey: 'appName', messageKey: undefined, itemName: UI_TEXT_TH.childSickNotification.replace('{childName}', child.name) });
                }
              } else {
                child.sickDaysCounter += 1;
                if (child.sickDaysCounter >= CHILD_SICKNESS_DURATION_DAYS) {
                    child.isSick = false;
                    child.sickDaysCounter = 0;
                    child.pendingNeeds = child.pendingNeeds.filter(n => n !== ChildNeedType.SICKNESS);
                    localNotifications.push({ type: 'family', titleKey: 'appName', messageKey: undefined, itemName: UI_TEXT_TH.childRecoveredNotification.replace('{childName}', child.name) });
                }
              }
              // Child Birthday Check
              if (child.birthday && child.birthday.month === currentMonth && child.birthday.day === currentDayOfMonth) {
                  localNotifications.push({ type: 'family', titleKey: 'birthdayNotificationTitle', messageKey: 'childBirthdayMessage', childName: child.name });
                  needsUpdateForUI = true;
              }
          }
          updatedData.childData = child;
      }

      // Spouse Birthday Check
      if (prev.isMarried && prev.spouseId) {
          const spouseDef = getNPCDefinition(prev.spouseId);
          if (spouseDef?.birthday && spouseDef.birthday.month === currentMonth && spouseDef.birthday.day === currentDayOfMonth) {
              localNotifications.push({ type: 'family', titleKey: 'birthdayNotificationTitle', messageKey: 'spouseBirthdayMessage', spouseName: getNPCName(prev.spouseId, UI_TEXT_TH) });
              needsUpdateForUI = true;
          }
      }
      
      // Family Activity Neglect (Run this check on a new day for family updates)
      if (isNewDayForDailyFamilyUpdates && prev.isMarried && (prev.childData || prev.spouseId) ) { // Check if there's a family to neglect
          const lastActivity = prev.lastFamilyActivityDate || 0;
          const daysSinceLastActivity = (now - lastActivity) / (1000 * 60 * 60 * 24);

          if (lastActivity !== 0 && daysSinceLastActivity > FAMILY_ACTIVITY_NEGLECT_THRESHOLD_DAYS) {
              if (updatedData.childData) {
                  updatedData.childData.happiness = Math.max(0, updatedData.childData.happiness - FAMILY_HAPPINESS_DECAY_ON_NEGLECT);
              }
              updatedData.marriageHappiness = Math.max(0, updatedData.marriageHappiness - FAMILY_HAPPINESS_DECAY_ON_NEGLECT);
              localNotifications.push({ type: 'family', titleKey: 'appName', messageKey: 'familyNeglectMessage' });
              needsUpdateForUI = true;
          }
      }


      localNotifications.forEach(addNotification);
      if (!needsUpdateForUI && localNotifications.length === 0) return prev; // No actual data change or notification
      return { ...updatedData, lastChildCareInteractionTimestamp: now }; // Update timestamp for daily family updates
    });
  }, [setPlayerDataOptimistic, addNotification, UI_TEXT_TH, homeworkAvailableSince, lowHappinessStreak]);

  const celebrateBirthday = useCallback((target: 'child' | 'spouse'): { success: boolean; messageKey?: keyof ThaiUIText } => {
    let result: { success: boolean; messageKey?: keyof ThaiUIText } = { success: false, messageKey: 'genericError' };
    setPlayerDataOptimistic(prev => {
        if (!prev) return prev;
        
        let targetName = "";
        if (target === 'child' && prev.childData) {
            targetName = prev.childData.name;
        } else if (target === 'spouse' && prev.spouseId) {
            targetName = getNPCName(prev.spouseId, UI_TEXT_TH);
        } else {
            result = { success: false, messageKey: 'genericError' }; // Should not happen if UI calls this correctly
            return prev;
        }

        if (prev.gCoins < BIRTHDAY_CAKE_COST) {
            result = { success: false, messageKey: 'notEnoughGCoins' };
            addNotification({ type: 'info', titleKey: 'notEnoughGCoins', itemName: UI_TEXT_TH.shopItem_BIRTHDAY_CAKE_name });
            return prev;
        }

        let updatedData = deepClone(prev);
        updatedData.gCoins -= BIRTHDAY_CAKE_COST;
        
        if (target === 'child' && updatedData.childData) {
            updatedData.childData.happiness = Math.min(MAX_CHILD_HAPPINESS, updatedData.childData.happiness + BIRTHDAY_CELEBRATION_HAPPINESS_GAIN);
        }
        // Always increase marriage happiness regardless of target, as it's a family celebration
        updatedData.marriageHappiness = Math.min(MAX_MARRIAGE_HAPPINESS, updatedData.marriageHappiness + BIRTHDAY_CELEBRATION_HAPPINESS_GAIN);
        
        updatedData.lastFamilyActivityDate = Date.now();

        addNotification({
            type: 'familyActivity',
            titleKey: 'celebrateBirthdaySuccessMessage',
            messageKey: 'celebrateBirthdaySuccessMessage', // Using the same for message for now
            birthdayPersonName: targetName
        });
        result = { success: true, messageKey: 'celebrateBirthdaySuccessMessage' };
        return updatedData;
    });
    return result;
  }, [setPlayerDataOptimistic, addNotification, UI_TEXT_TH]);

  return {
    initiateChildEvent,
    setChildName,
    feedChild,
    playWithChild,
    changeChildDiaper,
    handleChildDailyUpdate,
    sootheChildToSleep,
    useChildCareKit,
    payTuition,
    helpWithHomework,
    celebrateBirthday, 
  };
}