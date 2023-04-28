export interface UnoCardItem {
  type: UnoCardType,
  color: UnoColorType
}

export enum UnoCardType {
  N_0,
  N_1,
  N_2,
  N_3,
  N_4,
  N_5,
  N_6,
  N_7,
  N_8,
  N_9,
  REVERSE,
  SKIP,
  DRAW,
  PICK,
  DRAW_PICK
}

export enum UnoColorType {
  BLACK, // choose color, draw 4
  GREEN,
  YELLOW,
  RED,
  BLUE
}
