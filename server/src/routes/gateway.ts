import express from "express";
import * as ws from "ws";
import {findLobby, joinLobby, validateName} from "../lobby/controller";
import {Lobby, LobbyId} from "../lobby/models";

const router = express.Router();

router.ws("/create", (ws, req) => {
});

router.ws("/join/:id", (ws, req) => {
  const id: LobbyId = req.params.id;
  const lobby = findLobby(id);

  if (!lobby) {
    return ws.terminate();
  }
  if (lobby.password && lobby.password != req.query.pw) {
    return ws.terminate();
  }

  const name = req.query.name as string;
  if (!name || !validateName(name, lobby)) {
    return ws.terminate();
  }

  joinLobby(lobby, name, ws);
});

const setupConnection = (ws: ws, lobby: Lobby) => {
  ws.on("open", () => {

  });
  ws.on("message", (data, isBinary) => {

  });
  ws.on("close", (code, reason) => {

  });
  ws.on("error", err => {

  });
};

export default router;
