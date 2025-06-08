

import React from 'react';
import { PlayerData, NPCId, QuestStatusEnum, QuestId, ThaiUIText } from '../../types'; // Changed QuestStatus to QuestStatusEnum
import { UI_TEXT_TH, getNPCName, QUEST_DEFINITIONS } from '../../constants';
import { UsersIcon } from '../icons/UsersIcon';
import { ChatBubbleLeftRightIcon } from '../icons/ChatBubbleLeftRightIcon';
import { ExclamationCircleIcon } from '../icons/ExclamationCircleIcon';
import { QuestionMarkCircleIcon } from '../icons/QuestionMarkCircleIcon';

interface NPCHubPageProps {
  playerData: PlayerData;
  onSelectNPC: (npcId: NPCId) => void;
  onBackToMenu: () => void;
  getQuestStatus: (questId: QuestId) => QuestStatusEnum; // Changed QuestStatus to QuestStatusEnum
}

const ALL_NPCS_IN_HUB: { id: NPCId, icon?: React.ReactNode }[] = [
  { id: NPCId.MUSIC_MASTER, icon: <UsersIcon className="w-10 h-10 text-blue-400" /> },
  { id: NPCId.MEMENTO_COLLECTOR, icon: <UsersIcon className="w-10 h-10 text-yellow-400" /> },
  { id: NPCId.ZALAY_BEAT, icon: <UsersIcon className="w-10 h-10 text-purple-400" /> },
];

const NPCHubPage: React.FC<NPCHubPageProps> = ({
  playerData,
  onSelectNPC,
  onBackToMenu,
  getQuestStatus,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl text-slate-100">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
        <button onClick={onBackToMenu} className="btn-back">
          &larr; {UI_TEXT_TH.backToMenu}
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-sky-300 flex items-center text-outline-black">
          <UsersIcon className="w-8 h-8 mr-3" />
          {UI_TEXT_TH.npcHubTitle}
        </h1>
        <div className="w-20"> {/* Spacer */} </div>
      </div>

      {ALL_NPCS_IN_HUB.length === 0 && (
        <p className="text-center text-slate-200 text-outline-black py-8">ยังไม่มี NPC ในศูนย์รวมขณะนี้</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {ALL_NPCS_IN_HUB.map(npcEntry => {
          const npcName = getNPCName(npcEntry.id, UI_TEXT_TH);
          const NPCRenderIcon = npcEntry.icon || <UsersIcon className="w-16 h-16 text-slate-400 mb-3" />;

          let questIndicator: React.ReactNode = null;
          const npcQuests = QUEST_DEFINITIONS.filter(qDef => qDef.npcId === npcEntry.id);

          let hasAvailableQuest = false;
          let hasCompletedQuest = false;

          for (const qDef of npcQuests) {
            const status = getQuestStatus(qDef.id);
            if (status === QuestStatusEnum.AVAILABLE) { // Changed to QuestStatusEnum
              hasAvailableQuest = true;
              break;
            }
            if (status === QuestStatusEnum.COMPLETED) { // Changed to QuestStatusEnum
              hasCompletedQuest = true;
            }
          }

          if (hasAvailableQuest) {
            questIndicator = <ExclamationCircleIcon className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" title="มีเควสใหม่!" />;
          } else if (hasCompletedQuest) {
            questIndicator = <QuestionMarkCircleIcon className="w-6 h-6 text-green-400 absolute -top-2 -right-2 animate-ping" title="เควสพร้อมส่ง!" />;
          }

          return (
            <div
              key={npcEntry.id}
              className="bg-slate-700/80 p-5 rounded-lg shadow-xl flex flex-col items-center text-center transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-slate-600/80 relative"
            >
              {questIndicator}
              <div className="mb-3">{NPCRenderIcon}</div>
              <h2 className="text-xl font-semibold text-emerald-300 text-outline-black mb-2">{npcName}</h2>
              <p className="text-xs text-slate-200 text-outline-black mb-4 min-h-[30px]">
                {npcEntry.id === NPCId.MUSIC_MASTER ? "ผู้เชี่ยวชาญด้านดนตรี" : npcEntry.id === NPCId.MEMENTO_COLLECTOR ? "นักสะสมของเก่า" : "AI ผู้รอบรู้"}
              </p>
              <button
                onClick={() => onSelectNPC(npcEntry.id)}
                className="mt-auto w-full btn-primary py-2 text-sm flex items-center justify-center"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                พูดคุย
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NPCHubPage;