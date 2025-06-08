
// Added a comment to ensure re-processing
import React, { useState, useEffect, useCallback } from 'react';
import { GameMode, Difficulty, PlayerData, AppView, InstrumentSoundId, PetId, NotificationMessage, MissionId, MonsterId, MissionType, NPCId, QuestId, AvatarStyle, QuestStatus, RelationshipData, MementoId, GiftResult, RelationshipStatus, FaceId, HairId, SkinColorId, HairColorId, PlayerAppearance, UnlockedItemType } from './types';
import { UI_TEXT_TH, getDifficultyText, DAILY_LOGIN_REWARD, getInstrumentSoundName, PET_DEFINITIONS, getHouseLevelName, ALL_MONSTERS, getNPCName, getQuestTitle, QUEST_DEFINITIONS, getQuestDefinition, getPetName, ALL_FACE_OPTIONS, ALL_HAIR_OPTIONS, ALL_SKIN_COLOR_OPTIONS, ALL_HAIR_COLOR_OPTIONS, SHOP_ITEMS, LEVEL_THRESHOLDS, getMonsterDefinition, ALL_INTERVALS, ALL_CHORDS } from './constants'; // Added ALL_INTERVALS, ALL_CHORDS, getMonsterDefinition

// Hooks
import { usePlayerData } from './hooks/usePlayerData';
import { AudioService } from './services/AudioService';

// Page Components
import IntervalTrainer from './components/pages/IntervalTrainer';
import ChordTrainer from './components/pages/ChordTrainer';
import MelodyRecallTrainer from './components/pages/MelodyRecallTrainer';
import SummaryPage from './components/pages/SummaryPage';
import UnlockablesStore from './components/pages/UnlockablesStore';
import ShopPage from './components/pages/ShopPlaceholder';
import SettingsPage from './components/pages/SettingsPage';
import PetAdoptionPage from './components/pages/PetAdoptionPage';
import PetManagementPage from './components/pages/PetManagementPage';
import PlayerNameInputPage from './components/pages/PlayerNameInputPage';
import MyHomeScreen from './components/pages/MyHomeScreen';
import MissionsPage from './components/pages/MissionsPage';
import MonsterLairPage from './components/pages/MonsterLairPage';
import MonsterBattlePage from './components/pages/MonsterBattlePage';
import MonsterpediaPage from './components/pages/MonsterpediaPage';
import FreestyleJamRoomPage from './components/pages/FreestyleJamRoomPage';
import GameGuidePage from './components/pages/GameGuidePage';
import NPCHubPage from './components/pages/NPCHubPage';
import QuestInteractionPage from './components/pages/QuestInteractionPage';
import AvatarCustomizationPage from './components/pages/AvatarCustomizationPage';
import MelodieInteractionPage from './components/pages/MelodieInteractionPage';
import RhythmInteractionPage from './components/pages/RhythmInteractionPage';
import HarmonieInteractionPage from './components/pages/HarmonieInteractionPage';
import RelationshipJournalPage from './components/pages/RelationshipJournalPage';
import GiftingPage from './components/pages/GiftingPage';
import ChildNamingPage from './components/pages/ChildNamingPage';
import FinalBossBattlePage from './components/pages/FinalBossBattlePage'; 

// RPG Components
import { PlayerStatusBar } from './components/rpg/PlayerStatusBar';
import NotificationArea from './components/rpg/NotificationArea';

