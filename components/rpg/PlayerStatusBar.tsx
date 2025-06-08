
import React from 'react';
import { UI_TEXT_TH, LEVEL_THRESHOLDS, PET_DEFINITIONS, getNPCName } from '../../constants'; 
import { PlayerData, PetAbilityType, AvatarStyle, FaceId, HairId, SkinColorId, HairColorId, NPCId } from '../../types';
import PetDisplay from '../PetDisplay';
import { SparklesIcon } from '../icons/SparklesIcon';
import PlayerAvatar from './PlayerAvatar';
import { HeartIcon } from '../icons/HeartIcon';

interface PlayerStatusBarProps {
  playerData: PlayerData;
  onFeedPet: () => boolean;
  onPlayWithPet: () => boolean;
  getActivePetAbilityMultiplier: (abilityType: PetAbilityType) => number; 
}

const generateColorFromSeed = (seed: string | undefined | null, defaultColor = '#888888') => {
  if (!seed) return defaultColor;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
};


export const PlayerStatusBar: React.FC<PlayerStatusBarProps> = ({
    playerData,
    onFeedPet,
    onPlayWithPet,
    getActivePetAbilityMultiplier,
}) => {
  const { playerName, level, xp: currentXp, gCoins, activePetId, pets, petFoodCount, avatarStyle, appearance, isMarried, spouseId, marriageHappiness } = playerData;
  const currentLevelXpStart = level > 1 ? LEVEL_THRESHOLDS[level - 1] : 0;
  const nextLevelXpTarget = LEVEL_THRESHOLDS[level] ?? currentXp;

  const xpIntoCurrentLevel = currentXp - currentLevelXpStart;
  const xpNeededForNextLevel = nextLevelXpTarget - currentLevelXpStart;
  const xpProgressPercent = xpNeededForNextLevel > 0 ? Math.min((xpIntoCurrentLevel / xpNeededForNextLevel) * 100, 100) : (level >= LEVEL_THRESHOLDS.length ? 100 : 0);

  const activePetInstance = activePetId ? pets[activePetId] : null;

  let activeAbilityDescription = null;
  if (activePetInstance) {
    const petDef = PET_DEFINITIONS.find(def => def.id === activePetInstance.id);
    if (petDef?.ability) {
      const abilityValue = getActivePetAbilityMultiplier(petDef.ability.type); 
      const isAbilityActive = !petDef.ability.condition || petDef.ability.condition(activePetInstance);
      if (isAbilityActive && abilityValue !== 1 && (petDef.ability.type !== PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES || abilityValue > 0)) {
         activeAbilityDescription = UI_TEXT_TH[petDef.ability.descriptionKey].replace('{value}',
            (petDef.ability.type === PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES ? (abilityValue * 100).toFixed(0) : ((abilityValue -1) * 100).toFixed(0) )
         );
      }
    }
  }

  const renderAvatarContainer = () => {
    const baseClasses = "w-10 h-10 sm:w-12 sm:h-12 border-2 border-slate-500 flex items-center justify-center overflow-hidden shadow-md";
    const avatarFrameColor = generateColorFromSeed(playerName, '#718096');

    let containerShapeClasses = "rounded-full";
    if (avatarStyle === AvatarStyle.TYPE_B || avatarStyle === AvatarStyle.TYPE_C) {
        containerShapeClasses = "rounded-lg";
    }

    return (
      <div
        className={`${baseClasses} ${containerShapeClasses}`}
        style={{ backgroundColor: avatarFrameColor }}
        title={playerName || UI_TEXT_TH.playerNameDisplayLabel.replace(':', '')}
      >
        <PlayerAvatar appearance={appearance} className="w-full h-full scale-125" />
      </div>
    );
  };

  const getSpouseNameForDisplay = (sId: NPCId | null) => { 
    if (!sId) return "";
    return getNPCName(sId, UI_TEXT_TH);
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm shadow-lg p-3 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex flex-wrap justify-between items-center max-w-4xl px-2 sm:px-4 gap-y-2">
        <div className="flex items-center space-x-2 sm:space-x-3">
          {renderAvatarContainer()}
          <div className="text-xs sm:text-sm">
            {playerName && <div className="font-bold text-white text-shadow-strong mb-0.5 truncate max-w-[100px] sm:max-w-[150px]" title={playerName}>{playerName}</div>}
            <div className="text-shadow-strong">
                <span className="font-semibold text-sky-300">{UI_TEXT_TH.playerLevel}:</span>
                <span className="text-white font-bold"> {level}</span>
            </div>
            <div className="text-slate-300 text-shadow-strong mt-0.5">
              {UI_TEXT_TH.xp}: {currentXp} / {nextLevelXpTarget < currentXp && level >= LEVEL_THRESHOLDS.length ? currentXp : nextLevelXpTarget}
            </div>
            <div className="w-24 sm:w-32 md:w-40 h-2 sm:h-2.5 bg-slate-600 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${xpProgressPercent}%` }}
                role="progressbar"
                aria-valuenow={xpProgressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
        </div>

        {isMarried && spouseId && (
             <div className="flex items-center space-x-1 text-xs sm:text-sm text-pink-300 text-shadow-strong" title={`${UI_TEXT_TH.marriageHappinessDisplay?.replace('{value}', marriageHappiness.toString())} กับ ${getSpouseNameForDisplay(spouseId)}`}>
                <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{marriageHappiness}</span>
            </div>
        )}


        {activePetInstance && (
          <div className="flex items-center space-x-1">
            <PetDisplay
              pet={activePetInstance}
              petFoodCount={petFoodCount}
              onFeedPet={onFeedPet}
              onPlayWithPet={onPlayWithPet}
            />
            {activeAbilityDescription && (
                 <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 text-shadow-strong" title={activeAbilityDescription} />
            )}
          </div>
        )}

        <div className="text-xs sm:text-sm font-semibold ml-auto sm:ml-0 pl-2 sm:pl-0 text-shadow-strong">
          <span className="text-amber-400 font-bold">{UI_TEXT_TH.gCoins}:</span>
          <span className="text-white font-bold text-lg"> {gCoins}</span>
        </div>
      </div>
    </div>
  );
};
