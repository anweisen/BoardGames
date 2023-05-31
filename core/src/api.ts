export enum SocketMessageType {
  // server to client
  ACK_HEARTBEAT = "ACK_HEARTBEAT",
  INVALID_MESSAGE = "INVALID_MESSAGE",
  REFUSE_LOBBY = "REFUSE_LOBBY",
  INIT_LOBBY = "INIT_LOBBY",
  JOIN = "JOIN",
  LEAVE = "LEAVE",
  PRE_START = "PRE_START",
  INIT_GAME = "INIT_GAME",

  // both ways
  UPDATE_SETTINGS = "UPDATE_SETTINGS",
  CHANGE_NAME = "CHANGE_NAME",
  UNO_USE = "UNO_USE",
  UNO_CONFIRM = "UNO_CONFIRM",
  UNO_CONFIRM_DRAW = "UNO_CONFIRM_DRAW",
  UNO_REFUSE = "UNO_REFUSE",
  UNO_EFFECT = "UNO_EFFECT",
  UNO_NEXT = "UNO_NEXT",
  UNO_DRAW = "UNO_DRAW",
  UNO_PICK = "UNO_PICK",
  UNO_WIN = "UNO_WIN",

  // client to server
  HEARTBEAT = "HEARTBEAT",
  REQUEST_START = "REQUEST_START",
}

export interface SocketMessage {
  t: SocketMessageType,
  d: object,
}

export enum RefuseReason {
  UNKNOWN_LOBBY,
  ALREADY_INGAME,
  INVALID_PASSWORD,
  INVALID_NAME,
  INVALID_LOBBY_NAME,
  INVALID_GAME,
}

export enum GameType {
  UNO = "uno"
}

export interface LobbyInfo {
  id: string,
  name: string,
  game: GameType,
  players: number,
}
export interface InitLobbyPayload {
  lobbyId: string;
  lobbyName: string;
  game: GameType;
  permissions: boolean;
  playerId: string;
  players: PlayerInfo[];
  settings: object;
}
export interface PlayerInfo {
  id: string;
  name: string;
}
export interface RefuseLobbyPayload {
  reason: RefuseReason
}
