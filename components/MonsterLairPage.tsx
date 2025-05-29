
import React from 'react';
import { PlayerData, MonsterId, MonsterDefinition, ThaiUIText } from '../types';
import { UI_TEXT_TH, ALL_MONSTERS, getMonsterDefinition } from '../constants';
import { MonsterIconPlaceholder } from './icons/MonsterIconPlaceholder';
import { LairIcon } from './icons/LairIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface MonsterLairPageProps {
  playerData: PlayerData;
  onMonsterSelect: (monsterId: MonsterId) => void;
  onBackToMenu: () => void;
}

const MonsterLairPage: React.FC<MonsterLairPageProps> = ({
  playerData,
  onMonsterSelect,
  onBackToMenu,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl text-slate-100">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
        <button onClick={onBackToMenu} className="btn-back">
          &larr; {UI_TEXT_TH.backToMenu}
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-sky-300 flex items-center text-outline-black">
          <LairIcon className="w-8 h-8 mr-3" />
          {UI_TEXT_TH.monsterLairTitle}
        </h1>
        <div className="w-20"> {/* Spacer */} </div>
      </div>

      {ALL_MONSTERS.length === 0 && (
        <p className="text-center text-slate-200 text-outline-black py-8">ยังไม่มีอสูรให้ท้าทายในขณะนี้</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_MONSTERS.map(monsterDef => {
          const isDefeated = playerData.defeatedMonsterIds.includes(monsterDef.id);
          const monsterName = UI_TEXT_TH[monsterDef.nameKey] || monsterDef.id;
          const monsterDescription = UI_TEXT_TH[monsterDef.descriptionKey] || "รายละเอียดอสูร";

          return (
            <div
              key={monsterDef.id}
              className={`bg-slate-700/80 p-5 rounded-lg shadow-xl flex flex-col items-center text-center transition-all duration-300 ease-in-out transform hover:scale-105 ${isDefeated ? 'border-2 border-green-600/70' : 'border-2 border-slate-600 hover:border-orange-500/70'}`}
            >
              <MonsterIconPlaceholder className="w-24 h-24 text-orange-400 mb-4" />
              <h2 className="text-xl font-semibold text-orange-300 text-outline-black mb-1">{monsterName}</h2>
              <p className="text-xs text-slate-100 text-outline-black mb-3 min-h-[40px]">{monsterDescription}</p>
              
              {isDefeated ? (
                <div className="mt-auto w-full">
                    <span className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-green-300 bg-green-700/50 rounded-md">
                        <CheckCircleIcon className="w-5 h-5 mr-2"/>
                        {UI_TEXT_TH.monsterDefeatedStatus}
                    </span>
                     {/* Optionally allow re-battle, maybe for practice or different rewards later
                     <button 
                        onClick={() => onMonsterSelect(monsterDef.id)}
                        className="mt-2 w-full btn-neutral py-2 text-sm"
                    >
                        สู้ซ้ำ
                    </button> 
                    */}
                </div>
              ) : (
                <button
                  onClick={() => onMonsterSelect(monsterDef.id)}
                  className="mt-auto w-full btn-primary py-2.5 text-md bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 focus:ring-red-400"
                >
                  {UI_TEXT_TH.challengeMonsterButton}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonsterLairPage;
