import * as ws from "ws";
import {SocketMessageType} from "@board-games/core";
import {Lobby, Participant, ParticipantRole, PlayerId} from "../models";
import {sendPacket} from "../controller";

export interface Game {
  readonly ingame: boolean;
  readonly settings: object;

  handleMessage(type: SocketMessageType, data: object, player: PlayerId): void;

  handleClose(playerId: PlayerId): void;

  handleJoin(participant: Participant, socket: ws): void;
}

export abstract class GameBase implements Game {

  public ingame = false;
  public abstract settings: any;

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

  sendPacket(player: PlayerId, type: SocketMessageType, data: object): void {
    sendPacket(this.retrieveSocket(player), type, data);
  }

  retrieveSocket(playerId: PlayerId): ws {
    return this.getLobby().participants[playerId].socket;
  }

  hasPermissions(player: string): boolean {
    return this.getLobby().participants[player].role === ParticipantRole.ADMIN;
  }

  abstract handleMessage(type: SocketMessageType, data: object, player: PlayerId): void

  abstract handleClose(playerId: PlayerId): void;

  abstract handleJoin(participant: Participant): void;
}
