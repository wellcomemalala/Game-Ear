

import React from 'react';
import { NotificationMessage, Achievement, AchievementId, ThaiUIText } from '../../types';
import { UI_TEXT_TH, getPetName } from '../../constants';
import CorrectIcon from '../icons/CorrectIcon';
import { StarIcon } from '../icons/StarIcon';
import { InfoIcon } from '../icons/InfoIcon';
import { MusicPracticeIcon } from '../icons/MusicPracticeIcon';
import { MissionScrollIcon } from '../icons/MissionScrollIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { MonsterIconPlaceholder } from '../icons/MonsterIconPlaceholder'; 

interface NotificationAreaProps {
  notifications: NotificationMessage[];
  onDismiss: (id: string) => void;
  getAchievementDetails: (id: AchievementId) => Achievement | undefined;
}

const replacePlaceholders = (text: string, notificationData: NotificationMessage): string => {
  if (!text) return "";
  let result = text;

  if (notificationData.npcName) result = result.replace(/{npcName}/g, notificationData.npcName);
  if (notificationData.itemName) result = result.replace(/{itemName}/g, notificationData.itemName);
  if (notificationData.petName) result = result.replace(/{petName}/g, notificationData.petName);
  if (notificationData.childName) result = result.replace(/{childName}/g, notificationData.childName);
  if (notificationData.monsterName) result = result.replace(/{monsterName}/g, notificationData.monsterName);
  if (notificationData.questName) result = result.replace(/{questName}/g, notificationData.questName);
  if (notificationData.missionName) result = result.replace(/{missionName}/g, notificationData.missionName);
  if (notificationData.amount !== undefined) result = result.replace(/{amount}/g, notificationData.amount.toString());
  if (notificationData.level !== undefined) result = result.replace(/{level}/g, notificationData.level.toString()); // For pet level up message
  if (notificationData.newLevel !== undefined) result = result.replace(/{newLevel}/g, notificationData.newLevel.toString()); // For player levelUp title/message
  if (notificationData.spouseName) result = result.replace(/{spouseName}/g, notificationData.spouseName);
  if (notificationData.evolvedPetName) result = result.replace(/{evolvedPetName}/g, notificationData.evolvedPetName);
  if (notificationData.houseBonusAmount !== undefined) result = result.replace(/{bonusAmount}/g, notificationData.houseBonusAmount.toString());
  if (notificationData.baseAmount !== undefined) result = result.replace(/{baseAmount}/g, notificationData.baseAmount.toString()); 
  if (notificationData.targetName) result = result.replace(/{targetName}/g, notificationData.targetName); 
  if (notificationData.playerXpReward !== undefined) result = result.replace(/{playerXpReward}/g, notificationData.playerXpReward.toString());
  if (notificationData.playerXpReward !== undefined) result = result.replace(/{playerXp}/g, notificationData.playerXpReward.toString()); 
  if (notificationData.petXpReward !== undefined) result = result.replace(/{petXp}/g, notificationData.petXpReward.toString());
  if (notificationData.petHappinessReward !== undefined) result = result.replace(/{petHappiness}/g, notificationData.petHappinessReward.toString());
  if (notificationData.mementoName) result = result.replace(/{mementoName}/g, notificationData.mementoName);
  if (notificationData.gcoins !== undefined) result = result.replace(/{gcoins}/g, notificationData.gcoins.toString()); 
  if (notificationData.giftName) result = result.replace(/{giftName}/g, notificationData.giftName);
  if (notificationData.tuitionAmount !== undefined) result = result.replace(/{tuitionAmount}/g, notificationData.tuitionAmount.toString());
  if (notificationData.academicPerformance) result = result.replace(/{academicPerformance}/g, notificationData.academicPerformance);
  if (notificationData.gcoinsEarned !== undefined) result = result.replace(/{gcoinsEarned}/g, notificationData.gcoinsEarned.toString()); 
  if (notificationData.gcoinsSpent !== undefined) result = result.replace(/{gcoinsSpent}/g, notificationData.gcoinsSpent.toString());
  if (notificationData.eventName) result = result.replace(/{eventName}/g, notificationData.eventName);
  if (notificationData.birthdayPersonName) result = result.replace(/{birthdayPersonName}/g, notificationData.birthdayPersonName);
  
  if (notificationData.titleKey === 'finalBoss_VictoryMessage') {
      result = result.replace('{title_GoldenEarGod}', UI_TEXT_TH.title_GoldenEarGod || 'เทพเจ้าหูทอง');
  }
  return result;
};


