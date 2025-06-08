
import React, { useState } from 'react';
import { PlayerData, PetId, ActivePet, PetCustomization, ShopItem, UnlockedItemType, ThaiUIText, NotificationMessage } from '../../types';
import { UI_TEXT_TH, PET_DEFINITIONS, PET_CUSTOMIZATION_ITEMS, getPetName } from '../../constants';
import { PetIcon } from '../icons/PetIcon';
import { CheckBadgeIcon } from '../icons/CheckBadgeIcon';
import { ShirtIcon } from '../icons/ShirtIcon';
import { CoinIcon } from '../icons/CoinIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';

interface PetManagementPageProps {
  playerData: PlayerData;
  onBackToMenu: () => void;
  setActivePet: (petId: PetId | null) => void;
  applyPetCustomization: (petId: PetId, customization: PetCustomization) => boolean;
  purchaseShopItem: (item: ShopItem) => { success: boolean, messageKey?: keyof ThaiUIText, itemName?: string };
  isShopItemPurchased: (itemId: string, itemType: UnlockedItemType) => boolean;
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
}

const PetManagementPage: React.FC<PetManagementPageProps> = ({
  playerData,
  onBackToMenu,
  setActivePet,
  applyPetCustomization,
  purchaseShopItem, // For purchasing customization items directly if needed, though usually done in shop
  isShopItemPurchased,
  addNotification,
}) => {
  const [selectedCollar, setSelectedCollar] = useState<string | undefined>(
    playerData.activePetId && playerData.pets[playerData.activePetId]?.customization?.collarColor
      ? playerData.pets[playerData.activePetId].customization.collarColor
      : undefined
  );

  const activePetInstance = playerData.activePetId ? playerData.pets[playerData.activePetId] : null;

  const handleSetActivePet = (petId: PetId) => {
    setActivePet(petId);
    // Update selected collar based on newly active pet
    setSelectedCollar(playerData.pets[petId]?.customization?.collarColor);
  };

  const handleApplyCollar = () => {
    if (playerData.activePetId && selectedCollar) {
      const success = applyPetCustomization(playerData.activePetId, { collarColor: selectedCollar });
      if (success) {
        // Notification is handled by applyPetCustomization in usePlayerData
      }
    } else if (playerData.activePetId && !selectedCollar) { // To remove collar
        applyPetCustomization(playerData.activePetId, { collarColor: undefined });
    }
  };

  const purchasedCollars = PET_CUSTOMIZATION_ITEMS.filter(item =>
    playerData.purchasedShopItemIds.some(purchased => purchased.id === item.id && purchased.type === UnlockedItemType.PET_CUSTOMIZATION)
  );


  if (playerData.ownedPetIds.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto bg-slate-800 p-8 rounded-xl shadow-2xl text-center">
        <h1 className="text-2xl font-bold mb-6 text-sky-300">{UI_TEXT_TH.petManagementTitle}</h1>
        <p className="text-slate-300 mb-6">{UI_TEXT_TH.noOwnedPets}</p>
        <button onClick={onBackToMenu} className="btn-secondary">
          {UI_TEXT_TH.backToMenu}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
        <button onClick={onBackToMenu} className="btn-back">&larr; {UI_TEXT_TH.backToMenu}</button>
        <h1 className="text-2xl md:text-3xl font-bold text-sky-300 text-outline-black">
          {UI_TEXT_TH.petManagementTitle}
        </h1>
        <div className="w-20"> {/* Spacer */} </div>
      </div>

      {/* Select Active Pet Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-sky-300">{UI_TEXT_TH.selectActivePetLabel}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {playerData.ownedPetIds.map(petId => {
            const petDef = PET_DEFINITIONS.find(p => p.id === petId);
            if (!petDef) return null;
            const petInstanceData = playerData.pets[petId];
            const isActive = playerData.activePetId === petId;
            const petDisplayName = getPetName(petId, UI_TEXT_TH);

            return (
              <button
                key={petId}
                onClick={() => handleSetActivePet(petId)}
                disabled={isActive}
                className={`p-4 rounded-lg shadow-md text-center transition-all
                  ${isActive ? 'bg-emerald-600 ring-2 ring-emerald-400 cursor-default' : 'bg-slate-700 hover:bg-slate-600'}
                  disabled:opacity-100 disabled:hover:bg-emerald-600`}
              >
                <PetIcon className={`w-16 h-16 mx-auto mb-2 ${isActive ? 'text-white' : 'text-cyan-400'}`} style={petInstanceData?.customization?.collarColor ? { '--pet-collar-color': petInstanceData.customization.collarColor } as React.CSSProperties : {}} />
                <p className={`font-medium ${isActive ? 'text-white' : 'text-slate-100'}`}>{petDisplayName}</p>
                {isActive && <CheckBadgeIcon className="w-6 h-6 mx-auto mt-1 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Customize Active Pet Section */}
      {activePetInstance && (
        <div className="mb-6 bg-slate-700/50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-sky-300">{UI_TEXT_TH.customizePetLabel} {activePetInstance.name}</h2>
          <div className="mb-4">
            <h3 className="text-md font-medium text-slate-200 mb-2">เลือกปลอกคอ:</h3>
            {purchasedCollars.length === 0 && <p className="text-sm text-slate-400">คุณยังไม่มีปลอกคอ ลองไปซื้อที่ร้านค้า!</p>}
            <div className="flex flex-wrap gap-3">
              {/* Option to remove collar */}
              <button
                onClick={() => setSelectedCollar(undefined)}
                className={`px-3 py-2 rounded-md text-sm border-2 transition-colors
                    ${selectedCollar === undefined ? 'bg-blue-500 border-blue-300 text-white' : 'bg-slate-600 border-slate-500 hover:border-slate-400 text-slate-200'}`}
              >
                ไม่ใส่ปลอกคอ
              </button>
              {purchasedCollars.map(collar => (
                <button
                  key={collar.id}
                  onClick={() => setSelectedCollar(collar.data?.color)}
                  className={`px-3 py-2 rounded-md text-sm border-2 transition-colors`}
                  style={{
                    backgroundColor: selectedCollar === collar.data?.color ? collar.data?.color : 'transparent',
                    borderColor: collar.data?.color,
                    color: selectedCollar === collar.data?.color ? (['#EF4444', '#F59E0B'].includes(collar.data?.color) ? 'black' : 'white') : collar.data?.color
                  }}
                >
                  {UI_TEXT_TH[collar.nameKey]}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleApplyCollar}
            className="btn-primary py-2 text-md flex items-center justify-center"
          >
            <ShirtIcon className="w-5 h-5 mr-2" />
            {UI_TEXT_TH.applyCustomizationButton}
          </button>
        </div>
      )}
       {playerData.ownedPetIds.length < PET_DEFINITIONS.length && (
            <div className="mt-6 text-center">
                <button onClick={() => onBackToMenu()} className="btn-accent">ไปที่ศูนย์รับเลี้ยงเพื่อนซี้</button>
            </div>
        )}
    </div>
  );
};

export default PetManagementPage;
