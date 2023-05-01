import {InitLobbyPayload, PlayerInfo, SocketMessageType} from "@board-games/core";
import "./LobbyScreen.scss";
import {MutableRefObject} from "react";
import {Connection} from "../App";

export default ({payload, players, connection}: { payload: InitLobbyPayload, players: PlayerInfo[], connection: MutableRefObject<Connection> }) => {
  return (
    <div>
      {JSON.stringify(payload)}
      {JSON.stringify(players)}
      <br/>
      <p onClick={event => connection.current.sendPacket(SocketMessageType.REQUEST_START, {})}>START</p>
    </div>
  );
}