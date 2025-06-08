
import React, { useState, useEffect, useCallback } from 'react';
import { PlayerData, ThaiUIText, NotificationMessage, AppView, FurnitureId, PracticeNookResult, NPCId, ChildGrowthStage, ChildNeedType, ShopItemId } from '../../types';
import {
    UI_TEXT_TH, HOUSE_UPGRADE_COSTS, MAX_HOUSE_LEVEL, getHouseLevelName, HOUSE_BENEFITS_PER_LEVEL,
    getFurnitureItemDetails, ALL_FURNITURE_ITEMS, PRACTICE_NOOK_COOLDOWN_HOURS, getPetName, formatTime, getNPCName,
    MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD, SPOUSAL_BONUS_PRACTICE_NOOK_COOLDOWN_REDUCTION_MELODIE, getNPCDefinition,
    SHOP_ITEMS,
    TUITION_COST // Added TUITION_COST import
} from '../../constants';
import { HomeIcon } from '../icons/HomeIcon';
import { CoinIcon } from '../icons/CoinIcon';
import { ArrowUpCircleIcon } from '../icons/ArrowUpCircleIcon';
import { PlotLandIcon } from '../icons/PlotLandIcon';
import { HutIcon } from '../icons/HutIcon';
import { SmallHouseIcon } from '../icons/SmallHouseIcon';
import { MansionIcon } from '../icons/MansionIcon';
import { GiftIcon } from '../icons/GiftIcon';
import { PianoIcon } from '../icons/PianoIcon';
import { BookshelfIcon } from '../icons/BookshelfIcon';
import { PetBedIcon } from '../icons/PetBedIcon';
import { FurnitureIcon } from '../icons/FurnitureIcon';
import { MusicPracticeIcon } from '../icons/MusicPracticeIcon';
import { BabyIcon } from '../icons/BabyIcon';
import { FoodBowlIcon } from '../icons/FoodBowlIcon';
import { HandSparklesIcon } from '../icons/HandSparklesIcon';
import { DiaperIcon } from '../icons/DiaperIcon';
import { BabyCrawlingIcon } from '../icons/BabyCrawlingIcon';
import { BedIcon } from '../icons/BedIcon';
import { SickIcon } from '../icons/SickIcon';


