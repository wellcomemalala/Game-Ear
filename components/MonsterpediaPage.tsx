
import React from 'react';
import { PlayerData, MementoDefinition, ThaiUIText, MonsterDefinition } from '../types';
import { UI_TEXT_TH, ALL_MONSTERS, ALL_MEMENTOS, getMonsterDefinition, getMementoDefinition } from '../constants';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { MonsterIconPlaceholder } from './icons/MonsterIconPlaceholder';
import { MementoIconPlaceholder } from './icons/MementoIconPlaceholder';
import { LockClosedIcon } from './icons/LockClosedIcon';

interface MonsterpediaPageProps {
  playerData: PlayerData;
  onBackToMenu: () => void;
}

const MonsterpediaPage: React.FC<MonsterpediaPageProps> = ({
  playerData,
  onBackToMenu,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl text-slate-100">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
        <button onClick={onBackToMenu} className="btn-back">
          &larr; {UI_TEXT_TH.backToMenu}
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center text-outline-black">
          <BookOpenIcon className="w-8 h-8 mr-3" />
          {UI_TEXT_TH.monsterpediaTitle}
        </h1>
        <div className="w-20"> {/* Spacer */} </div>
      </div>

      {ALL_MONSTERS.length === 0 && (
        <p className="text-center text-slate-200 text-outline-black py-8">ยังไม่มีข้อมูลอสูรในขณะนี้</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[calc(100vh-220px)] overflow-y-auto app-custom-scrollbar pr-2">
        {ALL_MONSTERS.map(monsterDef => {
          const isDefeated = playerData.defeatedMonsterIds.includes(monsterDef.id);
          const mementoDef = ALL_MEMENTOS.find(m => m.id === monsterDef.rewardMementoId);
          const hasMemento = mementoDef && playerData.collectedMementos.includes(mementoDef.id);

          const monsterName = UI_TEXT_TH[monsterDef.nameKey] || monsterDef.id;
          const monsterDescription = UI_TEXT_TH[monsterDef.descriptionKey] || "รายละเอียดอสูร";
          const mementoName = mementoDef ? (UI_TEXT_TH[mementoDef.nameKey] || mementoDef.id) : "";
          const mementoDescription = mementoDef ? (UI_TEXT_TH[mementoDef.descriptionKey] || "รายละเอียดของที่ระลึก") : "";

          return (
            <div
              key={monsterDef.id}
              className={`bg-slate-700/70 p-5 rounded-lg shadow-xl flex flex-col transition-opacity duration-300 ${isDefeated ? 'opacity-100' : 'opacity-60'}`}
            >
              <div className="flex items-center mb-4">
                <MonsterIconPlaceholder className={`w-16 h-16 mr-4 ${isDefeated ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <h2 className={`text-xl font-semibold text-outline-black ${isDefeated ? 'text-emerald-300' : 'text-slate-200'}`}>{monsterName}</h2>
                  <p className="text-xs text-slate-100 text-outline-black">{monsterDescription}</p>
                </div>
              </div>

              {isDefeated && mementoDef && hasMemento ? (
                <div className="mt-auto bg-slate-600/50 p-3 rounded-md">
                  <h3 className="text-sm font-semibold text-amber-300 text-outline-black mb-1">ของที่ระลึก: {mementoName}</h3>
                  <div className="flex items-center">
                    <MementoIconPlaceholder className="w-10 h-10 mr-3 text-amber-400" />
                    <p className="text-xs text-slate-100 text-outline-black">{mementoDescription}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-auto bg-slate-600/30 p-3 rounded-md text-center">
                  <LockClosedIcon className="w-8 h-8 mx-auto text-slate-500 mb-1" />
                  <p className="text-xs text-slate-200 text-outline-black">
                    {isDefeated ? UI_TEXT_TH.noMementosCollected : "ยังไม่ได้พิชิต / ไม่มีข้อมูลของที่ระลึก"}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
       {ALL_MONSTERS.length > 0 && playerData.collectedMementos.length === 0 && (
        <p className="text-center text-slate-200 text-outline-black mt-6">{UI_TEXT_TH.noMementosCollected}</p>
      )}
    </div>
  );
};

export default MonsterpediaPage;