const NotificationArea: React.FC<NotificationAreaProps> = ({ notifications, onDismiss, getAchievementDetails }) => {
  if (!notifications.length) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-full max-w-xs sm:max-w-sm space-y-3">
      {notifications.map((notification) => {
        
        const rawTitleText = UI_TEXT_TH[notification.titleKey] || String(notification.titleKey);
        let title = replacePlaceholders(rawTitleText, notification);
        
        let message = "";
        let IconComponent = InfoIcon;
        let iconColor = "text-sky-400";

        if (notification.type === 'achievement') {
            IconComponent = CorrectIcon;
            iconColor = "text-green-400";
            message = notification.itemName || ""; 
        } else if (notification.type === 'levelUp') {
            IconComponent = StarIcon;
            iconColor = "text-yellow-400";
            if (notification.messageKey && UI_TEXT_TH[notification.messageKey]) {
                message = replacePlaceholders(UI_TEXT_TH[notification.messageKey], notification);
            }
        } else if (notification.type === 'petLevelUp' && notification.messageKey) {
            IconComponent = StarIcon;
            iconColor = "text-pink-400";
            message = replacePlaceholders(UI_TEXT_TH[notification.messageKey], notification);
        } else if (notification.type === 'dailyReward' && notification.messageKey) {
            IconComponent = StarIcon;
            iconColor = "text-yellow-400";
            const msgKey = (notification.houseBonusAmount && notification.houseBonusAmount > 0) ? notification.messageKey : 'dailyRewardMessage';
            // Ensure amount and bonusAmount are numbers for replacement
            const dataForMessage = { 
                ...notification, 
                amount: Number(notification.baseAmount ?? 0), 
                houseBonusAmount: Number(notification.houseBonusAmount ?? 0) 
            };
            message = replacePlaceholders(UI_TEXT_TH[msgKey], dataForMessage);
        } else if (notification.type === 'pet' && notification.messageKey) {
            IconComponent = InfoIcon;
            iconColor = "text-teal-400";
            message = replacePlaceholders(UI_TEXT_TH[notification.messageKey], notification);
        } else if (notification.type === 'petSpecialRequest' && notification.messageKey) {
            IconComponent = SparklesIcon;
            iconColor = "text-orange-400";
            message = replacePlaceholders(UI_TEXT_TH[notification.messageKey], notification);
        } else if (notification.type === 'gameEvent' && notification.messageKey) {
            IconComponent = InfoIcon;
            iconColor = "text-slate-400";
            message = replacePlaceholders(UI_TEXT_TH[notification.messageKey], notification);
        } else if (notification.type === 'info') {
             IconComponent = InfoIcon;
             iconColor = "text-sky-400";
             if(notification.messageKey && UI_TEXT_TH[notification.messageKey]){
                 message = replacePlaceholders(UI_TEXT_TH[notification.messageKey], notification);
             } else if (notification.titleKey === 'newHouseBenefitsUnlocked' && notification.newLevel) {
                 message = replacePlaceholders(UI_TEXT_TH.houseUpgradeSuccess + " " + UI_TEXT_TH.newHouseBenefitsUnlocked, notification);
             } else if (notification.itemName) { 
                 if (notification.titleKey === 'appName') { 
                     message = notification.itemName;
                 }
             }
        } else if (notification.type === 'practiceNook' && notification.messageKey) {
            IconComponent = MusicPracticeIcon;
            iconColor = "text-purple-400";
            message = replacePlaceholders(UI_TEXT_TH[notification.messageKey], notification);
        } else if (notification.type === 'missionCompleted') {
            IconComponent = MissionScrollIcon;
            iconColor = "text-yellow-400";
            message = notification.missionName || ""; 
        } else if (notification.type === 'missionRewardClaimed') {
            IconComponent = CheckCircleIcon;
            iconColor = "text-green-400";
            message = notification.missionName || ""; 
        } else if (notification.type === 'monsterDefeated') { 
            IconComponent = MonsterIconPlaceholder;
            iconColor = "text-red-400";
            message = replacePlaceholders(UI_TEXT_TH.monsterBattleRewardMessage, notification);
        }  else if (notification.type === 'petEvolution' && notification.messageKey) {
            IconComponent = StarIcon; 
            iconColor = "text-cyan-400";
            message = replacePlaceholders(UI_TEXT_TH[notification.messageKey], notification);
        } else if (notification.type === 'quest') {
            IconComponent = MissionScrollIcon; 
            iconColor = "text-lime-400";
            message = notification.questName || ""; 
        } else if (notification.type === 'clothing') {
            IconComponent = ShirtIcon; 
            iconColor = "text-indigo-300";
            message = notification.itemName || ""; 
        } else if (notification.type === 'relationship') {
            IconComponent = HeartIcon; 
            iconColor = "text-pink-300";
            if (notification.giftName) {
                message = `มอบ: ${notification.giftName}`;
            }
        } else if (notification.type === 'family' && notification.messageKey) {
            IconComponent = UsersIcon; 
            iconColor = "text-teal-300";
            message = replacePlaceholders(UI_TEXT_TH[notification.messageKey], notification);
        } else if (notification.type === 'sideJob' && notification.messageKey) {
            IconComponent = CoinIcon;
            iconColor = "text-amber-400";
            message = replacePlaceholders(UI_TEXT_TH[notification.messageKey], notification);
        } else if (notification.type === 'familyActivity' && notification.messageKey) {
            IconComponent = UsersGroupIcon;
            iconColor = "text-green-400";
            message = replacePlaceholders(UI_TEXT_TH[notification.messageKey], notification);
        } else if (notification.type === 'event' && notification.eventName) {
             IconComponent = SparklesIcon;
             iconColor = "text-purple-400";
             message = notification.eventName;
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

// Helper icons
const ShirtIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm-2 4a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>;
const HeartIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>;
const UsersIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015.5-4.93A6.97 6.97 0 0010 7c-.34 0-.673.024-1 .07V11z" /></svg>;
const CoinIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-4.75a.75.75 0 001.5 0V8.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L6.2 9.74a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clipRule="evenodd" /></svg>;
const UsersGroupIcon: React.FC<{className?: string}> = ({className}) =>  <svg className={className} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-3.741-.479m0 0a3 3 0 00-4.682-2.72m4.682 2.72M3 18.72a9.094 9.094 0 013.741-.479A3 3 0 016 15.473c0-1.007.517-1.903 1.332-2.472M3 18.72C4.21 17.013 6.09 16 8.25 16A4.5 4.5 0 0112.75 20.5M3 18.72V18a6 6 0 012.401-4.91M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3.75 1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM15.75 9.75a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM8.25 9.75a.75.75 0 000-1.5H6.75a.75.75 0 000 1.5h1.5z" /></svg>;

const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.586l-2.707 2.707a1 1 0 000 1.414L4 11.414V13a1 1 0 001 1h1.586l2.707 2.707a1 1 0 001.414 0L13 14.586V16a1 1 0 001-1v-1.586l2.707-2.707a1 1 0 000-1.414L14.586 7.593V6a1 1 0 00-1-1h-1.586L9.293 2.293a1 1 0 00-1.414 0L5.172 5H4a1 1 0 00-1 1V5a1 1 0 001-1zM10 4.5c.205 0 .402.056.578.158L13 6.277V7.5h1.222l1.623 2.377-.94.94L13.5 9.223V8H12V6.5A2.5 2.5 0 009.5 4H8V2.5A2.5 2.5 0 005.5 0 2.5 2.5 0 003 2.5V4h1.5A2.5 2.5 0 007 6.5V8H5.5a2.5 2.5 0 00-2.5 2.5c0 .205.056.402.158.578L4.777 13H6V11.5h1.5A2.5 2.5 0 0010 9V7h1.5a2.5 2.5 0 002.5-2.5c0-.205-.056-.402-.158-.578L11.223 7H10V4.5z" clipRule="evenodd" />
    <path d="M10 12a1 1 0 100-2 1 1 0 000 2zM4 6a1 1 0 100-2 1 1 0 000 2zM16 6a1 1 0 100-2 1 1 0 000 2zM5 15a1 1 0 11-2 0 1 1 0 012 0zM15 15a1 1 0 11-2 0 1 1 0 012 0z" />
  </svg>
);

export default NotificationArea;
