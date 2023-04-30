import * as ws from "ws";
import {Game} from "./logic/game";

export enum GameType {
  UNO,
}

export type LobbyId = string;

export enum LobbyState {
  LOBBY,
  INGAME,
}

export interface Lobby {
  id: LobbyId,
  type: GameType,
  name: string,
  password: string | undefined,
  state: LobbyState,
  participants: Record<PlayerId, Participant>,
  game: Game,
}

export type PlayerId = string;

export interface Participant {
  id: PlayerId,
  name: string,
  role: ParticipantRole,
  socket: ws
}

export enum ParticipantRole {
  ADMIN,
  NONE,
}

const lobbyIdChars = "abcdefghijklmnopqrstzvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export const randomLobbyId = (): LobbyId => {
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += lobbyIdChars.charAt(Math.floor(Math.random() * lobbyIdChars.length));
  }
  return result;
};
export const randomPlayerId = (): PlayerId => {
  return Math.floor(Math.random() * 100000).toString(10);
};
