
import React from 'react';
import { PlayerData, Achievement, AchievementId, ThaiUIText, IntervalInfo, ChordInfo, GameMode, UnlockedItemType } from '../types';
import { UI_TEXT_TH, ALL_INTERVALS, ALL_CHORDS, INITIAL_ACHIEVEMENTS, isMusicalItemUnlocked as checkMusicalItemUnlocked, getPetName } from '../constants'; 
import { AvatarPlaceholderIcon } from './icons/AvatarPlaceholderIcon'; 

interface SummaryPageProps {
  playerData: PlayerData;
  allAchievements: Achievement[]; 
  getAchievementDetails: (id: AchievementId) => Achievement | undefined;
  onBackToMenu: () => void;
}

const generateColorFromSeed = (seed: string | undefined | null) => {
  if (!seed || seed.length === 0) return '#718096'; // slate-500
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 60%)`;
};


const SummaryPage: React.FC<SummaryPageProps> = ({ playerData, allAchievements, getAchievementDetails, onBackToMenu }) => {
  const unlockedAchievements = allAchievements.filter(ach => playerData.unlockedAchievementIds.includes(ach.id));

  const getMasteryAchievementsForItem = (itemId: string, itemType: GameMode): Achievement[] => {
    return INITIAL_ACHIEVEMENTS.filter(ach => ach.itemId === itemId && ach.itemType === itemType)
                               .sort((a, b) => (a.milestone || 0) - (b.milestone || 0));
  };

  const renderMasterySection = (
    titleKey: keyof ThaiUIText, 
    items: (IntervalInfo | ChordInfo)[], 
    correctCounts: { [id: string]: number },
    itemType: GameMode
  ) => {
    return (
      <div className="bg-card-muted p-4 md:p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-teal-300 text-outline-black border-b border-borderMuted pb-2">{UI_TEXT_TH[titleKey]}</h3>
        {items.length === 0 && <p className="text-textMuted">ไม่มีข้อมูล</p>}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 app-custom-scrollbar">
          {items.map(item => {
            const isItemUnlockedForTraining = !item.isAdvanced || checkMusicalItemUnlocked(item.id, itemType === GameMode.INTERVALS ? UnlockedItemType.INTERVAL : UnlockedItemType.CHORD, playerData);
            const count = correctCounts[item.id] || 0;
            const itemMasteryAchievements = getMasteryAchievementsForItem(item.id, itemType);
            const unlockedItemAchievements = itemMasteryAchievements.filter(ach => playerData.unlockedAchievementIds.includes(ach.id));
            const nextAchievement = itemMasteryAchievements.find(ach => !playerData.unlockedAchievementIds.includes(ach.id));
            
            return (
              <div key={item.id} className={`p-3 rounded-md ${isItemUnlockedForTraining ? 'bg-slate-600/70' : 'bg-slate-600/30'}`}> {/* Removed opacity-75 */}
                <p className={`font-semibold text-lg ${isItemUnlockedForTraining ? 'text-secondary-light' : 'text-slate-300 text-outline-black'}`}>
                  {item.name} ({item.thaiName})
                  {!isItemUnlockedForTraining && item.isAdvanced && <span className="text-xs text-accent-light ml-2 text-outline-black">(ต้องปลดล็อก)</span>}
                </p>
                {isItemUnlockedForTraining && (
                  <>
                    <p className="text-sm text-slate-100 text-outline-black">{UI_TEXT_TH.correctAnswersLabel} <span className="font-bold text-white">{count}</span></p>
                    {nextAchievement && nextAchievement.milestone && (
                      <p className="text-sm text-warning-light text-outline-black">
                        {UI_TEXT_TH.nextMilestoneLabel} {nextAchievement.milestone! - count > 0 ? `อีก ${nextAchievement.milestone! - count} ครั้ง` : ''} {UI_TEXT_TH.forAchievementText} '{UI_TEXT_TH[nextAchievement.nameKey]}'
                      </p>
                    )}
                    {!nextAchievement && itemMasteryAchievements.length > 0 && (
                        <p className="text-sm text-success-light text-outline-black">{UI_TEXT_TH.allMasteryAchievementsUnlocked}</p>
                    )}
                    {unlockedItemAchievements.length > 0 && (
                      <div className="mt-1 text-outline-black">
                        <span className="text-xs text-slate-300">ความสำเร็จที่ได้: </span>
                        {unlockedItemAchievements.map(ach => UI_TEXT_TH[ach.nameKey]).join(', ')}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const avatarSeedText = playerData.playerName || (playerData.xp.toString() + playerData.level.toString());
  const avatarColor = generateColorFromSeed(avatarSeedText);
  const avatarInitial = playerData.playerName ? playerData.playerName.charAt(0).toUpperCase() : 'P';


  return (
    <div className="w-full max-w-3xl mx-auto bg-card p-5 md:p-7 rounded-xl shadow-2xl flex flex-col space-y-5">
      <div className="flex justify-between items-center pb-4 border-b border-borderDefault">
        <button onClick={onBackToMenu} className="btn-back">&larr; {UI_TEXT_TH.backToMenu}</button>
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-accent text-outline-black">
          {UI_TEXT_TH.summaryPageTitle}
        </h1>
        <div 
            className="w-10 h-10 rounded-full border-2 border-slate-500 flex items-center justify-center text-slate-100 text-lg font-bold shadow-sm"
            style={{ backgroundColor: avatarColor }}
            title={playerData.playerName || "ผู้เล่น"}
        >
           {avatarInitial}
        </div>
      </div>
       {playerData.playerName && <h2 className="text-xl font-bold text-center text-sky-200 text-outline-black -mt-3">{UI_TEXT_TH.playerNameDisplayLabel} {playerData.playerName}</h2>}

      <div className="bg-card-muted p-4 md:p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-3 text-teal-300 text-outline-black">{UI_TEXT_TH.playerStats}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="bg-slate-600/70 p-3 rounded-md"><p className="text-slate-200 text-sm text-outline-black">{UI_TEXT_TH.playerLevel}</p><p className="text-2xl font-bold text-secondary-light text-outline-black">{playerData.level}</p></div>
          <div className="bg-slate-600/70 p-3 rounded-md"><p className="text-slate-200 text-sm text-outline-black">{UI_TEXT_TH.xp}</p><p className="text-2xl font-bold text-success-light text-outline-black">{playerData.xp}</p></div>
          <div className="bg-slate-600/70 p-3 rounded-md"><p className="text-slate-200 text-sm text-outline-black">{UI_TEXT_TH.gCoins}</p><p className="text-2xl font-bold text-accent-light text-outline-black">{playerData.gCoins}</p></div>
        </div>
         <div className="mt-3 text-sm text-slate-100 text-outline-black space-y-0.5">
            <p>{UI_TEXT_TH.totalCorrectAnswers} (ขั้นคู่): <span className="font-semibold text-white">{playerData.intervalQuestionsAnswered || 0}</span></p>
            <p>{UI_TEXT_TH.totalCorrectAnswers} (คอร์ด): <span className="font-semibold text-white">{playerData.chordQuestionsAnswered || 0}</span></p>
            <p>{UI_TEXT_TH.highScore} (Streak): <span className="font-semibold text-white">{playerData.highestStreak || 0}</span></p>
        </div>
      </div>

      <div className="bg-card-muted p-4 md:p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-3 text-teal-300 text-outline-black">{UI_TEXT_TH.unlockedAchievements}</h2>
        {unlockedAchievements.length === 0 ? (
          <p className="text-slate-200 text-outline-black">{UI_TEXT_TH.noAchievementsUnlocked}</p>
        ) : (
          <ul className="space-y-2 max-h-52 overflow-y-auto pr-2 app-custom-scrollbar">
            {unlockedAchievements.map(ach => (
              <li key={ach.id} className="p-2.5 bg-slate-600/70 rounded-md shadow-sm">
                <p className="font-medium text-secondary-light text-outline-black">{UI_TEXT_TH[ach.nameKey]}</p>
                <p className="text-xs text-slate-200 text-outline-black">{UI_TEXT_TH[ach.descriptionKey]}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="space-y-5">
        {renderMasterySection('intervalsMastery', ALL_INTERVALS, playerData.intervalCorrectCounts, GameMode.INTERVALS)}
        {renderMasterySection('chordsMastery', ALL_CHORDS, playerData.chordCorrectCounts, GameMode.CHORDS)}
      </div>
    </div>
  );
};

export default SummaryPage;