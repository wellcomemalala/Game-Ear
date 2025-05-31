
import React, { useState } from 'react';
import { PlayerData, PetDefinition, ThaiUIText, PetId } from '../types';
import { UI_TEXT_TH, PET_DEFINITIONS, getPetName } from '../constants';
import { CoinIcon } from './icons/CoinIcon';
import { PetIcon } from './icons/PetIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface PetAdoptionPageProps {
  playerData: PlayerData;
  onBackToMenu: () => void;
  adoptPet: (petDef: PetDefinition) => { success: boolean, messageKey?: keyof ThaiUIText };
  onPetAdopted: (petId: PetId) => void;
}

const PetAdoptionPage: React.FC<PetAdoptionPageProps> = ({
  playerData,
  onBackToMenu,
  adoptPet,
  onPetAdopted,
}) => {
  const [feedback, setFeedback] = useState<{ messageKey?: keyof ThaiUIText, petName?: string, isError?: boolean } | null>(null);

  const handleAdopt = (petDef: PetDefinition) => {
    const result = adoptPet(petDef);
    if (result.success && result.messageKey) {
      // Notification is handled by usePlayerData, this sets local feedback if needed or for direct display
      setFeedback({ messageKey: result.messageKey, petName: getPetName(petDef.id, UI_TEXT_TH) });
      onPetAdopted(petDef.id); // Notify App.tsx or parent
      setTimeout(() => setFeedback(null), 3000);
    } else if (result.messageKey) {
      setFeedback({ messageKey: result.messageKey, isError: true });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ messageKey: 'notEnoughGCoins', isError: true }); // Fallback generic error
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // Filter out pets that are evolved forms (cost === 0) or already owned by name comparison.
  // Only show pets that are meant for initial adoption (cost > 0).
  const availablePetsToAdopt = PET_DEFINITIONS.filter(petDef => petDef.cost > 0);

  if (availablePetsToAdopt.length === 0 && playerData.ownedPetIds.length === PET_DEFINITIONS.filter(p => p.cost > 0).length) {
    return (
      <div className="w-full max-w-md mx-auto bg-slate-800 p-8 rounded-xl shadow-2xl text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-sky-300 text-outline-black mb-6">
          {UI_TEXT_TH.petAdoptionCenterTitle}
        </h1>
        <p className="text-slate-100 text-outline-black">คุณได้รับเลี้ยงเพื่อนซี้ที่มีให้รับเลี้ยงครบทุกตัวแล้ว!</p>
        <button onClick={onBackToMenu} className="mt-6 btn-secondary">
          {UI_TEXT_TH.backToMenu}
        </button>
      </div>
    );
  }
  
  if (availablePetsToAdopt.filter(p => !playerData.ownedPetIds.includes(p.id)).length === 0 && availablePetsToAdopt.length > 0) {
     return (
      <div className="w-full max-w-md mx-auto bg-slate-800 p-8 rounded-xl shadow-2xl text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-sky-300 text-outline-black mb-6">
          {UI_TEXT_TH.petAdoptionCenterTitle}
        </h1>
        <p className="text-slate-100 text-outline-black">คุณได้รับเลี้ยงเพื่อนซี้ที่มีให้รับเลี้ยงครบทุกตัวแล้ว!</p>
        <button onClick={onBackToMenu} className="mt-6 btn-secondary">
          {UI_TEXT_TH.backToMenu}
        </button>
      </div>
    );
  }


  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 p-6 md:p-10 rounded-xl shadow-2xl">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
        <button onClick={onBackToMenu} className="btn-back">&larr; {UI_TEXT_TH.backToMenu}</button>
        <h1 className="text-2xl md:text-3xl font-bold text-sky-300 text-outline-black">
          {UI_TEXT_TH.petAdoptionCenterTitle}
        </h1>
        <div className="w-20"> {/* Spacer */} </div>
      </div>

      {feedback && feedback.messageKey && (
        <div className={`p-3 mb-4 rounded-md text-center text-white ${feedback.isError ? 'bg-red-500' : 'bg-green-500'}`}>
          {UI_TEXT_TH[feedback.messageKey].replace('{petName}', feedback.petName || '')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {availablePetsToAdopt.map(petDef => {
          const isOwned = playerData.ownedPetIds.includes(petDef.id);
          const petDisplayName = getPetName(petDef.id, UI_TEXT_TH);
          return (
            <div key={petDef.id} className={`bg-slate-700 p-6 rounded-lg shadow-lg text-center flex flex-col justify-between ${isOwned ? 'opacity-60' : ''}`}>
              <div>
                <PetIcon className="w-20 h-20 mx-auto mb-3 text-cyan-400" />
                <h2 className="text-xl font-semibold text-emerald-300 text-outline-black mb-1">{petDisplayName}</h2>
                <p className="text-xs text-slate-100 text-outline-black mb-3 h-10"> {/* Fixed height for description */}
                  {UI_TEXT_TH[petDef.descriptionKey] || "เพื่อนซี้สุดน่ารัก"}
                </p>
                <div className="flex items-center justify-center text-amber-400 font-semibold text-md mb-4 text-outline-black">
                  <CoinIcon className="w-5 h-5 mr-1.5" /> {petDef.cost} G-Coins
                </div>
              </div>

              {isOwned ? (
                <div className="mt-auto pt-2">
                  <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-300 bg-green-700/50 rounded-md">
                    <CheckCircleIcon className="w-5 h-5 mr-2"/>
                    {UI_TEXT_TH.petAlreadyOwned}
                  </span>
                </div>
              ) : (
                 <div className="mt-auto pt-2">
                    <button
                      onClick={() => handleAdopt(petDef)}
                      disabled={playerData.gCoins < petDef.cost}
                      className="w-full px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg shadow-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {UI_TEXT_TH.adoptPetButton.replace('{petName}', petDisplayName)}
                    </button>
                 </div>
              )}
            </div>
          );
        })}
      </div>
       {availablePetsToAdopt.filter(p => !playerData.ownedPetIds.includes(p.id)).length === 0 && availablePetsToAdopt.length > 0 && (
        <p className="text-center text-slate-200 text-outline-black mt-6">คุณรับเลี้ยงเพื่อนซี้ทุกตัวแล้ว!</p>
      )}
    </div>
  );
};

export default PetAdoptionPage;
