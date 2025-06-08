
import React, { useState } from 'react';
import { PlayerData, ShopItem as ShopItemType, ThaiUIText, UnlockedItemType, InstrumentSoundId, NotificationMessage, FurnitureId, ShopItemId } from '../../types';
import { UI_TEXT_TH, SHOP_ITEMS, PET_FOOD_ID, PET_CUSTOMIZATION_ITEMS, ALL_FURNITURE_ITEMS, HEART_NOTE_LOCKET_COST, WEDDING_RING_COST } from '../../constants';
import { ShoppingBagIcon } from '../icons/ShoppingBagIcon'; // Corrected path
import { CoinIcon } from '../icons/CoinIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { SpeakerWaveIcon } from '../icons/SpeakerWaveIcon';
import { FoodBowlIcon } from '../icons/FoodBowlIcon';
import { ShirtIcon } from '../icons/ShirtIcon';
import { FurnitureIcon } from '../icons/FurnitureIcon';
import { HeartIcon } from '../icons/HeartIcon'; // For key items
import { BabyIcon } from '../icons/BabyIcon'; // For child care items

interface ShopProps {
  playerData: PlayerData;
  onBackToMenu: () => void;
  purchaseShopItem: (item: ShopItemType) => { success: boolean, messageKey?: keyof ThaiUIText, itemName?: string };
  isShopItemPurchased: (itemId: string, itemType: UnlockedItemType) => boolean; // Still useful for non-key items
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
}

