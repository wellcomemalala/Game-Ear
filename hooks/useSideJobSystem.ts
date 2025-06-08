
import { useCallback } from 'react';
import { PlayerData, ThaiUIText, NotificationMessage, MissionType, ChildGrowthStage } from '../types';
import { UI_TEXT_TH, SIDE_JOB_BUSKING_GCOINS_MIN, SIDE_JOB_BUSKING_GCOINS_MAX, SIDE_JOB_BUSKING_COOLDOWN_HOURS, SIDE_JOB_BUSKING_LEVEL_GCOIN_MULTIPLIER, SIDE_JOB_MIN_FAMILY_HAPPINESS_THRESHOLD, MAX_MARRIAGE_HAPPINESS, MAX_CHILD_HAPPINESS } from '../constants';

interface SideJobSystemProps {
  playerData: Readonly<PlayerData>;
  setPlayerDataOptimistic: (updater: (prevData: PlayerData) => PlayerData) => void;
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  updateMissionProgress: (missionType: MissionType, valueIncrement?: number, targetDetails?: any, currentPlayerData?: PlayerData) => PlayerData;
}

export interface SideJobSystemReturn {
  performBusking: () => { success: boolean; messageKey?: keyof ThaiUIText; gcoinsEarned?: number };
  getBuskingCooldownTime: () => string | null;
}

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useSideJobSystem = ({
  playerData,
  setPlayerDataOptimistic,
  addNotification,
  updateMissionProgress,
}: SideJobSystemProps): SideJobSystemReturn => {

  const getBuskingCooldownTime = useCallback((): string | null => {
    const cooldownEndTime = playerData.sideJobCooldowns?.['BUSKING_COOLDOWN'] || 0;
    const now = Date.now();
    if (cooldownEndTime > now) {
      const remaining = cooldownEndTime - now;
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      if (hours > 0) return `${hours} ชม. ${minutes} น.`;
      if (minutes > 0) return `${minutes} น. ${seconds} วิ.`;
      return `${seconds} วิ.`;
    }
    return null;
  }, [playerData.sideJobCooldowns]);

  const performBusking = useCallback((): { success: boolean; messageKey?: keyof ThaiUIText; gcoinsEarned?: number } => {
    const cooldown = getBuskingCooldownTime();
    if (cooldown) {
      addNotification({
        type: 'sideJob',
        titleKey: 'sideJobBuskingTitle',
        messageKey: 'sideJobOnCooldownMessage',
        itemName: cooldown
      });
      return { success: false, messageKey: 'sideJobOnCooldownMessage' };
    }

    // Check family happiness if married or has a child
    if (playerData.isMarried && playerData.marriageHappiness < SIDE_JOB_MIN_FAMILY_HAPPINESS_THRESHOLD) {
        addNotification({ type: 'info', titleKey: 'appName', messageKey: 'sideJobFamilyUnhappyMessage' });
        return { success: false, messageKey: 'sideJobFamilyUnhappyMessage' };
    }
    if (playerData.childData && playerData.childData.happiness < SIDE_JOB_MIN_FAMILY_HAPPINESS_THRESHOLD) {
        addNotification({ type: 'info', titleKey: 'appName', messageKey: 'sideJobFamilyUnhappyMessage' });
        return { success: false, messageKey: 'sideJobFamilyUnhappyMessage' };
    }


    const gcoinsEarnedBase = Math.floor(Math.random() * (SIDE_JOB_BUSKING_GCOINS_MAX - SIDE_JOB_BUSKING_GCOINS_MIN + 1)) + SIDE_JOB_BUSKING_GCOINS_MIN;
    const levelBonus = (playerData.level -1) * SIDE_JOB_BUSKING_LEVEL_GCOIN_MULTIPLIER;
    const gcoinsEarned = gcoinsEarnedBase + levelBonus;
    
    const newCooldownEndTime = Date.now() + SIDE_JOB_BUSKING_COOLDOWN_HOURS * 60 * 60 * 1000;

    setPlayerDataOptimistic(prev => {
      if (!prev) return prev;
      let updatedData = deepClone(prev);
      updatedData.gCoins += gcoinsEarned;
      updatedData.sideJobCooldowns = {
        ...updatedData.sideJobCooldowns,
        ['BUSKING_COOLDOWN']: newCooldownEndTime,
      };
      updatedData = updateMissionProgress(MissionType.EARN_GCOINS_TOTAL, undefined, { gcoinsEarnedInThisEvent: gcoinsEarned }, updatedData);
      return updatedData;
    });

    addNotification({
      type: 'sideJob',
      titleKey: 'sideJobBuskingTitle',
      messageKey: 'sideJobBuskingSuccessMessage',
      gcoinsEarned: gcoinsEarned,
    });

    return { success: true, messageKey: 'sideJobBuskingSuccessMessage', gcoinsEarned };
  }, [playerData, setPlayerDataOptimistic, addNotification, updateMissionProgress, getBuskingCooldownTime]);

  return {
    performBusking,
    getBuskingCooldownTime,
  };
};
