import * as ws from "ws";
import {SocketMessageType} from "@board-games/core";
import {GameBase} from "./game";
import {Lobby, Participant, PlayerId} from "../models";

export class UnoGame extends GameBase {
  constructor(getLobby: () => Lobby) {
    super(getLobby);
  }

  handleMessage(type: SocketMessageType, data: object, player: PlayerId): void {
    switch (type) {
      case SocketMessageType.REQUEST_START:
        this.broadcastPacket(SocketMessageType.START_GAME, {});
        break;
    }
  }

  handleClose(playerId: PlayerId): void {
  }

  handleJoin(participant: Participant, socket: ws): void {
    this.broadcastPacket(SocketMessageType.JOIN, {id: participant.id, name: participant.name}, participant.id);
  }
}
