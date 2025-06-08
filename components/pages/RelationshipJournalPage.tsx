
import React from 'react';
import { PlayerData, NPCId, ThaiUIText, RelationshipData, RelationshipStatus, NPCDefinition } from '../../types';
import { UI_TEXT_TH, getNPCName, MAX_FRIEND_RP, getNPCDefinition, RP_LOW_THRESHOLD_FOR_DISTANT_DIALOGUE, DAYS_FOR_DISTANT_DIALOGUE_NO_INTERACTION, MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD } from '../../constants';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { HeartIcon } from '../icons/HeartIcon';

interface RelationshipJournalPageProps {
  playerData: PlayerData;
  onBackToMenu: () => void;
  onSelectNPC: (npcId: NPCId) => void;
}

const DATING_SIM_NPCS: NPCId[] = [NPCId.MELODIE, NPCId.RHYTHM, NPCId.HARMONIE];

const getRelationshipStatusText = (status: RelationshipStatus, uiText: ThaiUIText): string => {
  switch (status) {
    case RelationshipStatus.NEUTRAL:
      return "คนรู้จัก";
    case RelationshipStatus.FRIENDLY:
      return uiText.relationshipStatusFriendly;
    case RelationshipStatus.DATING:
      return uiText.relationshipStatusDating;
    case RelationshipStatus.MARRIED:
      return uiText.relationshipStatusMarried;
    default:
      return "ไม่ทราบสถานะ";
  }
}

const getEmotionIcon = (npcRelData: RelationshipData | undefined, npcId: NPCId, playerData: PlayerData): string => {
  if (!npcRelData) return '😐'; // Default neutral if no data (should not happen for these NPCs)

  // Check marriage status first for specific married icons
  if (playerData.isMarried && playerData.spouseId === npcId) {
    if (playerData.marriageHappiness < MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD) {
      return '🤒'; // Sick at heart
    }
    return '❤️'; // Married and happy
  }

  // Check dating status
  if (npcRelData.status === RelationshipStatus.DATING) {
    return '🥰'; // Dating
  }

  // Check for distant status (ignoring if already dating/married for this specific distant icon)
  const now = Date.now();
  const daysSinceLastInteraction = npcRelData.lastPositiveInteractionDate > 0
    ? (now - npcRelData.lastPositiveInteractionDate) / (1000 * 60 * 60 * 24)
    : Infinity;

  const isConsideredDistant = (npcRelData.rp < RP_LOW_THRESHOLD_FOR_DISTANT_DIALOGUE && daysSinceLastInteraction > DAYS_FOR_DISTANT_DIALOGUE_NO_INTERACTION / 2) ||
                             (daysSinceLastInteraction > DAYS_FOR_DISTANT_DIALOGUE_NO_INTERACTION);

  if (isConsideredDistant) {
    return '😔'; // Distant/Sad
  }

  // Check RP levels for friendly/happy
  if (npcRelData.rp >= MAX_FRIEND_RP * 0.75) {
    return '😄'; // Very happy friend
  }
  if (npcRelData.rp >= MAX_FRIEND_RP * 0.4) {
    return '😊'; // Happy/Friendly
  }

  return '🙂'; // Neutral-Positive default
};


