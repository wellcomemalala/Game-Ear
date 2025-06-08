
import { PetId, PetDefinition, PetAbilityType, ActivePet } from './types';

export const MAX_PET_LEVEL = 10;
export const PET_EVOLUTION_LEVEL_DEFAULT = 5;

export const PET_DEFINITIONS: PetDefinition[] = [
  {
    id: PetId.KAKI,
    nameKey: 'petKakiName',
    iconComponent: 'PetIcon',
    cost: 500,
    descriptionKey: 'petKakiDescription',
    ability: {
      type: PetAbilityType.PET_XP_BOOST,
      value: 1.1,
      descriptionKey: 'petAbilityDesc_PET_XP_BOOST',
      condition: (pet: ActivePet) => pet.level >= 3,
    },
    evolvesTo: PetId.KAKI_EVO1,
    evolutionLevel: PET_EVOLUTION_LEVEL_DEFAULT,
  },
  {
    id: PetId.PLANIN,
    nameKey: 'petPlaninName',
    iconComponent: 'PetIcon',
    cost: 750,
    descriptionKey: 'petPlaninDescription',
    ability: {
      type: PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES,
      value: 0.05,
      descriptionKey: 'petAbilityDesc_GCOIN_DISCOUNT_UNLOCKABLES',
      condition: (pet: ActivePet) => pet.level >= 5,
    },
    evolvesTo: PetId.PLANIN_EVO1,
    evolutionLevel: PET_EVOLUTION_LEVEL_DEFAULT,
  },
  {
    id: PetId.MOOTOD,
    nameKey: 'petMootodName',
    iconComponent: 'PetIcon',
    cost: 750,
    descriptionKey: 'petMootodDescription',
    ability: {
      type: PetAbilityType.XP_BOOST_TRAINING,
      value: 1.05,
      descriptionKey: 'petAbilityDesc_XP_BOOST_TRAINING',
      condition: (pet: ActivePet) => pet.level >= 5,
    },
    evolvesTo: PetId.MOOTOD_EVO1,
    evolutionLevel: PET_EVOLUTION_LEVEL_DEFAULT,
  },
  {
    id: PetId.KAKI_EVO1,
    nameKey: 'petKakiEvo1Name',
    iconComponent: 'KakiEvo1Icon',
    cost: 0,
    descriptionKey: 'petKakiEvo1Description',
    ability: {
      type: PetAbilityType.PET_XP_BOOST,
      value: 1.2,
      descriptionKey: 'petAbilityDesc_PET_XP_BOOST',
      condition: (pet: ActivePet) => pet.level >= 3,
    },
  },
  {
    id: PetId.PLANIN_EVO1,
    nameKey: 'petPlaninEvo1Name',
    iconComponent: 'PlaninEvo1Icon',
    cost: 0,
    descriptionKey: 'petPlaninEvo1Description',
    ability: {
      type: PetAbilityType.GCOIN_DISCOUNT_UNLOCKABLES,
      value: 0.08,
      descriptionKey: 'petAbilityDesc_GCOIN_DISCOUNT_UNLOCKABLES',
      condition: (pet: ActivePet) => pet.level >= 5,
    },
  },
  {
    id: PetId.MOOTOD_EVO1,
    nameKey: 'petMootodEvo1Name',
    iconComponent: 'MootodEvo1Icon',
    cost: 0,
    descriptionKey: 'petMootodEvo1Description',
    ability: {
      type: PetAbilityType.XP_BOOST_TRAINING,
      value: 1.08,
      descriptionKey: 'petAbilityDesc_XP_BOOST_TRAINING',
      condition: (pet: ActivePet) => pet.level >= 5,
    },
  },
];

export const PET_ADOPTION_COST = 500; // Note: Individual pet costs are in PET_DEFINITIONS
export const MAX_PET_HUNGER = 100;
export const PET_HUNGER_DECAY_PER_HOUR = 5;
// PET_FOOD_HUNGER_VALUE, PET_FOOD_COST, PET_FOOD_ID are in item-definitions.ts via PET_FOOD_ITEM
export const PET_XP_PER_CORRECT_ANSWER = 2;
export const PET_XP_PER_FEEDING = 10;
export const PET_XP_PER_DAILY_LOGIN = 15;
export const PET_LEVEL_THRESHOLDS = [0, 50, 120, 200, 300, 450, 600, 800, 1000, 1250, 1500]; // Level 0 to 10
export const MAX_PET_HAPPINESS = 100;
export const HAPPINESS_PER_FEEDING = 20;
export const HAPPINESS_PER_PLAY = 25;
export const HAPPINESS_DECAY_ON_HUNGER_DROP = 5;
export const PET_PLAY_COOLDOWN_HOURS = 2;
export const PET_INTERACTION_ACHIEVEMENT_MILESTONE = 10;
export const PET_BOREDOM_THRESHOLD_HOURS = 6;
export const HAPPINESS_DECAY_ON_BOREDOM = 2;
export const PET_SPECIAL_REQUEST_CHANCE = 0.1; // Per updatePetStatePeriodic tick (e.g. per minute)
export const PET_SPECIAL_REQUEST_REWARD_XP = 25;
export const PET_SPECIAL_REQUEST_REWARD_HAPPINESS = 30;
export const PET_SPECIAL_REQUEST_REWARD_XP_EVOLVED = Math.round(PET_SPECIAL_REQUEST_REWARD_XP * 1.5);
export const PET_SPECIAL_REQUEST_REWARD_HAPPINESS_EVOLVED = Math.round(PET_SPECIAL_REQUEST_REWARD_HAPPINESS * 1.2);

// Added missing constants
export const PET_SPECIAL_REQUEST_TIMEOUT_HOURS = 24;
export const PET_HAPPINESS_PENALTY_REQUEST_TIMEOUT = 10;
export const PET_MIN_HAPPINESS_FOR_ABILITY = 30;
export const PET_MIN_HAPPINESS_FOR_REQUEST = 50;
