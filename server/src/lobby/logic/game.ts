import * as ws from "ws";
import {SocketMessageType} from "@board-games/core";
import {Lobby, Participant, PlayerId} from "../models";
import {sendPacket} from "../controller";

export interface Game {
  ingame: boolean;

  handleMessage(type: SocketMessageType, data: object, player: PlayerId): void;

  handleClose(playerId: PlayerId): void;

  handleJoin(participant: Participant, socket: ws): void;
}

export abstract class GameBase implements Game {

  public ingame = false;
  protected readonly getLobby: () => Lobby;

  protected constructor(getLobby: () => Lobby) {
    this.getLobby = getLobby;
  }

  broadcastPacket(type: SocketMessageType, data: object, skipPlayer?: PlayerId | undefined): void {
    for (let id in this.getLobby().participants) {
      if (id === skipPlayer) continue;
      sendPacket(this.retrieveSocket(id), type, data);
    }
  }

  retrieveSocket(playerId: PlayerId): ws {
    return this.getLobby().participants[playerId].socket;
  }

  abstract handleMessage(type: SocketMessageType, data: object, player: PlayerId): void

  abstract handleClose(playerId: PlayerId): void;

  abstract handleJoin(participant: Participant, socket: ws): void;
}
