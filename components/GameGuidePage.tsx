
import React from 'react';
import { UI_TEXT_TH } from '../constants';
import { BookOpenIcon } from './icons/BookOpenIcon'; 
import { ArrowPathIcon } from './icons/ArrowPathIcon';

interface GameGuidePageProps {
  onBackToMenu: () => void;
}

interface SectionProps {
  titleKey: keyof typeof UI_TEXT_TH;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ titleKey, children, icon }) => (
  <div className="bg-slate-700/50 p-4 md:p-6 rounded-lg shadow-lg mb-6">
    <h2 className="text-xl font-semibold mb-3 text-sky-300 text-outline-black flex items-center">
      {icon && <span className="mr-2 text-sky-400">{icon}</span>}
      {UI_TEXT_TH[titleKey]}
    </h2>
    <div className="text-sm text-slate-100 text-outline-black space-y-2">{children}</div>
  </div>
);

const SubSection: React.FC<SectionProps> = ({ titleKey, children }) => (
  <div className="ml-0 md:ml-4 mt-3 mb-2">
    <h3 className="text-md font-medium text-emerald-300 text-outline-black mb-1">{UI_TEXT_TH[titleKey]}</h3>
    <div className="text-sm text-slate-100 text-outline-black space-y-1">{children}</div>
  </div>
);


const GameGuidePage: React.FC<GameGuidePageProps> = ({ onBackToMenu }) => {
  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl text-slate-100">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
        <button onClick={onBackToMenu} className="btn-back">
          &larr; {UI_TEXT_TH.backToMenu}
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-500 flex items-center text-outline-black">
          <BookOpenIcon className="w-8 h-8 mr-3" />
          {UI_TEXT_TH.gameGuideTitle}
        </h1>
        <div className="w-20"> {/* Spacer */} </div>
      </div>

      <div className="max-h-[calc(100vh-200px)] overflow-y-auto app-custom-scrollbar pr-2 md:pr-4">
        <Section titleKey="gameGuide_MainGoal_Title">
          <p>{UI_TEXT_TH.gameGuide_MainGoal_Desc}</p>
        </Section>

        <Section titleKey="gameGuide_Training_Title" icon={<ArrowPathIcon className="w-5 h-5" />}>
          <SubSection titleKey="gameGuide_Training_Modes_Title">
            <p><strong>{UI_TEXT_TH.intervalTraining}:</strong> {UI_TEXT_TH.gameGuide_Training_Modes_Interval_Desc}</p>
            <p><strong>{UI_TEXT_TH.chordTraining}:</strong> {UI_TEXT_TH.gameGuide_Training_Modes_Chord_Desc}</p>
          </SubSection>
          <SubSection titleKey="gameGuide_Training_Difficulty_Title">
            <p>{UI_TEXT_TH.gameGuide_Training_Difficulty_Desc}</p>
          </SubSection>
          <SubSection titleKey="gameGuide_Training_Rewards_Title">
            <p>{UI_TEXT_TH.gameGuide_Training_Rewards_Desc}</p>
          </SubSection>
        </Section>

        <Section titleKey="gameGuide_MonsterLair_Title">
          <p>{UI_TEXT_TH.gameGuide_MonsterLair_Desc}</p>
          <SubSection titleKey="gameGuide_MonsterLair_Rewards_Title">
            <p>{UI_TEXT_TH.gameGuide_MonsterLair_Rewards_Desc}</p>
          </SubSection>
        </Section>

        <Section titleKey="gameGuide_Pets_Title">
          <SubSection titleKey="gameGuide_Pets_Adoption_Title">
            <p>{UI_TEXT_TH.gameGuide_Pets_Adoption_Desc}</p>
          </SubSection>
          <SubSection titleKey="gameGuide_Pets_Care_Title">
            <p>{UI_TEXT_TH.gameGuide_Pets_Care_Desc}</p>
          </SubSection>
          <SubSection titleKey="gameGuide_Pets_Abilities_Title">
            <p>{UI_TEXT_TH.gameGuide_Pets_Abilities_Desc}</p>
          </SubSection>
        </Section>

        <Section titleKey="gameGuide_MyHome_Title">
          <SubSection titleKey="gameGuide_MyHome_Upgrade_Title">
            <p>{UI_TEXT_TH.gameGuide_MyHome_Upgrade_Desc}</p>
          </SubSection>
          <SubSection titleKey="gameGuide_MyHome_Furniture_Title">
            <p>{UI_TEXT_TH.gameGuide_MyHome_Furniture_Desc}</p>
          </SubSection>
          <SubSection titleKey="gameGuide_MyHome_PracticeNook_Title">
            <p>{UI_TEXT_TH.gameGuide_MyHome_PracticeNook_Desc}</p>
          </SubSection>
        </Section>

        <Section titleKey="gameGuide_Missions_Title">
          <p>{UI_TEXT_TH.gameGuide_Missions_Desc}</p>
        </Section>

        <Section titleKey="gameGuide_FreestyleJamRoom_Title">
          <p>{UI_TEXT_TH.gameGuide_FreestyleJamRoom_Desc}</p>
        </Section>

        <Section titleKey="gameGuide_GCoins_Shop_Title">
           <SubSection titleKey="gameGuide_GCoins_Shop_GCoins_Title">
            <p>{UI_TEXT_TH.gameGuide_GCoins_Shop_GCoins_Desc}</p>
          </SubSection>
          <SubSection titleKey="gameGuide_GCoins_Shop_Shop_Title">
            <p>{UI_TEXT_TH.gameGuide_GCoins_Shop_Shop_Desc}</p>
          </SubSection>
          <SubSection titleKey="gameGuide_GCoins_Shop_Unlockables_Title">
            <p>{UI_TEXT_TH.gameGuide_GCoins_Shop_Unlockables_Desc}</p>
          </SubSection>
        </Section>

        <Section titleKey="gameGuide_Progression_Title">
          <SubSection titleKey="gameGuide_Progression_PlayerLevel_Title">
            <p>{UI_TEXT_TH.gameGuide_Progression_PlayerLevel_Desc}</p>
          </SubSection>
          <SubSection titleKey="gameGuide_Progression_Achievements_Title">
            <p>{UI_TEXT_TH.gameGuide_Progression_Achievements_Desc}</p>
          </SubSection>
          <SubSection titleKey="gameGuide_Progression_Monsterpedia_Title">
            <p>{UI_TEXT_TH.gameGuide_Progression_Monsterpedia_Desc}</p>
          </SubSection>
        </Section>

      </div>
    </div>
  );
};

export default GameGuidePage;