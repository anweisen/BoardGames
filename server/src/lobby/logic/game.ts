import * as ws from "ws";

export interface Game {
  handleMessage(ws: ws): void;

  handleClose(ws: ws): void;

  handleJoin(ws: ws): void;
}
