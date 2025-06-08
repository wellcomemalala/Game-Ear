
import React from 'react';
import { PlayerData, InstrumentSoundId, UnlockedItemType, ThaiUIText, AvatarStyle, AppView } from '../../types';
import { UI_TEXT_TH, ALL_INSTRUMENT_SOUNDS, getInstrumentSoundName } from '../../constants';
import { CogIcon } from '../icons/CogIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { SaveIcon } from '../icons/SaveIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { EyeSlashIcon } from '../icons/EyeSlashIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon'; 
import { SquareIcon } from '../icons/SquareIcon'; 
import { PaintBrushIcon } from '../icons/PaintBrushIcon'; // New

interface SettingsPageProps {
  playerData: PlayerData;
  onBackToMenu: () => void;
  selectInstrumentSound: (soundId: InstrumentSoundId) => void;
  saveGameExplicitly: () => void;
  resetGame: () => void;
  toggleHighlightPianoOnPlay: () => void;
  highlightPianoOnPlay: boolean;
  setAvatarStyle: (style: AvatarStyle) => void;
  navigateToAvatarCustomization: () => void; // New
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  playerData,
  onBackToMenu,
  selectInstrumentSound,
  saveGameExplicitly,
  resetGame,
  toggleHighlightPianoOnPlay,
  highlightPianoOnPlay,
  setAvatarStyle,
  navigateToAvatarCustomization, // New
}) => {
  const purchasedSounds = ALL_INSTRUMENT_SOUNDS.filter(sound =>
    sound.isDefault || playerData.purchasedShopItemIds.some(
      item => item.id === sound.id && item.type === UnlockedItemType.INSTRUMENT_SOUND
    )
  );

  const handleResetGame = () => {
    if (window.confirm(UI_TEXT_TH.confirmResetMessage)) {
        resetGame();
    }
  };

  const avatarOptions: {style: AvatarStyle, labelKey: keyof ThaiUIText, icon: React.ReactNode}[] = [
    { style: AvatarStyle.TYPE_A, labelKey: 'avatarStyleTypeA', icon: <UserCircleIcon className="w-5 h-5 mr-2" /> },
    { style: AvatarStyle.TYPE_B, labelKey: 'avatarStyleTypeB', icon: <UserCircleIcon className="w-5 h-5 mr-2" /> },
    { style: AvatarStyle.TYPE_C, labelKey: 'avatarStyleTypeC', icon: <SquareIcon className="w-5 h-5 mr-2" /> },
  ];

  return (
    <div className="w-full max-w-xl mx-auto bg-card p-6 md:p-8 rounded-xl shadow-2xl">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-borderDefault">
        <button onClick={onBackToMenu} className="btn-back">&larr; {UI_TEXT_TH.backToMenu}</button>
        <h1 className="text-2xl md:text-3xl font-bold text-sky-300 flex items-center text-outline-black">
          <CogIcon className="w-8 h-8 mr-3" />
          {UI_TEXT_TH.settingsTitle}
        </h1>
        <div className="w-20"> {/* Spacer */} </div>
      </div>

      {/* Avatar Customization Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3 text-teal-300 text-outline-black">{UI_TEXT_TH.avatarCustomizationTitle}</h2>
        <p className="text-sm text-slate-100 text-outline-black mb-3">{UI_TEXT_TH.avatarStyleLabel}</p>
        <div className="space-y-3">
          {avatarOptions.map(opt => (
            <button
              key={opt.style}
              onClick={() => setAvatarStyle(opt.style)}
              disabled={playerData.avatarStyle === opt.style}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors duration-150 ease-in-out
                ${playerData.avatarStyle === opt.style
                  ? 'bg-secondary text-white shadow-lg cursor-default'
                  : 'bg-slate-700 hover:bg-slate-600 text-textBase shadow-md'}
                disabled:opacity-80 disabled:hover:bg-secondary disabled:cursor-not-allowed
              `}
            >
              <span className="flex items-center">
                {opt.icon}
                {UI_TEXT_TH[opt.labelKey]}
              </span>
              {playerData.avatarStyle === opt.style && <CheckCircleIcon className="w-6 h-6 text-white" />}
            </button>
          ))}
           <button
            onClick={navigateToAvatarCustomization}
            className="w-full btn-info mt-3"
          >
            <PaintBrushIcon className="w-5 h-5 mr-2" />
            {UI_TEXT_TH.appearanceCustomizationTitle}
          </button>
        </div>
      </div>

      {/* Piano Highlight Setting */}
      <div className="mb-6 pt-6 border-t border-borderDefault">
        <h2 className="text-xl font-semibold mb-2 text-teal-300 text-outline-black">{UI_TEXT_TH.settingHighlightPianoOnPlayLabel}</h2>
        <p className="text-xs text-slate-200 text-outline-black mb-3">{UI_TEXT_TH.settingHighlightPianoOnPlayDesc}</p>
        <button
          onClick={toggleHighlightPianoOnPlay}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-white font-semibold transition-colors duration-150 ease-in-out shadow-md
            ${highlightPianoOnPlay ? 'bg-success hover:bg-success-dark' : 'bg-slate-600 hover:bg-slate-500'}`}
        >
          {highlightPianoOnPlay ?
            <><EyeIcon className="w-5 h-5 mr-2" /> เปิดใช้งาน</> :
            <><EyeSlashIcon className="w-5 h-5 mr-2" /> ปิดใช้งาน</>
          }
        </button>
      </div>

      {/* Instrument Sound Setting */}
      <div className="mb-6 pt-6 border-t border-borderDefault">
        <h2 className="text-xl font-semibold mb-3 text-teal-300 text-outline-black">{UI_TEXT_TH.selectInstrumentSound}</h2>
        <p className="text-sm text-slate-100 text-outline-black mb-3">
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
          <p className="text-slate-200 text-outline-black">คุณยังไม่มีเสียงเครื่องดนตรีอื่นให้เลือก ลองไปซื้อที่ร้านค้าดูสิ!</p>
        )}
      </div>

      {/* Game Data Management Section */}
      <div className="mt-8 pt-6 border-t border-borderDefault">
        <h2 className="text-xl font-semibold mb-4 text-teal-300 text-outline-black">จัดการข้อมูลเกม</h2>
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
