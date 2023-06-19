export interface UnoCardItem {
  type: UnoCardType;
  color: UnoColorType;
  picked?: UnoColorType;
}

export enum UnoCardType {
  N_1 = 1,
  N_2 = 2,
  N_3 = 3,
  N_4 = 4,
  N_5 = 5,
  N_6 = 6,
  N_7 = 7,
  N_8 = 8,
  N_9 = 9,
  REVERSE = 30,
  SKIP = 31,
  DRAW_2 = 42,
  PICK = 100,
  PICK_DRAW_4 = 101
}

export const UnoColoredTypes: UnoCardType[] = [UnoCardType.N_1, UnoCardType.N_2, UnoCardType.N_3, UnoCardType.N_4, UnoCardType.N_5, UnoCardType.N_6, UnoCardType.N_7, UnoCardType.N_8, UnoCardType.N_9, UnoCardType.REVERSE, UnoCardType.SKIP, UnoCardType.DRAW_2];
export const UnoSpecialTypes: UnoCardType[] = [UnoCardType.PICK, UnoCardType.PICK_DRAW_4];

export enum UnoColorType {
  BLACK = 0,
  RED = 1,
  YELLOW = 2,
  GREEN = 3,
  BLUE = 4
}

export enum UnoDirection {
  CLOCKWISE,
  COUNTER_CLOCKWISE
}

export const canUseCard = (settings: UnoSettings, colorBefore: UnoColorType, cardBefore: UnoCardType, drawCounter: number | undefined, cardNow: UnoCardItem): boolean => {
  if (drawCounter) {
    if (settings.stacking === UnoSettingStacking.OFF) return false;
    if (cardBefore === cardNow.type || cardNow.type === UnoCardType.PICK_DRAW_4) return true;
    if (settings.stacking === UnoSettingStacking.ALL) return colorBefore === cardNow.color && cardNow.type === UnoCardType.DRAW_2;
    return false;
  }
  return colorBefore === cardNow.color || cardBefore === cardNow.type || cardNow.color === UnoColorType.BLACK;
};

export interface UnoInitPayload {
  direction: UnoDirection,
  order: string[],
  topCard: UnoCardItem,
  cards: UnoCardItem[],
}

export interface UnoSettings {
  cards: number;
  stacking: UnoSettingStacking;
  duplicates: UnoSettingDuplicates;
}

export enum UnoSettingStacking {
  OFF,
  SEPARATE,
  ALL,
}

export enum UnoSettingDuplicates {
  OFF,
  ON,
}

export interface UnoEffectPayload {
  changeDirection?: UnoDirection;
  skipPlayer?: string;
  unoPlayer?: string;
  drawCounter?: number;
}
