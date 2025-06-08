import { IntervalInfo, ChordInfo, InstrumentSoundId, InstrumentSoundInfo, UnlockedItemType, ShopItem, FurnitureItem, FurnitureId, ClothingItem, ClothingId, ClothingLayer, MementoDefinition, MementoId, MonsterId, ShopItemId, PetCustomizationItemId, ChildGrowthStage } from './types';
import { mapInstrumentSoundIdToOscillatorType } from './musical-constants';
// Removed: import { BIRTHDAY_CAKE_COST } from './game-settings'; 

export const ALL_INTERVALS: IntervalInfo[] = [
  { id: 'P1', name: 'Perfect Unison', thaiName: 'เพอร์เฟคยูนิซัน', semitones: 0 },
  { id: 'm2', name: 'Minor Second', thaiName: 'ไมเนอร์เซคเคินด์', semitones: 1 },
  { id: 'M2', name: 'Major Second', thaiName: 'เมเจอร์เซคเคินด์', semitones: 2 },
  { id: 'm3', name: 'Minor Third', thaiName: 'ไมเนอร์เทิร์ด', semitones: 3 },
  { id: 'M3', name: 'Major Third', thaiName: 'เมเจอร์เทิร์ด', semitones: 4 },
  { id: 'P4', name: 'Perfect Fourth', thaiName: 'เพอร์เฟคโฟร์ท', semitones: 5 },
  { id: 'TT', name: 'Tritone', thaiName: 'ไทรโทน', semitones: 6 },
  { id: 'P5', name: 'Perfect Fifth', thaiName: 'เพอร์เฟคฟิฟท์', semitones: 7 },
  { id: 'm6', name: 'Minor Sixth', thaiName: 'ไมเนอร์ซิกซ์ท', semitones: 8 },
  { id: 'M6', name: 'Major Sixth', thaiName: 'เมเจอร์ซิกซ์ท', semitones: 9 },
  { id: 'm7', name: 'Minor Seventh', thaiName: 'ไมเนอร์เซเวนท์', semitones: 10 },
  { id: 'M7', name: 'Major Seventh', thaiName: 'เมเจอร์เซเว่นท์', semitones: 11 },
  { id: 'P8', name: 'Perfect Octave', thaiName: 'เพอร์เฟคออกเทฟ', semitones: 12 },
  { id: 'm9', name: 'Minor Ninth', thaiName: 'ไมเนอร์ไนน์ท', semitones: 13, isAdvanced: true, cost: 150 },
  { id: 'M9', name: 'Major Ninth', thaiName: 'เมเจอร์ไนน์ท', semitones: 14, isAdvanced: true, cost: 200 },
  { id: 'P11', name: 'Perfect Eleventh', thaiName: 'เพอร์เฟคอีเลฟเวนท์', semitones: 17, isAdvanced: true, cost: 250 },
];

