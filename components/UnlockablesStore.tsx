
import React, { useState } from 'react';
import { PlayerData, IntervalInfo, ChordInfo, UnlockedItemType, ThaiUIText, PetAbilityType } from '../types'; // Added PetAbilityType
import { UI_TEXT_TH, ALL_INTERVALS, ALL_CHORDS } from '../constants';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { LockOpenIcon } from './icons/LockOpenIcon';
import { CoinIcon } from './icons/CoinIcon';

interface UnlockablesStoreProps {
  playerData: PlayerData;
  onBackToMenu: () => void;
  unlockMusicalItem: (itemId: string, itemType: UnlockedItemType, cost: number) => boolean;
  isMusicalItemUnlocked: (itemId: string, itemType: UnlockedItemType) => boolean;
  getActivePetAbilityMultiplier: (playerDataState: PlayerData, abilityType: PetAbilityType) => number; // New
}

const UnlockablesStore: React.FC<UnlockablesStoreProps> = ({
  playerData,
  onBackToMenu,
  unlockMusicalItem,
  isMusicalItemUnlocked,
  getActivePetAbilityMultiplier, // New
}) => {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const calculateFinalCost = (baseCost: number): number => {
    const discountMultiplier = getActivePetAbilityMultiplier(playerData, PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES);
    return Math.max(0, Math.round(baseCost * (1 - discountMultiplier)));
  };

  const handleUnlock = (item: IntervalInfo | ChordInfo, itemType: UnlockedItemType) => {
    if (!item.cost) return;
    const finalCost = calculateFinalCost(item.cost);

    if (playerData.gCoins < finalCost) {
      setFeedbackMessage(UI_TEXT_TH.notEnoughGCoins);
      setTimeout(() => setFeedbackMessage(null), 3000);
      return;
    }
    const success = unlockMusicalItem(item.id, itemType, finalCost); // Pass finalCost
    if (success) {
      setFeedbackMessage(`${UI_TEXT_TH.unlocked} ${item.name}!`);
    } else {
      setFeedbackMessage("เกิดข้อผิดพลาดบางอย่าง");
    }
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const renderUnlockableSection = (
    title: string,
    items: (IntervalInfo | ChordInfo)[],
    itemType: UnlockedItemType
  ) => {
    const advancedItems = items.filter(item => item.isAdvanced && item.cost !== undefined);

    if (advancedItems.length === 0) {
      return null;
    }

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-sky-300 text-outline-black border-b border-slate-600 pb-2">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advancedItems.map(item => {
            const isUnlocked = isMusicalItemUnlocked(item.id, itemType);
            const finalCost = calculateFinalCost(item.cost!);
            const originalCost = item.cost!;
            const hasDiscount = finalCost < originalCost;

            return (
              <div key={item.id} className="bg-slate-700 p-4 rounded-lg shadow-md flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-medium text-emerald-300 text-outline-black mb-1">{item.name}</h3>
                  <p className="text-sm text-slate-200 text-outline-black mb-2">{item.thaiName}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  {isUnlocked ? (
                    <span className="text-green-400 font-semibold flex items-center">
                      <LockOpenIcon className="w-5 h-5 mr-2" /> {UI_TEXT_TH.unlocked}
                    </span>
                  ) : (
                    <>
                      <span className="text-amber-400 font-semibold flex items-center text-outline-black">
                         <CoinIcon className="w-5 h-5 mr-1" /> {finalCost}
                         {hasDiscount && <span className="text-xs text-slate-300 line-through ml-1.5">({originalCost})</span>}
                      </span>
                      <button
                        onClick={() => handleUnlock(item, itemType)}
                        disabled={playerData.gCoins < finalCost}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-md shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <LockClosedIcon className="w-4 h-4 mr-2" /> {UI_TEXT_TH.unlockItem}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
        <button onClick={onBackToMenu} className="btn-back">&larr; {UI_TEXT_TH.backToMenu}</button>
        <h1 className="text-2xl md:text-3xl font-bold text-sky-300 text-outline-black">
          {UI_TEXT_TH.unlockablesStoreTitle}
        </h1>
        <div className="w-20"> {/* Spacer */} </div>
      </div>

      {feedbackMessage && (
        <div className={`p-3 mb-4 rounded-md text-center text-white ${feedbackMessage === UI_TEXT_TH.notEnoughGCoins ? 'bg-red-500' : 'bg-green-500'}`}>
          {feedbackMessage}
        </div>
      )}

      {renderUnlockableSection(UI_TEXT_TH.intervalsMastery, ALL_INTERVALS, UnlockedItemType.INTERVAL)}
      {renderUnlockableSection(UI_TEXT_TH.chordsMastery, ALL_CHORDS, UnlockedItemType.CHORD)}

      {ALL_INTERVALS.filter(i => i.isAdvanced).length === 0 && ALL_CHORDS.filter(c => c.isAdvanced).length === 0 && (
          <p className="text-center text-slate-200 text-outline-black mt-8">ไม่มีเนื้อหาให้ปลดล็อกในขณะนี้</p>
      )}
    </div>
  );
};

export default UnlockablesStore;
