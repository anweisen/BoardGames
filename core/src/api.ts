export enum SocketMessageType {
  // server to client
  INVALID_MESSAGE = "INVALID_MESSAGE",
  REFUSE_LOBBY = "REFUSE_LOBBY",
  INIT_LOBBY = "INIT_LOBBY",
  JOIN = "JOIN",
  LEAVE = "LEAVE",
  PREPARE_START = "PREPARE_START",
  INIT_GAME = "INIT_GAME",

  // both ways
  // CHANGE_LOBBY_NAME = "CHANGE_LOBBY_NAME",
  // CHANGE_PLAYER_NAME = "CHANGE_PLAYER_NAME",
  UNO_USE = "UNO_USE",
  UNO_CONFIRM = "UNO_CONFIRM",
  UNO_REFUSE = "UNO_REFUSE",
  UNO_NEXT = "UNO_NEXT",
  UNO_DRAW = "UNO_DRAW",
  UNO_PICK = "UNO_PICK",

  // client to server
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
  UNO = "UNO"
}

export interface LobbyItem {
  id: string,
  name: string,
  game: GameType,
  players: number,
}
export interface InitLobbyPayload {
  lobbyId: string;
  lobbyName: string;
  game: GameType;
  playerId: string;
  players: PlayerInfo[];
}
export interface PlayerInfo {
  id: string;
  name: string;
}
export interface RefuseLobbyPayload {
  reason: RefuseReason
}