const MainMenu: React.FC<{ navigateTo: (view: AppView) => void, playerData: PlayerData | null, onUnlockMode: () => void }> = ({ navigateTo, playerData, onUnlockMode }) => {
  if (!playerData) return null;
  const hasPets = playerData.ownedPetIds && playerData.ownedPetIds.length > 0;
  const allMonstersDefeated = ALL_MONSTERS.every(m => playerData.defeatedMonsterIds.includes(m.id)); 

  return (
    <div className="flex flex-col items-center space-y-3 p-4">
      <h1 className="text-3xl font-bold text-sky-300 mb-4 text-outline-black">เมนูหลัก</h1>
      <button className="menu-button w-full max-w-sm" onClick={() => navigateTo(AppView.DIFFICULTY_SELECTION)}>{UI_TEXT_TH.chooseMode}</button>
      <button className="menu-button w-full max-w-sm" onClick={() => navigateTo(AppView.MY_HOME)}>{UI_TEXT_TH.myHomeScreenTitle}</button>
      <button className="menu-button w-full max-w-sm" onClick={() => navigateTo(AppView.RELATIONSHIP_JOURNAL)}>{UI_TEXT_TH.viewRelationshipJournal}</button>
      <button className="menu-button w-full max-w-sm" onClick={() => navigateTo(AppView.MISSIONS_PAGE)}>{UI_TEXT_TH.missionsPageTitle}</button>
      <button className="menu-button w-full max-w-sm" onClick={() => navigateTo(AppView.MONSTER_LAIR)}>{UI_TEXT_TH.monsterLairTitle}</button>
      {allMonstersDefeated && !playerData.isGoldenEarGod && ( 
        <button className="menu-button w-full max-w-sm btn-accent" onClick={() => navigateTo(AppView.FINAL_BOSS_BATTLE)}>{UI_TEXT_TH.finalBoss_MainMenuButton}</button>
      )}
      <button className="menu-button w-full max-w-sm" onClick={() => navigateTo(AppView.FREESTYLE_JAM_ROOM)}>{UI_TEXT_TH.freestyleJamRoomButton}</button>
      <button className="menu-button w-full max-w-sm" onClick={() => navigateTo(AppView.NPC_HUB)}>{UI_TEXT_TH.viewNPCHub}</button>
      <button className="menu-button w-full max-w-sm" onClick={() => navigateTo(AppView.SHOP)}>{UI_TEXT_TH.viewShop}</button>
      <button className="menu-button w-full max-w-sm" onClick={() => navigateTo(AppView.UNLOCKABLES_STORE)}>{UI_TEXT_TH.viewUnlockables}</button>
      
      <button className="menu-button w-full max-w-sm" onClick={() => navigateTo(AppView.PET_ADOPTION_PAGE)}>{UI_TEXT_TH.viewPetAdoption}</button>
      {hasPets && (
        <button className="menu-button w-full max-w-sm" onClick={() => navigateTo(AppView.PET_MANAGEMENT_PAGE)}>{UI_TEXT_TH.manageMyPet}</button>
      )}
      {!hasPets && (
         <button 
            className="menu-button w-full max-w-sm opacity-50 cursor-not-allowed" 
            disabled 
            title={UI_TEXT_TH.manageMyPetTooltipNoPets || "รับเลี้ยงเพื่อนซี้ก่อน"}>
            {UI_TEXT_TH.manageMyPet}
        </button>
      )}

      <button className="menu-button w-full max-w-sm" onClick={() => navigateTo(AppView.SUMMARY_PAGE)}>{UI_TEXT_TH.viewSummary}</button>
      <button className="menu-button w-full max-w-sm" onClick={() => navigateTo(AppView.MONSTERPEDIA)}>{UI_TEXT_TH.viewMonsterpedia}</button>
      <button className="menu-button w-full max-w-sm" onClick={() => navigateTo(AppView.GAME_GUIDE_PAGE)}>{UI_TEXT_TH.viewGameGuide}</button>
      <button className="menu-button w-full max-w-sm btn-neutral" onClick={onUnlockMode}>{UI_TEXT_TH.unlockModeButtonLabel}</button>
      <button className="btn-settings w-full max-w-sm mt-2" onClick={() => navigateTo(AppView.SETTINGS)}>{UI_TEXT_TH.viewSettings}</button>
    </div>
  );
};

const TrainingModeSelectionPage: React.FC<{ onSelectMode: (mode: GameMode) => void, onBack: () => void }> = ({ onSelectMode, onBack }) => (
  <div className="flex flex-col items-center space-y-4 p-4">
      <h2 className="text-xl font-bold text-sky-300 mb-3">{UI_TEXT_TH.chooseMode}</h2>
      <button className="btn-primary w-full max-w-xs" onClick={() => onSelectMode(GameMode.INTERVALS)}>{UI_TEXT_TH.intervalTraining}</button>
      <button className="btn-primary w-full max-w-xs" onClick={() => onSelectMode(GameMode.CHORDS)}>{UI_TEXT_TH.chordTraining}</button>
      <button className="btn-primary w-full max-w-xs" onClick={() => onSelectMode(GameMode.MELODY_RECALL)}>{UI_TEXT_TH.melodyRecallTraining}</button>
      <button className="btn-neutral w-full max-w-xs mt-2" onClick={onBack}>{UI_TEXT_TH.backToMenu}</button>
  </div>
);

