
import { NPCId, NPCDefinition, ThaiUIText, GiftPreferenceLevel, ShopItemId } from './types';

// Emojis for portraits
const MELODIE_PORTRAIT_EMOJI = '😊';
const RHYTHM_PORTRAIT_EMOJI = '😎';
const HARMONIE_PORTRAIT_EMOJI = '🌙';

export const ALL_NPC_DEFINITIONS: NPCDefinition[] = [
  {
    id: NPCId.MUSIC_MASTER,
    nameKey: 'npc_MUSIC_MASTER_name',
    portraitUrl: 'https://via.placeholder.com/128/808080/FFFFFF?Text=Master', 
    personalitySnippetKey: 'npcMusicMasterPersonalitySnippet',
    likesSnippetKey: 'npcMusicMasterLikesSnippet',
    goalSnippetKey: 'npcMusicMasterGoalSnippet',
  },
  {
    id: NPCId.MEMENTO_COLLECTOR,
    nameKey: 'npc_MEMENTO_COLLECTOR_name',
    portraitUrl: 'https://via.placeholder.com/128/A52A2A/FFFFFF?Text=Collector', 
    personalitySnippetKey: 'npcMementoCollectorPersonalitySnippet',
    likesSnippetKey: 'npcMementoCollectorLikesSnippet',
    goalSnippetKey: 'npcMementoCollectorGoalSnippet',
  },
    {
    id: NPCId.ZALAY_BEAT,
    nameKey: 'npc_ZALAY_BEAT_name',
    portraitUrl: 'https://via.placeholder.com/128/ADD8E6/000000?Text=Zalay', 
    personalitySnippetKey: 'npcZalayBeatPersonalitySnippet',
    likesSnippetKey: 'npcZalayBeatLikesSnippet',
    goalSnippetKey: 'npcZalayBeatGoalSnippet',
  },
  {
    id: NPCId.MELODIE,
    nameKey: 'npc_MELODIE_name',
    portraitUrl: MELODIE_PORTRAIT_EMOJI,
    personalitySnippetKey: 'npcMelodiePersonalitySnippet',
    likesSnippetKey: 'npcMelodieLikesSnippet',
    goalSnippetKey: 'npcMelodieGoalSnippet',
    giftPreferences: {
        [ShopItemId.FLOWER_BOUQUET]: GiftPreferenceLevel.LIKED,
        [ShopItemId.CHOCOLATE_BOX]: GiftPreferenceLevel.LIKED,
        [ShopItemId.HANDMADE_COOKIE]: GiftPreferenceLevel.LOVED, // Assuming cookies are very special for her
        [ShopItemId.SPICY_SNACKS]: GiftPreferenceLevel.DISLIKED,
        [ShopItemId.OLD_BOOK]: GiftPreferenceLevel.NEUTRAL,
        [ShopItemId.TEA_SET]: GiftPreferenceLevel.LIKED,
    },
    birthday: { month: 3, day: 14 } // Example: March 14th
  },
  {
    id: NPCId.RHYTHM,
    nameKey: 'npc_RHYTHM_name',
    portraitUrl: RHYTHM_PORTRAIT_EMOJI,
    personalitySnippetKey: 'npcRhythmPersonalitySnippet',
    likesSnippetKey: 'npcRhythmLikesSnippet',
    goalSnippetKey: 'npcRhythmGoalSnippet',
    giftPreferences: {
        [ShopItemId.SPICY_SNACKS]: GiftPreferenceLevel.LIKED,
        [ShopItemId.FLOWER_BOUQUET]: GiftPreferenceLevel.NEUTRAL,
        [ShopItemId.CHOCOLATE_BOX]: GiftPreferenceLevel.NEUTRAL,
        [ShopItemId.OLD_BOOK]: GiftPreferenceLevel.DISLIKED,
        [ShopItemId.TEA_SET]: GiftPreferenceLevel.DISLIKED,
        [ShopItemId.HANDMADE_COOKIE]: GiftPreferenceLevel.LIKED,
    },
    birthday: { month: 7, day: 22 } // Example: July 22nd
  },
  {
    id: NPCId.HARMONIE,
    nameKey: 'npc_HARMONIE_name',
    portraitUrl: HARMONIE_PORTRAIT_EMOJI,
    personalitySnippetKey: 'npcHarmoniePersonalitySnippet',
    likesSnippetKey: 'npcHarmonieLikesSnippet',
    goalSnippetKey: 'npcHarmonieGoalSnippet',
    giftPreferences: {
        [ShopItemId.OLD_BOOK]: GiftPreferenceLevel.LIKED,
        [ShopItemId.TEA_SET]: GiftPreferenceLevel.LIKED,
        [ShopItemId.FLOWER_BOUQUET]: GiftPreferenceLevel.NEUTRAL,
        [ShopItemId.CHOCOLATE_BOX]: GiftPreferenceLevel.DISLIKED,
        [ShopItemId.SPICY_SNACKS]: GiftPreferenceLevel.DISLIKED,
        [ShopItemId.HANDMADE_COOKIE]: GiftPreferenceLevel.NEUTRAL,
    },
    birthday: { month: 11, day: 5 } // Example: November 5th
  },
];

export const getNPCDefinition = (npcId: NPCId): NPCDefinition | undefined => {
  return ALL_NPC_DEFINITIONS.find(def => def.id === npcId);
};

// RP Event Thresholds
export const RP_THRESHOLD_EVENT_1 = 25;
export const RP_THRESHOLD_EVENT_2 = 50;
export const RP_THRESHOLD_EVENT_3 = 75;

// Event IDs (example)
export const getNPCEventId = (npcId: NPCId, eventLevel: 1 | 2 | 3): string => {
    return `${npcId}_RP_EVENT_${eventLevel}`;
}

// Distant Dialogue Thresholds
export const RP_LOW_THRESHOLD_FOR_DISTANT_DIALOGUE = 10;
export const DAYS_FOR_DISTANT_DIALOGUE_NO_INTERACTION = 7; // Days
