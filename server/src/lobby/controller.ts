import * as ws from "ws";
import {Lobby, LobbyId, LobbyState, Participant, ParticipantRole, PlayerId, randomLobbyId, randomPlayerId} from "./models";
import {GameType, LobbyItem, SocketMessage, SocketMessageType} from "@board-games/core";
import {UnoGame} from "./logic/uno";
import {Game} from "./logic/game";

const lobbies: Map<LobbyId, Lobby> = new Map<LobbyId, Lobby>();

export const getLobbyItems = () => {
  const arr: LobbyItem[] = [];
  for (let lobby of lobbies.values()) {
    if (lobby.game.ingame) continue;
    arr.push({
      name: lobby.name,
      id: lobby.id,
      game: lobby.type,
      players: Object.keys(lobby.participants).length
    });
  }
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
  lobby.participants[playerId] = {
    id: playerId,
    name: playerName,
    role: Object.keys(lobby.participants).length === 0 ? ParticipantRole.ADMIN : ParticipantRole.NONE,
    socket: socket
  };

  setupConnection(socket, lobby, playerId);
};

// pre-checks required
export const createLobby = (type: GameType, lobbyName: string, password: string | undefined): LobbyId => {
  const participants: Record<PlayerId, Participant> = {};

  const lobbyId: LobbyId = randomLobbyId();
  const lobby: Lobby = {
    id: lobbyId,
    birth: Date.now(),
    type: type,
    name: lobbyName || type + "-" + lobbyId,
    password: password,
    state: LobbyState.LOBBY,
    participants,
    game: initGameInstance(type, lobbyId)
  };
  lobbies.set(lobbyId, lobby);

  setTimeout(() => {
    if (!lobbies.has(lobbyId)) return;
    const current = lobbies.get(lobbyId) as Lobby;
    checkLobbyDeletion(current);
  }, 5000);

  return lobbyId;
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
    // resume
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
    const current = lobbies.get(lobby.id) as Lobby;
    delete current?.participants[playerId];
    lobby.game.handleClose(playerId);
    checkLobbyDeletion(current);
  });
  socket.on("error", err => {
  });

  lobby.game.handleJoin(lobby.participants[playerId], socket);
  sendPacket(socket, SocketMessageType.INIT_LOBBY, {
    lobbyId: lobby.id,
    lobbyName: lobby.name,
    permissions: lobby.participants[playerId].role === ParticipantRole.ADMIN,
    game: lobby.type,
    playerId: playerId,
    players: Object.values(lobby.participants).filter(participant => participant.id !== playerId).map(participant => ({id: participant.id, name: participant.name}))
  });
};

const checkLobbyDeletion = (lobby: Lobby) => {
  if (Object.entries(lobby.participants).length === 0) {
    lobbies.delete(lobby.id);
    console.log(`| removed lobby ${lobby.id}`);
  }
};

export const sendPacket = (socket: ws, type: SocketMessageType, data: object) => {
  const message: SocketMessage = {t: type, d: data};
  socket.send(JSON.stringify(message));
  console.log("<-", JSON.stringify(message));
};
