
import React from 'react';
import { UI_TEXT_TH, LEVEL_THRESHOLDS, PET_DEFINITIONS, getPetName } from '../../constants';
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
  if (!seed || seed.length === 0) return '#718096'; // slate-500
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 55%)`; // Keep saturation and lightness consistent for a cohesive look
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

  const avatarSeedText = playerName || (playerData.xp.toString() + playerData.level.toString());
  const avatarColor = generateColorFromSeed(avatarSeedText);
  const avatarInitial = playerName ? playerName.charAt(0).toUpperCase() : 'P';


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
    <div className="bg-slate-800/90 backdrop-blur-md shadow-lg p-2.5 fixed top-0 left-0 right-0 z-50 border-b border-slate-700/50">
      <div className="container mx-auto flex flex-wrap justify-between items-center max-w-5xl px-2 sm:px-4 gap-y-2">
        {/* Player Info Section */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-slate-600 flex items-center justify-center text-slate-50 text-lg font-bold shadow-md"
            style={{ backgroundColor: avatarColor }}
            title={playerName || UI_TEXT_TH.playerNameDisplayLabel}
          >
            {avatarInitial}
          </div>
          <div>
            {playerName && <div className="text-white font-semibold text-sm sm:text-md truncate max-w-[90px] sm:max-w-[120px]" title={playerName}>{playerName}</div>}
            <div className="text-xs text-primary-light">
              {UI_TEXT_TH.playerLevel}: <span className="font-bold text-white">{level}</span>
            </div>
          </div>
          <div className="w-20 sm:w-28 md:w-32">
            <div className="text-[10px] sm:text-xs text-textMuted mb-0.5 truncate">
              {UI_TEXT_TH.xp}: {currentXp} / {level >= LEVEL_THRESHOLDS.length ? currentXp : nextLevelXpTarget}
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-success-light to-primary-light transition-all duration-500 ease-out"
                style={{ width: `${xpProgressPercent}%` }}
                role="progressbar"
                aria-valuenow={xpProgressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
        </div>

        {/* Pet Info Section (aligns center on small, then to right of player info) */}
        {activePetInstance && (
          <div className="flex items-center space-x-1 order-3 sm:order-2 mx-auto sm:mx-0">
            <PetDisplay
              pet={activePetInstance}
              petFoodCount={petFoodCount}
              onFeedPet={onFeedPet}
              onPlayWithPet={onPlayWithPet}
            />
            {activeAbilityDescription && (
                 <SparklesIcon className="w-4 h-4 text-yellow-400 self-center" title={activeAbilityDescription} />
            )}
          </div>
        )}

        {/* G-Coins (aligns right) */}
        <div className="text-xs sm:text-sm font-semibold text-accent order-2 sm:order-3 ml-auto sm:ml-0">
          {UI_TEXT_TH.gCoins}: <span className="text-lg text-white">{gCoins}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatusBar;
