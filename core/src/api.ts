export interface LobbyItem {
  id: string,
  name: string,
  //game: GameType,
  players: number,
}

export enum SocketMessageType {
  // server
  INIT_LOBBY = "INIT_LOBBY"

  // client
}

export interface SocketMessage {
  t: SocketMessageType,
  d: object,
}
