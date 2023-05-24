import * as ws from "ws";
import {GameType} from "@board-games/core";
import {Game} from "./logic/game";

export type LobbyId = string;

export enum LobbyState {
  LOBBY,
  INGAME,
}

export interface Lobby {
  id: LobbyId,
  birth: number,
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
  NONE,
  ADMIN,
}

export const randomFrom = (chars: string, length: number) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
export const randomLobbyId = (): LobbyId => randomFrom("abcdefghijklmnopqrstzvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 5)
export const randomPlayerId = (): PlayerId => randomFrom("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 5);

export const pickRandom = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
}
export const shuffle = (a: any[]) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}