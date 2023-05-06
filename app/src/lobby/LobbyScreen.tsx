import {InitLobbyPayload, PlayerInfo, SocketMessageType} from "@board-games/core";
import {MutableRefObject} from "react";
import {Connection} from "../App";
import "./LobbyScreen.scss";

export default ({payload, players, playerName, connection}: { payload: InitLobbyPayload, players: PlayerInfo[], playerName: string, connection: MutableRefObject<Connection> }) => {
  return (
    <div className={"LobbyScreen"}>
      <div className={"Panel"}>
        <div className={"Header"}>
          <div className={"Title"}>{payload.lobbyName}</div>
          <div className={"Button Start"} onClick={event => connection.current.sendPacket(SocketMessageType.REQUEST_START, {})}>Start Game</div>
        </div>
        <div className={"Content"}>
          <div className={"Players"}>
            <div key={payload.playerId} className={"Player"}>{playerName}</div>
            {players.map(player => (
              <div key={player.id} className={"Player"}>{player.name}</div>
            ))}
          </div>
          <div className={"Border"}/>
          <div className={"LobbySettings"}></div>
        </div>
      </div>
    </div>
  );
}