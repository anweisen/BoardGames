import * as ws from "ws";
import {Lobby, LobbyId, LobbyState, Participant, ParticipantRole, PlayerId, randomLobbyId, randomPlayerId} from "./models";
import {GameType, LobbyItem, SocketMessage, SocketMessageType} from "@board-games/core";
import {UnoGame} from "./logic/uno";
import {Game} from "./logic/game";

const lobbies: Map<LobbyId, Lobby> = new Map<LobbyId, Lobby>();

export const getLobbyItems = () => {
  const arr: LobbyItem[] = [];
  lobbies.forEach(value => arr.push({
    name: value.name,
    id: value.id,
    game: value.type,
    players: Object.keys(value.participants).length
  }));
  return arr;
};

export const findLobby = (id: LobbyId): Lobby | undefined => lobbies.get(id);

export const validatePlayerName = (name: string, lobby: Lobby): boolean => name.length >= 3 && name.length <= 15 && !findParticipantByName(lobby, name);
const findParticipantByName = (lobby: Lobby, name: string): Participant | undefined => {
  for (let id in lobby.participants) {
    const participant = lobby.participants[id];
    if (participant.name === name) return participant;
  }
  return undefined;
};

// pre-checks required
export const joinLobby = (lobby: Lobby, playerName: string, socket: ws) => {
  const playerId: PlayerId = randomPlayerId();
  lobby.participants[playerId] = {id: playerId, name: playerName, role: ParticipantRole.NONE, socket: socket};

  setupConnection(socket, lobby, playerId);
};

// pre-checks required
export const createLobby = (type: GameType, lobbyName: string, playerName: string, password: string | undefined, socket: ws) => {
  const playerId: PlayerId = randomPlayerId();
  const participants: Record<PlayerId, Participant> = {};
  participants[playerId] = {id: playerId, name: playerName, role: ParticipantRole.ADMIN, socket: socket};

  const lobbyId: LobbyId = randomLobbyId();
  // const lobbyId: LobbyId = "test"; // TODO
  const lobby: Lobby = {id: lobbyId, type: type, name: lobbyName || lobbyId, password: password, state: LobbyState.LOBBY, participants, game: initGameInstance(type, lobbyId)};
  lobbies.set(lobbyId, lobby);

  setupConnection(socket, lobby, playerId);
};

const initGameInstance = (type: GameType, lobbyId: LobbyId): Game => {
  const getLobby = () => <Lobby>lobbies.get(lobbyId);

  switch (type) {
    case GameType.UNO:
      return new UnoGame(getLobby);
  }
};

const setupConnection = (socket: ws, lobby: Lobby, playerId: PlayerId) => {
  socket.on("open", () => {
  });
  socket.on("message", (data, isBinary) => {
    const text = data.toString();
    console.log("-> " + text);

    try {
      const json: SocketMessage = JSON.parse(text);
      lobby.game.handleMessage(json.t, json.d, playerId);
    } catch (ex) {
      sendPacket(socket, SocketMessageType.INVALID_MESSAGE, {});
    }
  });
  socket.on("close", (code, reason) => {
  });
  socket.on("error", err => {
  });

  lobby.game.handleJoin(lobby.participants[playerId], socket);
  sendPacket(socket, SocketMessageType.INIT_LOBBY, {
    lobbyId: lobby.id,
    lobbyName: lobby.name,
    game: lobby.type,
    playerId: playerId,
    players: Object.values(lobby.participants).filter(participant => participant.id !== playerId).map(participant => ({id: participant.id, name: participant.name}))
  });
};

export const sendPacket = (socket: ws, type: SocketMessageType, data: object) => {
  const message: SocketMessage = {t: type, d: data};
  socket.send(JSON.stringify(message));
};
