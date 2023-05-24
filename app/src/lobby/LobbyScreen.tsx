import {InitLobbyPayload, PlayerInfo, SocketMessageType} from "@board-games/core";
import {MutableRefObject} from "react";
import {MdLock} from "react-icons/md";
import {Connection} from "../App";
import "./LobbyScreen.scss";

export default ({payload, players, playerName, connection, ping}: {
  payload: InitLobbyPayload,
  players: PlayerInfo[],
  playerName: string,
  connection: MutableRefObject<Connection>,
  ping: number | undefined
}) => {
  return (
    <div className={"LobbyScreen"}>
      <div className={"Panel"}>
        <div className={"Header"}>
          <div className={"Title"}>{payload.lobbyName}<p className={"Ping"}>{ping || 0}ms</p></div>
          <div className={"Button Start" + (!payload.permissions || players.length === 0 ? " Locked" : "")}
               onClick={!payload.permissions ? undefined : _ => connection.current.sendPacket(SocketMessageType.REQUEST_START, {})}>
            {!payload.permissions && <MdLock/>}
            Start Game
          </div>
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