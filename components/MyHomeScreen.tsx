
import React, { useState, useEffect, useCallback } from 'react';
import { PlayerData, ThaiUIText, NotificationMessage, AppView, FurnitureId } from '../types';
import { UI_TEXT_TH, HOUSE_UPGRADE_COSTS, MAX_HOUSE_LEVEL, getHouseLevelName, HOUSE_BENEFITS_PER_LEVEL, getFurnitureItemDetails, ALL_FURNITURE_ITEMS, PRACTICE_NOOK_COOLDOWN_HOURS, getPetName, formatTime } from '../constants';
import { HomeIcon } from './icons/HomeIcon';
import { CoinIcon } from './icons/CoinIcon';
import { ArrowUpCircleIcon } from './icons/ArrowUpCircleIcon';
import { PlotLandIcon } from './icons/PlotLandIcon';
import { HutIcon } from './icons/HutIcon';
import { SmallHouseIcon } from './icons/SmallHouseIcon';
import { MansionIcon } from './icons/MansionIcon';
import { GiftIcon } from './icons/GiftIcon'; 
import { PianoIcon } from './icons/PianoIcon';
import { BookshelfIcon } from './icons/BookshelfIcon';
import { PetBedIcon } from './icons/PetBedIcon';
import { FurnitureIcon } from './icons/FurnitureIcon';
import { MusicPracticeIcon } from './icons/MusicPracticeIcon'; // New
import { PracticeNookResult } from '../hooks/usePlayerData'; // New


interface MyHomeScreenProps {
  playerData: PlayerData;
  upgradeHouse: () => { success: boolean, messageKey?: keyof ThaiUIText, newLevel?: number };
  activatePracticeNook: () => PracticeNookResult; // New
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  onBackToMenu: () => void;
}

const HouseVisualIcon: React.FC<{ level: number, className?: string }> = ({ level, className }) => {
  switch (level) {
    case 0: return <PlotLandIcon className={className} />;
    case 1: return <HutIcon className={className} />;
    case 2: return <SmallHouseIcon className={className} />;
    case 3: return <MansionIcon className={className} />;
    default: return <HomeIcon className={className} />;
  }
};

const FurnitureDisplayIcon: React.FC<{ furnitureId: FurnitureId, className?: string }> = ({ furnitureId, className }) => {
  switch (furnitureId) {
    case FurnitureId.GRAND_PIANO: return <PianoIcon className={className} />;
    case FurnitureId.MUSIC_THEORY_SHELF: return <BookshelfIcon className={className} />;
    case FurnitureId.COMFY_PET_BED: return <PetBedIcon className={className} />;
    default: return <FurnitureIcon className={className} />;
  }
};

