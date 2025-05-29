
import React, { useState, useEffect, useCallback } from 'react';
import { GameMode, Difficulty, PlayerData, AppView, InstrumentSoundId, PetId, NotificationMessage, MissionId, MonsterId, MissionType } from './types'; // Added MonsterId, MissionType
import { UI_TEXT_TH, getDifficultyText, DAILY_LOGIN_REWARD, getInstrumentSoundName, PET_DEFINITIONS, getHouseLevelName, ALL_MONSTERS } from './constants';
import IntervalTrainer from './components/IntervalTrainer';
import ChordTrainer from './components/ChordTrainer';
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
import GameGuidePage from './components/GameGuidePage'; // New
import { AudioService } from './services/AudioService';
import { usePlayerData } from './hooks/usePlayerData';
import PlayerStatusBar from './components/rpg/PlayerStatusBar';
import NotificationArea from './components/rpg/NotificationArea';
import { HomeIcon } from './components/icons/HomeIcon';
import { MissionScrollIcon } from './components/icons/MissionScrollIcon';
import { LairIcon } from './components/icons/LairIcon'; 
import { BookOpenIcon } from './components/icons/BookOpenIcon'; 
import { MusicNotesIcon } from './components/icons/MusicNotesIcon';
import { BookInfoIcon } from './components/icons/BookInfoIcon'; // New
import { ExternalLinkIcon } from './components/icons/ExternalLinkIcon'; // New for Facebook link


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.AUDIO_PROMPT);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [audioService, setAudioService] = useState<AudioService | null>(null);
  const [isAudioContextReady, setIsAudioContextReady] = useState(false);
  const [selectedModeForDifficulty, setSelectedModeForDifficulty] = useState<GameMode | null>(null);
  const [selectedMonsterId, setSelectedMonsterId] = useState<MonsterId | null>(null); 

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
    updatePetStateOnLoad,
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
      setCurrentView(selectedModeForDifficulty === GameMode.INTERVALS ? AppView.INTERVAL_TRAINER : AppView.CHORD_TRAINER);
    }
  };

  const handleBackToMenu = () => {
    setGameMode(null);
    setDifficulty(null);
    setSelectedModeForDifficulty(null);
    setSelectedMonsterId(null); 
    setCurrentView(AppView.MENU);
  };

  const navigateToSummary = () => setCurrentView(AppView.SUMMARY_PAGE);
  const navigateToUnlockablesStore = () => setCurrentView(AppView.UNLOCKABLES_STORE);
  const navigateToShop = () => setCurrentView(AppView.SHOP);
  const navigateToSettings = () => setCurrentView(AppView.SETTINGS);
  const navigateToPetAdoption = () => setCurrentView(AppView.PET_ADOPTION_PAGE);
  const navigateToPetManagement = () => setCurrentView(AppView.PET_MANAGEMENT_PAGE);
  const navigateToMyHome = () => setCurrentView(AppView.MY_HOME);
  const navigateToMissions = () => setCurrentView(AppView.MISSIONS_PAGE);
  const navigateToMonsterLair = () => setCurrentView(AppView.MONSTER_LAIR); 
  const navigateToMonsterpedia = () => setCurrentView(AppView.MONSTERPEDIA); 
  const navigateToGameGuidePage = () => setCurrentView(AppView.GAME_GUIDE_PAGE);
  const navigateToFreestyleJamRoom = () => { 
    setCurrentView(AppView.FREESTYLE_JAM_ROOM);
    if (!isAudioContextReady) initializeAudio();
  }

  const handleMonsterSelect = (monsterId: MonsterId) => { 
    setSelectedMonsterId(monsterId);
    setCurrentView(AppView.MONSTER_BATTLE);
    updateMissionProgress(MissionType.START_MONSTER_BATTLE, 1, { monsterId: monsterId }); 
    if (!isAudioContextReady) initializeAudio();
  };


  if (!playerData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-4">
        <div className="text-xl font-semibold">{UI_TEXT_TH.loading}</div>
      </div>
    );
  }

  const renderContent = () => {
    if (!playerData && currentView !== AppView.AUDIO_PROMPT) {
        return <div className="flex items-center justify-center min-h-screen"><div className="text-xl font-semibold text-slate-100">{UI_TEXT_TH.loading}</div></div>;
    }

    switch (currentView) {
      case AppView.AUDIO_PROMPT:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-4">
            <div className="bg-card p-8 rounded-xl shadow-2xl text-center max-w-md">
              <h1 className="text-4xl font-bold mb-8 text-sky-300 text-outline-black">{UI_TEXT_TH.appName}</h1>
              <p className="mb-6 text-textMuted">{UI_TEXT_TH.audioContextPrompt}</p>
              <button onClick={initializeAudio} className="btn btn-primary btn-lg w-full">
                {UI_TEXT_TH.start}
              </button>
              {typeof window !== 'undefined' && !window.AudioContext && <p className="mt-4 text-destructive">{UI_TEXT_TH.audioNotSupported}</p>}
            </div>
          </div>
        );

      case AppView.PLAYER_NAME_INPUT:
        return <PlayerNameInputPage setPlayerName={setPlayerName} onNameSubmitted={() => setCurrentView(AppView.MENU)} />;

      case AppView.MENU:
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-4">
            <div className="bg-card p-6 md:p-10 rounded-xl shadow-2xl w-full max-w-md">
              <h1 className="text-4xl font-bold mb-6 text-center text-sky-300 text-outline-black">{UI_TEXT_TH.appName}</h1>
              <h2 className="text-2xl font-bold mb-6 text-sky-300 text-center text-outline-black">{UI_TEXT_TH.chooseMode}</h2>
              <div className="space-y-3.5">
                {/* Core Gameplay & Challenge */}
                <button onClick={() => handleModeSelect(GameMode.INTERVALS)} className="w-full btn-primary btn-lg">{UI_TEXT_TH.intervalTraining}</button>
                <button onClick={() => handleModeSelect(GameMode.CHORDS)} className="w-full btn-secondary btn-lg">{UI_TEXT_TH.chordTraining}</button>
                <button onClick={navigateToMonsterLair} className="w-full btn bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white focus:ring-orange-400">
                    <LairIcon className="w-5 h-5" /><span>{UI_TEXT_TH.monsterLairTitle}</span>
                </button>
                <button onClick={navigateToMissions} className="w-full btn-info"><MissionScrollIcon className="w-5 h-5" /><span>{UI_TEXT_TH.missionsPageTitle}</span></button>
                
                {/* Player Hub & Progression */}
                <button onClick={navigateToMyHome} className="w-full btn-neutral"><HomeIcon className="w-5 h-5" /><span>{UI_TEXT_TH.myHomeScreenTitle}</span></button>
                {playerData.ownedPetIds.length === 0 ? (
                  <button onClick={navigateToPetAdoption} className="w-full btn bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white focus:ring-cyan-400">{UI_TEXT_TH.viewPetAdoption}</button>
                ) : (
                  <button onClick={navigateToPetManagement} className="w-full btn bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white focus:ring-purple-400">{UI_TEXT_TH.petManagementTitle}</button>
                )}
                 {playerData.ownedPetIds.length > 0 && playerData.ownedPetIds.length < PET_DEFINITIONS.length && (
                    <button onClick={navigateToPetAdoption} className="w-full btn bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white focus:ring-cyan-400">{UI_TEXT_TH.viewPetAdoption}</button>
                 )}

                {/* Exploration & Tools */}
                <button onClick={navigateToFreestyleJamRoom} className="w-full btn bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white focus:ring-pink-400">
                    <MusicNotesIcon className="w-5 h-5" /><span>{UI_TEXT_TH.freestyleJamRoomButton}</span>
                </button>
                <button onClick={navigateToMonsterpedia} className="w-full btn bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white focus:ring-indigo-400">
                    <BookOpenIcon className="w-5 h-5" /><span>{UI_TEXT_TH.monsterpediaTitle}</span>
                </button>

                {/* Store & Unlocks */}
                <button onClick={navigateToShop} className="w-full btn-neutral">{UI_TEXT_TH.viewShop}</button>
                <button onClick={navigateToUnlockablesStore} className="w-full btn-accent">{UI_TEXT_TH.viewUnlockables}</button>
                
                {/* Info & Settings */}
                <button onClick={navigateToSummary} className="w-full btn-info">{UI_TEXT_TH.viewSummary}</button>
                <button onClick={navigateToGameGuidePage} className="w-full btn-info"><BookInfoIcon className="w-5 h-5" /><span>{UI_TEXT_TH.viewGameGuide}</span></button>
                <button onClick={navigateToSettings} className="w-full btn-settings">{UI_TEXT_TH.viewSettings}</button>
              </div>
              {/* Zalay Beat X Ai Link */}
              <div className="mt-8 pt-6 border-t border-borderDefault text-center">
                <a
                  href="https://www.facebook.com/keetazalay24"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-slate-100 text-sm font-semibold rounded-lg shadow-md transition-colors hover:text-white"
                >
                  สร้างโดย Zalay Beat X Ai
                  <ExternalLinkIcon className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </div>
        );

      case AppView.DIFFICULTY_SELECTION:
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="bg-card p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-sky-300 text-center text-outline-black">{UI_TEXT_TH.difficultyPrompt}</h2>
              <div className="space-y-3.5">
                <button onClick={() => handleDifficultySelect(Difficulty.EASY)} className="w-full btn-easy btn-lg">{UI_TEXT_TH.easy}</button>
                <button onClick={() => handleDifficultySelect(Difficulty.MEDIUM)} className="w-full btn-medium btn-lg">{UI_TEXT_TH.medium}</button>
                <button onClick={() => handleDifficultySelect(Difficulty.HARD)} className="w-full btn-hard btn-lg">{UI_TEXT_TH.hard}</button>
                <button onClick={handleBackToMenu} className="w-full btn-neutral mt-6">{UI_TEXT_TH.backToMenu}</button>
              </div>
            </div>
          </div>
        );

      case AppView.INTERVAL_TRAINER:
        if (gameMode === GameMode.INTERVALS && difficulty && audioService) {
          return (
            <IntervalTrainer
              audioService={audioService}
              onBackToMenu={handleBackToMenu}
              difficulty={difficulty}
              playerData={playerData}
              addXpAndCoins={addXpAndCoins}
              updateHighestStreak={updateHighestStreak}
              isMusicalItemUnlocked={isMusicalItemUnlocked}
              selectedInstrumentSoundId={playerData.selectedInstrumentSoundId}
            />
          );
        }
        break;

      case AppView.CHORD_TRAINER:
        if (gameMode === GameMode.CHORDS && difficulty && audioService) {
          return (
            <ChordTrainer
              audioService={audioService}
              onBackToMenu={handleBackToMenu}
              difficulty={difficulty}
              playerData={playerData}
              addXpAndCoins={addXpAndCoins}
              updateHighestStreak={updateHighestStreak}
              isMusicalItemUnlocked={isMusicalItemUnlocked}
              selectedInstrumentSoundId={playerData.selectedInstrumentSoundId}
            />
          );
        }
        break;

      case AppView.SUMMARY_PAGE:
        return <SummaryPage playerData={playerData} allAchievements={allAchievements} getAchievementDetails={getAchievementDetails} onBackToMenu={handleBackToMenu} />;

      case AppView.UNLOCKABLES_STORE:
        return <UnlockablesStore playerData={playerData} onBackToMenu={handleBackToMenu} unlockMusicalItem={unlockMusicalItem} isMusicalItemUnlocked={isMusicalItemUnlocked} getActivePetAbilityMultiplier={getActivePetAbilityMultiplier} />;
      
      case AppView.SHOP:
        return <Shop playerData={playerData} onBackToMenu={handleBackToMenu} purchaseShopItem={purchaseShopItem} isShopItemPurchased={isShopItemPurchased} addNotification={addNotification} />;

      case AppView.SETTINGS:
        return <SettingsPage playerData={playerData} onBackToMenu={handleBackToMenu} selectInstrumentSound={selectInstrumentSound} saveGameExplicitly={saveGameExplicitly} resetGame={resetGame} />;

      case AppView.PET_ADOPTION_PAGE:
        return <PetAdoptionPage playerData={playerData} onBackToMenu={handleBackToMenu} adoptPet={adoptPet} onPetAdopted={() => { /* Maybe navigate to pet management or menu */ }} />;
      
      case AppView.PET_MANAGEMENT_PAGE:
        return <PetManagementPage playerData={playerData} onBackToMenu={handleBackToMenu} setActivePet={setActivePet} applyPetCustomization={applyPetCustomization} purchaseShopItem={purchaseShopItem} isShopItemPurchased={isShopItemPurchased} addNotification={addNotification} />;

      case AppView.MY_HOME:
        return <MyHomeScreen playerData={playerData} upgradeHouse={upgradeHouse} activatePracticeNook={activatePracticeNook} addNotification={addNotification} onBackToMenu={handleBackToMenu} />;

      case AppView.MISSIONS_PAGE:
        return <MissionsPage playerData={playerData} claimMissionReward={claimMissionReward} onBackToMenu={handleBackToMenu} />;
      
      case AppView.MONSTER_LAIR: 
        return <MonsterLairPage playerData={playerData} onMonsterSelect={handleMonsterSelect} onBackToMenu={handleBackToMenu} />;

      case AppView.MONSTER_BATTLE:
        if (selectedMonsterId && audioService) {
            return <MonsterBattlePage 
                        audioService={audioService} 
                        monsterId={selectedMonsterId} 
                        playerData={playerData} 
                        recordMonsterDefeat={recordMonsterDefeat} 
                        onBattleEnd={handleBackToMenu} 
                        selectedInstrumentSoundId={playerData.selectedInstrumentSoundId}
                        addNotification={addNotification}
                        isMusicalItemUnlocked={isMusicalItemUnlocked}
                    />;
        }
        break;
      case AppView.MONSTERPEDIA:
        return <MonsterpediaPage playerData={playerData} onBackToMenu={handleBackToMenu} />;

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
    }
    return (
      <div className="text-center p-4 text-textBase">
        <p>เกิดข้อผิดพลาดในการแสดงผล (View: {currentView}, Mode: {gameMode}, Difficulty: {difficulty})</p>
        <button onClick={handleBackToMenu} className="mt-4 btn-secondary">{UI_TEXT_TH.backToMenu}</button>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {currentView !== AppView.AUDIO_PROMPT && currentView !== AppView.PLAYER_NAME_INPUT && playerData && (
          <PlayerStatusBar playerData={playerData} onFeedPet={feedPet} onPlayWithPet={playWithPet} getActivePetAbilityMultiplier={getActivePetAbilityMultiplier} />
      )}
      <main className={`flex-grow flex flex-col items-center justify-center ${currentView !== AppView.AUDIO_PROMPT && currentView !== AppView.PLAYER_NAME_INPUT ? 'pt-24 pb-4 px-2 sm:px-4' : ''}`}>
        {renderContent()}
      </main>
      <NotificationArea notifications={notifications} onDismiss={dismissNotification} getAchievementDetails={getAchievementDetails} />
    </div>
  );
};

export default App;
