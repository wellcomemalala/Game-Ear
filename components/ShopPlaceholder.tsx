
import React, { useState } from 'react';
import { PlayerData, ShopItem as ShopItemType, ThaiUIText, UnlockedItemType, InstrumentSoundId, NotificationMessage, FurnitureId } from '../types';
import { UI_TEXT_TH, SHOP_ITEMS, PET_FOOD_ID, PET_CUSTOMIZATION_ITEMS, ALL_FURNITURE_ITEMS } from '../constants';
import { ShoppingBagIcon } from './icons/ShoppingBagIcon';
import { CoinIcon } from './icons/CoinIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { FoodBowlIcon } from './icons/FoodBowlIcon';
import { ShirtIcon } from './icons/ShirtIcon'; 
import { FurnitureIcon } from './icons/FurnitureIcon'; // New

interface ShopProps {
  playerData: PlayerData;
  onBackToMenu: () => void;
  purchaseShopItem: (item: ShopItemType) => { success: boolean, messageKey?: keyof ThaiUIText, itemName?: string };
  isShopItemPurchased: (itemId: string, itemType: UnlockedItemType) => boolean;
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
}

const Shop: React.FC<ShopProps> = ({
  playerData,
  onBackToMenu,
  purchaseShopItem,
  isShopItemPurchased,
  addNotification,
}) => {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handlePurchase = (item: ShopItemType) => {
    const result = purchaseShopItem(item);
    if (result.success) {
      if (result.messageKey && result.itemName) {
         addNotification({ type: 'info', titleKey: result.messageKey, itemName: result.itemName });
      } else if (result.messageKey) {
         addNotification({ type: 'info', titleKey: result.messageKey });
      } else {
         addNotification({ type: 'info', titleKey: 'itemPurchasedSuccess', itemName: UI_TEXT_TH[item.nameKey] || item.id});
      }
    } else if (result.messageKey) {
      setFeedbackMessage(UI_TEXT_TH[result.messageKey] || "เกิดข้อผิดพลาด");
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const instrumentSoundItems = SHOP_ITEMS.filter(item => item.type === UnlockedItemType.INSTRUMENT_SOUND);
  const petFoodShopItem = SHOP_ITEMS.find(item => item.id === PET_FOOD_ID && item.type === UnlockedItemType.PET_FOOD);
  const petCustomizationShopItems = SHOP_ITEMS.filter(item => item.type === UnlockedItemType.PET_CUSTOMIZATION);
  const furnitureShopItems = SHOP_ITEMS.filter(item => item.type === UnlockedItemType.FURNITURE);

  const renderShopSection = (
    title: string,
    items: ShopItemType[],
    sectionIcon?: React.ReactNode
  ) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-sky-300 flex items-center">
          {sectionIcon && <span className="mr-2">{sectionIcon}</span>}
          {title}
        </h2>
        <div className={`grid grid-cols-1 ${items.length > 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'} gap-4`}>
          {items.map(item => {
            const isPurchased = (item.type !== UnlockedItemType.PET_FOOD && isShopItemPurchased(item.id, item.type)) ||
                                (item.type === UnlockedItemType.FURNITURE && playerData.ownedFurnitureIds.includes(item.id as FurnitureId));

            return (
              <div key={item.id} className={`bg-slate-700 p-4 rounded-lg shadow-md flex flex-col justify-between ${isPurchased && item.type !== UnlockedItemType.PET_FOOD ? 'opacity-70' : ''}`}>
                <div>
                  <h3 className="text-lg font-medium text-emerald-300 mb-1">{UI_TEXT_TH[item.nameKey]}</h3>
                  <p className="text-xs text-slate-400 mb-2">{UI_TEXT_TH[item.descriptionKey]}</p>
                  {item.type === UnlockedItemType.PET_FOOD && <p className="text-xs text-slate-400">จำนวนที่มี: {playerData.petFoodCount}</p>}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-amber-400 font-semibold flex items-center">
                    <CoinIcon className="w-5 h-5 mr-1" /> {item.cost}
                  </span>
                  {isPurchased && item.type !== UnlockedItemType.PET_FOOD ? (
                    <span className="text-green-400 font-semibold flex items-center text-sm">
                      <CheckCircleIcon className="w-5 h-5 mr-1.5" /> {UI_TEXT_TH.purchased}
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={playerData.gCoins < item.cost && item.type !== UnlockedItemType.PET_FOOD}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-md shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {UI_TEXT_TH.purchaseItem}
                    </button>
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
    <div className="w-full max-w-3xl mx-auto bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
        <button onClick={onBackToMenu} className="btn-back">&larr; {UI_TEXT_TH.backToMenu}</button>
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 flex items-center">
          <ShoppingBagIcon className="w-8 h-8 mr-3" />
          {UI_TEXT_TH.shopTitle}
        </h1>
        <div className="flex items-center text-amber-400 font-semibold">
          <CoinIcon className="w-6 h-6 mr-1.5" /> {playerData.gCoins}
        </div>
      </div>

      <p className="text-center text-slate-300 mb-6">{UI_TEXT_TH.shopDescription}</p>

      {feedbackMessage && (
        <div className={`p-3 mb-4 rounded-md text-center text-white ${feedbackMessage.includes(UI_TEXT_TH.notEnoughGCoins) ? 'bg-red-500' : 'bg-yellow-600'}`}>
          {feedbackMessage}
        </div>
      )}

      {renderShopSection(UI_TEXT_TH.furnitureShopSectionTitle, furnitureShopItems, <FurnitureIcon className="w-6 h-6" />)}
      {renderShopSection("อาหารเพื่อนซี้", petFoodShopItem ? [petFoodShopItem] : [], <FoodBowlIcon className="w-6 h-6" />)}
      {renderShopSection("เสียงเครื่องดนตรี", instrumentSoundItems, <SpeakerWaveIcon className="w-6 h-6" />)}
      {renderShopSection("ของแต่งตัวเพื่อนซี้", petCustomizationShopItems, <ShirtIcon className="w-6 h-6" />)}


      {SHOP_ITEMS.length === 0 && (
          <p className="text-center text-slate-400 mt-8">ไม่มีไอเทมในร้านค้าขณะนี้</p>
      )}
    </div>
  );
};

export default Shop;
