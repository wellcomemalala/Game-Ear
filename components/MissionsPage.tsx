
import React from 'react';
import { PlayerData, ActiveMission, MissionId, MissionDefinition, MissionRewardType, ThaiUIText } from '../types';
import { UI_TEXT_TH, getMissionDefinition } from '../constants';
import { MissionScrollIcon } from './icons/MissionScrollIcon';
import { CoinIcon } from './icons/CoinIcon';
import { StarIcon } from './icons/StarIcon'; // For XP reward
import { CheckCircleIcon } from './icons/CheckCircleIcon'; // For claimed
import { PetIcon } from './icons/PetIcon'; // For Pet XP

interface MissionsPageProps {
  playerData: PlayerData;
  claimMissionReward: (missionId: MissionId) => boolean;
  onBackToMenu: () => void;
}

const MissionRewardIcon: React.FC<{ type: MissionRewardType, className?: string }> = ({ type, className = "w-4 h-4" }) => {
  switch (type) {
    case MissionRewardType.GCOINS:
      return <CoinIcon className={`${className} text-amber-400`} />;
    case MissionRewardType.PLAYER_XP:
      return <StarIcon className={`${className} text-sky-400`} />;
    case MissionRewardType.PET_XP:
      return <PetIcon className={`${className} text-pink-400`} />; // Assuming PetIcon can be colored
    default:
      return null;
  }
};

const MissionsPage: React.FC<MissionsPageProps> = ({
  playerData,
  claimMissionReward,
  onBackToMenu,
}) => {
  const dailyMissions = playerData.activeMissions.filter(am => getMissionDefinition(am.definitionId)?.frequency === 'daily');
  const weeklyMissions = playerData.activeMissions.filter(am => getMissionDefinition(am.definitionId)?.frequency === 'weekly');

  const handleClaim = (missionId: MissionId) => {
    claimMissionReward(missionId);
    // PlayerData will re-render the component with updated mission status
  };

  const renderMissionList = (missions: ActiveMission[], titleKey: keyof ThaiUIText) => {
    if (missions.length === 0) {
      return (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-sky-300 text-outline-black">{UI_TEXT_TH[titleKey]}</h2>
          <p className="text-slate-200 text-outline-black">{UI_TEXT_TH.noActiveMissions}</p>
        </div>
      );
    }

    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-sky-300 text-outline-black border-b border-slate-600 pb-2">{UI_TEXT_TH[titleKey]}</h2>
        <div className="space-y-4">
          {missions.map(activeMission => {
            const definition = getMissionDefinition(activeMission.definitionId);
            if (!definition) return null;

            const progressPercent = definition.targetValue > 0 ? Math.min((activeMission.progress / definition.targetValue) * 100, 100) : 0;

            return (
              <div key={definition.id} className={`p-4 rounded-lg shadow-md ${activeMission.completed && !activeMission.claimed ? 'bg-emerald-700/30 border border-emerald-500' : 'bg-slate-700'}`}>
                <h3 className="text-lg font-medium text-emerald-300 text-outline-black mb-1">{UI_TEXT_TH[definition.descriptionKey]}</h3>
                
                <div className="my-2">
                  <p className="text-xs text-slate-200 text-outline-black mb-1">
                    {UI_TEXT_TH.missionProgressLabel} {activeMission.progress} / {definition.targetValue}
                  </p>
                  <div className="h-2.5 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                      role="progressbar"
                      aria-valuenow={progressPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>

                <div className="my-2">
                  <p className="text-xs text-slate-200 text-outline-black mb-1">{UI_TEXT_TH.missionRewardsLabel}</p>
                  <div className="flex items-center space-x-3">
                    {definition.rewards.map((reward, index) => (
                      <span key={index} className="flex items-center text-sm text-slate-100 text-outline-black">
                        <MissionRewardIcon type={reward.type} className="w-4 h-4 mr-1" />
                        {reward.amount}
                        {reward.type === MissionRewardType.PLAYER_XP && ' XP'}
                        {reward.type === MissionRewardType.PET_XP && ' Pet XP'}
                      </span>
                    ))}
                  </div>
                </div>

                {activeMission.completed ? (
                  activeMission.claimed ? (
                    <button
                      disabled
                      className="w-full mt-3 px-4 py-2 bg-slate-500 text-slate-300 text-sm font-semibold rounded-md shadow opacity-70 cursor-default flex items-center justify-center"
                    >
                      <CheckCircleIcon className="w-5 h-5 mr-2"/> {UI_TEXT_TH.rewardClaimedButton}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleClaim(definition.id)}
                      className="w-full mt-3 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-md shadow transition-colors"
                    >
                      {UI_TEXT_TH.claimRewardButton}
                    </button>
                  )
                ) : (
                  <p className="text-xs text-center text-slate-200 text-outline-black mt-3 italic">ภารกิจยังไม่สำเร็จ</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl text-slate-100">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
        <button onClick={onBackToMenu} className="btn-back">&larr; {UI_TEXT_TH.backToMenu}</button>
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 flex items-center text-outline-black">
          <MissionScrollIcon className="w-8 h-8 mr-3" />
          {UI_TEXT_TH.missionsPageTitle}
        </h1>
        <div className="w-20"> {/* Spacer */} </div>
      </div>
      
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto app-custom-scrollbar pr-2">
        {renderMissionList(dailyMissions, 'dailyMissionsTitle')}
        {renderMissionList(weeklyMissions, 'weeklyMissionsTitle')}
        {dailyMissions.length === 0 && weeklyMissions.length === 0 && (
             <p className="text-center text-slate-200 text-outline-black py-8">{UI_TEXT_TH.noActiveMissions}</p>
        )}
      </div>
    </div>
  );
};

export default MissionsPage;