export enum SocketMessageType {
  // server to client
  INVALID_MESSAGE = "INVALID_MESSAGE",
  REFUSE_LOBBY = "REFUSE_LOBBY",
  INIT_LOBBY = "INIT_LOBBY",
  START_GAME = "START_GAME",
  JOIN = "JOIN",
  LEAVE = "LEAVE",

  // both ways
  CHANGE_LOBBY_NAME = "CHANGE_LOBBY_NAME",
  CHANGE_PLAYER_NAME = "CHANGE_PLAYER_NAME",

  // client to server
  REQUEST_START = "REQUEST_START",
}

export interface SocketMessage {
  t: SocketMessageType,
  d: object,
}

export enum RefuseReason {
  INVALID_LOBBY,
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
