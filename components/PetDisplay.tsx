
import React from 'react';
import { ActivePet, ThaiUIText, PetSpecialRequest } from '../types';
import { UI_TEXT_TH, MAX_PET_HUNGER, PET_LEVEL_THRESHOLDS, MAX_PET_HAPPINESS, PET_PLAY_COOLDOWN_HOURS } from '../constants';
import { PetIcon } from './icons/PetIcon';
import { FoodBowlIcon } from './icons/FoodBowlIcon';
import { HandSparklesIcon } from './icons/HandSparklesIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface PetDisplayProps {
  pet: ActivePet;
  petFoodCount: number;
  onFeedPet: () => boolean;
  onPlayWithPet: () => boolean;
}

const PetDisplay: React.FC<PetDisplayProps> = ({ pet, petFoodCount, onFeedPet, onPlayWithPet }) => {
  const hungerPercentage = (pet.hunger / MAX_PET_HUNGER) * 100;
  let hungerBarColor = 'bg-green-500';
  if (hungerPercentage < 60) hungerBarColor = 'bg-yellow-500';
  if (hungerPercentage < 30) hungerBarColor = 'bg-red-500';

  const currentPetLevelXpStart = pet.level > 1 ? PET_LEVEL_THRESHOLDS[pet.level - 1] : 0;
  const nextPetLevelXpTarget = PET_LEVEL_THRESHOLDS[pet.level] ?? pet.xp;
  const petXpIntoCurrentLevel = pet.xp - currentPetLevelXpStart;
  const petXpNeededForNextLevel = nextPetLevelXpTarget - currentPetLevelXpStart;
  const petXpProgressPercent = petXpNeededForNextLevel > 0 ? Math.min((petXpIntoCurrentLevel / petXpNeededForNextLevel) * 100, 100) : (pet.level >= PET_LEVEL_THRESHOLDS.length ? 100 : 0);

  const happinessPercentage = (pet.happiness / MAX_PET_HAPPINESS) * 100;
  let happinessEmoji = '😊';
  let happinessColor = 'text-green-400';
  if (happinessPercentage < 70) { happinessEmoji = '🙂'; happinessColor = 'text-yellow-400';}
  if (happinessPercentage < 40) { happinessEmoji = '😟'; happinessColor = 'text-orange-400';}
  if (happinessPercentage < 15) { happinessEmoji = '😢'; happinessColor = 'text-red-400';}

  const now = Date.now();
  const playCooldownMillis = PET_PLAY_COOLDOWN_HOURS * 60 * 60 * 1000;
  const canPlayWithPet = (now - pet.lastPlayedTimestamp) >= playCooldownMillis;

  const collarColorStyle = pet.customization?.collarColor
    ? { '--pet-collar-color': pet.customization.collarColor } as React.CSSProperties
    : {};

  const specialRequestText = pet.specialRequest && !pet.specialRequest.fulfilled
    ? UI_TEXT_TH[pet.specialRequest.descriptionKey]
        .replace('{petName}', pet.name)
        .replace('{targetName}', pet.specialRequest.targetName)
    : null;

  return (
    <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-700/60 px-2 py-1.5 rounded-lg shadow-md relative">
      <PetIcon
        className={`w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 ${hungerPercentage < 30 ? 'text-red-300 animate-pulse' : happinessPercentage < 40 ? 'text-sky-300' : 'text-sky-400'}`}
        style={collarColorStyle}
      />
      <div className="flex-grow">
        <div className="flex items-baseline space-x-1.5">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-100 text-shadow truncate max-w-[60px] sm:max-w-[80px]" title={pet.name}>{pet.name}</span>
            <span className={`text-xs sm:text-sm font-bold ${happinessColor} text-shadow`} title={`${UI_TEXT_TH.petHappinessLabel} ${Math.round(pet.happiness)}%`}>{happinessEmoji}</span>
        </div>
         <div className="text-[9px] sm:text-[10px] text-slate-200 text-shadow -mt-0.5">
            {UI_TEXT_TH.petLevelLabel} {pet.level}
        </div>
        <div className="w-12 sm:w-16 h-1 bg-slate-600 rounded-full overflow-hidden mt-0.5" title={`${UI_TEXT_TH.petXpLabel} ${pet.xp}/${nextPetLevelXpTarget}`}>
          <div
            className="h-full bg-purple-500 transition-all duration-300 ease-linear"
            style={{ width: `${petXpProgressPercent}%` }}
          ></div>
        </div>
        <div className="w-12 sm:w-16 h-1 bg-slate-500 rounded-full overflow-hidden mt-0.5" title={`${UI_TEXT_TH.petHungerLabel} ${Math.round(pet.hunger)}%`}>
          <div
            className={`h-full ${hungerBarColor} transition-all duration-300 ease-linear`}
            style={{ width: `${hungerPercentage}%` }}
          ></div>
        </div>
      </div>
      <div className="flex flex-col space-y-1">
        {petFoodCount > 0 && (
          <button
            onClick={onFeedPet}
            title={`${UI_TEXT_TH.feedPetButton} (${UI_TEXT_TH.petFoodName}: ${petFoodCount})`}
            className="p-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white transition-colors shadow-sm"
            aria-label={UI_TEXT_TH.feedPetButton}
          >
            <FoodBowlIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
        <button
            onClick={onPlayWithPet}
            disabled={!canPlayWithPet}
            title={canPlayWithPet ? UI_TEXT_TH.playWithPetButton : UI_TEXT_TH.petPlayCooldownMessage}
            className="p-1 bg-sky-500 hover:bg-sky-600 rounded text-white transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label={UI_TEXT_TH.playWithPetButton}
        >
            <HandSparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
      {specialRequestText && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-max max-w-[150px] sm:max-w-xs bg-yellow-500 text-black text-[10px] sm:text-xs px-2 py-0.5 rounded-md shadow-lg z-10 flex items-center animate-pulse text-shadow" title={specialRequestText}>
            <SparklesIcon className="w-3 h-3 mr-1 flex-shrink-0"/>
            <span className="truncate">{specialRequestText}</span>
        </div>
      )}
    </div>
  );
};

export default PetDisplay;
