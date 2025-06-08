
import React from 'react';
import { PlayerData, ThaiUIText, AppView, NPCId, RelationshipData, RelationshipStatus, NPCDefinition } from '../../types';
import { getNPCName, MAX_FRIEND_RP, getNPCDefinition, getNPCEventId, RP_THRESHOLD_EVENT_1, RP_THRESHOLD_EVENT_2, RP_THRESHOLD_EVENT_3, RP_LOW_THRESHOLD_FOR_DISTANT_DIALOGUE, DAYS_FOR_DISTANT_DIALOGUE_NO_INTERACTION, MAX_DATING_RP, MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD } from '../../constants';
import { HeartIcon } from '../icons/HeartIcon';
import { GiftIcon } from '../icons/GiftIcon';
import { MusicalNotesIcon } from '../icons/MusicalNotesIcon'; // For date icon

interface MelodieInteractionPageProps {
  playerData: PlayerData;
  uiText: ThaiUIText;
  onInteract: () => void; 
  onBackToMenu: () => void;
  onNavigateToGifting: (npcId: NPCId) => void;
  onConfess: () => void; 
  onMarkEventViewed: (npcId: NPCId, eventId: string) => void; 
  onPropose: () => void; 
  onGoOnDate: () => void; 
}

const MelodieInteractionPage: React.FC<MelodieInteractionPageProps> = ({
  playerData,
  uiText,
  onInteract, 
  onBackToMenu,
  onNavigateToGifting,
  onConfess, 
  onMarkEventViewed,
  onPropose, 
  onGoOnDate, 
}) => {
  const melodieData = playerData.relationships.find(r => r.npcId === NPCId.MELODIE);
  const npcDef = getNPCDefinition(NPCId.MELODIE);
  const melodieName = getNPCName(NPCId.MELODIE, uiText);

  let rpStatusText = `${uiText.npc_MELODIE_name}: 0/${MAX_FRIEND_RP}`;
  let currentStatusDisplay = uiText.relationshipStatusFriendly;
  let mainDialogueKey: keyof ThaiUIText = npcDef?.personalitySnippetKey || 'npcGenericGreeting';
  let showPersonalitySnippets = true;

  if (melodieData) {
    if (melodieData.status === RelationshipStatus.MARRIED) {
      currentStatusDisplay = uiText.relationshipStatusMarried;
      rpStatusText = currentStatusDisplay; // No RP display for married
      showPersonalitySnippets = false;
      if (playerData.marriageHappiness < MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD) {
        mainDialogueKey = 'melodie_dialogue_married_sick_at_heart';
      } else {
        const randomDishes: (keyof ThaiUIText)[] = ['randomDishMelodie1', 'randomDishMelodie2', 'randomDishMelodie3'];
        const randomDishKey = randomDishes[Math.floor(Math.random() * randomDishes.length)];
        mainDialogueKey = 'melodie_dialogue_married_happy';
      }
    } else if (melodieData.status === RelationshipStatus.DATING) {
      rpStatusText = uiText.datingRPStatus?.replace('{rp}', melodieData.rp.toString()).replace('{maxRp}', MAX_DATING_RP.toString()) || `${uiText.relationshipStatusDating} (${melodieData.rp}/${MAX_DATING_RP} RP)`;
      currentStatusDisplay = uiText.relationshipStatusDating;
      mainDialogueKey = 'melodie_dialogue_dating_default';
      showPersonalitySnippets = false;
    } else { // NEUTRAL or FRIENDLY
      rpStatusText = uiText.melodieRPStatus.replace('{rp}', melodieData.rp.toString()).replace('100', MAX_FRIEND_RP.toString());
      currentStatusDisplay = melodieData.rp >= MAX_FRIEND_RP / 2 ? uiText.relationshipStatusFriendly : "คนรู้จัก";
    }
  }

  const canConfess = melodieData && melodieData.rp >= MAX_FRIEND_RP &&
                     (melodieData.status === RelationshipStatus.NEUTRAL || melodieData.status === RelationshipStatus.FRIENDLY);
  const needsLocketForConfession = canConfess && !playerData.heartNoteLocketOwned;

  const canPropose = melodieData && melodieData.status === RelationshipStatus.DATING && melodieData.rp >= MAX_DATING_RP;
  const needsRingForProposal = canPropose && !playerData.weddingRingOwned;
  const needsHouseLvlForProposal = canPropose && playerData.houseLevel < 2;


  const eventIdRP25 = getNPCEventId(NPCId.MELODIE, 1);
  const eventIdRP50 = getNPCEventId(NPCId.MELODIE, 2);
  const eventIdRP75 = getNPCEventId(NPCId.MELODIE, 3);

  let eventToShow: { id: string, dialogueKey: keyof ThaiUIText } | null = null;

  if (melodieData?.eventFlags?.[eventIdRP75] && !melodieData?.viewedEventFlags?.[eventIdRP75]) {
    eventToShow = { id: eventIdRP75, dialogueKey: 'melodie_event_rp75_dialogue' };
  } else if (melodieData?.eventFlags?.[eventIdRP50] && !melodieData?.viewedEventFlags?.[eventIdRP50]) {
    eventToShow = { id: eventIdRP50, dialogueKey: 'melodie_event_rp50_dialogue' };
  } else if (melodieData?.eventFlags?.[eventIdRP25] && !melodieData?.viewedEventFlags?.[eventIdRP25]) {
    eventToShow = { id: eventIdRP25, dialogueKey: 'melodie_event_rp25_dialogue' };
  }

  let isDistant = false;
  let portraitToDisplay = npcDef?.portraitUrl || '😊';
  let portraitBorderColor = 'border-pink-400'; 

  if (eventToShow) {
    portraitBorderColor = 'border-yellow-300 animate-pulse';
  } else if (melodieData?.status === RelationshipStatus.MARRIED) {
    portraitBorderColor = playerData.marriageHappiness < MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD ? 'border-slate-500' : 'border-rose-500'; 
  } else if (melodieData?.status === RelationshipStatus.DATING) {
    portraitBorderColor = 'border-fuchsia-500'; 
  } else { 
    const daysSinceLastInteraction = melodieData?.lastPositiveInteractionDate > 0 ? (Date.now() - melodieData.lastPositiveInteractionDate) / (1000 * 60 * 60 * 24) : Infinity;
    if ( (melodieData && melodieData.rp < RP_LOW_THRESHOLD_FOR_DISTANT_DIALOGUE && daysSinceLastInteraction > DAYS_FOR_DISTANT_DIALOGUE_NO_INTERACTION / 2) || 
         (melodieData && daysSinceLastInteraction > DAYS_FOR_DISTANT_DIALOGUE_NO_INTERACTION) ) {
           isDistant = true;
           mainDialogueKey = 'relationshipMelodieFeelsDistant'; 
           showPersonalitySnippets = false;
           portraitBorderColor = 'border-slate-500';
    }
  }


  if (eventToShow) {
    return (
      <div className="w-full max-w-lg mx-auto bg-card p-6 md:p-8 rounded-xl shadow-2xl text-slate-100 flex flex-col items-center">
        <h1 className="text-xl md:text-2xl font-bold text-sky-300 mb-4 text-outline-black">
          {uiText.relationshipEventTriggered.replace('{npcName}', melodieName)}
        </h1>
        {npcDef && (
             <div
                className={`w-32 h-32 md:w-40 md:h-40 flex items-center justify-center text-6xl md:text-7xl object-cover rounded-full mb-3 border-4 ${portraitBorderColor} shadow-lg bg-slate-700`}
                aria-label={uiText[npcDef.nameKey] || npcDef.id}
            >
                {portraitToDisplay}
            </div>
        )}
        <p className="text-lg text-pink-200 mb-5 text-center italic text-outline-black">
          "{uiText[eventToShow.dialogueKey]}"
        </p>
        <button
          onClick={() => {
            onInteract(); 
            onMarkEventViewed(NPCId.MELODIE, eventToShow!.id);
          }}
          className="btn-primary w-full py-2.5 bg-pink-500 hover:bg-pink-600 focus:ring-pink-400"
        >
          {uiText.eventDialogueContinueButton}
        </button>
         <button
          onClick={onBackToMenu}
          className="btn-neutral w-full py-2.5 mt-3"
        >
          &larr; {uiText.backToMenu}
        </button>
      </div>
    );
  }

  let displayDialogue = uiText[mainDialogueKey] || "สวัสดี";
  if (mainDialogueKey === 'melodie_dialogue_married_happy') {
    const randomDishes: (keyof ThaiUIText)[] = ['randomDishMelodie1', 'randomDishMelodie2', 'randomDishMelodie3'];
    const randomDishKey = randomDishes[Math.floor(Math.random() * randomDishes.length)];
    displayDialogue = displayDialogue.replace('{playerName}', playerData.playerName).replace('{randomDish}', uiText[randomDishKey]);
  } else if (mainDialogueKey === 'melodie_dialogue_dating_default' || mainDialogueKey === 'melodie_dialogue_married_sick_at_heart') {
    displayDialogue = displayDialogue.replace('{playerName}', playerData.playerName);
  }


  return (
    <div className="w-full max-w-lg mx-auto bg-card p-6 md:p-8 rounded-xl shadow-2xl text-slate-100 flex flex-col items-center">
      <h1 className="text-2xl md:text-3xl font-bold text-sky-300 mb-4 text-outline-black">
        {melodieData?.status === RelationshipStatus.DATING || melodieData?.status === RelationshipStatus.MARRIED
          ? `${currentStatusDisplay} - ${melodieName}`
          : uiText.melodieInteractionPageTitle
        }
      </h1>

      {npcDef && (
         <div
            className={`w-32 h-32 md:w-40 md:h-40 flex items-center justify-center text-6xl md:text-7xl object-cover rounded-full mb-3 border-4 ${portraitBorderColor} shadow-lg bg-slate-700`}
            aria-label={uiText[npcDef.nameKey] || npcDef.id}
        >
            {portraitToDisplay}
        </div>
      )}

      <p className={`text-xl font-semibold ${isDistant && !(melodieData?.status === RelationshipStatus.MARRIED && playerData.marriageHappiness < MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD) ? 'text-slate-400' : 'text-pink-300'} mb-1 text-outline-black`}>{melodieName}</p>

      <div className="text-center text-sm text-slate-100 mb-3 space-y-0.5 px-4 min-h-[60px]">
        {showPersonalitySnippets && npcDef && !isDistant && (
          <>
            <p className="text-outline-black"><em>{uiText[npcDef.personalitySnippetKey]}</em></p>
            <p className="text-outline-black"><strong>{uiText.npcLikesLabel || "ชอบ:"}</strong> {uiText[npcDef.likesSnippetKey]}</p>
            <p className="text-outline-black"><strong>{uiText.npcGoalLabel || "เป้าหมาย:"}</strong> {uiText[npcDef.goalSnippetKey]}</p>
          </>
        )}
        {!showPersonalitySnippets && (
          <p className="italic text-outline-black">"{displayDialogue}"</p>
        )}
      </div>


      <div className="flex items-center text-md text-pink-200 mb-5 text-outline-black">
        <HeartIcon className="w-5 h-5 mr-2 text-pink-400" aria-hidden="true" />
        <span>{rpStatusText}</span>
      </div>
      {playerData.isMarried && playerData.spouseId === NPCId.MELODIE && (
        <p className="text-sm text-pink-300 mb-3">{uiText.marriageHappinessDisplay?.replace('{value}', playerData.marriageHappiness.toString())}</p>
      )}

      {needsLocketForConfession && <p className="text-sm text-yellow-300 mb-3 text-center">{uiText.confessionRequirementLocket}</p>}
      {needsRingForProposal && <p className="text-sm text-yellow-300 mb-1 text-center">{uiText.proposeRequirementRing}</p>}
      {needsHouseLvlForProposal && <p className="text-sm text-yellow-300 mb-3 text-center">{uiText.proposeRequirementHouseLevel}</p>}


      <div className="w-full space-y-3">
        {canConfess && melodieData?.status !== RelationshipStatus.DATING && melodieData?.status !== RelationshipStatus.MARRIED && (
          <button
            onClick={onConfess}
            disabled={needsLocketForConfession}
            className={`btn-primary w-full py-3 bg-rose-500 hover:bg-rose-600 focus:ring-rose-400 text-lg ${needsLocketForConfession ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <HeartIcon className="w-5 h-5 mr-2"/> {uiText.confessFeelingsButtonLabel}
          </button>
        )}
        
        {canPropose && (
          <button
            onClick={onPropose}
            disabled={needsRingForProposal || needsHouseLvlForProposal}
            className={`btn-primary w-full py-3 bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 text-lg ${(needsRingForProposal || needsHouseLvlForProposal) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <HeartIcon className="w-5 h-5 mr-2"/> {uiText.proposeButtonLabel}
          </button>
        )}

        {(melodieData?.status === RelationshipStatus.DATING || melodieData?.status === RelationshipStatus.MARRIED) && (
            <button onClick={onGoOnDate} className="btn-accent w-full py-2.5 flex items-center justify-center">
                <MusicalNotesIcon className="w-5 h-5 mr-2"/> {uiText.goOnDateButtonLabel}
            </button>
        )}

        <button
          onClick={onInteract}
          className="btn-primary w-full py-2.5 bg-pink-500 hover:bg-pink-600 focus:ring-pink-400"
        >
          {uiText.talkButtonLabel}
        </button>
        <button
          onClick={() => onNavigateToGifting(NPCId.MELODIE)}
          className="btn-secondary w-full py-2.5 flex items-center justify-center"
        >
          <GiftIcon className="w-5 h-5 mr-2" />
          {uiText.giveGiftButtonLabel}
        </button>
        
        {melodieData?.status === RelationshipStatus.MARRIED && (
            <p className="text-center text-green-300 text-sm my-2">คุณและเมโลดี้แต่งงานกันแล้ว!</p>
        )}

        <button
          onClick={onBackToMenu}
          className="btn-neutral w-full py-2.5"
        >
          &larr; {uiText.backToMenu}
        </button>
      </div>
    </div>
  );
};

export default MelodieInteractionPage;