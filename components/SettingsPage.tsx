
import React from 'react';
import { PlayerData, InstrumentSoundId, UnlockedItemType, ThaiUIText } from '../types';
import { UI_TEXT_TH, ALL_INSTRUMENT_SOUNDS, getInstrumentSoundName } from '../constants';
import { CogIcon } from './icons/CogIcon'; 
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SaveIcon } from './icons/SaveIcon'; // New
import { TrashIcon } from './icons/TrashIcon'; // New

interface SettingsPageProps {
  playerData: PlayerData;
  onBackToMenu: () => void;
  selectInstrumentSound: (soundId: InstrumentSoundId) => void;
  saveGameExplicitly: () => void; // New
  resetGame: () => void; // New
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  playerData,
  onBackToMenu,
  selectInstrumentSound,
  saveGameExplicitly, // New
  resetGame, // New
}) => {
  const purchasedSounds = ALL_INSTRUMENT_SOUNDS.filter(sound => 
    sound.isDefault || playerData.purchasedShopItemIds.some(
      item => item.id === sound.id && item.type === UnlockedItemType.INSTRUMENT_SOUND
    )
  );

  const handleResetGame = () => {
    // Confirmation is handled by usePlayerData hook
    resetGame();
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-card p-6 md:p-8 rounded-xl shadow-2xl">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-borderDefault">
        <button onClick={onBackToMenu} className="btn-back">&larr; {UI_TEXT_TH.backToMenu}</button>
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-info-light to-info flex items-center">
          <CogIcon className="w-8 h-8 mr-3" />
          {UI_TEXT_TH.settingsTitle}
        </h1>
        <div className="w-20"> {/* Spacer */} </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3 text-primary-light">{UI_TEXT_TH.selectInstrumentSound}</h2>
        <p className="text-sm text-textMuted mb-3">
            {UI_TEXT_TH.currentSoundLabel} <span className="font-semibold text-secondary-light">{getInstrumentSoundName(playerData.selectedInstrumentSoundId, UI_TEXT_TH)}</span>
        </p>
        {purchasedSounds.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto app-custom-scrollbar pr-2">
            {purchasedSounds.map(sound => (
              <button
                key={sound.id}
                onClick={() => selectInstrumentSound(sound.id)}
                disabled={playerData.selectedInstrumentSoundId === sound.id}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors duration-150 ease-in-out
                  ${playerData.selectedInstrumentSoundId === sound.id 
                    ? 'bg-secondary text-white shadow-lg cursor-default' 
                    : 'bg-slate-700 hover:bg-slate-600 text-textBase shadow-md'}
                  disabled:opacity-80 disabled:hover:bg-secondary disabled:cursor-not-allowed
                `}
              >
                <span>{getInstrumentSoundName(sound.id, UI_TEXT_TH)}</span>
                {playerData.selectedInstrumentSoundId === sound.id && <CheckCircleIcon className="w-6 h-6 text-white" />}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-textMuted">คุณยังไม่มีเสียงเครื่องดนตรีอื่นให้เลือก ลองไปซื้อที่ร้านค้าดูสิ!</p>
        )}
      </div>

      {/* Game Data Management Section */}
      <div className="mt-8 pt-6 border-t border-borderDefault">
        <h2 className="text-xl font-semibold mb-4 text-primary-light">จัดการข้อมูลเกม</h2>
        <div className="space-y-3.5">
          <button
            onClick={saveGameExplicitly}
            className="w-full btn-success"
          >
            <SaveIcon className="w-5 h-5 mr-2" />
            {UI_TEXT_TH.saveGameButton}
          </button>
          <button
            onClick={handleResetGame}
            className="w-full btn-destructive"
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            {UI_TEXT_TH.resetGameButton}
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default SettingsPage;