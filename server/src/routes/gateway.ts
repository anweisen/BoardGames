import express from "express";
import {GameType, RefuseReason, SocketMessageType} from "@board-games/core";
import {createLobby, findLobby, joinLobby, sendPacket, validatePlayerName} from "../lobby/controller";
import {LobbyId} from "../lobby/models";

const router = express.Router();

router.ws("/create", (ws, req) => {
  // TODO checks

  const type = GameType.UNO;
  const lobbyName = "Lobby";
  const playerName = "name";
  const password = undefined;
  createLobby(type, lobbyName, playerName, password, ws);
});

router.ws("/join/:id", (socket, req) => {
  const id: LobbyId = req.params.id;
  const lobby = findLobby(id);

  if (!lobby) {
    sendPacket(socket, SocketMessageType.REFUSE_LOBBY, {reason: RefuseReason.INVALID_LOBBY});
    return socket.terminate();
  }
  if (lobby.password && lobby.password != req.query.pw) {
    sendPacket(socket, SocketMessageType.REFUSE_LOBBY, {reason: RefuseReason.INVALID_PASSWORD});
    return socket.terminate();
  }

  const name = req.query.name as string;
  if (!name || !validatePlayerName(name, lobby)) {
    sendPacket(socket, SocketMessageType.REFUSE_LOBBY, {reason: RefuseReason.INVALID_NAME});
    return socket.terminate();
  }

  joinLobby(lobby, name, socket);
});

export default router;