const MyHomeScreen: React.FC<MyHomeScreenProps> = ({
  playerData,
  upgradeHouse,
  activatePracticeNook, // New
  addNotification,
  onBackToMenu,
}) => {
  const currentHouseLevel = playerData.houseLevel;
  const currentHouseName = getHouseLevelName(currentHouseLevel, UI_TEXT_TH);
  const currentBenefits = HOUSE_BENEFITS_PER_LEVEL[currentHouseLevel] || HOUSE_BENEFITS_PER_LEVEL[0];

  const [practiceNookCooldownTime, setPracticeNookCooldownTime] = useState<string | null>(null);

  const updatePracticeNookCooldownDisplay = useCallback(() => {
    if (playerData.lastPracticeNookTimestamp) {
      const now = Date.now();
      const cooldownMillis = PRACTICE_NOOK_COOLDOWN_HOURS * 60 * 60 * 1000;
      const timePassed = now - playerData.lastPracticeNookTimestamp;
      if (timePassed < cooldownMillis) {
        setPracticeNookCooldownTime(formatTime(cooldownMillis - timePassed));
      } else {
        setPracticeNookCooldownTime(null);
      }
    } else {
      setPracticeNookCooldownTime(null);
    }
  }, [playerData.lastPracticeNookTimestamp]);

  useEffect(() => {
    updatePracticeNookCooldownDisplay();
    const interval = setInterval(updatePracticeNookCooldownDisplay, 1000);
    return () => clearInterval(interval);
  }, [updatePracticeNookCooldownDisplay]);


  const handleUpgrade = () => {
    const result = upgradeHouse();
    if (result.messageKey) {
      let message = UI_TEXT_TH[result.messageKey];
       let title = result.success ? 'houseUpgradeSuccess' : 'notEnoughGCoinsForUpgrade';
      if (result.success && result.newLevel) {
        message = message.replace('{level}', result.newLevel.toString());
        const newBenefits = HOUSE_BENEFITS_PER_LEVEL[result.newLevel];
        const oldBenefits = HOUSE_BENEFITS_PER_LEVEL[currentHouseLevel];
        if (newBenefits && oldBenefits && (newBenefits.dailyLoginBonusGCoins > oldBenefits.dailyLoginBonusGCoins || newBenefits.trainingXpMultiplier > oldBenefits.trainingXpMultiplier || newBenefits.trainingGCoinMultiplier > oldBenefits.trainingGCoinMultiplier)) {
            title = 'newHouseBenefitsUnlocked'; 
        }
      }
      addNotification({
        type: result.success ? 'info' : 'info', 
        titleKey: title as keyof ThaiUIText,
        messageKey: result.messageKey, 
        itemName: result.success && result.newLevel ? getHouseLevelName(result.newLevel, UI_TEXT_TH) : undefined,
        newLevel: result.newLevel
      });
    }
  };

  const handlePracticeNook = () => {
    const result = activatePracticeNook();
    if (result.success && result.rewards) {
      const activePetName = playerData.activePetId ? getPetName(playerData.activePetId, UI_TEXT_TH) : "";
      addNotification({
        type: 'practiceNook',
        titleKey: 'practiceNookTitle',
        messageKey: activePetName && result.rewards.petXp ? 'practiceNookRewardMessage' : 'practiceNookPetNotActiveMessage',
        playerXpReward: result.rewards.playerXp,
        petXpReward: result.rewards.petXp,
        petHappinessReward: result.rewards.petHappiness,
        petName: activePetName,
      });
    } else if (!result.success && result.cooldownRemaining) {
      // Cooldown message is already displayed on the button, but can add a notification if desired
      // addNotification({ type: 'info', titleKey: 'practiceNookTitle', messageKey: 'practiceNookCooldownMessage', itemName: formatTime(result.cooldownRemaining) });
    }
    updatePracticeNookCooldownDisplay(); // Re-check cooldown immediately
  };


  const nextLevel = currentHouseLevel + 1;
  const canUpgrade = currentHouseLevel < MAX_HOUSE_LEVEL;
  const upgradeCost = canUpgrade ? HOUSE_UPGRADE_COSTS[nextLevel] : 0;
  const canAffordUpgrade = canUpgrade && playerData.gCoins >= upgradeCost;

  const houseVisuals: { [level: number]: { nameKey: keyof ThaiUIText, description: string, bgColor: string, textColor: string, iconColor: string } } = {
    0: { nameKey: 'houseLevel0Name', description: "ที่ดินผืนน้อย รอการพัฒนาเป็นบ้านในฝัน", bgColor: "bg-slate-600/70", textColor: "text-slate-200", iconColor: "text-slate-400" },
    1: { nameKey: 'houseLevel1Name', description: "กระท่อมไม้อบอุ่น จุดเริ่มต้นของความสุข", bgColor: "bg-yellow-700/80", textColor: "text-yellow-100", iconColor: "text-yellow-300" },
    2: { nameKey: 'houseLevel2Name', description: "บ้านไม้โอ่โถง พร้อมพื้นที่ใช้สอยมากขึ้น", bgColor: "bg-sky-700/80", textColor: "text-sky-100", iconColor: "text-sky-300" },
    3: { nameKey: 'houseLevel3Name', description: "คฤหาสน์ภูมิฐาน สัญลักษณ์แห่งความสำเร็จ", bgColor: "bg-purple-700/80", textColor: "text-purple-100", iconColor: "text-purple-300" },
  };
  const currentHouseVisual = houseVisuals[currentHouseLevel] || houseVisuals[0];


  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl flex flex-col text-slate-100">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
        <button onClick={onBackToMenu} className="btn-back">&larr; {UI_TEXT_TH.backToMenu}</button>
        <h1 className="text-2xl md:text-3xl font-bold text-sky-300 flex items-center text-outline-black">
          <HomeIcon className="w-8 h-8 mr-3" />
          {UI_TEXT_TH.myHomeScreenTitle}
        </h1>
        <div className="w-20"> {/* Spacer */} </div>
      </div>

      <div className={`p-6 md:p-8 my-4 rounded-lg shadow-xl text-center ${currentHouseVisual.bgColor} ${currentHouseVisual.textColor} transition-all duration-500 ease-in-out transform hover:scale-105`}>
        <HouseVisualIcon level={currentHouseLevel} className={`w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 ${currentHouseVisual.iconColor}`} />
        <h2 className="text-2xl md:text-3xl font-bold mb-1 text-outline-black">{UI_TEXT_TH[currentHouseVisual.nameKey]}</h2>
        <p className="text-md opacity-90 mb-3 text-outline-black">{currentHouseVisual.description}</p>
        <p className="text-sm font-medium bg-black/20 px-3 py-1 rounded-full inline-block text-outline-black">{UI_TEXT_TH.currentHouseLevelLabel} {currentHouseLevel}</p>
      </div>

      {/* Practice Nook Section */}
      <div className="bg-slate-700/50 p-4 md:p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-2 text-purple-300 text-outline-black flex items-center">
          <MusicPracticeIcon className="w-5 h-5 mr-2" /> {UI_TEXT_TH.practiceNookTitle}
        </h3>
        <p className="text-xs text-slate-100 text-outline-black mb-3">{UI_TEXT_TH.practiceNookDescription}</p>
        <button
          onClick={handlePracticeNook}
          disabled={!!practiceNookCooldownTime}
          className="w-full btn-secondary py-2.5 text-md flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:from-emerald-500 disabled:hover:to-emerald-600"
        >
          {practiceNookCooldownTime 
            ? UI_TEXT_TH.practiceNookCooldownMessage.replace('{time}', practiceNookCooldownTime) 
            : UI_TEXT_TH.practiceNookButtonText}
        </button>
      </div>


      {/* Current House Benefits Section */}
      <div className="bg-slate-700/50 p-4 md:p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-3 text-lime-300 text-outline-black flex items-center">
            <GiftIcon className="w-5 h-5 mr-2"/> {UI_TEXT_TH.houseBenefitDescription}
        </h3>
        <ul className="space-y-1 text-sm text-slate-100 text-outline-black list-disc list-inside pl-2">
            {currentBenefits.dailyLoginBonusGCoins > 0 && (
                <li>{UI_TEXT_TH.houseBenefitDailyBonus.replace('{amount}', currentBenefits.dailyLoginBonusGCoins.toString())}</li>
            )}
            {currentBenefits.trainingXpMultiplier > 1.00 && (
                <li>{UI_TEXT_TH.houseBenefitXpBonus.replace('{percent}', ((currentBenefits.trainingXpMultiplier - 1.00) * 100).toFixed(0))}</li>
            )}
            {currentBenefits.trainingGCoinMultiplier > 1.00 && (
                <li>{UI_TEXT_TH.houseBenefitGCoinBonus.replace('{percent}', ((currentBenefits.trainingGCoinMultiplier - 1.00) * 100).toFixed(0))}</li>
            )}
            {currentBenefits.dailyLoginBonusGCoins === 0 && currentBenefits.trainingXpMultiplier === 1.00 && currentBenefits.trainingGCoinMultiplier === 1.00 && (
                <li className="text-slate-200 text-outline-black">ยังไม่มีสิทธิประโยชน์จากระดับบ้านปัจจุบัน</li>
            )}
        </ul>
      </div>

      {/* Owned Furniture and Effects Section */}
      <div className="bg-slate-700/50 p-4 md:p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-3 text-cyan-300 text-outline-black flex items-center">
          <FurnitureIcon className="w-5 h-5 mr-2" /> {UI_TEXT_TH.myFurnitureAndEffectsTitle}
        </h3>
        {playerData.ownedFurnitureIds && playerData.ownedFurnitureIds.length > 0 ? (
          <div className="space-y-3">
            {playerData.ownedFurnitureIds.map(furnitureId => {
              const details = getFurnitureItemDetails(furnitureId);
              if (!details) return null;
              return (
                <div key={furnitureId} className="bg-slate-600/70 p-3 rounded-md flex items-center space-x-3">
                  <FurnitureDisplayIcon furnitureId={furnitureId} className="w-8 h-8 text-sky-300 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-emerald-200 text-outline-black">{UI_TEXT_TH[details.nameKey]}</p>
                    <p className="text-xs text-slate-100 text-outline-black">{UI_TEXT_TH[details.effectDescriptionKey]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-200 text-outline-black text-sm">{UI_TEXT_TH.noFurnitureOwned}</p>
        )}
      </div>


      {canUpgrade ? (
        <div className="bg-slate-700 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-sky-300 text-outline-black">
            {UI_TEXT_TH.upgradeToLevelLabel.replace('{level}', nextLevel.toString())} ({getHouseLevelName(nextLevel, UI_TEXT_TH)})
          </h3>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg text-slate-100 text-outline-black">{UI_TEXT_TH.costLabel}</span>
            <span className="text-xl font-bold text-amber-400 text-outline-black flex items-center">
              <CoinIcon className="w-6 h-6 mr-1.5" /> {upgradeCost}
            </span>
          </div>
          <button
            onClick={handleUpgrade}
            disabled={!canAffordUpgrade}
            className="w-full btn-primary py-3 text-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:hover:from-blue-500 disabled:hover:to-blue-600"
          >
            <ArrowUpCircleIcon className="w-6 h-6" />
            <span>{UI_TEXT_TH.upgradeHouseButton}</span>
          </button>
          {!canAffordUpgrade && (
            <p className="text-red-400 text-sm text-center mt-3 text-outline-black">{UI_TEXT_TH.notEnoughGCoinsForUpgrade}</p>
          )}
        </div>
      ) : (
        <p className="text-xl text-center font-semibold text-green-400 text-outline-black p-6 bg-slate-700/80 rounded-lg shadow-md">
          {UI_TEXT_TH.maxHouseLevelReached}
        </p>
      )}
    </div>
  );
};

export default MyHomeScreen;
