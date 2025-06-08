
import { useCallback } from 'react';
import {
  PlayerData, NPCId, MementoId, RelationshipData, ThaiUIText, NotificationMessage,
  AchievementId, GiftResult, RelationshipStatus, UnlockedItemType, ShopItemId, NPCDefinition, GiftPreferenceLevel, MissionType
} from '../types';
import {
  UI_TEXT_TH as staticUiText, getNPCName, ALL_MEMENTOS, getMementoDefinition,
  MEMENTO_GIFT_RP_GAIN_MELODIE, MEMENTO_GIFT_RP_GAIN_RHYTHM, MEMENTO_GIFT_RP_GAIN_HARMONIE,
  RP_GAIN_PER_INTERACTION, RP_DECAY_DAYS_THRESHOLD, RP_DECAY_AMOUNT,
  MAX_FRIEND_RP, MAX_DATING_RP, INITIAL_MARRIAGE_HAPPINESS, MARRIAGE_HAPPINESS_DECAY_THRESHOLD_DAYS,
  MARRIAGE_HAPPINESS_DECAY_AMOUNT, MARRIAGE_HAPPINESS_GAIN_INTERACTION, MARRIAGE_HAPPINESS_GAIN_GIFT,
  MAX_MARRIAGE_HAPPINESS, MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD,
  RP_THRESHOLD_EVENT_1, RP_THRESHOLD_EVENT_2, RP_THRESHOLD_EVENT_3, getNPCEventId,
  getNPCDefinition, RP_GAIN_GIFT_LOVED, RP_GAIN_GIFT_LIKED, RP_GAIN_GIFT_NEUTRAL, RP_CHANGE_GIFT_DISLIKED, SHOP_ITEMS,
  SPOUSAL_BONUS_GCOIN_CHANCE_RHYTHM, SPOUSAL_BONUS_GCOIN_AMOUNT_RHYTHM
} from '../constants';
import { MissionTargetDetails } from './useMissionSystem';


interface UseRelationshipSystemProps {
  initialPlayerData: Readonly<PlayerData>;
  setPlayerDataOptimistic: (updater: (prevData: PlayerData) => PlayerData) => void;
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  unlockAchievementInternal: (achievementId: AchievementId, currentPlayerData: PlayerData) => { updatedPlayerData: PlayerData, notification?: Omit<NotificationMessage, 'id'> };
  uiText: ThaiUIText;
  updateMissionProgressForGifting: (missionType: MissionType, currentPlayerData: PlayerData, valueIncrement?: number, targetDetails?: MissionTargetDetails) => PlayerData;
}

export interface RelationshipSystemReturn {
  interactWithNpc: (npcId: NPCId) => void;
  giveGiftToNpc: (npcId: NPCId, itemId: string, itemType: UnlockedItemType) => GiftResult;
  confessToNpc: (npcId: NPCId) => { success: boolean, messageKey?: keyof ThaiUIText };
  proposeToNpc: (npcId: NPCId) => { success: boolean, messageKey?: keyof ThaiUIText };
  markEventAsViewed: (npcId: NPCId, eventId: string) => void;
  handleDailyRelationshipUpdates: (isNewDay: boolean) => void;
  getRelationshipDataForNpc: (npcId: NPCId) => RelationshipData | undefined;
  getRawRelationships: () => RelationshipData[];
  goOnDate: (npcId: NPCId) => { success: boolean, messageKey?: keyof ThaiUIText };
}

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));
const SPECIAL_DATE_COST = 50;
const SPECIAL_DATE_MARRIAGE_HAPPINESS_GAIN = 15;
const SPECIAL_DATE_DATING_RP_GAIN = 10;


