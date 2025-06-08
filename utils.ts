
import { IntervalInfo, ChordInfo, ThaiUIText, Difficulty, PlayerData, GameMode, UnlockedItemType, InstrumentSoundId, PetId, NPCId, QuestId, QuestDefinition, FurnitureId, ClothingId, ClothingItem, MonsterId, MementoId, MissionId, MissionDefinition, FurnitureItem, MonsterDefinition, MementoDefinition } from './types';
import { UI_TEXT_TH } from './ui-text';
import { ALL_INSTRUMENT_SOUNDS, EASY_INTERVALS, EASY_CHORDS, ALL_CLOTHING_ITEMS, ALL_FURNITURE_ITEMS } from './item-definitions';
import { PET_DEFINITIONS } from './pet-constants';
import { MISSION_DEFINITIONS, ALL_MONSTERS, QUEST_DEFINITIONS } from './game-settings';
import { ALL_MEMENTOS } from './item-definitions'; // Mementos are in item-definitions

export function shuffleArray<T,>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const getDifficultyText = (difficulty: Difficulty | null, mode?: GameMode | null): string => {
    if (!difficulty) return '';
    if (mode === GameMode.MELODY_RECALL) {
        switch(difficulty) {
            case Difficulty.EASY: return UI_TEXT_TH.easy.replace('(3 โน้ต)', '').trim() + ' (3 โน้ต)';
            case Difficulty.MEDIUM: return UI_TEXT_TH.medium.replace('(4 โน้ต)', '').trim() + ' (4 โน้ต)';
            case Difficulty.HARD: return UI_TEXT_TH.hard.replace('(5 โน้ต)', '').trim() + ' (5 โน้ต)';
            default: return '';
        }
    }
    switch(difficulty) {
        case Difficulty.EASY: return UI_TEXT_TH.easy.replace(/\s\(.*?\)/g, '').trim();
        case Difficulty.MEDIUM: return UI_TEXT_TH.medium.replace(/\s\(.*?\)/g, '').trim();
        case Difficulty.HARD: return UI_TEXT_TH.hard.replace(/\s\(.*?\)/g, '').trim();
        default: return '';
    }
}

export function isMusicalItemUnlocked(itemId: string, itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD, playerData: PlayerData): boolean {
  return playerData.unlockedMusicalItemIds.some(item => item.id === itemId && item.type === itemType);
}

export function getAvailableTrainingItems<T extends { id: string; isAdvanced?: boolean }>(
  allItems: T[],
  playerData: PlayerData,
  itemType: UnlockedItemType.INTERVAL | UnlockedItemType.CHORD
): T[] {
  const items = allItems.filter(item => !item.isAdvanced || isMusicalItemUnlocked(item.id, itemType, playerData));
  if(items.length === 0 && itemType === UnlockedItemType.INTERVAL) return EASY_INTERVALS as unknown as T[]; // Cast needed due to generic T
  if(items.length === 0 && itemType === UnlockedItemType.CHORD) return EASY_CHORDS as unknown as T[]; // Cast needed due to generic T
  return items;
}

export function getInstrumentSoundName(soundId: InstrumentSoundId, uiText: ThaiUIText): string {
  const soundInfo = ALL_INSTRUMENT_SOUNDS.find(s => s.id === soundId);
  return soundInfo ? uiText[soundInfo.nameKey] : "Unknown Sound";
}

export function getPetName(petId: PetId | undefined | null, uiText: ThaiUIText): string {
  if (!petId) return "";
  const petInfo = PET_DEFINITIONS.find(p => p.id === petId);
  if (petInfo && petInfo.nameKey && uiText[petInfo.nameKey]) {
    return uiText[petInfo.nameKey];
  } else if (petInfo) {
    return petInfo.id.toString();
  }
  return "Pet";
}

export function getHouseLevelName(level: number, uiText: ThaiUIText): string {
  switch (level) {
    case 0: return uiText.houseLevel0Name;
    case 1: return uiText.houseLevel1Name;
    case 2: return uiText.houseLevel2Name;
    case 3: return uiText.houseLevel3Name;
    default: return `Level ${level}`;
  }
}

export function getFurnitureItemDetails(furnitureId: FurnitureId): FurnitureItem | undefined {
    return ALL_FURNITURE_ITEMS.find(f => f.id === furnitureId);
}

export function formatTime(ms: number): string {
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    let timeString = "";
    if (hours > 0) {
        timeString += `${hours} ชั่วโมง `;
    }
    if (minutes > 0 || hours > 0) {
        timeString += `${minutes} นาที `;
    }
    if (hours === 0 && minutes === 0 ) {
         timeString += `${seconds} วินาที`;
    }
    return timeString.trim();
}

export function getMissionDefinition(missionId: MissionId): MissionDefinition | undefined {
    return MISSION_DEFINITIONS.find(def => def.id === missionId);
}

export function getMonsterDefinition(monsterId: MonsterId): MonsterDefinition | undefined {
    return ALL_MONSTERS.find(def => def.id === monsterId);
}

export function getMementoDefinition(mementoId: MementoId): MementoDefinition | undefined {
    return ALL_MEMENTOS.find(def => def.id === mementoId);
}

export function getNPCName(npcId: NPCId, uiText: ThaiUIText): string {
    switch(npcId) {
        case NPCId.MUSIC_MASTER: return uiText.npc_MUSIC_MASTER_name;
        case NPCId.MEMENTO_COLLECTOR: return uiText.npc_MEMENTO_COLLECTOR_name;
        case NPCId.ZALAY_BEAT: return uiText.npc_ZALAY_BEAT_name;
        case NPCId.MELODIE: return uiText.npc_MELODIE_name;
        case NPCId.RHYTHM: return uiText.npc_RHYTHM_name;
        case NPCId.HARMONIE: return uiText.npc_HARMONIE_name;
        default:
          // This exhaustive check will cause a type error if a case is missed.
          // const _exhaustiveCheck: never = npcId;
          // console.warn(`NPC name not found for ID: ${npcId}`);
          return "NPC ไม่ทราบชื่อ";
    }
}

export function getQuestDefinition(questId: QuestId): QuestDefinition | undefined {
    return QUEST_DEFINITIONS.find(def => def.id === questId);
}

export function getQuestTitle(questId: QuestId, uiText: ThaiUIText): string {
    const definition = getQuestDefinition(questId);
    return definition ? uiText[definition.titleKey] : "Quest";
}

export function getClothingItem(clothingId?: ClothingId): ClothingItem | undefined {
  if (!clothingId) return undefined;
  return ALL_CLOTHING_ITEMS.find(item => item.id === clothingId);
}
