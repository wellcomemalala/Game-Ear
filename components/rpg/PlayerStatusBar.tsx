
import React from 'react';
import { UI_TEXT_TH, LEVEL_THRESHOLDS, PET_DEFINITIONS } from '../../constants';
import { PlayerData, PetAbilityType } from '../../types';
import PetDisplay from '../PetDisplay';
import { SparklesIcon } from '../icons/SparklesIcon';

interface PlayerStatusBarProps {
  playerData: PlayerData;
  onFeedPet: () => boolean;
  onPlayWithPet: () => boolean;
  getActivePetAbilityMultiplier: (playerDataState: PlayerData, abilityType: PetAbilityType) => number;
}

const generateColorFromSeed = (seed: string | undefined | null) => {
  if (!seed) return '#888888';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - color.length) + color;
};

const PlayerStatusBar: React.FC<PlayerStatusBarProps> = ({
    playerData,
    onFeedPet,
    onPlayWithPet,
    getActivePetAbilityMultiplier,
}) => {
  const { playerName, level, xp: currentXp, gCoins, activePetId, pets, petFoodCount } = playerData;
  const currentLevelXpStart = level > 1 ? LEVEL_THRESHOLDS[level - 1] : 0;
  const nextLevelXpTarget = LEVEL_THRESHOLDS[level] ?? currentXp;

  const xpIntoCurrentLevel = currentXp - currentLevelXpStart;
  const xpNeededForNextLevel = nextLevelXpTarget - currentLevelXpStart;
  const xpProgressPercent = xpNeededForNextLevel > 0 ? Math.min((xpIntoCurrentLevel / xpNeededForNextLevel) * 100, 100) : (level >= LEVEL_THRESHOLDS.length ? 100 : 0);

  const avatarSeed = playerName || (playerData.xp.toString() + playerData.level.toString());
  const avatarColor = generateColorFromSeed(avatarSeed);
  const avatarInitial = playerName ? playerName.charAt(0).toUpperCase() : "P";

  const activePetInstance = activePetId ? pets[activePetId] : null;
  
  let activeAbilityDescription = null;
  if (activePetInstance) {
    const petDef = PET_DEFINITIONS.find(def => def.id === activePetInstance.id);
    if (petDef?.ability) {
      const abilityValue = getActivePetAbilityMultiplier(playerData, petDef.ability.type);
      const isAbilityActive = !petDef.ability.condition || petDef.ability.condition(activePetInstance);
      if (isAbilityActive && abilityValue !== 1 && (petDef.ability.type !== PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES || abilityValue > 0)) {
         activeAbilityDescription = UI_TEXT_TH[petDef.ability.descriptionKey].replace('{value}', 
            (petDef.ability.type === PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES ? (abilityValue * 100).toFixed(0) : ((abilityValue -1) * 100).toFixed(0) )
         );
      }
    }
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm shadow-lg p-3 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex flex-wrap justify-between items-center max-w-4xl px-2 sm:px-4 gap-y-2">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-slate-500 flex items-center justify-center text-slate-100 text-xl font-bold"
            style={{ backgroundColor: avatarColor }}
            title={playerName || "ผู้เล่น"}
          >
            {avatarInitial}
          </div>
          <div className="text-xs sm:text-sm">
            {playerName && <div className="font-bold text-white text-outline-black mb-0.5 truncate max-w-[100px] sm:max-w-[150px]" title={playerName}>{playerName}</div>}
            <div className="text-outline-black">
                <span className="font-semibold text-sky-300">{UI_TEXT_TH.playerLevel}:</span>
                <span className="text-white font-bold"> {level}</span>
            </div>
            <div className="text-slate-300 text-outline-black mt-0.5">
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

        {activePetInstance && (
          <div className="flex items-center space-x-1">
            <PetDisplay
              pet={activePetInstance}
              petFoodCount={petFoodCount}
              onFeedPet={onFeedPet}
              onPlayWithPet={onPlayWithPet}
            />
            {activeAbilityDescription && (
                 <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 text-outline-black" title={activeAbilityDescription} />
            )}
          </div>
        )}

        <div className="text-xs sm:text-sm font-semibold ml-auto sm:ml-0 pl-2 sm:pl-0">
          <span className="text-amber-300 font-bold text-outline-black">{UI_TEXT_TH.gCoins}:</span>
          <span className="text-yellow-300 font-bold text-lg text-outline-black"> {gCoins}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatusBar;