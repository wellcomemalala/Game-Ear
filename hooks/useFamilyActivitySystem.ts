
import { useCallback } from 'react';
import {
  PlayerData,
  ThaiUIText,
  NotificationMessage,
  FamilyActivityId,
  ChildGrowthStage
} from '../types';
import {
  UI_TEXT_TH,
  FAMILY_ACTIVITY_PARK_TRIP_COST,
  FAMILY_ACTIVITY_PARK_TRIP_CHILD_HAPPINESS_GAIN,
  FAMILY_ACTIVITY_PARK_TRIP_MARRIAGE_HAPPINESS_GAIN,
  FAMILY_ACTIVITY_PARK_TRIP_COOLDOWN_HOURS,
  MAX_CHILD_HAPPINESS,
  MAX_MARRIAGE_HAPPINESS,
  formatTime, // Assuming formatTime is available and exported from constants or utils
} from '../constants';

// Props for the hook
export interface UseFamilyActivitySystemProps {
  playerData: Readonly<PlayerData>;
  setPlayerDataOptimistic: (updater: (prevData: PlayerData) => PlayerData) => void;
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  updatePlayerGCoins: (amountChange: number) => void;
}

// Return type of the hook
export interface FamilyActivitySystemReturn {
  performFamilyActivity: (activityId: FamilyActivityId) => { success: boolean; messageKey?: keyof ThaiUIText; gcoinsSpent?: number };
  getFamilyActivityCooldownTime: (activityId: FamilyActivityId) => string | null;
}

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useFamilyActivitySystem = ({
  playerData,
  setPlayerDataOptimistic,
  addNotification,
  updatePlayerGCoins,
}: UseFamilyActivitySystemProps): FamilyActivitySystemReturn => {

  const getFamilyActivityCooldownTime = useCallback((activityId: FamilyActivityId): string | null => {
    const cooldownEndTime = playerData.familyActivityCooldowns?.[activityId] || 0;
    const now = Date.now();
    if (cooldownEndTime > now) {
      const remaining = cooldownEndTime - now;
      return formatTime(remaining);
    }
    return null;
  }, [playerData.familyActivityCooldowns]);

  const performFamilyActivity = useCallback((activityId: FamilyActivityId): { success: boolean; messageKey?: keyof ThaiUIText; gcoinsSpent?: number } => {
    if (!playerData.isMarried || !playerData.childData) {
      addNotification({ type: 'info', titleKey: 'appName', messageKey: 'familyActivityRequiresSpouseAndChildMessage' });
      return { success: false, messageKey: 'familyActivityRequiresSpouseAndChildMessage' };
    }

    const cooldown = getFamilyActivityCooldownTime(activityId);
    if (cooldown) {
      addNotification({
        type: 'familyActivity',
        titleKey: 'appName',
        messageKey: 'familyActivityOnCooldownMessage',
        itemName: cooldown,
      });
      return { success: false, messageKey: 'familyActivityOnCooldownMessage' };
    }

    let cost = 0;
    let childHappinessGain = 0;
    let marriageHappinessGain = 0;
    let successMessageKey: keyof ThaiUIText = 'familyActivityParkTripSuccessMessage'; // Default

    if (activityId === FamilyActivityId.PARK_TRIP) {
      cost = FAMILY_ACTIVITY_PARK_TRIP_COST;
      childHappinessGain = FAMILY_ACTIVITY_PARK_TRIP_CHILD_HAPPINESS_GAIN;
      marriageHappinessGain = FAMILY_ACTIVITY_PARK_TRIP_MARRIAGE_HAPPINESS_GAIN;
      successMessageKey = 'familyActivityParkTripSuccessMessage';
    } else {
      // Handle other activities if added later
      return { success: false, messageKey: 'genericError' };
    }

    if (playerData.gCoins < cost) {
      addNotification({ type: 'info', titleKey: 'appName', messageKey: 'familyActivityRequiresGcoinsMessage', gcoinsSpent: cost });
      return { success: false, messageKey: 'familyActivityRequiresGcoinsMessage' };
    }

    const newCooldownEndTime = Date.now() + FAMILY_ACTIVITY_PARK_TRIP_COOLDOWN_HOURS * 60 * 60 * 1000; // Specific to park trip for now

    setPlayerDataOptimistic(prev => {
      if (!prev || !prev.childData) return prev; // Should be checked before calling
      
      let updatedData = deepClone(prev);
      updatePlayerGCoins(-cost); // Deduct GCoins via callback from usePlayerData

      updatedData.childData.happiness = Math.min(MAX_CHILD_HAPPINESS, updatedData.childData.happiness + childHappinessGain);
      updatedData.marriageHappiness = Math.min(MAX_MARRIAGE_HAPPINESS, updatedData.marriageHappiness + marriageHappinessGain);
      
      updatedData.familyActivityCooldowns = {
        ...updatedData.familyActivityCooldowns,
        [activityId]: newCooldownEndTime,
      };
      return updatedData;
    });

    addNotification({
      type: 'familyActivity',
      titleKey: 'appName', // Or a more specific title
      messageKey: successMessageKey,
      gcoinsSpent: cost,
    });

    return { success: true, messageKey: successMessageKey, gcoinsSpent: cost };
  }, [playerData, setPlayerDataOptimistic, addNotification, updatePlayerGCoins, getFamilyActivityCooldownTime]);

  return {
    performFamilyActivity,
    getFamilyActivityCooldownTime,
  };
};
