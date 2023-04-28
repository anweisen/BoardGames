export interface UnoCardItem {
  type: UnoCardType,
  color: UnoColorType
}

export enum UnoCardType {
  NUMBER,
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