const RelationshipJournalPage: React.FC<RelationshipJournalPageProps> = ({
  playerData,
  onBackToMenu,
  onSelectNPC,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-card p-6 md:p-8 rounded-xl shadow-2xl text-slate-100">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-borderDefault">
        <button onClick={onBackToMenu} className="btn-back">
          &larr; {UI_TEXT_TH.backToMenu}
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-sky-300 flex items-center text-outline-black">
          <BookOpenIcon className="w-8 h-8 mr-3" />
          {UI_TEXT_TH.relationshipJournalTitle}
        </h1>
        <div className="w-20"> {/* Spacer */} </div>
      </div>

      {DATING_SIM_NPCS.length === 0 && (
        <p className="text-center text-slate-200 text-outline-black py-8">ยังไม่มีผู้ใดในบันทึกความสัมพันธ์</p>
      )}

      <div className="space-y-4">
        {DATING_SIM_NPCS.map(npcId => {
          const npcRelData = playerData.relationships.find(r => r.npcId === npcId);
          const npcDef = getNPCDefinition(npcId);
          const npcName = getNPCName(npcId, UI_TEXT_TH);
          const rp = npcRelData ? npcRelData.rp : 0;
          const status = npcRelData ? npcRelData.status : RelationshipStatus.NEUTRAL;

          const portraitRepresentation = npcDef?.portraitUrl;
          const portraitAltText = npcDef ? UI_TEXT_TH[npcDef.nameKey] : npcName;
          const emotionIcon = getEmotionIcon(npcRelData, npcId, playerData);

          let borderColorClass = 'border-slate-500';
          if (npcId === NPCId.MELODIE) borderColorClass = 'border-pink-400';
          else if (npcId === NPCId.RHYTHM) borderColorClass = 'border-orange-400';
          else if (npcId === NPCId.HARMONIE) borderColorClass = 'border-purple-400';

          const statusText = getRelationshipStatusText(status, UI_TEXT_TH);
          const rpDisplay = status === RelationshipStatus.DATING || status === RelationshipStatus.MARRIED
                            ? ""
                            : `RP: ${rp}/${MAX_FRIEND_RP}`;


          return (
            <div
              key={npcId}
              className="bg-slate-700/70 p-4 rounded-lg shadow-lg flex items-center justify-between transition-all hover:bg-slate-600/70 cursor-pointer active:scale-95"
              onClick={() => onSelectNPC(npcId)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && onSelectNPC(npcId)}
              aria-label={`ดูรายละเอียดความสัมพันธ์กับ ${npcName}`}
            >
              <div className="flex items-center space-x-3">
                {portraitRepresentation && portraitRepresentation.length <= 2 ? (
                    <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-3xl md:text-4xl rounded-full ${borderColorClass} border-2 shadow-md bg-slate-600`} aria-label={portraitAltText}>
                        {portraitRepresentation}
                    </div>
                ) : portraitRepresentation ? (
                    <img src={portraitRepresentation} alt={portraitAltText} className={`w-12 h-12 md:w-14 md:h-14 object-cover rounded-full ${borderColorClass} border-2 shadow-md bg-slate-600`} />
                ) : (
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-slate-600 ${borderColorClass} border-2`}>
                        <span className="text-xl text-slate-300">?</span>
                    </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-emerald-300 text-outline-black flex items-center">
                    {npcName}
                    <span className="ml-2 text-xl" role="img" aria-label={`อารมณ์ของ ${npcName}`}>{emotionIcon}</span>
                  </h2>
                  <p className="text-sm text-slate-100 text-outline-black">{statusText}</p>
                  {rpDisplay && <p className="text-xs text-slate-300 text-outline-black">{rpDisplay}</p>}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                 { (status === RelationshipStatus.NEUTRAL || status === RelationshipStatus.FRIENDLY) &&
                    [...Array(5)].map((_, i) => (
                      <HeartIcon
                        key={i}
                        className={`w-5 h-5 ${rp >= (i + 1) * (MAX_FRIEND_RP / 5) ? 'text-red-500 animate-pulse' : 'text-slate-500 opacity-50'}`}
                      />
                  ))}
                  { status === RelationshipStatus.DATING && <HeartIcon className="w-6 h-6 text-rose-500 animate-ping" />}
                  { status === RelationshipStatus.MARRIED && emotionIcon !== '🤒' && <HeartIcon className="w-6 h-6 text-red-400" />}
                  { status === RelationshipStatus.MARRIED && emotionIcon === '🤒' && <HeartIcon className="w-6 h-6 text-slate-500" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RelationshipJournalPage;