export const EASY_INTERVALS: IntervalInfo[] = ALL_INTERVALS.filter(i => ['P1', 'M3', 'P5', 'P8', 'M2', 'm3'].includes(i.id) && !i.isAdvanced);
export const MEDIUM_INTERVALS: IntervalInfo[] = ALL_INTERVALS.filter(i => ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'].includes(i.id) && !i.isAdvanced);


export const ALL_CHORDS: ChordInfo[] = [
  { id: 'maj', name: 'Major Triad', thaiName: 'เมเจอร์', semitones: [0, 4, 7] },
  { id: 'min', name: 'Minor Triad', thaiName: 'ไมเนอร์', semitones: [0, 3, 7] },
  { id: 'dim', name: 'Diminished Triad', thaiName: 'ดิมินิชท์', semitones: [0, 3, 6] },
  { id: 'aug', name: 'Augmented Triad', thaiName: 'อ็อกเมนเต็ด', semitones: [0, 4, 8] },
  { id: 'dom7', name: 'Dominant 7th', thaiName: 'โดมิแนนท์เซเว่น', semitones: [0, 4, 7, 10] },
  { id: 'maj7', name: 'Major 7th', thaiName: 'เมเจอร์เซเว่น', semitones: [0, 4, 7, 11] },
  { id: 'min7', name: 'Minor 7th', thaiName: 'ไมเนอร์เซเว่น', semitones: [0, 3, 7, 10] },
  { id: 'maj9', name: 'Major 9th Chord', thaiName: 'เมเจอร์ไนน์ทคอร์ด', semitones: [0, 4, 7, 11, 14], isAdvanced: true, cost: 300 },
  { id: 'min9', name: 'Minor 9th Chord', thaiName: 'ไมเนอร์ไนน์ทคอร์ด', semitones: [0, 3, 7, 10, 14], isAdvanced: true, cost: 300 },
  { id: 'dom9', name: 'Dominant 9th Chord', thaiName: 'โดมิแนนท์ไนน์ทคอร์ด', semitones: [0, 4, 7, 10, 14], isAdvanced: true, cost: 350 },
];

export const EASY_CHORDS: ChordInfo[] = ALL_CHORDS.filter(c => ['maj', 'min', 'dom7'].includes(c.id) && !c.isAdvanced);
export const MEDIUM_CHORDS: ChordInfo[] = ALL_CHORDS.filter(c => ['maj', 'min', 'dim', 'aug', 'dom7', 'maj7', 'min7'].includes(c.id) && !c.isAdvanced);

export const ALL_INSTRUMENT_SOUNDS: InstrumentSoundInfo[] = [
  { id: InstrumentSoundId.SINE, nameKey: 'instrumentSoundSine', cost: 0, isDefault: true },
  { id: InstrumentSoundId.SQUARE, nameKey: 'instrumentSoundSquare', cost: 250 },
  { id: InstrumentSoundId.TRIANGLE, nameKey: 'instrumentSoundTriangle', cost: 250 },
];

const instrumentSoundShopItems: ShopItem[] = ALL_INSTRUMENT_SOUNDS
  .filter(sound => !sound.isDefault)
  .map(sound => ({
    id: sound.id,
    nameKey: sound.nameKey,
    descriptionKey: sound.nameKey, 
    cost: sound.cost,
    type: UnlockedItemType.INSTRUMENT_SOUND,
    icon: 'SpeakerWaveIcon', 
    data: mapInstrumentSoundIdToOscillatorType(sound.id),
  }));

export const ALL_MEMENTOS: MementoDefinition[] = [
  { id: MementoId.SLIME_ESSENCE, nameKey: 'memento_SLIME_ESSENCE_name', descriptionKey: 'memento_SLIME_ESSENCE_desc', iconComponent: 'MementoIconPlaceholder', monsterId: MonsterId.MONO_NOTE_SLIME },
  { id: MementoId.CRACKER_TOOTH, nameKey: 'memento_CRACKER_TOOTH_name', descriptionKey: 'memento_CRACKER_TOOTH_desc', iconComponent: 'MementoIconPlaceholder', monsterId: MonsterId.CHORD_CRACKER },
  { id: MementoId.IMP_HORN, nameKey: 'memento_IMP_HORN_name', descriptionKey: 'memento_IMP_HORN_desc', iconComponent: 'MementoIconPlaceholder', monsterId: MonsterId.INTERVAL_IMP },
  { id: MementoId.RHYTHM_CORE, nameKey: 'memento_RHYTHM_CORE_name', descriptionKey: 'memento_RHYTHM_CORE_desc', iconComponent: 'MementoIconPlaceholder', monsterId: MonsterId.RHYTHM_LORD },
  { id: MementoId.SIREN_SCALE, nameKey: 'memento_SIREN_SCALE_name', descriptionKey: 'memento_SIREN_SCALE_desc', iconComponent: 'MementoIconPlaceholder', monsterId: MonsterId.HARMONY_SIREN },
  { id: MementoId.PHANTOM_ECHO_STONE, nameKey: 'memento_PHANTOM_ECHO_STONE_name', descriptionKey: 'memento_PHANTOM_ECHO_STONE_desc', iconComponent: 'MementoIconPlaceholder', monsterId: MonsterId.ECHOING_PHANTOM },
  { id: MementoId.CHROMATIC_CRYSTAL, nameKey: 'memento_CHROMATIC_CRYSTAL_name', descriptionKey: 'memento_CHROMATIC_CRYSTAL_desc', iconComponent: 'MementoIconPlaceholder', monsterId: MonsterId.CHROMATIC_ABERRATION },
  { id: MementoId.TITAN_CHORD_FRAGMENT, nameKey: 'memento_TITAN_CHORD_FRAGMENT_name', descriptionKey: 'memento_TITAN_CHORD_FRAGMENT_desc', iconComponent: 'MementoIconPlaceholder', monsterId: MonsterId.CHORDAL_TITAN },
  { id: MementoId.BEHEMOTH_VOICEBOX, nameKey: 'memento_BEHEMOTH_VOICEBOX_name', descriptionKey: 'memento_BEHEMOTH_VOICEBOX_desc', iconComponent: 'MementoIconPlaceholder', monsterId: MonsterId.POLYPHONIC_BEHEMOTH },
  { id: MementoId.ASCENDANT_AURA_SHARD, nameKey: 'memento_ASCENDANT_AURA_SHARD_name', descriptionKey: 'memento_ASCENDANT_AURA_SHARD_desc', iconComponent: 'MementoIconPlaceholder', monsterId: MonsterId.AURAL_ASCENDANT },
];

export const ALL_CLOTHING_ITEMS: ClothingItem[] = [
  { id: ClothingId.BASIC_SHIRT_RED, nameKey: 'clothing_BASIC_SHIRT_RED_name', descriptionKey: 'clothing_BASIC_SHIRT_RED_desc', layer: ClothingLayer.SHIRT, cost: 100, type: UnlockedItemType.CLOTHING, iconComponent: 'ShirtIcon', color: '#EF4444' },
  { id: ClothingId.BASIC_SHIRT_BLUE, nameKey: 'clothing_BASIC_SHIRT_BLUE_name', descriptionKey: 'clothing_BASIC_SHIRT_BLUE_desc', layer: ClothingLayer.SHIRT, cost: 100, type: UnlockedItemType.CLOTHING, iconComponent: 'ShirtIcon', color: '#3B82F6' },
  { id: ClothingId.BASIC_SHIRT_GREEN, nameKey: 'clothing_BASIC_SHIRT_GREEN_name', descriptionKey: 'clothing_BASIC_SHIRT_GREEN_desc', layer: ClothingLayer.SHIRT, cost: 100, type: UnlockedItemType.CLOTHING, iconComponent: 'ShirtIcon', color: '#22C55E' },
];

export const ALL_FURNITURE_ITEMS: FurnitureItem[] = [
  { id: FurnitureId.GRAND_PIANO, nameKey: 'furniture_GP_001_name', descriptionKey: 'furniture_GP_001_desc', effectDescriptionKey: 'furniture_GP_001_effectDesc', cost: 2000, type: UnlockedItemType.FURNITURE, iconComponent: 'PianoIcon' },
  { id: FurnitureId.MUSIC_THEORY_SHELF, nameKey: 'furniture_MTS_001_name', descriptionKey: 'furniture_MTS_001_desc', effectDescriptionKey: 'furniture_MTS_001_effectDesc', cost: 1500, type: UnlockedItemType.FURNITURE, iconComponent: 'BookshelfIcon' },
  { id: FurnitureId.COMFY_PET_BED, nameKey: 'furniture_CPB_001_name', descriptionKey: 'furniture_CPB_001_desc', effectDescriptionKey: 'furniture_CPB_001_effectDesc', cost: 800, type: UnlockedItemType.FURNITURE, iconComponent: 'PetBedIcon' },
];

export const PET_CUSTOMIZATION_ITEMS: ShopItem[] = [
    { id: PetCustomizationItemId.COLLAR_RED, nameKey: 'petCustomizationColorRed', descriptionKey: 'petCustomizationColorRed', cost: 150, type: UnlockedItemType.PET_CUSTOMIZATION, icon: 'ShirtIcon', data: { color: '#EF4444' } },
    { id: PetCustomizationItemId.COLLAR_BLUE, nameKey: 'petCustomizationColorBlue', descriptionKey: 'petCustomizationColorBlue', cost: 150, type: UnlockedItemType.PET_CUSTOMIZATION, icon: 'ShirtIcon', data: { color: '#3B82F6' } },
    { id: PetCustomizationItemId.COLLAR_GREEN, nameKey: 'petCustomizationColorGreen', descriptionKey: 'petCustomizationColorGreen', cost: 150, type: UnlockedItemType.PET_CUSTOMIZATION, icon: 'ShirtIcon', data: { color: '#22C55E' } },
];


export const PET_FOOD_ID = 'BUDDY_BITES_FOOD';
export const PET_FOOD_COST = 30;
export const PET_FOOD_HUNGER_VALUE = 40;

export const PET_FOOD_ITEM: ShopItem = {
  id: PET_FOOD_ID,
  nameKey: 'petFoodName',
  descriptionKey: 'petFoodDescription',
  cost: PET_FOOD_COST,
  type: UnlockedItemType.PET_FOOD,
  icon: 'FoodBowlIcon',
  data: { hungerValue: PET_FOOD_HUNGER_VALUE },
};

// Define BIRTHDAY_CAKE_COST here
export const BIRTHDAY_CAKE_COST = 75;

export const HEART_NOTE_LOCKET_SHOP_ITEM_DEF: ShopItem = { id: ShopItemId.HEART_NOTE_LOCKET, nameKey: 'shopItem_HEART_NOTE_LOCKET_name', descriptionKey: 'shopItem_HEART_NOTE_LOCKET_desc', cost: 500, type: UnlockedItemType.KEY_ITEM, icon: 'HeartIcon' };
export const WEDDING_RING_SHOP_ITEM_DEF: ShopItem = { id: ShopItemId.WEDDING_RING, nameKey: 'shopItem_WEDDING_RING_name', descriptionKey: 'shopItem_WEDDING_RING_desc', cost: 1000, type: UnlockedItemType.KEY_ITEM, icon: 'HeartIcon' };
export const BABY_CRIB_SHOP_ITEM_DEF: ShopItem = { id: ShopItemId.BABY_CRIB, nameKey: 'shopItem_BABY_CRIB_name', descriptionKey: 'shopItem_BABY_CRIB_desc', cost: 1200, type: UnlockedItemType.KEY_ITEM, icon: 'BabyIcon' };
export const MILK_POWDER_SHOP_ITEM_DEF: ShopItem = { id: ShopItemId.MILK_POWDER, nameKey: 'shopItem_MILK_POWDER_name', descriptionKey: 'shopItem_MILK_POWDER_desc', cost: 50, type: UnlockedItemType.CHILD_CARE, icon: 'FoodBowlIcon', data: { hungerValue: 30, forStage: [ChildGrowthStage.INFANT, ChildGrowthStage.CRAWLER] } };
export const BABY_FOOD_SHOP_ITEM_DEF: ShopItem = { id: ShopItemId.BABY_FOOD, nameKey: 'shopItem_BABY_FOOD_name', descriptionKey: 'shopItem_BABY_FOOD_desc', cost: 70, type: UnlockedItemType.CHILD_CARE, icon: 'FoodBowlIcon', data: { hungerValue: 40, forStage: [ChildGrowthStage.CRAWLER, ChildGrowthStage.TODDLER] } };
export const DIAPERS_SHOP_ITEM_DEF: ShopItem = { id: ShopItemId.DIAPERS, nameKey: 'shopItem_DIAPERS_name', descriptionKey: 'shopItem_DIAPERS_desc', cost: 30, type: UnlockedItemType.CHILD_CARE, icon: 'DiaperIcon', data: { cleanlinessValue: 80 } };
export const CHILD_CARE_KIT_SHOP_ITEM_DEF: ShopItem = { id: ShopItemId.CHILD_CARE_KIT, nameKey: 'shopItem_CHILD_CARE_KIT_name', descriptionKey: 'shopItem_CHILD_CARE_KIT_desc', cost: 150, type: UnlockedItemType.CHILD_CARE, icon: 'SickIcon', data: { happinessBoost: 20 } };
export const BIRTHDAY_CAKE_SHOP_ITEM_DEF: ShopItem = { id: ShopItemId.BIRTHDAY_CAKE, nameKey: 'shopItem_BIRTHDAY_CAKE_name', descriptionKey: 'shopItem_BIRTHDAY_CAKE_desc', cost: BIRTHDAY_CAKE_COST, type: UnlockedItemType.GENERAL_GIFT, icon: 'CakeIcon' };

export const HEART_NOTE_LOCKET_COST = HEART_NOTE_LOCKET_SHOP_ITEM_DEF.cost;
export const WEDDING_RING_COST = WEDDING_RING_SHOP_ITEM_DEF.cost;

export const GENERAL_GIFT_ITEMS: ShopItem[] = [
    { id: ShopItemId.FLOWER_BOUQUET, nameKey: 'shopItem_FLOWER_BOUQUET_name', descriptionKey: 'shopItem_FLOWER_BOUQUET_desc', cost: 100, type: UnlockedItemType.GENERAL_GIFT, icon: 'GiftIcon' },
    { id: ShopItemId.CHOCOLATE_BOX, nameKey: 'shopItem_CHOCOLATE_BOX_name', descriptionKey: 'shopItem_CHOCOLATE_BOX_desc', cost: 150, type: UnlockedItemType.GENERAL_GIFT, icon: 'GiftIcon' },
    { id: ShopItemId.SPICY_SNACKS, nameKey: 'shopItem_SPICY_SNACKS_name', descriptionKey: 'shopItem_SPICY_SNACKS_desc', cost: 80, type: UnlockedItemType.GENERAL_GIFT, icon: 'GiftIcon' },
    { id: ShopItemId.OLD_BOOK, nameKey: 'shopItem_OLD_BOOK_name', descriptionKey: 'shopItem_OLD_BOOK_desc', cost: 200, type: UnlockedItemType.GENERAL_GIFT, icon: 'GiftIcon' },
    { id: ShopItemId.TEA_SET, nameKey: 'shopItem_TEA_SET_name', descriptionKey: 'shopItem_TEA_SET_desc', cost: 250, type: UnlockedItemType.GENERAL_GIFT, icon: 'GiftIcon' },
    { id: ShopItemId.HANDMADE_COOKIE, nameKey: 'shopItem_HANDMADE_COOKIE_name', descriptionKey: 'shopItem_HANDMADE_COOKIE_desc', cost: 120, type: UnlockedItemType.GENERAL_GIFT, icon: 'GiftIcon' },
    BIRTHDAY_CAKE_SHOP_ITEM_DEF,
];

export const BASE_SHOP_ITEMS: ShopItem[] = [
  ...instrumentSoundShopItems,
  PET_FOOD_ITEM,
  ...PET_CUSTOMIZATION_ITEMS,
  ...(ALL_FURNITURE_ITEMS.map(f => ({ 
    id: f.id, 
    nameKey: f.nameKey, 
    descriptionKey: f.descriptionKey, 
    cost: f.cost, 
    type: UnlockedItemType.FURNITURE as UnlockedItemType.FURNITURE, 
    icon: f.iconComponent, 
    data: f 
  }))),
  // Clothing items are removed from the shop here:
  // ...(ALL_CLOTHING_ITEMS.map(c => ({ 
  //   id: c.id, 
  //   nameKey: c.nameKey, 
  //   descriptionKey: c.descriptionKey, 
  //   cost: c.cost, 
  //   type: UnlockedItemType.CLOTHING as UnlockedItemType.CLOTHING,
  //   icon: c.iconComponent, 
  //   data: { layer: c.layer, color: c.color } 
  // }))),
  HEART_NOTE_LOCKET_SHOP_ITEM_DEF,
  WEDDING_RING_SHOP_ITEM_DEF,
  BABY_CRIB_SHOP_ITEM_DEF,
  MILK_POWDER_SHOP_ITEM_DEF,
  BABY_FOOD_SHOP_ITEM_DEF,
  DIAPERS_SHOP_ITEM_DEF,
  CHILD_CARE_KIT_SHOP_ITEM_DEF,
  ...GENERAL_GIFT_ITEMS,
];
