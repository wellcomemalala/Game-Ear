
import { FurnitureId, NPCId, ThaiUIText } from './types'; // Added NPCId and ThaiUIText

// Re-export from musical-constants.ts
export * from './musical-constants';

// Re-export from item-definitions.ts
// This will export BASE_SHOP_ITEMS, ALL_MEMENTOS, ALL_CLOTHING_ITEMS etc.
export * from './item-definitions';

// Re-export from pet-constants.ts
export * from './pet-constants';

// Re-export from game-settings.ts
// This will export SHOP_ITEMS, INITIAL_PLAYER_DATA, etc.
export * from './game-settings';

// Re-export from ui-text.ts
export * from './ui-text';

// Re-export from utils.ts
export * from './utils';

// Re-export from npc-definitions.ts
export * from './npc-definitions';

// Re-export from avatar-constants.ts (New)
export * from './avatar-constants';

// Re-export all enums from enum-types.ts
export * from './enum-types';

// Export FurnitureId directly for consistent usage
export { FurnitureId };


export {
    SPOUSAL_BONUS_PRACTICE_NOOK_COOLDOWN_REDUCTION_MELODIE,
    SPOUSAL_BONUS_GCOIN_CHANCE_RHYTHM,
    SPOUSAL_BONUS_GCOIN_AMOUNT_RHYTHM,
    SPOUSAL_BONUS_MEMENTO_DROP_RATE_INCREASE_HARMONIE,
    MAX_DATING_RP,
    INITIAL_MARRIAGE_HAPPINESS,
    MAX_MARRIAGE_HAPPINESS, // Added here
    MARRIAGE_HAPPINESS_DECAY_THRESHOLD_DAYS,
    MARRIAGE_HAPPINESS_DECAY_AMOUNT,
    MARRIAGE_HAPPINESS_GAIN_INTERACTION,
    MARRIAGE_HAPPINESS_GAIN_GIFT,
    MARRIAGE_HAPPINESS_SICK_AT_HEART_THRESHOLD,
    RP_GAIN_GIFT_LOVED,
    RP_GAIN_GIFT_LIKED,
    RP_GAIN_GIFT_NEUTRAL,
    RP_CHANGE_GIFT_DISLIKED,
    // Family System Constants
    BABY_CRIB_COST,
    MILK_POWDER_COST,
    BABY_FOOD_COST,
    DIAPERS_COST,
    CHILD_INITIAL_HAPPINESS,
    MAX_CHILD_HAPPINESS,
    CHILD_HAPPINESS_DECAY_RATE,
    CHILD_INITIAL_HUNGER,
    MAX_CHILD_HUNGER,
    CHILD_HUNGER_DECAY_RATE,
    CHILD_INITIAL_CLEANLINESS,
    MAX_CHILD_CLEANLINESS,
    CHILD_CLEANLINESS_DECAY_RATE,
    CHILD_INITIAL_AFFECTION,
    MAX_CHILD_AFFECTION,
    CHILD_AFFECTION_NEED_RATE,
    CHILD_GROWTH_DAYS_INFANT_TO_CRAWLER,
    CHILD_GROWTH_DAYS_CRAWLER_TO_TODDLER,
} from './game-settings';
