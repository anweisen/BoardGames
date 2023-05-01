export interface UnoCardItem {
  type: UnoCardType;
  color: UnoColorType;
}
export enum UnoCardType {
  N_0 = 0,
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
  PICK = 13,
  DRAW_PICK = 14
}
export enum UnoColorType {
  BLACK = 0,
  GREEN = 1,
  YELLOW = 2,
  RED = 3,
  BLUE = 4
}
