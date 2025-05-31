
import React from 'react';
import { PlayerData, NPCId, QuestId, QuestStatus, ThaiUIText, QuestDefinition, QuestObjective, QuestObjectiveType } from '../types';
import { UI_TEXT_TH, getNPCName, getQuestTitle, QUEST_DEFINITIONS, getQuestDefinition } from '../constants';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { GiftIcon } from './icons/GiftIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface QuestInteractionPageProps {
  npcId: NPCId;
  playerData: PlayerData;
  onBackToHub: () => void;
  onAcceptQuest: (questId: QuestId) => boolean;
  onProgressQuest: (questId: QuestId, objectiveIndex?: number) => boolean;
  onClaimReward: (questId: QuestId) => boolean;
  getQuestStatus: (questId: QuestId) => QuestStatus;
}

const QuestInteractionPage: React.FC<QuestInteractionPageProps> = ({
  npcId,
  playerData,
  onBackToHub,
  onAcceptQuest,
  onProgressQuest,
  onClaimReward,
  getQuestStatus,
}) => {
  const npcName = getNPCName(npcId, UI_TEXT_TH);

  const npcSpecificQuests = QUEST_DEFINITIONS.filter(qDef => qDef.npcId === npcId);
  
  let displayQuest: QuestDefinition | null = null;
  let displayQuestStatus: QuestStatus | null = null;
  let activePlayerQuestData = null;

  // Prioritize active or completed (unclaimed) quest for this NPC
  for (const qDef of npcSpecificQuests) {
    const status = getQuestStatus(qDef.id);
    if (status === 'active' || status === 'completed') {
      displayQuest = qDef;
      displayQuestStatus = status;
      activePlayerQuestData = playerData.activeQuests.find(aq => aq.questId === qDef.id);
      break;
    }
  }

  // If no active/completed, find the first available quest for this NPC
  if (!displayQuest) {
    for (const qDef of npcSpecificQuests) {
      const status = getQuestStatus(qDef.id);
      if (status === 'available') {
        displayQuest = qDef;
        displayQuestStatus = status;
        break;
      }
    }
  }
  
  // Auto-progress "TALK_TO_NPC" objective if it's the current one for an active quest with this NPC
  if (displayQuest && displayQuestStatus === 'active' && activePlayerQuestData) {
    const currentObjectiveDef = displayQuest.objectives[activePlayerQuestData.currentObjectiveIndex];
    const currentObjectiveProgress = activePlayerQuestData.objectiveProgress[activePlayerQuestData.currentObjectiveIndex];
    if (currentObjectiveDef && currentObjectiveDef.type === QuestObjectiveType.TALK_TO_NPC && currentObjectiveDef.targetId === npcId && !currentObjectiveProgress.completed) {
        onProgressQuest(displayQuest.id, activePlayerQuestData.currentObjectiveIndex);
        // Data will refresh via playerData prop, re-evaluating quest status
    }
  }


  const renderQuestObjectives = (objectives: QuestObjective[], activeQuestData?: typeof activePlayerQuestData) => {
    return (
      <ul className="space-y-1.5 list-inside">
        {objectives.map((obj, index) => {
          const isObjectiveCompleted = activeQuestData?.objectiveProgress[index]?.completed || false;
          const isCurrentObjective = activeQuestData?.currentObjectiveIndex === index && !isObjectiveCompleted;
          return (
            <li key={index} className={`flex items-start ${isObjectiveCompleted ? 'text-green-300 line-through' : isCurrentObjective ? 'text-yellow-300 font-semibold' : 'text-slate-200'}`}>
              {isObjectiveCompleted ? <CheckCircleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400"/> : <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"/>}
              <span className="text-outline-black">{UI_TEXT_TH[obj.descriptionKey]}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  let npcDialogueKey: keyof ThaiUIText = 'npcGenericGreeting';
  if (npcId === NPCId.MUSIC_MASTER) {
    npcDialogueKey = (displayQuest?.id === QuestId.LOST_MUSIC_SHEET_MUSIC_MASTER && (displayQuestStatus === 'available' || displayQuestStatus === 'active')) 
                      ? 'npcMusicMasterLostSheetDialogue' 
                      : (displayQuest?.id === QuestId.LOST_MUSIC_SHEET_MUSIC_MASTER && displayQuestStatus === 'claimed') 
                          ? 'npcMusicMasterLostSheetThanks'
                          : 'npcMusicMasterGreeting';
  } else if (npcId === NPCId.MEMENTO_COLLECTOR) {
    npcDialogueKey = 'npcMementoCollectorGreeting';
  } else if (npcId === NPCId.ZALAY_BEAT) {
    npcDialogueKey = 'npcZalayBeatGreeting';
  }
  if (!displayQuest && displayQuestStatus !== 'claimed') { // 'claimed' could have specific post-quest dialogue handled above
      const allClaimed = npcSpecificQuests.every(q => getQuestStatus(q.id) === 'claimed');
      if (allClaimed && npcSpecificQuests.length > 0) {
          // If all quests from this NPC are claimed, maybe a generic "nothing else for you"
          // This part can be expanded. For now, use default greeting or a "no quests" message below.
      } else if (npcSpecificQuests.length > 0 && !displayQuest) {
         // If there are quests defined but none are currently active/available for interaction
         // it might mean prerequisites are not met, or they are 'unavailable'.
      }
  }


  return (
    <div className="w-full max-w-xl mx-auto bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl text-slate-100">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
        <button onClick={onBackToHub} className="btn-back">
          &larr; {UI_TEXT_TH.npcHubTitle}
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-sky-300 flex items-center text-outline-black">
          <ChatBubbleLeftRightIcon className="w-8 h-8 mr-3" />
          {npcName}
        </h1>
        <div className="w-20"> {/* Spacer */} </div>
      </div>

      <div className="bg-slate-700/50 p-4 rounded-lg mb-6 min-h-[80px] flex items-center">
        <p className="italic text-slate-200 text-outline-black text-sm md:text-base">
          "{UI_TEXT_TH[npcDialogueKey]}"
        </p>
      </div>

      {displayQuest ? (
        <div className="bg-slate-700/70 p-5 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-teal-300 text-outline-black mb-3">{getQuestTitle(displayQuest.id, UI_TEXT_TH)}</h3>
          
          {displayQuestStatus === 'available' && (
            <>
              <p className="text-sm text-slate-100 text-outline-black mb-3">{UI_TEXT_TH[displayQuest.descriptionKey]}</p>
              <div className="mb-3">
                <p className="text-md font-medium text-sky-200 text-outline-black mb-1">{UI_TEXT_TH.questObjectivesLabel}</p>
                {renderQuestObjectives(displayQuest.objectives)}
              </div>
              <div className="mb-4">
                <p className="text-md font-medium text-sky-200 text-outline-black mb-1">{UI_TEXT_TH.questRewardsLabel}</p>
                <ul className="space-y-1 list-inside text-sm">
                  {displayQuest.rewards.map((reward, idx) => (
                    <li key={idx} className="flex items-center text-slate-100 text-outline-black">
                      <GiftIcon className="w-4 h-4 mr-2 text-yellow-300" /> 
                      {reward.amount} {reward.type === 'gcoins' ? 'G-Coins' : reward.type === 'xp' ? 'XP' : UI_TEXT_TH[reward.itemId as keyof ThaiUIText] || reward.itemId || 'Item'}
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => onAcceptQuest(displayQuest!.id)} className="w-full btn-primary py-2.5">
                {UI_TEXT_TH.questAcceptButton}
              </button>
            </>
          )}

          {displayQuestStatus === 'active' && activePlayerQuestData && (
            <>
              <p className="text-sm italic text-yellow-200 text-outline-black mb-3">{UI_TEXT_TH.questInProgressLabel}</p>
              <div className="mb-3">
                <p className="text-md font-medium text-sky-200 text-outline-black mb-1">{UI_TEXT_TH.questObjectivesLabel}</p>
                {renderQuestObjectives(displayQuest.objectives, activePlayerQuestData)}
              </div>
              {/* Specific objective interaction buttons could go here if needed */}
            </>
          )}

          {displayQuestStatus === 'completed' && (
             <>
              <p className="text-sm font-semibold text-green-300 text-outline-black mb-3">{UI_TEXT_TH.questCompletedLabel}</p>
              <div className="mb-3">
                <p className="text-md font-medium text-sky-200 text-outline-black mb-1">{UI_TEXT_TH.questObjectivesLabel}</p>
                {renderQuestObjectives(displayQuest.objectives, activePlayerQuestData)}
              </div>
               <div className="mb-4">
                <p className="text-md font-medium text-sky-200 text-outline-black mb-1">{UI_TEXT_TH.questRewardsLabel}</p>
                 <ul className="space-y-1 list-inside text-sm">
                  {displayQuest.rewards.map((reward, idx) => (
                    <li key={idx} className="flex items-center text-slate-100 text-outline-black">
                      <GiftIcon className="w-4 h-4 mr-2 text-yellow-300" /> 
                      {reward.amount} {reward.type === 'gcoins' ? 'G-Coins' : reward.type === 'xp' ? 'XP' : UI_TEXT_TH[reward.itemId as keyof ThaiUIText] || reward.itemId || 'Item'}
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => onClaimReward(displayQuest!.id)} className="w-full btn-success py-2.5">
                {UI_TEXT_TH.questClaimRewardButton}
              </button>
            </>
          )}
           {displayQuestStatus === 'claimed' && (
             <p className="text-sm text-slate-200 text-outline-black">{npcDialogueKey === 'npcMusicMasterLostSheetThanks' ? UI_TEXT_TH.npcMusicMasterLostSheetThanks : "ขอบคุณสำหรับความช่วยเหลือนะ!"}</p>
           )}

        </div>
      ) : (
        <p className="text-center text-slate-300 text-outline-black">{UI_TEXT_TH.npcNoQuestsAvailable}</p>
      )}
    </div>
  );
};

export default QuestInteractionPage;