const DifficultySelectionFinalPage: React.FC<{ onSelectDifficulty: (difficulty: Difficulty) => void, onBack: () => void, mode: GameMode | null }> = ({ onSelectDifficulty, onBack, mode }) => {
  if (!mode) return null;
  return (
      <div className="flex flex-col items-center space-y-4 p-4">
      <h2 className="text-xl font-bold text-sky-300 mb-3">{UI_TEXT_TH.difficultyPrompt}</h2>
      {(Object.values(Difficulty) as Difficulty[]).map(diff => (
          <button key={diff} className={`btn-${diff.toLowerCase()} w-full max-w-xs`} onClick={() => onSelectDifficulty(diff)}>
          {getDifficultyText(diff, mode)}
          </button>
      ))}
      <button className="btn-neutral w-full max-w-xs mt-2" onClick={onBack}>{UI_TEXT_TH.backToMenu}</button>
      </div>
  );
};

const App: React.FC = () => {
  const playerDataHook = usePlayerData();
  const {
    playerData,
    notifications,
    dismissNotification,
    achievements,
    getAchievementDetails,
    addNotification,
    setPlayerAppearance,
    equipClothingItem,
    purchaseShopItem,
    isShopItemPurchased,
    relationshipSystem,
    trainingSystem,
    monsterSystem,
    missionSystem,
    questSystem,
    petSystem,
    houseSystem,
    familySystem,
    performBusking, 
    getBuskingCooldownTime, 
    performFamilyActivity, 
    getFamilyActivityCooldownTime, 
    celebrateBirthday,
    setGoldenEarGodStatusAndReward,
    activateUnlockMode, // Added from usePlayerData
  } = playerDataHook;

  const [currentView, setCurrentView] = useState<AppView>(AppView.PLAYER_NAME_INPUT);
  const [audioService, setAudioService] = useState<AudioService | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode | null>(null);
  const [selectedMonsterId, setSelectedMonsterId] = useState<MonsterId | null>(null);
  const [selectedNpcIdForQuest, setSelectedNpcIdForQuest] = useState<NPCId | null>(null);
  const [giftingTargetNpcId, setGiftingTargetNpcId] = useState<NPCId | null>(null);
  const [isUnlockModeActive, setIsUnlockModeActive] = useState<boolean>(false); // New state for unlock mode

  useEffect(() => {
    const service = new AudioService();
    setAudioService(service);
    const resumeAudioOnInteraction = async () => {
      if (service.isSuspended()) await service.resume();
      document.removeEventListener('click', resumeAudioOnInteraction);
      document.removeEventListener('touchstart', resumeAudioOnInteraction);
    };
    document.addEventListener('click', resumeAudioOnInteraction);
    document.addEventListener('touchstart', resumeAudioOnInteraction);
    return () => {
      service.close();
      document.removeEventListener('click', resumeAudioOnInteraction);
      document.removeEventListener('touchstart', resumeAudioOnInteraction);
    };
  }, []);

  const navigateTo = (view: AppView) => {
    if (view === AppView.MENU) {
      setSelectedGameMode(null); 
      setSelectedDifficulty(Difficulty.EASY); 
      setSelectedMonsterId(null);
      setSelectedNpcIdForQuest(null);
      setGiftingTargetNpcId(null);
    }
    setCurrentView(view);
  };

  useEffect(() => {
    if (playerData && !playerData.playerName && currentView !== AppView.PLAYER_NAME_INPUT) {
      navigateTo(AppView.PLAYER_NAME_INPUT);
    } else if (playerData && playerData.playerName && currentView === AppView.PLAYER_NAME_INPUT) {
      navigateTo(AppView.MENU);
      playerDataHook.checkForDailyLoginReward(); 
      petSystem.updatePetStatePeriodic();
      missionSystem.refreshMissions();
      familySystem.handleChildDailyUpdate();
    }
  }, [playerData, currentView, playerDataHook, missionSystem, petSystem, familySystem]); 


  const handleNameSubmitted = () => {
    navigateTo(AppView.MENU);
    playerDataHook.checkForDailyLoginReward(); 
    petSystem.updatePetStatePeriodic();
    missionSystem.refreshMissions();
  };

  const handleModeSelection = (mode: GameMode) => {
    setSelectedGameMode(mode);
    navigateTo(AppView.DIFFICULTY_SELECTION);
  };

  const handleDifficultySelection = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    if (selectedGameMode === GameMode.INTERVALS) navigateTo(AppView.INTERVAL_TRAINER);
    else if (selectedGameMode === GameMode.CHORDS) navigateTo(AppView.CHORD_TRAINER);
    else if (selectedGameMode === GameMode.MELODY_RECALL) navigateTo(AppView.MELODY_RECALL_TRAINER);
  };
  
  const handleMonsterSelection = (monsterId: MonsterId) => {
    if (isUnlockModeActive) {
      monsterSystem.recordMonsterDefeat(monsterId);
      const monsterDef = getMonsterDefinition(monsterId);
      addNotification({
        type: 'info',
        titleKey: 'appName',
        messageKey: undefined,
        itemName: UI_TEXT_TH.unlockModeMonsterDefeatedInstantly.replace('{monsterName}', monsterDef ? UI_TEXT_TH[monsterDef.nameKey] : 'อสูร')
      });
      navigateTo(AppView.MONSTER_LAIR);
    } else {
      setSelectedMonsterId(monsterId);
      navigateTo(AppView.MONSTER_BATTLE);
    }
  };

  const handleSelectNPCForQuest = (npcId: NPCId) => {
    setSelectedNpcIdForQuest(npcId);
    navigateTo(AppView.QUEST_INTERACTION);
  };

  const handleNavigateToGifting = (npcId: NPCId) => {
    setGiftingTargetNpcId(npcId);
    navigateTo(AppView.GIFTING_PAGE);
  };
  
  const handleChildNameSubmitted = (name: string) => {
    familySystem.setChildName(name);
    navigateTo(AppView.MY_HOME);
  };
  
  const handleFinalBossBattleEnd = (victory: boolean) => {
    if (victory) {
        setGoldenEarGodStatusAndReward();
    }
    navigateTo(AppView.MENU); 
  };

  const handleUnlockModeActivation = () => {
    const password = window.prompt(UI_TEXT_TH.unlockModePasswordPrompt);
    if (password === "240941") {
      setIsUnlockModeActive(true);
      activateUnlockMode(); // Call the function from usePlayerData
      // Success notification is handled within activateUnlockMode
    } else if (password !== null) { 
      addNotification({ type: 'info', titleKey: 'appName', messageKey: undefined, itemName: UI_TEXT_TH.unlockModeFailure });
    }
  };


  const renderView = () => {
    if (!playerData || !audioService) {
      return <div className="flex items-center justify-center h-screen text-2xl text-slate-100 bg-slate-900">{UI_TEXT_TH.loading}...</div>;
    }

    switch (currentView) {
      case AppView.PLAYER_NAME_INPUT:
        return <PlayerNameInputPage setPlayerName={playerDataHook.setPlayerName} onNameSubmitted={handleNameSubmitted} />;
      case AppView.MENU:
        return <MainMenu navigateTo={navigateTo} playerData={playerData} onUnlockMode={handleUnlockModeActivation} />;
      case AppView.DIFFICULTY_SELECTION:
        return selectedGameMode
            ? <DifficultySelectionFinalPage onSelectDifficulty={handleDifficultySelection} onBack={() => navigateTo(AppView.MENU)} mode={selectedGameMode} />
            : <TrainingModeSelectionPage onSelectMode={handleModeSelection} onBack={() => navigateTo(AppView.MENU)} />;
      case AppView.INTERVAL_TRAINER:
        return <IntervalTrainer audioService={audioService} onBackToMenu={() => navigateTo(AppView.MENU)} difficulty={selectedDifficulty} playerData={playerData} addXpAndCoins={trainingSystem.addXpAndCoinsFromTraining} updateHighestStreak={trainingSystem.updateHighestStreak} isMusicalItemUnlocked={playerDataHook.isMusicalItemUnlocked} selectedInstrumentSoundId={playerData.selectedInstrumentSoundId} highlightPianoOnPlay={playerData.highlightPianoOnPlay} />;
      case AppView.CHORD_TRAINER:
        return <ChordTrainer audioService={audioService} onBackToMenu={() => navigateTo(AppView.MENU)} difficulty={selectedDifficulty} playerData={playerData} addXpAndCoins={trainingSystem.addXpAndCoinsFromTraining} updateHighestStreak={trainingSystem.updateHighestStreak} isMusicalItemUnlocked={playerDataHook.isMusicalItemUnlocked} selectedInstrumentSoundId={playerData.selectedInstrumentSoundId} highlightPianoOnPlay={playerData.highlightPianoOnPlay} />;
      case AppView.MELODY_RECALL_TRAINER:
        return <MelodyRecallTrainer audioService={audioService} onBackToMenu={() => navigateTo(AppView.MENU)} difficulty={selectedDifficulty} playerData={playerData} addXpAndCoins={trainingSystem.addXpAndCoinsFromTraining} updateHighestStreak={trainingSystem.updateHighestStreak} selectedInstrumentSoundId={playerData.selectedInstrumentSoundId} highlightPianoOnPlay={playerData.highlightPianoOnPlay} />;
      case AppView.SUMMARY_PAGE:
        return <SummaryPage playerData={playerData} allAchievements={achievements} getAchievementDetails={getAchievementDetails} onBackToMenu={() => navigateTo(AppView.MENU)} />;
      case AppView.UNLOCKABLES_STORE:
        return <UnlockablesStore playerData={playerData} onBackToMenu={() => navigateTo(AppView.MENU)} unlockMusicalItem={playerDataHook.unlockMusicalItem} isMusicalItemUnlocked={playerDataHook.isMusicalItemUnlocked} getActivePetAbilityMultiplier={(abilityType) => petSystem.getActivePetAbilityMultiplier(playerData.activePetId, playerData.pets, abilityType)} />;
      case AppView.SHOP:
        return <ShopPage playerData={playerData} onBackToMenu={() => navigateTo(AppView.MENU)} purchaseShopItem={purchaseShopItem} isShopItemPurchased={isShopItemPurchased} addNotification={addNotification} />;
      case AppView.SETTINGS:
        return <SettingsPage playerData={playerData} onBackToMenu={() => navigateTo(AppView.MENU)} selectInstrumentSound={playerDataHook.selectInstrumentSound} saveGameExplicitly={playerDataHook.saveGameExplicitly} resetGame={playerDataHook.resetGame} toggleHighlightPianoOnPlay={playerDataHook.toggleHighlightPianoOnPlay} highlightPianoOnPlay={playerData.highlightPianoOnPlay} setAvatarStyle={playerDataHook.setAvatarStyle} navigateToAvatarCustomization={() => navigateTo(AppView.AVATAR_CUSTOMIZATION)} />;
      case AppView.AVATAR_CUSTOMIZATION:
        return <AvatarCustomizationPage playerData={playerData} onBackToSettings={() => navigateTo(AppView.SETTINGS)} setPlayerAppearance={setPlayerAppearance} addNotification={addNotification} equipClothingItem={equipClothingItem} />;
      case AppView.PET_ADOPTION_PAGE:
        return <PetAdoptionPage playerData={playerData} onBackToMenu={() => navigateTo(AppView.MENU)} adoptPet={petSystem.adoptPet} onPetAdopted={(petId) => { if(!playerData.activePetId) petSystem.setActivePet(petId); navigateTo(AppView.PET_MANAGEMENT_PAGE); }} />;
      case AppView.PET_MANAGEMENT_PAGE:
        return <PetManagementPage playerData={playerData} onBackToMenu={() => navigateTo(AppView.MENU)} setActivePet={petSystem.setActivePet} applyPetCustomization={petSystem.applyPetCustomization} purchaseShopItem={purchaseShopItem} isShopItemPurchased={isShopItemPurchased} addNotification={addNotification} />;
      case AppView.MY_HOME:
        return <MyHomeScreen
                  playerData={playerData}
                  upgradeHouse={houseSystem.upgradeHouse}
                  activatePracticeNook={houseSystem.activatePracticeNook}
                  addNotification={addNotification}
                  onBackToMenu={() => navigateTo(AppView.MENU)}
                  navigateTo={navigateTo}
                  initiateChildEvent={familySystem.initiateChildEvent}
                  feedChild={familySystem.feedChild}
                  playWithChild={familySystem.playWithChild}
                  changeChildDiaper={familySystem.changeChildDiaper}
                  sootheChildToSleep={familySystem.sootheChildToSleep}
                  useChildCareKit={familySystem.useChildCareKit}
                  payTuition={familySystem.payTuition}
                  helpWithHomework={familySystem.helpWithHomework}
                  celebrateBirthday={familySystem.celebrateBirthday} 
                  performBusking={performBusking}
                  getBuskingCooldownTime={getBuskingCooldownTime}
                  performFamilyActivity={performFamilyActivity} 
                  getFamilyActivityCooldownTime={getFamilyActivityCooldownTime} 
                />;
      case AppView.MISSIONS_PAGE:
        return <MissionsPage playerData={playerData} claimMissionReward={missionSystem.claimMissionReward} onBackToMenu={() => navigateTo(AppView.MENU)} />;
      case AppView.MONSTER_LAIR:
        return <MonsterLairPage playerData={playerData} onMonsterSelect={handleMonsterSelection} onBackToMenu={() => navigateTo(AppView.MENU)} />;
      case AppView.MONSTER_BATTLE:
        if (!selectedMonsterId) { navigateTo(AppView.MONSTER_LAIR); return null; }
        return <MonsterBattlePage audioService={audioService} monsterId={selectedMonsterId} playerData={playerData} recordMonsterDefeat={monsterSystem.recordMonsterDefeat} onBattleEnd={() => navigateTo(AppView.MONSTER_LAIR)} selectedInstrumentSoundId={playerData.selectedInstrumentSoundId} addNotification={addNotification} isMusicalItemUnlocked={playerDataHook.isMusicalItemUnlocked} collectQuestItem={questSystem.collectQuestItem} />;
      case AppView.MONSTERPEDIA:
        return <MonsterpediaPage playerData={playerData} onBackToMenu={() => navigateTo(AppView.MENU)} />;
      case AppView.FREESTYLE_JAM_ROOM:
        return <FreestyleJamRoomPage audioService={audioService} playerData={playerData} onBackToMenu={() => navigateTo(AppView.MENU)} updateMissionProgress={missionSystem.updateMissionProgress} />;
      case AppView.GAME_GUIDE_PAGE:
        return <GameGuidePage onBackToMenu={() => navigateTo(AppView.MENU)} />;
      case AppView.NPC_HUB:
        return <NPCHubPage playerData={playerData} onSelectNPC={handleSelectNPCForQuest} onBackToMenu={() => navigateTo(AppView.MENU)} getQuestStatus={questSystem.getQuestStatus} />;
      case AppView.QUEST_INTERACTION:
        if (!selectedNpcIdForQuest) { navigateTo(AppView.NPC_HUB); return null; }
        return <QuestInteractionPage npcId={selectedNpcIdForQuest} playerData={playerData} onBackToHub={() => navigateTo(AppView.NPC_HUB)} onAcceptQuest={questSystem.startQuest} onProgressQuest={questSystem.progressQuest} onClaimReward={questSystem.completeQuest} getQuestStatus={questSystem.getQuestStatus} collectQuestItem={questSystem.collectQuestItem} />;
      case AppView.NPC_INTERACTION_MELODIE:
        return <MelodieInteractionPage playerData={playerData} uiText={UI_TEXT_TH} onInteract={() => relationshipSystem.interactWithNpc(NPCId.MELODIE)} onBackToMenu={() => navigateTo(AppView.MENU)} onNavigateToGifting={handleNavigateToGifting} onConfess={() => relationshipSystem.confessToNpc(NPCId.MELODIE)} onMarkEventViewed={relationshipSystem.markEventAsViewed} onPropose={() => relationshipSystem.proposeToNpc(NPCId.MELODIE)} onGoOnDate={() => relationshipSystem.goOnDate(NPCId.MELODIE)} />;
      case AppView.NPC_INTERACTION_RHYTHM:
        return <RhythmInteractionPage playerData={playerData} uiText={UI_TEXT_TH} onInteract={() => relationshipSystem.interactWithNpc(NPCId.RHYTHM)} onBackToMenu={() => navigateTo(AppView.MENU)} onNavigateToGifting={handleNavigateToGifting} onConfess={() => relationshipSystem.confessToNpc(NPCId.RHYTHM)} onMarkEventViewed={relationshipSystem.markEventAsViewed} onPropose={() => relationshipSystem.proposeToNpc(NPCId.RHYTHM)} onGoOnDate={() => relationshipSystem.goOnDate(NPCId.RHYTHM)} />;
      case AppView.NPC_INTERACTION_HARMONIE:
        return <HarmonieInteractionPage playerData={playerData} uiText={UI_TEXT_TH} onInteract={() => relationshipSystem.interactWithNpc(NPCId.HARMONIE)} onBackToMenu={() => navigateTo(AppView.MENU)} onNavigateToGifting={handleNavigateToGifting} onConfess={() => relationshipSystem.confessToNpc(NPCId.HARMONIE)} onMarkEventViewed={relationshipSystem.markEventAsViewed} onPropose={() => relationshipSystem.proposeToNpc(NPCId.HARMONIE)} onGoOnDate={() => relationshipSystem.goOnDate(NPCId.HARMONIE)} />;
      case AppView.RELATIONSHIP_JOURNAL:
        return <RelationshipJournalPage playerData={playerData} onBackToMenu={() => navigateTo(AppView.MENU)} onSelectNPC={(npcId) => {
            if (npcId === NPCId.MELODIE) navigateTo(AppView.NPC_INTERACTION_MELODIE);
            else if (npcId === NPCId.RHYTHM) navigateTo(AppView.NPC_INTERACTION_RHYTHM);
            else if (npcId === NPCId.HARMONIE) navigateTo(AppView.NPC_INTERACTION_HARMONIE);
        }}/>;
      case AppView.GIFTING_PAGE:
        if (!giftingTargetNpcId) { navigateTo(AppView.MENU); return null; }
        return <GiftingPage playerData={playerData} npcId={giftingTargetNpcId} onBack={() => {
            if (giftingTargetNpcId === NPCId.MELODIE) navigateTo(AppView.NPC_INTERACTION_MELODIE);
            else if (giftingTargetNpcId === NPCId.RHYTHM) navigateTo(AppView.NPC_INTERACTION_RHYTHM);
            else if (giftingTargetNpcId === NPCId.HARMONIE) navigateTo(AppView.NPC_INTERACTION_HARMONIE);
            else navigateTo(AppView.MENU);
        }} onGiveGift={relationshipSystem.giveGiftToNpc} addNotification={addNotification} />;
      case AppView.CHILD_NAMING_PAGE:
        return <ChildNamingPage
                    onNameSubmitted={handleChildNameSubmitted}
                    onCancel={() => navigateTo(AppView.MY_HOME)}
                    spouseName={playerData.spouseId ? getNPCName(playerData.spouseId, UI_TEXT_TH) : undefined}
                />;
      case AppView.FINAL_BOSS_BATTLE: 
        return <FinalBossBattlePage 
                    audioService={audioService} 
                    playerData={playerData} 
                    onBattleEnd={handleFinalBossBattleEnd} 
                    selectedInstrumentSoundId={playerData.selectedInstrumentSoundId}
                    addNotification={addNotification}
                    isMusicalItemUnlocked={playerDataHook.isMusicalItemUnlocked}
                    highlightPianoOnPlay={playerData.highlightPianoOnPlay}
                />;
      default:
        return <MainMenu navigateTo={navigateTo} playerData={playerData} onUnlockMode={handleUnlockModeActivation} />;
    }
  };
  
  if (!playerData) {
     return <div className="flex items-center justify-center h-screen text-2xl text-slate-100 bg-slate-900">{UI_TEXT_TH.loading}... (Initializing Player Data)</div>;
  }


  return (
    <div className="app-custom-scrollbar" style={{ paddingTop: '70px' }}> 
      <PlayerStatusBar
        playerData={playerData}
        onFeedPet={petSystem.feedPet}
        onPlayWithPet={petSystem.playWithPet}
        getActivePetAbilityMultiplier={(abilityType) => petSystem.getActivePetAbilityMultiplier(playerData.activePetId, playerData.pets, abilityType)}
      />
      <div className="container mx-auto p-2 sm:p-3 md:p-4">
        {renderView()}
      </div>
      <NotificationArea notifications={notifications} onDismiss={dismissNotification} getAchievementDetails={getAchievementDetails}/>
    </div>
  );
};

export default App;