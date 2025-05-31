
import React, { useState, useEffect, useCallback } from 'react';
import { GameMode, Difficulty, PlayerData, AppView, InstrumentSoundId, PetId, NotificationMessage, MissionId, MonsterId, MissionType, NPCId, QuestId, AvatarStyle, QuestStatus } from './types';
import { UI_TEXT_TH, getDifficultyText, DAILY_LOGIN_REWARD, getInstrumentSoundName, PET_DEFINITIONS, getHouseLevelName, ALL_MONSTERS, getNPCName, getQuestTitle, QUEST_DEFINITIONS, getQuestDefinition } from './constants';
import IntervalTrainer from './components/IntervalTrainer';
import ChordTrainer from './components/ChordTrainer';
import MelodyRecallTrainer from './components/MelodyRecallTrainer'; 
import SummaryPage from './components/SummaryPage';
import UnlockablesStore from './components/UnlockablesStore';
import Shop from './components/ShopPlaceholder';
import SettingsPage from './components/SettingsPage';
import PetAdoptionPage from './components/PetAdoptionPage';
import PetManagementPage from './components/PetManagementPage';
import PlayerNameInputPage from './components/PlayerNameInputPage';
import MyHomeScreen from './components/MyHomeScreen';
import MissionsPage from './components/MissionsPage';
import MonsterLairPage from './components/MonsterLairPage'; 
import MonsterBattlePage from './components/MonsterBattlePage'; 
import MonsterpediaPage from './components/MonsterpediaPage'; 
import FreestyleJamRoomPage from './components/FreestyleJamRoomPage';
import GameGuidePage from './components/GameGuidePage';
import NPCHubPage from './components/NPCHubPage';
import QuestInteractionPage from './components/QuestInteractionPage';
import { AudioService } from './services/AudioService';
import { usePlayerData } from './hooks/usePlayerData';
import PlayerStatusBar from './components/rpg/PlayerStatusBar';
import NotificationArea from './components/rpg/NotificationArea';
import { HomeIcon } from './components/icons/HomeIcon';
import { MissionScrollIcon } from './components/icons/MissionScrollIcon';
import { LairIcon } from './components/icons/LairIcon'; 
import { BookOpenIcon } from './components/icons/BookOpenIcon'; 
import { MusicNotesIcon } from './components/icons/MusicNotesIcon';
import { BookInfoIcon } from './components/icons/BookInfoIcon';
import { ExternalLinkIcon } from './components/icons/ExternalLinkIcon';
import { UsersIcon } from './components/icons/UsersIcon';


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.AUDIO_PROMPT);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [audioService, setAudioService] = useState<AudioService | null>(null);
  const [isAudioContextReady, setIsAudioContextReady] = useState(false);
  const [selectedModeForDifficulty, setSelectedModeForDifficulty] = useState<GameMode | null>(null);
  const [selectedMonsterId, setSelectedMonsterId] = useState<MonsterId | null>(null); 
  const [selectedNPCId, setSelectedNPCId] = useState<NPCId | null>(null);

  const {
    playerData,
    addXpAndCoins,
    getAchievementDetails,
    notifications,
    dismissNotification,
    updateHighestStreak,
    achievements: allAchievements,
    unlockMusicalItem,
    isMusicalItemUnlocked,
    checkForDailyLoginReward,
    addNotification,
    purchaseShopItem,
    isShopItemPurchased,
    selectInstrumentSound,
    adoptPet,
    feedPet,
    updatePetStateOnLoad, // This now delegates to petSystem.updatePetStatePeriodic
    playWithPet,
    setActivePet,
    applyPetCustomization,
    getActivePetAbilityMultiplier,
    setPlayerName,
    saveGameExplicitly,
    resetGame,
    upgradeHouse,
    activatePracticeNook,
    refreshMissions,
    claimMissionReward,
    recordMonsterDefeat, 
    updateMissionProgress, 
    toggleHighlightPianoOnPlay,
    setAvatarStyle,
    startQuest,
    progressQuest,
    completeQuest,
    getQuestStatus,
  } = usePlayerData();


  const initializeAudio = useCallback(() => {
    const initOrResume = async () => {
      let serviceInstance = audioService;
      if (!serviceInstance && typeof window !== 'undefined' && window.AudioContext) {
        try {
          serviceInstance = new AudioService();
          setAudioService(serviceInstance);
        } catch (error) {
          console.error("Failed to initialize AudioContext:", error);
          if (playerData && playerData.playerName === "") setCurrentView(AppView.PLAYER_NAME_INPUT);
          else if (playerData) setCurrentView(AppView.MENU);
          return;
        }
      }
      if (serviceInstance) {
        if (serviceInstance.isSuspended()) await serviceInstance.resume();
        setIsAudioContextReady(true);
        if (playerData && playerData.playerName === "") setCurrentView(AppView.PLAYER_NAME_INPUT);
        else if (playerData) setCurrentView(AppView.MENU);
      }
    };
    initOrResume();
  }, [audioService, playerData, setAudioService, setIsAudioContextReady, setCurrentView]);


  useEffect(() => {
    if (playerData && currentView !== AppView.AUDIO_PROMPT && currentView !== AppView.PLAYER_NAME_INPUT) {
        refreshMissions();
    }
  }, [playerData, refreshMissions, currentView]);

  useEffect(() => {
    if (currentView === AppView.MENU && playerData) {
      const rewardDetails = checkForDailyLoginReward();
      if (rewardDetails.totalReward > 0) {
        const notificationPayload: Omit<NotificationMessage, 'id'> = {
          type: 'dailyReward', titleKey: 'dailyRewardTitle', amount: rewardDetails.totalReward,
          baseAmount: rewardDetails.baseReward, houseBonusAmount: rewardDetails.houseBonus,
        };
        notificationPayload.messageKey = rewardDetails.houseBonus > 0 ? 'dailyRewardHouseBonusMessage' : 'dailyRewardMessage';
        addNotification(notificationPayload);
      }
      // updatePetStateOnLoad now handles periodic updates including special requests.
      // It might be called here on menu load, or usePlayerData might manage its periodic call internally.
      // For now, let's assume it's called periodically by the hook itself.
      // If not, and it's intended to be triggered on menu load:
      if (playerData.activePetId && playerData.pets[playerData.activePetId]) updatePetStateOnLoad();
    }
  }, [currentView, checkForDailyLoginReward, addNotification, playerData, updatePetStateOnLoad]);


  const handleModeSelect = (mode: GameMode) => {
    setSelectedModeForDifficulty(mode);
    setCurrentView(AppView.DIFFICULTY_SELECTION);
    if (!isAudioContextReady) initializeAudio();
  };

  const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
    if (selectedModeForDifficulty) {
      setGameMode(selectedModeForDifficulty);
      setDifficulty(selectedDifficulty);
      if (selectedModeForDifficulty === GameMode.INTERVALS) setCurrentView(AppView.INTERVAL_TRAINER);
      else if (selectedModeForDifficulty === GameMode.CHORDS) setCurrentView(AppView.CHORD_TRAINER);
      else if (selectedModeForDifficulty === GameMode.MELODY_RECALL) setCurrentView(AppView.MELODY_RECALL_TRAINER);
    }
  };

  const handleBackToMenu = () => {
    setGameMode(null);
    setDifficulty(null);
    setSelectedModeForDifficulty(null);
    setSelectedNPCId(null);
    setCurrentView(AppView.MENU);
  };
  
  const handleAdoptPet = (petId: PetId) => {
    // Logic for post-adoption navigation or feedback is handled by usePetSystem and App's state changes
  };

  const handleNameSubmitted = () => {
    initializeAudio(); 
  };
  
  const handleMonsterSelect = (monsterId: MonsterId) => {
    setSelectedMonsterId(monsterId);
    setCurrentView(AppView.MONSTER_BATTLE);
  };

  const handleMonsterBattleEnd = () => {
    setSelectedMonsterId(null);
    setCurrentView(AppView.MONSTER_LAIR); 
  };

  const handleNPCSelect = (npcId: NPCId) => {
    setSelectedNPCId(npcId);
    setCurrentView(AppView.QUEST_INTERACTION);
  };

  const handleBackToNPCHub = () => {
    setSelectedNPCId(null);
    setCurrentView(AppView.NPC_HUB);
  };


  const renderContent = () => {
    if (!playerData) return <div className="text-center p-4 text-slate-100 text-xl">{UI_TEXT_TH.loading}...</div>;
    if (currentView === AppView.AUDIO_PROMPT) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-6">
          <h1 className="text-3xl font-bold mb-4 text-center text-sky-300 text-shadow-lg">{UI_TEXT_TH.appName}</h1>
          <p className="mb-8 text-lg text-center text-slate-200 max-w-md">{UI_TEXT_TH.audioContextPrompt}</p>
          <button onClick={initializeAudio} className="btn-primary btn-lg">
            {UI_TEXT_TH.start}
          </button>
        </div>
      );
    }

    if (currentView === AppView.PLAYER_NAME_INPUT) {
      return <PlayerNameInputPage setPlayerName={setPlayerName} onNameSubmitted={handleNameSubmitted} />;
    }
    
    if (!isAudioContextReady) { 
        return <div className="text-center p-4 text-slate-100 text-xl">{UI_TEXT_TH.loadingAudio}...</div>;
    }


    switch (currentView) {
      case AppView.DIFFICULTY_SELECTION:
        return (
          <div className="flex flex-col items-center justify-center pt-24 p-4">
            <h2 className="text-3xl font-bold mb-8 text-sky-300 text-shadow-lg">{UI_TEXT_TH.difficultyPrompt}</h2>
            <div className="space-y-4 w-full max-w-xs">
              <button onClick={() => handleDifficultySelect(Difficulty.EASY)} className="btn-easy btn-lg w-full">
                {getDifficultyText(Difficulty.EASY, selectedModeForDifficulty)}
              </button>
              <button onClick={() => handleDifficultySelect(Difficulty.MEDIUM)} className="btn-medium btn-lg w-full">
                {getDifficultyText(Difficulty.MEDIUM, selectedModeForDifficulty)}
              </button>
              <button onClick={() => handleDifficultySelect(Difficulty.HARD)} className="btn-hard btn-lg w-full">
                {getDifficultyText(Difficulty.HARD, selectedModeForDifficulty)}
              </button>
              <button onClick={handleBackToMenu} className="btn-neutral w-full mt-6">
                &larr; {UI_TEXT_TH.backToMenu}
              </button>
            </div>
          </div>
        );
      case AppView.INTERVAL_TRAINER:
        if (audioService && difficulty) {
          return <IntervalTrainer 
                    audioService={audioService} 
                    onBackToMenu={handleBackToMenu} 
                    difficulty={difficulty}
                    playerData={playerData}
                    addXpAndCoins={addXpAndCoins}
                    updateHighestStreak={updateHighestStreak}
                    isMusicalItemUnlocked={isMusicalItemUnlocked}
                    selectedInstrumentSoundId={playerData.selectedInstrumentSoundId}
                    highlightPianoOnPlay={playerData.highlightPianoOnPlay} 
                 />;
        }
        break;
      case AppView.CHORD_TRAINER:
        if (audioService && difficulty) {
          return <ChordTrainer 
                    audioService={audioService} 
                    onBackToMenu={handleBackToMenu} 
                    difficulty={difficulty}
                    playerData={playerData}
                    addXpAndCoins={addXpAndCoins}
                    updateHighestStreak={updateHighestStreak}
                    isMusicalItemUnlocked={isMusicalItemUnlocked}
                    selectedInstrumentSoundId={playerData.selectedInstrumentSoundId}
                    highlightPianoOnPlay={playerData.highlightPianoOnPlay}
                 />;
        }
        break;
      case AppView.MELODY_RECALL_TRAINER:
        if (audioService && difficulty) {
          return <MelodyRecallTrainer 
                    audioService={audioService} 
                    onBackToMenu={handleBackToMenu} 
                    difficulty={difficulty}
                    playerData={playerData}
                    addXpAndCoins={addXpAndCoins}
                    updateHighestStreak={updateHighestStreak}
                    selectedInstrumentSoundId={playerData.selectedInstrumentSoundId}
                    highlightPianoOnPlay={playerData.highlightPianoOnPlay}
                  />;
        }
        break;
      case AppView.SUMMARY_PAGE:
        return <SummaryPage 
                  playerData={playerData} 
                  allAchievements={allAchievements} 
                  getAchievementDetails={getAchievementDetails} 
                  onBackToMenu={handleBackToMenu} 
                />;
      case AppView.UNLOCKABLES_STORE:
        return <UnlockablesStore 
                  playerData={playerData} 
                  onBackToMenu={handleBackToMenu} 
                  unlockMusicalItem={unlockMusicalItem}
                  isMusicalItemUnlocked={isMusicalItemUnlocked}
                  getActivePetAbilityMultiplier={getActivePetAbilityMultiplier}
               />;
      case AppView.SHOP:
        return <Shop 
                  playerData={playerData}
                  onBackToMenu={handleBackToMenu}
                  purchaseShopItem={purchaseShopItem}
                  isShopItemPurchased={isShopItemPurchased}
                  addNotification={addNotification}
               />;
      case AppView.SETTINGS:
        return <SettingsPage 
                  playerData={playerData}
                  onBackToMenu={handleBackToMenu}
                  selectInstrumentSound={selectInstrumentSound}
                  saveGameExplicitly={saveGameExplicitly}
                  resetGame={resetGame}
                  toggleHighlightPianoOnPlay={toggleHighlightPianoOnPlay}
                  highlightPianoOnPlay={playerData.highlightPianoOnPlay}
                  setAvatarStyle={setAvatarStyle}
                />;
      case AppView.PET_ADOPTION_PAGE:
        return <PetAdoptionPage 
                  playerData={playerData} 
                  onBackToMenu={handleBackToMenu} 
                  adoptPet={adoptPet} 
                  onPetAdopted={handleAdoptPet}
                />;
      case AppView.PET_MANAGEMENT_PAGE:
          return <PetManagementPage 
                    playerData={playerData}
                    onBackToMenu={handleBackToMenu}
                    setActivePet={setActivePet}
                    applyPetCustomization={applyPetCustomization}
                    purchaseShopItem={purchaseShopItem}
                    isShopItemPurchased={isShopItemPurchased}
                    addNotification={addNotification}
                  />;
      case AppView.MY_HOME:
          return <MyHomeScreen
                    playerData={playerData}
                    upgradeHouse={upgradeHouse}
                    activatePracticeNook={activatePracticeNook}
                    addNotification={addNotification}
                    onBackToMenu={handleBackToMenu}
                  />;
      case AppView.MISSIONS_PAGE:
          return <MissionsPage 
                    playerData={playerData}
                    claimMissionReward={claimMissionReward}
                    onBackToMenu={handleBackToMenu}
                  />;
      case AppView.MONSTER_LAIR:
          return <MonsterLairPage 
                    playerData={playerData}
                    onMonsterSelect={handleMonsterSelect}
                    onBackToMenu={handleBackToMenu}
                 />;
      case AppView.MONSTER_BATTLE:
          if (audioService && selectedMonsterId) {
            return <MonsterBattlePage
                      audioService={audioService}
                      monsterId={selectedMonsterId}
                      playerData={playerData}
                      recordMonsterDefeat={recordMonsterDefeat}
                      onBattleEnd={handleMonsterBattleEnd}
                      selectedInstrumentSoundId={playerData.selectedInstrumentSoundId}
                      addNotification={addNotification}
                      isMusicalItemUnlocked={isMusicalItemUnlocked}
                    />;
          }
          break;
      case AppView.MONSTERPEDIA:
          return <MonsterpediaPage
                      playerData={playerData}
                      onBackToMenu={handleBackToMenu}
                  />;
      case AppView.FREESTYLE_JAM_ROOM:
           if (audioService) {
            return <FreestyleJamRoomPage
                      audioService={audioService}
                      playerData={playerData}
                      onBackToMenu={handleBackToMenu}
                      updateMissionProgress={updateMissionProgress}
                   />;
          }
          break;
      case AppView.GAME_GUIDE_PAGE:
          return <GameGuidePage onBackToMenu={handleBackToMenu} />;
      case AppView.NPC_HUB:
          return <NPCHubPage 
                    playerData={playerData} 
                    onSelectNPC={handleNPCSelect} 
                    onBackToMenu={handleBackToMenu}
                    getQuestStatus={getQuestStatus}
                  />;
      case AppView.QUEST_INTERACTION:
          if (selectedNPCId) {
            return <QuestInteractionPage 
                      npcId={selectedNPCId} 
                      playerData={playerData} 
                      onBackToHub={handleBackToNPCHub}
                      onAcceptQuest={startQuest} 
                      onProgressQuest={progressQuest}
                      onClaimReward={completeQuest}
                      getQuestStatus={getQuestStatus}
                   />;
          }
          break;
      case AppView.MENU:
      default:
        return (
          <div className="flex-grow flex flex-col items-center justify-center pt-12 md:pt-16 p-4 space-y-3 md:space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 md:mb-5 text-center text-sky-300 text-shadow-lg">{UI_TEXT_TH.chooseMode}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full max-w-md md:max-w-lg">
              <button onClick={() => handleModeSelect(GameMode.INTERVALS)} className="btn-primary btn-lg w-full text-base md:text-lg">
                {UI_TEXT_TH.intervalTraining}
              </button>
              <button onClick={() => handleModeSelect(GameMode.CHORDS)} className="btn-primary btn-lg w-full text-base md:text-lg">
                {UI_TEXT_TH.chordTraining}
              </button>
              <button onClick={() => handleModeSelect(GameMode.MELODY_RECALL)} className="btn-primary btn-lg w-full text-base md:text-lg">
                {UI_TEXT_TH.melodyRecallTrainingButton}
              </button>
               <button onClick={() => setCurrentView(AppView.FREESTYLE_JAM_ROOM)} className="btn-secondary btn-lg w-full text-base md:text-lg">
                 <MusicNotesIcon className="w-5 h-5 mr-2" /> {UI_TEXT_TH.freestyleJamRoomButton}
              </button>
            </div>
            <div className="mt-5 md:mt-8 border-t border-slate-700 w-full max-w-md md:max-w-lg pt-5 md:pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                    <button onClick={() => setCurrentView(AppView.SUMMARY_PAGE)} className="btn-info w-full text-sm py-2.5">
                        <BookOpenIcon className="w-4 h-4 mr-1.5"/> {UI_TEXT_TH.viewSummary}
                    </button>
                    <button onClick={() => setCurrentView(AppView.UNLOCKABLES_STORE)} className="btn-info w-full text-sm py-2.5">
                       <ExternalLinkIcon className="w-4 h-4 mr-1.5"/> {UI_TEXT_TH.viewUnlockables}
                    </button>
                    <button onClick={() => setCurrentView(AppView.SHOP)} className="btn-info w-full text-sm py-2.5">
                        {UI_TEXT_TH.viewShop}
                    </button>
                    <button onClick={() => setCurrentView(AppView.MY_HOME)} className="btn-neutral w-full text-sm py-2.5">
                        <HomeIcon className="w-4 h-4 mr-1.5" /> {UI_TEXT_TH.myHomeScreenTitle}
                    </button>
                    <button onClick={() => setCurrentView(AppView.PET_MANAGEMENT_PAGE)} className="btn-neutral w-full text-sm py-2.5">
                        {UI_TEXT_TH.petManagementTitle}
                    </button>
                     <button onClick={() => setCurrentView(AppView.PET_ADOPTION_PAGE)} className="btn-neutral w-full text-sm py-2.5">
                        {UI_TEXT_TH.viewPetAdoption}
                    </button>
                    <button onClick={() => setCurrentView(AppView.MISSIONS_PAGE)} className="btn-accent w-full text-sm py-2.5">
                        <MissionScrollIcon className="w-4 h-4 mr-1.5" /> {UI_TEXT_TH.missionsPageTitle}
                    </button>
                    <button onClick={() => setCurrentView(AppView.MONSTER_LAIR)} className="btn-destructive w-full text-sm py-2.5">
                        <LairIcon className="w-4 h-4 mr-1.5" /> {UI_TEXT_TH.monsterLairTitle}
                    </button>
                     <button onClick={() => setCurrentView(AppView.MONSTERPEDIA)} className="btn-neutral w-full text-sm py-2.5">
                        <BookOpenIcon className="w-4 h-4 mr-1.5" /> {UI_TEXT_TH.monsterpediaTitle}
                    </button>
                     <button onClick={() => setCurrentView(AppView.NPC_HUB)} className="btn-info w-full text-sm py-2.5">
                        <UsersIcon className="w-4 h-4 mr-1.5"/> {UI_TEXT_TH.viewNPCHub}
                    </button>
                    <button onClick={() => setCurrentView(AppView.GAME_GUIDE_PAGE)} className="btn-neutral w-full text-sm py-2.5">
                        <BookInfoIcon className="w-4 h-4 mr-1.5" /> {UI_TEXT_TH.viewGameGuide}
                    </button>
                    <button onClick={() => setCurrentView(AppView.SETTINGS)} className="btn-settings w-full text-sm py-2.5">
                        {UI_TEXT_TH.viewSettings}
                    </button>
                </div>
            </div>
          </div>
        );
    }
    return <div className="text-center p-4">{UI_TEXT_TH.loading}... (View not found for {currentView})</div>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {currentView !== AppView.AUDIO_PROMPT && currentView !== AppView.PLAYER_NAME_INPUT && playerData && (
        <PlayerStatusBar 
            playerData={playerData} 
            onFeedPet={feedPet} // feedPet now comes from the refactored usePlayerData
            onPlayWithPet={playWithPet} // playWithPet now comes from the refactored usePlayerData
            getActivePetAbilityMultiplier={(currentPlayerData, abilityType) => getActivePetAbilityMultiplier(currentPlayerData, abilityType)}
        />
      )}
      <main className={`flex-grow flex flex-col items-center justify-center text-slate-100 transition-opacity duration-500 ease-in-out ${ (currentView !== AppView.AUDIO_PROMPT && currentView !== AppView.PLAYER_NAME_INPUT && playerData) ? 'pt-20 md:pt-24' : ''}`}>
        {playerData ? renderContent() : <div className="text-center p-4 text-slate-100 text-xl">{UI_TEXT_TH.loading}...</div>}
      </main>
      {notifications.length > 0 && (
        <NotificationArea 
            notifications={notifications} 
            onDismiss={dismissNotification}
            getAchievementDetails={getAchievementDetails}
        />
      )}
    </div>
  );
};

export default App;