export const useRelationshipSystem = ({
  initialPlayerData: playerData, 
  setPlayerDataOptimistic,
  addNotification,
  unlockAchievementInternal,
  uiText,
  updateMissionProgressForGifting,
}: UseRelationshipSystemProps): RelationshipSystemReturn => {

  const checkForAndTriggerEvents = useCallback((
    npcRel: RelationshipData,
    npcId: NPCId,
    currentPlayerData: Readonly<PlayerData>
  ): { updatedEventFlags: { [eventId: string]: boolean }, updatedAchievements: AchievementId[], eventNotifications: Omit<NotificationMessage, 'id'>[] } => {
    const eventFlags = { ...(npcRel.eventFlags || {}) };
    let newAchievementsCopy = [...currentPlayerData.unlockedAchievementIds];
    const eventNotifications: Omit<NotificationMessage, 'id'>[] = [];
    const npcName = getNPCName(npcId, uiText);

    const eventThresholds = [
      { level: 1, threshold: RP_THRESHOLD_EVENT_1, achId: npcId === NPCId.MELODIE ? AchievementId.MELODIE_EVENT_1 : npcId === NPCId.RHYTHM ? AchievementId.RHYTHM_EVENT_1 : AchievementId.HARMONIE_EVENT_1 },
      { level: 2, threshold: RP_THRESHOLD_EVENT_2, achId: npcId === NPCId.MELODIE ? AchievementId.MELODIE_EVENT_2 : npcId === NPCId.RHYTHM ? AchievementId.RHYTHM_EVENT_2 : AchievementId.HARMONIE_EVENT_2 },
      { level: 3, threshold: RP_THRESHOLD_EVENT_3, achId: npcId === NPCId.MELODIE ? AchievementId.MELODIE_EVENT_3 : npcId === NPCId.RHYTHM ? AchievementId.RHYTHM_EVENT_3 : AchievementId.HARMONIE_EVENT_3 },
    ];

    for (const eventDef of eventThresholds) {
      const eventId = getNPCEventId(npcId, eventDef.level as 1 | 2 | 3);
      if (npcRel.status !== RelationshipStatus.DATING && npcRel.status !== RelationshipStatus.MARRIED &&
          npcRel.rp >= eventDef.threshold && !eventFlags[eventId]) {
        eventFlags[eventId] = true;
        eventNotifications.push({
          type: 'info',
          titleKey: 'relationshipEventTriggered',
          npcName: npcName,
          eventName: uiText.relationshipEventTriggered.replace('{npcName}', npcName)
        });

        if (eventDef.achId && !newAchievementsCopy.includes(eventDef.achId)) {
          const achResult = unlockAchievementInternal(eventDef.achId, { ...currentPlayerData, unlockedAchievementIds: newAchievementsCopy });
          newAchievementsCopy = achResult.updatedPlayerData.unlockedAchievementIds;
          if (achResult.notification) eventNotifications.push(achResult.notification);
        }
      }
    }
    return { updatedEventFlags: eventFlags, updatedAchievements: newAchievementsCopy, eventNotifications: eventNotifications };
  }, [uiText, unlockAchievementInternal]);


  const interactWithNpc = useCallback((npcIdToInteract: NPCId) => {
    setPlayerDataOptimistic(prev => {
      if (!prev) return prev;
      const relationshipsCopy = deepClone(prev.relationships);
      let currentAchievements = [...prev.unlockedAchievementIds];
      const localNotifications: Omit<NotificationMessage, 'id'>[] = [];
      let newMarriageHappiness = prev.marriageHappiness;
      let newLastSpouseInteractionDate = prev.lastSpouseInteractionDate;

      let npcRel = relationshipsCopy.find(r => r.npcId === npcIdToInteract);
      if (!npcRel) {
        npcRel = { npcId: npcIdToInteract, rp: 0, lastPositiveInteractionDate: 0, status: RelationshipStatus.NEUTRAL, eventFlags: {}, viewedEventFlags: {} };
        relationshipsCopy.push(npcRel);
      }
      if (!npcRel.eventFlags) npcRel.eventFlags = {};
      if (!npcRel.viewedEventFlags) npcRel.viewedEventFlags = {};

      const now = Date.now();
      const todayString = new Date(now).toDateString();
      const lastInteractionDateString = npcRel.lastPositiveInteractionDate > 0 ? new Date(npcRel.lastPositiveInteractionDate).toDateString() : "";
      let rpGainedThisInteraction = 0;

      if (prev.isMarried && npcIdToInteract === prev.spouseId) {
        const oldHappiness = newMarriageHappiness;
        newMarriageHappiness = Math.min(MAX_MARRIAGE_HAPPINESS, prev.marriageHappiness + MARRIAGE_HAPPINESS_GAIN_INTERACTION);
        newLastSpouseInteractionDate = now;
        if (newMarriageHappiness > oldHappiness) {
             localNotifications.push({ type: 'info', titleKey: 'appName', itemName: `ความสุขชีวิตคู่กับ ${getNPCName(npcIdToInteract, uiText)} เพิ่มขึ้น (+${MARRIAGE_HAPPINESS_GAIN_INTERACTION})`});
        }
      } else {
        const maxRpForCurrentStatus = npcRel.status === RelationshipStatus.DATING ? MAX_DATING_RP : MAX_FRIEND_RP;
        if (npcRel.status !== RelationshipStatus.MARRIED && (lastInteractionDateString !== todayString || npcRel.lastPositiveInteractionDate === 0)) {
          if (npcRel.rp < maxRpForCurrentStatus) {
            npcRel.rp = Math.min(maxRpForCurrentStatus, npcRel.rp + RP_GAIN_PER_INTERACTION);
            rpGainedThisInteraction = RP_GAIN_PER_INTERACTION;
          }
        }
      }
      npcRel.lastPositiveInteractionDate = now;

      let finalPlayerDataForAchChecks = { ...prev, relationships: relationshipsCopy, unlockedAchievementIds: currentAchievements, marriageHappiness: newMarriageHappiness, lastSpouseInteractionDate: newLastSpouseInteractionDate };


      if (rpGainedThisInteraction > 0 && npcRel.status !== RelationshipStatus.DATING && npcRel.status !== RelationshipStatus.MARRIED) {
        localNotifications.push({ type: 'relationship', titleKey: 'relationshipIncreased', npcName: getNPCName(npcIdToInteract, uiText) });
        const eventCheckResult = checkForAndTriggerEvents(npcRel, npcIdToInteract, finalPlayerDataForAchChecks);
        npcRel.eventFlags = eventCheckResult.updatedEventFlags;
        currentAchievements = eventCheckResult.updatedAchievements;
        finalPlayerDataForAchChecks.unlockedAchievementIds = currentAchievements;
        localNotifications.push(...eventCheckResult.eventNotifications);
      }

      let achIdToCheck: AchievementId | null = null;
      if (npcIdToInteract === NPCId.MELODIE) achIdToCheck = AchievementId.FIRST_INTERACTION_MELODIE;
      else if (npcIdToInteract === NPCId.RHYTHM) achIdToCheck = AchievementId.FIRST_INTERACTION_RHYTHM;
      else if (npcIdToInteract === NPCId.HARMONIE) achIdToCheck = AchievementId.FIRST_INTERACTION_HARMONIE;

      if (achIdToCheck && !currentAchievements.includes(achIdToCheck)) {
        const achResult = unlockAchievementInternal(achIdToCheck, finalPlayerDataForAchChecks);
        currentAchievements = achResult.updatedPlayerData.unlockedAchievementIds;
        if (achResult.notification) localNotifications.push(achResult.notification);
      }

      localNotifications.forEach(addNotification);
      return { ...prev, relationships: relationshipsCopy, marriageHappiness: newMarriageHappiness, lastSpouseInteractionDate: newLastSpouseInteractionDate, unlockedAchievementIds: currentAchievements };
    });
  }, [setPlayerDataOptimistic, uiText, unlockAchievementInternal, addNotification, checkForAndTriggerEvents]);

  const giveGiftToNpc = useCallback((npcIdToGift: NPCId, itemId: string, itemType: UnlockedItemType): GiftResult => {
    let finalGiftResult: GiftResult = { success: false, messageKey: 'giftFailMessage' };

    setPlayerDataOptimistic(prev => {
      if (!prev) {
        finalGiftResult = { success: false, messageKey: 'genericError' };
        return prev;
      }

      let updatedData = deepClone(prev);
      let relationshipsCopy = updatedData.relationships;
      let currentAchievements = [...updatedData.unlockedAchievementIds];
      let collectedMementosCopy = [...updatedData.collectedMementos];
      const localNotifications: Omit<NotificationMessage, 'id'>[] = [];
      let newMarriageHappiness = updatedData.marriageHappiness;
      let newLastSpouseInteractionDate = updatedData.lastSpouseInteractionDate;
      let marriageHappinessChange = 0;

      let npcRel = relationshipsCopy.find(r => r.npcId === npcIdToGift);
      if (!npcRel) {
        npcRel = { npcId: npcIdToGift, rp: 0, lastPositiveInteractionDate: 0, status: RelationshipStatus.NEUTRAL, eventFlags: {}, viewedEventFlags: {} };
        relationshipsCopy.push(npcRel);
      }
      if (!npcRel.eventFlags) npcRel.eventFlags = {};
      if (!npcRel.viewedEventFlags) npcRel.viewedEventFlags = {};

      let itemNameForNotif = itemId;
      let rpGained = 0;
      let giftReactionMessageKey: keyof ThaiUIText = 'giftReactionNeutral';

      if (itemType === UnlockedItemType.MEMENTO) {
        const mementoId = itemId as MementoId;
        const mementoIndex = collectedMementosCopy.indexOf(mementoId);
        if (mementoIndex === -1) {
            finalGiftResult = { success: false, messageKey: 'giftFailMessage' };
            return updatedData;
        }
        collectedMementosCopy.splice(mementoIndex, 1);
        updatedData.collectedMementos = collectedMementosCopy;

        if (npcIdToGift === NPCId.MELODIE) rpGained = MEMENTO_GIFT_RP_GAIN_MELODIE;
        else if (npcIdToGift === NPCId.RHYTHM) rpGained = MEMENTO_GIFT_RP_GAIN_RHYTHM;
        else if (npcIdToGift === NPCId.HARMONIE) rpGained = MEMENTO_GIFT_RP_GAIN_HARMONIE;
        giftReactionMessageKey = 'giftReactionLoved';
        const mementoDef = getMementoDefinition(mementoId);
        itemNameForNotif = mementoDef ? uiText[mementoDef.nameKey] : mementoId;

      } else if (itemType === UnlockedItemType.GENERAL_GIFT) {
        const shopItemDef = SHOP_ITEMS.find(si => si.id === itemId && si.type === UnlockedItemType.GENERAL_GIFT);
        if (!shopItemDef) {
            finalGiftResult = { success: false, messageKey: 'genericError' };
            addNotification({ type: 'info', titleKey: 'appName', messageKey: 'genericError', itemName: "ไม่พบไอเทมของขวัญ" });
            return updatedData;
        }
        itemNameForNotif = uiText[shopItemDef.nameKey] || itemId;

        if (updatedData.gCoins < shopItemDef.cost) {
            finalGiftResult = { success: false, messageKey: 'notEnoughGCoins' };
            addNotification({ type: 'info', titleKey: 'notEnoughGCoins', itemName: itemNameForNotif });
            return updatedData;
        }
        updatedData.gCoins -= shopItemDef.cost;
        updatedData = updateMissionProgressForGifting(MissionType.EARN_GCOINS_TOTAL, updatedData, undefined, { gcoinsEarnedInThisEvent: -shopItemDef.cost });


        const npcDef = getNPCDefinition(npcIdToGift);
        if (npcDef?.giftPreferences) {
            const preference = npcDef.giftPreferences[itemId as ShopItemId | MementoId] || GiftPreferenceLevel.NEUTRAL;
            switch (preference) {
                case GiftPreferenceLevel.LOVED: rpGained = RP_GAIN_GIFT_LOVED; giftReactionMessageKey = 'giftReactionLoved'; break;
                case GiftPreferenceLevel.LIKED: rpGained = RP_GAIN_GIFT_LIKED; giftReactionMessageKey = 'giftReactionLiked'; break;
                case GiftPreferenceLevel.NEUTRAL: rpGained = RP_GAIN_GIFT_NEUTRAL; giftReactionMessageKey = 'giftReactionNeutral'; break;
                case GiftPreferenceLevel.DISLIKED: rpGained = RP_CHANGE_GIFT_DISLIKED; giftReactionMessageKey = 'giftReactionDisliked'; break;
            }
        } else {
            rpGained = RP_GAIN_GIFT_NEUTRAL;
        }
      } else {
         finalGiftResult = { success: false, messageKey: 'giftFailMessage' };
         return updatedData;
      }

      const oldRp = npcRel.rp;
      const oldMarriageHappiness = newMarriageHappiness;

      if (updatedData.isMarried && npcIdToGift === updatedData.spouseId) {
        const giftHappinessGain = rpGained >= RP_GAIN_GIFT_LIKED ? MARRIAGE_HAPPINESS_GAIN_GIFT : (rpGained === RP_CHANGE_GIFT_DISLIKED ? -2 : (rpGained === RP_GAIN_GIFT_NEUTRAL ? 1 : 0));
        newMarriageHappiness = Math.min(MAX_MARRIAGE_HAPPINESS, newMarriageHappiness + giftHappinessGain);
        newMarriageHappiness = Math.max(0, newMarriageHappiness);
        marriageHappinessChange = newMarriageHappiness - oldMarriageHappiness;
        newLastSpouseInteractionDate = Date.now();
        if (marriageHappinessChange !== 0) {
             localNotifications.push({ type: 'info', titleKey: 'appName', itemName: `ความสุขชีวิตคู่ ${marriageHappinessChange > 0 ? 'เพิ่มขึ้น' : 'ลดลง'} (${marriageHappinessChange > 0 ? '+' : ''}${marriageHappinessChange})`});
        }
        updatedData.marriageHappiness = newMarriageHappiness;
        updatedData.lastSpouseInteractionDate = newLastSpouseInteractionDate;
      } else {
        const maxRpForCurrentStatus = npcRel.status === RelationshipStatus.DATING ? MAX_DATING_RP : MAX_FRIEND_RP;
        if (npcRel.status !== RelationshipStatus.MARRIED && npcRel.rp < maxRpForCurrentStatus) {
          npcRel.rp = Math.min(maxRpForCurrentStatus, npcRel.rp + rpGained);
          if (rpGained < 0) npcRel.rp = Math.max(0, npcRel.rp);
        }
      }
      npcRel.lastPositiveInteractionDate = Date.now();
      updatedData.relationships = relationshipsCopy;

      finalGiftResult = { success: true, messageKey: giftReactionMessageKey, rpChange: npcRel.rp - oldRp, marriageHappinessChange };
      localNotifications.push({ type: 'relationship', titleKey: giftReactionMessageKey, npcName: getNPCName(npcIdToGift, uiText), giftName: itemNameForNotif });


      if (npcRel.status !== RelationshipStatus.DATING && npcRel.status !== RelationshipStatus.MARRIED) {
        const eventCheckResult = checkForAndTriggerEvents(npcRel, npcIdToGift, updatedData);
        npcRel.eventFlags = eventCheckResult.updatedEventFlags;
        currentAchievements = eventCheckResult.updatedAchievements;
        updatedData.unlockedAchievementIds = currentAchievements;
        localNotifications.push(...eventCheckResult.eventNotifications);
      }


      let firstGiftAchId: AchievementId | null = null;
      if (npcIdToGift === NPCId.MELODIE) firstGiftAchId = AchievementId.FIRST_GIFT_MELODIE;
      else if (npcIdToGift === NPCId.RHYTHM) firstGiftAchId = AchievementId.FIRST_GIFT_RHYTHM;
      else if (npcIdToGift === NPCId.HARMONIE) firstGiftAchId = AchievementId.FIRST_GIFT_HARMONIE;

      if (firstGiftAchId && !currentAchievements.includes(firstGiftAchId)) {
        const achResult = unlockAchievementInternal(firstGiftAchId, updatedData);
        updatedData.unlockedAchievementIds = achResult.updatedPlayerData.unlockedAchievementIds;
        if (achResult.notification) localNotifications.push(achResult.notification);
      }

      localNotifications.forEach(addNotification);
      return updatedData;
    });
    return finalGiftResult;
  }, [setPlayerDataOptimistic, uiText, unlockAchievementInternal, addNotification, checkForAndTriggerEvents, updateMissionProgressForGifting]);

  const confessToNpc = useCallback((npcIdToConfess: NPCId): { success: boolean, messageKey?: keyof ThaiUIText } => {
    let result: { success: boolean, messageKey?: keyof ThaiUIText } = { success: false };
    setPlayerDataOptimistic(prev => {
      if (!prev) {
        result = { success: false, messageKey: 'genericError' };
        return prev;
      }
      const relationshipsCopy = deepClone(prev.relationships);
      let currentAchievements = [...prev.unlockedAchievementIds];
      const localNotifications: Omit<NotificationMessage, 'id'>[] = [];
      let updatedHeartNoteLocketOwned = prev.heartNoteLocketOwned;

      const npcRel = relationshipsCopy.find(r => r.npcId === npcIdToConfess);
      if (!npcRel || !(npcRel.rp >= MAX_FRIEND_RP && (npcRel.status === RelationshipStatus.NEUTRAL || npcRel.status === RelationshipStatus.FRIENDLY))) {
        result = { success: false, messageKey: 'genericError' };
        return prev;
      }
      if (!prev.heartNoteLocketOwned) {
        result = { success: false, messageKey: 'confessionRequirementLocket' };
        addNotification({ type: 'info', titleKey: 'confessionRequirementLocket' });
        return prev;
      }

      npcRel.status = RelationshipStatus.DATING;
      npcRel.rp = MAX_FRIEND_RP;
      npcRel.lastPositiveInteractionDate = Date.now();
      updatedHeartNoteLocketOwned = false;

      let successMessageKey: keyof ThaiUIText = 'confessionSuccessMelodie';
      let achievementToUnlock: AchievementId | null = null;
      if (npcIdToConfess === NPCId.MELODIE) { successMessageKey = 'confessionSuccessMelodie'; achievementToUnlock = AchievementId.BECOME_LOVERS_MELODIE; }
      else if (npcIdToConfess === NPCId.RHYTHM) { successMessageKey = 'confessionSuccessRhythm'; achievementToUnlock = AchievementId.BECOME_LOVERS_RHYTHM; }
      else if (npcIdToConfess === NPCId.HARMONIE) { successMessageKey = 'confessionSuccessHarmonie'; achievementToUnlock = AchievementId.BECOME_LOVERS_HARMONIE; }

      localNotifications.push({ type: 'relationship', titleKey: successMessageKey, npcName: getNPCName(npcIdToConfess, uiText) });
      result = { success: true, messageKey: successMessageKey };

      let finalPlayerDataForAchChecks = { ...prev, relationships: relationshipsCopy, heartNoteLocketOwned: updatedHeartNoteLocketOwned, unlockedAchievementIds: currentAchievements };


      if (achievementToUnlock && !currentAchievements.includes(achievementToUnlock)) {
        const achResult = unlockAchievementInternal(achievementToUnlock, finalPlayerDataForAchChecks);
        currentAchievements = achResult.updatedPlayerData.unlockedAchievementIds;
        if (achResult.notification) localNotifications.push(achResult.notification);
      }

      localNotifications.forEach(addNotification);
      return { ...prev, relationships: relationshipsCopy, heartNoteLocketOwned: updatedHeartNoteLocketOwned, unlockedAchievementIds: currentAchievements };
    });
    return result;
  }, [setPlayerDataOptimistic, uiText, unlockAchievementInternal, addNotification]);

  const proposeToNpc = useCallback((npcIdToPropose: NPCId): { success: boolean, messageKey?: keyof ThaiUIText } => {
     let result: { success: boolean, messageKey?: keyof ThaiUIText } = { success: false };
     setPlayerDataOptimistic(prev => {
        if (!prev) {
            result = { success: false, messageKey: 'genericError' };
            return prev;
        }
        if (prev.isMarried) {
            result = { success: false, messageKey: 'genericError' };
            addNotification({type: 'info', titleKey: 'appName', messageKey: undefined, itemName: "คุณแต่งงานแล้ว!" });
            return prev;
        }

        if (prev.houseLevel < 2) {
            result = { success: false, messageKey: 'proposeRequirementHouseLevel' };
            addNotification({ type: 'info', titleKey: 'proposeRequirementHouseLevel' });
            return prev;
        }
        if (!prev.weddingRingOwned) {
            result = { success: false, messageKey: 'proposeRequirementRing' };
            addNotification({ type: 'info', titleKey: 'proposeRequirementRing' });
            return prev;
        }

        const relationshipsCopy = deepClone(prev.relationships);
        let currentAchievements = [...prev.unlockedAchievementIds];
        const localNotifications: Omit<NotificationMessage, 'id'>[] = [];

        const npcRel = relationshipsCopy.find(r => r.npcId === npcIdToPropose);
        if (!npcRel || npcRel.status !== RelationshipStatus.DATING || npcRel.rp < MAX_DATING_RP) {
            result = { success: false, messageKey: 'genericError' };
            return prev;
        }

        npcRel.status = RelationshipStatus.MARRIED;

        let successMessageKey: keyof ThaiUIText = 'proposalSuccessMelodie';
        let achievementToUnlock: AchievementId | null = null;
        if (npcIdToPropose === NPCId.MELODIE) { successMessageKey = 'proposalSuccessMelodie'; achievementToUnlock = AchievementId.MARRIED_MELODIE; }
        else if (npcIdToPropose === NPCId.RHYTHM) { successMessageKey = 'proposalSuccessRhythm'; achievementToUnlock = AchievementId.MARRIED_RHYTHM; }
        else if (npcIdToPropose === NPCId.HARMONIE) { successMessageKey = 'proposalSuccessHarmonie'; achievementToUnlock = AchievementId.MARRIED_HARMONIE; }

        localNotifications.push({ type: 'relationship', titleKey: successMessageKey, npcName: getNPCName(npcIdToPropose, uiText) });
        result = { success: true, messageKey: successMessageKey };

        let finalPlayerData = {
            ...prev,
            relationships: relationshipsCopy,
            weddingRingOwned: false,
            isMarried: true,
            spouseId: npcIdToPropose,
            marriageHappiness: INITIAL_MARRIAGE_HAPPINESS,
            lastSpouseInteractionDate: Date.now(),
            unlockedAchievementIds: currentAchievements
        };

        if (achievementToUnlock && !currentAchievements.includes(achievementToUnlock)) {
            const achResult = unlockAchievementInternal(achievementToUnlock, finalPlayerData);
            finalPlayerData.unlockedAchievementIds = achResult.updatedPlayerData.unlockedAchievementIds;
            if (achResult.notification) localNotifications.push(achResult.notification);
        }

        localNotifications.forEach(addNotification);
        return finalPlayerData;
     });
     return result;
  }, [setPlayerDataOptimistic, uiText, unlockAchievementInternal, addNotification]);

  const handleDailyRelationshipUpdates = useCallback((isNewDay: boolean) => {
    setPlayerDataOptimistic(prev => {
      if(!prev) return prev;
      const relationshipsCopy = deepClone(prev.relationships);
      const localNotifications: Omit<NotificationMessage, 'id'>[] = [];
      const now = Date.now();
      let newHappiness = prev.marriageHappiness;
      let newGCoins = prev.gCoins;

      relationshipsCopy.forEach(rel => {
        if (rel.status === RelationshipStatus.MARRIED) return;
        if (isNewDay) {
            const daysSinceLastPositiveInteraction = (now - rel.lastPositiveInteractionDate) / (1000 * 60 * 60 * 24);
            if (rel.lastPositiveInteractionDate !== 0 && daysSinceLastPositiveInteraction > RP_DECAY_DAYS_THRESHOLD) {
              const oldRp = rel.rp;
              rel.rp = Math.max(0, rel.rp - RP_DECAY_AMOUNT);
              if (rel.rp < oldRp) {
                localNotifications.push({ type: 'relationship', titleKey: 'relationshipDecreased', npcName: getNPCName(rel.npcId, uiText) });
              }
            }
        }
      });

      if (prev.isMarried && prev.spouseId) {
          if (isNewDay) {
              const daysSinceLastSpouseInteraction = (now - (prev.lastSpouseInteractionDate || 0) ) / (1000 * 60 * 60 * 24);
              if ((prev.lastSpouseInteractionDate !== 0 || isNewDay) && daysSinceLastSpouseInteraction > MARRIAGE_HAPPINESS_DECAY_THRESHOLD_DAYS) {
                  const oldHappiness = newHappiness;
                  newHappiness = Math.max(0, newHappiness - MARRIAGE_HAPPINESS_DECAY_AMOUNT);
                  if (newHappiness < oldHappiness) {
                      localNotifications.push({ type: 'info', titleKey: 'appName', itemName: `ความสุขชีวิตคู่กับ ${getNPCName(prev.spouseId, uiText)} ลดลง...` });
                      if (newHappiness <= MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD && oldHappiness > MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD) {
                          localNotifications.push({ type: 'info', titleKey: 'marriageHappinessSickAtHeart', npcName: getNPCName(prev.spouseId, uiText) });
                      }
                  }
              }
          }
          if (isNewDay && prev.spouseId === NPCId.RHYTHM && newHappiness > MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD) {
            if (Math.random() < SPOUSAL_BONUS_GCOIN_CHANCE_RHYTHM) {
                newGCoins += SPOUSAL_BONUS_GCOIN_AMOUNT_RHYTHM;
                localNotifications.push({ type: 'info', titleKey: 'appName', itemName: uiText.spousalBonusRhythmDesc?.replace('{value}', SPOUSAL_BONUS_GCOIN_AMOUNT_RHYTHM.toString()) || `ริทึ่มให้ G-Coins เพิ่ม ${SPOUSAL_BONUS_GCOIN_AMOUNT_RHYTHM}!` });
            }
          }
      }
      localNotifications.forEach(addNotification);
      return { ...prev, relationships: relationshipsCopy, marriageHappiness: newHappiness, gCoins: newGCoins };
    });
  }, [setPlayerDataOptimistic, uiText, addNotification]);

  const markEventAsViewed = useCallback((npcIdToUpdate: NPCId, eventId: string) => {
    setPlayerDataOptimistic(prev => {
        if (!prev) return prev;
        const relationshipsCopy = deepClone(prev.relationships);
        const npcRelIndex = relationshipsCopy.findIndex(r => r.npcId === npcIdToUpdate);
        if (npcRelIndex !== -1) {
            if (!relationshipsCopy[npcRelIndex].viewedEventFlags) {
                relationshipsCopy[npcRelIndex].viewedEventFlags = {};
            }
            relationshipsCopy[npcRelIndex].viewedEventFlags![eventId] = true;
        }
        return { ...prev, relationships: relationshipsCopy };
    });
  }, [setPlayerDataOptimistic]);

  const goOnDate = useCallback((npcIdToDate: NPCId): { success: boolean, messageKey?: keyof ThaiUIText } => {
    let result: { success: boolean, messageKey?: keyof ThaiUIText } = { success: false, messageKey: 'genericError' };
    setPlayerDataOptimistic(prev => {
      if (!prev) return prev;
      const relationshipsCopy = deepClone(prev.relationships);
      const npcRel = relationshipsCopy.find(r => r.npcId === npcIdToDate);

      if (!npcRel || (npcRel.status !== RelationshipStatus.DATING && npcRel.status !== RelationshipStatus.MARRIED)) {
        return prev;
      }
      if (prev.gCoins < SPECIAL_DATE_COST) {
        result = { success: false, messageKey: 'notEnoughGCoins' };
        addNotification({ type: 'info', titleKey: 'notEnoughGCoins', itemName: uiText.goOnDateButtonLabel });
        return prev;
      }

      let updatedData = { ...prev, gCoins: prev.gCoins - SPECIAL_DATE_COST };
      updatedData = updateMissionProgressForGifting(MissionType.EARN_GCOINS_TOTAL, updatedData, undefined, { gcoinsEarnedInThisEvent: -SPECIAL_DATE_COST });

      let happinessGained = 0;
      let rpGained = 0;

      if (npcRel.status === RelationshipStatus.MARRIED && updatedData.spouseId === npcIdToDate) {
        const oldHappiness = updatedData.marriageHappiness;
        updatedData.marriageHappiness = Math.min(MAX_MARRIAGE_HAPPINESS, updatedData.marriageHappiness + SPECIAL_DATE_MARRIAGE_HAPPINESS_GAIN);
        happinessGained = updatedData.marriageHappiness - oldHappiness;
        updatedData.lastSpouseInteractionDate = Date.now();
      } else if (npcRel.status === RelationshipStatus.DATING) {
        const oldRp = npcRel.rp;
        npcRel.rp = Math.min(MAX_DATING_RP, npcRel.rp + SPECIAL_DATE_DATING_RP_GAIN);
        rpGained = npcRel.rp - oldRp;
      }
      npcRel.lastPositiveInteractionDate = Date.now();

      addNotification({ type: 'relationship', titleKey: 'appName', itemName: `คุณไปเดทกับ ${getNPCName(npcIdToDate, uiText)}! ${happinessGained > 0 ? `ความสุขชีวิตคู่ +${happinessGained}` : ''} ${rpGained > 0 ? `RP +${rpGained}` : ''}` });
      result = { success: true, messageKey: 'dateSuccessMessage' };
      return { ...updatedData, relationships: relationshipsCopy };
    });
    return result;
  }, [setPlayerDataOptimistic, uiText, addNotification, updateMissionProgressForGifting]);


  const getRelationshipDataForNpc = useCallback((npcId: NPCId): RelationshipData | undefined => {
    return playerData?.relationships.find(r => r.npcId === npcId);
  }, [playerData?.relationships]);


  const getRawRelationships = useCallback((): RelationshipData[] => {
    return deepClone(playerData?.relationships || []);
  }, [playerData?.relationships]);


  return {
    interactWithNpc,
    giveGiftToNpc,
    confessToNpc,
    proposeToNpc,
    markEventAsViewed,
    handleDailyRelationshipUpdates,
    getRelationshipDataForNpc,
    getRawRelationships,
    goOnDate,
  };
};
