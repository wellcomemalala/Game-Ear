
import React, { useState, useCallback } from 'react';
import { PlayerData, PlayerAppearance, FaceId, HairId, SkinColorId, HairColorId, ThaiUIText, NotificationMessage, AchievementId, ClothingId, ClothingLayer, ClothingItem, UnlockedItemType } from '../../types';
import { UI_TEXT_TH, ALL_FACE_OPTIONS, ALL_HAIR_OPTIONS, ALL_SKIN_COLOR_OPTIONS, ALL_HAIR_COLOR_OPTIONS, ALL_CLOTHING_ITEMS, getClothingItem } from '../../constants';
import { PaintBrushIcon } from '../icons/PaintBrushIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import PlayerAvatar from '../rpg/PlayerAvatar';
import { ShirtIcon } from '../icons/ShirtIcon'; // For clothing section

interface AvatarCustomizationPageProps {
  playerData: PlayerData;
  onBackToSettings: () => void;
  setPlayerAppearance: (newAppearance: Partial<PlayerAppearance>) => void;
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  equipClothingItem: (clothingId: ClothingId | undefined, layer: ClothingLayer) => void; // New prop
}

const AvatarCustomizationPage: React.FC<AvatarCustomizationPageProps> = ({
  playerData,
  onBackToSettings,
  setPlayerAppearance,
  addNotification,
  equipClothingItem, // New prop
}) => {
  const [currentAppearance, setCurrentAppearance] = useState<PlayerAppearance>(playerData.appearance);

  const handleSave = () => {
    setPlayerAppearance(currentAppearance); // This saves face, hair, colors
    // Clothing is equipped immediately, so no separate save needed for it here.
    addNotification({ type: 'info', titleKey: 'avatarAppearanceUpdated' });
    onBackToSettings();
  };

  const renderOptionSelector = <T extends string>(
    labelKey: keyof ThaiUIText,
    options: { id: T; nameKey: keyof ThaiUIText; hexColor?: string }[],
    currentValue: T | undefined, // currentValue can be undefined (e.g. no shirt equipped)
    setter: (value: T) => void,
    allowUndefined: boolean = false // New param to allow unselecting to undefined
  ) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-sky-200 mb-1 text-outline-black">{UI_TEXT_TH[labelKey]}</label>
        <div className="flex flex-wrap gap-2">
           {allowUndefined && ( // Button to unequip/set to undefined
            <button
              onClick={() => setter(undefined as unknown as T)} // A bit of a hack for typing, ensure setter handles undefined
              className={`px-3 py-2 rounded-md text-xs sm:text-sm border-2 transition-all duration-150 ease-in-out
                ${currentValue === undefined ? 'ring-2 ring-offset-2 ring-offset-slate-800 !border-red-400 text-white shadow-lg bg-slate-500' : 'border-slate-600 hover:border-slate-500 shadow-sm bg-slate-600 hover:bg-slate-500 text-slate-100'}`}
            >
              ไม่ใส่
              {currentValue === undefined && <CheckCircleIcon className="w-4 h-4 inline-block ml-1.5 -mr-0.5" />}
            </button>
          )}
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => setter(opt.id)}
              className={`px-3 py-2 rounded-md text-xs sm:text-sm border-2 transition-all duration-150 ease-in-out
                ${currentValue === opt.id ? 'ring-2 ring-offset-2 ring-offset-slate-800 !border-emerald-400 text-white shadow-lg' : 'border-slate-600 hover:border-slate-500 shadow-sm'}
                ${opt.hexColor ? '' : 'bg-slate-600 hover:bg-slate-500 text-slate-100'}
                ${currentValue === opt.id && opt.hexColor ? `outline outline-2 outline-offset-1 outline-white/70` : ''}
              `}
              style={opt.hexColor ? { backgroundColor: opt.hexColor, color: (['#F0E68C', '#FFEBCD', '#F5DEB3'].includes(opt.hexColor)) ? '#333' : '#FFF' } : {}}
              title={UI_TEXT_TH[opt.nameKey]}
            >
              {UI_TEXT_TH[opt.nameKey]}
              {currentValue === opt.id && <CheckCircleIcon className="w-4 h-4 inline-block ml-1.5 -mr-0.5" />}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const unlockedClothingItems = ALL_CLOTHING_ITEMS.filter(item =>
    playerData.unlockedClothingIds.includes(item.id)
  );

  const handleEquipShirt = (clothingId: ClothingId | undefined) => {
    equipClothingItem(clothingId, ClothingLayer.SHIRT);
    // The visual update for currentAppearance (for preview) will happen due to playerData prop changing.
    // Or, if equipClothingItem directly updates playerData which then re-renders this component.
    // For immediate preview feedback if equipClothingItem is async or doesn't immediately update playerData prop:
    setCurrentAppearance(prev => ({...prev, equippedShirt: clothingId}));
  };


  return (
    <div className="w-full max-w-xl mx-auto bg-card p-5 md:p-7 rounded-xl shadow-2xl flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-borderDefault">
        <button onClick={onBackToSettings} className="btn-back">
          &larr; {UI_TEXT_TH.settingsTitle}
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-sky-300 flex items-center text-outline-black">
          <PaintBrushIcon className="w-7 h-7 mr-2" />
          {UI_TEXT_TH.appearanceCustomizationTitle}
        </h1>
        <div className="w-20"> {/* Spacer */} </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Avatar Preview */}
        <div className="md:w-1/3 flex flex-col items-center">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-slate-600 shadow-lg bg-slate-700 mb-4">
            <PlayerAvatar appearance={currentAppearance} />
          </div>
           <button onClick={handleSave} className="w-full btn-primary py-2.5">
            {UI_TEXT_TH.saveAppearanceButton}
          </button>
        </div>

        {/* Right Side: Options */}
        <div className="md:w-2/3 space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto app-custom-scrollbar pr-2">
          {renderOptionSelector('faceLabel', ALL_FACE_OPTIONS, currentAppearance.faceId, (val) => setCurrentAppearance(prev => ({...prev, faceId: val as FaceId})))}
          {renderOptionSelector('hairStyleLabel', ALL_HAIR_OPTIONS, currentAppearance.hairId, (val) => setCurrentAppearance(prev => ({...prev, hairId: val as HairId})))}
          {renderOptionSelector('hairColorLabel', ALL_HAIR_COLOR_OPTIONS, currentAppearance.hairColor, (val) => setCurrentAppearance(prev => ({...prev, hairColor: val as HairColorId})))}
          {renderOptionSelector('skinColorLabel', ALL_SKIN_COLOR_OPTIONS, currentAppearance.skinColor, (val) => setCurrentAppearance(prev => ({...prev, skinColor: val as SkinColorId})))}
          
          {/* Clothing Section */}
          <div className="pt-4 mt-4 border-t border-slate-600">
             {renderOptionSelector(
                'clothingSectionTitle',
                unlockedClothingItems.filter(item => item.layer === ClothingLayer.SHIRT).map(item => ({ id: item.id, nameKey: item.nameKey, hexColor: item.color })),
                currentAppearance.equippedShirt,
                (val) => handleEquipShirt(val as ClothingId | undefined),
                true // Allow unselecting shirt
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AvatarCustomizationPage;