const ShopPage: React.FC<ShopProps> = ({
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
  const keyShopItems = SHOP_ITEMS.filter(item => item.type === UnlockedItemType.KEY_ITEM && (item.id === ShopItemId.HEART_NOTE_LOCKET || item.id === ShopItemId.WEDDING_RING || item.id === ShopItemId.BABY_CRIB) );
  const childCareShopItems = SHOP_ITEMS.filter(item => item.type === UnlockedItemType.CHILD_CARE);
  // const clothingShopItems = SHOP_ITEMS.filter(item => item.type === UnlockedItemType.CLOTHING); // Removed


  const renderShopSection = (
    title: string,
    items: ShopItemType[],
    sectionIcon?: React.ReactNode
  ) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-sky-300 text-outline-black flex items-center">
          {sectionIcon && <span className="mr-2">{sectionIcon}</span>}
          {title}
        </h2>
        <div className={`grid grid-cols-1 ${items.length > 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'} gap-4`}>
          {items.map(item => {
            let isPurchased = false;
             // Key items that are flags (crib, locket, ring)
            if (item.type === UnlockedItemType.KEY_ITEM) {
                if (item.id === ShopItemId.HEART_NOTE_LOCKET) isPurchased = playerData.heartNoteLocketOwned;
                else if (item.id === ShopItemId.WEDDING_RING) isPurchased = playerData.weddingRingOwned;
                else if (item.id === ShopItemId.BABY_CRIB) isPurchased = playerData.babyCribOwned;
            } else if (item.type === UnlockedItemType.FURNITURE) {
                isPurchased = playerData.ownedFurnitureIds.includes(item.id as FurnitureId);
            } else if (item.type !== UnlockedItemType.PET_FOOD && item.type !== UnlockedItemType.CHILD_CARE && item.type !== UnlockedItemType.GENERAL_GIFT) {
                isPurchased = isShopItemPurchased(item.id, item.type);
            }
            // Child care items and general gifts are consumable, so they are always purchasable if affordable.
            // Pet food is also always purchasable.


            return (
              <div key={item.id} className={`bg-slate-700 p-4 rounded-lg shadow-md flex flex-col justify-between ${isPurchased && item.type !== UnlockedItemType.PET_FOOD && item.type !== UnlockedItemType.CHILD_CARE && item.type !== UnlockedItemType.GENERAL_GIFT ? 'opacity-70' : ''}`}>
                <div>
                  <h3 className="text-lg font-medium text-emerald-300 text-outline-black mb-1">{UI_TEXT_TH[item.nameKey]}</h3>
                  <p className="text-xs text-slate-200 text-outline-black mb-2">{UI_TEXT_TH[item.descriptionKey]}</p>
                  {item.type === UnlockedItemType.PET_FOOD && <p className="text-xs text-slate-200 text-outline-black">จำนวนที่มี: {playerData.petFoodCount}</p>}
                  {item.type === UnlockedItemType.CHILD_CARE && item.id === ShopItemId.MILK_POWDER && <p className="text-xs text-slate-200 text-outline-black">จำนวนที่มี: {playerData.milkPowderCount}</p>}
                  {item.type === UnlockedItemType.CHILD_CARE && item.id === ShopItemId.BABY_FOOD && <p className="text-xs text-slate-200 text-outline-black">จำนวนที่มี: {playerData.babyFoodCount}</p>}
                  {item.type === UnlockedItemType.CHILD_CARE && item.id === ShopItemId.DIAPERS && <p className="text-xs text-slate-200 text-outline-black">จำนวนที่มี: {playerData.diapersCount}</p>}
                  {item.type === UnlockedItemType.CHILD_CARE && item.id === ShopItemId.CHILD_CARE_KIT && <p className="text-xs text-slate-200 text-outline-black">จำนวนที่มี: {playerData.childCareKitCount || 0}</p>}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-amber-400 font-semibold flex items-center text-outline-black">
                    <CoinIcon className="w-5 h-5 mr-1" /> {item.cost}
                  </span>
                  {isPurchased && item.type !== UnlockedItemType.PET_FOOD && item.type !== UnlockedItemType.CHILD_CARE && item.type !== UnlockedItemType.GENERAL_GIFT ? (
                    <span className="text-green-400 font-semibold flex items-center text-sm">
                      <CheckCircleIcon className="w-5 h-5 mr-1.5" /> {UI_TEXT_TH.purchased}
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={playerData.gCoins < item.cost}
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
        <h1 className="text-2xl md:text-3xl font-bold text-sky-300 flex items-center text-outline-black">
          <ShoppingBagIcon className="w-8 h-8 mr-3" />
          {UI_TEXT_TH.shopTitle}
        </h1>
        <div className="flex items-center text-amber-400 font-semibold text-outline-black">
          <CoinIcon className="w-6 h-6 mr-1.5" /> {playerData.gCoins}
        </div>
      </div>

      <p className="text-center text-slate-100 text-outline-black mb-6">{UI_TEXT_TH.shopDescription}</p>

      {feedbackMessage && (
        <div className={`p-3 mb-4 rounded-md text-center text-white ${feedbackMessage.includes(UI_TEXT_TH.notEnoughGCoins) ? 'bg-red-500' : 'bg-yellow-600'}`}>
          {feedbackMessage}
        </div>
      )}

      <div className="max-h-[calc(100vh-250px)] overflow-y-auto app-custom-scrollbar pr-2">
        {renderShopSection(UI_TEXT_TH.childCareItemsCategory || "ไอเทมดูแลเด็ก", childCareShopItems, <BabyIcon className="w-6 h-6 text-pink-300" />)}
        {renderShopSection("ไอเทมสำคัญ", keyShopItems, <HeartIcon className="w-6 h-6 text-red-400" />)}
        {renderShopSection(UI_TEXT_TH.furnitureShopSectionTitle, furnitureShopItems, <FurnitureIcon className="w-6 h-6 text-cyan-300" />)}
        {renderShopSection("อาหารเพื่อนซี้", petFoodShopItem ? [petFoodShopItem] : [], <FoodBowlIcon className="w-6 h-6 text-lime-300" />)}
        {renderShopSection("เสียงเครื่องดนตรี", instrumentSoundItems, <SpeakerWaveIcon className="w-6 h-6 text-purple-300" />)}
        {renderShopSection("ของแต่งตัวเพื่อนซี้", petCustomizationShopItems, <ShirtIcon className="w-6 h-6 text-teal-300" />)}
        {/* {renderShopSection("เสื้อผ้าตัวละคร", clothingShopItems, <ShirtIcon className="w-6 h-6 text-indigo-300" />)} // Removed this line */}
      </div>


      {SHOP_ITEMS.length === 0 && (
          <p className="text-center text-slate-200 text-outline-black mt-8">ไม่มีไอเทมในร้านค้าขณะนี้</p>
      )}
    </div>
  );
};

export default ShopPage;