interface MyHomeScreenProps {
  playerData: PlayerData;
  upgradeHouse: () => { success: boolean, messageKey?: keyof ThaiUIText, newLevel?: number };
  activatePracticeNook: () => PracticeNookResult;
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  onBackToMenu: () => void;
  navigateTo: (view: AppView) => void;
  initiateChildEvent: () => boolean;
  feedChild: (itemId: ShopItemId.MILK_POWDER | ShopItemId.BABY_FOOD) => void;
  playWithChild: () => void;
  changeChildDiaper: () => void;
  sootheChildToSleep: () => void;
  useChildCareKit: () => void;
  payTuition: () => void; // Added
  helpWithHomework: () => void; // Added
  performBusking: () => { success: boolean; messageKey?: keyof ThaiUIText; gcoinsEarned?: number }; // Added
  getBuskingCooldownTime: () => string | null; // Added
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

const ChildVisualIcon: React.FC<{ stage: ChildGrowthStage | undefined, className?: string, isCrying?: boolean, isSick?: boolean, isSleeping?: boolean }> = ({ stage, className, isCrying, isSick, isSleeping }) => {
    if (isSick) return <SickIcon className={`${className} text-3xl text-red-400 animate-pulse`} />;
    if (isSleeping) return <span className={`${className} text-3xl`} role="img" aria-label="ลูกกำลังหลับ">😴</span>;
    if (isCrying) return <span className={`${className} text-3xl animate-bounce`} role="img" aria-label="ลูกร้องไห้">😢</span>;
    
    switch(stage) {
        case ChildGrowthStage.INFANT: return <span className={`${className} text-3xl`} role="img" aria-label="ทารก">👶</span>;
        case ChildGrowthStage.CRAWLER: return <BabyCrawlingIcon className={`${className} text-3xl text-green-300`} />; 
        case ChildGrowthStage.TODDLER: return <span className={`${className} text-3xl`} role="img" aria-label="เด็กหัดเดิน">🧒</span>;
        default: return <BabyIcon className={className} />;
    }
};

const houseVisuals: { [level: number]: { nameKey: keyof ThaiUIText, description: string, bgColor: string, textColor: string, iconColor: string } } = {
    0: { nameKey: 'houseLevel0Name', description: "ที่ดินผืนน้อย รอการพัฒนาเป็นบ้านในฝัน", bgColor: "bg-slate-600/70", textColor: "text-slate-200", iconColor: "text-slate-400" },
    1: { nameKey: 'houseLevel1Name', description: "กระท่อมไม้อบอุ่น จุดเริ่มต้นของความสุข", bgColor: "bg-yellow-700/80", textColor: "text-yellow-100", iconColor: "text-yellow-300" },
    2: { nameKey: 'houseLevel2Name', description: "บ้านไม้โอ่โถง พร้อมพื้นที่ใช้สอยมากขึ้น", bgColor: "bg-sky-700/80", textColor: "text-sky-100", iconColor: "text-sky-300" },
    3: { nameKey: 'houseLevel3Name', description: "คฤหาสน์ภูมิฐาน สัญลักษณ์แห่งความสำเร็จ", bgColor: "bg-purple-700/80", textColor: "text-purple-100", iconColor: "text-purple-300" },
};


const MyHomeScreen: React.FC<MyHomeScreenProps> = ({
  playerData,
  upgradeHouse,
  activatePracticeNook,
  addNotification,
  onBackToMenu,
  navigateTo,
  initiateChildEvent,
  feedChild,
  playWithChild,
  changeChildDiaper,
  sootheChildToSleep,
  useChildCareKit,
  payTuition, // Destructured
  helpWithHomework, // Destructured
  performBusking, // Destructured
  getBuskingCooldownTime, // Destructured
}) => {
  const currentHouseLevel = playerData.houseLevel;
  const currentBenefits = HOUSE_BENEFITS_PER_LEVEL[currentHouseLevel] || HOUSE_BENEFITS_PER_LEVEL[0];
  const [practiceNookCooldownTime, setPracticeNookCooldownTime] = useState<string | null>(null);
  const currentHouseVisual = houseVisuals[currentHouseLevel] || houseVisuals[0];
  const [buskingCooldownDisplay, setBuskingCooldownDisplay] = useState<string | null>(getBuskingCooldownTime());


  const updatePracticeNookCooldownDisplay = useCallback(() => {
    if (playerData.lastPracticeNookTimestamp) {
      const now = Date.now();
      let currentCooldownHours = PRACTICE_NOOK_COOLDOWN_HOURS;
      if (playerData.isMarried && playerData.spouseId === NPCId.MELODIE && playerData.marriageHappiness > MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD) {
        currentCooldownHours *= (1 - SPOUSAL_BONUS_PRACTICE_NOOK_COOLDOWN_REDUCTION_MELODIE);
      }
      const cooldownMillis = currentCooldownHours * 60 * 60 * 1000;
      const timePassed = now - playerData.lastPracticeNookTimestamp;
      setPracticeNookCooldownTime(timePassed < cooldownMillis ? formatTime(cooldownMillis - timePassed) : null);
    } else {
      setPracticeNookCooldownTime(null);
    }
  }, [playerData.lastPracticeNookTimestamp, playerData.isMarried, playerData.spouseId, playerData.marriageHappiness]);

  useEffect(() => {
    updatePracticeNookCooldownDisplay();
    const interval = setInterval(updatePracticeNookCooldownDisplay, 1000);
    return () => clearInterval(interval);
  }, [updatePracticeNookCooldownDisplay]);
  
  useEffect(() => {
    const updateBuskingDisplay = () => setBuskingCooldownDisplay(getBuskingCooldownTime());
    updateBuskingDisplay();
    const interval = setInterval(updateBuskingDisplay, 1000);
    return () => clearInterval(interval);
  }, [getBuskingCooldownTime]);


  const handleUpgrade = () => {
    upgradeHouse();
  };

  const handlePracticeNook = () => {
    activatePracticeNook();
    updatePracticeNookCooldownDisplay();
  };

  const handleInitiateChild = () => {
    if(initiateChildEvent()){
      navigateTo(AppView.CHILD_NAMING_PAGE);
    }
  };
  
  const handlePerformBusking = () => {
    performBusking();
    setBuskingCooldownDisplay(getBuskingCooldownTime()); // Update display immediately
  };


  const spouseDef = playerData.isMarried && playerData.spouseId ? getNPCDefinition(playerData.spouseId) : null;
  const spousePortrait = spouseDef?.portraitUrl || '❤️';

  const nextLevel = currentHouseLevel + 1;
  const canUpgrade = currentHouseLevel < MAX_HOUSE_LEVEL;
  const upgradeCost = canUpgrade ? HOUSE_UPGRADE_COSTS[nextLevel] : 0;
  const canAffordUpgrade = canUpgrade && playerData.gCoins >= upgradeCost;

  const child = playerData.childData;
  const isChildSleeping = child?.sleepiness === 0 && (Date.now() - (child.lastSleptTimestamp || 0)) < 1000 * 60 * 5; // Example: considered sleeping for 5 mins after soothe

  const getNeedText = (need: ChildNeedType): string => {
    const childName = child?.name || 'ลูกน้อย';
    switch(need) {
        case ChildNeedType.HUNGER: return UI_TEXT_TH.childNeedHungry.replace('{childName}', childName);
        case ChildNeedType.CLEANLINESS: return UI_TEXT_TH.childNeedDirty.replace('{childName}', childName);
        case ChildNeedType.AFFECTION: return UI_TEXT_TH.childNeedAffection.replace('{childName}', childName);
        case ChildNeedType.SLEEP: return UI_TEXT_TH.childNeedSleepy.replace('{childName}', childName);
        case ChildNeedType.SICKNESS: return UI_TEXT_TH.childIsSickMessage.replace('{childName}', childName);
        default: return "";
    }
  };

  const getMilkItemName = (): string => {
    const milkDef = SHOP_ITEMS.find(item => item.id === ShopItemId.MILK_POWDER);
    return milkDef ? UI_TEXT_TH[milkDef.nameKey] : "นมผง";
  };

  const getBabyFoodItemName = (): string => {
    const foodDef = SHOP_ITEMS.find(item => item.id === ShopItemId.BABY_FOOD);
    return foodDef ? UI_TEXT_TH[foodDef.nameKey] : "อาหารเด็ก";
  };
  
  const getChildCareKitName = (): string => {
    const kitDef = SHOP_ITEMS.find(item => item.id === ShopItemId.CHILD_CARE_KIT);
    return kitDef ? UI_TEXT_TH[kitDef.nameKey] : "ชุดดูแลลูกน้อย";
  };


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
        <div className="relative">
            <HouseVisualIcon level={currentHouseLevel} className={`w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 ${currentHouseVisual.iconColor}`} />
            {playerData.isMarried && playerData.spouseId && (
                <div
                    className="absolute top-2 right-2 text-4xl bg-slate-800/60 p-1.5 rounded-full shadow-md"
                    title={`${getNPCName(playerData.spouseId, UI_TEXT_TH)} ${UI_TEXT_TH.isInTheHouse || 'อยู่ที่นี่'}`}
                >
                    {spousePortrait}
                </div>
            )}
             {child && (
                <div
                    className="absolute top-2 left-2 text-3xl bg-slate-800/60 p-1.5 rounded-full shadow-md"
                    title={child.name}
                >
                    <ChildVisualIcon stage={child.growthStage} isCrying={child.pendingNeeds.length > 0 && !child.isSick && !isChildSleeping} isSick={child.isSick} isSleeping={isChildSleeping} />
                </div>
            )}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-1 text-outline-black">{getHouseLevelName(currentHouseLevel, UI_TEXT_TH)}</h2>
        <p className="text-md opacity-90 mb-3 text-outline-black">{currentHouseVisual.description || "บ้านแสนสุข"}</p>
        <p className="text-sm font-medium bg-black/20 px-3 py-1 rounded-full inline-block text-outline-black">{UI_TEXT_TH.currentHouseLevelLabel} {currentHouseLevel}</p>
      </div>

      {playerData.isMarried && playerData.spouseId && !child && (
         <div className="bg-pink-700/30 p-4 rounded-lg shadow-md mb-6 text-center">
            <button
                onClick={handleInitiateChild}
                className="btn-primary bg-pink-500 hover:bg-pink-600 disabled:bg-pink-800 disabled:opacity-70"
                disabled={!playerData.babyCribOwned || playerData.houseLevel < 3}
            >
                วางแผนมีลูกกับ {getNPCName(playerData.spouseId, UI_TEXT_TH)}
            </button>
            {!playerData.babyCribOwned && <p className="text-xs text-yellow-300 mt-1">ต้องการ: เตียงเด็ก</p>}
            {playerData.houseLevel < 3 && <p className="text-xs text-yellow-300 mt-1">ต้องการ: บ้านระดับ 3</p>}
        </div>
      )}

      {child && (
        <div className="bg-teal-700/30 p-4 md:p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-3 text-teal-200 text-outline-black flex items-center">
            <ChildVisualIcon stage={child.growthStage} className="mr-2" isCrying={child.pendingNeeds.length > 0 && !child.isSick && !isChildSleeping} isSick={child.isSick} isSleeping={isChildSleeping} />
            {child.name} ({UI_TEXT_TH[`childGrowthStage_${child.growthStage}` as keyof ThaiUIText] || child.growthStage})
            {child.isSick && <span className="ml-2 text-red-400 text-sm">(ไม่สบาย)</span>}
            {isChildSleeping && <span className="ml-2 text-blue-300 text-sm">(หลับปุ๋ย)</span>}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <p className="text-slate-100 text-outline-black">{UI_TEXT_TH.childHappinessLabel} <span className="font-bold text-white">{child.happiness.toFixed(0)}/100</span></p>
            <p className="text-slate-100 text-outline-black">{UI_TEXT_TH.childHungerLabel} <span className="font-bold text-white">{child.hunger.toFixed(0)}/100</span></p>
            <p className="text-slate-100 text-outline-black">{UI_TEXT_TH.childCleanlinessLabel} <span className="font-bold text-white">{child.cleanliness.toFixed(0)}/100</span></p>
            <p className="text-slate-100 text-outline-black">{UI_TEXT_TH.childAffectionLabel} <span className="font-bold text-white">{child.affection.toFixed(0)}/100</span></p>
            <p className="text-slate-100 text-outline-black">{UI_TEXT_TH.childSleepinessLabel} <span className="font-bold text-white">{child.sleepiness.toFixed(0)}/100</span></p>
             {child.growthStage === ChildGrowthStage.SCHOOL_AGE && (
              <>
                <p className="text-slate-100 text-outline-black">{UI_TEXT_TH.academicPerformanceLabel} <span className="font-bold text-white">{child.academicPerformance}</span></p>
                <p className="text-slate-100 text-outline-black">{UI_TEXT_TH.tuitionStatusLabel} <span className={`font-bold ${child.tuitionDueDate && Date.now() > child.tuitionDueDate ? 'text-red-400' : 'text-green-300'}`}>{child.tuitionDueDate && Date.now() > child.tuitionDueDate ? UI_TEXT_TH.tuitionStatusOverdue : UI_TEXT_TH.tuitionStatusPaid}</span></p>
              </>
            )}
          </div>
          {child.pendingNeeds.length > 0 && !isChildSleeping && (
            <div className="mb-3 p-2 bg-red-700/50 rounded">
                {child.pendingNeeds.map(need => <p key={need} className="text-sm text-yellow-300 text-outline-black">{getNeedText(need)}</p>)}
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
                onClick={() => feedChild(ShopItemId.MILK_POWDER)}
                className="btn-sm btn-success flex-col h-16"
                disabled={playerData.milkPowderCount <= 0 || isChildSleeping}
                title={`${UI_TEXT_TH.feedChildButton} (${getMilkItemName()})`}
            >
                <FoodBowlIcon className="w-5 h-5 mb-1"/> <span>{getMilkItemName()} ({playerData.milkPowderCount})</span>
            </button>
             <button
                onClick={() => feedChild(ShopItemId.BABY_FOOD)}
                className="btn-sm btn-success flex-col h-16"
                disabled={playerData.babyFoodCount <= 0 || isChildSleeping}
                title={`${UI_TEXT_TH.feedChildButton} (${getBabyFoodItemName()})`}
            >
                <FoodBowlIcon className="w-5 h-5 mb-1"/> <span>{getBabyFoodItemName()} ({playerData.babyFoodCount})</span>
            </button>
            <button onClick={() => playWithChild()} className="btn-sm btn-info flex-col h-16" disabled={isChildSleeping}>
                <HandSparklesIcon className="w-5 h-5 mb-1"/> <span>{UI_TEXT_TH.playWithChildButton}</span>
            </button>
            <button
                onClick={() => changeChildDiaper()}
                className="btn-sm btn-warning flex-col h-16"
                disabled={playerData.diapersCount <= 0 || isChildSleeping}
                title={UI_TEXT_TH.changeDiaperButton}
            >
                 <DiaperIcon className="w-5 h-5 mb-1"/> <span>{UI_TEXT_TH.changeDiaperButton} ({playerData.diapersCount})</span>
            </button>
            <button onClick={() => sootheChildToSleep()} className="btn-sm btn-neutral flex-col h-16" disabled={isChildSleeping || child.sleepiness < 30}>
                 <BedIcon className="w-5 h-5 mb-1"/> <span>{UI_TEXT_TH.sootheToSleepButtonLabel}</span>
            </button>
             {child.isSick && (
                <button
                    onClick={() => useChildCareKit()}
                    className="btn-sm btn-accent flex-col h-16"
                    disabled={(playerData.childCareKitCount || 0) <= 0}
                    title={UI_TEXT_TH.useChildCareKitButtonLabel}
                >
                    <SickIcon className="w-5 h-5 mb-1"/> <span>{getChildCareKitName()} ({playerData.childCareKitCount || 0})</span>
                </button>
            )}
            {child.growthStage === ChildGrowthStage.SCHOOL_AGE && child.tuitionDueDate && Date.now() > child.tuitionDueDate && (
                <button onClick={payTuition} className="btn-sm btn-destructive flex-col h-16" disabled={playerData.gCoins < TUITION_COST}>
                    {UI_TEXT_TH.payTuitionButtonLabel} ({TUITION_COST} G)
                </button>
            )}
             {child.growthStage === ChildGrowthStage.SCHOOL_AGE && child.homeworkAvailable && (
                <button onClick={helpWithHomework} className="btn-sm btn-info flex-col h-16">
                    {UI_TEXT_TH.helpWithHomeworkButtonLabel}
                </button>
            )}
          </div>
        </div>
      )}

      {/* Side Job: Busking */}
       <div className="bg-slate-700/50 p-4 md:p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-2 text-amber-300 text-outline-black flex items-center">
          <MusicPracticeIcon className="w-5 h-5 mr-2" /> {UI_TEXT_TH.sideJobBuskingTitle}
        </h3>
        <p className="text-xs text-slate-100 text-outline-black mb-3">{UI_TEXT_TH.sideJobBuskingDescription}</p>
        <button
          onClick={handlePerformBusking}
          disabled={!!buskingCooldownDisplay}
          className="w-full btn-accent py-2.5 text-md flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {buskingCooldownDisplay
            ? UI_TEXT_TH.sideJobOnCooldownMessage.replace('{itemName}', buskingCooldownDisplay)
            : UI_TEXT_TH.sideJobPerformBuskingButton}
        </button>
      </div>


      <div className="bg-slate-700/50 p-4 md:p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-2 text-purple-300 text-outline-black flex items-center">
          <MusicPracticeIcon className="w-5 h-5 mr-2" /> {UI_TEXT_TH.practiceNookTitle}
        </h3>
        <p className="text-xs text-slate-100 text-outline-black mb-3">{UI_TEXT_TH.practiceNookDescription}</p>
        <button
          onClick={handlePracticeNook}
          disabled={!!practiceNookCooldownTime}
          className="w-full btn-secondary py-2.5 text-md flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {practiceNookCooldownTime
            ? UI_TEXT_TH.practiceNookCooldownMessage.replace('{time}', practiceNookCooldownTime)
            : UI_TEXT_TH.practiceNookButtonText}
        </button>
      </div>

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
            className="w-full btn-primary py-3 text-lg flex items-center justify-center space-x-2 disabled:opacity-50"
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
