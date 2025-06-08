
import React, { useState } from 'react';
import { PlayerData, NPCId, MementoId, ThaiUIText, MementoDefinition, GiftResult, NotificationMessage, UnlockedItemType, ShopItem, ShopItemId } from '../../types';
import { UI_TEXT_TH, ALL_MEMENTOS, getNPCName, getMementoDefinition, SHOP_ITEMS, getNPCDefinition } from '../../constants';
import { GiftIcon } from '../icons/GiftIcon';
import { MementoIconPlaceholder } from '../icons/MementoIconPlaceholder';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { CoinIcon } from '../icons/CoinIcon';

interface GiftingPageProps {
  playerData: PlayerData;
  npcId: NPCId;
  onBack: () => void;
  onGiveGift: (npcId: NPCId, itemId: string, itemType: UnlockedItemType) => GiftResult;
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
}

const GiftingPage: React.FC<GiftingPageProps> = ({
  playerData,
  npcId,
  onBack,
  onGiveGift, // This now comes directly from playerDataHook which delegates
  addNotification
}) => {
  const npcName = getNPCName(npcId, UI_TEXT_TH);
  const npcDef = getNPCDefinition(npcId);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<UnlockedItemType | null>(null);
  const [activeTab, setActiveTab] = useState<'mementos' | 'general'>('mementos');


  const collectedMementosWithDetails: MementoDefinition[] = playerData.collectedMementos
    .map(mementoId => getMementoDefinition(mementoId))
    .filter(Boolean) as MementoDefinition[];

  const generalGiftItems: ShopItem[] = SHOP_ITEMS.filter(item => item.type === UnlockedItemType.GENERAL_GIFT);

  const handleGift = () => {
    if (!selectedItemId || !selectedItemType) return;
    const result = onGiveGift(npcId, selectedItemId, selectedItemType); // Call the prop directly

    let itemNameForNotif = selectedItemId;
    if (selectedItemType === UnlockedItemType.MEMENTO) {
        const mementoDef = getMementoDefinition(selectedItemId as MementoId);
        itemNameForNotif = mementoDef ? UI_TEXT_TH[mementoDef.nameKey] : selectedItemId;
    } else if (selectedItemType === UnlockedItemType.GENERAL_GIFT) {
        const shopItemDef = SHOP_ITEMS.find(si => si.id === selectedItemId);
        itemNameForNotif = shopItemDef ? UI_TEXT_TH[shopItemDef.nameKey] : selectedItemId;
    }

    if (result.success && result.messageKey) {
         addNotification({
            type: 'relationship',
            titleKey: result.messageKey,
            npcName: npcName,
            giftName: itemNameForNotif,
        });
    } else if (!result.success && result.messageKey) {
        addNotification({
            type: 'info',
            titleKey: result.messageKey,
            npcName: npcName,
            giftName: itemNameForNotif,
        });
    }

    if (result.success) {
      setSelectedItemId(null);
      setSelectedItemType(null);
      // Optionally, could call onBack() here if gifting should close the page
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-card p-6 md:p-8 rounded-xl shadow-2xl text-slate-100">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-borderDefault">
        <button onClick={onBack} className="btn-back flex items-center">
          <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
          {getNPCName(npcId, UI_TEXT_TH)}
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-sky-300 text-outline-black text-center">
          {UI_TEXT_TH.giftingPageTitle.replace('{npcName}', npcName)}
        </h1>
        <div className="w-24"> {/* Spacer for button */} </div>
      </div>

      <div className="mb-4 flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('mementos')}
          className={`flex-1 py-2 px-4 text-center font-medium text-sm transition-colors duration-150
            ${activeTab === 'mementos' ? 'border-b-2 border-primary text-primary' : 'text-slate-400 hover:text-slate-200'}`}
        >
          ของที่ระลึกอสูร
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 py-2 px-4 text-center font-medium text-sm transition-colors duration-150
            ${activeTab === 'general' ? 'border-b-2 border-primary text-primary' : 'text-slate-400 hover:text-slate-200'}`}
        >
          ของขวัญทั่วไป
        </button>
      </div>


      {(activeTab === 'mementos' && collectedMementosWithDetails.length === 0) || (activeTab === 'general' && generalGiftItems.length === 0) ? (
        <p className="text-center text-slate-200 text-outline-black py-8">
            {activeTab === 'mementos' ? UI_TEXT_TH.noMementosToGift : "ไม่มีของขวัญทั่วไปในร้านค้าขณะนี้"}
        </p>
      ) : (
        <div className="space-y-6">
          <p className="text-center text-slate-100 text-outline-black">{UI_TEXT_TH.selectAnyGiftPrompt}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-80 overflow-y-auto app-custom-scrollbar p-2 bg-slate-800/50 rounded-lg shadow-inner">
            {activeTab === 'mementos' && collectedMementosWithDetails.map(memento => (
              <button
                key={memento.id}
                onClick={() => { setSelectedItemId(memento.id); setSelectedItemType(UnlockedItemType.MEMENTO); }}
                className={`p-3 rounded-lg shadow-md text-center transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 active:scale-95
                  ${selectedItemId === memento.id && selectedItemType === UnlockedItemType.MEMENTO ? 'bg-primary ring-primary-light' : 'bg-slate-700 hover:bg-slate-600 ring-slate-600 hover:ring-slate-500'}
                `}
              >
                <MementoIconPlaceholder className="w-16 h-16 mx-auto mb-2 text-amber-400" />
                <p className="text-xs font-medium text-slate-100 text-outline-black">{UI_TEXT_TH[memento.nameKey]}</p>
                <p className="text-[10px] text-slate-300 text-outline-black truncate">{UI_TEXT_TH[memento.descriptionKey]}</p>
              </button>
            ))}
            {activeTab === 'general' && generalGiftItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setSelectedItemId(item.id); setSelectedItemType(UnlockedItemType.GENERAL_GIFT); }}
                className={`p-3 rounded-lg shadow-md text-center transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 active:scale-95
                  ${selectedItemId === item.id && selectedItemType === UnlockedItemType.GENERAL_GIFT ? 'bg-primary ring-primary-light' : 'bg-slate-700 hover:bg-slate-600 ring-slate-600 hover:ring-slate-500'}
                `}
              >
                <GiftIcon className="w-16 h-16 mx-auto mb-2 text-teal-400" />
                <p className="text-xs font-medium text-slate-100 text-outline-black">{UI_TEXT_TH[item.nameKey]}</p>
                 <p className="text-[10px] text-slate-300 text-outline-black flex items-center justify-center">
                    <CoinIcon className="w-3 h-3 mr-1 text-amber-400" /> {item.cost}
                </p>
              </button>
            ))}
          </div>
          <button
            onClick={handleGift}
            disabled={!selectedItemId || !selectedItemType}
            className="w-full btn-primary py-3 text-lg flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <GiftIcon className="w-5 h-5 mr-2" />
            {UI_TEXT_TH.giftButtonLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default GiftingPage;
