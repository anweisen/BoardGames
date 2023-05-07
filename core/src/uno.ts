export interface UnoCardItem {
  type: UnoCardType;
  color: UnoColorType;
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
  REVERSE = 10,
  SKIP = 11,
  DRAW = 12,

  PICK = 100,
  DRAW_PICK = 101
}

export const UnoColoredTypes: UnoCardType[] = [UnoCardType.N_1, UnoCardType.N_2, UnoCardType.N_3, UnoCardType.N_4, UnoCardType.N_5, UnoCardType.N_6, UnoCardType.N_7, UnoCardType.N_8, UnoCardType.N_9, UnoCardType.REVERSE, UnoCardType.SKIP, UnoCardType.DRAW];
export const UnoSpecialTypes: UnoCardType[] = [UnoCardType.PICK, UnoCardType.DRAW_PICK];

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

export const canUseCard = (colorBefore: UnoColorType, cardBefore: UnoCardType, cardNow: UnoCardItem): boolean => {
  return colorBefore === cardNow.color || cardBefore === cardNow.type || cardNow.color === UnoColorType.BLACK;
};

export interface UnoInitPayload {
  direction: UnoDirection,
  order: string[],
  topCard: UnoCardItem,
  cards: UnoCardItem[],
}

export interface UnoEffectPayload {
  changeDirection?: UnoDirection;
  skipPlayer?: string;
  drawCounter?: number;
}
