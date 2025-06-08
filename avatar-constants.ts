import { FaceId, HairId, SkinColorId, HairColorId, FaceOption, HairOption, SkinColorOption, HairColorOption, ClothingId, ClothingOption } from './types';

export const ALL_FACE_OPTIONS: FaceOption[] = [
  { id: FaceId.FACE_1, nameKey: 'face_FACE_1_name' },
  { id: FaceId.FACE_2, nameKey: 'face_FACE_2_name' },
  { id: FaceId.FACE_3, nameKey: 'face_FACE_3_name' },
];

export const ALL_HAIR_OPTIONS: HairOption[] = [
  { id: HairId.HAIR_1, nameKey: 'hair_HAIR_1_name' },
  { id: HairId.HAIR_2, nameKey: 'hair_HAIR_2_name' },
  { id: HairId.HAIR_3, nameKey: 'hair_HAIR_3_name' },
  { id: HairId.HAIR_4, nameKey: 'hair_HAIR_4_name' },
  { id: HairId.HAIR_5, nameKey: 'hair_HAIR_5_name' },
];

export const ALL_SKIN_COLOR_OPTIONS: SkinColorOption[] = [
  { id: SkinColorId.PALE, nameKey: 'color_PALE_name', hexColor: '#FFEBCD' }, // BlanchedAlmond
  { id: SkinColorId.LIGHT, nameKey: 'color_LIGHT_name', hexColor: '#F5DEB3' }, // Wheat
  { id: SkinColorId.TAN, nameKey: 'color_TAN_name', hexColor: '#D2B48C' },   // Tan
  { id: SkinColorId.MEDIUM, nameKey: 'color_MEDIUM_name', hexColor: '#CD853F' },// Peru
  { id: SkinColorId.DARK, nameKey: 'color_DARK_name', hexColor: '#A0522D' },  // Sienna
];

export const ALL_HAIR_COLOR_OPTIONS: HairColorOption[] = [
  { id: HairColorId.BLACK, nameKey: 'color_BLACK_name', hexColor: '#333333' },
  { id: HairColorId.BROWN, nameKey: 'color_BROWN_name', hexColor: '#A0522D' },
  { id: HairColorId.BLONDE, nameKey: 'color_BLONDE_name', hexColor: '#F0E68C' },
  { id: HairColorId.RED, nameKey: 'color_RED_name', hexColor: '#B22222' },
  { id: HairColorId.BLUE, nameKey: 'color_BLUE_name', hexColor: '#4682B4' },
];
