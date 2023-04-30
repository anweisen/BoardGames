import {GameType, Lobby, LobbyId, LobbyState, Participant, ParticipantRole, PlayerId, randomLobbyId, randomPlayerId} from "./models";
import * as ws from "ws";
import {LobbyItem} from "core";

const lobbies: Map<LobbyId, Lobby> = new Map<LobbyId, Lobby>();

export const getLobbyItems = () => {
  const arr: LobbyItem[] = [];
  lobbies.forEach(value => arr.push({
    name: value.name,
    id: value.id,
    players: Object.keys(value.participants).length
  }));
  return arr;
};

export const findLobby = (id: LobbyId): Lobby | undefined => lobbies.get(id);

export const validateName = (name: string, lobby: Lobby): boolean => name.length >= 3 && name.length <= 15 && !findParticipantByName(lobby, name);
const findParticipantByName = (lobby: Lobby, name: string): Participant | undefined => {
  for (let id in lobby.participants) {
    const participant = lobby.participants[id];
    if (participant.name === name) return participant;
  }
  return undefined;
};

export const createLobby = (type: GameType, lobbyName: string, playerName: string, password: string | undefined, socket: ws): Lobby => {
  const playerId: PlayerId = randomPlayerId();
  const participant: Participant = {id: playerId, name: playerName, role: ParticipantRole.ADMIN, socket: socket};
  const participants: Record<PlayerId, Participant> = {};
  participants[playerId] = participant;

  // const lobbyId: LobbyId = randomLobbyId();
  const lobbyId: LobbyId = "test";
  const lobby: Lobby = {id: lobbyId, type: type, name: lobbyName || lobbyId, password: password, state: LobbyState.LOBBY, participants};
  lobbies.set(lobbyId, lobby);
  return lobby;
};
// @ts-ignore
createLobby(GameType.UNO, "Lobby-1", "Angelo", undefined, null);

// pre-checks required
export const joinLobby = (lobby: Lobby, playerName: string, socket: ws) => {
  const playerId: PlayerId = randomPlayerId();
  const participant: Participant = {id: playerId, name: playerName, role: ParticipantRole.NONE, socket: socket};
  lobby.participants[playerId] = participant;
};
