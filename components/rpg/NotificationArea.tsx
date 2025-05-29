

import React from 'react';
import { NotificationMessage, Achievement, AchievementId, ThaiUIText } from '../../types';
import { UI_TEXT_TH, getPetName } from '../../constants';
import CorrectIcon from '../icons/CorrectIcon';
import { StarIcon } from '../icons/StarIcon';
import { InfoIcon } from '../icons/InfoIcon';
import { MusicPracticeIcon } from '../icons/MusicPracticeIcon';
import { MissionScrollIcon } from '../icons/MissionScrollIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { MonsterIconPlaceholder } from '../icons/MonsterIconPlaceholder'; // New for monster notifications

interface NotificationAreaProps {
  notifications: NotificationMessage[];
  onDismiss: (id: string) => void;
  getAchievementDetails: (id: AchievementId) => Achievement | undefined;
}

const NotificationArea: React.FC<NotificationAreaProps> = ({ notifications, onDismiss, getAchievementDetails }) => {
  if (!notifications.length) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-full max-w-xs sm:max-w-sm space-y-3">
      {notifications.map((notification) => {
        let title = UI_TEXT_TH[notification.titleKey];
        let message = notification.itemName || '';
        let IconComponent = InfoIcon;
        let iconColor = "text-sky-400";

        if (notification.type === 'achievement' && notification.itemName) {
            IconComponent = CorrectIcon;
            iconColor = "text-green-400";
        } else if (notification.type === 'levelUp') {
            IconComponent = StarIcon;
            iconColor = "text-yellow-400";
        } else if (notification.type === 'petLevelUp') {
            IconComponent = StarIcon;
            iconColor = "text-pink-400";
             if (notification.messageKey && notification.petName && notification.amount) {
                message = UI_TEXT_TH[notification.messageKey]
                    .replace('{petName}', notification.petName)
                    .replace('{level}', notification.amount.toString());
            }
        } else if (notification.type === 'dailyReward') {
            IconComponent = StarIcon;
            iconColor = "text-yellow-400";
            if (notification.messageKey && notification.amount !== undefined && notification.houseBonusAmount !== undefined && notification.houseBonusAmount > 0) {
                 message = UI_TEXT_TH[notification.messageKey]
                    .replace('{amount}', notification.amount.toString())
                    .replace('{bonusAmount}', notification.houseBonusAmount.toString());
            } else if (notification.messageKey && notification.amount !== undefined) {
                 message = UI_TEXT_TH['dailyRewardMessage'].replace('{amount}', notification.amount.toString());
            }
        } else if (notification.type === 'pet' && notification.messageKey && notification.petName) {
            IconComponent = InfoIcon;
            iconColor = "text-teal-400";
            message = UI_TEXT_TH[notification.messageKey].replace('{petName}', notification.petName).replace('{itemName}', notification.itemName || '');
        } else if (notification.type === 'petSpecialRequest' && notification.messageKey && notification.petName && notification.itemName) {
            IconComponent = SparklesIcon;
            iconColor = "text-orange-400";
            message = UI_TEXT_TH[notification.messageKey]
                .replace('{petName}', notification.petName)
                .replace('{targetName}', notification.itemName);
        } else if (notification.type === 'gameEvent' && notification.messageKey) {
            IconComponent = InfoIcon;
            iconColor = "text-slate-400";
            message = UI_TEXT_TH[notification.messageKey];
        } else if (notification.type === 'info' && notification.titleKey && notification.itemName) {
             IconComponent = InfoIcon;
             iconColor = "text-sky-400";
             if(notification.messageKey && UI_TEXT_TH[notification.messageKey]){
                 message = UI_TEXT_TH[notification.messageKey].replace('{level}', notification.newLevel?.toString() || '');
             } else if (notification.titleKey === 'newHouseBenefitsUnlocked' && notification.newLevel) {
                 message = UI_TEXT_TH.houseUpgradeSuccess.replace('{level}', notification.newLevel.toString()) + " " + UI_TEXT_TH.newHouseBenefitsUnlocked;
             } else if (notification.itemName) {
                 message = UI_TEXT_TH[notification.titleKey] + ": " + notification.itemName;
             }
        } else if (notification.type === 'practiceNook' && notification.messageKey) {
            IconComponent = MusicPracticeIcon;
            iconColor = "text-purple-400";
            message = UI_TEXT_TH[notification.messageKey]
                .replace('{playerXp}', notification.playerXpReward?.toString() || '0')
                .replace('{petName}', notification.petName || 'เพื่อนซี้')
                .replace('{petXp}', notification.petXpReward?.toString() || '0')
                .replace('{petHappiness}', notification.petHappinessReward?.toString() || '0');
        } else if (notification.type === 'missionCompleted' && notification.missionName) {
            IconComponent = MissionScrollIcon;
            iconColor = "text-yellow-400";
            message = notification.missionName;
        } else if (notification.type === 'missionRewardClaimed' && notification.missionName) {
            IconComponent = CheckCircleIcon;
            iconColor = "text-green-400";
            message = notification.missionName;
        } else if (notification.type === 'monsterDefeated') { // New
            IconComponent = MonsterIconPlaceholder;
            iconColor = "text-red-400";
            if (notification.monsterName && notification.mementoName && notification.amount !== undefined) {
                 message = UI_TEXT_TH.monsterBattleRewardMessage
                    .replace('{mementoName}', notification.mementoName)
                    .replace('{gcoins}', notification.amount.toString());
            } else if (notification.monsterName) {
                 message = `คุณพิชิต ${notification.monsterName} ได้สำเร็จ!`;
            }
        }


        return (
          <div
            key={notification.id}
            className="bg-slate-700/90 backdrop-blur-sm border border-slate-600 text-slate-100 p-4 rounded-lg shadow-xl flex items-start space-x-3 transition-all duration-300 ease-out"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex-shrink-0 pt-1">
              <IconComponent className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div className="flex-grow">
              <h4 className={`font-bold text-md ${iconColor}`}>{title}</h4>
              {message && <p className="text-sm text-slate-200">{message}</p>}
            </div>
            <button
              onClick={() => onDismiss(notification.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors text-2xl leading-none opacity-70 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
};

const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.586l-2.707 2.707a1 1 0 000 1.414L4 11.414V13a1 1 0 001 1h1.586l2.707 2.707a1 1 0 001.414 0L13 14.586V16a1 1 0 001-1v-1.586l2.707-2.707a1 1 0 000-1.414L14.586 7.593V6a1 1 0 00-1-1h-1.586L9.293 2.293a1 1 0 00-1.414 0L5.172 5H4a1 1 0 00-1 1V5a1 1 0 001-1zM10 4.5c.205 0 .402.056.578.158L13 6.277V7.5h1.222l1.623 2.377-.94.94L13.5 9.223V8H12V6.5A2.5 2.5 0 009.5 4H8V2.5A2.5 2.5 0 005.5 0 2.5 2.5 0 003 2.5V4h1.5A2.5 2.5 0 007 6.5V8H5.5a2.5 2.5 0 00-2.5 2.5c0 .205.056.402.158.578L4.777 13H6V11.5h1.5A2.5 2.5 0 0010 9V7h1.5a2.5 2.5 0 002.5-2.5c0-.205-.056-.402-.158-.578L11.223 7H10V4.5z" clipRule="evenodd" />
    <path d="M10 12a1 1 0 100-2 1 1 0 000 2zM4 6a1 1 0 100-2 1 1 0 000 2zM16 6a1 1 0 100-2 1 1 0 000 2zM5 15a1 1 0 11-2 0 1 1 0 012 0zM15 15a1 1 0 11-2 0 1 1 0 012 0z" />
  </svg>
);

export default NotificationArea;
